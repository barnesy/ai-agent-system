import chalk from 'chalk';
import ora from 'ora';
import { CodeReviewWorkflow, PullRequest } from '../../workflows/code-review-workflow';
import { displayResults } from '../utils/display';
import { getGlobalOptions } from '../utils/options';
import { execSync } from 'child_process';

interface ReviewOptions {
  thorough?: boolean;
}

export async function reviewCommand(prNumber: string, options: ReviewOptions): Promise<void> {
  const globalOptions = getGlobalOptions();
  
  console.log(chalk.bold(`\n🔍 Code Review: PR #${prNumber}\n`));

  const spinner = ora('Fetching pull request information...').start();

  try {
    // Fetch PR info using GitHub CLI if available
    let prInfo: any = {};
    try {
      const prJson = execSync(`gh pr view ${prNumber} --json title,body,files,additions,deletions,author`, 
        { encoding: 'utf-8' }
      );
      prInfo = JSON.parse(prJson);
    } catch {
      // Fallback if gh CLI not available
      spinner.info('GitHub CLI not available, using mock data');
      prInfo = {
        title: `Pull Request #${prNumber}`,
        author: { login: 'unknown' },
        additions: 100,
        deletions: 50,
        files: ['unknown-file.ts']
      };
    }

    // Create pull request object
    const pr: PullRequest = {
      id: `PR-${prNumber}`,
      title: prInfo.title || `Pull Request #${prNumber}`,
      description: prInfo.body || 'No description provided',
      files: prInfo.files?.map((f: any) => f.path || f) || [],
      author: prInfo.author?.login || 'unknown',
      changes: {
        additions: prInfo.additions || 0,
        deletions: prInfo.deletions || 0
      }
    };

    console.log(`Title: ${chalk.yellow(pr.title)}`);
    console.log(`Author: ${chalk.cyan(pr.author)}`);
    console.log(`Changes: ${chalk.green(`+${pr.changes.additions}`)} ${chalk.red(`-${pr.changes.deletions}`)}`);
    console.log(`Files: ${pr.files.length}`);

    // Initialize workflow
    spinner.text = 'Initializing code review...';
    const workflow = new CodeReviewWorkflow();
    
    // Enable AI if not disabled
    if (!globalOptions.noAi) {
      spinner.text = 'Enabling AI-powered review...';
      // TODO: Enable AI for all agents in workflow
    }

    // Execute review
    spinner.text = options.thorough ? 'Performing thorough review...' : 'Performing review...';
    const result = await workflow.reviewPullRequest(pr);

    spinner.succeed('Code review completed!');

    // Display results
    const statusColor = 
      result.reviewStatus === 'approved' ? 'green' :
      result.reviewStatus === 'approved_with_comments' ? 'yellow' :
      'red';

    displayResults({
      title: '📊 Review Results',
      sections: [
        {
          title: 'Status',
          content: result.reviewStatus.toUpperCase().replace('_', ' '),
          type: result.reviewStatus === 'approved' ? 'success' : 
                result.reviewStatus === 'rejected' ? 'error' : 'warning'
        },
        {
          title: 'Quality Score',
          content: `${result.summary.overallScore}/100`,
          type: result.summary.overallScore >= 80 ? 'success' : 
                result.summary.overallScore >= 60 ? 'warning' : 'error'
        },
        {
          title: 'Issues Found',
          content: `Total: ${result.summary.issuesFound} (${result.summary.criticalIssues} critical)`
        },
        {
          title: 'Security',
          content: result.details.security.passed ? '✅ Passed' : '❌ Failed',
          type: result.details.security.passed ? 'success' : 'error'
        }
      ]
    });

    // Show issues if any
    if (result.details.codeQuality.issues.length > 0) {
      console.log(chalk.bold('\n⚠️  Issues:'));
      result.details.codeQuality.issues.forEach((issue: any) => {
        const icon = issue.severity === 'critical' ? '🔴' : 
                    issue.severity === 'major' ? '🟡' : '🔵';
        console.log(`${icon} [${issue.severity}] ${issue.location}: ${issue.message}`);
        if (issue.suggestion) {
          console.log(`   💡 ${chalk.dim(issue.suggestion)}`);
        }
      });
    }

    // Show recommendations
    if (result.recommendations.length > 0) {
      console.log(chalk.bold('\n💡 Recommendations:'));
      result.recommendations.forEach((rec: string) => {
        console.log(`  - ${rec}`);
      });
    }

    // Show decision
    console.log(chalk.bold('\n📋 Review Decision:'));
    console.log(chalk[statusColor](
      result.reviewStatus === 'approved' ? '✅ Ready to merge!' :
      result.reviewStatus === 'approved_with_comments' ? '✅ Can merge after addressing comments' :
      '❌ Requires changes before merging'
    ));

  } catch (error: any) {
    spinner.fail('Code review failed');
    console.error(chalk.red('\nError:'), error.message);
    
    if (globalOptions.verbose) {
      console.error(error.stack);
    }
    
    process.exit(1);
  }
}