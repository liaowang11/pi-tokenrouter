import assert from "node:assert/strict";
import { mapTokenRouterCatalogToProviderModels } from "../model-catalog.js";
import {
    createTokenRouterProviderConfig,
    ensureToolSchemaRequired,
    resolveMaxTokens,
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
            {
                id: "google/gemini-embedding-2",
                supported_endpoint_types: ["openai"],
                tags: "",
            },
            {
                id: "deepseek/deepseek-v9-0813-free",
                supported_endpoint_types: ["openai"],
                tags: "Text",
            },
            {
                id: "fallback/openrouter-model-free",
                supported_endpoint_types: ["openai"],
                tags: "Text",
            },
            {
                id: "openai/gpt-5.6-sol",
                supported_endpoint_types: ["openai-response"],
                tags: "Text",
            },
        ],
    },
    {
        google: {
            models: {
                // models.dev reports zero limits for embedding models; the mapper must
                // fall back to defaults or the cached catalog fails its own validation.
                "google/gemini-embedding-2": {
                    name: "Gemini Embedding 2",
                    limit: { context: 0, output: 0 },
                },
            },
        },
        deepseek: {
            models: {
                "deepseek/deepseek-v9": {
                    name: "DeepSeek V9",
                    reasoning: true,
                    limit: { context: 131072, output: 65536 },
                    cost: { input: 0.28, output: 0.42 },
                    modalities: { input: ["text"] },
                },
            },
        },
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

// Newer GPT generations advertise only the OpenAI Responses endpoint; they must still map.
assert.deepEqual(mappedModels[6], {
    id: "openai/gpt-5.6-sol",
    name: "openai/gpt-5.6-sol",
    reasoning: false,
    input: ["text"],
    cost: {
        input: 0,
        output: 0,
        cacheRead: 0,
        cacheWrite: 0,
    },
    contextWindow: 131072,
    maxTokens: 4096,
} satisfies TokenRouterProviderModel);

assert.equal(mappedModels.length, 7);
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
    contextWindow: 131072,
    maxTokens: 4096,
} satisfies TokenRouterProviderModel);
assert.deepEqual(mappedModels[3], {
    id: "google/gemini-embedding-2",
    name: "Gemini Embedding 2",
    reasoning: false,
    input: ["text"],
    cost: {
        input: 0,
        output: 0,
        cacheRead: 0,
        cacheWrite: 0,
    },
    contextWindow: 131072,
    maxTokens: 4096,
} satisfies TokenRouterProviderModel);

