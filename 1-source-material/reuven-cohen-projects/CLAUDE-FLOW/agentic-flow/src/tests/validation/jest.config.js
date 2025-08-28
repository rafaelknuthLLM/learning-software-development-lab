/**
 * Jest Configuration for MLE-STAR Validation Suite
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/tests/validation/setup.ts'],
  testMatch: [
    '<rootDir>/src/tests/validation/**/*.test.ts'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.d.ts',
    '!src/tests/**/*'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage/validation',
  testTimeout: 30000,
  maxWorkers: 1, // Sequential execution for resource-intensive ML tests
  setupFiles: ['<rootDir>/src/tests/validation/env.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  testResultsProcessor: 'jest-html-reporters',
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './test-reports/validation',
      filename: 'validation-report.html',
      expand: true,
      hideIcon: false,
      pageTitle: 'MLE-STAR Validation Report'
    }]
  ]
};