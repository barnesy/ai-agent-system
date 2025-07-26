import { BaseAIProvider } from './base-provider';
import { AIRequest, AIResponse } from '../types';

/**
 * Mock AI Provider for testing and development
 */
export class MockAIProvider extends BaseAIProvider {
  constructor() {
    super('mock', {});
  }

  isConfigured(): boolean {
    return true; // Always configured
  }

  async complete(request: AIRequest): Promise<AIResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const lastMessage = request.messages[request.messages.length - 1];
    const mockResponse = this.generateMockResponse(lastMessage.content);

    return {
      content: mockResponse,
      model: 'mock-1.0',
      usage: {
        promptTokens: this.estimateTokens(lastMessage.content),
        completionTokens: this.estimateTokens(mockResponse),
        totalTokens: this.estimateTokens(lastMessage.content + mockResponse),
        cost: 0
      },
      metadata: {
        mock: true,
        timestamp: new Date().toISOString()
      }
    };
  }

  estimateCost(request: AIRequest): number {
    return 0; // Free!
  }

  getAvailableModels(): string[] {
    return ['mock-1.0'];
  }

  protected formatMessages(request: AIRequest): any {
    return request.messages;
  }

  private generateMockResponse(input: string): string {
    const responses: Record<string, string> = {
      // Research responses
      'research': 'I found several relevant patterns in the codebase:\n1. Authentication module uses JWT\n2. Database queries use parameterized statements\n3. Error handling follows consistent patterns',
      
      // Planning responses
      'plan': 'Here\'s the implementation plan:\n1. Set up project structure (30 min)\n2. Implement core functionality (2 hours)\n3. Add tests (1 hour)\n4. Documentation (30 min)',
      
      // Implementation responses
      'implement': '```typescript\nexport class ExampleService {\n  async processData(input: any): Promise<any> {\n    // Implementation here\n    return { success: true, data: input };\n  }\n}\n```',
      
      // Testing responses
      'test': '```typescript\ndescribe(\'ExampleService\', () => {\n  it(\'should process data correctly\', async () => {\n    const service = new ExampleService();\n    const result = await service.processData({ test: true });\n    expect(result.success).toBe(true);\n  });\n});\n```',
      
      // Documentation responses
      'document': '# API Documentation\n\n## processData(input)\nProcesses the input data and returns a result.\n\n### Parameters:\n- `input`: The data to process\n\n### Returns:\n- `Promise<Result>`: The processed result',
      
      // Quality responses
      'review': 'Code Review Results:\n- ✅ No critical issues found\n- ⚠️ Consider adding input validation\n- 💡 Suggestion: Extract magic numbers to constants\n- Score: 85/100'
    };

    // Find the best matching response
    const lowerInput = input.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (lowerInput.includes(key)) {
        return response;
      }
    }

    // Default response
    return `I've analyzed your request: "${input}"\n\nHere's my response based on the mock provider. In production, this would be a real AI-generated response tailored to your specific needs.`;
  }
}