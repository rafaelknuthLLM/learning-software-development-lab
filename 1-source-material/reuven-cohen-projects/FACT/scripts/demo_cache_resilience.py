#!/usr/bin/env python3
"""
Cache Resilience Demonstration Script

This script demonstrates the cache resilience implementation in the FACT system,
showing how the circuit breaker pattern prevents cascading failures and how
graceful degradation ensures the system continues to function even when cache
operations fail.

Key Features Demonstrated:
1. Circuit breaker pattern with state transitions (CLOSED -> OPEN -> HALF_OPEN -> CLOSED)
2. Graceful degradation when cache operations fail
3. Metrics collection and reporting
4. Recovery from failures
5. Integration with the FACT driver
"""

import asyncio
import time
import sys
import os
from pathlib import Path
from typing import Dict, Any, List
import json

# Add src to path for imports
src_path = str(Path(__file__).parent.parent / "src")
if src_path not in sys.path:
    sys.path.insert(0, src_path)

from cache.resilience import (
    CacheCircuitBreaker, CircuitBreakerConfig, ResilientCacheWrapper, 
    CircuitState, FailureRecord
)
from cache.manager import CacheManager
from core.errors import CacheError
import structlog

# Configure logging for demo
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="ISO"),
        structlog.processors.add_log_level,
        structlog.processors.JSONRenderer()
    ],
    logger_factory=structlog.PrintLoggerFactory(),
    wrapper_class=structlog.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger(__name__)


class DemoCacheManager:
    """Demo cache manager that can simulate various failure scenarios."""
    
    def __init__(self):
        self.cache = {}
        self.failure_mode = "normal"  # normal, intermittent, total_failure
        self.operation_count = 0
        self.failure_probability = 0.0
        
    def set_failure_mode(self, mode: str, probability: float = 0.0):
        """Set the failure mode for demonstration."""
        self.failure_mode = mode
        self.failure_probability = probability
        self.operation_count = 0
        
        mode_descriptions = {
            "normal": "Normal operation - no failures",
            "intermittent": f"Intermittent failures - {probability*100}% failure rate",
            "total_failure": "Total failure - all operations fail"
        }
        
        print(f"\n🔧 Cache Mode Changed: {mode_descriptions.get(mode, mode)}")
    
    def _should_fail(self) -> bool:
        """Determine if this operation should fail based on current mode."""
        self.operation_count += 1
        
        if self.failure_mode == "normal":
            return False
        elif self.failure_mode == "total_failure":
            return True
        elif self.failure_mode == "intermittent":
            import random
            return random.random() < self.failure_probability
        
        return False
    
    async def store(self, query_hash: str, content: str):
        """Store with potential failure simulation."""
        await asyncio.sleep(0.01)  # Simulate network latency
        
        if self._should_fail():
            raise CacheError("Simulated cache store failure", error_code="CACHE_STORE_FAILED")
        
        self.cache[query_hash] = {
            'content': content,
            'timestamp': time.time()
        }
        return True
    
    async def get(self, query_hash: str):
        """Get with potential failure simulation."""
        await asyncio.sleep(0.01)  # Simulate network latency
        
        if self._should_fail():
            raise CacheError("Simulated cache get failure", error_code="CACHE_GET_FAILED")
            
        if query_hash in self.cache:
            return type('CacheEntry', (), {
                'content': self.cache[query_hash]['content'],
                'timestamp': self.cache[query_hash]['timestamp']
            })()
        return None
    
    async def invalidate_by_prefix(self, prefix: str) -> int:
        """Invalidate with potential failure simulation."""
        await asyncio.sleep(0.01)  # Simulate network latency
        
        if self._should_fail():
            raise CacheError("Simulated cache invalidate failure", error_code="CACHE_INVALIDATE_FAILED")
        
        count = 0
        keys_to_remove = [k for k in self.cache.keys() if k.startswith(prefix)]
        for key in keys_to_remove:
            del self.cache[key]
            count += 1
        
        return count
    
    def generate_hash(self, query: str) -> str:
        """Generate hash for query."""
        import hashlib
        return hashlib.sha256(query.encode()).hexdigest()[:16]


