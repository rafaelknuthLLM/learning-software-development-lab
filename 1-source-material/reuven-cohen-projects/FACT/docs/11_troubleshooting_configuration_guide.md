# FACT System - Troubleshooting and Configuration Guide

## Overview

This guide provides comprehensive troubleshooting for the FACT system, with specific focus on API key issues, configuration problems, and performance optimization. Use this as your primary resource for resolving system issues.

## Quick Diagnostic Commands

Start with these commands to identify issues quickly:

```bash
# Complete system health check
python main.py validate

# Check API connectivity
python -c "
import asyncio
from src.core.driver import test_api_connections
asyncio.run(test_api_connections())
"

# View system metrics
python main.py cli
# Then in CLI: metrics

# Check recent errors
tail -f logs/fact.log | grep "ERROR\|CRITICAL"
```

## API Key and Authentication Issues

### Issue: Invalid or Missing API Keys

**Symptoms**:
- "Authentication failed" errors
- "Invalid API key" messages
- 401 Unauthorized responses
- System fails validation

**Quick Diagnosis**:
```bash
# Check if API keys are set
python -c "
import os
print('Anthropic API key set:', bool(os.getenv('ANTHROPIC_API_KEY')))
print('Anthropic key length:', len(os.getenv('ANTHROPIC_API_KEY', '')))
print('Arcade API key set:', bool(os.getenv('ARCADE_API_KEY')))
print('Arcade key length:', len(os.getenv('ARCADE_API_KEY', '')))
"

# Check .env file format
cat .env | grep API_KEY
```

**Common Problems and Solutions**:

1. **API Keys Not Set**:
```bash
# Check if .env file exists
ls -la .env

# Create .env from template if missing
cp .env.example .env

# Edit .env file and add your keys
nano .env
```

2. **Incorrect Key Format**:
```bash
# Wrong (with quotes):
ANTHROPIC_API_KEY="sk-ant-api03-xxx"

# Correct (no quotes):
ANTHROPIC_API_KEY=sk-ant-api03-xxx

# Wrong (with spaces):
ANTHROPIC_API_KEY= sk-ant-api03-xxx

# Correct (no spaces):
ANTHROPIC_API_KEY=sk-ant-api03-xxx
```

3. **Key Validation Issues**:
```bash
# Test Anthropic API key directly
python -c "
from anthropic import Anthropic
import os
try:
    client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
    # Try a simple request
    response = client.messages.create(
        model='claude-3-5-sonnet-20241022',
        max_tokens=10,
        messages=[{'role': 'user', 'content': 'Hi'}]
    )
    print('✅ Anthropic API: Valid and working')
except Exception as e:
    print(f'❌ Anthropic API Error: {e}')
"

# Test Arcade API key
python -c "
from arcade import Arcade
import os
try:
    client = Arcade(api_key=os.getenv('ARCADE_API_KEY'))
    print('✅ Arcade API: Key format valid')
except Exception as e:
    print(f'❌ Arcade API Error: {e}')
"
```

4. **API Credit Issues**:
```bash
# Check Anthropic account credits at console.anthropic.com
# Check Arcade account status at arcade.dev

# If using free tier, you may hit limits quickly
# Consider upgrading to paid tier for production use
```

### Issue: Rate Limiting and API Quotas

**Symptoms**:
- "Rate limit exceeded" errors
- 429 HTTP status codes
- Intermittent API failures
- Slow response times

**Solutions**:

1. **Check Current Rate Limits**:
```bash
# View current API usage
python main.py cli
# In CLI: metrics

# Look for rate limiting indicators in logs
grep "rate\|429\|quota" logs/fact.log
```

2. **Implement Backoff Strategy**:
```bash
# Edit .env for more conservative API usage
MAX_CONCURRENT_QUERIES=10    # Reduce from default 50
REQUEST_TIMEOUT=60           # Increase timeout
MAX_RETRIES=5               # Increase retry attempts
RETRY_DELAY=2               # Add delay between retries
```

3. **Optimize API Usage with Caching**:
```python
# Aggressive cache warming to reduce API calls
import asyncio
from src.cache.warming import get_cache_warmer

async def reduce_api_usage():
    warmer = get_cache_warmer()
    
    # Warm cache extensively
    result = await warmer.warm_cache_intelligently(
        max_queries=100,
        concurrent=False,  # Sequential to avoid rate limits
        delay_between_queries=1.0  # 1 second delay
    )
    
    print(f"Cache warming: {result['cache_entries_created']} entries")
    print(f"Estimated API usage reduction: {result['estimated_cost_savings']:.1f}%")

asyncio.run(reduce_api_usage())
```

