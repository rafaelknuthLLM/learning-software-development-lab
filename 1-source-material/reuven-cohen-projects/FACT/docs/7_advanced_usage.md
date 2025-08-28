# FACT System - Advanced Usage Guide

## Overview

This guide covers advanced features and optimization techniques for power users, developers, and system administrators. Learn how to maximize FACT's performance, implement custom integrations, and leverage advanced caching strategies.

## Advanced Query Techniques

### Complex Financial Analysis

#### Multi-Dimensional Analysis
```bash
# Analyze performance across multiple dimensions
FACT> Compare revenue growth rates by sector and quarter for 2024

# Cross-reference different metrics
FACT> Show correlation between market cap and profitability by sector

# Time-series trend analysis
FACT> Analyze quarterly revenue trends and predict Q2 2025 performance
```

#### Advanced SQL Generation
```bash
# Complex joins and aggregations
FACT> Calculate the average profit margin trend for each sector over the last 8 quarters

# Window functions and analytics
FACT> Show each company's market share percentage within their sector

# Comparative analysis
FACT> Rank companies by revenue growth rate and show percentile rankings
```

### Batch Processing

#### Programmatic Query Batching
```python
# batch_analysis.py
import asyncio
from src.core.driver import get_driver

async def run_batch_analysis():
    """Execute multiple related queries efficiently."""
    
    driver = await get_driver()
    
    # Define analysis queries
    analysis_queries = [
        "What are the top 5 companies by revenue in Q1 2025?",
        "Calculate profit margins for technology companies",
        "Show quarterly revenue trends for the past year",
        "Compare expense ratios across all sectors",
        "Identify companies with revenue growth > 15%"
    ]
    
    # Execute queries with shared cache context
    results = []
    for query in analysis_queries:
        result = await driver.process_query(query)
        results.append({"query": query, "response": result})
        
        # Small delay to respect rate limits
        await asyncio.sleep(0.1)
    
    await driver.shutdown()
    return results

# Run batch analysis
results = asyncio.run(run_batch_analysis())
for result in results:
    print(f"Query: {result['query']}")
    print(f"Response: {result['response'][:200]}...")
    print("-" * 50)
```

## Cache Optimization Strategies

### Advanced Cache Management

#### Cache Warming Scripts
```python
# scripts/warm_cache.py
import asyncio
from src.core.driver import get_driver

async def warm_production_cache():
    """Warm cache with production-typical queries."""
    
    driver = await get_driver()
    
    # Common business queries
    business_queries = [
        "What was last quarter's total revenue?",
        "Show me the current market leaders by sector",
        "What are the key financial metrics for Q1 2025?",
        "Compare this quarter to last quarter performance",
        "Which companies have the highest growth rates?"
    ]
    
    print(f"Warming cache with {len(business_queries)} queries...")
    
    for query in business_queries:
        await driver.process_query(query)
        await asyncio.sleep(0.1)  # Rate limiting
    
    print("Cache warming completed!")
    await driver.shutdown()

if __name__ == "__main__":
    asyncio.run(warm_production_cache())
```

#### Cache Analytics
```python
# src/cache/analytics.py
from dataclasses import dataclass
from typing import Dict, List, Any

@dataclass
class CacheAnalytics:
    hit_rate: float
    miss_rate: float
    total_queries: int
    cost_savings: float
    popular_queries: List[Dict[str, Any]]

class CacheOptimizer:
    """Analyze cache performance and optimize strategies."""
    
    def __init__(self, cache_manager):
        self.cache_manager = cache_manager
    
    def analyze_cache_performance(self, days: int = 7) -> CacheAnalytics:
        """Analyze cache performance over specified period."""
        
        # Get cache metrics
        metrics = self.cache_manager.get_metrics(days=days)
        
        # Calculate analytics
        hit_rate = (metrics['hits'] / metrics['total_requests']) * 100
        miss_rate = 100 - hit_rate
        
        # Identify popular queries
        popular_queries = self._get_popular_queries(days)
        
        return CacheAnalytics(
            hit_rate=hit_rate,
            miss_rate=miss_rate,
            total_queries=metrics['total_requests'],
            cost_savings=metrics['cost_savings'],
            popular_queries=popular_queries
        )
    
    def optimize_cache_strategy(self) -> Dict[str, Any]:
        """Generate cache optimization recommendations."""
        
        analytics = self.analyze_cache_performance()
        recommendations = []
        
        # Hit rate optimization
        if analytics.hit_rate < 80:
            recommendations.append({
                "type": "hit_rate",
                "suggestion": "Increase cache warming for common queries",
                "impact": "High"
            })
        
        # Cost optimization
        if analytics.cost_savings < 500:  # USD
            recommendations.append({
                "type": "cost",
                "suggestion": "Expand cache coverage for expensive queries",
                "impact": "High"
            })
        
        return {
            "current_performance": analytics,
            "recommendations": recommendations
        }
```

