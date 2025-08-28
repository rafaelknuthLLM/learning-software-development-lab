# FACT System Critical Components - Detailed Pseudocode Specifications

## Overview

This document provides comprehensive pseudocode specifications for the critical missing components identified in the FACT system implementation plan. Each component includes detailed design patterns, error handling, testing anchors, and integration points.

## 1. Tool Registry - Complete Implementation

**File:** [`src/tools/registry.py`](src/tools/registry.py:1)

```python
# Tool Registry - Central tool discovery and management system
class ToolRegistry:
    """
    Central registry for tool discovery, registration, and metadata management.
    Provides thread-safe operations for concurrent tool access.
    """
    
    def __init__(self, config: RegistryConfig):
        # TEST: Registry initialization with proper configuration
        self.config = config
        self.tools = ConcurrentDict()  # Thread-safe tool storage
        self.schema_cache = LRUCache(maxsize=1000)
        self.lock = ReadWriteLock()
        self.logger = get_structured_logger("tool_registry")
    
    async def register_tool(self, tool_definition: ToolDefinition) -> bool:
        """
        Register a new tool with validation and schema generation.
        
        Args:
            tool_definition: Complete tool specification with metadata
            
        Returns:
            bool: Success status of registration
        """
        # TEST: Tool registration succeeds with valid definition
        # TEST: Tool registration fails with invalid definition
        # TEST: Tool registration prevents duplicate tool IDs
        
        async with self.lock.write():
            # Validate tool definition structure
            validation_result = await self._validate_tool_definition(tool_definition)
            if not validation_result.is_valid:
                self.logger.error("Tool validation failed", 
                                tool_id=tool_definition.id,
                                errors=validation_result.errors)
                return False
            
            # Generate and cache tool schema for Claude integration
            schema = await self._generate_tool_schema(tool_definition)
            
            # Store tool with metadata
            tool_entry = RegisteredTool(
                definition=tool_definition,
                schema=schema,
                registered_at=datetime.utcnow(),
                status=ToolStatus.ACTIVE
            )
            
            self.tools[tool_definition.id] = tool_entry
            self.schema_cache[tool_definition.id] = schema
            
            self.logger.info("Tool registered successfully",
                           tool_id=tool_definition.id,
                           version=tool_definition.version)
            return True
    
    async def discover_tools(self, query: ToolQuery) -> List[ToolDefinition]:
        """
        Discover tools based on query criteria.
        
        Args:
            query: Search criteria including categories, capabilities, filters
            
        Returns:
            List[ToolDefinition]: Matching tools ordered by relevance
        """
        # TEST: Tool discovery returns relevant results
        # TEST: Tool discovery handles empty results gracefully
        # TEST: Tool discovery respects authorization constraints
        
        async with self.lock.read():
            matching_tools = []
            
            for tool_id, tool_entry in self.tools.items():
                # Apply query filters
                if self._matches_query(tool_entry.definition, query):
                    # Check user authorization for tool access
                    if await self._check_tool_authorization(tool_entry, query.user_context):
                        matching_tools.append(tool_entry.definition)
            
            # Sort by relevance score
            sorted_tools = self._rank_tools_by_relevance(matching_tools, query)
            
            self.logger.debug("Tool discovery completed",
                            query_terms=query.terms,
                            results_count=len(sorted_tools))
            
            return sorted_tools
    
    async def get_tool_schema(self, tool_id: str) -> Optional[ToolSchema]:
        """
        Retrieve Claude-compatible schema for a specific tool.
        
        Args:
            tool_id: Unique identifier of the tool
            
        Returns:
            Optional[ToolSchema]: Tool schema or None if not found
        """
        # TEST: Schema retrieval returns valid schema for existing tools
        # TEST: Schema retrieval returns None for non-existent tools
        # TEST: Schema retrieval uses cache for performance
        
        # Check cache first for performance
        if tool_id in self.schema_cache:
            return self.schema_cache[tool_id]
        
        async with self.lock.read():
            if tool_id in self.tools:
                schema = self.tools[tool_id].schema
                self.schema_cache[tool_id] = schema  # Cache for future requests
                return schema
            
            return None
```

