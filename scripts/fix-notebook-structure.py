#!/usr/bin/env python3
"""
Fix the structure of scenario1-deep-dive-analysis.ipynb
"""

import json

def fix_notebook():
    # Load notebook
    with open('scenario-based-learning/01-requirements-discovery/analysis/scenario1-deep-dive-analysis.ipynb', 'r') as f:
        nb = json.load(f)
    
    print("COMPREHENSIVE NOTEBOOK FIX")
    print("="*60)
    print(f"Original cells: {len(nb['cells'])}")
    
    # Identify all cells by their content
    cells_map = {}
    for i, cell in enumerate(nb['cells']):
        source = ''.join(cell.get('source', []))
        
        # Main sections
        if 'Scenario 1 Deep Dive Analysis - Iteration 1' in source:
            cells_map['title'] = i
        elif '## 1. Understanding Our Measurements' in source:
            cells_map['section1'] = i
        elif '## 2. Exploring the Core Patterns' in source:
            cells_map['section2'] = i
        elif '## 3. Looking for Relationships' in source:
            cells_map['section3'] = i
        elif '## Section 4: Business Impact' in source:
            cells_map['section4'] = i
        elif '## 5. Analysis Results' in source:
            cells_map['section5'] = i
        elif '## Executive Summary' in source:
            cells_map['exec_summary'] = i
            
        # Questions (both markdown and code)
        elif '### Question 1.1' in source:
            cells_map['q1.1_md'] = i
        elif 'Question 1.1' in source and 'calculate these percentages' in source and cell['cell_type'] == 'code':
            cells_map['q1.1_code'] = i
            
        elif '### Question 1.2' in source:
            cells_map['q1.2_md'] = i
        elif 'Phase 1: Understanding the Categorization Tool' in source:
            cells_map['q1.2_code1'] = i
        elif 'Phase 2: Identifying Multi-Purpose Files' in source:
            cells_map['q1.2_code2'] = i
            
        elif '### Question 1.3' in source:
            cells_map['q1.3_md'] = i
        elif 'Question 1.3: What time period' in source and cell['cell_type'] == 'code':
            cells_map['q1.3_code1'] = i
        elif 'Phase 4: Summary and Updated Hypotheses' in source:
            cells_map['q1.3_code2'] = i
            
        # Section 2 questions (need to find the actual code cells)
        elif 'Question 2.1: What specific onboarding' in source and cell['cell_type'] == 'code':
            cells_map['q2.1_code'] = i
        elif 'Question 2.2: What are the 6 core' in source and cell['cell_type'] == 'code':
            cells_map['q2.2_code'] = i
        elif 'Question 2.3: What type of education' in source and cell['cell_type'] == 'code':
            cells_map['q2.3_code'] = i
        elif '### Question 2.4' in source:
            cells_map['q2.4_md'] = i
        elif 'Question 2.4: What production patterns' in source and cell['cell_type'] == 'code':
            cells_map['q2.4_code'] = i
            
        # Section 3 questions
        elif '### Question 3.1' in source:
            cells_map['q3.1_md'] = i
        elif 'Question 3.1: Do certain onboarding' in source and cell['cell_type'] == 'code':
            cells_map['q3.1_code'] = i
        elif '### Question 3.2' in source:
            cells_map['q3.2_md'] = i
        elif 'Question 3.2: Is there a progression' in source and cell['cell_type'] == 'code':
            cells_map['q3.2_code'] = i
        elif '### Question 3.3' in source:
            cells_map['q3.3_md'] = i
        elif 'Question 3.3: Which categories generate' in source and cell['cell_type'] == 'code':
            cells_map['q3.3_code'] = i
            
        # Section 4 questions  
        elif '### Question 4.1' in source:
            cells_map['q4.1_md'] = i
        elif 'business_value_onboarding' in source and cell['cell_type'] == 'code':
            cells_map['q4.1_code'] = i
        elif '### Question 4.2' in source:
            cells_map['q4.2_md'] = i
        elif 'production_gap_cost' in source and cell['cell_type'] == 'code':
            cells_map['q4.2_code'] = i
        elif '### Question 4.3' in source:
            cells_map['q4.3_md'] = i
        elif 'roi_analysis' in source and cell['cell_type'] == 'code':
            cells_map['q4.3_code'] = i
            
        # Executive summary code
        elif 'executive_summary = {' in source:
            cells_map['exec_code'] = i
            
        # Placeholder cells to skip
        elif 'Code to analyze' in source and cell['cell_type'] == 'code':
            # These are placeholder cells, mark them for skipping
            pass
    
    print(f"\nFound {len(cells_map)} key cells")
    
    # Build the correct structure
    new_cells = []
    
    # 1. Title
    new_cells.append(nb['cells'][cells_map['title']])
    
    # 2. Section 1
    new_cells.append(nb['cells'][cells_map['section1']])
    if 'q1.1_md' in cells_map:
        new_cells.append(nb['cells'][cells_map['q1.1_md']])
    if 'q1.1_code' in cells_map:
        new_cells.append(nb['cells'][cells_map['q1.1_code']])
    if 'q1.2_md' in cells_map:
        new_cells.append(nb['cells'][cells_map['q1.2_md']])
    if 'q1.2_code1' in cells_map:
        new_cells.append(nb['cells'][cells_map['q1.2_code1']])
    if 'q1.2_code2' in cells_map:
        new_cells.append(nb['cells'][cells_map['q1.2_code2']])
    if 'q1.3_md' in cells_map:
        new_cells.append(nb['cells'][cells_map['q1.3_md']])
    if 'q1.3_code1' in cells_map:
        new_cells.append(nb['cells'][cells_map['q1.3_code1']])
    if 'q1.3_code2' in cells_map:
        new_cells.append(nb['cells'][cells_map['q1.3_code2']])
    
    # 3. Section 2
    new_cells.append(nb['cells'][cells_map['section2']])
    
    # Add markdown headers for Q2.1-2.3
    # Q2.1
    q21_header = {
        "cell_type": "markdown",
        "metadata": {},
        "source": ["### Question 2.1: What specific onboarding challenges appear in that 46%?\n\n",
                   "Let's identify the specific challenges users face when getting started."]
    }
    new_cells.append(q21_header)
    if 'q2.1_code' in cells_map:
        new_cells.append(nb['cells'][cells_map['q2.1_code']])
    
    # Q2.2
    q22_header = {
        "cell_type": "markdown",
        "metadata": {},
        "source": ["### Question 2.2: What are the 6 core user requirement categories?\n\n",
                   "Let's analyze the distribution and maturity of each category."]
    }
    new_cells.append(q22_header)
    if 'q2.2_code' in cells_map:
        new_cells.append(nb['cells'][cells_map['q2.2_code']])
    
    # Q2.3
    q23_header = {
        "cell_type": "markdown",
        "metadata": {},
        "source": ["### Question 2.3: What type of education dominates \"The Learning Crisis\"?\n\n",
                   "Let's break down the education content types."]
    }
    new_cells.append(q23_header)
    if 'q2.3_code' in cells_map:
        new_cells.append(nb['cells'][cells_map['q2.3_code']])
    
    # Q2.4
    if 'q2.4_md' in cells_map:
        new_cells.append(nb['cells'][cells_map['q2.4_md']])
    if 'q2.4_code' in cells_map:
        new_cells.append(nb['cells'][cells_map['q2.4_code']])
    
    # 4. Section 3
    new_cells.append(nb['cells'][cells_map['section3']])
    if 'q3.1_md' in cells_map:
        new_cells.append(nb['cells'][cells_map['q3.1_md']])
    if 'q3.1_code' in cells_map:
        new_cells.append(nb['cells'][cells_map['q3.1_code']])
    if 'q3.2_md' in cells_map:
        new_cells.append(nb['cells'][cells_map['q3.2_md']])
    if 'q3.2_code' in cells_map:
        new_cells.append(nb['cells'][cells_map['q3.2_code']])
    if 'q3.3_md' in cells_map:
        new_cells.append(nb['cells'][cells_map['q3.3_md']])
    if 'q3.3_code' in cells_map:
        new_cells.append(nb['cells'][cells_map['q3.3_code']])
    
    # 5. Section 4
    new_cells.append(nb['cells'][cells_map['section4']])
    if 'q4.1_md' in cells_map:
        new_cells.append(nb['cells'][cells_map['q4.1_md']])
    if 'q4.1_code' in cells_map:
        new_cells.append(nb['cells'][cells_map['q4.1_code']])
    if 'q4.2_md' in cells_map:
        new_cells.append(nb['cells'][cells_map['q4.2_md']])
    if 'q4.2_code' in cells_map:
        new_cells.append(nb['cells'][cells_map['q4.2_code']])
    if 'q4.3_md' in cells_map:
        new_cells.append(nb['cells'][cells_map['q4.3_md']])
    if 'q4.3_code' in cells_map:
        new_cells.append(nb['cells'][cells_map['q4.3_code']])
    
    # 6. Section 5
    if 'section5' in cells_map:
        new_cells.append(nb['cells'][cells_map['section5']])
    
    # 7. Executive Summary
    if 'exec_summary' in cells_map:
        new_cells.append(nb['cells'][cells_map['exec_summary']])
    if 'exec_code' in cells_map:
        new_cells.append(nb['cells'][cells_map['exec_code']])
    
    # Update notebook
    nb['cells'] = new_cells
    
    # Save
    with open('scenario-based-learning/01-requirements-discovery/analysis/scenario1-deep-dive-analysis.ipynb', 'w') as f:
        json.dump(nb, f, indent=1)
    
    print(f"\nFixed! New notebook has {len(new_cells)} cells")
    print("\nCorrect structure:")
    print("  1. Title")
    print("  2. Section 1 (Q1.1, Q1.2, Q1.3)")
    print("  3. Section 2 (Q2.1, Q2.2, Q2.3, Q2.4)")
    print("  4. Section 3 (Q3.1, Q3.2, Q3.3)")
    print("  5. Section 4 (Q4.1, Q4.2, Q4.3)")
    print("  6. Section 5")
    print("  7. Executive Summary")

if __name__ == "__main__":
    fix_notebook()