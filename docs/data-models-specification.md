# Data Models Specification

## Overview

This document defines all data models, schemas, and database design for the Task Manager REST API. It includes entity relationships, validation rules, and database optimization strategies.

## Database Technology Selection

### Primary Database: PostgreSQL
**Rationale:**
- ACID compliance for data integrity
- Advanced JSON support for flexible fields
- Excellent performance for complex queries
- Strong ecosystem and tooling
- Superior support for relationships and constraints

### Caching Layer: Redis
**Usage:**
- Session storage
- API response caching
- Rate limiting counters
- Real-time features (pub/sub)

---

## 1. Core Entity Models

### 1.1 User Model

#### Database Table: `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role user_role DEFAULT 'user' NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  email_verification_token VARCHAR(255),
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  last_login_at TIMESTAMP,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'user', 'guest');

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_is_active ON users(is_active);
```

#### TypeScript Interface
```typescript
interface User {
  id: string;                    // UUID
  email: string;                 // Unique, validated email
  username: string;              // Unique, 3-50 chars
  passwordHash: string;          // bcrypt hashed password
  firstName: string;             // 1-100 characters
  lastName: string;              // 1-100 characters
  role: 'admin' | 'user' | 'guest';
  isVerified: boolean;           // Email verification status
  isActive: boolean;             // Account status
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLoginAt?: Date;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Validation Rules
```typescript
const userValidation = {
  email: {
    required: true,
    format: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 255,
    unique: true
  },
  username: {
    required: true,
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_]+$/,
    unique: true
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
  },
  firstName: {
    required: true,
    minLength: 1,
    maxLength: 100
  },
  lastName: {
    required: true,
    minLength: 1,
    maxLength: 100
  }
};
```

### 1.2 Project Model

#### Database Table: `projects`

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  status project_status DEFAULT 'active' NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  color VARCHAR(7), -- Hex color for UI
  is_archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Computed fields for performance
  task_count INTEGER DEFAULT 0,
  completed_task_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enum for project status
CREATE TYPE project_status AS ENUM ('active', 'completed', 'on_hold', 'cancelled');

-- Indexes
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_projects_name ON projects(name);
CREATE INDEX idx_projects_is_archived ON projects(is_archived);
CREATE INDEX idx_projects_last_activity ON projects(last_activity_at);
```

#### TypeScript Interface
```typescript
interface Project {
  id: string;
  name: string;                  // 1-200 characters
  description?: string;          // Optional, max 2000 chars
  status: 'active' | 'completed' | 'on_hold' | 'cancelled';
  ownerId: string;              // Foreign key to users
  color?: string;               // Hex color code
  isArchived: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Computed fields
  taskCount: number;
  completedTaskCount: number;
  lastActivityAt: Date;
  
