# AI Agent System

A modular agent architecture for massive innovation in human-AI collaboration quality.

## Vision
Transform software development by making AI collaboration feel like working with a team of the world's best developers.

**[📍 Read our North Star Vision](docs/NORTH_STAR.md)** - See where we're headed and why.

## Key Features
- **Modular Agent Architecture**: Specialized agents for different tasks
- **Workflow Automation**: Pre-defined patterns for common development tasks
- **GitHub Integration**: Source of truth for all code and documentation
- **Quality Amplification**: 10x improvements in task completion and accuracy
- **Performance Metrics**: Real-time tracking and visualization of productivity gains
- **AI Provider Integration**: Support for Anthropic, OpenAI, and custom providers
- **CLI Tool**: Command-line interface for easy interaction with agents

## Agent Types
- Research Agent - Code exploration and understanding
- Planning Agent - Task decomposition and estimation
- Implementation Agent - Code generation and refactoring
- Quality Agent - Code review and security analysis
- Documentation Agent - Docs and example generation
- Testing Agent - Test case creation and execution

## Getting Started

### Installation
```bash
npm install
npm run build
npm link  # To use CLI globally
```

### CLI Usage
```bash
# Fix a bug
ai-agent fix "Fix null pointer exception" -s critical

# Develop a feature
ai-agent feature "Add user authentication" -s large

# Review code
ai-agent review src/components/Login.tsx

# View performance dashboard
ai-agent dashboard

# Test with notifications
npm run test:notify "New Feature"
```

### Documentation
- [Agent Architecture](docs/agent-architecture.md) - Detailed system design
- [Performance Metrics](docs/metrics-system.md) - Tracking and visualization
- [Test Workflow](docs/test-workflow.md) - Testing and notifications
- [AI Provider Setup](docs/ai-configuration.md) - Configure AI providers
- [North Star Vision](docs/NORTH_STAR.md) - Long-term goals

## Project Structure
```
.
├── CLAUDE.md              # Project context for AI assistants
├── README.md              # This file
├── docs/                  # Documentation
│   └── agent-architecture.md
├── workspace/             # Working files and workflows
│   ├── agent-workflows.md
│   └── current-tasks.md
└── notes/                 # Additional notes
```