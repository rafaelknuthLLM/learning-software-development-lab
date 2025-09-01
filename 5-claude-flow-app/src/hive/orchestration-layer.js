/**
 * Hive Mind Orchestration Layer
 * Central coordination system that integrates all hive mind components
 */

const { CollectiveDecisionMaker } = require('./collective-decision');
const { InterAgentCommunicationSystem } = require('./inter-agent-communication');
const { ConsensusEngine } = require('./consensus-mechanisms');
const { SharedMemorySystem } = require('./shared-memory');
const { CoordinationProtocols } = require('./coordination-protocols');

class HiveMindOrchestrator {
  constructor(options = {}) {
    // Initialize core systems
    this.decisionMaker = new CollectiveDecisionMaker(options.decisions);
    this.communicationSystem = new InterAgentCommunicationSystem(options.communication);
    this.consensusEngine = new ConsensusEngine(options.consensus);
    this.sharedMemory = new SharedMemorySystem(options.memory);
    this.coordinationProtocols = new CoordinationProtocols(options.coordination);
    
    // Orchestration state
    this.agents = new Map();
    this.hiveMind = {
      id: this.generateHiveId(),
      status: 'initializing',
      intelligence: {
        level: 0,
        patterns: new Map(),
        knowledge: new Map(),
        experience: 0
      },
      topology: options.topology || 'adaptive',
      created: Date.now(),
      version: '1.0.0'
    };
    
    // Performance metrics
    this.metrics = {
      tasksCompleted: 0,
      decisionsApproved: 0,
      consensusReached: 0,
      communicationMessages: 0,
      collectiveIntelligenceScore: 0,
      adaptationEvents: 0
    };
    
    // Integration hooks
    this.hooks = new Map();
    
    console.log(`Hive Mind Orchestrator initialized: ${this.hiveMind.id}`);
  }

  /**
   * Initialize the hive mind system
   */
  async initialize() {
    try {
      console.log('Initializing hive mind systems...');
      
      // Set up inter-system communication
      await this.setupSystemIntegration();
      
      // Initialize shared memory with system data
      await this.initializeSharedMemory();
      
      // Set up hooks and event handlers
      await this.setupEventHandlers();
      
      // Store initial state in memory
      await this.storeSystemState();
      
      this.hiveMind.status = 'active';
      console.log('Hive mind orchestrator successfully initialized');
      
      return {
        hiveId: this.hiveMind.id,
        status: this.hiveMind.status,
        systems: {
          decisions: 'active',
          communication: 'active',
          consensus: 'active',
          memory: 'active',
          coordination: 'active'
        }
      };
      
    } catch (error) {
      this.hiveMind.status = 'error';
      console.error('Failed to initialize hive mind:', error);
      throw error;
    }
  }

  /**
   * Register an agent with the hive mind
   */
  async registerAgent(agentId, agentSpec = {}) {
    const agent = {
      id: agentId,
      type: agentSpec.type || 'generic',
      capabilities: agentSpec.capabilities || [],
      intelligence: {
        reasoning: agentSpec.reasoning || 'basic',
        learning: agentSpec.learning || false,
        memory: agentSpec.memory || 'short-term',
        creativity: agentSpec.creativity || 0.5
      },
      coordination: {
        patterns: agentSpec.patterns || ['collaborative'],
        leadership: agentSpec.leadership || 0.5,
        autonomy: agentSpec.autonomy || 0.5
      },
      performance: {
        tasks: 0,
        success: 0,
        failures: 0,
        avgResponseTime: 0,
        reputation: 1.0
      },
      status: 'active',
      registeredAt: Date.now()
    };

    this.agents.set(agentId, agent);

    // Register with all subsystems
    await Promise.all([
      this.decisionMaker.registerAgent(agentId, agent.capabilities, agent.performance.reputation),
      this.communicationSystem.registerAgent(agentId, {
        type: agent.type,
        capabilities: agent.capabilities
      }),
      this.consensusEngine.registerNode(agentId, {
        reputation: agent.performance.reputation,
        capabilities: agent.capabilities
      }),
      this.coordinationProtocols.registerAgent(agentId, {
        skills: agent.capabilities,
        capacity: agentSpec.capacity || 1,
        patterns: agent.coordination.patterns
      })
    ]);

    // Store agent data in shared memory
    await this.sharedMemory.store(`hive/agents/${agentId}`, agent);
    
    // Update hive intelligence
    await this.updateCollectiveIntelligence();

    console.log(`Agent ${agentId} registered with hive mind`);
    return agent;
  }

