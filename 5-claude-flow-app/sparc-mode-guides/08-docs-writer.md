# 📚 Docs-Writer Mode

## Purpose

Docs-Writer mode is the technical communication specialist that transforms complex code and concepts into clear, comprehensive documentation. It ensures your project is approachable, maintainable, and usable by creating documentation that serves as both reference and learning material.

## Non-Technical Analogy

Think of Docs-Writer mode like a **museum curator creating an exhibition**. The curator:
- Takes complex artifacts (code) and explains their significance
- Creates a logical flow through the exhibition (documentation structure)
- Writes clear labels for each piece (code comments and API docs)
- Provides context and background (architectural decisions)
- Creates guides for different audiences (users, developers, contributors)
- Ensures visitors can navigate easily (table of contents, search)

Just as a good exhibition makes complex history accessible, good documentation makes complex code understandable.

## When to Use This Mode

✅ **Use Docs-Writer when:**
- Starting a new project (README)
- Creating API documentation
- Writing user guides
- Documenting architecture decisions
- Creating contribution guidelines
- Writing deployment instructions
- Explaining complex algorithms
- Onboarding new team members
- Preparing for open-source release
- Creating troubleshooting guides

❌ **Skip this mode when:**
- Code is self-explanatory
- Working on internal prototypes
- Documentation already exists and is current
- Making minor bug fixes

## Typical Workflow

### 1. **Documentation Planning** (10-15 minutes)
```bash
# Start documentation process
npx claude-flow sparc run docs-writer "Create comprehensive API documentation for REST endpoints"
```

The mode will:
- Analyze codebase structure
- Identify documentation needs
- Determine target audiences
- Plan documentation hierarchy
- Choose appropriate formats
- Set up documentation structure

### 2. **Documentation Types**

#### README.md - Project Overview
```markdown
# Project Name

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🎯 Overview

Brief, compelling description of what your project does and why it exists.

## ✨ Features

- **Feature 1**: Brief description
- **Feature 2**: Brief description
- **Feature 3**: Brief description

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Installation

\```bash
# Clone the repository
git clone https://github.com/username/project.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run migrations
npm run migrate

# Start the application
npm run dev
\```

## 📖 Documentation

- [API Documentation](./docs/api.md)
- [Architecture Guide](./docs/architecture.md)
- [Contributing Guide](./CONTRIBUTING.md)

## 🧪 Testing

\```bash
npm test           # Run all tests
npm run test:unit  # Run unit tests only
npm run test:e2e   # Run end-to-end tests
\```

## 📦 Deployment

See [Deployment Guide](./docs/deployment.md) for detailed instructions.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file.
```

#### API Documentation
```markdown
# API Documentation

## Authentication

All API requests require authentication using Bearer tokens.

\```http
Authorization: Bearer <your-token>
\```

## Endpoints

### Users

#### Get User Profile
Retrieves the profile information for a specific user.

**Endpoint:** `GET /api/users/:id`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | User ID |

**Response:**
\```json
{
  "data": {
    "id": "usr_123",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
\```

**Error Responses:**
| Status | Code | Description |
|--------|------|-------------|
| 401 | UNAUTHORIZED | Invalid or missing token |
| 404 | NOT_FOUND | User not found |
| 500 | INTERNAL_ERROR | Server error |

**Example:**
\```bash
curl -X GET https://api.example.com/api/users/usr_123 \
  -H "Authorization: Bearer your-token"
\```
```

#### Code Comments
```javascript
/**
 * Authenticates a user and returns access tokens
 * 
 * @param {Object} credentials - User credentials
 * @param {string} credentials.email - User's email address
 * @param {string} credentials.password - User's password
 * @param {Object} options - Authentication options
 * @param {boolean} options.rememberMe - Whether to extend session
 * @returns {Promise<Object>} Authentication result
 * @returns {string} return.accessToken - JWT access token (expires in 15m)
 * @returns {string} return.refreshToken - JWT refresh token (expires in 7d)
 * @returns {Object} return.user - User profile information
 * @throws {AuthenticationError} When credentials are invalid
 * @throws {ValidationError} When input format is invalid
 * 
 * @example
 * const result = await authenticateUser({
 *   email: 'user@example.com',
 *   password: 'securePassword123'
 * });
 * console.log(result.accessToken);
 */
async function authenticateUser(credentials, options = {}) {
  // Implementation
}
```

