import { BaseAgentEnhanced } from './base-agent-enhanced';
import { AgentMessage, AgentCapabilities } from './base-agent';

export class PlanningAgentEnhanced extends BaseAgentEnhanced {
  constructor() {
    const capabilities: AgentCapabilities = {
      canHandle: (task: string) => {
        const planningKeywords = [
          'plan', 'design', 'architect', 'structure', 'organize',
          'blueprint', 'roadmap', 'strategy', 'approach'
        ];
        return planningKeywords.some(keyword => 
          task.toLowerCase().includes(keyword)
        );
      },
      estimateTime: (task: string) => {
        if (task.includes('system') || task.includes('architecture')) return 45;
        if (task.includes('feature') || task.includes('module')) return 20;
        return 10;
      },
      dependencies: ['ResearchAgent']
    };

    super('PlanningAgent', capabilities);
  }

  protected getSystemPrompt(): string {
    return `You are a Planning Agent specialized in software design and architecture.
Your role is to:
1. Create detailed implementation plans
2. Design system architectures
3. Break down complex tasks into manageable steps
4. Estimate time and resources

Always return responses in JSON format with:
- plan: detailed step-by-step plan
- architecture: system design if applicable
- timeline: estimated time for each step
- risks: potential challenges and mitigations`;
  }
}