import { BaseAgent, AgentMessage, AgentCapabilities } from './base-agent';

interface Documentation {
  type: 'api' | 'user' | 'technical' | 'architecture';
  sections: DocSection[];
  diagrams?: Diagram[];
  examples?: Example[];
}

interface DocSection {
  title: string;
  content: string;
  subsections?: DocSection[];
}

interface Diagram {
  type: 'flowchart' | 'sequence' | 'architecture' | 'class';
  title: string;
  mermaidCode: string;
}

interface Example {
  title: string;
  description: string;
  code: string;
  language: string;
}

export class DocumentationAgent extends BaseAgent {
  constructor() {
    const capabilities: AgentCapabilities = {
      canHandle: (task: string) => {
        const docKeywords = [
          'document', 'explain', 'describe', 'write docs',
          'readme', 'guide', 'tutorial', 'api docs', 'diagram'
        ];
        return docKeywords.some(keyword => 
          task.toLowerCase().includes(keyword)
        );
      },
      estimateTime: (task: string) => {
        if (task.includes('comprehensive') || task.includes('full')) return 40;
        if (task.includes('api')) return 30;
        if (task.includes('diagram')) return 20;
        return 25;
      },
      dependencies: ['ImplementationAgent', 'TestingAgent']
    };

    super('DocumentationAgent', capabilities);
  }

  async execute(message: AgentMessage): Promise<AgentMessage> {
    const { task, context } = message.payload;
    
    const documentation = await this.generateDocumentation(task, context);
    
    return {
      from: this.name,
      to: message.from,
      type: 'response',
      payload: {
        task: `Documentation created for: ${task}`,
        context: documentation,
        priority: message.payload.priority,
      },
      timestamp: new Date()
    };
  }

  private async generateDocumentation(
    task: string, 
    context: any
  ): Promise<Documentation> {
    const docType = this.determineDocType(task);
    
    return {
      type: docType,
      sections: this.generateSections(docType, context),
      diagrams: this.generateDiagrams(docType, context),
      examples: this.generateExamples(docType, context)
    };
  }

  private determineDocType(task: string): Documentation['type'] {
    if (task.includes('api')) return 'api';
    if (task.includes('user') || task.includes('guide')) return 'user';
    if (task.includes('architecture')) return 'architecture';
    return 'technical';
  }

  private generateSections(type: Documentation['type'], context: any): DocSection[] {
    switch (type) {
      case 'api':
        return this.generateAPISections(context);
      case 'user':
        return this.generateUserSections(context);
      case 'architecture':
        return this.generateArchitectureSections(context);
      default:
        return this.generateTechnicalSections(context);
    }
  }

  private generateAPISections(context: any): DocSection[] {
    return [
      {
        title: 'API Overview',
        content: 'This API provides functionality for managing data and operations.',
        subsections: [
          {
            title: 'Authentication',
            content: `All API requests require authentication using Bearer tokens.

Include the token in the Authorization header:
\`\`\`
Authorization: Bearer <your-token>
\`\`\``
          },
          {
            title: 'Base URL',
            content: 'All API endpoints are relative to: `https://api.example.com/v1`'
          }
        ]
      },
      {
        title: 'Endpoints',
        content: 'Available API endpoints:',
        subsections: [
          {
            title: 'GET /items',
            content: `Retrieve all items.

**Parameters:**
- \`limit\` (optional): Maximum number of items to return
- \`offset\` (optional): Number of items to skip

**Response:**
\`\`\`json
{
  "items": [...],
  "total": 100,
  "limit": 10,
  "offset": 0
}
\`\`\``
          },
          {
            title: 'POST /items',
            content: `Create a new item.

**Request Body:**
\`\`\`json
{
  "name": "string",
  "description": "string",
  "value": number
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "value": number,
  "createdAt": "timestamp"
}
\`\`\``
          }
        ]
      },
      {
        title: 'Error Handling',
        content: `The API uses standard HTTP status codes.

Common error responses:
- \`400\`: Bad Request - Invalid input
- \`401\`: Unauthorized - Missing or invalid token
- \`404\`: Not Found - Resource doesn't exist
- \`500\`: Internal Server Error`
      }
    ];
  }

