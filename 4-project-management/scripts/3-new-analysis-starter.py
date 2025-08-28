# Usage:
# python 4-project-management/scripts/3-new-analysis-starter.py <PROJECT_NAME>
#
# Example:
# python 4-project-management/scripts/3-new-analysis-starter.py CLAUDE-FLOW
#
# This script bootstraps a new project analysis by:
# 1. Creating a dedicated directory for the analysis.
# 2. Copying the project analysis template into the new directory.

import argparse
import os
import shutil

def main():
    parser = argparse.ArgumentParser(description='Bootstrap a new project analysis environment.')
    parser.add_argument('project_name', type=str, help='The name of the project to analyze (e.g., CLAUDE-FLOW).')
    args = parser.parse_args()

    project_name = args.project_name
    
    # Define paths
    template_path = os.path.abspath('4-project-management/docs/project_analysis_template.md')
    analysis_base_dir = os.path.abspath('2-learning-scenarios/01-requirements-discovery/analysis')
    project_analysis_dir = os.path.join(analysis_base_dir, project_name)
    destination_file_path = os.path.join(project_analysis_dir, f'{project_name}-analysis.md')

    # 1. Create the project-specific analysis directory
    try:
        os.makedirs(project_analysis_dir, exist_ok=True)
        print(f"Successfully created directory: {project_analysis_dir}")
    except OSError as e:
        print(f'Error creating directory {project_analysis_dir}: {e}')
        return

    # 2. Copy the template to the new directory
    try:
        shutil.copy(template_path, destination_file_path)
        print(f"Successfully copied template to: {destination_file_path}")
    except IOError as e:
        print(f'Error copying template file: {e}')
        return

    print("\nAnalysis environment for [" + project_name + "] is ready.")
    print("Next step: Start filling out the new analysis file at:")
    print(destination_file_path)

if __name__ == '__main__':
    main()