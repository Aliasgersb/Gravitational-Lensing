# Gravitational Lens Detection on ESA Euclid Q1 Data

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/release/python-3100/)
[![Zenodo](https://img.shields.io/badge/DOI-10.5281/zenodo.20037150-blue.svg)](https://zenodo.org/records/20037150)
[![arXiv](https://img.shields.io/badge/arXiv-2501.XXXXX-b31b1b.svg)](https://arxiv.org/)

**Automated strong lensing detection and dark matter substructure analysis pipeline using ESA Euclid Q1 Early Release Observation (ERO) data.**

This repository contains the web application and core inference engine for identifying and classifying gravitational lenses in high-resolution astronomical survey data. 

---

## Technical Highlights

### Binary Lens Detection (Track A)
Automated identification of strong lensing candidates in wide-field VIS-band imagery.

| Version | Backbone Architecture | Core Methodology | AUROC (TTA) |
| :--- | :--- | :--- | :--- |
| V6 | EfficientNet-B0 | Simulation-only Pretraining | 0.7283 |
| **V7** | **Zoobot ConvNeXt-Nano** | **Galaxy Morphology Prior** | **0.8541** |
| V10 | DINOv2-Small | Self-Supervised ViT | 0.8756 |
| V11 | DINOv2-Base | Self-Supervised ViT | 0.8776 |
| **V12** | **Ensemble (V7+V10+V11)** | **Weighted Logit Averaging** | **0.8871** |

*   **Backbone Superiority:** The transition from V6 (sim-pretrained) to V7 (morphology-pretrained) yielded a **+0.1258 AUROC increase**, establishing the necessity of real-galaxy feature extractors.
*   **Ensemble Gain:** Combining convolutional and transformer architectures (V12) mitigated individual model biases, resulting in the highest project accuracy.

### Substructure Classification (Track B)
Discriminative classification of lenses into smooth, CDM subhalos, or axion configurations.
*   **Optimal Method:** Noise injection significantly refined uncertainty quantification, reducing mean prediction entropy from **1.12 to 0.75 bits**.
*   **Conclusion:** Scientific results indicate that the substructure signal in Q1 data remains below the detection threshold due to PSF limitations.

---

## Repository Structure

```text
.
├── src/                 # Application source code (React + Vite)
│   ├── components/      # UI components (Explore, Analyse, Learn)
│   ├── utils/           # FITS parsing and image processing logic
│   └── workers/         # Client-side ONNX inference worker threads
├── public/              # Quantized model binaries and dataset thumbnails
│   ├── models/          # ONNX model files
│   └── explore/         # Confirmed lens candidate images
├── index.html           # Main entry point
├── vercel.json          # Deployment configuration for Vercel
└── README.md            # Project documentation
```

---

## Reproducibility

### Preprocessing Logic
The following routine ensures deterministic input consistent with the training distribution:

```python
def preprocess_fits(path):
    with fits.open(path) as hdul:
        data = hdul[0].data.astype(np.float32)
    
    # 1. Centre-crop to 300x300 standard
    h, w = data.shape
    cy, cx = h // 2, w // 2
    data = data[cy-150:cy+150, cx-150:cx+150]
    
    # 2. 10px Border ring background subtraction
    mask = np.ones(data.shape, dtype=bool)
    mask[10:-10, 10:-10] = False
    border_median = np.median(data[mask])
    data = np.maximum(data - border_median, 0)
    
    # 3. Normalization (log1p + [1, 99] percentile min-max)
    data = np.log1p(data)
    p1, p99 = np.percentile(data, [1, 99])
    data = (data - p1) / (p99 - p1 + 1e-8)
    return np.clip(data, 0, 1)
```

---

## Web Application

The production-ready V7 model is deployed as a client-side application for real-time analysis.
*   **Live App:** [Live link coming soon]
*   **Analyse Tab:** Upload local FITS files for client-side detection using ONNX Runtime Web.

---

## Citations

### Software
```bibtex
@software{bhabhrawala2026euclid,
  author = {Bhabhrawala, Aliasger},
  title = {Gravitational Lens Detection on ESA Euclid Q1 Data},
  year = {2026},
  publisher = {GitHub},
  journal = {GitHub Repository},
  howpublished = {\url{https://github.com/aliasgerbhabhrawala/gravitational-lensing}}
}
```

### Data
```bibtex
@data{bhabhrawala2026data,
  author = {Bhabhrawala, Aliasger},
  title = {Euclid Q1 Gravitational Lens Discovery Scan Results},
  year = {2026},
  publisher = {Zenodo},
  doi = {10.5281/zenodo.20037150},
  url = {https://doi.org/10.5281/zenodo.20037150}
}
```

---

## Acknowledgements

*   **ESA Euclid Consortium:** For the ERO Q1 data release and SLDE catalog.
*   **Kaggle:** For computational resources used during model training.
*   **Zoobot & DINOv2:** For maintaining the core pre-trained backbones.
