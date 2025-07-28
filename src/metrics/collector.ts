import { TaskMetrics, AgentMetric, QualityMetrics, ComparisonMetrics } from './types';
import { BaseAgent, AgentMessage } from '../agents/base-agent';
import { metricsStorage } from './storage';

/**
 * Metrics Collector
 * Tracks performance metrics for tasks and agents
 */
export class MetricsCollector {
  private currentTask: TaskMetrics | null = null;
  private agentTimers: Map<string, AgentMetric> = new Map();
  private storage: TaskMetrics[] = [];

  constructor() {
    // Load existing metrics from storage
    this.storage = metricsStorage.load();
  }

  /**
   * Start tracking a new task
   */
  startTask(taskType: TaskMetrics['taskType'], description: string): string {
    const taskId = `task-${Date.now()}`;
    
    this.currentTask = {
      id: taskId,
      taskType,
      description,
      startTime: new Date(),
      agentMetrics: [],
      quality: {}
    };

    return taskId;
  }

  /**
   * End the current task
   */
  endTask(quality?: QualityMetrics, comparison?: ComparisonMetrics): TaskMetrics | null {
    if (!this.currentTask) return null;

    this.currentTask.endTime = new Date();
    this.currentTask.duration = this.currentTask.endTime.getTime() - this.currentTask.startTime.getTime();
    
    if (quality) {
      this.currentTask.quality = quality;
    }

    if (comparison) {
      this.currentTask.comparison = comparison;
    }

    // Calculate AI time from agent metrics
    if (!this.currentTask.comparison && this.currentTask.agentMetrics.length > 0) {
      const aiTimeMs = this.currentTask.agentMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
      const aiTimeMinutes = Math.max(0.1, aiTimeMs / 1000 / 60); // Minimum 0.1 minutes (6 seconds)
      
      // Estimate manual time (10x slower as baseline, minimum 5 minutes for any task)
      const estimatedManualTime = Math.max(5, aiTimeMinutes * 10);
      
      // Ensure time improvement is reasonable (cap at 95%)
      const timeImprovement = Math.min(95, ((estimatedManualTime - aiTimeMinutes) / estimatedManualTime) * 100);
      
      // Calculate costs with reasonable minimums
      const aiCost = Math.max(0.01, this.calculateTotalCost()); // Minimum $0.01
      const manualCost = estimatedManualTime * (100 / 60); // $100/hour
      
      this.currentTask.comparison = {
        manualTime: estimatedManualTime,
        aiTime: aiTimeMinutes,
        timeImprovement: timeImprovement,
        aiQuality: this.currentTask.quality,
        aiCost: aiCost,
        manualCost: manualCost,
        costSavings: ((manualCost - aiCost) / manualCost) * 100
      };
    }

    this.storage.push(this.currentTask);
    // Persist to disk
    metricsStorage.append(this.currentTask);
    
    const task = this.currentTask;
    this.currentTask = null;
    this.agentTimers.clear();

    return task;
  }

  /**
   * Track agent execution
   */
  startAgent(agentName: string): void {
    if (!this.currentTask) return;

    const metric: AgentMetric = {
      agentName,
      startTime: new Date(),
      success: false
    };

    this.agentTimers.set(agentName, metric);
  }

  /**
   * End agent execution
   */
  endAgent(agentName: string, success: boolean = true, error?: string): void {
    if (!this.currentTask) return;

    const metric = this.agentTimers.get(agentName);
    if (!metric) return;

    metric.endTime = new Date();
    metric.duration = metric.endTime.getTime() - metric.startTime.getTime();
    metric.success = success;
    metric.error = error;

    this.currentTask.agentMetrics.push(metric);
    this.agentTimers.delete(agentName);
  }

  /**
   * Add token usage for an agent
   */
  addTokenUsage(agentName: string, input: number, output: number, cost: number): void {
    if (!this.currentTask) return;

    const metric = this.currentTask.agentMetrics.find(m => m.agentName === agentName);
    if (metric) {
      metric.tokenUsage = { input, output, cost };
    }
  }

  /**
   * Rate the task
   */
  rateTask(taskId: string, rating: number, feedback?: string): void {
    const task = this.storage.find(t => t.id === taskId);
    if (task) {
      task.userRating = rating;
      task.userFeedback = feedback;
      // Update storage
      metricsStorage.save(this.storage);
    }
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): TaskMetrics[] {
    return [...this.storage];
  }

  /**
   * Get metrics for a specific task
   */
  getTaskMetrics(taskId: string): TaskMetrics | undefined {
    return this.storage.find(t => t.id === taskId);
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.storage = [];
    this.currentTask = null;
    this.agentTimers.clear();
    metricsStorage.clear();
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics(): string {
    return JSON.stringify(this.storage, null, 2);
  }

  /**
   * Import metrics from JSON
   */
  importMetrics(json: string): void {
    try {
      const imported = JSON.parse(json);
      if (Array.isArray(imported)) {
        this.storage = imported;
      }
    } catch (error) {
      console.error('Failed to import metrics:', error);
    }
  }

  /**
   * Calculate total cost from agent metrics
   */
  private calculateTotalCost(): number {
    if (!this.currentTask) return 0;
    
    return this.currentTask.agentMetrics.reduce((sum, metric) => {
      return sum + (metric.tokenUsage?.cost || 0);
    }, 0);
  }
}

// Singleton instance
export const metricsCollector = new MetricsCollector();