# AI Agent System

A modular agent architecture for massive innovation in human-AI collaboration quality.

> **📢 New: Phased Implementation Approach** - Start simple, prove value, scale with confidence. See [Phased Approach Guide](docs/PHASED_APPROACH.md) for details.

## Vision
Transform software development by making AI collaboration feel like working with a team of the world's best developers.

**[📍 Read our North Star Vision](docs/NORTH_STAR.md)** - See where we're headed and why.

## Key Features
- **🆕 Interactive Chat Mode**: Natural conversations with AI agents that remember context
- **Modular Agent Architecture**: Specialized agents for different tasks
- **Workflow Automation**: Pre-defined patterns for common development tasks
- **GitHub Integration**: Source of truth for all code and documentation
- **Quality Amplification**: 10x improvements in task completion and accuracy
- **Performance Metrics**: Real-time tracking and visualization of productivity gains
- **AI Provider Integration**: Support for Anthropic, OpenAI, and custom providers
- **CLI Tool**: Command-line interface for easy interaction with agents
- **GitHub Actions**: Automated PR reviews, security audits, and documentation updates

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

### Quick Start (Phase 1)
```bash
# Set to Phase 1 (simplified agents)
export AI_AGENT_PHASE=1

# Test Research Agent
ai-agent research "analyze login system"

# Test Implementation Agent  
ai-agent implement "add password validation"

# Check capabilities
ai-agent status
```

For the full phased implementation guide, see [docs/PHASED_APPROACH.md](docs/PHASED_APPROACH.md).

### CLI Usage

#### 🆕 Interactive Chat Mode
```bash
# Start conversational interface
ai-agent chat

# Resume previous conversation
ai-agent chat --resume oauth-session

# Example conversation:
> Show me how the auth system works
> Add Google OAuth to the login
> Create tests for the new feature
> Deploy to staging
```

#### Traditional Commands
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

## GitHub Actions Integration

The AI Agent System includes powerful GitHub Actions workflows:

### 🤖 Automated PR Reviews
- AI agents review every pull request
- Inline comments for issues found
- Security vulnerability scanning
- Code quality assessment

### 📝 PR Description Generation
- Automatically generates comprehensive PR descriptions
- Analyzes changes and creates summaries
- Adds testing checklists

### 🔒 Security Audits
- Scheduled security scans
- OWASP vulnerability detection
- SARIF report integration with GitHub Security tab
- Critical issue alerts

### 📚 Documentation Updates
- Automatically updates docs when code changes
- Generates API documentation
- Creates PRs with documentation updates

**Setup:** Add `AI_API_KEY` to your repository secrets. See [.github/README.md](.github/README.md) for details.

## Project Structure
```
.
├── CLAUDE.md              # Project context for AI assistants
├── README.md              # This file
├── .github/               # GitHub Actions workflows
│   ├── workflows/         # AI-powered automation
│   └── actions/           # Reusable actions
├── docs/                  # Documentation
│   └── agent-architecture.md
├── src/                   # Source code
│   ├── agents/            # AI agent implementations
│   ├── workflows/         # Workflow templates
│   └── cli/               # CLI commands
├── workspace/             # Working files and workflows
│   ├── agent-workflows.md
│   └── current-tasks.md
└── notes/                 # Additional notes
```