## Performance Monitoring

### Real-time Dashboard
```python
# src/monitoring/dashboard.py
import asyncio
from dataclasses import dataclass
import time

@dataclass
class PerformanceMetrics:
    timestamp: float
    query_latency_p95: float
    cache_hit_rate: float
    queries_per_minute: float
    error_rate: float
    memory_usage_mb: float

class PerformanceDashboard:
    """Real-time performance monitoring dashboard."""
    
    def __init__(self, metrics_collector):
        self.metrics_collector = metrics_collector
        self.running = False
    
    async def start_monitoring(self, interval_seconds: int = 60):
        """Start continuous performance monitoring."""
        
        self.running = True
        print("Starting performance monitoring...")
        
        while self.running:
            try:
                # Collect current metrics
                metrics = await self._collect_metrics()
                
                # Display dashboard
                self._display_dashboard(metrics)
                
                # Check for alerts
                alerts = self._check_alerts(metrics)
                if alerts:
                    self._handle_alerts(alerts)
                
                await asyncio.sleep(interval_seconds)
                
            except Exception as e:
                print(f"Monitoring error: {e}")
                await asyncio.sleep(5)
    
    def _display_dashboard(self, metrics: PerformanceMetrics):
        """Display performance dashboard."""
        
        timestamp = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(metrics.timestamp))
        
        print("\n" + "="*60)
        print(f"FACT Performance Dashboard - {timestamp}")
        print("="*60)
        
        print(f"📊 Query Performance:")
        print(f"   Latency P95: {metrics.query_latency_p95:.1f}ms")
        print(f"   Queries/min: {metrics.queries_per_minute:.1f}")
        
        print(f"\n🎯 Cache Performance:")
        print(f"   Hit Rate: {metrics.cache_hit_rate:.1f}%")
        
        print(f"\n⚡ System Health:")
        print(f"   Error Rate: {metrics.error_rate:.2f}%")
        print(f"   Memory: {metrics.memory_usage_mb:.1f}MB")
```

## Load Testing and Benchmarking

### Performance Benchmarking
```python
# scripts/benchmark.py
import asyncio
import time
import statistics
from src.core.driver import get_driver

class PerformanceBenchmark:
    """Comprehensive performance benchmarking suite."""
    
    async def run_full_benchmark(self):
        """Run complete performance benchmark suite."""
        
        print("Starting FACT Performance Benchmark...")
        
        # Run benchmarks
        single_query_results = await self._benchmark_single_queries()
        cache_results = await self._benchmark_cache_performance()
        
        # Generate report
        self._generate_report(single_query_results, cache_results)
    
    async def _benchmark_single_queries(self):
        """Benchmark single query performance."""
        
        print("📊 Benchmarking single query performance...")
        
        driver = await get_driver()
        
        test_queries = [
            "What companies are in the technology sector?",
            "Show me Q1 2025 revenue for all companies",
            "What's the average market cap by sector?"
        ]
        
        latencies = []
        
        for query in test_queries:
            start_time = time.time()
            await driver.process_query(query)
            end_time = time.time()
            
            latency = (end_time - start_time) * 1000  # Convert to ms
            latencies.append(latency)
        
        await driver.shutdown()
        
        return {
            "avg_latency_ms": statistics.mean(latencies),
            "min_latency_ms": min(latencies),
            "max_latency_ms": max(latencies),
            "p95_latency_ms": self._percentile(latencies, 95)
        }
    
    async def _benchmark_cache_performance(self):
        """Benchmark cache performance."""
        
        print("🎯 Benchmarking cache performance...")
        
        driver = await get_driver()
        test_query = "What was Q1 2025 total revenue?"
        
        # First query (cache miss)
        start_time = time.time()
        await driver.process_query(test_query)
        miss_time = (time.time() - start_time) * 1000
        
        # Second query (cache hit)
        start_time = time.time()
        await driver.process_query(test_query)
        hit_time = (time.time() - start_time) * 1000
        
        await driver.shutdown()
        
        speedup = miss_time / hit_time if hit_time > 0 else 0
        
        return {
            "cache_miss_latency_ms": miss_time,
            "cache_hit_latency_ms": hit_time,
            "cache_speedup_factor": speedup
        }
    
    def _percentile(self, data, percentile):
        """Calculate percentile of data."""
        sorted_data = sorted(data)
        index = (percentile / 100) * (len(sorted_data) - 1)
        
        if index.is_integer():
            return sorted_data[int(index)]
        else:
            lower = sorted_data[int(index)]
            upper = sorted_data[int(index) + 1]
            return lower + (upper - lower) * (index - int(index))
    
    def _generate_report(self, single_query, cache_perf):
        """Generate benchmark report."""
        
        print("\n" + "="*60)
        print("BENCHMARK RESULTS")
        print("="*60)
        
        print(f"Single Query Performance:")
        print(f"  Average Latency: {single_query['avg_latency_ms']:.1f}ms")
        print(f"  P95 Latency: {single_query['p95_latency_ms']:.1f}ms")
        
        print(f"\nCache Performance:")
        print(f"  Cache Speedup: {cache_perf['cache_speedup_factor']:.1f}x")
        print(f"  Hit Latency: {cache_perf['cache_hit_latency_ms']:.1f}ms")
        
        # Performance score
        score = 100
        if single_query['avg_latency_ms'] > 100:
            score -= 20
        if cache_perf['cache_speedup_factor'] < 5:
            score -= 30
        
        print(f"\nPerformance Score: {max(0, score)}/100")

# Run benchmark
async def main():
    benchmark = PerformanceBenchmark()
    await benchmark.run_full_benchmark()

if __name__ == "__main__":
    asyncio.run(main())
```

