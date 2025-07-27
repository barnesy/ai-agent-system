import { AIProvider, AIProviderType, AIProviderConfig } from './types';
import { OpenAIProvider } from './openai-provider';
import { AnthropicProvider } from './anthropic-provider';
import { MockAIProviderEnhanced } from './mock-provider-enhanced';

/**
 * AI Provider Factory
 * Creates and manages AI provider instances
 */
export class AIProviderFactory {
  private static providers: Map<string, AIProvider> = new Map();

  static createProvider(type: AIProviderType, config: AIProviderConfig): AIProvider {
    const key = `${type}-${config.apiKey || 'default'}`;
    
    // Return existing provider if already created
    if (this.providers.has(key)) {
      return this.providers.get(key)!;
    }

    let provider: AIProvider;

    switch (type) {
      case AIProviderType.OPENAI:
        provider = new OpenAIProvider(config);
        break;
      
      case AIProviderType.ANTHROPIC:
        provider = new AnthropicProvider(config);
        break;
      
      case AIProviderType.MOCK:
        provider = new MockAIProviderEnhanced(config);
        break;
      
      default:
        throw new Error(`Unknown provider type: ${type}`);
    }

    this.providers.set(key, provider);
    return provider;
  }

  static getProvider(type: AIProviderType): AIProvider | null {
    for (const [key, provider] of this.providers.entries()) {
      if (key.startsWith(type)) {
        return provider;
      }
    }
    return null;
  }

  static clearProviders(): void {
    this.providers.clear();
  }

  static async testAllProviders(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const [key, provider] of this.providers.entries()) {
      console.log(`Testing ${provider.name}...`);
      results[key] = provider.testConnection ? await provider.testConnection() : false;
    }

    return results;
  }
}

/**
 * Get provider from environment configuration
 */
export function getProviderFromEnv(): AIProvider {
  const providerType = process.env.AI_PROVIDER || 'mock';
  
  const config: AIProviderConfig = {
    apiKey: process.env.AI_API_KEY,
    baseUrl: process.env.AI_BASE_URL,
    defaultModel: process.env.AI_MODEL,
    organization: process.env.AI_ORGANIZATION,
    timeout: parseInt(process.env.AI_TIMEOUT || '30000'),
    maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3'),
    rateLimitPerMinute: parseInt(process.env.AI_RATE_LIMIT || '60')
  };

  // Use mock provider if no API key is provided
  if (!config.apiKey && providerType !== 'mock') {
    console.warn('No API key provided, using mock provider');
    return AIProviderFactory.createProvider(AIProviderType.MOCK, {});
  }

  return AIProviderFactory.createProvider(providerType as AIProviderType, config);
}

/**
 * Configuration helper
 */
export class AIProviderConfigManager {
  private static CONFIG_FILE = '.ai-config.json';

  static async loadConfig(): Promise<Record<string, AIProviderConfig>> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const configPath = path.join(process.cwd(), this.CONFIG_FILE);
      
      const data = await fs.readFile(configPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return {};
    }
  }

  static async saveConfig(configs: Record<string, AIProviderConfig>): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const configPath = path.join(process.cwd(), this.CONFIG_FILE);
    
    // Remove sensitive data before saving
    const sanitized = Object.entries(configs).reduce((acc, [key, config]) => {
      acc[key] = {
        ...config,
        apiKey: config.apiKey ? '***' : undefined
      };
      return acc;
    }, {} as Record<string, AIProviderConfig>);

    await fs.writeFile(configPath, JSON.stringify(sanitized, null, 2));
  }

  static getDefaultConfig(type: AIProviderType): AIProviderConfig {
    switch (type) {
      case AIProviderType.OPENAI:
        return {
          defaultModel: 'gpt-3.5-turbo',
          maxRetries: 3,
          timeout: 30000,
          rateLimitPerMinute: 60
        };
      
      case AIProviderType.ANTHROPIC:
        return {
          defaultModel: 'claude-3-haiku-20240307',
          maxRetries: 3,
          timeout: 30000,
          rateLimitPerMinute: 60
        };
      
      default:
        return {};
    }
  }
}