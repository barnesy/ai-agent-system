import { BaseAgent, AgentMessage, AgentCapabilities } from './base-agent';

interface QualityReport {
  score: number; // 0-100
  issues: Issue[];
  suggestions: string[];
  security: SecurityCheck;
  performance: PerformanceMetrics;
}

interface Issue {
  severity: 'critical' | 'major' | 'minor' | 'info';
  type: string;
  location: string;
  message: string;
  suggestion?: string;
}

interface SecurityCheck {
  vulnerabilities: string[];
  passed: boolean;
  recommendations: string[];
}

interface PerformanceMetrics {
  complexity: number;
  maintainability: number;
  testCoverage: number;
}

export class QualityAgent extends BaseAgent {
  constructor() {
    const capabilities: AgentCapabilities = {
      canHandle: (task: string) => {
        const qualityKeywords = [
          'review', 'check', 'analyze', 'audit', 'inspect',
          'validate', 'verify', 'assess', 'evaluate', 'quality',
          'security', 'vulnerability', 'implications', 'risk'
        ];
        return qualityKeywords.some(keyword => 
          task.toLowerCase().includes(keyword)
        );
      },
      estimateTime: (task: string) => {
        if (task.includes('comprehensive') || task.includes('full')) return 30;
        if (task.includes('security')) return 25;
        return 15;
      },
      dependencies: []
    };

    super('QualityAgent', capabilities);
  }

  async execute(message: AgentMessage): Promise<AgentMessage> {
    const { task, context } = message.payload;
    
    const report = await this.performQualityCheck(task, context);
    
    return {
      from: this.name,
      to: message.from,
      type: 'response',
      payload: {
        task: `Quality check completed for: ${task}`,
        context: report,
        priority: message.payload.priority,
      },
      timestamp: new Date()
    };
  }

  private async performQualityCheck(
    task: string, 
    context: any
  ): Promise<QualityReport> {
    const issues = this.detectIssues(context);
    const security = this.performSecurityCheck(context);
    const performance = this.analyzePerformance(context);
    const score = this.calculateQualityScore(issues, security, performance);

    return {
      score,
      issues,
      suggestions: this.generateSuggestions(issues, security, performance),
      security,
      performance
    };
  }

  private detectIssues(context: any): Issue[] {
    const issues: Issue[] = [];

    // Simulate issue detection
    issues.push({
      severity: 'minor',
      type: 'code-style',
      location: 'src/utils/helper.ts:15',
      message: 'Function lacks proper error handling',
      suggestion: 'Add try-catch block for error handling'
    });

    issues.push({
      severity: 'major',
      type: 'performance',
      location: 'src/api/data-processor.ts:45',
      message: 'Potential N+1 query problem detected',
      suggestion: 'Use batch loading or eager loading'
    });

    issues.push({
      severity: 'info',
      type: 'documentation',
      location: 'src/components/UserList.tsx',
      message: 'Component lacks JSDoc documentation',
      suggestion: 'Add documentation for props and usage'
    });

    return issues;
  }

  private performSecurityCheck(context: any): SecurityCheck {
    return {
      vulnerabilities: [],
      passed: true,
      recommendations: [
        'Enable Content Security Policy headers',
        'Implement rate limiting for API endpoints',
        'Add input sanitization for user data'
      ]
    };
  }

  private analyzePerformance(context: any): PerformanceMetrics {
    return {
      complexity: 75, // Cyclomatic complexity score
      maintainability: 82, // Maintainability index
      testCoverage: 68 // Test coverage percentage
    };
  }

  private calculateQualityScore(
    issues: Issue[], 
    security: SecurityCheck, 
    performance: PerformanceMetrics
  ): number {
    let score = 100;

    // Deduct points for issues
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical': score -= 20; break;
        case 'major': score -= 10; break;
        case 'minor': score -= 5; break;
        case 'info': score -= 1; break;
      }
    });

    // Security impact
    if (!security.passed) score -= 30;
    score -= security.vulnerabilities.length * 10;

    // Performance impact
    score -= Math.max(0, (100 - performance.maintainability) / 2);
    score -= Math.max(0, (80 - performance.testCoverage) / 2);

    return Math.max(0, Math.min(100, score));
  }

  private generateSuggestions(
    issues: Issue[], 
    security: SecurityCheck, 
    performance: PerformanceMetrics
  ): string[] {
    const suggestions: string[] = [];

    if (performance.testCoverage < 80) {
      suggestions.push('Increase test coverage to at least 80%');
    }

    if (performance.complexity > 10) {
      suggestions.push('Consider breaking down complex functions');
    }

    if (issues.some(i => i.type === 'code-style')) {
      suggestions.push('Run automated code formatter (prettier/eslint)');
    }

    suggestions.push(...security.recommendations);

    return suggestions;
  }
}