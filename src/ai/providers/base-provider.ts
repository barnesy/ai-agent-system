import { AIProvider, AIProviderConfig, AIRequest, AIResponse, AIError } from '../types';

export abstract class BaseAIProvider implements AIProvider {
  protected config: AIProviderConfig;
  
  constructor(
    public name: string,
    config: AIProviderConfig
  ) {
    this.config = config;
  }

  abstract isConfigured(): boolean;
  abstract complete(request: AIRequest): Promise<AIResponse>;
  abstract estimateCost(request: AIRequest): number;
  abstract getAvailableModels(): string[];

  /**
   * Retry logic for transient failures
   */
  protected async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.config.maxRetries || 3
  ): Promise<T> {
    let lastError: any;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        // Don't retry non-retryable errors
        if (error instanceof AIError && !error.retryable) {
          throw error;
        }
        
        // Exponential backoff
        if (i < maxRetries - 1) {
          const delay = Math.min(1000 * Math.pow(2, i), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Calculate token count (approximate)
   */
  protected estimateTokens(text: string): number {
    // Rough approximation: 1 token ~= 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Format messages for the specific provider
   */
  protected abstract formatMessages(request: AIRequest): any;
}