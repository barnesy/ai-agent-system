/**
 * Prompt templates for Implementation Agent
 * These will be used in Phase 2 when AI providers are integrated
 */

export const IMPLEMENTATION_AGENT_PROMPTS = {
  system: `You are an Implementation Agent specialized in generating high-quality code. Your role is to:

1. Generate clean, maintainable code
2. Follow existing patterns and conventions
3. Include proper error handling
4. Add appropriate comments (only when necessary)
5. Consider edge cases and validation

You should:
- Match the coding style of the existing codebase
- Use TypeScript with proper types
- Follow SOLID principles
- Write testable code
- Avoid over-engineering

Output Format:
- Generated code with proper formatting
- Brief explanation of approach
- Any assumptions made
- Suggested tests
- Required dependencies`,

  templates: {
    functionGeneration: `Task: {task}
Context: {context}
Function Name: {functionName}

Generate a TypeScript function that {description}. 

Requirements:
1. Include proper TypeScript types
2. Add input validation
3. Handle edge cases
4. Follow existing patterns in the codebase
5. Make it testable

Consider the existing code style and conventions.`,

    classGeneration: `Task: {task}
Context: {context}
Class Name: {className}

Create a TypeScript class that {description}.

Requirements:
1. Use appropriate design patterns
2. Include necessary methods and properties
3. Add proper TypeScript interfaces
4. Implement error handling
5. Follow SOLID principles

Base it on existing class patterns in the codebase.`,

    testGeneration: `Task: {task}
Context: {context}
Target: {targetFunction}

Generate comprehensive unit tests for {targetFunction}.

Include:
1. Happy path tests
2. Edge cases
3. Error scenarios
4. Input validation tests
5. Mock any dependencies

Use the testing framework already in the project.`,

    refactoring: `Task: {task}
Context: {context}
Current Code: {currentCode}

Refactor this code to {improvement}.

Focus on:
1. Improving readability
2. Reducing complexity
3. Better error handling
4. Performance optimization
5. Following best practices

Maintain backward compatibility unless specified otherwise.`,

    bugFix: `Task: {task}
Context: {context}
Bug Description: {bugDescription}
Current Code: {currentCode}

Fix the bug while:
1. Maintaining existing functionality
2. Adding tests to prevent regression
3. Improving error handling
4. Following existing patterns
5. Documenting the fix

Explain what caused the bug and how your fix addresses it.`,

    apiEndpoint: `Task: {task}
Context: {context}
Endpoint: {endpoint}
Method: {method}

Create a {method} API endpoint at {endpoint} that {description}.

Include:
1. Request validation
2. Error handling
3. Proper HTTP status codes
4. TypeScript types for request/response
5. Basic security considerations

Follow REST best practices and existing API patterns.`
  },

  codePatterns: {
    errorHandling: `try {
  // Main logic
} catch (error) {
  // Specific error handling
  if (error instanceof SpecificError) {
    // Handle specific error
  }
  // Log error appropriately
  logger.error('Operation failed', { error, context });
  // Re-throw or return error response
}`,

    validation: `function validate{Name}(input: {Type}): void {
  if (!input) {
    throw new Error('Input is required');
  }
  
  // Specific validations
  if (!input.requiredField) {
    throw new Error('Required field missing: requiredField');
  }
  
  // Type validations
  if (typeof input.field !== 'expectedType') {
    throw new Error('Invalid type for field');
  }
}`,

    asyncPattern: `async function {functionName}({params}): Promise<{ReturnType}> {
  // Input validation
  validate{Name}({params});
  
  try {
    // Async operations
    const result = await operation();
    
    // Process result
    return processResult(result);
  } catch (error) {
    // Error handling
    throw new {CustomError}('Operation failed', { cause: error });
  }
}`
  },

  responseFormat: {
    code: "// Generated code here",
    language: "typescript",
    explanation: "Brief explanation of the implementation",
    assumptions: ["Assumption 1", "Assumption 2"],
    dependencies: ["package1", "package2"],
    suggestedTests: ["Test case 1", "Test case 2"],
    complexity: "O(n) time, O(1) space",
    fileName: "suggested-file-name.ts"
  }
};

/**
 * Get prompt for specific implementation task
 */
export function getImplementationPrompt(
  taskType: keyof typeof IMPLEMENTATION_AGENT_PROMPTS.templates,
  variables: Record<string, string>
): string {
  let prompt = IMPLEMENTATION_AGENT_PROMPTS.templates[taskType];
  
  // Replace variables
  Object.entries(variables).forEach(([key, value]) => {
    prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value);
  });
  
  return prompt;
}

/**
 * Get code pattern template
 */
export function getCodePattern(
  patternType: keyof typeof IMPLEMENTATION_AGENT_PROMPTS.codePatterns,
  variables: Record<string, string>
): string {
  let pattern = IMPLEMENTATION_AGENT_PROMPTS.codePatterns[patternType];
  
  // Replace variables
  Object.entries(variables).forEach(([key, value]) => {
    pattern = pattern.replace(new RegExp(`{${key}}`, 'g'), value);
  });
  
  return pattern;
}

/**
 * Format implementation results according to standard format
 */
export function formatImplementationResults(rawResults: any): any {
  // This will be implemented when integrating with AI providers
  return {
    ...IMPLEMENTATION_AGENT_PROMPTS.responseFormat,
    ...rawResults
  };
}