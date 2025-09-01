#!/usr/bin/env python3
"""
Session Starter Script for Real-World Discovery Learning

v2.0: This script generates a comprehensive briefing to provide the AI assistant
with deep context about the project's evolution and current state.
"""

import os
import argparse
from datetime import datetime
import glob
import json
import subprocess

def get_project_evolution():
    """Gets the last 5 git commits to show project evolution."""
    try:
        result = subprocess.run(
            ['git', 'log', '-n', '5', '--pretty=format:- %h %s (%cr)'] ,
            capture_output=True, text=True, check=True
        )
        return result.stdout.strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return "Could not retrieve git log. Is git installed and in a repo?"

def get_last_session_endpoint():
    """Finds the latest daily log and returns the last few lines."""
    try:
        log_dir = "4-project-management/logs-and-debriefs/daily/"
        list_of_files = glob.glob(os.path.join(log_dir, '*.md'))
        if not list_of_files:
            return "No daily logs found."
        
        latest_file = max(list_of_files, key=os.path.getctime)
        with open(latest_file, 'r') as f:
            lines = f.readlines()
        
        # Return the last 20 lines to get the session's end context
        return f"From: {os.path.basename(latest_file)}\n...\n{''.join(lines[-20:])}"
    except Exception as e:
        return f"Error reading logs: {e}"

def get_workspace_state(scenario_num):
    """Gets uncommitted git changes and recently modified files."""
    state_parts = []
    # Git status
    try:
        result = subprocess.run(
            ['git', 'status', '--porcelain'],
            capture_output=True, text=True, check=True
        )
        if result.stdout.strip():
            state_parts.append("**Uncommitted Changes:**\n" + result.stdout.strip())
        else:
            state_parts.append("**Uncommitted Changes:**\nClean workspace.")
    except (subprocess.CalledProcessError, FileNotFoundError):
        state_parts.append("**Uncommitted Changes:**\nCould not retrieve git status.")

    # Recently modified files in scenario
    try:
        scenario_path_pattern = f"2-learning-scenarios/{str(scenario_num).zfill(2)}-*"
        scenario_dirs = glob.glob(scenario_path_pattern)
        if scenario_dirs:
            scenario_dir = scenario_dirs[0]
            files = [os.path.join(dp, f) for dp, dn, fn in os.walk(scenario_dir) for f in fn]
            if files:
                files.sort(key=os.path.getmtime, reverse=True)
                recent_files_str = "\n".join([
                    f"- {os.path.basename(f)} (modified: {datetime.fromtimestamp(os.path.getmtime(f)).strftime('%Y-%m-%d %H:%M:%S')})"
                    for f in files[:3]
                ])
                state_parts.append("**Recently Modified Scenario Files:**\n" + recent_files_str)
    except Exception as e:
        state_parts.append(f"**Recently Modified Scenario Files:**\nCould not retrieve recent files: {e}")
        
    return "\n\n".join(state_parts)

def get_scenario_name(scenario_num):
    """Map scenario number to discovery focus."""
    scenarios = {
        1: "Requirements Discovery through Ecosystem Analysis",
        2: "Architecture Discovery through Pattern Analysis",
        3: "Implementation Discovery through Code Analysis",
        4: "Quality Discovery through Testing Analysis",
        5: "Deployment Discovery through DevOps Analysis",
        6: "Maintenance Discovery through Operations Analysis"
    }
    return scenarios.get(scenario_num, f"Unknown Scenario {scenario_num}")

def generate_context_prompt(scenario_num):
    """Generate the original context-loading prompt for the AI."""
    scenario_name = get_scenario_name(scenario_num)
    prompt = f"""CRITICAL RULES FIRST:
- You MUST get my approval before making ANY changes to files
- Work in tiny increments - one small change at a time
- Ask \"Should I proceed?\" before each step
- Speak clearly - no AI jargon, understandable to first-time repo visitors
- No bloat or redundancies in any communication

CONTEXT LOADING STEPS:
1. Read config/claude-config.md to understand my learning approach
2. Read README.md to understand the project purpose

AFTER READING, ANSWER THESE VALIDATION QUESTIONS:
1. What is my learning approach? (Quote from config/claude-config.md)
2. How do I learn software development? (Explain the discovery method)
3. What is Scenario {scenario_num} about? (Name and focus)
4. What are the quality gates for discoveries? (Specific percentages)

CURRENT SCENARIO: {scenario_name}

Ready to start with tiny, approved increments?"""
    return prompt

def main():
    parser = argparse.ArgumentParser(description="Start discovery learning session with a comprehensive briefing for the AI assistant.")
    parser.add_argument("--scenario", "-s", type=int, required=True, help="Scenario number (1-6)")
    args = parser.parse_args()

    if not 1 <= args.scenario <= 6:
        print("Error: Scenario must be between 1 and 6")
        return

    scenario_name = get_scenario_name(args.scenario)
    
    # --- GENERATE THE NEW COMPREHENSIVE BRIEFING ---
    print("# SESSION BRIEFING")
    print("\n## 1. Mission Context")
    print(f"- **Scenario:** {args.scenario} - {scenario_name}")
    print(f"- **Objective:** Systematically analyze the target ecosystem to discover and document its practices.")

    print("\n## 2. Project Evolution (Recent Commits)")
    print(get_project_evolution())

    print("\n## 3. Last Session Endpoint (from latest daily log)")
    print(get_last_session_endpoint())

    print("\n## 4. Current Workspace State")
    print(get_workspace_state(args.scenario))
    
    print("\n" + "="*60)
    print("AI ASSISTANT INSTRUCTIONS")
    print("="*60)
    print("\n**Your first task is to rephrase the 'SESSION BRIEFING' above in your own words to confirm you have a deep understanding of the project's evolution and current status. Then, await further instructions.**")

    # --- OLD CONTEXT FOR REFERENCE (can be removed later) ---
    # print("\nCONTEXT PROMPT (for reference):")
    # print("-" * 40)
    # print(generate_context_prompt(args.scenario))
    # print("-" * 40)


if __name__ == "__main__":
    main()
