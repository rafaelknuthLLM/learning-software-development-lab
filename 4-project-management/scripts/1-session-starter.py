#!/usr/bin/env python3
"""
Session Starter Script for Real-World Discovery Learning

CRITICAL: This script enforces incremental development with mandatory approval gates.
Every change requires human approval to prevent rushing to wrong solutions.

USAGE:
    python 1-session-starter.py --scenario 1    # Start Requirements Discovery
    python 1-session-starter.py -s 2            # Start Architecture Discovery
    python 1-session-starter.py --scenario 1 --model opus  # Use Opus 4.1
"""

import os
import argparse
from datetime import datetime
import glob
import json

def find_latest_log():
    """Find the most recent daily log file."""
    log_pattern = "logs/daily/202*-*-*-session-log.md"
    log_files = glob.glob(log_pattern)
    if not log_files:
        return "logs/daily/ (find latest)"
    return max(log_files)

def detect_current_progress():
    """Detect current analytical progress from latest log."""
    latest_log = find_latest_log()
    if not os.path.exists(latest_log):
        return "No previous progress detected"
    
    try:
        with open(latest_log, 'r') as f:
            content = f.read()
        
        # Check for progress indicators
        if "Question 1.1 Completed" in content:
            return "Question 1.1 completed - ready for Question 1.2"
        elif "Scenario 1" in content and "Deep Dive" in content:
            return "Scenario 1 deep dive analysis in progress"
        elif "Requirements Discovery" in content:
            return "Scenario 1 (Requirements Discovery) in progress"
        else:
            return "Session log found but progress unclear"
    except:
        return "Could not read progress from log file"

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

def get_model_commands(model_choice):
    """Generate Claude Code startup commands for different models."""
    commands = {
        'sonnet': {
            'name': 'Claude Sonnet 4 (Default)',
            'setup': [
                'cd /home/moin/learning-software-development-lab',
                'npm install -g @anthropic-ai/claude-code',
                'claude'
            ]
        },
        'opus': {
            'name': 'Claude Opus 4.1 (Advanced Reasoning)',
            'setup': [
                'cd /home/moin/learning-software-development-lab', 
                'npm install -g @anthropic-ai/claude-code',
                'claude --model claude-opus-4-1-20250805'
            ]
        }
    }
    return commands.get(model_choice, commands['sonnet'])

def generate_context_prompt(scenario_num, current_progress):
    """Generate context-loading prompt with current progress awareness."""
    latest_log = find_latest_log()
    scenario_name = get_scenario_name(scenario_num)
    
    # Add progress-specific instructions
    progress_context = ""
    if "Question 1.1 completed" in current_progress:
        progress_context = f"""
CURRENT STATUS: {current_progress}
5. Read scenario-based-learning/01-requirements-discovery/analysis/scenario1-deep-dive-analysis.ipynb to see completed analysis
6. You should be ready to continue with Question 1.2: "How did we handle multi-purpose files?"
"""
    elif "deep dive" in current_progress.lower():
        progress_context = f"""
CURRENT STATUS: {current_progress}
5. Read scenario-based-learning/01-requirements-discovery/analysis/scenario1-deep-dive-analysis.ipynb to see current analysis
6. Continue with the next analytical question in the sequence
"""
    
    prompt = f"""Hi Claude Code! I need you to understand my real-world discovery learning project.

CRITICAL RULES FIRST:
- You MUST get my approval before making ANY changes to files
- Work in tiny increments - one small change at a time
- Ask "Should I proceed?" before each step
- Speak clearly - no AI jargon, understandable to first-time repo visitors
- No bloat or redundancies in any communication

CONTEXT LOADING STEPS:
1. Read config/claude-config.md to understand my learning approach
2. Read README.md to understand the project purpose  
3. Read scenario-based-learning/scenarios_overview.md to understand the 6 discovery scenarios
4. Read {latest_log} to see previous progress{progress_context}

AFTER READING, ANSWER THESE VALIDATION QUESTIONS:
1. What is my learning approach? (Quote from config/claude-config.md)
2. How do I learn software development? (Explain the discovery method)
3. What is Scenario {scenario_num} about? (Name and focus)
4. What are the quality gates for discoveries? (Specific percentages)

COMMUNICATION REQUIREMENTS:
- Write like you're explaining to someone seeing my repo for the first time
- Use simple, clear language
- No "As an AI" or artificial phrasing
- Focus on practical next steps

INCREMENTAL WORK PROTOCOL:
- Propose ONE small action at a time
- Wait for my "yes" before proceeding
- If I say "no," ask clarifying questions
- Never build multiple things simultaneously

CURRENT SCENARIO: {scenario_name}

Ready to start with tiny, approved increments?"""
    
    return prompt

