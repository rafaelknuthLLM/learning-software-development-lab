# FACT System Testing Makefile
# Provides convenient commands for running tests, benchmarks, and monitoring

.PHONY: help test test-unit test-integration test-performance test-security test-all
.PHONY: benchmark benchmark-continuous coverage clean setup install-test-deps
.PHONY: validate-targets monitor lint format

# Default target
help:
	@echo "🧪 FACT System Testing Commands"
	@echo "================================"
	@echo ""
	@echo "Test Commands:"
	@echo "  make test-unit         - Run unit tests"
	@echo "  make test-integration  - Run integration tests"
	@echo "  make test-performance  - Run performance benchmarks"
	@echo "  make test-security     - Run security tests"
	@echo "  make test-all          - Run complete test suite"
	@echo ""
	@echo "Benchmark Commands:"
	@echo "  make benchmark         - Run performance benchmarks"
	@echo "  make benchmark-continuous DURATION=10 - Run continuous benchmarks (minutes)"
	@echo "  make validate-targets  - Validate performance targets"
	@echo ""
	@echo "Development Commands:"
	@echo "  make coverage          - Generate test coverage report"
	@echo "  make setup             - Setup test environment"
	@echo "  make install-test-deps - Install test dependencies"
	@echo "  make clean             - Clean test artifacts"
	@echo "  make lint              - Run code linting"
	@echo "  make format            - Format code"
	@echo ""
	@echo "Monitoring Commands:"
	@echo "  make monitor           - Start continuous monitoring"

# Setup and dependencies
setup: install-test-deps
	@echo "🔧 Setting up FACT test environment..."
	@mkdir -p test_results logs
	@mkdir -p tests/{unit,integration,performance,security}
	@echo "✅ Test environment setup complete"

install-test-deps:
	@echo "📦 Installing test dependencies..."
	@pip install -r requirements-test.txt
	@echo "✅ Test dependencies installed"

# Unit tests
test-unit:
	@echo "🧪 Running unit tests..."
	@python -m pytest tests/unit/ -v \
		--tb=short \
		--cov=src \
		--cov-report=term-missing \
		--cov-report=html:test_results/coverage_html \
		--junitxml=test_results/unit_tests.xml \
		-m "not slow"

# Integration tests
test-integration:
	@echo "🔗 Running integration tests..."
	@python -m pytest tests/integration/ -v \
		--tb=short \
		-m "integration" \
		--junitxml=test_results/integration_tests.xml

# Performance benchmarks
test-performance:
	@echo "📈 Running performance benchmarks..."
	@python -m pytest tests/performance/ -v \
		--tb=short \
		-m "performance" \
		--benchmark-only \
		--benchmark-json=test_results/benchmark_results.json \
		--junitxml=test_results/performance_tests.xml

# Security tests
test-security:
	@echo "🛡️ Running security tests..."
	@python -m pytest tests/unit/ tests/integration/ -v \
		--tb=short \
		-m "security" \
		--junitxml=test_results/security_tests.xml

# Complete test suite
test-all:
	@echo "🚀 Running complete FACT test suite..."
	@python tests/test_runner.py --test-type all --verbose

# Fast test run (skip slow tests)
test:
	@echo "⚡ Running fast test suite..."
	@python tests/test_runner.py --test-type all --skip-slow

# Benchmark commands
benchmark: test-performance

benchmark-continuous:
	@echo "📊 Running continuous benchmarks for $(DURATION) minutes..."
	@python tests/test_runner.py --continuous $(DURATION)

validate-targets:
	@echo "🎯 Validating performance targets..."
	@python tests/test_runner.py --test-type performance --validate-targets

# Coverage reporting
coverage:
	@echo "📊 Generating comprehensive coverage report..."
	@python -m pytest tests/unit/ tests/integration/ \
		--cov=src \
		--cov-report=html:test_results/coverage_html \
		--cov-report=term \
		--cov-report=xml:test_results/coverage.xml \
		--cov-fail-under=80
	@echo "📁 Coverage report available at test_results/coverage_html/index.html"

# Monitoring and continuous integration
monitor:
	@echo "📊 Starting continuous monitoring..."
	@while true; do \
		echo "🔄 Running monitoring cycle at $$(date)"; \
		python tests/test_runner.py --test-type performance --validate-targets; \
		echo "😴 Sleeping for 5 minutes..."; \
		sleep 300; \
	done

# Code quality
lint:
	@echo "🔍 Running code linting..."
	@python -m flake8 src/ tests/ --max-line-length=100
	@python -m mypy src/ --ignore-missing-imports
	@echo "✅ Linting complete"

