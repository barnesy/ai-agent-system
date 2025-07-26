export { BaseAgent, AgentMessage, AgentCapabilities } from './agents/base-agent';
export { ResearchAgent } from './agents/research-agent';
export { Orchestrator } from './orchestrator/orchestrator';

// Example usage
import { ResearchAgent } from './agents/research-agent';
import { Orchestrator } from './orchestrator/orchestrator';

async function example() {
  const orchestrator = new Orchestrator();
  const researchAgent = new ResearchAgent();
  
  orchestrator.registerAgent(researchAgent);
  
  const result = await orchestrator.processTask('explore the authentication module');
  console.log('Research Result:', result);
}

if (require.main === module) {
  example().catch(console.error);
}