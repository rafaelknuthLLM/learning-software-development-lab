// Global Jest setup
const { execSync } = require('child_process');
const path = require('path');

module.exports = async () => {
  console.log('🚀 Starting global test setup...');

  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.API_KEY = 'test-api-key';

  // Setup test database/storage if needed
  try {
    // Clear any existing test data
    const testDataPath = path.join(__dirname, '../../test-data');
    execSync(`rm -rf ${testDataPath} && mkdir -p ${testDataPath}`, { stdio: 'ignore' });

    console.log('✅ Test environment prepared');
  } catch (error) {
    console.warn('⚠️  Could not prepare test environment:', error.message);
  }

  // Global performance baseline
  global.__TEST_START_TIME = Date.now();
  global.__PERFORMANCE_BASELINE = {
    apiResponseTime: 1000,
    pageLoadTime: 3000,
    interactionTime: 100
  };

  console.log('✅ Global setup completed');
};