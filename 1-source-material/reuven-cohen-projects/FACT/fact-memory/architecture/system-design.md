# FACT Memory System Architecture

## System Overview

The FACT Memory System is designed as a high-performance, prompt cache-based memory management solution that integrates seamlessly with the existing FACT SDK infrastructure.

## Architectural Principles

### 1. Cache-First Design
- **Primary Storage**: Prompt cache for active memories
- **Secondary Storage**: Optional persistent storage for long-term memories
- **Performance**: Sub-50ms access times for cached memories

### 2. User-Centric Isolation
- **User Scoping**: All memories isolated by user ID
- **Security**: Strict access controls and validation
- **Privacy**: GDPR/CCPA compliant data handling

### 3. LLM-Native Semantics
- **Semantic Understanding**: LLM-based relevance scoring
- **Context Awareness**: Natural language memory retrieval
- **Intelligence**: Dynamic memory importance ranking

### 4. FACT SDK Integration
- **Infrastructure Reuse**: Leverages existing cache, config, and security
- **Consistent Patterns**: Follows FACT architectural patterns
- **Modular Design**: Clean separation of concerns

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FACT Memory System                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   MCP Server    │  │   Memory API    │  │   Tools     │ │
│  │   (External)    │  │   (Internal)    │  │ Integration │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Memory Manager  │  │ Search Engine   │  │   Memory    │ │
│  │  (Core Logic)   │  │  (Semantic)     │  │   Models    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│           FACT SDK Infrastructure Layer                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Cache Manager   │  │   Security      │  │    Config   │ │
│  │   (Storage)     │  │  (Validation)   │  │ (Settings)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Memory Manager

**Responsibility**: Core memory operations and lifecycle management

```python
class MemoryManager:
    def add_memory(self, user_id: str, content: str, memory_type: MemoryType) -> MemoryEntry
    def search_memories(self, user_id: str, query: str, limit: int = 10) -> List[MemoryEntry]
    def get_memory(self, user_id: str, memory_id: str) -> Optional[MemoryEntry]
    def delete_memory(self, user_id: str, memory_id: str) -> bool
    def get_user_memories(self, user_id: str) -> List[MemoryEntry]
```

**Features**:
- Memory CRUD operations
- User isolation enforcement
- Cache integration
- Memory validation
- Lifecycle management

### 2. Memory Models

**Responsibility**: Data structures and type definitions

```python
@dataclass
class MemoryEntry:
    id: str
    user_id: str
    content: str
    memory_type: MemoryType
    relevance_score: float
    created_at: float
    last_accessed: Optional[float]
    access_count: int
    tags: List[str]
    metadata: Dict[str, Any]

class MemoryType(Enum):
    PREFERENCE = "preference"
    FACT = "fact"
    CONTEXT = "context"
    BEHAVIOR = "behavior"
    INSTRUCTION = "instruction"
```

### 3. Search Engine

**Responsibility**: Semantic search and memory ranking

```python
class MemorySearchEngine:
    def search(self, user_id: str, query: str, memory_type: Optional[MemoryType] = None) -> List[MemoryEntry]
    def rank_memories(self, memories: List[MemoryEntry], query: str) -> List[MemoryEntry]
    def calculate_relevance(self, memory: MemoryEntry, query: str) -> float
    def extract_keywords(self, text: str) -> List[str]
```

**Features**:
- LLM-based semantic scoring
- Multi-factor ranking (relevance, recency, frequency)
- Query optimization
- Result filtering and sorting

### 4. MCP Server

**Responsibility**: External API compatibility layer

```python
class FactMemoryMCPServer:
    def add_memory(self, content: str, user_id: str) -> MCPResponse
    def search_memories(self, query: str, user_id: str) -> MCPResponse
    def get_memories(self, user_id: str) -> MCPResponse
    def delete_memory(self, memory_id: str, user_id: str) -> MCPResponse
```

**Features**:
- Mem0-compatible API
- Standard MCP protocol implementation
- Request/response validation
- Error handling and logging

## Data Flow

### Memory Addition Flow

```
User Request → MCP Server → Memory Manager → Cache Manager → Storage
     ↓
Validation → Content Processing → Memory Entry Creation → Cache Store
     ↓
Response ← Confirmation ← Entry Metadata ← Success Status
```

### Memory Search Flow

```
Search Query → MCP Server → Memory Manager → Search Engine
     ↓
Cache Lookup → Memory Filtering → Semantic Ranking → Result Assembly
     ↓
Response ← Formatted Results ← Ranked Memories ← Relevance Scores
```

## Storage Strategy

### Cache Layer Structure

```
Cache Namespace: fact_memory:{user_id}
├── memories:{memory_type}:{memory_id}  # Individual memories
├── index:{user_id}                     # User memory index
├── search:{query_hash}                 # Search result cache
└── metadata:{user_id}                  # User memory metadata
```

### Memory Cache Entry

```python
{
    "cache_key": "fact_memory:user123:memories:preference:mem_456",
    "content": {
        "memory_entry": MemoryEntry(...),
        "search_keywords": ["dark", "mode", "interface"],
        "related_memories": ["mem_789", "mem_012"]
    },
    "token_count": 150,
    "created_at": 1640995200.0,
    "version": "1.0"
}
```

