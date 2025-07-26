import { AIProvider, AIRequest, AIResponse, AIError } from './types';
import { MockAIProvider } from './providers/mock-provider';

/**
 * AI Adapter - Manages AI providers and routes requests
 */
export class AIAdapter {
  private providers: Map<string, AIProvider> = new Map();
  private defaultProvider: string = 'mock';

  constructor() {
    // Register default mock provider
    this.registerProvider(new MockAIProvider());
  }

  /**
   * Register a new AI provider
   */
  registerProvider(provider: AIProvider): void {
    if (!provider.isConfigured()) {
      console.warn(`Provider ${provider.name} is not properly configured`);
    }
    this.providers.set(provider.name, provider);
  }

  /**
   * Set the default provider
   */
  setDefaultProvider(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`Provider ${name} not registered`);
    }
    this.defaultProvider = name;
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys()).filter(name => {
      const provider = this.providers.get(name);
      return provider?.isConfigured();
    });
  }

  /**
   * Send a request to the AI
   */
  async complete(request: AIRequest, providerName?: string): Promise<AIResponse> {
    const provider = this.selectProvider(providerName);
    
    try {
      const response = await provider.complete(request);
      
      // Log usage for monitoring
      this.logUsage(provider.name, response);
      
      return response;
    } catch (error: any) {
      // Wrap errors in AIError if not already
      if (!(error instanceof AIError)) {
        throw new AIError(
          error.message || 'Unknown error',
          'UNKNOWN',
          provider.name,
          false
        );
      }
      throw error;
    }
  }

  /**
   * Estimate cost for a request
   */
  estimateCost(request: AIRequest, providerName?: string): number {
    const provider = this.selectProvider(providerName);
    return provider.estimateCost(request);
  }

  /**
   * Select the best provider for a request
   */
  private selectProvider(preferredProvider?: string): AIProvider {
    // Use preferred provider if specified and available
    if (preferredProvider && this.providers.has(preferredProvider)) {
      const provider = this.providers.get(preferredProvider)!;
      if (provider.isConfigured()) {
        return provider;
      }
    }

    // Use default provider
    const defaultProvider = this.providers.get(this.defaultProvider);
    if (defaultProvider && defaultProvider.isConfigured()) {
      return defaultProvider;
    }

    // Find any configured provider
    for (const provider of this.providers.values()) {
      if (provider.isConfigured()) {
        return provider;
      }
    }

    throw new Error('No configured AI providers available');
  }

  /**
   * Log usage for monitoring and cost tracking
   */
  private logUsage(provider: string, response: AIResponse): void {
    const usage = {
      timestamp: new Date().toISOString(),
      provider,
      model: response.model,
      ...response.usage
    };
    
    // In production, this would send to a metrics service
    if (process.env.NODE_ENV === 'development') {
      console.log('AI Usage:', usage);
    }
  }

  /**
   * Create request with agent-specific context
   */
  createAgentRequest(
    agentName: string,
    task: string,
    context?: any,
    systemPrompt?: string
  ): AIRequest {
    const messages = [];

    // Add system prompt if provided
    if (systemPrompt) {
      messages.push({
        role: 'system' as const,
        content: systemPrompt
      });
    }

    // Add context if provided
    if (context) {
      messages.push({
        role: 'user' as const,
        content: `Context:\n${JSON.stringify(context, null, 2)}`
      });
    }

    // Add the main task
    messages.push({
      role: 'user' as const,
      content: task
    });

    return {
      messages,
      temperature: 0.7,
      maxTokens: 2000
    };
  }
}

// Singleton instance
export const aiAdapter = new AIAdapter();