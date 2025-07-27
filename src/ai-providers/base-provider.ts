import { AIProvider, AIRequestOptions, AIResponse, AIProviderConfig, ModelInfo } from './types';

/**
 * Base AI Provider
 * Abstract base class for all AI providers
 */
export abstract class BaseAIProvider implements AIProvider {
  protected config: AIProviderConfig;
  protected requestCount: number = 0;
  protected lastRequestTime: number = 0;

  constructor(
    public name: string,
    config: AIProviderConfig
  ) {
    this.config = {
      timeout: 30000,
      maxRetries: 3,
      rateLimitPerMinute: 60,
      ...config
    };

    this.validateConfig();
  }

  protected abstract validateConfig(): void;

  abstract generateResponse(prompt: string, options?: AIRequestOptions): Promise<AIResponse>;

  abstract getTokenCount(text: string): number;

  abstract getMaxTokens(): number;

  protected async checkRateLimit(): Promise<void> {
    if (!this.config.rateLimitPerMinute) return;

    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const timeWindow = 60000; // 1 minute

    if (timeSinceLastRequest >= timeWindow) {
      this.requestCount = 0;
      this.lastRequestTime = now;
    }

    if (this.requestCount >= this.config.rateLimitPerMinute) {
      const waitTime = timeWindow - timeSinceLastRequest;
      console.log(`Rate limit reached. Waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.lastRequestTime = Date.now();
    }

    this.requestCount++;
  }

  protected async retryRequest<T>(
    fn: () => Promise<T>,
    retries: number = this.config.maxRetries || 3
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (i < retries - 1) {
          const delay = Math.pow(2, i) * 1000; // Exponential backoff
          console.log(`Request failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  getCostEstimate(inputTokens: number, outputTokens: number): number {
    const model = this.config.defaultModel || 'unknown';
    const modelInfo = this.getModelInfo(model);
    
    if (!modelInfo) {
      // Default cost estimate
      return (inputTokens * 0.001 + outputTokens * 0.002) / 1000;
    }

    return (
      (inputTokens * modelInfo.inputCostPer1k) / 1000 +
      (outputTokens * modelInfo.outputCostPer1k) / 1000
    );
  }

  protected abstract getModelInfo(model: string): ModelInfo | null;

  protected formatPrompt(prompt: string, options?: AIRequestOptions): string {
    if (options?.systemPrompt) {
      return `System: ${options.systemPrompt}\n\nUser: ${prompt}`;
    }
    return prompt;
  }

  protected validateOptions(options?: AIRequestOptions): AIRequestOptions {
    const defaults: AIRequestOptions = {
      temperature: 0.7,
      maxTokens: 1000,
      model: this.config.defaultModel,
      responseFormat: 'text'
    };

    return { ...defaults, ...options };
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.generateResponse('Hello', {
        maxTokens: 10
      });
      return !!response.content;
    } catch (error) {
      console.error(`${this.name} connection test failed:`, error);
      return false;
    }
  }
}