// Central configuration exports
export * from './phase-config';

// Environment configuration
export const config = {
  // AI Provider settings
  AI_PROVIDER: process.env.AI_PROVIDER || 'anthropic',
  AI_API_KEY: process.env.AI_API_KEY || process.env.ANTHROPIC_API_KEY || '',
  
  // Phase settings
  PHASE: process.env.AI_AGENT_PHASE ? parseInt(process.env.AI_AGENT_PHASE) : 1,
  
  // Development settings
  DEBUG: process.env.DEBUG === 'true',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Metrics settings
  METRICS_ENABLED: process.env.METRICS_ENABLED !== 'false',
  METRICS_STORAGE_PATH: process.env.METRICS_STORAGE_PATH || './metrics',
  
  // Token tracking
  TRACK_TOKENS: process.env.TRACK_TOKENS !== 'false',
  TOKEN_BUDGET_ALERT: process.env.TOKEN_BUDGET_ALERT ? 
    parseInt(process.env.TOKEN_BUDGET_ALERT) : 1000,
  
  // Feature flags (can override phase defaults)
  FORCE_PARALLEL_EXECUTION: process.env.FORCE_PARALLEL_EXECUTION === 'true',
  FORCE_VISUAL_EDITOR: process.env.FORCE_VISUAL_EDITOR === 'true',
  
  // GitHub settings
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
  GITHUB_OWNER: process.env.GITHUB_OWNER || 'barnesy',
  GITHUB_REPO: process.env.GITHUB_REPO || 'ai-agent-system'
};