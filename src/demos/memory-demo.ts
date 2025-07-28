import { ResearchAgentMemory } from '../agents/research-agent-memory';
import { contextManager } from '../memory/context-manager';
import { memoryStore } from '../memory/memory-store';
import chalk from 'chalk';

/**
 * Demonstrates the agent memory and context persistence system
 */
async function demonstrateMemorySystem() {
  console.log(chalk.blue.bold('\n🧠 AI Agent Memory System Demo\n'));

  // Create a research agent with memory
  const researchAgent = new ResearchAgentMemory();

  console.log(chalk.cyan('1. First Research Task - Learning about authentication'));
  
  // First task - agent learns something new
  const firstTask = await researchAgent.execute({
    from: 'demo',
    to: 'ResearchAgent',
    type: 'request',
    payload: {
      task: 'Research authentication patterns in the codebase',
      priority: 'medium'
    },
    timestamp: new Date()
  });

  console.log(chalk.green('✓ First research completed'));
  console.log(chalk.gray(JSON.stringify(firstTask.payload, null, 2)));

  // Simulate some findings being stored
  await researchAgent.shareKnowledge(
    'Authentication Patterns',
    [
      'JWT tokens are used for API authentication',
      'Session timeout is configured at 30 minutes',
      'OAuth2 integration exists for third-party services'
    ]
  );

  console.log(chalk.yellow('\n⏱️  Simulating time passing...\n'));
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log(chalk.cyan('2. Second Research Task - Building on previous knowledge'));
  
  // Second task - agent should recall previous findings
  const secondTask = await researchAgent.execute({
    from: 'demo',
    to: 'ResearchAgent',
    type: 'request',
    payload: {
      task: 'Research authentication timeout issues',
      priority: 'high'
    },
    timestamp: new Date()
  });

  console.log(chalk.green('✓ Second research completed (with memory context)'));
  console.log(chalk.gray(JSON.stringify(secondTask.payload, null, 2)));

  // Show agent's context
  console.log(chalk.cyan('\n3. Viewing Agent Context'));
  const contextSummary = await contextManager.summarizeContext('ResearchAgent');
  console.log(chalk.gray(contextSummary));

  // Query memories
  console.log(chalk.cyan('\n4. Querying Agent Memories'));
  const authMemories = await memoryStore.query({
    agentName: 'ResearchAgent',
    search: 'authentication',
    limit: 5
  });

  console.log(chalk.yellow(`Found ${authMemories.length} memories related to authentication:`));
  for (const memory of authMemories) {
    console.log(chalk.gray(`- [${memory.type}] ${JSON.stringify(memory.content).substring(0, 100)}...`));
  }

  // Search previous research
  console.log(chalk.cyan('\n5. Searching Previous Research'));
  const previousResearch = await researchAgent.searchPreviousResearch('authentication');
  console.log(chalk.yellow(`Found ${previousResearch.length} previous research items`));
  
  // Demonstrate context sharing between agents
  console.log(chalk.cyan('\n6. Sharing Context Between Agents'));
  await contextManager.shareContext(
    'ResearchAgent',
    'ImplementationAgent',
    {
      authenticationFindings: [
        'JWT implementation in src/auth/jwt.ts',
        'Session management in src/auth/session.ts'
      ]
    }
  );
  console.log(chalk.green('✓ Context shared with ImplementationAgent'));

  // Show shared context
  const implContext = await contextManager.getContext('ImplementationAgent');
  console.log(chalk.gray('ImplementationAgent received context:'));
  console.log(chalk.gray(JSON.stringify(implContext.sharedContext, null, 2)));

  console.log(chalk.blue.bold('\n✅ Memory System Demo Complete!\n'));
  
  console.log(chalk.white('Key Features Demonstrated:'));
  console.log(chalk.gray('- Agents remember previous interactions'));
  console.log(chalk.gray('- Context is preserved across tasks'));
  console.log(chalk.gray('- Knowledge can be shared between agents'));
  console.log(chalk.gray('- Memories can be queried and searched'));
  console.log(chalk.gray('- Relevant context is automatically loaded\n'));
}

// Run the demo
if (require.main === module) {
  demonstrateMemorySystem()
    .then(() => {
      // Clean up after demo
      setTimeout(() => {
        console.log(chalk.dim('Cleaning up demo memories...'));
        memoryStore.clear('ResearchAgent');
        process.exit(0);
      }, 2000);
    })
    .catch(error => {
      console.error(chalk.red('Demo error:', error));
      process.exit(1);
    });
}