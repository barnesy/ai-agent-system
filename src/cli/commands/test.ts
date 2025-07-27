import chalk from 'chalk';
import ora from 'ora';
import { TestWorkflow } from '../../testing/test-workflow';

/**
 * Test command
 * Sets up test environment and sends notification
 */
export async function testCommand(feature: string, options: {
  port?: number;
  notify?: boolean;
  interactive?: boolean;
  open?: boolean;
}) {
  const spinner = ora('Preparing test environment...').start();

  try {
    // Create test workflow
    const workflow = new TestWorkflow();

    // Setup test environment
    await workflow.setup();

    spinner.text = 'Running tests...';

    // Run tests
    await workflow.run({
      port: options.port,
      feature,
      interactive: options.interactive !== false // Default to interactive
    });

    spinner.succeed('Test environment ready!');

    // Show test URL prominently
    console.log('\n' + boxen(
      chalk.bold('🧪 Test Environment Ready\n\n') +
      chalk.cyan('Feature: ') + feature + '\n' +
      chalk.cyan('Status: ') + chalk.green('Ready') + '\n\n' +
      chalk.yellow('Check your notifications for the test link!'),
      {
        padding: 1,
        borderStyle: 'round',
        borderColor: 'green'
      }
    ));

    // Open browser if requested
    if (options.open) {
      const testInfo = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), '.tests', 'latest-notification.json'), 'utf-8')
      );
      if (testInfo.testUrl) {
        console.log(chalk.cyan('\n🌐 Open in browser: ') + testInfo.testUrl);
      }
    }

  } catch (error) {
    spinner.fail('Failed to setup test environment');
    console.error(chalk.red((error as Error).message));
    process.exit(1);
  }
}

// Import at the top level
import boxen from 'boxen';
import * as fs from 'fs';
import * as path from 'path';