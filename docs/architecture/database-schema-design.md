# Database Schema Design

## Overview

This document defines the database schema for the REST API system, including entity relationships, constraints, and indexing strategies.

## Entity Relationship Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Users       │    │     Roles       │    │   Permissions   │
│─────────────────│    │─────────────────│    │─────────────────│
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ email           │    │ name            │    │ name            │
│ username        │    │ description     │    │ resource        │
│ password_hash   │    │ created_at      │    │ action          │
│ first_name      │    │ updated_at      │    │ created_at      │
│ last_name       │    └─────────────────┘    │ updated_at      │
│ role_id (FK)    │                           └─────────────────┘
│ email_verified  │               │                     │
│ created_at      │               └──────────┬──────────┘
│ updated_at      │                          │
│ last_login      │                ┌─────────▼─────────┐
└─────────────────┘                │  RolePermissions  │
          │                        │───────────────────│
          │                        │ role_id (PK,FK)   │
          │                        │ permission_id(PK,FK)│
          │                        │ created_at        │
          ▼                        └───────────────────┘
┌─────────────────┐    
│   UserSessions  │    ┌─────────────────┐    ┌─────────────────┐
│─────────────────│    │    Resources    │    │   Audit_Logs    │
│ id (PK)         │    │─────────────────│    │─────────────────│
│ user_id (FK)    │    │ id (PK)         │    │ id (PK)         │
│ token_id        │    │ name            │    │ user_id (FK)    │
│ refresh_token   │    │ description     │    │ action          │
│ expires_at      │    │ owner_id (FK)   │    │ resource_type   │
│ created_at      │    │ created_at      │    │ resource_id     │
│ ip_address      │    │ updated_at      │    │ ip_address      │
│ user_agent      │    └─────────────────┘    │ user_agent      │
└─────────────────┘                           │ timestamp       │
                                              │ changes         │
                                              └─────────────────┘
```

## Core Entities

### 1. Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role_id UUID REFERENCES roles(id),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role_id ON users(role_id);
```

### 2. Roles Table

```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO roles (name, description) VALUES 
('admin', 'System administrator with full access'),
('user', 'Standard user with limited access'),
('moderator', 'Content moderator with elevated privileges');
```

### 3. Permissions Table

```sql
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(resource, action)
);

INSERT INTO permissions (name, resource, action, description) VALUES
('users:read', 'users', 'read', 'Read user information'),
('users:write', 'users', 'write', 'Create or update users'),
('users:delete', 'users', 'delete', 'Delete users'),
('resources:read', 'resources', 'read', 'Read resources'),
('resources:write', 'resources', 'write', 'Create or update resources'),
('resources:delete', 'resources', 'delete', 'Delete resources'),
('admin:all', 'system', 'all', 'Full system access');
```

### 4. Role Permissions Junction Table

```sql
CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (role_id, permission_id)
);

-- Default role permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'admin' AND p.name = 'admin:all';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'user' AND p.resource IN ('users', 'resources') AND p.action = 'read';
```

### 5. User Sessions Table

```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_id VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token_id ON user_sessions(token_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
```

### 6. Resources Table

```sql
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_resources_owner_id ON resources(owner_id);
CREATE INDEX idx_resources_name ON resources(name);
```

### 7. Audit Logs Table

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    changes JSONB
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
```

## Database Configuration

### Connection Settings

```typescript
// database.config.ts
export const databaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'rest_api_db',
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production',
  pool: {
    min: 2,
    max: 20,
    acquire: 30000,
    idle: 10000
  },
  logging: process.env.NODE_ENV === 'development'
};
```

### Indexing Strategy

1. **Primary Keys**: Automatic B-tree indexes on UUID primary keys
2. **Foreign Keys**: Indexes on all foreign key columns for join performance
3. **Search Fields**: Indexes on frequently searched columns (email, username)
4. **Composite Indexes**: For multi-column queries
5. **Partial Indexes**: For filtered queries (e.g., active users only)

### Performance Considerations

1. **Connection Pooling**: Limit database connections and reuse
2. **Query Optimization**: Use EXPLAIN ANALYZE for query performance
3. **Pagination**: Implement cursor-based pagination for large datasets
4. **Caching**: Cache frequently accessed data in Redis
5. **Read Replicas**: Consider read replicas for scaling read operations

## Security Measures

1. **Password Hashing**: Use bcrypt with salt rounds ≥ 12
2. **SQL Injection Prevention**: Use parameterized queries/ORM
3. **Data Validation**: Validate all inputs before database operations
4. **Audit Trail**: Log all data modifications
5. **Access Control**: Implement row-level security where needed

## Migration Strategy

1. Use database migration tools (e.g., Prisma Migrate, TypeORM migrations)
2. Version control all schema changes
3. Test migrations in staging environment
4. Implement rollback procedures
5. Use blue-green deployments for zero-downtime updates