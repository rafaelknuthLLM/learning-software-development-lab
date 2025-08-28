/**
 * Test setup for MLE-STAR validation suite
 */

import '@tensorflow/tfjs-node';
import { logger } from '../../utils/logger';

// Global test configuration
beforeAll(async () => {
  // Configure logger for testing
  logger.level = 'error'; // Suppress info/debug logs during tests
  
  // Global timeout for ML operations
  jest.setTimeout(60000);
  
  // Suppress TensorFlow warnings
  console.warn = jest.fn();
});

afterAll(async () => {
  // Global cleanup
  const tf = require('@tensorflow/tfjs-node');
  tf.disposeVariables();
  
  // Restore console
  jest.restoreAllMocks();
});