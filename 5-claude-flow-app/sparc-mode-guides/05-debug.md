# 🪲 Debug Mode

## Purpose

Debug mode is the diagnostic specialist that systematically identifies, isolates, and resolves issues in your code. It combines detective work with surgical precision to find root causes, not just symptoms, ensuring problems are truly fixed rather than masked.

## Non-Technical Analogy

Think of Debug mode like a **medical doctor diagnosing a patient**. The doctor:
- Listens to symptoms (error messages, unexpected behavior)
- Asks probing questions (when did it start? what changed?)
- Runs diagnostic tests (logging, breakpoints, unit tests)
- Forms hypotheses about the cause
- Tests each hypothesis systematically
- Prescribes a treatment (the fix)
- Monitors to ensure the problem is resolved

Just as a doctor doesn't randomly prescribe medicine, Debug mode doesn't randomly change code hoping to fix issues.

## When to Use This Mode

✅ **Use Debug when:**
- Application crashes or throws errors
- Unexpected behavior occurs
- Performance degradation is noticed
- Tests are failing mysteriously
- Integration issues arise
- Memory leaks are suspected
- Race conditions occur
- Data corruption happens
- Third-party services fail

❌ **Skip this mode when:**
- Building new features from scratch
- Requirements are unclear (use spec-pseudocode)
- Doing planned refactoring
- Writing documentation

## Typical Workflow

### 1. **Problem Identification** (10-15 minutes)
```bash
# Start debugging process
npx claude-flow sparc run debug "Users report login fails intermittently with 500 error"
```

The mode will:
- Gather symptoms and error messages
- Review recent changes (git history)
- Check logs and monitoring data
- Identify patterns (when/where/who)
- Form initial hypotheses

### 2. **Diagnostic Process**

#### Step 1: Reproduce the Issue
```javascript
// Create minimal reproduction case
describe('Login Bug Reproduction', () => {
  it('should fail under specific conditions', async () => {
    // Arrange: Set up exact conditions
    const user = await createUser({ email: 'test@example.com' });
    await simulateHighLoad();
    
    // Act: Trigger the issue
    const result = await login({ 
      email: 'test@example.com',
      password: 'password123'
    });
    
    // Assert: Confirm the bug
    expect(result.status).toBe(500); // Bug reproduced!
  });
});
```

#### Step 2: Add Strategic Logging
```javascript
async function authenticateUser(credentials) {
  console.log('[AUTH] Starting authentication', { 
    email: credentials.email,
    timestamp: new Date().toISOString()
  });
  
  try {
    console.log('[AUTH] Querying database for user');
    const user = await db.query('SELECT * FROM users WHERE email = $1', 
      [credentials.email]);
    
    if (!user) {
      console.log('[AUTH] User not found', { email: credentials.email });
      return null;
    }
    
    console.log('[AUTH] Verifying password');
    const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
    console.log('[AUTH] Password verification result', { isValid });
    
    return isValid ? user : null;
  } catch (error) {
    console.error('[AUTH] Authentication error', {
      error: error.message,
      stack: error.stack,
      credentials: { email: credentials.email }
    });
    throw error;
  }
}
```

#### Step 3: Isolate the Problem
```javascript
// Binary search approach - comment out half the code
// If bug persists, problem is in remaining half
// If bug disappears, problem is in commented half

// Isolate by layer
async function debugLogin(credentials) {
  // Test database connection
  try {
    await db.ping();
    console.log('✓ Database connection OK');
  } catch (error) {
    console.error('✗ Database connection failed', error);
    return;
  }

  // Test user lookup
  try {
    const user = await findUser(credentials.email);
    console.log('✓ User lookup OK', user ? 'User found' : 'User not found');
  } catch (error) {
    console.error('✗ User lookup failed', error);
    return;
  }

  // Test password hashing
  try {
    const hash = await bcrypt.hash('test', 10);
    console.log('✓ Bcrypt OK');
  } catch (error) {
    console.error('✗ Bcrypt failed', error);
    return;
  }
}
```

#### Step 4: Fix and Verify
```javascript
// Original buggy code
async function getUser(id) {
  const user = cache.get(id);  // Bug: Cache returns undefined
  return user.data;             // Error: Cannot read property 'data' of undefined
}

// Fixed code
async function getUser(id) {
  const cached = cache.get(id);
  if (!cached) {
    const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    cache.set(id, user);
    return user;
  }
  return cached;
}

// Verify fix with test
it('should handle cache miss gracefully', async () => {
  cache.clear(); // Ensure cache is empty
  const user = await getUser('123');
  expect(user).toBeDefined();
  expect(cache.get('123')).toBeDefined(); // Now cached
});
```

### 3. **Root Cause Analysis**
The mode documents:
- **What happened**: Exact error or behavior
- **Why it happened**: Root cause
- **How it was fixed**: Solution applied
- **Prevention**: How to avoid in future

## Example Usage

### Runtime Error
```bash
npx claude-flow sparc run debug "TypeError: Cannot read property 'name' of undefined at line 42"
```

### Performance Issue
```bash
npx claude-flow sparc run debug "API response time increased from 200ms to 5 seconds"
```

### Memory Leak
```bash
npx claude-flow sparc run debug "Node process memory usage grows to 2GB after 24 hours"
```

### Race Condition
```bash
npx claude-flow sparc run debug "Database writes sometimes lost when multiple requests arrive simultaneously"
```

## Output Structure

Debug mode produces:

```markdown
## Debug Report: [Issue Description]

### Symptoms
- Error message or unexpected behavior
- When it occurs
- Affected components

### Investigation
1. Hypothesis 1: [Theory] - [Result]
2. Hypothesis 2: [Theory] - [Result]
3. Hypothesis 3: [Theory] - [Result]

### Root Cause
[Detailed explanation of why the issue occurred]

### Solution
[Code changes made to fix the issue]

### Verification
[Tests added to prevent regression]

### Prevention
[Recommendations to avoid similar issues]
```

