# FACT Benchmarking System Guide

The FACT benchmarking system provides comprehensive performance validation, comparison analysis, and optimization guidance for the FACT implementation. This guide covers setup, usage, and interpretation of benchmark results.

## Overview

The benchmarking system validates that FACT meets its performance targets:
- **Sub-48ms latency** for cache hits
- **Sub-140ms latency** for cache misses  
- **90% token cost reduction** for cache hits
- **65% token cost reduction** for cache misses
- **60%+ cache hit rate**

## System Components

### 1. Benchmark Framework (`framework.py`)
- Core benchmarking infrastructure
- Response time and token cost measurement
- Statistical analysis and reporting
- Configurable performance targets

### 2. Comparison Engine (`comparisons.py`)
- FACT vs Traditional RAG performance comparison
- Cost efficiency analysis
- Improvement factor calculations
- Recommendation generation

### 3. Performance Profiler (`profiler.py`)
- System resource monitoring
- Bottleneck identification
- Performance optimization recommendations
- Detailed execution analysis

### 4. Continuous Monitoring (`monitoring.py`)
- Real-time performance tracking
- Alert system for threshold violations
- Trend analysis and reporting
- Performance degradation detection

### 5. Visualization System (`visualization.py`)
- Chart generation for performance data
- Comprehensive report creation
- Export capabilities for external tools
- Dashboard-ready data formats

## Quick Start

### Basic Benchmark Execution

```bash
# Run basic performance validation
python scripts/run_benchmarks.py

# Comprehensive benchmark with all features
python scripts/run_benchmarks.py \
    --include-rag-comparison \
    --include-profiling \
    --include-load-test
```

### Continuous Monitoring

```bash
# Start continuous monitoring (1 hour)
python scripts/run_benchmarks.py \
    --mode monitoring \
    --monitor-duration 3600
```

### Custom Performance Targets

```bash
# Custom targets for specific requirements
python scripts/run_benchmarks.py \
    --hit-target 40 \
    --miss-target 120 \
    --cost-reduction 85 \
    --cache-hit-rate 65
```

## Configuration Options

### Benchmark Configuration

```python
from benchmarking import BenchmarkConfig

config = BenchmarkConfig(
    iterations=20,                    # Number of test iterations
    warmup_iterations=5,              # Warmup runs before measurement
    concurrent_users=1,               # Concurrent request simulation
    timeout_seconds=30,               # Operation timeout
    target_hit_latency_ms=48.0,      # Cache hit target
    target_miss_latency_ms=140.0,    # Cache miss target
    target_cost_reduction_hit=0.90,  # 90% cost reduction target
    target_cache_hit_rate=0.60       # 60% hit rate target
)
```

### Monitoring Configuration

```python
from benchmarking import MonitoringConfig

monitor_config = MonitoringConfig(
    monitoring_interval_seconds=60,       # Measurement frequency
    alert_check_interval_seconds=30,      # Alert check frequency
    response_time_warning_ms=80.0,        # Warning threshold
    response_time_critical_ms=120.0,      # Critical threshold
    cache_hit_rate_warning=50.0,          # Cache warning threshold
    error_rate_critical=10.0              # Error rate threshold
)
```

## Programmatic Usage

### Basic Benchmark Execution

```python
import asyncio
from benchmarking import BenchmarkRunner, BenchmarkConfig
from cache.manager import CacheManager

async def run_benchmark():
    # Initialize components
    config = BenchmarkConfig(iterations=10)
    runner = BenchmarkRunner()
    cache_manager = CacheManager()
    
    # Run performance validation
    results = await runner.run_performance_validation(cache_manager)
    
    # Check if targets met
    if results['overall_pass']:
        print("✅ All performance targets achieved!")
    else:
        print("❌ Some targets not met")
        
        # Review specific targets
        for target, data in results['target_validation'].items():
            if not data['met']:
                print(f"Failed: {target} - {data['actual_ms']}ms")

# Run the benchmark
asyncio.run(run_benchmark())
```

### RAG Comparison Analysis

