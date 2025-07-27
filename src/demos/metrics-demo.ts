import { metricsCollector } from '../metrics/collector';
import { dashboardViewer } from '../metrics/dashboard-viewer';

/**
 * Demo script to generate sample metrics data
 */
async function generateSampleMetrics() {
  console.log('Generating sample metrics data...\n');

  // Sample bug fix task
  const bugTaskId = metricsCollector.startTask('bug-fix', 'Fix authentication token expiry issue');
  
  metricsCollector.startAgent('ResearchAgent');
  await delay(1500);
  metricsCollector.endAgent('ResearchAgent', true);
  metricsCollector.addTokenUsage('ResearchAgent', 500, 250, 0.01);
  
  metricsCollector.startAgent('ImplementationAgent');
  await delay(2000);
  metricsCollector.endAgent('ImplementationAgent', true);
  metricsCollector.addTokenUsage('ImplementationAgent', 800, 600, 0.02);
  
  metricsCollector.startAgent('TestingAgent');
  await delay(1000);
  metricsCollector.endAgent('TestingAgent', true);
  metricsCollector.addTokenUsage('TestingAgent', 300, 200, 0.008);

  metricsCollector.endTask({
    codeQualityScore: 92,
    testCoverage: 85,
    bugsIntroduced: 0,
    linesOfCode: 45
  });

  // Sample feature task
  const featureTaskId = metricsCollector.startTask('feature', 'Add user profile settings page');
  
  metricsCollector.startAgent('ResearchAgent');
  await delay(2000);
  metricsCollector.endAgent('ResearchAgent', true);
  metricsCollector.addTokenUsage('ResearchAgent', 600, 300, 0.012);
  
  metricsCollector.startAgent('PlanningAgent');
  await delay(1500);
  metricsCollector.endAgent('PlanningAgent', true);
  metricsCollector.addTokenUsage('PlanningAgent', 400, 350, 0.015);
  
  metricsCollector.startAgent('ImplementationAgent');
  await delay(3000);
  metricsCollector.endAgent('ImplementationAgent', true);
  metricsCollector.addTokenUsage('ImplementationAgent', 1200, 1000, 0.04);
  
  metricsCollector.startAgent('DocumentationAgent');
  await delay(800);
  metricsCollector.endAgent('DocumentationAgent', true);
  metricsCollector.addTokenUsage('DocumentationAgent', 400, 500, 0.018);

  metricsCollector.endTask({
    codeQualityScore: 88,
    testCoverage: 75,
    documentationScore: 95,
    linesOfCode: 120,
    complexity: 5
  });

  // Sample review task
  const reviewTaskId = metricsCollector.startTask('review', 'Review authentication module for security');
  
  metricsCollector.startAgent('QualityAgent');
  await delay(2500);
  metricsCollector.endAgent('QualityAgent', true);
  metricsCollector.addTokenUsage('QualityAgent', 700, 400, 0.022);
  
  metricsCollector.startAgent('TestingAgent');
  await delay(1200);
  metricsCollector.endAgent('TestingAgent', true);
  metricsCollector.addTokenUsage('TestingAgent', 400, 300, 0.014);

  metricsCollector.endTask({
    codeQualityScore: 94,
    testCoverage: 90,
    bugsIntroduced: 0
  });

  // Sample custom task with manual comparison
  const customTaskId = metricsCollector.startTask('custom', 'Refactor database connection pooling');
  
  metricsCollector.startAgent('ResearchAgent');
  await delay(1000);
  metricsCollector.endAgent('ResearchAgent', true);
  
  metricsCollector.startAgent('ImplementationAgent');
  await delay(2500);
  metricsCollector.endAgent('ImplementationAgent', true);
  
  metricsCollector.startAgent('QualityAgent');
  await delay(1500);
  metricsCollector.endAgent('QualityAgent', true);

  metricsCollector.endTask(
    {
      codeQualityScore: 91,
      testCoverage: 88,
      complexity: 4
    },
    {
      manualTime: 180, // 3 hours manual work
      aiTime: 8.33, // ~8 minutes with AI
      timeImprovement: 95.4,
      aiQuality: {
        codeQualityScore: 91,
        testCoverage: 88
      },
      manualQuality: {
        codeQualityScore: 75,
        testCoverage: 60
      },
      aiCost: 0.15,
      manualCost: 300, // 3 hours at $100/hour
      costSavings: 99.95
    }
  );

  // Add some user ratings
  metricsCollector.rateTask(bugTaskId, 5, 'AI fixed the bug perfectly!');
  metricsCollector.rateTask(featureTaskId, 4, 'Good implementation, needed minor tweaks');
  metricsCollector.rateTask(reviewTaskId, 5, 'Caught important security issues');

  console.log('Sample metrics generated successfully!\n');
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the demo
if (require.main === module) {
  generateSampleMetrics()
    .then(() => {
      console.log('Displaying dashboard...\n');
      dashboardViewer.display();
    })
    .catch(console.error);
}