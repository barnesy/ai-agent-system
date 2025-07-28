/**
 * Phase-based configuration for gradual agent system rollout
 * Enables incremental activation of agents and features based on proven ROI
 */

export interface PhaseConfig {
  phase: 1 | 2 | 3;
  enabledAgents: string[];
  enabledFeatures: {
    parallelExecution: boolean;
    visualEditor: boolean;
    advancedMemory: boolean;
    fullDashboard: boolean;
    chatInterface: boolean;
    githubActions: boolean;
  };
  metrics: {
    targetTimeReduction: number; // percentage
    targetSuccessRate: number;   // percentage
    maxTokenMultiplier: number;  // vs baseline
  };
}

// Phase configurations aligned with implementation roadmap
export const PHASE_CONFIGS: Record<number, PhaseConfig> = {
  1: {
    phase: 1,
    enabledAgents: ['ResearchAgent', 'ImplementationAgent'],
    enabledFeatures: {
      parallelExecution: false,
      visualEditor: false,
      advancedMemory: false,
      fullDashboard: false,
      chatInterface: true,  // Basic chat only
      githubActions: false
    },
    metrics: {
      targetTimeReduction: 50,
      targetSuccessRate: 90,
      maxTokenMultiplier: 4
    }
  },
  2: {
    phase: 2,
    enabledAgents: ['ResearchAgent', 'ImplementationAgent', 'QualityAgent'],
    enabledFeatures: {
      parallelExecution: true,
      visualEditor: false,
      advancedMemory: true,
      fullDashboard: false,
      chatInterface: true,
      githubActions: true
    },
    metrics: {
      targetTimeReduction: 70,
      targetSuccessRate: 95,
      maxTokenMultiplier: 10
    }
  },
  3: {
    phase: 3,
    enabledAgents: [
      'ResearchAgent', 
      'ImplementationAgent', 
      'QualityAgent',
      'PlanningAgent',
      'DocumentationAgent',
      'TestingAgent'
    ],
    enabledFeatures: {
      parallelExecution: true,
      visualEditor: true,
      advancedMemory: true,
      fullDashboard: true,
      chatInterface: true,
      githubActions: true
    },
    metrics: {
      targetTimeReduction: 80,
      targetSuccessRate: 98,
      maxTokenMultiplier: 15
    }
  }
};

// Get current phase from environment or default to Phase 1
export function getCurrentPhase(): number {
  const phase = process.env.AI_AGENT_PHASE ? 
    parseInt(process.env.AI_AGENT_PHASE) : 1;
  
  if (phase < 1 || phase > 3) {
    console.warn(`Invalid phase ${phase}, defaulting to Phase 1`);
    return 1;
  }
  
  return phase;
}

// Get configuration for current phase
export function getCurrentConfig(): PhaseConfig {
  return PHASE_CONFIGS[getCurrentPhase()];
}

// Check if a specific agent is enabled
export function isAgentEnabled(agentName: string): boolean {
  const config = getCurrentConfig();
  return config.enabledAgents.includes(agentName);
}

// Check if a specific feature is enabled
export function isFeatureEnabled(feature: keyof PhaseConfig['enabledFeatures']): boolean {
  const config = getCurrentConfig();
  return config.enabledFeatures[feature];
}

// Get phase transition criteria
export interface TransitionCriteria {
  phase: number;
  criteria: {
    timeReductionAchieved: boolean;
    successRateAchieved: boolean;
    tokenCostAcceptable: boolean;
    userSatisfaction: boolean;
  };
  canTransition: boolean;
}

export function evaluatePhaseTransition(
  currentMetrics: {
    timeReduction: number;
    successRate: number;
    tokenMultiplier: number;
    userSatisfactionScore: number;
  }
): TransitionCriteria {
  const config = getCurrentConfig();
  const phase = getCurrentPhase();
  
  const criteria = {
    timeReductionAchieved: currentMetrics.timeReduction >= config.metrics.targetTimeReduction,
    successRateAchieved: currentMetrics.successRate >= config.metrics.targetSuccessRate,
    tokenCostAcceptable: currentMetrics.tokenMultiplier <= config.metrics.maxTokenMultiplier,
    userSatisfaction: currentMetrics.userSatisfactionScore >= 7
  };
  
  const canTransition = Object.values(criteria).every(c => c === true);
  
  return {
    phase,
    criteria,
    canTransition
  };
}