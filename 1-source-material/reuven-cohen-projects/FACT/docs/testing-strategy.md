# FACT System Testing Strategy

## 1. Test-Driven Development Approach

### 1.1 TDD Anchors Implementation
The pseudocode includes comprehensive TDD anchors that serve as test specifications. Each anchor follows the format:
```
// TEST: [behavior description]
```

These anchors define:
- **Expected Behavior**: What the function should do
- **Input Conditions**: Valid and invalid input scenarios
- **Output Expectations**: Expected return values and side effects
- **Error Conditions**: How errors should be handled
- **Performance Requirements**: Latency and throughput expectations

### 1.2 Test Categories

#### Unit Tests
- **Module-Level Testing**: Individual functions and classes
- **Validation Logic**: Input/output validation functions
- **Error Handling**: Exception scenarios and recovery
- **Security Checks**: Authorization and input sanitization

#### Integration Tests
- **API Integration**: Claude Sonnet-4 and Arcade.dev connectivity
- **Database Integration**: SQLite connection and query execution
- **Cache Integration**: Cache read/write operations
- **Tool Integration**: End-to-end tool execution flows

#### Performance Tests
- **Latency Benchmarks**: Cache hit/miss response times
- **Throughput Testing**: Concurrent query processing
- **Load Testing**: System behavior under stress
- **Cost Optimization**: Token usage efficiency

#### Security Tests
- **Input Validation**: SQL injection and path traversal prevention
- **Authorization Testing**: OAuth flow and permission validation
- **Data Sanitization**: Output cleaning and error message safety
- **Access Control**: Tool execution permission enforcement

## 2. Core Module Test Suite

