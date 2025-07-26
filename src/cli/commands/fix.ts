import chalk from 'chalk';
import ora from 'ora';
import { BugFixWorkflow, BugReport } from '../../workflows/bug-fix-workflow';
import { displayResults } from '../utils/display';
import { getGlobalOptions } from '../utils/options';

interface FixOptions {
  severity: 'critical' | 'major' | 'minor';
  files?: string[];
}

export async function fixCommand(description: string, options: FixOptions): Promise<void> {
  const globalOptions = getGlobalOptions();
  
  console.log(chalk.bold('\n🐛 Bug Fix Workflow\n'));
  console.log(`Description: ${chalk.yellow(description)}`);
  console.log(`Severity: ${chalk.red(options.severity)}`);
  
  if (options.files) {
    console.log(`Focus files: ${chalk.cyan(options.files.join(', '))}`);
  }

  const spinner = ora('Initializing bug fix workflow...').start();

  try {
    // Create bug report
    const bug: BugReport = {
      id: `BUG-${Date.now()}`,
      title: description.slice(0, 100),
      description: description,
      stepsToReproduce: ['Reported via CLI'],
      expectedBehavior: 'System should work correctly',
      actualBehavior: description,
      severity: options.severity
    };

    // Initialize workflow
    const workflow = new BugFixWorkflow();
    
    // Enable AI if not disabled
    if (!globalOptions.noAi) {
      spinner.text = 'Enabling AI assistance...';
      // TODO: Enable AI for all agents in workflow
    }

    // Execute workflow
    spinner.text = 'Analyzing bug...';
    const result = await workflow.executeBugFix(bug);

    spinner.succeed('Bug fix workflow completed!');

    // Display results
    displayResults({
      title: '🎯 Bug Fix Summary',
      sections: [
        {
          title: 'Root Cause Analysis',
          content: result.summary.rootCause
        },
        {
          title: 'Fix Implementation',
          content: result.summary.fixImplemented
        },
        {
          title: 'Test Coverage',
          content: result.summary.testCreated
        },
        {
          title: 'Quality Check',
          content: result.summary.qualityCheckPassed ? '✅ Passed' : '❌ Failed',
          type: result.summary.qualityCheckPassed ? 'success' : 'error'
        }
      ]
    });

    // Show next steps
    console.log(chalk.bold('\n📋 Next Steps:'));
    console.log('1. Review the implemented fix');
    console.log('2. Run the generated tests');
    console.log('3. Create a pull request');

  } catch (error: any) {
    spinner.fail('Bug fix workflow failed');
    console.error(chalk.red('\nError:'), error.message);
    
    if (globalOptions.verbose) {
      console.error(error.stack);
    }
    
    process.exit(1);
  }
}