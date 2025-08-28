# Jupyter Notebook Development Standards

## Purpose
Ensure all Jupyter notebooks in this repository render correctly on GitHub and maintain consistency across the project.

## Problem We're Solving
Notebooks edited via code tools (like Claude Code) may have subtle structural differences that prevent proper rendering on GitHub, even though they execute locally.

## Standards

### 1. Creation & Editing
- **DO:** Use Jupyter Lab/Notebook for creating new notebooks
- **DO:** Execute all cells before committing
- **DON'T:** Edit notebook JSON directly unless necessary
- **DON'T:** Use NotebookEdit for complex cell operations

### 2. Pre-Commit Checklist
- [ ] Restart kernel and run all cells (`Kernel → Restart & Run All`)
- [ ] Verify all outputs are present and correct
- [ ] Check for error outputs (unless intentional for demonstration)
- [ ] Remove sensitive data from outputs
- [ ] Save the notebook after execution

### 3. Execution Command
If you've edited a notebook outside Jupyter, re-execute it:
```bash
# Install requirements (one-time)
pip install jupyter nbconvert

# Execute notebook in place
jupyter-nbconvert --to notebook --execute your-notebook.ipynb --output your-notebook.ipynb --inplace

# Or use our helper script
python scripts/notebook-prepare.py your-notebook.ipynb
```

### 4. GitHub Rendering Requirements
GitHub's notebook renderer requires:
- Consistent output structure
- Proper execution counts
- Valid JSON structure
- Kernel specification metadata

### 5. Troubleshooting

#### Symptom: Cells not executing on GitHub
**Cause:** Notebook edited outside Jupyter
**Fix:** Re-execute with jupyter-nbconvert

#### Symptom: Missing outputs
**Cause:** Cells not executed
**Fix:** Run all cells in Jupyter

#### Symptom: Kernel error on GitHub
**Cause:** Missing kernel specification
**Fix:** Ensure notebook has proper metadata

## Helper Scripts

### Prepare Notebook for Commit
```bash
python scripts/notebook-prepare.py path/to/notebook.ipynb
```

### Validate All Notebooks
```bash
python scripts/validate-notebooks.py
```

### Fix Notebook Metadata
```bash
python scripts/fix-notebook-metadata.py path/to/notebook.ipynb
```

## Integration with Development Workflow

1. **Before starting work:** Create notebook from template
2. **During development:** Use Jupyter for editing
3. **Before committing:** Run preparation script
4. **After pushing:** Verify rendering on GitHub

## References
- [Jupyter Notebook Format](https://nbformat.readthedocs.io/)
- [GitHub Notebook Rendering](https://docs.github.com/en/repositories/working-with-files/using-files/working-with-jupyter-notebook-files-on-github)

---
*Last updated: August 25, 2025*
*Issue discovered: Section 3 cells not rendering despite correct structure*
*Root cause: NotebookEdit creates subtly different cell structure*
*Solution: Always re-execute with Jupyter before committing*