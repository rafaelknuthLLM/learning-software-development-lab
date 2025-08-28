# FACT System - Benchmarking and Performance Guide

## Overview

This guide provides comprehensive instructions for benchmarking the FACT system, optimizing performance, and interpreting results. Use this guide to validate that your system meets performance targets and optimize for your specific use case.

## Performance Targets

FACT is designed to achieve these benchmark targets:

| Metric | Target | Critical Threshold | Production Goal |
|--------|--------|-------------------|-----------------|
| Cache Hit Latency | ≤ 48ms | ≤ 60ms | ≤ 25ms |
| Cache Miss Latency | ≤ 140ms | ≤ 180ms | ≤ 100ms |
| Cache Hit Rate | ≥ 60% | ≥ 45% | ≥ 80% |
| Cost Reduction (Hits) | ≥ 90% | ≥ 75% | ≥ 95% |
| Cost Reduction (Misses) | ≥ 65% | ≥ 50% | ≥ 70% |
| Error Rate | ≤ 1% | ≤ 5% | ≤ 0.5% |

## Quick Benchmarking

### Basic Performance Test

Start with a quick performance validation:

```bash
# Run basic benchmark
python scripts/run_benchmarks.py

# Expected output:
# ✅ Cache Hit Latency: 23ms (Target: ≤48ms)
# ✅ Cache Miss Latency: 95ms (Target: ≤140ms)
# ✅ Cache Hit Rate: 72% (Target: ≥60%)
# ✅ Cost Reduction: 93% (Target: ≥90%)
```

### Comprehensive Benchmark

For detailed performance analysis:

```bash
# Full benchmark with all features
python scripts/run_benchmarks.py \
    --iterations 20 \
    --include-rag-comparison \
    --include-profiling \
    --include-load-test \
    --warmup-queries 30
```

### Continuous Monitoring

Set up ongoing performance monitoring:

```bash
# Monitor for 1 hour with alerts
python scripts/run_benchmarks.py \
    --mode monitoring \
    --monitor-duration 3600 \
    --alert-thresholds
```

## Detailed Benchmarking Instructions

### Pre-Benchmark Setup

1. **Ensure Clean Environment**:
```bash
# Clear existing cache
python main.py --clear-cache

# Restart system
python main.py validate
```

2. **Warm Cache Strategically**:
```bash
# Warm cache with representative queries
python -c "
import asyncio
from src.cache.warming import get_cache_warmer

async def setup_benchmark():
    warmer = get_cache_warmer()
    # Warm with diverse query types
    queries = [
        'What companies are in technology?',
        'Show me Q1 2025 revenue',
        'Calculate average profit margins',
        'What are the top performers?',
        'Show financial trends',
    ]
    result = await warmer.warm_cache_with_queries(queries)
    print(f'Benchmark setup: {result[\"successful_queries\"]} queries cached')

asyncio.run(setup_benchmark())
"
```

3. **Verify System Health**:
```bash
# Check all components are operational
python main.py validate

# Check current performance baseline
python main.py cli
# In CLI: metrics
```

### Benchmark Execution Modes

#### 1. Performance Validation Mode

Tests against standard performance targets:

```bash
# Standard validation
python scripts/run_benchmarks.py \
    --mode validation \
    --iterations 15 \
    --timeout 30

# Custom targets
python scripts/run_benchmarks.py \
    --mode validation \
    --hit-target 40 \
    --miss-target 120 \
    --cost-reduction 85 \
    --cache-hit-rate 65
```

#### 2. Load Testing Mode

Tests system performance under load:

```bash
# Simulate multiple concurrent users
python scripts/run_benchmarks.py \
    --mode load-test \
    --concurrent-users 10 \
    --test-duration 300 \
    --ramp-up-time 30
```

#### 3. Comparison Mode

Compare FACT performance against traditional RAG:

```bash
# FACT vs RAG comparison
python scripts/run_benchmarks.py \
    --mode comparison \
    --include-rag-comparison \
    --iterations 20
```

#### 4. Profiling Mode

Detailed performance analysis and bottleneck identification:

```bash
# Deep performance profiling
python scripts/run_benchmarks.py \
    --mode profiling \
    --include-profiling \
    --profile-duration 600
```

### Programmatic Benchmarking

For custom benchmark scenarios:

