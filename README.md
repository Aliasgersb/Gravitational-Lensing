<div align="center">

<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Gravitational_lens-full.jpg/1200px-Gravitational_lens-full.jpg" alt="Hubble Space Telescope — Gravitational Lensing" width="100%" style="border-radius:8px;"/>

<sub><i>Strong gravitational lensing observed by the Hubble Space Telescope. Credit: NASA/ESA</i></sub>

<br/><br/>

# Gravitational Lens Detection on ESA Euclid Q1 Data

<p>
  <a href="https://www.python.org/downloads/release/python-3100/">
    <img src="https://img.shields.io/badge/python-3.10+-blue.svg?style=flat-square" alt="Python 3.10+"/>
  </a>
  <a href="https://zenodo.org/records/20037150">
    <img src="https://img.shields.io/badge/DOI-10.5281%2Fzenodo.20037150-blue?style=flat-square" alt="Zenodo"/>
  </a>
  <img src="https://img.shields.io/badge/arXiv-coming%20soon-b31b1b?style=flat-square" alt="arXiv"/>
  <img src="https://img.shields.io/badge/framework-PyTorch-EE4C2C?style=flat-square&logo=pytorch&logoColor=white" alt="PyTorch"/>
  <img src="https://img.shields.io/badge/inference-ONNX%20Runtime%20Web-005CED?style=flat-square" alt="ONNX"/>
  <img src="https://img.shields.io/badge/data-ESA%20Euclid%20Q1-1f3a8f?style=flat-square" alt="Euclid Q1"/>
</p>

**A full-stack deep learning pipeline for automated gravitational lens discovery and dark matter substructure analysis — trained and validated on real observational data from the ESA Euclid Q1 Early Release Observations.**

