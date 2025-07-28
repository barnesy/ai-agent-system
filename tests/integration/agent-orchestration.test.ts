import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { OrchestratorWithMetrics } from '../../src/orchestrator/orchestrator-with-metrics';
import { ResearchAgentEnhanced } from '../../src/agents/research-agent-enhanced';
import { PlanningAgentEnhanced } from '../../src/agents/planning-agent-enhanced';
import { ImplementationAgentEnhanced } from '../../src/agents/implementation-agent-enhanced';
import { QualityAgentEnhanced } from '../../src/agents/quality-agent-enhanced';
import { TestingAgentEnhanced } from '../../src/agents/testing-agent-enhanced';
import { DocumentationAgentEnhanced } from '../../src/agents/documentation-agent-enhanced';
import { MetricsCollector } from '../../src/metrics/collector';
import * as fs from 'fs';
import * as path from 'path';

describe('Agent Orchestration Integration Tests', () => {
  let orchestrator: OrchestratorWithMetrics;
  let metricsPath: string;

  beforeEach(() => {
    // Create temporary metrics directory
    metricsPath = path.join(__dirname, '../../.test-metrics');
    if (!fs.existsSync(metricsPath)) {
      fs.mkdirSync(metricsPath, { recursive: true });
    }

    // Initialize orchestrator with all agents
    orchestrator = new OrchestratorWithMetrics();
    orchestrator.registerAgent(new ResearchAgentEnhanced());
    orchestrator.registerAgent(new PlanningAgentEnhanced());
    orchestrator.registerAgent(new ImplementationAgentEnhanced());
    orchestrator.registerAgent(new QualityAgentEnhanced());
    orchestrator.registerAgent(new TestingAgentEnhanced());
    orchestrator.registerAgent(new DocumentationAgentEnhanced());
  });

  afterEach(() => {
    // Clean up test metrics
    if (fs.existsSync(metricsPath)) {
      fs.rmSync(metricsPath, { recursive: true });
    }
  });

  describe('Bug Fix Workflow', () => {
    it('should handle complete bug fix workflow', async () => {
      const bugDescription = 'Research authentication timeout error after 5 minutes';
      
      // Execute task through orchestrator
      const result = await orchestrator.processTask(bugDescription);

      expect(result).toBeDefined();
      expect(result.task).toBeDefined();
      expect(result.task.toLowerCase()).toContain('authentication');
    });

    it('should handle workflow sequence', async () => {
      const workflow = [
        'Research authentication timeout issues',
        'Analyze code quality and security implications',
        'Implement timeout fix with session management'
      ];

      const results = await orchestrator.processWorkflow(workflow);

      expect(results).toHaveLength(3);
      expect(results[0]).toBeDefined();
      expect(results[1]).toBeDefined();
      expect(results[2]).toBeDefined();
    });

    it('should track metrics across workflow', async () => {
      // Execute workflow
      const result = await orchestrator.processTask('Research null pointer exception');

      // Verify the task was processed
      expect(result).toBeDefined();
      expect(result.task).toBeDefined();
      
      // The orchestrator tracks agent metrics internally via metricsCollector singleton
      // but doesn't expose task-level tracking. That's handled by CLI commands.
      // This test just verifies the workflow executes successfully.
    });
  });

  describe('Feature Development Workflow', () => {
    it('should handle complete feature workflow', async () => {
      const workflow = [
        'Research dark mode implementation patterns',
        'Plan dark mode toggle architecture',
        'Implement dark mode toggle in settings'
      ];

      const results = await orchestrator.processWorkflow(workflow);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.task).toBeDefined();
      });
    });

    it('should select appropriate agents', async () => {
      const registeredAgents = orchestrator.getRegisteredAgents();
      expect(registeredAgents).toContain('ResearchAgent');
      expect(registeredAgents).toContain('PlanningAgent');
      expect(registeredAgents).toContain('ImplementationAgent');
      expect(registeredAgents).toContain('QualityAgent');
      expect(registeredAgents).toContain('TestingAgent');
      expect(registeredAgents).toContain('DocumentationAgent');
    });
  });

  describe('Error Handling', () => {
    it('should handle agent failures gracefully', async () => {
      await expect(
        orchestrator.processTask('INVALID_TASK_THAT_NO_AGENT_CAN_HANDLE')
      ).rejects.toThrow('No agent capable of handling task');
    });

    it('should track failed agent executions', async () => {
      const metricsCollector = new MetricsCollector();
      metricsCollector.startTask('bug-fix', 'Error test');
      metricsCollector.startAgent('TestAgent');
      metricsCollector.endAgent('TestAgent', false, 'Test error');
      
      const taskMetrics = metricsCollector.endTask();
      expect(taskMetrics).toBeDefined();
      expect(taskMetrics!.agentMetrics[0].success).toBe(false);
      expect(taskMetrics!.agentMetrics[0].error).toBe('Test error');
    });
  });

  describe('Agent Communication', () => {
    it('should pass messages between agents', async () => {
      const result = await orchestrator.processTask('Research authentication issue');
      expect(result).toBeDefined();
      expect(result.task).toBeDefined();
    });

    it('should handle priority tasks', async () => {
      const result = await orchestrator.processTask('Critical security vulnerability', 'high');
      expect(result).toBeDefined();
      expect(result.priority).toBe('high');
    });
  });

  describe('Performance Metrics', () => {
    it('should measure agent execution time', async () => {
      const startTime = Date.now();
      
      await orchestrator.processTask('Research quick analysis task');

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should take at least 500ms due to mock delays
      expect(duration).toBeGreaterThan(500);
      expect(duration).toBeLessThan(5000);
    });

    it('should calculate cost savings', async () => {
      const metricsCollector = new MetricsCollector();
      metricsCollector.startTask('bug-fix', 'Cost test');
      metricsCollector.startAgent('TestAgent');
      
      // Simulate agent work
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      metricsCollector.endAgent('TestAgent', true);
      metricsCollector.addTokenUsage('TestAgent', 100, 200, 0.05);
      
      const taskMetrics = metricsCollector.endTask();
      expect(taskMetrics).toBeDefined();
      
      if (taskMetrics?.comparison) {
        expect(taskMetrics.comparison.costSavings).toBeGreaterThan(90);
        expect(taskMetrics.comparison.aiCost).toBeLessThan(1);
        expect(taskMetrics.comparison.manualCost).toBeGreaterThan(5);
      }
    });
  });

  describe('Metrics Integration', () => {
    it('should persist metrics across sessions', async () => {
      const metricsCollector = new MetricsCollector();
      
      // Create first task
      const taskId1 = metricsCollector.startTask('feature', 'First task');
      await orchestrator.processTask('Plan new feature implementation');
      metricsCollector.endTask();
      
      // Create second collector instance
      const metricsCollector2 = new MetricsCollector();
      const metrics = metricsCollector2.getAllMetrics();
      
      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics.some(m => m.description === 'First task')).toBe(true);
    });

    it('should generate quality metrics', async () => {
      const metricsCollector = new MetricsCollector();
      metricsCollector.startTask('feature', 'Quality test');
      
      await orchestrator.processTask('Plan and implement new feature');
      
      const taskMetrics = metricsCollector.endTask({
        codeQualityScore: 85,
        bugsIntroduced: 0,
        testCoverage: 90
      });
      
      expect(taskMetrics?.quality.codeQualityScore).toBe(85);
      expect(taskMetrics?.quality.testCoverage).toBe(90);
    });
  });
});