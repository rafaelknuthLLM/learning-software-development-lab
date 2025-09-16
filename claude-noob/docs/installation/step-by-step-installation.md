# Step-by-Step Claude-Flow Installation Guide

## Installation Overview

This guide follows the exact sequence needed for a successful installation. **Do not skip steps or change the order.**

**Total time:** 20-40 minutes
**Difficulty:** Beginner-friendly

---

## Step 1: Prepare Your System 🛠️

### 1.1 Open Terminal/Command Line
- **macOS:** Press Cmd+Space, type "Terminal", press Enter
- **Linux:** Press Ctrl+Alt+T
- **Windows:** Open "Ubuntu" or your WSL2 distribution

### 1.2 Create Installation Directory
```bash
# Create a dedicated directory for Claude-Flow projects
mkdir -p ~/claude-flow-projects
cd ~/claude-flow-projects

# Verify you're in the right place
pwd
# Should show: /home/[username]/claude-flow-projects (Linux)
#         or: /Users/[username]/claude-flow-projects (macOS)
```

### 1.3 Update Your System
```bash
# macOS (if using Homebrew)
brew update

# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

---

## Step 2: Install Claude Desktop 🖥️

**Why first:** Claude Desktop provides the AI interface that everything else connects to.

### 2.1 Download Claude Desktop

1. **Visit:** https://claude.ai/desktop
2. **Click** the download button for your operating system
3. **Save** the installer file to your Downloads folder

### 2.2 Install Claude Desktop

**macOS:**
```bash
# Navigate to Downloads
cd ~/Downloads

# Install the .dmg file (replace with exact filename)
open Claude-Desktop-*.dmg

# Follow the installer prompts
# Drag Claude to Applications folder
```

**Linux (Ubuntu/Debian):**
```bash
# Navigate to Downloads
cd ~/Downloads

# Install the .deb file (replace with exact filename)
sudo dpkg -i claude-desktop-*.deb

# Fix any dependency issues
sudo apt-get install -f
```

**Windows (WSL2):**
- Double-click the downloaded .exe file in Windows
- Follow the installation wizard
- Accept default settings

### 2.3 Launch Claude Desktop

1. **Start the application** from your applications menu
2. **Sign in** with your Claude account
3. **Leave it running** - we'll configure it later

---

## Step 3: Install Node.js (If Not Already Installed) 📦

### 3.1 Check Current Installation
```bash
node --version
npm --version
```

If both commands show version numbers (Node.js 18+ and npm 8+), **skip to Step 4**.

### 3.2 Install Node.js

**Option A: Official Installer (Recommended for beginners)**
1. Visit: https://nodejs.org/
2. Download the LTS version (left button)
3. Run the installer with default settings

**Option B: Package Manager (macOS)**
```bash
# Install using Homebrew
brew install node

# Verify installation
node --version
npm --version
```

**Option C: Package Manager (Ubuntu/Debian)**
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

**Option D: Node Version Manager (For developers)**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or run:
source ~/.bashrc

# Install latest Node.js LTS
nvm install --lts
nvm use --lts

# Verify installation
node --version
npm --version
```

---

## Step 4: Install Claude-Flow 🌊

### 4.1 Install Globally
```bash
# Install Claude-Flow globally
npm install -g claude-flow@alpha

# This may take 2-5 minutes - be patient!
```

**Expected output:**
```
+ claude-flow@2.0.0-alpha.x
added 150 packages from 200 contributors
```

### 4.2 Verify Installation
```bash
# Check Claude-Flow version
npx claude-flow --version

# Check available commands
npx claude-flow --help
```

**Expected output should show:**
- Version number (e.g., "2.0.0-alpha.12")
- List of available commands

### 4.3 Install Supporting Tools
```bash
# Install development tools (optional but recommended)
npm install -g typescript ts-node nodemon

# Verify installations
tsc --version
ts-node --version
nodemon --version
```

---

## Step 5: Configure MCP Integration 🔗

**What is MCP?** Model Context Protocol - it lets Claude Desktop communicate with external tools like Claude-Flow.

### 5.1 Locate Configuration Directory

**macOS:**
```bash
# Navigate to Claude config directory
cd ~/Library/Application\ Support/Claude/

# List files (should see some Claude files)
ls -la
```

**Linux:**
```bash
# Navigate to Claude config directory
cd ~/.config/claude/

# Create directory if it doesn't exist
mkdir -p ~/.config/claude/
cd ~/.config/claude/

# List files
ls -la
```

**Windows (WSL2):**
```bash
# From WSL2, access Windows AppData
cd /mnt/c/Users/[USERNAME]/AppData/Roaming/Claude/

# Replace [USERNAME] with your Windows username
```

### 5.2 Create/Edit Configuration File

```bash
# Create or edit the config file
nano claude_desktop_config.json
```

