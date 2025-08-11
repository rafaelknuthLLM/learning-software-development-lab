#!/usr/bin/env python3
"""
Session Starter Script for Real-World Discovery Learning

CRITICAL: This script enforces incremental development with mandatory approval gates.
Every change requires human approval to prevent rushing to wrong solutions.

USAGE:
    python session_starter.py --scenario 1    # Start Requirements Discovery
    python session_starter.py -s 2            # Start Architecture Discovery
"""

import os
import argparse
from datetime import datetime
import glob

def find_latest_log():
    """Find the most recent daily log file."""
    log_pattern = "daily-logs/202*-*-*-session-log.md"
    log_files = glob.glob(log_pattern)
    if not log_files:
        return "daily-logs/ (find latest)"
    return max(log_files)

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
    """Generate context-loading prompt with mandatory approval gates."""
    latest_log = find_latest_log()
    scenario_name = get_scenario_name(scenario_num)
    
    prompt = f"""Hi Claude Code! I need you to understand my real-world discovery learning project.

CRITICAL RULES FIRST:
- You MUST get my approval before making ANY changes to files
- Work in tiny increments - one small change at a time
- Ask "Should I proceed?" before each step
- Speak clearly - no AI jargon, understandable to first-time repo visitors
- No bloat or redundancies in any communication

CONTEXT LOADING STEPS:
1. Read claude.md to understand my learning approach
2. Read README.md to understand the project purpose  
3. Read scenario-based-learning/01_scenarios.md to understand the 6 discovery scenarios
4. Read {latest_log} to see previous progress

AFTER READING, ANSWER THESE VALIDATION QUESTIONS:
1. What is my learning approach? (Quote from claude.md)
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
    parser = argparse.ArgumentParser(description="Start discovery learning session")
    parser.add_argument("--scenario", "-s", type=int, required=True, 
                       help="Scenario number (1-6)")
    
    args = parser.parse_args()
    
    if args.scenario < 1 or args.scenario > 6:
        print("Error: Scenario must be between 1 and 6")
        return
    
    scenario_name = get_scenario_name(args.scenario)
    
    print("="*60)
    print(f"SESSION STARTER - SCENARIO {args.scenario}")
    print(f"{scenario_name}")
    print("="*60)
    
    prompt = generate_context_prompt(args.scenario)
    print("\nCONTEXT PROMPT (copy to Claude Code):")
    print("-" * 40)
    print(prompt)
    
    print("\n" + "="*60)
    checklist = create_evaluation_checklist(args.scenario)
    print("VALIDATION CHECKLIST:")
    print("-" * 40)
    print(checklist)
    
    print("\nNEXT STEPS:")
    print("1. Copy prompt above to Claude Code")
    print("2. Check all boxes in validation checklist")
    print("3. Only proceed if all boxes checked")
    print("4. Work incrementally with approval gates")
    print("="*60)

if __name__ == "__main__":
    main()