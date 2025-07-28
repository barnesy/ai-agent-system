import { ContextManager } from './types';
import { memoryStore } from './memory-store';
import { MemoryType } from './types';

/**
 * Context Manager
 * Manages shared context between agents and across tasks
 */
export class AgentContextManager implements ContextManager {
  private contexts: Map<string, any> = new Map();

  constructor() {
    this.loadContextsFromMemory();
  }

  private async loadContextsFromMemory(): Promise<void> {
    // Load recent task results as context
    const recentMemories = await memoryStore.query({
      type: MemoryType.TASK_RESULT,
      limit: 100
    });

    for (const memory of recentMemories) {
      if (memory.type === MemoryType.TASK_RESULT) {
        const agentName = memory.agentName;
        if (!this.contexts.has(agentName)) {
          this.contexts.set(agentName, {
            recentTasks: [],
            knowledge: {},
            sharedContext: {}
          });
        }
        
        const context = this.contexts.get(agentName)!;
        context.recentTasks.push({
          task: memory.content.task,
          result: memory.content.result,
          timestamp: memory.timestamp
        });
      }
    }
  }

  async getContext(agentName: string, taskType?: string): Promise<any> {
    let context = this.contexts.get(agentName) || {
      recentTasks: [],
      knowledge: {},
      sharedContext: {}
    };

    // Add relevant memories based on task type
    if (taskType) {
      const relevantMemories = await memoryStore.query({
        agentName,
        search: taskType,
        limit: 10
      });

      context = {
        ...context,
        relevantMemories: relevantMemories.map(m => ({
          type: m.type,
          content: m.content,
          timestamp: m.timestamp
        }))
      };
    }

    // Add shared context from other agents
    const sharedMemories = await memoryStore.query({
      type: MemoryType.KNOWLEDGE,
      limit: 20
    });

    const sharedKnowledge = new Map<string, any>();
    for (const memory of sharedMemories) {
      if (memory.type === MemoryType.KNOWLEDGE && memory.content.confidence > 0.7) {
        sharedKnowledge.set(memory.content.topic, memory.content.facts);
      }
    }

    context.sharedKnowledge = Object.fromEntries(sharedKnowledge);

    return context;
  }

  async updateContext(agentName: string, updates: any): Promise<void> {
    const context = this.contexts.get(agentName) || {
      recentTasks: [],
      knowledge: {},
      sharedContext: {}
    };

    // Merge updates
    if (updates.knowledge) {
      context.knowledge = { ...context.knowledge, ...updates.knowledge };
    }

    if (updates.task) {
      context.recentTasks.push({
        ...updates.task,
        timestamp: new Date()
      });

      // Keep only last 20 tasks
      if (context.recentTasks.length > 20) {
        context.recentTasks = context.recentTasks.slice(-20);
      }
    }

    if (updates.sharedContext) {
      context.sharedContext = { ...context.sharedContext, ...updates.sharedContext };
    }

    this.contexts.set(agentName, context);

    // Persist important updates to memory store
    if (updates.knowledge) {
      for (const [topic, facts] of Object.entries(updates.knowledge)) {
        await memoryStore.add({
          id: `${agentName}-knowledge-${Date.now()}-${Math.random()}`,
          agentName,
          timestamp: new Date(),
          type: MemoryType.KNOWLEDGE,
          content: {
            topic,
            facts: Array.isArray(facts) ? facts : [facts],
            confidence: 0.8
          }
        });
      }
    }
  }

  async shareContext(fromAgent: string, toAgent: string, context: any): Promise<void> {
    const toContext = this.contexts.get(toAgent) || {
      recentTasks: [],
      knowledge: {},
      sharedContext: {}
    };

    toContext.sharedContext[fromAgent] = {
      ...context,
      sharedAt: new Date()
    };

    this.contexts.set(toAgent, toContext);
  }

  async clearContext(agentName: string): Promise<void> {
    this.contexts.delete(agentName);
  }

  async summarizeContext(agentName: string): Promise<string> {
    const context = await this.getContext(agentName);
    
    const summary = {
      recentTaskCount: context.recentTasks?.length || 0,
      knowledgeTopics: Object.keys(context.knowledge || {}),
      sharedFromAgents: Object.keys(context.sharedContext || {}),
      relevantMemoryCount: context.relevantMemories?.length || 0
    };

    return `Context Summary for ${agentName}:
- Recent tasks: ${summary.recentTaskCount}
- Knowledge topics: ${summary.knowledgeTopics.join(', ') || 'none'}
- Shared context from: ${summary.sharedFromAgents.join(', ') || 'none'}
- Relevant memories: ${summary.relevantMemoryCount}`;
  }
}

// Export singleton instance
export const contextManager = new AgentContextManager();