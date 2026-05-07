import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const TOKENROUTER_MODELS_URL = "https://api.tokenrouter.com/v1/models";
const MODELS_DEV_URL = "https://models.dev/api.json";
const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";
const TOKENROUTER_API_KEY = process.env.TOKENROUTER_API_KEY;

if (!TOKENROUTER_API_KEY) {
    throw new Error("TOKENROUTER_API_KEY is required to generate models.generated.ts");
}

function fetchJson(url, headers = []) {
    const args = ["-sS", ...headers.flatMap(([name, value]) => ["-H", `${name}: ${value}`]), url];
    return JSON.parse(execFileSync("curl", args, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }));
}

function parseTags(tags) {
    return new Set(
        String(tags || "")
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
    );
}

function supportsTextEndpoints(model) {
    const endpoints = new Set(model.supported_endpoint_types || []);
    return endpoints.has("openai") || endpoints.has("anthropic-compatible") || endpoints.has("anthropic");
}

function isTextCapableTagSet(tags) {
    if (tags.size === 0) return true;
    return tags.has("Text");
}

function buildInputFromTags(tags) {
    return tags.has("Image") && tags.has("Text") ? ["text", "image"] : ["text"];
}

function parseOpenRouterPrice(price) {
    const parsed = Number.parseFloat(price || "0");
    return Number.isFinite(parsed) ? parsed * 1_000_000 : 0;
}

function buildModelsDevLookup(payload) {
    const lookup = new Map();
    for (const provider of Object.values(payload)) {
        if (!provider || typeof provider !== "object" || !provider.models) continue;
        for (const [id, model] of Object.entries(provider.models)) {
            lookup.set(id, model);
        }
    }
    return lookup;
}

function buildOpenRouterLookup(payload) {
    return new Map((payload.data || []).map((model) => [model.id, model]));
}

const tokenRouterPayload = fetchJson(TOKENROUTER_MODELS_URL, [["Authorization", `Bearer ${TOKENROUTER_API_KEY}`]]);
const modelsDevPayload = fetchJson(MODELS_DEV_URL);
const openRouterPayload = fetchJson(OPENROUTER_MODELS_URL);

const modelsDevLookup = buildModelsDevLookup(modelsDevPayload);
const openRouterLookup = buildOpenRouterLookup(openRouterPayload);

const models = (tokenRouterPayload.data || [])
    .filter((model) => supportsTextEndpoints(model) && isTextCapableTagSet(parseTags(model.tags)))
    .map((model) => {
        const tags = parseTags(model.tags);
        const modelsDevModel = modelsDevLookup.get(model.id);
        const openRouterModel = openRouterLookup.get(model.id);

        return {
            id: model.id,
            name: modelsDevModel?.name || openRouterModel?.name || model.id,
            reasoning:
                modelsDevModel?.reasoning === true ||
                Boolean(openRouterModel?.supported_parameters?.includes("reasoning")),
            input: modelsDevModel?.modalities?.input?.includes("image")
                ? ["text", "image"]
                : openRouterModel?.architecture?.modality?.includes("image")
                    ? ["text", "image"]
                    : buildInputFromTags(tags),
            cost: {
                input: modelsDevModel?.cost?.input ?? parseOpenRouterPrice(openRouterModel?.pricing?.prompt),
                output: modelsDevModel?.cost?.output ?? parseOpenRouterPrice(openRouterModel?.pricing?.completion),
                cacheRead:
                    modelsDevModel?.cost?.cache_read ?? parseOpenRouterPrice(openRouterModel?.pricing?.input_cache_read),
                cacheWrite:
                    modelsDevModel?.cost?.cache_write ??
                    parseOpenRouterPrice(openRouterModel?.pricing?.input_cache_write),
            },
            contextWindow: modelsDevModel?.limit?.context ?? openRouterModel?.context_length ?? 4096,
            maxTokens: modelsDevModel?.limit?.output ?? openRouterModel?.top_provider?.max_completion_tokens ?? 4096,
        };
    });

const file = [
    'import type { TokenRouterProviderModel } from "./provider-config.js";',
    "",
    "// Derived from TokenRouter /v1/models and enriched with models.dev, then OpenRouter metadata.",
    `// Generated on ${new Date().toISOString()}.`,
    `export const TOKENROUTER_MODELS: TokenRouterProviderModel[] = ${JSON.stringify(models, null, 4)};`,
    "",
].join("\n");

writeFileSync("models.generated.ts", file, "utf8");
