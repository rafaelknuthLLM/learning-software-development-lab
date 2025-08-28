# FACT Configuration Validation and Initialization Pseudocode

## Overview

This document provides detailed pseudocode specifications for the FACT benchmark system's configuration validation and initialization process, designed for testable implementation.

## Module: Configuration Management

### Phase 1: Environment Loading Pseudocode

```pseudocode
FUNCTION load_environment_configuration(env_file_path: String) -> ConfigurationState
    // TEST: Verify .env file loading with valid file
    // TEST: Verify fallback to system environment when file missing
    // TEST: Verify environment variable override behavior
    
    INPUT: env_file_path (default: ".env")
    OUTPUT: ConfigurationState with loaded environment variables
    
    BEGIN
        configuration_state = INITIALIZE_EMPTY_CONFIG_STATE()
        
        IF file_exists(env_file_path) THEN
            TRY
                environment_variables = load_dotenv_file(env_file_path)
                configuration_state.source = "FILE"
                configuration_state.file_path = env_file_path
                configuration_state.variables = environment_variables
                LOG_INFO("Environment loaded from file", file=env_file_path)
                // TEST: Verify successful file loading logs correct message
            CATCH file_error
                LOG_WARNING("Failed to load .env file", error=file_error)
                configuration_state.source = "SYSTEM"
                configuration_state.variables = get_system_environment()
                // TEST: Verify file error handling and fallback behavior
            END TRY
        ELSE
            LOG_WARNING("No .env file found, using system environment")
            configuration_state.source = "SYSTEM" 
            configuration_state.variables = get_system_environment()
            // TEST: Verify missing file warning and system fallback
        END IF
        
        RETURN configuration_state
    END
END FUNCTION

FUNCTION get_environment_variable(key: String, default_value: String) -> String
    // TEST: Verify environment variable retrieval with existing key
    // TEST: Verify default value return for missing key
    // TEST: Verify empty string handling
    
    INPUT: key (environment variable name), default_value
    OUTPUT: Environment variable value or default
    
    BEGIN
        value = system_getenv(key)
        
        IF value IS NULL OR value IS EMPTY THEN
            RETURN default_value
            // TEST: Verify default value returned for missing/empty variables
        ELSE
            RETURN value
            // TEST: Verify actual value returned for existing variables
        END IF
    END
END FUNCTION
```

### Phase 2: Required Key Validation Pseudocode

```pseudocode
FUNCTION validate_required_configuration_keys() -> ValidationResult
    // TEST: Verify validation passes with all required keys present
    // TEST: Verify validation fails with missing ANTHROPIC_API_KEY
    // TEST: Verify validation fails with missing ARCADE_API_KEY  
    // TEST: Verify validation fails with both keys missing
    // TEST: Verify empty string values are treated as missing
    
    OUTPUT: ValidationResult with success status and missing keys
    
    BEGIN
        required_keys = ["ANTHROPIC_API_KEY", "ARCADE_API_KEY"]
        missing_keys = EMPTY_LIST()
        validation_result = INITIALIZE_VALIDATION_RESULT()
        
        FOR EACH key IN required_keys DO
            environment_value = get_environment_variable(key, "")
            
            IF environment_value IS EMPTY OR is_whitespace_only(environment_value) THEN
                ADD key TO missing_keys
                LOG_DEBUG("Required key missing or empty", key=key)
                // TEST: Verify missing key detection and logging
            END IF
        END FOR
        
        IF missing_keys IS NOT EMPTY THEN
            error_message = "Missing required configuration keys: " + join(missing_keys, ", ")
            validation_result.success = FALSE
            validation_result.error_message = error_message
            validation_result.missing_keys = missing_keys
            LOG_ERROR("Configuration validation failed", missing_keys=missing_keys)
            // TEST: Verify error message format and logging
            THROW ConfigurationError(error_message)
        ELSE
            validation_result.success = TRUE
            validation_result.error_message = NULL
            validation_result.missing_keys = EMPTY_LIST()
            LOG_INFO("Configuration validation passed")
            // TEST: Verify successful validation logging
        END IF
        
        RETURN validation_result
    END
END FUNCTION

FUNCTION validate_api_key_format(key_name: String, api_key: String) -> FormatValidationResult
    // TEST: Verify valid Anthropic API key format (sk-ant-api03-...)
    // TEST: Verify valid Arcade API key format (arc_...)
    // TEST: Verify invalid format detection
    // TEST: Verify empty key rejection
    
    INPUT: key_name, api_key
    OUTPUT: FormatValidationResult with validation status
    
    BEGIN
        validation_result = INITIALIZE_FORMAT_VALIDATION_RESULT()
        validation_result.key_name = key_name
        validation_result.provided_key = mask_sensitive_value(api_key)
        
        IF api_key IS EMPTY THEN
            validation_result.valid = FALSE
            validation_result.error = "API key is empty"
            RETURN validation_result
        END IF
        
        SWITCH key_name
            CASE "ANTHROPIC_API_KEY":
                pattern = "^sk-ant-api03-[A-Za-z0-9_-]+$"
                validation_result.valid = matches_pattern(api_key, pattern)
                // TEST: Verify Anthropic key pattern validation
                
            CASE "ARCADE_API_KEY":
                pattern = "^arc_[A-Za-z0-9_-]+$"
                validation_result.valid = matches_pattern(api_key, pattern)
                // TEST: Verify Arcade key pattern validation
                
            DEFAULT:
                validation_result.valid = TRUE  // Unknown keys pass through
                // TEST: Verify unknown key types are not rejected
        END SWITCH
        
        IF NOT validation_result.valid THEN
            validation_result.error = "Invalid API key format for " + key_name
            LOG_WARNING("Invalid API key format", key=key_name)
            // TEST: Verify invalid format error logging
        END IF
        
        RETURN validation_result
    END
END FUNCTION
```

