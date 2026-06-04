# Contributing to Disease Subgroup Discovery

We welcome contributions from all team members! This document outlines the standards and guidelines for contributing to the project.

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

**Key Rules:**
- Maximum line length: 100 characters
- Use 4 spaces for indentation
- Variable names in `snake_case`
- Function names in `snake_case`
- Class names in `PascalCase`

### JavaScript / React
- Use camelCase for variables and functions
- Use PascalCase for components
- Keep components focused on single responsibility
- Add comments for complex logic

**Example:**
```javascript
function DiseaseResultCard({ prediction, confidence }) {
  return (
    <div className="result-card">
      <h2>{prediction}</h2>
      <p>Confidence: {(confidence * 100).toFixed(1)}%</p>
    </div>
  );
}
```

**Key Rules:**
- Use functional components with hooks (React 16.8+)
- Use `const` instead of `let` or `var`
- Keep functions under 50 lines
- Extract JSX into separate functions if complex

---

## Testing

### Writing Tests
- Create test files in `tests/` folder
- Test format: Test scenarios with screenshots
- Document each test case purpose clearly

**Test Case Structure:**
```
tests/case N/
  ├── Screenshot [input state]
  ├── Screenshot [expected output]
  └── Notes (optional)
```

### What to Test
- **API Endpoints:** Health check, prediction endpoint, error handling
- **Web Interface:** Input validation, predictions, edge cases
- **Model:** Prediction consistency, boundary conditions
- **Data Loading:** CSV parsing, missing values, data types

### Running Manual Tests
1. Start Flask API: `python app/risk_predictor_api.py`
2. Open web interface: `http://localhost:5000`
3. Enter test values and verify predictions
4. Screenshot results and save to `tests/case N/`

---

## Working with Data

### Adding Datasets
1. Place CSV files in `data/` folder
2. Ensure 1,000+ rows for statistical significance
3. Document columns and units clearly
4. Include source and collection method in comments

### Dataset Requirements
- **Format:** CSV with headers
- **Columns needed:** BMI, Glucose_mg/dL, Blood_Pressure_mmHg, Disease_Type
- **No missing values** in biomarker columns
- **Disease types:** Hypertension, Obesity, Diabetes

### Modifying Existing Data
- Create backup before changes
- Document all modifications with before/after counts
- Retrain model if biomarker distributions change significantly
- Update notebook and report results

---

## ML Model Development

### Training Models
1. Update `disease_risk_prediction.ipynb` with new training code
2. Document all hyperparameters used
3. Run full evaluation pipeline:
   - Internal metrics (Silhouette, DBI)
   - External metrics (ARI, NMI)
   - Cluster purity analysis
   - Train/test generalization check
4. Save model to `models/` with descriptive name
5. Update `app/risk_predictor_api.py` to use new model

### Model Naming Convention
```
gmm_<features>_<description>.pkl
# Examples:
gmm_3feature_bundle.pkl
gmm_5feature_v2.pkl
gmm_3feature_balanced.pkl
```

### Required Performance Metrics
Report in commit message and PR description:

```
Model Performance Summary:
- Silhouette Score: 0.3635
- Davies-Bouldin Index: 1.0182
- Adjusted Rand Index: 0.5412
- Cluster Purity: Diabetes (100%), Hypertension (97.8%), Obesity (85.1%)
- Train/Test Gap: 0.23% (excellent generalization)
```

### Validation Checklist
- [ ] Model trained on `data/dataset for machine project.csv`
- [ ] All 1,000 samples used
- [ ] 80/20 train/test split with stratification
- [ ] StandardScaler fitted on training data only
- [ ] Predictions consistent on test set
- [ ] Cluster→disease mapping stable
- [ ] Model file < 10MB

---

## Commit Standards

### Commit Message Format
```
<type>: <description>

<optional detailed explanation>
```

**Types:**
- `feat:` New feature or model
- `fix:` Bug fix
- `refactor:` Code restructuring (no functional change)
- `docs:` Documentation updates
- `test:` Test additions/screenshots
- `perf:` Performance improvements
- `data:` Dataset changes

**Examples:**
```
feat: train GMM with 5 biomarkers

Added HbA1c and cholesterol to feature set.
Model achieves 92% purity on Diabetes classification.
Silhouette: 0.3891 | ARI: 0.5623

fix: handle missing glucose values in API

Validates input biomarkers before prediction.
Returns error message if values out of range.

docs: update README with latest results

Added train/test evaluation metrics.
Updated cluster purity summary table.
```

