#!/usr/bin/env node

/**
 * Simple metrics dashboard for Phase 1 pilot testing
 * Provides visual representation of key metrics
 */

import chalk from 'chalk';
import boxen from 'boxen';
import { getTokenTracker } from '../metrics/token-tracker';
import { getCurrentConfig, evaluatePhaseTransition } from '../config';

function createProgressBar(value: number, max: number, width: number = 20): string {
  const percentage = Math.min(value / max, 1);
  const filled = Math.round(percentage * width);
  const empty = width - filled;
  
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  const color = percentage >= 0.9 ? chalk.green : percentage >= 0.5 ? chalk.yellow : chalk.red;
  
  return color(bar) + ` ${Math.round(percentage * 100)}%`;
}

function formatTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function showDashboard() {
  console.clear();
  
  const tracker = getTokenTracker();
  const metrics = tracker.getMetrics();
  const roi = tracker.getROIMetrics();
  const config = getCurrentConfig();
  
  // Header
  console.log(boxen(
    chalk.bold.blue('AI Agent System - Phase 1 Dashboard\n') +
    chalk.gray(`Live Metrics · ${new Date().toLocaleTimeString()}`),
    { 
      padding: 1, 
      margin: 1, 
      borderStyle: 'double',
      borderColor: 'blue'
    }
  ));

  // Key Metrics
  console.log(chalk.bold('\n📊 Key Metrics\n'));
  
  const metricsData = [
    {
      label: 'Tasks Completed',
      value: metrics.tasksCompleted,
      target: 10,
      format: (v: number) => v.toString()
    },
    {
      label: 'Time Reduction',
      value: roi.averageTimeSavedPercent,
      target: config.metrics.targetTimeReduction,
      format: (v: number) => `${v.toFixed(1)}%`
    },
    {
      label: 'Token Multiplier',
      value: metrics.tokenMultiplier,
      target: config.metrics.maxTokenMultiplier,
      format: (v: number) => `${v.toFixed(1)}x`,
      inverse: true // Lower is better
    },
    {
      label: 'Est. ROI',
      value: roi.estimatedROI,
      target: 300,
      format: (v: number) => `${v.toFixed(0)}%`
    }
  ];

  metricsData.forEach(({ label, value, target, format, inverse }) => {
    const progress = inverse ? (target - value) / target : value / target;
    console.log(
      `${label.padEnd(20)} ${format(value).padStart(8)} ` +
      createProgressBar(progress * 100, 100, 15) +
      chalk.gray(` (target: ${format(target)})`)
    );
  });

  // Agent Usage
  console.log(chalk.bold('\n🤖 Agent Usage\n'));
  Object.entries(metrics.tokensByAgent).forEach(([agent, tokens]) => {
    const percentage = (tokens / metrics.totalTokens) * 100;
    console.log(
      `${agent.padEnd(20)} ${tokens.toLocaleString().padStart(8)} tokens ` +
      createProgressBar(percentage, 100, 15)
    );
  });

  // Time Savings
  console.log(chalk.bold('\n⏱️  Time Analysis\n'));
  console.log(`Total time saved: ${chalk.green(formatTime(roi.totalTimeSavedMs))}`);
  console.log(`Average per task: ${chalk.green(formatTime(roi.totalTimeSavedMs / Math.max(metrics.tasksCompleted, 1)))}`);
  console.log(`Efficiency gain: ${chalk.green(roi.averageTimeSavedPercent.toFixed(1) + '%')}`);

  // Phase Readiness
  console.log(chalk.bold('\n✅ Phase 2 Readiness\n'));
  
  const transition = evaluatePhaseTransition({
    timeReduction: roi.averageTimeSavedPercent,
    successRate: 95, // Hardcoded for now, would track failures in real system
    tokenMultiplier: metrics.tokenMultiplier,
    userSatisfactionScore: 8 // Hardcoded, would come from feedback
  });

  Object.entries(transition.criteria).forEach(([criterion, met]) => {
    const icon = met ? chalk.green('✓') : chalk.red('✗');
    const label = criterion.replace(/([A-Z])/g, ' $1').toLowerCase();
    console.log(`${icon} ${label}`);
  });

  if (transition.canTransition) {
    console.log(boxen(
      chalk.green.bold('🎉 Ready for Phase 2!'),
      { padding: 1, borderColor: 'green' }
    ));
  } else {
    console.log(boxen(
      chalk.yellow('📈 Keep testing to meet Phase 2 criteria'),
      { padding: 1, borderColor: 'yellow' }
    ));
  }

  // Recent Tasks (if we had task history)
  console.log(chalk.bold('\n📝 Recent Activity\n'));
  console.log(chalk.gray('(Task history not implemented in Phase 1)'));

  // Tips
  if (metrics.tasksCompleted < 5) {
    console.log(chalk.yellow('\n💡 Tip: Complete more tasks to get meaningful metrics'));
  }
  if (metrics.tokenMultiplier > 3) {
    console.log(chalk.yellow('\n💡 Tip: Token usage is high - try simpler task descriptions'));
  }
  if (roi.averageTimeSavedPercent < 30) {
    console.log(chalk.yellow('\n💡 Tip: Focus on more complex tasks to see bigger time savings'));
  }

  // Footer
  console.log(chalk.gray('\n─'.repeat(60)));
  console.log(chalk.gray('Press Ctrl+C to exit · Run tasks in another terminal'));
}

// Auto-refresh every 5 seconds
console.log('Starting dashboard...');
showDashboard();
setInterval(showDashboard, 5000);

// Handle graceful exit
process.on('SIGINT', () => {
  console.log(chalk.gray('\n\nDashboard closed'));
  process.exit(0);
});