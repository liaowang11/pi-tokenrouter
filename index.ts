/**
 * TokenRouter Provider Extension
 *
 * Registers TokenRouter (https://api.tokenrouter.com/v1) as a custom provider.
 * Models are derived from TokenRouter's /v1/models list, enriched with
 * metadata from models.dev first and OpenRouter second. The catalog is
 * discovered at startup and cached under the pi agent directory; a bundled
 * snapshot covers the first run before any cache exists. /tokenrouter-refresh
 * re-runs discovery on demand.
 *
 * Usage:
 *   pi -e /path/to/pi-tokenrouter
 *   /login tokenrouter
 *   # OR add to ~/.pi/agent/auth.json:
 *   #   "tokenrouter": { "type": "api_key", "key": "sk-..." }
 *   #   "tokenrouter": { "type": "api_key", "key": "$TOKENROUTER_API_KEY" }
 *   #   "tokenrouter": { "type": "api_key", "key": "!op read 'op://vault/item/key'" }
 */

import { getAgentDir, type ExtensionAPI, type ModelRegistry } from "@mariozechner/pi-coding-agent";
import { join } from "node:path";
import { loadTokenRouterModels, readTokenRouterModelsCache, type LoadTokenRouterModelsResult } from "./model-loader.js";
import { TOKENROUTER_MODELS } from "./models.generated.js";
import {
    createTokenRouterProviderConfig,
    ensureToolSchemaRequired,
    PROVIDER_NAME,
    type ProviderRequestPayload,
} from "./provider-config.js";

export default async function(pi: ExtensionAPI) {
    pi.on("before_provider_request", (event) => ensureToolSchemaRequired(event.payload as ProviderRequestPayload));

    const cachePath = join(getAgentDir(), "tokenrouter-models.json");

    // Register immediately so models are available offline and before login;
    // the refresh below replaces them once discovery succeeds.
    const initialModels = await readTokenRouterModelsCache(cachePath).catch(() => TOKENROUTER_MODELS);
    pi.registerProvider(PROVIDER_NAME, createTokenRouterProviderConfig(initialModels));
    let registeredModelsJson = JSON.stringify(initialModels);

    type RefreshResult = LoadTokenRouterModelsResult & { changed: boolean };
    let refreshPromise: Promise<RefreshResult> | undefined;

    // The compiled pi binary does not re-export AuthStorage, so the API key must
    // come from the model registry handed to event and command contexts.
    const refresh = (modelRegistry: ModelRegistry): Promise<RefreshResult> => {
        refreshPromise ??= (async () => {
            const apiKey = await modelRegistry.getApiKeyForProvider(PROVIDER_NAME);
            const result = await loadTokenRouterModels({ apiKey, cachePath, bundledModels: TOKENROUTER_MODELS });
            const modelsJson = JSON.stringify(result.models);
            const changed = modelsJson !== registeredModelsJson;
            if (!changed) return { ...result, changed };
            try {
                pi.registerProvider(PROVIDER_NAME, createTokenRouterProviderConfig(result.models));
                registeredModelsJson = modelsJson;
                return { ...result, changed };
            } catch {
                // pi marks the captured extension handle stale once the session is
                // replaced (e.g. print mode exiting mid-refresh). The catalog is
                // already cached, so the next start registers it.
                return {
                    ...result,
                    changed: false,
                    warning: "The model catalog changed but this session ended before it could be applied; the next pi start will use it.",
                };
            }
        })().finally(() => {
            refreshPromise = undefined;
        });
        return refreshPromise;
    };

    let startupRefreshTriggered = false;
    pi.on("session_start", (_event, ctx) => {
        if (startupRefreshTriggered) return;
        startupRefreshTriggered = true;
        void refresh(ctx.modelRegistry).then(
            (result) => {
                if (result.warning) console.warn(`[tokenrouter] ${result.warning}`);
            },
            (error) => {
                console.warn(
                    `[tokenrouter] Model catalog refresh failed: ${error instanceof Error ? error.message : String(error)}`,
                );
            },
        );
    });

    pi.registerCommand("tokenrouter-refresh", {
        description: "Refresh the TokenRouter model catalog",
        handler: async (_args, ctx) => {
            const result = await refresh(ctx.modelRegistry);
            const summary = `TokenRouter model catalog ${result.changed ? "updated" : "unchanged"} (${result.models.length} models from ${result.source}).`;
            ctx.ui.notify(
                result.warning ? `${summary} ${result.warning}` : summary,
                result.warning ? "warning" : "info",
            );
        },
    });
}
