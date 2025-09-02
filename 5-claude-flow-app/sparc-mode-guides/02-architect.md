# 🏗️ Architect Mode

## Purpose

Architect mode is the system design specialist that transforms specifications into scalable, maintainable architecture. It focuses on creating the structural blueprint of your application, defining service boundaries, API contracts, database schemas, and the overall system topology.

## Non-Technical Analogy

Think of Architect mode like a **city planner designing a new district**. The city planner:
- Decides where to place residential, commercial, and industrial zones
- Plans the road network connecting different areas
- Ensures utilities (water, electricity) can reach every building
- Designs for future growth and traffic patterns
- Creates zones that work independently but connect seamlessly

Similarly, Architect mode designs how different parts of your software will work together while maintaining independence and scalability.

## When to Use This Mode

✅ **Use Architect when:**
- Starting a new application or major feature
- Designing microservices or service boundaries
- Planning database schemas and relationships
- Creating API contracts between systems
- Refactoring monolithic applications
- Designing for specific scalability requirements
- Planning integration with external services
- Establishing communication patterns between components

❌ **Skip this mode when:**
- Making small feature additions to existing architecture
- Fixing bugs that don't affect structure
- Working on isolated UI components
- The architecture is already well-defined and stable

## Typical Workflow

### 1. **Architecture Analysis** (15-20 minutes)
```bash
# Start the architecture design process
npx claude-flow sparc run architect "Design e-commerce platform with 100k daily users"
```

The mode will:
- Review requirements from spec-pseudocode phase
- Identify key components and services
- Determine scalability needs
- Analyze integration requirements
- Consider security boundaries

### 2. **Component Design**
The mode produces:
- **Service Definitions**: What each service does
- **API Contracts**: RESTful endpoints, GraphQL schemas
- **Data Models**: Database schemas, relationships
- **Communication Patterns**: Sync/async, pub/sub, queues
- **Deployment Topology**: How services are deployed

### 3. **Technical Decisions**
Documents key choices:
```
DECISION: Database Selection
- PostgreSQL for transactional data (ACID compliance)
- Redis for session cache (fast access)
- S3 for file storage (scalability)
- Elasticsearch for product search (full-text capabilities)

DECISION: Service Communication
- REST for external APIs (standard, well-understood)
- gRPC for internal services (performance)
- RabbitMQ for async tasks (reliability)
```

### 4. **Architecture Diagrams** (in text/ASCII)
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│ API Gateway │────▶│   Auth      │
│   (React)   │     │  (Express)  │     │  Service    │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                    ┌──────▼──────┐
                    │   Product   │
                    │   Service   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  PostgreSQL │
                    │   Database  │
                    └─────────────┘
```

## Example Usage

### Microservices Architecture
```bash
npx claude-flow sparc run architect "Design microservices for social media platform"
```

### Database Design
```bash
npx claude-flow sparc run architect "Design database schema for multi-tenant SaaS application"
```

### API Design
```bash
npx claude-flow sparc run architect "Create REST API structure for mobile banking app"
```

### System Integration
```bash
npx claude-flow sparc run architect "Design integration between CRM and email marketing platform"
```

## Output Structure

The mode typically generates:

```markdown
## Architecture: [System Name]

### System Overview
- High-level description
- Key architectural patterns used
- Technology stack decisions

### Services/Components
1. **Service Name**
   - Responsibility: What it does
   - API: Endpoints exposed
   - Dependencies: What it needs
   - Data: What it stores

### Database Design
- Schema definitions
- Relationships
- Indexing strategy
- Partitioning approach

### API Contracts
- Endpoint definitions
- Request/response formats
- Authentication methods
- Rate limiting

### Deployment Architecture
- Infrastructure requirements
- Scaling strategy
- Monitoring points
- Backup/recovery plan

### Security Architecture
- Authentication flow
- Authorization model
- Data encryption
- Security boundaries
```

## Best Practices

### ✅ DO:
- Design for scalability from the start
- Keep services loosely coupled
- Define clear service boundaries
- Use standard protocols and patterns
- Plan for failure scenarios
- Document architectural decisions (ADRs)
- Consider data consistency requirements
- Design with monitoring in mind

### ❌ DON'T:
- Over-engineer for unlikely scenarios
- Create circular dependencies
- Share databases between services
- Ignore network latency
- Forget about data backup and recovery
- Design without considering team expertise
- Create too many microservices initially

## Integration with Other Modes

Architect mode connects to:

1. **← Spec-Pseudocode**: Uses requirements as input
2. **→ Code Mode**: Provides structure for implementation
3. **→ Integration Mode**: Defines how components connect
4. **→ DevOps Mode**: Informs deployment strategy
5. **→ Security-Review**: Establishes security boundaries

## Memory Integration

Architecture decisions are preserved:
```bash
# Store architecture decisions
npx claude-flow memory store arch_decisions "Database: PostgreSQL, Cache: Redis"

# Store API contracts
npx claude-flow memory store arch_api "REST endpoints for user service"

# Query architecture later
npx claude-flow memory query arch
```

## Common Architectural Patterns

### 1. **Layered Architecture**
```
Presentation Layer (UI)
    ↓
Application Layer (Business Logic)
    ↓
Domain Layer (Core Models)
    ↓
Infrastructure Layer (Database, External Services)
```

### 2. **Microservices Pattern**
```
API Gateway → Service Discovery
           ↓
    [Service A] [Service B] [Service C]
           ↓        ↓           ↓
    [DB A]      [DB B]      [DB C]
```

### 3. **Event-Driven Architecture**
```
Producer → Message Queue → Consumer
                ↓
          Event Store
                ↓
          Projections
```

### 4. **CQRS Pattern**
```
Commands → Command Handler → Write Model → Event Store
                                              ↓
Queries  → Query Handler   → Read Model  ← Projections
```

## Scalability Considerations

The mode addresses:

1. **Horizontal Scaling**: How services scale out
2. **Data Partitioning**: Sharding strategies
3. **Caching Layers**: Where and what to cache
4. **Load Balancing**: Distribution strategies
5. **Async Processing**: Queue-based workflows
6. **CDN Strategy**: Static asset delivery

## Database Design Principles

### Schema Design
- Normalization vs. denormalization trade-offs
- Index planning for query patterns
- Partition strategies for large tables
- Backup and recovery procedures

### Data Consistency
- ACID vs. BASE trade-offs
- Eventual consistency patterns
- Distributed transaction handling
- Saga pattern implementation

## API Design Standards

### RESTful Principles
```
GET    /api/users          # List users
GET    /api/users/{id}     # Get specific user
POST   /api/users          # Create user
PUT    /api/users/{id}     # Update user
DELETE /api/users/{id}     # Delete user
```

### Response Standards
```json
{
  "data": {},
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0"
  },
  "errors": []
}
```

## Tips for Success

1. **Start Simple**: Begin with monolith, evolve to microservices
2. **Think in Boundaries**: Clear service separation
3. **Design for Change**: Expect requirements to evolve
4. **Consider Operations**: How will this be deployed and monitored?
5. **Document Why**: Architectural Decision Records (ADRs)
6. **Validate Early**: Review with team before implementation
7. **Plan for Data**: How data flows through the system

## Conclusion

Architect mode is your **structural design expert**. It ensures your application has a solid foundation that can grow, scale, and adapt to changing requirements. Good architecture makes development faster, deployment easier, and maintenance manageable.

Remember: **Architecture is about making the important decisions that are hard to change later. Make them wisely!**