  /**
   * Execute a hive-wide operation
   */
  async executeHiveOperation(operation) {
    const operationId = this.generateOperationId();
    
    console.log(`Executing hive operation: ${operation.type} (${operationId})`);
    
    try {
      let result;
      
      switch (operation.type) {
        case 'collective-task':
          result = await this.executeCollectiveTask(operation);
          break;
          
        case 'consensus-decision':
          result = await this.executeConsensusDecision(operation);
          break;
          
        case 'knowledge-sharing':
          result = await this.executeKnowledgeSharing(operation);
          break;
          
        case 'adaptation':
          result = await this.executeAdaptation(operation);
          break;
          
        case 'emergency-coordination':
          result = await this.executeEmergencyCoordination(operation);
          break;
          
        default:
          throw new Error(`Unknown operation type: ${operation.type}`);
      }
      
      // Update metrics
      this.updateMetrics(operation.type, result);
      
      // Store operation result
      await this.sharedMemory.store(`hive/operations/${operationId}`, {
        operation,
        result,
        timestamp: Date.now(),
        duration: result.executionTime
      });
      
      return result;
      
    } catch (error) {
      console.error(`Hive operation ${operationId} failed:`, error);
      throw error;
    }
  }

  /**
   * Execute collective task with coordinated agents
   */
  async executeCollectiveTask(operation) {
    const { task, coordinationPattern = 'adaptive', requiredAgents } = operation;
    
    // Use coordination protocols to manage task execution
    const result = await this.coordinationProtocols.coordinateTask({
      ...task,
      requiredCapabilities: task.capabilities,
      agentCount: requiredAgents,
      hiveOperation: true
    }, coordinationPattern);
    
    // Share results with all agents if specified
    if (operation.shareResults) {
      await this.shareTaskResults(task.id, result);
    }
    
    return {
      type: 'collective-task',
      taskId: task.id,
      result,
      participatingAgents: result.agents,
      coordinationPattern,
      executionTime: result.executionTime
    };
  }

  /**
   * Execute consensus-based decision
   */
  async executeConsensusDecision(operation) {
    const { decision, consensusType = 'raft' } = operation;
    
    // Create proposal for collective decision making
    const proposalId = await this.decisionMaker.proposeDecision({
      title: decision.title,
      description: decision.description,
      proposer: 'hive-orchestrator',
      action: decision.action,
      requiredCapabilities: decision.requiredCapabilities
    });
    
    // Wait for consensus
    const consensusResult = await this.consensusEngine.proposeChange('hive-orchestrator', {
      type: 'hive-decision',
      proposalId,
      content: decision
    });
    
    return {
      type: 'consensus-decision',
      proposalId,
      consensusResult,
      executionTime: Date.now()
    };
  }

  /**
   * Execute knowledge sharing across the hive
   */
  async executeKnowledgeSharing(operation) {
    const { knowledge, targetAgents = 'all', domain } = operation;
    
    // Store knowledge in shared memory
    const knowledgeKey = `hive/knowledge/${domain}/${Date.now()}`;
    await this.sharedMemory.store(knowledgeKey, {
      content: knowledge,
      domain,
      source: operation.source,
      timestamp: Date.now(),
      accessibility: operation.accessibility || 'public'
    });
    
    // Broadcast knowledge to agents
    const targets = targetAgents === 'all' ? 
      Array.from(this.agents.keys()) : targetAgents;
    
    await this.communicationSystem.broadcastMessage('hive-orchestrator', {
      type: 'knowledge-share',
      domain,
      knowledgeKey,
      content: knowledge
    }, targetAgents === 'all' ? null : { agentIds: targets });
    
    return {
      type: 'knowledge-sharing',
      knowledgeKey,
      domain,
      targetAgents: targets,
      executionTime: Date.now()
    };
  }

  /**
   * Execute adaptive behavior changes
   */
  async executeAdaptation(operation) {
    const { trigger, adaptationType, parameters } = operation;
    
    let adaptationResult;
    
    switch (adaptationType) {
      case 'topology-change':
        adaptationResult = await this.adaptTopology(parameters);
        break;
        
      case 'coordination-pattern':
        adaptationResult = await this.adaptCoordinationPatterns(parameters);
        break;
        
      case 'intelligence-evolution':
        adaptationResult = await this.evolveIntelligence(parameters);
        break;
        
      case 'capability-enhancement':
        adaptationResult = await this.enhanceCapabilities(parameters);
        break;
    }
    
    // Update hive intelligence based on adaptation
    await this.updateCollectiveIntelligence();
    
    this.metrics.adaptationEvents++;
    
    return {
      type: 'adaptation',
      adaptationType,
      trigger,
      result: adaptationResult,
      executionTime: Date.now()
    };
  }

