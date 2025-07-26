import chalk from 'chalk';
import ora from 'ora';
import { Orchestrator } from '../../orchestrator/orchestrator';
import { ResearchAgent } from '../../agents/research-agent';
import { PlanningAgent } from '../../agents/planning-agent';
import { ImplementationAgent } from '../../agents/implementation-agent';
import { QualityAgent } from '../../agents/quality-agent';
import { TestingAgent } from '../../agents/testing-agent';
import { DocumentationAgent } from '../../agents/documentation-agent';
import { displayResults } from '../utils/display';
import { getGlobalOptions } from '../utils/options';

interface RunOptions {
  context?: string;
}

export async function runCommand(workflow: string, options: RunOptions): Promise<void> {
  const globalOptions = getGlobalOptions();
  
  console.log(chalk.bold(`\n⚡ Running Workflow: ${workflow}\n`));

  const spinner = ora('Initializing orchestrator...').start();

  try {
    // Parse context if provided
    let context = {};
    if (options.context) {
      try {
        context = JSON.parse(options.context);
      } catch {
        throw new Error('Invalid JSON context provided');
      }
    }

    // Initialize orchestrator and agents
    const orchestrator = new Orchestrator();
    
    // Register all agents
    const agents = [
      new ResearchAgent(),
      new PlanningAgent(),
      new ImplementationAgent(),
      new QualityAgent(),
      new TestingAgent(),
      new DocumentationAgent()
    ];

    agents.forEach(agent => {
      orchestrator.registerAgent(agent);
    });

    spinner.text = 'Parsing workflow...';

    // Parse workflow steps
    const steps = workflow.split(',').map(s => s.trim());
    
    console.log(chalk.cyan('Workflow Steps:'));
    steps.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step}`);
    });

    // Execute workflow
    spinner.text = 'Executing workflow...';
    const results = await orchestrator.processWorkflow(steps);

    spinner.succeed('Workflow completed!');

    // Display results
    const sections = results.map((result, index) => ({
      title: `Step ${index + 1}: ${steps[index]}`,
      content: formatResult(result)
    }));

    displayResults({
      title: '🎯 Workflow Results',
      sections
    });

    // Show summary
    console.log(chalk.bold('\n📊 Summary:'));
    console.log(`  Total steps: ${steps.length}`);
    console.log(`  Completed: ${chalk.green(results.length)}`);
    console.log(`  Time: ${chalk.yellow('~' + (steps.length * 2) + ' seconds')}`);

  } catch (error: any) {
    spinner.fail('Workflow execution failed');
    console.error(chalk.red('\nError:'), error.message);
    
    if (globalOptions.verbose) {
      console.error(error.stack);
    }
    
    process.exit(1);
  }
}

function formatResult(result: any): string {
  if (typeof result === 'string') {
    return result;
  }

  if (result.context) {
    if (typeof result.context === 'string') {
      return result.context;
    }
    return JSON.stringify(result.context, null, 2);
  }

  return JSON.stringify(result, null, 2);
}