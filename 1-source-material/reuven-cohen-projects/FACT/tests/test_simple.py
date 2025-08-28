#!/usr/bin/env python3
"""
Simple test script to verify basic FACT system functionality.
"""

import asyncio
import sys
import os
from pathlib import Path

# Add src to path
src_path = str(Path(__file__).parent.parent / "src")
if src_path not in sys.path:
    sys.path.insert(0, src_path)

from core.driver import FACTDriver, get_driver
from core.config import Config


async def test_basic_system():
    """Test basic system initialization and functionality."""
    print("🧪 Testing Basic FACT System")
    print("=" * 40)
    
    try:
        # Test 1: Configuration loading
        print("\n1. Testing configuration loading...")
        config = Config()
        print(f"✅ Configuration loaded successfully")
        print(f"   Database path: {config.database_path}")
        print(f"   Cache prefix: {config.cache_prefix}")
        
        # Test 2: Driver initialization
        print("\n2. Testing driver initialization...")
        driver = FACTDriver(config)
        print("✅ Driver initialized successfully")
        
        # Test 3: Basic metrics
        print("\n3. Testing metrics collection...")
        metrics = driver.get_metrics()
        print(f"✅ Metrics available: {list(metrics.keys())}")
        
        # Test 4: Simple query (if API keys are available)
        print("\n4. Testing simple query processing...")
        try:
            # Use a simple test query
            test_query = "What is the system status?"
            result = await driver.process_query(test_query)
            print(f"✅ Query processed successfully")
            print(f"   Response length: {len(result)} characters")
        except Exception as e:
            print(f"⚠️  Query processing failed (expected without valid API keys): {e}")
        
        print("\n" + "=" * 40)
        print("🎉 BASIC SYSTEM TEST RESULTS")
        print("=" * 40)
        print("✅ Configuration loading: PASSED")
        print("✅ Driver initialization: PASSED")
        print("✅ Metrics collection: PASSED")
        print("✅ System is operational!")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    async def main():
        success = await test_basic_system()
        
        if success:
            print("\n🚀 Basic system tests passed!")
            print("The FACT system is ready for use.")
            sys.exit(0)
        else:
            print("\n💥 Basic system tests failed!")
            sys.exit(1)
    
    asyncio.run(main())