# FACT Benchmark Runner System

The FACT project includes a comprehensive benchmark runner system with multiple execution options to validate performance, generate reports, and create visualizations.

## Available Scripts

### 1. Enhanced Benchmark Runner (`run_benchmarks.py`)
The main benchmark runner that integrates with the full FACT system.

**Features:**
- Full FACT system integration
- Real cache manager integration
- Complete benchmarking suite
- Production-ready performance validation

**Usage:**
```bash
# Note: Requires full FACT system setup
python scripts/run_benchmarks.py --help
```

### 2. Standalone Benchmark Runner (`run_benchmarks_standalone.py`)
A standalone demonstration version that works without the full FACT system.

**Features:**
- ✅ **Automatic logs directory creation** with timestamps
- ✅ **Comprehensive performance reports** (JSON, text, raw data)
- ✅ **Visualization generation** with performance charts
- ✅ **Enhanced console output** with detailed summaries
- ✅ **RAG comparison simulation**
- ✅ **Load testing simulation**
- ✅ **Performance profiling simulation**

**Usage:**
```bash
# Basic benchmark
python scripts/run_benchmarks_standalone.py

# Comprehensive benchmark with all features
python scripts/run_benchmarks_standalone.py \
    --include-rag-comparison \
    --include-profiling \
    --include-load-test

# Custom performance targets
python scripts/run_benchmarks_standalone.py \
    --hit-target 40 \
    --miss-target 120 \
    --cost-reduction 85
```

### 3. Quick Executable (`benchmark`)
A simple bash script for easy execution.

**Usage:**
```bash
# Make executable and run
./scripts/benchmark --help
./scripts/benchmark --include-rag-comparison
```

## Key Enhancements Implemented

### 📁 Automatic Logs Directory Creation
- Creates timestamped directories: `logs/benchmark_YYYYMMDD_HHMMSS/`
- Organized subdirectories: `reports/`, `charts/`, `raw_data/`
- Preserves historical benchmark data

### 📊 Comprehensive Performance Reports
- **JSON Report**: Complete benchmark data in structured format
- **Text Summary**: Human-readable performance summary
- **Raw Data**: All collected data for external analysis
- **Timestamped files**: Consistent naming with timestamps

### 📈 Visualization Generation
- Performance overview charts
- Latency comparison visualizations
- Cost analysis graphs
- Cache performance metrics
- Export-ready JSON format for external tools

### 🎯 Enhanced Console Output
```
================================================================================
📊 FACT SYSTEM PERFORMANCE SUMMARY
================================================================================

🎉 OVERALL STATUS: ALL TARGETS MET

📈 PERFORMANCE TARGETS:
--------------------------------------------------
  cache_hit_latency         ✅ PASS   Actual: 42.3ms     Target: 48.0ms
  cache_miss_latency        ✅ PASS   Actual: 128.7ms    Target: 140.0ms
  cache_hit_rate            ✅ PASS   Actual: 67.0%      Target: 60.0%
  cost_reduction            ✅ PASS   Actual: 91.5%      Target: 90.0%

🗄️  CACHE PERFORMANCE:
--------------------------------------------------
  Cache Hit Rate:           67.0%
  Avg Response Time (Hit):  42.3ms
  Avg Response Time (Miss): 128.7ms
  Total Requests:           10
  Success Rate:             100.0%

⚔️  FACT vs TRADITIONAL RAG:
--------------------------------------------------
  Latency Improvement:      3.2x faster
  Cost Savings:             91.5%
  Recommendation:           FACT shows excellent performance gains

🏆 Performance Grade: A+

🔧 KEY RECOMMENDATIONS:
--------------------------------------------------
  1. Cache performance is excellent - maintain current configuration
  2. Consider increasing cache size for even better hit rates
  3. Monitor performance under higher concurrent load
```

## Output Structure

Each benchmark run creates an organized directory structure:

```
logs/benchmark_20250523_153454/
├── reports/
│   ├── benchmark_report_20250523_153454.json    # Complete benchmark data
│   └── benchmark_summary_20250523_153454.txt    # Human-readable summary
├── charts/
│   ├── performance_overview_20250523_153454.json    # Performance charts
│   └── latency_comparison_20250523_153454.json     # Comparison charts
└── raw_data/
    └── raw_results_20250523_153454.json         # Raw data for analysis
```

## Command Line Options

### Basic Configuration
```bash
--iterations 10           # Number of benchmark iterations
--concurrent-users 1     # Concurrent user simulation
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
```

### Output Configuration
```bash
--output-dir ./custom    # Custom output directory
                        # Default: creates timestamped logs directory
```

## Quick Start Examples

### 1. Basic Performance Check
```bash
python scripts/run_benchmarks_standalone.py --iterations 5
```

### 2. Comprehensive Analysis
```bash
python scripts/run_benchmarks_standalone.py \
    --iterations 20 \
    --include-rag-comparison \
    --include-profiling \
    --include-load-test
```

### 3. Custom Targets
```bash
python scripts/run_benchmarks_standalone.py \
    --hit-target 35 \
    --miss-target 100 \
    --cost-reduction 95 \
    --cache-hit-rate 70
```

### 4. Quick Executable
```bash
./scripts/benchmark --include-rag-comparison --include-profiling
```

## Integration with CI/CD

The benchmark runner is designed for easy CI/CD integration:

```yaml
# GitHub Actions example
- name: Run FACT Benchmarks
  run: |
    python scripts/run_benchmarks_standalone.py \
      --iterations 5 \
      --include-rag-comparison \
      --output-dir ./benchmark_results

- name: Upload Benchmark Results
  uses: actions/upload-artifact@v2
  with:
    name: benchmark-results
    path: ./benchmark_results/
```

## Performance Targets

Default performance targets (all configurable):

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Cache Hit Latency | ≤ 48ms | ≤ 60ms |
| Cache Miss Latency | ≤ 140ms | ≤ 180ms |
| Cache Hit Rate | ≥ 60% | ≥ 45% |
| Cost Reduction (Hits) | ≥ 90% | ≥ 75% |
| Cost Reduction (Misses) | ≥ 65% | ≥ 50% |

## Files Created

The benchmark runner creates these key files:

1. **benchmark_report_[timestamp].json** - Complete benchmark data
2. **benchmark_summary_[timestamp].txt** - Human-readable summary  
3. **raw_results_[timestamp].json** - Raw data for analysis
4. **performance_overview_[timestamp].json** - Performance charts
5. **latency_comparison_[timestamp].json** - Comparison charts

## Usage Recommendation

For **development and testing**: Use `run_benchmarks_standalone.py`
- Works without full FACT system
- Demonstrates all enhanced features
- Perfect for validating benchmark runner functionality

For **production systems**: Use `run_benchmarks.py`
- Integrates with real FACT system
- Actual performance measurements
- Production-ready validation

## Next Steps

1. **Run the standalone version** to see all features in action
2. **Review generated reports** in the logs directory
3. **Integrate with your CI/CD pipeline** using the provided examples
4. **Customize performance targets** based on your requirements
5. **Use visualization data** for dashboards and monitoring

The enhanced benchmark runner provides a comprehensive solution for FACT performance validation with automatic logs management, detailed reporting, and rich visualizations.