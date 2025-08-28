# Scenario-Based Learning: SDLC Discovery Through Real-World Exploration

**Approach:** Learn software development by systematically exploring Anthropic's actual codebase like a new team member  
**Goal:** Master SDLC and DevOps principles through hands-on discovery of real practices  
**Method:** Apply course skills (API, prompting, evaluation, tools) to systematic codebase exploration

## Learning Philosophy

Instead of artificial tutorials, this approach follows industry best practices:
- **Real-world Discovery:** Explore actual production codebases, not toy examples
- **Systematic Methodology:** Each scenario follows SDLC phases with measurable outcomes
- **Quality Gates:** 80% coverage, 90% accuracy validation for all discoveries
- **Community Validation:** Share findings publicly and contribute back to ecosystem
- **Incremental Development:** Work in small, validated steps with approval gates

## Scenario Structure

Each scenario represents a different SDLC phase with consistent organization:

```
[XX]-[phase-name]/
├── README.md           # Scenario overview and results
├── tools/              # Custom tools and automation
├── analysis/           # Detailed findings and documentation  
└── deliverables/       # Final outputs and reports
```

## 6 Discovery Scenarios

### ✅ [Scenario 1: Requirements Discovery](./01-requirements-discovery/)
**SDLC Phase:** Requirements Analysis  
**Focus:** What problems does Anthropic's ecosystem solve? What user needs drive the code?  
**Status:** Complete (78% coverage, 90%+ accuracy)  
**Key Finding:** 46% of ecosystem addresses developer onboarding challenges

### 🚧 [Scenario 2: Architecture Discovery](./02-architecture-discovery/)
**SDLC Phase:** Design & Architecture  
**Focus:** How is Anthropic's ecosystem organized? What patterns repeat across implementations?  
**Status:** Ready to begin  
**Goal:** Document architectural patterns and design principles

### 📋 [Scenario 3: Implementation Discovery](./03-implementation-discovery/)
**SDLC Phase:** Implementation  
**Focus:** How does Anthropic implement solutions? What coding practices do they follow?  
**Status:** Planned  
**Goal:** Extract coding standards and implementation best practices

### 📋 [Scenario 4: Quality Discovery](./04-quality-discovery/)
**SDLC Phase:** Testing & Quality Assurance  
**Focus:** How does Anthropic test their systems? What quality standards do they maintain?  
**Status:** Planned  
**Goal:** Document testing approaches and quality frameworks

### 📋 [Scenario 5: Deployment Discovery](./05-deployment-discovery/)
**SDLC Phase:** Deployment & CI/CD  
**Focus:** How does Anthropic deploy and maintain their systems? What DevOps practices do they use?  
**Status:** Planned  
**Goal:** Extract DevOps practices and deployment patterns

### 📋 [Scenario 6: Maintenance Discovery](./06-maintenance-discovery/)
**SDLC Phase:** Operations & Maintenance  
**Focus:** How does Anthropic monitor, maintain, and improve their systems over time?  
**Status:** Planned  
**Goal:** Document operational practices and continuous improvement approaches

## Shared Resources

### [Templates](./shared/templates/)
- Analysis report templates
- Quality gate checklists  
- Community validation frameworks

### [Common Tools](./shared/common-tools/)
- Reusable analysis utilities
- Shared configuration files
- Cross-scenario helper functions

## Quality Standards

### Validation Criteria
- **Coverage Goal:** 80% of major components analyzed
- **Accuracy Target:** 90% validation through community feedback
- **Documentation:** Standardized templates for knowledge sharing
- **Reproducibility:** All methodologies documented for replication

### Success Metrics
1. **Personal Learning:** Develop practical SDLC skills through real-world discovery
2. **Team Contribution:** Create shareable discoveries, tools, and documentation  
3. **Process Improvement:** Build better ways to onboard future team members
4. **Community Value:** Contribute insights and tools back to Anthropic's ecosystem

## Usage

### Starting a New Scenario
1. Read the scenario's README for objectives and methodology
2. Review previous scenario learnings and apply insights
3. Follow incremental development with approval gates
4. Use shared templates and tools for consistency

### Contributing
- Each scenario builds upon previous discoveries
- All tools and methodologies should be reusable
- Document everything for future team members
- Share findings with Anthropic community for validation

## Current Progress

| Scenario | Phase | Status | Coverage | Accuracy | Key Insight |
|----------|--------|--------|----------|----------|-------------|
| 1 | Requirements | ✅ Complete | 78% | 90%+ | Developer onboarding focus |
| 2 | Architecture | 🚧 Ready | - | - | - |
| 3 | Implementation | 📋 Planned | - | - | - |  
| 4 | Quality | 📋 Planned | - | - | - |
| 5 | Deployment | 📋 Planned | - | - | - |
| 6 | Maintenance | 📋 Planned | - | - | - |

---

*This systematic approach to learning software development through real-world codebase exploration follows industry best practices and creates valuable knowledge for the broader development community.*