  private generateUserSections(context: any): DocSection[] {
    return [
      {
        title: 'Getting Started',
        content: 'Welcome to our application! This guide will help you get up and running quickly.',
        subsections: [
          {
            title: 'Installation',
            content: `1. Download the application from our website
2. Run the installer
3. Follow the setup wizard
4. Launch the application`
          },
          {
            title: 'First Steps',
            content: `After installation:
1. Create your account
2. Configure your preferences
3. Complete the tutorial
4. Start using the application!`
          }
        ]
      },
      {
        title: 'Features',
        content: 'Key features of the application:',
        subsections: [
          {
            title: 'Dashboard',
            content: 'The dashboard provides an overview of your activities and quick access to common tasks.'
          },
          {
            title: 'Data Management',
            content: 'Easily create, edit, and organize your data with our intuitive interface.'
          }
        ]
      }
    ];
  }

  private generateArchitectureSections(context: any): DocSection[] {
    return [
      {
        title: 'System Architecture',
        content: 'The system follows a modular, agent-based architecture.',
        subsections: [
          {
            title: 'Components',
            content: `- **Agents**: Specialized modules for specific tasks
- **Orchestrator**: Coordinates agent interactions
- **Message Bus**: Facilitates inter-agent communication
- **Storage Layer**: Persists data and state`
          },
          {
            title: 'Design Principles',
            content: `- Separation of Concerns
- Loose Coupling
- High Cohesion
- Scalability
- Extensibility`
          }
        ]
      }
    ];
  }

  private generateTechnicalSections(context: any): DocSection[] {
    return [
      {
        title: 'Technical Documentation',
        content: 'This document provides technical details about the implementation.',
        subsections: [
          {
            title: 'Dependencies',
            content: 'List of required dependencies and their versions.'
          },
          {
            title: 'Configuration',
            content: 'Configuration options and environment variables.'
          }
        ]
      }
    ];
  }

  private generateDiagrams(type: Documentation['type'], context: any): Diagram[] {
    const diagrams: Diagram[] = [];

    if (type === 'architecture') {
      diagrams.push({
        type: 'architecture',
        title: 'System Architecture',
        mermaidCode: `graph TB
    subgraph "Agent System"
        O[Orchestrator]
        R[Research Agent]
        P[Planning Agent]
        I[Implementation Agent]
        Q[Quality Agent]
        T[Testing Agent]
        D[Documentation Agent]
    end
    
    U[User] --> O
    O --> R
    O --> P
    O --> I
    O --> Q
    O --> T
    O --> D
    
    R -.-> P
    P -.-> I
    I -.-> T
    I -.-> Q
    T -.-> D`
      });
    }

    if (type === 'api') {
      diagrams.push({
        type: 'sequence',
        title: 'API Request Flow',
        mermaidCode: `sequenceDiagram
    participant C as Client
    participant A as API Gateway
    participant S as Service
    participant D as Database
    
    C->>A: HTTP Request
    A->>A: Validate Token
    A->>S: Process Request
    S->>D: Query Data
    D-->>S: Return Data
    S-->>A: Response
    A-->>C: HTTP Response`
      });
    }

    return diagrams;
  }

  private generateExamples(type: Documentation['type'], context: any): Example[] {
    const examples: Example[] = [];

    if (type === 'api') {
      examples.push({
        title: 'Creating an Item',
        description: 'Example of creating a new item via the API',
        language: 'javascript',
        code: `const response = await fetch('https://api.example.com/v1/items', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    name: 'New Item',
    description: 'This is a new item',
    value: 42
  })
});

const item = await response.json();
console.log('Created item:', item);`
      });
    }

    if (type === 'technical') {
      examples.push({
        title: 'Using the Agent System',
        description: 'Example of using the agent orchestrator',
        language: 'typescript',
        code: `import { Orchestrator, ResearchAgent } from 'ai-agent-system';

const orchestrator = new Orchestrator();
const researchAgent = new ResearchAgent();

orchestrator.registerAgent(researchAgent);

const result = await orchestrator.processTask('analyze the authentication module');
console.log('Research findings:', result);`
      });
    }

    return examples;
  }
}