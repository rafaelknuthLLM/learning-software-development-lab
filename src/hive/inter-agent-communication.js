/**
 * Inter-Agent Communication System
 * Enables secure, efficient communication between agents in the hive mind
 */

class InterAgentCommunicationSystem {
  constructor(options = {}) {
    this.agents = new Map();
    this.channels = new Map();
    this.messageQueue = new Map();
    this.subscriptions = new Map();
    this.messageHistory = [];
    this.encryptionEnabled = options.encryption || false;
    this.maxMessageHistory = options.maxHistory || 1000;
  }

  /**
   * Register an agent for communication
   */
  registerAgent(agentId, metadata = {}) {
    const agent = {
      id: agentId,
      type: metadata.type || 'generic',
      capabilities: metadata.capabilities || [],
      status: 'online',
      lastSeen: Date.now(),
      messageCount: 0,
      channels: new Set()
    };

    this.agents.set(agentId, agent);
    this.messageQueue.set(agentId, []);
    this.subscriptions.set(agentId, new Set());
    
    console.log(`Agent ${agentId} registered for communication`);
    return agent;
  }

  /**
   * Send direct message between agents
   */
  async sendDirectMessage(fromAgentId, toAgentId, message, priority = 'normal') {
    const fromAgent = this.agents.get(fromAgentId);
    const toAgent = this.agents.get(toAgentId);

    if (!fromAgent || !toAgent) {
      throw new Error('One or both agents not found');
    }

    const messageObj = {
      id: this.generateMessageId(),
      type: 'direct',
      from: fromAgentId,
      to: toAgentId,
      content: message,
      priority,
      timestamp: Date.now(),
      status: 'sent'
    };

    // Add to recipient's queue
    const queue = this.messageQueue.get(toAgentId);
    queue.push(messageObj);
    
    // Sort by priority
    this.sortMessageQueue(queue);

    // Update statistics
    fromAgent.messageCount++;
    this.messageHistory.push(messageObj);
    this.trimMessageHistory();

    console.log(`Direct message sent from ${fromAgentId} to ${toAgentId}`);
    return messageObj.id;
  }

  /**
   * Send broadcast message to all agents
   */
  async broadcastMessage(fromAgentId, message, filter = null) {
    const fromAgent = this.agents.get(fromAgentId);
    if (!fromAgent) {
      throw new Error(`Agent ${fromAgentId} not found`);
    }

    const messageObj = {
      id: this.generateMessageId(),
      type: 'broadcast',
      from: fromAgentId,
      content: message,
      timestamp: Date.now(),
      status: 'broadcasted'
    };

    let recipientCount = 0;
    
    for (const [agentId, agent] of this.agents) {
      if (agentId === fromAgentId) continue;
      
      // Apply filter if provided
      if (filter && !this.matchesFilter(agent, filter)) continue;

      const queue = this.messageQueue.get(agentId);
      queue.push({...messageObj, to: agentId});
      recipientCount++;
    }

    fromAgent.messageCount++;
    this.messageHistory.push(messageObj);
    this.trimMessageHistory();

    console.log(`Broadcast message sent to ${recipientCount} agents`);
    return messageObj.id;
  }

  /**
   * Create a communication channel
   */
  createChannel(channelName, options = {}) {
    const channel = {
      name: channelName,
      type: options.type || 'public',
      members: new Set(),
      moderators: new Set(options.moderators || []),
      messages: [],
      created: Date.now(),
      maxMembers: options.maxMembers || 100,
      persistent: options.persistent !== false
    };

    this.channels.set(channelName, channel);
    console.log(`Channel '${channelName}' created`);
    return channel;
  }

  /**
   * Join a communication channel
   */
  async joinChannel(agentId, channelName) {
    const agent = this.agents.get(agentId);
    const channel = this.channels.get(channelName);

    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    if (!channel) {
      throw new Error(`Channel ${channelName} not found`);
    }

    if (channel.members.size >= channel.maxMembers) {
      throw new Error(`Channel ${channelName} is at capacity`);
    }

    channel.members.add(agentId);
    agent.channels.add(channelName);

    const joinMessage = {
      id: this.generateMessageId(),
      type: 'system',
      channel: channelName,
      content: `${agentId} joined the channel`,
      timestamp: Date.now()
    };

    channel.messages.push(joinMessage);
    console.log(`Agent ${agentId} joined channel '${channelName}'`);
  }

