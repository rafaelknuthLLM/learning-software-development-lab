# FACT Benchmark Runner Guide

The enhanced FACT benchmark runner provides comprehensive performance validation, comparison analysis, and visualization generation with automatic logs directory management.

## Quick Start

```bash
# Basic benchmark execution
python scripts/run_benchmarks.py

# Comprehensive benchmark with all features
python scripts/run_benchmarks.py \
    --include-rag-comparison \
    --include-profiling \
    --include-load-test

# Continuous monitoring mode
python scripts/run_benchmarks.py --mode monitoring --monitor-duration 3600
```

## Features

### 🚀 Automatic Logs Directory Creation
- Creates timestamped logs directories (`logs/benchmark_YYYYMMDD_HHMMSS/`)
- Organized subdirectories: `reports/`, `charts/`, `raw_data/`
- Preserves historical benchmark data

### 📊 Comprehensive Performance Reports
- JSON reports with full benchmark data
- Text summaries for quick review
- Raw data exports for external analysis
- Timestamped file naming for organization

### 📈 Visualization Generation
- Performance comparison charts
- Cache efficiency visualizations
- Cost analysis graphs
- Latency distribution plots

### 🎯 Enhanced Console Output
- Real-time progress indicators
- Comprehensive performance summaries
- Color-coded status indicators
- Detailed target validation results

## Command Line Options

### Basic Configuration
```bash
--iterations 10           # Number of benchmark iterations
--warmup 3               # Number of warmup iterations
--concurrent-users 1     # Concurrent user simulation
--timeout 30             # Operation timeout (seconds)
```

### Performance Targets
```bash
--hit-target 48.0        # Cache hit latency target (ms)
--miss-target 140.0      # Cache miss latency target (ms)
--cost-reduction 90.0    # Cost reduction target (%)
--cache-hit-rate 60.0    # Cache hit rate target (%)
```

### Optional Components
```bash
--include-rag-comparison  # Compare with traditional RAG
--include-profiling      # Performance profiling analysis
--include-load-test      # Load testing with multiple users
```

### Load Testing
```bash
--load-test-users 10     # Concurrent users for load test
--load-test-duration 60  # Load test duration (seconds)
```

### Monitoring Mode
```bash
--mode monitoring        # Run in continuous monitoring mode
--monitor-duration 3600  # Monitoring duration (0=indefinite)
```

### Output Configuration
```bash
--output-dir ./custom    # Custom output directory
                        # Default: creates timestamped logs directory
```

## Output Structure

When you run the benchmark, it creates an organized directory structure:

```
logs/benchmark_20250523_152930/
├── reports/
│   ├── benchmark_report_20250523_152930.json
│   ├── benchmark_summary_20250523_152930.txt
│   └── monitoring_report_20250523_152930.json (if monitoring)
├── charts/
│   ├── latency_comparison_20250523_152930.json
│   ├── cost_analysis_20250523_152930.json
│   ├── cache_performance_20250523_152930.json
│   └── chart_0_performance_overview_20250523_152930.json
└── raw_data/
    └── raw_results_20250523_152930.json
```

## Usage Examples

### 1. Quick Performance Check
```bash
python scripts/run_benchmarks.py --iterations 5
```

### 2. Full Benchmark Suite
```bash
python scripts/run_benchmarks.py \
    --iterations 20 \
    --include-rag-comparison \
    --include-profiling \
    --include-load-test \
    --load-test-users 5 \
    --load-test-duration 30
```

### 3. Custom Performance Targets
```bash
python scripts/run_benchmarks.py \
    --hit-target 40 \
    --miss-target 120 \
    --cost-reduction 85 \
    --cache-hit-rate 65
```

### 4. Continuous Monitoring
```bash
# Monitor for 1 hour
python scripts/run_benchmarks.py \
    --mode monitoring \
    --monitor-duration 3600

# Monitor indefinitely (Ctrl+C to stop)
python scripts/run_benchmarks.py --mode monitoring
```

### 5. CI/CD Integration
```bash
# Minimal benchmark for CI
python scripts/run_benchmarks.py \
    --iterations 5 \
    --timeout 15 \
    --output-dir ./ci_results
```

## Console Output Example

