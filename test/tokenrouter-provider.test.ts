import assert from "node:assert/strict";
import { mapTokenRouterCatalogToProviderModels } from "../model-catalog.js";
import {
    createTokenRouterProviderConfig,
    selectApi,
    type TokenRouterProviderModel,
} from "../provider-config.js";

function assertApprox(actual: number, expected: number): void {
    assert.ok(Math.abs(actual - expected) < 1e-9, `expected ${actual} to equal ${expected}`);
}

const mappedModels = mapTokenRouterCatalogToProviderModels(
    {
        data: [
            {
                id: "anthropic/claude-sonnet-4",
                supported_endpoint_types: ["anthropic-compatible"],
                tags: "Text, Image",
            },
            {
                id: "fallback/openrouter-model",
                supported_endpoint_types: ["openai"],
                tags: "Text",
            },
            {
                id: "defaults/tokenrouter-only",
                supported_endpoint_types: ["openai"],
                tags: "",
            },
            {
                id: "image/only-model",
                supported_endpoint_types: ["openai"],
                tags: "Image",
            },
        ],
    },
    {
        anthropic: {
            models: {
                "anthropic/claude-sonnet-4": {
                    name: "Claude Sonnet 4 from models.dev",
                    reasoning: true,
                    limit: { context: 200000, output: 32000 },
                    cost: {
                        input: 3,
                        output: 15,
                        cache_read: 0.3,
                        cache_write: 3.75,
                    },
                    modalities: { input: ["text", "image"] },
                },
            },
        },
    },
    {
        data: [
            {
                id: "anthropic/claude-sonnet-4",
                name: "Claude Sonnet 4 from OpenRouter",
                supported_parameters: ["tools"],
                architecture: { modality: ["text"] },
                pricing: {
                    prompt: "0.000010",
                    completion: "0.000020",
                },
                context_length: 1,
                top_provider: { max_completion_tokens: 2 },
            },
            {
                id: "fallback/openrouter-model",
                name: "Fallback OpenRouter Model",
                supported_parameters: ["tools", "reasoning"],
                architecture: { modality: ["text", "image"] },
                pricing: {
                    prompt: "0.0000004",
                    completion: "0.0000016",
                    input_cache_read: "0.0000001",
                    input_cache_write: "0.0000002",
                },
                context_length: 128000,
                top_provider: { max_completion_tokens: 16000 },
            },
        ],
    },
);

assert.equal(mappedModels.length, 3);
assert.deepEqual(mappedModels[0], {
    id: "anthropic/claude-sonnet-4",
    name: "Claude Sonnet 4 from models.dev",
    reasoning: true,
    input: ["text", "image"],
    cost: {
        input: 3,
        output: 15,
        cacheRead: 0.3,
        cacheWrite: 3.75,
    },
    contextWindow: 200000,
    maxTokens: 32000,
} satisfies TokenRouterProviderModel);
assert.deepEqual(mappedModels[1], {
    id: "fallback/openrouter-model",
    name: "Fallback OpenRouter Model",
    reasoning: true,
    input: ["text", "image"],
    cost: mappedModels[1]?.cost,
    contextWindow: 128000,
    maxTokens: 16000,
} satisfies TokenRouterProviderModel);
assertApprox(mappedModels[1]?.cost.input ?? 0, 0.4);
assertApprox(mappedModels[1]?.cost.output ?? 0, 1.6);
assertApprox(mappedModels[1]?.cost.cacheRead ?? 0, 0.1);
assertApprox(mappedModels[1]?.cost.cacheWrite ?? 0, 0.2);
assert.deepEqual(mappedModels[2], {
    id: "defaults/tokenrouter-only",
    name: "defaults/tokenrouter-only",
    reasoning: false,
    input: ["text"],
    cost: {
        input: 0,
        output: 0,
        cacheRead: 0,
        cacheWrite: 0,
    },
    contextWindow: 4096,
    maxTokens: 4096,
} satisfies TokenRouterProviderModel);

// --- selectApi ---

assert.equal(selectApi("openai/gpt-5.4"), "openai-responses");
assert.equal(selectApi("openai/gpt-5.4-pro"), "openai-responses");
assert.equal(selectApi("openai/gpt-5-mini"), "openai-responses");
assert.equal(selectApi("openai/gpt-4o-mini"), "openai-responses");
assert.equal(selectApi("anthropic/claude-sonnet-4"), "anthropic-messages");
assert.equal(selectApi("anthropic/claude-haiku-4.5"), "anthropic-messages");
assert.equal(selectApi("claude-haiku-4-5"), "anthropic-messages");
assert.equal(selectApi("google/gemini-3.5-flash"), "openai-completions");
assert.equal(selectApi("deepseek/deepseek-v4-pro"), "openai-completions");
assert.equal(selectApi("qwen/qwen3.5-9b"), "openai-completions");

// --- provider config ---

const providerConfig = createTokenRouterProviderConfig(mappedModels);

assert.equal(providerConfig.name, "TokenRouter");
assert.equal(providerConfig.baseUrl, "https://api.tokenrouter.com/v1");
assert.equal(providerConfig.api, "openai-completions");
assert.equal(providerConfig.apiKey, "$TOKENROUTER_API_KEY");
assert.equal(providerConfig.authHeader, true);
assert.equal("oauth" in providerConfig, false);
assert.equal(providerConfig.models.length, 3);
assert.equal(providerConfig.models[0]!.api, "anthropic-messages");
assert.equal(providerConfig.models[1]!.api, "openai-completions");
assert.equal(providerConfig.models[2]!.api, "openai-completions");

// TokenRouter upstreams reject the "developer" role, so every model must send "system".
for (const model of providerConfig.models) {
    assert.equal(
        "compat" in model ? model.compat.supportsDeveloperRole : undefined,
        false,
        `${model.id} must set supportsDeveloperRole: false`,
    );
}

const grokProviderConfig = createTokenRouterProviderConfig([
    {
        id: "x-ai/grok-4.6",
        name: "Grok 4.6",
        reasoning: true,
        input: ["text", "image"],
        cost: {
            input: 2,
            output: 6,
            cacheRead: 0.5,
            cacheWrite: 0,
        },
        contextWindow: 500000,
        maxTokens: 500000,
    },
]);

assert.deepEqual(
    "compat" in grokProviderConfig.models[0]! ? grokProviderConfig.models[0]!.compat : undefined,
    { supportsDeveloperRole: false },
);
assert.equal("thinkingLevelMap" in grokProviderConfig.models[0]!, false);

const kimiProviderConfig = createTokenRouterProviderConfig([
    {
        id: "moonshotai/kimi-k3",
        name: "Kimi K3",
        reasoning: true,
        input: ["text", "image"],
        cost: {
            input: 3,
            output: 15,
            cacheRead: 0.3,
            cacheWrite: 0,
        },
        contextWindow: 1048576,
        maxTokens: 131072,
    },
]);

assert.deepEqual(
    "compat" in kimiProviderConfig.models[0]! ? kimiProviderConfig.models[0]!.compat : undefined,
    {
        supportsDeveloperRole: false,
        reasoningEffortMap: {
            minimal: "max",
            low: "max",
            medium: "max",
            high: "max",
            xhigh: "max",
            max: "max",
        },
    },
);
assert.deepEqual(
    "thinkingLevelMap" in kimiProviderConfig.models[0]!
        ? kimiProviderConfig.models[0]!.thinkingLevelMap
        : undefined,
    {
        minimal: "max",
        low: "max",
        medium: "max",
        high: "max",
        xhigh: "max",
        max: "max",
    },
);