### 2.1 Driver Module Tests
```python
# Based on TDD anchors from pseudocode-core.md

class TestFactDriver:
    """Test suite for main driver functionality"""
    
    def test_environment_configuration_loads_correctly(self):
        """TEST: Verify environment configuration loads correctly"""
        # Arrange
        mock_env = {
            "ANTHROPIC_API_KEY": "test-anthropic-key",
            "ARCADE_API_KEY": "test-arcade-key",
            "ARCADE_URL": "http://localhost:9099"
        }
        
        # Act
        with patch.dict(os.environ, mock_env):
            anthropic_client, arcade_client, cache_prefix, system_prompt = initialize_system()
        
        # Assert
        assert anthropic_client is not None
        assert arcade_client is not None
        assert cache_prefix == "fact_v1"
        assert "deterministic finance assistant" in system_prompt.lower()
    
    def test_configuration_validation_catches_missing_keys(self):
        """TEST: Configuration validation catches missing keys"""
        # Arrange
        incomplete_env = {"ANTHROPIC_API_KEY": "test-key"}
        
        # Act & Assert
        with patch.dict(os.environ, incomplete_env, clear=True):
            with pytest.raises(ConfigurationError) as exc_info:
                validate_configuration()
            
            assert "Missing required key" in str(exc_info.value)
            assert "ARCADE_API_KEY" in str(exc_info.value)
    
    def test_tool_schema_export_returns_valid_schemas(self):
        """TEST: Tool schema export returns valid schemas"""
        # Arrange
        mock_arcade_client = Mock()
        expected_schema = [{"type": "function", "function": {"name": "test_tool"}}]
        mock_arcade_client.tools.export_schema.return_value = expected_schema
        
        # Act
        with patch('driver.arcade_client', mock_arcade_client):
            schemas = get_tool_schemas()
        
        # Assert
        assert schemas == expected_schema
        assert isinstance(schemas, list)
        assert len(schemas) > 0
    
    def test_query_processing_handles_both_cache_hits_and_misses(self):
        """TEST: Query processing handles both cache hits and misses"""
        # Arrange
        mock_anthropic = AsyncMock()
        mock_response = Mock()
        mock_response.content = "Test response"
        mock_response.tool_calls = None
        mock_anthropic.messages.create.return_value = mock_response
        
        # Act
        with patch('driver.anthropic_client', mock_anthropic):
            result = await process_user_query("What is the revenue?")
        
        # Assert
        assert result == "Test response"
        mock_anthropic.messages.create.assert_called_once()
        call_args = mock_anthropic.messages.create.call_args
        assert call_args[1]['cache_control']['mode'] == 'read'
        assert call_args[1]['cache_control']['prefix'] == 'fact_v1'
    
    def test_tool_call_execution_handles_success_and_failure_cases(self):
        """TEST: Tool call execution handles success and failure cases"""
        # Arrange
        mock_tool_call = Mock()
        mock_tool_call.name = "SQL.QueryReadonly"
        mock_tool_call.id = "test-call-id"
        mock_tool_call.arguments = '{"statement": "SELECT * FROM revenue"}'
        
        mock_arcade = Mock()
        mock_arcade.tools.execute.return_value = {"rows": [], "row_count": 0}
        
        # Act
        with patch('driver.arcade_client', mock_arcade):
            results = await execute_tool_calls([mock_tool_call])
        
        # Assert
        assert len(results) == 1
        assert results[0]['role'] == 'tool'
        assert results[0]['tool_call_id'] == 'test-call-id'
        
        # Test failure case
        mock_arcade.tools.execute.side_effect = Exception("Tool execution failed")
        
        results = await execute_tool_calls([mock_tool_call])
        result_content = json.loads(results[0]['content'])
        assert 'error' in result_content
        assert 'Tool execution failed' in result_content['details']
    
    def test_cli_handles_user_input_and_graceful_shutdown(self):
        """TEST: CLI handles user input and graceful shutdown"""
        # Arrange
        mock_input_sequence = ["What is Q1 revenue?", KeyboardInterrupt()]
        
        # Act & Assert
        with patch('builtins.input', side_effect=mock_input_sequence):
            with patch('driver.process_user_query', return_value="$1,234,567"):
                with pytest.raises(SystemExit):
                    await run_interactive_cli()
    
    def test_main_entry_point_initializes_system_correctly(self):
        """TEST: Main entry point initializes system correctly"""
        # Arrange
        with patch('driver.initialize_system') as mock_init:
            with patch('driver.validate_configuration') as mock_validate:
                with patch('driver.run_interactive_cli') as mock_cli:
                    mock_cli.side_effect = KeyboardInterrupt()
                    
                    # Act
                    with pytest.raises(SystemExit):
                        await main()
                    
                    # Assert
                    mock_init.assert_called_once()
                    mock_validate.assert_called_once()
                    mock_cli.assert_called_once()
```

