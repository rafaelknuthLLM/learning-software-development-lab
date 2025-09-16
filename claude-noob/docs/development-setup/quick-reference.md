# Quick Reference Guide - Claude-Flow Development Stack

## 🚀 Essential Commands Cheat Sheet

### VS Code Quick Actions
```bash
# Open project in VS Code
code .
code path/to/project

# Command palette
Ctrl+Shift+P  # Windows/Linux
Cmd+Shift+P   # macOS

# Claude Code integration
Ctrl+Esc      # Windows/Linux
Cmd+Esc       # macOS

# Terminal
Ctrl+`        # Open integrated terminal
Ctrl+Shift+`  # New terminal
```

### Claude Code Commands
```bash
# Basic usage
claude                    # Start Claude in current directory
claude --help            # Show help
claude doctor            # System diagnostics

# Project initialization
claude                    # First run in project (triggers auth)
/init                     # Generate project documentation
/config                   # Configuration settings

# Authentication
claude auth login         # Login with subscription
claude auth logout        # Logout
claude auth status        # Check authentication status
```

### Claude-Flow Commands
```bash
# Installation and setup
npx claude-flow@alpha --help
npx claude-flow@alpha init --force
npx claude-flow@alpha version
npx claude-flow@alpha health

# Agent and swarm management
npx claude-flow@alpha agents list
npx claude-flow@alpha swarm "task description"
npx claude-flow@alpha swarm status

# SPARC methodology
npx claude-flow@alpha sparc modes
npx claude-flow@alpha sparc run architect "description"
npx claude-flow@alpha sparc run code "description"
npx claude-flow@alpha sparc tdd "feature name"
npx claude-flow@alpha sparc pipeline "project description"

# MCP integration
npx claude-flow@alpha mcp start
npx claude-flow@alpha mcp status
npx claude-flow@alpha mcp tools --list

# Performance and monitoring
npx claude-flow@alpha performance report
npx claude-flow@alpha memory stats
npx claude-flow@alpha diagnostics
```

### Git Commands
```bash
# Repository setup
git init
git remote add origin https://github.com/user/repo.git
git branch -M main
git push -u origin main

# Daily workflow
git status
git add .
git add -A              # Stage all changes including deletions
git commit -m "message"
git push
git pull

# Branch management
git checkout -b feature/branch-name
git checkout main
git merge feature/branch-name
git branch -d feature/branch-name

# Emergency commands
git stash               # Save work temporarily
git stash pop           # Restore stashed work
git reset --hard HEAD   # Discard all changes (DANGER!)
git reflog              # Show command history
```

### GitHub CLI Commands
```bash
# Authentication
gh auth login
gh auth status

# Repository management
gh repo create project-name --public
gh repo clone user/repo
gh repo view

# Pull requests
gh pr create
gh pr list
gh pr merge

# Issues
gh issue create
gh issue list
gh issue view 1
```

### Supabase Commands
```bash
# CLI installation (optional)
npm install -g supabase

# Project management (via CLI)
supabase login
supabase init
supabase start          # Start local development
supabase stop           # Stop local development

# Database management
supabase db pull        # Pull schema from remote
supabase db push        # Push schema to remote
supabase db reset       # Reset local database

# Generate types
supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

### Vercel Commands
```bash
# Authentication
vercel login
vercel whoami

# Deployment
vercel                  # Deploy to preview
vercel --prod           # Deploy to production
vercel --prebuilt       # Deploy pre-built application

# Environment variables
vercel env              # Interactive environment variable management
vercel env pull         # Pull environment variables to .env.local
vercel env add          # Add environment variable
vercel env rm           # Remove environment variable

# Project management
vercel projects list
vercel domains add domain.com
vercel certs issue domain.com

# Logs and debugging
vercel logs <deployment-url>
vercel inspect <deployment-url>
```

### NPM Commands
```bash
# Package management
npm install             # Install all dependencies
npm install package     # Install specific package
npm install -g package  # Install globally
npm uninstall package   # Remove package
npm update              # Update all packages
npm outdated            # Check for outdated packages

# Scripts
npm run dev             # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm test                # Run tests
npm run lint            # Run linter

# Diagnostics
npm doctor              # Check npm environment
npm audit               # Check for vulnerabilities
npm audit fix           # Fix vulnerabilities
npm cache clean --force # Clear cache
```

---

## 🔧 Configuration Files Reference

### package.json Template
```json
{
  "name": "my-claude-flow-app",
  "version": "1.0.0",
  "description": "A Claude-Flow powered application",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@supabase/supabase-js": "^2.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "typescript": "^5.0.0"
  }
}
```

### .env.local Template
```env
# Claude-Flow Configuration
CLAUDE_API_KEY=sk-ant-api03-...
ANTHROPIC_API_KEY=sk-ant-api03-...

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR...

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Optional: Additional services
OPENAI_API_KEY=sk-...
GITHUB_TOKEN=ghp_...
VERCEL_TOKEN=...
```

### .gitignore Template
```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Production
.next/
out/
build/
dist/

# Environment variables
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
.env
*.log
*.pid
*.seed

# Coverage
coverage/
.nyc_output

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Claude-Flow specific
.claude-flow/
.swarm/
.hive-mind/
claude-flow.log

