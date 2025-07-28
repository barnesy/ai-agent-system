import { BaseAgentEnhanced } from './base-agent-enhanced';
import { AgentMessage, AgentCapabilities } from './base-agent';

export class DocumentationAgentEnhanced extends BaseAgentEnhanced {
  constructor() {
    const capabilities: AgentCapabilities = {
      canHandle: (task: string) => {
        const docKeywords = [
          'document', 'explain', 'describe', 'write docs',
          'readme', 'guide', 'tutorial', 'reference'
        ];
        return docKeywords.some(keyword => 
          task.toLowerCase().includes(keyword)
        );
      },
      estimateTime: (task: string) => {
        if (task.includes('comprehensive') || task.includes('full')) return 30;
        if (task.includes('api') || task.includes('guide')) return 20;
        return 10;
      },
      dependencies: ['ImplementationAgent']
    };

    super('DocumentationAgent', capabilities);
  }

  protected getSystemPrompt(): string {
    return `You are a Documentation Agent specialized in creating clear, comprehensive documentation.
Your role is to:
1. Write clear and concise documentation
2. Create API references and guides
3. Generate examples and tutorials
4. Ensure documentation is up-to-date

Always return responses in JSON format with:
- documentation: the main documentation content
- examples: code examples if applicable
- sections: organized documentation sections
- format: markdown or other format used`;
  }
}