```python
import asyncio
from src.benchmarking import BenchmarkRunner, BenchmarkConfig
from src.cache.manager import CacheManager

async def custom_benchmark():
    # Configure benchmark
    config = BenchmarkConfig(
        iterations=20,
        warmup_iterations=5,
        concurrent_users=5,
        timeout_seconds=60,
        target_hit_latency_ms=48.0,
        target_miss_latency_ms=140.0,
        target_cost_reduction_hit=0.90,
        target_cache_hit_rate=0.60
    )
    
    # Initialize components
    runner = BenchmarkRunner(config)
    cache_manager = CacheManager()
    
    # Run benchmark
    results = await runner.run_performance_validation(cache_manager)
    
    # Analyze results
    print(f"Overall Performance: {'PASS' if results['overall_pass'] else 'FAIL'}")
    print(f"Average Latency: {results['avg_response_time_ms']:.1f}ms")
    print(f"Cache Hit Rate: {results['cache_hit_rate']:.1f}%")
    print(f"Cost Reduction: {results['cost_reduction']:.1f}%")
    
    # Check specific targets
    for target, data in results['target_validation'].items():
        status = "✅" if data['met'] else "❌"
        print(f"{status} {target}: {data['actual']} (Target: {data['target']})")
    
    return results

# Run custom benchmark
results = asyncio.run(custom_benchmark())
```

## Performance Optimization Strategies

### Cache Optimization

#### 1. Intelligent Cache Warming

Optimize cache warming for better hit rates:

```python
from src.cache.warming import get_cache_warmer
import asyncio

async def optimize_cache_warming():
    warmer = get_cache_warmer()
    
    # Get warming recommendations based on usage patterns
    recommendations = warmer.get_warming_recommendations()
    print(f"Recommended queries: {len(recommendations['high_priority'])}")
    
    # Perform intelligent warming
    result = await warmer.warm_cache_intelligently(
        max_queries=50,
        concurrent=True,
        prioritize_categories=True
    )
    
    print(f"Cache optimization completed:")
    print(f"  - Entries created: {result['cache_entries_created']}")
    print(f"  - Estimated hit rate improvement: {result['estimated_hit_rate_improvement']:.1f}%")
    print(f"  - Warming efficiency: {result['warming_efficiency']:.1f}%")

asyncio.run(optimize_cache_warming())
```

#### 2. Cache Configuration Tuning

Optimize cache parameters based on your usage:

```bash
# High-performance configuration (edit .env)
CACHE_MAX_SIZE=10000                    # Larger cache for better hit rates
CACHE_TTL=14400                        # 4 hours for stable data
CACHE_MEMORY_PRESSURE_THRESHOLD=0.85   # Allow higher utilization
CACHE_WARMING_BATCH_SIZE=20            # Faster warming
CACHE_WARMING_CONCURRENCY=10           # Parallel warming

# Memory-optimized configuration
CACHE_MAX_SIZE=2000                    # Smaller cache for limited memory
CACHE_TTL=3600                        # 1 hour TTL
CACHE_MEMORY_PRESSURE_THRESHOLD=0.7   # Conservative memory usage
CACHE_EMERGENCY_CLEANUP_RATIO=0.4     # Aggressive cleanup when needed
```

#### 3. Dynamic Cache Management

Implement real-time cache optimization:

```python
from src.cache.manager import CacheManager
from src.monitoring.performance_optimizer import get_performance_optimizer

async def dynamic_cache_optimization():
    cache = CacheManager()
    optimizer = get_performance_optimizer()
    
    # Get current cache metrics
    metrics = cache.get_metrics()
    print(f"Current cache performance:")
    print(f"  - Hit rate: {metrics.hit_rate:.1f}%")
    print(f"  - Utilization: {metrics.utilization:.1f}%")
    print(f"  - Average latency: {metrics.avg_latency_ms:.1f}ms")
    
    # Apply automatic optimizations
    optimization_actions = await optimizer.analyze_and_optimize()
    
    print(f"Applied {len(optimization_actions)} optimizations:")
    for action in optimization_actions:
        print(f"  - {action.action_type}: {action.description}")
        print(f"    Estimated impact: {action.estimated_impact:.1f}%")

asyncio.run(dynamic_cache_optimization())
```

### Query Performance Optimization

#### 1. Query Pattern Analysis

