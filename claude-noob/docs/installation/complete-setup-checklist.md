# Claude-Flow Complete Setup Checklist for Beginners

## Overview
This guide will walk you through setting up Claude-Flow from scratch. Claude-Flow is a powerful orchestration system that helps coordinate multiple AI agents to work together on complex programming tasks.

**What you'll accomplish:**
- Install all required tools in the correct order
- Configure Claude-Flow to work with Claude Code
- Verify everything is working properly
- Create your first project

**Time required:** 30-60 minutes depending on your system

---

## Phase 1: System Prerequisites Check ✅

Before installing anything, let's verify your system meets the requirements.

### 1.1 Check Operating System
**Supported systems:**
- macOS (10.15 or later)
- Linux (Ubuntu 18.04+, Debian 10+, or equivalent)
- Windows 10/11 with WSL2

**To check your system:**
```bash
# On macOS/Linux
uname -a

# On Windows (in PowerShell)
Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion
```

### 1.2 Verify Node.js Installation
**Why:** Claude-Flow is built on Node.js, so this is essential.

```bash
# Check if Node.js is installed
node --version

# Should show v18.0.0 or higher
# If not installed, visit: https://nodejs.org/
```

### 1.3 Check npm (Node Package Manager)
**Why:** npm installs Claude-Flow and its dependencies.

```bash
# Check npm version
npm --version

# Should show 8.0.0 or higher
```

### 1.4 Verify Git Installation
**Why:** Version control is needed for project management.

```bash
# Check Git installation
git --version

# Should show any version 2.x or higher
# If not installed, visit: https://git-scm.com/
```

### 1.5 Check Available Disk Space
**Why:** Claude-Flow and dependencies need storage space.

```bash
# Check available space (need at least 1GB free)
df -h .
```

---

## Phase 2: Tool Installation Order 🔧

**CRITICAL:** Install tools in this exact sequence to avoid conflicts.

### 2.1 Install Claude Desktop (First)
**Why first:** Claude Desktop provides the core AI interface.

1. **Download Claude Desktop:**
   - Visit: https://claude.ai/desktop
   - Download for your operating system
   - Install using the downloaded installer

2. **Verify installation:**
   ```bash
   # On macOS
   ls "/Applications/Claude.app"

   # On Linux
   which claude

   # On Windows
   where claude
   ```

### 2.2 Install Claude-Flow (Second)
**Why second:** Claude-Flow extends Claude's capabilities.

```bash
# Install Claude-Flow globally
npm install -g claude-flow@alpha

# Verify installation
npx claude-flow --version
```

**Expected output:** Should show version number (e.g., "2.0.0-alpha.x")

### 2.3 Install Additional Dependencies (Third)
**Why third:** These support advanced features.

```bash
# Install development tools
npm install -g typescript ts-node nodemon

# Verify installations
tsc --version
ts-node --version
nodemon --version
```

---

## Phase 3: Configuration Steps 🔄

### 3.1 Configure Claude Desktop MCP Integration

**What is MCP?** Model Context Protocol - allows Claude to use external tools.

1. **Locate Claude Desktop config:**
   ```bash
   # macOS
   open ~/Library/Application\ Support/Claude/

   # Linux
   ls ~/.config/claude/

   # Windows
   explorer %APPDATA%\Claude\
   ```

2. **Create or edit claude_desktop_config.json:**
   ```json
   {
     "mcpServers": {
       "claude-flow": {
         "command": "npx",
         "args": ["claude-flow@alpha", "mcp", "start"],
         "env": {
           "NODE_ENV": "production"
         }
       }
     }
   }
   ```

3. **Save and restart Claude Desktop**

### 3.2 Initialize Claude-Flow Workspace

**Why:** Creates a proper project structure.

```bash
# Create your first project directory
mkdir my-first-claude-flow-project
cd my-first-claude-flow-project

# Initialize Claude-Flow
npx claude-flow init

# Follow the prompts:
# - Project name: my-first-project
# - Description: Learning Claude-Flow
# - Template: basic
```

### 3.3 Configure Environment Variables

**Why:** Some features need API keys and configuration.

1. **Create .env file:**
   ```bash
   touch .env
   ```

2. **Add basic configuration:**
   ```env
   # .env file contents
   NODE_ENV=development
   CLAUDE_FLOW_LOG_LEVEL=info
   CLAUDE_FLOW_MEMORY_ENABLED=true
   ```

---

## Phase 4: Integration Setup 🔗

### 4.1 Test Claude Desktop + Claude-Flow Connection

