import chalk from 'chalk';
import ora from 'ora';
import { FeatureDevelopmentWorkflow, FeatureRequest } from '../../workflows/feature-development-workflow';
import { displayResults } from '../utils/display';
import { getGlobalOptions } from '../utils/options';

interface FeatureOptions {
  priority: 'high' | 'medium' | 'low';
  requirements?: string[];
}

export async function featureCommand(description: string, options: FeatureOptions): Promise<void> {
  const globalOptions = getGlobalOptions();
  
  console.log(chalk.bold('\n🚀 Feature Development Workflow\n'));
  console.log(`Feature: ${chalk.green(description)}`);
  console.log(`Priority: ${chalk.yellow(options.priority)}`);
  
  if (options.requirements) {
    console.log(`Requirements:`);
    options.requirements.forEach(req => console.log(`  - ${chalk.cyan(req)}`));
  }

  const spinner = ora('Initializing feature development...').start();

  try {
    // Create feature request
    const feature: FeatureRequest = {
      id: `FEAT-${Date.now()}`,
      title: description.slice(0, 100),
      description: description,
      requirements: options.requirements || [description],
      acceptanceCriteria: ['Feature works as described', 'Tests pass', 'Documentation updated'],
      priority: options.priority
    };

    // Initialize workflow
    const workflow = new FeatureDevelopmentWorkflow();
    
    // Enable AI if not disabled
    if (!globalOptions.noAi) {
      spinner.text = 'Enabling AI assistance...';
      // TODO: Enable AI for all agents in workflow
    }

    // Execute workflow phases
    spinner.text = 'Phase 1: Research and Planning...';
    const result = await workflow.developFeature(feature);

    spinner.succeed('Feature development completed!');

    // Display results
    displayResults({
      title: '✨ Feature Development Summary',
      sections: [
        {
          title: 'Planning',
          content: `Estimated time: ${result.summary.estimatedTime} minutes`
        },
        {
          title: 'Implementation',
          content: `Files created: ${result.summary.filesCreated}\nTests created: ${result.summary.testsCreated}`
        },
        {
          title: 'Quality Score',
          content: `${result.summary.qualityScore}/100`,
          type: result.summary.qualityScore >= 80 ? 'success' : 'warning'
        },
        {
          title: 'Documentation',
          content: `Type: ${result.summary.documentation.type}\nSections: ${result.summary.documentation.sections}`
        }
      ]
    });

    // Show recommendations
    if (result.recommendations.length > 0) {
      console.log(chalk.bold('\n💡 Recommendations:'));
      result.recommendations.forEach((rec: string) => {
        console.log(`  - ${rec}`);
      });
    }

    // Show next steps
    console.log(chalk.bold('\n📋 Next Steps:'));
    console.log('1. Review the generated code');
    console.log('2. Run the test suite');
    console.log('3. Update any additional documentation');
    console.log('4. Create a pull request');

  } catch (error: any) {
    spinner.fail('Feature development failed');
    console.error(chalk.red('\nError:'), error.message);
    
    if (globalOptions.verbose) {
      console.error(error.stack);
    }
    
    process.exit(1);
  }
}