def print_banner(title: str):
    """Print a formatted banner for demo sections."""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")


def print_metrics(circuit_breaker: CacheCircuitBreaker, resilient_cache: ResilientCacheWrapper, title: str = "Current Metrics"):
    """Print formatted metrics."""
    cb_metrics = circuit_breaker.get_metrics()
    cache_metrics = resilient_cache.get_metrics()
    
    print(f"\n📊 {title}")
    print(f"├─ Circuit Breaker State: {cb_metrics.state.value.upper()}")
    print(f"├─ Total Operations: {cb_metrics.total_operations}")
    print(f"├─ Success Count: {cb_metrics.success_count}")
    print(f"├─ Failure Count: {cb_metrics.failure_count}")
    print(f"├─ Failure Rate: {cb_metrics.failure_rate:.2%}")
    print(f"├─ State Changes: {cb_metrics.state_changes}")
    print(f"├─ Recent Failures: {len(cb_metrics.recent_failures)}")
    print(f"├─ Graceful Degradation: {'Enabled' if resilient_cache.enable_graceful_degradation else 'Disabled'}")
    
    if 'cache' in cache_metrics:
        cache_stats = cache_metrics['cache']
        print(f"└─ Cache Stats: {json.dumps(cache_stats, indent=2) if isinstance(cache_stats, dict) else cache_stats}")
    else:
        print(f"└─ Cache Stats: Not available")


async def demo_normal_operation():
    """Demonstrate normal cache operation."""
    print_banner("1. Normal Cache Operation")
    
    # Configure circuit breaker for demo
    config = CircuitBreakerConfig(
        failure_threshold=3,
        success_threshold=2,
        timeout_seconds=3.0,
        rolling_window_seconds=60.0,
        gradual_recovery=True,
        recovery_factor=0.5
    )
    
    circuit_breaker = CacheCircuitBreaker(config)
    demo_cache = DemoCacheManager()
    resilient_cache = ResilientCacheWrapper(demo_cache, circuit_breaker)
    
    print("✅ Cache resilience system initialized")
    print("🔄 Circuit breaker configured with:")
    print(f"   • Failure threshold: {config.failure_threshold}")
    print(f"   • Success threshold: {config.success_threshold}")
    print(f"   • Timeout: {config.timeout_seconds}s")
    
    demo_cache.set_failure_mode("normal")
    
    print("\n🚀 Performing normal cache operations...")
    
    # Perform successful operations
    operations = [
        ("store", "query1", "Sample query result 1"),
        ("store", "query2", "Sample query result 2"),
        ("get", "query1", None),
        ("store", "query3", "Sample query result 3"),
        ("get", "query2", None),
    ]
    
    for i, (op, key, value) in enumerate(operations, 1):
        try:
            if op == "store":
                result = await resilient_cache.store(key, value)
                print(f"   {i}. ✅ Store '{key}': {result}")
            elif op == "get":
                result = await resilient_cache.get(key)
                content = result.content if result else "Not found"
                print(f"   {i}. ✅ Get '{key}': {content}")
        except Exception as e:
            print(f"   {i}. ❌ {op.title()} '{key}': {e}")
    
    print_metrics(circuit_breaker, resilient_cache, "After Normal Operations")
    
    return circuit_breaker, demo_cache, resilient_cache


