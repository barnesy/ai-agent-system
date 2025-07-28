#!/usr/bin/env node

/**
 * Phase 1 CLI for AI Agent System
 * Minimal interface focused on proving value with Research and Implementation agents
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import { getCurrentConfig, evaluatePhaseTransition } from '../config';
import { getAgent, getEnabledAgents, getAgentCapabilities } from '../agents/index-phased';
import { AgentMessage } from '../agents/base-agent';
import { getTokenTracker } from '../metrics/token-tracker';

const program = new Command();

// Display phase information
function showPhaseInfo() {
  const config = getCurrentConfig();
  const phaseBox = boxen(
    chalk.bold(`AI Agent System - Phase ${config.phase}\n`) +
    chalk.gray(`Enabled Agents: ${config.enabledAgents.join(', ')}\n`) +
    chalk.gray(`Token Limit: ${config.metrics.maxTokenMultiplier}x baseline`),
    { 
      padding: 1, 
      margin: 1, 
      borderStyle: 'round',
      borderColor: 'blue'
    }
  );
  console.log(phaseBox);
}

// Phase 1 CLI commands
program
  .name('ai-agent-phase1')
  .description('Phase 1 CLI for AI Agent System - Focused on core value delivery')
  .version('0.1.0-phase1');

// Research command
program
  .command('research <task>')
  .description('Use Research Agent to explore and understand code')
  .option('-p, --priority <priority>', 'Task priority (high/medium/low)', 'medium')
  .option('-t, --target <files...>', 'Target files to research')
  .action(async (task, options) => {
    showPhaseInfo();
    
    const spinner = ora('Initializing Research Agent...').start();
    
    try {
      const agent = getAgent('ResearchAgent');
      if (!agent) {
        spinner.fail('Research Agent not available in current phase');
        return;
      }

      spinner.text = 'Researching...';
      
      const message: AgentMessage = {
        from: 'CLI',
        to: 'ResearchAgent',
        type: 'request',
        payload: {
          task,
          context: {
            targetFiles: options.target
          },
          priority: options.priority
        },
        timestamp: new Date()
      };

      const response = await agent.execute(message);
      spinner.succeed('Research completed!');

      // Display results
      console.log('\n' + chalk.bold('Research Results:'));
      console.log(chalk.gray('─'.repeat(50)));
      
      const results = response.payload.context;
      if (results.summary) {
        console.log(chalk.blue('Summary:'), results.summary);
      }
      
      if (results.findings && results.findings.length > 0) {
        console.log('\n' + chalk.blue('Findings:'));
        results.findings.forEach((finding: string, i: number) => {
          console.log(`  ${i + 1}. ${finding}`);
        });
      }

      if (results.codeLocations && results.codeLocations.length > 0) {
        console.log('\n' + chalk.blue('Relevant Files:'));
        results.codeLocations.forEach((loc: string) => {
          console.log(`  • ${chalk.yellow(loc)}`);
        });
      }

      if (results.recommendations && results.recommendations.length > 0) {
        console.log('\n' + chalk.blue('Recommendations:'));
        results.recommendations.forEach((rec: string) => {
          console.log(`  → ${chalk.green(rec)}`);
        });
      }

      // Show metrics
      if (results.metrics) {
        console.log('\n' + chalk.gray(`Execution time: ${results.metrics.executionTimeMs}ms`));
      }

    } catch (error) {
      spinner.fail('Research failed');
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
    }
  });

// Implementation command
program
  .command('implement <task>')
  .description('Use Implementation Agent to generate code')
  .option('-p, --priority <priority>', 'Task priority (high/medium/low)', 'medium')
  .option('-n, --name <name>', 'Name for generated code (function/class name)')
  .action(async (task, options) => {
    showPhaseInfo();
    
    const spinner = ora('Initializing Implementation Agent...').start();
    
    try {
      const agent = getAgent('ImplementationAgent');
      if (!agent) {
        spinner.fail('Implementation Agent not available in current phase');
        return;
      }

      spinner.text = 'Generating implementation...';
      
      const message: AgentMessage = {
        from: 'CLI',
        to: 'ImplementationAgent',
        type: 'request',
        payload: {
          task,
          context: {
            functionName: options.name,
            className: options.name
          },
          priority: options.priority
        },
        timestamp: new Date()
      };

      const response = await agent.execute(message);
      spinner.succeed('Implementation generated!');

      // Display results
      console.log('\n' + chalk.bold('Generated Code:'));
      console.log(chalk.gray('─'.repeat(50)));
      
      const results = response.payload.context;
      
      if (results.fileName) {
        console.log(chalk.blue('File:'), chalk.yellow(results.fileName));
      }
      
      if (results.language) {
        console.log(chalk.blue('Language:'), results.language);
      }
      
      if (results.explanation) {
        console.log(chalk.blue('Explanation:'), results.explanation);
      }

      if (results.code) {
        console.log('\n' + chalk.blue('Code:'));
        console.log(chalk.gray('```' + results.language));
        console.log(results.code);
        console.log(chalk.gray('```'));
      }

      // Show metrics
      if (results.metrics) {
        console.log('\n' + chalk.gray(`Execution time: ${results.metrics.executionTimeMs}ms`));
        console.log(chalk.gray(`Lines of code: ${results.metrics.linesOfCode}`));
      }

    } catch (error) {
      spinner.fail('Implementation failed');
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
    }
  });

// Status command
program
  .command('status')
  .description('Show current phase status and capabilities')
  .action(() => {
    showPhaseInfo();
    
    console.log(chalk.bold('\nAgent Capabilities:'));
    console.log(chalk.gray('─'.repeat(50)));
    
    const capabilities = getAgentCapabilities();
    Object.entries(capabilities).forEach(([agent, status]) => {
      console.log(`\n${chalk.blue(agent)}:`);
      if (status.capabilities) {
        Object.entries(status.capabilities).forEach(([cap, enabled]) => {
          const icon = enabled ? chalk.green('✓') : chalk.red('✗');
          console.log(`  ${icon} ${cap}`);
        });
      }
    });

    // Show example metrics for phase transition
    console.log(chalk.bold('\n\nPhase Transition Criteria:'));
    console.log(chalk.gray('─'.repeat(50)));
    
    const mockMetrics = {
      timeReduction: 45,
      successRate: 88,
      tokenMultiplier: 3.5,
      userSatisfactionScore: 8
    };
    
    const transition = evaluatePhaseTransition(mockMetrics);
    
    console.log('Current metrics (example):');
    Object.entries(transition.criteria).forEach(([criterion, met]) => {
      const icon = met ? chalk.green('✓') : chalk.red('✗');
      console.log(`  ${icon} ${criterion}`);
    });
    
    if (transition.canTransition) {
      console.log(chalk.green('\n✓ Ready to transition to next phase!'));
    } else {
      console.log(chalk.yellow('\n⚠ Not yet ready for next phase'));
    }
  });

// Simple workflow command
program
  .command('workflow <type>')
  .description('Run a simple workflow (research-then-implement)')
  .option('-d, --description <desc>', 'Workflow description')
  .action(async (type, options) => {
    showPhaseInfo();
    
    if (type !== 'simple' && type !== 'research-implement') {
      console.error(chalk.red('Phase 1 only supports "simple" or "research-implement" workflows'));
      return;
    }

    const description = options.description || 'Feature development';
    console.log(chalk.bold(`\nRunning workflow: ${description}`));
    console.log(chalk.gray('─'.repeat(50)));

    // Step 1: Research
    console.log('\n' + chalk.blue('Step 1: Research'));
    const researchSpinner = ora('Researching codebase...').start();
    
    try {
      const researchAgent = getAgent('ResearchAgent');
      if (!researchAgent) throw new Error('Research Agent not available');

      const researchMsg: AgentMessage = {
        from: 'Workflow',
        to: 'ResearchAgent',
        type: 'request',
        payload: {
          task: `Research codebase for ${description}`,
          priority: 'high'
        },
        timestamp: new Date()
      };

      const researchResult = await researchAgent.execute(researchMsg);
      researchSpinner.succeed('Research completed');

      // Step 2: Implementation
      console.log('\n' + chalk.blue('Step 2: Implementation'));
      const implSpinner = ora('Generating implementation...').start();

      const implAgent = getAgent('ImplementationAgent');
      if (!implAgent) throw new Error('Implementation Agent not available');

      const implMsg: AgentMessage = {
        from: 'Workflow',
        to: 'ImplementationAgent',
        type: 'request',
        payload: {
          task: `Implement ${description} based on research`,
          context: researchResult.payload.context,
          priority: 'high'
        },
        timestamp: new Date()
      };

      const implResult = await implAgent.execute(implMsg);
      implSpinner.succeed('Implementation completed');

      console.log(chalk.green('\n✓ Workflow completed successfully!'));
      
    } catch (error) {
      console.error(chalk.red(`\n✗ Workflow failed: ${error}`));
    }
  });

// Metrics command
program
  .command('metrics')
  .description('View token usage and ROI metrics')
  .option('-r, --reset', 'Reset metrics data')
  .action((options) => {
    showPhaseInfo();
    
    const tracker = getTokenTracker();
    
    if (options.reset) {
      tracker.reset();
      console.log(chalk.yellow('✓ Metrics reset successfully'));
      return;
    }
    
    const report = tracker.generateReport();
    console.log(report);
    
    // Show quick tips
    const metrics = tracker.getMetrics();
    const roi = tracker.getROIMetrics();
    
    if (metrics.tasksCompleted < 10) {
      console.log(chalk.yellow('\n💡 Tip: Complete more tasks to get accurate metrics'));
    }
    
    if (roi.averageTimeSavedPercent < 30) {
      console.log(chalk.yellow('\n💡 Tip: Try using agents for more complex tasks to see bigger time savings'));
    }
    
    if (metrics.tokenMultiplier > 3) {
      console.log(chalk.yellow('\n💡 Tip: Consider simplifying prompts to reduce token usage'));
    }
  });

// Parse commands
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  showPhaseInfo();
  program.outputHelp();
}