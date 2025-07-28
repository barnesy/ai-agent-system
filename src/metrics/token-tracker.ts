/**
 * Token Usage Tracking for ROI Measurement
 * Tracks token consumption across agents to ensure we stay within phase limits
 */

import { getCurrentConfig } from '../config';
import * as fs from 'fs';
import * as path from 'path';

interface TokenUsage {
  agent: string;
  task: string;
  tokens: number;
  timestamp: Date;
  phase: number;
  executionTimeMs: number;
}

interface TokenMetrics {
  totalTokens: number;
  tokensByAgent: Record<string, number>;
  averageTokensPerTask: number;
  tokenMultiplier: number; // vs baseline
  tasksCompleted: number;
}

export class TokenTracker {
  private usageHistory: TokenUsage[] = [];
  private metricsPath: string;
  private baselineTokensPerTask = 1000; // Baseline for single chat interaction

  constructor(metricsPath: string = './metrics') {
    this.metricsPath = metricsPath;
    this.loadHistory();
  }

  /**
   * Track token usage for a task
   */
  trackUsage(
    agent: string, 
    task: string, 
    tokens: number, 
    executionTimeMs: number
  ): void {
    const usage: TokenUsage = {
      agent,
      task,
      tokens,
      timestamp: new Date(),
      phase: getCurrentConfig().phase,
      executionTimeMs
    };

    this.usageHistory.push(usage);
    this.saveHistory();

    // Check if we're exceeding phase limits
    const metrics = this.getMetrics();
    const phaseLimit = getCurrentConfig().metrics.maxTokenMultiplier;
    
    if (metrics.tokenMultiplier > phaseLimit) {
      console.warn(`⚠️  Token usage (${metrics.tokenMultiplier}x) exceeds Phase ${getCurrentConfig().phase} limit (${phaseLimit}x)`);
    }
  }

  /**
   * Get current token metrics
   */
  getMetrics(): TokenMetrics {
    const totalTokens = this.usageHistory.reduce((sum, u) => sum + u.tokens, 0);
    const tasksCompleted = this.usageHistory.length;
    
    // Calculate tokens by agent
    const tokensByAgent: Record<string, number> = {};
    this.usageHistory.forEach(usage => {
      tokensByAgent[usage.agent] = (tokensByAgent[usage.agent] || 0) + usage.tokens;
    });

    // Calculate average and multiplier
    const averageTokensPerTask = tasksCompleted > 0 ? totalTokens / tasksCompleted : 0;
    const tokenMultiplier = averageTokensPerTask / this.baselineTokensPerTask;

    return {
      totalTokens,
      tokensByAgent,
      averageTokensPerTask,
      tokenMultiplier,
      tasksCompleted
    };
  }

  /**
   * Get ROI metrics
   */
  getROIMetrics(): {
    totalTimeSavedMs: number;
    averageTimeSavedPercent: number;
    tokenCostPerHourSaved: number;
    estimatedROI: number;
  } {
    // Estimate manual time (5 minutes per simple task, 30 for complex)
    const estimatedManualTimeMs = this.usageHistory.reduce((sum, usage) => {
      const isComplex = usage.task.includes('feature') || usage.task.includes('refactor');
      return sum + (isComplex ? 30 * 60 * 1000 : 5 * 60 * 1000);
    }, 0);

    const actualTimeMs = this.usageHistory.reduce((sum, u) => sum + u.executionTimeMs, 0);
    const totalTimeSavedMs = estimatedManualTimeMs - actualTimeMs;
    const averageTimeSavedPercent = estimatedManualTimeMs > 0 
      ? (totalTimeSavedMs / estimatedManualTimeMs) * 100 
      : 0;

    // Calculate token cost per hour saved
    const hoursSaved = totalTimeSavedMs / (1000 * 60 * 60);
    const totalTokens = this.getMetrics().totalTokens;
    const tokenCostPerHourSaved = hoursSaved > 0 ? totalTokens / hoursSaved : 0;

    // Estimate ROI (assuming $150/hour developer cost, $0.01 per 1000 tokens)
    const developerHourlyCost = 150;
    const tokenCostPer1000 = 0.01;
    const totalTokenCost = (totalTokens / 1000) * tokenCostPer1000;
    const totalValueSaved = hoursSaved * developerHourlyCost;
    const estimatedROI = totalTokenCost > 0 
      ? ((totalValueSaved - totalTokenCost) / totalTokenCost) * 100 
      : 0;

    return {
      totalTimeSavedMs,
      averageTimeSavedPercent,
      tokenCostPerHourSaved,
      estimatedROI
    };
  }

  /**
   * Generate summary report
   */
  generateReport(): string {
    const metrics = this.getMetrics();
    const roi = this.getROIMetrics();
    const config = getCurrentConfig();

    return `
=== Token Usage Report - Phase ${config.phase} ===

Token Metrics:
- Total tokens used: ${metrics.totalTokens.toLocaleString()}
- Tasks completed: ${metrics.tasksCompleted}
- Average tokens/task: ${Math.round(metrics.averageTokensPerTask).toLocaleString()}
- Token multiplier: ${metrics.tokenMultiplier.toFixed(1)}x baseline
- Phase ${config.phase} limit: ${config.metrics.maxTokenMultiplier}x

Token Usage by Agent:
${Object.entries(metrics.tokensByAgent)
  .map(([agent, tokens]) => `- ${agent}: ${tokens.toLocaleString()} tokens`)
  .join('\n')}

ROI Metrics:
- Time saved: ${Math.round(roi.totalTimeSavedMs / 1000 / 60)} minutes
- Average time reduction: ${roi.averageTimeSavedPercent.toFixed(1)}%
- Tokens per hour saved: ${Math.round(roi.tokenCostPerHourSaved).toLocaleString()}
- Estimated ROI: ${roi.estimatedROI.toFixed(0)}%

Phase Transition Readiness:
${roi.averageTimeSavedPercent >= config.metrics.targetTimeReduction ? '✅' : '❌'} Time reduction target (${config.metrics.targetTimeReduction}%)
${metrics.tokenMultiplier <= config.metrics.maxTokenMultiplier ? '✅' : '❌'} Token usage within limits
${metrics.tasksCompleted >= 10 ? '✅' : '❌'} Sufficient task sample size
`;
  }

  /**
   * Reset metrics (for testing)
   */
  reset(): void {
    this.usageHistory = [];
    this.saveHistory();
  }

  private loadHistory(): void {
    try {
      const historyPath = path.join(this.metricsPath, 'token-usage.json');
      if (fs.existsSync(historyPath)) {
        const data = fs.readFileSync(historyPath, 'utf-8');
        this.usageHistory = JSON.parse(data).map((u: any) => ({
          ...u,
          timestamp: new Date(u.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load token history:', error);
    }
  }

  private saveHistory(): void {
    try {
      const historyPath = path.join(this.metricsPath, 'token-usage.json');
      fs.mkdirSync(this.metricsPath, { recursive: true });
      fs.writeFileSync(historyPath, JSON.stringify(this.usageHistory, null, 2));
    } catch (error) {
      console.error('Failed to save token history:', error);
    }
  }
}

// Singleton instance
let tracker: TokenTracker | null = null;

export function getTokenTracker(): TokenTracker {
  if (!tracker) {
    tracker = new TokenTracker(process.env.METRICS_STORAGE_PATH || './metrics');
  }
  return tracker;
}