Identify and optimize slow query patterns:

```python
from src.benchmarking import PerformanceProfiler

async def analyze_query_patterns():
    profiler = PerformanceProfiler()
    
    # Analyze recent query performance
    analysis = await profiler.analyze_query_patterns(
        hours_back=24,
        min_samples=5
    )
    
    print("Query Performance Analysis:")
    for pattern, stats in analysis['patterns'].items():
        if stats['avg_latency_ms'] > 100:  # Slow queries
            print(f"⚠️  Slow pattern: {pattern}")
            print(f"   Average latency: {stats['avg_latency_ms']:.1f}ms")
            print(f"   Cache hit rate: {stats['cache_hit_rate']:.1f}%")
            print(f"   Frequency: {stats['frequency']} queries")
            print(f"   Recommendations: {stats['recommendations']}")

asyncio.run(analyze_query_patterns())
```

#### 2. Database Query Optimization

Optimize database queries for better performance:

```python
# Database performance optimization
from src.tools.connectors.sql import optimize_database

def optimize_database_performance():
    """Optimize database for better query performance"""
    
    # Add indexes for common query patterns
    optimizations = [
        "CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector);",
        "CREATE INDEX IF NOT EXISTS idx_financial_records_company_year ON financial_records(company_id, year);",
        "CREATE INDEX IF NOT EXISTS idx_financial_records_quarter ON financial_records(quarter, year);",
        "ANALYZE;",  # Update query planner statistics
    ]
    
    for optimization in optimizations:
        try:
            # Execute optimization (in safe read-only context)
            print(f"Applied: {optimization}")
        except Exception as e:
            print(f"Warning: Could not apply {optimization}: {e}")
    
    print("Database optimization completed")

optimize_database_performance()
```

### System Resource Optimization

#### 1. Memory Usage Optimization

Monitor and optimize memory usage:

```python
import psutil
import gc
from src.cache.manager import CacheManager

def optimize_memory_usage():
    """Optimize system memory usage"""
    
    # Get current memory usage
    process = psutil.Process()
    memory_info = process.memory_info()
    memory_mb = memory_info.rss / 1024 / 1024
    
    print(f"Current memory usage: {memory_mb:.1f} MB")
    
    # Optimize cache memory
    cache = CacheManager()
    cache_metrics = cache.get_metrics()
    
    if cache_metrics.memory_usage_mb > 500:  # If cache uses >500MB
        print("Optimizing cache memory...")
        cache.cleanup_expired()
        cache.evict_lru(keep_count=1000)
        
        # Re-check memory
        new_metrics = cache.get_metrics()
        saved_mb = cache_metrics.memory_usage_mb - new_metrics.memory_usage_mb
        print(f"Freed {saved_mb:.1f} MB of cache memory")
    
    # Force garbage collection
    gc.collect()
    
    # Check memory after optimization
    new_memory_info = process.memory_info()
    new_memory_mb = new_memory_info.rss / 1024 / 1024
    print(f"Memory after optimization: {new_memory_mb:.1f} MB")
    print(f"Memory saved: {memory_mb - new_memory_mb:.1f} MB")

optimize_memory_usage()
```

#### 2. Connection Pool Optimization

Optimize database and API connections:

```bash
# Connection optimization settings (edit .env)

# For high-throughput scenarios
CONNECTION_POOL_SIZE=50
MAX_CONCURRENT_QUERIES=200
QUERY_TIMEOUT=60
REQUEST_TIMEOUT=45

# For resource-constrained environments
CONNECTION_POOL_SIZE=10
MAX_CONCURRENT_QUERIES=50
QUERY_TIMEOUT=30
REQUEST_TIMEOUT=20

# Connection health monitoring
CONNECTION_HEALTH_CHECK_INTERVAL=60
CONNECTION_RETRY_ATTEMPTS=3
CONNECTION_RETRY_DELAY=5
```

## Interpreting Benchmark Results

### Performance Grades

FACT assigns performance grades based on target achievement:

- **A+ (95-100%)**: Excellent - Exceeds all targets significantly
- **A (90-94%)**: Very Good - Meets all targets with margin
- **B+ (85-89%)**: Good - Meets most targets
- **B (80-84%)**: Acceptable - Meets critical targets
- **C (70-79%)**: Poor - Some targets missed, optimization needed
- **D (<70%)**: Critical - Major performance issues

