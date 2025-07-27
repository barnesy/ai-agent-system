import boxen from 'boxen';
import chalk from 'chalk';
import { dashboardAnalyzer } from './dashboard';
import { DashboardData } from './types';

/**
 * Dashboard Viewer
 * Displays metrics in a terminal-friendly format
 */
export class DashboardViewer {
  /**
   * Display the full dashboard
   */
  display(): void {
    const dashboard = dashboardAnalyzer.generateDashboard();
    
    console.clear();
    console.log(this.renderHeader());
    console.log(this.renderSummary(dashboard.summary));
    console.log(this.renderTaskBreakdown(dashboard.taskBreakdown));
    console.log(this.renderTimeAnalysis(dashboard.timeAnalysis));
    console.log(this.renderAgentPerformance(dashboard.agentAnalysis));
    console.log(this.renderProductivityGains(dashboard.summary));
  }

  /**
   * Render dashboard header
   */
  private renderHeader(): string {
    return boxen(
      chalk.bold.blue('AI Agent System Performance Dashboard'),
      {
        padding: 1,
        borderStyle: 'double',
        align: 'center'
      }
    );
  }

  /**
   * Render summary section
   */
  private renderSummary(summary: DashboardData['summary']): string {
    const content = [
      chalk.bold('📊 Executive Summary'),
      '',
      `Total Tasks: ${chalk.green(summary.totalTasks)}`,
      `Avg Time Improvement: ${this.colorizePercentage(summary.averageTimeImprovement)}`,
      `Avg Quality Score: ${this.colorizeScore(summary.averageQualityScore)}/100`,
      `Total Cost Savings: ${chalk.green(`$${summary.totalCostSavings.toFixed(2)}`)}`,
      `User Satisfaction: ${this.colorizeRating(summary.userSatisfaction)}/5`
    ].join('\n');

    return boxen(content, {
      padding: 1,
      borderStyle: 'round',
      title: 'Summary',
      titleAlignment: 'left'
    });
  }

  /**
   * Render task breakdown
   */
  private renderTaskBreakdown(breakdown: DashboardData['taskBreakdown']): string {
    const total = breakdown.bugFixes + breakdown.features + breakdown.reviews + breakdown.custom;
    
    const content = [
      chalk.bold('📋 Task Breakdown'),
      '',
      this.renderBar('Bug Fixes', breakdown.bugFixes, total, '🐛'),
      this.renderBar('Features', breakdown.features, total, '✨'),
      this.renderBar('Reviews', breakdown.reviews, total, '👀'),
      this.renderBar('Custom', breakdown.custom, total, '🔧')
    ].join('\n');

    return boxen(content, {
      padding: 1,
      borderStyle: 'round',
      title: 'Tasks',
      titleAlignment: 'left'
    });
  }

  /**
   * Render time analysis
   */
  private renderTimeAnalysis(analysis: DashboardData['timeAnalysis']): string {
    const content = [
      chalk.bold('⏱️  Time Analysis'),
      '',
      `Average Task Time: ${chalk.yellow(`${analysis.averageTaskTime.toFixed(1)} min`)}`,
      '',
      chalk.bold('By Task Type:'),
      ...Object.entries(analysis.timeByTaskType).map(([type, time]) => 
        `  ${type}: ${chalk.yellow(`${time.toFixed(1)} min`)}`
      )
    ].join('\n');

    return boxen(content, {
      padding: 1,
      borderStyle: 'round',
      title: 'Time',
      titleAlignment: 'left'
    });
  }

  /**
   * Render agent performance
   */
  private renderAgentPerformance(analysis: DashboardData['agentAnalysis']): string {
    const content = [
      chalk.bold('🤖 Agent Performance'),
      '',
      `Most Used: ${chalk.cyan(analysis.mostUsedAgent)}`,
      '',
      ...Object.entries(analysis.agentPerformance).map(([agent, stats]) => [
        chalk.bold.cyan(agent),
        `  Tasks: ${stats.tasksCompleted} | Time: ${stats.averageTime.toFixed(1)}m | Success: ${this.colorizePercentage(stats.successRate)}`
      ]).flat()
    ].join('\n');

    return boxen(content, {
      padding: 1,
      borderStyle: 'round',
      title: 'Agents',
      titleAlignment: 'left'
    });
  }

  /**
   * Render productivity gains
   */
  private renderProductivityGains(summary: DashboardData['summary']): string {
    const progress = Math.min(100, (summary.averageTimeImprovement / 90) * 100);
    const achieved = summary.averageTimeImprovement >= 90;

    const content = [
      chalk.bold('🚀 Productivity Gains'),
      '',
      this.renderProgressBar(progress, achieved),
      '',
      achieved 
        ? chalk.green.bold('✅ 10x Productivity Goal ACHIEVED!')
        : chalk.yellow(`📈 ${progress.toFixed(0)}% of the way to 10x productivity goal`)
    ].join('\n');

    return boxen(content, {
      padding: 1,
      borderStyle: 'double',
      borderColor: achieved ? 'green' : 'yellow'
    });
  }

  /**
   * Render a simple bar chart
   */
  private renderBar(label: string, value: number, total: number, icon: string): string {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    const barLength = 20;
    const filledLength = Math.round((percentage / 100) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    
    return `${icon} ${label.padEnd(10)} ${bar} ${value} (${percentage.toFixed(0)}%)`;
  }

  /**
   * Render a progress bar
   */
  private renderProgressBar(percentage: number, achieved: boolean): string {
    const barLength = 40;
    const filledLength = Math.round((percentage / 100) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    const color = achieved ? chalk.green : chalk.yellow;
    
    return color(`[${bar}] ${percentage.toFixed(0)}%`);
  }

  /**
   * Colorize percentage based on value
   */
  private colorizePercentage(value: number): string {
    if (value >= 90) return chalk.green.bold(`${value.toFixed(1)}%`);
    if (value >= 70) return chalk.yellow(`${value.toFixed(1)}%`);
    return chalk.red(`${value.toFixed(1)}%`);
  }

  /**
   * Colorize score based on value
   */
  private colorizeScore(value: number): string {
    if (value >= 80) return chalk.green.bold(value.toFixed(1));
    if (value >= 60) return chalk.yellow(value.toFixed(1));
    return chalk.red(value.toFixed(1));
  }

  /**
   * Colorize rating based on value
   */
  private colorizeRating(value: number): string {
    if (value >= 4.5) return chalk.green.bold(value.toFixed(1));
    if (value >= 3.5) return chalk.yellow(value.toFixed(1));
    return chalk.red(value.toFixed(1));
  }

  /**
   * Display comparison report
   */
  displayReport(): void {
    const report = dashboardAnalyzer.generateComparisonReport();
    console.log(report);
  }
}

// Singleton instance
export const dashboardViewer = new DashboardViewer();