### 2.2 Cache Management Tests
```python
class TestCacheManager:
    """Test suite for cache management functionality"""
    
    def test_cache_initialization_creates_proper_cache_entries(self):
        """TEST: Cache initialization creates proper cache entries"""
        # Arrange
        prefix = "fact_v1"
        content = "A" * 500  # Minimum 500 tokens
        
        # Act
        cache_entry = initialize_cache(prefix, content)
        
        # Assert
        assert cache_entry['prefix'] == prefix
        assert cache_entry['content'] == content
        assert cache_entry['token_count'] >= 500
        assert 'created_at' in cache_entry
        assert 'version' in cache_entry
    
    def test_cache_lookup_returns_hit_miss_status_correctly(self):
        """TEST: Cache lookup returns hit/miss status correctly"""
        # Arrange
        query_hash = "test_query_hash"
        prefix = "fact_v1"
        
        # Act - Cache miss scenario
        status, entry = check_cache_status(query_hash, prefix)
        
        # Assert
        assert status == "miss"
        assert entry is None
        
        # Simulate cache hit
        with patch('cache_manager.cache_entry_exists', return_value=True):
            status, entry = check_cache_status(query_hash, prefix)
            assert status == "hit"
            assert entry is not None
    
    def test_cache_metrics_calculation_is_accurate(self):
        """TEST: Cache metrics calculation is accurate"""
        # Arrange
        cache_entries = [
            {'access_count': 10, 'last_accessed': datetime.now()},
            {'access_count': 5, 'last_accessed': datetime.now()},
            {'access_count': 0, 'last_accessed': None}
        ]
        
        # Act
        metrics = calculate_cache_metrics(cache_entries)
        
        # Assert
        assert metrics['total_requests'] == 15
        assert metrics['hit_rate'] == (2/3) * 100  # 2 out of 3 entries accessed
        assert 'average_hit_latency' in metrics
        assert 'cost_savings' in metrics
    
    def test_cache_warming_improves_subsequent_performance(self):
        """TEST: Cache warming improves subsequent performance"""
        # Arrange
        common_queries = ["What is Q1 revenue?", "Show quarterly summary"]
        
        # Act
        with patch('cache_manager.process_user_query') as mock_process:
            mock_process.return_value = "Cached response"
            warm_cache(common_queries)
        
        # Assert
        assert mock_process.call_count == len(common_queries)
        for query in common_queries:
            mock_process.assert_any_call(query)
    
    def test_cache_invalidation_removes_stale_entries(self):
        """TEST: Cache invalidation removes stale entries"""
        # Arrange
        prefix = "fact_v1"
        reason = "Schema updated"
        
        # Act
        with patch('cache_manager.FIND') as mock_find:
            with patch('cache_manager.CLEANUP') as mock_cleanup:
                mock_cache_entry = {'is_valid': True}
                mock_find.return_value = mock_cache_entry
                
                invalidate_cache(prefix, reason)
        
        # Assert
        assert mock_cache_entry['is_valid'] == False
        assert mock_cache_entry['invalidation_reason'] == reason
        mock_cleanup.assert_called_once()
```

### 2.3 SQL Tool Tests
```python
class TestSQLQueryTool:
    """Test suite for SQL query tool functionality"""
    
    def test_sql_validation_prevents_non_select_statements(self):
        """TEST: SQL validation prevents non-SELECT statements"""
        # Arrange
        dangerous_queries = [
            "DROP TABLE revenue",
            "INSERT INTO revenue VALUES (1, 2)",
            "UPDATE revenue SET value = 0",
            "DELETE FROM revenue"
        ]
        
        # Act & Assert
        for query in dangerous_queries:
            with pytest.raises(SecurityError):
                validate_sql_query(query)
    
    def test_query_execution_returns_structured_results(self):
        """TEST: Query execution returns structured results"""
        # Arrange
        test_db = ":memory:"
        query = "SELECT 'Q1-2025' as quarter, 1234567.89 as value"
        
        # Act
        with patch('sql_tool.sqlite3.connect') as mock_connect:
            mock_cursor = Mock()
            mock_cursor.fetchall.return_value = [('Q1-2025', 1234567.89)]
            mock_cursor.description = [('quarter', None), ('value', None)]
            
            mock_conn = Mock()
            mock_conn.execute.return_value = mock_cursor
            mock_connect.return_value = mock_conn
            
            result = execute_sql_query(query, test_db)
        
        # Assert
        assert 'rows' in result
        assert 'row_count' in result
        assert 'columns' in result
        assert result['rows'][0]['quarter'] == 'Q1-2025'
        assert result['rows'][0]['value'] == 1234567.89
    
    def test_connection_pool_manages_database_connections_efficiently(self):
        """TEST: Connection pool manages database connections efficiently"""
        # Arrange
        pool = DatabaseConnectionPool(":memory:", max_connections=2)
        
        # Act
        conn1 = pool.acquire_connection()
        conn2 = pool.acquire_connection()
        
        # Assert
        assert pool.active_connections == 2
        assert conn1 is not None
        assert conn2 is not None
        
        # Test pool exhaustion
        with patch('sql_tool.CREATE') as mock_create:
            mock_create.side_effect = Exception("Pool exhausted")
            
            # Should wait when pool is full
            with pytest.raises(Exception):
                pool.acquire_connection()
    
    def test_connection_release_returns_connections_to_pool(self):
        """TEST: Connection release returns connections to pool"""
        # Arrange
        pool = DatabaseConnectionPool(":memory:")
        conn = pool.acquire_connection()
        
        # Act
        pool.release_connection(conn)
        
        # Assert
        assert pool.active_connections == 0
        assert len(pool.pool) == 1
    
    def test_tool_registration_creates_proper_arcade_tool_definition(self):
        """TEST: Tool registration creates proper Arcade tool definition"""
        # Arrange & Act
        tool_def = create_sql_tool_definition()
        
        # Assert
        assert hasattr(tool_def, 'metadata')
        assert tool_def.metadata['name'] == 'SQL.QueryReadonly'
        assert 'description' in tool_def.metadata
        assert 'parameters' in tool_def.metadata
    
    def test_command_line_registration_uploads_tool_successfully(self):
        """TEST: Command line registration uploads tool successfully"""
        # Arrange
        mock_args = Mock()
        mock_args.register = True
        
        # Act
        with patch('sql_tool.arcade_client') as mock_client:
            with patch('sys.argv', ['sql_tool.py', '--register']):
                handle_registration_command()
        
        # Assert
        mock_client.tools.upload.assert_called_once()
```

