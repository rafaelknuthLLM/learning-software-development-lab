/**
 * Performance Benchmarks Test Suite
 * 
 * Comprehensive performance validation and benchmarking for MLE-STAR models
 * including accuracy metrics, latency measurements, and throughput analysis.
 */

import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';
import * as tf from '@tensorflow/tfjs-node';
import { ModelEnsemble } from '../../neural/optimization/ModelEnsemble';
import { logger } from '../../utils/logger';

interface PerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  latency: number;
  throughput: number;
  memoryUsage: number;
}

interface BenchmarkResult {
  testName: string;
  metrics: PerformanceMetrics;
  passed: boolean;
  details: Record<string, any>;
}

describe('Performance Benchmarks', () => {
  let ensemble: ModelEnsemble;
  let benchmarkResults: BenchmarkResult[] = [];

  beforeAll(async () => {
    await tf.ready();
    ensemble = new ModelEnsemble({
      strategy: 'weighted_average',
      maxModels: 5,
      diversityThreshold: 0.1
    });

    // Create and add high-quality models for benchmarking
    for (let i = 0; i < 3; i++) {
      const model = await createOptimizedModel(`benchmark_model_${i}`);
      await ensemble.addModel(model, `benchmark_model_${i}`, {
        architecture: {
          layers: 6,
          hiddenUnits: 128,
          dropout: 0.2,
          activation: 'relu'
        },
        trainingConfig: {
          optimizer: 'adam',
          learningRate: 0.001,
          batchSize: 32
        }
      });
    }

    logger.info('Performance benchmark suite initialized');
  });

  afterAll(() => {
    if (ensemble) ensemble.dispose();
    tf.disposeVariables();
    
    // Generate performance report
    generatePerformanceReport(benchmarkResults);
  });

  describe('Accuracy Benchmarks', () => {
    it('should achieve target accuracy on classification tasks', async () => {
      const testData = generateClassificationData(1000, 20, 5);
      const predictions: tf.Tensor[] = [];
      const targets: tf.Tensor[] = [];

      // Generate predictions in batches
      const batchSize = 100;
      for (let i = 0; i < testData.inputs.shape[0]; i += batchSize) {
        const batchInput = testData.inputs.slice([i, 0], [Math.min(batchSize, testData.inputs.shape[0] - i), -1]);
        const batchTarget = testData.labels.slice([i, 0], [Math.min(batchSize, testData.labels.shape[0] - i), -1]);
        
        const prediction = await ensemble.predict(batchInput);
        predictions.push(prediction.prediction);
        targets.push(batchTarget);
        
        batchInput.dispose();
      }

      // Calculate accuracy metrics
      const metrics = await calculateClassificationMetrics(predictions, targets);
      
      const benchmarkResult: BenchmarkResult = {
        testName: 'Classification Accuracy',
        metrics: {
          ...metrics,
          latency: 0,
          throughput: 0,
          memoryUsage: tf.memory().numBytes
        },
        passed: metrics.accuracy >= 0.85 && metrics.f1Score >= 0.80,
        details: {
          targetAccuracy: 0.85,
          targetF1Score: 0.80,
          samplesProcessed: testData.inputs.shape[0]
        }
      };

      benchmarkResults.push(benchmarkResult);

      expect(metrics.accuracy).toBeGreaterThanOrEqual(0.75); // Minimum acceptable
      expect(metrics.f1Score).toBeGreaterThanOrEqual(0.70);
      expect(metrics.precision).toBeGreaterThanOrEqual(0.70);
      expect(metrics.recall).toBeGreaterThanOrEqual(0.70);

      // Cleanup
      predictions.forEach(p => p.dispose());
      targets.forEach(t => t.dispose());
      testData.inputs.dispose();
      testData.labels.dispose();
    });

    it('should maintain accuracy across different data distributions', async () => {
      const distributions = ['normal', 'uniform', 'skewed'];
      const accuracyResults = [];

      for (const distribution of distributions) {
        const testData = generateDataWithDistribution(500, 15, 3, distribution);
        
        const batchInput = testData.inputs.slice([0, 0], [100, -1]);
        const batchTarget = testData.labels.slice([0, 0], [100, -1]);
        
        const startTime = Date.now();
        const prediction = await ensemble.predict(batchInput);
        const predictionTime = Date.now() - startTime;

        const accuracy = await calculateAccuracy(prediction.prediction, batchTarget);
        accuracyResults.push({ distribution, accuracy, predictionTime });

        prediction.prediction.dispose();
        batchInput.dispose();
        batchTarget.dispose();
        testData.inputs.dispose();
        testData.labels.dispose();
      }

      const avgAccuracy = accuracyResults.reduce((sum, r) => sum + r.accuracy, 0) / accuracyResults.length;
      const maxVariation = Math.max(...accuracyResults.map(r => r.accuracy)) - Math.min(...accuracyResults.map(r => r.accuracy));

      expect(avgAccuracy).toBeGreaterThanOrEqual(0.70);
      expect(maxVariation).toBeLessThanOrEqual(0.20); // Consistent across distributions

      benchmarkResults.push({
        testName: 'Distribution Robustness',
        metrics: {
          accuracy: avgAccuracy,
          precision: 0,
          recall: 0,
          f1Score: 0,
          auc: 0,
          latency: accuracyResults.reduce((sum, r) => sum + r.predictionTime, 0) / accuracyResults.length,
          throughput: 0,
          memoryUsage: tf.memory().numBytes
        },
        passed: avgAccuracy >= 0.70 && maxVariation <= 0.20,
        details: { accuracyResults, maxVariation }
      });
    });
  });

  describe('Latency Benchmarks', () => {
    it('should meet single prediction latency targets', async () => {
      const testInput = tf.randomNormal([1, 20]);
      const iterations = 100;
      const latencies = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        const prediction = await ensemble.predict(testInput);
        const latency = performance.now() - startTime;
        
        latencies.push(latency);
        prediction.prediction.dispose();
      }

      const avgLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
      const p95Latency = latencies.sort((a, b) => a - b)[Math.floor(0.95 * latencies.length)];
      const p99Latency = latencies.sort((a, b) => a - b)[Math.floor(0.99 * latencies.length)];

      benchmarkResults.push({
        testName: 'Single Prediction Latency',
        metrics: {
          accuracy: 0,
          precision: 0,
          recall: 0,
          f1Score: 0,
          auc: 0,
          latency: avgLatency,
          throughput: 1000 / avgLatency, // predictions per second
          memoryUsage: tf.memory().numBytes
        },
        passed: avgLatency <= 100 && p95Latency <= 200,
        details: { avgLatency, p95Latency, p99Latency, iterations }
      });

      expect(avgLatency).toBeLessThanOrEqual(150); // 150ms average
      expect(p95Latency).toBeLessThanOrEqual(250); // 250ms p95
      
      testInput.dispose();
    });

    it('should handle batch predictions efficiently', async () => {
      const batchSizes = [1, 10, 50, 100, 500];
      const batchResults = [];

      for (const batchSize of batchSizes) {
        const testInput = tf.randomNormal([batchSize, 20]);
        
        const startTime = performance.now();
        const prediction = await ensemble.predict(testInput);
        const totalTime = performance.now() - startTime;
        
        const timePerSample = totalTime / batchSize;
        const samplesPerSecond = 1000 / timePerSample;

        batchResults.push({
          batchSize,
          totalTime,
          timePerSample,
          samplesPerSecond
        });

        prediction.prediction.dispose();
        testInput.dispose();
      }

      // Batch processing should be more efficient than single predictions
      const singleSampleTime = batchResults.find(r => r.batchSize === 1)?.timePerSample || 100;
      const largeBatchTime = batchResults.find(r => r.batchSize === 500)?.timePerSample || 100;
      
      expect(largeBatchTime).toBeLessThan(singleSampleTime * 0.5); // At least 50% improvement

      benchmarkResults.push({
        testName: 'Batch Processing Efficiency',
        metrics: {
          accuracy: 0,
          precision: 0,
          recall: 0,
          f1Score: 0,
          auc: 0,
          latency: largeBatchTime,
          throughput: batchResults.find(r => r.batchSize === 500)?.samplesPerSecond || 0,
          memoryUsage: tf.memory().numBytes
        },
        passed: largeBatchTime < singleSampleTime * 0.5,
        details: { batchResults, efficiencyGain: singleSampleTime / largeBatchTime }
      });
    });
  });

  describe('Throughput Benchmarks', () => {
    it('should achieve target throughput under sustained load', async () => {
      const duration = 10000; // 10 seconds
      const batchSize = 50;
      let totalPredictions = 0;
      const startTime = Date.now();

      while (Date.now() - startTime < duration) {
        const testInput = tf.randomNormal([batchSize, 20]);
        const prediction = await ensemble.predict(testInput);
        
        totalPredictions += batchSize;
        
        prediction.prediction.dispose();
        testInput.dispose();
      }

      const actualDuration = Date.now() - startTime;
      const predictionsPerSecond = (totalPredictions * 1000) / actualDuration;

      benchmarkResults.push({
        testName: 'Sustained Throughput',
        metrics: {
          accuracy: 0,
          precision: 0,
          recall: 0,
          f1Score: 0,
          auc: 0,
          latency: 0,
          throughput: predictionsPerSecond,
          memoryUsage: tf.memory().numBytes
        },
        passed: predictionsPerSecond >= 100, // Target: 100 predictions/second
        details: {
          totalPredictions,
          actualDuration,
          targetThroughput: 100
        }
      });

      expect(predictionsPerSecond).toBeGreaterThanOrEqual(50); // Minimum acceptable
      logger.info(`Achieved throughput: ${predictionsPerSecond.toFixed(2)} predictions/second`);
    });

    it('should maintain throughput with concurrent requests', async () => {
      const concurrentRequests = 20;
      const predictionsPerRequest = 25;
      
      const startTime = Date.now();
      
      const promises = Array.from({ length: concurrentRequests }, async () => {
        const testInput = tf.randomNormal([predictionsPerRequest, 20]);
        const prediction = await ensemble.predict(testInput);
        
        testInput.dispose();
        const result = prediction.prediction;
        prediction.prediction = null; // Prevent disposal in cleanup
        return result;
      });

      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      const totalPredictions = concurrentRequests * predictionsPerRequest;
      const concurrentThroughput = (totalPredictions * 1000) / totalTime;

      benchmarkResults.push({
        testName: 'Concurrent Throughput',
        metrics: {
          accuracy: 0,
          precision: 0,
          recall: 0,
          f1Score: 0,
          auc: 0,
          latency: totalTime / concurrentRequests,
          throughput: concurrentThroughput,
          memoryUsage: tf.memory().numBytes
        },
        passed: concurrentThroughput >= 80,
        details: {
          concurrentRequests,
          predictionsPerRequest,
          totalTime,
          targetThroughput: 80
        }
      });

      expect(concurrentThroughput).toBeGreaterThanOrEqual(40); // Minimum with concurrency
      
      // Cleanup
      results.forEach(result => result?.dispose());
    });
  });

  describe('Memory Usage Benchmarks', () => {
    it('should maintain reasonable memory usage', async () => {
      const initialMemory = tf.memory();
      const testInput = tf.randomNormal([100, 20]);
      
      // Make multiple predictions to check for memory leaks
      for (let i = 0; i < 50; i++) {
        const prediction = await ensemble.predict(testInput);
        prediction.prediction.dispose();
      }

      const finalMemory = tf.memory();
      const memoryIncrease = finalMemory.numBytes - initialMemory.numBytes;
      const memoryLeakRate = memoryIncrease / 50; // Per prediction

      benchmarkResults.push({
        testName: 'Memory Usage',
        metrics: {
          accuracy: 0,
          precision: 0,
          recall: 0,
          f1Score: 0,
          auc: 0,
          latency: 0,
          throughput: 0,
          memoryUsage: finalMemory.numBytes
        },
        passed: memoryLeakRate < 1024 * 1024, // Less than 1MB per prediction
        details: {
          initialMemory: initialMemory.numBytes,
          finalMemory: finalMemory.numBytes,
          memoryIncrease,
          memoryLeakRate
        }
      });

      expect(memoryLeakRate).toBeLessThan(2 * 1024 * 1024); // Less than 2MB per prediction
      
      testInput.dispose();
    });
  });
});

