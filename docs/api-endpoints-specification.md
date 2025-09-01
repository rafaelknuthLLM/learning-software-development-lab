# REST API Endpoints Specification

## Overview

This document provides detailed specifications for all REST API endpoints, including request/response formats, authentication requirements, and example usage.

## Base URL Structure

```
Production: https://api.taskmanager.com/v1
Staging: https://api-staging.taskmanager.com/v1
Development: http://localhost:3000/api/v1
```

## Authentication

All protected endpoints require JWT authentication via the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format Standards

### Success Response Format
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully",
  "meta": {
    "timestamp": "2025-08-29T10:00:00Z",
    "version": "1.0.0"
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-08-29T10:00:00Z",
    "version": "1.0.0"
  }
}
```

### Pagination Response Format
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "page_size": 20,
      "total_items": 195,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

---

## 1. Authentication Endpoints

### 1.1 User Registration
**Endpoint:** `POST /auth/register`  
**Authentication:** None  
**Rate Limit:** 5 requests/minute per IP

#### Request Body
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "password": "securePassword123!",
  "confirmPassword": "securePassword123!"
}
```

#### Validation Rules
- email: Valid email format, unique
- username: 3-30 characters, alphanumeric + underscore, unique
- firstName: 1-50 characters
- lastName: 1-50 characters
- password: Min 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
- confirmPassword: Must match password

#### Success Response (201)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isVerified": false,
      "createdAt": "2025-08-29T10:00:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600
    }
  },
  "message": "Registration successful. Please verify your email."
}
```

#### Error Responses
- 400: Validation errors, email/username already exists
- 429: Rate limit exceeded
- 500: Server error

### 1.2 User Login
**Endpoint:** `POST /auth/login`  
**Authentication:** None  
**Rate Limit:** 10 requests/minute per IP

#### Request Body
```json
{
  "login": "user@example.com", // email or username
  "password": "securePassword123!"
}
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "lastLoginAt": "2025-08-29T10:00:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600
    }
  },
  "message": "Login successful"
}
```

### 1.3 Token Refresh
**Endpoint:** `POST /auth/refresh`  
**Authentication:** Refresh Token  
**Rate Limit:** 20 requests/hour per user

#### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600
    }
  },
  "message": "Token refreshed successfully"
}
```

### 1.4 User Logout
**Endpoint:** `POST /auth/logout`  
**Authentication:** Bearer Token  
**Rate Limit:** 30 requests/minute per user

#### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..." // optional, for token blacklisting
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 2. User Management Endpoints

### 2.1 Get User Profile
**Endpoint:** `GET /users/profile`  
**Authentication:** Bearer Token  
**Rate Limit:** 100 requests/minute per user

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isVerified": true,
      "createdAt": "2025-08-29T10:00:00Z",
      "updatedAt": "2025-08-29T10:00:00Z",
      "lastLoginAt": "2025-08-29T10:00:00Z"
    }
  }
}
```

### 2.2 Update User Profile
**Endpoint:** `PUT /users/profile`  
**Authentication:** Bearer Token  
**Rate Limit:** 20 requests/hour per user

#### Request Body
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe_updated" // optional
}
```

#### Validation Rules
- firstName: 1-50 characters (optional)
- lastName: 1-50 characters (optional)
- username: 3-30 characters, alphanumeric + underscore, unique (optional)

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "username": "johndoe_updated",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "updatedAt": "2025-08-29T11:00:00Z"
    }
  },
  "message": "Profile updated successfully"
}
```

---

## 3. Project Management Endpoints

### 3.1 List User Projects
**Endpoint:** `GET /projects`  
**Authentication:** Bearer Token  
**Rate Limit:** 200 requests/minute per user

#### Query Parameters
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `status`: Filter by project status (active, completed, archived)
- `search`: Search in project name and description
- `sort`: Sort by (name, createdAt, updatedAt) (default: createdAt)
- `order`: Sort order (asc, desc) (default: desc)

#### Example Request
```
GET /projects?page=1&limit=20&status=active&search=web&sort=name&order=asc
```

#### Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Web Application Project",
      "description": "Building a modern web application",
      "status": "active",
      "ownerId": "550e8400-e29b-41d4-a716-446655440000",
      "taskCount": 15,
      "completedTaskCount": 8,
      "createdAt": "2025-08-29T10:00:00Z",
      "updatedAt": "2025-08-29T10:30:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "page_size": 20,
      "total_items": 45,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

### 3.2 Create New Project
**Endpoint:** `POST /projects`  
**Authentication:** Bearer Token  
**Rate Limit:** 30 requests/hour per user

#### Request Body
```json
{
  "name": "New Project",
  "description": "Project description here",
  "status": "active" // optional, defaults to 'active'
}
```

#### Validation Rules
- name: 1-100 characters, required
- description: Max 1000 characters, optional
- status: One of [active, completed, archived], optional

#### Success Response (201)
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "New Project",
      "description": "Project description here",
      "status": "active",
      "ownerId": "550e8400-e29b-41d4-a716-446655440000",
      "taskCount": 0,
      "completedTaskCount": 0,
      "createdAt": "2025-08-29T11:00:00Z",
      "updatedAt": "2025-08-29T11:00:00Z"
    }
  },
  "message": "Project created successfully"
}
```

