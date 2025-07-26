# Project Context for Claude

## Project Overview
Building a modular AI agent system for massive innovation in human-AI collaboration quality. Using GitHub as the source of truth for all code and documentation.

**GitHub Repository**: https://github.com/barnesy/ai-agent-system

## Vision
Transform how humans work with AI through:
- 10x reduction in task completion time
- 90% accuracy in anticipating user needs
- Zero-friction context switching
- Measurable code quality improvements

## Tech Stack
- Architecture: Modular agent-based system
- Languages: TypeScript/Python (TBD based on implementation needs)
- Infrastructure: GitHub Actions for CI/CD
- Communication: Structured message passing between agents

## Project Structure
```
/Users/barnesy/projects/ai-agent-system/
├── CLAUDE.md          # This file - project context
├── README.md          # Public documentation
├── .gitignore         # Git ignore rules
├── docs/              # Documentation
│   └── agent-architecture.md
├── workspace/         # Working files
│   ├── current-tasks.md
│   └── agent-workflows.md
└── notes/            # Additional notes
```

## Agent Types
1. **Research Agent** - Code exploration, pattern detection
2. **Planning Agent** - Task decomposition, estimation
3. **Implementation Agent** - Code generation, refactoring
4. **Quality Agent** - Review, security, performance
5. **Documentation Agent** - Docs, examples, diagrams
6. **Testing Agent** - Test generation, coverage

## Development Commands
```bash
# Git workflow
git add .
git commit -m "message"
git push

# Create PR
gh pr create

# View PR
gh pr view

# Check repo
gh repo view --web
```

## Coding Conventions
- GitHub is the source of truth - all changes via PRs
- Clear, descriptive commit messages
- Modular, composable design
- Each agent is self-contained with clear interfaces
- Prioritize readability and maintainability
- Test-driven development where applicable

## Workflow Patterns
1. **Feature Development**: Research → Planning → Implementation → Testing → Documentation
2. **Bug Fix**: Research → Testing → Implementation → Quality
3. **Refactoring**: Research → Quality → Planning → Implementation
4. **Code Review**: Quality → Documentation → Testing
5. **Learning**: Research → Documentation

## Important Notes
- Focus on agent-based architecture for modularity
- Prioritize workflow automation to reduce friction
- Measure quality improvements quantitatively
- Use parallel execution where possible
- Maintain clear separation of concerns between agents

## Current Focus
- Creating specialized agent implementations
- Building orchestration framework
- Testing multi-agent collaboration
- Establishing metrics for quality measurement