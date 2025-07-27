import chalk from 'chalk';
import ora from 'ora';
import { dashboardViewer } from '../../metrics';

/**
 * Dashboard command
 * Displays performance metrics and comparisons
 */
export async function dashboardCommand(options: {
  report?: boolean;
  export?: string;
}) {
  const spinner = ora('Loading metrics...').start();

  try {
    spinner.stop();
    // Clear the spinner line
    process.stdout.write('\r\x1b[K');

    if (options.report) {
      // Show detailed report
      dashboardViewer.displayReport();
    } else {
      // Show interactive dashboard
      dashboardViewer.display();
    }

    if (options.export) {
      // Export functionality can be added here
      console.log(chalk.yellow(`\nExport to ${options.export} format coming soon!`));
    }
  } catch (error) {
    spinner.fail('Failed to load dashboard');
    console.error(chalk.red((error as Error).message));
    process.exit(1);
  }
}