/**
 * Runtime model discovery for the TokenRouter provider.
 *
 * Fetches TokenRouter's /v1/models plus the models.dev and OpenRouter catalogs,
 * maps them through mapTokenRouterCatalogToProviderModels, and caches the result
 * on disk. TokenRouter's list is authoritative: a metadata-service outage only
 * degrades enrichment (the other service wins, then cached metadata, then
 * defaults) instead of failing discovery. Falls back to the cache when
 * TokenRouter itself fails, and to the bundled snapshot when no valid cache
 * exists.
 */

import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import {
    mapTokenRouterCatalogToProviderModels,
    type ModelsDevPayload,
    type OpenRouterCatalogPayload,
    type TokenRouterCatalogPayload,
} from "./model-catalog.js";
import type { TokenRouterProviderModel } from "./provider-config.js";

export const TOKENROUTER_MODELS_URL = "https://api.tokenrouter.com/v1/models";
export const MODELS_DEV_URL = "https://models.dev/api.json";
export const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";

const MODEL_CACHE_VERSION = 1;
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_RETRY_DELAY_MS = 1_000;

export type TokenRouterModelSource = "live" | "cache" | "bundled";

export type LoadTokenRouterModelsOptions = {
    apiKey: string | undefined;
    cachePath: string;
    bundledModels: TokenRouterProviderModel[];
    fetchImpl?: typeof fetch;
    timeoutMs?: number;
    retryDelayMs?: number;
};

export type LoadTokenRouterModelsResult = {
    models: TokenRouterProviderModel[];
    source: TokenRouterModelSource;
    warning?: string;
};

// Metadata sources consulted independently of TokenRouter's own list.
const METADATA_SOURCES = [
    { url: MODELS_DEV_URL, label: "models.dev" },
    { url: OPENROUTER_MODELS_URL, label: "OpenRouter" },
] as const;

/**
 * Reuses the cached enrichment for models the fresh catalog also lists. Only the
 * metadata fields are carried over; membership comes from the live TokenRouter
 * list alone, so models that disappeared upstream stay gone.
 */
function mergeCachedMetadata(
    models: TokenRouterProviderModel[],
    cachedModels: readonly TokenRouterProviderModel[],
): TokenRouterProviderModel[] {
    const cachedById = new Map(cachedModels.map((model) => [model.id, model]));
    return models.map((model) => cachedById.get(model.id) ?? model);
}

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPositiveNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isFiniteNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

function parseCachedModel(value: unknown): TokenRouterProviderModel {
    if (!isRecord(value)) throw new Error("Expected a cached model to be an object");
    const { id, name, reasoning, input, cost, contextWindow, maxTokens } = value;
    if (typeof id !== "string" || id.length === 0) throw new Error("Expected id to be a non-empty string");
    if (typeof name !== "string" || name.length === 0) throw new Error(`Expected ${id} name to be a non-empty string`);
    if (typeof reasoning !== "boolean") throw new Error(`Expected ${id} reasoning to be a boolean`);
    if (!Array.isArray(input) || !input.every((modality) => modality === "text" || modality === "image")) {
        throw new Error(`Expected ${id} input to list text/image modalities`);
    }
    if (
        !isRecord(cost) ||
        !isFiniteNumber(cost.input) ||
        !isFiniteNumber(cost.output) ||
        !isFiniteNumber(cost.cacheRead) ||
        !isFiniteNumber(cost.cacheWrite)
    ) {
        throw new Error(`Expected ${id} cost to hold four numbers`);
    }
    if (!isPositiveNumber(contextWindow)) throw new Error(`Expected ${id} contextWindow to be a positive number`);
    if (!isPositiveNumber(maxTokens)) throw new Error(`Expected ${id} maxTokens to be a positive number`);

    return {
        id,
        name,
        reasoning,
        input: input as ("text" | "image")[],
        cost: { input: cost.input, output: cost.output, cacheRead: cost.cacheRead, cacheWrite: cost.cacheWrite },
        contextWindow,
        maxTokens,
    };
}

export async function readTokenRouterModelsCache(cachePath: string): Promise<TokenRouterProviderModel[]> {
    const parsed: unknown = JSON.parse(await readFile(cachePath, "utf8"));
    if (!isRecord(parsed) || parsed.version !== MODEL_CACHE_VERSION) {
        throw new Error(`Expected model cache version ${MODEL_CACHE_VERSION}`);
    }
    if (!Array.isArray(parsed.models) || parsed.models.length === 0) {
        throw new Error("Expected cached models to be a non-empty array");
    }
    return parsed.models.map(parseCachedModel);
}

