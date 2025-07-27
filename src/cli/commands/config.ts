import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface Config {
  aiProvider?: string;
  anthropicApiKey?: string;
  openaiApiKey?: string;
  defaultModel?: string;
  metricsEnabled?: boolean;
  [key: string]: any;
}

const CONFIG_FILE = path.join(os.homedir(), '.ai-agent-config.json');

function loadConfig(): Config {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
  } catch (error) {
    console.error(chalk.yellow('Warning: Could not load config file'));
  }
  return {};
}

function saveConfig(config: Config): void {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error(chalk.red('Error: Could not save config file'));
  }
}

export async function configCommand(options: {
  get?: string;
  set?: string;
  list?: boolean;
  reset?: boolean;
}) {
  try {
    let config = loadConfig();
    
    if (options.reset) {
      config = {};
      saveConfig(config);
      console.log(chalk.green('Configuration reset to defaults'));
      return;
    }
    
    if (options.get) {
      const value = config[options.get];
      if (value !== undefined) {
        console.log(`${options.get}: ${chalk.cyan(value)}`);
      } else {
        console.log(chalk.yellow(`Configuration key '${options.get}' not found`));
      }
      return;
    }
    
    if (options.set) {
      const [key, ...valueParts] = options.set.split('=');
      const value = valueParts.join('=');
      
      if (!value) {
        console.log(chalk.red('Error: Value required (format: key=value)'));
        return;
      }
      
      config[key] = value;
      saveConfig(config);
      console.log(chalk.green(`Set ${key} = ${value}`));
      return;
    }
    
    if (options.list || (!options.get && !options.set && !options.reset)) {
      console.log(chalk.bold('Current Configuration:'));
      console.log(chalk.gray('─'.repeat(50)));
      
      if (Object.keys(config).length === 0) {
        console.log(chalk.gray('No configuration set'));
      } else {
        Object.entries(config).forEach(([key, value]) => {
          // Hide sensitive values
          if (key.toLowerCase().includes('key') || key.toLowerCase().includes('secret')) {
            value = '***' + String(value).slice(-4);
          }
          console.log(`${key}: ${chalk.cyan(value)}`);
        });
      }
      
      console.log('\n' + chalk.gray('Config file: ' + CONFIG_FILE));
    }
    
  } catch (error) {
    console.error(chalk.red('Configuration error: ' + (error as Error).message));
    process.exit(1);
  }
}