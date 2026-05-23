import type { TokenRouterProviderModel } from "./provider-config.js";

// Derived from TokenRouter /v1/models and enriched with models.dev, then OpenRouter metadata.
// Generated on 2026-05-23T05:45:11.536Z.
export const TOKENROUTER_MODELS: TokenRouterProviderModel[] = [
    {
        "id": "claude-haiku-4-5",
        "name": "claude-haiku-4-5",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 1,
            "output": 5,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 200000,
        "maxTokens": 64000
    },
    {
        "id": "google/gemini-3.5-flash",
        "name": "Gemini 3.5 Flash",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 1.5,
            "output": 9,
            "cacheRead": 0.15,
            "cacheWrite": 0.08333333333333334
        },
        "contextWindow": 1000000,
        "maxTokens": 64000
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
            "output": 0.4,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 262144,
        "maxTokens": 262144
    },
    {
        "id": "xiaomi/mimo-v2.5-pro",
        "name": "MiMo V2.5 Pro",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 1,
            "output": 3,
            "cacheRead": 0.19999999999999998,
            "cacheWrite": 0
        },
        "contextWindow": 1050000,
        "maxTokens": 131000
    },
    {
        "id": "minimax/minimax-m2.7-highspeed",
        "name": "MiniMax M2.7 High Speed",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.6,
            "output": 2.4,
            "cacheRead": 0.06,
            "cacheWrite": 0.375
        },
        "contextWindow": 204800,
        "maxTokens": 131100
    },
    {
        "id": "qwen/qwen3.7-max",
        "name": "Qwen3.7 Max",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 2.5,
            "output": 7.5,
            "cacheRead": 0,
            "cacheWrite": 3.125
        },
        "contextWindow": 1000000,
        "maxTokens": 65536
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
        "contextWindow": 1000000,
        "maxTokens": 384000
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
        "id": "qwen/qwen3.5-122b-a10b",
        "name": "Qwen3.5 122B A10B",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.4,
            "output": 3.2,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 262144,
        "maxTokens": 262144
    },
    {
        "id": "minimax/minimax-m2.7",
        "name": "Minimax M2.7",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.3,
            "output": 1.2,
            "cacheRead": 0.06,
            "cacheWrite": 0.375
        },
        "contextWindow": 204800,
        "maxTokens": 131000
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
            "cacheWrite": 0.325
        },
        "contextWindow": 1000000,
        "maxTokens": 65536
    },
    {
        "id": "xiaomi/mimo-v2.5",
        "name": "MiMo M2.5",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.39999999999999997,
            "output": 2,
            "cacheRead": 0.08,
            "cacheWrite": 0
        },
        "contextWindow": 1050000,
        "maxTokens": 131100
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
            "cacheRead": 0.18,
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
            "input": 0.27,
            "output": 0.4,
            "cacheRead": 0.22,
            "cacheWrite": 0
        },
        "contextWindow": 163842,
        "maxTokens": 8000
    },
    {
        "id": "qwen/qwen3.5-35b-a3b",
        "name": "Qwen3.5 35B A3B",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.25,
            "output": 1.3,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 262144,
        "maxTokens": 262144
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
        "id": "anthropic/claude-sonnet-4.5",
        "name": "Claude Sonnet 4.5",
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
        "id": "stepfun/step-3.5-flash",
        "name": "Step 3.5 Flash",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.1,
            "output": 0.3,
            "cacheRead": 0.02,
            "cacheWrite": 0
        },
        "contextWindow": 256000,
        "maxTokens": 64000
    },
    {
        "id": "google/gemini-3-flash-preview",
        "name": "Gemini 3 Flash Preview",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.5,
            "output": 3,
            "cacheRead": 0.05,
            "cacheWrite": 0.08333333333333334
        },
        "contextWindow": 1048576,
        "maxTokens": 65536
    },
    {
        "id": "z-ai/glm-5-turbo",
        "name": "GLM 5 Turbo",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.88,
            "output": 3.48,
            "cacheRead": 0.24,
            "cacheWrite": 0
        },
        "contextWindow": 200000,
        "maxTokens": 128000
    },
    {
        "id": "openai/gpt-5.4-pro",
        "name": "GPT 5.4 Pro",
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
        "id": "qwen/qwen3.5-397b-a17b",
        "name": "Qwen3.5 397B A17B",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.6,
            "output": 3.6,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 262144,
        "maxTokens": 262144
    },
    {
        "id": "anthropic/claude-opus-4.5",
        "name": "Claude Opus 4.5",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 5,
            "output": 25,
            "cacheRead": 0.5,
            "cacheWrite": 18.75
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
            "input": 0.4,
            "output": 2,
            "cacheRead": 0.04,
            "cacheWrite": 0
        },
        "contextWindow": 262144,
        "maxTokens": 262144
    },
    {
        "id": "anthropic/claude-sonnet-4",
        "name": "Claude Sonnet 4",
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
        "id": "tencent/hy3-preview",
        "name": "Hy3 preview",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.172,
            "output": 0.572,
            "cacheRead": 0.058,
            "cacheWrite": 0
        },
        "contextWindow": 256000,
        "maxTokens": 64000
    },
    {
        "id": "z-ai/glm-5.1",
        "name": "GLM-5.1",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.8781,
            "output": 3.5126,
            "cacheRead": 0.1903,
            "cacheWrite": 0
        },
        "contextWindow": 200000,
        "maxTokens": 131072
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
        "id": "anthropic/claude-haiku-4.5",
        "name": "Claude Haiku 4.5",
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
        "id": "openai/gpt-5.4",
        "name": "GPT 5.4",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 2.5,
            "output": 15,
            "cacheRead": 0.25,
            "cacheWrite": 0
        },
        "contextWindow": 1050000,
        "maxTokens": 128000
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
            "cacheRead": 0.19999999999999998,
            "cacheWrite": 0
        },
        "contextWindow": 1000000,
        "maxTokens": 128000
    },
    {
        "id": "z-ai/glm-4.6v",
        "name": "GLM 4.6V",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.14,
            "output": 0.42,
            "cacheRead": 0.03,
            "cacheWrite": 0
        },
        "contextWindow": 200000,
        "maxTokens": 64000
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
        "contextWindow": 1000000,
        "maxTokens": 384000
    },
    {
        "id": "google/gemini-3-pro-image-preview",
        "name": "Nano Banana Pro (Gemini 3 Pro Image Preview)",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 2,
            "output": 12,
            "cacheRead": 0.2,
            "cacheWrite": 0.375
        },
        "contextWindow": 65536,
        "maxTokens": 32768
    },
    {
        "id": "google/gemini-3.1-flash-image-preview",
        "name": "Gemini 3.1 Flash Image Preview (Nano Banana 2)",
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
        "contextWindow": 131072,
        "maxTokens": 32768
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
        "name": "GLM 4.6",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.35,
            "output": 1.54,
            "cacheRead": 0.07,
            "cacheWrite": 0
        },
        "contextWindow": 200000,
        "maxTokens": 64000
    },
    {
        "id": "openai/gpt-5.5",
        "name": "GPT 5.5",
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
        "id": "z-ai/glm-4.7",
        "name": "GLM 4.7",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.28,
            "output": 1.14,
            "cacheRead": 0.06,
            "cacheWrite": 0
        },
        "contextWindow": 200000,
        "maxTokens": 64000
    },
    {
        "id": "x-ai/grok-4.1-fast",
        "name": "Grok 4.1 Fast",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.2,
            "output": 0.5,
            "cacheRead": 0.05,
            "cacheWrite": 0
        },
        "contextWindow": 2000000,
        "maxTokens": 64000
    },
    {
        "id": "qwen/qwen3-coder-next",
        "name": "Qwen3 Coder Next",
        "reasoning": false,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.11,
            "output": 0.8,
            "cacheRead": 0.07,
            "cacheWrite": 0
        },
        "contextWindow": 262144,
        "maxTokens": 262144
    },
    {
        "id": "google/gemini-3.1-pro-preview",
        "name": "Gemini 3.1 Pro Preview",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 2,
            "output": 12,
            "cacheRead": 0.2,
            "cacheWrite": 0.375
        },
        "contextWindow": 1000000,
        "maxTokens": 64000
    },
    {
        "id": "xiaomi/mimo-v2-flash",
        "name": "MiMo V2 Flash",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.1,
            "output": 0.29,
            "cacheRead": 0.01,
            "cacheWrite": 0
        },
        "contextWindow": 262144,
        "maxTokens": 32000
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
            "input": 0.7,
            "output": 3.5,
            "cacheRead": 0.2,
            "cacheWrite": 0
        },
        "contextWindow": 262144,
        "maxTokens": 262144
    },
    {
        "id": "google/gemini-2.5-flash-image",
        "name": "Nano Banana (Gemini 2.5 Flash Image)",
        "reasoning": false,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.3,
            "output": 2.5,
            "cacheRead": 0.03,
            "cacheWrite": 0.08333333333333334
        },
        "contextWindow": 32768,
        "maxTokens": 32768
    },
    {
        "id": "qwen/qwen3.5-flash",
        "name": "Qwen3.5 Flash",
        "reasoning": false,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.1,
            "output": 0.4,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 1020000,
        "maxTokens": 1020000
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
            "input": 0.21,
            "output": 1,
            "cacheRead": 0.03,
            "cacheWrite": 0
        },
        "contextWindow": 262144,
        "maxTokens": 262144
    },
    {
        "id": "z-ai/glm-4.5-air",
        "name": "GLM 4.5 Air",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.11,
            "output": 0.56,
            "cacheRead": 0.02,
            "cacheWrite": 0
        },
        "contextWindow": 128000,
        "maxTokens": 64000
    },
    {
        "id": "minimax/minimax-m2.5",
        "name": "MiniMax M2.5",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.14,
            "output": 0.56,
            "cacheRead": 0.014,
            "cacheWrite": 0
        },
        "contextWindow": 1000000,
        "maxTokens": 131072
    },
    {
        "id": "qwen/qwen3.6-plus",
        "name": "Qwen3.6-Plus",
        "reasoning": true,
        "input": [
            "text",
            "image"
        ],
        "cost": {
            "input": 0.5,
            "output": 3,
            "cacheRead": 0.05,
            "cacheWrite": 0.625
        },
        "contextWindow": 1000000,
        "maxTokens": 64000
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
        "id": "nvidia/nemotron-3-super-120b-a12b",
        "name": "Nemotron-3-Super-120B-A12B",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.3,
            "output": 0.9,
            "cacheRead": 0,
            "cacheWrite": 0
        },
        "contextWindow": 256000,
        "maxTokens": 32768
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
        "id": "minimax/minimax-m2.1",
        "name": "MiniMax M2.1",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.3,
            "output": 1.2,
            "cacheRead": 0.03,
            "cacheWrite": 0.38
        },
        "contextWindow": 204800,
        "maxTokens": 131072
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
        "name": "GLM 5",
        "reasoning": true,
        "input": [
            "text"
        ],
        "cost": {
            "input": 0.58,
            "output": 2.6,
            "cacheRead": 0.14,
            "cacheWrite": 0
        },
        "contextWindow": 200000,
        "maxTokens": 128000
    }
];