### 3. **Architecture Documentation**

```markdown
# Architecture Overview

## System Architecture

Our application follows a microservices architecture with the following components:

\```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   React     │────▶│ API Gateway │────▶│   Auth      │
│   Client    │     │  (Express)  │     │  Service    │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                    ┌──────▼──────┐
                    │   Product   │
                    │   Service   │
                    └──────┬──────┘
                           │
                ┌──────────▼──────────┐
                │     PostgreSQL      │
                │      Database       │
                └────────────────────┘
\```

## Design Decisions

### Why Microservices?
- **Scalability**: Services can scale independently
- **Technology Diversity**: Use best tool for each job
- **Team Autonomy**: Teams can work independently
- **Fault Isolation**: Service failures don't cascade

### Database Strategy
We use PostgreSQL for transactional data because:
- ACID compliance for financial transactions
- Rich querying capabilities
- Proven reliability at scale

### Caching Strategy
Redis is used for:
- Session storage (15-minute TTL)
- API response caching (5-minute TTL)
- Rate limiting counters
```

### 4. **User Guides**

```markdown
# User Guide

## Getting Started

### Creating Your First Project

1. **Sign Up**
   - Navigate to https://app.example.com
   - Click "Sign Up"
   - Enter your email and create a password
   - Verify your email address

2. **Create a Project**
   - Click "New Project" on the dashboard
   - Enter project details:
     - Name: Choose a descriptive name
     - Description: Brief project overview
     - Visibility: Public or Private
   - Click "Create"

3. **Configure Settings**
   - Navigate to Project Settings
   - Set up integrations
   - Configure notifications

### Common Tasks

#### Inviting Team Members
1. Go to Project Settings → Team
2. Click "Invite Member"
3. Enter email address and role
4. Click "Send Invitation"

#### Setting Up Webhooks
1. Navigate to Settings → Webhooks
2. Click "Add Webhook"
3. Enter:
   - URL: Your endpoint URL
   - Events: Select trigger events
   - Secret: Optional signing key
4. Click "Save"

## Troubleshooting

### Problem: Cannot log in
**Solution:**
1. Check your email and password
2. Ensure caps lock is off
3. Try resetting your password
4. Clear browser cookies

### Problem: API returns 429 error
**Solution:**
You've hit the rate limit. Wait 60 seconds or upgrade your plan.
```

## Example Usage

### Complete Documentation Suite
```bash
npx claude-flow sparc run docs-writer "Create full documentation for e-commerce platform"
```

### API Documentation
```bash
npx claude-flow sparc run docs-writer "Document REST API with examples and error codes"
```

### Developer Onboarding
```bash
npx claude-flow sparc run docs-writer "Create developer setup and contribution guide"
```

### Architecture Decisions
```bash
npx claude-flow sparc run docs-writer "Document architectural decisions and trade-offs"
```

## Output Structure

Docs-Writer generates:

```
/docs
  - README.md                 # Project overview
  - api/
    - reference.md           # API endpoint documentation
    - authentication.md      # Auth guide
    - errors.md             # Error code reference
  - guides/
    - getting-started.md    # Quick start guide
    - user-guide.md        # End-user documentation
    - developer-guide.md   # Developer documentation
  - architecture/
    - overview.md          # System architecture
    - decisions/           # ADRs (Architecture Decision Records)
      - 001-database.md
      - 002-caching.md
  - deployment/
    - aws.md              # AWS deployment
    - docker.md           # Docker setup
    - kubernetes.md       # K8s configuration
```

## Best Practices

### ✅ DO:
- Write for your audience
- Use clear, simple language
- Include practical examples
- Keep documentation next to code
- Use diagrams and visuals
- Maintain consistent style
- Version your documentation
- Test code examples
- Include troubleshooting sections
- Update docs with code changes

### ❌ DON'T:
- Use excessive jargon
- Assume prior knowledge
- Write walls of text
- Let docs get outdated
- Document the obvious
- Use ambiguous language
- Skip error scenarios
- Forget about non-technical users
- Write once and forget
- Mix concerns in one document

## Integration with Other Modes

