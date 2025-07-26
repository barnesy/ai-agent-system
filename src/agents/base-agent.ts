export interface AgentMessage {
  from: string;
  to: string;
  type: 'request' | 'response' | 'event';
  payload: {
    task: string;
    context?: any;
    priority: 'high' | 'medium' | 'low';
    constraints?: string[];
  };
  timestamp: Date;
}

export interface AgentCapabilities {
  canHandle: (task: string) => boolean;
  estimateTime: (task: string) => number;
  dependencies: string[];
}

export abstract class BaseAgent {
  protected name: string;
  protected capabilities: AgentCapabilities;
  protected useAI: boolean = false;

  constructor(name: string, capabilities: AgentCapabilities) {
    this.name = name;
    this.capabilities = capabilities;
  }

  abstract execute(message: AgentMessage): Promise<AgentMessage>;

  canHandle(task: string): boolean {
    return this.capabilities.canHandle(task);
  }

  getName(): string {
    return this.name;
  }

  /**
   * Enable AI for this agent
   */
  enableAI(): void {
    this.useAI = true;
  }

  /**
   * Get system prompt for this agent
   * Override this to provide agent-specific prompts
   */
  protected getSystemPrompt(): string {
    return `You are the ${this.name}, a specialized AI agent in a modular system.
Your role is to handle tasks related to your specialization with expertise and precision.`;
  }
}