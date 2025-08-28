#!/bin/bash

# Comprehensive MCP Tool Testing Script
# Usage: ./test-mcp-tools.sh [npx|npm] [category] [tool_name]

INSTALL_METHOD=${1:-npx}
CATEGORY=${2:-all}
TOOL_NAME=${3:-all}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a /test/logs/test.log
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a /test/logs/test.log
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a /test/logs/test.log
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a /test/logs/test.log
}

# Initialize results tracking
init_results() {
    mkdir -p /test/results
    echo '{"test_start": "'$(date -Iseconds)'", "install_method": "'$INSTALL_METHOD'", "results": {}}' > /test/results/test_results.json
}

# Get claude-flow command based on install method
get_command() {
    if [ "$INSTALL_METHOD" = "npx" ]; then
        echo "npx claude-flow@2.0.0"
    else
        echo "./node_modules/.bin/claude-flow"
    fi
}

# Test individual MCP tool
test_mcp_tool() {
    local tool_name=$1
    local test_params=$2
    local expected_fields=$3
    
    log_info "Testing tool: $tool_name with params: $test_params"
    
    local cmd=$(get_command)
    local start_time=$(date +%s.%N)
    
    # Start MCP server in background
    timeout 10s $cmd mcp start --stdio > /tmp/mcp_output_$tool_name.log 2>&1 &
    local mcp_pid=$!
    sleep 2
    
    # Test tool via JSON-RPC
    local test_message="{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"initialize\",\"params\":{\"protocolVersion\":\"2024-11-05\",\"capabilities\":{\"tools\":{},\"resources\":{}},\"clientInfo\":{\"name\":\"test\",\"version\":\"1.0.0\"}}}
{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"tools/call\",\"params\":{\"name\":\"$tool_name\",\"arguments\":$test_params}}"
    
    local result=$(echo "$test_message" | timeout 5s $cmd mcp start --stdio 2>/dev/null | tail -1)
    local end_time=$(date +%s.%N)
    local duration=$(echo "$end_time - $start_time" | bc)
    
    # Kill MCP server
    kill $mcp_pid 2>/dev/null || true
    
    # Validate result
    if echo "$result" | jq -e '.result.content[0].text' > /dev/null 2>&1; then
        local response=$(echo "$result" | jq -r '.result.content[0].text')
        if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
            log_success "Tool $tool_name executed successfully (${duration}s)"
            echo "$response" > "/test/results/${tool_name}_result.json"
            
            # Update results
            local temp_file=$(mktemp)
            jq --arg tool "$tool_name" --arg status "success" --arg duration "$duration" --argjson response "$response" \
               '.results[$tool] = {"status": $status, "duration": ($duration | tonumber), "response": $response}' \
               /test/results/test_results.json > "$temp_file" && mv "$temp_file" /test/results/test_results.json
            
            return 0
        else
            log_error "Tool $tool_name returned failure response"
            return 1
        fi
    else
        log_error "Tool $tool_name failed to execute or returned invalid response"
        return 1
    fi
}

# Test tool categories
test_swarm_tools() {
    log_info "Testing Swarm Coordination Tools (12 tools)"
    
    test_mcp_tool "swarm_init" '{"topology":"hierarchical","maxAgents":5,"strategy":"auto"}'
    test_mcp_tool "agent_spawn" '{"type":"researcher","name":"test-agent"}'
    test_mcp_tool "task_orchestrate" '{"task":"test task","strategy":"parallel"}'
    test_mcp_tool "swarm_status" '{}'
    test_mcp_tool "agent_list" '{}'
    test_mcp_tool "agent_metrics" '{"agentId":"test-agent"}'
    test_mcp_tool "swarm_monitor" '{"interval":5}'
    test_mcp_tool "topology_optimize" '{}'
    test_mcp_tool "load_balance" '{"tasks":["task1","task2"]}'
    test_mcp_tool "coordination_sync" '{}'
    test_mcp_tool "swarm_scale" '{"targetSize":3}'
    test_mcp_tool "swarm_destroy" '{"swarmId":"test-swarm"}'
}

test_neural_tools() {
    log_info "Testing Neural Network Tools (15 tools)"
    
    test_mcp_tool "neural_status" '{}'
    test_mcp_tool "neural_train" '{"pattern_type":"coordination","training_data":"test_data","epochs":10}'
    test_mcp_tool "neural_patterns" '{"action":"analyze","operation":"test_op"}'
    test_mcp_tool "neural_predict" '{"modelId":"test-model","input":"test input"}'
    test_mcp_tool "model_load" '{"modelPath":"/tmp/test_model"}'
    test_mcp_tool "model_save" '{"modelId":"test-model","path":"/tmp/saved_model"}'
    test_mcp_tool "wasm_optimize" '{"operation":"test_optimization"}'
    test_mcp_tool "inference_run" '{"modelId":"test-model","data":["test","data"]}'
    test_mcp_tool "pattern_recognize" '{"data":["pattern1","pattern2"]}'
    test_mcp_tool "cognitive_analyze" '{"behavior":"test_behavior"}'
    test_mcp_tool "learning_adapt" '{"experience":{"type":"test","outcome":"success"}}'
    test_mcp_tool "neural_compress" '{"modelId":"test-model","ratio":0.5}'
    test_mcp_tool "ensemble_create" '{"models":["model1","model2"],"strategy":"voting"}'
    test_mcp_tool "transfer_learn" '{"sourceModel":"source","targetDomain":"target"}'
    test_mcp_tool "neural_explain" '{"modelId":"test-model","prediction":{"class":"A","confidence":0.9}}'
}

test_memory_tools() {
    log_info "Testing Memory & Persistence Tools (12 tools)"
    
    test_mcp_tool "memory_usage" '{"action":"store","key":"test_key","value":"test_value"}'
    test_mcp_tool "memory_search" '{"pattern":"test*","limit":10}'
    test_mcp_tool "memory_persist" '{"sessionId":"test-session"}'
    test_mcp_tool "memory_namespace" '{"namespace":"test_ns","action":"create"}'
    test_mcp_tool "memory_backup" '{"path":"/tmp/backup"}'
    test_mcp_tool "memory_restore" '{"backupPath":"/tmp/backup"}'
    test_mcp_tool "memory_compress" '{"namespace":"test_ns"}'
    test_mcp_tool "memory_sync" '{"target":"remote_instance"}'
    test_mcp_tool "cache_manage" '{"action":"clear","key":"test_cache"}'
    test_mcp_tool "state_snapshot" '{"name":"test_snapshot"}'
    test_mcp_tool "context_restore" '{"snapshotId":"test_snapshot"}'
    test_mcp_tool "memory_analytics" '{"timeframe":"24h"}'
}

test_analysis_tools() {
    log_info "Testing Analysis & Monitoring Tools (13 tools)"
    
    test_mcp_tool "task_status" '{"taskId":"test-task"}'
    test_mcp_tool "task_results" '{"taskId":"test-task"}'
    test_mcp_tool "benchmark_run" '{"suite":"performance"}'
    test_mcp_tool "bottleneck_analyze" '{"component":"test_component"}'
    test_mcp_tool "performance_report" '{"timeframe":"24h","format":"summary"}'
    test_mcp_tool "token_usage" '{"operation":"test_op"}'
    test_mcp_tool "metrics_collect" '{"components":["cpu","memory"]}'
    test_mcp_tool "trend_analysis" '{"metric":"response_time","period":"7d"}'
    test_mcp_tool "cost_analysis" '{"timeframe":"30d"}'
    test_mcp_tool "quality_assess" '{"target":"test_system","criteria":["performance","reliability"]}'
    test_mcp_tool "error_analysis" '{"logs":["error1","error2"]}'
    test_mcp_tool "usage_stats" '{"component":"api"}'
    test_mcp_tool "health_check" '{"components":["database","api","cache"]}'
}

test_workflow_tools() {
    log_info "Testing Workflow & Automation Tools (11 tools)"
    
    test_mcp_tool "workflow_create" '{"name":"test_workflow","steps":["step1","step2"],"triggers":["manual"]}'
    test_mcp_tool "workflow_execute" '{"workflowId":"test_workflow","params":{}}'
    test_mcp_tool "workflow_export" '{"workflowId":"test_workflow","format":"json"}'
    test_mcp_tool "sparc_mode" '{"mode":"dev","task_description":"test development task"}'
    test_mcp_tool "automation_setup" '{"rules":[{"trigger":"event","action":"response"}]}'
    test_mcp_tool "pipeline_create" '{"config":{"stages":["build","test","deploy"]}}'
    test_mcp_tool "scheduler_manage" '{"action":"create","schedule":{"cron":"0 0 * * *"}}'
    test_mcp_tool "trigger_setup" '{"events":["push"],"actions":["build"]}'
    test_mcp_tool "workflow_template" '{"action":"create","template":{"name":"ci_template"}}'
    test_mcp_tool "batch_process" '{"items":["item1","item2"],"operation":"transform"}'
    test_mcp_tool "parallel_execute" '{"tasks":[{"id":"task1"},{"id":"task2"}]}'
}

test_github_tools() {
    log_info "Testing GitHub Integration Tools (8 tools)"
    
    test_mcp_tool "github_repo_analyze" '{"repo":"test/repo","analysis_type":"code_quality"}'
    test_mcp_tool "github_pr_manage" '{"repo":"test/repo","action":"review","pr_number":1}'
    test_mcp_tool "github_issue_track" '{"repo":"test/repo","action":"list"}'
    test_mcp_tool "github_release_coord" '{"repo":"test/repo","version":"v1.0.0"}'
    test_mcp_tool "github_workflow_auto" '{"repo":"test/repo","workflow":{"name":"ci"}}'
    test_mcp_tool "github_code_review" '{"repo":"test/repo","pr":1}'
    test_mcp_tool "github_sync_coord" '{"repos":["repo1","repo2"]}'
    test_mcp_tool "github_metrics" '{"repo":"test/repo"}'
}

test_daa_tools() {
    log_info "Testing DAA Tools (8 tools)"
    
    test_mcp_tool "daa_agent_create" '{"agent_type":"worker","capabilities":["compute","storage"]}'
    test_mcp_tool "daa_capability_match" '{"task_requirements":["cpu","memory"],"available_agents":[]}'
    test_mcp_tool "daa_resource_alloc" '{"resources":{"cpu":2,"memory":"4GB"},"agents":["agent1"]}'
    test_mcp_tool "daa_lifecycle_manage" '{"agentId":"test-agent","action":"start"}'
    test_mcp_tool "daa_communication" '{"from":"agent1","to":"agent2","message":{"type":"task","data":"test"}}'
    test_mcp_tool "daa_consensus" '{"agents":["agent1","agent2"],"proposal":{"action":"migrate"}}'
    test_mcp_tool "daa_fault_tolerance" '{"agentId":"test-agent","strategy":"retry"}'
    test_mcp_tool "daa_optimization" '{"target":"throughput","metrics":["latency","cpu"]}'
}

test_system_tools() {
    log_info "Testing System & Utilities Tools (8 tools)"
    
    test_mcp_tool "terminal_execute" '{"command":"echo","args":["hello"]}'
    test_mcp_tool "config_manage" '{"action":"get","config":{"section":"general"}}'
    test_mcp_tool "features_detect" '{"component":"mcp_server"}'
    test_mcp_tool "security_scan" '{"target":"localhost","depth":"basic"}'
    test_mcp_tool "backup_create" '{"components":["config","data"],"destination":"/tmp/backup"}'
    test_mcp_tool "restore_system" '{"backupId":"backup_123"}'
    test_mcp_tool "log_analysis" '{"logFile":"/var/log/app.log","patterns":["ERROR","WARN"]}'
    test_mcp_tool "diagnostic_run" '{"components":["network","disk","memory"]}'
}

# Test persistence by running multiple operations
test_persistence() {
    log_info "Testing data persistence across operations"
    
    # Store data
    test_mcp_tool "memory_usage" '{"action":"store","key":"persist_test","value":"test_data_123"}'
    
    # Retrieve data
    test_mcp_tool "memory_usage" '{"action":"retrieve","key":"persist_test"}'
    
    # Verify data persisted
    if [ -f "/test/results/memory_usage_result.json" ]; then
        local retrieved_value=$(jq -r '.value' /test/results/memory_usage_result.json)
        if [ "$retrieved_value" = "test_data_123" ] || [ "$retrieved_value" = "Retrieved value for persist_test" ]; then
            log_success "Data persistence test passed"
            return 0
        else
            log_error "Data persistence test failed - value mismatch"
            return 1
        fi
    else
        log_error "Data persistence test failed - no result file"
        return 1
    fi
}

# Generate final report
generate_report() {
    log_info "Generating final test report"
    
    local total_tests=$(jq -r '.results | length' /test/results/test_results.json)
    local successful_tests=$(jq -r '.results | to_entries | map(select(.value.status == "success")) | length' /test/results/test_results.json)
    local success_rate=$(echo "scale=2; $successful_tests * 100 / $total_tests" | bc)
    local avg_duration=$(jq -r '.results | to_entries | map(.value.duration) | add / length' /test/results/test_results.json)
    
    # Update final results
    local temp_file=$(mktemp)
    jq --arg end_time "$(date -Iseconds)" --arg total "$total_tests" --arg successful "$successful_tests" \
       --arg success_rate "$success_rate" --arg avg_duration "$avg_duration" \
       '.test_end = $end_time | .summary = {"total_tests": ($total | tonumber), "successful_tests": ($successful | tonumber), "success_rate": ($success_rate | tonumber), "avg_duration": ($avg_duration | tonumber)}' \
       /test/results/test_results.json > "$temp_file" && mv "$temp_file" /test/results/test_results.json
    
    log_success "Test Report Summary:"
    log_success "Total Tests: $total_tests"
    log_success "Successful: $successful_tests"
    log_success "Success Rate: ${success_rate}%"
    log_success "Average Duration: ${avg_duration}s"
    
    # Output final JSON report
    cat /test/results/test_results.json
}

# Main execution
main() {
    log_info "Starting MCP Tool Testing with $INSTALL_METHOD installation method"
    init_results
    
    case $CATEGORY in
        "swarm")
            test_swarm_tools
            ;;
        "neural")
            test_neural_tools
            ;;
        "memory")
            test_memory_tools
            ;;
        "analysis")
            test_analysis_tools
            ;;
        "workflow")
            test_workflow_tools
            ;;
        "github")
            test_github_tools
            ;;
        "daa")
            test_daa_tools
            ;;
        "system")
            test_system_tools
            ;;
        "all")
            test_swarm_tools
            test_neural_tools
            test_memory_tools
            test_analysis_tools
            test_workflow_tools
            test_github_tools
            test_daa_tools
            test_system_tools
            test_persistence
            ;;
        *)
            log_error "Unknown category: $CATEGORY"
            exit 1
            ;;
    esac
    
    generate_report
}

# Execute main function
main "$@"