## 2. OAuth Provider - Complete Implementation

**File:** [`src/security/oauth.py`](src/security/oauth.py:1)

```python
# OAuth Provider - Complete OAuth 2.0 implementation
class OAuthProvider:
    """
    OAuth 2.0 provider supporting authorization code and client credentials flows.
    Handles external identity provider integration and secure token management.
    """
    
    def __init__(self, config: OAuthConfig):
        # TEST: OAuth provider initializes with valid configuration
        self.config = config
        self.token_store = SecureTokenStore(config.encryption_key)
        self.jwt_validator = JWTValidator()
        self.client_registry = ClientRegistry()
        self.rate_limiter = RateLimiter()
        self.logger = get_structured_logger("oauth_provider")
    
    async def initiate_authorization_flow(self, client_id: str, 
                                        redirect_uri: str, 
                                        scopes: List[str]) -> AuthorizationRequest:
        """
        Initiate OAuth authorization code flow.
        
        Args:
            client_id: Registered client identifier
            redirect_uri: Callback URI for authorization response
            scopes: Requested permission scopes
            
        Returns:
            AuthorizationRequest: Authorization URL and state information
        """
        # TEST: Authorization flow creates valid authorization request
        # TEST: Authorization flow validates client credentials
        # TEST: Authorization flow handles invalid redirect URIs
        
        # Validate client registration
        client = await self.client_registry.get_client(client_id)
        if not client or not client.is_valid_redirect_uri(redirect_uri):
            raise InvalidClientError("Invalid client or redirect URI")
        
        # Validate requested scopes
        valid_scopes = self._validate_scopes(scopes, client.allowed_scopes)
        if not valid_scopes:
            raise InvalidScopeError("Invalid or unauthorized scopes")
        
        # Generate authorization request
        state = generate_secure_random(32)
        auth_request = AuthorizationRequest(
            client_id=client_id,
            redirect_uri=redirect_uri,
            scopes=valid_scopes,
            state=state,
            expires_at=datetime.utcnow() + timedelta(minutes=10)
        )
        
        # Store request for validation during callback
        await self.token_store.store_auth_request(state, auth_request)
        
        # Generate authorization URL
        auth_url = self._build_authorization_url(auth_request)
        
        self.logger.info("Authorization flow initiated",
                        client_id=client_id,
                        scopes=valid_scopes)
        
        return auth_request
    
    async def exchange_authorization_code(self, code: str, 
                                        state: str,
                                        client_credentials: ClientCredentials) -> TokenResponse:
        """
        Exchange authorization code for access token.
        
        Args:
            code: Authorization code from authorization server
            state: State parameter for CSRF protection
            client_credentials: Client authentication credentials
            
        Returns:
            TokenResponse: Access token, refresh token, and metadata
        """
        # TEST: Code exchange succeeds with valid authorization code
        # TEST: Code exchange fails with expired or invalid code
        # TEST: Code exchange validates client credentials
        
        # Retrieve and validate authorization request
        auth_request = await self.token_store.get_auth_request(state)
        if not auth_request or auth_request.is_expired():
            raise InvalidGrantError("Invalid or expired authorization request")
        
        # Validate client credentials
        if not await self._validate_client_credentials(client_credentials):
            raise InvalidClientError("Invalid client credentials")
        
        # Exchange code with external provider
        external_tokens = await self._exchange_code_with_provider(
            code, auth_request.redirect_uri)
        
        # Generate internal access token
        access_token = await self._generate_access_token(
            client_id=auth_request.client_id,
            scopes=auth_request.scopes,
            external_tokens=external_tokens
        )
        
        # Generate refresh token
        refresh_token = await self._generate_refresh_token(access_token)
        
        # Store tokens securely
        await self.token_store.store_tokens(access_token, refresh_token)
        
        self.logger.info("Authorization code exchanged successfully",
                        client_id=auth_request.client_id)
        
        return TokenResponse(
            access_token=access_token.token,
            refresh_token=refresh_token.token,
            expires_in=access_token.expires_in,
            token_type="Bearer",
            scope=" ".join(auth_request.scopes)
        )
    
    async def validate_access_token(self, token: str) -> Optional[TokenInfo]:
        """
        Validate and decode access token.
        
        Args:
            token: JWT access token to validate
            
        Returns:
            Optional[TokenInfo]: Token information or None if invalid
        """
        # TEST: Token validation succeeds with valid tokens
        # TEST: Token validation fails with expired tokens
        # TEST: Token validation fails with malformed tokens
        
        try:
            # Validate JWT signature and claims
            payload = await self.jwt_validator.validate_token(token)
            
            # Check token revocation status
            if await self.token_store.is_token_revoked(token):
                self.logger.warning("Revoked token used", token_id=payload.get("jti"))
                return None
            
            # Extract token information
            token_info = TokenInfo(
                client_id=payload["client_id"],
                scopes=payload["scope"].split(),
                user_id=payload.get("sub"),
                expires_at=datetime.fromtimestamp(payload["exp"])
            )
            
            return token_info
            
        except JWTValidationError as e:
            self.logger.warning("Token validation failed", error=str(e))
            return None
```