**Paste this exact content:**
```json
{
  "mcpServers": {
    "claude-flow": {
      "command": "npx",
      "args": ["claude-flow@alpha", "mcp", "start"],
      "env": {
        "NODE_ENV": "production",
        "CLAUDE_FLOW_LOG_LEVEL": "info"
      }
    }
  }
}
```

### 5.3 Save and Restart Claude Desktop

1. **Save the file:** Press Ctrl+X, then Y, then Enter (in nano)
2. **Restart Claude Desktop:** Close the app completely and reopen it
3. **Wait 10-15 seconds** for the MCP connection to establish

---

## Step 6: Create Your First Project 🚀

### 6.1 Initialize Project
```bash
# Go to your Claude-Flow projects directory
cd ~/claude-flow-projects

# Create a new project
mkdir my-first-project
cd my-first-project

# Initialize Claude-Flow project
npx claude-flow init
```

**Follow the prompts:**
- Project name: `my-first-project`
- Description: `Learning Claude-Flow basics`
- Template: `basic`
- Initialize git repo: `Y`

### 6.2 Verify Project Structure
```bash
# List project files
ls -la

# Should see:
# - package.json
# - .claude-flow/
# - src/ (or similar)
# - README.md
```

---

## Step 7: Test Everything Works ✅

### 7.1 Test Claude-Flow Commands
```bash
# Check system status
npx claude-flow status

# List available modes
npx claude-flow sparc modes

# Test memory system
npx claude-flow memory test
```

**Expected:** All commands should run without errors.

### 7.2 Test Claude Desktop Integration

1. **Open Claude Desktop**
2. **Start a new conversation**
3. **Type exactly:**
   ```
   Please run: npx claude-flow status
   ```

**Expected result:** Claude should execute the command and show you the status output.

### 7.3 Test Agent Spawning

**In Claude Desktop, type:**
```
Please initialize a test swarm with mesh topology and 3 agents, then show me the swarm status.
```

**Expected result:** Claude should create a swarm and show you the agent details.

---

## Step 8: Installation Verification ✅

Run this comprehensive test:

```bash
# Navigate to your project
cd ~/claude-flow-projects/my-first-project

# Run health check
npx claude-flow health-check
```

**Expected output:**
```
🔍 Claude-Flow Health Check
===========================

✅ Node.js version: 20.x.x
✅ npm version: 10.x.x
✅ Claude-Flow installation: OK
✅ Project structure: Valid
✅ MCP configuration: Connected
✅ Memory system: Functional
✅ Agent system: Ready

🎉 All systems operational!

Next steps:
- Try creating your first agent
- Explore available templates
- Read the user guide
```

---

## Troubleshooting Installation Issues 🔧

### Issue: "command not found: npx claude-flow"

**Solution:**
```bash
# Check npm global directory
npm config get prefix

# Ensure it's in your PATH
echo $PATH

# If not, add to your shell profile
echo 'export PATH="$(npm config get prefix)/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Issue: "Permission denied" errors

**Solution:**
```bash
# Fix npm permissions
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# Or configure npm to use a different directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
source ~/.profile
```

### Issue: Claude Desktop can't connect to MCP

**Solution:**
1. **Check config file syntax** - use a JSON validator
2. **Verify file location** - make sure it's in the right directory
3. **Check file permissions:**
   ```bash
   chmod 644 claude_desktop_config.json
   ```
4. **Restart Claude Desktop completely**

### Issue: Installation hangs or fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Try with verbose output
npm install -g claude-flow@alpha --verbose

# If behind a proxy/firewall
npm config set registry http://registry.npmjs.org/
```

---

## What's Next? 🎯

After successful installation:

1. **📚 Read the User Guide:** `docs/tutorials/user-guide.md`
2. **🛠️ Try Advanced Setup:** `docs/installation/advanced-configuration.md`
3. **🚀 Build Your First Real Project:** `docs/examples/hello-world-project.md`
4. **🤝 Join the Community:** GitHub discussions and Discord

---

## Success Checklist ✅

Mark each item when completed:

- [ ] System prerequisites verified
- [ ] Claude Desktop installed and running
- [ ] Node.js and npm working correctly
- [ ] Claude-Flow installed globally
- [ ] MCP configuration file created
- [ ] Claude Desktop restarted
- [ ] First project initialized
- [ ] Health check passes
- [ ] MCP integration working in Claude Desktop
- [ ] Test agent swarm created successfully

**Congratulations!** You now have a fully functional Claude-Flow installation.

---

## Getting Help 🆘

If you get stuck:

1. **Check the troubleshooting guide:** `docs/troubleshooting/common-issues.md`
2. **Review installation logs:** Look for error messages during installation
3. **Ask for help:** Include your operating system, Node.js version, and exact error messages

**Remember:** Complex software installations sometimes require patience and troubleshooting - you've got this! 💪