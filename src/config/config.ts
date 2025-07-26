export class ConfigManager {
  private config = {
    ai: {
      defaultProvider: 'mock',
      providers: {}
    },
    features: {
      telemetry: false,
      autoUpdate: true
    }
  };

  get() {
    return this.config;
  }

  update(updates: any) {
    this.config = { ...this.config, ...updates };
  }

  getApiKey(provider: string): string | undefined {
    return process.env[`${provider.toUpperCase()}_API_KEY`];
  }

  setApiKey(provider: string, key: string) {
    // In real implementation, this would save to config file
    console.log(`API key set for ${provider}`);
  }
}

export const config = new ConfigManager();