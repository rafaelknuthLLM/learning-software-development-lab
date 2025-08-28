#!/usr/bin/env python3
"""
Prepare Jupyter notebooks for GitHub commit.

This script ensures notebooks are properly executed and formatted
for correct rendering on GitHub.

Usage:
    python notebook-prepare.py path/to/notebook.ipynb
    python notebook-prepare.py --all  # Process all notebooks
"""

import argparse
import subprocess
import sys
import json
from pathlib import Path


def validate_notebook_structure(notebook_path):
    """Validate notebook has required structure."""
    with open(notebook_path, 'r') as f:
        nb = json.load(f)
    
    issues = []
    
    # Check format version
    if 'nbformat' not in nb:
        issues.append("Missing nbformat version")
    
    # Check for kernel spec
    if 'metadata' not in nb or 'kernelspec' not in nb.get('metadata', {}):
        issues.append("Missing kernel specification")
    
    # Check for unexecuted code cells
    unexecuted = 0
    for i, cell in enumerate(nb.get('cells', [])):
        if cell.get('cell_type') == 'code':
            if cell.get('execution_count') is None:
                unexecuted += 1
    
    if unexecuted > 0:
        issues.append(f"{unexecuted} unexecuted code cells found")
    
    return issues


def execute_notebook(notebook_path):
    """Execute notebook using jupyter-nbconvert."""
    print(f"📓 Executing {notebook_path}...")
    
    cmd = [
        "jupyter-nbconvert",
        "--to", "notebook",
        "--execute",
        "--inplace",
        "--ExecutePreprocessor.timeout=60",
        str(notebook_path)
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(f"✅ Successfully executed {notebook_path}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error executing {notebook_path}:")
        print(e.stderr)
        return False
    except FileNotFoundError:
        print("❌ jupyter-nbconvert not found. Install with: pip install jupyter nbconvert")
        return False


def find_all_notebooks(root_path="."):
    """Find all notebook files in the repository."""
    root = Path(root_path)
    return list(root.glob("**/*.ipynb"))


def main():
    parser = argparse.ArgumentParser(description="Prepare Jupyter notebooks for commit")
    parser.add_argument("notebook", nargs="?", help="Path to notebook file")
    parser.add_argument("--all", action="store_true", help="Process all notebooks")
    parser.add_argument("--validate-only", action="store_true", help="Only validate, don't execute")
    
    args = parser.parse_args()
    
    if args.all:
        notebooks = find_all_notebooks()
        print(f"Found {len(notebooks)} notebooks")
    elif args.notebook:
        notebooks = [Path(args.notebook)]
    else:
        parser.print_help()
        sys.exit(1)
    
    failed = []
    
    for notebook_path in notebooks:
        if not notebook_path.exists():
            print(f"❌ File not found: {notebook_path}")
            failed.append(notebook_path)
            continue
        
        # Validate structure
        issues = validate_notebook_structure(notebook_path)
        if issues:
            print(f"⚠️  Issues found in {notebook_path}:")
            for issue in issues:
                print(f"   - {issue}")
        
        # Execute if not validate-only
        if not args.validate_only:
            if not execute_notebook(notebook_path):
                failed.append(notebook_path)
    
    # Summary
    print("\n" + "="*50)
    if failed:
        print(f"❌ {len(failed)} notebooks failed:")
        for nb in failed:
            print(f"   - {nb}")
        sys.exit(1)
    else:
        print(f"✅ All {len(notebooks)} notebooks ready for commit!")


if __name__ == "__main__":
    main()