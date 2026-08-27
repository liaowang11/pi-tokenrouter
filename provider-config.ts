export const BASE_URL = "https://api.tokenrouter.com/v1";
// pi's Anthropic client appends /v1/messages itself, so those models must not carry /v1.
export const ANTHROPIC_BASE_URL = "https://api.tokenrouter.com";
export const PROVIDER_NAME = "tokenrouter";
export const PROVIDER_DISPLAY_NAME = "TokenRouter";
export const PROVIDER_API_KEY_ENV = "$TOKENROUTER_API_KEY";

// Probed against /v1/messages on 2026-08-13 and 2026-08-17: these legacy models reject
// thinking.type "adaptive" and need "enabled". Every newer Claude generation accepts
// adaptive, and upstream keeps enabling it on more models (Sonnet 4 and Opus 4.6 rejected
// it on 08-13, accept it on 08-17), so Claude models outside this list default to adaptive
// and newly discovered ones work without a code change.
const ENABLED_THINKING_MODEL_IDS = new Set([
    "anthropic/claude-haiku-4.5",
    "anthropic/claude-opus-4.5",
    "anthropic/claude-opus-4.6",
    "anthropic/claude-sonnet-4",
    "anthropic/claude-sonnet-4.5",
    "claude-haiku-4-5",
]);

type ThinkingLevelMap = Partial<Record<"off" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max", string>>;

// Upstreams that only accept a subset of reasoning_effort values; pi's levels are mapped
// onto the nearest accepted one. kimi-k3 probed 2026-08-13, qwen3.8-max-free 2026-08-17
// (its paid variant accepts everything, only the free route is restricted).
const MODEL_THINKING_LEVEL_MAPS: Record<string, ThinkingLevelMap> = {
    "moonshotai/kimi-k3": {
        minimal: "max",
        low: "max",
        medium: "max",
        high: "max",
        xhigh: "max",
        max: "max",
    },
    "qwen/qwen3.8-max-free": {
        minimal: "low",
        low: "low",
        medium: "medium",
        high: "xhigh",
        xhigh: "xhigh",
        max: "xhigh",
    },
};

// Probed against /v1/responses on 2026-08-27: gpt-5.2 through gpt-5.6 answer HTTP 400 for
// reasoning.effort "minimal" (supported values are none/low/medium/high/xhigh) and accept
// "xhigh"; gpt-5 rejects both; gpt-5-mini accepts "minimal" but rejects "xhigh"; the nano
// and pro variants accept both, and mapping their "minimal" onto "low" stays valid.
// pi only offers "xhigh" when a thinkingLevelMap declares it and sends undeclared levels
// verbatim, so "minimal" must map onto "low" and "xhigh" must be declared where accepted.
const GPT_MINIMAL_TO_XHIGH_THINKING_LEVEL_MAP: ThinkingLevelMap = { minimal: "low", xhigh: "xhigh" };
const GPT_MINIMAL_ONLY_THINKING_LEVEL_MAP: ThinkingLevelMap = { minimal: "low" };
const GPT_XHIGH_FAMILY_PREFIXES = ["openai/gpt-5.2", "openai/gpt-5.4", "openai/gpt-5.5", "openai/gpt-5.6"];

function resolveThinkingLevelMap(modelId: string): ThinkingLevelMap | undefined {
    const exact = MODEL_THINKING_LEVEL_MAPS[modelId];
    if (exact) return exact;
    if (modelId === "openai/gpt-5") return GPT_MINIMAL_ONLY_THINKING_LEVEL_MAP;
    if (GPT_XHIGH_FAMILY_PREFIXES.some((prefix) => modelId.startsWith(prefix))) {
        return GPT_MINIMAL_TO_XHIGH_THINKING_LEVEL_MAP;
    }
    return undefined;
}