### Issue: Network and Connectivity Problems

**Symptoms**:
- Connection timeout errors
- DNS resolution failures
- SSL certificate errors
- Proxy or firewall blocks

**Diagnosis**:
```bash
# Test internet connectivity
curl -I https://api.anthropic.com
curl -I https://api.arcade.dev

# Test DNS resolution
nslookup api.anthropic.com
nslookup api.arcade.dev

# Check proxy settings
echo "HTTP_PROXY: $HTTP_PROXY"
echo "HTTPS_PROXY: $HTTPS_PROXY"
echo "NO_PROXY: $NO_PROXY"
```

**Solutions**:

1. **Configure Proxy Settings**:
```bash
# Add to .env file for corporate networks
HTTP_PROXY=http://proxy.company.com:8080
HTTPS_PROXY=http://proxy.company.com:8080
NO_PROXY=localhost,127.0.0.1

# Or set environment variables
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
```

2. **SSL Certificate Issues**:
```bash
# Update CA certificates (Ubuntu/Debian)
sudo apt-get update && sudo apt-get install ca-certificates

# Update CA certificates (macOS)
brew install ca-certificates

# For development only (not recommended for production)
export PYTHONHTTPSVERIFY=0
```

3. **Firewall Configuration**:
```bash
# Ensure these domains are accessible:
# - api.anthropic.com (port 443)
# - api.arcade.dev (port 443)
# - Any other external APIs your tools use

# Test specific ports
nc -zv api.anthropic.com 443
nc -zv api.arcade.dev 443
```

## Configuration Issues

### Issue: Database Configuration Problems

**Symptoms**:
- "Database locked" errors
- "No such table" errors
- Connection failures
- Missing sample data

**Diagnosis**:
```bash
# Check database file exists and permissions
ls -la data/fact_demo.db

# Test database connection
python -c "
import sqlite3
try:
    conn = sqlite3.connect('data/fact_demo.db')
    cursor = conn.execute('SELECT COUNT(*) FROM companies')
    count = cursor.fetchone()[0]
    print(f'✅ Database OK: {count} companies found')
    
    cursor = conn.execute('SELECT COUNT(*) FROM financial_records')
    records = cursor.fetchone()[0]
    print(f'✅ Financial records: {records} records found')
    
    conn.close()
except Exception as e:
    print(f'❌ Database Error: {e}')
"

# Check database integrity
sqlite3 data/fact_demo.db "PRAGMA integrity_check;"
```

**Solutions**:

1. **Database Locked Issues**:
```bash
# Stop all FACT processes
pkill -f "python main.py"

# Remove any lock files
rm -f data/fact_demo.db-*

# Fix permissions if needed
chmod 664 data/fact_demo.db
chown $USER:$USER data/fact_demo.db

# Restart FACT
python main.py cli
```

2. **Missing or Corrupted Database**:
```bash
# Backup existing database (if any)
cp data/fact_demo.db data/fact_demo.db.backup.$(date +%Y%m%d)

# Reinitialize database
rm data/fact_demo.db
python main.py init

# Verify initialization
python main.py validate
```

3. **Database Schema Issues**:
```bash
# Check current schema
sqlite3 data/fact_demo.db ".schema"

# If schema is wrong, reinitialize
python main.py init --force
```

### Issue: Environment Configuration Problems

**Symptoms**:
- "Configuration not found" errors
- Default values being used instead of custom settings
- Environment variables not loading

**Solutions**:

1. **Verify .env File Loading**:
```bash
# Check if .env exists and is readable
ls -la .env

# Test environment loading
python -c "
from src.core.config import load_config
try:
    config = load_config()
    print('✅ Configuration loaded successfully')
    print(f'Database path: {config.database_path}')
    print(f'Cache prefix: {config.cache_prefix}')
    print(f'Claude model: {config.claude_model}')
    print(f'Log level: {config.log_level}')
except Exception as e:
    print(f'❌ Configuration error: {e}')
"
```

