/**
 * Phase-aware agent exports
 * Automatically loads simplified or full agents based on current phase
 */

import { getCurrentConfig, isAgentEnabled } from '../config';
import { BaseAgent } from './base-agent';

// Phase 1 agents (simplified)
import { ResearchAgentSimple } from './research-agent-simple';
import { ImplementationAgentSimple } from './implementation-agent-simple';

// Full agents (for Phase 2+)
import { ResearchAgent } from './research-agent';
import { ImplementationAgent } from './implementation-agent';
import { PlanningAgent } from './planning-agent';
import { QualityAgent } from './quality-agent';
import { DocumentationAgent } from './documentation-agent';
import { TestingAgent } from './testing-agent';

/**
 * Get the appropriate agent instance based on current phase
 */
export function getAgent(agentName: string): BaseAgent | null {
  if (!isAgentEnabled(agentName)) {
    console.log(`Agent ${agentName} is not enabled in Phase ${getCurrentConfig().phase}`);
    return null;
  }

  const phase = getCurrentConfig().phase;

  switch (agentName) {
    case 'ResearchAgent':
      return phase === 1 ? new ResearchAgentSimple() : new ResearchAgent();
    
    case 'ImplementationAgent':
      return phase === 1 ? new ImplementationAgentSimple() : new ImplementationAgent();
    
    case 'QualityAgent':
      return phase >= 2 ? new QualityAgent() : null;
    
    case 'PlanningAgent':
      return phase >= 3 ? new PlanningAgent() : null;
    
    case 'DocumentationAgent':
      return phase >= 3 ? new DocumentationAgent() : null;
    
    case 'TestingAgent':
      return phase >= 3 ? new TestingAgent() : null;
    
    default:
      console.warn(`Unknown agent: ${agentName}`);
      return null;
  }
}

/**
 * Get all enabled agents for current phase
 */
export function getEnabledAgents(): BaseAgent[] {
  const config = getCurrentConfig();
  const agents: BaseAgent[] = [];

  for (const agentName of config.enabledAgents) {
    const agent = getAgent(agentName);
    if (agent) {
      agents.push(agent);
    }
  }

  return agents;
}

/**
 * Get agent capabilities summary for current phase
 */
export function getAgentCapabilities(): Record<string, any> {
  const config = getCurrentConfig();
  const capabilities: Record<string, any> = {};

  for (const agentName of config.enabledAgents) {
    const agent = getAgent(agentName);
    if (agent && 'getStatus' in agent) {
      capabilities[agentName] = (agent as any).getStatus();
    }
  }

  return capabilities;
}

// Re-export types
export { BaseAgent, AgentMessage, AgentCapabilities } from './base-agent';

// Export phase-aware orchestrator helper
export { Orchestrator } from '../orchestrator/orchestrator';

console.log(`AI Agent System initialized in Phase ${getCurrentConfig().phase}`);
console.log(`Enabled agents: ${getCurrentConfig().enabledAgents.join(', ')}`);