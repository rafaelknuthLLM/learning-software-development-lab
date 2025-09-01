/**
 * Coordination Protocols for Hive Mind
 * Manages agent coordination, task distribution, and workflow orchestration
 */

class CoordinationProtocols {
  constructor(options = {}) {
    this.agents = new Map();
    this.tasks = new Map();
    this.workflows = new Map();
    this.coordinationPatterns = new Map();
    this.loadBalancer = new LoadBalancer(options.loadBalancing);
    this.eventBus = new EventBus();
    this.metricsCollector = new MetricsCollector();
    this.adaptiveThreshold = options.adaptiveThreshold || 0.8;
  }

  /**
   * Register agent for coordination
   */
  registerAgent(agentId, capabilities = {}) {
    const agent = {
      id: agentId,
      capabilities: capabilities.skills || [],
      capacity: capabilities.capacity || 1,
      currentLoad: 0,
      status: 'idle',
      patterns: capabilities.patterns || [],
      performance: {
        completedTasks: 0,
        averageTime: 0,
        successRate: 1.0,
        reputation: 1.0
      },
      coordination: {
        preferredPartners: [],
        collaborationScore: 0,
        leadershipScore: 0,
        followingScore: 0
      }
    };

    this.agents.set(agentId, agent);
    this.eventBus.emit('agent-registered', { agentId, agent });
    
    console.log(`Agent ${agentId} registered with capabilities:`, capabilities.skills);
    return agent;
  }

  /**
   * Coordinate task execution using various patterns
   */
  async coordinateTask(taskSpec, coordinationPattern = 'adaptive') {
    const taskId = this.generateTaskId();
    
    const task = {
      id: taskId,
      spec: taskSpec,
      pattern: coordinationPattern,
      status: 'coordinating',
      assignedAgents: [],
      startTime: Date.now(),
      dependencies: taskSpec.dependencies || [],
      priority: taskSpec.priority || 'normal'
    };

    this.tasks.set(taskId, task);

    try {
      // Select coordination pattern
      const coordinator = this.selectCoordinationPattern(coordinationPattern, task);
      
      // Execute coordination
      const result = await coordinator.coordinate(task);
      
      task.status = 'completed';
      task.result = result;
      task.endTime = Date.now();
      
      // Update agent performance metrics
      await this.updateAgentMetrics(task);
      
      console.log(`Task ${taskId} completed using ${coordinationPattern} pattern`);
      return result;
      
    } catch (error) {
      task.status = 'failed';
      task.error = error.message;
      console.error(`Task ${taskId} failed:`, error);
      throw error;
    }
  }

  /**
   * Select appropriate coordination pattern
   */
  selectCoordinationPattern(patternName, task) {
    const patterns = {
      'adaptive': new AdaptiveCoordinator(this),
      'hierarchical': new HierarchicalCoordinator(this),
      'peer-to-peer': new PeerToPeerCoordinator(this),
      'swarm': new SwarmCoordinator(this),
      'pipeline': new PipelineCoordinator(this),
      'consensus': new ConsensusCoordinator(this)
    };

    const coordinator = patterns[patternName];
    if (!coordinator) {
      throw new Error(`Unknown coordination pattern: ${patternName}`);
    }

    return coordinator;
  }

  /**
   * Create workflow with multiple coordination steps
   */
  async createWorkflow(workflowSpec) {
    const workflowId = this.generateWorkflowId();
    
    const workflow = {
      id: workflowId,
      spec: workflowSpec,
      status: 'created',
      steps: workflowSpec.steps || [],
      currentStep: 0,
      results: [],
      context: {}
    };

    this.workflows.set(workflowId, workflow);
    
    console.log(`Workflow ${workflowId} created with ${workflow.steps.length} steps`);
    return workflowId;
  }

  /**
   * Execute workflow
   */
  async executeWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    workflow.status = 'executing';
    workflow.startTime = Date.now();