2. **Fix Common Configuration Issues**:
```bash
# Ensure .env file has no BOM or special characters
file .env

# Check for Windows line endings (if on Linux/macOS)
dos2unix .env

# Validate .env syntax
python -c "
import os
from dotenv import load_dotenv
try:
    load_dotenv('.env')
    print('✅ .env file syntax is valid')
except Exception as e:
    print(f'❌ .env file error: {e}')
"
```

3. **Reset Configuration**:
```bash
# Backup current configuration
cp .env .env.backup.$(date +%Y%m%d)

# Reset to default template
cp .env.example .env

# Edit with your specific values
nano .env
```

### Issue: Tool Registration and Execution Problems

**Symptoms**:
- "Tool not found" errors
- Tool execution timeouts
- Missing tools in tool list
- Tool results formatting errors

**Diagnosis**:
```bash
# List currently registered tools
python -c "
from src.tools.registry import get_tool_registry
try:
    registry = get_tool_registry()
    tools = registry.list_tools()
    print(f'✅ Tools registered: {len(tools)}')
    for tool_name in tools:
        tool = registry.get_tool(tool_name)
        print(f'  - {tool_name}: {tool.description}')
except Exception as e:
    print(f'❌ Tool registry error: {e}')
"

# Test tool execution
python -c "
from src.tools.connectors.sql import query_readonly
try:
    result = query_readonly('SELECT COUNT(*) as company_count FROM companies')
    print(f'✅ SQL tool working: {result}')
except Exception as e:
    print(f'❌ SQL tool error: {e}')
"
```

**Solutions**:

1. **Re-register Tools**:
```bash
# Force tool re-registration
python -c "
import asyncio
from src.core.driver import get_driver

async def reregister_tools():
    try:
        driver = await get_driver()
        await driver._initialize_tools()
        print('✅ Tools re-registered successfully')
        await driver.shutdown()
    except Exception as e:
        print(f'❌ Tool registration error: {e}')

asyncio.run(reregister_tools())
"
```

2. **Test Arcade Gateway Connection**:
```bash
# Test Arcade connectivity
python -c "
import asyncio
from src.arcade.client import ArcadeClient

async def test_arcade():
    try:
        client = ArcadeClient()
        tools = await client.list_tools()
        print(f'✅ Arcade connection: {len(tools)} tools available')
        await client.close()
    except Exception as e:
        print(f'❌ Arcade connection error: {e}')

asyncio.run(test_arcade())
"
```

3. **Tool Timeout Issues**:
```bash
# Increase tool execution timeouts (edit .env)
TOOL_EXECUTION_TIMEOUT=60
QUERY_TIMEOUT=60
REQUEST_TIMEOUT=60
```

## Performance Issues

### Issue: Poor Cache Performance

**Symptoms**:
- Low cache hit rates (<60%)
- High response times
- Increased API costs

**Diagnosis**:
```bash
# Check current cache performance
python main.py cli
# In CLI: metrics

# Get detailed cache analysis
python -c "
from src.cache.manager import CacheManager
cache = CacheManager()
metrics = cache.get_metrics()

print(f'Cache Performance Analysis:')
print(f'  Hit Rate: {metrics.hit_rate:.1f}% (Target: ≥60%)')
print(f'  Total Entries: {metrics.total_entries}')
print(f'  Memory Usage: {metrics.memory_usage_mb:.1f} MB')
print(f'  Average Latency: {metrics.avg_latency_ms:.1f} ms')
print(f'  Utilization: {metrics.utilization:.1f}%')

if metrics.hit_rate < 60:
    print('❌ Cache hit rate below target - optimization needed')
else:
    print('✅ Cache hit rate meets target')
"
```

**Solutions**:

1. **Aggressive Cache Warming**:
```python
import asyncio
from src.cache.warming import get_cache_warmer

async def emergency_cache_optimization():
    warmer = get_cache_warmer()
    
    # Get current cache state
    from src.cache.manager import CacheManager
    cache = CacheManager()
    before_metrics = cache.get_metrics()
    
    print(f"Before optimization:")
    print(f"  Hit rate: {before_metrics.hit_rate:.1f}%")
    print(f"  Entries: {before_metrics.total_entries}")
    
    # Perform intelligent warming
    result = await warmer.warm_cache_intelligently(
        max_queries=100,
        concurrent=True,
        prioritize_categories=True
    )
    
    # Check improvement
    after_metrics = cache.get_metrics()
    print(f"\nAfter optimization:")
    print(f"  Hit rate: {after_metrics.hit_rate:.1f}%")
    print(f"  Entries: {after_metrics.total_entries}")
    print(f"  Improvement: {after_metrics.hit_rate - before_metrics.hit_rate:.1f}%")

asyncio.run(emergency_cache_optimization())
```

