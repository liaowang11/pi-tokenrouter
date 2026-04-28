# pi-tokenrouter

A [pi](https://github.com/badlogic/pi-mono) provider extension for [TokenRouter](https://tokenrouter.com).

Dynamically discovers available models from the TokenRouter API and enriches them with pricing, context window, and max output token data from [OpenRouter](https://openrouter.ai) (TokenRouter shares the same pricing).

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

1. On startup, fetches the model list from TokenRouter's `/v1/models` endpoint.
2. In parallel, fetches pricing data from OpenRouter's public model catalog.
3. Matches models by ID and fills in cost, context window, and max output tokens.
4. Caches everything locally for 1 week (`~/.pi/agent/cache/tokenrouter-models.json`).

Models that don't match an OpenRouter entry fall back to zero cost and default context limits.

## License

MIT
