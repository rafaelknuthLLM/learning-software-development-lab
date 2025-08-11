# Anthropic Courses Repository Overview

## What This Repository Contains

A complete curriculum for learning Claude integration and AI application development. Five interconnected courses take you from basic API usage to building production-ready AI applications. All courses use hands-on Jupyter notebooks with real code examples.

## Setup Requirements

- Python 3.7.1+ with `anthropic`, `python-dotenv`, and `jupyter` packages
- Anthropic API key (stored in environment variables)
- Optional: `promptfoo` for advanced evaluations
- All courses use Claude 3 Haiku for cost-effective learning

## Course Learning Path

Take these courses in order - each builds on previous knowledge.

### 1. Anthropic API Fundamentals (Start Here)
**What you'll learn:** How to connect to and use Claude through code

**6 interactive notebooks covering:**
- Setting up API authentication and making your first request
- Understanding message format (user/assistant conversations)
- Comparing Claude models (Haiku, Sonnet, Opus) - speed vs capability
- Controlling responses with parameters (temperature, max_tokens, stop sequences)
- Building streaming responses for real-time applications
- Working with images using Claude's vision capabilities

**You'll build:** Simple chatbot, translation tools, sentiment analysis functions

### 2. Prompt Engineering Interactive Tutorial (Core Skills)
**What you'll learn:** How to write prompts that get Claude to do exactly what you need

**9 chapters plus advanced techniques:**
- Writing clear, direct instructions that Claude understands
- Using roles and system prompts to control Claude's behavior
- Separating your data from instructions using XML tags
- Formatting output exactly how you want it
- Getting Claude to show step-by-step reasoning
- Using examples to teach Claude new patterns
- Preventing hallucinations and wrong information
- Advanced techniques: prompt chaining, tool integration

**Interactive features:** Built-in exercises with automatic grading and hints

**You'll build:** Customer service bots, document analyzers, creative writing assistants

### 3. Real World Prompting (Apply Your Skills)
**What you'll learn:** Using prompt engineering in actual business scenarios

**5 notebooks with industry examples:**
- Medical applications: diagnostic assistance, patient communication
- Call centers: conversation summaries, sentiment tracking
- Customer support: automated responses, ticket classification
- Complete prompt engineering lifecycle from idea to production
- Optimizing prompts for real-world performance

**You'll build:** Industry-specific AI applications ready for real use

### 4. Prompt Evaluations (Measure Quality)
**What you'll learn:** How to test and improve your prompts systematically

**9 lessons covering three evaluation approaches:**
- Human evaluation using Anthropic Workbench
- Code-based evaluation with exact matching and keyword detection
- AI-powered evaluation where Claude grades Claude's responses
- Building comprehensive test suites with CSV datasets
- Using external tools like Promptfoo for automation
- Creating custom grading functions for your specific needs

**You'll build:** Complete evaluation pipelines that automatically test prompt quality

### 5. Tool Use (Advanced Integration)
**What you'll learn:** Connecting Claude to external systems and functions

**6 progressive lessons:**
- Understanding tool use concepts and workflow
- Defining tools with proper schemas and descriptions
- Implementing the complete request-execute-integrate cycle
- Building multi-tool systems where Claude chooses which tools to use
- Error handling and tool result integration
- Creating complex chatbot systems with multiple capabilities

**You'll build:** AI assistants that can call APIs, query databases, and integrate with your existing systems

## Course Connections

Each course builds specific skills:
- **API Fundamentals** gives you the technical foundation
- **Prompt Engineering** teaches you to communicate effectively with Claude
- **Real World Prompting** shows you how to apply these skills professionally
- **Evaluations** helps you measure and improve your work
- **Tool Use** extends Claude's capabilities beyond text generation

## What Makes These Courses Special

**Learn by doing:** Every concept includes working code examples you can run and modify

**Progressive difficulty:** Start simple, build complexity gradually

**Real applications:** Examples from healthcare, customer service, and business automation

**Multiple formats:** Direct API, AWS Bedrock, and other deployment options

**Quality assurance:** Built-in grading systems and answer validation

**Production ready:** Learn patterns used in actual business applications

