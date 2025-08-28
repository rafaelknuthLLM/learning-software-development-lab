# FACT System Tool Modules Pseudocode

## 1. Tool Framework Module

### 1.1 Base Tool Infrastructure
```pseudocode
MODULE ToolFramework

// TEST: Tool decorator creates valid tool definitions
DECORATOR Tool(name: String, description: String, parameters: Dict):
    FUNCTION decorator(tool_function: Function):
        // Validate tool definition
        VALIDATE name is unique and follows naming convention
        VALIDATE description is meaningful and clear
        VALIDATE parameters schema is valid JSON schema
        
        // Create tool metadata
        tool_metadata = {
            "name": name,
            "description": description,
            "parameters": parameters,
            "function": tool_function,
            "created_at": CURRENT timestamp,
            "version": "1.0.0"
        }
        
        // Add validation wrapper
        FUNCTION wrapped_tool_function(*args, **kwargs):
            TRY:
                // Validate input parameters
                validated_args = VALIDATE parameters against schema
                
                // Execute original function
                result = tool_function(*validated_args, **kwargs)
                
                // Validate output format
                VALIDATE result is JSON serializable
                
                RETURN result
                
            CATCH validation_error:
                RAISE ToolValidationError("Parameter validation failed: " + validation_error.message)
            CATCH execution_error:
                RAISE ToolExecutionError("Tool execution failed: " + execution_error.message)
        
        // Attach metadata to wrapped function
        wrapped_tool_function.metadata = tool_metadata
        
        RETURN wrapped_tool_function
    
    RETURN decorator

// TEST: Parameter validation enforces type safety
FUNCTION validate_tool_parameters(parameters: Dict, schema: Dict):
    errors = []
    
    // Check required parameters
    FOR each required_param IN schema.required:
        IF required_param NOT IN parameters:
            errors.APPEND("Missing required parameter: " + required_param)
    
    // Validate parameter types and constraints
    FOR each param_name, param_value IN parameters:
        IF param_name IN schema.properties:
            param_schema = schema.properties[param_name]
            
            // Type validation
            IF NOT VALIDATE_TYPE(param_value, param_schema.type):
                errors.APPEND("Invalid type for " + param_name + ": expected " + param_schema.type)
            
            // Additional constraints
            IF param_schema.minLength AND LENGTH(param_value) < param_schema.minLength:
                errors.APPEND(param_name + " is too short")
            
            IF param_schema.maxLength AND LENGTH(param_value) > param_schema.maxLength:
                errors.APPEND(param_name + " is too long")
            
            IF param_schema.pattern AND NOT REGEX_MATCH(param_value, param_schema.pattern):
                errors.APPEND(param_name + " does not match required pattern")
    
    IF LENGTH(errors) > 0:
        RAISE ParameterValidationError(errors)
    
    RETURN TRUE
```

### 1.2 Tool Registry Management
```pseudocode
// TEST: Tool registry maintains consistent state
CLASS ToolRegistry:
    PROPERTY tools: Dict[String, ToolDefinition]
    PROPERTY schemas: Dict[String, Dict]
    
    FUNCTION __init__():
        self.tools = {}
        self.schemas = {}
        self.last_updated = CURRENT timestamp
    
    // TEST: Tool registration prevents duplicates and validates definitions
    FUNCTION register_tool(tool_definition: ToolDefinition):
        tool_name = tool_definition.name
        
        // Check for duplicates
        IF tool_name IN self.tools:
            existing_version = self.tools[tool_name].version
            new_version = tool_definition.version
            
            IF NOT is_newer_version(new_version, existing_version):
                RAISE DuplicateToolError("Tool already exists with same or newer version")
        
        // Validate tool definition
        VALIDATE tool_definition.name follows naming convention
        VALIDATE tool_definition.description is not empty
        VALIDATE tool_definition.parameters is valid schema
        VALIDATE tool_definition.function is callable
        
        // Register tool
        self.tools[tool_name] = tool_definition
        self.schemas[tool_name] = self.extract_schema(tool_definition)
        self.last_updated = CURRENT timestamp
        
        LOG "Tool registered: " + tool_name
    
    // TEST: Schema extraction produces Claude-compatible formats
    FUNCTION extract_schema(tool_definition: ToolDefinition):
        schema = {
            "type": "function",
            "function": {
                "name": tool_definition.name,
                "description": tool_definition.description,
                "parameters": {
                    "type": "object",
                    "properties": tool_definition.parameters,
                    "required": self.extract_required_params(tool_definition.parameters)
                }
            }
        }
        
        RETURN schema
    
    // TEST: Tool lookup handles missing tools gracefully
    FUNCTION get_tool(tool_name: String):
        IF tool_name NOT IN self.tools:
            RAISE ToolNotFoundError("Tool not found: " + tool_name)
        
        RETURN self.tools[tool_name]
    
    // TEST: Schema export includes all registered tools
    FUNCTION export_all_schemas():
        schema_list = []
        FOR each tool_name IN self.tools:
            schema_list.APPEND(self.schemas[tool_name])
        
        RETURN schema_list
```

