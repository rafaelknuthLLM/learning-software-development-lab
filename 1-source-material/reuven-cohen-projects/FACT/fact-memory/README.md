# FACT Memory System

A comprehensive memory management system for the FACT SDK that implements Mem0-inspired capabilities using prompt caching techniques instead of vector databases.

## Overview

The FACT Memory System provides persistent, context-aware memory capabilities that leverage Claude's prompt caching for efficient storage and retrieval of conversational context, user preferences, and behavioral patterns.

## Key Features

- **Prompt Cache-Based Storage**: Uses FACT's existing cache infrastructure instead of vector databases
- **User-Scoped Memory**: Isolates memories by user ID for privacy and personalization
- **Semantic Search**: Implements intelligent memory retrieval based on query relevance
- **Memory Types**: Supports various memory categories (preferences, facts, context, behavior)
- **MCP Integration**: Provides MCP server compatibility for external tool access
- **Performance Optimized**: Built on FACT's high-performance caching layer

## Architecture

The system consists of several key components:

- **Memory Manager**: Core memory storage and retrieval engine
- **Memory Models**: Data structures for different memory types
- **Search Engine**: Semantic search and ranking capabilities
- **MCP Server**: External API compatibility layer
- **Cache Integration**: Leverages FACT's existing cache infrastructure

## Documentation Structure

- [`docs/`](docs/) - Detailed documentation and guides
- [`architecture/`](architecture/) - System architecture and design documents
- [`api-specs/`](api-specs/) - API specifications and schemas
- [`examples/`](examples/) - Usage examples and integration guides

## Quick Start

See the [Installation Guide](docs/installation.md) and [Quick Start Guide](docs/quickstart.md) for getting started with the FACT Memory System.

## Comparison with Mem0

| Feature | Mem0 | FACT Memory |
|---------|------|-------------|
| Storage Backend | Vector Database | Prompt Cache |
| Memory Persistence | Database | Cache + Optional Persistence |
| Search Method | Vector Similarity | Semantic + LLM-based |
| Performance | Vector Lookups | Cache Hits (90%+ faster) |
| Integration | Standalone MCP | FACT SDK Integrated |
| Memory Types | Unstructured | Structured + Typed |

## License

This project follows the same license as the FACT SDK.