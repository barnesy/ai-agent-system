# Test Workflow System

## Overview

The AI Agent System includes a comprehensive test workflow that ensures you can easily test new features and get notified when tests are ready. This creates a seamless feedback loop for development.

## Key Features

1. **Automated Test Setup** - Creates isolated test environments
2. **Multi-Channel Notifications** - Get notified via Slack, email, GitHub, or webhooks
3. **Test Reports** - Detailed test results and coverage metrics
4. **Interactive Test Server** - Optional web interface for testing
5. **GitHub Integration** - Automatic PR comments with test results

## Quick Start

### Simple Test Command
```bash
# Run quick test and get notified
./scripts/test-notify.sh "User Authentication Feature"

# With custom port
./scripts/test-notify.sh "Payment Integration" 3001
```

### CLI Test Command
```bash
# Setup test environment with notifications
ai-agent test "New Feature" --open

# Without interactive server
ai-agent test "Bug Fix" --no-interactive

# Custom port
ai-agent test "API Update" --port 4000
```

## Notification Channels

### 1. Local Notifications
Always created in `.tests/` directory:
- `latest-notification.json` - JSON format
- `latest-test.md` - Markdown report

### 2. Webhook Notifications
Set environment variable:
```bash
export TEST_WEBHOOK_URL="https://your-webhook.com/notify"
```

Or configure in `.notifications.json`:
```json
{
  "webhook": "https://your-webhook.com/notify"
}
```

### 3. Slack Notifications
Configure in `.notifications.json`:
```json
{
  "slack": {
    "webhookUrl": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
  }
}
```

### 4. GitHub Notifications
Automatic for PRs when using GitHub Actions:
- Creates comment on PR with test results
- Uploads test artifacts
- Links to test environment

### 5. Email Notifications
Configure in `.notifications.json`:
```json
{
  "email": {
    "to": "dev-team@example.com",
    "from": "ai-agent@example.com"
  }
}
```

## Test Report Format

Each test generates a comprehensive report:

```json
{
  "testId": "test-1234567890",
  "feature": "User Authentication",
  "timestamp": "2024-01-15T10:30:00Z",
  "status": "ready",
  "testUrl": "http://localhost:3000/test/test-1234567890",
  "results": {
    "unit": { "passed": 45, "failed": 0, "skipped": 2 },
    "integration": { "passed": 12, "failed": 0, "skipped": 0 },
    "e2e": { "passed": 5, "failed": 0, "skipped": 1 }
  },
  "metrics": {
    "coverage": 85,
    "performance": "good",
    "buildTime": "2.3s"
  },
  "instructions": [
    "Test environment is ready at: http://localhost:3000",
    "Run CLI commands to test functionality",
    "Check dashboard for metrics"
  ]
}
```

## GitHub Actions Integration

The workflow automatically runs on:
- Push to main/develop branches
- Pull requests
- Manual trigger

### Workflow Features
1. Builds and tests the project
2. Sets up test environment
3. Sends notifications to configured channels
4. Creates PR comments with results
5. Uploads test artifacts

### Manual Trigger
```yaml
# Trigger with custom feature name
gh workflow run test-notification.yml -f feature="Custom Feature Test"
```

## Test Environment

### Interactive Mode
When running with interactive mode (default), a test server starts:
- Provides web interface for testing
- Shows real-time test results
- Displays available CLI commands
- Auto-refreshes metrics

### Non-Interactive Mode
For CI/CD or automated testing:
```bash
ai-agent test "Feature" --no-interactive
```

## Best Practices

### 1. Configure Notifications
Create `.notifications.json` from template:
```bash
cp .notifications.example.json .notifications.json
# Edit with your webhook URLs
```

### 2. Set Environment Variables
For sensitive data:
```bash
export TEST_WEBHOOK_URL="https://your-webhook.com"
export SLACK_WEBHOOK_URL="https://hooks.slack.com/..."
```

### 3. Test Workflow
1. Make changes to code
2. Run test command
3. Get notification with test link
4. Verify functionality
5. Check metrics dashboard

### 4. CI/CD Integration
- Use GitHub Actions workflow for automated testing
- Configure secrets for notification webhooks
- Enable PR comments for team visibility

## Example Workflows

### Feature Development
```bash
# 1. Develop feature
ai-agent feature "Add user profiles" -s medium

# 2. Test the feature
./scripts/test-notify.sh "User Profiles"

# 3. Check notification for test link
# 4. Verify in dashboard
ai-agent dashboard
```

### Bug Fix Testing
```bash
# 1. Fix the bug
ai-agent fix "Login timeout issue" -s critical

# 2. Run tests with notification
ai-agent test "Login Fix" --open

# 3. Browser opens with test results
```

### PR Review
```bash
# 1. Push changes to PR
git push origin feature-branch

# 2. GitHub Action runs automatically
# 3. Check PR for test results comment
# 4. Click test link in comment
```

## Troubleshooting

### No Notifications Received
1. Check `.notifications.json` configuration
2. Verify webhook URLs are correct
3. Check environment variables
4. Look for errors in console output

### Test Server Not Starting
1. Check if port is already in use
2. Verify npm dependencies installed
3. Check build output for errors

### GitHub Action Failing
1. Check workflow logs in Actions tab
2. Verify secrets are configured
3. Ensure tests pass locally first

## Security Considerations

1. **Webhook URLs**: Store in environment variables or GitHub secrets
2. **Test Data**: Don't include sensitive data in test reports
3. **Access Control**: Limit test server to localhost or use auth
4. **Notifications**: Use HTTPS for all webhook endpoints

## Future Enhancements

- Deploy test environments to cloud (Vercel, Netlify)
- Add more notification channels (Discord, Teams)
- Create shareable test links with ngrok
- Add visual regression testing
- Integrate with monitoring tools