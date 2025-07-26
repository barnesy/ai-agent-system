import chalk from 'chalk';
import { config } from '../../config/config';

export async function configCommand(
  action?: string,
  key?: string,
  value?: string
): Promise<void> {
  // If no action, show current config
  if (!action) {
    displayConfig();
    return;
  }

  switch (action) {
    case 'get':
      if (!key) {
        console.error(chalk.red('Error: Key required for get command'));
        process.exit(1);
      }
      getValue(key);
      break;

    case 'set':
      if (!key || !value) {
        console.error(chalk.red('Error: Key and value required for set command'));
        process.exit(1);
      }
      setValue(key, value);
      break;

    case 'list':
      displayConfig();
      break;

    default:
      console.error(chalk.red(`Error: Unknown action '${action}'`));
      console.log('Valid actions: get, set, list');
      process.exit(1);
  }
}

function displayConfig(): void {
  const currentConfig = config.get();
  
  console.log(chalk.bold('\n⚙️  Current Configuration\n'));
  
  // AI Configuration
  console.log(chalk.yellow('AI Settings:'));
  console.log(`  Default Provider: ${chalk.cyan(currentConfig.ai.defaultProvider)}`);
  
  // Check provider status
  console.log('\n' + chalk.yellow('Provider Status:'));
  console.log(`  Mock: ${chalk.green('✅ Always available')}`);
  console.log(`  Anthropic: ${config.getApiKey('anthropic') ? chalk.green('✅ Configured') : chalk.red('❌ Not configured')}`);
  console.log(`  OpenAI: ${config.getApiKey('openai') ? chalk.green('✅ Configured') : chalk.red('❌ Not configured')}`);
  
  // Features
  console.log('\n' + chalk.yellow('Features:'));
  console.log(`  Telemetry: ${currentConfig.features.telemetry ? chalk.green('enabled') : chalk.gray('disabled')}`);
  console.log(`  Auto-update: ${currentConfig.features.autoUpdate ? chalk.green('enabled') : chalk.gray('disabled')}`);
  
  // Config file location
  console.log('\n' + chalk.dim(`Config file: ~/.ai-agent-system/config.json`));
}

function getValue(key: string): void {
  const value = getValueByPath(config.get(), key);
  
  if (value === undefined) {
    console.error(chalk.red(`Error: Key '${key}' not found`));
    process.exit(1);
  }
  
  console.log(value);
}

function setValue(key: string, value: string): void {
  try {
    // Special handling for API keys
    if (key === 'anthropic.apiKey') {
      config.setApiKey('anthropic', value);
      console.log(chalk.green(`✅ Anthropic API key configured`));
      return;
    }
    
    if (key === 'openai.apiKey') {
      config.setApiKey('openai', value);
      console.log(chalk.green(`✅ OpenAI API key configured`));
      return;
    }

    // Parse value
    let parsedValue: any = value;
    if (value === 'true') parsedValue = true;
    else if (value === 'false') parsedValue = false;
    else if (!isNaN(Number(value))) parsedValue = Number(value);

    // Update config
    const updates = setValueByPath({}, key, parsedValue);
    config.update(updates);
    
    console.log(chalk.green(`✅ Set ${key} = ${parsedValue}`));
    
  } catch (error: any) {
    console.error(chalk.red(`Error: Failed to set configuration`));
    console.error(error.message);
    process.exit(1);
  }
}

function getValueByPath(obj: any, path: string): any {
  return path.split('.').reduce((curr, key) => curr?.[key], obj);
}

function setValueByPath(obj: any, path: string, value: any): any {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  
  let current = obj;
  for (const key of keys) {
    if (!current[key]) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[lastKey] = value;
  return obj;
}