## 3. Integration Test Suite

### 3.1 End-to-End Workflow Tests
```python
class TestEndToEndWorkflow:
    """Integration tests for complete FACT workflow"""
    
    @pytest.mark.integration
    async def test_complete_query_processing_workflow(self):
        """Test complete query from input to response"""
        # Arrange
        test_query = "What was Q1-2025 revenue?"
        expected_data = {"quarter": "Q1-2025", "value": 1234567.89}
        
        # Act
        with test_environment():
            response = await process_user_query(test_query)
        
        # Assert
        assert "1234567.89" in response
        assert "Q1-2025" in response
    
    @pytest.mark.integration
    def test_tool_registration_and_discovery_flow(self):
        """Test tool registration and subsequent discovery"""
        # Arrange
        test_tool = create_test_tool()
        
        # Act
        register_tool(test_tool)
        discovered_tools = discover_available_tools()
        schemas = export_tool_schemas()
        
        # Assert
        assert test_tool.metadata['name'] in [t.name for t in discovered_tools]
        assert any(s['function']['name'] == test_tool.metadata['name'] for s in schemas)
    
    @pytest.mark.integration
    async def test_authorization_flow_with_oauth(self):
        """Test complete OAuth authorization flow"""
        # Arrange
        user_id = "test@example.com"
        tool_name = "TestTool.Protected"
        scopes = ["read", "write"]
        
        # Act
        auth_flow = auth_manager.initiate_authorization(user_id, tool_name, scopes)
        # Simulate OAuth callback
        authorization = auth_manager.complete_authorization(
            auth_flow['flow_id'], 
            "test_auth_code"
        )
        
        # Assert
        assert authorization['user_id'] == user_id
        assert authorization['tool_name'] == tool_name
        assert set(authorization['scopes']) == set(scopes)
```

