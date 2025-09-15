// Playwright global teardown
module.exports = async () => {
  console.log('🧹 Starting Playwright teardown...');

  // Clean up test server if we started it
  if (process.env.TEST_SERVER_PID) {
    try {
      process.kill(process.env.TEST_SERVER_PID);
      console.log('🛑 Test server stopped');
    } catch (error) {
      console.warn('⚠️  Could not stop test server:', error.message);
    }
  }

  // Cleanup any test artifacts
  const fs = require('fs').promises;
  const path = require('path');

  try {
    // Clean up screenshots from failed tests (keep only recent ones)
    const testResultsDir = path.join(__dirname, '../../test-results');
    const stats = await fs.stat(testResultsDir).catch(() => null);

    if (stats) {
      const files = await fs.readdir(testResultsDir);
      const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours

      for (const file of files) {
        const filePath = path.join(testResultsDir, file);
        const fileStats = await fs.stat(filePath);

        if (fileStats.mtime.getTime() < cutoffTime) {
          await fs.unlink(filePath);
        }
      }
    }
  } catch (error) {
    console.warn('⚠️  Could not cleanup test artifacts:', error.message);
  }

  console.log('✅ Playwright teardown completed');
};