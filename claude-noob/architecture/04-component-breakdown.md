# Application Component Breakdown

## Frontend Component Architecture

### Component Hierarchy

```
App
├── Router
├── GlobalStateProvider
├── Layout
│   ├── Header
│   │   ├── Navigation
│   │   ├── UserProfile
│   │   └── ThemeToggle
│   ├── Sidebar
│   │   ├── WorkflowProgress
│   │   ├── AgentStatus
│   │   └── QuickActions
│   └── Footer
│       ├── Links
│       └── VersionInfo
└── Routes
    ├── Home
    │   ├── WelcomeScreen
    │   ├── ExperienceSelector
    │   ├── ProjectTypeSelector
    │   └── SPARCConfigurationPanel
    ├── Workflow
    │   ├── WorkflowDashboard
    │   ├── PhaseExecutor
    │   ├── AgentMonitor
    │   └── ResultsViewer
    ├── Projects
    │   ├── ProjectList
    │   ├── ProjectCard
    │   └── ProjectDetails
    └── Settings
        ├── UserPreferences
        ├── APIConfiguration
        └── ExportOptions
```

## Core Components Specification

### 1. ExperienceSelector Component

```typescript
interface ExperienceSelectorProps {
  onSelectionChange: (level: ExperienceLevel) => void;
  defaultLevel?: ExperienceLevel;
  showDescriptions?: boolean;
}

interface ExperienceLevel {
  id: 'beginner' | 'intermediate' | 'experienced';
  label: string;
  description: string;
  recommendedFeatures: string[];
  complexity: number;
}

const ExperienceSelector: React.FC<ExperienceSelectorProps> = ({
  onSelectionChange,
  defaultLevel,
  showDescriptions = true
}) => {
  const [selected, setSelected] = useState<ExperienceLevel | null>(defaultLevel);
  const [showTooltips, setShowTooltips] = useState(false);

  const experienceLevels: ExperienceLevel[] = [
    {
      id: 'beginner',
      label: '👋 Complete Beginner',
      description: 'New to programming and AI tools',
      recommendedFeatures: ['guided-mode', 'explanations', 'simple-projects'],
      complexity: 1
    },
    {
      id: 'intermediate',
      label: '🌱 Some Experience',
      description: 'Know basic concepts, want to learn more',
      recommendedFeatures: ['standard-mode', 'best-practices', 'medium-projects'],
      complexity: 2
    },
    {
      id: 'experienced',
      label: '🚀 Experienced Developer',
      description: 'Comfortable with development, want optimization',
      recommendedFeatures: ['advanced-mode', 'customization', 'complex-projects'],
      complexity: 3
    }
  ];

  return (
    <div className="experience-selector">
      <h2>Tell us about your experience level:</h2>
      <div className="experience-options">
        {experienceLevels.map((level) => (
          <ExperienceOption
            key={level.id}
            level={level}
            isSelected={selected?.id === level.id}
            onSelect={() => handleSelection(level)}
            showDescription={showDescriptions}
          />
        ))}
      </div>
    </div>
  );
};
```

### 2. ProjectTypeSelector Component

```typescript
interface ProjectType {
  id: string;
  name: string;
  icon: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  technologies: string[];
  sparcPhases: SPARCPhase[];
}

const ProjectTypeSelector: React.FC<{
  experienceLevel: ExperienceLevel;
  onSelectionChange: (projectType: ProjectType) => void;
}> = ({ experienceLevel, onSelectionChange }) => {
  const [selectedProjects, setSelectedProjects] = useState<ProjectType[]>([]);
  const [customDescription, setCustomDescription] = useState('');

  const projectTypes = useMemo(() =>
    filterProjectsByExperience(experienceLevel),
    [experienceLevel]
  );

  return (
    <div className="project-type-selector">
      <h2>What would you like to build today?</h2>

      <div className="project-grid">
        {projectTypes.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            isSelected={selectedProjects.includes(project)}
            onToggle={(project) => toggleProjectSelection(project)}
            disabled={!isProjectAvailable(project, experienceLevel)}
          />
        ))}
      </div>

      <div className="custom-project">
        <label>Custom Project Description:</label>
        <textarea
          value={customDescription}
          onChange={(e) => setCustomDescription(e.target.value)}
          placeholder="Describe your project idea... (optional)"
          rows={3}
        />
      </div>
    </div>
  );
};
```

### 3. SPARCConfigurationPanel Component