    try {
      for (let i = 0; i < workflow.steps.length; i++) {
        workflow.currentStep = i;
        const step = workflow.steps[i];
        
        console.log(`Executing workflow step ${i + 1}/${workflow.steps.length}: ${step.name}`);
        
        // Execute step with coordination
        const stepResult = await this.coordinateTask({
          ...step,
          workflowId,
          stepIndex: i,
          context: workflow.context
        }, step.coordinationPattern || 'adaptive');
        
        workflow.results[i] = stepResult;
        
        // Update workflow context
        if (stepResult.context) {
          Object.assign(workflow.context, stepResult.context);
        }
        
        // Check for conditional steps
        if (step.condition && !this.evaluateCondition(step.condition, workflow)) {
          console.log(`Skipping remaining steps due to condition: ${step.condition}`);
          break;
        }
      }
      
      workflow.status = 'completed';
      workflow.endTime = Date.now();
      
      console.log(`Workflow ${workflowId} completed successfully`);
      return workflow.results;
      
    } catch (error) {
      workflow.status = 'failed';
      workflow.error = error.message;
      console.error(`Workflow ${workflowId} failed:`, error);
      throw error;
    }
  }

  /**
   * Adaptive agent selection based on performance and availability
   */
  selectAgentsForTask(task, requiredCount = 1) {
    const eligibleAgents = Array.from(this.agents.values())
      .filter(agent => {
        // Check availability
        if (agent.status === 'busy' && agent.currentLoad >= agent.capacity) {
          return false;
        }
        
        // Check capabilities
        if (task.spec.requiredCapabilities) {
          return task.spec.requiredCapabilities.every(cap => 
            agent.capabilities.includes(cap)
          );
        }
        
        return true;
      })
      .sort((a, b) => {
        // Sort by composite score (performance + availability + reputation)
        const scoreA = this.calculateAgentScore(a, task);
        const scoreB = this.calculateAgentScore(b, task);
        return scoreB - scoreA;
      });

    return eligibleAgents.slice(0, requiredCount);
  }

  /**
   * Calculate agent suitability score for task
   */
  calculateAgentScore(agent, task) {
    const performanceScore = agent.performance.successRate * 0.4;
    const reputationScore = agent.performance.reputation * 0.3;
    const availabilityScore = (1 - agent.currentLoad / agent.capacity) * 0.2;
    const capabilityMatch = this.calculateCapabilityMatch(agent, task) * 0.1;
    
    return performanceScore + reputationScore + availabilityScore + capabilityMatch;
  }

  /**
   * Calculate how well agent capabilities match task requirements
   */
  calculateCapabilityMatch(agent, task) {
    if (!task.spec.requiredCapabilities) return 1.0;
    
    const required = task.spec.requiredCapabilities;
    const available = agent.capabilities;
    
    const matchCount = required.filter(cap => available.includes(cap)).length;
    return matchCount / required.length;
  }

  /**
   * Update agent performance metrics after task completion
   */
  async updateAgentMetrics(task) {
    const duration = task.endTime - task.startTime;
    
    for (const agentId of task.assignedAgents) {
      const agent = this.agents.get(agentId);
      if (!agent) continue;
      
      const perf = agent.performance;
      
      // Update completion count
      perf.completedTasks++;
      
      // Update average time (exponential moving average)
      perf.averageTime = perf.averageTime * 0.8 + duration * 0.2;
      
      // Update success rate
      const wasSuccessful = task.status === 'completed';
      perf.successRate = perf.successRate * 0.9 + (wasSuccessful ? 1 : 0) * 0.1;
      
      // Update reputation based on success rate and efficiency
      const efficiencyScore = task.spec.estimatedDuration ? 
        Math.max(0, 1 - (duration / task.spec.estimatedDuration - 1)) : 1;
      perf.reputation = perf.reputation * 0.95 + 
        (perf.successRate * efficiencyScore) * 0.05;
      
      // Reset load
      agent.currentLoad = Math.max(0, agent.currentLoad - 1);
      agent.status = agent.currentLoad > 0 ? 'busy' : 'idle';
    }
  }

  /**
   * Monitor coordination patterns and adapt
   */
  async monitorAndAdapt() {
    const metrics = await this.metricsCollector.collect();
    
    // Analyze pattern effectiveness
    for (const [pattern, stats] of metrics.patternPerformance) {
      if (stats.successRate < this.adaptiveThreshold) {
        console.log(`Pattern ${pattern} underperforming, suggesting alternatives`);
        await this.suggestPatternAlternatives(pattern, stats);
      }
    }
    
    // Rebalance agent loads
    await this.loadBalancer.rebalance(this.agents);
    
    // Update coordination strategies
    await this.updateCoordinationStrategies(metrics);
  }

  /**
   * Get coordination status and metrics
   */
  getCoordinationStatus() {
    const totalAgents = this.agents.size;
    const activeAgents = Array.from(this.agents.values())
      .filter(agent => agent.status !== 'offline').length;
    
    const activeTasks = Array.from(this.tasks.values())
      .filter(task => ['coordinating', 'executing'].includes(task.status)).length;
    
    const completedTasks = Array.from(this.tasks.values())
      .filter(task => task.status === 'completed').length;
    
    const activeWorkflows = Array.from(this.workflows.values())
      .filter(workflow => workflow.status === 'executing').length;

    return {
      agents: {
        total: totalAgents,
        active: activeAgents,
        idle: Array.from(this.agents.values()).filter(a => a.status === 'idle').length,
        busy: Array.from(this.agents.values()).filter(a => a.status === 'busy').length
      },
      tasks: {
        active: activeTasks,
        completed: completedTasks,
        total: this.tasks.size
      },
      workflows: {
        active: activeWorkflows,
        total: this.workflows.size
      },
      patterns: this.getPatternUsageStats()
    };
  }

  /**
   * Helper methods
   */
  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateWorkflowId() {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  evaluateCondition(condition, workflow) {
    // Simple condition evaluation - can be extended
    return true;
  }

  getPatternUsageStats() {
    const stats = {};
    
    for (const task of this.tasks.values()) {
      const pattern = task.pattern;
      if (!stats[pattern]) {
        stats[pattern] = { count: 0, successCount: 0 };
      }
      stats[pattern].count++;
      if (task.status === 'completed') {
        stats[pattern].successCount++;
      }
    }

    // Calculate success rates
    for (const pattern in stats) {
      stats[pattern].successRate = stats[pattern].count > 0 ? 
        stats[pattern].successCount / stats[pattern].count : 0;
    }

    return stats;
  }

  async suggestPatternAlternatives(pattern, stats) {
    console.log(`Suggesting alternatives to ${pattern} pattern (success rate: ${stats.successRate})`);
    // Implementation would analyze task characteristics and suggest better patterns
  }

  async updateCoordinationStrategies(metrics) {
    // Implement strategy updates based on performance metrics
    console.log('Updating coordination strategies based on metrics');
  }
}

