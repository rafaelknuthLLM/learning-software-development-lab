/**
 * Environment setup for validation tests
 */

// Set TensorFlow.js backend to CPU for consistent testing
process.env.TF_CPP_MIN_LOG_LEVEL = '3'; // Suppress TensorFlow warnings
process.env.CUDA_VISIBLE_DEVICES = ''; // Force CPU-only execution

// Jest global configuration
global.console = {
  ...console,
  // Suppress verbose logging during tests
  debug: jest.fn(),
  info: process.env.NODE_ENV === 'test' ? jest.fn() : console.info,
  warn: console.warn,
  error: console.error,
};