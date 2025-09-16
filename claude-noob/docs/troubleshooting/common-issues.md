# Common Issues and Solutions for Claude-Flow

## Quick Diagnostic Commands

Run these first to gather information:

```bash
# System information
echo "=== DIAGNOSTIC INFO ==="
echo "OS: $(uname -a)"
echo "Node: $(node --version 2>/dev/null || echo 'NOT FOUND')"
echo "npm: $(npm --version 2>/dev/null || echo 'NOT FOUND')"
echo "Claude-Flow: $(npx claude-flow --version 2>/dev/null || echo 'NOT FOUND')"
echo "Working Directory: $(pwd)"
echo "Available Space: $(df -h . | tail -1 | awk '{print $4}')"
echo "======================="

# Test basic functionality
npx claude-flow status 2>&1
```

Copy this output when asking for help!

---

## Installation Issues 🔧

### Issue 1: "command not found: npx" or "command not found: claude-flow"

**Cause:** Node.js/npm not installed or not in PATH

**Solutions:**

```bash
# Solution 1: Check if Node.js is installed
which node
which npm

# If not found, install Node.js from https://nodejs.org/

# Solution 2: Check PATH configuration
echo $PATH | grep -o '[^:]*npm[^:]*'

# Solution 3: Add npm to PATH
echo 'export PATH="$(npm config get prefix)/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Solution 4: Reinstall Claude-Flow
npm install -g claude-flow@alpha --force
```

### Issue 2: "Permission denied" during npm install

**Cause:** npm trying to write to system directories

**Solutions:**

```bash
# Solution 1: Configure npm to use user directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
source ~/.profile

# Then reinstall
npm install -g claude-flow@alpha

# Solution 2: Fix existing npm permissions (Linux/macOS)
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# Solution 3: Use sudo (not recommended but works)
sudo npm install -g claude-flow@alpha
```

### Issue 3: Installation hangs or times out

**Cause:** Network issues, proxy, or npm cache problems

**Solutions:**

```bash
# Solution 1: Clear npm cache
npm cache clean --force

# Solution 2: Use different registry
npm install -g claude-flow@alpha --registry https://registry.npmjs.org/

# Solution 3: Install with verbose output to see where it hangs
npm install -g claude-flow@alpha --verbose

# Solution 4: Configure proxy (if behind corporate firewall)
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# Solution 5: Increase timeout
npm config set fetch-timeout 300000
```

---

## MCP Integration Issues 🔗

### Issue 4: Claude Desktop doesn't recognize MCP tools

**Cause:** Configuration file missing or incorrect

**Step-by-step fix:**

1. **Find the correct config directory:**
   ```bash
   # macOS
   ls ~/Library/Application\ Support/Claude/

   # Linux
   ls ~/.config/claude/

   # Windows WSL
   ls /mnt/c/Users/[USERNAME]/AppData/Roaming/Claude/
   ```

2. **Check if config file exists:**
   ```bash
   cat claude_desktop_config.json
   ```

3. **Create or fix the config file:**
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

4. **Validate JSON syntax:** Paste content into https://jsonlint.com/

5. **Set correct permissions:**
   ```bash
   chmod 644 claude_desktop_config.json
   ```

6. **Restart Claude Desktop completely**

### Issue 5: MCP server fails to start

**Cause:** Claude-Flow not installed or npx not working

**Diagnostic commands:**
```bash
# Test if MCP server starts manually
npx claude-flow@alpha mcp start

# Expected output: Should show "MCP server started" and not exit
```

**Solutions:**
```bash
# Solution 1: Reinstall Claude-Flow
npm uninstall -g claude-flow
npm install -g claude-flow@alpha

# Solution 2: Use full path in config
which npx
# Copy the path and use it in claude_desktop_config.json instead of just "npx"

# Solution 3: Check Node.js path
which node
# Make sure Node.js is accessible system-wide
```

---

## Runtime Issues ⚡

### Issue 6: "Error: Cannot find module" when running commands

**Cause:** Missing dependencies or corrupt installation

**Solutions:**
```bash
# Solution 1: Reinstall with dependencies
npm uninstall -g claude-flow
npm cache clean --force
npm install -g claude-flow@alpha

# Solution 2: Install missing dependencies manually
npm install -g typescript ts-node

# Solution 3: Check global modules
npm list -g --depth=0
```

### Issue 7: Commands run but show errors or unexpected output

**Cause:** Version conflicts or configuration issues

**Diagnostic:**
```bash
# Check versions
node --version  # Should be 18+
npm --version   # Should be 8+
npx claude-flow --version

# Check for multiple Node.js installations
which -a node
which -a npm
```

**Solutions:**
```bash
# Solution 1: Use Node Version Manager to ensure consistent versions
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
npm install -g claude-flow@alpha

# Solution 2: Clear all npm and Node.js caches
npm cache clean --force
sudo rm -rf ~/.npm
sudo rm -rf /usr/local/lib/node_modules
# Then reinstall Node.js and Claude-Flow
```

### Issue 8: Swarm initialization fails

**Cause:** Memory issues or system overload

**Diagnostic:**
```bash
# Check available memory
free -h

# Check running processes
ps aux | grep claude-flow
```

