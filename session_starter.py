#!/usr/bin/env python3
"""
Session Starter Script for Learning Software Development Lab
Generates context-loading prompts for new Claude Code sessions with built-in evaluation.
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
    return max(log_files)  # Most recent file

def get_scenario_folder(scenario_num):
    """Map scenario number to folder name."""
    scenario_mapping = {
        1: "02_scenario_1_requirements_analysis",
        2: "03_scenario_2_design_architecture", 
        3: "04_scenario_3_implementation",
        4: "05_scenario_4_testing_qa",
        5: "06_scenario_5_deployment_cicd",
        6: "07_scenario_6_maintenance_monitoring"
    }
    return scenario_mapping.get(scenario_num, f"0{scenario_num+1}_scenario_{scenario_num}_unknown")

def generate_context_prompt(scenario_num):
    """Generate the context-loading prompt for Claude Code."""
    latest_log = find_latest_log()
    scenario_folder = get_scenario_folder(scenario_num)
    
    prompt = f"""Hi Claude Code! I need you to get up to speed on my learning project so we can start working on Scenario {scenario_num}. Please follow these steps to understand the context:

1. First, read my claude.md file to understand my learning methodology and project goals.

2. Next, read my README.md to understand the overall project structure.

3. Then read the most recent daily log at {latest_log} to see what we accomplished in the previous session.

4. Read the courses overview at learning-notes/01_courses.md to understand the Anthropic courses we're using.

5. Finally, read both files in learning-notes/{scenario_folder}/ - the README.md (for scenario overview) and session_plan.md (for what we're building today).

After reading these files, please:
- Confirm you understand the project goals and learning methodology
- Summarize what Scenario {scenario_num} is about
- Confirm the deliverables we're building today
- Answer these evaluation questions to verify your understanding:

EVALUATION QUESTIONS:
1. Quote the first learning principle from my README.md
2. What is the main SDLC phase for Scenario {scenario_num}?
3. What specific files will we create today (from the session plan)?
4. What is my top-down methodology approach?

The goal is to jump straight into hands-on prompt engineering and evaluation work. We're building working tools, not just discussing theory.

Ready to build?"""
    
    return prompt

def create_evaluation_rubric(scenario_num):
    """Create evaluation criteria for assessing Claude's context understanding."""
    rubric = f"""
EVALUATION RUBRIC for Scenario {scenario_num} Context Loading:

1. FILE READING (0-3 points):
   - 3: Quotes exact text from README.md learning principle
   - 2: Paraphrases the learning principle correctly
   - 1: Mentions learning principles but inaccurately
   - 0: Doesn't demonstrate reading README.md

2. SCENARIO UNDERSTANDING (0-3 points):
   - 3: Correctly identifies SDLC phase and main objectives
   - 2: Identifies most key aspects of the scenario
   - 1: Partial understanding with some gaps
   - 0: Misunderstands the scenario purpose

3. DELIVERABLES CLARITY (0-3 points):
   - 3: Lists specific files/outputs from session plan
   - 2: Understands general deliverables
   - 1: Vague understanding of what to build
   - 0: No clear grasp of deliverables

4. METHODOLOGY GRASP (0-3 points):
   - 3: Explains top-down methodology accurately
   - 2: Shows understanding of approach
   - 1: Partial grasp of methodology
   - 0: No demonstration of methodology understanding

TOTAL SCORE: ___/12

PASS THRESHOLD: 9/12 (75%)
- Score 9-12: Proceed with session
- Score 6-8: Review context, clarify gaps
- Score 0-5: Regenerate prompt, check file access
"""
    return rubric

def main():
    parser = argparse.ArgumentParser(description="Generate context prompt for Claude Code session")
    parser.add_argument("--scenario", "-s", type=int, required=True, 
                       help="Scenario number (1-6)")
    parser.add_argument("--eval", "-e", action="store_true", 
                       help="Show evaluation rubric")
    
    args = parser.parse_args()
    
    if args.scenario < 1 or args.scenario > 6:
        print("Error: Scenario must be between 1 and 6")
        return
    
    print("="*60)
    print(f"SESSION STARTER - SCENARIO {args.scenario}")
    print("="*60)
    
    # Generate and display the prompt
    prompt = generate_context_prompt(args.scenario)
    print("\nCONTEXT-LOADING PROMPT:")
    print("-" * 40)
    print(prompt)
    
    if args.eval:
        print("\n" + "="*60)
        rubric = create_evaluation_rubric(args.scenario)
        print("EVALUATION RUBRIC:")
        print("-" * 40)
        print(rubric)
    
    print("\n" + "="*60)
    print("USAGE INSTRUCTIONS:")
    print("1. Copy the prompt above and paste it to Claude Code")
    print("2. Wait for Claude's response")
    print("3. Use the evaluation rubric to score Claude's understanding")
    print("4. If score >= 9/12, proceed with session")
    print("5. If score < 9, address gaps before continuing")
    print("="*60)

if __name__ == "__main__":
    main()