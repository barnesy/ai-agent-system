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
}