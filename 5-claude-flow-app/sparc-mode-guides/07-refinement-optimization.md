# 🧹 Refinement-Optimization Mode

## Purpose

Refinement-Optimization mode is the performance engineer and code beautifier that transforms functional code into elegant, efficient solutions. It focuses on improving speed, reducing resource usage, enhancing readability, and ensuring your code scales gracefully under load.

## Non-Technical Analogy

Think of Refinement-Optimization mode like a **Formula 1 pit crew chief**. The chief:
- Analyzes lap times and telemetry (performance metrics)
- Identifies where time is lost (bottlenecks)
- Fine-tunes the engine for maximum power (optimization)
- Reduces weight without compromising safety (refactoring)
- Streamlines pit stops for efficiency (process improvement)
- Balances speed with reliability (performance vs. maintainability)

Just as a pit crew transforms a good car into a race winner, this mode transforms working code into exceptional code.

## When to Use This Mode

✅ **Use Refinement-Optimization when:**
- Performance metrics show slowdowns
- Code files exceed 500 lines
- Database queries are slow
- Memory usage is high
- Code is difficult to understand
- Duplicate code exists
- API response times are poor
- Before major releases
- After rapid prototyping
- When scaling issues arise

❌ **Skip this mode when:**
- Code is already optimized
- Working on MVP/prototype
- Performance is acceptable
- Time is extremely limited
- No performance metrics exist

## Typical Workflow

### 1. **Performance Analysis** (20-30 minutes)
```bash
# Start optimization process
npx claude-flow sparc run refinement-optimization-mode "Optimize API response time from 3s to under 500ms"
```

The mode will:
- Profile current performance
- Identify bottlenecks
- Analyze code complexity
- Review resource usage
- Check for anti-patterns
- Measure baseline metrics

### 2. **Optimization Strategy**

#### Performance Profiling
```javascript
// Before optimization - measure baseline
console.time('operation');
const results = await slowOperation();
console.timeEnd('operation'); // operation: 3247ms

// Add detailed profiling
class PerformanceProfiler {
  constructor() {
    this.metrics = {};
  }

  start(label) {
    this.metrics[label] = { start: performance.now() };
  }

  end(label) {
    if (!this.metrics[label]) return;
    this.metrics[label].duration = performance.now() - this.metrics[label].start;
  }

  report() {
    return Object.entries(this.metrics)
      .sort(([,a], [,b]) => b.duration - a.duration)
      .map(([label, data]) => ({
        operation: label,
        duration: `${data.duration.toFixed(2)}ms`,
        percentage: `${(data.duration / this.totalTime() * 100).toFixed(1)}%`
      }));
  }

  totalTime() {
    return Object.values(this.metrics)
      .reduce((sum, m) => sum + m.duration, 0);
  }
}
```

#### Database Query Optimization
```javascript
// ❌ SLOW: N+1 query problem
async function getUsersWithPosts() {
  const users = await db.query('SELECT * FROM users');
  
  for (const user of users) {
    user.posts = await db.query(
      'SELECT * FROM posts WHERE user_id = $1',
      [user.id]
    ); // N queries!
  }
  
  return users;
}

// ✅ OPTIMIZED: Single query with JOIN
async function getUsersWithPosts() {
  const query = `
    SELECT 
      u.id, u.name, u.email,
      json_agg(
        json_build_object(
          'id', p.id,
          'title', p.title,
          'content', p.content
        ) ORDER BY p.created_at DESC
      ) AS posts
    FROM users u
    LEFT JOIN posts p ON p.user_id = u.id
    GROUP BY u.id
  `;
  
  return db.query(query);
}

// ✅ OPTIMIZED: With proper indexing
// CREATE INDEX idx_posts_user_id ON posts(user_id);
// CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

#### Algorithm Optimization
```javascript
// ❌ SLOW: O(n²) complexity
function findDuplicates(array) {
  const duplicates = [];
  
  for (let i = 0; i < array.length; i++) {
    for (let j = i + 1; j < array.length; j++) {
      if (array[i] === array[j] && !duplicates.includes(array[i])) {
        duplicates.push(array[i]);
      }
    }
  }
  
  return duplicates;
}

// ✅ OPTIMIZED: O(n) complexity
function findDuplicates(array) {
  const seen = new Set();
  const duplicates = new Set();
  
  for (const item of array) {
    if (seen.has(item)) {
      duplicates.add(item);
    } else {
      seen.add(item);
    }
  }
  
  return Array.from(duplicates);
}
```

### 3. **Code Refactoring**

#### Breaking Large Files
```javascript
// ❌ BEFORE: 800-line monolithic file
// userController.js - handles everything

