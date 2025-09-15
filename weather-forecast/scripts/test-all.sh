#!/bin/bash

# Comprehensive test runner script for weather forecast application
set -e

echo "🧪 Starting comprehensive test suite for Weather Forecast App"
echo "============================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "info") echo -e "${BLUE}ℹ️  $message${NC}" ;;
        "success") echo -e "${GREEN}✅ $message${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️  $message${NC}" ;;
        "error") echo -e "${RED}❌ $message${NC}" ;;
    esac
}

# Function to run command with error handling
run_command() {
    local cmd=$1
    local description=$2

    print_status "info" "Running: $description"

    if eval $cmd; then
        print_status "success" "$description completed"
        return 0
    else
        print_status "error" "$description failed"
        return 1
    fi
}

# Check if dependencies are installed
print_status "info" "Checking dependencies..."
if [ ! -d "node_modules" ]; then
    print_status "warning" "Dependencies not found, installing..."
    run_command "npm install" "Installing dependencies"
fi

# Create required directories
mkdir -p coverage test-results playwright-report

print_status "info" "Starting test execution..."

# 1. Unit Tests
echo ""
echo "🔧 Running Unit Tests"
echo "===================="
if run_command "npm run test:unit" "Unit tests"; then
    UNIT_TESTS_PASSED=true
else
    UNIT_TESTS_PASSED=false
fi

# 2. Integration Tests
echo ""
echo "🔗 Running Integration Tests"
echo "=========================="
if run_command "npm run test:integration" "Integration tests"; then
    INTEGRATION_TESTS_PASSED=true
else
    INTEGRATION_TESTS_PASSED=false
fi

# 3. Performance Tests
echo ""
echo "⚡ Running Performance Tests"
echo "========================="
if run_command "npm run test:performance" "Performance tests"; then
    PERFORMANCE_TESTS_PASSED=true
else
    PERFORMANCE_TESTS_PASSED=false
fi

# 4. Generate Coverage Report
echo ""
echo "📊 Generating Coverage Report"
echo "=========================="
if run_command "npm run test:coverage" "Coverage report generation"; then
    COVERAGE_GENERATED=true
else
    COVERAGE_GENERATED=false
fi

# 5. E2E Tests (Playwright)
echo ""
echo "🎭 Running E2E Tests"
echo "=================="
if run_command "npm run test:e2e" "E2E tests"; then
    E2E_TESTS_PASSED=true
else
    E2E_TESTS_PASSED=false
fi

# 6. Cross-Browser Tests
echo ""
echo "🌐 Running Cross-Browser Tests"
echo "============================"
if run_command "npm run test:cross-browser" "Cross-browser compatibility tests"; then
    CROSS_BROWSER_TESTS_PASSED=true
else
    CROSS_BROWSER_TESTS_PASSED=false
fi

# Generate comprehensive report
echo ""
echo "📋 Test Results Summary"
echo "====================="

total_tests=6
passed_tests=0

# Check each test category
if [ "$UNIT_TESTS_PASSED" = true ]; then
    print_status "success" "Unit Tests: PASSED"
    ((passed_tests++))
else
    print_status "error" "Unit Tests: FAILED"
fi

if [ "$INTEGRATION_TESTS_PASSED" = true ]; then
    print_status "success" "Integration Tests: PASSED"
    ((passed_tests++))
else
    print_status "error" "Integration Tests: FAILED"
fi

if [ "$PERFORMANCE_TESTS_PASSED" = true ]; then
    print_status "success" "Performance Tests: PASSED"
    ((passed_tests++))
else
    print_status "error" "Performance Tests: FAILED"
fi

if [ "$COVERAGE_GENERATED" = true ]; then
    print_status "success" "Coverage Report: GENERATED"
    ((passed_tests++))
else
    print_status "error" "Coverage Report: FAILED"
fi

if [ "$E2E_TESTS_PASSED" = true ]; then
    print_status "success" "E2E Tests: PASSED"
    ((passed_tests++))
else
    print_status "error" "E2E Tests: FAILED"
fi

if [ "$CROSS_BROWSER_TESTS_PASSED" = true ]; then
    print_status "success" "Cross-Browser Tests: PASSED"
    ((passed_tests++))
else
    print_status "error" "Cross-Browser Tests: FAILED"
fi

echo ""
echo "📈 Overall Results"
echo "=================="
echo "Passed: $passed_tests/$total_tests test categories"

# Calculate success percentage
success_rate=$((passed_tests * 100 / total_tests))
echo "Success Rate: $success_rate%"

# Show available reports
echo ""
echo "📁 Generated Reports"
echo "=================="
if [ -d "coverage" ]; then
    echo "📊 Coverage Report: ./coverage/lcov-report/index.html"
fi
if [ -d "playwright-report" ]; then
    echo "🎭 E2E Test Report: ./playwright-report/index.html"
fi
if [ -f "test-results/results.json" ]; then
    echo "📋 Test Results JSON: ./test-results/results.json"
fi

# Open reports if requested
if [ "$1" = "--open-reports" ]; then
    print_status "info" "Opening test reports..."
    if command -v xdg-open > /dev/null; then
        xdg-open coverage/lcov-report/index.html 2>/dev/null &
        xdg-open playwright-report/index.html 2>/dev/null &
    elif command -v open > /dev/null; then
        open coverage/lcov-report/index.html 2>/dev/null &
        open playwright-report/index.html 2>/dev/null &
    fi
fi

# Exit with appropriate code
if [ $success_rate -ge 80 ]; then
    print_status "success" "Test suite completed successfully! 🎉"
    exit 0
elif [ $success_rate -ge 60 ]; then
    print_status "warning" "Test suite completed with warnings. Consider investigating failures."
    exit 1
else
    print_status "error" "Test suite failed. Multiple test categories failed."
    exit 1
fi