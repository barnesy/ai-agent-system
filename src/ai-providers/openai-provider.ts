import { BaseAIProvider } from './base-provider';
import { AIRequestOptions, AIResponse, AIProviderConfig, MODEL_INFO, ModelInfo } from './types';

/**
 * OpenAI Provider
 * Integrates with OpenAI's GPT models
 */
export class OpenAIProvider extends BaseAIProvider {
  private apiUrl: string;

  constructor(config: AIProviderConfig) {
    super('OpenAI', config);
    this.apiUrl = config.baseUrl || 'https://api.openai.com/v1';
  }

  protected validateConfig(): void {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key is required');
    }
  }

  async generateResponse(prompt: string, options?: AIRequestOptions): Promise<AIResponse> {
    await this.checkRateLimit();
    
    const validatedOptions = this.validateOptions(options);
    const messages = this.buildMessages(prompt, validatedOptions);

    return this.retryRequest(async () => {
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          ...(this.config.organization && { 'OpenAI-Organization': this.config.organization })
        },
        body: JSON.stringify({
          model: validatedOptions.model || 'gpt-3.5-turbo',
          messages,
          temperature: validatedOptions.temperature,
          max_tokens: validatedOptions.maxTokens,
          top_p: validatedOptions.topP,
          frequency_penalty: validatedOptions.frequencyPenalty,
          presence_penalty: validatedOptions.presencePenalty,
          stop: validatedOptions.stopSequences,
          response_format: validatedOptions.responseFormat === 'json' 
            ? { type: 'json_object' } 
            : undefined,
          tools: validatedOptions.tools?.map(tool => ({
            type: 'function',
            function: {
              name: tool.name,
              description: tool.description,
              parameters: tool.parameters
            }
          }))
        }),
        signal: AbortSignal.timeout(this.config.timeout || 30000)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${error}`);
      }

      const data: any = await response.json();
      const choice = data.choices[0];
      
      return {
        content: choice.message.content || '',
        usage: {
          inputTokens: data.usage.prompt_tokens,
          outputTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        },
        cost: this.getCostEstimate(data.usage.prompt_tokens, data.usage.completion_tokens),
        model: data.model,
        finishReason: choice.finish_reason,
        toolCalls: choice.message.tool_calls?.map((tc: any) => ({
          id: tc.id,
          name: tc.function.name,
          arguments: JSON.parse(tc.function.arguments)
        }))
      };
    });
  }

  async *streamResponse(prompt: string, options?: AIRequestOptions): AsyncGenerator<string, void, unknown> {
    await this.checkRateLimit();
    
    const validatedOptions = this.validateOptions(options);
    const messages = this.buildMessages(prompt, validatedOptions);

    const response = await fetch(`${this.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        ...(this.config.organization && { 'OpenAI-Organization': this.config.organization })
      },
      body: JSON.stringify({
        model: validatedOptions.model || 'gpt-3.5-turbo',
        messages,
        temperature: validatedOptions.temperature,
        max_tokens: validatedOptions.maxTokens,
        stream: true
      }),
      signal: AbortSignal.timeout(this.config.timeout || 30000)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
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
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) yield content;
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  getTokenCount(text: string): number {
    // Rough estimation - OpenAI uses tiktoken
    // For accurate counts, you'd need to use the tiktoken library
    return Math.ceil(text.length / 4);
  }

  getMaxTokens(): number {
    const model = this.config.defaultModel || 'gpt-3.5-turbo';
    const modelInfo = this.getModelInfo(model);
    return modelInfo?.contextWindow || 4096;
  }

  protected getModelInfo(model: string): ModelInfo | null {
    return MODEL_INFO[model] || null;
  }

  private buildMessages(prompt: string, options: AIRequestOptions): any[] {
    const messages = [];

    if (options.systemPrompt) {
      messages.push({
        role: 'system',
        content: options.systemPrompt
      });
    }

    messages.push({
      role: 'user',
      content: prompt
    });

    return messages;
  }
}