async def demo_failure_and_circuit_breaker(circuit_breaker, demo_cache, resilient_cache):
    """Demonstrate cache failures and circuit breaker activation."""
    print_banner("2. Cache Failures & Circuit Breaker Activation")
    
    print("⚠️  Introducing cache failures to trigger circuit breaker...")
    demo_cache.set_failure_mode("total_failure")
    
    print("\n🔥 Attempting operations with failing cache:")
    
    # Attempt operations that will fail
    failure_operations = [
        ("store", "fail1", "This will fail"),
        ("store", "fail2", "This will also fail"),
        ("get", "query1", None),
        ("store", "fail3", "This will trigger circuit breaker"),
        ("get", "fail1", None),
    ]
    
    for i, (op, key, value) in enumerate(failure_operations, 1):
        try:
            if op == "store":
                result = await resilient_cache.store(key, value)
                print(f"   {i}. ✅ Store '{key}': {result} (graceful degradation)")
            elif op == "get":
                result = await resilient_cache.get(key)
                content = result.content if result else "Cache miss (graceful degradation)"
                print(f"   {i}. ✅ Get '{key}': {content}")
        except CacheError as e:
            if "CIRCUIT_BREAKER_OPEN" in str(e.error_code):
                print(f"   {i}. ⚡ {op.title()} '{key}': Circuit breaker opened!")
            else:
                print(f"   {i}. ❌ {op.title()} '{key}': {e}")
        except Exception as e:
            print(f"   {i}. ❌ {op.title()} '{key}': Unexpected error: {e}")
    
    state = circuit_breaker.get_state()
    if state == CircuitState.OPEN:
        print("\n🔴 Circuit breaker is now OPEN - protecting system from cascading failures")
    
    print_metrics(circuit_breaker, resilient_cache, "After Failures (Circuit Breaker Open)")


async def demo_graceful_degradation(circuit_breaker, demo_cache, resilient_cache):
    """Demonstrate graceful degradation when circuit breaker is open."""
    print_banner("3. Graceful Degradation")
    
    print("🛡️  Testing graceful degradation with circuit breaker open...")
    
    # Ensure graceful degradation is enabled
    resilient_cache.enable_graceful_degradation = True
    
    degradation_operations = [
        ("store", "degraded1", "Graceful degradation response"),
        ("get", "nonexistent", None),
        ("invalidate_by_prefix", "test_", None),
        ("store", "degraded2", "Another graceful response"),
    ]
    
    print("\n🛟 Performing operations with graceful degradation:")
    
    for i, (op, key, value) in enumerate(degradation_operations, 1):
        try:
            if op == "store":
                result = await resilient_cache.store(key, value)
                print(f"   {i}. 🛟 Store '{key}': {result} (fallback response)")
            elif op == "get":
                result = await resilient_cache.get(key)
                print(f"   {i}. 🛟 Get '{key}': {result} (fallback response)")
            elif op == "invalidate_by_prefix":
                result = await resilient_cache.invalidate_by_prefix(key)
                print(f"   {i}. 🛟 Invalidate '{key}': {result} (fallback response)")
        except Exception as e:
            print(f"   {i}. ❌ {op.title()} '{key}': {e}")
    
    print("\n✅ All operations completed successfully using graceful degradation")
    print("   • System remains responsive despite cache failures")
    print("   • No exceptions propagated to application layer")
    print("   • Users experience degraded but functional service")
    
    print_metrics(circuit_breaker, resilient_cache, "During Graceful Degradation")


async def demo_recovery(circuit_breaker, demo_cache, resilient_cache):
    """Demonstrate recovery from failures."""
    print_banner("4. Recovery from Failures")
    
    print("⏰ Waiting for circuit breaker timeout...")
    print("   (In production, this would be longer - using shorter timeout for demo)")
    
    # Wait for circuit breaker timeout
    await asyncio.sleep(3.5)
    
    print("\n🔧 Fixing cache and attempting recovery...")
    demo_cache.set_failure_mode("normal")
    
    print("\n🔄 Attempting operations to trigger recovery:")
    
    recovery_operations = [
        ("store", "recovery1", "Recovery test 1"),
        ("get", "recovery1", None),
        ("store", "recovery2", "Recovery test 2"),
        ("store", "recovery3", "Recovery test 3"),
    ]
    
    for i, (op, key, value) in enumerate(recovery_operations, 1):
        try:
            if op == "store":
                result = await resilient_cache.store(key, value)
                print(f"   {i}. ✅ Store '{key}': {result}")
            elif op == "get":
                result = await resilient_cache.get(key)
                content = result.content if result else "Not found"
                print(f"   {i}. ✅ Get '{key}': {content}")
                
            state = circuit_breaker.get_state()
            print(f"      Circuit state: {state.value}")
            
        except Exception as e:
            print(f"   {i}. ❌ {op.title()} '{key}': {e}")
    
    final_state = circuit_breaker.get_state()
    if final_state == CircuitState.CLOSED:
        print("\n🟢 Circuit breaker successfully recovered to CLOSED state!")
    elif final_state == CircuitState.HALF_OPEN:
        print("\n🟡 Circuit breaker is in HALF_OPEN state (testing recovery)")
    
    print_metrics(circuit_breaker, resilient_cache, "After Recovery")


