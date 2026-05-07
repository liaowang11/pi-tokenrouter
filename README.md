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
2. Uses a checked-in snapshot generated from TokenRouter's authenticated `/v1/models` response.
3. Enriches each model with metadata from `models.dev` when available, then falls back to OpenRouter for pricing, context window, max output tokens, reasoning support, and image support.

## License

MIT
