export const BASE_URL = "https://api.tokenrouter.com/v1";
// pi's Anthropic client appends /v1/messages itself, so those models must not carry /v1.
export const ANTHROPIC_BASE_URL = "https://api.tokenrouter.com";
export const PROVIDER_NAME = "tokenrouter";
export const PROVIDER_DISPLAY_NAME = "TokenRouter";
export const PROVIDER_API_KEY_ENV = "$TOKENROUTER_API_KEY";

// Probed against /v1/messages on 2026-08-13: these reject thinking.type "enabled" and need
// adaptive thinking, while Sonnet 4.5, Sonnet 4, Haiku 4.5, Opus 4.5, and Opus 4.6 need "enabled".
// Refresh by sending each Claude model both shapes when TokenRouter adds one.
const ADAPTIVE_THINKING_MODEL_IDS = new Set([
    "anthropic/claude-fable-5",
    "anthropic/claude-opus-4.7",
    "anthropic/claude-opus-4.8",
    "anthropic/claude-opus-5",
    "anthropic/claude-sonnet-5",
]);

const KIMI_K3_THINKING_LEVEL_MAP = {
    minimal: "max",
    low: "max",
    medium: "max",
    high: "max",
    xhigh: "max",
    max: "max",
} as const;

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
            const isKimiK3 = m.id === "moonshotai/kimi-k3";
            const api = selectApi(m.id);
            return {
                ...m,
                api,
                ...(api === "anthropic-messages" ? { baseUrl: ANTHROPIC_BASE_URL } : {}),
                ...(isKimiK3 ? { thinkingLevelMap: KIMI_K3_THINKING_LEVEL_MAP } : {}),
                compat: {
                    // TokenRouter upstreams reject the "developer" role, so send the system prompt
                    // as "system". Verified accepted by every model that serves requests at all.
                    supportsDeveloperRole: false,
                    ...(ADAPTIVE_THINKING_MODEL_IDS.has(m.id) ? { forceAdaptiveThinking: true } : {}),
                    ...(isKimiK3 ? { reasoningEffortMap: KIMI_K3_THINKING_LEVEL_MAP } : {}),
                },
            };
        }),
    };
}
