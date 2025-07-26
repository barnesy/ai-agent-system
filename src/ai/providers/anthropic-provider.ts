import { BaseAIProvider } from './base-provider';
import { AIRequest, AIResponse, AIError, AIProviderConfig } from '../types';
import { config } from '../../config/config';

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AnthropicRequest {
  model: string;
  messages: AnthropicMessage[];
  max_tokens: number;
  temperature?: number;
  system?: string;
}

interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Anthropic Claude AI Provider
 */
export class AnthropicProvider extends BaseAIProvider {
  private baseUrl: string;

  constructor(config?: AIProviderConfig) {
    super('anthropic', config || {});
    this.baseUrl = this.config.baseUrl || 'https://api.anthropic.com/v1';
  }

  isConfigured(): boolean {
    return !!this.getApiKey();
  }

  async complete(request: AIRequest): Promise<AIResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new AIError(
        'Anthropic API key not configured',
        'INVALID_KEY',
        this.name,
        false
      );
    }

    const anthropicRequest = this.formatMessages(request);

    try {
      const response = await this.withRetry(async () => {
        const res = await fetch(`${this.baseUrl}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify(anthropicRequest)
        });

        if (!res.ok) {
          const error = await res.json();
          throw this.handleApiError(error, res.status);
        }

        return res.json() as Promise<AnthropicResponse>;
      });

      return this.formatResponse(response, request);
    } catch (error: any) {
      if (error instanceof AIError) {
        throw error;
      }
      
      throw new AIError(
        `Anthropic API error: ${error.message}`,
        'UNKNOWN',
        this.name,
        false
      );
    }
  }

  estimateCost(request: AIRequest): number {
    const model = request.model || this.config.defaultModel || 'claude-3-sonnet-20240229';
    const inputTokens = this.estimateTokens(
      request.messages.map(m => m.content).join(' ')
    );
    const outputTokens = request.maxTokens || 2000;

    // Pricing per 1K tokens (as of 2024)
    const pricing: Record<string, { input: number; output: number }> = {
      'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
      'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
      'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 }
    };

    const modelPricing = pricing[model] || pricing['claude-3-sonnet-20240229'];
    
    return (
      (inputTokens / 1000) * modelPricing.input +
      (outputTokens / 1000) * modelPricing.output
    );
  }

  getAvailableModels(): string[] {
    return [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307'
    ];
  }

  protected formatMessages(request: AIRequest): AnthropicRequest {
    const messages: AnthropicMessage[] = [];
    let systemPrompt: string | undefined;

    // Extract system prompt and convert messages
    for (const msg of request.messages) {
      if (msg.role === 'system') {
        systemPrompt = msg.content;
      } else {
        messages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        });
      }
    }

    return {
      model: request.model || this.config.defaultModel || 'claude-3-sonnet-20240229',
      messages,
      max_tokens: request.maxTokens || 2000,
      temperature: request.temperature,
      system: systemPrompt || request.systemPrompt
    };
  }

  private formatResponse(response: AnthropicResponse, request: AIRequest): AIResponse {
    const content = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');

    const costEstimate = this.calculateActualCost(
      response.usage.input_tokens,
      response.usage.output_tokens,
      response.model
    );

    return {
      content,
      model: response.model,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        cost: costEstimate
      },
      metadata: {
        provider: this.name,
        requestId: response.id
      }
    };
  }

  private calculateActualCost(inputTokens: number, outputTokens: number, model: string): number {
    const pricing: Record<string, { input: number; output: number }> = {
      'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
      'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
      'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 }
    };

    const modelPricing = pricing[model] || pricing['claude-3-sonnet-20240229'];
    
    return (
      (inputTokens / 1000) * modelPricing.input +
      (outputTokens / 1000) * modelPricing.output
    );
  }

  private getApiKey(): string | undefined {
    return config.getApiKey('anthropic');
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