import type { TokenRouterProviderModel } from "./provider-config.js";

// Derived from TokenRouter /v1/models and enriched with models.dev, then OpenRouter metadata.
// Generated on 2026-08-13T08:42:34.241Z.
export const TOKENROUTER_MODELS: TokenRouterProviderModel[] = [
    {
        "id": "openai/gpt-5.4-nano",
        "name": "GPT-5.4 nano",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.2,
            "output": 1.25,
            "cacheRead": 0.02,
            "cacheWrite": 0
        },
        "contextWindow": 400000,
        "maxTokens": 128000
    },
    {
        "id": "qwen/qwen3.5-9b",
        "name": "Qwen3.5 9B",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.1,
            "output": 0.15,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 262144,
        "maxTokens": 262144
    },
    {
        "id": "qwen/qwen3.7-max",
        "name": "Qwen3.7 Max",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 1.475,
            "output": 4.425,
            "cacheRead": 0.295,
            "cacheWrite": 1.84375
        },
        "contextWindow": 1000000,
        "maxTokens": 131072
    },
    {
        "id": "deepseek/deepseek-v4-pro",
        "name": "DeepSeek V4 Pro",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 1.74,
            "output": 3.48,
            "cacheRead": 0.145,
            "cacheWrite": 0
        },
        "contextWindow": 1002000,
        "maxTokens": 128000
    },
    {
        "id": "MiniMax-M3",
        "name": "MiniMax-M3",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0,
            "output": 0,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 1000000,
        "maxTokens": 128000
    },
    {
        "id": "miromind/mirothinker-1-7-deepresearch",
        "name": "miromind/mirothinker-1-7-deepresearch",
        "reasoning": false,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0,
            "output": 0,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 4096,
        "maxTokens": 4096
    },
    {
        "id": "qwen/qwen3.5-plus-02-15",
        "name": "Qwen3.5 Plus 2026-02-15",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.26,
            "output": 1.56,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 1000000,
        "maxTokens": 65536
    },
    {
        "id": "anthropic/claude-fable-5",
        "name": "Claude Fable 5",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 10,
            "output": 50,
            "cacheRead": 1,
            "cacheWrite": 12.5
        },
        "contextWindow": 1000000,
        "maxTokens": 128000
    },
    {
        "id": "x-ai/grok-4.20-beta",
        "name": "x-ai/grok-4.20-beta",
        "reasoning": false,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0,
            "output": 0,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 4096,
        "maxTokens": 4096
    },
    {
        "id": "anthropic/claude-opus-4.8-fast",
        "name": "Claude Opus 4.8 (Fast)",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 10,
            "output": 50,
            "cacheRead": 1,
            "cacheWrite": 12.5
        },
        "contextWindow": 1000000,
        "maxTokens": 128000
    },
    {
        "id": "openai/gpt-5.2",
        "name": "GPT-5.2",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 1.75,
            "output": 14,
            "cacheRead": 0.175,
            "cacheWrite": 0
        },
        "contextWindow": 400000,
        "maxTokens": 128000
    },
    {
        "id": "deepseek/deepseek-v3.2",
        "name": "DeepSeek V3.2",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.269,
            "output": 0.4,
            "cacheRead": 0.1345,
            "cacheWrite": 0
        },
        "contextWindow": 163840,
        "maxTokens": 65536
    },
    {
        "id": "anthropic/claude-sonnet-4.5",
        "name": "Claude Sonnet 4.5 (latest)",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 3,
            "output": 15,
            "cacheRead": 0.3,
            "cacheWrite": 3.75
        },
        "contextWindow": 1000000,
        "maxTokens": 64000
    },
    {
        "id": "stepfun/step-3.5-flash",
        "name": "Stepfun/Step-3.5 Flash",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.09999999999999999,
            "output": 0.3,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 64000,
        "maxTokens": 4096
    },
    {
        "id": "x-ai/grok-4.6",
        "name": "Grok 4.6",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 2,
            "output": 6,
            "cacheRead": 0.5,
            "cacheWrite": 0
        },
        "contextWindow": 500000,
        "maxTokens": 500000
    },
    {
        "id": "z-ai/glm-5-turbo",
        "name": "GLM-5-Turbo",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 1.2,
            "output": 4,
            "cacheRead": 0.24,
            "cacheWrite": 0
        },
        "contextWindow": 202752,
        "maxTokens": 131072
    },
    {
        "id": "moonshotai/kimi-k3",
        "name": "Kimi K3",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 3,
            "output": 15,
            "cacheRead": 0.3,
            "cacheWrite": 0
        },
        "contextWindow": 1048576,
        "maxTokens": 131072
    },
    {
        "id": "qwen3.6-flash",
        "name": "Qwen3.6 Flash",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0,
            "output": 0,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 1000000,
        "maxTokens": 65536
    },
    {
        "id": "x-ai/grok-4.5",
        "name": "Grok 4.5",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 2,
            "output": 6,
            "cacheRead": 0.3,
            "cacheWrite": 0
        },
        "contextWindow": 500000,
        "maxTokens": 500000
    },
    {
        "id": "qwen/qwen3.5-397b-a17b",
        "name": "Qwen3.5 397B-A17B",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.5,
            "output": 3.6,
            "cacheRead": 0.3,
            "cacheWrite": 0
        },
        "contextWindow": 262144,
        "maxTokens": 262144
    },
    {
        "id": "qwen/qwen3.8-max",
        "name": "Qwen3.8 Max",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 2,
            "output": 6,
            "cacheRead": 0.25,
            "cacheWrite": 2.5
        },
        "contextWindow": 1000000,
        "maxTokens": 131072
    },
    {
        "id": "anthropic/claude-sonnet-4",
        "name": "Claude Sonnet 4 (latest)",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 3,
            "output": 15,
            "cacheRead": 0.3,
            "cacheWrite": 3.75
        },
        "contextWindow": 200000,
        "maxTokens": 64000
    },
    {
        "id": "tencent/hy3-preview",
        "name": "Hy3 preview",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.063,
            "output": 0.21,
            "cacheRead": 0.021,
            "cacheWrite": 0
        },
        "contextWindow": 262144,
        "maxTokens": 262144
    },
    {
        "id": "z-ai/glm-5.1",
        "name": "GLM-5.1",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 1.4,
            "output": 4.4,
            "cacheRead": 0.26,
            "cacheWrite": 0
        },
        "contextWindow": 204800,
        "maxTokens": 131072
    },
    {
        "id": "nvidia/nemotron-3.5-lightning",
        "name": "Nemotron 3.5 Lightning 30B A3B",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.1,
            "output": 0.25,
            "cacheRead": 0.05,
            "cacheWrite": 0
        },
        "contextWindow": 1048576,
        "maxTokens": 262144
    },
    {
        "id": "deepseek/deepseek-v4-pro-0813",
        "name": "DeepSeek V4 Pro 0813",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.435,
            "output": 0.87,
            "cacheRead": 0.003625,
            "cacheWrite": 0
        },
        "contextWindow": 1048576,
        "maxTokens": 384000
    },
    {
        "id": "anthropic/claude-sonnet-5",
        "name": "Claude Sonnet 5",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 2,
            "output": 10,
            "cacheRead": 0.2,
            "cacheWrite": 2.5
        },
        "contextWindow": 1000000,
        "maxTokens": 128000
    },
    {
        "id": "qwen3.5-omni-plus",
        "name": "Qwen3.5 Omni Plus",
        "reasoning": false,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0,
            "output": 0,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 983616,
        "maxTokens": 65536
    },
    {
        "id": "seed-2-0-pro-260328",
        "name": "seed-2-0-pro-260328",
        "reasoning": false,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0,
            "output": 0,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 4096,
        "maxTokens": 4096
    },
    {
        "id": "moonshotai/kimi-k2.7-code",
        "name": "Kimi K2.7 Code",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.95,
            "output": 4,
            "cacheRead": 0.19,
            "cacheWrite": 0
        },
        "contextWindow": 256000,
        "maxTokens": 256000
    },
    {
        "id": "anthropic/claude-haiku-4.5",
        "name": "Claude Haiku 4.5 (latest)",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 1,
            "output": 5,
            "cacheRead": 0.1,
            "cacheWrite": 1.25
        },
        "contextWindow": 200000,
        "maxTokens": 64000
    },
    {
        "id": "xiaomi/mimo-v2-pro",
        "name": "MiMo V2 Pro",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 1,
            "output": 3,
            "cacheRead": 0.2,
            "cacheWrite": 0
        },
        "contextWindow": 1000000,
        "maxTokens": 256000
    },
    {
        "id": "z-ai/glm-4.6v",
        "name": "GLM-4.6V",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.3,
            "output": 0.9,
            "cacheRead": 0.055,
            "cacheWrite": 0
        },
        "contextWindow": 131072,
        "maxTokens": 32768
    },
    {
        "id": "google/gemini-3.1-flash-image-preview",
        "name": "Nano Banana 2",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.5,
            "output": 3,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 65536,
        "maxTokens": 65536
    },
    {
        "id": "anthropic/claude-opus-4.6",
        "name": "Claude Opus 4.6",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 5,
            "output": 25,
            "cacheRead": 0.5,
            "cacheWrite": 6.25
        },
        "contextWindow": 1000000,
        "maxTokens": 128000
    },
    {
        "id": "z-ai/glm-5.2",
        "name": "GLM-5.2",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.5,
            "output": 3.15,
            "cacheRead": 0.1,
            "cacheWrite": 0
        },
        "contextWindow": 1048576,
        "maxTokens": 131072
    },
    {
        "id": "openai/gpt-oss-120b",
        "name": "GPT OSS 120B",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.037,
            "output": 0.17,
            "cacheRead": 0.03,
            "cacheWrite": 0
        },
        "contextWindow": 131072,
        "maxTokens": 16384
    },
    {
        "id": "x-ai/grok-4.1-fast",
        "name": "x-AI/Grok-4.1-Fast",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0,
            "output": 0,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 2000000,
        "maxTokens": 2000000
    },
    {
        "id": "seed-2-0-mini-260428",
        "name": "seed-2-0-mini-260428",
        "reasoning": false,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0,
            "output": 0,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 4096,
        "maxTokens": 4096
    },
    {
        "id": "qwen/qwen3-coder-next",
        "name": "qwen/qwen3-coder-next",
        "reasoning": false,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.2,
            "output": 1.5,
            "cacheRead": 0.07,
            "cacheWrite": 0
        },
        "contextWindow": 262144,
        "maxTokens": 65536
    },
    {
        "id": "seed-2-0-code-preview-260328",
        "name": "seed-2-0-code-preview-260328",
        "reasoning": false,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0,
            "output": 0,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 4096,
        "maxTokens": 4096
    },
    {
        "id": "dreamina-seedance-2-5-hc",
        "name": "dreamina-seedance-2-5-hc",
        "reasoning": false,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0,
            "output": 0,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 4096,
        "maxTokens": 4096
    },
    {
        "id": "xiaomi/mimo-v2-flash",
        "name": "Xiaomi/Mimo-V2-Flash",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.1,
            "output": 0.3,
            "cacheRead": 0.01,
            "cacheWrite": 0
        },
        "contextWindow": 256000,
        "maxTokens": 256000
    },
    {
        "id": "google/gemini-3.1-flash-lite-image",
        "name": "Nano Banana 2 Lite",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.25,
            "output": 1.5,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 65536,
        "maxTokens": 65536
    },
    {
        "id": "openai/gpt-5.4-mini",
        "name": "GPT-5.4 mini",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.75,
            "output": 4.5,
            "cacheRead": 0.075,
            "cacheWrite": 0
        },
        "contextWindow": 400000,
        "maxTokens": 128000
    },
    {
        "id": "z-ai/glm-4.5-air",
        "name": "GLM-4.5-Air",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.13,
            "output": 0.85,
            "cacheRead": 0.025,
            "cacheWrite": 0
        },
        "contextWindow": 131072,
        "maxTokens": 98304
    },
    {
        "id": "mistralai/voxtral-small-24b-2507",
        "name": "Voxtral Small 24B 2507",
        "reasoning": false,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.1,
            "output": 0.3,
            "cacheRead": 0.01,
            "cacheWrite": 0
        },
        "contextWindow": 32000,
        "maxTokens": 32000
    },
    {
        "id": "nvidia/nemotron-3-super-120b-a12b",
        "name": "Nemotron 3 Super 120B",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.25,
            "output": 2.5,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 1000000,
        "maxTokens": 32000
    },
    {
        "id": "minimax/minimax-m2-her",
        "name": "MiniMax M2-her",
        "reasoning": false,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.3,
            "output": 1.2,
            "cacheRead": 0.03,
            "cacheWrite": 0
        },
        "contextWindow": 65536,
        "maxTokens": 2048
    },
    {
        "id": "google/gemini-embedding-2",
        "name": "Gemini Embedding 2",
        "reasoning": false,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0,
            "output": 0,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 0,
        "maxTokens": 0
    },
    {
        "id": "claude-haiku-4-5",
        "name": "Claude Haiku 4.5 (latest)",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.996,
            "output": 4.982,
            "cacheRead": 0.099,
            "cacheWrite": 1.186
        },
        "contextWindow": 200000,
        "maxTokens": 200000
    },
    {
        "id": "claude-opus-4-8-m-aws",
        "name": "claude-opus-4-8-m-aws",
        "reasoning": false,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0,
            "output": 0,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 4096,
        "maxTokens": 4096
    },
    {
        "id": "xiaomi/mimo-v2.5-pro",
        "name": "MiMo-V2.5-Pro",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.435,
            "output": 0.87,
            "cacheRead": 0.0036,
            "cacheWrite": 0
        },
        "contextWindow": 1050000,
        "maxTokens": 131072
    },
    {
        "id": "anthropic/claude-opus-5-fast",
        "name": "Claude Opus 5 (Fast)",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 10,
            "output": 50,
            "cacheRead": 1,
            "cacheWrite": 12.5
        },
        "contextWindow": 1000000,
        "maxTokens": 128000
    },
    {
        "id": "minimax/minimax-m2.7-highspeed",
        "name": "MiniMax-M2.7-highspeed",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.6,
            "output": 2.4,
            "cacheRead": 0.06,
            "cacheWrite": 0.375
        },
        "contextWindow": 204800,
        "maxTokens": 131072
    },
    {
        "id": "miromind/mirothinker-1-7-deepresearch-mini",
        "name": "miromind/mirothinker-1-7-deepresearch-mini",
        "reasoning": false,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0,
            "output": 0,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 4096,
        "maxTokens": 4096
    },
    {
        "id": "qwen/qwen3.5-122b-a10b",
        "name": "Qwen3.5 122B-A10B",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.29,
            "output": 2.4,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 262144,
        "maxTokens": 81920
    },
    {
        "id": "minimax/minimax-m2.7",
        "name": "MiniMax-M2.7",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.3,
            "output": 1.2,
            "cacheRead": 0.06,
            "cacheWrite": 0
        },
        "contextWindow": 204800,
        "maxTokens": 131072
    },
    {
        "id": "xiaomi/mimo-v2.5",
        "name": "MiMo-V2.5",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.14,
            "output": 0.28,
            "cacheRead": 0.0028,
            "cacheWrite": 0
        },
        "contextWindow": 1050000,
        "maxTokens": 131072
    },
    {
        "id": "ex/gpt-5.4",
        "name": "ex/gpt-5.4",
        "reasoning": false,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0,
            "output": 0,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 4096,
        "maxTokens": 4096
    },
    {
        "id": "mistralai/mistral-medium-3-5",
        "name": "Mistral Medium 3.5",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 1.5,
            "output": 7.5,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 262144,
        "maxTokens": 262144
    },
    {
        "id": "qwen/qwen3.7-plus",
        "name": "Qwen3.7 Plus",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.32,
            "output": 1.28,
            "cacheRead": 0.064,
            "cacheWrite": 0.4
        },
        "contextWindow": 1000000,
        "maxTokens": 131072
    },
    {
        "id": "anthropic/claude-opus-4.7",
        "name": "Claude Opus 4.7",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 5,
            "output": 25,
            "cacheRead": 0.5,
            "cacheWrite": 6.25
        },
        "contextWindow": 1000000,
        "maxTokens": 128000
    },
    {
        "id": "qwen/qwen3.5-35b-a3b",
        "name": "Qwen3.5 35B-A3B",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.25,
            "output": 1.25,
            "cacheRead": 0.25,
            "cacheWrite": 0
        },
        "contextWindow": 262144,
        "maxTokens": 262144
    },
    {
        "id": "openai/gpt-5.4-pro",
        "name": "GPT-5.4 Pro",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 30,
            "output": 180,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 1050000,
        "maxTokens": 128000
    },
    {
        "id": "stepfun/step-3.7-flash",
        "name": "Step 3.7 Flash",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.2,
            "output": 1.15,
            "cacheRead": 0.04,
            "cacheWrite": 0
        },
        "contextWindow": 262144,
        "maxTokens": 256000
    },
    {
        "id": "anthropic/claude-opus-4.5",
        "name": "Claude Opus 4.5 (latest)",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 5,
            "output": 25,
            "cacheRead": 0.5,
            "cacheWrite": 6.25
        },
        "contextWindow": 200000,
        "maxTokens": 64000
    },
    {
        "id": "mistralai/devstral-2512",
        "name": "Devstral 2",
        "reasoning": false,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0,
            "output": 0,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 262144,
        "maxTokens": 262144
    },
    {
        "id": "x-ai/grok-4.3",
        "name": "Grok 4.3",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 1.25,
            "output": 2.5,
            "cacheRead": 0.2,
            "cacheWrite": 0
        },
        "contextWindow": 1000000,
        "maxTokens": 1000000
    },
    {
        "id": "anthropic/claude-opus-4.7-fast",
        "name": "Claude Opus 4.7 (Fast)",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 30,
            "output": 150,
            "cacheRead": 3,
            "cacheWrite": 37.5
        },
        "contextWindow": 1000000,
        "maxTokens": 128000
    },
    {
        "id": "x-ai/grok-build-0.1",
        "name": "Grok Build 0.1",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 1,
            "output": 2,
            "cacheRead": 0.2,
            "cacheWrite": 0
        },
        "contextWindow": 256000,
        "maxTokens": 256000
    },
    {
        "id": "openai/gpt-5",
        "name": "OpenAI/GPT-5",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 1.25,
            "output": 10,
            "cacheRead": 0.125,
            "cacheWrite": 0
        },
        "contextWindow": 400000,
        "maxTokens": 128000
    },
    {
        "id": "anthropic/claude-sonnet-4.6",
        "name": "Claude Sonnet 4.6",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 3,
            "output": 15,
            "cacheRead": 0.3,
            "cacheWrite": 3.75
        },
        "contextWindow": 1000000,
        "maxTokens": 128000
    },
    {
        "id": "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
        "name": "Nemotron 3 Nano Omni (free)",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0,
            "output": 0,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 256000,
        "maxTokens": 65536
    },
    {
        "id": "deepseek/deepseek-v4-flash",
        "name": "DeepSeek V4 Flash",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.14,
            "output": 0.28,
            "cacheRead": 0.028,
            "cacheWrite": 0
        },
        "contextWindow": 1048576,
        "maxTokens": 128000
    },
    {
        "id": "sakana/fugu-ultra",
        "name": "Fugu Ultra",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 5,
            "output": 30,
            "cacheRead": 0.5,
            "cacheWrite": 0
        },
        "contextWindow": 1000000,
        "maxTokens": 128000
    },
    {
        "id": "openai/gpt-4o-mini",
        "name": "GPT-4o mini",
        "reasoning": false,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.15,
            "output": 0.6,
            "cacheRead": 0.08,
            "cacheWrite": 0
        },
        "contextWindow": 128000,
        "maxTokens": 16384
    },
    {
        "id": "z-ai/glm-4.6",
        "name": "Z-AI/GLM 4.6",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.5,
            "output": 2,
            "cacheRead": 0.09999999999999999,
            "cacheWrite": 0
        },
        "contextWindow": 200000,
        "maxTokens": 200000
    },
    {
        "id": "seed-2-0-lite-260428",
        "name": "seed-2-0-lite-260428",
        "reasoning": false,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0,
            "output": 0,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 4096,
        "maxTokens": 4096
    },
    {
        "id": "z-ai/glm-4.7",
        "name": "Z-Ai/GLM 4.7",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.39999999999999997,
            "output": 1.75,
            "cacheRead": 0.08,
            "cacheWrite": 0
        },
        "contextWindow": 200000,
        "maxTokens": 200000
    },
    {
        "id": "deepseek/deepseek-v4-flash-0731",
        "name": "DeepSeek V4 Flash 0731",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.08,
            "output": 0.18,
            "cacheRead": 0.016,
            "cacheWrite": 0
        },
        "contextWindow": 1048576,
        "maxTokens": 384000
    },
    {
        "id": "moonshotai/kimi-k2.6",
        "name": "Kimi K2.6",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.95,
            "output": 4,
            "cacheRead": 0.16,
            "cacheWrite": 0
        },
        "contextWindow": 262144,
        "maxTokens": 262144
    },
    {
        "id": "moonshotai/kimi-k2.5",
        "name": "Kimi K2.5",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.6,
            "output": 3,
            "cacheRead": 0.1,
            "cacheWrite": 0
        },
        "contextWindow": 256000,
        "maxTokens": 256000
    },
    {
        "id": "qwen/qwen3.5-flash",
        "name": "Qwen3.5 Flash",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.029,
            "output": 0.287,
            "cacheRead": 0.0058,
            "cacheWrite": 0
        },
        "contextWindow": 1000000,
        "maxTokens": 250000
    },
    {
        "id": "anthropic/claude-opus-5",
        "name": "Claude Opus 5",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 5,
            "output": 25,
            "cacheRead": 0.5,
            "cacheWrite": 6.25
        },
        "contextWindow": 1000000,
        "maxTokens": 128000
    },
    {
        "id": "minimax/minimax-m2.5",
        "name": "MiniMax-M2.5",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.3,
            "output": 1.2,
            "cacheRead": 0.03,
            "cacheWrite": 0
        },
        "contextWindow": 196000,
        "maxTokens": 195000
    },
    {
        "id": "qwen/qwen3.6-plus",
        "name": "Qwen3.6 Plus",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.325,
            "output": 1.95,
            "cacheRead": 0,
            "cacheWrite": 0.40625
        },
        "contextWindow": 1000000,
        "maxTokens": 65536
    },
    {
        "id": "xiaomi/mimo-v2-omni",
        "name": "MiMo V2 Omni",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.4,
            "output": 2,
            "cacheRead": 0.08,
            "cacheWrite": 0
        },
        "contextWindow": 265000,
        "maxTokens": 265000
    },
    {
        "id": "openai/gpt-5-mini",
        "name": "GPT-5 Mini",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.25,
            "output": 2,
            "cacheRead": 0.025,
            "cacheWrite": 0
        },
        "contextWindow": 400000,
        "maxTokens": 128000
    },
    {
        "id": "mistralai/mistral-small-2603",
        "name": "Mistral Small 4",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.15,
            "output": 0.6,
            "cacheRead": 0.015,
            "cacheWrite": 0
        },
        "contextWindow": 262144,
        "maxTokens": 262144
    },
    {
        "id": "minimax/minimax-m2.1",
        "name": "Minimax M2.1",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.3,
            "output": 1.2,
            "cacheRead": 0.03,
            "cacheWrite": 0
        },
        "contextWindow": 204800,
        "maxTokens": 131072
    },
    {
        "id": "anthropic/claude-opus-4.8",
        "name": "Claude Opus 4.8",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 5,
            "output": 25,
            "cacheRead": 0.5,
            "cacheWrite": 6.25
        },
        "contextWindow": 1000000,
        "maxTokens": 128000
    },
    {
        "id": "minimax/minimax-m2.1-highspeed",
        "name": "minimax/minimax-m2.1-highspeed",
        "reasoning": false,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0,
            "output": 0,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 4096,
        "maxTokens": 4096
    },
    {
        "id": "z-ai/glm-5",
        "name": "Z-Ai/GLM 5",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.95,
            "output": 2.5500000000000003,
            "cacheRead": 0.19999999999999998,
            "cacheWrite": 0
        },
        "contextWindow": 200000,
        "maxTokens": 128000
    }
];
