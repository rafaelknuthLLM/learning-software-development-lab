# FACT System - Troubleshooting and FAQ Guide

## Overview

This guide provides solutions to common issues, diagnostic procedures, and frequently asked questions. Use this as your first resource when encountering problems with the FACT system.

## Quick Diagnostic Commands

### System Health Check
```bash
# Run comprehensive system validation
python main.py validate

# Check system status in CLI
FACT> status

# View recent logs
tail -f logs/fact.log

# Check metrics and performance
FACT> metrics
```

### Configuration Verification
```bash
# Verify environment configuration
python -c "
from src.core.config import load_config
config = load_config()
print('Configuration loaded successfully')
print(f'Database: {config.database_path}')
print(f'Cache prefix: {config.cache_prefix}')
"

# Test API connections
python -c "
from src.core.driver import test_api_connections
import asyncio
asyncio.run(test_api_connections())
"
```

## Common Issues and Solutions

### Installation and Setup Issues

#### Issue: Python Version Compatibility
**Symptoms:**
- Import errors during installation
- Syntax errors in code
- Module compatibility warnings

**Solution:**
```bash
# Check Python version
python --version

# Must be 3.8 or higher. If not:
# Install Python 3.11 (recommended)

# On Ubuntu/Debian:
sudo apt update && sudo apt install python3.11 python3.11-venv

# On macOS with Homebrew:
brew install python@3.11

# On Windows: Download from python.org

# Create new virtual environment with correct Python
python3.11 -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

#### Issue: Dependency Installation Failures
**Symptoms:**
- `pip install` fails with compilation errors
- Missing system dependencies
- Package version conflicts

**Solution:**
```bash
# Update pip and setuptools first
pip install --upgrade pip setuptools wheel

# Install system dependencies (Ubuntu/Debian)
sudo apt-get install build-essential python3-dev

# Install system dependencies (macOS)
xcode-select --install

# Clear pip cache if needed
pip cache purge

# Install with verbose output to see specific errors
pip install -r requirements.txt --verbose

# For specific package issues, try:
pip install --no-cache-dir package_name
```

#### Issue: Permission Denied Errors
**Symptoms:**
- Cannot create database files
- Log file creation fails
- Directory access errors

**Solution:**
```bash
# Fix ownership issues (Linux/macOS)
sudo chown -R $USER:$USER /path/to/fact

# Set proper permissions
chmod 755 /path/to/fact
chmod -R 644 /path/to/fact/data
chmod -R 644 /path/to/fact/logs

# Create directories if missing
mkdir -p data logs output

# On Windows, run as Administrator or check folder permissions
```

### API and Authentication Issues

#### Issue: Invalid API Keys
**Symptoms:**
- "Authentication failed" errors
- "Invalid API key" messages
- 401 Unauthorized responses

**Diagnostic:**
```bash
# Check if API keys are set
python -c "
import os
print('Anthropic key set:', bool(os.getenv('ANTHROPIC_API_KEY')))
print('Arcade key set:', bool(os.getenv('ARCADE_API_KEY')))
"

# Test API key validity
python -c "
from anthropic import Anthropic
import os
try:
    client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
    print('Anthropic API: Valid')
except Exception as e:
    print(f'Anthropic API Error: {e}')
"
```

**Solution:**
```bash
# 1. Verify API keys in .env file
cat .env | grep API_KEY

# 2. Ensure no trailing spaces or quotes
# Wrong: ANTHROPIC_API_KEY="your_key_here"
# Correct: ANTHROPIC_API_KEY=your_key_here

# 3. Regenerate keys if needed
# - Visit console.anthropic.com for Anthropic
# - Visit arcade.dev for Arcade

# 4. Check API key permissions and billing
# - Ensure sufficient credits
# - Verify key has required scopes
```

#### Issue: Rate Limiting
**Symptoms:**
- "Rate limit exceeded" errors
- 429 HTTP status codes
- Temporary API unavailability

**Solution:**
```bash
# Check current rate limits
FACT> metrics

# Implement exponential backoff in scripts
python -c "
import asyncio
import random

async def with_retry(func, max_retries=3):
    for attempt in range(max_retries):
        try:
            return await func()
        except RateLimitError:
            if attempt == max_retries - 1:
                raise
            wait_time = (2 ** attempt) + random.uniform(0, 1)
            await asyncio.sleep(wait_time)
"

