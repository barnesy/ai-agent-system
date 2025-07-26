# AI Integration Guide

## Overview
The AI Agent System supports multiple AI providers to power intelligent agent responses. Each agent can leverage real AI models for advanced reasoning and code generation.

## Supported Providers

### 1. Mock Provider (Default)
- Always available
- No API key required
- Useful for testing and development
- Zero cost

### 2. Anthropic (Claude)
- Models: Claude 3 Opus, Sonnet, Haiku
- Best for: Complex reasoning, code analysis
- Pricing: $0.003-$0.075 per 1K tokens

### 3. OpenAI (GPT)
- Models: GPT-4, GPT-4 Turbo, GPT-3.5
- Best for: General purpose, wide knowledge
- Pricing: $0.0005-$0.06 per 1K tokens

## Configuration

### Method 1: Environment Variables (Recommended)
```bash
export ANTHROPIC_API_KEY=your-anthropic-key
export OPENAI_API_KEY=your-openai-key
```

### Method 2: Config File
```bash
# Set API keys
ai-agent config set anthropic.apiKey your-key
ai-agent config set openai.apiKey your-key

# Set default provider
ai-agent config set ai.defaultProvider anthropic
```

### Method 3: Programmatic
```typescript
import { config } from 'ai-agent-system';

config.setApiKey('anthropic', 'your-key');
config.update({
  ai: {
    defaultProvider: 'anthropic'
  }
});
```

## Usage

### Enable AI for All Agents
```typescript
const orchestrator = new Orchestrator();

// Register agents with AI enabled
const researchAgent = new ResearchAgent();
researchAgent.enableAI();
orchestrator.registerAgent(researchAgent);
```

### Provider Selection
```typescript
// Use default provider
await aiAdapter.complete(request);

// Use specific provider
await aiAdapter.complete(request, 'openai');

// Estimate costs before running
const cost = aiAdapter.estimateCost(request, 'anthropic');
console.log(`Estimated cost: $${cost}`);
```

## Agent System Prompts

Each agent has a specialized system prompt that defines its role:

- **ResearchAgent**: Code archaeologist and pattern finder
- **PlanningAgent**: Strategic architect and task decomposer
- **ImplementationAgent**: Master coder focused on clean code
- **QualityAgent**: Security expert and performance optimizer
- **TestingAgent**: QA specialist ensuring comprehensive coverage
- **DocumentationAgent**: Technical writer creating clear docs

## Cost Optimization

### 1. Model Selection
- Use Haiku/GPT-3.5 for simple tasks
- Reserve Opus/GPT-4 for complex reasoning
- Mock provider for testing

### 2. Token Optimization
- Concise prompts
- Structured outputs (JSON)
- Reasonable max tokens

### 3. Caching
- Results are cached for 15 minutes
- Duplicate requests use cache
- Cache cleared on context change

## Monitoring

AI usage is logged with:
- Provider and model used
- Token counts
- Cost estimates
- Response times

View logs in development:
```bash
NODE_ENV=development npm run example:ai
```

## Security

- API keys stored securely
- Never committed to git
- Environment variables preferred
- Keys redacted in config files

## Troubleshooting

### "Provider not configured"
- Check API key is set
- Verify environment variables
- Run `npm run example:ai` to check status

### "Rate limit exceeded"
- Automatic retry with backoff
- Consider upgrading API plan
- Use multiple providers

### "Invalid API key"
- Verify key is correct
- Check provider dashboard
- Ensure key has proper permissions

## Examples

See working examples:
- `src/examples/ai-demo.ts` - Basic AI usage
- `src/agents/research-agent.ts` - Agent with AI support
- Workflow examples with real AI responses