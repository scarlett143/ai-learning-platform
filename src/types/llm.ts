/**
 * Multi-Provider LLM Gateway Contracts
 * Matching PROJECT.md § Interface Contracts
 */

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  speed?: 'instant' | 'realistic';
}

export interface ILLMClient {
  streamText(
    prompt: string,
    onToken: (chunk: string) => void,
    options?: LLMOptions
  ): Promise<string>;
  generateJSON<T>(prompt: string, systemPrompt?: string): Promise<T>;
  getProviderName(): 'openai' | 'anthropic' | 'gemini' | 'mock';
}
