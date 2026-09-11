import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
    loadTokenRouterModels,
    MODELS_DEV_URL,
    OPENROUTER_MODELS_URL,
    readTokenRouterModelsCache,
    TOKENROUTER_MODELS_URL,
} from "../model-loader.js";
import type { TokenRouterProviderModel } from "../provider-config.js";

const tempDir = mkdtempSync(join(tmpdir(), "tokenrouter-models-"));
const cachePath = join(tempDir, "cache", "tokenrouter-models.json");

const bundledModels: TokenRouterProviderModel[] = [
    {
        id: "bundled/model",
        name: "Bundled Model",
        reasoning: false,
        input: ["text"],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextWindow: 8192,
        maxTokens: 8192,
    },
];

const catalogResponses: Record<string, unknown> = {
    [TOKENROUTER_MODELS_URL]: {
        data: [
            {
                id: "anthropic/claude-sonnet-5",
                supported_endpoint_types: ["anthropic-compatible"],
                tags: "Text, Image",
            },
        ],
    },
    [MODELS_DEV_URL]: {},
    [OPENROUTER_MODELS_URL]: { data: [] },
};

const seenAuthHeaders: (string | null)[] = [];
function fakeFetch(responses: Record<string, unknown>): typeof fetch {
    return (async (url: string | URL | Request, init?: RequestInit) => {
        const key = String(url);
        if (key === TOKENROUTER_MODELS_URL) {
            seenAuthHeaders.push(new Headers(init?.headers).get("authorization"));
        }
        const payload = responses[key];
        if (payload === undefined) throw new Error(`unexpected fetch of ${key}`);
        return new Response(JSON.stringify(payload), { status: 200 });
    }) as typeof fetch;
}

// A fetch that fails only for the given URLs, standing in for a metadata-service outage.
function fetchFailingOnly(failingUrls: string[], responses: Record<string, unknown> = catalogResponses): typeof fetch {
    return (async (url: string | URL | Request, init?: RequestInit) => {
        const key = String(url);
        if (failingUrls.includes(key)) throw new Error("metadata service down");
        return fakeFetch(responses)(url as never, init);
    }) as typeof fetch;
}

const failingFetch: typeof fetch = async () => {
    throw new Error("network down");
};

