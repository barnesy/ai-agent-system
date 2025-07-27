import * as fs from 'fs';
import * as path from 'path';
import { Memory, MemoryQuery, MemoryStore, MemoryType } from './types';

/**
 * File-based Memory Store
 * Persists agent memories to disk for long-term retention
 */
export class FileMemoryStore implements MemoryStore {
  private memoryPath: string;
  private memories: Map<string, Memory> = new Map();
  private autoSaveInterval: NodeJS.Timeout | null = null;

  constructor(basePath?: string) {
    this.memoryPath = basePath || path.join(process.cwd(), '.memory');
    this.ensureDirectoryExists();
    this.loadMemories();
    this.startAutoSave();
  }

  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.memoryPath)) {
      fs.mkdirSync(this.memoryPath, { recursive: true });
    }
  }

  private getFilePath(agentName: string): string {
    return path.join(this.memoryPath, `${agentName}-memory.json`);
  }

  private loadMemories(): void {
    try {
      const files = fs.readdirSync(this.memoryPath);
      for (const file of files) {
        if (file.endsWith('-memory.json')) {
          const filePath = path.join(this.memoryPath, file);
          const data = fs.readFileSync(filePath, 'utf8');
          const memories = JSON.parse(data);
          
          for (const memory of memories) {
            // Convert date strings back to Date objects
            memory.timestamp = new Date(memory.timestamp);
            this.memories.set(memory.id, memory);
          }
        }
      }
    } catch (error) {
      console.error('Error loading memories:', error);
    }
  }

  private saveMemories(): void {
    try {
      // Group memories by agent
      const memoriesByAgent = new Map<string, Memory[]>();
      
      for (const memory of this.memories.values()) {
        if (!memoriesByAgent.has(memory.agentName)) {
          memoriesByAgent.set(memory.agentName, []);
        }
        memoriesByAgent.get(memory.agentName)!.push(memory);
      }

      // Save each agent's memories to a separate file
      for (const [agentName, memories] of memoriesByAgent.entries()) {
        const filePath = this.getFilePath(agentName);
        fs.writeFileSync(filePath, JSON.stringify(memories, null, 2));
      }
    } catch (error) {
      console.error('Error saving memories:', error);
    }
  }

  private startAutoSave(): void {
    // Auto-save every 30 seconds
    this.autoSaveInterval = setInterval(() => {
      this.saveMemories();
      this.cleanupExpiredMemories();
    }, 30000);
  }

  private cleanupExpiredMemories(): void {
    const now = Date.now();
    const expiredIds: string[] = [];

    for (const [id, memory] of this.memories.entries()) {
      if (memory.ttl) {
        const expiryTime = memory.timestamp.getTime() + (memory.ttl * 1000);
        if (now > expiryTime) {
          expiredIds.push(id);
        }
      }
    }

    for (const id of expiredIds) {
      this.memories.delete(id);
    }
  }

  async add(memory: Memory): Promise<void> {
    this.memories.set(memory.id, memory);
    this.saveMemories();
  }

  async get(id: string): Promise<Memory | null> {
    return this.memories.get(id) || null;
  }

  async query(query: MemoryQuery): Promise<Memory[]> {
    let results = Array.from(this.memories.values());

    // Filter by agent name
    if (query.agentName) {
      results = results.filter(m => m.agentName === query.agentName);
    }

    // Filter by type
    if (query.type) {
      results = results.filter(m => m.type === query.type);
    }

    // Filter by time range
    if (query.timeRange) {
      results = results.filter(m => {
        const timestamp = m.timestamp.getTime();
        return timestamp >= query.timeRange!.start.getTime() && 
               timestamp <= query.timeRange!.end.getTime();
      });
    }

    // Search in content
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      results = results.filter(m => {
        const contentStr = JSON.stringify(m.content).toLowerCase();
        return contentStr.includes(searchLower);
      });
    }

    // Sort by timestamp (newest first)
    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply limit
    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    return results;
  }

  async update(id: string, updates: Partial<Memory>): Promise<void> {
    const memory = this.memories.get(id);
    if (memory) {
      Object.assign(memory, updates);
      this.saveMemories();
    }
  }

  async delete(id: string): Promise<void> {
    this.memories.delete(id);
    this.saveMemories();
  }

  async clear(agentName?: string): Promise<void> {
    if (agentName) {
      // Clear memories for specific agent
      const toDelete = Array.from(this.memories.entries())
        .filter(([_, m]) => m.agentName === agentName)
        .map(([id, _]) => id);
      
      for (const id of toDelete) {
        this.memories.delete(id);
      }

      // Delete the agent's file
      const filePath = this.getFilePath(agentName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } else {
      // Clear all memories
      this.memories.clear();
      
      // Delete all memory files
      const files = fs.readdirSync(this.memoryPath);
      for (const file of files) {
        if (file.endsWith('-memory.json')) {
          fs.unlinkSync(path.join(this.memoryPath, file));
        }
      }
    }
  }

  destroy(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
    this.saveMemories();
  }
}

// Export singleton instance
export const memoryStore = new FileMemoryStore();