# Structure Governance

## Why Structure Matters

This project's success depends on maintaining clear structure and documentation. The modular agent architecture only works when:
- Each component has a clear purpose
- Documentation stays synchronized with code
- Design decisions are traceable
- Future sessions have full context

## Enforcement Mechanisms

### 1. Automated Validation
- `npm run validate` - Checks structure compliance
- GitHub Actions run on every PR
- Pre-commit hooks catch issues early

### 2. Documentation Requirements
Every change must update:
- Technical context (CLAUDE.md)
- Progress tracking (current-tasks.md)
- Design rationale (design-decisions.md)
- Strategic insights (session-insights.md)

### 3. Pull Request Template
Forces contributors to confirm:
- Documentation updated
- Structure maintained
- Tests included
- Design principles followed

### 4. Code Review Checklist
Reviewers must verify:
- Agent specialization maintained
- Message passing architecture preserved
- Workflows remain composable
- Documentation reflects changes

## Key Principles to Preserve

### 1. Modularity
- One agent, one responsibility
- No direct dependencies between agents
- Clear interfaces

### 2. Documentation as Code
- Docs live with code
- Changes require doc updates
- GitHub is source of truth

### 3. Workflow First
- User value drives design
- Real examples required
- Composability over complexity

### 4. Continuous Context
- Every session builds on previous
- Decisions are logged with rationale
- Philosophy documented alongside code

## When to Break Rules

Sometimes structure needs to evolve. When considering changes:

1. Document the limitation in current structure
2. Propose alternative in design-decisions.md
3. Get consensus through PR discussion
4. Update governance docs if approved

## Maintaining Momentum

Structure shouldn't slow development:
- Use templates for common tasks
- Automate validation where possible
- Focus on value, not process
- Keep documentation concise

## Success Metrics

We know structure is working when:
- New contributors understand quickly
- Features compose naturally
- Documentation stays current
- Future sessions have full context

---

Remember: Structure enables innovation, not restricts it.