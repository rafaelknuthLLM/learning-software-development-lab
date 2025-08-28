"""
FACT System Command Line Interface

This module implements the interactive CLI for the FACT system,
providing user interaction and command processing.
"""

import asyncio
import sys
import argparse
import logging
from typing import Optional
import structlog

from .driver import get_driver, shutdown_driver
from .config import get_config
from .errors import FACTError, create_user_friendly_message


logger = structlog.get_logger(__name__)


class FACTCLi:
    """
    Interactive command-line interface for the FACT system.
    
    Provides user interaction, query processing, and system management
    through a console-based interface.
    """
    
    def __init__(self):
        """Initialize CLI interface."""
        self.driver = None
        self.running = False
        
    async def initialize(self) -> None:
        """Initialize the CLI and underlying FACT system."""
        try:
            logger.info("Initializing FACT CLI")
            self.driver = await get_driver()
            logger.info("FACT CLI initialized successfully")
            
        except Exception as e:
            logger.error("CLI initialization failed", error=str(e))
            print(f"❌ Initialization failed: {create_user_friendly_message(e)}")
            sys.exit(1)
    
    async def run_interactive(self) -> None:
        """
        Run the interactive CLI loop.
        
        Handles user input, query processing, and graceful shutdown.
        """
        if not self.driver:
            await self.initialize()
        
        self.running = True
        
        # Print welcome message
        print("🚀 FACT System - Fast-Access Cached Tools")
        print("💡 Ask questions about financial data. Type 'help' for commands or Ctrl+C to exit.")
        print()
        
        # Show system status
        await self._show_status()
        
        while self.running:
            try:
                # Get user input
                user_input = input("\n💬 > ").strip()
                
                if not user_input:
                    continue
                
                # Handle special commands
                if await self._handle_command(user_input):
                    continue
                
                # Process query through FACT system
                print("🤔 Processing your query...")
                
                response = await self.driver.process_query(user_input)
                
                # Display response
                print("\n📊 Response:")
                print(response)
                
            except (EOFError, KeyboardInterrupt):
                print("\n👋 Goodbye!")
                break
                
            except Exception as e:
                error_message = create_user_friendly_message(e)
                print(f"\n❌ Error: {error_message}")
                logger.error("CLI error", error=str(e))
        
        await self._shutdown()
    
    async def _handle_command(self, input_text: str) -> bool:
        """
        Handle special CLI commands.
        
        Args:
            input_text: User input to check for commands
            
        Returns:
            True if input was a command, False otherwise
        """
        command = input_text.lower().strip()
        
        if command in ['help', '?']:
            await self._show_help()
            return True
        
        elif command in ['status', 'stats']:
            await self._show_status()
            return True
        
        elif command in ['tools', 'list-tools']:
            await self._show_tools()
            return True
        
        elif command in ['schema', 'db-schema']:
            await self._show_schema()
            return True
        
        elif command in ['samples', 'examples']:
            await self._show_sample_queries()
            return True
        
        elif command in ['metrics', 'performance']:
            await self._show_metrics()
            return True
        
        elif command in ['exit', 'quit', 'q']:
            self.running = False
            return True
        
        return False
    
    async def _show_help(self) -> None:
        """Display help information."""
        help_text = """
📖 FACT System Help

🔧 Commands:
  help, ?          - Show this help message
  status, stats    - Show system status
  tools            - List available tools
  schema           - Show database schema
  samples          - Show sample queries
  metrics          - Show performance metrics
  exit, quit, q    - Exit the system

💡 Usage:
  Ask natural language questions about financial data:
  • "What's TechCorp's Q1 2025 revenue?"
  • "Show me all companies in the Technology sector"
  • "Compare revenue trends across companies"
  
  The system will automatically use SQL tools to retrieve data and provide answers.
        """
        print(help_text)
    
    async def _show_status(self) -> None:
        """Display system status information."""
        try:
            if not self.driver:
                print("❌ System not initialized")
                return
            
            config = get_config()
            metrics = self.driver.get_metrics()
            
            print("🔍 System Status:")
            print(f"  • Status: {'✅ Ready' if metrics['initialized'] else '❌ Not Ready'}")
            print(f"  • Database: {config.database_path}")
            print(f"  • Model: {config.claude_model}")
            print(f"  • Cache Prefix: {config.cache_prefix}")
            print(f"  • Tools Registered: {len(self.driver.tool_registry.list_tools())}")
            
        except Exception as e:
            print(f"❌ Failed to get status: {e}")
    
    async def _show_tools(self) -> None:
        """Display available tools."""
        try:
            if not self.driver:
                print("❌ System not initialized")
                return
            
            tool_names = self.driver.tool_registry.list_tools()
            
            print("🛠️  Available Tools:")
            for tool_name in tool_names:
                tool_def = self.driver.tool_registry.get_tool(tool_name)
                print(f"  • {tool_name}: {tool_def.description}")
            
            print(f"\nTotal: {len(tool_names)} tools")
            
        except Exception as e:
            print(f"❌ Failed to list tools: {e}")
    
    async def _show_schema(self) -> None:
        """Display database schema information."""
        try:
            if not self.driver:
                print("❌ System not initialized")
                return
            
            # Use the SQL tool to get schema
            from ..tools.connectors.sql import sql_get_schema
            schema_info = await sql_get_schema()
            
            if schema_info.get("status") == "success":
                print("🗄️  Database Schema:")
                for table in schema_info["tables"]:
                    print(f"\n  📋 Table: {table['name']}")
                    for column in table["columns"]:
                        nullable = "NULL" if column["nullable"] else "NOT NULL"
                        pk = " (PRIMARY KEY)" if column["primary_key"] else ""
                        print(f"    • {column['name']}: {column['type']} {nullable}{pk}")
            else:
                print(f"❌ Failed to get schema: {schema_info.get('error')}")
            
        except Exception as e:
            print(f"❌ Failed to show schema: {e}")
    
    async def _show_sample_queries(self) -> None:
        """Display sample SQL queries."""
        try:
            if not self.driver:
                print("❌ System not initialized")
                return
            
            # Use the SQL tool to get sample queries
            from ..tools.connectors.sql import sql_get_sample_queries
            samples = sql_get_sample_queries()
            
            print("📝 Sample Queries:")
            for i, sample in enumerate(samples["sample_queries"], 1):
                print(f"\n  {i}. {sample['description']}")
                print(f"     {sample['query']}")
            
        except Exception as e:
            print(f"❌ Failed to show samples: {e}")
    
    async def _show_metrics(self) -> None:
        """Display performance metrics."""
        try:
            if not self.driver:
                print("❌ System not initialized")
                return
            
            metrics = self.driver.get_metrics()
            
            print("📊 Performance Metrics:")
            print(f"  • Total Queries: {metrics['total_queries']}")
            print(f"  • Cache Hit Rate: {metrics['cache_hit_rate']:.1f}%")
            print(f"  • Tool Executions: {metrics['tool_executions']}")
            print(f"  • Error Rate: {metrics['error_rate']:.1f}%")
            print(f"  • Cache Hits: {metrics['cache_hits']}")
            print(f"  • Cache Misses: {metrics['cache_misses']}")
            
        except Exception as e:
            print(f"❌ Failed to show metrics: {e}")
    
    async def _shutdown(self) -> None:
        """Shutdown the CLI and underlying systems."""
        try:
            print("\n🔄 Shutting down...")
            await shutdown_driver()
            print("✅ Shutdown complete")
            
        except Exception as e:
            print(f"❌ Shutdown error: {e}")