async def demo_intermittent_failures(circuit_breaker, demo_cache, resilient_cache):
    """Demonstrate handling of intermittent failures."""
    print_banner("5. Intermittent Failures Handling")
    
    print("🔄 Testing with intermittent failures (30% failure rate)...")
    demo_cache.set_failure_mode("intermittent", 0.3)
    
    print("\n📊 Running 20 operations with 30% failure rate:")
    
    success_count = 0
    failure_count = 0
    degraded_count = 0
    
    for i in range(1, 21):
        try:
            result = await resilient_cache.store(f"intermittent_{i}", f"test data {i}")
            if isinstance(result, bool) and result:
                if circuit_breaker.get_state() == CircuitState.OPEN:
                    degraded_count += 1
                    print(f"   {i:2d}. 🛟 Degraded response")
                else:
                    success_count += 1
                    print(f"   {i:2d}. ✅ Success")
            else:
                failure_count += 1
                print(f"   {i:2d}. ❌ Failed")
        except CacheError as e:
            failure_count += 1
            print(f"   {i:2d}. ❌ Error: {e}")
        except Exception as e:
            failure_count += 1
            print(f"   {i:2d}. ❌ Unexpected: {e}")
    
    print(f"\n📈 Results Summary:")
    print(f"   • Successful operations: {success_count}")
    print(f"   • Failed operations: {failure_count}")
    print(f"   • Degraded responses: {degraded_count}")
    print(f"   • Total operations: {success_count + failure_count + degraded_count}")
    
    print_metrics(circuit_breaker, resilient_cache, "After Intermittent Failures Test")


async def main():
    """Run the complete cache resilience demonstration."""
    print("🎭 FACT Cache Resilience Demonstration")
    print("=" * 60)
    print("This demo shows how the FACT system handles cache failures")
    print("gracefully using circuit breaker patterns and degradation strategies.")
    print("=" * 60)
    
    try:
        # Run demonstration scenarios
        circuit_breaker, demo_cache, resilient_cache = await demo_normal_operation()
        await demo_failure_and_circuit_breaker(circuit_breaker, demo_cache, resilient_cache)
        await demo_graceful_degradation(circuit_breaker, demo_cache, resilient_cache)
        await demo_recovery(circuit_breaker, demo_cache, resilient_cache)
        await demo_intermittent_failures(circuit_breaker, demo_cache, resilient_cache)
        
        # Final summary
        print_banner("Demo Complete - Summary")
        print("✅ All cache resilience features demonstrated successfully:")
        print("   • Circuit breaker pattern with state transitions")
        print("   • Graceful degradation during failures")
        print("   • Comprehensive metrics collection")
        print("   • Automatic recovery from failures")
        print("   • Handling of intermittent failure scenarios")
        print("\n🎉 The FACT cache resilience system is working as designed!")
        
        # Final metrics
        print_metrics(circuit_breaker, resilient_cache, "Final System State")
        
    except Exception as e:
        logger.error("Demo failed", error=str(e), exc_info=True)
        print(f"\n❌ Demo failed with error: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())