module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    'server.js',
    '!src/seeders/**',
    '!src/utils/swagger.js',
    '!**/node_modules/**'
  ],
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 90,
      statements: 90
    }
  },
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  setupFilesAfterEnv: [
    './tests/setup.js'
  ],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 30000,
  maxWorkers: 1 // Run tests sequentially for database consistency
};