### Phase 3: Configuration Object Creation Pseudocode

```pseudocode
FUNCTION create_configuration_object() -> SystemConfiguration
    // TEST: Verify configuration object creation with valid environment
    // TEST: Verify default value assignment for optional parameters
    // TEST: Verify type conversion for numeric parameters
    // TEST: Verify boolean parameter parsing
    
    OUTPUT: SystemConfiguration object with all parameters
    
    BEGIN
        config = INITIALIZE_SYSTEM_CONFIGURATION()
        
        // Required API Keys
        config.anthropic_api_key = get_environment_variable("ANTHROPIC_API_KEY", "")
        config.arcade_api_key = get_environment_variable("ARCADE_API_KEY", "")
        // TEST: Verify required key assignment
        
        // Optional API Keys  
        config.openai_api_key = get_environment_variable("OPENAI_API_KEY", "")
        config.encryption_key = get_environment_variable("ENCRYPTION_KEY", "")
        // TEST: Verify optional key assignment with empty defaults
        
        // System Configuration
        config.arcade_base_url = get_environment_variable("ARCADE_BASE_URL", "https://api.arcade-ai.com")
        config.database_path = get_environment_variable("DATABASE_PATH", "data/fact_demo.db")
        config.cache_prefix = get_environment_variable("CACHE_PREFIX", "fact_v1")
        config.claude_model = get_environment_variable("CLAUDE_MODEL", "claude-3-haiku-20240307")
        // TEST: Verify string parameter assignment with defaults
        
        // Performance Configuration
        TRY
            config.max_retries = parse_integer(get_environment_variable("MAX_RETRIES", "3"))
            config.request_timeout = parse_integer(get_environment_variable("REQUEST_TIMEOUT", "30"))
            config.cache_ttl_seconds = parse_integer(get_environment_variable("CACHE_TTL_SECONDS", "3600"))
            // TEST: Verify integer parsing for numeric parameters
        CATCH parsing_error
            LOG_ERROR("Invalid numeric configuration value", error=parsing_error)
            THROW ConfigurationError("Invalid numeric configuration: " + parsing_error)
            // TEST: Verify numeric parsing error handling
        END TRY
        
        // Cache Configuration Object
        config.cache_config = create_cache_configuration()
        // TEST: Verify cache configuration sub-object creation
        
        // Security Configuration Object  
        config.security_config = create_security_configuration()
        // TEST: Verify security configuration sub-object creation
        
        RETURN config
    END
END FUNCTION

FUNCTION create_cache_configuration() -> CacheConfiguration
    // TEST: Verify cache configuration creation with all parameters
    // TEST: Verify size parsing (MB, GB, KB formats)
    // TEST: Verify numeric parameter validation
    
    OUTPUT: CacheConfiguration object
    
    BEGIN
        cache_config = INITIALIZE_CACHE_CONFIGURATION()
        
        cache_config.prefix = get_environment_variable("CACHE_PREFIX", "fact_v1")
        cache_config.min_tokens = parse_integer(get_environment_variable("CACHE_MIN_TOKENS", "50"))
        cache_config.max_size = get_environment_variable("CACHE_MAX_SIZE", "10MB")
        cache_config.ttl_seconds = parse_integer(get_environment_variable("CACHE_TTL_SECONDS", "3600"))
        cache_config.hit_target_ms = parse_float(get_environment_variable("CACHE_HIT_TARGET_MS", "30"))
        cache_config.miss_target_ms = parse_float(get_environment_variable("CACHE_MISS_TARGET_MS", "120"))
        // TEST: Verify all cache parameters are correctly assigned
        
        // Validate cache parameters
        IF cache_config.min_tokens < 1 THEN
            THROW ConfigurationError("CACHE_MIN_TOKENS must be positive")
        END IF
        
        IF cache_config.ttl_seconds < 60 THEN
            THROW ConfigurationError("CACHE_TTL_SECONDS must be at least 60")
        END IF
        // TEST: Verify cache parameter validation
        
        RETURN cache_config
    END
END FUNCTION
```

