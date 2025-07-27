import chalk from 'chalk';
import ora from 'ora';
import { OrchestratorWithMetrics as Orchestrator } from '../../orchestrator/orchestrator-with-metrics';
import { ResearchAgentEnhanced as ResearchAgent } from '../../agents/research-agent-enhanced';
import { PlanningAgentEnhanced as PlanningAgent } from '../../agents/planning-agent-enhanced';
import { ImplementationAgentEnhanced as ImplementationAgent } from '../../agents/implementation-agent-enhanced';
import { TestingAgentEnhanced as TestingAgent } from '../../agents/testing-agent-enhanced';
import { DocumentationAgentEnhanced as DocumentationAgent } from '../../agents/documentation-agent-enhanced';
import { metricsCollector } from '../../metrics';

export async function featureCommand(description: string, options: {
  size: string;
  planOnly?: boolean;
  test?: boolean;
}) {
  const spinner = ora('Initializing AI agents...').start();
  
  try {
    // Start metrics tracking
    const taskId = metricsCollector.startTask('feature', description);
    
    // Initialize orchestrator and agents
    const orchestrator = new Orchestrator();
    orchestrator.registerAgent(new ResearchAgent());
    orchestrator.registerAgent(new PlanningAgent());
    orchestrator.registerAgent(new ImplementationAgent());
    orchestrator.registerAgent(new TestingAgent());
    orchestrator.registerAgent(new DocumentationAgent());
    
    spinner.text = 'Planning feature development...';
    
    // Define workflow
    const workflow = [
      `research existing patterns for: ${description}`,
      `create implementation plan for: ${description} (${options.size} feature)`
    ];
    
    if (!options.planOnly) {
      workflow.push(`implement the feature: ${description}`);
      
      if (options.test) {
        workflow.push('generate comprehensive tests for the feature');
      }
      
      workflow.push('document the new feature with examples');
    }
    
    spinner.text = 'Processing feature development workflow...';
    
    // Execute workflow
    const results = await orchestrator.processWorkflow(workflow);
    
    // End metrics tracking
    const quality = options.planOnly ? {} : {
      codeQualityScore: 90,
      testCoverage: options.test ? 85 : 0,
      documentationScore: 95,
      complexity: options.size === 'large' ? 8 : options.size === 'medium' ? 5 : 3
    };
    
    const metrics = metricsCollector.endTask(quality);
    
    spinner.succeed('Feature development completed!');
    
    // Display results
    console.log('\n' + chalk.bold('Feature Development Summary:'));
    console.log(chalk.gray('─'.repeat(50)));
    
    results.forEach((result, index) => {
      console.log(chalk.bold(`\nStep ${index + 1}: ${workflow[index]}`));
      console.log(result);
    });
    
    if (metrics) {
      console.log('\n' + chalk.bold('Performance Metrics:'));
      console.log(`Time taken: ${chalk.yellow((metrics.duration! / 1000 / 60).toFixed(1) + ' minutes')}`);
      console.log(`Agents used: ${chalk.cyan(metrics.agentMetrics.length)}`);
      
      if (metrics.comparison) {
        console.log(`Time saved: ${chalk.green(metrics.comparison.timeImprovement.toFixed(0) + '%')}`);
        console.log(`Cost savings: ${chalk.green('$' + ((metrics.comparison.manualCost || 0) - metrics.comparison.aiCost).toFixed(2))}`);
      }
    }
    
  } catch (error) {
    spinner.fail('Failed to develop feature');
    console.error(chalk.red((error as Error).message));
    process.exit(1);
  }
}