## Learning Approach

- Learn by building and contributing to Anthropic's community
- Prioritize velocity over perfection - ship early, iterate fast
- Learn just enough to make the next step forward
- Learn in the open - document and share discoveries
- Always use top-down methodology: README → Structure → Folders → Code
- Start with big picture before diving into details
- Use agentic tools (glob, grep) for systematic exploration
- Document discoveries in learning-notes/
- Simple, readable code over complex solutions
- Extensive comments and explanations for learning
- Real-world analogies for technical concepts

## Learning Foundation: Anthropic's Course Guidance

**Course-Guided Skill Development:** Each discovery scenario builds on Anthropic's structured curriculum, applying course concepts to real-world codebase exploration.

### Core Learning Path
Follow Anthropic's five interconnected courses as your skills foundation:

**1. API Fundamentals** → Technical foundation for connecting to Claude
- 6 interactive notebooks: authentication, message formats, model comparison, parameters, streaming, vision
- **Applied in Scenarios:** Use API skills to systematically explore and catalog Anthropic's ecosystem

**2. Prompt Engineering** → Core communication skills with Claude  
- 9 chapters: clear instructions, roles, data separation, output formatting, reasoning, examples, hallucination prevention
- **Applied in Scenarios:** Engineer prompts that extract insights from code, documentation, and architectural patterns

**3. Real World Prompting** → Professional application techniques
- 5 industry notebooks: medical, call centers, customer support, lifecycle management, optimization
- **Applied in Scenarios:** Apply business-ready prompting to analyze Anthropic's production code and practices

**4. Prompt Evaluations** → Quality measurement and improvement
- 9 lessons: human evaluation, code-based testing, AI-powered assessment, test suites, automation
- **Applied in Scenarios:** Build evaluation frameworks to validate discovery accuracy and tool effectiveness

**5. Tool Use** → Advanced system integration
- 6 progressive lessons: tool concepts, schemas, request-execute cycles, multi-tool systems, error handling
- **Applied in Scenarios:** Create discovery tools that integrate with external systems and automate exploration

### Scenario-Course Integration Strategy

Each discovery scenario follows this learning pattern:
1. **Study Relevant Course Material** → Build foundational understanding
2. **Apply to Real Codebase** → Use skills on actual Anthropic code/community projects  
3. **Create Team Deliverables** → Build shareable tools and documentation
4. **Evaluate and Improve** → Test effectiveness and iterate

**Setup Requirements:**
- Python 3.7.1+ with `anthropic`, `python-dotenv`, and `jupyter` packages
- Anthropic API key (stored in environment variables)  
- Optional: `promptfoo` for advanced evaluations
- All scenarios use Claude 3 Haiku for cost-effective learning

## Real-World Discovery Scenarios

Learn software development by systematically exploring Anthropic's ecosystem - treating yourself as a new team member discovering company code, patterns, and practices across their entire codebase.

**Discovery Scope:** Any Anthropic code or community-written code that serves learning purposes:
- Local cookbook/courses (guidance foundation)
- Public Anthropic repositories on GitHub
- Community contributions and integrations
- Documentation sites and example implementations
- Third-party tools and frameworks using Anthropic APIs

**Integrated Skills Development:** At each SDLC phase, practice all four core competencies:
- **API Integration:** Connecting to and using Claude effectively
- **Prompt Engineering:** Crafting precise, effective instructions
- **Evaluation & Testing:** Measuring and improving prompt/system quality
- **Tool Integration:** Connecting Claude with external systems and workflows

### Scenario 1: Requirements Discovery through Ecosystem Analysis
**SDLC Phase:** Requirements Analysis  
**Discovery Focus:** What problems does Anthropic's ecosystem solve? What user needs drive the code?

**Skills Practice:**
- **API Integration:** Use Claude API to systematically catalog Anthropic's repositories and documentation
- **Prompt Engineering:** Write prompts that extract requirements insights from code comments, README files, and documentation
- **Evaluation:** Test prompt effectiveness at identifying true vs. assumed requirements
- **Tool Integration:** Build tools that automatically discover and categorize Anthropic ecosystem components

