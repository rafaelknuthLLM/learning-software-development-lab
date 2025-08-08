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

Follow the top-down methodology: understand the big picture first, then dive into implementation details. Each course includes extensive visual explanations, real-world analogies, and practical exercises that reinforce learning.

## Next Steps

Start with Anthropic API Fundamentals if you're new to Claude integration, or jump to Prompt Engineering if you already know the basics. The repository includes comprehensive setup instructions and all required code examples.

**Goal:** Build practical AI applications while mastering the underlying concepts and best practices used by professional developers.