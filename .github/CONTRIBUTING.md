# Contributing to AI Agent System

## Before You Start
1. Read our [North Star Vision](../docs/NORTH_STAR.md) to understand our direction
2. Check existing [Issues](https://github.com/barnesy/ai-agent-system/issues) for similar ideas
3. For major changes, open a Design Decision issue first

## Required Documentation Updates

Every significant change MUST update relevant documentation:

### When Adding Features
- [ ] Update `CLAUDE.md` if it changes project structure or commands
- [ ] Add to `workspace/current-tasks.md` progress log
- [ ] Document design decisions in `workspace/design-decisions.md`
- [ ] Update relevant workflow examples

### When Making Architectural Changes
- [ ] Document decision in `workspace/design-decisions.md`
- [ ] Update `docs/agent-architecture.md` if needed
- [ ] Add rationale to `workspace/session-insights.md`

### Before Merging PRs
- [ ] All agents have corresponding tests
- [ ] Documentation reflects code changes
- [ ] Examples still work (`npm run demo`)
- [ ] No breaking changes without migration guide

## Code Structure Rules

### Agent Development
```typescript
// Every agent MUST:
1. Extend BaseAgent
2. Implement clear capabilities
3. Have dedicated test file
4. Include usage examples
```

### Workflow Development
```typescript
// Every workflow MUST:
1. Have clear input/output types
2. Document agent coordination
3. Include real-world example
4. Handle errors gracefully
```

## Documentation Standards

### CLAUDE.md
- Project overview and vision (don't change without discussion)
- Current technical setup
- Active focus areas

### session-insights.md
- Major breakthroughs and pivots
- Philosophy changes
- Lessons learned

### design-decisions.md
- Format: Context → Options → Decision → Rationale
- Include date and alternatives considered
- Reference related discussions

## Commit Message Format
```
<type>: <description>

<detailed explanation if needed>

<reference to design decision if applicable>

Co-Authored-By: Claude <noreply@anthropic.com>
```

Types: feat, fix, docs, refactor, test, chore

## Review Checklist
- [ ] Does this maintain our modular architecture?
- [ ] Are workflows still composable?
- [ ] Is parallel execution preserved?
- [ ] Documentation updated?
- [ ] Tests included?