import chalk from 'chalk';
import { AIProviderFactory, AIProviderConfigManager, getProviderFromEnv } from '../ai-providers/provider-factory';
import { AIProviderType } from '../ai-providers/types';
import { BaseAgentAI } from '../agents/base-agent-ai';
import { AgentCapabilities } from '../agents/base-agent';

/**
 * Demo Research Agent using AI Provider
 */
class DemoResearchAgentAI extends BaseAgentAI {
  constructor(aiProvider?: any) {
    const capabilities: AgentCapabilities = {
      canHandle: (task: string) => task.toLowerCase().includes('research'),
      estimateTime: () => 5,
      dependencies: []
    };

    super('AIResearchAgent', capabilities, aiProvider);
    this.setTemperature(0.3); // Lower temperature for more focused research
    this.setMaxTokens(1500);
  }

  protected getSystemPrompt(): string {
    return `You are an AI Research Agent. Your role is to analyze code, find patterns, and provide insights.
Always structure your responses as JSON with the following format:
{
  "task": "description of what was completed",
  "findings": ["finding 1", "finding 2", ...],
  "recommendations": ["recommendation 1", ...],
  "codeLocations": ["file:line", ...],
  "context": { "additional": "information" }
}`;
  }
}

/**
 * Demonstrates the AI Provider System
 */
async function demonstrateAIProviders() {
  console.log(chalk.blue.bold('\n🤖 AI Provider Integration Demo\n'));

  // Check environment configuration
  console.log(chalk.cyan('1. Checking AI Provider Configuration'));
  const envProvider = process.env.AI_PROVIDER || 'mock';
  const hasApiKey = !!process.env.AI_API_KEY;
  
  console.log(chalk.gray(`Provider: ${envProvider}`));
  console.log(chalk.gray(`API Key: ${hasApiKey ? '✓ Configured' : '✗ Not configured (using mock)'}`));
  console.log(chalk.gray(`Model: ${process.env.AI_MODEL || 'default'}\n`));

  // Create providers
  console.log(chalk.cyan('2. Creating AI Providers'));
  
  // Mock provider (always available)
  const mockProvider = AIProviderFactory.createProvider(AIProviderType.MOCK, {});
  console.log(chalk.green('✓ Mock provider created'));

  // Real providers (if configured)
  let realProvider = null;
  if (hasApiKey) {
    try {
      realProvider = getProviderFromEnv();
      console.log(chalk.green(`✓ ${realProvider.name} provider created`));
    } catch (error) {
      console.log(chalk.yellow(`⚠ Could not create real provider: ${(error as Error).message}`));
    }
  }

  // Test providers
  console.log(chalk.cyan('\n3. Testing Provider Connections'));
  const mockTest = mockProvider.testConnection ? await mockProvider.testConnection() : true;
  console.log(chalk.gray(`Mock provider: ${mockTest ? '✓ Connected' : '✗ Failed'}`));
  
  if (realProvider && realProvider.testConnection) {
    const realTest = await realProvider.testConnection();
    console.log(chalk.gray(`${realProvider.name}: ${realTest ? '✓ Connected' : '✗ Failed'}`));
  }

  // Create AI-powered agent
  console.log(chalk.cyan('\n4. Creating AI-Powered Agent'));
  const agent = new DemoResearchAgentAI(realProvider || mockProvider);
  console.log(chalk.green(`✓ Research agent created with ${agent['aiProvider'].name} provider`));

  // Execute a research task
  console.log(chalk.cyan('\n5. Executing Research Task'));
  const task = {
    from: 'demo',
    to: 'AIResearchAgent',
    type: 'request' as const,
    payload: {
      task: 'Research best practices for error handling in TypeScript',
      priority: 'medium' as const
    },
    timestamp: new Date()
  };

  console.log(chalk.gray('Sending task to AI agent...'));
  const startTime = Date.now();
  
  const response = await agent.execute(task);
  const duration = Date.now() - startTime;

  console.log(chalk.green(`✓ Task completed in ${duration}ms`));
  console.log(chalk.gray('\nResponse:'));
  console.log(chalk.white(JSON.stringify(response.payload, null, 2)));

  // Show token usage if available
  const provider = agent['aiProvider'];
  if (response.payload.context?.usage) {
    console.log(chalk.cyan('\n6. Token Usage & Cost'));
    console.log(chalk.gray(`Input tokens: ${response.payload.context.usage.inputTokens}`));
    console.log(chalk.gray(`Output tokens: ${response.payload.context.usage.outputTokens}`));
    console.log(chalk.gray(`Estimated cost: $${response.payload.context.usage.cost.toFixed(4)}`));
  }

  // Demonstrate streaming (if supported)
  if (provider.streamResponse) {
    console.log(chalk.cyan('\n7. Streaming Response Demo'));
    console.log(chalk.gray('Streaming response chunks:'));
    
    const streamTask = {
      ...task,
      payload: {
        ...task.payload,
        task: 'List 3 TypeScript best practices'
      }
    };

    let chunkCount = 0;
    await agent.streamExecute(streamTask, (chunk) => {
      process.stdout.write(chalk.dim(chunk));
      chunkCount++;
    });
    
    console.log(chalk.gray(`\n\nReceived ${chunkCount} chunks`));
  }

  // Show configuration options
  console.log(chalk.cyan('\n8. Configuration Options'));
  console.log(chalk.white(`
To use real AI providers, set these environment variables:

For OpenAI:
  export AI_PROVIDER=openai
  export AI_API_KEY=your-openai-api-key
  export AI_MODEL=gpt-3.5-turbo

For Anthropic:
  export AI_PROVIDER=anthropic
  export AI_API_KEY=your-anthropic-api-key
  export AI_MODEL=claude-3-haiku-20240307

Additional options:
  export AI_TIMEOUT=30000        # Request timeout in ms
  export AI_MAX_RETRIES=3        # Number of retries
  export AI_RATE_LIMIT=60        # Requests per minute
`));

  console.log(chalk.blue.bold('\n✅ AI Provider Demo Complete!\n'));
}

// Run the demo
if (require.main === module) {
  demonstrateAIProviders()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(chalk.red('Demo error:', error));
      process.exit(1);
    });
}