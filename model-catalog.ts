import type { TokenRouterProviderModel } from "./provider-config.js";

type TokenRouterCatalogModel = {
    id: string;
    supported_endpoint_types?: string[];
    tags?: string;
};

export type TokenRouterCatalogPayload = {
    data?: TokenRouterCatalogModel[];
};

type ModelsDevModel = {
    name?: string;
    reasoning?: boolean;
    limit?: {
        context?: number;
        output?: number;
    };
    cost?: {
        input?: number;
        output?: number;
        cache_read?: number;
        cache_write?: number;
    };
    modalities?: {
        input?: string[];
    };
};

type ModelsDevProvider = {
    models?: Record<string, ModelsDevModel>;
};

export type ModelsDevPayload = Record<string, ModelsDevProvider>;

type OpenRouterCatalogModel = {
    id: string;
    name?: string;
    supported_parameters?: string[];
    architecture?: {
        modality?: string[];
    };
    pricing?: {
        prompt?: string;
        completion?: string;
        input_cache_read?: string;
        input_cache_write?: string;
    };
    context_length?: number;
    top_provider?: {
        max_completion_tokens?: number;
    };
};

export type OpenRouterCatalogPayload = {
    data?: OpenRouterCatalogModel[];
};

// pi requests `contextWindow − prompt estimate − 4096` output tokens, floored at 1, so an
// under-declared window makes every reply a 1-token "length" truncation. 131072 is the
// safer wrong guess: an over-declared window degrades into upstream context errors that
// pi recovers from by compacting.
const DEFAULT_CONTEXT_WINDOW = 131072;
const DEFAULT_MAX_TOKENS = 4096;

// TokenRouter lists variant ids like qwen/qwen3.8-max-free or
// deepseek/deepseek-v4-pro-0813-free that models.dev and OpenRouter have never heard of.
const VARIANT_SUFFIX = /-(free|\d{4}|\d{8})$/;

type VariantCandidate = {
    id: string;
    stripped: string[];
};

function baseVariantCandidates(id: string): VariantCandidate[] {
    const candidates: VariantCandidate[] = [];
    let current = id;
    const stripped: string[] = [];
    for (let match = VARIANT_SUFFIX.exec(current); match; match = VARIANT_SUFFIX.exec(current)) {
        stripped.unshift(match[1]!);
        current = current.slice(0, -match[0].length);
        candidates.push({ id: current, stripped: [...stripped] });
    }
    return candidates;
}

function parseTags(tags: string | undefined): Set<string> {
    return new Set(
        (tags ?? "")
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
    );
}

function supportsTextEndpoints(model: TokenRouterCatalogModel): boolean {
    const endpoints = new Set(model.supported_endpoint_types ?? []);
    return (
        endpoints.has("openai") ||
        // Newer GPT generations (gpt-5.4 onward, gpt-5.5, gpt-5.6) advertise only this
        // endpoint; probed on /v1/responses and /v1/chat/completions 2026-08-27.
        endpoints.has("openai-response") ||
        endpoints.has("anthropic-compatible") ||
        endpoints.has("anthropic")
    );
}

function isTextCapableTagSet(tags: Set<string>): boolean {
    if (tags.size === 0) return true;
    return tags.has("Text");
}

function buildInputFromTags(tags: Set<string>): ("text" | "image")[] {
    return tags.has("Image") && tags.has("Text") ? ["text", "image"] : ["text"];
}

function parseOpenRouterPrice(price?: string): number {
    const parsed = Number.parseFloat(price ?? "0");
    return Number.isFinite(parsed) ? parsed * 1_000_000 : 0;
}

// models.dev reports zero limits for embedding models; a non-positive limit would make
// the cached catalog fail its own validation, so treat it as absent.
function firstPositive(...values: (number | undefined)[]): number | undefined {
    return values.find((value) => typeof value === "number" && Number.isFinite(value) && value > 0);
}

function buildModelsDevLookup(payload: ModelsDevPayload): Map<string, ModelsDevModel> {
    const lookup = new Map<string, ModelsDevModel>();
    for (const provider of Object.values(payload)) {
        if (!provider?.models) continue;
        for (const [id, model] of Object.entries(provider.models)) {
            lookup.set(id, model);
        }
    }
    return lookup;
}

function buildOpenRouterLookup(payload: OpenRouterCatalogPayload): Map<string, OpenRouterCatalogModel> {
    return new Map((payload.data ?? []).map((model) => [model.id, model]));
}

export function mapTokenRouterCatalogToProviderModels(
    tokenRouterPayload: TokenRouterCatalogPayload,
    modelsDevPayload: ModelsDevPayload,
    openRouterPayload: OpenRouterCatalogPayload,
): TokenRouterProviderModel[] {
    const modelsDevLookup = buildModelsDevLookup(modelsDevPayload);
    const openRouterLookup = buildOpenRouterLookup(openRouterPayload);

    return (tokenRouterPayload.data ?? [])
        .filter((model) => supportsTextEndpoints(model) && isTextCapableTagSet(parseTags(model.tags)))
        .map((model) => {
            const tags = parseTags(model.tags);
            let modelsDevModel = modelsDevLookup.get(model.id);
            let openRouterModel = openRouterLookup.get(model.id);
            let strippedSuffix: string[] | undefined;
            if (!modelsDevModel && !openRouterModel) {
                for (const candidate of baseVariantCandidates(model.id)) {
                    modelsDevModel = modelsDevLookup.get(candidate.id);
                    openRouterModel = openRouterLookup.get(candidate.id);
                    if (modelsDevModel || openRouterModel) {
                        strippedSuffix = candidate.stripped;
                        break;
                    }
                }
            }
            const baseName = modelsDevModel?.name ?? openRouterModel?.name;
            const isFree = model.id.endsWith("-free");

            return {
                id: model.id,
                name: baseName
                    ? strippedSuffix
                        ? `${baseName} (${strippedSuffix.join(", ")})`
                        : baseName
                    : model.id,
                reasoning:
                    modelsDevModel?.reasoning === true ||
                    (openRouterModel?.supported_parameters?.includes("reasoning") ?? false),
                input:
                    modelsDevModel?.modalities?.input?.includes("image")
                        ? ["text", "image"]
                        : openRouterModel?.architecture?.modality?.includes("image")
                            ? ["text", "image"]
                            : buildInputFromTags(tags),
                cost: isFree
                    ? { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }
                    : {
                        input: modelsDevModel?.cost?.input ?? parseOpenRouterPrice(openRouterModel?.pricing?.prompt),
                        output:
                            modelsDevModel?.cost?.output ??
                            parseOpenRouterPrice(openRouterModel?.pricing?.completion),
                        cacheRead:
                            modelsDevModel?.cost?.cache_read ??
                            parseOpenRouterPrice(openRouterModel?.pricing?.input_cache_read),
                        cacheWrite:
                            modelsDevModel?.cost?.cache_write ??
                            parseOpenRouterPrice(openRouterModel?.pricing?.input_cache_write),
                    },
                contextWindow:
                    firstPositive(modelsDevModel?.limit?.context, openRouterModel?.context_length) ??
                    DEFAULT_CONTEXT_WINDOW,
                maxTokens:
                    firstPositive(modelsDevModel?.limit?.output, openRouterModel?.top_provider?.max_completion_tokens) ??
                    DEFAULT_MAX_TOKENS,
            };
        });
}