## 2. SQL Query Tool Implementation

### 2.1 Database Connection Management
```pseudocode
MODULE SQLQueryTool

// TEST: Connection pool manages database connections efficiently
CLASS DatabaseConnectionPool:
    PROPERTY pool: List[Connection]
    PROPERTY max_connections: Integer
    PROPERTY active_connections: Integer
    
    FUNCTION __init__(database_path: String, max_connections: Integer = 10):
        self.database_path = database_path
        self.max_connections = max_connections
        self.pool = []
        self.active_connections = 0
        self.connection_lock = CREATE thread lock
    
    // TEST: Connection acquisition handles pool exhaustion
    FUNCTION acquire_connection():
        WITH self.connection_lock:
            IF LENGTH(self.pool) > 0:
                connection = self.pool.POP()
                self.active_connections += 1
                RETURN connection
            
            IF self.active_connections < self.max_connections:
                connection = CREATE new database connection to self.database_path
                self.active_connections += 1
                RETURN connection
            
            // Pool exhausted, wait for connection
            WAIT for connection to become available
            RETRY acquire_connection()
    
    // TEST: Connection release returns connections to pool
    FUNCTION release_connection(connection: Connection):
        WITH self.connection_lock:
            IF connection.is_healthy():
                self.pool.APPEND(connection)
            ELSE:
                connection.CLOSE()
            
            self.active_connections -= 1
    
    // TEST: Pool cleanup closes all connections properly
    FUNCTION cleanup():
        WITH self.connection_lock:
            FOR each connection IN self.pool:
                connection.CLOSE()
            self.pool.CLEAR()
            self.active_connections = 0

// Global connection pool instance
connection_pool = DatabaseConnectionPool(DATABASE_PATH)
```