---

## Pull Request Process

### Before Creating PR
1. Test changes locally
2. Verify all metrics/results
3. Add test cases or screenshots if applicable
4. Update documentation if needed
5. Run final validation

### PR Description Template
```markdown
## Description
Brief summary of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Model improvement
- [ ] Documentation
- [ ] Data update

## Testing
- How was this tested?
- Screenshots/results included?

## Performance Impact
- Silhouette Score: 0.3635
- DBI: 1.0182
- Cluster Purity: Diabetes (100%), Hypertension (97.8%), Obesity (85.1%)

## Notes
Any additional context
```

---

## Performance Benchmarks

When modifying the model, track these metrics:

| Metric | Baseline | Target |
|--------|----------|--------|
| Silhouette Score | 0.3635 | ≥ 0.35 |
| Davies-Bouldin Index | 1.0182 | ≤ 1.05 |
| Adjusted Rand Index | 0.5412 | ≥ 0.50 |
| Diabetes Purity | 100% | ≥ 95% |
| Hypertension Purity | 97.8% | ≥ 95% |
| Obesity Purity | 85.1% | ≥ 80% |
| Train/Test Gap | 0.23% | ≤ 1% |

---

## File Naming Conventions

### Python Files
```
snake_case.py
# Examples:
risk_predictor_api.py
data_loader.py
model_trainer.py
```

### JavaScript Files
```
camelCase.jsx or camelCase.js
# Examples:
app.jsx
riskPredictor.jsx
diseaseCard.jsx
```

### Data Files
```
descriptive_name.csv
# Examples:
dataset for machine project.csv
diet_recommendations_dataset (best).csv
```

### Model Files
```
model_<features>_<version>.pkl
# Examples:
gmm_3feature_bundle.pkl
kmeans_5feature_v2.pkl
```

---

## Documentation Standards

### Code Comments
- Only comment the "why", not the "what"
- Keep comments concise (1-2 lines max)
- Update comments if code changes

**Good:**
```python
# Use GMM instead of K-Means for overlapping disease groups
gmm = GaussianMixture(n_components=3)
```

**Bad:**
```python
# Create a GaussianMixture object with 3 components
gmm = GaussianMixture(n_components=3)
```

### Docstrings
- Required for all functions and classes
- Use Google-style format
- Include Args, Returns, Examples

```python
def cluster_patients(X: np.ndarray, n_clusters: int) -> np.ndarray:
    """
    Cluster patients using K-Means algorithm.
    
    Args:
        X: Feature matrix (n_samples, n_features)
        n_clusters: Number of clusters to find
    
    Returns:
        Cluster labels (n_samples,)
    
    Example:
        >>> labels = cluster_patients(X, n_clusters=3)
        >>> print(labels.unique())
        [0 1 2]
    """
```

---

## Common Mistakes to Avoid

❌ **Don't:**
- Commit directly to main branch
- Push without testing locally
- Ignore test failures
- Change hyperparameters without documenting
- Commit large binary files (>10MB)
- Modify README without updating documentation

✅ **Do:**
- Create feature branch for each change
- Test thoroughly before pushing
- Report all metrics in PR
- Document why changes were made
- Keep commits focused and clean
- Update all related documentation

---

## Team Roles

| Role | Responsibility | Examples |
|------|-----------------|----------|
| **Project Leader** (Wesam) | Overall direction, approvals, conflict resolution | Approve major changes, manage timeline |
| **ML Development** (Fahad) | Model training, algorithms, feature engineering | Train new models, optimize parameters |
| **Data Analysis** (Fawaz) | EDA, data quality, feature analysis | Analyze datasets, create visualizations |
| **Backend** (Faris) | API, model serving, data loading | Implement API endpoints, integrate models |
| **Frontend** (Ahmed) | Web interface, user experience, interaction | Build UI components, handle inputs |
| **Testing & QA** (Anas) | Test cases, validation, quality assurance | Create test scenarios, verify results |

---

## Code Review Checklist

When reviewing a PR, check:

- [ ] Code follows style guide
- [ ] Tests are included
- [ ] Documentation is updated
- [ ] Performance metrics reported
- [ ] No large files committed
- [ ] Commit messages are clear
- [ ] Changes are focused (not too broad)
- [ ] Model performance maintained or improved

---

## Thank You!

Your contributions make this project successful. Follow these guidelines to maintain code quality and team collaboration.

**Happy coding!** 🚀