  /**
   * Send message to channel
   */
  async sendChannelMessage(agentId, channelName, message) {
    const agent = this.agents.get(agentId);
    const channel = this.channels.get(channelName);

    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    if (!channel) {
      throw new Error(`Channel ${channelName} not found`);
    }

    if (!channel.members.has(agentId)) {
      throw new Error(`Agent ${agentId} is not a member of channel ${channelName}`);
    }

    const messageObj = {
      id: this.generateMessageId(),
      type: 'channel',
      channel: channelName,
      from: agentId,
      content: message,
      timestamp: Date.now()
    };

    channel.messages.push(messageObj);
    
    // Notify all channel members
    for (const memberId of channel.members) {
      if (memberId !== agentId) {
        const queue = this.messageQueue.get(memberId);
        if (queue) {
          queue.push({...messageObj, to: memberId});
        }
      }
    }

    agent.messageCount++;
    console.log(`Channel message sent to '${channelName}' by ${agentId}`);
    return messageObj.id;
  }

  /**
   * Subscribe to message patterns
   */
  subscribeToPattern(agentId, pattern, callback) {
    const subscriptions = this.subscriptions.get(agentId);
    if (!subscriptions) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const subscription = {
      pattern,
      callback,
      id: this.generateSubscriptionId()
    };

    subscriptions.add(subscription);
    console.log(`Agent ${agentId} subscribed to pattern: ${pattern}`);
    return subscription.id;
  }

  /**
   * Get messages for an agent
   */
  getMessages(agentId, options = {}) {
    const queue = this.messageQueue.get(agentId);
    if (!queue) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const { limit = 50, markAsRead = true } = options;
    const messages = queue.slice(0, limit);

    if (markAsRead) {
      queue.splice(0, limit);
    }

    return messages;
  }

  /**
   * Get unread message count
   */
  getUnreadCount(agentId) {
    const queue = this.messageQueue.get(agentId);
    return queue ? queue.length : 0;
  }

  /**
   * Search message history
   */
  searchMessages(query, options = {}) {
    const { 
      fromAgent, 
      toAgent, 
      channel, 
      type, 
      startTime, 
      endTime,
      limit = 100 
    } = options;

    let results = this.messageHistory;

    // Apply filters
    if (fromAgent) {
      results = results.filter(msg => msg.from === fromAgent);
    }
    
    if (toAgent) {
      results = results.filter(msg => msg.to === toAgent);
    }
    
    if (channel) {
      results = results.filter(msg => msg.channel === channel);
    }
    
    if (type) {
      results = results.filter(msg => msg.type === type);
    }
    
    if (startTime) {
      results = results.filter(msg => msg.timestamp >= startTime);
    }
    
    if (endTime) {
      results = results.filter(msg => msg.timestamp <= endTime);
    }

    // Text search in content
    if (query) {
      results = results.filter(msg => 
        JSON.stringify(msg.content).toLowerCase().includes(query.toLowerCase())
      );
    }

    return results.slice(0, limit);
  }

  /**
   * Get communication statistics
   */
  getStatistics() {
    const totalMessages = this.messageHistory.length;
    const activeAgents = Array.from(this.agents.values())
      .filter(agent => agent.status === 'online').length;
    
    const channelCount = this.channels.size;
    const avgMessagesPerAgent = totalMessages / this.agents.size || 0;

    return {
      totalAgents: this.agents.size,
      activeAgents,
      totalMessages,
      totalChannels: channelCount,
      avgMessagesPerAgent: Math.round(avgMessagesPerAgent),
      messageTypes: this.getMessageTypeDistribution(),
      topCommunicators: this.getTopCommunicators()
    };
  }

  /**
   * Get message type distribution
   */
  getMessageTypeDistribution() {
    const distribution = {};
    
    this.messageHistory.forEach(msg => {
      distribution[msg.type] = (distribution[msg.type] || 0) + 1;
    });

    return distribution;
  }

  /**
   * Get top communicators
   */
  getTopCommunicators(limit = 5) {
    return Array.from(this.agents.values())
      .sort((a, b) => b.messageCount - a.messageCount)
      .slice(0, limit)
      .map(agent => ({
        agentId: agent.id,
        messageCount: agent.messageCount
      }));
  }

  /**
   * Helper methods
   */
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateSubscriptionId() {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  sortMessageQueue(queue) {
    const priorityOrder = { high: 3, normal: 2, low: 1 };
    queue.sort((a, b) => {
      const aPriority = priorityOrder[a.priority] || 2;
      const bPriority = priorityOrder[b.priority] || 2;
      return bPriority - aPriority;
    });
  }

  matchesFilter(agent, filter) {
    if (filter.type && agent.type !== filter.type) return false;
    if (filter.capabilities && !filter.capabilities.every(cap => 
      agent.capabilities.includes(cap))) return false;
    return true;
  }

  trimMessageHistory() {
    if (this.messageHistory.length > this.maxMessageHistory) {
      this.messageHistory = this.messageHistory.slice(-this.maxMessageHistory);
    }
  }
}

module.exports = { InterAgentCommunicationSystem };