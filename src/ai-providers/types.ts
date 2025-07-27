/**
 * AI Provider Types and Interfaces
 */

export interface AIProvider {
  name: string;
  generateResponse(prompt: string, options?: AIRequestOptions): Promise<AIResponse>;
  streamResponse?(prompt: string, options?: AIRequestOptions): AsyncGenerator<string, void, unknown>;
  getTokenCount(text: string): number;
  getMaxTokens(): number;
  getCostEstimate(inputTokens: number, outputTokens: number): number;
  testConnection?(): Promise<boolean>;
}

export interface AIRequestOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  stream?: boolean;
  stopSequences?: string[];
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  responseFormat?: 'text' | 'json';
  tools?: AITool[];
}

export interface AIResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  cost: number;
  model: string;
  finishReason?: 'stop' | 'length' | 'tool_calls' | 'error';
  toolCalls?: AIToolCall[];
}

export interface AITool {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface AIToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

export interface AIProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  organization?: string;
  timeout?: number;
  maxRetries?: number;
  rateLimitPerMinute?: number;
}

export enum AIProviderType {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  MOCK = 'mock',
  CUSTOM = 'custom'
}

export interface ModelInfo {
  name: string;
  contextWindow: number;
  inputCostPer1k: number;
  outputCostPer1k: number;
  capabilities: string[];
}

export const MODEL_INFO: Record<string, ModelInfo> = {
  // OpenAI Models
  'gpt-4-turbo': {
    name: 'GPT-4 Turbo',
    contextWindow: 128000,
    inputCostPer1k: 0.01,
    outputCostPer1k: 0.03,
    capabilities: ['chat', 'function_calling', 'vision']
  },
  'gpt-4': {
    name: 'GPT-4',
    contextWindow: 8192,
    inputCostPer1k: 0.03,
    outputCostPer1k: 0.06,
    capabilities: ['chat', 'function_calling']
  },
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    contextWindow: 16384,
    inputCostPer1k: 0.0005,
    outputCostPer1k: 0.0015,
    capabilities: ['chat', 'function_calling']
  },
  
  // Anthropic Models
  'claude-3-opus': {
    name: 'Claude 3 Opus',
    contextWindow: 200000,
    inputCostPer1k: 0.015,
    outputCostPer1k: 0.075,
    capabilities: ['chat', 'vision']
  },
  'claude-3-sonnet': {
    name: 'Claude 3 Sonnet',
    contextWindow: 200000,
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.015,
    capabilities: ['chat', 'vision']
  },
  'claude-3-haiku': {
    name: 'Claude 3 Haiku',
    contextWindow: 200000,
    inputCostPer1k: 0.00025,
    outputCostPer1k: 0.00125,
    capabilities: ['chat']
  }
};