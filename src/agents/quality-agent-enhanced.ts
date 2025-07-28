import { BaseAgentEnhanced } from './base-agent-enhanced';
import { AgentMessage, AgentCapabilities } from './base-agent';

export class QualityAgentEnhanced extends BaseAgentEnhanced {
  constructor() {
    const capabilities: AgentCapabilities = {
      canHandle: (task: string) => {
        const qualityKeywords = [
          'review', 'check', 'analyze', 'audit', 'inspect',
          'validate', 'verify', 'assess', 'evaluate', 'quality',
          'security', 'vulnerability', 'implications', 'risk'
        ];
        return qualityKeywords.some(keyword => 
          task.toLowerCase().includes(keyword)
        );
      },
      estimateTime: (task: string) => {
        if (task.includes('comprehensive') || task.includes('full')) return 30;
        if (task.includes('security')) return 25;
        return 15;
      },
      dependencies: []
    };

    super('QualityAgent', capabilities);
  }

  protected getSystemPrompt(): string {
    return `You are a Quality Agent specialized in code review and analysis.
Your role is to:
1. Review code for quality, security, and performance issues
2. Identify potential vulnerabilities and risks
3. Suggest improvements and best practices
4. Ensure code meets quality standards

Always return responses in JSON format with:
- score: quality score (0-100)
- issues: array of {severity, type, location, message} objects
- suggestions: improvement recommendations
- security: {vulnerabilities, passed, recommendations}`;
  }
}