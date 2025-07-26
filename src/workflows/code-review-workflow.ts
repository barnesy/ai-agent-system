import { Orchestrator } from '../orchestrator/orchestrator';
import { ResearchAgent } from '../agents/research-agent';
import { QualityAgent } from '../agents/quality-agent';
import { TestingAgent } from '../agents/testing-agent';
import { DocumentationAgent } from '../agents/documentation-agent';

export interface PullRequest {
  id: string;
  title: string;
  description: string;
  files: string[];
  author: string;
  changes: {
    additions: number;
    deletions: number;
  };
}

export class CodeReviewWorkflow {
  private orchestrator: Orchestrator;

  constructor() {
    this.orchestrator = new Orchestrator();
    this.registerAgents();
  }

  private registerAgents(): void {
    this.orchestrator.registerAgent(new ResearchAgent());
    this.orchestrator.registerAgent(new QualityAgent());
    this.orchestrator.registerAgent(new TestingAgent());
    this.orchestrator.registerAgent(new DocumentationAgent());
  }

  async reviewPullRequest(pr: PullRequest): Promise<any> {
    console.log(`🔍 Starting code review workflow for PR: ${pr.title}`);
    console.log(`   Author: ${pr.author}`);
    console.log(`   Changes: +${pr.changes.additions} -${pr.changes.deletions}`);
    console.log(`   Files: ${pr.files.length}\n`);

    // Parallel review tasks
    console.log('🔎 Running parallel review checks...');
    const reviewTasks = [
      `analyze code changes in PR "${pr.title}" for patterns and best practices`,
      `review code quality, security vulnerabilities, and performance issues in: ${pr.files.join(', ')}`,
      `verify test coverage and suggest additional tests for the changes in PR: ${pr.title}`,
      `check if documentation needs updates based on changes: ${pr.description}`
    ];

    const results = await Promise.all(
      reviewTasks.map(task => this.orchestrator.processTask(task))
    );

    return this.generateReviewReport(pr, results);
  }

  private generateReviewReport(pr: PullRequest, results: any[]): any {
    const [researchResult, qualityResult, testingResult, documentationResult] = results;

    const qualityReport = qualityResult.context;
    const overallScore = qualityReport.score;
    const status = this.determineStatus(overallScore, qualityReport.issues);

    return {
      pullRequestId: pr.id,
      reviewStatus: status,
      summary: {
        overallScore,
        issuesFound: qualityReport.issues.length,
        criticalIssues: qualityReport.issues.filter((i: any) => i.severity === 'critical').length,
        testCoverageStatus: testingResult.context.coverage,
        documentationNeeded: documentationResult.context.sections?.length > 0
      },
      details: {
        codeQuality: {
          score: qualityReport.score,
          issues: qualityReport.issues,
          suggestions: qualityReport.suggestions
        },
        security: qualityReport.security,
        testing: {
          coverage: testingResult.context.coverage,
          suggestedTests: testingResult.context.tests?.map((t: any) => t.name) || []
        },
        patterns: researchResult.context,
        documentation: documentationResult.context
      },
      recommendations: this.generateRecommendations(qualityReport, testingResult.context),
      automatedChecksPassed: status !== 'rejected',
      reviewedAt: new Date().toISOString()
    };
  }

  private determineStatus(score: number, issues: any[]): string {
    const criticalIssues = issues.filter((i: any) => i.severity === 'critical').length;
    
    if (criticalIssues > 0) return 'rejected';
    if (score < 60) return 'needs_work';
    if (score < 80) return 'approved_with_comments';
    return 'approved';
  }

  private generateRecommendations(qualityReport: any, testingResult: any): string[] {
    const recommendations: string[] = [];

    // Quality recommendations
    if (qualityReport.score < 80) {
      recommendations.push('Address code quality issues before merging');
    }

    // Security recommendations
    if (qualityReport.security?.recommendations?.length > 0) {
      recommendations.push(...qualityReport.security.recommendations);
    }

    // Testing recommendations
    if (testingResult.coverage?.statements < 80) {
      recommendations.push('Increase test coverage to at least 80%');
    }

    // Performance recommendations
    if (qualityReport.performance?.complexity > 10) {
      recommendations.push('Consider refactoring complex functions');
    }

    return recommendations;
  }
}

// Example usage
if (require.main === module) {
  async function runExample() {
    const reviewWorkflow = new CodeReviewWorkflow();
    
    const pullRequest: PullRequest = {
      id: 'PR-789',
      title: 'Add caching layer for API responses',
      description: 'Implements Redis caching to improve API performance',
      files: [
        'src/api/cache-manager.ts',
        'src/api/endpoints/users.ts',
        'src/config/redis.ts',
        'tests/cache-manager.test.ts'
      ],
      author: 'developer123',
      changes: {
        additions: 450,
        deletions: 120
      }
    };

    const result = await reviewWorkflow.reviewPullRequest(pullRequest);
    console.log('\n✅ Code review completed!');
    console.log(JSON.stringify(result, null, 2));
  }

  runExample().catch(console.error);
}