try {
    // A live fetch maps the catalog, reports the live source, and writes the cache.
    const live = await loadTokenRouterModels({
        apiKey: "sk-test",
        cachePath,
        bundledModels,
        fetchImpl: fakeFetch(catalogResponses),
    });
    assert.equal(live.source, "live");
    assert.equal(live.warning, undefined);
    assert.equal(live.models.length, 1);
    assert.equal(live.models[0]!.id, "anthropic/claude-sonnet-5");
    assert.deepEqual(live.models[0]!.input, ["text", "image"]);
    assert.deepEqual(seenAuthHeaders, ["Bearer sk-test"]);
    assert.deepEqual(await readTokenRouterModelsCache(cachePath), live.models);

    // A failed live fetch falls back to the cache written above.
    const cached = await loadTokenRouterModels({
        apiKey: "sk-test",
        cachePath,
        bundledModels,
        fetchImpl: failingFetch,
    });
    assert.equal(cached.source, "cache");
    assert.deepEqual(cached.models, live.models);
    assert.ok(cached.warning?.includes("cached"), `warning should mention the cache: ${cached.warning}`);

    // Without an API key the loader never fetches and uses the cache.
    const keyless = await loadTokenRouterModels({
        apiKey: undefined,
        cachePath,
        bundledModels,
        fetchImpl: (() => {
            throw new Error("must not fetch without an API key");
        }) as unknown as typeof fetch,
    });
    assert.equal(keyless.source, "cache");
    assert.ok(keyless.warning?.includes("API key"), `warning should mention the key: ${keyless.warning}`);

    // A transient live failure is retried once before falling back.
    let tokenRouterAttempts = 0;
    const flakyOnce: typeof fetch = (async (url: string | URL | Request, init?: RequestInit) => {
        if (String(url) === TOKENROUTER_MODELS_URL && tokenRouterAttempts++ === 0) {
            throw new Error("transient failure");
        }
        return fakeFetch(catalogResponses)(url as never, init);
    }) as typeof fetch;
    const retried = await loadTokenRouterModels({
        apiKey: "sk-test",
        cachePath,
        bundledModels,
        fetchImpl: flakyOnce,
        retryDelayMs: 0,
    });
    assert.equal(retried.source, "live");
    assert.equal(tokenRouterAttempts, 2);

    // An empty live catalog is an error, not a valid result.
    const emptyLive = await loadTokenRouterModels({
        apiKey: "sk-test",
        cachePath,
        bundledModels,
        fetchImpl: fakeFetch({ ...catalogResponses, [TOKENROUTER_MODELS_URL]: { data: [] } }),
    });
    assert.equal(emptyLive.source, "cache");
    assert.deepEqual(emptyLive.models, live.models);

    // --- metadata-service outages: TokenRouter's list stays authoritative ---

    // The enrichment payloads need a model both services know, so re-seed them here.
    const enrichedResponses: Record<string, unknown> = {
        [TOKENROUTER_MODELS_URL]: {
            data: [
                {
                    id: "anthropic/claude-sonnet-5",
                    supported_endpoint_types: ["anthropic-compatible"],
                    tags: "Text, Image",
                },
                {
                    id: "new/metadata-less-model",
                    supported_endpoint_types: ["openai"],
                    tags: "Text",
                },
            ],
        },
        [MODELS_DEV_URL]: {
            anthropic: {
                models: {
                    "anthropic/claude-sonnet-5": {
                        name: "Claude Sonnet 5",
                        reasoning: true,
                        limit: { context: 200000, output: 32000 },
                        cost: { input: 3, output: 15 },
                        modalities: { input: ["text", "image"] },
                    },
                },
            },
        },
        [OPENROUTER_MODELS_URL]: {
            data: [
                {
                    id: "anthropic/claude-sonnet-5",
                    name: "Claude Sonnet 5 OR",
                    supported_parameters: ["tools"],
                    architecture: { modality: ["text"] },
                    pricing: { prompt: "0.00001", completion: "0.00002" },
                    context_length: 1000,
                    top_provider: { max_completion_tokens: 500 },
                },
            ],
        },
    };

    // models.dev down: OpenRouter metadata still enriches, source stays live, warning says so.
    const modelsDevDown = await loadTokenRouterModels({
        apiKey: "sk-test",
        cachePath,
        bundledModels,
        fetchImpl: fetchFailingOnly([MODELS_DEV_URL], enrichedResponses),
    });
    assert.equal(modelsDevDown.source, "live");
    assert.equal(modelsDevDown.models.length, 2);
    const modelsDevDownSonnet = modelsDevDown.models.find((m) => m.id === "anthropic/claude-sonnet-5")!;
    assert.equal(modelsDevDownSonnet.name, "Claude Sonnet 5 OR");
    assert.equal(modelsDevDownSonnet.contextWindow, 1000);
    assert.ok(
        /models\.dev/.test(modelsDevDown.warning ?? ""),
        `warning should name models.dev: ${modelsDevDown.warning}`,
    );

    // OpenRouter down: models.dev metadata still enriches.
    const openRouterDown = await loadTokenRouterModels({
        apiKey: "sk-test",
        cachePath,
        bundledModels,
        fetchImpl: fetchFailingOnly([OPENROUTER_MODELS_URL], enrichedResponses),
    });
    assert.equal(openRouterDown.source, "live");
    const openRouterDownSonnet = openRouterDown.models.find((m) => m.id === "anthropic/claude-sonnet-5")!;
    assert.equal(openRouterDownSonnet.name, "Claude Sonnet 5");
    assert.equal(openRouterDownSonnet.contextWindow, 200000);
    assert.ok(
        /openrouter/i.test(openRouterDown.warning ?? ""),
        `warning should name openrouter: ${openRouterDown.warning}`,
    );

    // Both metadata services down: TokenRouter's list still wins; previously cached
    // metadata (from the openRouterDown run above) is preserved for matching models,
    // defaults cover the rest.
    const bothDown = await loadTokenRouterModels({
        apiKey: "sk-test",
        cachePath,
        bundledModels,
        fetchImpl: fetchFailingOnly([MODELS_DEV_URL, OPENROUTER_MODELS_URL], enrichedResponses),
    });
    assert.equal(bothDown.source, "live");
    assert.equal(bothDown.models.length, 2);
    const bothDownSonnet = bothDown.models.find((m) => m.id === "anthropic/claude-sonnet-5")!;
    assert.equal(bothDownSonnet.name, "Claude Sonnet 5");
    assert.equal(bothDownSonnet.contextWindow, 200000);
    const bothDownNew = bothDown.models.find((m) => m.id === "new/metadata-less-model")!;
    assert.equal(bothDownNew.contextWindow, 131072);
    assert.equal(bothDownNew.maxTokens, 4096);
    assert.equal(bothDownNew.name, "new/metadata-less-model");
    assert.ok(
        /models\.dev/.test(bothDown.warning ?? "") && /openrouter/i.test(bothDown.warning ?? ""),
        `warning should name both services: ${bothDown.warning}`,
    );
    // The degraded-but-live catalog still writes the cache for future starts.
    assert.deepEqual(await readTokenRouterModelsCache(cachePath), bothDown.models);

    // A cache with the wrong version is rejected, leaving the bundled snapshot.
    writeFileSync(cachePath, JSON.stringify({ version: 0, models: live.models }));
    const staleCache = await loadTokenRouterModels({
        apiKey: "sk-test",
        cachePath,
        bundledModels,
        fetchImpl: failingFetch,
    });
    assert.equal(staleCache.source, "bundled");
    assert.deepEqual(staleCache.models, bundledModels);
    assert.ok(staleCache.warning);

    // A corrupt cache entry is rejected too.
    writeFileSync(cachePath, JSON.stringify({ version: 1, models: [{ id: "x" }] }));
    await assert.rejects(readTokenRouterModelsCache(cachePath));
} finally {
    rmSync(tempDir, { recursive: true, force: true });
}