[Live Web App](https://gravitational-lensing-detector.vercel.app) · [Zenodo Data Release](https://zenodo.org/records/20037150) · [Project Website](https://gravitational-lensing-detector.vercel.app)

</div>

---

## Overview

Strong gravitational lensing — the bending of light from distant galaxies by foreground mass — is one of the most powerful probes of cosmological structure. Identifying lenses at scale in modern surveys is a computer vision problem: millions of galaxies must be screened for the subtle arc-like distortions that signal a lensing event.

This project builds and benchmarks a complete detection pipeline on the first public data release (Q1) of the ESA Euclid mission — the largest space telescope dedicated to dark energy and dark matter science. All models are trained and evaluated on **real observational FITS cutouts** from the Euclid VIS instrument, not simulations.

Two research tracks are addressed:

- **Track A — Binary Lens Detection:** Does this galaxy image contain a strong lensing event? Culminates in a best-of-breed ensemble achieving AUROC = **0.8871**.
- **Track B — Substructure Classification:** Given a confirmed lens, is the dark matter distribution smooth, CDM-subhalo-dominated, or axion-like? Concluded after 7 methods — the signal lies below the detection threshold of Q1 PSF quality, a finding consistent with the ESA Euclid Consortium's own assessment.

All results are fully reproducible. The sacred evaluation split is published in the Zenodo data release and has never been modified across any experiment.

---

## Results

### Track A — Binary Lens Detection

All models below are evaluated on the same held-out test set: **50 Grade A positives + 150 Grade C negatives**. Test-Time Augmentation (TTA) applies 4 × 90° rotations and averages the resulting probabilities.

| Version | Backbone | Pretraining Domain | AUROC (TTA) | Precision | Recall | F1 |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| V6 | EfficientNet-B0 | Simulation (DeepLense) | 0.7283 | 0.579 | 0.440 | 0.500 |
| V7 ⭐ | Zoobot ConvNeXt-Nano | Real Galaxy Morphology | 0.8541 | **0.704** | 0.760 | 0.731 |
| V10 | DINOv2-Small (ViT-S/14) | Self-Supervised (LVD-142M) | 0.8756 | 0.576 | 0.760 | 0.655 |
| V11 | DINOv2-Base (ViT-B/14) | Self-Supervised (LVD-142M) | 0.8776 | 0.556 | 0.800 | 0.656 |
| **V12** | **Ensemble (V7 + V10 + V11)** | **Weighted Logit Averaging** | **0.8871** | **0.833** | 0.700 | **0.761** |

<sub>⭐ V7 is the production inference model deployed in the web application — best precision and probability calibration of all honest single models.</sub>

**Key findings:**

- **Backbone matters more than scale:** Switching from a simulation-pretrained EfficientNet (V6) to a galaxy-morphology-pretrained Zoobot encoder (V7) yielded **+0.1258 AUROC** — the single largest gain in the project and larger than any architecture scaling experiment.
- **Ensemble complementarity:** Combining ConvNeXt and ViT architectures (V12) achieved +0.0095 AUROC over the best single model, confirming that their error patterns are partially uncorrelated.
- **Hard ceiling confirmed:** Two subsequent experiments (V15: pseudo-label mining to 394 positives; V16: 256 hard negatives) both reduced AUROC below V11. Both confirm that **160 clean labeled positives is the binding data constraint** — not architecture.
- **False positive reduction:** Adding 200 verified negatives to training (V9–V11) reduced FPR from 0.091 to 0.024–0.035 on held-out negatives.

### Track B — Dark Matter Substructure Classification

All 7 methods evaluated on 205 real Euclid lens FITS images. Lower entropy = more confident and meaningful predictions.

| Method | Mean Entropy (bits) | High-Confidence Predictions | Result |
| :--- | :---: | :---: | :--- |
| Baseline MC Dropout | 1.124 | 11 / 205 | Highly uncertain |
| CORAL Domain Adaptation | 0.143 | 0 / 205 | CDM collapse |
| DANN Domain Adaptation | 1.581 | 0 / 205 | Random predictions |
| ADDA Domain Adaptation | 1.573 | 0 / 205 | Axion collapse |
| **Noise Injection ⭐** | **0.752** | **59 / 205** | **Best — 4/4 criteria** |
| PSF + Noise + TTA | 1.076 | 23 / 205 | Partial improvement |
| Deep Ensemble (3 seeds) | 0.963 | 20 / 205 | Inter-model disagreement |

<sub>Maximum possible entropy = log₂(3) = 1.585 bits. High-confidence threshold: entropy < 0.5 bits.</sub>

**Scientific conclusion:** All three domain adaptation methods (CORAL, DANN, ADDA) failed due to the same root cause — a 30,000:205 simulation-to-real class imbalance. Noise injection reduced entropy by 33% and increased high-confidence predictions 5× over baseline without collapse. The substructure signal is below the detection threshold of the Euclid Q1 PSF, independently confirmed by the ESA Euclid Consortium and the DeepLense GSoC 2025 team.

### Unseen Q1 Population Scan

After training was concluded, the V12 ensemble was applied to all 1,415 Euclid Q1 candidate files outside the sacred evaluation split.

| Population | Files Scanned | Flagged at t=0.70 | Flag Rate |
| :--- | :---: | :---: | :---: |
| Grade B (all) | 247 | 99 | 40.1% |
| Grade B — pure candidates (no NEG prefix) | 86 | **33** | **38.4%** |
| Grade C holdout | 1,168 | 526 | 45.0% |
| All-model agreement at P > 0.90 | — | 228 | — |

The 38.4% flag rate among pure Grade B candidates is a real scientific signal. The high Grade C rate reflects out-of-distribution failure — not a valid lens prevalence estimate. Full results (1,415 rows with per-model scores) are published on Zenodo.

---

## Pipeline Architecture

```
                          ┌─────────────────────────────────┐
                          │         RAW EUCLID VIS FITS      │
                          │  300×300 px · 0.1"/px · 1-band  │
                          └──────────────┬──────────────────┘
                                         │
                          ┌──────────────▼──────────────────┐
                          │          PREPROCESSING           │
                          │  1. Centre-crop → 300×300        │
                          │  2. 10px border ring subtraction │
                          │  3. log1p stretch                │
                          │  4. Percentile [1,99] → [0,1]   │
                          │  5. Resize → 224×224             │
                          └──────────┬──────────┬───────────┘
                                     │          │
              ┌──────────────────────▼──┐   ┌──▼──────────────────────┐
              │  V7 · ConvNeXt-Nano     │   │  V10/V11 · DINOv2 ViT   │
              │  Zoobot greyscale prior │   │  ImageNet norm · 3-ch   │
              │  Input: (B,1,224,224)   │   │  Input: (B,3,224,224)   │
              │  feat_size = 640        │   │  feat_size = 384 / 768  │
              └──────────┬─────────────┘   └──────────────┬──────────┘
                         │                                 │
                         └──────────────┬──────────────────┘
                                        │
                          ┌─────────────▼───────────────────┐
                          │     V12 WEIGHTED ENSEMBLE        │
                          │   0.3·V7 + 0.2·V10 + 0.5·V11   │
                          │   Weighted logit averaging       │
                          │   + Test-Time Augmentation (4×)  │
                          └─────────────┬───────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
             ┌──────▼──────┐   ┌────────▼───────┐  ┌───────▼───────┐
             │  P(lens)    │   │   Grad-CAM     │  │  Substructure │
             │  Score      │   │   Heatmap      │  │  Uncertainty  │
             └─────────────┘   └────────────────┘  └───────────────┘
```

**Training protocol (Stages 1 and 2):**

All models use a two-stage fine-tuning approach. Stage 1 trains the classification head only (5 epochs, LR = 1e-3) with the encoder frozen. Stage 2 unlocks the full model with a warmup encoder learning rate (1e-7 → 5e-6) and a fixed head LR of 5e-5, for up to 20 epochs. Best validation AUROC checkpoint is saved. Early stopping was removed from V9 onward after empirical confirmation of a −0.026 AUROC penalty from patience=5.

---

## Repository Structure

```
.
├── training/
│   ├── v6_efficientnet/          # EfficientNet-B0 sim-backbone baseline
│   ├── v7_zoobot/                # Zoobot ConvNeXt-Nano (production model)
│   ├── v9_v10_v11/               # Hard negative + DINOv2 experiments
│   ├── v12_ensemble/             # Weighted logit ensemble evaluation
│   └── track_b/                  # Substructure classification (7 methods)
│
├── preprocessing/
│   └── fits_pipeline.py          # Deterministic FITS → tensor pipeline
│
├── evaluation/
│   ├── sacred_split/
│   │   └── train_val_test_split.json   # Sacred split — never regenerate
│   └── metrics/                  # ROC, PR, calibration evaluation scripts
│
├── scan/
│   └── unseen_q1_scan.py         # V12 population scan over 1,415 files
│
├── frontend/                     # React + Vite + Tailwind web application
│   ├── src/
│   │   ├── workers/              # ONNX Runtime Web inference workers
│   │   └── components/           # Explore and Analyse tab components
│   └── public/
│
└── README.md
```

---

## Reproducibility

### FITS Preprocessing

The following pipeline is **deterministic and immutable** — the exact order of operations must be preserved for results to match published numbers. V7 takes 1-channel input with no ImageNet normalisation. V10/V11 replicate the single channel to 3 channels and apply ImageNet normalisation.

```python
from astropy.io import fits
import numpy as np

def preprocess_fits(path, target_size=224):
    """
    Deterministic Euclid VIS preprocessing pipeline.
    Output for V7: float32 tensor shape (1, 224, 224), range [0, 1].
    """
    with fits.open(path) as hdul:
        data = next(h.data for h in hdul if h.data is not None and h.data.ndim >= 2)
    data = np.squeeze(data).astype(np.float32)
    data = np.nan_to_num(data, nan=0.0, posinf=0.0, neginf=0.0)

    # 1. Centre-crop to 300x300
    h, w = data.shape
    cy, cx = h // 2, w // 2
    data = data[cy-150:cy+150, cx-150:cx+150]

    # 2. Border ring background subtraction (10px edge, all four sides)
    border_mask = np.zeros(data.shape, dtype=bool)
    border_mask[:10, :] = True
    border_mask[-10:, :] = True
    border_mask[:, :10] = True
    border_mask[:, -10:] = True
    data = np.maximum(data - np.median(data[border_mask]), 0)

    # 3. Logarithmic stretch
    data = np.log1p(data)

    # 4. Percentile [1, 99] min-max normalisation
    p1, p99 = np.percentile(data, [1, 99])
    data = np.clip((data - p1) / (p99 - p1 + 1e-8), 0, 1)

    # 5. Resize to 224x224 (use torch or cv2 with bilinear interpolation)
    return data  # shape (300, 300) — resize before feeding to model
```

### Model Loading

```python
import torch
import timm
from torch import nn

class ZoobotLensDetector(nn.Module):
    def __init__(self, encoder, feat_size):
        super().__init__()
        self.encoder = encoder
        self.head = nn.Sequential(nn.Dropout(p=0.3), nn.Linear(feat_size, 2))
    def forward(self, x):
        return self.head(self.encoder(x))

# V7 — production model (1-channel, no ImageNet norm)
encoder = timm.create_model(
    'hf_hub:mwalmsley/zoobot-encoder-greyscale-convnext_nano',
    pretrained=False, num_classes=0, in_chans=1
)
model = ZoobotLensDetector(encoder, feat_size=640)
model.load_state_dict(torch.load('v7_zoobot_convnext_nano.pth', map_location='cpu'))
model.eval()

# Inference — input shape (B, 1, 224, 224), values in [0, 1]
with torch.no_grad():
    logits = model(input_tensor)
    p_lens = torch.softmax(logits, dim=1)[:, 1].item()
    # Recommended threshold: 0.623 (V7 optimal F1)
```

### Ensemble Inference (V12)

```python
# V12: weighted logit averaging across all three models
# Weights: V7=0.3, V10=0.2, V11=0.5
logits_v7  = model_v7(tensor_1ch)          # no ImageNet norm
logits_v10 = model_v10(tensor_3ch_norm)    # ImageNet norm
logits_v11 = model_v11(tensor_3ch_norm)    # ImageNet norm

ensemble_logits = 0.3 * logits_v7 + 0.2 * logits_v10 + 0.5 * logits_v11
p_lens = torch.softmax(ensemble_logits, dim=1)[:, 1].item()
# Recommended threshold: 0.70 (V12 optimal F1)
```

---

## Datasets

All real Euclid images are 300×300 px FITS cutouts at 0.1 arcsec/pixel in the Euclid VIS band.

| Source | Description | Files | Access |
| :--- | :--- | :---: | :--- |
| **Grade A** | High-confidence lens candidates | 250 | [Zenodo Record 2 (coming soon)](#) |
| **Grade B** | Probable lens candidates | 247 | [Zenodo Record 2 (coming soon)](#) |
| **Grade C** | Low-confidence candidates (used as training negatives) | ~1,918 | [Zenodo Record 2 (coming soon)](#) |
| **Verified Negatives** | Spatially independent confirmed non-lenses | 285 | [Zenodo Record 2 (coming soon)](#) |
| **Sacred Split** | Train/val/test split JSON — never regenerate | 1 file | [Zenodo Record 2 (coming soon)](#) |
| **V12 Scan Results** | 1,415 unseen candidates with per-model scores | 4 files | [Zenodo 20037150](https://zenodo.org/records/20037150) |
| **SLDE Catalog** | Official ESA Euclid Q1 lens candidate catalog | — | [Zenodo 15025832](https://zenodo.org/records/15025832) |

The Grade A/B catalog originates from the ESA SLDE working group (see [arXiv:2512.05899](https://arxiv.org/abs/2512.05899)). Original FITS files were downloaded from the ESA Datalabs cutout service and are released here pre-cropped and pre-catalogued to make this dataset accessible without requiring ESA Datalabs access.

---

## Web Application

The V7 model is deployed in a browser-native inference application — no data leaves the user's machine.

**Live:** [gravitational-lensing-detector.vercel.app](https://gravitational-lensing-detector.vercel.app)

| Tab | Description |
| :--- | :--- |
| **Explore** | Browse pre-scored Euclid lens candidates with Grad-CAM activation overlays, confidence scores, and grade labels. Filterable by grade, sortable by P(lens). |
| **Analyse** | Upload any Euclid VIS FITS file. The full preprocessing pipeline and ONNX inference run client-side using ONNX Runtime Web. Returns P(lens) with 4× TTA. |

The ONNX model is exported from the V7 checkpoint at opset 17 with dynamic batch axes. The JavaScript preprocessing pipeline exactly mirrors the Python pipeline documented above.

---

## Citation

If you use this work, dataset, or pipeline, please cite:

```bibtex
@software{bhabhrawala2026euclid,
  author       = {Bhabhrawala, Aliasger},
  title        = {Gravitational Lens Detection on ESA Euclid Q1 Data},
  year         = {2026},
  publisher    = {GitHub},
  howpublished = {\url{https://github.com/aliasgerbhabhrawala/gravitational-lensing}}
}

@dataset{bhabhrawala2026data,
  author    = {Bhabhrawala, Aliasger},
  title     = {Euclid Q1 Gravitational Lens Discovery Scan Results},
  year      = {2026},
  publisher = {Zenodo},
  doi       = {10.5281/zenodo.20037150},
  url       = {https://doi.org/10.5281/zenodo.20037150}
}
```

---

## Acknowledgements

- **ESA Euclid Consortium** — for the Q1 ERO data release, the SLDE catalog, and the Datalabs cutout service that made this dataset possible. Data credit: ESA Euclid/Euclid Consortium/NASA/Q1-2025.
- **Mike Walmsley** — for the Zoobot ConvNeXt encoders and for making greyscale galaxy-pretrained weights publicly available via Hugging Face Hub.
- **Meta AI Research** — for the DINOv2 ViT-S/14 and ViT-B/14 self-supervised backbones.
- **Kaggle** — for T4 GPU compute resources used during all model training.

---

<div align="center">
<sub>Aliasger Bhabhrawala · BITS Pilani · 2026</sub>
</div>