export type TokenRouterProviderModel = {
    id: string;
    name: string;
    reasoning: boolean;
    input: ("text" | "image")[];
    cost: {
        input: number;
        output: number;
        cacheRead: number;
        cacheWrite: number;
    };
    contextWindow: number;
    maxTokens: number;
};

/**
 * Ceiling for a model's declared output limit.
 *
 * pi asks for the whole remaining context window as output room, keeping only a flat
 * 4096-token margin against a `characters / 4` estimate of the prompt. On code-heavy
 * context that estimate runs about 25% low, so the request total exceeds a shared
 * prompt-plus-output budget and the upstream answers with a context-length error. pi
 * reads that error as "out of room" and compacts, at a fraction of the real window.
 *
 * Declaring a smaller limit keeps the leftover window as slack. The Command Code pi
 * provider caps the same way with `Math.min(contextLength, 65536)`; 32768 also fits
 * inside Anthropic's real 64000 output cap, which models.dev reports as 200000.
 */
const MAX_OUTPUT_TOKENS = 32768;

export function resolveMaxTokens(contextWindow: number, maxTokens: number): number {
    return Math.min(maxTokens, contextWindow, MAX_OUTPUT_TOKENS);
}

export function selectApi(modelId: string): "openai-responses" | "anthropic-messages" | "openai-completions" {
    if (modelId.startsWith("openai/")) return "openai-responses";
    if (modelId.startsWith("anthropic/") || modelId.startsWith("claude-")) return "anthropic-messages";
    return "openai-completions";
}

const XAI_MODEL_PREFIX = "x-ai/";

type ProviderRequestTool = {
    function?: {
        parameters?: {
            required?: unknown;
        };
    };
};

export type ProviderRequestPayload = {
    model?: unknown;
    tools?: unknown;
};

/**
 * x-ai upstreams reject a function schema whose `parameters` object omits `required`,
 * answering `400 Provider returned error`. An absent and an empty `required` mean the
 * same thing in JSON Schema, so filling it in changes nothing the model sees.
 */
export function ensureToolSchemaRequired<T extends ProviderRequestPayload>(payload: T): T {
    if (typeof payload.model !== "string" || !payload.model.startsWith(XAI_MODEL_PREFIX)) return payload;
    if (!Array.isArray(payload.tools)) return payload;

    let patched = false;
    const tools = payload.tools.map((tool: ProviderRequestTool) => {
        const parameters = tool?.function?.parameters;
        if (!parameters || typeof parameters !== "object") return tool;
        if (Array.isArray(parameters.required)) return tool;
        patched = true;
        return { ...tool, function: { ...tool.function, parameters: { ...parameters, required: [] } } };
    });

    return patched ? ({ ...payload, tools } as T) : payload;
}

export function createTokenRouterProviderConfig(models: TokenRouterProviderModel[]) {
    return {
        name: PROVIDER_DISPLAY_NAME,
        baseUrl: BASE_URL,
        api: "openai-completions" as const,
        apiKey: PROVIDER_API_KEY_ENV,
        authHeader: true,
        models: models.map((m) => {
            const thinkingLevelMap = resolveThinkingLevelMap(m.id);
            const api = selectApi(m.id);
            return {
                ...m,
                api,
                maxTokens: resolveMaxTokens(m.contextWindow, m.maxTokens),
                ...(api === "anthropic-messages" ? { baseUrl: ANTHROPIC_BASE_URL } : {}),
                ...(thinkingLevelMap ? { thinkingLevelMap } : {}),
                compat: {
                    // TokenRouter upstreams reject the "developer" role, so send the system prompt
                    // as "system". Verified accepted by every model that serves requests at all.
                    supportsDeveloperRole: false,
                    ...(api === "anthropic-messages" && !ENABLED_THINKING_MODEL_IDS.has(m.id)
                        ? { forceAdaptiveThinking: true }
                        : {}),
                    ...(thinkingLevelMap ? { reasoningEffortMap: thinkingLevelMap } : {}),
                },
            };
        }),
    };
}
