#!/bin/bash

# Test script for Phase 1 AI Agent System
# Tests basic functionality of Research and Implementation agents

echo "🚀 AI Agent System - Phase 1 Test Suite"
echo "======================================"
echo ""

# Set Phase 1
export AI_AGENT_PHASE=1

# Build the project (Phase 1 only)
echo "📦 Building Phase 1 components..."
npm run phase1:build

echo ""
echo "1️⃣ Testing Research Agent"
echo "-------------------------"
node dist/cli/phase1-cli.js research "understand the authentication system" --target src/auth

echo ""
echo "2️⃣ Testing Implementation Agent"
echo "-------------------------------"
node dist/cli/phase1-cli.js implement "create a user validation function" --name validateUser

echo ""
echo "3️⃣ Testing Status Command"
echo "-------------------------"
node dist/cli/phase1-cli.js status

echo ""
echo "4️⃣ Testing Simple Workflow"
echo "--------------------------"
node dist/cli/phase1-cli.js workflow simple --description "add user profile feature"

echo ""
echo "✅ Phase 1 tests completed!"
echo ""
echo "📊 Next steps:"
echo "- Review generated code quality"
echo "- Measure time savings vs manual implementation"
echo "- Collect developer feedback"
echo "- Track token usage metrics"