// TokenRouter-only variant ids (-free, date stamps) borrow limits, reasoning, and
// modalities from their base model; -free ids always cost zero. Without the borrowed
// window, pi computes a 1-token output budget and every reply truncates.
assert.deepEqual(mappedModels[4], {
    id: "deepseek/deepseek-v9-0813-free",
    name: "DeepSeek V9 (0813, free)",
    reasoning: true,
    input: ["text"],
    cost: {
        input: 0,
        output: 0,
        cacheRead: 0,
        cacheWrite: 0,
    },
    contextWindow: 131072,
    maxTokens: 65536,
} satisfies TokenRouterProviderModel);
assert.deepEqual(mappedModels[5], {
    id: "fallback/openrouter-model-free",
    name: "Fallback OpenRouter Model (free)",
    reasoning: true,
    input: ["text", "image"],
    cost: {
        input: 0,
        output: 0,
        cacheRead: 0,
        cacheWrite: 0,
    },
    contextWindow: 128000,
    maxTokens: 16000,
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

// --- resolveMaxTokens ---

// pi asks for the whole remaining window as output room, keeping only a flat 4096-token
// margin against a character-based estimate. A large declared output limit therefore
// overflows the shared prompt-plus-output budget. Cap it the way the Command Code
// provider does, and keep any smaller real limit.
assert.equal(resolveMaxTokens(500000, 500000), 32768); // x-ai/grok-4.6
assert.equal(resolveMaxTokens(200000, 200000), 32768); // claude-haiku-4-5
assert.equal(resolveMaxTokens(200000, 64000), 32768);
assert.equal(resolveMaxTokens(4096, 4096), 4096); // small windows stay untouched
assert.equal(resolveMaxTokens(262144, 16384), 16384); // a smaller real limit wins
assert.equal(resolveMaxTokens(8192, 65536), 8192); // never exceed the window

// --- provider config ---

const providerConfig = createTokenRouterProviderConfig(mappedModels);

assert.equal(providerConfig.name, "TokenRouter");
assert.equal(providerConfig.baseUrl, "https://api.tokenrouter.com/v1");
assert.equal(providerConfig.api, "openai-completions");
assert.equal(providerConfig.apiKey, "$TOKENROUTER_API_KEY");
assert.equal(providerConfig.authHeader, true);
assert.equal("oauth" in providerConfig, false);
assert.equal(providerConfig.models.length, 7);
assert.equal(providerConfig.models[0]!.api, "anthropic-messages");
assert.equal(providerConfig.models[1]!.api, "openai-completions");
assert.equal(providerConfig.models[2]!.api, "openai-completions");
assert.equal(providerConfig.models[3]!.api, "openai-completions");
assert.equal(providerConfig.models[4]!.api, "openai-completions");
assert.equal(providerConfig.models[5]!.api, "openai-completions");
assert.equal(providerConfig.models[6]!.api, "openai-responses");

// The Anthropic client appends /v1/messages, so those models must drop /v1 from the base URL.
assert.equal(providerConfig.models[0]!.baseUrl, "https://api.tokenrouter.com");
assert.equal("baseUrl" in providerConfig.models[1]!, false);
assert.equal("baseUrl" in providerConfig.models[2]!, false);

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

// Legacy Claude models reject thinking.type "adaptive" and need "enabled"; every other
// Claude model, including ones unknown at release time, defaults to adaptive so newly
// discovered models work without a code change. Non-Claude models never get the flag.
function claudeModel(id: string): TokenRouterProviderModel {
    return {
        id,
        name: id,
        reasoning: true,
        input: ["text", "image"],
        cost: { input: 2, output: 10, cacheRead: 0.2, cacheWrite: 2.5 },
        contextWindow: 1000000,
        maxTokens: 128000,
    };
}

function forceAdaptiveFor(id: string): boolean {
    const model = createTokenRouterProviderConfig([claudeModel(id)]).models[0]!;
    return "compat" in model && (model.compat as { forceAdaptiveThinking?: boolean }).forceAdaptiveThinking === true;
}

assert.equal(forceAdaptiveFor("anthropic/claude-sonnet-5"), true);
assert.equal(forceAdaptiveFor("anthropic/claude-sonnet-6"), true);
assert.equal(forceAdaptiveFor("claude-opus-4-8-m-aws"), true);
assert.equal(forceAdaptiveFor("anthropic/claude-sonnet-4.5"), false);
assert.equal(forceAdaptiveFor("anthropic/claude-haiku-4.5"), false);
assert.equal(forceAdaptiveFor("claude-haiku-4-5"), false);
assert.equal(forceAdaptiveFor("openai/gpt-5.5"), false);
assert.equal(forceAdaptiveFor("moonshotai/kimi-k3"), false);

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

// qwen3.8-max-free only accepts reasoning_effort low/medium/xhigh (probed 2026-08-17;
// the paid qwen3.8-max accepts high), so pi's levels must be mapped onto that set.
const qwenFreeProviderConfig = createTokenRouterProviderConfig([claudeModel("qwen/qwen3.8-max-free")]);
const QWEN_FREE_EXPECTED_MAP = {
    minimal: "low",
    low: "low",
    medium: "medium",
    high: "xhigh",
    xhigh: "xhigh",
    max: "xhigh",
};
assert.deepEqual(
    "thinkingLevelMap" in qwenFreeProviderConfig.models[0]!
        ? qwenFreeProviderConfig.models[0]!.thinkingLevelMap
        : undefined,
    QWEN_FREE_EXPECTED_MAP,
);
assert.deepEqual(
    "compat" in qwenFreeProviderConfig.models[0]! ? qwenFreeProviderConfig.models[0]!.compat : undefined,
    {
        supportsDeveloperRole: false,
        reasoningEffortMap: QWEN_FREE_EXPECTED_MAP,
    },
);

// --- GPT Responses-API thinking levels ---

// Probed against /v1/responses on 2026-08-27: gpt-5.2 through gpt-5.6 answer HTTP 400
// for reasoning.effort "minimal" and accept "xhigh"; gpt-5 rejects both; gpt-5-mini
// accepts "minimal" but rejects "xhigh"; the nano/pro variants accept both (mapping
// their "minimal" onto "low" stays valid). pi only offers "xhigh" when a
// thinkingLevelMap declares it and sends undeclared levels verbatim, so "minimal"
// must map onto "low" and "xhigh" must be declared for the families that take it.
function gptThinkingMapFor(id: string): Record<string, unknown> | undefined {
    const model = createTokenRouterProviderConfig([claudeModel(id)]).models[0]!;
    return "thinkingLevelMap" in model
        ? (model as { thinkingLevelMap?: Record<string, unknown> }).thinkingLevelMap
        : undefined;
}

assert.deepEqual(gptThinkingMapFor("openai/gpt-5.6-sol"), { minimal: "low", xhigh: "xhigh" });
assert.deepEqual(gptThinkingMapFor("openai/gpt-5.6-luna"), { minimal: "low", xhigh: "xhigh" });
assert.deepEqual(gptThinkingMapFor("openai/gpt-5.5"), { minimal: "low", xhigh: "xhigh" });
assert.deepEqual(gptThinkingMapFor("openai/gpt-5.4-mini"), { minimal: "low", xhigh: "xhigh" });
assert.deepEqual(gptThinkingMapFor("openai/gpt-5.2"), { minimal: "low", xhigh: "xhigh" });
assert.deepEqual(gptThinkingMapFor("openai/gpt-5"), { minimal: "low" });
assert.equal(gptThinkingMapFor("openai/gpt-5-mini"), undefined);
assert.equal(gptThinkingMapFor("openai/gpt-4o-mini"), undefined);

// --- ensureToolSchemaRequired ---

// x-ai upstreams reject a function schema whose parameters omit "required".
const xaiPayload = {
    model: "x-ai/grok-4.6",
    tools: [
        { type: "function", function: { name: "get_goal", parameters: { type: "object", properties: {} } } },
        {
            type: "function",
            function: {
                name: "read",
                parameters: { type: "object", properties: { path: { type: "string" } }, required: ["path"] },
            },
        },
    ],
};

const normalized = ensureToolSchemaRequired(xaiPayload);

assert.deepEqual(normalized.tools[0]!.function.parameters, {
    type: "object",
    properties: {},
    required: [],
});
assert.deepEqual(normalized.tools[1]!.function.parameters, {
    type: "object",
    properties: { path: { type: "string" } },
    required: ["path"],
});
// The caller's payload must not be mutated in place.
assert.equal("required" in xaiPayload.tools[0]!.function.parameters, false);

// Other providers' models are left untouched.
const otherPayload = {
    model: "deepseek/deepseek-v4-flash",
    tools: [{ type: "function", function: { name: "get_goal", parameters: { type: "object", properties: {} } } }],
};
assert.equal(ensureToolSchemaRequired(otherPayload), otherPayload);

// Payloads without tools pass through unchanged.
const toollessPayload = { model: "x-ai/grok-4.6" };
assert.equal(ensureToolSchemaRequired(toollessPayload), toollessPayload);

// The cap must reach the registered models, not just the helper.
const cappedProviderConfig = createTokenRouterProviderConfig([
    {
        id: "x-ai/grok-4.6",
        name: "Grok 4.6",
        reasoning: true,
        input: ["text"],
        cost: { input: 2, output: 6, cacheRead: 0.5, cacheWrite: 0 },
        contextWindow: 500000,
        maxTokens: 500000,
    },
]);

assert.equal(cappedProviderConfig.models[0]!.maxTokens, 32768);
assert.equal(cappedProviderConfig.models[0]!.contextWindow, 500000);