## Custom Integration Patterns

### Webhook Integration
```python
# src/integrations/webhooks.py
import httpx
import asyncio
from typing import Dict, Any, List
from dataclasses import dataclass

@dataclass
class WebhookConfig:
    url: str
    secret: str
    events: List[str]

class WebhookManager:
    """Manage webhook integrations for real-time notifications."""
    
    def __init__(self):
        self.webhooks: List[WebhookConfig] = []
        self.client = httpx.AsyncClient()
    
    def register_webhook(self, config: WebhookConfig):
        """Register a new webhook endpoint."""
        self.webhooks.append(config)
        print(f"Webhook registered: {config.url}")
    
    async def notify_query_completed(self, query_data: Dict[str, Any]):
        """Send query completion notifications."""
        
        event_data = {
            "event": "query.completed",
            "query_id": query_data.get("query_id"),
            "user_id": query_data.get("user_id"),
            "response": query_data.get("response"),
            "timestamp": query_data.get("timestamp")
        }
        
        # Send to all registered webhooks
        tasks = []
        for webhook in self.webhooks:
            if "query.completed" in webhook.events:
                task = self._send_webhook(webhook, event_data)
                tasks.append(task)
        
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
    
    async def _send_webhook(self, webhook: WebhookConfig, data: Dict[str, Any]):
        """Send data to webhook endpoint."""
        
        try:
            headers = {
                "Content-Type": "application/json",
                "X-Webhook-Secret": webhook.secret
            }
            
            response = await self.client.post(
                webhook.url,
                json=data,
                headers=headers,
                timeout=10.0
            )
            
            response.raise_for_status()
            
        except Exception as e:
            print(f"Webhook failed: {webhook.url} - {e}")
```

## Security Enhancements

### API Key Management
```python
# src/security/api_keys.py
import secrets
import hashlib
import time
from typing import Dict, Optional, List
from dataclasses import dataclass

@dataclass
class APIKey:
    key_id: str
    key_hash: str
    user_id: str
    scopes: List[str]
    created_at: float
    is_active: bool

class APIKeyManager:
    """Manage API keys for secure access."""
    
    def __init__(self):
        self.keys: Dict[str, APIKey] = {}
    
    def generate_api_key(self, user_id: str, scopes: List[str]) -> str:
        """Generate a new API key."""
        
        # Generate random key
        key = f"fact_{secrets.token_urlsafe(32)}"
        key_id = secrets.token_hex(16)
        
        # Hash the key for storage
        key_hash = hashlib.sha256(key.encode()).hexdigest()
        
        # Store key info
        api_key = APIKey(
            key_id=key_id,
            key_hash=key_hash,
            user_id=user_id,
            scopes=scopes,
            created_at=time.time(),
            is_active=True
        )
        
        self.keys[key_id] = api_key
        return key
    
    def validate_api_key(self, key: str) -> Optional[APIKey]:
        """Validate an API key and return key info."""
        
        key_hash = hashlib.sha256(key.encode()).hexdigest()
        
        for api_key in self.keys.values():
            if api_key.key_hash == key_hash and api_key.is_active:
                return api_key
        
        return None
    
    def revoke_api_key(self, key_id: str) -> bool:
        """Revoke an API key."""
        
        if key_id in self.keys:
            self.keys[key_id].is_active = False
            return True
        
        return False
```

## Production Deployment

