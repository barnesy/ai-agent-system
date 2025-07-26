import { BaseAgent, AgentMessage, AgentCapabilities } from './base-agent';

interface CodeGeneration {
  files: Array<{
    path: string;
    content: string;
    language: string;
  }>;
  explanation: string;
  dependencies: string[];
  testSuggestions: string[];
}

export class ImplementationAgent extends BaseAgent {
  constructor() {
    const capabilities: AgentCapabilities = {
      canHandle: (task: string) => {
        const implementationKeywords = [
          'implement', 'code', 'build', 'create', 'write',
          'develop', 'construct', 'generate', 'refactor'
        ];
        return implementationKeywords.some(keyword => 
          task.toLowerCase().includes(keyword)
        );
      },
      estimateTime: (task: string) => {
        if (task.includes('refactor')) return 45;
        if (task.includes('feature')) return 60;
        if (task.includes('fix')) return 20;
        return 30;
      },
      dependencies: ['PlanningAgent', 'ResearchAgent']
    };

    super('ImplementationAgent', capabilities);
  }

  async execute(message: AgentMessage): Promise<AgentMessage> {
    const { task, context } = message.payload;
    
    const implementation = await this.generateImplementation(task, context);
    
    return {
      from: this.name,
      to: message.from,
      type: 'response',
      payload: {
        task: `Implementation completed for: ${task}`,
        context: implementation,
        priority: message.payload.priority,
      },
      timestamp: new Date()
    };
  }

  private async generateImplementation(
    task: string, 
    context: any
  ): Promise<CodeGeneration> {
    // Simulate code generation based on task
    if (task.toLowerCase().includes('api')) {
      return this.generateAPICode();
    } else if (task.toLowerCase().includes('component')) {
      return this.generateComponentCode();
    } else {
      return this.generateGenericCode(task);
    }
  }

  private generateAPICode(): CodeGeneration {
    return {
      files: [
        {
          path: 'src/api/example-api.ts',
          language: 'typescript',
          content: `import { Request, Response } from 'express';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class ExampleAPI {
  async handleRequest(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.processData(req.body);
      const response: ApiResponse<any> = {
        success: true,
        data: result
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<any> = {
        success: false,
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  private async processData(data: any): Promise<any> {
    // Implementation logic here
    return { processed: true, ...data };
  }
}`
        }
      ],
      explanation: 'Created a TypeScript API handler with error handling and typed responses',
      dependencies: ['express', '@types/express'],
      testSuggestions: [
        'Test successful request handling',
        'Test error scenarios',
        'Test input validation',
        'Test response format'
      ]
    };
  }

  private generateComponentCode(): CodeGeneration {
    return {
      files: [
        {
          path: 'src/components/ExampleComponent.tsx',
          language: 'typescript',
          content: `import React, { useState, useEffect } from 'react';

interface ExampleComponentProps {
  title: string;
  onAction?: (value: string) => void;
}

export const ExampleComponent: React.FC<ExampleComponentProps> = ({
  title,
  onAction
}) => {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Component initialization
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Process value
      if (onAction) {
        await onAction(value);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="example-component">
      <h2>{title}</h2>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={loading}
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Processing...' : 'Submit'}
      </button>
    </div>
  );
};`
        }
      ],
      explanation: 'Created a React component with TypeScript, state management, and event handling',
      dependencies: ['react', '@types/react'],
      testSuggestions: [
        'Test component rendering',
        'Test user interactions',
        'Test prop changes',
        'Test loading states'
      ]
    };
  }

  private generateGenericCode(task: string): CodeGeneration {
    return {
      files: [
        {
          path: 'src/utils/helper.ts',
          language: 'typescript',
          content: `/**
 * Generic helper function generated for: ${task}
 */
export function processTask(input: any): any {
  // Validate input
  if (!input) {
    throw new Error('Input is required');
  }

  // Process logic
  const result = {
    processed: true,
    timestamp: new Date().toISOString(),
    input
  };

  return result;
}

export function validateInput(input: any): boolean {
  return input !== null && input !== undefined;
}

export function transformData(data: any): any {
  return {
    ...data,
    transformed: true
  };
}`
        }
      ],
      explanation: `Generated utility functions for: ${task}`,
      dependencies: [],
      testSuggestions: [
        'Test input validation',
        'Test data transformation',
        'Test error handling'
      ]
    };
  }
}