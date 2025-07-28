/**
 * Prompt templates for Research Agent
 * These will be used in Phase 2 when AI providers are integrated
 */

export const RESEARCH_AGENT_PROMPTS = {
  system: `You are a Research Agent specialized in exploring and understanding codebases. Your role is to:

1. Analyze code structure and patterns
2. Map dependencies and relationships
3. Identify key components and entry points
4. Find relevant implementations and examples
5. Provide clear, actionable insights

You should:
- Be thorough but concise
- Focus on practical understanding
- Highlight important patterns
- Suggest best practices
- Point out potential issues

Output Format:
- Summary: Brief overview of findings
- Key Findings: Bullet points of important discoveries
- Code Locations: Specific files and line numbers
- Dependencies: Related modules and packages
- Recommendations: Actionable next steps`,

  templates: {
    codeExploration: `Task: {task}
Context: {context}

Please explore the codebase to understand {target}. Focus on:
1. Main entry points and structure
2. Key patterns and conventions used
3. Dependencies and relationships
4. Potential areas of concern

Provide specific file paths and code examples where relevant.`,

    patternAnalysis: `Task: {task}
Context: {context}

Analyze the codebase to identify patterns related to {target}. Look for:
1. Repeated patterns or abstractions
2. Common approaches to similar problems
3. Architectural decisions
4. Best practices being followed (or not)

Include specific examples with file locations.`,

    dependencyMapping: `Task: {task}
Context: {context}

Map all dependencies related to {target}. Include:
1. Direct imports and exports
2. Indirect dependencies
3. External package dependencies
4. Circular dependencies (if any)
5. Dependency tree visualization

Provide a clear hierarchy of relationships.`,

    bugInvestigation: `Task: {task}
Context: {context}
Error: {error}

Investigate the root cause of this issue:
1. Trace the error back to its source
2. Identify all affected components
3. Check for similar patterns that might have the same issue
4. Suggest potential fixes
5. Assess impact of proposed changes

Be specific about file locations and line numbers.`,

    securityAudit: `Task: {task}
Context: {context}

Perform a security analysis focused on {target}:
1. Input validation vulnerabilities
2. Authentication/authorization issues
3. Data exposure risks
4. Dependency vulnerabilities
5. Security best practice violations

Prioritize findings by severity and provide remediation suggestions.`
  },

  responseFormat: {
    summary: "1-2 sentence overview",
    findings: ["Key discovery 1", "Key discovery 2"],
    codeLocations: [
      { file: "path/to/file.ts", line: 42, description: "What's here" }
    ],
    dependencies: {
      internal: ["module1", "module2"],
      external: ["package1", "package2"]
    },
    recommendations: ["Action 1", "Action 2"],
    metrics: {
      filesAnalyzed: 0,
      patternsFound: 0,
      issuesIdentified: 0
    }
  }
};

/**
 * Get prompt for specific research task
 */
export function getResearchPrompt(
  taskType: keyof typeof RESEARCH_AGENT_PROMPTS.templates,
  variables: Record<string, string>
): string {
  let prompt = RESEARCH_AGENT_PROMPTS.templates[taskType];
  
  // Replace variables
  Object.entries(variables).forEach(([key, value]) => {
    prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value);
  });
  
  return prompt;
}

/**
 * Format research results according to standard format
 */
export function formatResearchResults(rawResults: any): any {
  // This will be implemented when integrating with AI providers
  return {
    ...RESEARCH_AGENT_PROMPTS.responseFormat,
    ...rawResults
  };
}