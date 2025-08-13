#!/usr/bin/env python3
"""
Ecosystem Categorizer Tool
Automatically categorizes Anthropic's ecosystem components by user requirements.

This tool analyzes Anthropic's codebase structure and categorizes components 
based on the user needs they address, helping new team members understand
the ecosystem organization.
"""

import os
import json
from pathlib import Path
from typing import Dict, List, Set
import anthropic

class EcosystemCategorizer:
    def __init__(self, api_key: str = None):
        """Initialize categorizer with Anthropic API client"""
        self.client = anthropic.Anthropic(api_key=api_key or os.getenv("ANTHROPIC_API_KEY"))
        
        # Categories based on requirements analysis
        self.categories = {
            "developer_onboarding": {
                "description": "Learning materials and educational content",
                "keywords": ["course", "tutorial", "fundamentals", "getting_started", "README", "guide"]
            },
            "integration_tools": {
                "description": "Tools for integrating Claude with external systems",
                "keywords": ["tool_use", "api", "sdk", "client", "integration", "third_party"]
            },
            "production_patterns": {
                "description": "Production-ready patterns and best practices",
                "keywords": ["real_world", "evaluation", "classification", "rag", "patterns"]
            },
            "multimodal_capabilities": {
                "description": "Vision and document processing features",
                "keywords": ["multimodal", "vision", "image", "document", "pdf", "transcribe"]
            },
            "automation_workflows": {
                "description": "Tools for automating complex business processes",
                "keywords": ["workflow", "agent", "customer_service", "batch", "automation"]
            },
            "quality_assurance": {
                "description": "Testing, evaluation, and quality measurement tools",
                "keywords": ["evaluation", "test", "prompt_evaluations", "building_evals", "quality"]
            }
        }
        
        self.results = {}
    
    def scan_directory(self, base_path: str) -> Dict[str, List[str]]:
        """Scan directory structure and collect file/folder information"""
        base = Path(base_path)
        structure = {}
        
        for item in base.rglob("*"):
            if item.is_file() and item.suffix in ['.md', '.py', '.ipynb', '.txt']:
                relative_path = str(item.relative_to(base))
                category = self.categorize_path(relative_path)
                
                if category not in structure:
                    structure[category] = []
                structure[category].append(relative_path)
        
        return structure
    
    def categorize_path(self, file_path: str) -> str:
        """Categorize a file path based on keywords and structure"""
        path_lower = file_path.lower()
        
        # Check each category for keyword matches
        for category, info in self.categories.items():
            for keyword in info["keywords"]:
                if keyword in path_lower:
                    return category
        
        # Default category for uncategorized items
        return "general_utilities"
    
    def analyze_with_claude(self, file_path: str, content: str = None) -> str:
        """Use Claude to analyze file content and determine category"""
        if content is None:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()[:2000]  # First 2000 chars
            except:
                return "unreadable"
        
        prompt = f"""
        Analyze this file and categorize it based on what user problem it solves:

        File: {file_path}
        Content: {content}

        Categories:
        - developer_onboarding: Learning materials and educational content
        - integration_tools: Tools for integrating Claude with external systems  
        - production_patterns: Production-ready patterns and best practices
        - multimodal_capabilities: Vision and document processing features
        - automation_workflows: Tools for automating complex business processes
        - quality_assurance: Testing, evaluation, and quality measurement tools

        Respond with just the category name.
        """
        
        try:
            response = self.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=50,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text.strip()
        except:
            return "analysis_failed"
    
    def categorize_cookbook(self, cookbook_path: str) -> Dict[str, Dict[str, List[str]]]:
        """Categorize the entire cookbook structure"""
        results = {}
        cookbook = Path(cookbook_path)
        
        # Main sections to analyze
        sections = ['skills', 'tool_use', 'multimodal', 'misc', 'third_party']
        
        for section in sections:
            section_path = cookbook / section
            if section_path.exists():
                results[section] = self.scan_section(section_path)
        
        return results
    
    def scan_section(self, section_path: Path) -> Dict[str, List[str]]:
        """Scan a cookbook section and categorize contents"""
        section_results = {}
        
        for item in section_path.iterdir():
            if item.is_dir():
                # Analyze subdirectory
                category = self.categorize_path(item.name)
                if category not in section_results:
                    section_results[category] = []
                section_results[category].append(f"{item.name}/ (directory)")
                
            elif item.suffix in ['.ipynb', '.md', '.py']:
                # Analyze individual files
                category = self.categorize_path(item.name)
                if category not in section_results:
                    section_results[category] = []
                section_results[category].append(item.name)
        
        return section_results
    
    def generate_report(self, base_path: str) -> Dict:
        """Generate comprehensive categorization report"""
        cookbook_path = Path(base_path) / "anthropic-cookbook"
        courses_path = Path(base_path) / "anthropic-courses"
        
        report = {
            "summary": {
                "total_categories": len(self.categories),
                "analysis_timestamp": "2025-08-13",
                "base_path": base_path
            },
            "category_definitions": self.categories,
            "cookbook_analysis": {},
            "courses_analysis": {},
            "coverage_metrics": {}
        }
        
        # Analyze cookbook if it exists
        if cookbook_path.exists():
            report["cookbook_analysis"] = self.categorize_cookbook(str(cookbook_path))
        
        # Analyze courses if it exists
        if courses_path.exists():
            report["courses_analysis"] = self.scan_directory(str(courses_path))
        
        # Calculate coverage metrics
        report["coverage_metrics"] = self.calculate_coverage(report)
        
        return report
    
    def calculate_coverage(self, report: Dict) -> Dict:
        """Calculate quality gate metrics (80% coverage goal)"""
        total_files = 0
        categorized_files = 0
        
        # Count cookbook files
        for section, categories in report["cookbook_analysis"].items():
            for category, files in categories.items():
                total_files += len(files)
                if category != "general_utilities":
                    categorized_files += len(files)
        
        # Count course files  
        for category, files in report["courses_analysis"].items():
            total_files += len(files)
            if category != "general_utilities":
                categorized_files += len(files)
        
        coverage_percent = (categorized_files / total_files * 100) if total_files > 0 else 0
        
        return {
            "total_files_analyzed": total_files,
            "categorized_files": categorized_files,
            "coverage_percentage": round(coverage_percent, 1),
            "meets_80_percent_goal": coverage_percent >= 80.0
        }
    
    def save_report(self, report: Dict, output_file: str = "ecosystem_categorization_report.json"):
        """Save categorization report to file"""
        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"Report saved to {output_file}")
        return output_file


def main():
    """Main function to run ecosystem categorization"""
    print("🔍 Starting Anthropic Ecosystem Categorization...")
    
    # Initialize categorizer
    categorizer = EcosystemCategorizer()
    
    # Set base path to current directory
    base_path = "/home/moin/learning-software-development-lab"
    
    # Generate comprehensive report
    print("📊 Analyzing ecosystem structure...")
    report = categorizer.generate_report(base_path)
    
    # Save results
    output_file = categorizer.save_report(report)
    
    # Print summary
    metrics = report["coverage_metrics"]
    print(f"\n✅ Analysis Complete!")
    print(f"📁 Total files analyzed: {metrics['total_files_analyzed']}")
    print(f"🏷️  Categorized files: {metrics['categorized_files']}")
    print(f"📈 Coverage: {metrics['coverage_percentage']}%")
    print(f"🎯 Meets 80% goal: {'Yes' if metrics['meets_80_percent_goal'] else 'No'}")
    
    return output_file


if __name__ == "__main__":
    main()