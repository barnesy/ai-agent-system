import { BaseAgentWithMemory } from './base-agent-with-memory';
import { AgentMessage, AgentCapabilities } from './base-agent';
import { MemoryType } from '../memory/types';

export class ResearchAgentMemory extends BaseAgentWithMemory {
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
        if (task.includes('entire codebase')) return 30;
        if (task.includes('module') || task.includes('component')) return 15;
        return 5;
      },
      dependencies: []
    };

    super('ResearchAgent', capabilities);
  }

  protected getSystemPrompt(): string {
    return `You are a Research Agent with memory capabilities.
Your role is to:
1. Analyze codebases and identify patterns
2. Find relevant implementations and dependencies
3. Provide insights and recommendations
4. Remember and build upon previous research
5. Share important findings with other agents

You have access to:
- Previous research results and findings
- Shared knowledge from other agents
- Context about recent tasks

Always return responses in JSON format with findings, recommendations, and code locations.
When you discover important patterns or knowledge, note them for future reference.`;
  }

  async execute(message: AgentMessage): Promise<AgentMessage> {
    // Check if we've researched this before
    const previousResearch = await this.recallMemories(message.payload.task, 3);
    
    if (previousResearch.length > 0) {
      // Include previous findings in context
      message.payload.context = {
        ...message.payload.context,
        previousFindings: previousResearch.map(m => m.content)
      };
    }

    const response = await super.execute(message);

    // Extract and store important findings as knowledge
    const payload = response.payload as any;
    if (payload.findings) {
      const findings = Array.isArray(payload.findings) 
        ? payload.findings 
        : [payload.findings];
      
      await this.shareKnowledge(
        `Research: ${message.payload.task}`,
        findings
      );
    }

    // Store code analysis results
    if (payload.codeAnalysis) {
      for (const [file, analysis] of Object.entries(payload.codeAnalysis)) {
        await this.storeCodeAnalysis(file, analysis as any);
      }
    }

    return response;
  }

  private async storeCodeAnalysis(file: string, analysis: any): Promise<void> {
    const memory = {
      id: `${this.name}-code-${Date.now()}-${Math.random()}`,
      agentName: this.name,
      timestamp: new Date(),
      type: MemoryType.CODE_ANALYSIS,
      content: {
        file,
        analysis
      },
      ttl: 86400 * 14 // Keep for 14 days
    };

    const { memoryStore } = await import('../memory/memory-store');
    await memoryStore.add(memory);
  }

  async searchPreviousResearch(topic: string): Promise<any[]> {
    const memories = await this.recallMemories(topic, 10);
    
    return memories
      .filter(m => m.type === MemoryType.KNOWLEDGE || m.type === MemoryType.CODE_ANALYSIS)
      .map(m => m.content);
  }
}

// Re-export for compatibility
export { ResearchAgentMemory as ResearchAgentEnhanced };