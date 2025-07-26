import chalk from 'chalk';
import boxen from 'boxen';

interface DisplaySection {
  title: string;
  content: any;
  type?: 'success' | 'error' | 'warning' | 'info';
}

interface DisplayOptions {
  title: string;
  sections: DisplaySection[];
}

export function displayResults(options: DisplayOptions): void {
  console.log('\n' + chalk.bold(options.title));
  console.log('─'.repeat(50));

  options.sections.forEach(section => {
    console.log('\n' + chalk.yellow(section.title + ':'));
    
    const content = typeof section.content === 'string' 
      ? section.content 
      : JSON.stringify(section.content, null, 2);

    if (section.type) {
      const colorMap = {
        success: chalk.green,
        error: chalk.red,
        warning: chalk.yellow,
        info: chalk.blue
      };
      console.log(colorMap[section.type](content));
    } else {
      console.log(content);
    }
  });

  console.log('\n' + '─'.repeat(50));
}

export function displayBox(content: string, title?: string): void {
  const boxOptions: any = {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'cyan'
  };

  if (title) {
    boxOptions.title = title;
    boxOptions.titleAlignment = 'center';
  }

  console.log(boxen(content, boxOptions));
}

export function displayProgress(steps: string[]): void {
  console.log(chalk.bold('\n📋 Progress:\n'));
  
  steps.forEach((step, index) => {
    const icon = index === steps.length - 1 ? '🔄' : '✅';
    const color = index === steps.length - 1 ? chalk.yellow : chalk.green;
    console.log(color(`  ${icon} ${step}`));
  });
}

export function displayError(error: Error, verbose: boolean = false): void {
  console.error(chalk.red('\n❌ Error:'), error.message);
  
  if (verbose && error.stack) {
    console.error(chalk.dim('\nStack trace:'));
    console.error(chalk.dim(error.stack));
  }
  
  console.error(chalk.yellow('\n💡 Tip: Use --verbose flag for more details'));
}