// ✅ AFTER: Modular architecture
// userController.js - 150 lines (routing)
// userService.js - 200 lines (business logic)
// userRepository.js - 150 lines (data access)
// userValidator.js - 100 lines (validation)
// userSerializer.js - 80 lines (formatting)
// userMiddleware.js - 120 lines (auth/logging)
```

#### Extracting Reusable Functions
```javascript
// ❌ BEFORE: Duplicate code
function processOrder(order) {
  // Validate email
  if (!order.email || !order.email.includes('@')) {
    throw new Error('Invalid email');
  }
  // ... 50 more lines
}

function processRefund(refund) {
  // Validate email (duplicate!)
  if (!refund.email || !refund.email.includes('@')) {
    throw new Error('Invalid email');
  }
  // ... 30 more lines
}

// ✅ AFTER: DRY principle
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }
  return email.toLowerCase();
}

function processOrder(order) {
  order.email = validateEmail(order.email);
  // ... specific order logic
}

function processRefund(refund) {
  refund.email = validateEmail(refund.email);
  // ... specific refund logic
}
```

### 4. **Memory Optimization**

```javascript
// ❌ MEMORY LEAK: Unbounded cache
class Cache {
  constructor() {
    this.data = {};
  }
  
  set(key, value) {
    this.data[key] = value; // Grows forever!
  }
}

// ✅ OPTIMIZED: LRU cache with size limit
class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }
  
  set(key, value) {
    // Delete key if exists (to reorder)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    // Add to end (most recent)
    this.cache.set(key, value);
    
    // Remove oldest if over limit
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
  
  get(key) {
    if (!this.cache.has(key)) return undefined;
    
    // Move to end (most recent)
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }
}
```

## Example Usage

### API Response Optimization
```bash
npx claude-flow sparc run refinement-optimization-mode "Reduce product search API latency"
```

### Database Performance
```bash
npx claude-flow sparc run refinement-optimization-mode "Optimize slow reporting queries"
```

### Memory Usage
```bash
npx claude-flow sparc run refinement-optimization-mode "Reduce Node.js memory footprint from 2GB to 500MB"
```

### Code Refactoring
```bash
npx claude-flow sparc run refinement-optimization-mode "Refactor 1000-line service into modular components"
```

## Output Structure

The mode generates:

```
/performance
  - baseline-metrics.json      # Before optimization
  - optimized-metrics.json     # After optimization
  - optimization-report.md     # Detailed changes

/src (refactored)
  - services/                  # Business logic
  - repositories/             # Data access
  - controllers/              # Request handling
  - utils/                    # Shared utilities
  - middleware/               # Cross-cutting concerns
  
/docs
  - performance-guide.md      # Optimization strategies
  - architecture.md          # Refactored structure
```

## Best Practices

### ✅ DO:
- Measure before optimizing
- Optimize the actual bottleneck
- Keep code readable
- Document optimizations
- Test after optimizing
- Use caching strategically
- Batch operations when possible
- Use appropriate data structures
- Profile in production-like environment
- Consider maintenance cost

### ❌ DON'T:
- Optimize prematurely
- Sacrifice readability for micro-optimizations
- Assume the problem location
- Over-engineer solutions
- Ignore memory leaks
- Cache everything
- Create overly complex solutions
- Optimize without metrics
- Break functionality for speed
- Ignore edge cases

## Integration with Other Modes

Refinement-Optimization connects to:

1. **← Code**: Improves existing implementations
2. **← Debug**: After fixing performance issues
3. **→ TDD**: Ensures optimizations don't break tests
4. **→ Security-Review**: Verify optimizations are secure
5. **→ Docs-Writer**: Document optimization decisions

## Memory Integration

Optimization patterns are stored:
```bash
# Store optimization techniques
npx claude-flow memory store optimization_technique "Implemented database connection pooling"

# Store performance gains
npx claude-flow memory store optimization_result "Reduced API latency by 75%"

# Query optimization history
npx claude-flow memory query optimization
```

## Common Optimization Patterns

### 1. **Caching Strategies**

#### In-Memory Caching
```javascript
class CachedRepository {
  constructor(repository, ttl = 60000) {
    this.repository = repository;
    this.cache = new Map();
    this.ttl = ttl;
  }

  async findById(id) {
    const cached = this.cache.get(id);
    
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }
    
    const data = await this.repository.findById(id);
    this.cache.set(id, {
      data,
      timestamp: Date.now()
    });
    
    return data;
  }
}
```

#### Redis Caching
```javascript
class RedisCache {
  async get(key) {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set(key, value, ttl = 3600) {
    await redis.setex(
      key,
      ttl,
      JSON.stringify(value)
    );
  }

  async invalidate(pattern) {
    const keys = await redis.keys(pattern);
    if (keys.length) {
      await redis.del(...keys);
    }
  }
}
```

### 2. **Lazy Loading**

```javascript
class LazyLoader {
  constructor(loader) {
    this.loader = loader;
    this.cache = null;
    this.loading = null;
  }

