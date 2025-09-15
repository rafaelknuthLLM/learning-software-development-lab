// Global Jest teardown
const fs = require('fs').promises;
const path = require('path');

module.exports = async () => {
  console.log('🧹 Starting global test teardown...');

  // Generate test performance report
  if (global.__TEST_START_TIME) {
    const totalTestTime = Date.now() - global.__TEST_START_TIME;
    const performanceReport = {
      totalTestTime,
      timestamp: new Date().toISOString(),
      baseline: global.__PERFORMANCE_BASELINE
    };

    try {
      const reportPath = path.join(__dirname, '../../coverage/performance-report.json');
      await fs.writeFile(reportPath, JSON.stringify(performanceReport, null, 2));
      console.log(`📊 Performance report saved to: ${reportPath}`);
    } catch (error) {
      console.warn('⚠️  Could not save performance report:', error.message);
    }
  }

  // Cleanup test artifacts
  try {
    const testDataPath = path.join(__dirname, '../../test-data');
    await fs.rmdir(testDataPath, { recursive: true }).catch(() => {});
    console.log('🗑️  Test artifacts cleaned up');
  } catch (error) {
    console.warn('⚠️  Could not cleanup test artifacts:', error.message);
  }

  console.log('✅ Global teardown completed');
};