def create_evaluation_checklist(scenario_num):
    """Create validation checklist with scoring system for Claude's understanding."""
    scenario_name = get_scenario_name(scenario_num)
    
    checklist = f"""
VALIDATION SCORING - Scenario {scenario_num} (0-18 points):

□ Real-world discovery explanation (0-3 points):
  3 = Clearly explains exploring Anthropic's actual codebase like new team member
  2 = Understands real codebase focus but missing some details  
  1 = Partial understanding of discovery approach
  0 = Wrong or missing explanation

□ Scenario identification accuracy (0-3 points):
  3 = Correctly identifies as: {scenario_name}
  2 = Close but minor inaccuracies in scenario description
  1 = Partial understanding of scenario focus
  0 = Wrong scenario or missing identification

□ Quality gates knowledge (0-3 points):
  3 = Mentions specific percentages (80% coverage, 90% accuracy)
  2 = Understands quality gates concept but imprecise numbers
  1 = Vague reference to quality standards
  0 = No mention of quality gates

□ Incremental work understanding (0-3 points):
  3 = Explicitly commits to approval-before-action workflow
  2 = Understands incremental approach but less specific
  1 = Mentions working in steps but unclear on approval
  0 = No evidence of incremental understanding

□ Clear communication (0-3 points):
  3 = Simple language, no AI speak, first-timer friendly
  2 = Mostly clear with minor jargon
  1 = Some unclear or artificial phrasing
  0 = Heavy AI speak or confusing language

□ Approval gate compliance (0-3 points):
  3 = Explicitly asks "Should I proceed?" or similar before acting
  2 = Shows understanding but doesn't explicitly ask permission
  1 = Mentions needing approval but unclear commitment
  0 = No evidence of approval-seeking behavior

TOTAL SCORE: ___/18

PASS THRESHOLD: 15/18 (83%)
- Score 15-18: Approve Claude to begin incremental work
- Score 12-14: Address gaps before starting work  
- Score 0-11: Restart with clearer context loading

REMEMBER: The goal is preventing another "biggest fuckup" by ensuring
Claude truly understands the project and commits to working incrementally.
"""
    return checklist

def main():
    parser = argparse.ArgumentParser(description="Start discovery learning session with model selection")
    parser.add_argument("--scenario", "-s", type=int, required=True, 
                       help="Scenario number (1-6)")
    parser.add_argument("--model", "-m", choices=['sonnet', 'opus'], default='sonnet',
                       help="Claude model: 'sonnet' (default) or 'opus' (advanced reasoning)")
    
    args = parser.parse_args()
    
    if args.scenario < 1 or args.scenario > 6:
        print("Error: Scenario must be between 1 and 6")
        return
    
    scenario_name = get_scenario_name(args.scenario)
    current_progress = detect_current_progress()
    model_info = get_model_commands(args.model)
    
    print("="*60)
    print(f"SESSION STARTER - SCENARIO {args.scenario}")
    print(f"{scenario_name}")
    print(f"Model: {model_info['name']}")
    print("="*60)
    
    print(f"\nCURRENT PROGRESS: {current_progress}")
    
    print(f"\nCLAUDE CODE STARTUP COMMANDS:")
    print("-" * 40)
    for i, cmd in enumerate(model_info['setup'], 1):
        print(f"{i}. {cmd}")
    
    print(f"\nCONTEXT PROMPT (copy to Claude Code after startup):")
    print("-" * 40)
    prompt = generate_context_prompt(args.scenario, current_progress)
    print(prompt)
    
    print("\n" + "="*60)
    checklist = create_evaluation_checklist(args.scenario)
    print("VALIDATION CHECKLIST:")
    print("-" * 40)
    print(checklist)
    
    print("\nNEXT STEPS:")
    print("1. Run Claude Code startup commands above")
    print("2. Copy context prompt to new Claude Code session") 
    print("3. Validate Claude's understanding with checklist")
    print("4. Only proceed if validation score ≥15/18")
    print("5. Work incrementally with approval gates")
    print("="*60)

if __name__ == "__main__":
    main()