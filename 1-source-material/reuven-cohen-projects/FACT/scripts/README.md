# FACT System Scripts

This directory contains scripts for initializing, testing, and demonstrating the FACT system.

## Scripts Overview

### 🚀 init_environment.py
**Purpose**: Complete environment setup and system initialization

**What it does**:
- Creates `.env` file with default configuration
- Initializes SQLite database with schema and sample data
- Validates system connectivity (if API keys configured)

**Usage**:
```bash
python scripts/init_environment.py
```

**Output**:
- `.env` file with configuration template
- `data/fact_demo.db` with sample financial data
- Validation of system components

### 🎭 demo_lifecycle.py
**Purpose**: Demonstrate complete user request lifecycle

**What it does**:
- Shows system initialization and component integration
- Demonstrates database connectivity and schema inspection
- Executes sample queries through the tool framework
- Shows monitoring and metrics collection
- Tests error handling and fallback mechanisms
- Simulates cache behavior

**Usage**:
```bash
python scripts/demo_lifecycle.py
```

**Requirements**: 
- Environment must be initialized first
- API keys should be configured in `.env` file

## Quick Start

1. **Initialize the environment**:
   ```bash
   python scripts/init_environment.py
   ```

2. **Update API keys in `.env` file**:
   ```bash
   # Edit .env file and add your actual API keys
   ANTHROPIC_API_KEY=your_actual_key_here
   ARCADE_API_KEY=your_actual_key_here
   ```

3. **Run the demo**:
   ```bash
   python scripts/demo_lifecycle.py
   ```

4. **Start the interactive CLI**:
   ```bash
   python -m src.core.cli
   ```

## Sample Commands

Once the system is running, try these sample queries:

- `"What's TechCorp's Q1 2025 revenue?"`
- `"Show me all companies in the Technology sector"`
- `"Compare revenue trends across companies"`
- `"What's the average profit margin for 2024?"`

## System Commands

In the CLI interface, use these commands:

- `help` - Show available commands
- `status` - Show system status
- `tools` - List available tools
- `schema` - Show database schema
- `samples` - Show sample queries
- `metrics` - Show performance metrics
- `exit` - Exit the system

## Troubleshooting

### Environment Issues
- **Missing API keys**: Update `.env` file with valid API keys
- **Database errors**: Delete `data/fact_demo.db` and re-run initialization
- **Import errors**: Ensure you're running from the project root directory

### Performance Issues
- **Slow queries**: Check database indexes in schema
- **Memory usage**: Monitor metrics for high tool execution counts
- **Connection timeouts**: Adjust `REQUEST_TIMEOUT` in `.env`

### Integration Issues
- **Tool not found**: Verify tool registration in driver initialization
- **Cache misses**: Check cache prefix configuration
- **Monitoring gaps**: Ensure metrics collector is properly initialized

## Development

### Adding New Scripts
1. Create script in `scripts/` directory
2. Add proper imports for `src/` modules
3. Include error handling and logging
4. Update this README with usage instructions

### Testing Scripts
Run individual components:
```bash
# Test database only
python -c "import sys; sys.path.insert(0, 'src'); from db.connection import DatabaseManager; import asyncio; asyncio.run(DatabaseManager('data/test.db').initialize_database())"

# Test tools only
python -c "import sys; sys.path.insert(0, 'src'); from tools.decorators import get_tool_registry; print(get_tool_registry().list_tools())"

# Test config only
python -c "import sys; sys.path.insert(0, 'src'); from core.config import get_config; print(get_config().to_dict())"