async def main() -> None:
    """
    Main entry point for the FACT CLI application.
    
    Handles command-line arguments and starts the appropriate mode.
    """
    parser = argparse.ArgumentParser(
        description="FACT System - Fast-Access Cached Tools",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument(
        "--version",
        action="version",
        version="FACT System v1.0.0"
    )
    
    parser.add_argument(
        "--query",
        type=str,
        help="Process a single query and exit"
    )
    
    parser.add_argument(
        "--config",
        type=str,
        help="Path to configuration file"
    )
    
    parser.add_argument(
        "--log-level",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        default="INFO",
        help="Set logging level"
    )
    
    args = parser.parse_args()
    
    # Configure logging
    structlog.configure(
        wrapper_class=structlog.make_filtering_bound_logger(
            getattr(logging, args.log_level.upper())
        ),
        logger_factory=structlog.stdlib.LoggerFactory(),
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.processors.TimeStamper(fmt="ISO"),
            structlog.dev.ConsoleRenderer()
        ],
        cache_logger_on_first_use=True,
    )
    
    try:
        cli = FACTCLi()
        
        if args.query:
            # Single query mode
            await cli.initialize()
            response = await cli.driver.process_query(args.query)
            print(response)
        else:
            # Interactive mode
            await cli.run_interactive()
            
    except KeyboardInterrupt:
        print("\n👋 Interrupted by user")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Fatal error: {create_user_friendly_message(e)}")
        logger.error("Fatal CLI error", error=str(e))
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())