**Solutions:**
```bash
# Solution 1: Kill existing Claude-Flow processes
pkill -f claude-flow

# Solution 2: Start with fewer agents
npx claude-flow swarm init --topology mesh --max-agents 2

# Solution 3: Increase system resources
# Close unnecessary applications
# Add swap space (Linux):
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## Performance Issues 🐌

### Issue 9: Claude-Flow is very slow

**Cause:** System resources, network, or inefficient configuration

**Diagnostic:**
```bash
# Check system load
top
htop  # If available

# Check network connectivity
ping google.com

# Check Claude-Flow logs
npx claude-flow logs --tail 50
```

**Solutions:**
```bash
# Solution 1: Reduce agent count
npx claude-flow config set max-agents 3

# Solution 2: Enable performance mode
npx claude-flow config set performance-mode true

# Solution 3: Clear memory and caches
npx claude-flow cache clear
npx claude-flow memory clear --namespace temp

# Solution 4: Update to latest version
npm update -g claude-flow@alpha
```

### Issue 10: High CPU usage

**Cause:** Too many concurrent agents or infinite loops

**Solutions:**
```bash
# Solution 1: Check agent status
npx claude-flow swarm status

# Solution 2: Scale down active swarms
npx claude-flow swarm scale --agents 2

# Solution 3: Kill runaway processes
npx claude-flow swarm destroy --force

# Solution 4: Restart with resource limits
npx claude-flow config set cpu-limit 50
npx claude-flow config set memory-limit 2048
```

---

## Project-Specific Issues 📁

### Issue 11: "Project not initialized" errors

**Cause:** Working directory doesn't contain Claude-Flow project

**Solutions:**
```bash
# Solution 1: Initialize current directory
npx claude-flow init

# Solution 2: Navigate to correct project
cd ~/claude-flow-projects/my-project
npx claude-flow status

# Solution 3: Check project structure
ls -la .claude-flow/
# Should exist and contain config files
```

### Issue 12: File permissions errors

**Cause:** Incorrect file permissions in project directory

**Solutions:**
```bash
# Solution 1: Fix permissions for project directory
chmod -R 755 .
chmod 644 package.json

# Solution 2: Fix ownership
sudo chown -R $(whoami):$(whoami) .

# Solution 3: Check parent directory permissions
ls -ld ..
```

---

## Network and Connectivity Issues 🌐

### Issue 13: "Connection refused" or timeout errors

**Cause:** Firewall, proxy, or network connectivity issues

**Solutions:**
```bash
# Solution 1: Test basic connectivity
curl -I https://registry.npmjs.org/
ping claude.ai

# Solution 2: Configure proxy (if behind corporate firewall)
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# Solution 3: Disable strict SSL (less secure)
npm config set strict-ssl false

# Solution 4: Use different DNS
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
```

---

## Platform-Specific Issues 🖥️

### macOS Issues

```bash
# Issue: "cannot be opened because the developer cannot be verified"
sudo spctl --master-disable

# Issue: Homebrew permissions
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### Linux Issues

```bash
# Issue: Missing build tools
sudo apt install build-essential python3-dev

# Issue: Node.js version too old
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Windows WSL Issues

```powershell
# Issue: WSL not enabled
wsl --install

# Issue: Wrong WSL version
wsl --set-default-version 2

# Issue: Memory allocation
wsl --shutdown
# Edit %USERPROFILE%\.wslconfig:
[wsl2]
memory=4GB
```

---

## Getting Help 🆘

### Before Asking for Help

Gather this information:

```bash
# System info
uname -a
node --version
npm --version
npx claude-flow --version

# Error details
npx claude-flow logs --level error --tail 20

# Project status
npx claude-flow status --verbose
```

### Where to Get Help

1. **GitHub Issues:** https://github.com/ruvnet/claude-flow/issues
2. **Discord Community:** [Claude-Flow Discord]
3. **Documentation:** Built-in help with `npx claude-flow --help`

### How to Report Issues

Include:
- **Operating system and version**
- **Node.js and npm versions**
- **Complete error messages** (copy/paste, don't screenshot)
- **Steps to reproduce** the problem
- **What you expected to happen**

### Emergency Reset

If everything is broken:

```bash
# Nuclear option - complete reinstall
npm uninstall -g claude-flow
rm -rf ~/.npm
rm -rf ~/.claude-flow
sudo rm -rf /usr/local/lib/node_modules

# Reinstall everything
npm install -g claude-flow@alpha
cd ~/claude-flow-projects
npx claude-flow init
```

---

## Prevention Tips 🛡️

### Regular Maintenance
```bash
# Weekly maintenance
npm update -g claude-flow@alpha
npx claude-flow cache clean
npx claude-flow memory optimize

# Check system health
npx claude-flow health-check
```

### Best Practices
- Keep Node.js updated to LTS versions
- Don't run as root unless necessary
- Backup important projects regularly
- Monitor system resources
- Use version control (git) for all projects

### Monitoring Commands
```bash
# Monitor Claude-Flow processes
watch 'ps aux | grep claude-flow'

# Monitor system resources
watch 'free -h && df -h'

# Monitor logs in real-time
npx claude-flow logs --follow
```

Remember: Most issues are solvable! Don't hesitate to ask for help if you're stuck. 🚀