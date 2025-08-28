#!/usr/bin/env node
/**
 * Validation Test Runner
 * 
 * Executes the complete MLE-STAR validation suite and generates reports
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  timestamp: string;
  testSuite: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  coverage: number;
  executionTime: number;
  memoryUsage: {
    peak: number;
    average: number;
  };
}

class ValidationRunner {
  private results: ValidationResult[] = [];
  private startTime: number = 0;

  constructor() {
    this.startTime = Date.now();
  }

  async runValidationSuite(): Promise<void> {
    console.log('🚀 Starting MLE-STAR Validation Suite');
    console.log('=====================================\n');

    try {
      // Run the test suites
      await this.runTestSuite('mle-star-validation-suite.test.ts', 'Model Ensemble Validation');
      await this.runTestSuite('performance-benchmarks.test.ts', 'Performance Benchmarks');
      
      // Generate final report
      await this.generateFinalReport();
      
      console.log('\n✅ Validation suite completed successfully!');
      
    } catch (error) {
      console.error('\n❌ Validation suite failed:', error);
      process.exit(1);
    }
  }

  private async runTestSuite(testFile: string, suiteName: string): Promise<void> {
    console.log(`\n📋 Running ${suiteName}...`);
    
    const startTime = Date.now();
    const initialMemory = process.memoryUsage();
    
    try {
      // Run jest with specific test file
      const command = `npx jest --config=src/tests/validation/jest.config.js --testPathPattern=${testFile} --verbose --coverage`;
      
      const output = execSync(command, {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const executionTime = Date.now() - startTime;
      const finalMemory = process.memoryUsage();
      
      // Parse test results from output
      const testResults = this.parseTestOutput(output);
      
      const result: ValidationResult = {
        timestamp: new Date().toISOString(),
        testSuite: suiteName,
        totalTests: testResults.total,
        passedTests: testResults.passed,
        failedTests: testResults.failed,
        coverage: testResults.coverage,
        executionTime,
        memoryUsage: {
          peak: Math.max(initialMemory.heapUsed, finalMemory.heapUsed),
          average: (initialMemory.heapUsed + finalMemory.heapUsed) / 2
        }
      };
      
      this.results.push(result);
      
      console.log(`✅ ${suiteName} completed:`);
      console.log(`   Tests: ${testResults.passed}/${testResults.total} passed`);
      console.log(`   Coverage: ${testResults.coverage}%`);
      console.log(`   Time: ${executionTime}ms`);
      
    } catch (error) {
      console.error(`❌ ${suiteName} failed:`, error);
      throw error;
    }
  }

  private parseTestOutput(output: string): { total: number; passed: number; failed: number; coverage: number } {
    // Parse Jest output for test results
    const testMatch = output.match(/Tests:\s+(\d+)\s+passed,\s+(\d+)\s+total/);
    const coverageMatch = output.match(/All files[^|]*\|\s*(\d+(?:\.\d+)?)/);
    
    const passed = testMatch ? parseInt(testMatch[1]) : 0;
    const total = testMatch ? parseInt(testMatch[2]) : 0;
    const failed = total - passed;
    const coverage = coverageMatch ? parseFloat(coverageMatch[1]) : 0;
    
    return { total, passed, failed, coverage };
  }

  private async generateFinalReport(): Promise<void> {
    console.log('\n📊 Generating validation report...');
    
    const totalTests = this.results.reduce((sum, r) => sum + r.totalTests, 0);
    const totalPassed = this.results.reduce((sum, r) => sum + r.passedTests, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.failedTests, 0);
    const avgCoverage = this.results.reduce((sum, r) => sum + r.coverage, 0) / this.results.length;
    const totalTime = Date.now() - this.startTime;
    
    const report = {
      summary: {
        timestamp: new Date().toISOString(),
        totalTests,
        passedTests: totalPassed,
        failedTests: totalFailed,
        successRate: (totalPassed / totalTests) * 100,
        averageCoverage: avgCoverage,
        totalExecutionTime: totalTime,
        status: totalFailed === 0 ? 'PASSED' : 'FAILED'
      },
      testSuites: this.results,
      recommendations: this.generateRecommendations()
    };
    
    // Write detailed JSON report
    const reportPath = path.join(process.cwd(), 'validation-results.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Write summary to console
    console.log('\n🎯 VALIDATION SUMMARY');
    console.log('=====================');
    console.log(`Status: ${report.summary.status}`);
    console.log(`Tests: ${report.summary.passedTests}/${report.summary.totalTests} passed`);
    console.log(`Success Rate: ${report.summary.successRate.toFixed(1)}%`);
    console.log(`Coverage: ${report.summary.averageCoverage.toFixed(1)}%`);
    console.log(`Total Time: ${report.summary.totalExecutionTime}ms`);
    console.log(`\nDetailed report saved to: ${reportPath}`);
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    // Analyze results and generate recommendations
    const failedSuites = this.results.filter(r => r.failedTests > 0);
    if (failedSuites.length > 0) {
      recommendations.push('Address failing tests before production deployment');
    }
    
    const lowCoverage = this.results.filter(r => r.coverage < 80);
    if (lowCoverage.length > 0) {
      recommendations.push('Improve test coverage for critical components');
    }
    
    const slowSuites = this.results.filter(r => r.executionTime > 30000);
    if (slowSuites.length > 0) {
      recommendations.push('Optimize performance of slow test suites');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('System is ready for production deployment');
      recommendations.push('Consider implementing continuous validation pipeline');
      recommendations.push('Set up monitoring and alerting for production environment');
    }
    
    return recommendations;
  }
}

// Run validation if called directly
if (require.main === module) {
  const runner = new ValidationRunner();
  runner.runValidationSuite().catch(console.error);
}

export { ValidationRunner };