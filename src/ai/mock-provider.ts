/**
 * Mock AI Provider with Realistic Delays
 * Simulates AI API latency for accurate metrics
 */
export class MockAIProvider {
  private readonly minDelay = 500;  // Minimum 500ms
  private readonly maxDelay = 2000; // Maximum 2 seconds

  /**
   * Generate mock response with realistic delay
   */
  async generateResponse(prompt: string): Promise<string> {
    // Simulate API latency based on prompt length
    const baseDelay = this.minDelay + Math.random() * (this.maxDelay - this.minDelay);
    const promptComplexity = Math.min(prompt.length / 100, 1); // 0-1 based on length
    const actualDelay = baseDelay * (1 + promptComplexity * 0.5); // Up to 50% more for complex prompts
    
    await this.delay(actualDelay);
    
    // Generate mock response based on task type
    if (prompt.includes('research') || prompt.includes('analyze')) {
      return this.generateResearchResponse(prompt);
    } else if (prompt.includes('implement') || prompt.includes('fix')) {
      return this.generateImplementationResponse(prompt);
    } else if (prompt.includes('test')) {
      return this.generateTestResponse(prompt);
    } else if (prompt.includes('review') || prompt.includes('quality')) {
      return this.generateReviewResponse(prompt);
    }
    
    return `Mock AI response for: ${prompt}`;
  }

  /**
   * Calculate token usage with some variance
   */
  calculateTokenUsage(prompt: string, response: string): {
    input: number;
    output: number;
    cost: number;
  } {
    // Rough token estimation (1 token ≈ 4 characters)
    const inputTokens = Math.ceil(prompt.length / 4);
    const outputTokens = Math.ceil(response.length / 4);
    
    // Add some variance
    const variance = 0.8 + Math.random() * 0.4; // 80-120%
    
    return {
      input: Math.floor(inputTokens * variance),
      output: Math.floor(outputTokens * variance),
      cost: (inputTokens * 0.00001 + outputTokens * 0.00003) * variance // Mock pricing
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateResearchResponse(prompt: string): string {
    return JSON.stringify({
      findings: [
        'Located relevant code patterns in src/utils/helpers.ts',
        'Identified similar implementations in src/components/shared.ts',
        'Found 3 potential optimization opportunities'
      ],
      recommendations: [
        'Consider using memoization for expensive calculations',
        'Review error handling patterns in similar modules',
        'Update dependencies to latest stable versions'
      ],
      codeLocations: [
        'src/utils/helpers.ts:45-67',
        'src/components/shared.ts:123-145',
        'src/services/api.ts:78-92'
      ]
    }, null, 2);
  }

  private generateImplementationResponse(prompt: string): string {
    return JSON.stringify({
      files: [{
        path: 'src/implementation/solution.ts',
        content: `// AI-generated implementation
export function enhancedSolution(data: any): any {
  // Validate input
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid input data');
  }
  
  // Process data with improvements
  const processed = {
    ...data,
    timestamp: new Date().toISOString(),
    optimized: true,
    version: '2.0'
  };
  
  // Apply enhancements
  return processWithEnhancements(processed);
}

function processWithEnhancements(data: any): any {
  // Implementation details here
  return data;
}`
      }],
      explanation: 'Implemented solution with error handling, type safety, and performance optimizations',
      dependencies: ['typescript', 'lodash'],
      testSuggestions: [
        'Test edge cases with null/undefined input',
        'Verify performance with large datasets',
        'Check error handling paths'
      ]
    }, null, 2);
  }

  private generateTestResponse(prompt: string): string {
    return JSON.stringify({
      tests: [
        {
          name: 'should handle valid input correctly',
          type: 'unit',
          code: `expect(solution(validData)).toEqual(expectedResult);`
        },
        {
          name: 'should throw error for invalid input',
          type: 'unit', 
          code: `expect(() => solution(null)).toThrow('Invalid input data');`
        },
        {
          name: 'should complete within performance threshold',
          type: 'performance',
          code: `expect(executionTime).toBeLessThan(100);`
        }
      ],
      coverage: {
        statements: 85,
        branches: 78,
        functions: 90,
        lines: 85
      }
    }, null, 2);
  }

  private generateReviewResponse(prompt: string): string {
    return JSON.stringify({
      score: 88,
      issues: [
        {
          severity: 'minor',
          type: 'code-style',
          location: 'line 45',
          message: 'Consider using const instead of let'
        },
        {
          severity: 'major',
          type: 'performance',
          location: 'line 78-92',
          message: 'Potential N+1 query issue detected'
        }
      ],
      suggestions: [
        'Add input validation for edge cases',
        'Consider implementing caching for repeated calculations',
        'Update documentation with usage examples'
      ],
      security: {
        vulnerabilities: [],
        passed: true,
        recommendations: ['Enable rate limiting', 'Add input sanitization']
      }
    }, null, 2);
  }
}

// Singleton instance
export const mockAIProvider = new MockAIProvider();