# FACT System Test Execution Guide

## Quick Start

### Prerequisites
```bash
# Install dependencies
pip install pytest pytest-asyncio pytest-benchmark pytest-mock

# Set up Python path (from project root)
export PYTHONPATH=/workspaces/FACT/src:/workspaces/FACT:$PYTHONPATH
```

### Run Tests

#### 1. Working Unit Tests
```bash
cd /workspaces/FACT

# Run cache mechanism tests (mostly working)
python -c "
import sys
sys.path.insert(0, '.')
sys.path.insert(0, 'src')
import pytest
pytest.main(['-v', 'tests/unit/test_cache_mechanism.py'])
"
```

#### 2. TDD Demonstration Tests
```bash
# Run TDD methodology demonstration (will show failures)
python -c "
import sys
sys.path.insert(0, '.')
sys.path.insert(0, 'src')
import pytest
pytest.main(['-v', 'tests/unit/test_missing_components_tdd.py'])
"
```

#### 3. Specific Test Categories
```bash
# Run performance tests only
python -c "
import sys
sys.path.insert(0, '.')
sys.path.insert(0, 'src')
import pytest
pytest.main(['-v', '-m', 'performance', 'tests/'])
"

# Run integration tests (will fail due to missing components)
python -c "
import sys
sys.path.insert(0, '.')
sys.path.insert(0, 'src')
import pytest
pytest.main(['-v', 'tests/integration/'])
"
```

## Test Status by Category

### ✅ Currently Working
- Basic cache entry operations
- Cache access tracking
- Cache serialization
- Some cache manager functionality

### ⚠️ Partially Working
- Cache validation (implementation mismatch)
- Cache performance tests (dependency issues)
- Tool registry tests

### ❌ Currently Failing
- Integration tests (import errors)
- Performance benchmarks (missing dependencies)
- Complete system tests (component gaps)

### 🚫 Blocked
- Benchmarking system (import issues - partially fixed)
- Monitoring tests (missing implementation)
- Security component tests (missing implementation)

## Test-Driven Development Workflow

### 1. Red Phase - Write Failing Test
```bash
# Create new test file
touch tests/unit/test_new_feature.py

# Write failing test that defines desired behavior
# Example in tests/unit/test_missing_components_tdd.py
```

### 2. Green Phase - Minimal Implementation
```bash
# Create implementation file
touch src/new_module/new_feature.py

# Write minimal code to make test pass
# Run test to verify it passes
```

### 3. Refactor Phase - Improve Design
```bash
# Improve implementation while keeping tests green
# Add more tests for edge cases
# Refactor for better design
```

## Common Issues and Solutions

### Import Errors
**Problem**: `ModuleNotFoundError: No module named 'src'`

**Solution**:
```python
import sys
sys.path.insert(0, '.')
sys.path.insert(0, 'src')
```

### Cache Validation Test Failure
**Problem**: `test_cache_entry_validates_minimum_token_requirement` fails

**Root Cause**: Implementation doesn't validate minimum tokens in test environment

**Next Steps**: See test fixes below

### Missing Dependencies
**Problem**: Tests fail due to missing components

**Solution**: Use TDD to drive implementation:
1. Write failing test
2. Create minimal implementation
3. Iterate until complete

## Immediate Test Fixes Needed

### 1. Fix Cache Validation Logic
The cache validation test fails because the implementation has test environment detection that bypasses validation.

### 2. Fix Benchmarking Imports
Already partially fixed, but may need more work.

### 3. Create Missing Component Stubs
Use the TDD tests in `test_missing_components_tdd.py` to drive implementation.

## Test Configuration

### Pytest Configuration (pytest.ini)
```ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
asyncio_mode = auto
markers =
    performance: Performance and benchmark tests
    integration: Integration tests
    unit: Unit tests
    slow: Slow-running tests
    benchmark: Benchmark comparison tests
    cost_analysis: Token cost analysis tests
```

### Environment Variables for Testing
```bash
export ANTHROPIC_API_KEY="test-key-for-testing"
export ARCADE_API_KEY="test-arcade-key"
export FACT_DB="test_data/test.db"
export FACT_CACHE_PREFIX="fact_test_v1"
export FACT_LOG_LEVEL="DEBUG"
```

## Continuous Integration Setup

### GitHub Actions Example
```yaml
name: FACT Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: 3.12
    - name: Install dependencies
      run: |
        pip install pytest pytest-asyncio pytest-benchmark
    - name: Run tests
      run: |
        export PYTHONPATH=$PWD/src:$PWD:$PYTHONPATH
        python -m pytest tests/ -v
```

## Test Coverage Goals

### Short Term (Next 2 weeks)
- [ ] Fix cache validation test
- [ ] Get basic unit tests running consistently
- [ ] Fix import issues in integration tests

### Medium Term (1 month)
- [ ] Implement missing components driven by TDD tests
- [ ] Get integration tests running
- [ ] Set up continuous integration

### Long Term (2-3 months)
- [ ] 80%+ code coverage
- [ ] Full performance test suite
- [ ] Comprehensive integration testing
- [ ] Property-based testing for edge cases

## Resources

- [TDD Test Examples](tests/unit/test_missing_components_tdd.py)
- [Testing Assessment Report](tests/TESTING_ASSESSMENT_REPORT.md)
- [Cache Tests (Working)](tests/unit/test_cache_mechanism.py)
- [Performance Test Framework](tests/performance/test_benchmarks.py)