#!/usr/bin/env python3
"""
FACT System Main Entry Point

This is the main entry point for the FACT (Fast-Access Cached Tools) system.
Run this file to start the interactive CLI or process single queries.
"""

import asyncio
import sys
import os
import argparse

# Add src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.core.cli import main as cli_main
from src.core.config import get_config
from src.core.driver import get_driver


async def init_command():
    """Initialize the FACT system environment."""
    try:
        print("🚀 Initializing FACT System...")
        
        # Get configuration
        config = get_config()
        print(f"✅ Configuration loaded")
        print(f"   • Database: {config.database_path}")
        print(f"   • Model: {config.claude_model}")
        
        # Initialize driver
        driver = await get_driver(config)
        print("✅ System initialized successfully")
        print("   • Database schema ready")
        print("   • Tools registered")
        print("   • Ready for queries")
        
        return 0
        
    except Exception as e:
        print(f"❌ Initialization failed: {e}")
        return 1


async def demo_command():
    """Run a demonstration of the FACT system."""
    try:
        print("🎪 Running FACT System Demo...")
        
        # Initialize system
        driver = await get_driver()
        
        # Demo queries
        demo_queries = [
            "Show me all companies in our database",
            "What is TechCorp's latest revenue?",
            "List all financial records for Q1 2025"
        ]
        
        for i, query in enumerate(demo_queries, 1):
            print(f"\n📝 Demo Query {i}: {query}")
            try:
                response = await driver.process_query(query)
                print(f"📊 Response: {response}")
            except Exception as e:
                print(f"❌ Query failed: {e}")
        
        print("\n✅ Demo completed")
        return 0
        
    except Exception as e:
        print(f"❌ Demo failed: {e}")
        return 1


async def main():
    """Main entry point with command routing."""
    parser = argparse.ArgumentParser(
        description="FACT System - Fast-Access Cached Tools",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument(
        "command",
        nargs="?",
        choices=["init", "demo", "interactive"],
        default="interactive",
        help="Command to execute (default: interactive)"
    )
    
    parser.add_argument(
        "--query",
        type=str,
        help="Process a single query and exit"
    )
    
    args = parser.parse_args()
    
    try:
        if args.command == "init":
            return await init_command()
        elif args.command == "demo":
            return await demo_command()
        elif args.command == "interactive" or args.query:
            # Pass control to the CLI main function
            return await cli_main()
        else:
            parser.print_help()
            return 1
            
    except KeyboardInterrupt:
        print("\n👋 Interrupted by user")
        return 0
    except Exception as e:
        print(f"❌ Fatal error: {e}")
        return 1


if __name__ == "__main__":
    """
    Main entry point for the FACT system.
    
    Usage:
        python main.py                          # Interactive mode
        python main.py init                     # Initialize system
        python main.py demo                     # Run demo
        python main.py --query "..."            # Single query mode
    """
    exit_code = asyncio.run(main())
    sys.exit(exit_code)