### 3.2 Performance Benchmark Tests
```python
class TestPerformanceBenchmarks:
    """Performance and latency benchmark tests"""
    
    @pytest.mark.performance
    async def test_cache_hit_latency_under_50ms(self):
        """Verify cache hits achieve target latency"""
        # Arrange
        warm_cache(["Test query for cache hit"])
        
        # Act
        start_time = time.perf_counter()
        response = await process_user_query("Test query for cache hit")
        end_time = time.perf_counter()
        
        latency_ms = (end_time - start_time) * 1000
        
        # Assert
        assert latency_ms < 50, f"Cache hit latency {latency_ms}ms exceeds 50ms target"
        assert response is not None
    
    @pytest.mark.performance
    async def test_cache_miss_latency_under_140ms(self):
        """Verify cache misses achieve target latency"""
        # Arrange
        unique_query = f"Unique query {uuid.uuid4()}"
        
        # Act
        start_time = time.perf_counter()
        response = await process_user_query(unique_query)
        end_time = time.perf_counter()
        
        latency_ms = (end_time - start_time) * 1000
        
        # Assert
        assert latency_ms < 140, f"Cache miss latency {latency_ms}ms exceeds 140ms target"
        assert response is not None
    
    @pytest.mark.performance
    def test_tool_execution_under_10ms_lan(self):
        """Verify tool execution meets LAN latency targets"""
        # Arrange
        sql_query = "SELECT 1 as test_value"
        
        # Act
        start_time = time.perf_counter()
        result = execute_sql_query(sql_query, ":memory:")
        end_time = time.perf_counter()
        
        latency_ms = (end_time - start_time) * 1000
        
        # Assert
        assert latency_ms < 10, f"Tool execution latency {latency_ms}ms exceeds 10ms target"
        assert result['status'] == 'success'
    
    @pytest.mark.performance
    async def test_concurrent_query_processing(self):
        """Test system behavior under concurrent load"""
        # Arrange
        queries = [f"SELECT {i} as test_value" for i in range(10)]
        
        # Act
        start_time = time.perf_counter()
        results = await asyncio.gather(*[
            process_user_query(f"Query: {query}") 
            for query in queries
        ])
        end_time = time.perf_counter()
        
        total_time = end_time - start_time
        
        # Assert
        assert len(results) == 10
        assert all(result is not None for result in results)
        assert total_time < 2.0, f"Concurrent processing took {total_time}s, expected <2s"
```

## 4. Security Test Suite

### 4.1 Input Validation Tests
```python
class TestSecurityValidation:
    """Security-focused validation tests"""
    
    def test_sql_injection_prevention(self):
        """Test SQL injection attack prevention"""
        # Arrange
        malicious_queries = [
            "SELECT * FROM revenue; DROP TABLE revenue; --",
            "SELECT * FROM revenue WHERE 1=1 OR 1=1",
            "SELECT * FROM revenue UNION SELECT * FROM users",
            "'; EXEC xp_cmdshell('dir'); --"
        ]
        
        # Act & Assert
        for query in malicious_queries:
            with pytest.raises(SecurityViolationError):
                validate_sql_query(query)
    
    def test_path_traversal_prevention(self):
        """Test directory traversal attack prevention"""
        # Arrange
        malicious_paths = [
            "../../../etc/passwd",
            "..\\..\\windows\\system32\\config\\sam",
            "/etc/shadow",
            "~/.ssh/id_rsa"
        ]
        
        # Act & Assert
        for path in malicious_paths:
            with pytest.raises(SecurityViolationError):
                validate_file_path_security(path)
    
    def test_url_security_validation_prevents_internal_access(self):
        """Test prevention of access to internal resources"""
        # Arrange
        dangerous_urls = [
            "http://localhost:80/admin",
            "http://127.0.0.1:8080/status",
            "http://169.254.169.254/metadata",
            "http://10.0.0.1/internal",
            "file:///etc/passwd",
            "ftp://internal.server/data"
        ]
        
        # Act & Assert
        for url in dangerous_urls:
            with pytest.raises(SecurityViolationError):
                validate_url_security(url)
    
    def test_authorization_token_validation(self):
        """Test authorization token validation"""
        # Arrange
        expired_token = create_expired_authorization()
        valid_token = create_valid_authorization()
        
        # Act & Assert
        with pytest.raises(UnauthorizedError):
            validate_authorization_token(expired_token)
        
        assert validate_authorization_token(valid_token) == True
```

