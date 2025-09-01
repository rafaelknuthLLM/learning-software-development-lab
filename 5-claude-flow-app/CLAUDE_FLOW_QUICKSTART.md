### Claude-Flow Quick Start Guide

Here are the exact commands you'll need to run in a fresh instance to get to our current, working state:

**Step 1: Install the Global `claude` Tool**

This command installs the main command-line tool required to manage and interact with the Claude-Flow environment. You only need to do this once per system.

*   **Command:**
    ```bash
    npm install -g @anthropic-ai/claude-code
    ```

**Step 2: Configure the Local Project**

This command registers your local project folder with the `claude` tool.

*   **Command:**
    ```bash
    claude mcp add claude-flow npx claude-flow@alpha mcp start
    ```
*   **Note:** If this command returns a message saying it "already exists," that's perfectly fine. It just means this step was already completed and you can proceed.

**Step 3: Verify Claude-Flow is Running**

This command is the final check. It communicates with the Claude-Flow system and asks it to list all of its available modes. If it returns a list (like "Architect", "Tester", etc.), you are up and running.

*   **Command:**
    ```bash
    npx claude-flow sparc modes
    ```
