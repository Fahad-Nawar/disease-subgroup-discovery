# Contributing to Disease Subgroup Discovery

Thank you for contributing! This document outlines how to contribute to the Disease Subgroup Discovery project.

## Project Team

| # | Name | ID | Role |
|---|------|----|------|
| 1 | Wesam Jaber Almalki | 2240005660 | Project Leader |
| 2 | Fahad Nawar Alotaibi | 2240002024 | ML Development |
| 3 | Fawaz Alshahrani | 2240005571 | Data Analysis |
| 4 | Faris Alshahrani | 2240005572 | Backend Development |
| 5 | Ahmed Albouainain | 2240006128 | Frontend Development |
| 6 | Anas Hamzi | 2240003869 | Testing & QA |

**Course:** ARTI 308 – Machine Learning  
**Objective:** Apply unsupervised learning to discover disease subgroups from clinical biomarkers

---

## Project Structure

```
disease-subgroup-discovery/
├── app/                          # Flask API + React Frontend
│   ├── risk_predictor_api.py     # Backend prediction API
│   ├── Health Predictor.html     # Main HTML interface
│   ├── app.jsx                   # React app component
│   ├── screens.jsx               # Screen components
│   └── tweaks-panel.jsx          # Configuration panel
├── data/                         # Training datasets
│   ├── dataset for machine project.csv
│   ├── diet_recommendations_dataset (best).csv
│   └── diet_dataset_modified after change harte.csv
├── models/                       # Trained ML models
│   └── gmm_3feature_bundle.pkl   # Trained GMM model
├── results/                      # Visualizations & outputs
│   ├── image 5/                  # Model version 5 results
│   ├── image 6/                  # Model version 6 results
│   ├── image 7 last/             # Latest results
│   └── [other versions]/
├── tests/                        # Test cases & screenshots
│   ├── case 1/                   # Test scenario 1
│   ├── case 2/                   # Test scenario 2
│   └── case 3/                   # Test scenario 3
├── docs/                         # Project documentation
│   ├── ARTI_308_Final_Report_Group4.pdf
│   ├── ARTI_308_Progress_Report_Group4.pdf
│   └── Proposal.pdf
└── disease_risk_prediction.ipynb # Main analysis notebook
```

---

## Getting Started

### Prerequisites
- Python 3.8+
- pip or conda
- Git
- Node.js (for frontend modifications)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Fahad-Nawar/disease-subgroup-discovery.git
   cd disease-subgroup-discovery
   ```

2. **Create virtual environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Flask API**
   ```bash
   python app/risk_predictor_api.py
   ```
   Open browser at `http://localhost:5000`

---

## Development Workflow

### 1. Before Starting Work
- Sync with the latest main branch
  ```bash
  git fetch origin
  git pull origin main
  ```

### 2. Create a Feature Branch
Use descriptive branch names:
```bash
git checkout -b feature/description-of-work
# Examples:
# git checkout -b feature/add-new-biomarker
# git checkout -b fix/api-error-handling
# git checkout -b docs/update-readme
```

### 3. Make Changes
- Work on your assigned feature/fix
- Keep commits focused and descriptive
- Test locally before committing

### 4. Commit Message Format
```
<type>: <description>

<optional longer explanation>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code restructuring (no functional change)
- `docs:` Documentation updates
- `test:` Test additions/modifications
- `perf:` Performance improvements

**Example:**
```
feat: add gaussian mixture model training

Implement GMM-based clustering with 3 biomarkers (BMI, glucose, blood pressure).
Includes model serialization and prediction endpoints.
```

### 5. Push and Create Pull Request
```bash
git push origin feature/description-of-work
```
Then create a pull request on GitHub with:
- Clear title and description
- Reference to any related issues
- Screenshots (if UI changes)
- Test results

### 6. Code Review
- All pull requests require review from at least one team member
- Address feedback in new commits (don't amend)
- Once approved, the branch can be merged

---

## Code Style Guide

### Python
- Follow [PEP 8](https://pep8.org/) style guide
- Use type hints where possible
- Keep functions small and focused
- Add docstrings to functions

**Example:**
```python
def predict_disease_risk(bmi: float, glucose: float, sbp: float) -> dict:
    """
    Predict disease risk using trained GMM model.
    
    Args:
        bmi: Body mass index (kg/m²)
        glucose: Fasting glucose (mg/dL)
        sbp: Systolic blood pressure (mmHg)
    
    Returns:
        Dictionary with prediction, probabilities, and confidence
    """
    # Implementation...
