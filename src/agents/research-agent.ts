import { BaseAgent, AgentMessage, AgentCapabilities } from './base-agent';
import { aiAdapter } from '../ai/ai-adapter';

export class ResearchAgent extends BaseAgent {
  constructor() {
    const capabilities: AgentCapabilities = {
      canHandle: (task: string) => {
        const researchTasks = [
          'explore', 'analyze', 'understand', 'find', 'search',
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

  async execute(message: AgentMessage): Promise<AgentMessage> {
    const { task, context } = message.payload;
    
    const results = await this.performResearch(task, context);
    
    return {
      from: this.name,
      to: message.from,
      type: 'response',
      payload: {
        task: `Research completed for: ${task}`,
        context: results,
        priority: message.payload.priority,
      },
      timestamp: new Date()
    };
  }

  private async performResearch(task: string, context: any): Promise<any> {
    if (this.useAI) {
      // Use AI for research
      const request = aiAdapter.createAgentRequest(
        this.name,
        task,
        context,
        this.getSystemPrompt()
      );

      const response = await aiAdapter.complete(request);
      
      // Parse AI response into structured format
      return this.parseAIResponse(response.content);
    }

    // Fallback to mock response
    return {
      findings: [
        'Located relevant code patterns',
        'Identified key dependencies',
        'Found similar implementations'
      ],
      recommendations: [
        'Consider using existing patterns',
        'Review similar modules for consistency'
      ],
      codeLocations: [
        'src/utils/helpers.ts',
        'src/components/shared.ts'
      ]
    };
  }

  protected getSystemPrompt(): string {
    return `You are a Research Agent - an expert code archaeologist and pattern finder.

Your role is to:
1. Analyze codebases to understand structure and patterns
2. Find relevant code examples and implementations
3. Identify dependencies and relationships
4. Provide actionable insights and recommendations

When researching, focus on:
- Code patterns and conventions used
- Architecture decisions evident in the code
- Similar implementations that can be referenced
- Potential issues or improvements

Format your response as JSON with these fields:
{
  "findings": ["key discoveries"],
  "recommendations": ["actionable suggestions"],
  "codeLocations": ["relevant file paths"],
  "patterns": ["identified patterns"],
  "dependencies": ["key dependencies found"]
}`;
  }

  private parseAIResponse(content: string): any {
    try {
      // Try to parse as JSON first
      return JSON.parse(content);
    } catch {
      // If not JSON, structure the text response
      const lines = content.split('\n').filter(line => line.trim());
      
      return {
        findings: lines.slice(0, 3),
        recommendations: lines.slice(3, 5),
        codeLocations: [],
        analysis: content
      };
    }
  }
}