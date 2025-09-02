# 🔗 Integration Mode

## Purpose

Integration mode is the systems connector that ensures different components, services, and external APIs work together seamlessly. It focuses on creating robust interfaces, handling data transformation, managing communication protocols, and ensuring reliable inter-service coordination.

## Non-Technical Analogy

Think of Integration mode like an **international translator at the United Nations**. The translator:
- Understands multiple languages (protocols and formats)
- Accurately conveys messages between parties (data transformation)
- Ensures nothing is lost in translation (data integrity)
- Handles cultural nuances (system-specific requirements)
- Manages simultaneous conversations (async communication)
- Keeps records of discussions (logging and monitoring)

Just as a translator enables cooperation between nations, Integration mode enables cooperation between systems.

## When to Use This Mode

✅ **Use Integration when:**
- Connecting microservices
- Integrating third-party APIs
- Building API gateways
- Setting up message queues
- Implementing webhooks
- Creating data pipelines
- Synchronizing databases
- Building adapters for legacy systems
- Orchestrating workflows
- Implementing event-driven architecture

❌ **Skip this mode when:**
- Working on isolated components
- Building standalone utilities
- No external dependencies exist
- Working purely on frontend UI

## Typical Workflow

### 1. **Integration Analysis** (15-20 minutes)
```bash
# Start integration process
npx claude-flow sparc run integration "Connect payment service with order processing and inventory systems"
```

The mode will:
- Map system boundaries
- Identify integration points
- Analyze data formats
- Define communication protocols
- Plan error handling
- Design retry strategies
- Set up monitoring points

### 2. **Integration Patterns**

#### REST API Integration
```javascript
class PaymentGatewayAdapter {
  constructor(config) {
    this.baseURL = config.baseURL;
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000;
    this.retries = config.retries || 3;
  }

  async processPayment(payment) {
    // Transform internal format to gateway format
    const gatewayPayload = this.transformToGatewayFormat(payment);
    
    // Implement retry logic
    let lastError;
    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        const response = await this.makeRequest({
          method: 'POST',
          endpoint: '/payments',
          data: gatewayPayload
        });
        
        // Transform response back to internal format
        return this.transformFromGatewayFormat(response);
      } catch (error) {
        lastError = error;
        
        // Log attempt
        logger.warn(`Payment attempt ${attempt} failed`, {
          error: error.message,
          payment: payment.id
        });
        
        // Exponential backoff
        if (attempt < this.retries) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }
    
    // All retries failed
    throw new IntegrationError('Payment processing failed', lastError);
  }

  transformToGatewayFormat(payment) {
    return {
      amount: payment.amount * 100, // Convert to cents
      currency: payment.currency.toUpperCase(),
      source: payment.cardToken,
      description: `Order ${payment.orderId}`,
      metadata: {
        orderId: payment.orderId,
        customerId: payment.customerId
      }
    };
  }

  transformFromGatewayFormat(response) {
    return {
      transactionId: response.id,
      status: this.mapStatus(response.status),
      amount: response.amount / 100,
      currency: response.currency,
      processedAt: new Date(response.created * 1000)
    };
  }

  mapStatus(gatewayStatus) {
    const statusMap = {
      'succeeded': 'completed',
      'pending': 'processing',
      'failed': 'failed',
      'canceled': 'cancelled'
    };
    return statusMap[gatewayStatus] || 'unknown';
  }

  async makeRequest({ method, endpoint, data }) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(this.timeout)
    });

    if (!response.ok) {
      throw new IntegrationError(
        `Gateway returned ${response.status}`,
        await response.text()
      );
    }

    return response.json();
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

#### Message Queue Integration
```javascript
class OrderEventPublisher {
  constructor(rabbitMQ) {
    this.connection = rabbitMQ;
    this.exchange = 'orders';
  }

  async publishOrderCreated(order) {
    const event = {
      eventType: 'OrderCreated',
      timestamp: new Date().toISOString(),
      correlationId: uuidv4(),
      payload: {
        orderId: order.id,
        customerId: order.customerId,
        items: order.items,
        totalAmount: order.totalAmount
      }
    };

    await this.publish('order.created', event);
    
    // Trigger dependent services
    await this.notifyInventoryService(order);
    await this.notifyShippingService(order);
    await this.notifyEmailService(order);
  }

