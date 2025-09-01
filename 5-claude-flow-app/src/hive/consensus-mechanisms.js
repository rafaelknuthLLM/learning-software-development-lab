/**
 * Consensus Mechanisms for Hive Mind
 * Implements various consensus algorithms for distributed decision making
 */

class ConsensusEngine {
  constructor(options = {}) {
    this.nodes = new Map();
    this.consensusType = options.type || 'raft'; // 'raft', 'pbft', 'gossip'
    this.leaderNode = null;
    this.currentTerm = 0;
    this.proposals = new Map();
    this.commitLog = [];
    this.faultTolerance = options.faultTolerance || 0.33; // Byzantine fault tolerance
    this.timeoutMs = options.timeout || 5000;
  }

  /**
   * Register a node for consensus
   */
  registerNode(nodeId, metadata = {}) {
    const node = {
      id: nodeId,
      status: 'follower',
      lastHeartbeat: Date.now(),
      term: 0,
      votedFor: null,
      log: [],
      nextIndex: 0,
      matchIndex: 0,
      reputation: metadata.reputation || 1.0,
      capabilities: metadata.capabilities || []
    };

    this.nodes.set(nodeId, node);
    console.log(`Node ${nodeId} registered for consensus`);
    
    // Initialize consensus if this is the first node
    if (this.nodes.size === 1) {
      this.initializeConsensus();
    }
    
    return node;
  }

  /**
   * Initialize consensus mechanism
   */
  initializeConsensus() {
    switch (this.consensusType) {
      case 'raft':
        this.initializeRaft();
        break;
      case 'pbft':
        this.initializePBFT();
        break;
      case 'gossip':
        this.initializeGossip();
        break;
      default:
        throw new Error(`Unknown consensus type: ${this.consensusType}`);
    }
  }

  /**
   * Propose a change to the network
   */
  async proposeChange(nodeId, proposal) {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    const proposalObj = {
      id: this.generateProposalId(),
      proposer: nodeId,
      content: proposal,
      timestamp: Date.now(),
      status: 'proposed',
      votes: new Map(),
      signatures: new Map()
    };

    this.proposals.set(proposalObj.id, proposalObj);
    
    console.log(`Proposal ${proposalObj.id} submitted by ${nodeId}`);
    
    // Execute consensus algorithm
    switch (this.consensusType) {
      case 'raft':
        return await this.raftConsensus(proposalObj);
      case 'pbft':
        return await this.pbftConsensus(proposalObj);
      case 'gossip':
        return await this.gossipConsensus(proposalObj);
    }
  }

  /**
   * RAFT Consensus Implementation
   */
  async raftConsensus(proposal) {
    // Only leader can propose
    if (!this.leaderNode || proposal.proposer !== this.leaderNode.id) {
      // Redirect to leader or trigger leader election
      await this.electLeader();
      if (!this.leaderNode) {
        throw new Error('No leader available for consensus');
      }
    }

    // Append to leader's log
    const logEntry = {
      term: this.currentTerm,
      index: this.commitLog.length,
      proposal: proposal.id,
      committed: false
    };

    this.commitLog.push(logEntry);
    
    // Replicate to followers
    const replicationPromises = [];
    for (const [nodeId, node] of this.nodes) {
      if (nodeId !== this.leaderNode.id && node.status === 'follower') {
        replicationPromises.push(this.replicateToFollower(nodeId, logEntry));
      }
    }

    const replications = await Promise.allSettled(replicationPromises);
    const successfulReplications = replications.filter(r => r.status === 'fulfilled').length;
    
    // Need majority to commit
    const majorityThreshold = Math.floor(this.nodes.size / 2) + 1;
    
    if (successfulReplications >= majorityThreshold - 1) { // -1 for leader
      logEntry.committed = true;
      proposal.status = 'accepted';
      await this.executeProposal(proposal);
      return { status: 'accepted', consensusType: 'raft' };
    } else {
      proposal.status = 'rejected';
      return { status: 'rejected', reason: 'insufficient_replications' };
    }
  }

