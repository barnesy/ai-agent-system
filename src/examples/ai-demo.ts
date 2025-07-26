#!/usr/bin/env node

import { ResearchAgent } from '../agents/research-agent';
import { aiAdapter } from '../ai/ai-adapter';
import { config } from '../config/config';

async function demonstrateAI() {
  console.log('🤖 AI Integration Demo\n');
  console.log('=' .repeat(50));

  // Check configuration
  const providers = aiAdapter.getAvailableProviders();
  console.log('\nAvailable AI Providers:', providers);
  console.log('Default Provider:', config.get().ai.defaultProvider);

  // Create and configure agent
  const researchAgent = new ResearchAgent();
  
  // Test without AI (mock response)
  console.log('\n📌 Test 1: Without AI (Mock Response)');
  console.log('-'.repeat(50));
  
  let result = await researchAgent.execute({
    from: 'user',
    to: 'ResearchAgent',
    type: 'request',
    payload: {
      task: 'analyze the authentication system',
      priority: 'high'
    },
    timestamp: new Date()
  });
  
  console.log('Mock Response:', JSON.stringify(result.payload.context, null, 2));

  // Enable AI
  console.log('\n📌 Test 2: With AI Enabled');
  console.log('-'.repeat(50));
  
  researchAgent.enableAI();
  
  result = await researchAgent.execute({
    from: 'user',
    to: 'ResearchAgent',
    type: 'request',
    payload: {
      task: 'analyze the authentication system and identify security patterns',
      context: {
        files: ['auth.ts', 'middleware/auth.ts', 'utils/jwt.ts'],
        framework: 'Express.js'
      },
      priority: 'high'
    },
    timestamp: new Date()
  });
  
  console.log('AI Response:', JSON.stringify(result.payload.context, null, 2));

  // Show usage stats
  console.log('\n📊 Usage Statistics:');
  console.log('-'.repeat(50));
  console.log('Check console logs for detailed usage metrics');

  // Configuration example
  console.log('\n⚙️  Configuration:');
  console.log('-'.repeat(50));
  console.log('To use real AI providers, set environment variables:');
  console.log('- ANTHROPIC_API_KEY=your-key-here');
  console.log('- OPENAI_API_KEY=your-key-here');
  console.log('\nOr update config:');
  console.log('- ai-agent config set anthropic.apiKey your-key');
  console.log('- ai-agent config set ai.defaultProvider anthropic');
}

if (require.main === module) {
  demonstrateAI().catch(console.error);
}