```
🚀 Starting FACT Comprehensive Benchmark Suite
============================================================
📁 Created logs directory: logs/benchmark_20250523_152930

✅ Cache manager initialized

📊 Phase 1: Performance Validation
----------------------------------------
Overall Validation: ✅ PASS
  cache_hit_latency: ✅ PASS (42.3ms)
  cache_miss_latency: ✅ PASS (128.7ms)
  cache_hit_rate: ✅ PASS (67.2%)
  cost_reduction: ✅ PASS (91.5%)

⚔️  Phase 2: RAG Comparison Analysis
----------------------------------------
Latency Improvement: 3.2x
Cost Savings: 91.5%
Recommendation: FACT shows excellent performance gains

🔍 Phase 3: Performance Profiling
----------------------------------------
Execution Time: 1250.3ms
Bottlenecks Found: 2

📝 Phase 5: Report Generation & Visualization
----------------------------------------
📊 Generating performance visualizations...
📄 Reports saved to: logs/benchmark_20250523_152930
📄 JSON Report: logs/benchmark_20250523_152930/reports/benchmark_report_20250523_152930.json
📄 Summary: logs/benchmark_20250523_152930/reports/benchmark_summary_20250523_152930.txt
📄 Raw Data: logs/benchmark_20250523_152930/raw_data/raw_results_20250523_152930.json
📈 Charts: logs/benchmark_20250523_152930/charts

================================================================================
📊 FACT SYSTEM PERFORMANCE SUMMARY
================================================================================

🎉 OVERALL STATUS: ALL TARGETS MET

📈 PERFORMANCE TARGETS:
--------------------------------------------------
  cache_hit_latency         ✅ PASS   Actual: 42.3ms     Target: 48.0ms
  cache_miss_latency        ✅ PASS   Actual: 128.7ms    Target: 140.0ms
  cache_hit_rate            ✅ PASS   Actual: 67.2%      Target: 60.0%
  cost_reduction            ✅ PASS   Actual: 91.5%      Target: 90.0%

🗄️  CACHE PERFORMANCE:
--------------------------------------------------
  Cache Hit Rate:           67.2%
  Avg Response Time (Hit):  42.3ms
  Avg Response Time (Miss): 128.7ms
  Total Requests:           20
  Success Rate:             100.0%

⚔️  FACT vs TRADITIONAL RAG:
--------------------------------------------------
  Latency Improvement:      3.2x faster
  Cost Savings:             91.5%
  Recommendation:           FACT shows excellent performance gains
================================================================================

🏆 Performance Grade: A+

🔧 KEY RECOMMENDATIONS:
--------------------------------------------------
  1. Cache performance is excellent - maintain current configuration
  2. Consider increasing cache size for even better hit rates
  3. Monitor performance under higher concurrent load

🎉 Benchmark completed successfully! All performance targets achieved.
   Results saved to: logs/benchmark_20250523_152930
```

## Testing the Runner

Test the benchmark runner before using:

```bash
python scripts/test_benchmark_runner.py
```

This validates:
- Import functionality
- Command line interface
- Directory creation
- Basic functionality

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure you're in the project root directory
2. **Permission Errors**: Check write permissions for logs directory
3. **Cache Manager Unavailable**: System will continue with reduced functionality

### Getting Help

```bash
python scripts/run_benchmarks.py --help
```

## Integration with CI/CD

The benchmark runner is designed for easy CI/CD integration:

```yaml
# GitHub Actions example
- name: Run FACT Benchmarks
  run: |
    python scripts/run_benchmarks.py \
      --iterations 5 \
      --timeout 15 \
      --output-dir ./benchmark_results

- name: Upload Benchmark Results
  uses: actions/upload-artifact@v2
  with:
    name: benchmark-results
    path: ./benchmark_results/
```

## Performance Targets

Default performance targets (configurable):

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Cache Hit Latency | ≤ 48ms | ≤ 60ms |
| Cache Miss Latency | ≤ 140ms | ≤ 180ms |
| Cache Hit Rate | ≥ 60% | ≥ 45% |
| Cost Reduction (Hits) | ≥ 90% | ≥ 75% |
| Cost Reduction (Misses) | ≥ 65% | ≥ 50% |
| Error Rate | ≤ 1% | ≤ 5% |

## Next Steps

After running benchmarks:

1. Review the performance summary in the console
2. Examine detailed reports in the logs directory
3. Use visualization data for dashboards
4. Implement recommendations for optimization
5. Set up continuous monitoring for production

For more detailed analysis, refer to the comprehensive JSON reports and raw data exports in the generated logs directory.