# Reduce concurrent queries
# Edit .env file:
# MAX_CONCURRENT_QUERIES=10
# REQUEST_TIMEOUT=60
```

### Database Issues

#### Issue: Database Connection Failures
**Symptoms:**
- "Database locked" errors
- Connection timeout errors
- Corrupted database files

**Diagnostic:**
```bash
# Check database file exists and is accessible
ls -la data/fact_demo.db

# Test database connection
python -c "
import sqlite3
try:
    conn = sqlite3.connect('data/fact_demo.db')
    cursor = conn.execute('SELECT COUNT(*) FROM companies')
    count = cursor.fetchone()[0]
    print(f'Database OK: {count} companies found')
    conn.close()
except Exception as e:
    print(f'Database Error: {e}')
"

# Check database integrity
sqlite3 data/fact_demo.db "PRAGMA integrity_check;"
```

**Solution:**
```bash
# For locked database:
# 1. Stop all FACT processes
pkill -f "python main.py"

# 2. Remove lock files
rm -f data/fact_demo.db-*

# 3. Restart FACT
python main.py cli

# For corrupted database:
# 1. Backup current database
cp data/fact_demo.db data/fact_demo.db.backup

# 2. Reinitialize database
rm data/fact_demo.db
python main.py init

# 3. If you had custom data, restore from backup
```

#### Issue: Missing Sample Data
**Symptoms:**
- Empty query results
- "No companies found" messages
- Database schema exists but no data

**Solution:**
```bash
# Reinitialize with sample data
python main.py init --force

# Or manually seed the database
sqlite3 data/fact_demo.db < db/seed.sql

# Verify data was loaded
sqlite3 data/fact_demo.db "
SELECT 'Companies: ' || COUNT(*) FROM companies;
SELECT 'Financial records: ' || COUNT(*) FROM financial_records;
"
```

### Cache and Performance Issues

#### Issue: Poor Cache Performance
**Symptoms:**
- Low cache hit rates (<60%)
- Slow query responses
- High API costs

**Diagnostic:**
```bash
# Check cache metrics
FACT> metrics

# Look for:
# - Cache hit rate (should be >80%)
# - Cache size and utilization
# - Average response times
```

**Solution:**
```bash
# 1. Warm cache with common queries
python -c "
import asyncio
from src.core.driver import get_driver

async def warm_cache():
    driver = await get_driver()
    common_queries = [
        'What companies are in the technology sector?',
        'Show me Q1 2025 revenue for all companies',
        'What are the key financial metrics?'
    ]
    for query in common_queries:
        await driver.process_query(query)
    await driver.shutdown()

asyncio.run(warm_cache())
"

# 2. Increase cache size (edit .env)
CACHE_MAX_SIZE=5000
CACHE_TTL=7200

# 3. Clear and rebuild cache
python main.py --clear-cache
python main.py cli
```

#### Issue: Memory Usage Problems
**Symptoms:**
- High memory consumption
- Out of memory errors
- System slowdown

**Diagnostic:**
```bash
# Monitor memory usage
python -c "
import psutil
import os
process = psutil.Process(os.getpid())
memory_mb = process.memory_info().rss / 1024 / 1024
print(f'Current memory usage: {memory_mb:.1f} MB')
"

# Check cache memory usage
FACT> metrics
# Look for cache memory utilization
```

**Solution:**
```bash
# 1. Reduce cache size
# Edit .env:
CACHE_MAX_SIZE=1000

# 2. Implement cache cleanup
python -c "
from src.cache.manager import CacheManager
cache = CacheManager()
cache.cleanup_expired()
cache.evict_lru(keep_count=500)
"

# 3. Restart with fresh cache
python main.py --clear-cache cli
```

### Tool Execution Issues

#### Issue: Tool Registration Failures
**Symptoms:**
- "Tool not found" errors
- Missing tools in tool list
- Tool execution failures

**Diagnostic:**
```bash
# List registered tools
python -c "
from src.tools.registry import get_tool_registry
registry = get_tool_registry()
tools = registry.list_tools()
print(f'Registered tools: {tools}')
for tool_name in tools:
    tool = registry.get_tool(tool_name)
    print(f'  {tool_name}: {tool.description}')
"

# Check tool schemas
FACT> tools
```

**Solution:**
```bash
# 1. Re-register tools
python -c "
from src.core.driver import get_driver
import asyncio

async def reregister_tools():
    driver = await get_driver()
    await driver._initialize_tools()
    await driver.shutdown()

asyncio.run(reregister_tools())
"

# 2. Check tool implementation
# Ensure tools are properly decorated with @Tool

# 3. Verify Arcade connection
python -c "
from src.arcade.client import ArcadeClient
import asyncio