  /**
   * Execute emergency coordination
   */
  async executeEmergencyCoordination(operation) {
    const { emergency, priority = 'critical' } = operation;
    
    console.log(`EMERGENCY COORDINATION: ${emergency.type}`);
    
    // Get all available agents
    const availableAgents = Array.from(this.agents.values())
      .filter(agent => agent.status === 'active');
    
    // Create emergency response task
    const emergencyTask = {
      id: this.generateTaskId(),
      type: emergency.type,
      priority,
      description: emergency.description,
      requiredCapabilities: emergency.capabilities || [],
      urgency: emergency.urgency || 'immediate',
      resources: emergency.resources
    };
    
    // Use fastest coordination pattern
    const result = await this.coordinationProtocols.coordinateTask(
      emergencyTask, 
      'adaptive'
    );
    
    // Broadcast emergency resolution
    await this.communicationSystem.broadcastMessage('hive-orchestrator', {
      type: 'emergency-resolution',
      emergencyId: emergency.id,
      result
    });
    
    return {
      type: 'emergency-coordination',
      emergency: emergency.type,
      result,
      participatingAgents: availableAgents.map(a => a.id),
      executionTime: Date.now()
    };
  }

  /**
   * Get hive mind status and health
   */
  async getHiveStatus() {
    const agentStats = this.calculateAgentStatistics();
    const systemStats = await this.getSystemStatistics();
    const intelligenceMetrics = await this.getIntelligenceMetrics();
    
    return {
      hive: {
        id: this.hiveMind.id,
        status: this.hiveMind.status,
        intelligence: this.hiveMind.intelligence,
        topology: this.hiveMind.topology,
        uptime: Date.now() - this.hiveMind.created
      },
      agents: agentStats,
      systems: systemStats,
      intelligence: intelligenceMetrics,
      metrics: this.metrics,
      performance: {
        tasksPerMinute: this.calculateTasksPerMinute(),
        avgResponseTime: this.calculateAvgResponseTime(),
        systemEfficiency: this.calculateSystemEfficiency(),
        collectiveIQ: this.calculateCollectiveIQ()
      }
    };
  }

  /**
   * Helper methods for orchestration
   */
  async setupSystemIntegration() {
    // Set up cross-system communication channels
    await this.communicationSystem.createChannel('system-coordination', {
      type: 'system',
      persistent: true
    });
    
    // Set up shared memory subscriptions for system events
    this.sharedMemory.subscribe('hive/events/*', (event) => {
      this.handleSystemEvent(event);
    });
  }

  async initializeSharedMemory() {
    // Store initial system configuration
    await this.sharedMemory.store('hive/config', {
      topology: this.hiveMind.topology,
      systems: ['decisions', 'communication', 'consensus', 'memory', 'coordination'],
      version: this.hiveMind.version,
      initialized: Date.now()
    });
    
    // Create memory namespaces
    await this.sharedMemory.store('hive/agents/', {});
    await this.sharedMemory.store('hive/tasks/', {});
    await this.sharedMemory.store('hive/knowledge/', {});
    await this.sharedMemory.store('hive/operations/', {});
  }

  async setupEventHandlers() {
    // Handle agent disconnections
    this.communicationSystem.on('agent-disconnect', async (agentId) => {
      await this.handleAgentDisconnection(agentId);
    });
    
    // Handle consensus failures
    this.consensusEngine.on('consensus-failure', async (proposal) => {
      await this.handleConsensusFailure(proposal);
    });
    
    // Handle system errors
    process.on('uncaughtException', (error) => {
      this.handleSystemError(error);
    });
  }

  async storeSystemState() {
    const state = {
      hiveMind: this.hiveMind,
      agents: Array.from(this.agents.entries()),
      metrics: this.metrics,
      timestamp: Date.now()
    };
    
    await this.sharedMemory.store('hive/system-state', state);
  }

  async updateCollectiveIntelligence() {
    const agentCount = this.agents.size;
    const totalExperience = Array.from(this.agents.values())
      .reduce((sum, agent) => sum + agent.performance.tasks, 0);
    
    const avgReputation = Array.from(this.agents.values())
      .reduce((sum, agent) => sum + agent.performance.reputation, 0) / agentCount;
    
    // Calculate intelligence level based on agents and experience
    const newLevel = Math.min(10, Math.floor(
      (agentCount * 0.3) + 
      (totalExperience * 0.01) + 
      (avgReputation * 2)
    ));
    
    this.hiveMind.intelligence.level = newLevel;
    this.hiveMind.intelligence.experience = totalExperience;
    
    // Store updated intelligence
    await this.sharedMemory.store('hive/intelligence', this.hiveMind.intelligence);
    
    console.log(`Collective intelligence updated: Level ${newLevel}`);
  }

