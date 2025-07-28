/**
 * Memory and Context Types
 */

export interface Memory {
  id: string;
  agentName: string;
  timestamp: Date;
  type: MemoryType;
  content: any;
  metadata?: Record<string, any>;
  ttl?: number; // Time to live in seconds
}

export enum MemoryType {
  CONVERSATION = 'conversation',
  KNOWLEDGE = 'knowledge',
  TASK_RESULT = 'task_result',
  CODE_ANALYSIS = 'code_analysis',
  ERROR = 'error',
  LEARNING = 'learning'
}

export interface ConversationMemory extends Memory {
  type: MemoryType.CONVERSATION;
  content: {
    input: string;
    output: string;
    context?: any;
  };
}

export interface KnowledgeMemory extends Memory {
  type: MemoryType.KNOWLEDGE;
  content: {
    topic: string;
    facts: string[];
    source?: string;
    confidence: number;
  };
}

export interface TaskResultMemory extends Memory {
  type: MemoryType.TASK_RESULT;
  content: {
    task: string;
    result: any;
    success: boolean;
    duration: number;
  };
}

export interface CodeAnalysisMemory extends Memory {
  type: MemoryType.CODE_ANALYSIS;
  content: {
    file: string;
    analysis: {
      complexity?: number;
      dependencies?: string[];
      exports?: string[];
      issues?: string[];
    };
  };
}

export interface MemoryQuery {
  agentName?: string;
  type?: MemoryType;
  timeRange?: {
    start: Date;
    end: Date;
  };
  limit?: number;
  search?: string;
}

export interface MemoryStore {
  add(memory: Memory): Promise<void>;
  get(id: string): Promise<Memory | null>;
  query(query: MemoryQuery): Promise<Memory[]>;
  update(id: string, updates: Partial<Memory>): Promise<void>;
  delete(id: string): Promise<void>;
  clear(agentName?: string): Promise<void>;
}

export interface ContextManager {
  getContext(agentName: string, taskType?: string): Promise<any>;
  updateContext(agentName: string, updates: any): Promise<void>;
  shareContext(fromAgent: string, toAgent: string, context: any): Promise<void>;
  clearContext(agentName: string): Promise<void>;
}