export const BASE_URL = "https://api.tokenrouter.com/v1";
// pi's Anthropic client appends /v1/messages itself, so those models must not carry /v1.
export const ANTHROPIC_BASE_URL = "https://api.tokenrouter.com";
export const PROVIDER_NAME = "tokenrouter";
export const PROVIDER_DISPLAY_NAME = "TokenRouter";
export const PROVIDER_API_KEY_ENV = "$TOKENROUTER_API_KEY";

// Probed against /v1/messages on 2026-08-27: fable-5, sonnet-5, opus-4.7, opus-4.8, opus-5
// (and the fast and m-aws variants) accept adaptive efforts up to "xhigh" and "max";
// opus-4.6 rejects "xhigh" but accepts "max". The 4.5-and-older generations (haiku-4.5,
// opus-4.5, sonnet-4, sonnet-4.5) reject adaptive and still need budget thinking
// (thinking.type "enabled"), which pi sends for models without forceAdaptiveThinking.
// pi only offers the xhigh and max levels when a thinkingLevelMap declares them, so every
// adaptive family needs a map and the forceAdaptiveThinking compat flag.
const CLAUDE_ADAPTIVE_XHIGH_FAMILIES = ["fable-5", "sonnet-5", "opus-5", "opus-4-8", "opus-4-7"];
const CLAUDE_ADAPTIVE_MAX_ONLY_FAMILIES = ["opus-4-6", "sonnet-4-6"];
// Checked after the adaptive families so sonnet-4-5 and sonnet-4-6 are not caught here.
const CLAUDE_BUDGET_FAMILIES = ["haiku-4-5", "opus-4-5", "sonnet-4"];
const CLAUDE_XHIGH_MAX_THINKING_LEVEL_MAP: ThinkingLevelMap = { xhigh: "xhigh", max: "max" };
const CLAUDE_MAX_ONLY_THINKING_LEVEL_MAP: ThinkingLevelMap = { max: "max" };

function normalizeModelIdForFamily(modelId: string): string {
    return modelId.replace(/[\s_.:]+/g, "-");
}

function resolveClaudeThinkingLevelMap(modelId: string): ThinkingLevelMap | undefined {
    if (!modelId.startsWith("anthropic/") && !modelId.startsWith("claude-")) return undefined;
    const normalized = normalizeModelIdForFamily(modelId);
    if (CLAUDE_ADAPTIVE_MAX_ONLY_FAMILIES.some((family) => normalized.includes(family))) {
        return CLAUDE_MAX_ONLY_THINKING_LEVEL_MAP;
    }
    if (CLAUDE_ADAPTIVE_XHIGH_FAMILIES.some((family) => normalized.includes(family))) {
        return CLAUDE_XHIGH_MAX_THINKING_LEVEL_MAP;
    }
    if (CLAUDE_BUDGET_FAMILIES.some((family) => normalized.includes(family))) {
        return undefined;
    }
    // Unknown future generations default to adaptive with the full effort ladder, the
    // same default upstream has shipped with every generation since Opus 4.6, so newly
    // discovered models work without a code change.
    return CLAUDE_XHIGH_MAX_THINKING_LEVEL_MAP;
}

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
const GPT_5_6_THINKING_LEVEL_MAP: ThinkingLevelMap = { minimal: "low", xhigh: "xhigh", max: "max" };
const GPT_MINIMAL_ONLY_THINKING_LEVEL_MAP: ThinkingLevelMap = { minimal: "low" };
const GPT_XHIGH_FAMILY_PREFIXES = ["openai/gpt-5.2", "openai/gpt-5.4", "openai/gpt-5.5"];

function resolveThinkingLevelMap(modelId: string): ThinkingLevelMap | undefined {
    const exact = MODEL_THINKING_LEVEL_MAPS[modelId];
    if (exact) return exact;
    if (modelId === "openai/gpt-5") return GPT_MINIMAL_ONLY_THINKING_LEVEL_MAP;
    if (modelId.startsWith("openai/gpt-5.6")) return GPT_5_6_THINKING_LEVEL_MAP;
    if (GPT_XHIGH_FAMILY_PREFIXES.some((prefix) => modelId.startsWith(prefix))) {
        return GPT_MINIMAL_TO_XHIGH_THINKING_LEVEL_MAP;
    }
    return resolveClaudeThinkingLevelMap(modelId);
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
            // Claude models in the adaptive families need the flag so pi sends adaptive
            // effort instead of budget thinking; legacy generations stay on budgets.
            const forceAdaptiveThinking = api === "anthropic-messages" && resolveClaudeThinkingLevelMap(m.id) !== undefined;
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
                    ...(forceAdaptiveThinking ? { forceAdaptiveThinking } : {}),
                    ...(thinkingLevelMap ? { reasoningEffortMap: thinkingLevelMap } : {}),
                },
            };
        }),
    };
}