// Helper Functions

async function createOptimizedModel(name: string): Promise<tf.LayersModel> {
  const model = tf.sequential({
    layers: [
      tf.layers.dense({ inputShape: [20], units: 128, activation: 'relu' }),
      tf.layers.batchNormalization(),
      tf.layers.dropout({ rate: 0.2 }),
      tf.layers.dense({ units: 64, activation: 'relu' }),
      tf.layers.batchNormalization(),
      tf.layers.dropout({ rate: 0.2 }),
      tf.layers.dense({ units: 32, activation: 'relu' }),
      tf.layers.dense({ units: 5, activation: 'softmax' })
    ]
  });

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });

  // Pre-train with synthetic data for better benchmarking
  const syntheticData = generateClassificationData(1000, 20, 5);
  await model.fit(syntheticData.inputs, syntheticData.labels, {
    epochs: 5,
    batchSize: 32,
    verbose: 0
  });

  syntheticData.inputs.dispose();
  syntheticData.labels.dispose();

  return model;
}

function generateClassificationData(samples: number, features: number, classes: number) {
  const inputs = tf.randomNormal([samples, features]);
  const labels = tf.oneHot(tf.randomUniform([samples], 0, classes, 'int32'), classes);
  return { inputs, labels };
}

function generateDataWithDistribution(samples: number, features: number, classes: number, distribution: string) {
  let inputs: tf.Tensor;
  
  switch (distribution) {
    case 'uniform':
      inputs = tf.randomUniform([samples, features], -2, 2);
      break;
    case 'skewed':
      inputs = tf.pow(tf.randomNormal([samples, features]), tf.scalar(3));
      break;
    default:
      inputs = tf.randomNormal([samples, features]);
  }
  
  const labels = tf.oneHot(tf.randomUniform([samples], 0, classes, 'int32'), classes);
  return { inputs, labels };
}