```

### JavaScript/React
- Use camelCase for variables and functions
- Use PascalCase for components
- Keep components focused on single responsibility
- Add comments for complex logic

**Example:**
```javascript
function DiseaseResultCard({ prediction, confidence }) {
  // Component logic...
}
```

---

## Testing

### Running Tests
```bash
# Test the API endpoints
python -m pytest tests/

# Manual testing
# Use the screenshots in tests/ folder as reference
# Follow the test cases in tests/case 1, 2, 3
```

### Adding Tests
- Create test files in `tests/` folder
- Name format: `test_<module>.py`
- Include comments explaining test purpose

---

## Working with Data

### Adding New Datasets
1. Place CSV files in `data/` folder
2. Update `disease_risk_prediction.ipynb` with data loading code
3. Document data schema and source in comments

### Modifying Training Data
- Always create a backup copy
- Document changes in commit message
- Retest model performance if biomarkers change

---

## ML Model Development

### Training New Models
1. Update `disease_risk_prediction.ipynb` with new training code
2. Save trained models to `models/` folder with descriptive names
3. Document model performance metrics in comments
4. Update `app/risk_predictor_api.py` to use new model

### Model Versioning
Use this naming format:
```
gmm_<features>_<version>.pkl
# Examples:
# gmm_3feature_bundle.pkl
# gmm_5feature_v2.pkl
```

---

## Documentation

### Updating Docs
- Edit or create `.md` files for documentation
- Keep README.md synchronized with major changes
- Add images/diagrams to `docs/` folder if helpful
- Update this CONTRIBUTING.md as processes change

---

## Communication

- **Issues:** Use GitHub Issues for bugs and feature requests
- **Discussions:** Use GitHub Discussions for design decisions
- **Code Review:** Provide constructive feedback on PRs
- **Questions:** Ask team leads (Wesam) before major changes

---

## Branching Strategy

```
main (production-ready)
  ├── feature/biomarker-analysis
  ├── feature/api-improvements
  ├── fix/data-loading-bug
  └── docs/update-guide
```

**Rules:**
- Never push directly to main
- All changes go through feature branches + PR + review
- Delete branch after merge

---

## Common Tasks

### I want to add a new biomarker
1. Create branch: `git checkout -b feature/add-new-biomarker`
2. Update data loading in `disease_risk_prediction.ipynb`
3. Retrain model and save to `models/`
4. Update `app/risk_predictor_api.py` constants
5. Test through web interface
6. Create PR with results

### I found a bug
1. Create branch: `git checkout -b fix/bug-description`
2. Reproduce the bug and document in PR description
3. Fix the bug
4. Add test case to `tests/`
5. Create PR with "Fixes #<issue_number>" in description

### I want to improve documentation
1. Create branch: `git checkout -b docs/improve-guide`
2. Edit markdown files
3. Preview changes locally
4. Create PR with "Improves documentation" in title

---

## Performance Metrics to Track

When modifying the model, ensure you report:
- **Silhouette Score** (internal validation)
- **Davies-Bouldin Index** (lower is better)
- **Adjusted Rand Index** (external validation)
- **Cluster Purity** against Disease_Type
- **Train/Test Gap** (generalization check)

---

## Questions or Issues?

- Contact project lead: **Wesam Jaber Almalki** (ID: 2240005660)
- Check existing documentation in `docs/` folder
- Review past pull requests for similar issues
- Ask in GitHub Issues or Discussions

---

## Thank You!

Your contributions help make this project better for everyone. We appreciate your time and effort!

**Happy coding!** 🚀