  async publish(routingKey, message) {
    const channel = await this.connection.createChannel();
    
    // Ensure exchange exists
    await channel.assertExchange(this.exchange, 'topic', {
      durable: true
    });

    // Publish with persistence
    channel.publish(
      this.exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
        contentType: 'application/json',
        timestamp: Date.now()
      }
    );

    await channel.close();
  }

  async notifyInventoryService(order) {
    const inventoryUpdate = {
      orderId: order.id,
      items: order.items.map(item => ({
        sku: item.sku,
        quantity: item.quantity,
        action: 'reserve'
      }))
    };

    await this.publish('inventory.reserve', inventoryUpdate);
  }
}

class OrderEventConsumer {
  constructor(rabbitMQ) {
    this.connection = rabbitMQ;
    this.queue = 'order-processor';
  }

  async startConsuming() {
    const channel = await this.connection.createChannel();
    
    // Set prefetch for load balancing
    await channel.prefetch(1);
    
    // Ensure queue exists
    await channel.assertQueue(this.queue, {
      durable: true,
      deadLetterExchange: 'dlx',
      deadLetterRoutingKey: 'failed'
    });

    // Bind to exchange
    await channel.bindQueue(this.queue, 'orders', 'order.*');

    // Start consuming
    channel.consume(this.queue, async (message) => {
      try {
        const event = JSON.parse(message.content.toString());
        
        // Process based on event type
        await this.processEvent(event);
        
        // Acknowledge successful processing
        channel.ack(message);
      } catch (error) {
        logger.error('Failed to process event', {
          error: error.message,
          message: message.content.toString()
        });
        
        // Reject and send to dead letter queue
        channel.nack(message, false, false);
      }
    });
  }

  async processEvent(event) {
    switch (event.eventType) {
      case 'OrderCreated':
        await this.handleOrderCreated(event.payload);
        break;
      case 'OrderCancelled':
        await this.handleOrderCancelled(event.payload);
        break;
      default:
        logger.warn(`Unknown event type: ${event.eventType}`);
    }
  }
}
```

#### Database Synchronization
```javascript
class DatabaseSyncService {
  constructor(sourceDB, targetDB) {
    this.source = sourceDB;
    this.target = targetDB;
    this.batchSize = 1000;
  }

  async syncUsers() {
    const lastSync = await this.getLastSyncTime('users');
    
    // Use cursor for large datasets
    const cursor = this.source.collection('users').find({
      updatedAt: { $gt: lastSync }
    }).batchSize(this.batchSize);

    let batch = [];
    let processedCount = 0;

    while (await cursor.hasNext()) {
      const user = await cursor.next();
      
      // Transform data
      const transformedUser = this.transformUser(user);
      batch.push(transformedUser);

      if (batch.length >= this.batchSize) {
        await this.processBatch('users', batch);
        processedCount += batch.length;
        batch = [];
        
        // Log progress
        logger.info(`Synced ${processedCount} users`);
      }
    }

    // Process remaining batch
    if (batch.length > 0) {
      await this.processBatch('users', batch);
      processedCount += batch.length;
    }

    // Update sync timestamp
    await this.updateLastSyncTime('users', new Date());
    
    return processedCount;
  }

  async processBatch(collection, batch) {
    const operations = batch.map(doc => ({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: doc },
        upsert: true
      }
    }));

    try {
      await this.target.collection(collection).bulkWrite(operations);
    } catch (error) {
      // Log failed items for manual review
      await this.logSyncError(collection, batch, error);
      throw error;
    }
  }

  transformUser(sourceUser) {
    return {
      _id: sourceUser.id,
      email: sourceUser.email_address, // Field mapping
      name: `${sourceUser.first_name} ${sourceUser.last_name}`,
      status: sourceUser.active ? 'active' : 'inactive',
      createdAt: sourceUser.created_date,
      updatedAt: sourceUser.modified_date,
      // Add computed fields
      displayName: sourceUser.display_name || sourceUser.email_address,
      // Handle missing fields
      phoneNumber: sourceUser.phone || null
    };
  }
}
```

### 3. **Error Handling & Resilience**

```javascript
class ResilientIntegration {
  constructor(service, options = {}) {
    this.service = service;
    this.circuitBreaker = new CircuitBreaker(options.circuitBreaker);
    this.rateLimiter = new RateLimiter(options.rateLimit);
    this.cache = new Cache(options.cache);
  }

