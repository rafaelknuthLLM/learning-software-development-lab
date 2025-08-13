# Contributing to Learning Software Development Lab

Thank you for your interest in contributing to this real-world discovery learning project! This document outlines how to contribute effectively while maintaining our SDLC and DevOps best practices.

## Project Philosophy

This project follows a **real-world discovery methodology** for learning software development by systematically exploring production codebases like a new team member. All contributions should align with this approach.

## How to Contribute

### 1. Understanding the Structure

Before contributing, familiarize yourself with our project organization:

```
learning-software-development-lab/
├── anthropic-cookbook/         # External: Anthropic's examples
├── anthropic-courses/          # External: Anthropic's curriculum  
├── scenario-based-learning/    # Proprietary: Our discovery methodology
├── config/                     # Configuration management
├── docs/                       # Project documentation
├── scripts/                    # Automation and utilities
└── logs/                       # Organized logging structure
```

### 2. Contribution Types

#### **Scenario Development** (Primary)
- Complete analysis of new SDLC phases
- Follow established methodology in `scenario-based-learning/`
- Maintain quality gates: 80% coverage, 90% accuracy

#### **Tool Development**
- Create automation tools for ecosystem analysis
- Place tools in appropriate `scenario-X/tools/` directories
- Include comprehensive documentation and usage examples

#### **Methodology Improvement**
- Enhance discovery techniques and frameworks
- Improve quality assurance processes
- Develop better community validation approaches

#### **Documentation Enhancement**
- Improve README files and analysis reports
- Add examples and use cases
- Clarify methodology explanations

### 3. Quality Standards

All contributions must meet these standards:

#### **Coverage Requirements**
- **80% minimum coverage** for ecosystem analysis
- **90% minimum accuracy** for categorization and analysis
- **Community validation** for all major findings

#### **Documentation Requirements**
- Clear, professional documentation for all deliverables
- README files for new directories or major features
- Inline comments explaining complex logic
- Usage examples and instructions

#### **Code Quality**
- Follow Python PEP 8 for Python code
- Use descriptive variable and function names
- Include error handling and input validation
- Write reusable, modular code

### 4. Contribution Process

#### **Before Starting**
1. Review existing scenarios to understand the methodology
2. Check the project's current status in `CHANGELOG.md`
3. Look for open issues or planned work
4. Discuss major contributions before starting

#### **Development Workflow**
1. Create a feature branch: `git checkout -b feature/scenario-2-architecture`
2. Follow the established scenario structure:
   ```
   XX-phase-name/
   ├── README.md
   ├── tools/
   ├── analysis/ 
   └── deliverables/
   ```
3. Maintain incremental development with approval gates
4. Document all findings and methodologies

#### **Quality Assurance**
1. Test all tools and scripts thoroughly
2. Validate analysis results against quality gates
3. Review documentation for clarity and completeness
4. Ensure all deliverables follow project standards

#### **Submission Process**
1. Update relevant README files
2. Add entry to `CHANGELOG.md`
3. Include usage examples and documentation
4. Submit for community validation when applicable

### 5. Specific Guidelines

#### **Scenario Development**
- Follow the established SDLC phase progression
- Use consistent analysis methodology
- Apply course skills: API integration, prompt engineering, evaluation, tool integration
- Create shareable tools and insights for community benefit

#### **Tool Development**
- Build tools that solve real discovery challenges
- Include comprehensive error handling
- Provide clear usage instructions
- Make tools reusable across scenarios

#### **Analysis Standards**
- Use systematic, data-driven approaches
- Include quantitative metrics and validation
- Provide clear insights and recommendations
- Document methodology for replication

### 6. Community Validation

Major contributions should include:
- Sharing findings with relevant communities
- Requesting feedback from practitioners
- Incorporating community input into final deliverables
- Contributing insights back to broader ecosystem

### 7. Getting Help

- Review existing scenario documentation for examples
- Check the `shared/templates/` directory for standard formats
- Look at completed scenarios for methodology reference
- Ask questions about the discovery approach before starting

## Code of Conduct

- Focus on **real-world applicability** over theoretical perfection
- **Build upon previous work** rather than starting from scratch  
- **Share knowledge** and insights with the community
- **Maintain quality** while moving at practical development speed
- **Document everything** for future team members

## Recognition

Contributors who meaningfully advance the project's real-world discovery methodology will be acknowledged in:
- Project documentation and README
- Scenario-specific acknowledgments
- Community sharing when appropriate

---

**Remember:** This project creates value by systematically exploring real codebases to extract practical software development insights. Every contribution should advance this mission while maintaining professional quality standards.

Thank you for helping build a better way to learn software development through real-world discovery!