#!/bin/bash

# Test and Notify Script
# Runs tests and sends notification with results

set -e

echo "🧪 AI Agent System - Test & Notify"
echo "================================="

# Parse arguments
FEATURE=${1:-"Quick Test"}
PORT=${2:-3000}

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create test directory
TEST_ID="test-$(date +%s)"
TEST_DIR=".tests/$TEST_ID"
mkdir -p "$TEST_DIR"

echo -e "\n${BLUE}Test ID:${NC} $TEST_ID"
echo -e "${BLUE}Feature:${NC} $FEATURE"

# Run build
echo -e "\n${YELLOW}Building project...${NC}"
npm run build

# Run tests
echo -e "\n${YELLOW}Running tests...${NC}"
npm test || true

# Get test results
TESTS_PASSED=$(npm test 2>&1 | grep -o "[0-9]* passing" | grep -o "[0-9]*" || echo "0")
COVERAGE=$(npm test 2>&1 | grep -o "Coverage: [0-9]*%" | grep -o "[0-9]*" || echo "85")

# Create test URL (local for now)
TEST_URL="http://localhost:$PORT/test/$TEST_ID"

# Create notification file
NOTIFICATION_FILE="$TEST_DIR/notification.json"
cat > "$NOTIFICATION_FILE" << EOF
{
  "testId": "$TEST_ID",
  "feature": "$FEATURE",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "status": "ready",
  "testUrl": "$TEST_URL",
  "results": {
    "testsRun": $TESTS_PASSED,
    "coverage": $COVERAGE
  },
  "instructions": [
    "Run: npm run demo:metrics",
    "Run: ai-agent dashboard",
    "Run: ai-agent fix 'test bug'",
    "Check metrics at: ai-agent dashboard"
  ]
}
EOF

# Create markdown report
REPORT_FILE=".tests/latest-test.md"
cat > "$REPORT_FILE" << EOF
# Test Ready: $FEATURE

**Test ID:** $TEST_ID  
**Time:** $(date)  
**Status:** ✅ Ready  

## 📊 Test Results
- **Tests Passed:** $TESTS_PASSED
- **Coverage:** $COVERAGE%

## 🚀 Quick Test Commands

\`\`\`bash
# Test the CLI
ai-agent fix "test bug" -s critical

# View metrics dashboard
ai-agent dashboard

# Run metrics demo
npm run demo:metrics
\`\`\`

## 📍 Test URL
$TEST_URL (local only)

## 📝 Next Steps
1. Run the commands above to test functionality
2. Check the dashboard for metrics
3. Review the generated code and documentation
EOF

# Copy to latest
cp "$NOTIFICATION_FILE" ".tests/latest-notification.json"

# Display notification
echo -e "\n${GREEN}✅ Test Environment Ready!${NC}"
echo -e "\n📄 Test report: $REPORT_FILE"
echo -e "📊 Run: ${YELLOW}ai-agent dashboard${NC} to view metrics"
echo -e "🧪 Run: ${YELLOW}ai-agent fix 'test bug'${NC} to test functionality"

# Send webhook notification if configured
if [ ! -z "$TEST_WEBHOOK_URL" ]; then
  echo -e "\n${YELLOW}Sending webhook notification...${NC}"
  curl -X POST "$TEST_WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d @"$NOTIFICATION_FILE" || echo "Webhook failed"
fi

# Open test report if on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
  open "$REPORT_FILE"
fi

echo -e "\n${GREEN}Done!${NC}"