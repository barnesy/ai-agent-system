# Phase 1 Quick Start Guide

Get started with the AI Agent System in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Basic TypeScript knowledge

## Installation

```bash
# Clone the repository
git clone https://github.com/barnesy/ai-agent-system.git
cd ai-agent-system

# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Build Phase 1 components only
npm run phase1:build
```

## Basic Usage

### 1. Check System Status

```bash
npm run phase1:status
```

This shows:
- Current phase (1)
- Enabled agents (Research, Implementation)
- Agent capabilities
- Phase transition criteria

### 2. Research Code

```bash
# Understand a system
npm run phase1:research "analyze the authentication flow"

# Search for patterns
npm run phase1:research "find all API endpoints"

# Explore dependencies
npm run phase1:research "understand database connections"
```

### 3. Generate Implementation

```bash
# Create a function
npm run phase1:implement "create user validation" -- --name validateUser

# Generate a class
npm run phase1:implement "build cache service" -- --name CacheService

# Write tests
npm run phase1:implement "create tests for auth module"
```

### 4. Run Simple Workflows

```bash
# Research then implement
npm run phase1 workflow simple --description "add logging system"
```

## Phase 1 Limitations

✅ **What Works:**
- Basic code exploration
- Pattern-based code generation
- Simple workflows
- Execution metrics

❌ **Not Available Yet:**
- AI-powered analysis (Phase 2)
- Parallel execution (Phase 2)
- Quality checks (Phase 2)
- Visual editor (Phase 3)

## Measuring Success

Track these metrics to determine readiness for Phase 2:

1. **Time Savings**: Aim for 50% reduction
   - Time a manual task
   - Time the same task with agents
   - Calculate percentage saved

2. **Success Rate**: Target 90%
   - Track successful vs failed agent tasks
   - Note any manual fixes needed

3. **Token Usage**: Keep under 4x baseline
   - Monitor with `npm run phase1:status`
   - Compare to direct AI chat usage

4. **User Satisfaction**: Score >7/10
   - Rate ease of use
   - Rate output quality
   - Rate time savings

## Common Tasks

### Finding Code Patterns
```bash
npm run phase1:research "find all error handling patterns"
```

### Creating Utilities
```bash
npm run phase1:implement "create string manipulation utilities"
```

### Building APIs
```bash
npm run phase1:implement "create REST endpoint for users"
```

### Writing Tests
```bash
npm run phase1:implement "create unit tests for validation"
```

## Troubleshooting

### "Agent not available"
- Ensure `AI_AGENT_PHASE=1` in your .env
- Run `npm run phase1:build`

### "Command not found"
- Run `npm link` to install CLI globally
- Or use `npm run phase1` prefix

### Build errors
- Use `npm run phase1:build` not `npm run build`
- Check Node.js version (18+ required)

## Next Steps

1. **Use on real tasks**: Apply to your daily development
2. **Track metrics**: Document time savings
3. **Gather feedback**: Note what works/doesn't
4. **Evaluate Phase 2**: Check criteria with `npm run phase1:status`

## Getting Help

- Documentation: [docs/PHASED_APPROACH.md](docs/PHASED_APPROACH.md)
- Issues: [GitHub Issues](https://github.com/barnesy/ai-agent-system/issues)
- Phase 2 Planning: When you achieve Phase 1 goals

Remember: Start simple, prove value, then scale!