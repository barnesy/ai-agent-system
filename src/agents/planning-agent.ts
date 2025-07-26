import { BaseAgent, AgentMessage, AgentCapabilities } from './base-agent';

interface Task {
  id: string;
  description: string;
  estimatedTime: number; // in minutes
  dependencies: string[];
  priority: 'high' | 'medium' | 'low';
}

interface Plan {
  tasks: Task[];
  totalTime: number;
  criticalPath: string[];
  parallelizable: string[][];
}

export class PlanningAgent extends BaseAgent {
  constructor() {
    const capabilities: AgentCapabilities = {
      canHandle: (task: string) => {
        const planningKeywords = [
          'plan', 'break down', 'decompose', 'organize',
          'structure', 'design', 'architect', 'outline'
        ];
        return planningKeywords.some(keyword => 
          task.toLowerCase().includes(keyword)
        );
      },
      estimateTime: (task: string) => {
        if (task.includes('large') || task.includes('complex')) return 20;
        if (task.includes('medium')) return 10;
        return 5;
      },
      dependencies: ['ResearchAgent']
    };

    super('PlanningAgent', capabilities);
  }

  async execute(message: AgentMessage): Promise<AgentMessage> {
    const { task, context } = message.payload;
    
    const plan = await this.createPlan(task, context);
    
    return {
      from: this.name,
      to: message.from,
      type: 'response',
      payload: {
        task: `Plan created for: ${task}`,
        context: plan,
        priority: message.payload.priority,
      },
      timestamp: new Date()
    };
  }

  private async createPlan(task: string, context: any): Promise<Plan> {
    // Simulate intelligent task decomposition
    const tasks: Task[] = this.decomposeTask(task);
    const criticalPath = this.findCriticalPath(tasks);
    const parallelizable = this.findParallelizableTasks(tasks);
    
    return {
      tasks,
      totalTime: this.calculateTotalTime(tasks, parallelizable),
      criticalPath,
      parallelizable
    };
  }

  private decomposeTask(task: string): Task[] {
    // Simplified task decomposition logic
    const baseTaskId = task.replace(/\s+/g, '-').toLowerCase();
    
    return [
      {
        id: `${baseTaskId}-1`,
        description: 'Analyze requirements and constraints',
        estimatedTime: 15,
        dependencies: [],
        priority: 'high'
      },
      {
        id: `${baseTaskId}-2`,
        description: 'Design solution architecture',
        estimatedTime: 30,
        dependencies: [`${baseTaskId}-1`],
        priority: 'high'
      },
      {
        id: `${baseTaskId}-3`,
        description: 'Implement core functionality',
        estimatedTime: 60,
        dependencies: [`${baseTaskId}-2`],
        priority: 'high'
      },
      {
        id: `${baseTaskId}-4`,
        description: 'Write tests',
        estimatedTime: 30,
        dependencies: [`${baseTaskId}-2`],
        priority: 'medium'
      },
      {
        id: `${baseTaskId}-5`,
        description: 'Document implementation',
        estimatedTime: 20,
        dependencies: [`${baseTaskId}-3`],
        priority: 'medium'
      }
    ];
  }

  private findCriticalPath(tasks: Task[]): string[] {
    // Simplified critical path - longest dependency chain
    return tasks
      .filter(t => t.priority === 'high')
      .map(t => t.id);
  }

  private findParallelizableTasks(tasks: Task[]): string[][] {
    // Group tasks that can be done in parallel
    const groups: string[][] = [];
    const processed = new Set<string>();

    tasks.forEach(task => {
      if (!processed.has(task.id)) {
        const parallel = tasks
          .filter(t => 
            t.dependencies.length === task.dependencies.length &&
            t.dependencies.every(d => task.dependencies.includes(d)) &&
            !processed.has(t.id)
          )
          .map(t => t.id);
        
        if (parallel.length > 1) {
          groups.push(parallel);
          parallel.forEach(id => processed.add(id));
        }
      }
    });

    return groups;
  }

  private calculateTotalTime(tasks: Task[], parallelGroups: string[][]): number {
    let totalTime = 0;
    const processed = new Set<string>();

    // Add time for parallel groups
    parallelGroups.forEach(group => {
      const groupTime = Math.max(
        ...group.map(id => 
          tasks.find(t => t.id === id)?.estimatedTime || 0
        )
      );
      totalTime += groupTime;
      group.forEach(id => processed.add(id));
    });

    // Add time for sequential tasks
    tasks.forEach(task => {
      if (!processed.has(task.id)) {
        totalTime += task.estimatedTime;
      }
    });

    return totalTime;
  }
}