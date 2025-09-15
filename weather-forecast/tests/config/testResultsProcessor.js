// Custom Jest test results processor
const fs = require('fs');
const path = require('path');

module.exports = (results) => {
  // Generate custom test report
  const summary = {
    timestamp: new Date().toISOString(),
    success: results.success,
    numTotalTestSuites: results.numTotalTestSuites,
    numPassedTestSuites: results.numPassedTestSuites,
    numFailedTestSuites: results.numFailedTestSuites,
    numTotalTests: results.numTotalTests,
    numPassedTests: results.numPassedTests,
    numFailedTests: results.numFailedTests,
    startTime: results.startTime,
    endTime: Date.now(),
    testDuration: Date.now() - results.startTime,
    coverageMap: results.coverageMap ? {
      total: Object.keys(results.coverageMap).length
    } : null
  };

  // Categorize test results by type
  const testsByType = {
    unit: [],
    integration: [],
    e2e: [],
    performance: [],
    crossBrowser: []
  };

  results.testResults.forEach(testResult => {
    const testPath = testResult.testFilePath;
    let testType = 'unit';

    if (testPath.includes('/integration/')) testType = 'integration';
    else if (testPath.includes('/e2e/')) testType = 'e2e';
    else if (testPath.includes('/performance/')) testType = 'performance';
    else if (testPath.includes('/cross-browser/')) testType = 'crossBrowser';

    testsByType[testType].push({
      filePath: testResult.testFilePath,
      numFailingTests: testResult.numFailingTests,
      numPassingTests: testResult.numPassingTests,
      perfStats: testResult.perfStats,
      testDuration: testResult.perfStats ? testResult.perfStats.runtime : 0
    });
  });

  // Performance analysis
  const performanceMetrics = {
    slowestTests: results.testResults
      .map(test => ({
        file: path.basename(test.testFilePath),
        duration: test.perfStats ? test.perfStats.runtime : 0
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10),

    averageTestDuration: results.testResults.length > 0 ?
      results.testResults.reduce((sum, test) => sum + (test.perfStats ? test.perfStats.runtime : 0), 0) / results.testResults.length : 0
  };

  // Failure analysis
  const failureAnalysis = {
    failedTests: [],
    commonFailureTypes: {},
    mostFailedFiles: []
  };

  results.testResults.forEach(testResult => {
    testResult.testResults.forEach(test => {
      if (test.status === 'failed') {
        failureAnalysis.failedTests.push({
          title: test.title,
          file: path.basename(testResult.testFilePath),
          message: test.failureMessages ? test.failureMessages[0] : 'Unknown error'
        });

        // Extract failure type
        if (test.failureMessages && test.failureMessages[0]) {
          const message = test.failureMessages[0];
          let failureType = 'Unknown';

          if (message.includes('timeout') || message.includes('Timeout')) failureType = 'Timeout';
          else if (message.includes('expect')) failureType = 'Assertion';
          else if (message.includes('TypeError')) failureType = 'Type Error';
          else if (message.includes('ReferenceError')) failureType = 'Reference Error';
          else if (message.includes('Network')) failureType = 'Network Error';

          failureAnalysis.commonFailureTypes[failureType] = (failureAnalysis.commonFailureTypes[failureType] || 0) + 1;
        }
      }
    });
  });

  // Generate detailed report
  const detailedReport = {
    summary,
    testsByType,
    performanceMetrics,
    failureAnalysis,
    recommendations: generateRecommendations(summary, performanceMetrics, failureAnalysis)
  };

  // Save report to file
  const reportsDir = path.join(__dirname, '../../coverage');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath = path.join(reportsDir, 'detailed-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));

  // Console output
  console.log('\n📊 Test Results Summary:');
  console.log(`   Total Tests: ${summary.numTotalTests}`);
  console.log(`   Passed: ${summary.numPassedTests} ✅`);
  console.log(`   Failed: ${summary.numFailedTests} ${summary.numFailedTests > 0 ? '❌' : ''}`);
  console.log(`   Duration: ${summary.testDuration}ms`);
  console.log(`   Average Test Duration: ${performanceMetrics.averageTestDuration.toFixed(2)}ms`);

  if (performanceMetrics.slowestTests.length > 0) {
    console.log('\n🐌 Slowest Tests:');
    performanceMetrics.slowestTests.slice(0, 3).forEach((test, index) => {
      console.log(`   ${index + 1}. ${test.file}: ${test.duration.toFixed(2)}ms`);
    });
  }

  if (Object.keys(failureAnalysis.commonFailureTypes).length > 0) {
    console.log('\n❌ Common Failure Types:');
    Object.entries(failureAnalysis.commonFailureTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
  }

  console.log(`\n📁 Detailed report saved to: ${reportPath}`);

  return results;
};

function generateRecommendations(summary, performanceMetrics, failureAnalysis) {
  const recommendations = [];

  // Performance recommendations
  if (performanceMetrics.averageTestDuration > 1000) {
    recommendations.push({
      type: 'performance',
      priority: 'medium',
      message: 'Average test duration is high. Consider optimizing slow tests or reducing test complexity.'
    });
  }

  if (performanceMetrics.slowestTests[0] && performanceMetrics.slowestTests[0].duration > 5000) {
    recommendations.push({
      type: 'performance',
      priority: 'high',
      message: `Slowest test (${performanceMetrics.slowestTests[0].file}) takes over 5 seconds. Consider breaking it down or optimizing.`
    });
  }

  // Reliability recommendations
  if (summary.numFailedTests > summary.numTotalTests * 0.1) {
    recommendations.push({
      type: 'reliability',
      priority: 'high',
      message: 'Test failure rate is above 10%. Review and fix failing tests to improve reliability.'
    });
  }

  // Common failure pattern recommendations
  const timeoutFailures = failureAnalysis.commonFailureTypes['Timeout'] || 0;
  if (timeoutFailures > 0) {
    recommendations.push({
      type: 'reliability',
      priority: 'medium',
      message: `${timeoutFailures} test(s) failed due to timeouts. Consider increasing timeout values or optimizing async operations.`
    });
  }

  const assertionFailures = failureAnalysis.commonFailureTypes['Assertion'] || 0;
  if (assertionFailures > summary.numTotalTests * 0.05) {
    recommendations.push({
      type: 'quality',
      priority: 'high',
      message: 'High number of assertion failures suggests potential issues with test expectations or application logic.'
    });
  }

  return recommendations;
}