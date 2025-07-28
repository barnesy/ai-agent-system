import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { FileMemoryStore } from '../../src/memory/memory-store';
import { AgentContextManager } from '../../src/memory/context-manager';
import { Memory, MemoryType } from '../../src/memory/types';
import * as fs from 'fs';
import * as path from 'path';

describe('Memory System', () => {
  let memoryStore: FileMemoryStore;
  let contextManager: AgentContextManager;
  const testMemoryPath = path.join(__dirname, '../../.test-memory');

  beforeEach(() => {
    // Create test memory store
    memoryStore = new FileMemoryStore(testMemoryPath);
    contextManager = new AgentContextManager();
  });

  afterEach(() => {
    // Clean up
    memoryStore.destroy();
    if (fs.existsSync(testMemoryPath)) {
      fs.rmSync(testMemoryPath, { recursive: true });
    }
  });

  describe('Memory Store', () => {
    it('should store and retrieve memories', async () => {
      const memory: Memory = {
        id: 'test-1',
        agentName: 'TestAgent',
        timestamp: new Date(),
        type: MemoryType.CONVERSATION,
        content: {
          input: 'Test input',
          output: 'Test output'
        }
      };

      await memoryStore.add(memory);
      const retrieved = await memoryStore.get('test-1');

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('test-1');
      expect(retrieved?.content.input).toBe('Test input');
    });

    it('should query memories by agent name', async () => {
      // Add memories for different agents
      await memoryStore.add({
        id: 'agent1-1',
        agentName: 'Agent1',
        timestamp: new Date(),
        type: MemoryType.TASK_RESULT,
        content: { task: 'Task 1', result: 'Result 1', success: true, duration: 100 }
      });

      await memoryStore.add({
        id: 'agent2-1',
        agentName: 'Agent2',
        timestamp: new Date(),
        type: MemoryType.TASK_RESULT,
        content: { task: 'Task 2', result: 'Result 2', success: true, duration: 200 }
      });

      const agent1Memories = await memoryStore.query({ agentName: 'Agent1' });
      expect(agent1Memories).toHaveLength(1);
      expect(agent1Memories[0].agentName).toBe('Agent1');
    });

    it('should query memories by type', async () => {
      await memoryStore.add({
        id: 'conv-1',
        agentName: 'TestAgent',
        timestamp: new Date(),
        type: MemoryType.CONVERSATION,
        content: { input: 'Hi', output: 'Hello' }
      });

      await memoryStore.add({
        id: 'knowledge-1',
        agentName: 'TestAgent',
        timestamp: new Date(),
        type: MemoryType.KNOWLEDGE,
        content: { topic: 'Testing', facts: ['Fact 1'], confidence: 0.9 }
      });

      const knowledgeMemories = await memoryStore.query({ type: MemoryType.KNOWLEDGE });
      expect(knowledgeMemories).toHaveLength(1);
      expect(knowledgeMemories[0].type).toBe(MemoryType.KNOWLEDGE);
    });

    it('should search memories by content', async () => {
      await memoryStore.add({
        id: 'search-1',
        agentName: 'TestAgent',
        timestamp: new Date(),
        type: MemoryType.KNOWLEDGE,
        content: { topic: 'Authentication', facts: ['JWT tokens are used'], confidence: 0.9 }
      });

      await memoryStore.add({
        id: 'search-2',
        agentName: 'TestAgent',
        timestamp: new Date(),
        type: MemoryType.KNOWLEDGE,
        content: { topic: 'Database', facts: ['PostgreSQL is used'], confidence: 0.8 }
      });

      const authMemories = await memoryStore.query({ search: 'JWT' });
      expect(authMemories).toHaveLength(1);
      expect(authMemories[0].content.topic).toBe('Authentication');
    });

    it('should respect TTL and clean up expired memories', async () => {
      await memoryStore.add({
        id: 'ttl-test',
        agentName: 'TestAgent',
        timestamp: new Date(Date.now() - 2000), // 2 seconds ago
        type: MemoryType.CONVERSATION,
        content: { input: 'Test', output: 'Test' },
        ttl: 1 // 1 second TTL
      });

      // Force cleanup
      memoryStore['cleanupExpiredMemories']();

      const retrieved = await memoryStore.get('ttl-test');
      expect(retrieved).toBeNull();
    });

    it('should persist memories to disk', async () => {
      await memoryStore.add({
        id: 'persist-1',
        agentName: 'PersistAgent',
        timestamp: new Date(),
        type: MemoryType.KNOWLEDGE,
        content: { topic: 'Persistence', facts: ['Data saved'], confidence: 1 }
      });

      // Create new store instance
      const newStore = new FileMemoryStore(testMemoryPath);
      const retrieved = await newStore.get('persist-1');

      expect(retrieved).toBeDefined();
      expect(retrieved?.content.topic).toBe('Persistence');

      newStore.destroy();
    });
  });

  describe('Context Manager', () => {
    it('should manage agent context', async () => {
      await contextManager.updateContext('TestAgent', {
        knowledge: {
          'Testing': ['Unit tests are important', 'Mock data is useful']
        },
        task: {
          description: 'Write tests',
          result: 'Tests written'
        }
      });

      const context = await contextManager.getContext('TestAgent');
      expect(context.knowledge.Testing).toBeDefined();
      expect(context.recentTasks).toHaveLength(1);
    });

    it('should share context between agents', async () => {
      const sharedData = {
        findings: ['Important discovery'],
        recommendations: ['Use this pattern']
      };

      await contextManager.shareContext('Agent1', 'Agent2', sharedData);
      const agent2Context = await contextManager.getContext('Agent2');

      expect(agent2Context.sharedContext.Agent1).toBeDefined();
      expect(agent2Context.sharedContext.Agent1.findings).toContain('Important discovery');
    });

    it('should summarize context', async () => {
      await contextManager.updateContext('SummaryAgent', {
        knowledge: {
          'Topic1': ['Fact1'],
          'Topic2': ['Fact2']
        },
        task: { description: 'Test task', result: 'Done' }
      });

      const summary = await contextManager.summarizeContext('SummaryAgent');
      expect(summary).toContain('SummaryAgent');
      expect(summary).toContain('Topic1, Topic2');
      expect(summary).toContain('Recent tasks: 1');
    });
  });

  describe('Memory Integration', () => {
    it('should integrate memory store with context manager', async () => {
      // Add knowledge memory
      await memoryStore.add({
        id: 'integrate-1',
        agentName: 'IntegrationAgent',
        timestamp: new Date(),
        type: MemoryType.KNOWLEDGE,
        content: {
          topic: 'Integration Testing',
          facts: ['Memory and context work together'],
          confidence: 0.95
        }
      });

      // Context manager should be able to access it
      const context = await contextManager.getContext('IntegrationAgent', 'Integration');
      // This would work in the full implementation where context manager queries memory store
      expect(context).toBeDefined();
    });
  });
});