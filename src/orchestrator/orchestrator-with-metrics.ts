import { BaseAgent, AgentMessage } from '../agents/base-agent';
import { metricsCollector } from '../metrics/collector';

/**
 * Enhanced Orchestrator with Metrics Integration
 * Tracks agent performance and task execution metrics
 */
export class OrchestratorWithMetrics {
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
    const agentName = selectedAgent.getName();

    // Start metrics tracking for this agent
    metricsCollector.startAgent(agentName);

    try {
      const message: AgentMessage = {
        from: 'orchestrator',
        to: agentName,
        type: 'request',
        payload: {
          task,
          priority,
        },
        timestamp: new Date()
      };

      // Execute the agent
      const response = await selectedAgent.execute(message);

      // End metrics tracking - success
      metricsCollector.endAgent(agentName, true);

      // Add realistic token usage
      // In production, this would come from the actual AI provider response
      const estimatedPromptLength = 200 + Math.random() * 300;
      const estimatedResponseLength = 400 + Math.random() * 600;
      const mockTokens = {
        input: Math.floor(estimatedPromptLength / 4), // ~4 chars per token
        output: Math.floor(estimatedResponseLength / 4),
        cost: (estimatedPromptLength * 0.00001 + estimatedResponseLength * 0.00003) * (0.8 + Math.random() * 0.4)
      };
      metricsCollector.addTokenUsage(agentName, mockTokens.input, mockTokens.output, mockTokens.cost);

      return response.payload;
    } catch (error) {
      // End metrics tracking - failure
      metricsCollector.endAgent(agentName, false, (error as Error).message);
      throw error;
    }
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