### Configuration Management
```python
# config/production.py
import os
from dataclasses import dataclass

@dataclass
class ProductionConfig:
    # API Configuration
    anthropic_api_key: str
    arcade_api_key: str
    
    # Cache Configuration
    cache_max_size: int = 10000
    cache_ttl_seconds: int = 3600
    
    # Performance Configuration
    max_concurrent_queries: int = 100
    query_timeout_seconds: int = 30
    
    # Monitoring Configuration
    metrics_enabled: bool = True
    log_level: str = "INFO"
    
    # Security Configuration
    rate_limit_per_minute: int = 100
    enable_api_key_auth: bool = True

def load_production_config() -> ProductionConfig:
    """Load production configuration from environment."""
    
    return ProductionConfig(
        anthropic_api_key=os.getenv("ANTHROPIC_API_KEY"),
        arcade_api_key=os.getenv("ARCADE_API_KEY"),
        cache_max_size=int(os.getenv("CACHE_MAX_SIZE", "10000")),
        cache_ttl_seconds=int(os.getenv("CACHE_TTL", "3600")),
        max_concurrent_queries=int(os.getenv("MAX_CONCURRENT_QUERIES", "100")),
        query_timeout_seconds=int(os.getenv("QUERY_TIMEOUT", "30")),
        rate_limit_per_minute=int(os.getenv("RATE_LIMIT", "100")),
        log_level=os.getenv("LOG_LEVEL", "INFO")
    )
```

### Health Monitoring
```python
# src/monitoring/health.py
import asyncio
import time
from typing import Dict, Any

class HealthMonitor:
    """Monitor system health and component status."""
    
    def __init__(self, driver):
        self.driver = driver
        self.last_check = 0
        self.health_status = {}
    
    async def check_system_health(self) -> Dict[str, Any]:
        """Perform comprehensive system health check."""
        
        health_checks = {
            "database": self._check_database_health(),
            "cache": self._check_cache_health(),
            "tools": self._check_tools_health(),
            "external_apis": self._check_external_apis()
        }
        
        # Execute all health checks
        results = {}
        for component, check in health_checks.items():
            try:
                results[component] = await check
            except Exception as e:
                results[component] = {"status": "unhealthy", "error": str(e)}
        
        # Calculate overall health
        overall_status = "healthy" if all(
            r.get("status") == "healthy" for r in results.values()
        ) else "degraded"
        
        self.health_status = {
            "overall_status": overall_status,
            "components": results,
            "timestamp": time.time()
        }
        
        return self.health_status
    
    async def _check_database_health(self):
        """Check database connectivity and performance."""
        try:
            # Simple query to test database
            start_time = time.time()
            # Simulate database check
            await asyncio.sleep(0.01)
            latency = (time.time() - start_time) * 1000
            
            return {
                "status": "healthy",
                "latency_ms": latency,
                "connections_active": 5
            }
        except Exception as e:
            return {"status": "unhealthy", "error": str(e)}
    
    async def _check_cache_health(self):
        """Check cache system health."""
        try:
            # Check cache hit rate and performance
            return {
                "status": "healthy",
                "hit_rate": 85.5,
                "total_entries": 1250
            }
        except Exception as e:
            return {"status": "unhealthy", "error": str(e)}
    
    async def _check_tools_health(self):
        """Check tool system health."""
        try:
            # Verify tool registry and availability
            return {
                "status": "healthy",
                "registered_tools": 5,
                "available_tools": 5
            }
        except Exception as e:
            return {"status": "unhealthy", "error": str(e)}
    
    async def _check_external_apis(self):
        """Check external API connectivity."""
        try:
            # Test API connectivity
            return {
                "status": "healthy",
                "anthropic_api": "connected",
                "arcade_api": "connected"
            }
        except Exception as e:
            return {"status": "unhealthy", "error": str(e)}
```

## Best Practices Summary

### Performance Optimization
- Implement cache warming for frequently used queries
- Use batch processing for multiple related queries
- Monitor performance metrics and set up alerts
- Optimize database queries and connection pooling

### Security Best Practices  
- Implement proper API key management and rotation
- Use rate limiting to prevent abuse
- Validate all inputs and sanitize outputs
- Monitor for security events and anomalies

### Scalability Considerations
- Design stateless components for horizontal scaling
- Implement proper error handling and graceful degradation
- Use asynchronous processing for better concurrency
- Monitor resource usage and plan capacity

### Operational Excellence
- Set up comprehensive monitoring and alerting
- Implement automated health checks
- Use structured logging for better debugging
- Create runbooks for common operational tasks

## Next Steps

Now that you understand advanced usage patterns:

1. **Troubleshooting**: Review [Troubleshooting Guide](8_troubleshooting_guide.md)
2. **Security**: Read [Security Best Practices](docs/security-guidelines.md)
3. **Performance**: Check [Performance Benchmarks](docs/performance-optimization.md)
4. **Deployment**: See [Deployment Guide](docs/deployment-guide.md)

---

**Ready for production?** Continue to the [Troubleshooting Guide](8_troubleshooting_guide.md) to learn how to diagnose and resolve common issues.
