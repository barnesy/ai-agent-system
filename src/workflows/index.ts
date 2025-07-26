export { BugFixWorkflow, BugReport } from './bug-fix-workflow';
export { FeatureDevelopmentWorkflow, FeatureRequest } from './feature-development-workflow';
export { CodeReviewWorkflow, PullRequest } from './code-review-workflow';

// Re-export for convenience
export { Orchestrator } from '../orchestrator/orchestrator';
export * from '../agents/base-agent';

/**
 * Pre-configured workflows for common development tasks
 * 
 * @example
 * ```typescript
 * import { BugFixWorkflow } from 'ai-agent-system/workflows';
 * 
 * const workflow = new BugFixWorkflow();
 * const result = await workflow.executeBugFix({
 *   id: 'BUG-123',
 *   title: 'Fix login issue',
 *   // ... other bug details
 * });
 * ```
 */