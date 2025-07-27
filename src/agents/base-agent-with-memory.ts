import { BaseAgentEnhanced } from './base-agent-enhanced';
import { AgentMessage, AgentCapabilities } from './base-agent';
import { memoryStore } from '../memory/memory-store';
import { contextManager } from '../memory/context-manager';
import { Memory, MemoryType, ConversationMemory, TaskResultMemory } from '../memory/types';

/**
 * Base Agent with Memory Support
 * Extends the enhanced agent with memory and context persistence
 */
export abstract class BaseAgentWithMemory extends BaseAgentEnhanced {
  private memoryEnabled: boolean = true;
  private maxMemoryRecall: number = 10;

  constructor(name: string, capabilities: AgentCapabilities) {
    super(name, capabilities);
  }

  async execute(message: AgentMessage): Promise<AgentMessage> {
    const startTime = Date.now();
    
    try {
      // Load context before execution
      const context = await this.loadContext(message);
      
      // Include context in the message
      const enhancedMessage = {
        ...message,
        payload: {
          ...message.payload,
          context
        }
      };

      // Execute with context
      const response = await super.execute(enhancedMessage);

      // Store conversation memory
      if (this.memoryEnabled) {
        await this.storeConversationMemory(message, response);
      }

      // Store task result memory
      const duration = Date.now() - startTime;
      await this.storeTaskResultMemory(message, response, true, duration);

      // Update context with results
      await this.updateContext(response);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Store error memory
      await this.storeErrorMemory(message, error as Error);
      
      // Store failed task result
      await this.storeTaskResultMemory(message, null, false, duration);
      
      throw error;
    }
  }

  private async loadContext(message: AgentMessage): Promise<any> {
    // Get agent context
    const agentContext = await contextManager.getContext(
      this.name,
      message.payload.task
    );

    // Get recent memories
    const recentMemories = await memoryStore.query({
      agentName: this.name,
      limit: this.maxMemoryRecall
    });

    // Get relevant memories based on task
    const relevantMemories = await this.findRelevantMemories(message.payload.task);

    return {
      ...agentContext,
      recentMemories: recentMemories.map(m => ({
        type: m.type,
        content: m.content,
        timestamp: m.timestamp
      })),
      relevantMemories: relevantMemories.map(m => ({
        type: m.type,
        content: m.content,
        timestamp: m.timestamp,
        relevanceScore: m.metadata?.relevanceScore || 0
      }))
    };
  }

  private async findRelevantMemories(task: string): Promise<Memory[]> {
    // Search for memories related to the current task
    const memories = await memoryStore.query({
      agentName: this.name,
      search: task,
      limit: 5
    });

    // Also search across all agents for knowledge memories
    const knowledgeMemories = await memoryStore.query({
      type: MemoryType.KNOWLEDGE,
      search: task,
      limit: 5
    });

    // Combine and sort by relevance
    const allMemories = [...memories, ...knowledgeMemories];
    
    // Calculate relevance scores
    for (const memory of allMemories) {
      const contentStr = JSON.stringify(memory.content).toLowerCase();
      const taskWords = task.toLowerCase().split(' ');
      const matchCount = taskWords.filter(word => contentStr.includes(word)).length;
      memory.metadata = {
        ...memory.metadata,
        relevanceScore: matchCount / taskWords.length
      };
    }

    // Sort by relevance and return top results
    return allMemories
      .sort((a, b) => (b.metadata?.relevanceScore || 0) - (a.metadata?.relevanceScore || 0))
      .slice(0, 5);
  }

  private async storeConversationMemory(
    message: AgentMessage,
    response: AgentMessage
  ): Promise<void> {
    const memory: ConversationMemory = {
      id: `${this.name}-conv-${Date.now()}-${Math.random()}`,
      agentName: this.name,
      timestamp: new Date(),
      type: MemoryType.CONVERSATION,
      content: {
        input: message.payload.task || JSON.stringify(message.payload),
        output: response.payload.task || JSON.stringify(response.payload),
        context: message.payload.context
      },
      ttl: 86400 * 7 // Keep conversation memories for 7 days
    };

    await memoryStore.add(memory);
  }

  private async storeTaskResultMemory(
    message: AgentMessage,
    response: AgentMessage | null,
    success: boolean,
    duration: number
  ): Promise<void> {
    const memory: TaskResultMemory = {
      id: `${this.name}-task-${Date.now()}-${Math.random()}`,
      agentName: this.name,
      timestamp: new Date(),
      type: MemoryType.TASK_RESULT,
      content: {
        task: message.payload.task || 'Unknown task',
        result: response?.payload || null,
        success,
        duration
      },
      ttl: 86400 * 30 // Keep task results for 30 days
    };

    await memoryStore.add(memory);
  }

  private async storeErrorMemory(message: AgentMessage, error: Error): Promise<void> {
    const memory: Memory = {
      id: `${this.name}-error-${Date.now()}-${Math.random()}`,
      agentName: this.name,
      timestamp: new Date(),
      type: MemoryType.ERROR,
      content: {
        task: message.payload.task || 'Unknown task',
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      },
      ttl: 86400 * 3 // Keep error memories for 3 days
    };

    await memoryStore.add(memory);
  }

  private async updateContext(response: AgentMessage): Promise<void> {
    // Extract knowledge or insights from the response
    const payload = response.payload as any;
    const updates: any = {
      task: {
        description: payload.task,
        result: payload.result || payload,
        timestamp: new Date()
      }
    };

    // Look for patterns that indicate knowledge
    if (payload.findings || payload.analysis) {
      updates.knowledge = {
        [payload.task || 'general']: payload.findings || payload.analysis
      };
    }

    await contextManager.updateContext(this.name, updates);
  }

  async shareKnowledge(topic: string, facts: string[], targetAgent?: string): Promise<void> {
    // Store knowledge in memory
    const memory: Memory = {
      id: `${this.name}-knowledge-${Date.now()}-${Math.random()}`,
      agentName: this.name,
      timestamp: new Date(),
      type: MemoryType.KNOWLEDGE,
      content: {
        topic,
        facts,
        source: this.name,
        confidence: 0.9
      }
    };

    await memoryStore.add(memory);

    // Share with specific agent if specified
    if (targetAgent) {
      await contextManager.shareContext(this.name, targetAgent, {
        knowledge: { [topic]: facts }
      });
    }
  }

  async recallMemories(query: string, limit: number = 5): Promise<Memory[]> {
    return await memoryStore.query({
      agentName: this.name,
      search: query,
      limit
    });
  }

  async clearMemories(): Promise<void> {
    await memoryStore.clear(this.name);
    await contextManager.clearContext(this.name);
  }

  setMemoryEnabled(enabled: boolean): void {
    this.memoryEnabled = enabled;
  }

  setMaxMemoryRecall(max: number): void {
    this.maxMemoryRecall = max;
  }
}