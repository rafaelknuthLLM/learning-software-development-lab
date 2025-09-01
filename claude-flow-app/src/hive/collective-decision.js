/**
 * Collective Decision Making Module
 * Implements democratic and consensus-based decision making for the hive mind
 */

class CollectiveDecisionMaker {
  constructor(options = {}) {
    this.agents = new Map();
    this.decisions = new Map();
    this.votingThreshold = options.votingThreshold || 0.6;
    this.consensusTimeout = options.consensusTimeout || 30000;
    this.decisionHistory = [];
  }

  /**
   * Register an agent for decision making
   */
  registerAgent(agentId, capabilities = [], weight = 1) {
    this.agents.set(agentId, {
      id: agentId,
      capabilities,
      weight,
      status: 'active',
      lastSeen: Date.now()
    });
    
    console.log(`Agent ${agentId} registered for collective decisions`);
    return this.getAgentInfo(agentId);
  }

  /**
   * Propose a decision to the collective
   */
  async proposeDecision(proposal) {
    const decisionId = this.generateDecisionId();
    const decision = {
      id: decisionId,
      proposal,
      status: 'voting',
      votes: new Map(),
      startTime: Date.now(),
      proposer: proposal.proposer,
      timeout: Date.now() + this.consensusTimeout
    };

    this.decisions.set(decisionId, decision);
    
    // Notify all eligible agents
    await this.notifyAgents(decision);
    
    console.log(`Decision ${decisionId} proposed: ${proposal.title}`);
    return decisionId;
  }

  /**
   * Cast a vote for a decision
   */
  async castVote(decisionId, agentId, vote, reasoning = '') {
    const decision = this.decisions.get(decisionId);
    if (!decision) {
      throw new Error(`Decision ${decisionId} not found`);
    }

    if (decision.status !== 'voting') {
      throw new Error(`Decision ${decisionId} is no longer accepting votes`);
    }

    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not registered`);
    }

    decision.votes.set(agentId, {
      vote, // 'approve', 'reject', 'abstain'
      reasoning,
      timestamp: Date.now(),
      weight: agent.weight
    });

    // Check if decision threshold is met
    await this.evaluateDecision(decisionId);
    
    console.log(`Vote cast by ${agentId} for decision ${decisionId}: ${vote}`);
    return this.getDecisionStatus(decisionId);
  }

  /**
   * Evaluate if decision has reached consensus
   */
  async evaluateDecision(decisionId) {
    const decision = this.decisions.get(decisionId);
    if (!decision) return;

    const totalWeight = Array.from(this.agents.values())
      .reduce((sum, agent) => sum + agent.weight, 0);
    
    let approveWeight = 0;
    let rejectWeight = 0;
    
    decision.votes.forEach(({ vote, weight }) => {
      if (vote === 'approve') approveWeight += weight;
      if (vote === 'reject') rejectWeight += weight;
    });

    const approveRatio = approveWeight / totalWeight;
    const rejectRatio = rejectWeight / totalWeight;

    if (approveRatio >= this.votingThreshold) {
      decision.status = 'approved';
      decision.result = 'approved';
      await this.executeDecision(decision);
    } else if (rejectRatio >= this.votingThreshold) {
      decision.status = 'rejected';
      decision.result = 'rejected';
    } else if (Date.now() > decision.timeout) {
      decision.status = 'timeout';
      decision.result = 'timeout';
    }

    if (decision.status !== 'voting') {
      this.decisionHistory.push({
        ...decision,
        endTime: Date.now()
      });
      await this.notifyDecisionResult(decision);
    }
  }

  /**
   * Execute approved decision
   */
  async executeDecision(decision) {
    const { proposal } = decision;
    
    try {
      if (proposal.action) {
        await proposal.action();
      }
      
      if (proposal.callbacks) {
        for (const callback of proposal.callbacks) {
          await callback(decision);
        }
      }
      
      console.log(`Decision ${decision.id} executed successfully`);
    } catch (error) {
      console.error(`Failed to execute decision ${decision.id}:`, error);
      decision.executionError = error.message;
    }
  }

  /**
   * Get decision status
   */
  getDecisionStatus(decisionId) {
    const decision = this.decisions.get(decisionId);
    if (!decision) return null;

    return {
      id: decision.id,
      status: decision.status,
      votes: Array.from(decision.votes.entries()),
      progress: this.calculateProgress(decision),
      timeRemaining: Math.max(0, decision.timeout - Date.now())
    };
  }

  /**
   * Calculate voting progress
   */
  calculateProgress(decision) {
    const totalAgents = this.agents.size;
    const votedAgents = decision.votes.size;
    
    return {
      voted: votedAgents,
      total: totalAgents,
      percentage: Math.round((votedAgents / totalAgents) * 100)
    };
  }

  /**
   * Notify agents about new decisions
   */
  async notifyAgents(decision) {
    const notifications = [];
    
    for (const [agentId, agent] of this.agents) {
      if (this.isAgentEligible(agent, decision)) {
        notifications.push(this.sendNotification(agentId, {
          type: 'decision_proposal',
          decision: {
            id: decision.id,
            title: decision.proposal.title,
            description: decision.proposal.description,
            timeout: decision.timeout
          }
        }));
      }
    }
    
    await Promise.all(notifications);
  }

  /**
   * Check if agent is eligible to vote on decision
   */
  isAgentEligible(agent, decision) {
    const { requiredCapabilities = [] } = decision.proposal;
    
    if (requiredCapabilities.length === 0) return true;
    
    return requiredCapabilities.some(cap => 
      agent.capabilities.includes(cap)
    );
  }

  /**
   * Send notification to agent
   */
  async sendNotification(agentId, notification) {
    // Store in shared memory for agent coordination
    const memoryKey = `hive/notifications/${agentId}`;
    
    // In real implementation, this would use the shared memory system
    console.log(`Notification sent to ${agentId}:`, notification.type);
  }

  /**
   * Notify about decision results
   */
  async notifyDecisionResult(decision) {
    const notification = {
      type: 'decision_result',
      decisionId: decision.id,
      result: decision.result,
      votes: Array.from(decision.votes.entries())
    };

    for (const agentId of this.agents.keys()) {
      await this.sendNotification(agentId, notification);
    }
  }

  /**
   * Generate unique decision ID
   */
  generateDecisionId() {
    return `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get agent information
   */
  getAgentInfo(agentId) {
    return this.agents.get(agentId);
  }

  /**
   * Get collective intelligence metrics
   */
  getMetrics() {
    const activeDecisions = Array.from(this.decisions.values())
      .filter(d => d.status === 'voting').length;
    
    const completedDecisions = this.decisionHistory.length;
    const approvedDecisions = this.decisionHistory
      .filter(d => d.result === 'approved').length;
    
    return {
      activeAgents: this.agents.size,
      activeDecisions,
      completedDecisions,
      approvalRate: completedDecisions > 0 ? 
        Math.round((approvedDecisions / completedDecisions) * 100) : 0,
      avgDecisionTime: this.calculateAverageDecisionTime()
    };
  }

  /**
   * Calculate average decision time
   */
  calculateAverageDecisionTime() {
    if (this.decisionHistory.length === 0) return 0;
    
    const totalTime = this.decisionHistory.reduce((sum, decision) => {
      return sum + (decision.endTime - decision.startTime);
    }, 0);
    
    return Math.round(totalTime / this.decisionHistory.length);
  }
}

module.exports = { CollectiveDecisionMaker };