```typescript
interface SPARCPhase {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  isRecommended: boolean;
  estimatedTime: number;
  subPhases: SubPhase[];
}

const SPARCConfigurationPanel: React.FC<{
  projectType: ProjectType;
  experienceLevel: ExperienceLevel;
  onConfigurationChange: (config: SPARCConfig) => void;
}> = ({ projectType, experienceLevel, onConfigurationChange }) => {
  const [selectedPhases, setSelectedPhases] = useState<Set<string>>(new Set());
  const [phaseConfigurations, setPhaseConfigurations] = useState<Map<string, any>>(new Map());

  const sparcPhases: SPARCPhase[] = [
    {
      id: 'specification',
      name: '📋 Specification & Planning',
      description: 'Define requirements and project scope',
      isRequired: true,
      isRecommended: true,
      estimatedTime: 15,
      subPhases: [
        { id: 'requirements', name: 'Requirements gathering', isDefault: true },
        { id: 'user-stories', name: 'User story creation', isDefault: false },
        { id: 'constraints', name: 'Technical constraints analysis', isDefault: false }
      ]
    },
    {
      id: 'pseudocode',
      name: '🧠 Pseudocode & Logic Design',
      description: 'Plan algorithms and logic flow',
      isRequired: true,
      isRecommended: true,
      estimatedTime: 20,
      subPhases: [
        { id: 'algorithm', name: 'Algorithm planning', isDefault: true },
        { id: 'step-by-step', name: 'Step-by-step pseudocode', isDefault: false },
        { id: 'error-handling', name: 'Error handling strategies', isDefault: false }
      ]
    }
    // ... more phases
  ];

  return (
    <div className="sparc-configuration">
      <h2>How detailed should the guidance be?</h2>

      <div className="phases-container">
        {sparcPhases.map((phase) => (
          <SPARCPhaseCard
            key={phase.id}
            phase={phase}
            isSelected={selectedPhases.has(phase.id)}
            isDisabled={phase.isRequired}
            configuration={phaseConfigurations.get(phase.id)}
            onToggle={() => togglePhase(phase.id)}
            onConfigurationChange={(config) => updatePhaseConfiguration(phase.id, config)}
            experienceLevel={experienceLevel}
          />
        ))}
      </div>

      <div className="configuration-summary">
        <h3>Workflow Summary</h3>
        <div className="estimated-time">
          Estimated completion time: {calculateTotalTime()} minutes
        </div>
        <div className="agent-count">
          Agents to be used: {calculateAgentCount()}
        </div>
      </div>
    </div>
  );
};
```

### 4. WorkflowDashboard Component

```typescript
interface WorkflowState {
  id: string;
  currentPhase: string;
  phases: PhaseStatus[];
  agents: AgentStatus[];
  progress: number;
  estimatedCompletion: Date;
  errors: WorkflowError[];
}

const WorkflowDashboard: React.FC<{
  workflowId: string;
}> = ({ workflowId }) => {
  const [workflowState, setWorkflowState] = useState<WorkflowState | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:3000/workflow/${workflowId}`);

    ws.onopen = () => setIsConnected(true);
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      handleWorkflowUpdate(update);
    };
    ws.onclose = () => setIsConnected(false);

    return () => ws.close();
  }, [workflowId]);

  return (
    <div className="workflow-dashboard">
      <WorkflowHeader
        workflow={workflowState}
        isConnected={isConnected}
      />

      <div className="dashboard-grid">
        <div className="main-content">
          <PhaseProgress
            phases={workflowState?.phases || []}
            currentPhase={workflowState?.currentPhase}
          />

          <AgentActivity
            agents={workflowState?.agents || []}
            onAgentAction={handleAgentAction}
          />
        </div>

        <div className="sidebar">
          <RealtimeLog workflowId={workflowId} />
          <QuickActions
            workflowState={workflowState}
            onAction={handleQuickAction}
          />
        </div>
      </div>

      <ResultsViewer
        workflowId={workflowId}
        phases={workflowState?.phases || []}
      />
    </div>
  );
};
```

## Backend Component Architecture

### API Layer Components

```typescript
// Express.js API structure
src/api/
├── routes/
│   ├── workflow.ts       // Workflow management endpoints
│   ├── sparc.ts         // SPARC framework endpoints
│   ├── agents.ts        // Agent coordination endpoints
│   └── projects.ts      // Project management endpoints
├── middleware/
│   ├── auth.ts          // Authentication middleware
│   ├── validation.ts    // Request validation
│   ├── rateLimit.ts     // Rate limiting
│   └── cors.ts          // CORS configuration
├── controllers/
│   ├── WorkflowController.ts
│   ├── SPARCController.ts
│   └── AgentController.ts
└── services/
    ├── ClaudeFlowService.ts
    ├── SPARCService.ts
    └── WebSocketService.ts
```

### SPARC Service Implementation

```typescript
class SPARCService {
  private claudeFlowClient: ClaudeFlowClient;
  private memoryStore: MemoryStore;

  constructor() {
    this.claudeFlowClient = new ClaudeFlowClient();
    this.memoryStore = new MemoryStore();
  }