### 2.2 SQL Query Execution
```pseudocode
// TEST: SQL execution enforces security constraints
@Tool(
    name="SQL.QueryReadonly",
    description="Execute SELECT queries on the finance database",
    parameters={
        "statement": {
            "type": "string",
            "description": "SQL SELECT statement to execute",
            "pattern": "^\\s*SELECT\\s+.*",
            "maxLength": 1000
        }
    }
)
FUNCTION execute_sql_query(statement: String):
    query_id = GENERATE unique identifier
    start_time = CURRENT timestamp
    
    // Security validation
    VALIDATE_SQL_SECURITY(statement)
    
    // Get database connection
    connection = connection_pool.acquire_connection()
    
    TRY:
        // Parse and analyze query
        parsed_query = PARSE SQL statement
        referenced_tables = EXTRACT table names from parsed_query
        
        // Execute query with timeout
        cursor = connection.execute_with_timeout(statement, timeout=30_seconds)
        
        // Fetch results
        raw_rows = cursor.fetchall()
        column_descriptions = cursor.description
        column_names = [desc[0] FOR desc IN column_descriptions]
        
        // Format results as structured data
        structured_rows = []
        FOR each row IN raw_rows:
            row_dict = {}
            FOR i IN range(LENGTH(column_names)):
                row_dict[column_names[i]] = FORMAT_VALUE(row[i])
            structured_rows.APPEND(row_dict)
        
        end_time = CURRENT timestamp
        execution_time = end_time - start_time
        
        // Prepare response
        response = {
            "query_id": query_id,
            "rows": structured_rows,
            "row_count": LENGTH(structured_rows),
            "columns": column_names,
            "execution_time_ms": execution_time,
            "referenced_tables": referenced_tables,
            "status": "success"
        }
        
        // Log successful query
        LOG_QUERY_EXECUTION(query_id, statement, execution_time, LENGTH(structured_rows))
        
        RETURN response
        
    CATCH sql_error:
        end_time = CURRENT timestamp
        execution_time = end_time - start_time
        
        // Log failed query
        LOG_QUERY_ERROR(query_id, statement, sql_error.message, execution_time)
        
        // Return error response
        RETURN {
            "query_id": query_id,
            "error": "SQL execution failed",
            "error_details": sql_error.message,
            "execution_time_ms": execution_time,
            "status": "failed"
        }
        
    FINALLY:
        connection_pool.release_connection(connection)

// TEST: SQL security validation prevents dangerous operations
FUNCTION VALIDATE_SQL_SECURITY(statement: String):
    normalized = statement.LOWER().STRIP()
    
    // Must start with SELECT
    IF NOT normalized.STARTS_WITH("select"):
        RAISE SecurityViolationError("Only SELECT statements are allowed")
    
    // Forbidden keywords that could modify data
    forbidden_patterns = [
        "\\binsert\\b", "\\bupdate\\b", "\\bdelete\\b", "\\bdrop\\b",
        "\\bcreate\\b", "\\balter\\b", "\\btruncate\\b", "\\bgrant\\b",
        "\\brevoke\\b", "\\bexec\\b", "\\bexecute\\b", "\\bxp_\\w+",
        "\\bsp_\\w+", "\\binto\\s+outfile\\b", "\\bload_file\\b"
    ]
    
    FOR each pattern IN forbidden_patterns:
        IF REGEX_SEARCH(pattern, normalized):
            RAISE SecurityViolationError("Forbidden SQL operation detected: " + pattern)
    
    // Check for SQL injection patterns
    injection_patterns = [
        "\\bunion\\s+select\\b", "\\bor\\s+1\\s*=\\s*1\\b",
        "\\bdrop\\s+table\\b", "\\b;\\s*--\\b", "\\/\\*.*\\*\\/"
    ]
    
    FOR each pattern IN injection_patterns:
        IF REGEX_SEARCH(pattern, normalized):
            RAISE SecurityViolationError("Potential SQL injection detected: " + pattern)
    
    // Validate statement length
    IF LENGTH(statement) > MAX_QUERY_LENGTH:
        RAISE SecurityViolationError("Query exceeds maximum allowed length")
    
    RETURN TRUE

// TEST: Value formatting handles different data types correctly
FUNCTION FORMAT_VALUE(value):
    IF value IS NULL:
        RETURN NULL
    ELIF TYPE_OF(value) IS bytes:
        RETURN BASE64_ENCODE(value)
    ELIF TYPE_OF(value) IS datetime:
        RETURN value.ISO_FORMAT()
    ELIF TYPE_OF(value) IS decimal:
        RETURN FLOAT(value)
    ELSE:
        RETURN value
```

## 3. File System Tool Module

### 3.1 Secure File Operations
```pseudocode
// TEST: File access tool enforces path restrictions
@Tool(
    name="FileSystem.ReadFile",
    description="Read contents of a file within allowed directories",
    parameters={
        "file_path": {
            "type": "string",
            "description": "Path to file to read",
            "pattern": "^[a-zA-Z0-9/._-]+$"
        },
        "encoding": {
            "type": "string",
            "description": "File encoding",
            "default": "utf-8",
            "enum": ["utf-8", "ascii", "latin-1"]
        }
    }
)
FUNCTION read_file_tool(file_path: String, encoding: String = "utf-8"):
    // Security validation
    VALIDATE_FILE_PATH_SECURITY(file_path)
    
    // Resolve absolute path
    absolute_path = RESOLVE_PATH(file_path)
    
    // Check if file exists and is readable
    IF NOT FILE_EXISTS(absolute_path):
        RAISE FileNotFoundError("File does not exist: " + file_path)
    
    IF NOT IS_READABLE(absolute_path):
        RAISE PermissionError("File is not readable: " + file_path)
    
    TRY:
        // Read file with size limit
        file_size = GET_FILE_SIZE(absolute_path)
        IF file_size > MAX_FILE_SIZE:
            RAISE FileSizeError("File too large: " + file_size + " bytes")
        
        // Read file content
        WITH OPEN(absolute_path, mode="r", encoding=encoding) AS file:
            content = file.READ()
        
        // Prepare response
        response = {
            "file_path": file_path,
            "content": content,
            "size_bytes": file_size,
            "encoding": encoding,
            "last_modified": GET_MODIFICATION_TIME(absolute_path),
            "status": "success"
        }
        
        LOG_FILE_ACCESS(file_path, "read", file_size)
        
        RETURN response
        
    CATCH io_error:
        LOG_FILE_ERROR(file_path, "read", io_error.message)
        RETURN {
            "file_path": file_path,
            "error": "Failed to read file",
            "error_details": io_error.message,
            "status": "failed"
        }

// TEST: Path security validation prevents directory traversal
FUNCTION VALIDATE_FILE_PATH_SECURITY(file_path: String):
    // Normalize path to prevent traversal attacks
    normalized_path = NORMALIZE_PATH(file_path)
    
    // Check for directory traversal attempts
    IF ".." IN normalized_path OR "~" IN normalized_path:
        RAISE SecurityViolationError("Directory traversal not allowed")
    
    // Check against allowed directories
    allowed_base_paths = ["/workspace/data", "/workspace/docs", "/workspace/output"]
    is_allowed = FALSE
    
    FOR each base_path IN allowed_base_paths:
        IF normalized_path.STARTS_WITH(base_path):
            is_allowed = TRUE
            BREAK
    
    IF NOT is_allowed:
        RAISE SecurityViolationError("File access not allowed outside permitted directories")
    
    // Check for dangerous file extensions
    dangerous_extensions = [".exe", ".bat", ".sh", ".ps1", ".cmd"]
    file_extension = GET_FILE_EXTENSION(file_path).LOWER()
    
    IF file_extension IN dangerous_extensions:
        RAISE SecurityViolationError("Access to executable files not allowed")
    
    RETURN TRUE
```

