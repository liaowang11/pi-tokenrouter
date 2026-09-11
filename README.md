# pi-tokenrouter

A [pi](https://github.com/badlogic/pi-mono) provider extension for [TokenRouter](https://tokenrouter.com).

Models are derived from TokenRouter's `/v1/models` list and enriched with metadata from [models.dev](https://models.dev) first, then [OpenRouter](https://openrouter.ai).

## Install

```bash
pi install npm:pi-tokenrouter
```

Or run directly:

```bash
pi -e /path/to/pi-tokenrouter
```

## Authentication

Resolve via `/login`, environment variable, or `auth.json`:

```bash
# Option 1: Interactive login
/login tokenrouter

# Option 2: Environment variable
export TOKENROUTER_API_KEY=sk-...

# Option 3: auth.json (~/.pi/agent/auth.json)
# "tokenrouter": { "type": "api_key", "key": "sk-..." }
```

## How it works

1. Registers TokenRouter as an API-key provider, so `/login tokenrouter` is handled under `Use an API key`.
2. Discovers the model catalog at startup: it fetches TokenRouter's authenticated `/v1/models` response in the background and enriches each model with metadata from `models.dev` when available, then falls back to OpenRouter for pricing, context window, max output tokens, reasoning support, and image support. The two metadata services are fetched independently: if one is down, the other still enriches; if both are down, TokenRouter's list stays live and the last cached metadata is reused for models it already knows (defaults cover the rest) with a warning naming the unreachable services.
3. Caches the discovered catalog at `~/.pi/agent/tokenrouter-models.json`. When TokenRouter itself is unreachable or the API key is missing, the cache is used; when there is no valid cache either, a bundled snapshot (`models.generated.ts`) is used.
4. `/tokenrouter-refresh` re-runs discovery on demand and reports what changed.

## Reasoning

Reasoning models routed through TokenRouter's OpenAI-completions API get `reasoning_split: true` on every request. Without it, MiniMax-M3 streams its chain-of-thought inline in `content` wrapped in literal `<think>` tags (verified 2026-09-11), polluting the answer; with the split, TokenRouter returns it as `reasoning_content` plus `reasoning_details`, which pi shows as a separate thinking block and retains for replay respectively. Routes that already split by default (verified on `z-ai/glm-5.3` paid and free) ignore the parameter. Anthropic and OpenAI Responses models are unaffected — those APIs have native reasoning channels.

Displayed prices are estimates borrowed from models.dev and OpenRouter; TokenRouter's actual billing for a route can differ.

## Context overflow

pi detects context-length errors from most upstreams TokenRouter proxies (including MiniMax's `context window exceeds limit`) and recovers by compacting and retrying. Probing in 2026-09 found no TokenRouter-specific overflow phrasing that pi misses, so this extension adds no error rewriting. Oversized prefills can instead surface as `429 rate_limit_error` admission rejections (verified on `z-ai/glm-5.3-free`); those stay on pi's normal retry path.

## License

MIT
