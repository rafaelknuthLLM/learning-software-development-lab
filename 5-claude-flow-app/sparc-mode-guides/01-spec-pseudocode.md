# 📋 Spec-Pseudocode Mode

## Purpose

The Spec-Pseudocode mode is the foundational planning phase where you transform ideas into structured specifications and logical blueprints. It helps you think through requirements, define clear objectives, and create high-level algorithms before writing any actual code.

## Non-Technical Analogy

Think of Spec-Pseudocode mode like an **architect creating blueprints** for a house. Before any construction begins, the architect:
- Talks with the homeowner to understand their needs
- Sketches out room layouts and flow between spaces
- Creates detailed drawings showing where everything goes
- Plans the sequence of construction steps

Just as you wouldn't start building a house without blueprints, you shouldn't start coding without clear specifications and pseudocode.

## When to Use This Mode

✅ **Use Spec-Pseudocode when:**
- Starting a brand new feature or project
- You need to clarify vague requirements
- Planning complex algorithms or business logic
- Breaking down a large problem into smaller pieces
- Creating a shared understanding with stakeholders
- Documenting acceptance criteria for features
- Establishing data structures and flow patterns

❌ **Skip this mode when:**
- Making simple bug fixes
- The requirements are already crystal clear
- Working on pure UI styling changes
- Doing minor refactoring

## Typical Workflow

### 1. **Requirements Gathering** (10-15 minutes)
```bash
# Start with understanding what needs to be built
npx claude-flow sparc run spec-pseudocode "Create user authentication system"
```

The mode will:
- Analyze the request
- Ask clarifying questions (if needed)
- Define functional requirements
- Identify non-functional requirements (performance, security, etc.)
- List constraints and assumptions

### 2. **Specification Writing**
The mode produces:
- **User Stories**: "As a user, I want to..."
- **Acceptance Criteria**: Clear, testable conditions
- **Data Models**: Structure of information
- **API Contracts**: Input/output specifications
- **Error Scenarios**: What could go wrong?

### 3. **Pseudocode Creation**
High-level logic in plain language:
```
FUNCTION authenticateUser(email, password):
    1. Validate email format
    2. Check if user exists in database
    3. If not exists, return "User not found" error
    4. Hash the provided password
    5. Compare with stored hash
    6. If match, generate JWT token
    7. Log authentication attempt
    8. Return success with token
    OTHERWISE return "Invalid credentials" error
```

### 4. **Algorithm Design**
For complex logic, the mode creates:
- Step-by-step procedures
- Decision trees
- State machines
- Data flow diagrams (in text format)

## Example Usage

### Basic Example
```bash
# Simple feature specification
npx claude-flow sparc run spec-pseudocode "Add shopping cart to e-commerce site"
```

### Complex Example with Context
```bash
# Detailed specification with constraints
npx claude-flow sparc run spec-pseudocode "Design real-time chat system supporting 10k concurrent users with message history and file sharing"
```

### Algorithm-Heavy Example
```bash
# Focus on algorithmic logic
npx claude-flow sparc run spec-pseudocode "Create recommendation engine using collaborative filtering"
```

## Output Structure

The mode typically generates:

```markdown
## Specification: [Feature Name]

### Requirements
- Functional Requirement 1
- Functional Requirement 2
- Non-functional requirements

### User Stories
1. As a [role], I want to [action] so that [benefit]

### Data Models
- Entity definitions
- Relationships
- Validation rules

### Pseudocode
[Detailed algorithmic steps]

### Edge Cases
- Scenario 1: How to handle
- Scenario 2: How to handle

### Success Criteria
- Measurable outcome 1
- Measurable outcome 2
```

## Best Practices

### ✅ DO:
- Start with the "why" before the "how"
- Keep pseudocode language-agnostic
- Focus on logic, not syntax
- Include error handling in specifications
- Consider scalability early
- Define clear boundaries and interfaces
- Think about testing requirements upfront

### ❌ DON'T:
- Skip this phase for complex features
- Write actual code syntax in pseudocode
- Make assumptions without documenting them
- Ignore edge cases and error scenarios
- Create overly detailed specifications for simple tasks

## Integration with Other Modes

Spec-Pseudocode mode connects to:

1. **→ Architect Mode**: Specifications feed into system design
2. **→ TDD Mode**: Acceptance criteria become test cases
3. **→ Code Mode**: Pseudocode guides implementation
4. **→ Docs-Writer Mode**: Specifications become documentation

## Memory Integration

The mode automatically stores:
```bash
# Specifications are saved for reference
npx claude-flow memory store spec_[feature] "Complete specification"

# Query later from other modes
npx claude-flow memory query spec_authentication
```

## Common Patterns

### 1. **CRUD Operations**
```
CREATE: Validate → Check duplicates → Store → Return ID
READ: Validate permissions → Query → Filter → Return data
UPDATE: Validate → Check exists → Update → Log change → Return
DELETE: Validate → Check dependencies → Soft/Hard delete → Confirm
```

### 2. **Authentication Flow**
```
REQUEST → Validate credentials
         → Check user status
         → Generate session/token
         → Set expiry
         → Return auth response
```

### 3. **Data Processing Pipeline**
```
INPUT → Validate format
      → Transform/Clean
      → Apply business rules
      → Store/Forward
      → Return confirmation
```

## Tips for Success

1. **Start Broad, Then Narrow**: Begin with high-level requirements, then drill down
2. **Use Examples**: Concrete examples clarify abstract requirements
3. **Think Like a User**: Focus on user needs, not technical implementation
4. **Document Assumptions**: What you're taking for granted
5. **Consider Future Changes**: Design for flexibility
6. **Validate Early**: Review specs with stakeholders before coding

## Conclusion

Spec-Pseudocode mode is your **thinking and planning companion**. It helps you avoid the costly mistake of building the wrong thing or building it the wrong way. By investing time upfront in clear specifications and logical pseudocode, you save hours of rework and create better, more maintainable solutions.

Remember: **Good specifications are half the implementation!**