import { TaskMetrics, DashboardData } from './types';
import { metricsStorage } from './storage';

/**
 * Dashboard Analyzer
 * Generates dashboard data from stored metrics
 */
export class DashboardAnalyzer {
  /**
   * Generate complete dashboard data
   */
  generateDashboard(): DashboardData {
    const metrics = metricsStorage.load();
    
    return {
      summary: this.generateSummary(metrics),
      taskBreakdown: this.generateTaskBreakdown(metrics),
      timeAnalysis: this.generateTimeAnalysis(metrics),
      qualityAnalysis: this.generateQualityAnalysis(metrics),
      agentAnalysis: this.generateAgentAnalysis(metrics)
    };
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(metrics: TaskMetrics[]): DashboardData['summary'] {
    if (metrics.length === 0) {
      return {
        totalTasks: 0,
        averageTimeImprovement: 0,
        averageQualityScore: 0,
        totalCostSavings: 0,
        userSatisfaction: 0
      };
    }

    const completedTasks = metrics.filter(m => m.endTime);
    const withComparisons = completedTasks.filter(m => m.comparison);
    const withQuality = completedTasks.filter(m => m.quality.codeQualityScore);
    const withRatings = completedTasks.filter(m => m.userRating);

    const avgTimeImprovement = withComparisons.length > 0
      ? withComparisons.reduce((sum, m) => sum + (m.comparison?.timeImprovement || 0), 0) / withComparisons.length
      : 0;

    const avgQuality = withQuality.length > 0
      ? withQuality.reduce((sum, m) => sum + (m.quality.codeQualityScore || 0), 0) / withQuality.length
      : 0;

    const totalSavings = withComparisons.reduce((sum, m) => {
      const manualCost = m.comparison?.manualCost || 0;
      const aiCost = m.comparison?.aiCost || 0;
      return sum + (manualCost - aiCost);
    }, 0);

    const avgRating = withRatings.length > 0
      ? withRatings.reduce((sum, m) => sum + (m.userRating || 0), 0) / withRatings.length
      : 0;

    return {
      totalTasks: completedTasks.length,
      averageTimeImprovement: avgTimeImprovement,
      averageQualityScore: avgQuality,
      totalCostSavings: totalSavings,
      userSatisfaction: avgRating
    };
  }

  /**
   * Generate task breakdown by type
   */
  private generateTaskBreakdown(metrics: TaskMetrics[]): DashboardData['taskBreakdown'] {
    const breakdown = {
      bugFixes: 0,
      features: 0,
      reviews: 0,
      custom: 0
    };

    metrics.forEach(m => {
      switch (m.taskType) {
        case 'bug-fix':
          breakdown.bugFixes++;
          break;
        case 'feature':
          breakdown.features++;
          break;
        case 'review':
          breakdown.reviews++;
          break;
        case 'custom':
          breakdown.custom++;
          break;
      }
    });

    return breakdown;
  }

  /**
   * Generate time analysis
   */
  private generateTimeAnalysis(metrics: TaskMetrics[]): DashboardData['timeAnalysis'] {
    const completedTasks = metrics.filter(m => m.duration);
    
    if (completedTasks.length === 0) {
      return {
        averageTaskTime: 0,
        fastestTask: {} as TaskMetrics,
        slowestTask: {} as TaskMetrics,
        timeByTaskType: {}
      };
    }

    const avgTime = completedTasks.reduce((sum, m) => sum + (m.duration || 0), 0) / completedTasks.length;
    
    const sortedByTime = [...completedTasks].sort((a, b) => (a.duration || 0) - (b.duration || 0));
    const fastest = sortedByTime[0];
    const slowest = sortedByTime[sortedByTime.length - 1];

    // Time by task type
    const timeByType: Record<string, number> = {};
    completedTasks.forEach(m => {
      if (!timeByType[m.taskType]) {
        timeByType[m.taskType] = 0;
      }
      timeByType[m.taskType] += (m.duration || 0) / 1000 / 60; // minutes
    });

    return {
      averageTaskTime: avgTime / 1000 / 60, // minutes
      fastestTask: fastest,
      slowestTask: slowest,
      timeByTaskType: timeByType
    };
  }

  /**
   * Generate quality analysis
   */
  private generateQualityAnalysis(metrics: TaskMetrics[]): DashboardData['qualityAnalysis'] {
    const withQuality = metrics.filter(m => m.quality.codeQualityScore);
    
    if (withQuality.length === 0) {
      return {
        averageQualityScore: 0,
        qualityTrend: [],
        bestQualityTask: {} as TaskMetrics
      };
    }

    const avgQuality = withQuality.reduce((sum, m) => sum + (m.quality.codeQualityScore || 0), 0) / withQuality.length;
    
    // Generate trend data
    const trend = withQuality.map(m => ({
      date: m.startTime,
      score: m.quality.codeQualityScore || 0
    }));

    // Find best quality task
    const bestQuality = withQuality.reduce((best, current) => {
      const currentScore = current.quality.codeQualityScore || 0;
      const bestScore = best.quality.codeQualityScore || 0;
      return currentScore > bestScore ? current : best;
    });

    return {
      averageQualityScore: avgQuality,
      qualityTrend: trend,
      bestQualityTask: bestQuality
    };
  }

  /**
   * Generate agent analysis
   */
  private generateAgentAnalysis(metrics: TaskMetrics[]): DashboardData['agentAnalysis'] {
    const agentStats: Record<string, {
      tasksCompleted: number;
      totalTime: number;
      successCount: number;
      totalCount: number;
    }> = {};

    // Collect agent statistics
    metrics.forEach(task => {
      task.agentMetrics.forEach(agent => {
        if (!agentStats[agent.agentName]) {
          agentStats[agent.agentName] = {
            tasksCompleted: 0,
            totalTime: 0,
            successCount: 0,
            totalCount: 0
          };
        }

        const stats = agentStats[agent.agentName];
        stats.totalCount++;
        stats.totalTime += agent.duration || 0;
        if (agent.success) {
          stats.successCount++;
          stats.tasksCompleted++;
        }
      });
    });

    // Convert to required format
    const agentPerformance: Record<string, {
      tasksCompleted: number;
      averageTime: number;
      successRate: number;
    }> = {};

    Object.entries(agentStats).forEach(([agent, stats]) => {
      agentPerformance[agent] = {
        tasksCompleted: stats.tasksCompleted,
        averageTime: stats.totalCount > 0 ? stats.totalTime / stats.totalCount / 1000 / 60 : 0, // minutes
        successRate: stats.totalCount > 0 ? (stats.successCount / stats.totalCount) * 100 : 0
      };
    });

    // Find most used agent
    const mostUsed = Object.entries(agentStats).reduce((most, [agent, stats]) => {
      return stats.totalCount > (agentStats[most]?.totalCount || 0) ? agent : most;
    }, '');

    return {
      mostUsedAgent: mostUsed,
      agentPerformance
    };
  }

  /**
   * Generate comparison report
   */
  generateComparisonReport(): string {
    const dashboard = this.generateDashboard();
    const { summary, taskBreakdown, timeAnalysis, agentAnalysis } = dashboard;

    const report = [
      '# AI Agent System Performance Report',
      '',
      '## Executive Summary',
      `- Total Tasks Completed: ${summary.totalTasks}`,
      `- Average Time Improvement: ${summary.averageTimeImprovement.toFixed(1)}%`,
      `- Average Quality Score: ${summary.averageQualityScore.toFixed(1)}/100`,
      `- Total Cost Savings: $${summary.totalCostSavings.toFixed(2)}`,
      `- User Satisfaction: ${summary.userSatisfaction.toFixed(1)}/5`,
      '',
      '## Task Breakdown',
      `- Bug Fixes: ${taskBreakdown.bugFixes}`,
      `- Features: ${taskBreakdown.features}`,
      `- Code Reviews: ${taskBreakdown.reviews}`,
      `- Custom Tasks: ${taskBreakdown.custom}`,
      '',
      '## Time Analysis',
      `- Average Task Time: ${timeAnalysis.averageTaskTime.toFixed(1)} minutes`,
      '',
      '### Time by Task Type',
      ...Object.entries(timeAnalysis.timeByTaskType).map(([type, time]) => 
        `- ${type}: ${time.toFixed(1)} minutes`
      ),
      '',
      '## Agent Performance',
      `- Most Used Agent: ${agentAnalysis.mostUsedAgent}`,
      '',
      '### Agent Statistics',
      ...Object.entries(agentAnalysis.agentPerformance).map(([agent, stats]) => [
        `#### ${agent}`,
        `- Tasks Completed: ${stats.tasksCompleted}`,
        `- Average Time: ${stats.averageTime.toFixed(1)} minutes`,
        `- Success Rate: ${stats.successRate.toFixed(1)}%`,
        ''
      ]).flat(),
      '',
      '## Productivity Gains',
      `Based on our metrics, the AI agent system has achieved:`,
      `- **${summary.averageTimeImprovement.toFixed(1)}%** reduction in task completion time`,
      `- **$${summary.totalCostSavings.toFixed(2)}** in cost savings`,
      `- **${summary.averageQualityScore.toFixed(1)}/100** average code quality score`,
      '',
      '## Conclusion',
      summary.averageTimeImprovement >= 90 
        ? '✅ We have achieved our goal of 10x productivity improvement!'
        : `📈 We are ${(summary.averageTimeImprovement / 90 * 100).toFixed(0)}% of the way to our 10x productivity goal.`
    ];

    return report.join('\n');
  }
}

// Singleton instance
export const dashboardAnalyzer = new DashboardAnalyzer();