import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { MetricsCollector } from '../../src/metrics/collector';
import { MetricsDashboard } from '../../src/metrics/dashboard';
import * as fs from 'fs';
import * as path from 'path';

describe('Metrics Tracking Integration Tests', () => {
  let metricsCollector: MetricsCollector;
  let dashboard: MetricsDashboard;
  const testMetricsPath = path.join(__dirname, '../../.test-metrics');

  beforeEach(() => {
    // Create test metrics directory
    if (!fs.existsSync(testMetricsPath)) {
      fs.mkdirSync(testMetricsPath, { recursive: true });
    }
    
    // Initialize with test path
    process.env.METRICS_PATH = testMetricsPath;
    metricsCollector = new MetricsCollector();
    dashboard = new MetricsDashboard();
  });

  afterEach(() => {
    // Clean up
    if (fs.existsSync(testMetricsPath)) {
      fs.rmSync(testMetricsPath, { recursive: true });
    }
    delete process.env.METRICS_PATH;
  });

  describe('Metrics Collection', () => {
    it('should track complete task lifecycle', async () => {
      const taskId = metricsCollector.startTask('bug-fix', 'Test bug fix');
      
      // Simulate agent work
      metricsCollector.startAgent('ResearchAgent');
      await new Promise(resolve => setTimeout(resolve, 100));
      metricsCollector.endAgent('ResearchAgent', true);
      metricsCollector.addTokenUsage('ResearchAgent', 50, 100, 0.015);
      
      metricsCollector.startAgent('ImplementationAgent');
      await new Promise(resolve => setTimeout(resolve, 150));
      metricsCollector.endAgent('ImplementationAgent', true);
      metricsCollector.addTokenUsage('ImplementationAgent', 75, 150, 0.022);
      
      // End task
      const taskMetric = metricsCollector.endTask();
      
      expect(taskMetric).toBeDefined();
      expect(taskMetric!.id).toBe(taskId);
      expect(taskMetric!.agentMetrics.length).toBe(2);
      expect(taskMetric!.duration).toBeGreaterThan(250);
    });

    it('should persist metrics to file', () => {
      const taskId = metricsCollector.startTask('feature', 'Test feature');
      metricsCollector.startAgent('PlanningAgent');
      metricsCollector.endAgent('PlanningAgent', true);
      metricsCollector.endTask();
      
      const metricsFile = path.join(testMetricsPath, 'metrics.json');
      expect(fs.existsSync(metricsFile)).toBe(true);
      
      const savedMetrics = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
      expect(savedMetrics.length).toBeGreaterThan(0);
      expect(savedMetrics[savedMetrics.length - 1].taskType).toBe('feature');
    });

    it('should handle concurrent agents', async () => {
      const taskId = metricsCollector.startTask('bug-fix', 'Concurrent test');
      
      // Start multiple agents
      metricsCollector.startAgent('ResearchAgent');
      metricsCollector.startAgent('QualityAgent');
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // End agents
      metricsCollector.endAgent('ResearchAgent', true);
      metricsCollector.endAgent('QualityAgent', true);
      
      const taskMetric = metricsCollector.endTask();
      expect(taskMetric!.agentMetrics.length).toBe(2);
    });
  });

  describe('Quality Metrics', () => {
    it('should track code quality scores', () => {
      const taskId = metricsCollector.startTask('feature', 'Quality feature');
      metricsCollector.startAgent('QualityAgent');
      metricsCollector.endAgent('QualityAgent', true);
      
      const taskMetric = metricsCollector.endTask({
        codeQualityScore: 92,
        bugsIntroduced: 0,
        testCoverage: 85
      });
      
      expect(taskMetric!.quality.codeQualityScore).toBe(92);
      expect(taskMetric!.quality.testCoverage).toBe(85);
      expect(taskMetric!.quality.bugsIntroduced).toBe(0);
    });
  });

  describe('Cost Calculations', () => {
    it('should calculate accurate cost savings', async () => {
      const taskId = metricsCollector.startTask('bug-fix', 'Cost test bug');
      
      // Simulate realistic agent work
      const agents = [
        { name: 'ResearchAgent', time: 100, tokens: { input: 100, output: 200, cost: 0.03 } },
        { name: 'QualityAgent', time: 80, tokens: { input: 80, output: 160, cost: 0.024 } },
        { name: 'ImplementationAgent', time: 150, tokens: { input: 150, output: 300, cost: 0.045 } }
      ];
      
      for (const agent of agents) {
        metricsCollector.startAgent(agent.name);
        await new Promise(resolve => setTimeout(resolve, agent.time));
        metricsCollector.endAgent(agent.name, true);
        metricsCollector.addTokenUsage(
          agent.name,
          agent.tokens.input,
          agent.tokens.output,
          agent.tokens.cost
        );
      }
      
      const taskMetric = metricsCollector.endTask();
      
      expect(taskMetric!.comparison).toBeDefined();
      expect(taskMetric!.comparison!.aiCost).toBeCloseTo(0.099, 3);
      expect(taskMetric!.comparison!.manualCost).toBeGreaterThan(5);
      expect(taskMetric!.comparison!.costSavings).toBeGreaterThan(90);
      expect(taskMetric!.comparison!.timeImprovement).toBeGreaterThan(90);
    });

    it('should handle edge cases in calculations', () => {
      const taskId = metricsCollector.startTask('feature', 'Edge case');
      
      // Very fast execution
      metricsCollector.startAgent('FastAgent');
      metricsCollector.endAgent('FastAgent', true);
      const taskMetric = metricsCollector.endTask();
      
      // Should have minimum values
      expect(taskMetric!.comparison!.aiTime).toBeGreaterThanOrEqual(0.1);
      expect(taskMetric!.comparison!.manualTime).toBeGreaterThanOrEqual(5);
      expect(taskMetric!.comparison!.timeImprovement).toBeLessThanOrEqual(95);
    });
  });

  describe('Dashboard Display', () => {
    it('should generate summary statistics', () => {
      // Create multiple tasks
      for (let i = 0; i < 5; i++) {
        const taskId = metricsCollector.startTask(
          i % 2 === 0 ? 'bug-fix' : 'feature',
          `Task ${i}`
        );
        metricsCollector.startAgent('TestAgent');
        metricsCollector.endAgent('TestAgent', true);
        metricsCollector.addTokenUsage('TestAgent', 50, 100, 0.015);
        metricsCollector.endTask();
      }
      
      const summary = dashboard.generateSummary();
      
      expect(summary.totalTasks).toBe(5);
      expect(summary.tasksByType['bug-fix']).toBe(3);
      expect(summary.tasksByType['feature']).toBe(2);
      expect(summary.timeSaved).toBeGreaterThan(0);
      expect(summary.costSavings).toBeGreaterThan(0);
    });

    it('should export metrics in different formats', () => {
      const taskId = metricsCollector.startTask('feature', 'Export test');
      metricsCollector.endTask();
      
      // Test JSON export
      const jsonExport = dashboard.exportMetrics('json');
      const jsonData = JSON.parse(jsonExport);
      expect(jsonData.metrics).toBeDefined();
      expect(jsonData.summary).toBeDefined();
      
      // Test CSV export
      const csvExport = dashboard.exportMetrics('csv');
      expect(csvExport).toContain('Task ID,Type,Description');
      expect(csvExport).toContain('feature,Export test');
      
      // Test HTML export
      const htmlExport = dashboard.exportMetrics('html');
      expect(htmlExport).toContain('<html>');
      expect(htmlExport).toContain('AI Agent System Metrics Report');
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of metrics efficiently', () => {
      const startTime = Date.now();
      
      // Create 100 tasks
      for (let i = 0; i < 100; i++) {
        const taskId = metricsCollector.startTask('feature', `Performance test ${i}`);
        metricsCollector.startAgent('TestAgent');
        metricsCollector.endAgent('TestAgent', true);
        metricsCollector.endTask();
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete in reasonable time
      expect(duration).toBeLessThan(1000);
      
      // Should still be able to retrieve metrics
      const metrics = metricsCollector.getAllMetrics();
      expect(metrics.length).toBe(100);
    });
  });

  describe('Metrics Persistence', () => {
    it('should load existing metrics on initialization', () => {
      // Create some metrics with first collector
      const collector1 = new MetricsCollector();
      collector1.startTask('feature', 'First task');
      collector1.endTask();
      
      // Create new collector - should load existing metrics
      const collector2 = new MetricsCollector();
      const metrics = collector2.getAllMetrics();
      
      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics.some(m => m.description === 'First task')).toBe(true);
    });

    it('should append new metrics to existing ones', () => {
      const collector1 = new MetricsCollector();
      collector1.startTask('bug-fix', 'Bug 1');
      collector1.endTask();
      
      const collector2 = new MetricsCollector();
      collector2.startTask('feature', 'Feature 1');
      collector2.endTask();
      
      const allMetrics = collector2.getAllMetrics();
      expect(allMetrics.length).toBe(2);
      expect(allMetrics[0].description).toBe('Bug 1');
      expect(allMetrics[1].description).toBe('Feature 1');
    });
  });
});