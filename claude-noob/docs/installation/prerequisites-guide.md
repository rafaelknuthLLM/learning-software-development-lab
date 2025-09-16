# System Prerequisites for Claude-Flow

## Quick Prerequisites Check

Run these commands to verify your system is ready:

```bash
# Check all prerequisites at once
echo "=== System Check ==="
echo "OS: $(uname -s)"
echo "Node.js: $(node --version 2>/dev/null || echo 'NOT INSTALLED')"
echo "npm: $(npm --version 2>/dev/null || echo 'NOT INSTALLED')"
echo "Git: $(git --version 2>/dev/null || echo 'NOT INSTALLED')"
echo "Available space: $(df -h . | tail -1 | awk '{print $4}')"
echo "==================="
```

## Detailed Requirements

### Operating System Requirements

**✅ Supported:**
- macOS 10.15 (Catalina) or later
- Ubuntu 18.04 LTS or later
- Debian 10 or later
- CentOS 7 or later
- Windows 10/11 with WSL2

**❌ Not supported:**
- Windows without WSL2
- Very old Linux distributions
- 32-bit systems

### Node.js Requirements

**Minimum:** Node.js 18.0.0
**Recommended:** Node.js 20.x (LTS)

**Why this version?**
- Claude-Flow uses modern JavaScript features
- Earlier versions lack required APIs
- LTS versions are more stable

**Installation options:**
1. **Official installer:** https://nodejs.org/
2. **Package manager:** `brew install node` (macOS), `apt install nodejs npm` (Ubuntu)
3. **Version manager:** nvm (recommended for developers)

### Memory Requirements

**Minimum:** 4GB RAM
**Recommended:** 8GB+ RAM

**Why so much?**
- AI agents need memory to process
- Multiple agents run simultaneously
- Node.js applications are memory-intensive

### Disk Space Requirements

**Minimum:** 2GB free space
**Recommended:** 5GB+ free space

**Space usage breakdown:**
- Node.js and npm: ~500MB
- Claude-Flow: ~200MB
- Dependencies: ~800MB
- Project files and cache: ~500MB+

### Internet Connection

**Required:** Broadband internet connection
- Claude AI requires online access
- npm packages download from internet
- Some features need real-time communication

## Installation Verification Scripts

### macOS Verification
```bash
#!/bin/bash
echo "Checking macOS prerequisites..."

# Check macOS version
sw_vers

# Check if Homebrew is available
if command -v brew >/dev/null 2>&1; then
    echo "✅ Homebrew available"
else
    echo "❌ Homebrew not found - install from https://brew.sh"
fi

# Check Xcode Command Line Tools
if xcode-select -p >/dev/null 2>&1; then
    echo "✅ Xcode Command Line Tools installed"
else
    echo "❌ Install with: xcode-select --install"
fi
```

### Ubuntu/Debian Verification
```bash
#!/bin/bash
echo "Checking Linux prerequisites..."

# Check distribution
lsb_release -a

# Check package manager
if command -v apt >/dev/null 2>&1; then
    echo "✅ apt package manager available"
else
    echo "❌ apt not available - check your distribution"
fi

# Check essential build tools
if dpkg -l | grep -q build-essential; then
    echo "✅ Build tools installed"
else
    echo "❌ Install with: sudo apt install build-essential"
fi
```

### Windows WSL2 Verification
```powershell
# Run in PowerShell as Administrator
Write-Host "Checking Windows prerequisites..."

# Check Windows version
Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion

# Check WSL2
wsl --list --verbose

# Check if WSL2 is default
if ((wsl --list --verbose | Select-String "docker-desktop.*2") -or (wsl --list --verbose | Select-String "Ubuntu.*2")) {
    Write-Host "✅ WSL2 is available"
} else {
    Write-Host "❌ Install WSL2: wsl --install"
}
```

## Automated Setup Scripts

### One-Command Setup (macOS)
```bash
#!/bin/bash
# Complete setup for macOS
set -e

echo "🚀 Starting Claude-Flow setup for macOS..."

# Install Homebrew if needed
if ! command -v brew >/dev/null 2>&1; then
    echo "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install Node.js
echo "Installing Node.js..."
brew install node

# Install Claude-Flow
echo "Installing Claude-Flow..."
npm install -g claude-flow@alpha

# Verify installation
echo "Verifying installation..."
node --version
npm --version
npx claude-flow --version

echo "✅ Setup complete!"
```

### One-Command Setup (Ubuntu)
```bash
#!/bin/bash
# Complete setup for Ubuntu
set -e

echo "🚀 Starting Claude-Flow setup for Ubuntu..."

# Update package list
sudo apt update

# Install Node.js via NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install build tools
sudo apt-get install -y build-essential

# Install Claude-Flow
npm install -g claude-flow@alpha

# Verify installation
echo "Verifying installation..."
node --version
npm --version
npx claude-flow --version

echo "✅ Setup complete!"
```

## Troubleshooting Prerequisites

### Node.js Issues

**Problem:** "node: command not found"
**Solution:**
```bash
# Check if Node.js is in PATH
echo $PATH

# Manual installation location check
ls /usr/local/bin/node
ls /usr/bin/node

# Reinstall if needed
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
```

**Problem:** "Permission denied" when installing global packages
**Solution:**
```bash
# Configure npm to use different directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Memory Issues

**Problem:** System runs out of memory during installation
**Solution:**
```bash
# Check memory usage
free -h

# Add swap space if needed (Linux)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Network Issues

**Problem:** Downloads fail due to firewall/proxy
**Solution:**
```bash
# Configure npm proxy
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# Or bypass SSL (less secure)
npm config set strict-ssl false
```

## Validation Checklist

After following the prerequisites guide, verify:

- [ ] Operating system is supported
- [ ] Node.js 18+ is installed and working
- [ ] npm can install global packages
- [ ] Git is available for version control
- [ ] At least 2GB disk space available
- [ ] Internet connection is stable
- [ ] No proxy/firewall blocking npm
- [ ] Build tools are installed (if needed)

## Next Steps

Once prerequisites are satisfied:
1. Proceed to main installation guide
2. Install Claude Desktop application
3. Configure Claude-Flow integration
4. Run verification tests

## Getting Help with Prerequisites

**Common resources:**
- Node.js installation guide: https://nodejs.org/en/download/
- Git installation guide: https://git-scm.com/book/en/v2/Getting-Started-Installing-Git
- WSL2 setup guide: https://docs.microsoft.com/en-us/windows/wsl/install

**If stuck:**
Include this information when asking for help:
- Operating system and version
- Output of `node --version` and `npm --version`
- Error messages (complete text)
- What you were trying to do when the error occurred