#!/usr/bin/env python3
"""
FACT System Environment Initialization Script

This script sets up the environment for the FACT system including:
- Creating .env file with required configuration
- Initializing the database with sample data
- Validating system connectivity
"""

import os
import sys
import asyncio
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from core.config import Config, ConfigurationError
from core.driver import get_driver
from db.connection import DatabaseManager


def create_env_file():
    """Create .env file with default configuration."""
    env_path = Path('.env')
    
    if env_path.exists():
        print("📄 .env file already exists - skipping creation")
        return
    
    env_content = '''# FACT System Configuration
# Copy this file and update with your actual API keys

# Required API Keys
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ARCADE_API_KEY=your_arcade_api_key_here

# Optional Configuration
ARCADE_BASE_URL=https://api.arcade-ai.com
DATABASE_PATH=data/fact_demo.db
CACHE_PREFIX=fact_v1
SYSTEM_PROMPT=You are a deterministic finance assistant. When uncertain, request data via tools.
CLAUDE_MODEL=claude-3-5-sonnet-20241022
MAX_RETRIES=3
REQUEST_TIMEOUT=30
LOG_LEVEL=INFO
'''
    
    with open(env_path, 'w') as f:
        f.write(env_content)
    
    print("✅ Created .env file with default configuration")
    print("⚠️  Please update the API keys in .env before running the system")


async def init_database():
    """Initialize database with schema and sample data."""
    try:
        print("🗄️  Initializing database...")
        
        # Create database manager and initialize
        config = Config()
        db_manager = DatabaseManager(config.database_path)
        await db_manager.initialize_database()
        
        # Get database info
        db_info = await db_manager.get_database_info()
        
        print(f"✅ Database initialized successfully:")
        print(f"   📍 Path: {db_info['database_path']}")
        print(f"   📊 Tables: {db_info['total_tables']}")
        
        for table_name, table_info in db_info['tables'].items():
            print(f"   📋 {table_name}: {table_info['row_count']} rows")
        
        return True
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        return False


async def validate_system():
    """Validate system connectivity and configuration."""
    try:
        print("🔍 Validating system configuration...")
        
        # Try to get a driver instance (this validates config and initializes components)
        driver = await get_driver()
        
        # Get system metrics
        metrics = driver.get_metrics()
        
        print("✅ System validation passed:")
        print(f"   🎯 Initialized: {metrics['initialized']}")
        print(f"   🛠️  Tools: {len(driver.tool_registry.list_tools())}")
        
        # List available tools
        tool_names = driver.tool_registry.list_tools()
        print("   🔧 Available tools:")
        for tool_name in tool_names:
            print(f"      • {tool_name}")
        
        return True
        
    except ConfigurationError as e:
        print(f"❌ Configuration error: {e}")
        print("💡 Make sure to update your API keys in .env file")
        return False
    except Exception as e:
        print(f"❌ System validation failed: {e}")
        return False


async def main():
    """Main initialization routine."""
    print("🚀 FACT System Environment Initialization")
    print("=" * 50)
    
    # Step 1: Create .env file
    print("\n1. Setting up environment configuration...")
    create_env_file()
    
    # Step 2: Initialize database
    print("\n2. Initializing database...")
    db_success = await init_database()
    
    if not db_success:
        print("\n❌ Database initialization failed - stopping")
        sys.exit(1)
    
    # Step 3: Validate system (only if API keys are configured)
    print("\n3. Validating system configuration...")
    
    try:
        config = Config()
        if config.anthropic_api_key == "your_anthropic_api_key_here":
            print("⚠️  API keys not configured - skipping system validation")
            print("💡 Update the API keys in .env file, then run: python scripts/validate_system.py")
        else:
            system_success = await validate_system()
            if not system_success:
                print("\n❌ System validation failed")
                sys.exit(1)
    except ConfigurationError:
        print("⚠️  API keys not configured - skipping system validation")
        print("💡 Update the API keys in .env file, then run: python scripts/validate_system.py")
    
    print("\n🎉 Environment initialization complete!")
    print("\nNext steps:")
    print("1. Update API keys in .env file")
    print("2. Run: python -m src.core.cli")
    print("3. Try sample queries like: 'What's TechCorp's Q1 2025 revenue?'")


if __name__ == "__main__":
    asyncio.run(main())