### 3.2 Directory Listing Tool
```pseudocode
// TEST: Directory listing tool provides structured file information
@Tool(
    name="FileSystem.ListDirectory",
    description="List contents of a directory within allowed paths",
    parameters={
        "directory_path": {
            "type": "string",
            "description": "Path to directory to list"
        },
        "include_hidden": {
            "type": "boolean",
            "description": "Include hidden files and directories",
            "default": FALSE
        },
        "recursive": {
            "type": "boolean",
            "description": "List subdirectories recursively",
            "default": FALSE
        }
    }
)
FUNCTION list_directory_tool(directory_path: String, include_hidden: Boolean = FALSE, recursive: Boolean = FALSE):
    // Security validation
    VALIDATE_DIRECTORY_PATH_SECURITY(directory_path)
    
    absolute_path = RESOLVE_PATH(directory_path)
    
    IF NOT DIRECTORY_EXISTS(absolute_path):
        RAISE DirectoryNotFoundError("Directory does not exist: " + directory_path)
    
    TRY:
        entries = []
        
        IF recursive:
            file_iterator = WALK_DIRECTORY(absolute_path)
        ELSE:
            file_iterator = LIST_DIRECTORY(absolute_path)
        
        FOR each entry IN file_iterator:
            // Skip hidden files if not requested
            IF NOT include_hidden AND IS_HIDDEN(entry):
                CONTINUE
            
            entry_info = {
                "name": GET_FILENAME(entry),
                "path": GET_RELATIVE_PATH(entry, absolute_path),
                "type": "file" IF IS_FILE(entry) ELSE "directory",
                "size_bytes": GET_FILE_SIZE(entry) IF IS_FILE(entry) ELSE NULL,
                "last_modified": GET_MODIFICATION_TIME(entry),
                "permissions": GET_PERMISSIONS(entry)
            }
            
            entries.APPEND(entry_info)
        
        response = {
            "directory_path": directory_path,
            "entries": entries,
            "total_count": LENGTH(entries),
            "include_hidden": include_hidden,
            "recursive": recursive,
            "status": "success"
        }
        
        LOG_DIRECTORY_ACCESS(directory_path, LENGTH(entries))
        
        RETURN response
        
    CATCH io_error:
        LOG_DIRECTORY_ERROR(directory_path, io_error.message)
        RETURN {
            "directory_path": directory_path,
            "error": "Failed to list directory",
            "error_details": io_error.message,
            "status": "failed"
        }
```

## 4. Web API Tool Module