async def test_arcade():
    client = ArcadeClient()
    try:
        result = await client.list_tools()
        print(f'Arcade tools: {result}')
    except Exception as e:
        print(f'Arcade error: {e}')
    await client.close()

asyncio.run(test_arcade())
"
```

#### Issue: SQL Tool Execution Errors
**Symptoms:**
- SQL syntax errors
- Permission denied errors
- Query timeout errors

**Solution:**
```bash
# 1. Test SQL tool directly
python -c "
from src.tools.connectors.sql import query_readonly
result = query_readonly('SELECT COUNT(*) as count FROM companies')
print(f'SQL test result: {result}')
"

# 2. Check SQL query validation
# Ensure queries start with SELECT
# Avoid dangerous keywords (DROP, DELETE, etc.)

# 3. Increase query timeout
# Edit .env:
QUERY_TIMEOUT=60
```

## Network and Connectivity Issues

### Issue: Internet Connectivity Problems
**Symptoms:**
- Connection timeout errors
- DNS resolution failures
- Proxy or firewall blocks

**Diagnostic:**
```bash
# Test internet connectivity
curl -I https://api.anthropic.com
curl -I https://api.arcade.dev

# Test DNS resolution
nslookup api.anthropic.com
nslookup api.arcade.dev

# Check proxy settings
echo $HTTP_PROXY
echo $HTTPS_PROXY
```

**Solution:**
```bash
# 1. Configure proxy if needed (edit .env)
HTTP_PROXY=http://proxy.company.com:8080
HTTPS_PROXY=http://proxy.company.com:8080

# 2. Update firewall rules to allow:
# - api.anthropic.com (port 443)
# - api.arcade.dev (port 443)

# 3. For corporate networks, contact IT for API access
```

### Issue: SSL/TLS Certificate Errors
**Symptoms:**
- Certificate verification failures
- SSL handshake errors
- HTTPS connection issues

**Solution:**
```bash
# Update certificates (Ubuntu/Debian)
sudo apt-get update && sudo apt-get install ca-certificates

# Update certificates (macOS)
brew install ca-certificates

# For development only (not recommended for production):
# Disable SSL verification in requests
export PYTHONHTTPSVERIFY=0
```

## Performance Optimization

### Slow Query Performance
**Issue:** Queries taking too long to respond

**Diagnostic:**
```bash
# Check query performance
FACT> metrics

# Time individual queries
time python main.py cli --query "What companies are in technology?"

# Profile query execution
python -c "
import cProfile
import asyncio
from src.core.driver import get_driver

async def profile_query():
    driver = await get_driver()
    await driver.process_query('Show me all companies')
    await driver.shutdown()

cProfile.run('asyncio.run(profile_query())')
"
```

**Solutions:**
1. **Enable caching:** Ensure cache is properly configured
2. **Optimize queries:** Use specific rather than broad queries
3. **Database indexing:** Add indexes for frequently queried columns
4. **Connection pooling:** Increase database connection pool size

### High Resource Usage
**Issue:** FACT consuming too much CPU/memory

**Diagnostic:**
```bash
# Monitor resource usage
top -p $(pgrep -f "python main.py")

# Check file descriptors
lsof -p $(pgrep -f "python main.py") | wc -l

# Memory profiling
python -m memory_profiler main.py cli
```

**Solutions:**
1. **Reduce concurrency:** Lower MAX_CONCURRENT_QUERIES
2. **Clean up connections:** Ensure proper connection cleanup
3. **Memory limits:** Set cache size limits
4. **Garbage collection:** Force garbage collection periodically

## Security Issues

### Unauthorized Access
**Issue:** Suspicious access patterns or unauthorized usage

**Diagnostic:**
```bash
# Check access logs
grep "401\|403\|suspicious" logs/fact.log

# Monitor API key usage
python -c "
from src.security.audit import get_audit_logs
logs = get_audit_logs(hours=24)
for log in logs:
    print(f'{log.timestamp}: {log.event_type} - {log.user_id}')