## Best Practices

### ✅ DO:
- Reproduce the issue first
- Use scientific method (hypothesis → test → conclusion)
- Check recent changes first
- Add logging before changing code
- Verify fixes with tests
- Document the solution
- Look for similar issues elsewhere
- Clean up debug code after fixing
- Use version control to track changes

### ❌ DON'T:
- Make random changes hoping it works
- Fix symptoms without finding root cause
- Debug in production without safety measures
- Ignore error messages
- Assume the problem is where you think
- Change multiple things at once
- Leave debug code in production
- Skip writing regression tests

## Integration with Other Modes

Debug mode connects to:

1. **→ TDD**: Write tests to prevent regression
2. **→ Code**: Implement the fix properly
3. **→ Security-Review**: If security-related
4. **→ Refinement**: If performance-related
5. **→ Docs-Writer**: Document known issues

## Memory Integration

Debug findings are preserved:
```bash
# Store bug patterns
npx claude-flow memory store debug_pattern "Race condition in user creation"

# Store solutions
npx claude-flow memory store debug_solution "Added mutex lock for concurrent writes"

# Query past issues
npx claude-flow memory query debug
```

## Common Bug Patterns

### 1. **Null/Undefined Errors**
```javascript
// Problem
const name = user.profile.name; // Error if user or profile is undefined

// Solution - Optional chaining
const name = user?.profile?.name;

// Solution - Default values
const name = (user && user.profile && user.profile.name) || 'Anonymous';

// Solution - Guard clause
if (!user || !user.profile) {
  return 'Anonymous';
}
const name = user.profile.name;
```

### 2. **Race Conditions**
```javascript
// Problem
let counter = 0;
async function increment() {
  const current = counter;  // Read
  await someAsyncOperation();
  counter = current + 1;    // Write (may overwrite other increments)
}

// Solution - Atomic operations
const { Mutex } = require('async-mutex');
const mutex = new Mutex();
let counter = 0;

async function increment() {
  const release = await mutex.acquire();
  try {
    const current = counter;
    await someAsyncOperation();
    counter = current + 1;
  } finally {
    release();
  }
}
```

### 3. **Memory Leaks**
```javascript
// Problem - Event listeners not removed
class Component {
  constructor() {
    window.addEventListener('resize', this.handleResize);
  }
  
  handleResize() {
    // Memory leak: listener never removed
  }
}

// Solution
class Component {
  constructor() {
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }
  
  destroy() {
    window.removeEventListener('resize', this.handleResize);
  }
}
```

### 4. **Async/Await Issues**
```javascript
// Problem - Unhandled promise rejection
async function fetchData() {
  const data = await api.get('/data'); // Can throw
  return data;
}

// Solution
async function fetchData() {
  try {
    const data = await api.get('/data');
    return data;
  } catch (error) {
    logger.error('Failed to fetch data', error);
    throw new ApplicationError('Data fetch failed', error);
  }
}
```

## Debugging Tools & Techniques

### Console Methods
```javascript
console.log('Basic output');
console.error('Error output');
console.warn('Warning output');
console.table([{a: 1}, {a: 2}]); // Tabular data
console.time('operation'); // Start timer
console.timeEnd('operation'); // End timer
console.trace(); // Stack trace
console.group('Group name'); // Group logs
console.groupEnd();
```

### Conditional Breakpoints
```javascript
// Only break when condition is true
if (user.id === problematicUserId) {
  debugger; // Breakpoint hits only for specific user
}
```

### Error Boundaries
```javascript
class ErrorBoundary {
  static wrap(fn) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        console.error('Caught error:', {
          function: fn.name,
          arguments: args,
          error: error.message,
          stack: error.stack
        });
        throw error;
      }
    };
  }
}

// Usage
const safeFunction = ErrorBoundary.wrap(riskyFunction);
```

### Performance Profiling
```javascript
// Measure function execution time
function profileFunction(fn) {
  return function(...args) {
    const start = performance.now();
    const result = fn.apply(this, args);
    const end = performance.now();
    console.log(`${fn.name} took ${end - start}ms`);
    return result;
  };
}
```

## Debugging Strategies

### 1. **Binary Search**
- Comment out half the code
- If bug persists → problem in active half
- If bug disappears → problem in commented half
- Repeat until isolated

### 2. **Git Bisect**
```bash
git bisect start
git bisect bad  # Current version is bad
git bisect good abc123  # Known good commit
# Git will checkout commits for you to test
git bisect good/bad  # Mark each as good or bad
git bisect reset  # When done
```

### 3. **Rubber Duck Debugging**
- Explain the code line-by-line
- Often reveals the issue through explanation
- No actual duck required (but recommended)

### 4. **Fresh Eyes**
- Take a break
- Ask a colleague
- Sleep on it
- Different perspective often helps

## Tips for Success

1. **Stay Calm**: Bugs are normal, not personal
2. **Be Methodical**: Random changes waste time
3. **Read Errors Carefully**: They often tell you exactly what's wrong
4. **Check the Obvious**: Is it plugged in? Is the server running?
5. **Reproduce First**: Can't fix what you can't reproduce
6. **One Change at a Time**: Isolate variables
7. **Document Everything**: Future you will thank you
8. **Learn from Bugs**: Each bug teaches something

## Conclusion

Debug mode is your **problem-solving detective** that methodically tracks down issues and eliminates them. It transforms frustrating bugs into learning opportunities and ensures your fixes address root causes, not just symptoms.

Remember: **Debugging is twice as hard as writing code. Therefore, if you write code as cleverly as possible, you are, by definition, not smart enough to debug it!**