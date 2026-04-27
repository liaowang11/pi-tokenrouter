/**
 * TokenRouter Provider Extension
 *
 * Registers TokenRouter (https://api.tokenrouter.com/v1) as a custom provider.
 * Dynamically fetches available models from the /v1/models endpoint with
 * file-based caching to avoid redundant API calls on startup.
 *
 * Usage:
 *   TOKENROUTER_API_KEY=your-key pi -e /path/to/pi-tokenrouter
 *
 * Or install as a pi package and set TOKENROUTER_API_KEY in your environment.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

const BASE_URL = "https://api.tokenrouter.com/v1";
const API_KEY_ENV = "TOKENROUTER_API_KEY";

const CACHE_DIR = join(homedir(), ".pi", "agent", "cache");
const CACHE_FILE = join(CACHE_DIR, "tokenrouter-models.json");
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const DEFAULT_CONTEXT_WINDOW = 128_000;
const DEFAULT_MAX_TOKENS = 4_096;

// Reasoning model name patterns (ordered by specificity)
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
// Cache
// ---------------------------------------------------------------------------

interface CachedModels {
	fetchedAt: number;
	models: RawModel[];
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
		return JSON.parse(raw) as CachedModels;
	} catch {
		return null;
	}
}

function writeCache(models: RawModel[]): void {
	try {
		if (!existsSync(CACHE_DIR)) {
			mkdirSync(CACHE_DIR, { recursive: true });
		}
		const payload: CachedModels = { fetchedAt: Date.now(), models };
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

async function getModels(apiKey: string): Promise<RawModel[]> {
	// Try fresh cache first
	const cache = readCache();
	if (cache && isCacheFresh(cache)) {
		return cache.models;
	}

	// Fetch from API
	try {
		const models = await fetchModels(apiKey);
		writeCache(models);
		return models;
	} catch (err) {
		// Fall back to stale cache on network errors
		if (cache) {
			return cache.models;
		}
		throw err;
	}
}

// ---------------------------------------------------------------------------
// Extension entry point
// ---------------------------------------------------------------------------

export default async function (pi: ExtensionAPI) {
	const apiKey = process.env[API_KEY_ENV];
	if (!apiKey) {
		return; // No API key configured — skip registration silently
	}

	const rawModels = await getModels(apiKey);

	pi.registerProvider("tokenrouter", {
		baseUrl: BASE_URL,
		apiKey: API_KEY_ENV,
		api: "openai-completions",
		authHeader: true,
		models: rawModels.map((m) => ({
			id: m.id,
			name: m.name ?? m.id,
			reasoning: isReasoningModel(m.id),
			input: supportsVision(m.id) ? (["text", "image"] as const) : (["text"] as const),
			cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
			contextWindow: m.context_window ?? DEFAULT_CONTEXT_WINDOW,
			maxTokens: m.max_tokens ?? DEFAULT_MAX_TOKENS,
		})),
	});
}