  async get() {
    // Return cached if available
    if (this.cache !== null) {
      return this.cache;
    }
    
    // Return existing promise if loading
    if (this.loading) {
      return this.loading;
    }
    
    // Start loading
    this.loading = this.loader();
    this.cache = await this.loading;
    this.loading = null;
    
    return this.cache;
  }
}

// Usage
const expensiveData = new LazyLoader(async () => {
  return await fetchExpensiveData();
});
```

### 3. **Batch Processing**

```javascript
class BatchProcessor {
  constructor(processFn, batchSize = 100, interval = 1000) {
    this.processFn = processFn;
    this.batchSize = batchSize;
    this.interval = interval;
    this.queue = [];
    this.timer = null;
  }

  add(item) {
    this.queue.push(item);
    
    if (this.queue.length >= this.batchSize) {
      this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.interval);
    }
  }

  async flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    if (this.queue.length === 0) return;
    
    const batch = this.queue.splice(0, this.batchSize);
    await this.processFn(batch);
    
    // Process remaining items
    if (this.queue.length > 0) {
      this.flush();
    }
  }
}
```

### 4. **Connection Pooling**

```javascript
const { Pool } = require('pg');

// ❌ SLOW: New connection per query
async function query(sql, params) {
  const client = new Client(dbConfig);
  await client.connect();
  const result = await client.query(sql, params);
  await client.end();
  return result;
}

// ✅ OPTIMIZED: Connection pool
const pool = new Pool({
  ...dbConfig,
  max: 20,                    // Maximum connections
  idleTimeoutMillis: 30000,   // Close idle connections
  connectionTimeoutMillis: 2000 // Connection timeout
});

async function query(sql, params) {
  return pool.query(sql, params);
}
```

## Performance Metrics

### Key Metrics to Track
```javascript
class PerformanceMonitor {
  trackMetrics() {
    return {
      // Response Time
      responseTime: this.measureResponseTime(),
      
      // Throughput
      requestsPerSecond: this.calculateRPS(),
      
      // Resource Usage
      cpuUsage: process.cpuUsage(),
      memoryUsage: process.memoryUsage(),
      
      // Database
      queryTime: this.averageQueryTime(),
      connectionPoolUsage: this.poolStats(),
      
      // Cache
      cacheHitRate: this.cacheHits / this.cacheRequests,
      
      // Errors
      errorRate: this.errors / this.totalRequests
    };
  }
}
```

## Refactoring Strategies

### 1. **Extract Method**
```javascript
// Before: Long method
function processPayment(order) {
  // Validate card - 20 lines
  // Calculate fees - 15 lines
  // Process payment - 25 lines
  // Send receipt - 10 lines
}

// After: Extracted methods
function processPayment(order) {
  validateCard(order.card);
  const fees = calculateFees(order.amount);
  const transaction = chargeCard(order.card, order.amount + fees);
  sendReceipt(order.email, transaction);
}
```

### 2. **Replace Conditionals with Polymorphism**
```javascript
// Before: Complex conditionals
function calculateShipping(order) {
  if (order.type === 'standard') {
    return order.weight * 0.5;
  } else if (order.type === 'express') {
    return order.weight * 1.5 + 10;
  } else if (order.type === 'overnight') {
    return order.weight * 3 + 25;
  }
}

// After: Strategy pattern
class StandardShipping {
  calculate(weight) { return weight * 0.5; }
}

class ExpressShipping {
  calculate(weight) { return weight * 1.5 + 10; }
}

class OvernightShipping {
  calculate(weight) { return weight * 3 + 25; }
}

const shippingStrategies = {
  standard: new StandardShipping(),
  express: new ExpressShipping(),
  overnight: new OvernightShipping()
};

function calculateShipping(order) {
  return shippingStrategies[order.type].calculate(order.weight);
}
```

## Tips for Success

1. **Measure First**: Never optimize without metrics
2. **80/20 Rule**: Focus on the 20% causing 80% of issues
3. **Iterative Approach**: Small improvements compound
4. **Test Coverage**: Ensure tests before refactoring
5. **Document Why**: Explain optimization decisions
6. **Balance Trade-offs**: Speed vs. readability vs. memory
7. **Production-Like**: Test optimizations realistically
8. **Monitor Impact**: Track metrics after deployment

## Conclusion

Refinement-Optimization mode is your **performance tuning expert** that transforms good code into great code. It ensures your application not only works but excels under pressure, scales gracefully, and remains maintainable.

Remember: **Premature optimization is the root of all evil, but timely optimization is the path to excellence!**