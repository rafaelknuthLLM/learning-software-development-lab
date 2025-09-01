/**
 * Shared Memory Interface for Hive Mind
 * Provides distributed memory access with consistency guarantees
 */

class SharedMemorySystem {
  constructor(options = {}) {
    this.memory = new Map();
    this.subscribers = new Map();
    this.locks = new Map();
    this.versionHistory = new Map();
    this.replicationNodes = new Set();
    this.consistencyLevel = options.consistency || 'strong'; // 'strong', 'eventual', 'weak'
    this.maxHistorySize = options.maxHistory || 100;
    this.ttlEnabled = options.ttl !== false;
    this.compressionEnabled = options.compression || false;
  }

  /**
   * Store data in shared memory
   */
  async store(key, value, options = {}) {
    const {
      ttl,
      replicate = true,
      version,
      metadata = {},
      lock = false
    } = options;

    // Check for locks
    if (this.locks.has(key)) {
      const lockInfo = this.locks.get(key);
      if (lockInfo.expires > Date.now()) {
        throw new Error(`Key ${key} is locked by ${lockInfo.owner}`);
      } else {
        this.locks.delete(key);
      }
    }

    // Create memory entry
    const entry = {
      key,
      value: this.compressIfNeeded(value),
      version: version || this.generateVersion(key),
      timestamp: Date.now(),
      ttl: ttl ? Date.now() + ttl : null,
      metadata,
      checksum: this.generateChecksum(value),
      size: this.calculateSize(value)
    };

    // Store in local memory
    this.memory.set(key, entry);

    // Update version history
    this.updateVersionHistory(key, entry);

    // Set lock if requested
    if (lock) {
      this.locks.set(key, {
        owner: options.lockOwner || 'system',
        expires: Date.now() + (options.lockTtl || 30000)
      });
    }

    // Replicate to other nodes if needed
    if (replicate && this.replicationNodes.size > 0) {
      await this.replicateToNodes(key, entry);
    }

    // Notify subscribers
    await this.notifySubscribers(key, 'store', entry);

    console.log(`Stored key ${key} with version ${entry.version}`);
    return entry.version;
  }

  /**
   * Retrieve data from shared memory
   */
  async retrieve(key, options = {}) {
    const {
      version,
      includeMetadata = false,
      waitForVersion = false,
      timeout = 5000
    } = options;

    let entry = this.memory.get(key);

    // Check if specific version requested
    if (version && entry && entry.version !== version) {
      entry = this.getVersionFromHistory(key, version);
    }

    // Wait for specific version if requested
    if (waitForVersion && version && (!entry || entry.version !== version)) {
      entry = await this.waitForVersion(key, version, timeout);
    }

    if (!entry) {
      return null;
    }

    // Check TTL
    if (entry.ttl && entry.ttl < Date.now()) {
      this.memory.delete(key);
      await this.notifySubscribers(key, 'expire', entry);
      return null;
    }

    // Decompress if needed
    const value = this.decompressIfNeeded(entry.value);

    if (includeMetadata) {
      return {
        value,
        version: entry.version,
        timestamp: entry.timestamp,
        metadata: entry.metadata,
        size: entry.size
      };
    }

    return value;
  }

  /**
   * Subscribe to memory changes
   */
  subscribe(pattern, callback, options = {}) {
    const {
      events = ['store', 'delete', 'expire'],
      immediate = false
    } = options;

    const subscriptionId = this.generateSubscriptionId();
    const subscription = {
      id: subscriptionId,
      pattern,
      callback,
      events: new Set(events),
      created: Date.now()
    };

    if (!this.subscribers.has(pattern)) {
      this.subscribers.set(pattern, new Map());
    }
    
    this.subscribers.get(pattern).set(subscriptionId, subscription);

    // Send immediate notifications if requested
    if (immediate) {
      this.sendImmediateNotifications(pattern, subscription);
    }

    console.log(`Subscription ${subscriptionId} created for pattern ${pattern}`);
    return subscriptionId;
  }

