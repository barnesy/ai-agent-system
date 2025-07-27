import { BaseAgentEnhanced } from './base-agent-enhanced';
import { AgentMessage, AgentCapabilities } from './base-agent';

export class ImplementationAgentEnhanced extends BaseAgentEnhanced {
  constructor() {
    const capabilities: AgentCapabilities = {
      canHandle: (task: string) => {
        const implementTasks = [
          'implement', 'create', 'build', 'develop', 'write',
          'generate', 'add', 'fix', 'refactor', 'update'
        ];
        return implementTasks.some(keyword => 
          task.toLowerCase().includes(keyword)
        );
      },
      estimateTime: (task: string) => {
        if (task.includes('entire') || task.includes('system')) return 60;
        if (task.includes('feature') || task.includes('module')) return 30;
        if (task.includes('function') || task.includes('fix')) return 10;
        return 15;
      },
      dependencies: ['ResearchAgent']
    };

    super('ImplementationAgent', capabilities);
  }

  protected getSystemPrompt(): string {
    return `You are an Implementation Agent specialized in code generation and development.
Your role is to:
1. Generate high-quality, production-ready code
2. Implement bug fixes and features
3. Refactor existing code for better performance
4. Follow best practices and design patterns

Always return responses in JSON format with:
- files: array of {path, content} objects
- explanation: what was implemented and why
- dependencies: required packages
- testSuggestions: recommended tests`;
  }
}