## 3. Schema Generation - Complete Implementation

**File:** [`src/tools/schema.py`](src/tools/schema.py:1)

```python
# Schema Generation - Claude-compatible tool schema creation
class SchemaGenerator:
    """
    Generates Claude-compatible schemas from tool definitions.
    Provides dynamic schema updates and comprehensive validation.
    """
    
    def __init__(self, config: SchemaConfig):
        # TEST: Schema generator initializes with valid configuration
        self.config = config
        self.type_mapper = ClaudeTypeMapper()
        self.schema_cache = LRUCache(maxsize=500)
        self.validator = JSONSchemaValidator()
        self.logger = get_structured_logger("schema_generator")
    
    async def generate_tool_schema(self, tool_definition: ToolDefinition) -> ClaudeSchema:
        """
        Generate Claude-compatible schema from tool definition.
        
        Args:
            tool_definition: Complete tool specification
            
        Returns:
            ClaudeSchema: Claude-compatible tool schema
        """
        # TEST: Schema generation creates valid Claude schema
        # TEST: Schema generation handles complex parameter types
        # TEST: Schema generation includes proper descriptions
        
        try:
            # Check cache first
            cache_key = self._generate_cache_key(tool_definition)
            if cache_key in self.schema_cache:
                return self.schema_cache[cache_key]
            
            # Build Claude schema structure
            claude_schema = ClaudeSchema(
                name=tool_definition.id,
                description=tool_definition.description,
                input_schema=await self._build_input_schema(tool_definition),
                examples=await self._generate_examples(tool_definition)
            )
            
            # Validate generated schema
            validation_result = await self.validator.validate_schema(claude_schema)
            if not validation_result.is_valid:
                raise SchemaError(f"Invalid schema: {validation_result.errors}")
            
            # Cache successful schema
            self.schema_cache[cache_key] = claude_schema
            
            self.logger.info("Schema generated successfully",
                           tool_id=tool_definition.id)
            
            return claude_schema
            
        except Exception as e:
            self.logger.error("Schema generation failed",
                            tool_id=tool_definition.id,
                            error=str(e))
            raise SchemaError(f"Schema generation failed: {str(e)}")
    
    async def _build_input_schema(self, tool_definition: ToolDefinition) -> Dict[str, Any]:
        """Build input schema for tool parameters."""
        # TEST: Input schema includes all required parameters
        # TEST: Input schema validates parameter types correctly
        # TEST: Input schema handles nested objects
        
        properties = {}
        required_fields = []
        
        for param in tool_definition.parameters:
            # Map parameter type to Claude-compatible type
            param_schema = await self.type_mapper.map_parameter_type(param)
            
            properties[param.name] = {
                "type": param_schema.type,
                "description": param.description,
                **param_schema.additional_properties
            }
            
            if param.required:
                required_fields.append(param.name)
        
        return {
            "type": "object",
            "properties": properties,
            "required": required_fields,
            "additionalProperties": False
        }
```