## Performance Optimization

### Caching Strategy

1. **Hot Memory Cache**: Frequently accessed memories in fast cache
2. **Search Result Cache**: Cached search results for common queries
3. **Index Cache**: User memory indexes for fast enumeration
4. **Metadata Cache**: Memory statistics and user quotas

### Memory Lifecycle

1. **Active Phase**: Recently accessed memories (high priority cache)
2. **Warm Phase**: Occasionally accessed memories (standard cache)
3. **Cold Phase**: Rarely accessed memories (compressed storage)
4. **Archive Phase**: Old memories (optional persistent storage)

### Intelligent Preloading

```python
class MemoryPreloader:
    def preload_user_context(self, user_id: str) -> None
    def predict_memory_needs(self, user_id: str, context: str) -> List[str]
    def warm_related_memories(self, memory_id: str) -> None
```

## Security Architecture

### Access Control

```python
class MemorySecurityManager:
    def validate_user_access(self, user_id: str, memory_id: str) -> bool
    def sanitize_memory_content(self, content: str) -> str
    def check_user_quota(self, user_id: str) -> bool
    def audit_memory_access(self, user_id: str, action: str, memory_id: str) -> None
```

### Data Protection

1. **Input Validation**: Content sanitization and size limits
2. **User Isolation**: Strict namespace separation
3. **Access Logging**: Comprehensive audit trails
4. **Content Encryption**: Optional memory content encryption
5. **Rate Limiting**: Protection against abuse

## Configuration

### Memory Configuration

```python
memory_config = {
    "max_memories_per_user": 1000,
    "max_memory_size_bytes": 10240,
    "search_result_limit": 50,
    "memory_ttl_days": 90,
    "cache_prefix": "fact_memory",
    "enable_persistence": True,
    "encryption_enabled": False
}
```

### Performance Configuration

```python
performance_config = {
    "cache_hit_target_ms": 30,
    "search_target_ms": 100,
    "max_concurrent_searches": 10,
    "preload_threshold": 0.8,
    "compression_threshold_bytes": 5120
}
```

## Error Handling

### Error Types

```python
class MemoryError(Exception):
    """Base memory system error"""

class UserQuotaExceededError(MemoryError):
    """User memory quota exceeded"""

class MemoryNotFoundError(MemoryError):
    """Requested memory not found"""

class InvalidMemoryContentError(MemoryError):
    """Memory content validation failed"""

class SearchError(MemoryError):
    """Memory search operation failed"""
```

### Error Recovery

1. **Graceful Degradation**: Fallback to basic search if semantic search fails
2. **Cache Rebuilding**: Automatic cache reconstruction on corruption
3. **User Notification**: Clear error messages for user-facing issues
4. **Logging**: Comprehensive error logging for debugging

## Monitoring and Metrics

### Key Metrics

```python
memory_metrics = {
    "total_memories": 0,
    "memories_per_user": {},
    "search_requests_per_second": 0,
    "average_search_latency_ms": 0,
    "cache_hit_rate": 0.0,
    "memory_storage_utilization": 0.0
}
```

### Performance Monitoring

1. **Response Times**: Track all operation latencies
2. **Cache Performance**: Monitor hit rates and eviction patterns
3. **User Activity**: Track memory creation and access patterns
4. **Resource Usage**: Monitor memory and CPU consumption
5. **Error Rates**: Track error frequencies and types

## Scalability Considerations

### Horizontal Scaling

1. **User Partitioning**: Distribute users across cache instances
2. **Load Balancing**: Request distribution across memory servers
3. **Cache Sharding**: Partition memory cache by user ID ranges
4. **Search Distribution**: Parallel search across memory partitions

### Vertical Scaling

1. **Memory Optimization**: Efficient memory representation
2. **Cache Tuning**: Optimized cache sizes and eviction policies
3. **Index Optimization**: Efficient memory indexing strategies
4. **Compression**: Memory content compression for storage efficiency

## Integration Points

### FACT SDK Integration

```python
# Configuration integration
memory_config = fact_config.memory_config

# Cache integration
memory_cache = fact_cache_manager.get_namespace("memory")

# Security integration
memory_security = fact_security.get_memory_validator()

# Monitoring integration
memory_metrics = fact_monitoring.register_memory_metrics()
```

### External Integration

```python
# MCP Server
mcp_server = FactMemoryMCPServer(memory_manager)

# REST API
memory_api = FactMemoryAPI(memory_manager)

# Tool Integration
memory_tools = FactMemoryTools(memory_manager)
```

## Future Enhancements

### Phase 2 Features

1. **Memory Compression**: Automatic summarization of old memories
2. **Cross-User Insights**: Anonymized pattern analysis
3. **Memory Clustering**: Automatic memory categorization
4. **Predictive Loading**: ML-based memory preloading

### Phase 3 Features

1. **Federated Memories**: Cross-system memory sharing
2. **Memory Analytics**: Advanced usage analytics
3. **AI Memory Curation**: Automatic memory importance scoring
4. **Real-time Sync**: Multi-device memory synchronization

This architectural design provides a solid foundation for building a high-performance, scalable memory system that leverages the strengths of the FACT SDK while providing Mem0-compatible functionality.