2. **Cache Configuration Optimization**:
```bash
# Edit .env for better cache performance
CACHE_MAX_SIZE=10000                    # Increase cache size
CACHE_TTL=14400                        # 4 hours TTL
CACHE_MEMORY_PRESSURE_THRESHOLD=0.9    # Allow higher utilization
CACHE_WARMING_ENABLED=true             # Enable automatic warming
CACHE_WARMING_BATCH_SIZE=50            # Larger warming batches
```

3. **Cache Cleanup and Maintenance**:
```python
from src.cache.manager import CacheManager

def optimize_cache_maintenance():
    cache = CacheManager()
    
    print("Performing cache maintenance...")
    
    # Clean expired entries
    expired_count = cache.cleanup_expired()
    print(f"Removed {expired_count} expired entries")
    
    # Intelligent eviction if over utilization
    metrics = cache.get_metrics()
    if metrics.utilization > 85:
        evicted_count = cache.evict_lru(keep_count=int(metrics.total_entries * 0.8))
        print(f"Evicted {evicted_count} LRU entries")
    
    # Get updated metrics
    new_metrics = cache.get_metrics()
    print(f"Cache optimized: {new_metrics.utilization:.1f}% utilization")

optimize_cache_maintenance()
```

### Issue: High Memory Usage

**Symptoms**:
- System running out of memory
- Slow performance
- Process killed by OS

**Diagnosis**:
```bash
# Check current memory usage
python -c "
import psutil
import os
process = psutil.Process(os.getpid())
memory_info = process.memory_info()
memory_mb = memory_info.rss / 1024 / 1024
print(f'Current process memory: {memory_mb:.1f} MB')

# System memory
system_memory = psutil.virtual_memory()
print(f'System memory usage: {system_memory.percent:.1f}%')
print(f'Available memory: {system_memory.available / 1024 / 1024:.1f} MB')
"

# Check cache memory specifically
python -c "
from src.cache.manager import CacheManager
cache = CacheManager()
metrics = cache.get_metrics()
print(f'Cache memory usage: {metrics.memory_usage_mb:.1f} MB')
print(f'Cache entries: {metrics.total_entries}')
"
```

**Solutions**:

1. **Reduce Cache Memory Usage**:
```bash
# Edit .env for lower memory usage
CACHE_MAX_SIZE=2000                    # Reduce cache size
CACHE_MEMORY_PRESSURE_THRESHOLD=0.7   # More aggressive cleanup
CACHE_EMERGENCY_CLEANUP_RATIO=0.4     # Remove more entries during cleanup
```

2. **Force Memory Cleanup**:
```python
import gc
from src.cache.manager import CacheManager

def emergency_memory_cleanup():
    cache = CacheManager()
    
    print("Emergency memory cleanup...")
    
    # Get current state
    before_metrics = cache.get_metrics()
    print(f"Before: {before_metrics.memory_usage_mb:.1f} MB")
    
    # Aggressive cleanup
    cache.cleanup_expired()
    cache.evict_lru(keep_count=500)  # Keep only 500 entries
    
    # Force garbage collection
    gc.collect()
    
    # Check results
    after_metrics = cache.get_metrics()
    saved_mb = before_metrics.memory_usage_mb - after_metrics.memory_usage_mb
    print(f"After: {after_metrics.memory_usage_mb:.1f} MB")
    print(f"Memory freed: {saved_mb:.1f} MB")

emergency_memory_cleanup()
```

3. **Monitor Memory Usage**:
```python
import time
import psutil
import os

def memory_monitor(duration_seconds=300):
    """Monitor memory usage for specified duration"""
    
    process = psutil.Process(os.getpid())
    start_time = time.time()
    
    print("Memory monitoring started (Ctrl+C to stop)...")
    print("Time\t\tMemory (MB)\tSystem (%)")
    
    try:
        while time.time() - start_time < duration_seconds:
            memory_mb = process.memory_info().rss / 1024 / 1024
            system_percent = psutil.virtual_memory().percent
            timestamp = time.strftime("%H:%M:%S")
            
            print(f"{timestamp}\t{memory_mb:.1f}\t\t{system_percent:.1f}%")
            
            # Alert if memory usage is high
            if memory_mb > 1000:  # >1GB
                print(f"⚠️ HIGH MEMORY USAGE: {memory_mb:.1f} MB")
            
            time.sleep(10)  # Check every 10 seconds
            
    except KeyboardInterrupt:
        print("\nMemory monitoring stopped.")

# Start monitoring
memory_monitor(300)  # Monitor for 5 minutes
```