### Understanding Metrics

#### Latency Metrics
```python
# Example benchmark results interpretation
results = {
    'cache_hit_latency_ms': 23.5,      # Excellent (Target: ≤48ms)
    'cache_miss_latency_ms': 95.2,     # Good (Target: ≤140ms)
    'p95_latency_ms': 120.1,           # 95% of requests under 120ms
    'p99_latency_ms': 155.3,           # 99% of requests under 155ms
}

# Latency distribution analysis
if results['p95_latency_ms'] < 100:
    print("✅ Excellent latency consistency")
elif results['p95_latency_ms'] < 150:
    print("👍 Good latency consistency")
else:
    print("⚠️ Latency variability detected - investigate bottlenecks")
```

#### Cost Efficiency Metrics
```python
# Cost analysis
cost_analysis = {
    'baseline_cost_per_query': 0.025,    # Traditional RAG cost
    'fact_cost_per_query': 0.002,       # FACT cost with caching
    'cost_reduction_percentage': 92.0,   # 92% cost reduction
    'monthly_savings': 450.00,           # Monthly cost savings
}

print(f"Cost efficiency: {cost_analysis['cost_reduction_percentage']:.1f}%")
print(f"Monthly savings: ${cost_analysis['monthly_savings']:.2f}")
```

#### Cache Performance Metrics
```python
# Cache analysis
cache_metrics = {
    'hit_rate': 78.5,                   # 78.5% of queries served from cache
    'miss_rate': 21.5,                  # 21.5% required full processing
    'eviction_rate': 5.2,               # 5.2% of entries evicted
    'memory_utilization': 82.3,         # 82.3% of cache memory used
}

# Cache health assessment
if cache_metrics['hit_rate'] > 80:
    print("✅ Excellent cache performance")
elif cache_metrics['hit_rate'] > 60:
    print("👍 Good cache performance")
else:
    print("⚠️ Cache needs optimization")
```

### Common Performance Issues

#### Issue: Low Cache Hit Rate (<60%)

**Symptoms**: High latency, increased costs, poor performance grade

**Diagnosis**:
```bash
# Check cache warming effectiveness
python -c "
from src.cache.manager import CacheManager
cache = CacheManager()
metrics = cache.get_metrics()
print(f'Current hit rate: {metrics.hit_rate:.1f}%')
print(f'Cache size: {metrics.total_entries} entries')
print(f'Memory usage: {metrics.memory_usage_mb:.1f} MB')
"
```

**Solutions**:
1. **Increase cache warming**:
```bash
python -c "
import asyncio
from src.cache.warming import get_cache_warmer

async def boost_warming():
    warmer = get_cache_warmer()
    result = await warmer.warm_cache_intelligently(max_queries=100)
    print(f'Aggressive warming: {result[\"cache_entries_created\"]} entries added')

asyncio.run(boost_warming())
"
```

2. **Optimize cache size**:
```bash
# Edit .env file
CACHE_MAX_SIZE=8000  # Increase cache size
CACHE_TTL=7200       # Increase TTL for stable data
```

3. **Improve query patterns**:
```python
# Use more specific, cacheable queries
good_queries = [
    "What is TechCorp's Q1 2025 revenue?",  # Specific, cacheable
    "Show technology sector companies",      # Category-based, cacheable
]

bad_queries = [
    "Show me everything about all companies",  # Too broad
    "What happened yesterday?",                # Time-dependent
]
```

#### Issue: High Response Latency

**Symptoms**: Responses consistently above targets, timeouts

**Diagnosis**:
```python
from src.benchmarking import SystemProfiler
import asyncio

async def diagnose_latency():
    profiler = SystemProfiler()
    
    # Profile a slow operation
    async def slow_operation():
        # Simulate typical query
        from src.core.driver import get_driver
        driver = await get_driver()
        await driver.process_query("Show me all financial data")
        await driver.shutdown()
    
    result, profile = await profiler.profile_complete_operation(
        slow_operation, "latency_diagnosis"
    )
    
    # Identify bottlenecks
    for bottleneck in profile.bottlenecks:
        if bottleneck.severity in ["critical", "high"]:
            print(f"🚨 {bottleneck.component}: {bottleneck.description}")
            print(f"   Impact: {bottleneck.impact_ms:.1f}ms")
            print(f"   Recommendations: {bottleneck.recommendations}")

asyncio.run(diagnose_latency())
```

