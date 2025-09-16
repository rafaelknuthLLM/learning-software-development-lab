# Detailed User Journey Workflow Diagrams

## Complete User Journey Flow

```mermaid
flowchart TD
    A[User Arrives] --> B{First Time User?}
    B -->|Yes| C[Welcome Tutorial]
    B -->|No| D[Dashboard]
    C --> E[Experience Selection]
    D --> E

    E --> F{Experience Level}
    F -->|Beginner| G[Guided Setup Mode]
    F -->|Some Experience| H[Standard Setup Mode]
    F -->|Experienced| I[Advanced Setup Mode]

    G --> J[Project Type Selection<br/>Limited Options]
    H --> K[Project Type Selection<br/>Standard Options]
    I --> L[Project Type Selection<br/>All Options + Custom]

    J --> M[Basic SPARC Config]
    K --> N[Standard SPARC Config]
    L --> O[Full SPARC Config]

    M --> P[Workflow Preview]
    N --> P
    O --> P

    P --> Q{User Confirms?}
    Q -->|No| R[Modify Configuration]
    Q -->|Yes| S[Initialize Claude-Flow]

    R --> P
    S --> T[SPARC Phase Execution]

    T --> U[Phase 1: Specification]
    U --> V[Phase 2: Pseudocode]
    V --> W[Phase 3: Architecture]
    W --> X[Phase 4: Refinement]
    X --> Y[Phase 5: Completion]

    Y --> Z[Project Complete]
    Z --> AA[Download/Deploy Options]
    AA --> BB[Feedback Collection]
    BB --> CC[Return to Dashboard]
```

## Detailed Phase Execution Flow

### Phase Execution Workflow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Frontend UI
    participant SC as SPARC Controller
    participant CF as Claude-Flow
    participant A as Agents
    participant M as Memory Store

    U->>UI: Confirms workflow start
    UI->>SC: Initialize SPARC workflow
    SC->>CF: Setup coordination swarm
    CF->>M: Initialize shared memory
    CF-->>UI: Swarm ready notification

    loop For each SPARC phase
        SC->>CF: Request phase-specific agents
        CF->>A: Spawn coordinated agents
        A->>M: Store coordination state

        par Agent Coordination
            A->>A: Execute parallel tasks
            A->>M: Update progress
            A->>UI: Real-time status updates
        end

        A->>SC: Phase results
        SC->>M: Store phase output
        SC->>UI: Phase completion
        UI->>U: Show progress & results

        U->>UI: Review/approve results
        alt User requests changes
            UI->>SC: Modification request
            SC->>CF: Adjust agents
            CF->>A: Refinement tasks
        end
    end

    SC->>UI: Workflow complete
    UI->>U: Final project delivery
```

## Experience-Specific User Paths

### Beginner User Journey

```mermaid
flowchart LR
    subgraph "Beginner Experience"
        A1[Welcome & Onboarding] --> B1[What is Claude-Flow?]
        B1 --> C1[What is SPARC?]
        C1 --> D1[Choose Simple Project]
        D1 --> E1[Guided Selections Only]
        E1 --> F1[Pre-configured SPARC]
        F1 --> G1[Step-by-step Execution]
        G1 --> H1[Detailed Explanations]
        H1 --> I1[Learning Resources]
    end

    style A1 fill:#e1f5fe
    style G1 fill:#e8f5e8
    style H1 fill:#fff3e0
```

### Experienced User Journey

```mermaid
flowchart LR
    subgraph "Experienced Experience"
        A2[Quick Start] --> B2[Advanced Options]
        B2 --> C2[Custom Project Config]
        C2 --> D2[Full SPARC Control]
        D2 --> E2[Parallel Execution]
        E2 --> F2[Real-time Monitoring]
        F2 --> G2[Export & Integration]
        G2 --> H2[Performance Analytics]
    end

    style A2 fill:#f3e5f5
    style E2 fill:#e8f5e8
    style G2 fill:#e0f2f1
