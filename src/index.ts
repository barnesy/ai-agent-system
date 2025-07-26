export { BaseAgent, AgentMessage, AgentCapabilities } from './agents/base-agent';
export { ResearchAgent } from './agents/research-agent';
export { PlanningAgent } from './agents/planning-agent';
export { ImplementationAgent } from './agents/implementation-agent';
export { QualityAgent } from './agents/quality-agent';
export { TestingAgent } from './agents/testing-agent';
export { DocumentationAgent } from './agents/documentation-agent';
export { Orchestrator } from './orchestrator/orchestrator';

// Example usage
import { ResearchAgent } from './agents/research-agent';
import { PlanningAgent } from './agents/planning-agent';
import { ImplementationAgent } from './agents/implementation-agent';
import { QualityAgent } from './agents/quality-agent';
import { TestingAgent } from './agents/testing-agent';
import { DocumentationAgent } from './agents/documentation-agent';
import { Orchestrator } from './orchestrator/orchestrator';

async function example() {
  const orchestrator = new Orchestrator();
  
  // Register all agents
  orchestrator.registerAgent(new ResearchAgent());
  orchestrator.registerAgent(new PlanningAgent());
  orchestrator.registerAgent(new ImplementationAgent());
  orchestrator.registerAgent(new QualityAgent());
  orchestrator.registerAgent(new TestingAgent());
  orchestrator.registerAgent(new DocumentationAgent());
  
  console.log('Registered agents:', orchestrator.getRegisteredAgents());
  
  // Example: Process a feature development workflow
  const workflow = [
    'research existing authentication patterns',
    'plan the implementation of user authentication',
    'implement basic authentication module',
    'test the authentication functionality',
    'review code quality and security',
    'document the authentication API'
  ];
  
  console.log('\nProcessing workflow...\n');
  const results = await orchestrator.processWorkflow(workflow);
  
  results.forEach((result, index) => {
    console.log(`Step ${index + 1}: ${workflow[index]}`);
    console.log('Result:', result);
    console.log('---');
  });
}

if (require.main === module) {
  example().catch(console.error);
}