/**
 * Coordination Pattern Implementations
 */

class AdaptiveCoordinator {
  constructor(protocols) {
    this.protocols = protocols;
  }

  async coordinate(task) {
    // Select best agents based on task requirements and current performance
    const agents = this.protocols.selectAgentsForTask(task, task.spec.agentCount || 1);
    
    if (agents.length === 0) {
      throw new Error('No suitable agents available');
    }

    // Assign task to selected agents
    task.assignedAgents = agents.map(a => a.id);
    
    // Update agent status
    agents.forEach(agent => {
      agent.currentLoad++;
      agent.status = 'busy';
    });

    // Execute task (simulated)
    const result = await this.simulateTaskExecution(task, agents);
    
    return {
      pattern: 'adaptive',
      agents: agents.map(a => a.id),
      result
    };
  }

  async simulateTaskExecution(task, agents) {
    // Simulate task execution time based on complexity and agent performance
    const complexity = task.spec.complexity || 1;
    const avgPerformance = agents.reduce((sum, agent) => 
      sum + agent.performance.reputation, 0) / agents.length;
    
    const baseTime = complexity * 1000 / avgPerformance;
    const actualTime = baseTime + (Math.random() - 0.5) * baseTime * 0.3;
    
    await new Promise(resolve => setTimeout(resolve, Math.max(100, actualTime)));
    
    return {
      executionTime: actualTime,
      quality: avgPerformance,
      completed: Math.random() > 0.1 // 90% success rate
    };
  }
}

class LoadBalancer {
  constructor(options = {}) {
    this.strategy = options.strategy || 'round-robin';
  }

  async rebalance(agents) {
    // Implement load balancing logic
    console.log('Rebalancing agent loads');
  }
}

class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  emit(event, data) {
    const listeners = this.listeners.get(event) || [];
    listeners.forEach(listener => listener(data));
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }
}

class MetricsCollector {
  async collect() {
    return {
      patternPerformance: new Map(),
      agentUtilization: {},
      taskThroughput: 0
    };
  }
}

// Export other coordinator classes as stubs for now
class HierarchicalCoordinator extends AdaptiveCoordinator {}
class PeerToPeerCoordinator extends AdaptiveCoordinator {}
class SwarmCoordinator extends AdaptiveCoordinator {}
class PipelineCoordinator extends AdaptiveCoordinator {}
class ConsensusCoordinator extends AdaptiveCoordinator {}

module.exports = { 
  CoordinationProtocols, 
  AdaptiveCoordinator,
  LoadBalancer,
  EventBus,
  MetricsCollector
};