async function writeTokenRouterModelsCache(cachePath: string, models: TokenRouterProviderModel[]): Promise<void> {
    await mkdir(dirname(cachePath), { recursive: true });
    const temporaryPath = `${cachePath}.${process.pid}.tmp`;
    try {
        await writeFile(temporaryPath, `${JSON.stringify({ version: MODEL_CACHE_VERSION, models }, null, 2)}\n`, {
            encoding: "utf8",
            mode: 0o600,
        });
        await rename(temporaryPath, cachePath);
    } finally {
        await rm(temporaryPath, { force: true }).catch(() => {
            // Best-effort cleanup must not hide the original cache write error.
        });
    }
}

async function fetchJson(
    fetchImpl: typeof fetch,
    url: string,
    timeoutMs: number,
    apiKey?: string,
): Promise<unknown> {
    const response = await fetchImpl(url, {
        headers: {
            accept: "application/json",
            ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
        },
        signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) throw new Error(`${url} answered ${response.status} ${response.statusText}`);
    return await response.json();
}

async function fetchLiveModels(
    apiKey: string,
    fetchImpl: typeof fetch,
    timeoutMs: number,
    cachedModels: readonly TokenRouterProviderModel[] | undefined,
): Promise<{ models: TokenRouterProviderModel[]; degradedMetadata: string[] }> {
    // TokenRouter's own list is required; the metadata services settle independently
    // so one outage degrades enrichment instead of failing discovery.
    const tokenRouterPromise = fetchJson(fetchImpl, TOKENROUTER_MODELS_URL, timeoutMs, apiKey);
    const metadataPromise = Promise.allSettled(
        METADATA_SOURCES.map((source) => fetchJson(fetchImpl, source.url, timeoutMs)),
    );
    const [tokenRouterPayload, metadataResults] = await Promise.all([tokenRouterPromise, metadataPromise]);

    const degradedMetadata: string[] = [];
    const payloads = metadataResults.map((result, index) => {
        if (result.status === "fulfilled") return result.value as unknown;
        degradedMetadata.push(METADATA_SOURCES[index]!.label);
        return index === 0 ? {} : { data: [] };
    });

    let models = mapTokenRouterCatalogToProviderModels(
        tokenRouterPayload as TokenRouterCatalogPayload,
        payloads[0] as ModelsDevPayload,
        payloads[1] as OpenRouterCatalogPayload,
    );
    if (degradedMetadata.length === METADATA_SOURCES.length && cachedModels) {
        models = mergeCachedMetadata(models, cachedModels);
    }
    if (models.length === 0) throw new Error("TokenRouter returned an empty model catalog");
    return { models, degradedMetadata };
}

export async function loadTokenRouterModels(
    options: LoadTokenRouterModelsOptions,
): Promise<LoadTokenRouterModelsResult> {
    const fetchImpl = options.fetchImpl ?? fetch;
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    let liveFailure: string;
    if (!options.apiKey) {
        liveFailure = "No TokenRouter API key is configured (run /login tokenrouter)";
    } else {
        // The last cached catalog feeds the both-metadata-down merge below.
        const cachedModels = await readTokenRouterModelsCache(options.cachePath).catch(() => undefined);
        try {
            // TokenRouter answers 400 intermittently per connection (~1 in 5 measured
            // on 2026-08-17), so one delayed retry covers most transient failures.
            const live = await fetchLiveModels(options.apiKey, fetchImpl, timeoutMs, cachedModels).catch(async () => {
                await new Promise((resolve) => setTimeout(resolve, options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS));
                return fetchLiveModels(options.apiKey!, fetchImpl, timeoutMs, cachedModels);
            });
            const warning = live.degradedMetadata.length
                ? `Could not reach ${live.degradedMetadata.join(" and ")}; model metadata may be incomplete or reused from the last cache.`
                : undefined;
            try {
                await writeTokenRouterModelsCache(options.cachePath, live.models);
                return { models: live.models, source: "live", warning };
            } catch (error) {
                return {
                    models: live.models,
                    source: "live",
                    warning:
                        (warning ? `${warning} ` : "") +
                        `Loaded the live TokenRouter model catalog but could not write ${options.cachePath}: ${errorMessage(error)}`,
                };
            }
        } catch (error) {
            liveFailure = `Could not refresh the TokenRouter model catalog (${errorMessage(error)})`;
        }
    }

    try {
        const models = await readTokenRouterModelsCache(options.cachePath);
        return {
            models,
            source: "cache",
            warning: `${liveFailure}. Using the cached catalog from ${options.cachePath}.`,
        };
    } catch {
        return {
            models: options.bundledModels,
            source: "bundled",
            warning: `${liveFailure}. Using the bundled model snapshot.`,
        };
    }
}