### Phase 4: Service Initialization Pseudocode

```pseudocode
FUNCTION initialize_fact_system(config: SystemConfiguration) -> InitializationResult
    // TEST: Verify complete system initialization with valid configuration
    // TEST: Verify initialization failure handling for each component
    // TEST: Verify rollback behavior on partial initialization failure
    
    INPUT: config (validated SystemConfiguration)
    OUTPUT: InitializationResult with success status and component states
    
    BEGIN
        initialization_result = INITIALIZE_RESULT_OBJECT()
        initialized_components = EMPTY_LIST()
        
        TRY
            // Phase 1: Database Initialization
            LOG_INFO("Initializing database", path=config.database_path)
            database_manager = initialize_database_manager(config.database_path)
            ADD "database" TO initialized_components
            initialization_result.database_status = "SUCCESS"
            // TEST: Verify database initialization success
            
            // Phase 2: Cache System Initialization  
            LOG_INFO("Initializing cache system", config=config.cache_config)
            cache_system = initialize_cache_system(config.cache_config)
            ADD "cache" TO initialized_components
            initialization_result.cache_status = "SUCCESS"
            // TEST: Verify cache system initialization success
            
            // Phase 3: API Client Initialization
            LOG_INFO("Initializing API clients")
            anthropic_client = initialize_anthropic_client(config.anthropic_api_key, config.claude_model)
            arcade_client = initialize_arcade_client(config.arcade_api_key, config.arcade_base_url)
            ADD "api_clients" TO initialized_components
            initialization_result.api_clients_status = "SUCCESS"
            // TEST: Verify API client initialization success
            
            // Phase 4: Connectivity Testing
            LOG_INFO("Testing service connectivity")
            connectivity_result = test_service_connectivity(anthropic_client, arcade_client)
            IF NOT connectivity_result.success THEN
                THROW ConnectionError("Service connectivity test failed: " + connectivity_result.error)
            END IF
            initialization_result.connectivity_status = "SUCCESS"
            // TEST: Verify connectivity testing success and failure handling
            
            // Phase 5: Tool Registry Initialization
            LOG_INFO("Initializing tool registry")
            tool_registry = initialize_tool_registry(arcade_client)
            ADD "tools" TO initialized_components
            initialization_result.tools_status = "SUCCESS"
            // TEST: Verify tool registry initialization success
            
            initialization_result.success = TRUE
            initialization_result.initialized_components = initialized_components
            LOG_INFO("FACT system initialization completed successfully")
            // TEST: Verify successful initialization logging
            
        CATCH database_error AS DatabaseInitializationError
            initialization_result.success = FALSE
            initialization_result.database_status = "FAILED: " + database_error.message
            initialization_result.error = database_error
            LOG_ERROR("Database initialization failed", error=database_error)
            // TEST: Verify database initialization error handling
            
        CATCH cache_error AS CacheInitializationError
            initialization_result.success = FALSE
            initialization_result.cache_status = "FAILED: " + cache_error.message
            initialization_result.error = cache_error
            perform_cleanup(initialized_components)
            LOG_ERROR("Cache initialization failed", error=cache_error)
            // TEST: Verify cache initialization error handling and cleanup
            
        CATCH api_error AS APIInitializationError
            initialization_result.success = FALSE
            initialization_result.api_clients_status = "FAILED: " + api_error.message
            initialization_result.error = api_error
            perform_cleanup(initialized_components)
            LOG_ERROR("API client initialization failed", error=api_error)
            // TEST: Verify API initialization error handling and cleanup
            
        CATCH connectivity_error AS ConnectionError
            initialization_result.success = FALSE
            initialization_result.connectivity_status = "FAILED: " + connectivity_error.message
            initialization_result.error = connectivity_error
            perform_cleanup(initialized_components)
            LOG_ERROR("Connectivity test failed", error=connectivity_error)
            // TEST: Verify connectivity error handling and cleanup
            
        CATCH general_error AS Exception
            initialization_result.success = FALSE
            initialization_result.error = general_error
            perform_cleanup(initialized_components)
            LOG_ERROR("System initialization failed", error=general_error)
            // TEST: Verify general error handling and cleanup
        END TRY
        
        RETURN initialization_result
    END
END FUNCTION

FUNCTION test_service_connectivity(anthropic_client: AnthropicClient, arcade_client: ArcadeClient) -> ConnectivityResult
    // TEST: Verify Anthropic API connectivity test success
    // TEST: Verify Arcade API connectivity test success
    // TEST: Verify connectivity test failure handling
    // TEST: Verify timeout handling for connectivity tests
    
    INPUT: anthropic_client, arcade_client
    OUTPUT: ConnectivityResult with detailed test results
    
    BEGIN
        connectivity_result = INITIALIZE_CONNECTIVITY_RESULT()
        
        // Test Anthropic API Connectivity
        TRY
            LOG_DEBUG("Testing Anthropic API connectivity")
            anthropic_response = anthropic_client.test_connection(
                timeout=10,
                test_message="Test connectivity"
            )
            connectivity_result.anthropic_status = "SUCCESS"
            connectivity_result.anthropic_latency = anthropic_response.latency_ms
            // TEST: Verify Anthropic connectivity test success measurement
            
        CATCH anthropic_error
            connectivity_result.anthropic_status = "FAILED: " + anthropic_error.message
            connectivity_result.success = FALSE
            LOG_ERROR("Anthropic API connectivity test failed", error=anthropic_error)
            // TEST: Verify Anthropic connectivity failure handling
        END TRY
        
        // Test Arcade API Connectivity
        TRY
            LOG_DEBUG("Testing Arcade API connectivity")
            arcade_response = arcade_client.test_connection(timeout=10)
            connectivity_result.arcade_status = "SUCCESS"
            connectivity_result.arcade_latency = arcade_response.latency_ms
            // TEST: Verify Arcade connectivity test success measurement
            
        CATCH arcade_error
            connectivity_result.arcade_status = "FAILED: " + arcade_error.message
            connectivity_result.success = FALSE
            LOG_ERROR("Arcade API connectivity test failed", error=arcade_error)
            // TEST: Verify Arcade connectivity failure handling
        END TRY
        
        // Overall connectivity assessment
        IF connectivity_result.anthropic_status STARTS_WITH "SUCCESS" AND 
           connectivity_result.arcade_status STARTS_WITH "SUCCESS" THEN
            connectivity_result.success = TRUE
            connectivity_result.message = "All services accessible"
            // TEST: Verify overall success assessment
        ELSE
            connectivity_result.success = FALSE
            connectivity_result.message = "One or more services unavailable"
            // TEST: Verify overall failure assessment
        END IF
        
        RETURN connectivity_result
    END
END FUNCTION
```