format:
	@echo "🎨 Formatting code..."
	@python -m black src/ tests/ --line-length=100
	@python -m isort src/ tests/
	@echo "✅ Code formatting complete"

# Database tests
test-database:
	@echo "🗄️ Running database-specific tests..."
	@python -m pytest tests/unit/test_database_operations.py tests/integration/ -v \
		-m "database" \
		--junitxml=test_results/database_tests.xml

# Cache tests
test-cache:
	@echo "⚡ Running cache-specific tests..."
	@python -m pytest tests/unit/test_cache_mechanism.py tests/integration/ -v \
		-m "cache" \
		--junitxml=test_results/cache_tests.xml

# Tool tests
test-tools:
	@echo "🔧 Running tool framework tests..."
	@python -m pytest tests/unit/test_tool_framework.py tests/integration/ -v \
		-m "tools" \
		--junitxml=test_results/tools_tests.xml

# Performance analysis
analyze-performance:
	@echo "📈 Analyzing performance results..."
	@python -c "
import json
from pathlib import Path
results_file = Path('test_results/benchmark_results.json')
if results_file.exists():
    with open(results_file) as f:
        data = json.load(f)
    print('📊 Performance Analysis:')
    # Add performance analysis logic here
else:
    print('❌ No benchmark results found. Run make benchmark first.')
"

# Load testing
load-test:
	@echo "🚛 Running load tests..."
	@python -m pytest tests/performance/ -v \
		-k "load or concurrent or throughput" \
		--junitxml=test_results/load_tests.xml

# Stress testing
stress-test:
	@echo "💪 Running stress tests..."
	@python -m pytest tests/performance/ -v \
		-k "stress or sustained or memory" \
		--junitxml=test_results/stress_tests.xml

# Clean up
clean:
	@echo "🧹 Cleaning test artifacts..."
	@rm -rf test_results/*
	@rm -rf .pytest_cache
	@rm -rf __pycache__
	@find . -name "*.pyc" -delete
	@find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
	@echo "✅ Cleanup complete"

# Development workflow
dev-test:
	@echo "🔄 Running development test cycle..."
	@make test-unit
	@make test-integration
	@make validate-targets

# CI/CD pipeline simulation
ci-pipeline:
	@echo "🚀 Running CI/CD pipeline simulation..."
	@make lint
	@make test-all
	@make coverage
	@make validate-targets
	@echo "✅ CI/CD pipeline complete"

# Generate test report
report:
	@echo "📋 Generating comprehensive test report..."
	@python -c "
import json
import os
from datetime import datetime
from pathlib import Path

# Collect all test results
results_dir = Path('test_results')
report = {
    'timestamp': datetime.now().isoformat(),
    'test_files': [],
    'summary': {'total': 0, 'passed': 0, 'failed': 0}
}

for xml_file in results_dir.glob('*_tests.xml'):
    report['test_files'].append(str(xml_file))

# Save report
with open(results_dir / 'test_report.json', 'w') as f:
    json.dump(report, f, indent=2)

print('📊 Test report generated at test_results/test_report.json')
"

# Variables
DURATION ?= 10

# Special targets for different environments
test-docker:
	@echo "🐳 Running tests in Docker environment..."
	@docker run --rm -v $(PWD):/app -w /app python:3.9 make test-all

test-local:
	@echo "🏠 Running tests in local environment..."
	@make test-all

# Help for specific test categories
help-performance:
	@echo "📈 Performance Testing Help"
	@echo "=========================="
	@echo ""
	@echo "Available performance tests:"
	@echo "  - Cache hit latency (target: <50ms)"
	@echo "  - Cache miss latency (target: <140ms)"
	@echo "  - Tool execution (target: <10ms)"
	@echo "  - Overall response (target: <100ms)"
	@echo "  - Cost reduction validation"
	@echo "  - Throughput testing"
	@echo ""
	@echo "Commands:"
	@echo "  make benchmark         - Run all performance tests"
	@echo "  make validate-targets  - Check if targets are met"
	@echo "  make load-test         - Run load testing"
	@echo "  make stress-test       - Run stress testing"

help-coverage:
	@echo "📊 Coverage Testing Help"
	@echo "======================="
	@echo ""
	@echo "Coverage targets:"
	@echo "  - Unit test coverage: >90%"
	@echo "  - Integration coverage: >80%"
	@echo "  - Overall coverage: >85%"
	@echo ""
	@echo "Commands:"
	@echo "  make coverage         - Generate coverage report"
	@echo "  make test-unit        - Run tests with coverage"