# Complete Troubleshooting Guide for Claude-Flow Development Stack

## 🚨 Emergency Quick Fixes

### System is Completely Broken
```bash
# Nuclear reset - use only when everything fails
cd ~/development
mv my-project my-project-backup
git clone https://github.com/username/my-project.git
cd my-project
npm install
npm run dev
```

### Can't Run Any Commands
```bash
# Check if PATH is corrupted
echo $PATH

# Reset PATH (add to ~/.bashrc or ~/.zshrc)
export PATH="/usr/local/bin:/usr/bin:/bin:$HOME/.npm-global/bin:$HOME/.local/bin:$PATH"

# Reload shell
source ~/.bashrc  # or ~/.zshrc
```

---

## 📊 Diagnostic Commands

### Health Check Everything
```bash
# System diagnostics
node --version && npm --version && git --version
claude doctor
npx claude-flow@alpha health --comprehensive
vercel --version
gh --version

# Project diagnostics
npm doctor
npm audit
npm run build  # Test build process
```

### Check All Environment Variables
```bash
# Display all environment variables (be careful - may show secrets!)
env | grep -E "(CLAUDE|ANTHROPIC|SUPABASE|VERCEL|GITHUB)"

# Safer check
echo "Claude API Key set: ${CLAUDE_API_KEY:+yes}"
echo "Supabase URL set: ${NEXT_PUBLIC_SUPABASE_URL:+yes}"
echo "Vercel token set: ${VERCEL_TOKEN:+yes}"
```

---

## 🔧 Tool-Specific Issues

### VS Code Problems

#### Extension Issues
```bash
# List installed extensions
code --list-extensions

# Disable all extensions temporarily
code --disable-extensions

# Reset VS Code settings
rm -rf ~/.vscode/extensions
# Then reinstall needed extensions
```

#### Terminal Problems
```bash
# VS Code terminal not working
# 1. Check terminal shell setting
# File → Preferences → Settings → Terminal → Integrated → Default Profile

# 2. Reset terminal
# Terminal menu → New Terminal
# Or Ctrl+Shift+`

# 3. If still broken, check shell PATH
echo $SHELL
which node npm git
```

### Claude Code Issues

#### Installation Problems
```bash
# Permission denied on install
# NEVER use sudo with npm!
# Fix npm permissions first:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Add to ~/.bashrc or ~/.zshrc permanently
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc

# Then reinstall
npm install -g @anthropic-ai/claude-code
```

#### Authentication Failures
```bash
# Clear authentication cache
rm -rf ~/.claude

# Check API key format
echo $ANTHROPIC_API_KEY | head -c 20
# Should start with 'sk-ant-api03-' for API keys

# Test authentication manually
curl -H "Authorization: Bearer $ANTHROPIC_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model": "claude-3-sonnet-20240229", "max_tokens": 10, "messages": [{"role": "user", "content": "test"}]}' \
     https://api.anthropic.com/v1/messages
```

#### Command Not Found
```bash
# Claude command not found
which claude
# If empty, add to PATH:
export PATH="$PATH:$(npm root -g)/@anthropic-ai/claude-code/bin"

# Or reinstall globally
npm uninstall -g @anthropic-ai/claude-code
npm install -g @anthropic-ai/claude-code
```

### Claude-Flow Issues

#### NPX Installation Fails
```bash
# Clear npm cache
npm cache clean --force

# Try different installation methods
# Method 1: Direct script
curl -fsSL https://raw.githubusercontent.com/ruvnet/claude-flow/main/install.sh | bash

# Method 2: Local installation
npm install claude-flow@alpha
npx claude-flow --help

# Method 3: Use different package manager
yarn global add claude-flow@alpha
# or
pnpm add -g claude-flow@alpha
```

#### MCP Server Connection Fails
```bash
# Check MCP server status
npx claude-flow@alpha mcp status

# Restart MCP server
npx claude-flow@alpha mcp stop
npx claude-flow@alpha mcp start --port 3001

# Test MCP tools
npx claude-flow@alpha mcp test --tool swarm_init

# Check for port conflicts
lsof -i :3000  # Default MCP port
# If busy, use different port:
npx claude-flow@alpha mcp start --port 3001
```

#### Swarm Initialization Fails
```bash
# Check swarm configuration
cat .claude-flow.json

# Reset swarm state
rm -rf .swarm/
rm -rf .claude-flow/

# Reinitialize
npx claude-flow@alpha init --force
npx claude-flow@alpha swarm init --topology mesh
```

#### Memory Issues
```bash
# Check memory usage
npx claude-flow@alpha memory stats

# Clear memory cache
npx claude-flow@alpha memory clear --cache

# Reduce memory usage
npx claude-flow@alpha config set memory.cacheSizeMB 128
npx claude-flow@alpha config set orchestrator.maxConcurrentAgents 5
```

### Supabase Issues

#### Connection Problems
```bash
# Test Supabase connection
curl -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
     -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
     "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/"

