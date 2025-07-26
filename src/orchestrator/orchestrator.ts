import { BaseAgent, AgentMessage } from '../agents/base-agent';

export class Orchestrator {
  private agents: Map<string, BaseAgent> = new Map();
  private messageQueue: AgentMessage[] = [];

  registerAgent(agent: BaseAgent): void {
    this.agents.set(agent.getName(), agent);
  }

  async processTask(task: string, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<any> {
    // Find capable agents
    const capableAgents = Array.from(this.agents.values())
      .filter(agent => agent.canHandle(task));

    if (capableAgents.length === 0) {
      throw new Error(`No agent capable of handling task: ${task}`);
    }

    // For now, use the first capable agent
    const selectedAgent = capableAgents[0];

    const message: AgentMessage = {
      from: 'orchestrator',
      to: selectedAgent.getName(),
      type: 'request',
      payload: {
        task,
        priority,
      },
      timestamp: new Date()
    };

    const response = await selectedAgent.execute(message);
    return response.payload;
  }

  async processWorkflow(workflow: string[]): Promise<any[]> {
    const results = [];
    
    for (const task of workflow) {
      const result = await this.processTask(task);
      results.push(result);
    }
    
    return results;
  }

  getRegisteredAgents(): string[] {
    return Array.from(this.agents.keys());
  }
}