```python
from benchmarking import RAGComparison, BenchmarkFramework

async def compare_with_rag():
    framework = BenchmarkFramework()
    rag_comparison = RAGComparison(framework)
    
    test_queries = [
        "What was the Q1-2025 revenue?",
        "Calculate year-over-year growth",
        "Show top performing products"
    ]
    
    # Run comparison
    comparison = await rag_comparison.run_comparison_benchmark(
        test_queries, cache_manager, iterations=10
    )
    
    # Analyze results
    print(f"Latency improvement: {comparison.improvement_factors['latency']:.1f}x")
    print(f"Cost savings: {comparison.cost_savings['percentage']:.1f}%")
    print(f"Recommendation: {comparison.recommendation}")

asyncio.run(compare_with_rag())
```

### Performance Profiling

```python
from benchmarking import SystemProfiler

async def profile_operation():
    profiler = SystemProfiler()
    
    # Profile a specific operation
    async def sample_operation():
        # Your operation here
        await process_user_query("Sample query")
    
    result, profile = await profiler.profile_complete_operation(
        sample_operation, "query_processing"
    )
    
    # Analyze bottlenecks
    for bottleneck in profile.bottlenecks:
        if bottleneck.severity == "critical":
            print(f"Critical: {bottleneck.component} - {bottleneck.description}")
            print(f"Recommendations: {bottleneck.recommendations}")

asyncio.run(profile_operation())
```

### Continuous Monitoring

```python
from benchmarking import ContinuousMonitor

async def start_monitoring():
    monitor = ContinuousMonitor()
    
    # Add alert callback
    def handle_alert(alert):
        if alert.severity == "critical":
            print(f"🚨 CRITICAL: {alert.message}")
            # Send notification, trigger scaling, etc.
    
    monitor.add_alert_callback(handle_alert)
    
    # Start monitoring
    await monitor.start_monitoring(cache_manager)
    
    try:
        # Monitor for 1 hour
        await asyncio.sleep(3600)
    finally:
        await monitor.stop_monitoring()
        
        # Export results
        report = monitor.export_monitoring_report()
        print(f"Monitoring complete. {report['status']['active_alerts']} alerts")

asyncio.run(start_monitoring())
```

## Report Generation

### Comprehensive Reports

```python
from benchmarking import ReportGenerator, BenchmarkVisualizer

def generate_report(benchmark_summary, comparison_result=None):
    visualizer = BenchmarkVisualizer()
    generator = ReportGenerator(visualizer)
    
    # Generate comprehensive report
    report = generator.generate_comprehensive_report(
        benchmark_summary=benchmark_summary,
        comparison_result=comparison_result,
        profile_result=None,
        alerts=None
    )
    
    # Export as JSON
    json_report = generator.export_report_json(report)
    with open('benchmark_report.json', 'w') as f:
        f.write(json_report)
    
    # Export text summary
    text_summary = generator.export_report_summary_text(report)
    with open('benchmark_summary.txt', 'w') as f:
        f.write(text_summary)
    
    print(f"Performance Grade: {report.summary['performance_grade']}")
    print(f"Key Recommendations: {len(report.recommendations)}")
```

### Chart Generation

```python
from benchmarking import BenchmarkVisualizer

def create_performance_charts(results):
    visualizer = BenchmarkVisualizer()
    
    # Create latency comparison chart
    latency_chart = visualizer.create_latency_comparison_chart(
        fact_results, rag_results
    )
    
    # Create cache performance chart
    cache_chart = visualizer.create_cache_performance_chart(results)
    
    # Export chart data for external tools
    chart_json = visualizer.export_chart_data_json(latency_chart)
    with open('latency_chart.json', 'w') as f:
        f.write(chart_json)
```

## Performance Target Validation

### Target Definitions

The system validates performance against these targets:

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Cache Hit Latency | ≤ 48ms | ≤ 60ms |
| Cache Miss Latency | ≤ 140ms | ≤ 180ms |
| Cache Hit Rate | ≥ 60% | ≥ 45% |
| Cost Reduction (Hits) | ≥ 90% | ≥ 75% |
| Cost Reduction (Misses) | ≥ 65% | ≥ 50% |
| Error Rate | ≤ 1% | ≤ 5% |

### Interpreting Results

#### Performance Grades
- **A+/A**: Excellent performance, exceeds all targets
- **B+/B**: Good performance, meets most targets
- **C+/C**: Acceptable performance, some optimization needed
- **D**: Poor performance, significant optimization required

#### Alert Severity Levels
- **Critical**: Immediate action required, system degraded
- **Warning**: Performance concerns, monitoring needed
- **Info**: Informational, no action required

### Troubleshooting Common Issues