### Issue: Slow Query Performance

**Symptoms**:
- Queries taking >5 seconds
- Timeouts occurring frequently
- Poor user experience

**Diagnosis**:
```python
import time
import asyncio
from src.core.driver import get_driver

async def diagnose_query_performance():
    """Diagnose query performance issues"""
    
    test_queries = [
        "What companies are in technology?",
        "Show me Q1 2025 revenue",
        "Calculate average profit margins",
    ]
    
    driver = await get_driver()
    
    for query in test_queries:
        start_time = time.time()
        try:
            response = await driver.process_query(query)
            duration = (time.time() - start_time) * 1000  # Convert to ms
            
            if duration > 1000:  # >1 second
                print(f"🐌 SLOW: '{query}' took {duration:.1f}ms")
            else:
                print(f"✅ FAST: '{query}' took {duration:.1f}ms")
                
        except Exception as e:
            print(f"❌ ERROR: '{query}' failed: {e}")
    
    await driver.shutdown()

asyncio.run(diagnose_query_performance())
```

**Solutions**:

1. **Database Query Optimization**:
```sql
-- Add these indexes to improve query performance
-- (Run in sqlite3 command line or through database management)

CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector);
CREATE INDEX IF NOT EXISTS idx_companies_symbol ON companies(symbol);
CREATE INDEX IF NOT EXISTS idx_financial_company_year ON financial_records(company_id, year);
CREATE INDEX IF NOT EXISTS idx_financial_quarter ON financial_records(quarter, year);

-- Update query planner statistics
ANALYZE;
```

2. **Connection Pool Optimization**:
```bash
# Edit .env for better connection handling
CONNECTION_POOL_SIZE=20          # Increase pool size
QUERY_TIMEOUT=60                # Increase timeout
MAX_CONCURRENT_QUERIES=50       # Allow more concurrent queries
```

3. **Query Pattern Optimization**:
```python
# Instead of broad queries, use specific ones
good_queries = [
    "What is TechCorp's Q1 2025 revenue?",          # Specific company
    "Show technology sector companies",              # Specific sector
    "Calculate profit margin for Q1 2025",          # Specific period
]

bad_queries = [
    "Tell me everything about all companies",        # Too broad
    "Show me all data",                             # Vague request
    "What happened in the last few years?",         # Time-dependent
]
```

## System Maintenance and Optimization

### Daily Maintenance Tasks

Create a daily maintenance routine:

```bash
#!/bin/bash
# daily_maintenance.sh

echo "FACT System Daily Maintenance - $(date)"

# 1. Health check
echo "Running health check..."
python main.py validate

# 2. Log rotation
echo "Rotating logs..."
if [ -f logs/fact.log ]; then
    cp logs/fact.log logs/fact.log.$(date +%Y%m%d)
    > logs/fact.log  # Clear current log
fi

# 3. Cache optimization
echo "Optimizing cache..."
python -c "
from src.cache.manager import CacheManager
cache = CacheManager()
cache.cleanup_expired()
print('Cache maintenance completed')
"

# 4. Database maintenance
echo "Database maintenance..."
sqlite3 data/fact_demo.db "VACUUM; ANALYZE;"

# 5. Performance check
echo "Performance check..."
python -c "
from src.cache.manager import CacheManager
cache = CacheManager()
metrics = cache.get_metrics()
print(f'Cache hit rate: {metrics.hit_rate:.1f}%')
if metrics.hit_rate < 60:
    print('⚠️ Cache hit rate below target')
else:
    print('✅ Cache performance good')
"

echo "Daily maintenance completed"
```

### Weekly Performance Review

