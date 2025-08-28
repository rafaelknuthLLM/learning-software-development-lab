# FACT System - Installation and Setup Guide

## Prerequisites

Before installing FACT, ensure your system meets the following requirements:

### System Requirements

**Operating System**
- Linux (Ubuntu 18.04+, CentOS 7+)
- macOS (10.14+)
- Windows 10/11 (with WSL2 recommended)

**Software Dependencies**
- Python 3.8 or higher (Python 3.11+ recommended)
- Git (for source code management)
- Internet connection (for API access and package installation)

**Hardware Requirements**
- **Minimum**: 2GB RAM, 1GB storage, single-core CPU
- **Recommended**: 4GB RAM, 5GB storage, multi-core CPU

### API Keys

You'll need the following API keys:

1. **Anthropic API Key**
   - Sign up at [console.anthropic.com](https://console.anthropic.com)
   - Create an API key with Claude access
   - Billing account required for production use

2. **Arcade API Key**
   - Register at [arcade.dev](https://arcade.dev)
   - Create a new project and generate API key
   - Free tier available for development

## Installation

### Method 1: Quick Installation (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/your-org/fact-system.git
cd fact-system

# 2. Run the automated setup
chmod +x scripts/setup.sh
./scripts/setup.sh
```

The setup script will:
- Create a Python virtual environment
- Install all dependencies
- Generate configuration template
- Initialize the database with sample data

### Method 2: Manual Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/fact-system.git
cd fact-system

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Install FACT package in development mode
pip install -e .
```

### Method 3: Docker Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/fact-system.git
cd fact-system

# 2. Build Docker image
docker build -t fact-system .

# 3. Run with Docker Compose
docker-compose up -d
```

## Configuration

### Environment Setup

1. **Create Configuration File**
```bash
# Copy the example configuration
cp .env.example .env

# Edit the configuration file
nano .env
```

2. **Required Configuration**
```bash
# API Keys (Required)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ARCADE_API_KEY=your_arcade_api_key_here

# Database Configuration
DATABASE_PATH=data/fact_demo.db

# Claude Model Configuration
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# Cache Configuration
CACHE_PREFIX=fact_v1
CACHE_TTL=3600

# Performance Configuration
MAX_RETRIES=3
REQUEST_TIMEOUT=30

# Logging Configuration
LOG_LEVEL=INFO
LOG_FILE=logs/fact.log
```

3. **Optional Configuration**
```bash
# Advanced Cache Settings
CACHE_MAX_SIZE=1000
CACHE_WARMING_ENABLED=true
CACHE_WARMING_QUERIES=["What is Q1 revenue?", "Show me company list"]

# Security Settings
ENABLE_QUERY_VALIDATION=true
MAX_QUERY_LENGTH=1000
ALLOWED_SQL_OPERATIONS=["SELECT"]

# Performance Tuning
CONNECTION_POOL_SIZE=10
CONCURRENT_QUERIES_LIMIT=50
QUERY_TIMEOUT=30

# Monitoring Settings
METRICS_ENABLED=true
METRICS_RETENTION_DAYS=30
HEALTH_CHECK_INTERVAL=60
```

### API Key Configuration

#### Anthropic API Key Setup

1. **Get Your API Key**
   - Visit [console.anthropic.com](https://console.anthropic.com)
   - Sign in or create an account
   - Navigate to "API Keys" section
   - Click "Create Key" and copy the key

2. **Test API Key**
```bash
# Test Anthropic connection
python -c "
import os
from anthropic import Anthropic
client = Anthropic(api_key='your_key_here')
print('Anthropic API: Connected successfully')
"
```

#### Arcade API Key Setup

1. **Get Your API Key**
   - Visit [arcade.dev](https://arcade.dev)
   - Create an account and new project
   - Navigate to "API Keys" and generate a key

2. **Test API Key**
```bash
# Test Arcade connection
python -c "
from arcade import Arcade
client = Arcade(api_key='your_key_here')
print('Arcade API: Connected successfully')
"
```

## Database Initialization

### Automatic Initialization

```bash
# Initialize with sample data
python main.py init
```

This command will:
- Create SQLite database file
- Set up schema with tables for companies and financial records
- Insert sample data (5 companies with multi-quarter financial data)
- Validate database integrity

### Manual Database Setup

```bash
# 1. Create database directory
mkdir -p data

# 2. Run database creation script
python -c "
from src.db.connection import create_database
create_database('data/fact_demo.db')
"

# 3. Import sample data
sqlite3 data/fact_demo.db < db/seed.sql
```

### Database Schema

The system creates the following tables:

**Companies Table**
```sql
CREATE TABLE companies (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    symbol TEXT UNIQUE NOT NULL,
    sector TEXT NOT NULL,
    founded_year INTEGER,
    employees INTEGER,
    market_cap REAL
);
```

**Financial Records Table**
```sql
CREATE TABLE financial_records (
    id INTEGER PRIMARY KEY,
    company_id INTEGER NOT NULL,
    quarter TEXT NOT NULL,
    year INTEGER NOT NULL,
    revenue REAL NOT NULL,
    profit REAL NOT NULL,
    expenses REAL NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies (id)
);
```

## Verification

### System Validation

```bash
# Run comprehensive system check
python main.py validate
```

Expected output:
```
✅ Environment configuration: Valid
✅ API keys: Connected
✅ Database: Initialized and populated
✅ Tools: Registered and available
✅ Cache: Configured and operational
✅ System: Ready for use
```

### Quick Test

```bash
# Run the demo to test all components
python main.py demo
```

This will:
- Process several test queries
- Demonstrate caching behavior
- Show tool execution
- Display performance metrics

### Individual Component Tests

```bash
# Test database connection
python -c "
from src.db.connection import get_connection
conn = get_connection()
print('Database: Connected')
conn.close()
"

# Test tool registration
python -c "
from src.tools.registry import get_tool_registry
registry = get_tool_registry()
print(f'Tools registered: {len(registry.list_tools())}')
"

# Test cache functionality
python -c "
from src.cache.manager import CacheManager
cache = CacheManager()
print('Cache: Operational')
"
```

## Troubleshooting

### Common Installation Issues

#### Python Version Issues
```bash
# Check Python version
python --version

# If version is too old, install newer Python
# On Ubuntu/Debian:
sudo apt update && sudo apt install python3.11

# On macOS with Homebrew:
brew install python@3.11

# On Windows:
# Download from python.org
```

#### Dependency Installation Failures
```bash
# Upgrade pip first
pip install --upgrade pip

# Install dependencies with verbose output
pip install -r requirements.txt --verbose

# For specific package issues:
pip install --no-cache-dir package_name
```

#### Permission Issues
```bash
# On Linux/macOS, if permission denied:
sudo chown -R $USER:$USER .
chmod +x scripts/setup.sh

# Use virtual environment to avoid system conflicts:
python -m venv venv
source venv/bin/activate
```

### Common Configuration Issues

#### API Key Problems
```bash
# Verify API keys are set
python main.py validate

# Common issues:
# 1. Keys not in .env file
# 2. Trailing spaces in keys
# 3. Wrong key format
# 4. Insufficient API credits
```

#### Database Issues
```bash
# Reset database if corrupted
rm data/fact_demo.db
python main.py init

# Check database permissions
ls -la data/
# Should show read/write permissions for your user
```

#### Network Connectivity
```bash
# Test internet connection
curl -I https://api.anthropic.com
curl -I https://api.arcade.dev

# Check firewall settings if in corporate environment
```

### Performance Optimization

#### Memory Usage
```bash
# Monitor memory usage
python -c "
import psutil
import os
process = psutil.Process(os.getpid())
print(f'Memory usage: {process.memory_info().rss / 1024 / 1024:.1f} MB')
"
```

#### Cache Optimization
```bash
# Warm cache with common queries
python -c "
from src.cache.warming import warm_cache
warm_cache([
    'What is TechCorp revenue?',
    'Show me all technology companies',
    'What are the quarterly results?'
])
"
```

## Next Steps

Once installation is complete:

1. **Start the CLI**: `python main.py cli`
2. **Explore User Guide**: Read [User Guide](4_user_guide.md)
3. **Review API Documentation**: See [API Reference](5_api_reference.md)
4. **Check Security Guidelines**: Review [Security Best Practices](docs/security-guidelines.md)

## Getting Help

If you encounter issues:

1. **Check Logs**: `tail -f logs/fact.log`
2. **Run Diagnostics**: `python main.py validate`
3. **Review Documentation**: Complete guides in [`docs/`](.) directory
4. **Contact Support**: Create an issue with logs and error details

---

**Installation complete!** Continue to the [Core Concepts Guide](3_core_concepts.md) to understand how FACT works.