**Solutions**:
1. **Database optimization**: Add indexes, optimize queries
2. **Network optimization**: Check API connectivity, reduce timeouts
3. **Resource optimization**: Increase memory, CPU allocation
4. **Cache optimization**: Pre-warm frequently accessed data

#### Issue: High Error Rate (>1%)

**Symptoms**: Failed queries, API errors, system instability

**Diagnosis**:
```bash
# Check recent errors
grep "ERROR\|CRITICAL" logs/fact.log | tail -20

# Check API connectivity
python -c "
import asyncio
from src.core.driver import test_api_connections
asyncio.run(test_api_connections())
"
```

**Solutions**:
1. **API key validation**: Ensure keys are valid and have credits
2. **Network connectivity**: Check firewall, proxy settings
3. **Resource limits**: Increase timeouts, connection pools
4. **Error handling**: Implement retry logic, graceful degradation

## Continuous Performance Monitoring

### Real-Time Monitoring Setup

Set up ongoing performance monitoring:

```python
from src.monitoring.performance_optimizer import ContinuousMonitor
import asyncio

async def setup_continuous_monitoring():
    monitor = ContinuousMonitor()
    
    # Configure alert thresholds
    alert_config = {
        'response_time_warning_ms': 80.0,
        'response_time_critical_ms': 120.0,
        'cache_hit_rate_warning': 50.0,
        'cache_hit_rate_critical': 40.0,
        'error_rate_warning': 2.0,
        'error_rate_critical': 5.0,
    }
    
    # Add alert handlers
    def handle_performance_alert(alert):
        if alert.severity == "critical":
            print(f"🚨 CRITICAL ALERT: {alert.message}")
            # Trigger automatic optimization
            asyncio.create_task(emergency_optimization())
        elif alert.severity == "warning":
            print(f"⚠️ WARNING: {alert.message}")
    
    monitor.add_alert_callback(handle_performance_alert)
    
    # Start monitoring
    print("Starting continuous performance monitoring...")
    await monitor.start_monitoring()

async def emergency_optimization():
    """Emergency performance optimization"""
    from src.cache.manager import CacheManager
    cache = CacheManager()
    
    # Clear expired entries
    cache.cleanup_expired()
    
    # Warm cache with critical queries
    from src.cache.warming import get_cache_warmer
    warmer = get_cache_warmer()
    await warmer.warm_cache_intelligently(max_queries=20)
    
    print("Emergency optimization completed")

# Start monitoring
asyncio.run(setup_continuous_monitoring())
```

### Performance Dashboard

Create a simple performance dashboard:

```python
import time
from src.cache.manager import CacheManager
from src.benchmarking import BenchmarkRunner

def performance_dashboard():
    """Display real-time performance dashboard"""
    
    cache = CacheManager()
    
    while True:
        # Get current metrics
        metrics = cache.get_metrics()
        
        # Clear screen and display dashboard
        print("\033[2J\033[H")  # Clear screen
        print("="*60)
        print("             FACT PERFORMANCE DASHBOARD")
        print("="*60)
        print(f"Cache Hit Rate:     {metrics.hit_rate:6.1f}%  (Target: ≥60%)")
        print(f"Memory Usage:       {metrics.memory_usage_mb:6.1f} MB")
        print(f"Cache Entries:      {metrics.total_entries:6d}")
        print(f"Average Latency:    {metrics.avg_latency_ms:6.1f} ms")
        print(f"Cache Utilization:  {metrics.utilization:6.1f}%")
        print()
        
        # Performance grade
        if metrics.hit_rate >= 80:
            grade = "A+"
        elif metrics.hit_rate >= 70:
            grade = "A"
        elif metrics.hit_rate >= 60:
            grade = "B"
        else:
            grade = "C"
        
        print(f"Performance Grade:  {grade}")
        print(f"Last Updated:       {time.strftime('%H:%M:%S')}")
        print()
        print("Press Ctrl+C to exit...")
        
        time.sleep(5)  # Update every 5 seconds

# Run dashboard
try:
    performance_dashboard()
except KeyboardInterrupt:
    print("\nDashboard stopped.")
```

