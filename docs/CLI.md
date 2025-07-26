# AI Agent CLI Documentation

## Installation

### From npm (when published)
```bash
npm install -g ai-agent-system
```

### From source
```bash
git clone https://github.com/barnesy/ai-agent-system
cd ai-agent-system
npm install
npm run build
npm link
```

## Usage

```bash
ai-agent [options] [command]
```

### Global Options
- `-v, --verbose` - Show detailed output
- `--no-ai` - Use mock responses (no API calls)
- `-V, --version` - Show version
- `-h, --help` - Show help

## Commands

### `fix` - Fix a Bug
Fix bugs with AI-powered assistance through the complete workflow.

```bash
ai-agent fix "Users cannot login with special characters"
```

Options:
- `-s, --severity <level>` - Bug severity: critical, major, minor (default: major)
- `-f, --files <files...>` - Specific files to focus on

Example:
```bash
ai-agent fix "Memory leak in data processing" -s critical -f src/data/processor.ts
```

### `feature` - Develop a Feature
Build new features with AI assistance from planning to documentation.

```bash
ai-agent feature "Add dark mode support"
```

Options:
- `-p, --priority <level>` - Priority: high, medium, low (default: medium)
- `-r, --requirements <reqs...>` - Specific requirements

Example:
```bash
ai-agent feature "User dashboard" -p high -r "real-time updates" "mobile responsive"
```

### `review` - Review Pull Request
Get AI-powered code review for pull requests.

```bash
ai-agent review 123
```

Options:
- `-t, --thorough` - Perform thorough review

Example:
```bash
ai-agent review 456 --thorough
```

### `run` - Run Custom Workflow
Execute custom agent workflows with comma-separated steps.

```bash
ai-agent run "analyze codebase, create improvement plan, generate tests"
```

Options:
- `-c, --context <json>` - Provide context as JSON

Example:
```bash
ai-agent run "research auth patterns, implement oauth" -c '{"provider":"google"}'
```

### `config` - Manage Configuration
View and update configuration settings.

```bash
# View all settings
ai-agent config

# Get specific value
ai-agent config get ai.defaultProvider

# Set value
ai-agent config set ai.defaultProvider anthropic
ai-agent config set anthropic.apiKey your-api-key
```

## Workflow Examples

### Fix a Critical Bug
```bash
# Fix with full AI assistance
ai-agent fix "Database connections not closing properly" -s critical

# Fix without AI (mock mode)
ai-agent fix "Typo in error message" --no-ai
```

### Develop a Feature
```bash
# Simple feature
ai-agent feature "Add user avatar upload"

# Complex feature with requirements
ai-agent feature "Multi-factor authentication" -p high \
  -r "support TOTP" "SMS backup" "remember device option"
```

### Review Code
```bash
# Quick review
ai-agent review 789

# Thorough review with security focus
ai-agent review 789 --thorough
```

### Custom Workflows
```bash
# Code improvement workflow
ai-agent run "analyze performance bottlenecks, create optimization plan, implement fixes"

# Documentation workflow
ai-agent run "analyze API endpoints, generate OpenAPI spec, create examples"

# Testing workflow
ai-agent run "analyze untested code, generate test cases, implement tests"
```

## Configuration

### API Keys
Set API keys via environment variables (recommended):
```bash
export ANTHROPIC_API_KEY=your-key
export OPENAI_API_KEY=your-key
```

Or via CLI:
```bash
ai-agent config set anthropic.apiKey your-key
ai-agent config set openai.apiKey your-key
```

### Default Provider
```bash
# Use Anthropic Claude by default
ai-agent config set ai.defaultProvider anthropic

# Use OpenAI GPT by default  
ai-agent config set ai.defaultProvider openai

# Use mock provider (no API calls)
ai-agent config set ai.defaultProvider mock
```

## Output

The CLI provides:
- 🔄 Real-time progress indicators
- ✅ Clear success/failure states
- 📊 Structured result summaries
- 💡 Actionable recommendations
- 📋 Next steps guidance

## Tips

1. **Start with `--no-ai`** to test workflows without API costs
2. **Use `--verbose`** for debugging and detailed logs
3. **Set API keys** via environment variables for security
4. **Chain commands** for complex workflows:
   ```bash
   ai-agent fix "bug description" && ai-agent review main
   ```

## Troubleshooting

### Command not found
```bash
# Ensure global installation
npm link

# Or use npx
npx ai-agent <command>
```

### API errors
```bash
# Check configuration
ai-agent config

# Test with mock provider
ai-agent fix "test" --no-ai

# Enable verbose mode
ai-agent fix "test" --verbose
```

### Performance issues
- Use specific file targeting with `-f` flag
- Break large tasks into smaller workflows
- Consider using faster AI models