  async executeWorkflow(config: WorkflowConfig): Promise<WorkflowExecution> {
    // Initialize swarm coordination
    const swarmId = await this.claudeFlowClient.swarm.init({
      topology: this.selectTopology(config),
      maxAgents: this.calculateMaxAgents(config),
      strategy: 'adaptive'
    });

    const execution: WorkflowExecution = {
      id: generateId(),
      config,
      swarmId,
      status: 'running',
      phases: [],
      startTime: new Date()
    };

    // Execute each selected SPARC phase
    for (const phaseConfig of config.selectedPhases) {
      const phaseResult = await this.executePhase(phaseConfig, swarmId, execution);
      execution.phases.push(phaseResult);

      // Store intermediate results
      await this.memoryStore.store(
        `workflow/${execution.id}/phase/${phaseConfig.id}`,
        phaseResult
      );
    }

    execution.status = 'completed';
    execution.endTime = new Date();

    return execution;
  }

  private async executePhase(
    phaseConfig: PhaseConfig,
    swarmId: string,
    execution: WorkflowExecution
  ): Promise<PhaseResult> {
    // Spawn phase-specific agents
    const agents = await this.spawnPhaseAgents(phaseConfig, swarmId);

    // Execute coordination hooks
    await this.claudeFlowClient.hooks.preTask({
      description: `SPARC ${phaseConfig.id} phase`,
      phaseConfig
    });

    // Run agents in parallel
    const agentResults = await Promise.all(
      agents.map(agent => this.executeAgentTask(agent, phaseConfig))
    );

    // Aggregate results
    const phaseResult: PhaseResult = {
      id: phaseConfig.id,
      status: 'completed',
      agentResults,
      outputs: this.aggregateOutputs(agentResults),
      metrics: this.calculatePhaseMetrics(agentResults)
    };

    // Post-task hooks
    await this.claudeFlowClient.hooks.postTask({
      taskId: phaseConfig.id,
      result: phaseResult
    });

    return phaseResult;
  }

  private async spawnPhaseAgents(phaseConfig: PhaseConfig, swarmId: string): Promise<Agent[]> {
    const agentTypes = this.getAgentTypesForPhase(phaseConfig.id);
    const agents: Agent[] = [];

    for (const agentType of agentTypes) {
      const agent = await this.claudeFlowClient.agent.spawn({
        type: agentType,
        swarmId,
        capabilities: this.getAgentCapabilities(agentType, phaseConfig)
      });
      agents.push(agent);
    }

    return agents;
  }

  private getAgentTypesForPhase(phaseId: string): AgentType[] {
    const phaseAgentMapping = {
      'specification': ['researcher', 'analyst', 'planner'],
      'pseudocode': ['coder', 'reviewer'],
      'architecture': ['system-architect', 'reviewer', 'optimizer'],
      'refinement': ['coder', 'tester', 'reviewer'],
      'completion': ['coordinator', 'tester', 'documenter']
    };

    return phaseAgentMapping[phaseId] || ['coder'];
  }
}
```

### WebSocket Service for Real-time Updates

```typescript
class WebSocketService {
  private wss: WebSocketServer;
  private connections: Map<string, WebSocket[]>;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.connections = new Map();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.wss.on('connection', (ws: WebSocket, req) => {
      const workflowId = this.extractWorkflowId(req.url);
      this.addConnection(workflowId, ws);

      ws.on('close', () => {
        this.removeConnection(workflowId, ws);
      });
    });
  }

  broadcastWorkflowUpdate(workflowId: string, update: WorkflowUpdate) {
    const connections = this.connections.get(workflowId) || [];
    const message = JSON.stringify(update);

    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  broadcastAgentUpdate(workflowId: string, agentUpdate: AgentUpdate) {
    this.broadcastWorkflowUpdate(workflowId, {
      type: 'agent-update',
      data: agentUpdate,
      timestamp: new Date()
    });
  }

  broadcastPhaseComplete(workflowId: string, phaseResult: PhaseResult) {
    this.broadcastWorkflowUpdate(workflowId, {
      type: 'phase-completed',
      data: phaseResult,
      timestamp: new Date()
    });
  }
}
```

## Data Models & Interfaces

### Core Data Models

```typescript
interface UserConfiguration {
  experienceLevel: ExperienceLevel;
  projectType: ProjectType;
  selectedPhases: SPARCPhase[];
  preferences: UserPreferences;
  customInstructions?: string;
}

interface WorkflowExecution {
  id: string;
  userId?: string;
  config: UserConfiguration;
  swarmId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  phases: PhaseResult[];
  metrics: WorkflowMetrics;
  startTime: Date;
  endTime?: Date;
  error?: string;
}

interface PhaseResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  agentResults: AgentResult[];
  outputs: PhaseOutput[];
  metrics: PhaseMetrics;
  startTime: Date;
  endTime?: Date;
  error?: string;
}

interface AgentResult {
  agentId: string;
  agentType: string;
  status: 'running' | 'completed' | 'failed';
  outputs: string[];
  logs: LogEntry[];
  metrics: AgentMetrics;
}
```

This component breakdown provides a solid foundation for building the beginner-friendly Claude-Flow application with proper separation of concerns, real-time capabilities, and scalable architecture.