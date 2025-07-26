import { BaseAIProvider } from './base-provider';
import { AIRequest, AIResponse, AIError, AIProviderConfig } from '../types';
import { config } from '../../config/config';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  max_tokens?: number;
  temperature?: number;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * OpenAI GPT Provider
 */
export class OpenAIProvider extends BaseAIProvider {
  private baseUrl: string;

  constructor(config?: AIProviderConfig) {
    super('openai', config || {});
    this.baseUrl = this.config.baseUrl || 'https://api.openai.com/v1';
  }

  isConfigured(): boolean {
    return !!this.getApiKey();
  }

  async complete(request: AIRequest): Promise<AIResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new AIError(
        'OpenAI API key not configured',
        'INVALID_KEY',
        this.name,
        false
      );
    }

    const openaiRequest = this.formatMessages(request);

    try {
      const response = await this.withRetry(async () => {
        const res = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(openaiRequest)
        });

        if (!res.ok) {
          const error = await res.json();
          throw this.handleApiError(error, res.status);
        }

        return res.json() as Promise<OpenAIResponse>;
      });

      return this.formatResponse(response, request);
    } catch (error: any) {
      if (error instanceof AIError) {
        throw error;
      }
      
      throw new AIError(
        `OpenAI API error: ${error.message}`,
        'UNKNOWN',
        this.name,
        false
      );
    }
  }

  estimateCost(request: AIRequest): number {
    const model = request.model || this.config.defaultModel || 'gpt-4-turbo-preview';
    const inputTokens = this.estimateTokens(
      request.messages.map(m => m.content).join(' ')
    );
    const outputTokens = request.maxTokens || 2000;

    // Pricing per 1K tokens (as of 2024)
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }
    };

    const modelPricing = pricing[model] || pricing['gpt-4-turbo-preview'];
    
    return (
      (inputTokens / 1000) * modelPricing.input +
      (outputTokens / 1000) * modelPricing.output
    );
  }

  getAvailableModels(): string[] {
    return [
      'gpt-4-turbo-preview',
      'gpt-4',
      'gpt-3.5-turbo'
    ];
  }

  protected formatMessages(request: AIRequest): OpenAIRequest {
    const messages: OpenAIMessage[] = [];

    // Add system prompt if provided
    if (request.systemPrompt) {
      messages.push({
        role: 'system',
        content: request.systemPrompt
      });
    }

    // Add all messages
    messages.push(...request.messages);

    return {
      model: request.model || this.config.defaultModel || 'gpt-4-turbo-preview',
      messages,
      max_tokens: request.maxTokens,
      temperature: request.temperature
    };
  }

  private formatResponse(response: OpenAIResponse, request: AIRequest): AIResponse {
    const choice = response.choices[0];
    const content = choice.message.content;

    const costEstimate = this.calculateActualCost(
      response.usage.prompt_tokens,
      response.usage.completion_tokens,
      response.model
    );

    return {
      content,
      model: response.model,
      usage: {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
        cost: costEstimate
      },
      metadata: {
        provider: this.name,
        requestId: response.id,
        finishReason: choice.finish_reason
      }
    };
  }

  private calculateActualCost(inputTokens: number, outputTokens: number, model: string): number {
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }
    };

    // Handle model variations
    const baseModel = Object.keys(pricing).find(key => model.startsWith(key)) || 'gpt-4-turbo-preview';
    const modelPricing = pricing[baseModel];
    
    return (
      (inputTokens / 1000) * modelPricing.input +
      (outputTokens / 1000) * modelPricing.output
    );
  }

  private getApiKey(): string | undefined {
    return config.getApiKey('openai');
  }

  private handleApiError(error: any, status: number): never {
    const message = error.error?.message || error.message || 'Unknown error';
    
    switch (status) {
      case 401:
        throw new AIError(message, 'INVALID_KEY', this.name, false);
      case 429:
        throw new AIError(message, 'RATE_LIMIT', this.name, true);
      case 400:
        throw new AIError(message, 'INVALID_REQUEST', this.name, false);
      default:
        throw new AIError(message, 'NETWORK', this.name, true);
    }
  }
}