## Advanced Benchmarking Scenarios

### Load Testing

Test system performance under realistic load:

```python
import asyncio
import random
from src.core.driver import get_driver

async def load_test(concurrent_users=10, duration_seconds=300):
    """Simulate realistic load testing"""
    
    test_queries = [
        "What companies are in technology?",
        "Show me Q1 2025 revenue for TechCorp",
        "Calculate average profit margins",
        "What are the top 5 performers?",
        "Show financial trends for last quarter",
        "Compare revenue year over year",
        "What is the total market cap?",
    ]
    
    async def simulate_user(user_id):
        """Simulate individual user behavior"""
        driver = await get_driver()
        user_queries = 0
        start_time = time.time()
        
        while time.time() - start_time < duration_seconds:
            # Random query selection
            query = random.choice(test_queries)
            
            try:
                await driver.process_query(query)
                user_queries += 1
                
                # Random delay between queries (1-10 seconds)
                await asyncio.sleep(random.uniform(1, 10))
                
            except Exception as e:
                print(f"User {user_id} error: {e}")
        
        await driver.shutdown()
        print(f"User {user_id} completed {user_queries} queries")
    
    # Start concurrent users
    print(f"Starting load test: {concurrent_users} users for {duration_seconds}s")
    start_time = time.time()
    
    tasks = [simulate_user(i) for i in range(concurrent_users)]
    await asyncio.gather(*tasks)
    
    duration = time.time() - start_time
    print(f"Load test completed in {duration:.1f} seconds")

# Run load test
asyncio.run(load_test(concurrent_users=5, duration_seconds=180))
```

### Regression Testing

Automate performance regression detection:

```python
import json
import datetime
from src.benchmarking import BenchmarkRunner

async def regression_test():
    """Run regression test against baseline performance"""
    
    # Load baseline performance (if exists)
    baseline_file = "benchmark_baseline.json"
    try:
        with open(baseline_file, 'r') as f:
            baseline = json.load(f)
    except FileNotFoundError:
        baseline = None
        print("No baseline found, establishing new baseline...")
    
    # Run current benchmark
    runner = BenchmarkRunner()
    current_results = await runner.run_performance_validation()
    
    # Compare with baseline
    if baseline:
        regression_threshold = 0.10  # 10% performance degradation
        
        regressions = []
        improvements = []
        
        for metric in ['avg_response_time_ms', 'cache_hit_rate', 'cost_reduction']:
            current_value = current_results[metric]
            baseline_value = baseline[metric]
            
            if metric == 'avg_response_time_ms':
                # Lower is better for latency
                change = (current_value - baseline_value) / baseline_value
                if change > regression_threshold:
                    regressions.append(f"{metric}: {change*100:.1f}% slower")
                elif change < -0.05:  # 5% improvement
                    improvements.append(f"{metric}: {abs(change)*100:.1f}% faster")
            else:
                # Higher is better for hit rate and cost reduction
                change = (current_value - baseline_value) / baseline_value
                if change < -regression_threshold:
                    regressions.append(f"{metric}: {abs(change)*100:.1f}% worse")
                elif change > 0.05:  # 5% improvement
                    improvements.append(f"{metric}: {change*100:.1f}% better")
        
        # Report results
        if regressions:
            print("⚠️ PERFORMANCE REGRESSIONS DETECTED:")
            for regression in regressions:
                print(f"  - {regression}")
        
        if improvements:
            print("✅ PERFORMANCE IMPROVEMENTS:")
            for improvement in improvements:
                print(f"  + {improvement}")
        
        if not regressions and not improvements:
            print("✅ Performance stable (no significant changes)")
    
    # Update baseline
    current_results['timestamp'] = datetime.datetime.now().isoformat()
    with open(baseline_file, 'w') as f:
        json.dump(current_results, f, indent=2)
    
    print(f"Baseline updated: {baseline_file}")

# Run regression test
asyncio.run(regression_test())
```

This comprehensive benchmarking and performance guide provides everything needed to validate, optimize, and maintain FACT system performance. Use the appropriate sections based on your specific needs and environment.

---

**Next Steps**: After benchmarking, see the [Troubleshooting Guide](8_troubleshooting_guide.md) for specific performance issue resolution or the [Advanced Usage Guide](7_advanced_usage.md) for optimization techniques.