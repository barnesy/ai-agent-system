import { BaseAgentEnhanced } from './base-agent-enhanced';
import { AgentMessage, AgentCapabilities } from './base-agent';

export class TestingAgentEnhanced extends BaseAgentEnhanced {
  constructor() {
    const capabilities: AgentCapabilities = {
      canHandle: (task: string) => {
        const testKeywords = [
          'test', 'validate', 'verify', 'check', 'assert',
          'ensure', 'confirm', 'prove', 'examine'
        ];
        return testKeywords.some(keyword => 
          task.toLowerCase().includes(keyword)
        );
      },
      estimateTime: (task: string) => {
        if (task.includes('comprehensive') || task.includes('suite')) return 45;
        if (task.includes('integration')) return 30;
        if (task.includes('unit')) return 15;
        return 20;
      },
      dependencies: ['ImplementationAgent']
    };

    super('TestingAgent', capabilities);
  }

  protected getSystemPrompt(): string {
    return `You are a Testing Agent specialized in test generation and validation.
Your role is to:
1. Generate comprehensive test suites
2. Create unit, integration, and e2e tests
3. Ensure high test coverage
4. Validate functionality and edge cases

Always return responses in JSON format with:
- tests: array of {name, type, code} objects
- coverage: {statements, branches, functions, lines} percentages`;
  }
}