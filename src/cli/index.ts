#!/usr/bin/env node

import { Command } from 'commander';
import { fixCommand } from './commands/fix';
import { featureCommand } from './commands/feature';
import { reviewCommand } from './commands/review';
import { runCommand } from './commands/run';
import { configCommand } from './commands/config';
import { dashboardCommand } from './commands/dashboard';
import { testCommand } from './commands/test';
const version = '0.1.0'; // Version from package.json

const program = new Command();

program
  .name('ai-agent')
  .description('AI Agent System CLI - Transform software development with AI collaboration')
  .version(version);

// Fix command
program
  .command('fix <description>')
  .description('Fix a bug with AI assistance')
  .option('-s, --severity <level>', 'bug severity (critical|major|minor)', 'major')
  .option('-a, --auto-commit', 'automatically commit the fix')
  .option('-t, --test', 'run tests after fixing')
  .action(fixCommand);

// Feature command  
program
  .command('feature <description>')
  .description('Develop a new feature with AI guidance')
  .option('-s, --size <size>', 'feature size (small|medium|large)', 'medium')
  .option('-p, --plan-only', 'only create implementation plan')
  .option('-t, --test', 'generate tests for the feature')
  .action(featureCommand);

// Review command
program
  .command('review <file>')
  .description('Review code with AI quality checks')
  .option('-t, --type <type>', 'review type (security|performance|quality|all)', 'all')
  .option('-f, --fix', 'automatically fix issues found')
  .option('-d, --detailed', 'show detailed analysis')
  .action(reviewCommand);

// Run command
program
  .command('run <workflow>')
  .description('Run a custom workflow')
  .option('-s, --steps <steps>', 'comma-separated workflow steps')
  .option('-p, --parallel', 'run steps in parallel where possible')
  .option('-v, --verbose', 'show detailed execution logs')
  .action(runCommand);

// Config command
program
  .command('config')
  .description('Manage AI agent configuration')
  .option('-g, --get <key>', 'get configuration value')
  .option('-s, --set <key=value>', 'set configuration value')
  .option('-l, --list', 'list all configuration')
  .option('-r, --reset', 'reset to defaults')
  .action(configCommand);

// Dashboard command
program
  .command('dashboard')
  .description('View performance metrics and comparisons')
  .option('-r, --report', 'show detailed performance report')
  .option('-e, --export <format>', 'export metrics (csv|json|html)')
  .action(dashboardCommand);

// Test command
program
  .command('test <feature>')
  .description('Setup test environment and notify when ready')
  .option('-p, --port <port>', 'test server port', '3000')
  .option('-n, --no-notify', 'skip notifications')
  .option('-i, --no-interactive', 'skip interactive test server')
  .option('-o, --open', 'open test in browser')
  .action(testCommand);

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}