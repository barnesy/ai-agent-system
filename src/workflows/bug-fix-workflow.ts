import { Orchestrator } from '../orchestrator/orchestrator';
import { ResearchAgent } from '../agents/research-agent';
import { TestingAgent } from '../agents/testing-agent';
import { ImplementationAgent } from '../agents/implementation-agent';
import { QualityAgent } from '../agents/quality-agent';
import { DocumentationAgent } from '../agents/documentation-agent';

export interface BugReport {
  id: string;
  title: string;
  description: string;
  stepsToReproduce: string[];
  expectedBehavior: string;
  actualBehavior: string;
  severity: 'critical' | 'major' | 'minor';
}

export class BugFixWorkflow {
  private orchestrator: Orchestrator;

  constructor() {
    this.orchestrator = new Orchestrator();
    this.registerAgents();
  }

  private registerAgents(): void {
    this.orchestrator.registerAgent(new ResearchAgent());
    this.orchestrator.registerAgent(new TestingAgent());
    this.orchestrator.registerAgent(new ImplementationAgent());
    this.orchestrator.registerAgent(new QualityAgent());
    this.orchestrator.registerAgent(new DocumentationAgent());
  }

  async executeBugFix(bug: BugReport): Promise<any> {
    console.log(`🐛 Starting bug fix workflow for: ${bug.title}`);
    console.log(`   Severity: ${bug.severity}`);
    console.log(`   Bug ID: ${bug.id}\n`);

    const workflow = [
      // 1. Research phase
      `investigate bug: ${bug.description}. Find the root cause in the codebase`,
      
      // 2. Create failing test
      `create a test that reproduces the bug: ${bug.actualBehavior}`,
      
      // 3. Implement fix
      `implement a fix for: ${bug.description}. Expected behavior: ${bug.expectedBehavior}`,
      
      // 4. Verify fix
      `test that the bug is fixed and no regressions were introduced`,
      
      // 5. Quality check
      `review the bug fix for code quality and potential side effects`,
      
      // 6. Update documentation
      `document the bug fix and update any affected API documentation`
    ];

    const results = await this.orchestrator.processWorkflow(workflow);
    
    return this.summarizeResults(bug, results);
  }

  private summarizeResults(bug: BugReport, results: any[]): any {
    return {
      bugId: bug.id,
      status: 'fixed',
      summary: {
        rootCause: results[0].context,
        testCreated: results[1].context,
        fixImplemented: results[2].context,
        verificationStatus: results[3].context,
        qualityCheckPassed: results[4].context.score > 80,
        documentationUpdated: results[5].context
      },
      timeline: new Date().toISOString()
    };
  }
}

// Example usage
if (require.main === module) {
  async function runExample() {
    const bugFixWorkflow = new BugFixWorkflow();
    
    const bug: BugReport = {
      id: 'BUG-123',
      title: 'User authentication fails with special characters in password',
      description: 'Login fails when password contains symbols like @, #, or $',
      stepsToReproduce: [
        '1. Go to login page',
        '2. Enter valid username',
        '3. Enter password with special characters (e.g., "Pass@word123")',
        '4. Click login button'
      ],
      expectedBehavior: 'User should be authenticated successfully',
      actualBehavior: 'Authentication fails with "Invalid credentials" error',
      severity: 'major'
    };

    const result = await bugFixWorkflow.executeBugFix(bug);
    console.log('\n✅ Bug fix completed!');
    console.log(JSON.stringify(result, null, 2));
  }

  runExample().catch(console.error);
}