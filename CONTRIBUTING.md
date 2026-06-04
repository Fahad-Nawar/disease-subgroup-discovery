# My Contributions - Fahad Nawar Alotaibi

**Student ID:** 2240002024  
**Role:** ML Development  
**Course:** ARTI 308 – Machine Learning  
**Institution:** Imam Abdulrahman Bin Faisal University

---

## Project Contributions

### 1. Machine Learning Model Development
- Implemented and trained **Gaussian Mixture Model (GMM)** clustering
- Tested 4 algorithms: K-Means, Hierarchical Clustering, GMM, DBSCAN
- Achieved **0.3635 Silhouette Score** with GMM
- Model achieved **85-100% cluster purity** against disease labels

### 2. Data Analysis & Preprocessing
- Processed 1,000 patient records with 3 biomarkers
- Applied StandardScaler for feature normalization
- Performed EDA (Exploratory Data Analysis)
- Created visualizations for biomarker distributions

### 3. Model Evaluation
- Internal metrics: Silhouette Score, Davies-Bouldin Index
- External metrics: Adjusted Rand Index, Normalized Mutual Information
- Train/Test split validation (80/20 stratified)
- Achieved **0.23% generalization gap** (excellent)

### 4. Web Application Backend
- Created **Flask API** (`app/risk_predictor_api.py`)
- Implemented prediction endpoint (`/predict`)
- Model serialization and loading
- Health check endpoint (`/health`)

### 5. Documentation
- Created `disease_risk_prediction.ipynb` notebook
- Documented full ML pipeline
- Created README.md with project overview
- Created CONTRIBUTING.md guidelines

### 6. Repository Management
- Renamed folders to follow conventions:
  - Web → app
  - dataset → data
  - model → models
  - all image → results
  - Web-test → tests
  - files → docs
- Updated all file paths in code
- Maintained clean git history with descriptive commits

---

## Technical Skills Used

- **Python:** pandas, numpy, scikit-learn, matplotlib, seaborn
- **Machine Learning:** Clustering, unsupervised learning, model evaluation
- **Backend:** Flask, CORS, model serialization (pickle)
- **Data Processing:** StandardScaler, feature engineering, train/test split
- **Version Control:** Git, GitHub
- **Documentation:** Markdown, Jupyter Notebooks

---

## Key Results Achieved

| Metric | Result |
|--------|--------|
| Best Algorithm | Gaussian Mixture Model |
| Silhouette Score | 0.3635 |
| Davies-Bouldin Index | 1.0182 |
| Diabetes Cluster Purity | 100% |
| Hypertension Cluster Purity | 97.8% |
| Obesity Cluster Purity | 85.1% |
| Model Generalization Gap | 0.23% |

---

**Project Duration:** 2026 (ARTI 308 - Machine Learning Course)