  /**
   * Unsubscribe from memory changes
   */
  unsubscribe(subscriptionId) {
    for (const [pattern, subs] of this.subscribers) {
      if (subs.has(subscriptionId)) {
        subs.delete(subscriptionId);
        if (subs.size === 0) {
          this.subscribers.delete(pattern);
        }
        console.log(`Unsubscribed ${subscriptionId}`);
        return true;
      }
    }
    return false;
  }

  /**
   * Delete data from shared memory
   */
  async delete(key, options = {}) {
    const { replicate = true, force = false } = options;

    // Check for locks
    if (!force && this.locks.has(key)) {
      const lockInfo = this.locks.get(key);
      if (lockInfo.expires > Date.now()) {
        throw new Error(`Cannot delete locked key ${key}`);
      }
    }

    const entry = this.memory.get(key);
    if (!entry) {
      return false;
    }

    // Remove from memory
    this.memory.delete(key);
    this.locks.delete(key);

    // Replicate deletion
    if (replicate && this.replicationNodes.size > 0) {
      await this.replicateDeletion(key);
    }

    // Notify subscribers
    await this.notifySubscribers(key, 'delete', entry);

    console.log(`Deleted key ${key}`);
    return true;
  }

  /**
   * Atomic operations
   */
  async atomicUpdate(key, updateFunction, options = {}) {
    const lockId = await this.acquireLock(key, options);
    
    try {
      const current = await this.retrieve(key);
      const updated = await updateFunction(current);
      
      if (updated !== undefined) {
        await this.store(key, updated, { 
          ...options, 
          lockOwner: lockId 
        });
      }
      
      return updated;
    } finally {
      await this.releaseLock(key, lockId);
    }
  }

  /**
   * Compare and swap operation
   */
  async compareAndSwap(key, expectedVersion, newValue, options = {}) {
    const entry = this.memory.get(key);
    
    if (!entry || entry.version !== expectedVersion) {
      return false;
    }

    await this.store(key, newValue, options);
    return true;
  }

  /**
   * Bulk operations
   */
  async bulkStore(entries, options = {}) {
    const results = [];
    
    for (const { key, value, ...entryOptions } of entries) {
      try {
        const version = await this.store(key, value, { ...options, ...entryOptions });
        results.push({ key, status: 'success', version });
      } catch (error) {
        results.push({ key, status: 'error', error: error.message });
      }
    }

    return results;
  }

  async bulkRetrieve(keys, options = {}) {
    const results = new Map();
    
    await Promise.all(keys.map(async (key) => {
      try {
        const value = await this.retrieve(key, options);
        results.set(key, value);
      } catch (error) {
        results.set(key, { error: error.message });
      }
    }));

    return results;
  }

  /**
   * Query operations
   */
  query(predicate, options = {}) {
    const { limit = 100, includeMetadata = false } = options;
    const results = [];

    for (const [key, entry] of this.memory) {
      // Skip expired entries
      if (entry.ttl && entry.ttl < Date.now()) continue;

      const value = this.decompressIfNeeded(entry.value);
      
      if (predicate(key, value, entry)) {
        const result = includeMetadata ? {
          key,
          value,
          version: entry.version,
          timestamp: entry.timestamp,
          metadata: entry.metadata
        } : { key, value };
        
        results.push(result);
        
        if (results.length >= limit) break;
      }
    }

    return results;
  }