async function calculateClassificationMetrics(predictions: tf.Tensor[], targets: tf.Tensor[]): Promise<Omit<PerformanceMetrics, 'latency' | 'throughput' | 'memoryUsage'>> {
  // Concatenate all predictions and targets
  const allPredictions = tf.concat(predictions);
  const allTargets = tf.concat(targets);

  // Calculate accuracy
  const accuracy = await calculateAccuracy(allPredictions, allTargets);
  
  // Calculate precision, recall, and F1 (simplified for multi-class)
  const precision = await calculatePrecision(allPredictions, allTargets);
  const recall = await calculateRecall(allPredictions, allTargets);
  const f1Score = 2 * (precision * recall) / (precision + recall) || 0;
  
  // Calculate AUC (simplified)
  const auc = await calculateAUC(allPredictions, allTargets);

  allPredictions.dispose();
  allTargets.dispose();

  return { accuracy, precision, recall, f1Score, auc };
}

async function calculateAccuracy(predictions: tf.Tensor, targets: tf.Tensor): Promise<number> {
  const predClasses = tf.argMax(predictions, -1);
  const targetClasses = tf.argMax(targets, -1);
  const correct = tf.equal(predClasses, targetClasses);
  const accuracy = tf.mean(tf.cast(correct, 'float32'));
  
  const accuracyValue = await accuracy.data();
  
  predClasses.dispose();
  targetClasses.dispose();
  correct.dispose();
  accuracy.dispose();
  
  return accuracyValue[0];
}