  async callService(operation, params) {
    // Check cache first
    const cacheKey = this.getCacheKey(operation, params);
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Check rate limit
    await this.rateLimiter.acquire();

    // Use circuit breaker
    try {
      const result = await this.circuitBreaker.call(async () => {
        return await this.service[operation](params);
      });

      // Cache successful result
      await this.cache.set(cacheKey, result, 300); // 5 min TTL
      
      return result;
    } catch (error) {
      // Check if we can fallback
      if (this.hasFallback(operation)) {
        return this.getFallback(operation, params);
      }
      
      throw error;
    }
  }

  hasFallback(operation) {
    return this.fallbacks && this.fallbacks[operation];
  }

  getFallback(operation, params) {
    return this.fallbacks[operation](params);
  }
}

class CircuitBreaker {
  constructor(options = {}) {
    this.threshold = options.threshold || 5;
    this.timeout = options.timeout || 60000;
    this.resetTimeout = options.resetTimeout || 30000;
    
    this.state = 'CLOSED';
    this.failures = 0;
    this.nextAttempt = Date.now();
  }

  async call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await Promise.race([
        fn(),
        this.timeout ? this.timeoutPromise() : null
      ].filter(Boolean));

      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failures++;
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
    }
  }

  timeoutPromise() {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), this.timeout)
    );
  }
}
```

## Example Usage

### API Gateway Setup
```bash
npx claude-flow sparc run integration "Create API gateway for microservices architecture"
```

### Event-Driven Integration
```bash
npx claude-flow sparc run integration "Implement event sourcing between order and inventory services"
```

### Third-Party Integration
```bash
npx claude-flow sparc run integration "Integrate Stripe, SendGrid, and Twilio APIs"
```

### Data Pipeline
```bash
npx claude-flow sparc run integration "Build ETL pipeline from PostgreSQL to data warehouse"
```

## Output Structure

Integration mode generates:

```
/src/integrations
  - adapters/
    - paymentGateway.adapter.js
    - emailService.adapter.js
    - smsService.adapter.js
  - middleware/
    - apiGateway.js
    - requestTransformer.js
    - responseTransformer.js
  - events/
    - publishers/
      - orderPublisher.js
    - consumers/
      - orderConsumer.js
    - schemas/
      - orderEvents.schema.js
  - sync/
    - databaseSync.js
    - cacheSync.js
  - monitoring/
    - healthChecks.js
    - metrics.js
```

## Best Practices

### ✅ DO:
- Use standard protocols (REST, GraphQL, gRPC)
- Implement retry logic with backoff
- Add circuit breakers for resilience
- Version your APIs
- Use idempotency keys
- Implement proper timeouts
- Log integration events
- Monitor integration health
- Handle partial failures
- Use message queues for async ops

### ❌ DON'T:
- Tightly couple services
- Ignore network failures
- Skip error handling
- Use synchronous calls for everything
- Forget about rate limits
- Hardcode endpoints
- Mix business logic with integration
- Trust external data without validation
- Create circular dependencies
- Skip integration tests

## Integration with Other Modes

Integration connects to:

1. **← Architect**: Implements designed connections
2. **← Code**: Uses core business logic
3. **→ Debug**: When integration issues arise
4. **→ Security-Review**: Secure external connections
5. **→ DevOps**: Deploy integration infrastructure

## Memory Integration

Integration patterns are stored:
```bash
# Store integration decisions
npx claude-flow memory store integration_pattern "Using RabbitMQ for async messaging"

# Store API contracts
npx claude-flow memory store integration_contract "Payment gateway v2 API"

