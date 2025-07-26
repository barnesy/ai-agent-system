import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface Config {
  ai: {
    defaultProvider: string;
    providers: {
      anthropic?: {
        apiKey: string;
        model?: string;
      };
      openai?: {
        apiKey: string;
        model?: string;
      };
    };
  };
  features: {
    telemetry: boolean;
    autoUpdate: boolean;
  };
}

class ConfigManager {
  private config: Config;
  private configPath: string;

  constructor() {
    this.configPath = this.getConfigPath();
    this.config = this.loadConfig();
  }

  /**
   * Get the configuration
   */
  get(): Config {
    return this.config;
  }

  /**
   * Update configuration
   */
  update(updates: Partial<Config>): void {
    this.config = this.deepMerge(this.config, updates);
    this.saveConfig();
  }

  /**
   * Get API key for a provider
   */
  getApiKey(provider: 'anthropic' | 'openai'): string | undefined {
    // Check environment variables first
    const envKey = provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY';
    const envValue = process.env[envKey];
    if (envValue) return envValue;

    // Check config file
    return this.config.ai.providers[provider]?.apiKey;
  }

  /**
   * Set API key for a provider
   */
  setApiKey(provider: 'anthropic' | 'openai', apiKey: string): void {
    if (!this.config.ai.providers[provider]) {
      this.config.ai.providers[provider] = { apiKey };
    } else {
      this.config.ai.providers[provider]!.apiKey = apiKey;
    }
    this.saveConfig();
  }

  /**
   * Get config file path
   */
  private getConfigPath(): string {
    const configDir = path.join(os.homedir(), '.ai-agent-system');
    
    // Create config directory if it doesn't exist
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    return path.join(configDir, 'config.json');
  }

  /**
   * Load configuration from file
   */
  private loadConfig(): Config {
    const defaultConfig: Config = {
      ai: {
        defaultProvider: 'mock',
        providers: {}
      },
      features: {
        telemetry: false,
        autoUpdate: true
      }
    };

    try {
      if (fs.existsSync(this.configPath)) {
        const fileContent = fs.readFileSync(this.configPath, 'utf-8');
        const fileConfig = JSON.parse(fileContent);
        return this.deepMerge(defaultConfig, fileConfig);
      }
    } catch (error) {
      console.warn('Failed to load config file, using defaults:', error);
    }

    return defaultConfig;
  }

  /**
   * Save configuration to file
   */
  private saveConfig(): void {
    try {
      // Don't save API keys to file - they should be in env vars
      const configToSave = JSON.parse(JSON.stringify(this.config));
      
      // Remove sensitive data
      if (configToSave.ai.providers.anthropic?.apiKey) {
        configToSave.ai.providers.anthropic.apiKey = '<set via environment>';
      }
      if (configToSave.ai.providers.openai?.apiKey) {
        configToSave.ai.providers.openai.apiKey = '<set via environment>';
      }

      fs.writeFileSync(
        this.configPath,
        JSON.stringify(configToSave, null, 2)
      );
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  /**
   * Deep merge objects
   */
  private deepMerge(target: any, source: any): any {
    const output = { ...target };
    
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            output[key] = source[key];
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          output[key] = source[key];
        }
      });
    }
    
    return output;
  }

  private isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
  }
}

// Singleton instance
export const config = new ConfigManager();