"
```

**Solutions:**
1. **Rotate API keys:** Generate new keys and revoke old ones
2. **Enable rate limiting:** Reduce limits for suspicious IPs
3. **Audit access:** Review all API key usage
4. **Update security:** Patch any security vulnerabilities

### Data Exposure
**Issue:** Concerns about data privacy or leakage

**Solutions:**
1. **Review logs:** Ensure no sensitive data in logs
2. **Check caching:** Verify cache doesn't store sensitive data
3. **Audit queries:** Review query history for appropriate usage
4. **Access controls:** Implement proper user permissions

## Frequently Asked Questions (FAQ)

### General Usage

**Q: How do I improve query response times?**
A: 
1. Use cache warming for common queries
2. Be specific in your queries rather than asking broad questions  
3. Check cache hit rates with `FACT> metrics`
4. Ensure good internet connectivity to APIs

**Q: Can I use FACT with my own database?**
A: Yes, you can modify the database connection settings in `src/db/connection.py` to point to your database. Ensure you update the tool configurations accordingly.

**Q: How much does it cost to run FACT?**
A: Costs depend on API usage:
- Anthropic API: ~$0.01-0.03 per query (varies by model and response length)
- Arcade API: Check current pricing at arcade.dev
- Cache typically reduces costs by 70-90%

**Q: Can I run FACT offline?**
A: FACT requires internet connectivity for Claude and Arcade APIs. However, cached responses can be served even during temporary network outages.

### Technical Questions

**Q: How do I add custom tools?**
A: See the [Tool Creation Guide](6_tool_creation_guide.md) for detailed instructions on creating and registering custom tools.

**Q: Can I modify the database schema?**
A: Yes, but you'll need to:
1. Update the schema in `db/schema.sql`
2. Modify the tool connectors to handle new fields
3. Update any hardcoded queries in the tools
4. Re-initialize the database

**Q: How do I backup my data?**
A: 
```bash
# Backup database
cp data/fact_demo.db backups/fact_demo_$(date +%Y%m%d).db

# Backup logs
tar -czf backups/logs_$(date +%Y%m%d).tar.gz logs/

# Backup configuration
cp .env backups/env_$(date +%Y%m%d).backup
```

**Q: Can I scale FACT horizontally?**
A: FACT is designed to be stateless. You can run multiple instances behind a load balancer, but you'll need:
1. Shared cache layer (Redis/Memcached)
2. Shared database (PostgreSQL/MySQL)
3. Load balancer configuration
4. Session management

### Error Messages

**Q: "Cache unavailable" error - what does this mean?**
A: The cache system is temporarily unavailable. FACT will fall back to direct API calls. Check cache configuration and restart if needed.

**Q: "Tool execution timeout" - how to fix?**
A: Increase timeout settings in .env file:
```bash
QUERY_TIMEOUT=60
TOOL_EXECUTION_TIMEOUT=30
```

**Q: "Database locked" error keeps appearing**
A: Multiple processes are trying to access SQLite simultaneously. Stop all FACT processes and restart:
```bash
pkill -f "python main.py"
python main.py cli
```

### Performance Questions

**Q: What's a good cache hit rate?**
A: Target 80%+ cache hit rate. Check with `FACT> metrics`. If lower:
1. Warm cache with common queries
2. Increase cache size
3. Review query patterns

**Q: How many queries per minute can FACT handle?**
A: Depends on:
- Cache hit rate (cached queries: 1000+/min)
- API rate limits (typically 100-200/min)  
- System resources
- Query complexity

**Q: How do I monitor FACT performance?**
A: Use built-in monitoring:
```bash
# Real-time metrics
FACT> metrics

# Performance dashboard
python scripts/monitor_performance.py

# Log analysis
tail -f logs/fact.log | grep "performance"
```

## Getting Additional Help

### Log Analysis
```bash
# View recent errors
grep "ERROR\|CRITICAL" logs/fact.log | tail -20

# Check performance issues
grep "slow\|timeout\|latency" logs/fact.log | tail -20

# Monitor real-time logs
tail -f logs/fact.log
```

### Debug Mode
```bash
# Run in debug mode for verbose output
LOG_LEVEL=DEBUG python main.py cli

# Enable debug logging in .env
LOG_LEVEL=DEBUG
DEBUG_MODE=true
```

### Support Resources
1. **Documentation**: Complete guides in `docs/` directory
2. **Examples**: Sample code in `examples/` directory  
3. **Issues**: Report bugs with detailed logs and steps to reproduce
4. **Community**: Join discussions for tips and solutions

### Creating Support Requests
When requesting help, please include:
1. **System info**: OS, Python version, FACT version
2. **Error logs**: Relevant log entries with timestamps
3. **Configuration**: Sanitized .env file (remove API keys)
4. **Steps to reproduce**: Exact steps that cause the issue
5. **Expected vs actual behavior**: What should happen vs what actually happens

---

**Still having issues?** Check the complete documentation suite starting with the [Project Overview](1_overview_project.md) or create a support request with detailed information about your problem.