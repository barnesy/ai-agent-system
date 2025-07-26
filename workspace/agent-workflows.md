# Defined Agent Workflows

## 1. Feature Development Workflow
**Agents**: Research → Planning → Implementation → Testing → Documentation
```
Trigger: "Implement feature X"
1. Research Agent: Analyze codebase, find patterns
2. Planning Agent: Break down tasks, estimate effort  
3. Implementation Agent: Write code following patterns
4. Testing Agent: Generate and run tests
5. Documentation Agent: Update docs and examples
```

## 2. Bug Fix Workflow
**Agents**: Research → Testing → Implementation → Quality
```
Trigger: "Fix bug in Y"
1. Research Agent: Locate bug source, understand context
2. Testing Agent: Create failing test case
3. Implementation Agent: Fix bug
4. Quality Agent: Verify fix doesn't break other code
```

## 3. Refactoring Workflow
**Agents**: Research → Quality → Planning → Implementation
```
Trigger: "Refactor module Z"
1. Research Agent: Map dependencies and usage
2. Quality Agent: Identify improvement opportunities
3. Planning Agent: Create safe refactoring plan
4. Implementation Agent: Execute refactoring steps
```

## 4. Code Review Workflow
**Agents**: Quality → Documentation → Testing
```
Trigger: "Review recent changes"
1. Quality Agent: Analyze code quality, security
2. Documentation Agent: Check doc completeness
3. Testing Agent: Verify test coverage
```

## 5. Learning Workflow
**Agents**: Research → Documentation
```
Trigger: "Understand system X"
1. Research Agent: Deep dive into code
2. Documentation Agent: Create explanatory docs
```

## Implementation Ideas

### Agent Prompts
Each agent has specialized prompts:
- Research: "You are an expert code archaeologist..."
- Planning: "You are a senior architect who excels at breaking down complex tasks..."
- Quality: "You are a meticulous code reviewer focused on bugs, security, and performance..."

### Context Sharing
- Shared workspace for agent outputs
- Structured data formats for inter-agent communication
- Context accumulation across agent interactions

### Orchestration Rules
- Parallel execution when possible
- Sequential when dependencies exist
- Fail-fast with graceful degradation
- Human-in-the-loop checkpoints