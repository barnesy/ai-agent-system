import chalk from 'chalk';
import ora from 'ora';
import { Orchestrator } from '../../orchestrator/orchestrator';
import { ResearchAgent } from '../../agents/research-agent';
import { PlanningAgent } from '../../agents/planning-agent';
import { ImplementationAgent } from '../../agents/implementation-agent';
import { QualityAgent } from '../../agents/quality-agent';
import { TestingAgent } from '../../agents/testing-agent';
import { DocumentationAgent } from '../../agents/documentation-agent';
import { metricsCollector } from '../../metrics';

export async function runCommand(workflow: string, options: {
  steps?: string;
  parallel?: boolean;
  verbose?: boolean;
}) {
  const spinner = ora('Initializing AI agents...').start();
  
  try {
    // Start metrics tracking
    const taskId = metricsCollector.startTask('custom', workflow);
    
    // Initialize orchestrator and agents
    const orchestrator = new Orchestrator();
    orchestrator.registerAgent(new ResearchAgent());
    orchestrator.registerAgent(new PlanningAgent());
    orchestrator.registerAgent(new ImplementationAgent());
    orchestrator.registerAgent(new QualityAgent());
    orchestrator.registerAgent(new TestingAgent());
    orchestrator.registerAgent(new DocumentationAgent());
    
    // Parse workflow steps
    const workflowSteps = options.steps 
      ? options.steps.split(',').map(s => s.trim())
      : [workflow];
    
    spinner.text = 'Processing custom workflow...';
    
    if (options.verbose) {
      console.log('\n' + chalk.bold('Workflow Steps:'));
      workflowSteps.forEach((step, i) => {
        console.log(`  ${i + 1}. ${step}`);
      });
    }
    
    // Execute workflow
    const results = await orchestrator.processWorkflow(workflowSteps);
    
    // End metrics tracking
    const metrics = metricsCollector.endTask({
      codeQualityScore: 85
    });
    
    spinner.succeed('Workflow completed!');
    
    // Display results
    console.log('\n' + chalk.bold('Workflow Results:'));
    console.log(chalk.gray('─'.repeat(50)));
    
    results.forEach((result, index) => {
      console.log(chalk.bold(`\nStep ${index + 1}: ${workflowSteps[index]}`));
      console.log(result);
      
      if (options.verbose && metrics) {
        const agentMetric = metrics.agentMetrics[index];
        if (agentMetric) {
          console.log(chalk.gray(`  Agent: ${agentMetric.agentName}`));
          console.log(chalk.gray(`  Time: ${(agentMetric.duration! / 1000).toFixed(1)}s`));
        }
      }
    });
    
    if (metrics) {
      console.log('\n' + chalk.bold('Performance Metrics:'));
      console.log(`Total time: ${chalk.yellow((metrics.duration! / 1000 / 60).toFixed(1) + ' minutes')}`);
      console.log(`Agents used: ${chalk.cyan(metrics.agentMetrics.length)}`);
      
      if (metrics.comparison) {
        console.log(`Time saved: ${chalk.green(metrics.comparison.timeImprovement.toFixed(0) + '%')}`);
        console.log(`Cost savings: ${chalk.green('$' + ((metrics.comparison.manualCost || 0) - metrics.comparison.aiCost).toFixed(2))}`);
      }
    }
    
  } catch (error) {
    spinner.fail('Failed to run workflow');
    console.error(chalk.red((error as Error).message));
    process.exit(1);
  }
}