### 3.3 Get Project Details
**Endpoint:** `GET /projects/:projectId`  
**Authentication:** Bearer Token  
**Rate Limit:** 200 requests/minute per user

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Web Application Project",
      "description": "Building a modern web application",
      "status": "active",
      "ownerId": "550e8400-e29b-41d4-a716-446655440000",
      "owner": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "username": "johndoe",
        "firstName": "John",
        "lastName": "Doe"
      },
      "taskCount": 15,
      "completedTaskCount": 8,
      "createdAt": "2025-08-29T10:00:00Z",
      "updatedAt": "2025-08-29T10:30:00Z",
      "recentTasks": [
        // Recent 5 tasks
      ]
    }
  }
}
```

#### Error Responses
- 404: Project not found
- 403: Access denied (not project owner or member)

### 3.4 Update Project
**Endpoint:** `PUT /projects/:projectId`  
**Authentication:** Bearer Token  
**Rate Limit:** 50 requests/hour per user

#### Request Body
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "completed"
}
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Updated Project Name",
      "description": "Updated description",
      "status": "completed",
      "updatedAt": "2025-08-29T11:30:00Z"
    }
  },
  "message": "Project updated successfully"
}
```

### 3.5 Delete Project
**Endpoint:** `DELETE /projects/:projectId`  
**Authentication:** Bearer Token (Owner only)  
**Rate Limit:** 10 requests/hour per user

#### Success Response (200)
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

#### Error Responses
- 404: Project not found
- 403: Access denied (not project owner)
- 409: Cannot delete project with active tasks

---

## 4. Task Management Endpoints

### 4.1 List Tasks
**Endpoint:** `GET /tasks`  
**Authentication:** Bearer Token  
**Rate Limit:** 300 requests/minute per user

#### Query Parameters
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `projectId`: Filter by project ID
- `assigneeId`: Filter by assignee ID
- `status`: Filter by task status (todo, in_progress, completed, cancelled)
- `priority`: Filter by priority (low, medium, high, urgent)
- `dueBefore`: Filter tasks due before date (ISO 8601)
- `dueAfter`: Filter tasks due after date (ISO 8601)
- `search`: Search in task title and description
- `sort`: Sort by (title, priority, dueDate, createdAt, updatedAt)
- `order`: Sort order (asc, desc)

#### Example Request
```
GET /tasks?projectId=550e8400-e29b-41d4-a716-446655440001&status=in_progress&sort=dueDate&order=asc
```

#### Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "title": "Implement user authentication",
      "description": "Add JWT-based authentication system",
      "status": "in_progress",
      "priority": "high",
      "projectId": "550e8400-e29b-41d4-a716-446655440001",
      "assigneeId": "550e8400-e29b-41d4-a716-446655440000",
      "assignee": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "username": "johndoe",
        "firstName": "John",
        "lastName": "Doe"
      },
      "dueDate": "2025-09-01T10:00:00Z",
      "createdAt": "2025-08-29T10:00:00Z",
      "updatedAt": "2025-08-29T10:30:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "page_size": 20,
      "total_items": 87,
      "has_next": true,
      "has_prev": false
    },
    "filters": {
      "projectId": "550e8400-e29b-41d4-a716-446655440001",
      "status": "in_progress"
    }
  }
}
```

### 4.2 Create New Task
**Endpoint:** `POST /tasks`  
**Authentication:** Bearer Token  
**Rate Limit:** 100 requests/hour per user

#### Request Body
```json
{
  "title": "New Task Title",
  "description": "Detailed task description",
  "projectId": "550e8400-e29b-41d4-a716-446655440001",
  "assigneeId": "550e8400-e29b-41d4-a716-446655440000", // optional
  "priority": "medium", // optional, defaults to 'medium'
  "dueDate": "2025-09-01T10:00:00Z" // optional
}
```

#### Validation Rules
- title: 1-200 characters, required
- description: Max 2000 characters, optional
- projectId: Must be a valid project ID user has access to, required
- assigneeId: Must be a valid user ID, optional
- priority: One of [low, medium, high, urgent], optional
- dueDate: Valid ISO 8601 date, optional

#### Success Response (201)
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "550e8400-e29b-41d4-a716-446655440011",
      "title": "New Task Title",
      "description": "Detailed task description",
      "status": "todo",
      "priority": "medium",
      "projectId": "550e8400-e29b-41d4-a716-446655440001",
      "assigneeId": "550e8400-e29b-41d4-a716-446655440000",
      "dueDate": "2025-09-01T10:00:00Z",
      "createdAt": "2025-08-29T11:00:00Z",
      "updatedAt": "2025-08-29T11:00:00Z"
    }
  },
  "message": "Task created successfully"
}
```