#### High Cache Miss Rate
```python
# Check cache configuration
cache_metrics = cache_manager.get_metrics()
if cache_metrics.hit_rate < 60:
    print("Cache hit rate below target")
    print(f"Current size: {cache_metrics.total_size} bytes")
    print(f"Max size: {cache_manager.max_size_bytes} bytes")
    
    # Recommendations:
    # 1. Increase cache size
    # 2. Improve cache warming
    # 3. Optimize eviction policy
```

#### High Response Times
```python
# Analyze latency distribution
from benchmarking import PerformanceComparison

analyzer = PerformanceComparison()
latency_analysis = analyzer.analyze_latency_distribution(
    fact_results, rag_results
)

if latency_analysis['fact_distribution']['p95'] > 100:
    print("High P95 latency detected")
    print("Check for:")
    print("- Database query performance")
    print("- Network latency")
    print("- Resource contention")
```

## Integration with CI/CD

### Automated Performance Testing

```yaml
# .github/workflows/performance.yml
name: Performance Testing
on: [push, pull_request]

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      
      - name: Install dependencies
        run: pip install -r requirements.txt
      
      - name: Run benchmarks
        run: |
          python scripts/run_benchmarks.py \
            --iterations 5 \
            --include-profiling \
            --output-dir ./benchmark_results
      
      - name: Upload results
        uses: actions/upload-artifact@v2
        with:
          name: benchmark-results
          path: ./benchmark_results/
```

### Performance Budgets

```python
# performance_budget.py
PERFORMANCE_BUDGET = {
    "max_avg_latency_ms": 80,
    "max_p95_latency_ms": 150,
    "min_cache_hit_rate": 55,
    "max_error_rate": 2.0
}

def validate_performance_budget(benchmark_summary):
    violations = []
    
    if benchmark_summary.avg_response_time_ms > PERFORMANCE_BUDGET["max_avg_latency_ms"]:
        violations.append(f"Average latency too high: {benchmark_summary.avg_response_time_ms}ms")
    
    if benchmark_summary.cache_hit_rate < PERFORMANCE_BUDGET["min_cache_hit_rate"]:
        violations.append(f"Cache hit rate too low: {benchmark_summary.cache_hit_rate}%")
    
    return violations
```

## Best Practices

### 1. Benchmark Design
- Use realistic test data and query patterns
- Include warmup iterations to stabilize measurements
- Run sufficient iterations for statistical significance
- Test under various load conditions

### 2. Environment Consistency
- Use dedicated benchmark environments
- Minimize external interference during testing
- Document system specifications and configuration
- Use consistent data sets across benchmark runs

### 3. Result Interpretation
- Focus on trends rather than absolute values
- Compare against baseline measurements
- Consider confidence intervals and variability
- Validate improvements with A/B testing

### 4. Performance Regression Prevention
- Implement automated performance testing
- Set performance budgets and alerts
- Regular benchmark execution and review
- Document performance optimization decisions

## Advanced Usage

### Custom Metrics Collection

```python
from benchmarking import PerformanceTracker

# Track custom operations
tracker = PerformanceTracker()

async def custom_operation():
    start_time = time.time()
    
    # Your operation
    result = await some_operation()
    
    # Track performance
    duration_ms = (time.time() - start_time) * 1000
    tracker.track_operation("custom_op", duration_ms, 
                          operation_type="data_processing",
                          data_size=len(result))

# Get statistics
stats = tracker.get_operation_stats("custom_op")
print(f"Average duration: {stats['avg_duration_ms']}ms")
```

### Bottleneck Analysis

```python
from benchmarking import BottleneckAnalyzer

analyzer = BottleneckAnalyzer()

# Analyze cache performance
cache_bottlenecks = analyzer.analyze_cache_performance(cache_manager)

# Analyze query patterns
query_bottlenecks = analyzer.analyze_query_patterns(recent_queries)

# Generate report
all_bottlenecks = cache_bottlenecks + query_bottlenecks
report = analyzer.generate_bottleneck_report(all_bottlenecks)

print(f"Total bottlenecks: {report['total_bottlenecks']}")
for recommendation in report['recommendations']:
    print(f"- {recommendation}")
```

## Conclusion

The FACT benchmarking system provides comprehensive tools for validating performance, identifying optimization opportunities, and maintaining system quality. Regular use of these tools ensures the system continues to meet performance targets and provides actionable insights for improvement.

For additional support or questions, refer to the optimization strategies documentation or contact the FACT development team.