## 4. Audit Logging - Complete Implementation

**File:** [`src/security/audit.py`](src/security/audit.py:1)

```python
# Audit Logging - Comprehensive security event tracking
class AuditLogger:
    """
    Security-focused audit logging system with correlation tracking,
    secure storage, and integration with monitoring systems.
    """
    
    def __init__(self, config: AuditConfig):
        # TEST: Audit logger initializes with secure configuration
        self.config = config
        self.storage = SecureAuditStorage(config.storage_config)
        self.correlation_tracker = CorrelationTracker()
        self.alert_manager = SecurityAlertManager()
        self.logger = get_structured_logger("audit_logger")
    
    async def log_authentication_event(self, event_type: AuthEventType, 
                                     user_context: UserContext,
                                     success: bool,
                                     additional_context: Dict[str, Any] = None) -> str:
        """
        Log authentication-related security events.
        
        Args:
            event_type: Type of authentication event
            user_context: User and session information
            success: Whether the authentication was successful
            additional_context: Additional event-specific data
            
        Returns:
            str: Unique audit event ID for correlation
        """
        # TEST: Authentication events are properly logged
        # TEST: Failed authentication events trigger alerts
        # TEST: Authentication events include required security context
        
        audit_event = AuditEvent(
            event_id=generate_uuid(),
            event_type=event_type.value,
            category="authentication",
            timestamp=datetime.utcnow(),
            user_id=user_context.user_id,
            session_id=user_context.session_id,
            source_ip=user_context.source_ip,
            user_agent=user_context.user_agent,
            success=success,
            correlation_id=self.correlation_tracker.get_correlation_id(),
            additional_data=additional_context or {}
        )
        
        # Store audit event securely
        await self.storage.store_audit_event(audit_event)
        
        # Trigger alerts for security-relevant events
        if self._requires_security_alert(event_type, success):
            await self.alert_manager.trigger_security_alert(audit_event)
        
        self.logger.info("Authentication event logged",
                        event_id=audit_event.event_id,
                        event_type=event_type.value,
                        success=success)
        
        return audit_event.event_id
    
    async def log_authorization_event(self, resource: str,
                                    action: str,
                                    user_context: UserContext,
                                    decision: AuthzDecision,
                                    reason: str = None) -> str:
        """
        Log authorization decisions for access control auditing.
        
        Args:
            resource: Resource being accessed
            action: Action being attempted
            user_context: User and session information
            decision: Authorization decision (ALLOW/DENY)
            reason: Reason for the decision
            
        Returns:
            str: Unique audit event ID for correlation
        """
        # TEST: Authorization events capture access control decisions
        # TEST: Authorization denials are properly logged
        # TEST: Authorization events support compliance reporting
        
        audit_event = AuditEvent(
            event_id=generate_uuid(),
            event_type="authorization_decision",
            category="authorization",
            timestamp=datetime.utcnow(),
            user_id=user_context.user_id,
            session_id=user_context.session_id,
            resource=resource,
            action=action,
            decision=decision.value,
            reason=reason,
            correlation_id=self.correlation_tracker.get_correlation_id()
        )
        
        await self.storage.store_audit_event(audit_event)
        
        # Alert on authorization failures for sensitive resources
        if decision == AuthzDecision.DENY and self._is_sensitive_resource(resource):
            await self.alert_manager.trigger_authorization_alert(audit_event)
        
        return audit_event.event_id
```

## 5. Output Sanitization - Complete Implementation

**File:** [`src/security/sanitization.py`](src/security/sanitization.py:1)