Docs-Writer connects to:

1. **← All Modes**: Documents output from other modes
2. **← Architect**: Documents system design
3. **← API Design**: Creates API references
4. **← Security-Review**: Documents security measures
5. **→ DevOps**: Deployment documentation

## Memory Integration

Documentation patterns are stored:
```bash
# Store documentation structure
npx claude-flow memory store docs_structure "Using docs/ folder with subdirectories"

# Store style guide
npx claude-flow memory store docs_style "Following Microsoft style guide"

# Query documentation decisions
npx claude-flow memory query docs
```

## Documentation Patterns

### 1. **README Template**
```markdown
# Project Name

> One-line description

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
- [Contributing](#contributing)
- [License](#license)

## Features
- Feature with benefit
- Feature with benefit

## Installation
Step-by-step instructions

## Usage
Basic usage examples

## API
Link to detailed API docs

## Contributing
How to contribute

## License
License information
```

### 2. **API Documentation Pattern**
```yaml
# OpenAPI/Swagger format
openapi: 3.0.0
info:
  title: API Name
  version: 1.0.0
  description: API description

paths:
  /users:
    get:
      summary: List users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
      responses:
        200:
          description: Success
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
```

### 3. **Architecture Decision Records (ADR)**
```markdown
# ADR-001: Use PostgreSQL for Primary Database

## Status
Accepted

## Context
We need to choose a primary database for our application.

## Decision
We will use PostgreSQL as our primary database.

## Consequences
### Positive
- ACID compliance
- Rich SQL features
- Proven scalability

### Negative
- Requires more resources than NoSQL
- Schema changes need migrations

## Alternatives Considered
- MongoDB: Rejected due to consistency requirements
- MySQL: Rejected due to limited JSON support
```

### 4. **Code Documentation Standards**

#### JSDoc for JavaScript
```javascript
/**
 * @module UserService
 * @description Handles user-related business logic
 */

/**
 * Creates a new user account
 * @async
 * @param {Object} userData - User information
 * @param {string} userData.email - Email address
 * @param {string} userData.password - Password (will be hashed)
 * @returns {Promise<User>} Created user object
 * @throws {ValidationError} Invalid input data
 * @throws {DuplicateError} Email already exists
 */
```

#### TypeScript Interfaces
```typescript
/**
 * Represents a user in the system
 */
interface User {
  /** Unique identifier */
  id: string;
  
  /** Email address (unique) */
  email: string;
  
  /** Display name */
  name: string;
  
  /** Account creation timestamp */
  createdAt: Date;
  
  /** Last update timestamp */
  updatedAt: Date;
}
```

## Documentation Tools

### Static Site Generators
```bash
# Docusaurus
npx create-docusaurus@latest docs-site classic

# MkDocs
pip install mkdocs
mkdocs new my-project

# VuePress
npm install -D vuepress
```

### API Documentation
```bash
# Swagger/OpenAPI
npm install swagger-ui-express

# Postman Documentation
# Export from Postman app

# API Blueprint
npm install -g aglio
```

### Diagramming
```markdown
# Mermaid diagrams in Markdown
\```mermaid
graph TD
    A[Client] -->|HTTP| B[API Gateway]
    B --> C[Auth Service]
    B --> D[User Service]
    D --> E[(Database)]
\```
```

## Documentation Metrics

Track documentation quality:
- **Coverage**: % of code documented
- **Freshness**: Days since last update
- **Readability**: Flesch reading score
- **Completeness**: Required sections present
- **Accuracy**: Documentation matches code
- **Usefulness**: User feedback scores

## Tips for Success

1. **Know Your Audience**: Write for who will read it
2. **Show, Don't Just Tell**: Include examples
3. **Stay Current**: Update with code changes
4. **Be Concise**: Brevity with clarity
5. **Use Templates**: Consistency helps readers
6. **Test Documentation**: Try following your own guides
7. **Get Feedback**: Ask users what's missing
8. **Version Control**: Track documentation changes

## Conclusion

Docs-Writer mode is your **technical storyteller** that makes complex systems understandable and approachable. Good documentation is an investment that pays dividends in reduced support burden, faster onboarding, and better adoption.

Remember: **Code tells you how, comments tell you why, but documentation tells the whole story!**