### 4.1 HTTP Request Tool
```pseudocode
// TEST: HTTP tool handles various request types and validates responses
@Tool(
    name="Web.HTTPRequest",
    description="Make HTTP requests to external APIs",
    parameters={
        "url": {
            "type": "string",
            "description": "URL to request",
            "pattern": "^https?:\\/\\/.+"
        },
        "method": {
            "type": "string",
            "description": "HTTP method",
            "enum": ["GET", "POST", "PUT", "DELETE"],
            "default": "GET"
        },
        "headers": {
            "type": "object",
            "description": "Request headers",
            "default": {}
        },
        "data": {
            "type": "object",
            "description": "Request body data",
            "default": {}
        },
        "timeout": {
            "type": "number",
            "description": "Request timeout in seconds",
            "default": 30,
            "minimum": 1,
            "maximum": 60
        }
    }
)
FUNCTION http_request_tool(url: String, method: String = "GET", headers: Dict = {}, data: Dict = {}, timeout: Number = 30):
    request_id = GENERATE unique identifier
    start_time = CURRENT timestamp
    
    // Security validation
    VALIDATE_URL_SECURITY(url)
    
    // Prepare request
    session = CREATE HTTP session
    session.timeout = timeout
    
    // Add security headers
    default_headers = {
        "User-Agent": "FACT-System/1.0",
        "Accept": "application/json, text/plain, */*"
    }
    
    combined_headers = MERGE(default_headers, headers)
    
    TRY:
        // Make HTTP request
        IF method == "GET":
            response = session.GET(url, headers=combined_headers)
        ELIF method == "POST":
            response = session.POST(url, headers=combined_headers, json=data)
        ELIF method == "PUT":
            response = session.PUT(url, headers=combined_headers, json=data)
        ELIF method == "DELETE":
            response = session.DELETE(url, headers=combined_headers)
        
        end_time = CURRENT timestamp
        response_time = end_time - start_time
        
        // Parse response
        response_data = {
            "request_id": request_id,
            "url": url,
            "method": method,
            "status_code": response.status_code,
            "headers": DICT(response.headers),
            "response_time_ms": response_time,
            "content_length": LENGTH(response.content)
        }
        
        // Parse response body
        content_type = response.headers.get("Content-Type", "")
        IF "application/json" IN content_type:
            response_data["body"] = response.JSON()
            response_data["body_type"] = "json"
        ELSE:
            response_data["body"] = response.TEXT()
            response_data["body_type"] = "text"
        
        // Check for HTTP errors
        IF response.status_code >= 400:
            response_data["status"] = "http_error"
            response_data["error"] = "HTTP " + response.status_code + " error"
        ELSE:
            response_data["status"] = "success"
        
        LOG_HTTP_REQUEST(request_id, url, method, response.status_code, response_time)
        
        RETURN response_data
        
    CATCH timeout_error:
        LOG_HTTP_ERROR(request_id, url, "timeout", timeout_error.message)
        RETURN {
            "request_id": request_id,
            "url": url,
            "method": method,
            "error": "Request timeout",
            "timeout_seconds": timeout,
            "status": "timeout"
        }
        
    CATCH connection_error:
        LOG_HTTP_ERROR(request_id, url, "connection", connection_error.message)
        RETURN {
            "request_id": request_id,
            "url": url,
            "method": method,
            "error": "Connection failed",
            "error_details": connection_error.message,
            "status": "connection_error"
        }

// TEST: URL security validation prevents access to internal resources
FUNCTION VALIDATE_URL_SECURITY(url: String):
    parsed_url = PARSE_URL(url)
    
    // Only allow HTTP and HTTPS
    IF parsed_url.scheme NOT IN ["http", "https"]:
        RAISE SecurityViolationError("Only HTTP and HTTPS URLs are allowed")
    
    // Block access to private IP ranges
    private_ip_ranges = [
        "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16",
        "127.0.0.0/8", "169.254.0.0/16", "::1/128"
    ]
    
    host_ip = RESOLVE_HOSTNAME(parsed_url.hostname)
    FOR each range IN private_ip_ranges:
        IF IP_IN_RANGE(host_ip, range):
            RAISE SecurityViolationError("Access to private IP ranges not allowed")
    
    // Block localhost and internal hostnames
    blocked_hostnames = ["localhost", "0.0.0.0", "metadata.google.internal"]
    IF parsed_url.hostname.LOWER() IN blocked_hostnames:
        RAISE SecurityViolationError("Access to internal hostnames not allowed")
    
    RETURN TRUE
```

## 5. Tool Authorization Module

