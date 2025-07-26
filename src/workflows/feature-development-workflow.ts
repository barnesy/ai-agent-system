import { Orchestrator } from '../orchestrator/orchestrator';
import { ResearchAgent } from '../agents/research-agent';
import { PlanningAgent } from '../agents/planning-agent';
import { ImplementationAgent } from '../agents/implementation-agent';
import { TestingAgent } from '../agents/testing-agent';
import { QualityAgent } from '../agents/quality-agent';
import { DocumentationAgent } from '../agents/documentation-agent';

export interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  acceptanceCriteria: string[];
  priority: 'high' | 'medium' | 'low';
}

export class FeatureDevelopmentWorkflow {
  private orchestrator: Orchestrator;

  constructor() {
    this.orchestrator = new Orchestrator();
    this.registerAgents();
  }

  private registerAgents(): void {
    this.orchestrator.registerAgent(new ResearchAgent());
    this.orchestrator.registerAgent(new PlanningAgent());
    this.orchestrator.registerAgent(new ImplementationAgent());
    this.orchestrator.registerAgent(new TestingAgent());
    this.orchestrator.registerAgent(new QualityAgent());
    this.orchestrator.registerAgent(new DocumentationAgent());
  }

  async developFeature(feature: FeatureRequest): Promise<any> {
    console.log(`🚀 Starting feature development workflow for: ${feature.title}`);
    console.log(`   Priority: ${feature.priority}`);
    console.log(`   Feature ID: ${feature.id}\n`);

    // Phase 1: Research and Planning (can be parallel)
    console.log('📊 Phase 1: Research and Planning...');
    const researchAndPlanningTasks = [
      `research existing patterns and best practices for: ${feature.description}`,
      `create a detailed plan to implement: ${feature.title} with requirements: ${feature.requirements.join(', ')}`
    ];
    
    const [researchResult, planningResult] = await Promise.all(
      researchAndPlanningTasks.map(task => this.orchestrator.processTask(task))
    );

    // Phase 2: Implementation and Testing (can be parallel)
    console.log('\n🔨 Phase 2: Implementation and Testing...');
    const implementationAndTestingTasks = [
      `implement the feature: ${feature.title} based on the plan and requirements`,
      `create comprehensive tests for: ${feature.title} covering all acceptance criteria`
    ];
    
    const [implementationResult, testingResult] = await Promise.all(
      implementationAndTestingTasks.map(task => this.orchestrator.processTask(task))
    );

    // Phase 3: Quality and Documentation (sequential)
    console.log('\n✨ Phase 3: Quality Assurance and Documentation...');
    const qualityAndDocsTasks = [
      `review the implementation of ${feature.title} for quality, security, and performance`,
      `create user documentation and API docs for: ${feature.title}`
    ];
    
    const finalResults = await this.orchestrator.processWorkflow(qualityAndDocsTasks);

    return this.summarizeResults(feature, {
      research: researchResult,
      planning: planningResult,
      implementation: implementationResult,
      testing: testingResult,
      quality: finalResults[0],
      documentation: finalResults[1]
    });
  }

  private summarizeResults(feature: FeatureRequest, results: any): any {
    const plan = results.planning.context;
    const implementation = results.implementation.context;
    const tests = results.testing.context;
    const quality = results.quality.context;

    return {
      featureId: feature.id,
      status: 'completed',
      summary: {
        estimatedTime: plan.totalTime,
        filesCreated: implementation.files?.length || 0,
        testsCreated: tests.tests?.length || 0,
        testCoverage: tests.coverage,
        qualityScore: quality.score,
        documentation: {
          type: results.documentation.context.type,
          sections: results.documentation.context.sections?.length || 0
        }
      },
      deliverables: {
        code: implementation.files,
        tests: tests.tests,
        documentation: results.documentation.context
      },
      recommendations: [
        ...(quality.suggestions || []),
        ...(results.research.context.recommendations || [])
      ],
      timeline: new Date().toISOString()
    };
  }
}

// Example usage
if (require.main === module) {
  async function runExample() {
    const featureWorkflow = new FeatureDevelopmentWorkflow();
    
    const feature: FeatureRequest = {
      id: 'FEAT-456',
      title: 'Multi-factor Authentication',
      description: 'Implement MFA support with TOTP and SMS options',
      requirements: [
        'Support TOTP (Time-based One-Time Password)',
        'Support SMS-based verification',
        'Allow users to enable/disable MFA',
        'Provide backup codes for account recovery',
        'Integrate with existing authentication system'
      ],
      acceptanceCriteria: [
        'Users can enable MFA from account settings',
        'Users can choose between TOTP and SMS',
        'Login requires MFA code when enabled',
        'Backup codes are generated and stored securely',
        'Users can disable MFA with current password'
      ],
      priority: 'high'
    };

    const result = await featureWorkflow.developFeature(feature);
    console.log('\n✅ Feature development completed!');
    console.log(JSON.stringify(result, null, 2));
  }

  runExample().catch(console.error);
}