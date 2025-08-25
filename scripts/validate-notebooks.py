#!/usr/bin/env python3
"""
Validate all Jupyter notebooks in the repository.

This script checks for common issues that prevent proper
rendering on GitHub.

Usage:
    python validate-notebooks.py
"""

import json
import sys
from pathlib import Path


def validate_notebook(notebook_path):
    """Validate a single notebook."""
    with open(notebook_path, 'r') as f:
        try:
            nb = json.load(f)
        except json.JSONDecodeError as e:
            return [f"Invalid JSON: {e}"]
    
    issues = []
    
    # Check notebook format
    if 'nbformat' not in nb:
        issues.append("Missing nbformat")
    elif nb['nbformat'] < 4:
        issues.append(f"Old notebook format: {nb['nbformat']}")
    
    # Check metadata
    if 'metadata' not in nb:
        issues.append("Missing metadata")
    else:
        if 'kernelspec' not in nb['metadata']:
            issues.append("Missing kernelspec")
        if 'language_info' not in nb['metadata']:
            issues.append("Missing language_info")
    
    # Check cells
    if 'cells' not in nb:
        issues.append("No cells found")
    else:
        code_cells = [c for c in nb['cells'] if c.get('cell_type') == 'code']
        
        # Check for unexecuted cells
        unexecuted = [i for i, c in enumerate(code_cells) 
                      if c.get('execution_count') is None]
        if unexecuted:
            issues.append(f"{len(unexecuted)} unexecuted code cells")
        
        # Check for cells without outputs
        no_output = [i for i, c in enumerate(code_cells) 
                     if not c.get('outputs')]
        if no_output:
            issues.append(f"{len(no_output)} code cells without outputs")
        
        # Check for cells with errors
        error_cells = []
        for i, cell in enumerate(code_cells):
            for output in cell.get('outputs', []):
                if output.get('output_type') == 'error':
                    error_cells.append(i)
                    break
        if error_cells:
            issues.append(f"{len(error_cells)} cells with error outputs")
    
    return issues


def find_all_notebooks(root_path="."):
    """Find all notebook files."""
    root = Path(root_path)
    # Exclude hidden directories and common build directories
    notebooks = []
    for nb in root.glob("**/*.ipynb"):
        # Skip checkpoint files
        if ".ipynb_checkpoints" in str(nb):
            continue
        notebooks.append(nb)
    return notebooks


def main():
    print("🔍 Validating Jupyter notebooks...")
    print("="*50)
    
    notebooks = find_all_notebooks()
    print(f"Found {len(notebooks)} notebooks\n")
    
    all_valid = True
    results = {}
    
    for notebook_path in notebooks:
        issues = validate_notebook(notebook_path)
        results[notebook_path] = issues
        
        if issues:
            all_valid = False
            print(f"❌ {notebook_path}")
            for issue in issues:
                print(f"   - {issue}")
        else:
            print(f"✅ {notebook_path}")
    
    # Summary
    print("\n" + "="*50)
    valid_count = sum(1 for issues in results.values() if not issues)
    print(f"Results: {valid_count}/{len(notebooks)} notebooks valid")
    
    if not all_valid:
        print("\n💡 To fix issues, run:")
        print("   python scripts/notebook-prepare.py --all")
        sys.exit(1)
    else:
        print("\n✅ All notebooks are valid!")


if __name__ == "__main__":
    main()