### Phase 5: Configuration Validation and Health Checks

```pseudocode
FUNCTION perform_system_health_check(config: SystemConfiguration) -> HealthCheckResult
    // TEST: Verify complete health check with healthy system
    // TEST: Verify health check failure detection for each component
    // TEST: Verify performance metric collection
    // TEST: Verify security validation integration
    
    INPUT: config (SystemConfiguration)
    OUTPUT: HealthCheckResult with detailed system status
    
    BEGIN
        health_result = INITIALIZE_HEALTH_CHECK_RESULT()
        health_result.timestamp = get_current_timestamp()
        
        // Configuration Health Check
        config_health = validate_configuration_health(config)
        health_result.configuration_health = config_health
        // TEST: Verify configuration health validation
        
        // Database Health Check
        database_health = check_database_health(config.database_path)
        health_result.database_health = database_health
        // TEST: Verify database health check
        
        // Cache Health Check
        cache_health = check_cache_system_health()
        health_result.cache_health = cache_health
        // TEST: Verify cache system health check
        
        // API Services Health Check
        api_health = check_api_services_health(config)
        health_result.api_services_health = api_health
        // TEST: Verify API services health check
        
        // Security Health Check
        security_health = check_security_configuration_health(config.security_config)
        health_result.security_health = security_health
        // TEST: Verify security configuration health check
        
        // Performance Metrics Collection
        performance_metrics = collect_performance_metrics()
        health_result.performance_metrics = performance_metrics
        // TEST: Verify performance metrics collection
        
        // Overall Health Assessment
        health_result.overall_status = assess_overall_health(health_result)
        // TEST: Verify overall health assessment logic
        
        LOG_INFO("System health check completed", status=health_result.overall_status)
        RETURN health_result
    END
END FUNCTION

FUNCTION validate_configuration_health(config: SystemConfiguration) -> ConfigurationHealthResult
    // TEST: Verify configuration health with valid settings
    // TEST: Verify warning detection for suboptimal settings
    // TEST: Verify error detection for invalid settings
    
    INPUT: config
    OUTPUT: ConfigurationHealthResult with validation details
    
    BEGIN
        health_result = INITIALIZE_CONFIG_HEALTH_RESULT()
        warnings = EMPTY_LIST()
        errors = EMPTY_LIST()
        
        // Validate API Key Presence and Format
        IF config.anthropic_api_key IS EMPTY THEN
            ADD "Missing Anthropic API key" TO errors
        ELSE
            format_result = validate_api_key_format("ANTHROPIC_API_KEY", config.anthropic_api_key)
            IF NOT format_result.valid THEN
                ADD "Invalid Anthropic API key format" TO errors
            END IF
        END IF
        // TEST: Verify API key validation logic
        
        // Validate Performance Settings
        IF config.request_timeout > 60 THEN
            ADD "Request timeout is very high (>60s)" TO warnings
        END IF
        
        IF config.max_retries > 5 THEN
            ADD "Max retries setting is high (>5)" TO warnings
        END IF
        // TEST: Verify performance setting validation
        
        // Validate Cache Settings
        cache_size_bytes = parse_size_to_bytes(config.cache_config.max_size)
        IF cache_size_bytes > 1_000_000_000 THEN  // 1GB
            ADD "Cache size is very large (>1GB)" TO warnings
        END IF
        // TEST: Verify cache size validation
        
        health_result.warnings = warnings
        health_result.errors = errors
        health_result.healthy = (LENGTH(errors) == 0)
        health_result.warning_count = LENGTH(warnings)
        health_result.error_count = LENGTH(errors)
        
        RETURN health_result
    END
END FUNCTION
```

