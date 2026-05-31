/**
 * TokenRouter Provider Extension
 *
 * Registers TokenRouter (https://api.tokenrouter.com/v1) as a custom provider.
 * Models are derived from TokenRouter's /v1/models list, enriched with
 * metadata from models.dev first and OpenRouter second, so TokenRouter can be
 * configured through pi's API-key login flow before any TokenRouter auth exists.
 *
 * Usage:
 *   pi -e /path/to/pi-tokenrouter
 *   /login tokenrouter
 *   # OR add to ~/.pi/agent/auth.json:
 *   #   "tokenrouter": { "type": "api_key", "key": "sk-..." }
 *   #   "tokenrouter": { "type": "api_key", "key": "$TOKENROUTER_API_KEY" }
 *   #   "tokenrouter": { "type": "api_key", "key": "!op read 'op://vault/item/key'" }
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { TOKENROUTER_MODELS } from "./models.generated.js";
import { createTokenRouterProviderConfig, PROVIDER_NAME } from "./provider-config.js";

export default async function(pi: ExtensionAPI) {
    pi.registerProvider(PROVIDER_NAME, createTokenRouterProviderConfig(TOKENROUTER_MODELS));
}
