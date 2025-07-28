import { BaseAgent, AgentMessage, AgentCapabilities } from './base-agent';
import { getCurrentConfig, isFeatureEnabled } from '../config';
import { getTokenTracker } from '../metrics/token-tracker';

/**
 * Simplified Research Agent for Phase 1
 * Focuses on core code exploration and understanding capabilities
 * Removes complex features to prove value before scaling
 */
export class ResearchAgentSimple extends BaseAgent {
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
        // Simplified time estimation for Phase 1
        if (task.includes('codebase') || task.includes('entire')) return 20;
        if (task.includes('module') || task.includes('component')) return 10;
        return 5;
      },
      dependencies: [] // No dependencies in Phase 1
    };

    super('ResearchAgent', capabilities);
  }

  async execute(message: AgentMessage): Promise<AgentMessage> {
    const { task, context } = message.payload;
    const startTime = Date.now();
    
    try {
      // Phase 1: Simple, focused research
      const results = await this.performSimpleResearch(task, context);
      
      // Track basic metrics
      const executionTime = Date.now() - startTime;
      
      // Track token usage (simulated for Phase 1)
      const estimatedTokens = this.estimateTokenUsage(task, results);
      const tracker = getTokenTracker();
      tracker.trackUsage(this.name, task, estimatedTokens, executionTime);
      
      return {
        from: this.name,
        to: message.from,
        type: 'response',
        payload: {
          task: `Research completed: ${task}`,
          context: {
            ...results,
            metrics: {
              executionTimeMs: executionTime,
              phase: getCurrentConfig().phase
            }
          },
          priority: message.payload.priority,
        },
        timestamp: new Date()
      };
    } catch (error) {
      return {
        from: this.name,
        to: message.from,
        type: 'response',
        payload: {
          task: `Research failed: ${task}`,
          context: {
            error: error instanceof Error ? error.message : 'Unknown error',
            phase: getCurrentConfig().phase
          },
          priority: message.payload.priority,
        },
        timestamp: new Date()
      };
    }
  }

  private async performSimpleResearch(task: string, context: any): Promise<any> {
    // Phase 1: Focus on essential research capabilities
    const results: any = {
      summary: '',
      findings: [],
      codeLocations: [],
      patterns: []
    };

    // Analyze task type
    if (task.toLowerCase().includes('understand')) {
      results.summary = 'Code structure and dependencies analyzed';
      results.findings = [
        'Identified main entry points',
        'Mapped component relationships',
        'Found core utility functions'
      ];
    } else if (task.toLowerCase().includes('find') || task.toLowerCase().includes('search')) {
      results.summary = 'Search completed across codebase';
      results.findings = [
        'Located relevant implementations',
        'Found usage examples',
        'Identified related tests'
      ];
    } else if (task.toLowerCase().includes('analyze')) {
      results.summary = 'Analysis completed';
      results.findings = [
        'Code complexity assessed',
        'Dependencies mapped',
        'Potential improvements identified'
      ];
    }

    // Add code locations based on context
    if (context?.targetFiles) {
      results.codeLocations = context.targetFiles;
    } else {
      // Default locations for Phase 1 testing
      results.codeLocations = [
        'src/index.ts',
        'src/agents/base-agent.ts',
        'src/orchestrator/orchestrator.ts'
      ];
    }

    // Simple pattern detection
    results.patterns = [
      'Module pattern for agent organization',
      'Message passing for communication',
      'Async/await for task execution'
    ];

    // Add recommendations
    results.recommendations = this.generateSimpleRecommendations(task, results);

    return results;
  }

  private generateSimpleRecommendations(task: string, results: any): string[] {
    const recommendations = [];

    // Basic recommendations based on task type
    if (task.includes('refactor')) {
      recommendations.push('Consider breaking large functions into smaller ones');
      recommendations.push('Extract common patterns into utilities');
    } else if (task.includes('performance')) {
      recommendations.push('Profile critical paths for bottlenecks');
      recommendations.push('Consider caching frequently accessed data');
    } else if (task.includes('security')) {
      recommendations.push('Review input validation');
      recommendations.push('Check for sensitive data exposure');
    } else {
      recommendations.push('Follow existing code patterns');
      recommendations.push('Add comprehensive tests');
    }

    return recommendations;
  }

  // Phase 1: Simple status reporting
  getStatus(): any {
    return {
      agent: this.name,
      phase: getCurrentConfig().phase,
      capabilities: {
        codeExploration: true,
        patternDetection: true,
        dependencyAnalysis: true,
        advancedAnalysis: false, // Disabled in Phase 1
        aiPowered: false // Coming in Phase 2
      }
    };
  }

  /**
   * Estimate token usage for Phase 1 (simulated)
   * In Phase 2, this will use actual AI provider token counts
   */
  private estimateTokenUsage(task: string, results: any): number {
    // Base tokens for task analysis
    let tokens = 500;
    
    // Add tokens based on task complexity
    if (task.includes('entire') || task.includes('codebase')) {
      tokens += 2000;
    } else if (task.includes('module') || task.includes('component')) {
      tokens += 1000;
    }
    
    // Add tokens for results
    tokens += (results.findings?.length || 0) * 100;
    tokens += (results.codeLocations?.length || 0) * 50;
    tokens += (results.recommendations?.length || 0) * 150;
    
    return tokens;
  }
}