# Query integration history
npx claude-flow memory query integration
```

## Common Integration Patterns

### 1. **Adapter Pattern**
```javascript
// Adapt external API to internal interface
class ExternalAPIAdapter {
  constructor(externalAPI) {
    this.api = externalAPI;
  }

  async getUser(id) {
    // External API uses different method/format
    const externalUser = await this.api.fetchCustomer(id);
    
    // Transform to internal format
    return {
      id: externalUser.customer_id,
      name: externalUser.full_name,
      email: externalUser.email_address
    };
  }
}
```

### 2. **Facade Pattern**
```javascript
// Simplify complex integrations
class PaymentFacade {
  constructor() {
    this.stripe = new StripeAdapter();
    this.paypal = new PayPalAdapter();
    this.square = new SquareAdapter();
  }

  async processPayment(payment) {
    switch (payment.provider) {
      case 'stripe':
        return this.stripe.charge(payment);
      case 'paypal':
        return this.paypal.process(payment);
      case 'square':
        return this.square.createPayment(payment);
      default:
        throw new Error(`Unknown provider: ${payment.provider}`);
    }
  }
}
```

### 3. **Saga Pattern**
```javascript
// Distributed transaction coordination
class OrderSaga {
  async execute(order) {
    const steps = [];
    
    try {
      // Step 1: Reserve inventory
      const reservation = await this.inventoryService.reserve(order.items);
      steps.push({ service: 'inventory', action: 'reserve', data: reservation });
      
      // Step 2: Process payment
      const payment = await this.paymentService.charge(order.payment);
      steps.push({ service: 'payment', action: 'charge', data: payment });
      
      // Step 3: Create shipment
      const shipment = await this.shippingService.create(order.shipping);
      steps.push({ service: 'shipping', action: 'create', data: shipment });
      
      // Success - confirm all steps
      await this.confirmSteps(steps);
      
      return { success: true, order, steps };
    } catch (error) {
      // Failure - compensate completed steps
      await this.compensateSteps(steps);
      throw error;
    }
  }

  async compensateSteps(steps) {
    for (const step of steps.reverse()) {
      try {
        switch (step.service) {
          case 'inventory':
            await this.inventoryService.release(step.data);
            break;
          case 'payment':
            await this.paymentService.refund(step.data);
            break;
          case 'shipping':
            await this.shippingService.cancel(step.data);
            break;
        }
      } catch (compensationError) {
        logger.error('Compensation failed', { step, error: compensationError });
      }
    }
  }
}
```

## Monitoring & Observability

```javascript
class IntegrationMonitor {
  constructor() {
    this.metrics = new MetricsCollector();
  }

  wrapIntegration(name, fn) {
    return async (...args) => {
      const start = Date.now();
      const labels = { integration: name };
      
      try {
        const result = await fn(...args);
        
        // Record success metrics
        this.metrics.recordDuration(name, Date.now() - start);
        this.metrics.incrementCounter(`${name}_success`, labels);
        
        return result;
      } catch (error) {
        // Record failure metrics
        this.metrics.incrementCounter(`${name}_failure`, labels);
        this.metrics.recordError(name, error);
        
        throw error;
      } finally {
        // Always record attempt
        this.metrics.incrementCounter(`${name}_total`, labels);
      }
    };
  }

  getHealthStatus() {
    return {
      database: this.checkDatabase(),
      cache: this.checkCache(),
      messageQueue: this.checkMessageQueue(),
      externalAPIs: this.checkExternalAPIs()
    };
  }
}
```

## Tips for Success

1. **Design for Failure**: Assume external services will fail
2. **Use Contracts**: Define clear interfaces between services
3. **Implement Idempotency**: Safe to retry operations
4. **Monitor Everything**: Track integration health metrics
5. **Version APIs**: Support backward compatibility
6. **Document Integrations**: Clear API documentation
7. **Test Integrations**: Include integration tests
8. **Handle Timeouts**: Don't wait forever

## Conclusion

Integration mode is your **systems diplomat** that ensures different components work together harmoniously. It handles the complexity of connecting disparate systems while maintaining reliability, performance, and data integrity.

Remember: **Good integration is invisible when it works and invaluable when you need it!**