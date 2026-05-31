import assert from "node:assert/strict";
import { mapTokenRouterCatalogToProviderModels } from "../model-catalog.js";
import {
    createTokenRouterProviderConfig,
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

const providerConfig = createTokenRouterProviderConfig(mappedModels);

assert.equal(providerConfig.name, "TokenRouter");
assert.equal(providerConfig.baseUrl, "https://api.tokenrouter.com/v1");
assert.equal(providerConfig.api, "openai-completions");
assert.equal(providerConfig.apiKey, "$TOKENROUTER_API_KEY");
assert.equal(providerConfig.authHeader, true);
assert.equal("oauth" in providerConfig, false);
assert.equal(providerConfig.models, mappedModels);