async function calculatePrecision(predictions: tf.Tensor, targets: tf.Tensor): Promise<number> {
  // Simplified precision calculation for multi-class
  const predClasses = tf.argMax(predictions, -1);
  const targetClasses = tf.argMax(targets, -1);
  
  // For simplicity, calculate macro-averaged precision
  const numClasses = targets.shape[targets.shape.length - 1];
  let totalPrecision = 0;
  
  for (let classIdx = 0; classIdx < numClasses; classIdx++) {
    const predPositive = tf.equal(predClasses, tf.scalar(classIdx));
    const targetPositive = tf.equal(targetClasses, tf.scalar(classIdx));
    const truePositive = tf.logicalAnd(predPositive, targetPositive);
    
    const tp = tf.sum(tf.cast(truePositive, 'float32'));
    const pp = tf.sum(tf.cast(predPositive, 'float32'));
    
    const precision = tf.div(tp, tf.maximum(pp, tf.scalar(1e-7)));
    const precisionValue = await precision.data();
    
    totalPrecision += precisionValue[0];
    
    predPositive.dispose();
    targetPositive.dispose();
    truePositive.dispose();
    tp.dispose();
    pp.dispose();
    precision.dispose();
  }
  
  predClasses.dispose();
  targetClasses.dispose();
  
  return totalPrecision / numClasses;
}