  // Relationships (populated in API responses)
  owner?: User;
  tasks?: Task[];
}
```

#### Validation Rules
```typescript
const projectValidation = {
  name: {
    required: true,
    minLength: 1,
    maxLength: 200
  },
  description: {
    maxLength: 2000
  },
  status: {
    enum: ['active', 'completed', 'on_hold', 'cancelled']
  },
  color: {
    pattern: /^#[0-9A-Fa-f]{6}$/
  }
};
```

### 1.3 Task Model

#### Database Table: `tasks`

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(300) NOT NULL,
  description TEXT,
  status task_status DEFAULT 'todo' NOT NULL,
  priority task_priority DEFAULT 'medium' NOT NULL,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  estimated_hours DECIMAL(5,2), -- Estimated hours to complete
  actual_hours DECIMAL(5,2),    -- Actual hours spent
  position INTEGER DEFAULT 0,    -- For ordering within project/status
  tags TEXT[], -- Array of tags
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enums
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'in_review', 'completed', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Indexes
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_position ON tasks(position);
CREATE INDEX idx_tasks_tags ON tasks USING GIN(tags); -- For tag queries
CREATE INDEX idx_tasks_is_archived ON tasks(is_archived);

-- Full-text search index
CREATE INDEX idx_tasks_search ON tasks USING GIN(
  to_tsvector('english', title || ' ' || COALESCE(description, ''))
);
```

#### TypeScript Interface
```typescript
interface Task {
  id: string;
  title: string;                // 1-300 characters
  description?: string;         // Optional, max 5000 chars
  status: 'todo' | 'in_progress' | 'in_review' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  projectId: string;           // Foreign key to projects
  assigneeId?: string;         // Foreign key to users, optional
  createdBy: string;          // Foreign key to users
  dueDate?: Date;
  completedAt?: Date;
  estimatedHours?: number;
  actualHours?: number;
  position: number;           // For ordering
  tags: string[];            // Array of tags
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relationships (populated in API responses)
  project?: Project;
  assignee?: User;
  creator?: User;
  comments?: Comment[];
}
```

#### Validation Rules
```typescript
const taskValidation = {
  title: {
    required: true,
    minLength: 1,
    maxLength: 300
  },
  description: {
    maxLength: 5000
  },
  status: {
    enum: ['todo', 'in_progress', 'in_review', 'completed', 'cancelled']
  },
  priority: {
    enum: ['low', 'medium', 'high', 'urgent']
  },
  projectId: {
    required: true,
    format: 'uuid'
  },
  assigneeId: {
    format: 'uuid'
  },
  dueDate: {
    format: 'iso-date'
  },
  estimatedHours: {
    min: 0.25,
    max: 999.99
  },
  actualHours: {
    min: 0.25,
    max: 999.99
  },
  tags: {
    maxItems: 10,
    itemMaxLength: 30
  }
};
```

### 1.4 Comment Model

#### Database Table: `comments`

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For threaded comments
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_comments_task_id ON comments(task_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
CREATE INDEX idx_comments_is_deleted ON comments(is_deleted);
```

#### TypeScript Interface
```typescript
interface Comment {
  id: string;
  content: string;              // 1-2000 characters
  taskId: string;              // Foreign key to tasks
  userId: string;              // Foreign key to users
  parentId?: string;           // For threaded comments
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Relationships
  user?: User;
  replies?: Comment[];         // Child comments
}
```

### 1.5 Project Member Model

#### Database Table: `project_members`

```sql
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role member_role DEFAULT 'member' NOT NULL,
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  joined_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(project_id, user_id)
);

-- Enum for member roles
CREATE TYPE member_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- Indexes
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_project_members_role ON project_members(role);
CREATE INDEX idx_project_members_is_active ON project_members(is_active);
```

---

## 2. Relationship Definitions

### Entity Relationship Diagram

```
User ||--o{ Project : owns
User ||--o{ Task : creates
User ||--o{ Task : assigned_to
User ||--o{ Comment : writes
User ||--o{ ProjectMember : belongs_to

Project ||--o{ Task : contains
Project ||--o{ ProjectMember : has

Task ||--o{ Comment : has

Comment ||--o{ Comment : replies_to (parent_id)
```

### Relationship Rules

#### User-Project Relationships
- One user can own multiple projects
- One project has one owner
- Users can be members of multiple projects
- Projects can have multiple members with different roles

#### Project-Task Relationships
- One project contains multiple tasks
- One task belongs to one project
- Tasks are deleted when project is deleted (CASCADE)

#### User-Task Relationships
- One user can create multiple tasks
- One task has one creator
- One user can be assigned to multiple tasks
- One task can have zero or one assignee

#### Task-Comment Relationships
- One task can have multiple comments
- One comment belongs to one task
- Comments support threading (parent-child relationships)

---

## 3. Database Constraints and Triggers

### Referential Integrity Constraints

```sql
-- Ensure project owner is also a project member
CREATE OR REPLACE FUNCTION ensure_owner_is_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO project_members (project_id, user_id, role, joined_at)
  VALUES (NEW.id, NEW.owner_id, 'owner', CURRENT_TIMESTAMP)
  ON CONFLICT (project_id, user_id) 
  DO UPDATE SET role = 'owner', is_active = TRUE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_owner_is_member
  AFTER INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION ensure_owner_is_member();
```

### Update Triggers for Computed Fields

```sql
-- Update project task counts
CREATE OR REPLACE FUNCTION update_project_task_counts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects 
  SET 
    task_count = (
      SELECT COUNT(*) FROM tasks 
      WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
      AND is_archived = FALSE
    ),
    completed_task_count = (
      SELECT COUNT(*) FROM tasks 
      WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
      AND status = 'completed'
      AND is_archived = FALSE
    ),
    last_activity_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_task_counts
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_project_task_counts();
```

### Soft Delete Implementation

```sql
-- Soft delete function for comments
CREATE OR REPLACE FUNCTION soft_delete_comment()
RETURNS TRIGGER AS $$
BEGIN
  OLD.is_deleted = TRUE;
  OLD.deleted_at = CURRENT_TIMESTAMP;
  OLD.updated_at = CURRENT_TIMESTAMP;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Instead of delete trigger for comments
CREATE TRIGGER trigger_soft_delete_comment
  INSTEAD OF DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION soft_delete_comment();
```

---

## 4. Data Validation and Business Rules

### Business Logic Constraints

#### Task Assignment Rules
```sql
-- Task can only be assigned to project members
CREATE OR REPLACE FUNCTION validate_task_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assignee_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = NEW.project_id 
      AND pm.user_id = NEW.assignee_id
      AND pm.is_active = TRUE
    ) THEN
      RAISE EXCEPTION 'User must be a project member to be assigned tasks';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_task_assignment
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION validate_task_assignment();
```

#### Project Status Transitions
```typescript
const allowedStatusTransitions = {
  active: ['completed', 'on_hold', 'cancelled'],
  on_hold: ['active', 'cancelled'],
  completed: ['active'], // Can reopen if needed
  cancelled: [] // Final state
};
```

#### Task Status Transitions
```typescript
const allowedTaskStatusTransitions = {
  todo: ['in_progress', 'cancelled'],
  in_progress: ['in_review', 'completed', 'todo', 'cancelled'],
  in_review: ['completed', 'in_progress', 'todo'],
  completed: ['in_progress'], // Can reopen if needed
  cancelled: ['todo'] // Can restore
};
```

---

## 5. Performance Optimization Strategies

### Database Indexing Strategy

#### Primary Indexes (Already Defined Above)
- All foreign keys indexed
- Frequently queried fields indexed
- Full-text search indexes for content

#### Composite Indexes for Common Queries
```sql
-- For task filtering by project and status
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status) 
WHERE is_archived = FALSE;

-- For task assignment queries
CREATE INDEX idx_tasks_assignee_status ON tasks(assignee_id, status) 
WHERE assignee_id IS NOT NULL AND is_archived = FALSE;

-- For due date queries
CREATE INDEX idx_tasks_due_date_status ON tasks(due_date, status) 
WHERE due_date IS NOT NULL AND is_archived = FALSE;

-- For user's project access
CREATE INDEX idx_project_members_user_active ON project_members(user_id, is_active);
```

### Query Optimization Patterns

#### Efficient Pagination
```sql
-- Cursor-based pagination for large datasets
SELECT * FROM tasks 
WHERE project_id = $1 
AND (created_at, id) > ($2, $3)
ORDER BY created_at, id 
LIMIT 20;
```

#### Efficient Task Counting
```sql
-- Use computed fields instead of COUNT queries
SELECT 
  p.*,
  p.task_count,
  p.completed_task_count,
  ROUND((p.completed_task_count::float / NULLIF(p.task_count, 0)) * 100, 1) as completion_percentage
FROM projects p
WHERE p.owner_id = $1;
```

### Caching Strategies

#### Redis Cache Keys
```typescript
const cacheKeys = {
  user: (id: string) => `user:${id}`,
  userProjects: (userId: string) => `user:${userId}:projects`,
  projectTasks: (projectId: string) => `project:${projectId}:tasks`,
  taskComments: (taskId: string) => `task:${taskId}:comments`,
  projectMembers: (projectId: string) => `project:${projectId}:members`
};

// Cache TTL (Time To Live)
const cacheTTL = {
  user: 3600, // 1 hour
  projects: 1800, // 30 minutes
  tasks: 900, // 15 minutes
  comments: 300 // 5 minutes
};
```

---

## 6. Data Migration and Versioning

### Schema Versioning Strategy

#### Migration File Structure
```
migrations/
├── 001_initial_schema.sql
├── 002_add_task_tags.sql
├── 003_add_project_colors.sql
└── 004_add_task_time_tracking.sql
```

#### Migration Template
```sql
-- Migration: 002_add_task_tags.sql
-- Description: Add tags array field to tasks table
-- Date: 2025-08-29

BEGIN;

-- Add tags column
ALTER TABLE tasks ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Create index for tag searches
CREATE INDEX idx_tasks_tags ON tasks USING GIN(tags);

-- Update schema version
INSERT INTO schema_versions (version, description, applied_at)
VALUES ('002', 'Add task tags functionality', CURRENT_TIMESTAMP);

COMMIT;
```

### Data Seeding

#### Development Seed Data
```sql
-- Insert admin user
INSERT INTO users (id, email, username, first_name, last_name, role, is_verified, password_hash)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'admin@taskmanager.com',
  'admin',
  'System',
  'Administrator',
  'admin',
  true,
  '$2b$12$encrypted_password_hash'
);

-- Insert sample project
INSERT INTO projects (id, name, description, owner_id, status)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'Task Manager Development',
  'Building the task management REST API',
  '550e8400-e29b-41d4-a716-446655440000',
  'active'
);
```

---

## 7. Security Considerations

### Data Encryption

#### Password Hashing
```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

#### Sensitive Data Protection
- All passwords hashed with bcrypt (salt rounds: 12)
- JWT secrets stored in environment variables
- Database connection strings encrypted
- API keys stored in secure key management system

### Data Access Control

#### Row-Level Security (RLS)
```sql
-- Enable RLS on sensitive tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see projects they own or are members of
CREATE POLICY project_access_policy ON projects
  FOR ALL TO authenticated_user
  USING (
    owner_id = current_user_id() OR
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = projects.id
      AND pm.user_id = current_user_id()
      AND pm.is_active = TRUE
    )
  );
```

### Audit Logging

#### Audit Table Structure
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES users(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

---

*This comprehensive data model specification provides the foundation for a scalable, secure, and performant task management system. The design emphasizes data integrity, performance optimization, and security best practices.*