  /**
   * Practical Byzantine Fault Tolerance (pBFT) Implementation
   */
  async pbftConsensus(proposal) {
    const totalNodes = this.nodes.size;
    const byzantineLimit = Math.floor(totalNodes * this.faultTolerance);
    const requiredVotes = totalNodes - byzantineLimit;

    // Phase 1: Pre-prepare
    await this.pbftPrePrepare(proposal);
    
    // Phase 2: Prepare
    const prepareVotes = await this.pbftPrepare(proposal);
    
    if (prepareVotes < requiredVotes) {
      proposal.status = 'rejected';
      return { status: 'rejected', reason: 'insufficient_prepare_votes' };
    }

    // Phase 3: Commit
    const commitVotes = await this.pbftCommit(proposal);
    
    if (commitVotes >= requiredVotes) {
      proposal.status = 'accepted';
      await this.executeProposal(proposal);
      return { status: 'accepted', consensusType: 'pbft' };
    } else {
      proposal.status = 'rejected';
      return { status: 'rejected', reason: 'insufficient_commit_votes' };
    }
  }

  /**
   * Gossip Protocol Consensus Implementation
   */
  async gossipConsensus(proposal) {
    // Spread proposal through gossip network
    await this.gossipProposal(proposal);
    
    // Wait for gossip to propagate
    await this.sleep(this.timeoutMs / 2);
    
    // Collect votes through gossip
    const votes = await this.collectGossipVotes(proposal);
    
    // Determine consensus based on reputation-weighted voting
    const totalReputation = Array.from(this.nodes.values())
      .reduce((sum, node) => sum + node.reputation, 0);
    
    let supportReputation = 0;
    votes.forEach((vote, nodeId) => {
      if (vote === 'support') {
        const node = this.nodes.get(nodeId);
        supportReputation += node ? node.reputation : 0;
      }
    });

    const supportRatio = supportReputation / totalReputation;
    
    if (supportRatio > 0.5) {
      proposal.status = 'accepted';
      await this.executeProposal(proposal);
      return { status: 'accepted', consensusType: 'gossip', supportRatio };
    } else {
      proposal.status = 'rejected';
      return { status: 'rejected', reason: 'insufficient_support', supportRatio };
    }
  }

  /**
   * Execute accepted proposal
   */
  async executeProposal(proposal) {
    try {
      if (proposal.content.action) {
        await proposal.content.action();
      }
      
      // Store in committed state
      const commitRecord = {
        proposalId: proposal.id,
        content: proposal.content,
        consensusType: this.consensusType,
        timestamp: Date.now(),
        participants: Array.from(this.nodes.keys())
      };
      
      // Store in shared memory
      await this.storeInMemory(`hive/consensus/committed/${proposal.id}`, commitRecord);
      
      console.log(`Proposal ${proposal.id} executed successfully`);
    } catch (error) {
      console.error(`Failed to execute proposal ${proposal.id}:`, error);
      proposal.executionError = error.message;
    }
  }

  /**
   * Leader Election (Raft)
   */
  async electLeader() {
    this.currentTerm++;
    const candidates = Array.from(this.nodes.values())
      .filter(node => node.status !== 'failed');
    
    if (candidates.length === 0) return;

    // Simple leader election - highest reputation becomes leader
    const leader = candidates.reduce((prev, current) => 
      current.reputation > prev.reputation ? current : prev
    );

    this.leaderNode = leader;
    leader.status = 'leader';
    leader.term = this.currentTerm;
    
    // Update other nodes to followers
    for (const node of candidates) {
      if (node.id !== leader.id) {
        node.status = 'follower';
        node.term = this.currentTerm;
        node.votedFor = leader.id;
      }
    }

    console.log(`Node ${leader.id} elected as leader for term ${this.currentTerm}`);
  }

