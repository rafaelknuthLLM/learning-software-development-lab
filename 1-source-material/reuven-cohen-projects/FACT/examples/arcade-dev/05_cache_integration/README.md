# Cache Integration Example

This example demonstrates advanced caching strategies for Arcade.dev integration with the FACT SDK.

## Features

- **Hybrid Caching**: Multi-level caching with memory and persistent storage
- **Cache Strategies**: Multiple configurable strategies (fast, persistent, secure)
- **Cache Optimization**: Automatic performance optimization and tuning
- **Performance Metrics**: Comprehensive cache performance tracking
- **Invalidation Patterns**: Flexible cache invalidation strategies

## Key Components

### CacheStrategy
Configurable cache strategies with different TTL, compression, and encryption options:
- `fast`: Low TTL with prefetching for frequently accessed data
- `persistent`: Long TTL with compression for stable data
- `secure`: Encrypted caching for sensitive data
- `default`: Balanced configuration for general use

### HybridCacheManager
Advanced cache manager supporting:
- Multi-level caching (memory + persistent)
- LRU eviction for memory cache
- Background prefetching
- Automatic optimization
- Compression and encryption

### Performance Tracking
- Hit/miss rates
- Response time metrics
- Cache size monitoring
- Error tracking

## Usage

```python
from cached_arcade_client import AdvancedArcadeClient
from src.cache.manager import CacheManager

# Initialize
cache_manager = CacheManager()
client = AdvancedArcadeClient("your_api_key", cache_manager)

# Use different strategies
result = await client.cached_operation(
    "code_analysis", 
    strategy="fast",
    code="def hello(): print('world')",
    language="python"
)

# Get performance analytics
analytics = client.get_cache_analytics()
print(f"Hit rate: {analytics['strategies']['fast']['hit_rate']:.1%}")
```

## Configuration

Cache strategies can be customized:

```python
strategy = CacheStrategy(
    strategy_name="custom",
    ttl_seconds=7200,
    max_entries=2000,
    compression_enabled=True,
    multi_level_caching=True,
    prefetch_enabled=True
)
```

## Performance Benefits

- **Cache Hits**: Sub-millisecond response times
- **Cache Misses**: Transparent fallback to API
- **Optimization**: Automatic tuning based on usage patterns
- **Resource Efficiency**: Compressed storage and memory management

## Running the Example

```bash
cd examples/arcade-dev/05_cache_integration
python cached_arcade_client.py
```

The demo will show:
1. Cache miss performance (first requests)
2. Cache hit performance (subsequent requests)
3. Different strategy behaviors
4. Performance analytics and optimization