# Supabase
supabase/.temp/
```

### .claude-flow.json Template
```json
{
  "orchestrator": {
    "maxConcurrentAgents": 10,
    "defaultTopology": "mesh",
    "autoScaling": true
  },
  "memory": {
    "backend": "sqlite",
    "cacheSizeMB": 256,
    "compressionEnabled": true
  },
  "providers": {
    "anthropic": {
      "model": "claude-3-sonnet",
      "temperature": 0.7,
      "maxTokens": 4096
    }
  },
  "agents": {
    "defaultAgent": "coder",
    "agentProfiles": {
      "development": ["coder", "reviewer", "tester"],
      "fullstack": ["architect", "backend-dev", "frontend-dev"]
    }
  }
}
```

### vercel.json Template
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "regions": ["sfo1"],
  "functions": {
    "pages/api/**.js": {
      "maxDuration": 30
    }
  }
}
```

---

## 🔗 Important URLs and Resources

### Official Documentation
- **Claude Code:** https://docs.anthropic.com/claude/docs/claude-code
- **Claude-Flow:** https://github.com/ruvnet/claude-flow
- **Supabase:** https://supabase.com/docs
- **Vercel:** https://vercel.com/docs
- **Next.js:** https://nextjs.org/docs
- **React:** https://react.dev

### Dashboards and Consoles
- **Anthropic Console:** https://console.anthropic.com
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub:** https://github.com
- **npm:** https://www.npmjs.com

### Community and Support
- **Claude-Flow Discord:** (Check repository for invite)
- **Supabase Discord:** https://discord.supabase.com
- **Vercel Discord:** https://vercel.com/discord
- **Stack Overflow:** https://stackoverflow.com
- **Reddit Web Dev:** https://reddit.com/r/webdev

---

## 🚨 Emergency Commands

### System Recovery
```bash
# Reset npm permissions (NEVER use sudo!)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Clear all caches
npm cache clean --force
npx claude-flow@alpha cache clear

# Kill hanging processes
pkill -f node
pkill -f claude-flow

# Reset git repository
git reset --hard HEAD
git clean -fd
```

### Project Recovery
```bash
# Nuclear reset (last resort)
rm -rf node_modules package-lock.json
npm install

# Restore environment
cp .env.example .env.local
# Edit .env.local with your actual values

# Test basic functionality
npm run build
npm run dev
```

### Database Recovery
```sql
-- In Supabase SQL Editor
-- Check RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Reset policies if needed
DROP POLICY IF EXISTS "policy_name" ON table_name;
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Basic policies
CREATE POLICY "Users can access own data"
ON table_name FOR ALL
USING (auth.uid() = user_id);
```

---

## 📊 Status Checking Commands

### Health Check Everything
```bash
# System health
node --version && npm --version && git --version

# Claude Code
claude doctor

# Claude-Flow
npx claude-flow@alpha health --comprehensive

# Supabase (test connection)
curl -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/"

# Vercel
vercel whoami

# GitHub
gh auth status

# Project health
npm audit
npm outdated
npm run build  # Test if build works
```

### Environment Variables Check
```bash
# Safe check (doesn't reveal secrets)
echo "Claude API Key: ${CLAUDE_API_KEY:+✓ Set}"
echo "Supabase URL: ${NEXT_PUBLIC_SUPABASE_URL:+✓ Set}"
echo "Supabase Key: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:+✓ Set}"
echo "Vercel Token: ${VERCEL_TOKEN:+✓ Set}"
```

---

## 🎯 Common Task Shortcuts

### Starting New Project
```bash
# Complete project setup in one go
gh repo create my-new-project --public --clone
cd my-new-project
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
npx claude-flow@alpha init --force
npm install @supabase/supabase-js
cp .env.local.example .env.local
# Edit .env.local with your credentials
git add . && git commit -m "Initial project setup" && git push
```

### Quick Deploy
```bash
# Test, build, and deploy
npm test && npm run build && vercel --prod
```

### Quick Feature Branch
```bash
# Create feature branch and push
git checkout -b feature/awesome-feature
git add . && git commit -m "feat: add awesome feature"
git push -u origin feature/awesome-feature
gh pr create --title "Add awesome feature" --body "Description of the feature"
```

### Quick Database Query Test
```javascript
// Test in browser console or Node.js
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const { data, error } = await supabase.from('your_table').select('*').limit(1)
console.log('Test result:', { data, error })
```

---

## 📱 Mobile and Responsive Development

### Responsive Design Testing
```bash
# Test different screen sizes in Chrome DevTools
# F12 → Toggle device toolbar (Ctrl+Shift+M)

# Common breakpoints (Tailwind CSS)
# sm: 640px
# md: 768px
# lg: 1024px
# xl: 1280px
# 2xl: 1536px
```

### Mobile-First CSS Classes (Tailwind)
```html
<!-- Mobile first, then larger screens -->
<div class="text-sm md:text-base lg:text-lg">
<div class="p-4 md:p-6 lg:p-8">
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

---

## 🔐 Security Quick Checks

### Environment Security
```bash
# Check for exposed secrets
grep -r "sk-" . --exclude-dir=node_modules
grep -r "api" . --exclude-dir=node_modules | grep -i key

# Audit packages
npm audit
npm audit fix
```

### Supabase Security
```sql
-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false;

-- Review policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
```

Remember: **Keep this guide bookmarked** for quick access during development! 🚀