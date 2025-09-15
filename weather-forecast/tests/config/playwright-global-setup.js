// Playwright global setup
const { chromium } = require('@playwright/test');

module.exports = async () => {
  console.log('🎭 Setting up Playwright test environment...');

  // Start test server if not running
  const { spawn } = require('child_process');

  try {
    // Check if server is already running
    const response = await fetch('http://localhost:8080').catch(() => null);

    if (!response) {
      console.log('🚀 Starting test server...');

      // Start development server
      const server = spawn('npm', ['run', 'serve'], {
        detached: true,
        stdio: 'ignore'
      });

      // Wait for server to start
      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts) {
        try {
          await fetch('http://localhost:8080');
          console.log('✅ Test server is ready');
          break;
        } catch (error) {
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (attempts >= maxAttempts) {
        throw new Error('Test server failed to start within 30 seconds');
      }

      // Store server process for cleanup
      process.env.TEST_SERVER_PID = server.pid;
    } else {
      console.log('✅ Test server already running');
    }

    // Pre-warm browsers
    console.log('🔥 Pre-warming browsers...');
    const browser = await chromium.launch();
    await browser.close();

    // Setup global test data
    global.testConfig = {
      baseURL: 'http://localhost:8080',
      timeout: 30000,
      retries: 2
    };

    console.log('✅ Playwright setup completed');

  } catch (error) {
    console.error('❌ Playwright setup failed:', error.message);
    throw error;
  }
};