#!/usr/bin/env python3
"""
Session Finish Script for Learning Retrospectives

Evaluates session work, captures lessons learned, and updates documentation.
Follows DevOps best practices for continuous improvement.

USAGE:
    python session_finish.py --scenario 1    # Finish Requirements Discovery session
"""

import os
import argparse
from datetime import datetime
import glob

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

def generate_retrospective_prompt(scenario_num):
    """Generate retrospective evaluation prompt."""
    scenario_name = get_scenario_name(scenario_num)
    today = datetime.now().strftime("%Y-%m-%d")
    
    prompt = f"""Session Retrospective - {scenario_name}

RETROSPECTIVE EVALUATION:

1. INCREMENTAL APPROACH ASSESSMENT:
   - Did we work in small, approved increments?
   - Were approval gates respected?
   - Any rushed decisions or big-bang attempts?

2. DELIVERABLES QUALITY CHECK:
   - What did we create today?
   - Does it meet quality gates (80% coverage, 90% accuracy)?
   - Is it ready for community validation?

3. LEARNING OUTCOMES:
   - What did I discover about Anthropic's codebase?
   - What patterns or insights emerged?
   - How does this advance Scenario {scenario_num}?

4. PROCESS IMPROVEMENTS:
   - What worked well in our collaboration?
   - What should we change for next session?
   - Any communication issues to address?

5. NEXT SESSION PREPARATION:
   - What should we tackle next?
   - Any blockers or dependencies?
   - Community feedback needed?

Please help me document today's session by:
- Creating structured daily log entry for {today}
- Highlighting key discoveries and lessons learned
- Identifying specific improvements for next session
- Noting any quality gates achieved

Ready to complete our session retrospective?"""
    
    return prompt

def create_daily_log_template():
    """Create template for daily log entry."""
    today = datetime.now().strftime("%Y-%m-%d")
    
    template = f"""
DAILY LOG TEMPLATE - {today}:

# Session Log: {today}

## Scenario Focus
[Scenario number and name]

## What We Accomplished
- [Specific deliverable 1]
- [Specific deliverable 2]
- [Key discovery or insight]

## Quality Gates Status
- [ ] Community validation needed
- [ ] 80% coverage achieved
- [ ] 90% accuracy validated
- [ ] Documentation updated

## Lessons Learned
- **What Worked:** [Process improvements that worked]
- **What Didn't:** [Issues encountered]
- **Next Time:** [Improvements for future sessions]

## Next Session Plan
- [Specific next steps]
- [Any blockers to address]
- [Community feedback to gather]

## Incremental Development Assessment
- Approval gates respected: [Yes/No]
- Rushed decisions avoided: [Yes/No]
- Small increments maintained: [Yes/No]
"""
    return template

def main():
    parser = argparse.ArgumentParser(description="Finish discovery learning session")
    parser.add_argument("--scenario", "-s", type=int, required=True, 
                       help="Scenario number (1-6)")
    
    args = parser.parse_args()
    
    if args.scenario < 1 or args.scenario > 6:
        print("Error: Scenario must be between 1 and 6")
        return
    
    scenario_name = get_scenario_name(args.scenario)
    
    print("="*60)
    print(f"SESSION FINISH - SCENARIO {args.scenario}")
    print(f"{scenario_name}")
    print("="*60)
    
    prompt = generate_retrospective_prompt(args.scenario)
    print("\nRETROSPECTIVE PROMPT (copy to Claude Code):")
    print("-" * 40)
    print(prompt)
    
    template = create_daily_log_template()
    print("\n" + "="*60)
    print("DAILY LOG TEMPLATE:")
    print("-" * 40)
    print(template)
    
    print("\nSESSION COMPLETION STEPS:")
    print("1. Copy retrospective prompt to Claude Code")
    print("2. Complete session evaluation together")
    print("3. Update daily log with structured findings")
    print("4. Commit all changes to git")
    print("5. Plan next session priorities")
    print("="*60)

if __name__ == "__main__":
    main()