  // Statistics and metrics calculation methods
  calculateAgentStatistics() {
    const agents = Array.from(this.agents.values());
    
    return {
      total: agents.length,
      active: agents.filter(a => a.status === 'active').length,
      busy: agents.filter(a => a.status === 'busy').length,
      offline: agents.filter(a => a.status === 'offline').length,
      avgReputation: agents.reduce((sum, a) => sum + a.performance.reputation, 0) / agents.length,
      totalTasks: agents.reduce((sum, a) => sum + a.performance.tasks, 0)
    };
  }

  async getSystemStatistics() {
    return {
      decisions: this.decisionMaker.getMetrics(),
      communication: this.communicationSystem.getStatistics(),
      consensus: this.consensusEngine.getConsensusStatus(),
      memory: this.sharedMemory.getMemoryStats(),
      coordination: this.coordinationProtocols.getCoordinationStatus()
    };
  }

  async getIntelligenceMetrics() {
    return {
      level: this.hiveMind.intelligence.level,
      patterns: this.hiveMind.intelligence.patterns.size,
      knowledge: this.hiveMind.intelligence.knowledge.size,
      experience: this.hiveMind.intelligence.experience,
      collectiveIQ: this.calculateCollectiveIQ()
    };
  }

  // Utility methods
  generateHiveId() {
    return `hive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateOperationId() {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  updateMetrics(operationType, result) {
    switch (operationType) {
      case 'collective-task':
        this.metrics.tasksCompleted++;
        break;
      case 'consensus-decision':
        if (result.consensusResult.status === 'accepted') {
          this.metrics.decisionsApproved++;
        }
        break;
    }
    
    // Update collective intelligence score
    this.metrics.collectiveIntelligenceScore = this.calculateCollectiveIntelligenceScore();
  }

  calculateCollectiveIntelligenceScore() {
    const baseScore = this.hiveMind.intelligence.level * 10;
    const experienceBonus = Math.min(50, this.hiveMind.intelligence.experience * 0.1);
    const agentBonus = this.agents.size * 2;
    
    return Math.round(baseScore + experienceBonus + agentBonus);
  }

  calculateTasksPerMinute() {
    // Simplified calculation
    return this.metrics.tasksCompleted / ((Date.now() - this.hiveMind.created) / 60000);
  }

  calculateAvgResponseTime() {
    const agents = Array.from(this.agents.values());
    if (agents.length === 0) return 0;
    
    return agents.reduce((sum, agent) => sum + agent.performance.avgResponseTime, 0) / agents.length;
  }

  calculateSystemEfficiency() {
    const successRate = this.metrics.tasksCompleted / (this.metrics.tasksCompleted + 1);
    const utilizationRate = this.calculateAvgAgentUtilization();
    
    return Math.round((successRate * utilizationRate) * 100);
  }

  calculateCollectiveIQ() {
    return Math.round(this.hiveMind.intelligence.level * 15 + 
                     this.calculateAvgAgentPerformance() * 10);
  }

  calculateAvgAgentUtilization() {
    const agents = Array.from(this.agents.values());
    if (agents.length === 0) return 0;
    
    const busyAgents = agents.filter(a => a.status === 'busy').length;
    return busyAgents / agents.length;
  }

  calculateAvgAgentPerformance() {
    const agents = Array.from(this.agents.values());
    if (agents.length === 0) return 0;
    
    return agents.reduce((sum, agent) => sum + agent.performance.reputation, 0) / agents.length;
  }

  // Event handlers (stubs for now)
  async handleSystemEvent(event) {
    console.log(`System event: ${event.type}`);
  }

  async handleAgentDisconnection(agentId) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = 'offline';
      console.log(`Agent ${agentId} disconnected`);
    }
  }

  async handleConsensusFailure(proposal) {
    console.log(`Consensus failed for proposal: ${proposal.id}`);
  }

  handleSystemError(error) {
    console.error('System error:', error);
    // Implement error handling and recovery
  }

  // Adaptation methods (stubs for now)
  async adaptTopology(parameters) {
    console.log('Adapting hive topology');
    return { status: 'adapted', newTopology: parameters.topology };
  }

  async adaptCoordinationPatterns(parameters) {
    console.log('Adapting coordination patterns');
    return { status: 'adapted', patterns: parameters.patterns };
  }

  async evolveIntelligence(parameters) {
    console.log('Evolving collective intelligence');
    return { status: 'evolved', newLevel: this.hiveMind.intelligence.level + 1 };
  }

  async enhanceCapabilities(parameters) {
    console.log('Enhancing hive capabilities');
    return { status: 'enhanced', capabilities: parameters.capabilities };
  }

  async shareTaskResults(taskId, result) {
    await this.sharedMemory.store(`hive/task-results/${taskId}`, result);
    await this.communicationSystem.broadcastMessage('hive-orchestrator', {
      type: 'task-results',
      taskId,
      result
    });
  }
}

module.exports = { HiveMindOrchestrator };