```python
# Output Sanitization - Comprehensive data leakage prevention
class OutputSanitizer:
    """
    Comprehensive output sanitization system preventing:
    - PII (Personal Identifiable Information) leakage
    - Credentials and API keys exposure
    - Internal system information disclosure
    """
    
    def __init__(self, config: SanitizationConfig):
        # TEST: Sanitizer initializes with comprehensive rule sets
        self.config = config
        self.rules = self._load_sanitization_rules()
        self.custom_sanitizers = {}
        self.metrics = SanitizationMetrics()
        self.logger = get_structured_logger("output_sanitizer")
    
    async def sanitize_output(self, data: Any, 
                            context: SanitizationContext,
                            data_type: DataType = DataType.TEXT) -> SanitizedOutput:
        """
        Sanitize output data to prevent information disclosure.
        
        Args:
            data: Data to sanitize (string, dict, list, etc.)
            context: Sanitization context including user permissions
            data_type: Type of data being sanitized
            
        Returns:
            SanitizedOutput: Sanitized data with metadata
        """
        # TEST: Output sanitization removes sensitive information
        # TEST: Output sanitization preserves data structure
        # TEST: Output sanitization handles different data types
        
        try:
            sanitization_start = time.time()
            
            # Convert data to processable format
            processable_data = await self._prepare_data_for_sanitization(data, data_type)
            
            # Apply sanitization rules based on context
            sanitized_data = await self._apply_sanitization_rules(
                processable_data, context, data_type)
            
            # Apply custom sanitizers if configured
            if context.custom_sanitizers:
                sanitized_data = await self._apply_custom_sanitizers(
                    sanitized_data, context.custom_sanitizers)
            
            # Convert back to original format
            final_output = await self._restore_data_format(sanitized_data, data_type)
            
            # Calculate metrics
            sanitization_time = time.time() - sanitization_start
            redaction_count = self._count_redactions(data, final_output)
            
            # Record metrics
            self.metrics.record_sanitization(
                data_type=data_type,
                processing_time=sanitization_time,
                redaction_count=redaction_count
            )
            
            self.logger.debug("Output sanitized successfully",
                            data_type=data_type.value,
                            redaction_count=redaction_count,
                            processing_time_ms=sanitization_time * 1000)
            
            return SanitizedOutput(
                data=final_output,
                redaction_count=redaction_count,
                processing_time=sanitization_time,
                sanitization_rules_applied=len([r for r in self.rules if r.enabled])
            )
            
        except Exception as e:
            self.logger.error("Output sanitization failed",
                            data_type=data_type.value,
                            error=str(e))
            # Return heavily redacted output on sanitization failure
            return SanitizedOutput(
                data="[SANITIZATION_ERROR: Output could not be safely processed]",
                redaction_count=1,
                processing_time=0,
                sanitization_rules_applied=0,
                error=str(e)
            )
    
    async def _apply_sanitization_rules(self, data: str,
                                      context: SanitizationContext,
                                      data_type: DataType) -> str:
        """Apply sanitization rules based on context and data type."""
        # TEST: Sanitization rules are applied in correct priority order
        # TEST: Sanitization rules respect user permission levels
        # TEST: Sanitization rules handle overlapping patterns correctly
        
        sanitized = data
        
        # Sort rules by priority (higher priority first)
        applicable_rules = [
            rule for rule in self.rules
            if rule.enabled and
            data_type in rule.data_types and
            context.sensitivity_level in rule.sensitivity_levels
        ]
        applicable_rules.sort(key=lambda r: r.priority, reverse=True)
        
        # Apply each rule
        for rule in applicable_rules:
            try:
                pattern = re.compile(rule.pattern, re.IGNORECASE | re.MULTILINE)
                sanitized = pattern.sub(rule.replacement, sanitized)
            except re.error as e:
                self.logger.warning("Invalid sanitization rule pattern",
                                  rule_name=rule.name,
                                  pattern=rule.pattern,
                                  error=str(e))
        
        return sanitized
```

## 6. Health Monitoring - Complete Implementation

**File:** [`src/monitoring/health.py`](src/monitoring/health.py:1)

