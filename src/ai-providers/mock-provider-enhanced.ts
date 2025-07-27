import { BaseAIProvider } from './base-provider';
import { AIRequestOptions, AIResponse, AIProviderConfig, ModelInfo } from './types';

/**
 * Enhanced Mock AI Provider
 * Implements full AIProvider interface with realistic behavior
 */
export class MockAIProviderEnhanced extends BaseAIProvider {
  private readonly minDelay = 500;  // Minimum 500ms
  private readonly maxDelay = 2000; // Maximum 2 seconds

  constructor(config: AIProviderConfig = {}) {
    super('Mock', config);
  }

  protected validateConfig(): void {
    // Mock provider doesn't need validation
  }

  async generateResponse(prompt: string, options?: AIRequestOptions): Promise<AIResponse> {
    // Simulate API latency
    const baseDelay = this.minDelay + Math.random() * (this.maxDelay - this.minDelay);
    const promptComplexity = Math.min(prompt.length / 100, 1);
    const actualDelay = baseDelay * (1 + promptComplexity * 0.5);
    
    await this.delay(actualDelay);
    
    // Generate contextual response
    let content: string;
    if (prompt.includes('research') || prompt.includes('analyze')) {
      content = this.generateResearchResponse(prompt);
    } else if (prompt.includes('implement') || prompt.includes('fix')) {
      content = this.generateImplementationResponse(prompt);
    } else if (prompt.includes('test')) {
      content = this.generateTestResponse(prompt);
    } else if (prompt.includes('review') || prompt.includes('quality')) {
      content = this.generateReviewResponse(prompt);
    } else {
      content = this.generateGenericResponse(prompt, options);
    }

    // Calculate usage
    const inputTokens = this.getTokenCount(prompt);
    const outputTokens = this.getTokenCount(content);
    
    return {
      content,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens
      },
      cost: this.getCostEstimate(inputTokens, outputTokens),
      model: options?.model || 'mock-gpt-3.5',
      finishReason: 'stop'
    };
  }

  async *streamResponse(prompt: string, options?: AIRequestOptions): AsyncGenerator<string, void, unknown> {
    const response = await this.generateResponse(prompt, options);
    const words = response.content.split(' ');
    
    for (const word of words) {
      yield word + ' ';
      await this.delay(50 + Math.random() * 100); // Simulate streaming delay
    }
  }

  getTokenCount(text: string): number {
    // Simple estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  getMaxTokens(): number {
    return 4096; // Mock model limit
  }

  protected getModelInfo(model: string): ModelInfo | null {
    return {
      name: 'Mock Model',
      contextWindow: 4096,
      inputCostPer1k: 0.001,
      outputCostPer1k: 0.002,
      capabilities: ['chat', 'function_calling']
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateGenericResponse(prompt: string, options?: AIRequestOptions): string {
    if (options?.responseFormat === 'json') {
      return JSON.stringify({
        response: `Mock response for: ${prompt}`,
        metadata: {
          model: options.model || 'mock-gpt-3.5',
          temperature: options.temperature || 0.7
        }
      });
    }
    
    return `Mock AI response for: ${prompt}\n\nThis is a simulated response with realistic timing and token usage.`;
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

// Update the original MockAIProvider to use new interface
export { MockAIProviderEnhanced as MockAIProvider };