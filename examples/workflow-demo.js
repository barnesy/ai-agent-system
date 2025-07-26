#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const workflows_1 = require("../src/workflows");
async function demonstrateWorkflows() {
    console.log('🤖 AI Agent System - Workflow Demonstration\n');
    console.log('='.repeat(50));
    // 1. Bug Fix Workflow
    console.log('\n📌 DEMO 1: Bug Fix Workflow');
    console.log('-'.repeat(50));
    const bugWorkflow = new workflows_1.BugFixWorkflow();
    const bug = {
        id: 'BUG-2024-001',
        title: 'Data export fails for large datasets',
        description: 'CSV export times out when exporting more than 10,000 records',
        stepsToReproduce: [
            'Navigate to Reports page',
            'Select date range with >10k records',
            'Click Export to CSV',
            'Wait for timeout error'
        ],
        expectedBehavior: 'Export completes successfully regardless of dataset size',
        actualBehavior: 'Request times out after 30 seconds',
        severity: 'major'
    };
    const bugResult = await bugWorkflow.executeBugFix(bug);
    console.log('\nBug Fix Summary:');
    console.log(`- Status: ${bugResult.status}`);
    console.log(`- Quality Check: ${bugResult.summary.qualityCheckPassed ? '✅ Passed' : '❌ Failed'}`);
    console.log(`- Documentation: ${bugResult.summary.documentationUpdated ? '✅ Updated' : '❌ Pending'}`);
    // 2. Feature Development Workflow
    console.log('\n\n📌 DEMO 2: Feature Development Workflow');
    console.log('-'.repeat(50));
    const featureWorkflow = new workflows_1.FeatureDevelopmentWorkflow();
    const feature = {
        id: 'FEAT-2024-042',
        title: 'Dark Mode Support',
        description: 'Add system-wide dark mode with user preference persistence',
        requirements: [
            'Detect system dark mode preference',
            'Allow manual toggle override',
            'Persist user preference',
            'Update all UI components',
            'Ensure accessibility compliance'
        ],
        acceptanceCriteria: [
            'Dark mode toggles all UI elements',
            'User preference persists across sessions',
            'System preference detected on first load',
            'All text remains readable (WCAG AA)',
            'Images and icons adapt appropriately'
        ],
        priority: 'medium'
    };
    const featureResult = await featureWorkflow.developFeature(feature);
    console.log('\nFeature Development Summary:');
    console.log(`- Estimated Time: ${featureResult.summary.estimatedTime} minutes`);
    console.log(`- Files Created: ${featureResult.summary.filesCreated}`);
    console.log(`- Tests Created: ${featureResult.summary.testsCreated}`);
    console.log(`- Quality Score: ${featureResult.summary.qualityScore}/100`);
    // 3. Code Review Workflow
    console.log('\n\n📌 DEMO 3: Code Review Workflow');
    console.log('-'.repeat(50));
    const reviewWorkflow = new workflows_1.CodeReviewWorkflow();
    const pr = {
        id: 'PR-2024-156',
        title: 'Optimize database queries for dashboard',
        description: 'Reduces N+1 queries and adds proper indexing for performance improvement',
        files: [
            'src/models/user.model.ts',
            'src/controllers/dashboard.controller.ts',
            'src/utils/query-builder.ts',
            'migrations/20240126-add-indexes.sql'
        ],
        author: 'john.doe',
        changes: {
            additions: 342,
            deletions: 178
        }
    };
    const reviewResult = await reviewWorkflow.reviewPullRequest(pr);
    console.log('\nCode Review Summary:');
    console.log(`- Review Status: ${reviewResult.reviewStatus.toUpperCase()}`);
    console.log(`- Overall Score: ${reviewResult.summary.overallScore}/100`);
    console.log(`- Issues Found: ${reviewResult.summary.issuesFound} (${reviewResult.summary.criticalIssues} critical)`);
    console.log(`- Automated Checks: ${reviewResult.automatedChecksPassed ? '✅ Passed' : '❌ Failed'}`);
    if (reviewResult.recommendations.length > 0) {
        console.log('\nRecommendations:');
        reviewResult.recommendations.forEach((rec, index) => {
            console.log(`  ${index + 1}. ${rec}`);
        });
    }
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Workflow demonstration completed!');
    console.log('\nThese workflows showcase how specialized AI agents can:');
    console.log('- 🔍 Research and understand codebases');
    console.log('- 📋 Plan complex implementations');
    console.log('- 💻 Generate code and tests');
    console.log('- ✅ Ensure quality and security');
    console.log('- 📚 Create comprehensive documentation');
    console.log('\nAll working together to achieve 10x productivity! 🚀');
}
// Run the demonstration
if (require.main === module) {
    demonstrateWorkflows()
        .then(() => process.exit(0))
        .catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=workflow-demo.js.map