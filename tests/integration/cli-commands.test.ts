import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('CLI Commands Integration Tests', () => {
  const cliPath = path.join(__dirname, '../../dist/cli/index.js');
  const metricsPath = path.join(__dirname, '../../.metrics');
  const testMetricsPath = path.join(__dirname, '../../.test-metrics-backup');

  beforeEach(() => {
    // Build the project first
    execSync('npm run build', { cwd: path.join(__dirname, '../..') });
    
    // Backup existing metrics if they exist
    if (fs.existsSync(metricsPath)) {
      fs.cpSync(metricsPath, testMetricsPath, { recursive: true });
      fs.rmSync(metricsPath, { recursive: true });
    }
    fs.mkdirSync(metricsPath, { recursive: true });
  });

  afterEach(() => {
    // Restore metrics
    if (fs.existsSync(metricsPath)) {
      fs.rmSync(metricsPath, { recursive: true });
    }
    if (fs.existsSync(testMetricsPath)) {
      fs.renameSync(testMetricsPath, metricsPath);
    }
  });

  describe('fix command', () => {
    it('should execute bug fix with default severity', () => {
      const output = execSync(
        `node "${cliPath}" fix "Test bug"`,
        { encoding: 'utf8', cwd: path.join(__dirname, '../..') }
      );

      expect(output).toContain('Fixing bug');
      expect(output).toContain('Research Agent');
      expect(output).toContain('completed successfully');
    });

    it('should handle critical severity bugs', () => {
      const output = execSync(
        `node "${cliPath}" fix "Critical security bug" -s critical`,
        { encoding: 'utf8', cwd: path.join(__dirname, '../..') }
      );

      expect(output).toContain('critical');
      expect(output).toContain('Quality Agent');
    });

    it('should generate metrics for bug fixes', () => {
      execSync(
        `node "${cliPath}" fix "Metrics test bug"`,
        { cwd: path.join(__dirname, '../..') }
      );
      
      const metricsFile = path.join(metricsPath, 'metrics.json');
      expect(fs.existsSync(metricsFile)).toBe(true);
      
      const metrics = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics[0].taskType).toBe('bug-fix');
    });
  });

  describe('feature command', () => {
    it('should develop small features', () => {
      const output = execSync(
        `node "${cliPath}" feature "Add login button" -s small`,
        { encoding: 'utf8', cwd: path.join(__dirname, '../..') }
      );

      expect(output).toContain('Developing feature');
      expect(output).toContain('Planning Agent');
      expect(output).toContain('Implementation Agent');
    });

    it('should create plan-only for large features', () => {
      const output = execSync(
        `node "${cliPath}" feature "Refactor authentication system" -s large -p`,
        { encoding: 'utf8', cwd: path.join(__dirname, '../..') }
      );

      expect(output).toContain('Planning Agent');
      expect(output).not.toContain('Implementation Agent');
    });
  });

  describe('review command', () => {
    it('should review code files', () => {
      // Create a test file to review
      const testFile = path.join(__dirname, 'test-review.ts');
      fs.writeFileSync(testFile, `
function testFunction(x: number): number {
  // Potential issue: no input validation
  return x * 2;
}
      `);

      try {
        const output = execSync(
          `node "${cliPath}" review "${testFile}"`,
          { encoding: 'utf8', cwd: path.join(__dirname, '../..') }
        );

        expect(output).toContain('Reviewing code');
        expect(output).toContain('Quality Agent');
      } finally {
        if (fs.existsSync(testFile)) {
          fs.unlinkSync(testFile);
        }
      }
    });

    it('should perform security-focused reviews', () => {
      const testFile = path.join(__dirname, 'test-security.ts');
      fs.writeFileSync(testFile, `
const password = "hardcoded123"; // Security issue
      `);

      try {
        const output = execSync(
          `node "${cliPath}" review "${testFile}" -t security`,
          { encoding: 'utf8', cwd: path.join(__dirname, '../..') }
        );

        expect(output).toContain('security');
      } finally {
        if (fs.existsSync(testFile)) {
          fs.unlinkSync(testFile);
        }
      }
    });
  });

  describe('dashboard command', () => {
    it('should display metrics dashboard', () => {
      // First create some metrics
      execSync(
        `node "${cliPath}" fix "Dashboard test bug"`,
        { cwd: path.join(__dirname, '../..') }
      );
      
      const output = execSync(
        `node "${cliPath}" dashboard`,
        { encoding: 'utf8', cwd: path.join(__dirname, '../..') }
      );

      expect(output).toContain('Performance Dashboard');
      expect(output).toContain('Tasks Completed');
      expect(output).toContain('Time Saved');
    });
  });

  describe('config command', () => {
    it('should list configuration', () => {
      const output = execSync(
        `node "${cliPath}" config -l`,
        { encoding: 'utf8', cwd: path.join(__dirname, '../..') }
      );

      expect(output).toContain('Configuration');
    });
  });

  describe('test command', () => {
    it('should setup test environment', () => {
      const output = execSync(
        `node "${cliPath}" test "CLI integration test" --no-notify --no-interactive`,
        { encoding: 'utf8', cwd: path.join(__dirname, '../..'), timeout: 10000 }
      );

      expect(output).toContain('Test environment ready');
      
      // Check test artifacts
      const testDirPath = path.join(__dirname, '../..', '.tests');
      expect(fs.existsSync(testDirPath)).toBe(true);
      const testDir = fs.readdirSync(testDirPath);
      expect(testDir).toContain('latest-test.md');
    });
  });

  describe('Error handling', () => {
    it('should handle missing arguments gracefully', () => {
      expect(() => {
        execSync(`node "${cliPath}" fix`, { encoding: 'utf8', cwd: path.join(__dirname, '../..') });
      }).toThrow();
    });
  });

  describe('Workflow integration', () => {
    it('should complete end-to-end bug fix workflow', () => {
      const bugDesc = 'Integration test bug';
      
      // Fix bug
      const fixOutput = execSync(
        `node "${cliPath}" fix "${bugDesc}" -s major`,
        { encoding: 'utf8', cwd: path.join(__dirname, '../..') }
      );
      expect(fixOutput).toContain('completed successfully');

      // Check dashboard
      const dashboardOutput = execSync(
        `node "${cliPath}" dashboard`,
        { encoding: 'utf8', cwd: path.join(__dirname, '../..') }
      );
      expect(dashboardOutput).toContain(bugDesc);
      expect(dashboardOutput).toContain('bug-fix');
    });

    it('should track metrics across multiple commands', () => {
      const projectRoot = path.join(__dirname, '../..');
      
      // Run multiple commands
      execSync(`node "${cliPath}" fix "Bug 1"`, { cwd: projectRoot });
      execSync(`node "${cliPath}" feature "Feature 1" -s small`, { cwd: projectRoot });
      execSync(`node "${cliPath}" fix "Bug 2" -s critical`, { cwd: projectRoot });

      const metricsFile = path.join(metricsPath, 'metrics.json');
      const metrics = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));

      expect(metrics.length).toBe(3);
      expect(metrics.filter(m => m.taskType === 'bug-fix').length).toBe(2);
      expect(metrics.filter(m => m.taskType === 'feature').length).toBe(1);
    });
  });
});