### 5.1 OAuth Integration
```pseudocode
MODULE ToolAuthorization

// TEST: Authorization flow handles OAuth properly
CLASS AuthorizationManager:
    PROPERTY pending_flows: Dict[String, AuthFlow]
    PROPERTY active_authorizations: Dict[String, Authorization]
    
    // TEST: Authorization initiation creates proper OAuth flow
    FUNCTION initiate_authorization(user_id: String, tool_name: String, scopes: List[String]):
        flow_id = GENERATE unique identifier
        
        // Create authorization URL
        auth_params = {
            "client_id": OAUTH_CLIENT_ID,
            "redirect_uri": OAUTH_REDIRECT_URI,
            "scope": JOIN(scopes, " "),
            "state": flow_id,
            "response_type": "code"
        }
        
        auth_url = OAUTH_BASE_URL + "/authorize?" + URL_ENCODE(auth_params)
        
        // Store pending flow
        auth_flow = {
            "flow_id": flow_id,
            "user_id": user_id,
            "tool_name": tool_name,
            "scopes": scopes,
            "auth_url": auth_url,
            "status": "pending",
            "created_at": CURRENT timestamp,
            "expires_at": CURRENT timestamp + 10 minutes
        }
        
        self.pending_flows[flow_id] = auth_flow
        
        RETURN auth_flow
    
    // TEST: Authorization completion handles callback correctly
    FUNCTION complete_authorization(flow_id: String, authorization_code: String):
        IF flow_id NOT IN self.pending_flows:
            RAISE AuthorizationError("Invalid or expired authorization flow")
        
        auth_flow = self.pending_flows[flow_id]
        
        IF auth_flow.expires_at < CURRENT timestamp:
            DELETE self.pending_flows[flow_id]
            RAISE AuthorizationError("Authorization flow expired")
        
        TRY:
            // Exchange code for access token
            token_params = {
                "grant_type": "authorization_code",
                "code": authorization_code,
                "redirect_uri": OAUTH_REDIRECT_URI,
                "client_id": OAUTH_CLIENT_ID,
                "client_secret": OAUTH_CLIENT_SECRET
            }
            
            token_response = HTTP_POST(OAUTH_TOKEN_URL, data=token_params)
            token_data = token_response.JSON()
            
            // Create authorization record
            authorization = {
                "user_id": auth_flow.user_id,
                "tool_name": auth_flow.tool_name,
                "access_token": token_data.access_token,
                "refresh_token": token_data.get("refresh_token"),
                "scopes": auth_flow.scopes,
                "expires_at": CURRENT timestamp + token_data.expires_in,
                "created_at": CURRENT timestamp
            }
            
            auth_key = auth_flow.user_id + ":" + auth_flow.tool_name
            self.active_authorizations[auth_key] = authorization
            
            // Clean up pending flow
            DELETE self.pending_flows[flow_id]
            
            LOG_AUTHORIZATION_SUCCESS(auth_flow.user_id, auth_flow.tool_name)
            
            RETURN authorization
            
        CATCH oauth_error:
            LOG_AUTHORIZATION_ERROR(flow_id, oauth_error.message)
            RAISE AuthorizationError("Failed to complete authorization: " + oauth_error.message)
    
    // TEST: Authorization validation checks token validity
    FUNCTION validate_authorization(user_id: String, tool_name: String):
        auth_key = user_id + ":" + tool_name
        
        IF auth_key NOT IN self.active_authorizations:
            RAISE UnauthorizedError("No authorization found for user and tool")
        
        authorization = self.active_authorizations[auth_key]
        
        // Check if token is expired
        IF authorization.expires_at < CURRENT timestamp:
            // Try to refresh token
            IF authorization.refresh_token:
                TRY:
                    refreshed_auth = self.refresh_authorization(authorization)
                    self.active_authorizations[auth_key] = refreshed_auth
                    RETURN refreshed_auth
                CATCH refresh_error:
                    DELETE self.active_authorizations[auth_key]
                    RAISE UnauthorizedError("Authorization expired and refresh failed")
            ELSE:
                DELETE self.active_authorizations[auth_key]
                RAISE UnauthorizedError("Authorization expired")
        
        RETURN authorization
    
    // TEST: Token refresh handles expired access tokens
    FUNCTION refresh_authorization(authorization: Authorization):
        refresh_params = {
            "grant_type": "refresh_token",
            "refresh_token": authorization.refresh_token,
            "client_id": OAUTH_CLIENT_ID,
            "client_secret": OAUTH_CLIENT_SECRET
        }
        
        token_response = HTTP_POST(OAUTH_TOKEN_URL, data=refresh_params)
        token_data = token_response.JSON()
        
        // Update authorization with new tokens
        authorization.access_token = token_data.access_token
        authorization.expires_at = CURRENT timestamp + token_data.expires_in
        
        IF "refresh_token" IN token_data:
            authorization.refresh_token = token_data.refresh_token
        
        LOG_TOKEN_REFRESH(authorization.user_id, authorization.tool_name)
        
        RETURN authorization

// Global authorization manager instance
auth_manager = AuthorizationManager()
```

This pseudocode provides comprehensive tool implementations with security, validation, and testing considerations throughout.