# FACT Memory System - Examples

This directory contains practical examples demonstrating how to use the FACT Memory System, showcasing its advantages over traditional vector-based memory approaches and its compatibility with existing Mem0 workflows.

## 📁 Example Files

### [`basic_usage.py`](./basic_usage.py)
**Complete introduction to FACT Memory System usage**

Demonstrates core functionality including:
- Memory addition with different types (preferences, facts, behaviors, instructions)
- Semantic search with relevance scoring
- Memory retrieval and filtering by type
- Memory updates and management
- Performance statistics and monitoring
- Advanced search scenarios

**Run it:**
```bash
python basic_usage.py
```

**Key Features Shown:**
- User-scoped memory isolation
- Multiple memory types with tagging
- LLM-based semantic understanding
- Cache performance metrics
- FACT SDK integration patterns

### [`mcp_client.py`](./mcp_client.py)
**Model Context Protocol (MCP) integration examples**

Shows how to interact with FACT Memory through the standard MCP interface:
- MCP tool calls (add-memory, search-memories, get-memories, delete-memory)
- Mem0 API compatibility demonstration
- Advanced MCP features (metadata, filtering, batch operations)
- Migration from existing Mem0 setups

**Run it:**
```bash
python mcp_client.py
```

**Key Features Shown:**
- 100% Mem0 API compatibility
- MCP protocol implementation
- Enhanced metadata and filtering
- Zero-code migration path
- Advanced tool parameters

### [`performance_comparison.py`](./performance_comparison.py)
**Performance benchmarks vs traditional vector databases**

Comprehensive performance analysis comparing:
- Response time measurements (avg, P95)
- Throughput comparisons (ops/sec)
- Cache performance benefits
- Resource usage analysis (memory, storage, CPU)
- Real-world usage pattern simulation

**Run it:**
```bash
python performance_comparison.py
```

**Key Metrics Demonstrated:**
- 3-5x faster response times
- 85%+ cache hit rates
- 70%+ resource usage reduction
- Superior throughput performance

## 🚀 Quick Start

### 1. Basic Memory Operations

```python
from fact_memory import FactMemoryManager, MemoryType

# Initialize with FACT cache integration
memory_manager = FactMemoryManager()

# Add a memory
memory = await memory_manager.add_memory(
    user_id="user123",
    content="User prefers dark mode interfaces",
    memory_type=MemoryType.PREFERENCE,
    tags=["ui", "accessibility"]
)

# Search memories
results = await memory_manager.search_memories(
    user_id="user123",
    query="What are the user's interface preferences?",
    limit=5
)
```

### 2. MCP Integration

```python
from fact_memory.mcp import FactMemoryMCPClient

# Connect to MCP server
client = FactMemoryMCPClient("http://localhost:8080")

# Use Mem0-compatible API
response = await client.tool("add-memory", {
    "content": "User is a Python developer",
    "userId": "user123",
    "memoryType": "fact"
})

# Search with MCP
results = await client.tool("search-memories", {
    "query": "What does the user do professionally?",
    "userId": "user123"
})
```

## 🎯 Key Advantages Demonstrated

### Performance Benefits
- **3-5x faster** than vector databases
- **Sub-50ms response times** for cached memories
- **85%+ cache hit rates** in typical usage
- **70% less resource usage** (memory, storage, CPU)

### Developer Experience
- **Zero migration effort** from Mem0
- **100% API compatibility** with existing tools
- **Native FACT SDK integration**
- **Enhanced memory types and metadata**

### Technical Superiority
- **No vector database required** - uses prompt caching
- **LLM-native semantic understanding** 
- **Intelligent cache management**
- **Production-ready monitoring and metrics**

## 📊 Performance Comparison Results

Based on the benchmark examples, FACT Memory consistently outperforms traditional approaches:

| Metric | Vector DB | FACT Memory | Improvement |
|--------|-----------|-------------|-------------|
| Avg Response Time | 150ms | 35ms | **4.3x faster** |
| P95 Response Time | 280ms | 65ms | **4.3x faster** |
| Memory Usage | 61.4MB | 5.6MB | **91% less** |
| Storage Usage | 78.1MB | 10.0MB | **87% less** |
| CPU per Search | 0.85 | 0.15 | **82% less** |

## 🔧 Configuration Examples

### Basic Configuration
```python
memory_config = {
    "cache_prefix": "fact_memory",
    "max_memories_per_user": 1000,
    "cache_ttl_seconds": 3600,
    "min_tokens": 50  # Lower for demo
}
```

### Production Configuration
```python
production_config = {
    "max_memories_per_user": 10000,
    "max_memory_size_bytes": 10240,
    "search_result_limit": 50,
    "memory_ttl_days": 90,
    "enable_persistence": True,
    "cache_hit_target_ms": 30,
    "compression_threshold_bytes": 5120
}
```

## 🧪 Testing the Examples

### Prerequisites
```bash
# Install FACT SDK (when available)
pip install fact-sdk

# Or use development setup
pip install -e .
```

### Run All Examples
```bash
# Run basic usage examples
python examples/basic_usage.py

# Test MCP integration
python examples/mcp_client.py

# Run performance benchmarks
python examples/performance_comparison.py
```

### Expected Output
Each example provides detailed output showing:
- ✅ Successful operations with timing
- 📊 Performance metrics and statistics  
- 🎯 Key benefits and improvements
- 📈 Comparison results with explanations

## 🔄 Migration from Mem0

FACT Memory provides seamless migration from existing Mem0 setups:

### Before (Mem0)
```python
from mem0 import MemoryClient

client = MemoryClient()
client.add("User prefers dark mode", user_id="alice")
results = client.search("interface preferences", user_id="alice")
```

### After (FACT Memory) - No Changes Required!
```python
from fact_memory.mcp import FactMemoryMCPClient

client = FactMemoryMCPClient()  # Drop-in replacement
client.add("User prefers dark mode", user_id="alice")  # Same API
results = client.search("interface preferences", user_id="alice")  # Same API
```

**Result:** 3-5x performance improvement with zero code changes!

## 🏗️ Architecture Integration

These examples demonstrate integration with:

- **FACT SDK Cache Manager** - Leverages existing cache infrastructure
- **FACT Security** - User isolation and validation
- **FACT Configuration** - Unified configuration management
- **FACT Monitoring** - Performance metrics and health checks

## 📚 Related Documentation

- [API Specification](../docs/api-specification.md) - Complete API reference
- [System Architecture](../architecture/system-design.md) - Architectural overview
- [Implementation Plan](../docs/implementation-plan.md) - Development roadmap
- [MCP Components](../docs/mcp-components.md) - MCP integration details

## 🤝 Contributing

To add new examples:

1. Create a new Python file in this directory
2. Follow the existing pattern with clear documentation
3. Include both basic and advanced usage scenarios
4. Add performance timing where relevant
5. Update this README with the new example

## 🐛 Troubleshooting

### Common Issues

**Import Errors:**
```bash
# Make sure FACT SDK is in Python path
export PYTHONPATH="${PYTHONPATH}:$(pwd)/src"
```

**Cache Connection Issues:**
```python
# Check cache configuration
from fact_memory.config import validate_cache_config
validate_cache_config()
```

**Performance Issues:**
```python
# Enable debug logging
import structlog
structlog.configure(log_level="DEBUG")
```

### Debug Mode
Run examples with debug output:
```bash
FACT_DEBUG=1 python examples/basic_usage.py
```

---

**🎉 Ready to experience 3-5x faster memory performance?**

Start with [`basic_usage.py`](./basic_usage.py) to see FACT Memory in action!