# Quick Claude-Flow Setup for Q&A Only

If you just want to ask Claude-Flow questions without building apps, this is the fastest setup path. Perfect for beginners who want to explore Claude-Flow's capabilities first!

## 🚀 **Quick Setup for Q&A Only**

### **Step 1: Install Claude-Flow**
```bash
npm install -g claude-flow@alpha
```

### **Step 2: Initialize Claude-Flow in any directory**
```bash
# Create a folder for your questions (optional)
mkdir claude-flow-questions
cd claude-flow-questions

# Initialize Claude-Flow
claude-flow init
```

### **Step 3: Add MCP Server to Claude Code**
```bash
# Add Claude-Flow as an MCP server
claude mcp add claude-flow npx claude-flow@alpha mcp start
```

### **Step 4: Start asking questions!**

**Option A: Direct Questions to Claude-Flow**
```bash
# Ask any question directly
claude-flow ask "How do I deploy a React app to Vercel?"

# Get SPARC methodology help
claude-flow sparc "Explain how to build a todo app"

# Research mode
claude-flow research "What's the difference between React and Vue?"
```

**Option B: Use Claude Code with Claude-Flow Integration**
```bash
# Just start Claude Code normally - it now has access to Claude-Flow
claude

# Then ask questions like:
# "Use Claude-Flow to research the best database for beginners"
# "Apply SPARC methodology to explain how authentication works"
```

## 🎯 **That's It!**

Once you run those 4 commands, you can:
- ✅ Ask Claude-Flow questions directly in terminal
- ✅ Use Claude Code with enhanced Claude-Flow capabilities
- ✅ Get SPARC-structured answers
- ✅ Access multi-agent research capabilities

**No project setup, no databases, no deployment needed** - just pure Q&A power! 🚀

## 💡 **Example Questions to Try**

```bash
# Technology comparisons
claude-flow ask "What's the difference between SQL and NoSQL databases?"

# Learning guidance
claude-flow sparc "How should I learn web development as a beginner?"

# Development concepts
claude-flow research "Explain REST APIs in simple terms"

# Career advice
claude-flow ask "What programming languages should I learn first?"
```

## 🔧 **Troubleshooting**

If something doesn't work:

1. **Check Claude Code is installed**: `claude --version`
2. **Verify Claude-Flow installation**: `claude-flow --version`
3. **Restart Claude Code**: Close and reopen your terminal, then run `claude`
4. **Check MCP server status**: `claude mcp list`

## 📚 **Next Steps**

When you're ready to build apps:
- Check out the **[Complete Setup Checklist](complete-setup-checklist.md)** for full development environment
- Try the **[First Project Walkthrough](../tutorials/first-project-walkthrough.md)** for hands-on practice
- Explore **[Advanced Configuration](advanced-configuration.md)** for power user features

---

*This setup gets you Claude-Flow's research and question-answering capabilities in under 5 minutes!*