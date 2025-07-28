import { BaseAgentEnhanced } from './base-agent-enhanced';
import { AgentMessage, AgentCapabilities } from './base-agent';

export class ResearchAgentEnhanced extends BaseAgentEnhanced {
  constructor() {
    const capabilities: AgentCapabilities = {
      canHandle: (task: string) => {
        const researchTasks = [
          'research', 'explore', 'analyze', 'understand', 'find', 'search',
          'locate', 'investigate', 'examine', 'study'
        ];
        return researchTasks.some(keyword => 
          task.toLowerCase().includes(keyword)
        );
      },
      estimateTime: (task: string) => {
        // Estimate in minutes based on task complexity
        if (task.includes('entire codebase')) return 30;
        if (task.includes('module') || task.includes('component')) return 15;
        return 5;
      },
      dependencies: []
    };

    super('ResearchAgent', capabilities);
  }

  protected getSystemPrompt(): string {
    return `You are a Research Agent specialized in code exploration and analysis.
Your role is to:
1. Analyze codebases and identify patterns
2. Find relevant implementations and dependencies
3. Provide insights and recommendations
4. Locate specific code sections

Always return responses in JSON format with findings, recommendations, and code locations.`;
  }
}