```python
import json
import datetime
from src.cache.manager import CacheManager
from src.benchmarking import BenchmarkRunner

async def weekly_performance_review():
    """Generate weekly performance report"""
    
    print("FACT System Weekly Performance Review")
    print("=" * 50)
    
    # Cache performance
    cache = CacheManager()
    metrics = cache.get_metrics()
    
    print(f"Cache Performance:")
    print(f"  Hit Rate: {metrics.hit_rate:.1f}%")
    print(f"  Memory Usage: {metrics.memory_usage_mb:.1f} MB")
    print(f"  Total Entries: {metrics.total_entries}")
    
    # Run benchmark
    runner = BenchmarkRunner()
    results = await runner.run_performance_validation()
    
    print(f"\nBenchmark Results:")
    print(f"  Average Latency: {results['avg_response_time_ms']:.1f}ms")
    print(f"  Cost Reduction: {results['cost_reduction']:.1f}%")
    print(f"  Overall Grade: {results.get('performance_grade', 'N/A')}")
    
    # Save report
    report = {
        'date': datetime.datetime.now().isoformat(),
        'cache_metrics': {
            'hit_rate': metrics.hit_rate,
            'memory_usage_mb': metrics.memory_usage_mb,
            'total_entries': metrics.total_entries,
        },
        'benchmark_results': results
    }
    
    filename = f"weekly_report_{datetime.datetime.now().strftime('%Y%m%d')}.json"
    with open(filename, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\nReport saved: {filename}")

# Run weekly review
asyncio.run(weekly_performance_review())
```

## Emergency Procedures

### System Recovery Procedures

If FACT becomes unresponsive or corrupted:

```bash
#!/bin/bash
# emergency_recovery.sh

echo "FACT Emergency Recovery Procedure"

# 1. Stop all processes
echo "Stopping all FACT processes..."
pkill -f "python main.py"
sleep 5

# 2. Backup current state
echo "Backing up current state..."
mkdir -p recovery_backup_$(date +%Y%m%d_%H%M%S)
cp -r data/ recovery_backup_$(date +%Y%m%d_%H%M%S)/
cp -r logs/ recovery_backup_$(date +%Y%m%d_%H%M%S)/
cp .env recovery_backup_$(date +%Y%m%d_%H%M%S)/

# 3. Clear problematic state
echo "Clearing cache and temporary files..."
rm -f data/fact_demo.db-*
python main.py --clear-cache

# 4. Reinitialize if needed
echo "Testing database..."
if ! sqlite3 data/fact_demo.db "SELECT COUNT(*) FROM companies;" 2>/dev/null; then
    echo "Database corrupted, reinitializing..."
    python main.py init --force
fi

# 5. Validate system
echo "Validating system..."
python main.py validate

echo "Emergency recovery completed"
```

### Performance Emergency Response

If performance degrades severely:

```python
import asyncio
from src.cache.manager import CacheManager
from src.cache.warming import get_cache_warmer

async def emergency_performance_response():
    """Emergency response for severe performance degradation"""
    
    print("🚨 EMERGENCY PERFORMANCE RESPONSE")
    
    # 1. Check current state
    cache = CacheManager()
    metrics = cache.get_metrics()
    print(f"Current hit rate: {metrics.hit_rate:.1f}%")
    
    if metrics.hit_rate < 30:  # Critical threshold
        print("CRITICAL: Cache hit rate below 30%")
        
        # 2. Emergency cache warming
        print("Initiating emergency cache warming...")
        warmer = get_cache_warmer()
        result = await warmer.warm_cache_intelligently(
            max_queries=50,
            concurrent=True
        )
        print(f"Emergency warming: {result['cache_entries_created']} entries added")
        
        # 3. Optimize cache settings temporarily
        # This would modify runtime settings, not .env
        print("Applying emergency optimizations...")
        
    # 4. Check if recovery is working
    new_metrics = cache.get_metrics()
    improvement = new_metrics.hit_rate - metrics.hit_rate
    
    if improvement > 10:
        print(f"✅ Recovery successful: {improvement:.1f}% improvement")
    else:
        print(f"⚠️ Recovery incomplete: {improvement:.1f}% improvement")
        print("Consider manual intervention or system restart")

# Run emergency response
asyncio.run(emergency_performance_response())
```

This troubleshooting guide provides comprehensive solutions for the most common FACT system issues. For additional help, check the logs, run diagnostic commands, and refer to other documentation sections as needed.

---

**Quick Reference**: Use `python main.py validate` for general health checks, check `logs/fact.log` for errors, and run `python main.py cli` then `metrics` for performance data.