## Error Handling and Recovery Patterns

### Configuration Error Recovery

```pseudocode
FUNCTION handle_configuration_error(error: ConfigurationError) -> RecoveryResult
    // TEST: Verify error categorization and recovery suggestions
    // TEST: Verify user-friendly error message generation
    
    INPUT: error (ConfigurationError with details)
    OUTPUT: RecoveryResult with suggested actions
    
    BEGIN
        recovery_result = INITIALIZE_RECOVERY_RESULT()
        recovery_result.original_error = error
        
        IF error.type == "MISSING_REQUIRED_KEYS" THEN
            recovery_result.category = "MISSING_API_KEYS"
            recovery_result.user_message = "Required API keys are missing. Please check your .env file."
            recovery_result.suggested_actions = [
                "Create .env file in project root directory",
                "Add ANTHROPIC_API_KEY=your-anthropic-key",
                "Add ARCADE_API_KEY=your-arcade-key",
                "Restart the application"
            ]
            recovery_result.documentation_link = "docs/configuration-requirements-analysis.md#required-configuration-parameters"
            // TEST: Verify missing API key recovery guidance
            
        ELSE IF error.type == "INVALID_FORMAT" THEN
            recovery_result.category = "INVALID_CONFIGURATION"
            recovery_result.user_message = "Configuration format is invalid. Please check parameter values."
            recovery_result.suggested_actions = [
                "Verify numeric parameters contain valid numbers",
                "Check boolean parameters use 'true' or 'false'",
                "Validate file paths are accessible",
                "Review .env file syntax"
            ]
            // TEST: Verify invalid format recovery guidance
            
        ELSE IF error.type == "CONNECTION_FAILURE" THEN
            recovery_result.category = "CONNECTIVITY"
            recovery_result.user_message = "Cannot connect to required services. Please check network and API keys."
            recovery_result.suggested_actions = [
                "Verify internet connectivity",
                "Check API key validity",
                "Confirm service endpoints are accessible",
                "Review firewall and proxy settings"
            ]
            // TEST: Verify connection failure recovery guidance
        END IF
        
        RETURN recovery_result
    END
END FUNCTION
```

This pseudocode specification provides comprehensive, testable designs for the FACT system's configuration validation and initialization process, with explicit test anchors for TDD implementation.