  /**
   * Helper methods for consensus algorithms
   */
  async replicateToFollower(nodeId, logEntry) {
    const node = this.nodes.get(nodeId);
    if (!node) return false;

    // Simulate network communication
    await this.sleep(Math.random() * 100);
    
    // Add to follower's log
    node.log.push(logEntry);
    node.matchIndex = logEntry.index;
    
    return true;
  }

  async pbftPrePrepare(proposal) {
    // Broadcast pre-prepare message
    for (const node of this.nodes.values()) {
      node.pbftState = node.pbftState || { phase: 'pre-prepare', proposal: proposal.id };
    }
  }

  async pbftPrepare(proposal) {
    let votes = 0;
    for (const node of this.nodes.values()) {
      if (this.validatePrepareMessage(node, proposal)) {
        votes++;
      }
    }
    return votes;
  }

  async pbftCommit(proposal) {
    let votes = 0;
    for (const node of this.nodes.values()) {
      if (this.validateCommitMessage(node, proposal)) {
        votes++;
      }
    }
    return votes;
  }

  validatePrepareMessage(node, proposal) {
    // Simplified validation - in real implementation would check signatures, etc.
    return node.status !== 'failed' && node.reputation > 0.5;
  }

  validateCommitMessage(node, proposal) {
    // Simplified validation
    return node.status !== 'failed' && node.reputation > 0.5;
  }

  async gossipProposal(proposal) {
    // Randomly select nodes to gossip to
    const nodes = Array.from(this.nodes.keys());
    const gossipTargets = this.selectGossipTargets(nodes, Math.ceil(nodes.length * 0.6));
    
    for (const nodeId of gossipTargets) {
      await this.sendGossipMessage(nodeId, {
        type: 'proposal',
        proposal: proposal.id,
        content: proposal.content
      });
    }
  }

  async collectGossipVotes(proposal) {
    const votes = new Map();
    
    for (const [nodeId, node] of this.nodes) {
      // Simulate voting based on node characteristics
      const vote = this.simulateNodeVote(node, proposal);
      votes.set(nodeId, vote);
    }
    
    return votes;
  }

  selectGossipTargets(nodes, count) {
    const shuffled = [...nodes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  simulateNodeVote(node, proposal) {
    // Simplified voting logic based on reputation and capabilities
    const hasRequiredCapability = proposal.content.requiredCapabilities ? 
      proposal.content.requiredCapabilities.some(cap => node.capabilities.includes(cap)) : true;
    
    const reputationThreshold = 0.3;
    
    if (node.reputation > reputationThreshold && hasRequiredCapability) {
      return Math.random() > 0.2 ? 'support' : 'reject'; // 80% support if qualified
    } else {
      return Math.random() > 0.7 ? 'support' : 'reject'; // 30% support if not qualified
    }
  }

  async sendGossipMessage(nodeId, message) {
    // Simulate network delay
    await this.sleep(Math.random() * 50);
    console.log(`Gossip message sent to ${nodeId}: ${message.type}`);
  }

  /**
   * Get consensus status
   */
  getConsensusStatus() {
    return {
      type: this.consensusType,
      nodes: this.nodes.size,
      leader: this.leaderNode?.id,
      currentTerm: this.currentTerm,
      activeProposals: Array.from(this.proposals.values())
        .filter(p => p.status === 'proposed').length,
      committedProposals: this.commitLog.filter(entry => entry.committed).length
    };
  }

  /**
   * Utility methods
   */
  initializeRaft() {
    console.log('Initializing Raft consensus');
    setTimeout(() => this.electLeader(), 1000);
  }

  initializePBFT() {
    console.log('Initializing pBFT consensus');
  }

  initializeGossip() {
    console.log('Initializing Gossip consensus');
  }

  generateProposalId() {
    return `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async storeInMemory(key, value) {
    // Store consensus decisions in shared memory
    // In real implementation, this would use the shared memory system
    console.log(`Stored in memory: ${key}`);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { ConsensusEngine };