# Check environment variables
echo "URL: ${NEXT_PUBLIC_SUPABASE_URL}"
echo "Key: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:20}..."
```

#### Database Access Denied
```sql
-- Check RLS policies in Supabase dashboard
-- SQL Editor:
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Check current user
SELECT auth.uid(), auth.email();

-- Temporarily disable RLS for testing (ONLY for debugging!)
-- ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;
-- Remember to re-enable: ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
```

#### Authentication Issues
```javascript
// Debug authentication state
import { supabase } from '../lib/supabase'

// Check current session
supabase.auth.getSession().then(({ data: { session } }) => {
  console.log('Current session:', session)
})

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, session)
})
```

### Vercel Issues

#### Deployment Fails
```bash
# Check build locally first
npm run build
# Fix any build errors before deploying

# Check Vercel status
vercel --version
vercel whoami

# Check deployment logs
vercel logs <deployment-url>

# Redeploy specific deployment
vercel --prod
```

#### Environment Variables Not Working
```bash
# Pull environment variables locally
vercel env pull .env.local

# Check environment variables are set
vercel env ls

# Test locally with Vercel environment
vercel dev
```

#### Domain Issues
```bash
# Check domain configuration
vercel domains ls

# Check DNS propagation
dig your-domain.com
nslookup your-domain.com

# Test domain connection
curl -I https://your-domain.com
```

### GitHub Issues

#### Git Authentication Problems
```bash
# Check GitHub authentication
gh auth status

# Re-authenticate
gh auth logout
gh auth login

# Check SSH keys
ssh -T git@github.com
```

#### Actions Failing
```yaml
# Debug GitHub Actions
# Check workflow syntax:
# https://github.com/username/repo/actions

# Common fixes:
# 1. Check indentation in YAML files
# 2. Verify secret names match exactly
# 3. Check Node.js version compatibility

# Test workflow locally (using act)
# Install: https://github.com/nektos/act
act -n  # Dry run
act     # Run workflows locally
```

#### Repository Access Issues
```bash
# Check repository permissions
gh repo view username/repo

# Clone with HTTPS if SSH fails
git clone https://github.com/username/repo.git

# Update remote URL
git remote set-url origin https://github.com/username/repo.git
```

---

## 🐛 Common Error Messages and Solutions

### "Module not found" Errors
```bash
# Error: Cannot find module 'xyz'
# Solution 1: Install missing dependency
npm install xyz

# Solution 2: Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Solution 3: Check import paths
# Make sure relative paths are correct
# Use absolute imports if needed
```

### "Permission denied" Errors
```bash
# Error: EACCES: permission denied
# Solution 1: Fix npm permissions (NEVER use sudo!)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Solution 2: Check file permissions
chmod +x your-file
chmod 755 your-directory

# Solution 3: Check user ownership
ls -la
# If needed: chown -R $USER:$USER your-directory
```

### "Port already in use" Errors
```bash
# Error: EADDRINUSE: address already in use :::3000
# Solution 1: Kill process using port
lsof -ti:3000 | xargs kill -9

# Solution 2: Use different port
npm run dev -- --port 3001
# or
PORT=3001 npm run dev

# Solution 3: Find and kill specific process
ps aux | grep node
kill -9 <process-id>
```

### "API rate limit exceeded" Errors
```bash
# Claude API rate limits
# Solution 1: Wait for rate limit reset
# Solution 2: Use different API key
# Solution 3: Implement exponential backoff

# Check API usage
curl -H "Authorization: Bearer $ANTHROPIC_API_KEY" \
     https://api.anthropic.com/v1/usage
```

### "Network connection failed" Errors
```bash
# Solution 1: Check internet connection
ping google.com

# Solution 2: Check DNS
nslookup api.anthropic.com
nslookup github.com

# Solution 3: Check firewall/proxy settings
# May need to configure proxy for corporate networks
npm config set proxy http://proxy-server:port
npm config set https-proxy http://proxy-server:port
```

---

## 🚀 Performance Issues

### Slow Application Performance
```bash
# Check Node.js version
node --version
# Upgrade to latest LTS if old

# Monitor resource usage
top
htop  # If available

# Check memory usage
free -h  # Linux
vm_stat  # macOS

# Optimize Claude-Flow settings
npx claude-flow@alpha config set performance.cacheEnabled true
npx claude-flow@alpha config set orchestrator.maxConcurrentAgents 5
```

### Slow Build Times
```bash
# Clear all caches
npm run clean
rm -rf .next/ dist/ build/
npm cache clean --force

# Parallel builds
npm install --prefer-offline

# Use faster package manager
npm install -g pnpm
pnpm install  # Usually faster than npm

