import { BaseAIProvider } from './base-provider';
import { AIRequestOptions, AIResponse, AIProviderConfig, MODEL_INFO, ModelInfo } from './types';

/**
 * Anthropic Provider
 * Integrates with Anthropic's Claude models
 */
export class AnthropicProvider extends BaseAIProvider {
  private apiUrl: string;
  private anthropicVersion = '2023-06-01';

  constructor(config: AIProviderConfig) {
    super('Anthropic', config);
    this.apiUrl = config.baseUrl || 'https://api.anthropic.com/v1';
  }

  protected validateConfig(): void {
    if (!this.config.apiKey) {
      throw new Error('Anthropic API key is required');
    }
  }

  async generateResponse(prompt: string, options?: AIRequestOptions): Promise<AIResponse> {
    await this.checkRateLimit();
    
    const validatedOptions = this.validateOptions(options);

    return this.retryRequest(async () => {
      const response = await fetch(`${this.apiUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey!,
          'anthropic-version': this.anthropicVersion
        },
        body: JSON.stringify({
          model: validatedOptions.model || 'claude-3-haiku-20240307',
          messages: [{
            role: 'user',
            content: prompt
          }],
          system: validatedOptions.systemPrompt,
          max_tokens: validatedOptions.maxTokens || 1000,
          temperature: validatedOptions.temperature,
          top_p: validatedOptions.topP,
          stop_sequences: validatedOptions.stopSequences
        }),
        signal: AbortSignal.timeout(this.config.timeout || 30000)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Anthropic API error: ${response.status} - ${error}`);
      }

      const data: any = await response.json();
      
      // Calculate token counts (Anthropic provides these in the response)
      const inputTokens = data.usage?.input_tokens || this.getTokenCount(prompt);
      const outputTokens = data.usage?.output_tokens || this.getTokenCount(data.content[0]?.text || '');

      return {
        content: data.content[0]?.text || '',
        usage: {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens
        },
        cost: this.getCostEstimate(inputTokens, outputTokens),
        model: data.model,
        finishReason: data.stop_reason
      };
    });
  }

  async *streamResponse(prompt: string, options?: AIRequestOptions): AsyncGenerator<string, void, unknown> {
    await this.checkRateLimit();
    
    const validatedOptions = this.validateOptions(options);

    const response = await fetch(`${this.apiUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey!,
        'anthropic-version': this.anthropicVersion
      },
      body: JSON.stringify({
        model: validatedOptions.model || 'claude-3-haiku-20240307',
        messages: [{
          role: 'user',
          content: prompt
        }],
        system: validatedOptions.systemPrompt,
        max_tokens: validatedOptions.maxTokens || 1000,
        temperature: validatedOptions.temperature,
        stream: true
      }),
      signal: AbortSignal.timeout(this.config.timeout || 30000)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          try {
            const parsed = JSON.parse(data);
            
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              yield parsed.delta.text;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  getTokenCount(text: string): number {
    // Claude uses a similar tokenization to GPT models
    // This is a rough estimate
    return Math.ceil(text.length / 3.5);
  }

  getMaxTokens(): number {
    const model = this.config.defaultModel || 'claude-3-haiku-20240307';
    const modelInfo = this.getModelInfo(model);
    return modelInfo?.contextWindow || 200000;
  }

  protected getModelInfo(model: string): ModelInfo | null {
    // Map Anthropic model names to our simplified names
    const modelMap: Record<string, string> = {
      'claude-3-opus-20240229': 'claude-3-opus',
      'claude-3-sonnet-20240229': 'claude-3-sonnet',
      'claude-3-haiku-20240307': 'claude-3-haiku'
    };

    const simplifiedName = modelMap[model] || model;
    return MODEL_INFO[simplifiedName] || null;
  }
}