```

## Real-time Progress Visualization

### Agent Activity Dashboard

```ascii
┌─────────────────────────────────────────────────────────────┐
│  🚀 Claude-Flow Workflow Progress                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Current Phase: 📋 Specification (2/5)                    │
│  ████████████████████░░░░░░░░░░░░  60% Complete            │
│                                                             │
│  Active Agents:                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 🔍 Researcher Agent              [●●●●●○] Working   │    │
│  │   └─ Analyzing user requirements...                 │    │
│  │                                                     │    │
│  │ 📊 Analyst Agent                 [●●●●○○] Idle      │    │
│  │   └─ Waiting for research data...                   │    │
│  │                                                     │    │
│  │ 📝 Planner Agent                 [●●●●●●] Complete  │    │
│  │   └─ Project structure defined ✓                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Recent Activity:                                           │
│  • 14:32 - Planner completed project structure             │
│  • 14:28 - Researcher started requirement analysis         │
│  • 14:25 - Phase 1 (Specification) initiated              │
│                                                             │
│  Next: Pseudocode generation with Coder Agent              │
│                                                             │
│  [ Pause ] [ Skip Phase ] [ View Details ] [ Settings ]   │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling & Recovery Flows

### Error Recovery Workflow

```mermaid
flowchart TD
    A[Error Detected] --> B{Error Type}

    B -->|Agent Failure| C[Respawn Agent]
    B -->|Network Issue| D[Retry Connection]
    B -->|User Input Error| E[Show Validation Message]
    B -->|System Overload| F[Queue Request]

    C --> G{Recovery Successful?}
    D --> G
    E --> H[User Corrects Input]
    F --> I[Wait for Capacity]

    G -->|Yes| J[Resume Workflow]
    G -->|No| K[Escalate to Manual Mode]
    H --> J
    I --> J

    K --> L[Provide Manual Options]
    L --> M[Download Partial Results]
    L --> N[Contact Support]
    L --> O[Retry Later]

    J --> P[Continue Normal Flow]
```

## Accessibility & User Experience Flows

### Keyboard Navigation Flow

```mermaid
flowchart LR
    A[Tab to Experience Level] --> B[Arrow Keys Navigate Options]
    B --> C[Space to Select]
    C --> D[Tab to Project Type]
    D --> E[Arrow Keys Navigate]
    E --> F[Enter to Select]
    F --> G[Tab to SPARC Config]
    G --> H[Space to Toggle Options]
    H --> I[Tab to Continue Button]
    I --> J[Enter to Start]
```

### Screen Reader Support Flow

```mermaid
flowchart TD
    A[Page Load] --> B[Announce Page Purpose]
    B --> C[Describe Interface Layout]
    C --> D[Read Experience Options]
    D --> E[Announce Selection State]
    E --> F[Describe Next Steps]
    F --> G[Provide Keyboard Instructions]
    G --> H[Real-time Progress Updates]
    H --> I[Announce Phase Completions]
    I --> J[Describe Final Results]
```

## Performance Optimization Flows

### Loading State Management

```mermaid
stateDiagram-v2
    [*] --> Initial
    Initial --> Loading: User starts workflow
    Loading --> AgentSetup: SPARC controller ready
    AgentSetup --> PhaseExecution: Agents spawned
    PhaseExecution --> PhaseComplete: Phase finished
    PhaseComplete --> NextPhase: Continue workflow
    PhaseComplete --> Complete: All phases done
    NextPhase --> PhaseExecution
    Complete --> [*]

    Loading --> Error: Setup failed
    PhaseExecution --> Error: Agent failure
    Error --> Recovery: Auto-retry
    Recovery --> PhaseExecution: Success
    Recovery --> Manual: Max retries exceeded
    Manual --> [*]
```

This comprehensive workflow design ensures a smooth, accessible, and efficient user experience while leveraging the full power of the SPARC framework and Claude-Flow coordination.