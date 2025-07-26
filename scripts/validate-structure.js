#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class StructureValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
    }
    validate() {
        console.log('🔍 Validating AI Agent System structure...\n');
        // Check required files exist
        this.checkRequiredFiles();
        // Validate agent structure
        this.validateAgents();
        // Validate workflows
        this.validateWorkflows();
        // Check documentation consistency
        this.validateDocumentation();
        return {
            valid: this.errors.length === 0,
            errors: this.errors,
            warnings: this.warnings
        };
    }
    checkRequiredFiles() {
        const requiredFiles = [
            'CLAUDE.md',
            'README.md',
            'docs/agent-architecture.md',
            'docs/MASTER_PLAN.md',
            'workspace/current-tasks.md',
            'workspace/session-insights.md',
            'workspace/design-decisions.md',
            'src/agents/base-agent.ts',
            'src/orchestrator/orchestrator.ts'
        ];
        requiredFiles.forEach(file => {
            const filePath = path.join(process.cwd(), file);
            if (!fs.existsSync(filePath)) {
                this.errors.push(`Required file missing: ${file}`);
            }
        });
    }
    validateAgents() {
        const agentDir = path.join(process.cwd(), 'src/agents');
        const requiredAgents = [
            'research-agent',
            'planning-agent',
            'implementation-agent',
            'quality-agent',
            'testing-agent',
            'documentation-agent'
        ];
        requiredAgents.forEach(agent => {
            const agentFile = path.join(agentDir, `${agent}.ts`);
            if (!fs.existsSync(agentFile)) {
                this.errors.push(`Missing agent implementation: ${agent}`);
            }
            else {
                // Check if agent extends BaseAgent
                const content = fs.readFileSync(agentFile, 'utf-8');
                if (!content.includes('extends BaseAgent')) {
                    this.errors.push(`${agent} must extend BaseAgent`);
                }
                if (!content.includes('capabilities:')) {
                    this.warnings.push(`${agent} should define capabilities`);
                }
            }
        });
    }
    validateWorkflows() {
        const workflowDir = path.join(process.cwd(), 'src/workflows');
        const requiredWorkflows = [
            'bug-fix-workflow',
            'feature-development-workflow',
            'code-review-workflow'
        ];
        requiredWorkflows.forEach(workflow => {
            const workflowFile = path.join(workflowDir, `${workflow}.ts`);
            if (!fs.existsSync(workflowFile)) {
                this.warnings.push(`Missing workflow example: ${workflow}`);
            }
        });
    }
    validateDocumentation() {
        // Check CLAUDE.md has required sections
        const claudePath = path.join(process.cwd(), 'CLAUDE.md');
        if (fs.existsSync(claudePath)) {
            const content = fs.readFileSync(claudePath, 'utf-8');
            const requiredSections = [
                '## Project Overview',
                '## Agent Types',
                '## Development Commands',
                '## Current Focus'
            ];
            requiredSections.forEach(section => {
                if (!content.includes(section)) {
                    this.warnings.push(`CLAUDE.md missing section: ${section}`);
                }
            });
        }
        // Check session insights is up to date
        const tasksPath = path.join(process.cwd(), 'workspace/current-tasks.md');
        if (fs.existsSync(tasksPath)) {
            const content = fs.readFileSync(tasksPath, 'utf-8');
            const lastModified = fs.statSync(tasksPath).mtime;
            const daysSinceUpdate = (Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceUpdate > 7) {
                this.warnings.push('current-tasks.md not updated in over a week');
            }
        }
    }
}
// Run validation
const validator = new StructureValidator();
const result = validator.validate();
// Report results
if (result.errors.length > 0) {
    console.log('❌ Structure validation failed!\n');
    console.log('Errors:');
    result.errors.forEach(error => console.log(`  - ${error}`));
}
if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    result.warnings.forEach(warning => console.log(`  - ${warning}`));
}
if (result.valid) {
    console.log('\n✅ Structure validation passed!');
}
else {
    console.log('\n🔧 Please fix errors before proceeding.');
    process.exit(1);
}
if (result.warnings.length === 0 && result.errors.length === 0) {
    console.log('🎉 Perfect structure maintained!');
}
//# sourceMappingURL=validate-structure.js.map