```python
# Health Monitoring - Comprehensive system health checks
class HealthMonitor:
    """
    System health monitoring with component status tracking,
    dependency checks, and automated recovery procedures.
    """
    
    def __init__(self, config: HealthConfig):
        # TEST: Health monitor initializes with proper configuration
        self.config = config
        self.health_checks = {}
        self.dependency_graph = DependencyGraph()
        self.recovery_manager = RecoveryManager()
        self.logger = get_structured_logger("health_monitor")
    
    async def register_health_check(self, component: str, 
                                  check_function: Callable,
                                  dependencies: List[str] = None) -> None:
        """
        Register a health check for a system component.
        
        Args:
            component: Name of the component
            check_function: Async function that returns HealthStatus
            dependencies: List of components this component depends on
        """
        # TEST: Health check registration succeeds with valid function
        # TEST: Health check registration builds dependency graph
        # TEST: Health check registration prevents circular dependencies
        
        self.health_checks[component] = HealthCheck(
            component=component,
            check_function=check_function,
            dependencies=dependencies or [],
            last_check=None,
            last_status=HealthStatus.UNKNOWN
        )
        
        # Update dependency graph
        if dependencies:
            self.dependency_graph.add_dependencies(component, dependencies)
        
        self.logger.info("Health check registered", component=component)
    
    async def check_system_health(self) -> SystemHealthReport:
        """
        Perform comprehensive system health check.
        
        Returns:
            SystemHealthReport: Overall system health status and details
        """
        # TEST: System health check returns comprehensive report
        # TEST: System health check respects dependency order
        # TEST: System health check handles component failures gracefully
        
        # Determine check order based on dependencies
        check_order = self.dependency_graph.topological_sort()
        
        health_results = {}
        overall_status = HealthStatus.HEALTHY
        
        for component in check_order:
            if component not in self.health_checks:
                continue
                
            health_check = self.health_checks[component]
            
            try:
                # Execute health check with timeout
                check_result = await asyncio.wait_for(
                    health_check.check_function(),
                    timeout=self.config.check_timeout_seconds
                )
                
                health_results[component] = check_result
                health_check.last_check = datetime.utcnow()
                health_check.last_status = check_result.status
                
                # Update overall status
                if check_result.status.severity > overall_status.severity:
                    overall_status = check_result.status
                    
            except asyncio.TimeoutError:
                error_result = HealthCheckResult(
                    status=HealthStatus.UNHEALTHY,
                    message="Health check timeout",
                    details={"timeout_seconds": self.config.check_timeout_seconds}
                )
                health_results[component] = error_result
                overall_status = HealthStatus.UNHEALTHY
                
            except Exception as e:
                error_result = HealthCheckResult(
                    status=HealthStatus.UNHEALTHY,
                    message=f"Health check error: {str(e)}",
                    details={"exception": str(e)}
                )
                health_results[component] = error_result
                overall_status = HealthStatus.UNHEALTHY
        
        # Generate system health report
        report = SystemHealthReport(
            overall_status=overall_status,
            component_results=health_results,
            timestamp=datetime.utcnow(),
            check_duration=sum(r.check_duration for r in health_results.values())
        )
        
        # Trigger alerts if needed
        if overall_status in [HealthStatus.DEGRADED, HealthStatus.UNHEALTHY]:
            await self._trigger_health_alerts(report)
        
        return report
```

## Testing and Validation Procedures

Each component includes comprehensive TDD anchors throughout the pseudocode:

### Component Testing Strategy

1. **Unit Tests**: Each method includes specific test cases marked with `# TEST:`
2. **Integration Tests**: Cross-component interactions and dependencies
3. **Performance Tests**: Response time and throughput validation
4. **Security Tests**: Vulnerability assessment and penetration testing
5. **End-to-End Tests**: Complete workflow validation

### Validation Checklist

- [ ] All components pass unit tests with >95% coverage
- [ ] Integration tests demonstrate proper component interaction
- [ ] Performance tests meet sub-100ms response time requirements
- [ ] Security tests confirm no data leakage or unauthorized access
- [ ] End-to-end tests validate complete user workflows

This pseudocode provides the foundation for implementing the critical missing components with comprehensive testing and security considerations.