### 4.2 Access Control Tests
```python
class TestAccessControl:
    """Access control and permission tests"""
    
    def test_unauthorized_tool_access_blocked(self):
        """Test that unauthorized tool access is properly blocked"""
        # Arrange
        user_id = "unauthorized@example.com"
        protected_tool = "AdminTool.DeleteData"
        
        # Act & Assert
        with pytest.raises(UnauthorizedError):
            validate_tool_access(user_id, protected_tool)
    
    def test_scope_based_authorization_enforcement(self):
        """Test scope-based authorization enforcement"""
        # Arrange
        user_auth = create_authorization_with_scopes(["read"])
        write_operation = "FileSystem.WriteFile"
        
        # Act & Assert
        with pytest.raises(InsufficientScopeError):
            check_operation_authorization(user_auth, write_operation)
    
    def test_audit_logging_captures_security_events(self):
        """Test that security events are properly logged"""
        # Arrange
        with patch('security.audit_logger') as mock_logger:
            
            # Act
            try:
                validate_sql_query("DROP TABLE revenue")
            except SecurityViolationError:
                pass
        
        # Assert
        mock_logger.log_security_violation.assert_called_once()
        args = mock_logger.log_security_violation.call_args[0]
        assert "SQL injection" in args[0] or "dangerous operation" in args[0]
```

## 5. Test Environment and Fixtures

### 5.1 Test Configuration
```python
# conftest.py
import pytest
import asyncio
import tempfile
import os
from unittest.mock import Mock, patch

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
def test_database():
    """Create a temporary test database"""
    with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp:
        db_path = tmp.name
    
    # Initialize test database
    conn = sqlite3.connect(db_path)
    conn.execute("""
        CREATE TABLE revenue (
            quarter TEXT PRIMARY KEY,
            value REAL
        )
    """)
    conn.execute("INSERT INTO revenue VALUES ('Q1-2025', 1234567.89)")
    conn.execute("INSERT INTO revenue VALUES ('Q4-2024', 1133221.55)")
    conn.commit()
    conn.close()
    
    yield db_path
    
    # Cleanup
    os.unlink(db_path)

@pytest.fixture
def mock_anthropic_client():
    """Mock Anthropic client for testing"""
    client = Mock()
    mock_response = Mock()
    mock_response.content = "Test response"
    mock_response.tool_calls = None
    client.messages.create.return_value = mock_response
    return client

@pytest.fixture
def mock_arcade_client():
    """Mock Arcade client for testing"""
    client = Mock()
    client.tools.execute.return_value = {"status": "success", "data": {}}
    client.tools.export_schema.return_value = []
    return client

@pytest.fixture
def test_environment(test_database, mock_anthropic_client, mock_arcade_client):
    """Complete test environment setup"""
    env_vars = {
        "ANTHROPIC_API_KEY": "test-key",
        "ARCADE_API_KEY": "test-key",
        "ARCADE_URL": "http://localhost:9099",
        "FACT_DB": test_database
    }
    
    with patch.dict(os.environ, env_vars):
        with patch('driver.anthropic_client', mock_anthropic_client):
            with patch('driver.arcade_client', mock_arcade_client):
                yield {
                    "database": test_database,
                    "anthropic": mock_anthropic_client,
                    "arcade": mock_arcade_client
                }
```

### 5.2 Test Execution Commands
```bash
# Run all tests
pytest tests/ -v

# Run only unit tests
pytest tests/unit/ -v

# Run integration tests
pytest tests/integration/ -v -m integration

# Run performance benchmarks
pytest tests/performance/ -v -m performance

# Run security tests
pytest tests/security/ -v

# Generate coverage report
pytest tests/ --cov=src --cov-report=html

# Run tests with specific markers
pytest -m "not performance" -v  # Skip performance tests
pytest -m "security or unit" -v  # Run security and unit tests only
```

This comprehensive testing strategy ensures the FACT system meets all functional, performance, and security requirements through systematic validation of each component and integration point.