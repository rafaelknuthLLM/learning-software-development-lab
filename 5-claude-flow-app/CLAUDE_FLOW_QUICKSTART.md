# Claude-Flow Quick Start & User Guide

This guide provides the exact steps to configure and run the Claude-Flow environment.

---

## Part 1: One-Time Setup

You should only need to perform this step once on your system.

### Step 1: Install the Global `claude` Tool

This command installs the main command-line application that is required to manage and interact with the Claude-Flow environment.

*   **Command:**
    ```bash
    npm install -g @anthropic-ai/claude-code
    ```

---

## Part 2: Project Configuration

These steps ensure your project is correctly configured to talk to the `claude` tool and to Supabase.

### Step 1: The `.env` Configuration File

The application needs a file named `.env` inside the `5-claude-flow-app/` directory to store your secret keys. This file must contain **both** your public project key and your secret account token.

Your `.env` file should look like this:
```
SUPABASE_URL="https://..."
SUPABASE_ANON_KEY="ey..."
SUPABASE_ACCESS_TOKEN="sbp_..."
```

*   **To get the secret `SUPABASE_ACCESS_TOKEN`:**
    1.  Go to [supabase.com/dashboard](https://supabase.com/dashboard) (make sure you are **not** inside a specific project).
    2.  Click your **profile icon** in the top-right corner.
    3.  Select **"Access Tokens"**.
    4.  Generate a new token. It will start with `sbp_`.

### Step 2: Register the Local Project

This command tells the main `claude` tool that this project folder is a Claude-Flow project it can control.

*   **Command:**
    ```bash
    claude mcp add claude-flow npx claude-flow@alpha mcp start
    ```
*   **Note:** If this command returns a message saying it "already exists," that's perfectly fine. It just means this step is already complete.

---

## Part 3: Daily Workflow - Running Claude-Flow

These are the steps you will use every time you want to interact with the system.

### Step 1: Navigate to the Application Directory

**This is a critical first step.** All commands must be run from inside the application directory.

*   **Command:**
    ```bash
    cd 5-claude-flow-app/
    ```

### Step 2: Verify the System is Running

This command asks the system to list all its available AI agent modes. It's a great way to check that everything is working.

*   **Command:**
    ```bash
    npx claude-flow sparc modes
    ```

### Step 3: Run a Mode

This is how you give a task to an AI agent.

*   **The Command Structure:**
    ```bash
    npx claude-flow sparc run <mode-name> "<your-task-in-plain-english>"
    ```

*   **Example Commands We Know Work:**

    *   **To ask a general question:**
        ```bash
        npx claude-flow sparc run ask "What is the purpose of the SPARC methodology?"
        ```

    *   **To have it plan a feature:**
        ```bash
        npx claude-flow sparc run spec-pseudocode "Create a 'Contact Us' form with Name, Email, and Message fields."
        ```

    *   **To have it perform a Supabase admin task:**
        ```bash
        npx claude-flow sparc run supabase-admin "List all tables in the database"
        ```