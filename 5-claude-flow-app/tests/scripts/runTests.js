#!/usr/bin/env node

/**
 * Advanced Test Runner Script
 * 
 * This script provides advanced test running capabilities with
 * detailed reporting, performance metrics, and CI/CD integration.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor() {
    this.testSuites = {
      unit: {
        name: 'Unit Tests',
        pattern: 'tests/unit/**/*.test.js',
        timeout: 30000,
        parallel: false
      },
      integration: {
        name: 'Integration Tests',
        pattern: 'tests/integration/**/*.test.js',
        timeout: 60000,
        parallel: false,
        runInBand: true
      },
      security: {
        name: 'Security Tests',
        pattern: 'tests/security/**/*.test.js',
        timeout: 45000,
        parallel: false,
        runInBand: true
      },
      performance: {
        name: 'Performance Tests',
        pattern: 'tests/performance/**/*.test.js',
        timeout: 120000,
        parallel: false,
        runInBand: true,
        detectOpenHandles: true
      }
    };

    this.results = {
      startTime: Date.now(),
      suites: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        coverage: {}
      }
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive Test Suite');
    console.log('=====================================\\n');

    for (const [suiteKey, suite] of Object.entries(this.testSuites)) {
      await this.runTestSuite(suiteKey, suite);
    }

    await this.generateReport();
    this.displaySummary();
  }

  async runTestSuite(suiteKey, suite) {
    console.log(`📋 Running ${suite.name}...`);
    
    const startTime = Date.now();
    
    try {
      const result = await this.executeJest(suite);
      const duration = Date.now() - startTime;

      this.results.suites[suiteKey] = {
        name: suite.name,
        status: result.success ? 'PASSED' : 'FAILED',
        duration,
        tests: result.tests || {},
        coverage: result.coverage || {},
        errors: result.errors || []
      };

      if (result.success) {
        console.log(`✅ ${suite.name} completed successfully (${duration}ms)\\n`);
      } else {
        console.log(`❌ ${suite.name} failed (${duration}ms)\\n`);
        if (result.errors.length > 0) {
          console.log('Errors:', result.errors.slice(0, 3));
        }
      }

    } catch (error) {
      console.error(`💥 Error running ${suite.name}:`, error.message);
      this.results.suites[suiteKey] = {
        name: suite.name,
        status: 'ERROR',
        duration: Date.now() - startTime,
        errors: [error.message]
      };
    }
  }

  executeJest(suite) {
    return new Promise((resolve) => {
      const args = [
        '--testMatch', `**/${suite.pattern}`,
        '--json',
        '--coverage'
      ];

      if (suite.runInBand) args.push('--runInBand');
      if (suite.detectOpenHandles) args.push('--detectOpenHandles');
      if (suite.timeout) args.push('--testTimeout', suite.timeout.toString());

      const jest = spawn('npx', ['jest', ...args], {
        stdio: 'pipe',
        env: { ...process.env, NODE_ENV: 'test' }
      });

      let stdout = '';
      let stderr = '';

      jest.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      jest.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      jest.on('close', (code) => {
        let result = {
          success: code === 0,
          tests: {},
          coverage: {},
          errors: []
        };

        try {
          if (stdout.trim()) {
            const jestResult = JSON.parse(stdout);
            result.tests = {
              total: jestResult.numTotalTests || 0,
              passed: jestResult.numPassedTests || 0,
              failed: jestResult.numFailedTests || 0,
              skipped: jestResult.numPendingTests || 0
            };

            if (jestResult.coverageMap) {
              result.coverage = this.extractCoverageMetrics(jestResult.coverageMap);
            }

            if (jestResult.testResults) {
              result.errors = jestResult.testResults
                .filter(test => test.status === 'failed')
                .map(test => test.message || 'Unknown error')
                .slice(0, 5);
            }
          }
        } catch (parseError) {
          result.errors.push(`Failed to parse Jest output: ${parseError.message}`);
        }

        if (stderr && !result.success) {
          result.errors.push(stderr);
        }

        resolve(result);
      });
    });
  }

  extractCoverageMetrics(coverageMap) {
    const summary = {
      lines: { total: 0, covered: 0, pct: 0 },
      functions: { total: 0, covered: 0, pct: 0 },
      branches: { total: 0, covered: 0, pct: 0 },
      statements: { total: 0, covered: 0, pct: 0 }
    };

    Object.values(coverageMap).forEach(file => {
      if (file.s) {
        summary.statements.total += Object.keys(file.s).length;
        summary.statements.covered += Object.values(file.s).filter(Boolean).length;
      }
      if (file.f) {
        summary.functions.total += Object.keys(file.f).length;
        summary.functions.covered += Object.values(file.f).filter(Boolean).length;
      }
      if (file.b) {
        Object.values(file.b).forEach(branch => {
          summary.branches.total += branch.length;
          summary.branches.covered += branch.filter(Boolean).length;
        });
      }
    });

    // Calculate percentages
    ['lines', 'functions', 'branches', 'statements'].forEach(metric => {
      if (summary[metric].total > 0) {
        summary[metric].pct = Math.round(
          (summary[metric].covered / summary[metric].total) * 100
        );
      }
    });

    return summary;
  }

  async generateReport() {
    const duration = Date.now() - this.results.startTime;
    
    // Calculate summary
    Object.values(this.results.suites).forEach(suite => {
      if (suite.tests) {
        this.results.summary.total += suite.tests.total || 0;
        this.results.summary.passed += suite.tests.passed || 0;
        this.results.summary.failed += suite.tests.failed || 0;
        this.results.summary.skipped += suite.tests.skipped || 0;
      }
    });

    // Generate detailed report
    const report = {
      timestamp: new Date().toISOString(),
      duration,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        ci: !!process.env.CI
      },
      summary: this.results.summary,
      suites: this.results.suites,
      recommendations: this.generateRecommendations()
    };

    // Write reports
    await this.writeReport('json', report);
    await this.writeReport('html', report);
    await this.writeReport('junit', report);
  }

  async writeReport(format, data) {
    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `test-report-${timestamp}.${format}`;
    const filepath = path.join(reportsDir, filename);

    try {
      switch (format) {
        case 'json':
          await fs.promises.writeFile(filepath, JSON.stringify(data, null, 2));
          break;
        case 'html':
          await fs.promises.writeFile(filepath, this.generateHtmlReport(data));
          break;
        case 'junit':
          await fs.promises.writeFile(filepath, this.generateJunitReport(data));
          break;
      }
      console.log(`📊 ${format.toUpperCase()} report generated: ${filepath}`);
    } catch (error) {
      console.error(`Error writing ${format} report:`, error.message);
    }
  }

  generateHtmlReport(data) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Test Results Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .suite { margin: 20px 0; border: 1px solid #ddd; border-radius: 5px; }
        .suite-header { background: #e9ecef; padding: 15px; font-weight: bold; }
        .suite-content { padding: 15px; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .error { color: #fd7e14; }
        .metrics { display: flex; gap: 20px; }
        .metric { text-align: center; }
    </style>
</head>
<body>
    <h1>Test Results Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <div class="metrics">
            <div class="metric">
                <h3>${data.summary.total}</h3>
                <p>Total Tests</p>
            </div>
            <div class="metric passed">
                <h3>${data.summary.passed}</h3>
                <p>Passed</p>
            </div>
            <div class="metric failed">
                <h3>${data.summary.failed}</h3>
                <p>Failed</p>
            </div>
            <div class="metric">
                <h3>${data.summary.skipped}</h3>
                <p>Skipped</p>
            </div>
        </div>
        <p><strong>Duration:</strong> ${data.duration}ms</p>
        <p><strong>Generated:</strong> ${data.timestamp}</p>
    </div>
    
    <h2>Test Suites</h2>
    ${Object.entries(data.suites).map(([key, suite]) => `
        <div class="suite">
            <div class="suite-header ${suite.status.toLowerCase()}">
                ${suite.name} - ${suite.status} (${suite.duration}ms)
            </div>
            <div class="suite-content">
                ${suite.tests ? `
                    <p><strong>Tests:</strong> ${suite.tests.passed}/${suite.tests.total} passed</p>
                ` : ''}
                ${suite.errors && suite.errors.length > 0 ? `
                    <div class="error">
                        <strong>Errors:</strong>
                        <ul>${suite.errors.map(error => `<li>${error.substring(0, 200)}...</li>`).join('')}</ul>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('')}
    
    ${data.recommendations.length > 0 ? `
        <h2>Recommendations</h2>
        <ul>
            ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    ` : ''}
</body>
</html>`;
  }

  generateJunitReport(data) {
    const testsuites = Object.entries(data.suites).map(([key, suite]) => {
      return `
    <testsuite name="${suite.name}" tests="${suite.tests?.total || 0}" failures="${suite.tests?.failed || 0}" time="${suite.duration / 1000}">
      ${suite.errors && suite.errors.length > 0 ? suite.errors.map(error => `
        <testcase name="Error" classname="${suite.name}">
          <failure message="Test Failed">${error}</failure>
        </testcase>
      `).join('') : '<testcase name="Suite" classname="Success"/>'}
    </testsuite>`;
    }).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<testsuites tests="${data.summary.total}" failures="${data.summary.failed}" time="${data.duration / 1000}">
${testsuites}
</testsuites>`;
  }

  generateRecommendations() {
    const recommendations = [];
    
    Object.entries(this.results.suites).forEach(([key, suite]) => {
      if (suite.status === 'FAILED') {
        recommendations.push(`Fix failing tests in ${suite.name}`);
      }
      if (suite.duration > 60000) {
        recommendations.push(`Consider optimizing ${suite.name} - took ${suite.duration}ms`);
      }
      if (suite.coverage) {
        Object.entries(suite.coverage).forEach(([metric, data]) => {
          if (data.pct < 80) {
            recommendations.push(`Improve ${metric} coverage in ${suite.name} (${data.pct}%)`);
          }
        });
      }
    });

    if (this.results.summary.failed > 0) {
      recommendations.push('Address all failing tests before deployment');
    }

    return recommendations;
  }

  displaySummary() {
    const duration = Date.now() - this.results.startTime;
    console.log('\\n🏁 Test Suite Summary');
    console.log('====================');
    console.log(`⏱️  Total Duration: ${duration}ms`);
    console.log(`📊 Total Tests: ${this.results.summary.total}`);
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    console.log(`⏭️  Skipped: ${this.results.summary.skipped}`);
    
    const passRate = this.results.summary.total > 0 
      ? Math.round((this.results.summary.passed / this.results.summary.total) * 100)
      : 0;
    console.log(`📈 Pass Rate: ${passRate}%`);

    console.log('\\n📋 Suite Results:');
    Object.entries(this.results.suites).forEach(([key, suite]) => {
      const icon = suite.status === 'PASSED' ? '✅' : suite.status === 'FAILED' ? '❌' : '⚠️';
      console.log(`  ${icon} ${suite.name}: ${suite.status} (${suite.duration}ms)`);
    });

    if (this.results.summary.failed === 0) {
      console.log('\\n🎉 All tests passed! Ready for deployment.');
    } else {
      console.log('\\n🚨 Some tests failed. Please review and fix before deployment.');
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new TestRunner();
  
  // Handle command line arguments
  const args = process.argv.slice(2);
  if (args.length > 0) {
    const suite = args[0];
    if (runner.testSuites[suite]) {
      runner.runTestSuite(suite, runner.testSuites[suite])
        .then(() => runner.displaySummary())
        .catch(console.error);
    } else {
      console.log('Available test suites:', Object.keys(runner.testSuites).join(', '));
    }
  } else {
    runner.runAllTests().catch(console.error);
  }
}

module.exports = TestRunner;