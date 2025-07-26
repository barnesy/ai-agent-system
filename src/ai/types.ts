/**
 * AI Provider Interface
 * Defines the contract for all AI model integrations
 */

export interface AIRequest {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
  };
  metadata?: Record<string, any>;
}

export interface AIProvider {
  name: string;
  
  /**
   * Check if the provider is properly configured
   */
  isConfigured(): boolean;
  
  /**
   * Send a request to the AI model
   */
  complete(request: AIRequest): Promise<AIResponse>;
  
  /**
   * Estimate cost for a request
   */
  estimateCost(request: AIRequest): number;
  
  /**
   * Get available models for this provider
   */
  getAvailableModels(): string[];
}

export interface AIProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  maxRetries?: number;
  timeout?: number;
}

export class AIError extends Error {
  constructor(
    message: string,
    public code: 'RATE_LIMIT' | 'INVALID_KEY' | 'NETWORK' | 'INVALID_REQUEST' | 'UNKNOWN',
    public provider: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'AIError';
  }
}