**Deliverables:**
- Requirements analysis of Anthropic's educational and production code
- Discovery methodology documentation for future team members
- Automated tools for ecosystem exploration

### Scenario 2: Architecture Discovery through Pattern Analysis
**SDLC Phase:** Design & Architecture  
**Discovery Focus:** How is Anthropic's ecosystem organized? What patterns repeat across implementations?

**Skills Practice:**
- **API Integration:** Use Claude to analyze code structure and identify architectural patterns
- **Prompt Engineering:** Create prompts that recognize design patterns, anti-patterns, and best practices
- **Evaluation:** Validate pattern recognition accuracy against known architectural principles
- **Tool Integration:** Build pattern analysis tools that work across multiple repositories

**Deliverables:**
- Architecture documentation and pattern libraries
- Design pattern analysis tools for team knowledge sharing
- Best practices guide derived from real Anthropic implementations

### Scenario 3: Implementation Discovery through Code Analysis
**SDLC Phase:** Implementation  
**Discovery Focus:** How does Anthropic implement solutions? What coding practices do they follow?

**Skills Practice:**
- **API Integration:** Use Claude to understand implementation details and coding patterns
- **Prompt Engineering:** Write prompts that identify implementation best practices and code quality patterns
- **Evaluation:** Test understanding by comparing discovered practices with actual team standards
- **Tool Integration:** Create development tools that enforce discovered best practices

**Deliverables:**
- Implementation guidelines based on real Anthropic code
- Code analysis tools that identify quality patterns
- Development utilities that support team coding standards

### Scenario 4: Quality Discovery through Testing Analysis
**SDLC Phase:** Testing & Quality Assurance  
**Discovery Focus:** How does Anthropic test their systems? What quality standards do they maintain?

**Skills Practice:**
- **API Integration:** Use Claude to analyze testing approaches and quality metrics
- **Prompt Engineering:** Create prompts that evaluate code quality and testing coverage
- **Evaluation:** Build comprehensive evaluation frameworks for prompt and system quality
- **Tool Integration:** Develop automated testing tools that align with Anthropic's quality standards

**Deliverables:**
- Quality assurance framework based on Anthropic's practices
- Automated testing tools and evaluation pipelines
- Quality metrics and monitoring systems

### Scenario 5: Deployment Discovery through DevOps Analysis
**SDLC Phase:** Deployment & CI/CD  
**Discovery Focus:** How does Anthropic deploy and maintain their systems? What DevOps practices do they use?

**Skills Practice:**
- **API Integration:** Use Claude to understand deployment patterns and infrastructure choices
- **Prompt Engineering:** Write prompts that identify DevOps best practices and automation opportunities
- **Evaluation:** Test deployment strategies and measure their effectiveness
- **Tool Integration:** Build CI/CD tools and deployment automation that follows Anthropic's patterns

**Deliverables:**
- DevOps playbook based on Anthropic's deployment practices
- Automated deployment tools and pipelines
- Infrastructure monitoring and management utilities

### Scenario 6: Maintenance Discovery through Operations Analysis
**SDLC Phase:** Operations & Maintenance  
**Discovery Focus:** How does Anthropic monitor, maintain, and improve their systems over time?

**Skills Practice:**
- **API Integration:** Use Claude to analyze maintenance patterns and operational metrics
- **Prompt Engineering:** Create prompts for system monitoring, issue detection, and continuous improvement
- **Evaluation:** Continuously measure and improve system performance and prompt effectiveness
- **Tool Integration:** Build operational tools for monitoring, alerting, and system optimization

**Deliverables:**
- Operations handbook based on Anthropic's maintenance practices
- Monitoring and alerting systems
- Continuous improvement frameworks and tools

**Success Criteria for All Scenarios:**
1. **Personal Learning:** Develop practical SDLC skills through real-world discovery
2. **Team Contribution:** Create shareable discoveries, tools, and documentation
3. **Process Improvement:** Build better ways to onboard future team members
4. **Community Value:** Contribute insights and tools back to Anthropic's ecosystem

**Goal:** Master software development lifecycle and DevOps principles through hands-on discovery of Anthropic's actual practices and codebase.