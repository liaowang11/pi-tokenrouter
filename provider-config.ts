export const BASE_URL = "https://api.tokenrouter.com/v1";
export const PROVIDER_NAME = "tokenrouter";
export const PROVIDER_DISPLAY_NAME = "TokenRouter";
export const PROVIDER_API_KEY_ENV = "TOKENROUTER_API_KEY";

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

export function createTokenRouterProviderConfig(models: TokenRouterProviderModel[]) {
    return {
        name: PROVIDER_DISPLAY_NAME,
        baseUrl: BASE_URL,
        api: "openai-completions" as const,
        apiKey: PROVIDER_API_KEY_ENV,
        authHeader: true,
        models,
    };
}