async function calculateRecall(predictions: tf.Tensor, targets: tf.Tensor): Promise<number> {
  // Simplified recall calculation for multi-class
  const predClasses = tf.argMax(predictions, -1);
  const targetClasses = tf.argMax(targets, -1);
  
  const numClasses = targets.shape[targets.shape.length - 1];
  let totalRecall = 0;
  
  for (let classIdx = 0; classIdx < numClasses; classIdx++) {
    const predPositive = tf.equal(predClasses, tf.scalar(classIdx));
    const targetPositive = tf.equal(targetClasses, tf.scalar(classIdx));
    const truePositive = tf.logicalAnd(predPositive, targetPositive);
    
    const tp = tf.sum(tf.cast(truePositive, 'float32'));
    const ap = tf.sum(tf.cast(targetPositive, 'float32'));
    
    const recall = tf.div(tp, tf.maximum(ap, tf.scalar(1e-7)));
    const recallValue = await recall.data();
    
    totalRecall += recallValue[0];
    
    predPositive.dispose();
    targetPositive.dispose();
    truePositive.dispose();
    tp.dispose();
    ap.dispose();
    recall.dispose();
  }
  
  predClasses.dispose();
  targetClasses.dispose();
  
  return totalRecall / numClasses;
}

async function calculateAUC(predictions: tf.Tensor, targets: tf.Tensor): Promise<number> {
  // Simplified AUC calculation - in production, would use proper ROC calculation
  const accuracy = await calculateAccuracy(predictions, targets);
  return Math.min(1.0, accuracy * 1.1); // Approximation for testing
}

function generatePerformanceReport(results: BenchmarkResult[]): void {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: results.length,
      passedTests: results.filter(r => r.passed).length,
      failedTests: results.filter(r => r.passed === false).length
    },
    results: results.map(result => ({
      testName: result.testName,
      passed: result.passed,
      metrics: result.metrics,
      details: result.details
    }))
  };

  logger.info('Performance Benchmark Report Generated:', report);
  
  // In a real implementation, this would write to a file
  console.log('\n=== PERFORMANCE BENCHMARK REPORT ===');
  console.log(`Total Tests: ${report.summary.totalTests}`);
  console.log(`Passed: ${report.summary.passedTests}`);
  console.log(`Failed: ${report.summary.failedTests}`);
  console.log('\nDetailed Results:');
  
  results.forEach(result => {
    console.log(`\n${result.testName}: ${result.passed ? 'PASS' : 'FAIL'}`);
    if (result.metrics.accuracy > 0) console.log(`  Accuracy: ${result.metrics.accuracy.toFixed(4)}`);
    if (result.metrics.latency > 0) console.log(`  Latency: ${result.metrics.latency.toFixed(2)}ms`);
    if (result.metrics.throughput > 0) console.log(`  Throughput: ${result.metrics.throughput.toFixed(2)} pred/sec`);
  });
}