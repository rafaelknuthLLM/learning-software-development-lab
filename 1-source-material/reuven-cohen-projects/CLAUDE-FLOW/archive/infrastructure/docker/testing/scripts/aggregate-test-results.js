#!/usr/bin/env node

/**
 * Test result aggregator for Docker testing environment
 * Combines test results from multiple test suites into comprehensive reports
 */

const fs = require('fs');
const path = require('path');

const TEST_RESULTS_DIR = '/app/tests/results';
const OUTPUT_DIR = '/app/tests/results/aggregated';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

class TestResultAggregator {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            summary: {
                total_suites: 0,
                passed_suites: 0,
                failed_suites: 0,
                total_tests: 0,
                passed_tests: 0,
                failed_tests: 0,
                skipped_tests: 0,
                success_rate: 0,
                duration: 0
            },
            suites: {},
            coverage: {},
            performance: {},
            errors: []
        };
    }

    log(message) {
        console.log(`[${new Date().toISOString()}] ${message}`);
    }

    // Aggregate Jest test results
    aggregateJestResults() {
        const jestResultsPath = path.join(TEST_RESULTS_DIR, 'junit.xml');
        const jestJsonPath = path.join(TEST_RESULTS_DIR, 'jest-results.json');
        
        if (fs.existsSync(jestJsonPath)) {
            try {
                const jestResults = JSON.parse(fs.readFileSync(jestJsonPath, 'utf8'));
                
                this.results.suites.jest = {
                    type: 'jest',
                    numTotalTests: jestResults.numTotalTests || 0,
                    numPassedTests: jestResults.numPassedTests || 0,
                    numFailedTests: jestResults.numFailedTests || 0,
                    numPendingTests: jestResults.numPendingTests || 0,
                    testResults: jestResults.testResults || []
                };
                
                this.results.summary.total_tests += jestResults.numTotalTests || 0;
                this.results.summary.passed_tests += jestResults.numPassedTests || 0;
                this.results.summary.failed_tests += jestResults.numFailedTests || 0;
                this.results.summary.skipped_tests += jestResults.numPendingTests || 0;
                
                this.log(`✅ Aggregated Jest results: ${jestResults.numTotalTests} tests`);
            } catch (error) {
                this.log(`❌ Error aggregating Jest results: ${error.message}`);
                this.results.errors.push({
                    type: 'jest_aggregation',
                    message: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }
    }

    // Aggregate coverage results
    aggregateCoverageResults() {
        const coverageDir = path.join(TEST_RESULTS_DIR, '../coverage');
        const coverageJsonPath = path.join(coverageDir, 'coverage-final.json');
        
        if (fs.existsSync(coverageJsonPath)) {
            try {
                const coverageData = JSON.parse(fs.readFileSync(coverageJsonPath, 'utf8'));
                
                // Calculate overall coverage metrics
                let totalStatements = 0;
                let coveredStatements = 0;
                let totalFunctions = 0;
                let coveredFunctions = 0;
                let totalBranches = 0;
                let coveredBranches = 0;
                let totalLines = 0;
                let coveredLines = 0;
                
                Object.values(coverageData).forEach(fileCoverage => {
                    if (fileCoverage.s) {
                        totalStatements += Object.keys(fileCoverage.s).length;
                        coveredStatements += Object.values(fileCoverage.s).filter(count => count > 0).length;
                    }
                    if (fileCoverage.f) {
                        totalFunctions += Object.keys(fileCoverage.f).length;
                        coveredFunctions += Object.values(fileCoverage.f).filter(count => count > 0).length;
                    }
                    if (fileCoverage.b) {
                        totalBranches += Object.keys(fileCoverage.b).length;
                        coveredBranches += Object.values(fileCoverage.b).filter(branches => 
                            branches.some(count => count > 0)
                        ).length;
                    }
                    if (fileCoverage.l) {
                        totalLines += Object.keys(fileCoverage.l).length;
                        coveredLines += Object.values(fileCoverage.l).filter(count => count > 0).length;
                    }
                });
                
                this.results.coverage = {
                    statements: {
                        total: totalStatements,
                        covered: coveredStatements,
                        percentage: totalStatements > 0 ? (coveredStatements / totalStatements * 100).toFixed(2) : 0
                    },
                    functions: {
                        total: totalFunctions,
                        covered: coveredFunctions,
                        percentage: totalFunctions > 0 ? (coveredFunctions / totalFunctions * 100).toFixed(2) : 0
                    },
                    branches: {
                        total: totalBranches,
                        covered: coveredBranches,
                        percentage: totalBranches > 0 ? (coveredBranches / totalBranches * 100).toFixed(2) : 0
                    },
                    lines: {
                        total: totalLines,
                        covered: coveredLines,
                        percentage: totalLines > 0 ? (coveredLines / totalLines * 100).toFixed(2) : 0
                    }
                };
                
                this.log(`✅ Aggregated coverage results: ${this.results.coverage.statements.percentage}% statements`);
            } catch (error) {
                this.log(`❌ Error aggregating coverage results: ${error.message}`);
                this.results.errors.push({
                    type: 'coverage_aggregation',
                    message: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }
    }

    // Aggregate performance test results
    aggregatePerformanceResults() {
        const performanceFiles = [
            'performance-tests.log',
            'performance-results.json',
            'benchmark-results.json'
        ];
        
        performanceFiles.forEach(filename => {
            const filePath = path.join(TEST_RESULTS_DIR, filename);
            if (fs.existsSync(filePath)) {
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    
                    if (filename.endsWith('.json')) {
                        const data = JSON.parse(content);
                        this.results.performance[filename.replace('.json', '')] = data;
                    } else {
                        this.results.performance[filename.replace('.log', '')] = {
                            type: 'log',
                            content: content.split('\n').slice(-100) // Last 100 lines
                        };
                    }
                    
                    this.log(`✅ Aggregated performance results from ${filename}`);
                } catch (error) {
                    this.log(`❌ Error aggregating performance results from ${filename}: ${error.message}`);
                    this.results.errors.push({
                        type: 'performance_aggregation',
                        file: filename,
                        message: error.message,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        });
    }

    // Aggregate individual test suite results
    aggregateTestSuiteResults() {
        const suiteFiles = [
            'unit-tests.log',
            'integration-tests.log',
            'e2e-tests.log',
            'swarm-tests.log'
        ];
        
        suiteFiles.forEach(filename => {
            const filePath = path.join(TEST_RESULTS_DIR, filename);
            if (fs.existsSync(filePath)) {
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    const suiteName = filename.replace('-tests.log', '');
                    
                    // Parse test results from logs
                    const passed = (content.match(/✅|PASS/g) || []).length;
                    const failed = (content.match(/❌|FAIL/g) || []).length;
                    const skipped = (content.match(/⏭️|SKIP/g) || []).length;
                    
                    this.results.suites[suiteName] = {
                        type: 'log_based',
                        passed,
                        failed,
                        skipped,
                        total: passed + failed + skipped,
                        log_summary: content.split('\n').slice(-50) // Last 50 lines
                    };
                    
                    this.results.summary.total_suites++;
                    if (failed === 0) {
                        this.results.summary.passed_suites++;
                    } else {
                        this.results.summary.failed_suites++;
                    }
                    
                    this.log(`✅ Aggregated ${suiteName} results: ${passed} passed, ${failed} failed`);
                } catch (error) {
                    this.log(`❌ Error aggregating ${filename}: ${error.message}`);
                    this.results.errors.push({
                        type: 'suite_aggregation',
                        file: filename,
                        message: error.message,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        });
    }

    // Calculate final metrics
    calculateMetrics() {
        // Calculate success rate
        if (this.results.summary.total_tests > 0) {
            this.results.summary.success_rate = (
                (this.results.summary.passed_tests / this.results.summary.total_tests) * 100
            ).toFixed(2);
        }
        
        // Add environment information
        this.results.environment = {
            node_version: process.version,
            platform: process.platform,
            arch: process.arch,
            docker: true,
            timestamp: new Date().toISOString()
        };
        
        this.log(`📊 Final metrics: ${this.results.summary.success_rate}% success rate`);
    }

    // Generate comprehensive report
    generateReport() {
        const reportPath = path.join(OUTPUT_DIR, `test-report-${TIMESTAMP}.json`);
        
        try {
            fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
            this.log(`📝 Generated comprehensive report: ${reportPath}`);
        } catch (error) {
            this.log(`❌ Error generating report: ${error.message}`);
        }
    }

    // Generate HTML report
    generateHtmlReport() {
        const htmlPath = path.join(OUTPUT_DIR, `test-report-${TIMESTAMP}.html`);
        
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Results - ${this.results.timestamp}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .success { color: #28a745; }
        .failed { color: #dc3545; }
        .warning { color: #ffc107; }
        .suite { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .metrics { display: flex; gap: 20px; margin: 20px 0; }
        .metric { padding: 10px; background: #f8f9fa; border-radius: 5px; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Test Results Summary</h1>
        <p><strong>Generated:</strong> ${this.results.timestamp}</p>
        <p><strong>Environment:</strong> Docker (${this.results.environment?.node_version})</p>
    </div>
    
    <div class="metrics">
        <div class="metric">
            <h3>Overall Success Rate</h3>
            <p class="${this.results.summary.success_rate >= 80 ? 'success' : 'failed'}">${this.results.summary.success_rate}%</p>
        </div>
        <div class="metric">
            <h3>Total Tests</h3>
            <p>${this.results.summary.total_tests}</p>
        </div>
        <div class="metric">
            <h3>Test Suites</h3>
            <p>${this.results.summary.total_suites}</p>
        </div>
        <div class="metric">
            <h3>Coverage</h3>
            <p>${this.results.coverage.statements?.percentage || 'N/A'}%</p>
        </div>
    </div>
    
    <h2>Test Suites</h2>
    ${Object.entries(this.results.suites).map(([name, suite]) => `
        <div class="suite">
            <h3>${name}</h3>
            <p><span class="success">✅ ${suite.passed || 0} passed</span> | 
               <span class="failed">❌ ${suite.failed || 0} failed</span> | 
               <span class="warning">⏭️ ${suite.skipped || 0} skipped</span></p>
        </div>
    `).join('')}
    
    ${this.results.errors.length > 0 ? `
        <h2>Errors</h2>
        <div class="suite">
            <pre>${JSON.stringify(this.results.errors, null, 2)}</pre>
        </div>
    ` : ''}
    
    <h2>Raw Results</h2>
    <div class="suite">
        <pre>${JSON.stringify(this.results, null, 2)}</pre>
    </div>
</body>
</html>`;
        
        try {
            fs.writeFileSync(htmlPath, html);
            this.log(`📝 Generated HTML report: ${htmlPath}`);
        } catch (error) {
            this.log(`❌ Error generating HTML report: ${error.message}`);
        }
    }

    // Run complete aggregation
    async aggregate() {
        this.log('🚀 Starting test result aggregation...');
        
        this.aggregateJestResults();
        this.aggregateCoverageResults();
        this.aggregatePerformanceResults();
        this.aggregateTestSuiteResults();
        this.calculateMetrics();
        this.generateReport();
        this.generateHtmlReport();
        
        this.log('✅ Test result aggregation completed');
        
        // Exit with appropriate code
        process.exit(this.results.summary.failed_suites > 0 ? 1 : 0);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down test aggregator...');
    process.exit(0);
});

// Start aggregation
const aggregator = new TestResultAggregator();
aggregator.aggregate().catch(error => {
    console.error('❌ Fatal error in test aggregator:', error);
    process.exit(1);
});