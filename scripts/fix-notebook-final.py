#!/usr/bin/env python3
"""
Final comprehensive fix for the notebook structure
"""

import json

def fix_notebook_structure():
    # Load notebook
    with open('scenario-based-learning/01-requirements-discovery/analysis/scenario1-deep-dive-analysis.ipynb', 'r') as f:
        nb = json.load(f)
    
    print("FIXING NOTEBOOK STRUCTURE - FINAL")
    print("="*60)
    print(f"Original cells: {len(nb['cells'])}")
    
    # Categorize all cells
    cells_by_section = {
        'title': None,
        'section1': {'header': None, 'content': []},
        'section2': {'header': None, 'content': []},
        'section3': {'header': None, 'content': []},
        'section4': {'header': None, 'content': []},
        'section5': {'header': None, 'content': []},
        'exec_summary': {'header': None, 'content': []},
        'orphaned': []
    }
    
    # First pass - identify all cells
    for i, cell in enumerate(nb['cells']):
        source = ''.join(cell.get('source', []))
        cell_type = cell.get('cell_type')
        
        # Title
        if 'Scenario 1 Deep Dive Analysis - Iteration 1' in source:
            cells_by_section['title'] = i
            
        # Section headers
        elif '## 1. Understanding Our Measurements' in source:
            cells_by_section['section1']['header'] = i
        elif '## 2. Exploring the Core Patterns' in source:
            cells_by_section['section2']['header'] = i
        elif '## 3. Looking for Relationships' in source:
            cells_by_section['section3']['header'] = i
        elif '## Section 4: Business Impact' in source:
            cells_by_section['section4']['header'] = i
        elif '## 5. Analysis Results' in source:
            cells_by_section['section5']['header'] = i
        elif '## Executive Summary' in source:
            cells_by_section['exec_summary']['header'] = i
            
        # Section 1 questions
        elif 'Question 1.1' in source:
            cells_by_section['section1']['content'].append(i)
        elif 'Question 1.2' in source or 'Phase 1: Understanding' in source or 'Phase 2: Identifying' in source:
            cells_by_section['section1']['content'].append(i)
        elif 'Question 1.3' in source or 'Phase 4: Summary' in source:
            cells_by_section['section1']['content'].append(i)
            
        # Section 2 questions
        elif 'Question 2.1' in source or 'QUESTION 2.1' in source:
            cells_by_section['section2']['content'].append(i)
        elif 'Question 2.2' in source or 'QUESTION 2.2' in source:
            cells_by_section['section2']['content'].append(i)
        elif 'Question 2.3' in source or 'QUESTION 2.3' in source:
            cells_by_section['section2']['content'].append(i)
        elif 'Question 2.4' in source:
            cells_by_section['section2']['content'].append(i)
            
        # Section 3 questions
        elif 'Question 3.1' in source and 'challenge' in source.lower():
            cells_by_section['section3']['content'].append(i)
        elif 'Question 3.2' in source and 'progression' in source.lower():
            cells_by_section['section3']['content'].append(i)
        elif 'Question 3.3' in source and 'engagement' in source.lower():
            cells_by_section['section3']['content'].append(i)
            
        # Section 4 questions
        elif 'Question 4.1' in source or 'business_value_onboarding' in source:
            cells_by_section['section4']['content'].append(i)
        elif 'Question 4.2' in source or 'production_gap_cost' in source:
            cells_by_section['section4']['content'].append(i)
        elif 'Question 4.3' in source or 'roi_analysis' in source:
            cells_by_section['section4']['content'].append(i)
            
        # Section 5 content
        elif 'hypothesis_results' in source or 'Hypothesis Testing Results' in source:
            cells_by_section['section5']['content'].append(i)
        elif 'key_discoveries' in source or 'Key Discoveries' in source:
            cells_by_section['section5']['content'].append(i)
        elif 'recommendations' in source and 'IMMEDIATE' in source:
            cells_by_section['section5']['content'].append(i)
        elif 'future_investigations' in source or 'Areas for Future' in source:
            cells_by_section['section5']['content'].append(i)
            
        # Executive summary
        elif 'executive_summary = {' in source:
            cells_by_section['exec_summary']['content'].append(i)
            
    # Build the correctly ordered notebook
    new_cells = []
    
    # 1. Title
    if cells_by_section['title'] is not None:
        new_cells.append(nb['cells'][cells_by_section['title']])
        print("Added: Title")
    
    # 2. Section 1
    if cells_by_section['section1']['header'] is not None:
        new_cells.append(nb['cells'][cells_by_section['section1']['header']])
        # Sort section 1 content by cell index to maintain order
        for idx in sorted(cells_by_section['section1']['content']):
            new_cells.append(nb['cells'][idx])
        print(f"Added: Section 1 with {len(cells_by_section['section1']['content'])} cells")
    
    # 3. Section 2
    if cells_by_section['section2']['header'] is not None:
        new_cells.append(nb['cells'][cells_by_section['section2']['header']])
        for idx in sorted(cells_by_section['section2']['content']):
            new_cells.append(nb['cells'][idx])
        print(f"Added: Section 2 with {len(cells_by_section['section2']['content'])} cells")
    
    # 4. Section 3
    if cells_by_section['section3']['header'] is not None:
        new_cells.append(nb['cells'][cells_by_section['section3']['header']])
        for idx in sorted(cells_by_section['section3']['content']):
            new_cells.append(nb['cells'][idx])
        print(f"Added: Section 3 with {len(cells_by_section['section3']['content'])} cells")
    
    # 5. Section 4
    if cells_by_section['section4']['header'] is not None:
        new_cells.append(nb['cells'][cells_by_section['section4']['header']])
        for idx in sorted(cells_by_section['section4']['content']):
            new_cells.append(nb['cells'][idx])
        print(f"Added: Section 4 with {len(cells_by_section['section4']['content'])} cells")
    
    # 6. Section 5 - CREATE PROPER STRUCTURE
    # First, create a proper Section 5 header if missing
    section5_header = {
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 5. Analysis Results and Findings\n",
            "\n",
            "After completing our deep dive analysis, we can now test our hypotheses and document our key discoveries."
        ]
    }
    new_cells.append(section5_header)
    print("Added: Section 5 header")
    
    # Now add Section 5 content in correct order
    # Find and add in this specific order: hypothesis, discoveries, recommendations, future
    section5_order = []
    
    # Find cells by content type
    for idx in cells_by_section['section5']['content']:
        source = ''.join(nb['cells'][idx].get('source', []))
        if 'hypothesis_results' in source or 'Hypothesis Testing' in source:
            section5_order.append(('hypothesis', idx))
        elif 'key_discoveries' in source or 'Key Discoveries' in source:
            section5_order.append(('discoveries', idx))
        elif 'recommendations' in source and 'IMMEDIATE' in source:
            section5_order.append(('recommendations', idx))
        elif 'future_investigations' in source or 'Areas for Future' in source:
            section5_order.append(('future', idx))
    
    # Sort by type order
    type_order = {'hypothesis': 1, 'discoveries': 2, 'recommendations': 3, 'future': 4}
    section5_order.sort(key=lambda x: type_order.get(x[0], 99))
    
    for content_type, idx in section5_order:
        new_cells.append(nb['cells'][idx])
    print(f"Added: Section 5 content in correct order ({len(section5_order)} cells)")
    
    # 7. Executive Summary
    if cells_by_section['exec_summary']['header'] is not None:
        new_cells.append(nb['cells'][cells_by_section['exec_summary']['header']])
        for idx in cells_by_section['exec_summary']['content']:
            new_cells.append(nb['cells'][idx])
        print(f"Added: Executive Summary")
    
    # Update the notebook
    nb['cells'] = new_cells
    
    # Save
    with open('scenario-based-learning/01-requirements-discovery/analysis/scenario1-deep-dive-analysis.ipynb', 'w') as f:
        json.dump(nb, f, indent=1)
    
    print(f"\nFixed! New notebook has {len(new_cells)} cells")
    print("\nCorrect structure:")
    print("  1. Title")
    print("  2. Section 1: Understanding Our Measurements")
    print("  3. Section 2: Exploring the Core Patterns") 
    print("  4. Section 3: Looking for Relationships")
    print("  5. Section 4: Business Impact Assessment")
    print("  6. Section 5: Analysis Results and Findings")
    print("  7. Executive Summary")
    
    return len(new_cells)

if __name__ == "__main__":
    fix_notebook_structure()