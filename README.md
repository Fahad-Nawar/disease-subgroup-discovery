# Disease Subgroup Discovery

Unsupervised machine learning project to discover natural disease subgroups from clinical biomarkers.

**Course:** ARTI 308 – Machine Learning  
**Institution:** Imam Abdulrahman Bin Faisal University

---

## Project Overview

This project applies unsupervised learning algorithms (K-Means, Hierarchical Clustering, Gaussian Mixture Models, DBSCAN) with PCA dimensionality reduction on three key clinical biomarkers — **BMI**, **Fasting Glucose**, and **Systolic Blood Pressure** — to discover natural patient groupings that correspond to disease risk categories without using disease labels during training.

### Key Results
- **Discovered 3 Disease Subgroups:** Hypertension, Obesity, Type II Diabetes
- **Best Algorithm:** Gaussian Mixture Model (GMM)
- **Cluster Purity:** 85-100% against ground truth disease labels
- **Model Generalization:** Train/test gap < 2.5%

---

## Project Structure

```
disease-subgroup-discovery/
├── app/                          # Flask API + React Frontend
│   ├── risk_predictor_api.py     # Backend prediction API (Flask)
│   ├── Health Predictor.html     # Main HTML interface
│   ├── app.jsx                   # React app component
│   ├── screens.jsx               # Disease risk prediction screens
│   └── tweaks-panel.jsx          # Interactive configuration panel
│
├── data/                         # Training datasets
│   ├── dataset for machine project.csv
│   │   └── 1,000 patients × 4 columns (BMI, Glucose, Blood Pressure, Disease Type)
│   ├── diet_recommendations_dataset (best).csv
│   └── diet_dataset_modified after change harte.csv
│
├── models/                       # Trained ML models
│   └── gmm_3feature_bundle.pkl   # Gaussian Mixture Model (3-component)
│       └── Contains: GMM, StandardScaler, cluster→disease mapping
│
├── results/                      # Visualizations & analysis outputs
│   ├── image 5/                  # Model version 5 experiment results
│   ├── image 6/                  # Model version 6 experiment results
│   ├── image 7 last/             # Latest/final results (13 visualizations)
│   ├── image for version 1/      # Historical version 1
│   ├── image for version 2/      # Historical version 2
│   ├── image for version 3/      # Historical version 3
│   └── image version 4/          # Historical version 4
│       └── Contents: EDA plots, clustering visualizations, algorithm comparisons,
│                     dendrograms, radar charts, train/test evaluations
│
├── tests/                        # Test cases & verification screenshots
│   ├── case 1/                   # Test scenario 1 with screenshots
│   ├── case 2/                   # Test scenario 2 with screenshots
│   └── case 3/                   # Test scenario 3 with screenshots
│
├── docs/                         # Project documentation & reports
│   ├── ARTI_308_Final_Report_Group4.pdf
│   ├── ARTI_308_Final_Report_Group4.docx
│   ├── ARTI_308_Progress_Report_Group4.pdf
│   ├── ARTI_308_Progress_Report_Group4.docx
│   ├── ARTI_308_Progress_Report_Group4_for final.docx
│   ├── ARTI 308 Project Progress Report Template.docx
│   ├── ARTI 308 Grading rubrics for progress report.docx
│   └── Proposal.pdf
│
├── disease_risk_prediction.ipynb # Main analysis & modeling notebook
│   └── Complete workflow: EDA, preprocessing, clustering, evaluation
│
├── CONTRIBUTING.md               # Contribution guidelines
├── README.md                     # This file
└── .claude/settings.local.json   # Claude Code configuration
```

---

## Biomarkers Used

| Biomarker | Unit | Range | Relevance |
|-----------|------|-------|-----------|
| **BMI** | kg/m² | 15-45 | Obesity risk indicator |
| **Fasting Glucose** | mg/dL | 60-300 | Diabetes risk indicator |
| **Systolic Blood Pressure** | mmHg | 80-200 | Hypertension risk indicator |

---

## Algorithms Tested

| Algorithm | Type | Silhouette | DBI | ARI | Notes |
|-----------|------|-----------|-----|-----|-------|
| **K-Means** | Partition | 0.3649 | 1.0176 | 0.5234 | Hard clustering, fast |
| **Hierarchical (Ward)** | Agglomerative | 0.3567 | 1.0251 | 0.5087 | Dendrogram visualization useful |
| **GMM** ⭐ | Probabilistic | 0.3635 | 1.0182 | 0.5412 | **Best overall performance** |
| **DBSCAN** | Density-based | N/A | N/A | N/A | Single cluster (uniform density) |

---

## Model Performance

### Internal Validation
- **Silhouette Score:** 0.3635 (cohesion & separation)
- **Davies-Bouldin Index:** 1.0182 (cluster quality)

### External Validation (vs. Disease_Type)
- **Adjusted Rand Index:** 0.5412 (chance-corrected agreement)
- **Normalized Mutual Information:** 0.5467 (information shared with labels)

### Cluster Purity
- **Diabetes:** 100% pure (136/136 patients correctly classified)
- **Hypertension:** 97.8% pure (393/402)
- **Obesity:** 85.1% pure (393/462)

### Generalization (Train/Test Split)
- **Train Silhouette:** 0.3721
- **Test Silhouette:** 0.3644
- **Generalization Gap:** 0.23% ✓ Excellent generalization

---

## Web Application

### Features
- **Interactive Input:** Enter patient biomarkers (BMI, glucose, blood pressure)
- **Real-time Prediction:** Uses trained GMM model
- **Disease Risk Assessment:** Probability for each disease subgroup
- **Fallback Logic:** If all measurements normal, uses approximation

### Access
```
http://localhost:5000
```

## Team Members

| # | Name | Student ID | Role |
|---|------|----|------|
| 1 | Wesam Jaber Almalki | 2240005660 | Project Leader |
| 2 | Fahad Nawar Alotaibi | 2240002024 | ML Development |
| 3 | Fawaz Alshahrani | 2240005571 | Data Analysis |
| 4 | Faris Alshahrani | 2240005572 | ML Development |
| 5 | Ahmed Albouainain | 2240006128 | Data Analysis |
| 6 | Anas Hamzi | 2240003869 | Testing & QA |

---

**Last Updated:** June 2026