  /**
   * Pattern matching
   */
  findByPattern(pattern, options = {}) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    
    return this.query((key) => regex.test(key), options);
  }

  /**
   * Memory management
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.memory) {
      if (entry.ttl && entry.ttl < now) {
        this.memory.delete(key);
        this.notifySubscribers(key, 'expire', entry);
        cleaned++;
      }
    }

    // Clean up expired locks
    for (const [key, lockInfo] of this.locks) {
      if (lockInfo.expires < now) {
        this.locks.delete(key);
      }
    }

    console.log(`Cleaned up ${cleaned} expired entries`);
    return cleaned;
  }

  getMemoryStats() {
    const totalEntries = this.memory.size;
    const totalSize = Array.from(this.memory.values())
      .reduce((sum, entry) => sum + (entry.size || 0), 0);
    
    const activeLocks = this.locks.size;
    const subscriptions = Array.from(this.subscribers.values())
      .reduce((sum, subs) => sum + subs.size, 0);

    return {
      totalEntries,
      totalSize,
      activeLocks,
      subscriptions,
      replicationNodes: this.replicationNodes.size,
      consistencyLevel: this.consistencyLevel
    };
  }

  /**
   * Helper methods
   */
  generateVersion(key) {
    const existing = this.memory.get(key);
    const baseVersion = existing ? parseInt(existing.version.split('.')[0]) : 0;
    return `${baseVersion + 1}.${Date.now()}`;
  }

  generateChecksum(data) {
    // Simple checksum - in production would use proper hashing
    return JSON.stringify(data).length.toString(36);
  }

  calculateSize(data) {
    return JSON.stringify(data).length;
  }

  compressIfNeeded(data) {
    if (!this.compressionEnabled) return data;
    // Simplified compression simulation
    return { compressed: true, data };
  }

  decompressIfNeeded(data) {
    if (!this.compressionEnabled || !data?.compressed) return data;
    return data.data;
  }

  updateVersionHistory(key, entry) {
    if (!this.versionHistory.has(key)) {
      this.versionHistory.set(key, []);
    }
    
    const history = this.versionHistory.get(key);
    history.push(entry);
    
    // Trim history if too large
    if (history.length > this.maxHistorySize) {
      history.splice(0, history.length - this.maxHistorySize);
    }
  }

  getVersionFromHistory(key, version) {
    const history = this.versionHistory.get(key);
    return history?.find(entry => entry.version === version);
  }

  async waitForVersion(key, version, timeout) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkVersion = () => {
        const entry = this.memory.get(key);
        if (entry && entry.version === version) {
          resolve(entry);
          return;
        }
        
        if (Date.now() - startTime >= timeout) {
          resolve(null);
          return;
        }
        
        setTimeout(checkVersion, 100);
      };
      
      checkVersion();
    });
  }

  async notifySubscribers(key, event, entry) {
    const notifications = [];
    
    for (const [pattern, subs] of this.subscribers) {
      if (this.matchesPattern(key, pattern)) {
        for (const subscription of subs.values()) {
          if (subscription.events.has(event)) {
            notifications.push(this.sendNotification(subscription, key, event, entry));
          }
        }
      }
    }
    
    await Promise.all(notifications);
  }

  async sendNotification(subscription, key, event, entry) {
    try {
      await subscription.callback({
        key,
        event,
        value: this.decompressIfNeeded(entry.value),
        version: entry.version,
        timestamp: entry.timestamp
      });
    } catch (error) {
      console.error(`Notification callback failed:`, error);
    }
  }

  sendImmediateNotifications(pattern, subscription) {
    for (const [key, entry] of this.memory) {
      if (this.matchesPattern(key, pattern)) {
        this.sendNotification(subscription, key, 'store', entry);
      }
    }
  }

  matchesPattern(key, pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(key);
  }

  async acquireLock(key, options = {}) {
    const lockId = `lock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const ttl = options.lockTtl || 30000;
    
    if (this.locks.has(key)) {
      const existing = this.locks.get(key);
      if (existing.expires > Date.now()) {
        throw new Error(`Key ${key} is already locked`);
      }
    }
    
    this.locks.set(key, {
      id: lockId,
      owner: options.lockOwner || lockId,
      expires: Date.now() + ttl
    });
    
    return lockId;
  }

  async releaseLock(key, lockId) {
    const lock = this.locks.get(key);
    if (lock && lock.id === lockId) {
      this.locks.delete(key);
      return true;
    }
    return false;
  }

  async replicateToNodes(key, entry) {
    // Simulate replication to other nodes
    console.log(`Replicating key ${key} to ${this.replicationNodes.size} nodes`);
  }

  async replicateDeletion(key) {
    // Simulate deletion replication
    console.log(`Replicating deletion of key ${key} to ${this.replicationNodes.size} nodes`);
  }

  generateSubscriptionId() {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = { SharedMemorySystem };