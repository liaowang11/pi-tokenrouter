/**
 * TokenRouter Provider Extension
 *
 * Registers TokenRouter (https://api.tokenrouter.com/v1) as a custom provider.
 * Dynamically fetches available models from the /v1/models endpoint with
 * file-based caching to avoid redundant API calls on startup.
 *
 * Authentication (resolved via AuthStorage with full priority chain):
 *   1. Runtime overrides (CLI --api-key)
 *   2. API key from auth.json (literal, env var name, or shell command)
 *   3. OAuth token from auth.json (from /login tokenrouter)
 *   4. TOKENROUTER_API_KEY environment variable
 *
 * Usage:
 *   pi -e /path/to/pi-tokenrouter
 *   /login tokenrouter          # stores key in auth.json
 *   # OR add to ~/.pi/agent/auth.json:
 *   #   "tokenrouter": { "type": "api_key", "key": "sk-..." }
 *   #   "tokenrouter": { "type": "api_key", "key": "TOKENROUTER_API_KEY" }
 *   #   "tokenrouter": { "type": "api_key", "key": "!op read 'op://vault/item/key'" }
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import type { OAuthCredentials, OAuthLoginCallbacks } from "@mariozechner/pi-ai";
import { AuthStorage } from "@mariozechner/pi-coding-agent";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

const BASE_URL = "https://api.tokenrouter.com/v1";
const PROVIDER_NAME = "tokenrouter";
const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";

const HOME_PI = join(homedir(), ".pi", "agent");
const CACHE_DIR = join(HOME_PI, "cache");
const CACHE_FILE = join(CACHE_DIR, "tokenrouter-models.json");
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const DEFAULT_CONTEXT_WINDOW = 128_000;
const DEFAULT_MAX_TOKENS = 4_096;

// Reasoning model name patterns
const REASONING_PATTERNS = [
    /o1\b/i,
    /o3\b/i,
    /o4\b/i,
    /claude.*thinking/i,
    /deepseek-r/i,
    /deepseek-prover/i,
    /gemini.*thinking/i,
    /qwq/i,
    /qwen3/i,
    /reasoning/i,
];

// Vision model name patterns
const VISION_PATTERNS = [
    /vision/i,
    /claude/i,
    /gpt-4o/i,
    /gpt-4-turbo/i,
    /gemini/i,
    /llava/i,
    /qwen.*vl/i,
    /qwen.*visual/i,
];

function isReasoningModel(id: string): boolean {
    return REASONING_PATTERNS.some((p) => p.test(id));
}

function supportsVision(id: string): boolean {
    return VISION_PATTERNS.some((p) => p.test(id));
}

// ---------------------------------------------------------------------------
// OpenRouter pricing lookup
// ---------------------------------------------------------------------------

interface OpenRouterModel {
    id: string;
    context_length?: number;
    top_provider?: { max_completion_tokens?: number };
    pricing?: {
        prompt?: string;
        completion?: string;
        input_cache_read?: string;
        input_cache_write?: string;
    };
}

interface Pricing {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
    contextWindow: number;
    maxTokens: number;
}

function parsePerToken(price?: string): number {
    const n = parseFloat(price ?? "0");
    return Number.isFinite(n) ? n * 1_000_000 : 0;
}

async function fetchOpenRouterPricing(): Promise<Map<string, Pricing>> {
    const response = await fetch(OPENROUTER_MODELS_URL);
    if (!response.ok) return new Map();

    const payload = (await response.json()) as { data?: OpenRouterModel[] };
    const models = payload.data ?? [];

    const map = new Map<string, Pricing>();
    for (const m of models) {
        map.set(m.id, {
            input: parsePerToken(m.pricing?.prompt),
            output: parsePerToken(m.pricing?.completion),
            cacheRead: parsePerToken(m.pricing?.input_cache_read),
            cacheWrite: parsePerToken(m.pricing?.input_cache_write),
            contextWindow: m.context_length ?? DEFAULT_CONTEXT_WINDOW,
            maxTokens: m.top_provider?.max_completion_tokens ?? DEFAULT_MAX_TOKENS,
        });
    }
    return map;
}

// ---------------------------------------------------------------------------
// Model cache
// ---------------------------------------------------------------------------

interface CachedModels {
    fetchedAt: number;
    models: RawModel[];
    pricing: Record<string, Pricing>;
}

interface RawModel {
    id: string;
    name?: string;
    context_window?: number;
    max_tokens?: number;
    [key: string]: unknown;
}

function readCache(): CachedModels | null {
    try {
        if (!existsSync(CACHE_FILE)) return null;
        const raw = readFileSync(CACHE_FILE, "utf-8");
        const data = JSON.parse(raw) as CachedModels;
        // Invalidate cache from before pricing was added
        if (!data.pricing) return null;
        return data;
    } catch {
        return null;
    }
}

function writeCache(models: RawModel[], pricing: Map<string, Pricing>): void {
    try {
        if (!existsSync(CACHE_DIR)) {
            mkdirSync(CACHE_DIR, { recursive: true });
        }
        // Serialise pricing map to plain object
        const pricingObj: Record<string, Pricing> = {};
        for (const [k, v] of pricing) pricingObj[k] = v;
        const payload: CachedModels = { fetchedAt: Date.now(), models, pricing: pricingObj };
        writeFileSync(CACHE_FILE, JSON.stringify(payload), "utf-8");
    } catch {
        // Cache write failure is non-fatal
    }
}

function isCacheFresh(cache: CachedModels): boolean {
    return Date.now() - cache.fetchedAt < CACHE_TTL_MS;
}

// ---------------------------------------------------------------------------
// Model fetching
// ---------------------------------------------------------------------------

async function fetchModels(apiKey: string): Promise<RawModel[]> {
    const response = await fetch(`${BASE_URL}/models`, {
        headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`TokenRouter /v1/models returned ${response.status}: ${await response.text()}`);
    }

    const payload = (await response.json()) as {
        data: Array<Record<string, unknown>>;
    };

    return payload.data.map((m) => ({
        id: m.id as string,
        name: (m.name as string | undefined) ?? (m.id as string),
        context_window: (m.context_window ?? m.contextWindow ?? undefined) as number | undefined,
        max_tokens: (m.max_tokens ?? m.maxTokens ?? undefined) as number | undefined,
    }));
}

async function getModelsAndPricing(apiKey: string): Promise<{ models: RawModel[]; pricing: Map<string, Pricing> }> {
    const cache = readCache();
    if (cache && isCacheFresh(cache)) {
        const pricingMap = new Map<string, Pricing>(Object.entries(cache.pricing));
        return { models: cache.models, pricing: pricingMap };
    }

    try {
        const [models, pricing] = await Promise.all([
            fetchModels(apiKey),
            fetchOpenRouterPricing(),
        ]);
        writeCache(models, pricing);
        return { models, pricing };
    } catch {
        if (cache) {
            const pricingMap = new Map<string, Pricing>(Object.entries(cache.pricing));
            return { models: cache.models, pricing: pricingMap };
        }
        throw new Error(
            "Failed to fetch models from TokenRouter and no cached data available. " +
            "Configure authentication via /login tokenrouter, auth.json, or TOKENROUTER_API_KEY.",
        );
    }
}

// ---------------------------------------------------------------------------
// OAuth (API key prompt flow for /login)
// ---------------------------------------------------------------------------

async function loginTokenRouter(callbacks: OAuthLoginCallbacks): Promise<OAuthCredentials> {
    const key = await callbacks.onPrompt({ message: "Enter your TokenRouter API key:" });
    if (!key || !key.trim()) {
        throw new Error("No API key provided");
    }
    // API keys don't expire — set far-future expiry so pi won't try to refresh
    const farFuture = Date.now() + 10 * 365 * 24 * 60 * 60 * 1000;
    return {
        refresh: key.trim(),
        access: key.trim(),
        expires: farFuture,
    };
}

async function refreshTokenRouter(credentials: OAuthCredentials): Promise<OAuthCredentials> {
    // API keys don't expire — return as-is
    return credentials;
}

// ---------------------------------------------------------------------------
// Extension entry point
// ---------------------------------------------------------------------------

const oauth = {
    name: "TokenRouter",
    login: loginTokenRouter,
    refreshToken: refreshTokenRouter,
    getApiKey: (cred: OAuthCredentials) => cred.access,
};

export default async function(pi: ExtensionAPI) {
    // Resolve API key through AuthStorage with full priority chain:
    // runtime overrides → auth.json api_key → auth.json oauth → env vars
    const authStorage = AuthStorage.create();
    const apiKey = await authStorage.getApiKey(PROVIDER_NAME);

    if (!apiKey) {
        // Register provider with OAuth only (no models) so /login works.
        // After /login, user needs /reload to fetch and register models.
        pi.registerProvider(PROVIDER_NAME, {
            baseUrl: BASE_URL,
            api: "openai-completions",
            authHeader: true,
            oauth,
        });
        return;
    }

    const { models: rawModels, pricing } = await getModelsAndPricing(apiKey);

    pi.registerProvider(PROVIDER_NAME, {
        baseUrl: BASE_URL,
        api: "openai-completions",
        authHeader: true,
        models: rawModels.map((m) => {
            const p = pricing.get(m.id);
            return {
                id: m.id,
                name: m.name ?? m.id,
                reasoning: isReasoningModel(m.id),
                input: supportsVision(m.id) ? (["text", "image"] as const) : (["text"] as const),
                cost: p
                    ? { input: p.input, output: p.output, cacheRead: p.cacheRead, cacheWrite: p.cacheWrite }
                    : { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
                contextWindow: m.context_window ?? p?.contextWindow ?? DEFAULT_CONTEXT_WINDOW,
                maxTokens: m.max_tokens ?? p?.maxTokens ?? DEFAULT_MAX_TOKENS,
            };
        }),
        oauth,
    });
}