1. **Open Claude Desktop**
2. **Start a new conversation**
3. **Test MCP integration:**
   ```
   /help mcp
   ```

   **Expected:** Should show available MCP tools including claude-flow commands.

### 4.2 Verify Tool Communication

**In Claude Desktop, try these commands:**

```
Can you run: npx claude-flow status
```

**Expected output:** Should show Claude-Flow system status without errors.

### 4.3 Test Swarm Initialization

**In Claude Desktop:**
```
Please initialize a test swarm with mesh topology and 3 agents
```

**Expected:** Claude should use MCP tools to create a swarm and show confirmation.

---

## Phase 5: Verification Steps ✅

### 5.1 Run System Health Check

```bash
# In your project directory
npx claude-flow health-check
```

**Expected output:**
```
✅ Node.js version: OK
✅ npm version: OK
✅ Claude-Flow installation: OK
✅ MCP connection: OK
✅ Memory system: OK
✅ All systems operational
```

### 5.2 Test Basic Commands

```bash
# List available modes
npx claude-flow sparc modes

# Check swarm status
npx claude-flow swarm status

# Test memory system
npx claude-flow memory test
```

### 5.3 Verify Agent Spawning

**In Claude Desktop:**
```
Please spawn a test agent of type 'researcher' and have it analyze this message
```

**Expected:** Should create an agent and provide analysis output.

---

## Phase 6: Common Issues and Solutions 🔧

### Issue 1: "Command not found: npx claude-flow"
**Solution:**
```bash
# Reinstall globally
npm install -g claude-flow@alpha --force

# Clear npm cache
npm cache clean --force
```

### Issue 2: MCP Server Not Connecting
**Solution:**
1. Check config file syntax with JSON validator
2. Restart Claude Desktop completely
3. Verify file permissions:
   ```bash
   chmod 644 claude_desktop_config.json
   ```

### Issue 3: "Permission Denied" Errors
**Solution:**
```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### Issue 4: Node.js Version Conflicts
**Solution:**
```bash
# Install Node Version Manager
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node 18
nvm install 18
nvm use 18
```

### Issue 5: Swarm Won't Initialize
**Solution:**
1. Check available memory: `free -h`
2. Clear Claude-Flow cache: `npx claude-flow cache clear`
3. Restart with verbose logging: `npx claude-flow --verbose init`

---

## Phase 7: First Project Walkthrough 🚀

### 7.1 Create Your First AI-Assisted Project

**Goal:** Build a simple "Hello World" application using Claude-Flow orchestration.

1. **Set up project structure:**
   ```bash
   mkdir hello-world-project
   cd hello-world-project
   npx claude-flow init --template basic
   ```

2. **In Claude Desktop, request:**
   ```
   Help me create a simple Node.js application that:
   - Has a main.js file that prints "Hello, Claude-Flow!"
   - Includes a package.json with proper dependencies
   - Has basic error handling

   Please use a swarm approach with:
   - A researcher to plan the structure
   - A coder to implement the files
   - A tester to verify everything works
   ```

3. **Expected result:** Claude should coordinate multiple agents to create your project files.

### 7.2 Test Your Project

```bash
# Install dependencies
npm install

# Run your application
node main.js
```

**Expected output:** "Hello, Claude-Flow!" message displayed.

### 7.3 Explore Advanced Features

**Try these requests in Claude Desktop:**
```
1. "Add error logging to my project"
2. "Create unit tests for the main function"
3. "Optimize the code for better performance"
```

---

## Success Checklist ✅

Mark each item as complete:

- [ ] System prerequisites verified
- [ ] Claude Desktop installed and running
- [ ] Claude-Flow installed globally
- [ ] MCP integration configured
- [ ] First project initialized
- [ ] Health check passes
- [ ] Test swarm created successfully
- [ ] First application runs without errors
- [ ] Advanced features tested

---

## Next Steps 🎯

Once you've completed this checklist:

1. **Explore more templates:** `npx claude-flow templates list`
2. **Read the user guide:** `/docs/tutorials/user-guide.md`
3. **Try advanced projects:** `/docs/examples/`
4. **Join the community:** Visit GitHub discussions

---

## Getting Help 🆘

If you encounter issues:

1. **Check troubleshooting guide:** `/docs/troubleshooting/common-issues.md`
2. **Review logs:** `npx claude-flow logs`
3. **Ask for help:** Include error messages and system info when asking for assistance

**Remember:** This is complex software - don't get discouraged if everything doesn't work perfectly on the first try!