### 4.3 Get Task Details
**Endpoint:** `GET /tasks/:taskId`  
**Authentication:** Bearer Token  
**Rate Limit:** 200 requests/minute per user

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "title": "Implement user authentication",
      "description": "Add JWT-based authentication system with proper validation",
      "status": "in_progress",
      "priority": "high",
      "projectId": "550e8400-e29b-41d4-a716-446655440001",
      "project": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Web Application Project",
        "status": "active"
      },
      "assigneeId": "550e8400-e29b-41d4-a716-446655440000",
      "assignee": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "username": "johndoe",
        "firstName": "John",
        "lastName": "Doe"
      },
      "dueDate": "2025-09-01T10:00:00Z",
      "createdAt": "2025-08-29T10:00:00Z",
      "updatedAt": "2025-08-29T10:30:00Z",
      "comments": [
        // Recent comments
      ]
    }
  }
}
```

### 4.4 Update Task
**Endpoint:** `PUT /tasks/:taskId`  
**Authentication:** Bearer Token  
**Rate Limit:** 100 requests/hour per user

#### Request Body
```json
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "status": "completed",
  "priority": "high",
  "assigneeId": "550e8400-e29b-41d4-a716-446655440000",
  "dueDate": "2025-09-01T10:00:00Z"
}
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "title": "Updated Task Title",
      "description": "Updated description",
      "status": "completed",
      "priority": "high",
      "updatedAt": "2025-08-29T11:30:00Z"
    }
  },
  "message": "Task updated successfully"
}
```

### 4.5 Update Task Status Only
**Endpoint:** `PATCH /tasks/:taskId/status`  
**Authentication:** Bearer Token  
**Rate Limit:** 200 requests/hour per user

#### Request Body
```json
{
  "status": "in_progress"
}
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "status": "in_progress",
      "updatedAt": "2025-08-29T11:30:00Z"
    }
  },
  "message": "Task status updated successfully"
}
```

### 4.6 Delete Task
**Endpoint:** `DELETE /tasks/:taskId`  
**Authentication:** Bearer Token  
**Rate Limit:** 20 requests/hour per user

#### Success Response (200)
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

## 5. Health and Utility Endpoints

### 5.1 Health Check
**Endpoint:** `GET /health`  
**Authentication:** None  
**Rate Limit:** None

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-08-29T11:00:00Z",
    "version": "1.0.0",
    "uptime": 86400,
    "database": {
      "status": "connected",
      "responseTime": "5ms"
    },
    "redis": {
      "status": "connected",
      "responseTime": "2ms"
    }
  }
}
```

### 5.2 API Information
**Endpoint:** `GET /`  
**Authentication:** None  
**Rate Limit:** 100 requests/minute per IP

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "name": "Task Manager API",
    "version": "1.0.0",
    "description": "REST API for task and project management",
    "documentation": "https://api-docs.taskmanager.com",
    "support": "support@taskmanager.com"
  }
}
```

---

## 6. Error Codes Reference

### Authentication Errors
- `AUTH_TOKEN_MISSING`: Authorization token not provided
- `AUTH_TOKEN_INVALID`: Token is invalid or expired
- `AUTH_TOKEN_EXPIRED`: Token has expired
- `AUTH_CREDENTIALS_INVALID`: Login credentials are incorrect
- `AUTH_ACCOUNT_LOCKED`: Account temporarily locked due to failed attempts

### Validation Errors
- `VALIDATION_ERROR`: Request validation failed
- `VALIDATION_REQUIRED_FIELD`: Required field is missing
- `VALIDATION_INVALID_FORMAT`: Field format is invalid
- `VALIDATION_VALUE_TOO_SHORT`: Field value is too short
- `VALIDATION_VALUE_TOO_LONG`: Field value is too long

### Resource Errors
- `RESOURCE_NOT_FOUND`: Requested resource does not exist
- `RESOURCE_ACCESS_DENIED`: User doesn't have permission to access resource
- `RESOURCE_ALREADY_EXISTS`: Resource with same identifier already exists
- `RESOURCE_CONFLICT`: Resource is in conflicting state

### Rate Limiting Errors
- `RATE_LIMIT_EXCEEDED`: API rate limit exceeded
- `RATE_LIMIT_DAILY_EXCEEDED`: Daily rate limit exceeded

### Server Errors
- `INTERNAL_ERROR`: Internal server error
- `DATABASE_ERROR`: Database operation failed
- `SERVICE_UNAVAILABLE`: Service temporarily unavailable

---

## 7. Rate Limiting Details

### Rate Limiting Headers
All responses include rate limiting headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1693320000
X-RateLimit-Window: 60
```

### Rate Limiting Tiers
- **Public endpoints**: 100 requests/minute per IP
- **Authenticated endpoints**: 200-300 requests/minute per user
- **Write operations**: 50-100 requests/hour per user
- **Sensitive operations**: 5-20 requests/hour per user

### Rate Limiting Response (429)
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 60 seconds.",
    "details": {
      "limit": 100,
      "remaining": 0,
      "resetAt": "2025-08-29T11:01:00Z"
    }
  }
}
```

---

*This specification provides complete endpoint documentation for the Task Manager REST API. All endpoints follow consistent patterns for authentication, validation, error handling, and response formatting.*