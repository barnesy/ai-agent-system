#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { fixCommand } from './commands/fix';
import { featureCommand } from './commands/feature';
import { reviewCommand } from './commands/review';
import { configCommand } from './commands/config';
import { runCommand } from './commands/run';

// Get version from package.json
const packageJson = require('../../package.json');
const version = packageJson.version;

const program = new Command();

program
  .name('ai-agent')
  .description('AI Agent System - Your team of AI developers')
  .version(version)
  .option('-v, --verbose', 'verbose output')
  .option('--no-ai', 'use mock responses (no API calls)');

// Main commands
program
  .command('fix <description>')
  .description('Fix a bug with AI assistance')
  .option('-s, --severity <level>', 'bug severity (critical|major|minor)', 'major')
  .option('-f, --files <files...>', 'specific files to focus on')
  .action(fixCommand);

program
  .command('feature <description>')
  .description('Develop a new feature')
  .option('-p, --priority <level>', 'priority (high|medium|low)', 'medium')
  .option('-r, --requirements <reqs...>', 'feature requirements')
  .action(featureCommand);

program
  .command('review <pr-number>')
  .description('Review a pull request')
  .option('-t, --thorough', 'perform thorough review')
  .action(reviewCommand);

program
  .command('run <workflow>')
  .description('Run a custom workflow')
  .option('-c, --context <json>', 'provide context as JSON')
  .action(runCommand);

// Configuration command
program
  .command('config')
  .description('Manage configuration')
  .argument('[action]', 'get|set|list')
  .argument('[key]', 'configuration key')
  .argument('[value]', 'configuration value')
  .action(configCommand);

// Help customization
program.configureHelp({
  sortSubcommands: true,
  subcommandTerm: (cmd) => cmd.name()
});

// Custom help
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('  $ ai-agent fix "Users cannot login with special characters"');
  console.log('  $ ai-agent feature "Add dark mode support"');
  console.log('  $ ai-agent review 123');
  console.log('  $ ai-agent config set ai.defaultProvider anthropic');
  console.log('');
  console.log('For more information, visit: https://github.com/barnesy/ai-agent-system');
});

// Capture global options before parsing
program.hook('preAction', (thisCommand) => {
  const { captureGlobalOptions } = require('./utils/options');
  captureGlobalOptions(thisCommand);
});

// Error handling
program.exitOverride();

try {
  program.parse();
} catch (error: any) {
  if (error.code === 'commander.help') {
    process.exit(0);
  }
  console.error(chalk.red('Error:'), error.message);
  process.exit(1);
}

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}