# Check for unnecessary dependencies
npm ls --depth=0
npx depcheck  # Find unused dependencies
```

### Database Performance Issues
```sql
-- Check slow queries in Supabase
-- Dashboard → Database → Logs

-- Add indexes for frequently queried columns
CREATE INDEX idx_user_email ON profiles(email);
CREATE INDEX idx_created_at ON posts(created_at DESC);

-- Check query performance
EXPLAIN ANALYZE SELECT * FROM your_table WHERE condition;
```

---

## 🔄 Recovery Procedures

### Complete Project Reset
```bash
# When everything is broken beyond repair
cd ~/development
cp -r my-project my-project-backup-$(date +%Y%m%d_%H%M%S)

# Clean slate approach
rm -rf my-project
git clone https://github.com/username/my-project.git
cd my-project

# Reinstall everything
rm -rf node_modules package-lock.json
npm install

# Restore environment variables
cp ../my-project-backup-*/env.local .env.local

# Test basic functionality
npm run dev
```

### Database Recovery
```sql
-- Backup data before recovery
-- In Supabase dashboard: Database → Backups

-- Reset RLS policies if broken
DROP POLICY IF EXISTS "policy_name" ON table_name;

-- Recreate basic policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

### Git Repository Recovery
```bash
# Lost local changes
git reflog  # Shows all recent commits
git checkout <commit-hash>  # Recover specific commit

# Corrupted local repository
rm -rf .git
git init
git remote add origin https://github.com/username/repo.git
git fetch
git checkout main

# Merge conflicts everywhere
git reset --hard origin/main  # DANGER: Loses local changes!
# Or
git stash  # Save local changes
git pull origin main
git stash pop  # Apply saved changes
```

---

## 🆘 Emergency Contacts and Resources

### When All Else Fails

#### Community Support
- **GitHub Issues:** Create detailed issue reports with error logs
- **Discord Communities:** Real-time help from community members
- **Stack Overflow:** Search existing solutions or ask questions
- **Reddit:** r/webdev, r/javascript, r/nextjs communities

#### Official Support
- **Anthropic Support:** https://support.anthropic.com
- **Supabase Support:** support@supabase.io
- **Vercel Support:** https://vercel.com/contact
- **GitHub Support:** https://support.github.com

#### Documentation Links
- **Claude Code Docs:** https://docs.anthropic.com/claude/docs/claude-code
- **Claude-Flow GitHub:** https://github.com/ruvnet/claude-flow
- **Supabase Docs:** https://supabase.com/docs
- **Vercel Docs:** https://vercel.com/docs

### Creating Effective Bug Reports

```markdown
## Bug Report Template

### Environment
- OS: [macOS 14.0 / Ubuntu 20.04 / Windows 11]
- Node.js: [version]
- npm: [version]
- Claude Code: [version]
- Claude-Flow: [version]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Steps to Reproduce
1. [First step]
2. [Second step]
3. [Error occurs]

### Error Messages
```
[Paste exact error messages here]
```

### Additional Context
[Screenshots, logs, configuration files]
```

---

## 🛡️ Prevention Best Practices

### Regular Maintenance
```bash
# Weekly maintenance script
#!/bin/bash
echo "Starting weekly maintenance..."

# Update all packages
npm update
npm audit fix

# Clean caches
npm cache clean --force
npx claude-flow@alpha cache clear

# Health checks
claude doctor
npx claude-flow@alpha health

# Backup important data
cp .env.local .env.local.backup
git stash push -m "Weekly backup $(date)"

echo "Maintenance complete!"
```

### Backup Strategy
```bash
# Daily automated backups
#!/bin/bash
BACKUP_DIR="$HOME/backups/$(date +%Y-%m-%d)"
mkdir -p "$BACKUP_DIR"

# Backup project files
cp -r . "$BACKUP_DIR/project"

# Backup environment
cp .env.local "$BACKUP_DIR/env"

# Backup database (if local)
# pg_dump your_db > "$BACKUP_DIR/database.sql"

# Clean old backups (keep 7 days)
find "$HOME/backups" -type d -mtime +7 -exec rm -rf {} +
```

### Monitoring Setup
```javascript
// Add to your application for proactive monitoring
const healthCheck = async () => {
  try {
    // Check database connection
    const { data, error } = await supabase.from('profiles').select('count')
    if (error) throw error

    // Check API endpoints
    const response = await fetch('/api/health')
    if (!response.ok) throw new Error('API unhealthy')

    console.log('Health check passed')
  } catch (error) {
    console.error('Health check failed:', error)
    // Send alert to monitoring service
  }
}

// Run every 5 minutes
setInterval(healthCheck, 5 * 60 * 1000)
```

Remember: **Most issues are caused by environment variable problems, authentication failures, or version mismatches.** Always check these first before diving into complex debugging!