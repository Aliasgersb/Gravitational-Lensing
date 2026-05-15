<div align="center">

<img src="https://github.com/user-attachments/assets/414f26fd-02a6-475e-a05e-1d331d9bfdde" alt="Strong gravitational lensing — Einstein ring observed by the Hubble Space Telescope. Credit: NASA/ESA" width="72%" style="border-radius:8px;" />

<sub><i>Strong gravitational lensing — Einstein ring observed by the Hubble Space Telescope. Credit: NASA/ESA</i></sub>

</div>

<br />

<div align="center">

# Gravitational Lens Detection on ESA Euclid Q1 Data

<p>
  <a href="https://zenodo.org/records/20037150">
    <img src="https://img.shields.io/badge/Zenodo-10.5281%2Fzenodo.20037150-blue?style=flat-square" alt="Zenodo Record 1"/>
  </a>
  &nbsp;
  <a href="https://zenodo.org/records/20056736">
    <img src="https://img.shields.io/badge/Zenodo-10.5281%2Fzenodo.20056736-blue?style=flat-square" alt="Zenodo Record 2"/>
  </a>
  &nbsp;
  <img src="https://img.shields.io/badge/arXiv-Pending-b31b1b?style=flat-square" alt="arXiv"/>
  &nbsp;
  <img src="https://img.shields.io/badge/Framework-PyTorch-EE4C2C?style=flat-square&logo=pytorch&logoColor=white" alt="PyTorch"/>
  &nbsp;
  <img src="https://img.shields.io/badge/Data-ESA%20Euclid%20Q1-1f3a8f?style=flat-square" alt="ESA Euclid Q1"/>
</p>

**A full-stack deep learning pipeline for automated gravitational lens discovery and dark matter substructure analysis — trained and validated on real observational data from the ESA Euclid Q1 Early Release Observations.**

</div>

---

## Links

| Resource | URL |
| :--- | :--- |
| **Project Website** | [gravitational-lensing.vercel.app](https://gravitational-lensing.vercel.app) |
| **Zenodo — Scan Results & Discovery Gallery** | [doi.org/10.5281/zenodo.20037150](https://doi.org/10.5281/zenodo.20037150) |
| **Zenodo — Full Dataset, Weights & Evaluation Split** | [doi.org/10.5281/zenodo.20056736](https://doi.org/10.5281/zenodo.20056736) |
| **arXiv Paper** | Pending |
| **ESA SLDE Catalog** | [zenodo.org/records/15025832](https://zenodo.org/records/15025832) |

---

## Overview

Strong gravitational lensing — the bending of light from distant galaxies by foreground mass — is one of the most powerful probes of cosmological structure. Identifying lenses at scale in modern surveys is a computer vision problem: millions of galaxies must be screened for the subtle arc-like distortions that signal a lensing event.

This project builds and benchmarks a complete detection pipeline on the first public data release (Q1) of the ESA Euclid mission — the largest space telescope dedicated to dark energy and dark matter science. All models are trained and evaluated on **real observational FITS cutouts** from the Euclid VIS instrument, not simulations.

Two research tracks are addressed:

- **Track A — Binary Lens Detection:** Does this galaxy image contain a strong lensing event? Culminates in a weighted ensemble achieving AUROC = **0.8871**.
- **Track B — Substructure Classification:** Given a confirmed lens, is the dark matter distribution smooth, CDM-subhalo-dominated, or axion-like? Concluded after 7 methods — the signal lies below the detection threshold of Q1 PSF quality, a finding consistent with the ESA Euclid Consortium's own assessment.

All results are fully reproducible. The standardized evaluation split is published in the Zenodo data release and has never been modified across any experiment.

---

## Results

### Track A — Binary Lens Detection

All models below are evaluated on the same held-out test set: **50 Grade A positives + 150 Grade C negatives** (200 total). Test-Time Augmentation (TTA) applies 4 × 90° rotations and averages the resulting probabilities.

| Version | Backbone | Pretraining | AUROC (TTA) | Precision | Recall | F1 | Threshold |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| V6 | EfficientNet-B0 | Simulation (DeepLense) | 0.7283 | 0.579 | 0.440 | 0.500 | 0.583 |
| V7 | Zoobot ConvNeXt-Nano | Real Galaxy Morphology | 0.8541 | **0.704** | 0.760 | 0.731 | 0.623 |
| V9 | Zoobot ConvNeXt-Nano + Hard Negatives | Real Galaxy Morphology | 0.8587 | 0.546 | 0.720 | 0.621 | 0.480 |
| V10 | DINOv2-Small (ViT-S/14) | Self-Supervised (LVD-142M) | 0.8756 | 0.576 | 0.760 | 0.655 | 0.230 |
| V11 | DINOv2-Base (ViT-B/14) | Self-Supervised (LVD-142M) | 0.8776 | 0.556 | 0.800 | 0.656 | 0.300 |
| **V12 (Best)** | **Ensemble (V7 + V10 + V11)** | **Weighted Logit Averaging** | **0.8871** | **0.8333** | **0.7000** | **0.7609** | **0.7000** |
| V15 | DINOv2-Base + 394 pseudo-labeled positives | Self-Supervised (LVD-142M) | 0.8687 | — | — | — | — |

<sub>V12 is the superior model and the primary research outcome of this project, achieving the highest AUROC and F1 score on the held-out test set. V7 is the production model deployed in the web application for its efficiency and 15M parameters, enabling browser-native ONNX inference with high precision (0.704).</sub>

<sub>V1–V5 are invalidated due to data leakage (training and evaluation data overlapped) and are not shown. V6 is the first honest result. V13 and V14 are data-mining steps, not independently evaluated models. V16 (hard negative augmentation) failed its gate at AUROC=0.8421 (-0.0355 vs V11 baseline).</sub>

**Key findings:**

- **Backbone pretraining matters more than architecture scale:** Switching from a simulation-pretrained EfficientNet (V6, AUROC=0.7283) to a galaxy-morphology-pretrained Zoobot encoder (V7, AUROC=0.8541) yielded **+0.1258 AUROC** — the single largest gain in the entire project.
- **Ensemble complementarity:** Combining ConvNeXt and ViT architectures (V12) achieved +0.0095 AUROC over the best single model (V11=0.8776), confirming that their error patterns are partially uncorrelated.
- **160 clean labeled positives is the hard ceiling:** V15 (394 pseudo-labeled positives, +146% data) scored AUROC=0.8687 — *lower* than V11 on 160 clean labels. V16 (256 hard negatives) dropped AUROC by 0.0355. Both confirm label quality outweighs data quantity at this scale.
- **Hard negatives cut false positives:** Adding 200 verified negatives (V9–V11) reduced FPR from 0.091 (V7) to 0.024–0.035 on held-out images, at the cost of precision.
- **Calibration and Production Deployment:** While V12 provides the highest scientific performance, V10 and V11 show poorly calibrated probabilities (thresholds 0.23–0.30). V7's threshold of 0.623 is more meaningfully interpretable for production environments, which is why it powers the real-time browser inference tool.

---

### Track B — Dark Matter Substructure Classification

All 7 methods evaluated on 205 real Euclid lens FITS images. Lower entropy = more confident predictions. Maximum possible entropy = log2(3) = **1.585 bits**. High-confidence threshold: entropy < 0.5 bits.

| Method | Approach | Mean Entropy (bits) | Uncertain % | High-Confidence | Criteria Passed |
| :--- | :--- | :---: | :---: | :---: | :---: |
| 1. Baseline MC Dropout | Original model, no adaptation | 1.1236 | 94.6% | 11 / 205 | 0 / 4 |
| 2. CORAL | Covariance alignment, 50 epochs | 0.1429 | 100% | 0 / 205 | 0 / 4 — CDM collapse |
| 3. DANN | Adversarial domain adaptation, lambda=0.5 | 1.5807 | 100% | 0 / 205 | 0 / 4 — random |
| 4. ADDA | Adversarial discriminative, 50 epochs | 1.5732 | 100% | 0 / 205 | 0 / 4 — axion collapse |
| **5. Noise Injection** | **Add Euclid noise (sigma≈0.03) to simulation training** | **0.7524** | **71.2%** | **59 / 205** | **4 / 4 — BEST** |
| 6. PSF + Noise + TTA | PSF blur + progressive noise + test-time augmentation | 1.0759 | 88.8% | 23 / 205 | 3 / 4 |
| 7. Deep Ensemble (3 seeds) | 3 x Method 5, majority vote | 0.9626 | 90.2% | 20 / 205 | 2 / 4 |

**Scientific conclusion:** All three domain adaptation methods (CORAL, DANN, ADDA) failed due to the same root cause — a 30,000:205 simulation-to-real class imbalance. Noise injection reduced entropy by 33% and increased high-confidence predictions 5x over baseline without collapse. The substructure signal is below the detection threshold of the Euclid Q1 PSF (FWHM ≈ 0.18 arcsec ≈ 1.8 pixels), independently confirmed by the ESA Euclid Consortium and the DeepLense GSoC 2025 team. **Track B is scientifically complete. No further work is planned.**

---

### Unseen Q1 Population Scan

After training was concluded, the V12 ensemble was applied to all 1,415 Euclid Q1 candidate files outside the standardized evaluation split (zero overlap with train/val/test — verified by skycoord crossmatch < 2 arcsec). Threshold: 0.70. TTA enabled.

| Population | Files Scanned | Flagged at t=0.70 | Flag Rate |
| :--- | :---: | :---: | :---: |
| Grade B (all) | 247 | 99 | 40.1% |
| Grade B — pure candidates (no NEG prefix) | 86 | **33** | **38.4%** |
| Grade B — NEG-prefix files | 161 | 66 | 41.0% |
| Grade C holdout | 1,168 | 526 | 45.0% |
| All-model agreement at P > 0.90 | — | 228 | — |

The 38.4% flag rate among pure Grade B candidates is a real scientific signal, consistent with Grade B's 70–90% expected true lens content. The high Grade C rate reflects out-of-distribution failure on morphologies not well-represented in training — it does not represent a valid lens prevalence estimate. Full results (1,415 rows with per-model scores) and a 32-page visual discovery gallery are published on Zenodo.

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

All models use a two-stage fine-tuning approach. Stage 1 trains the classification head only (5 epochs, LR = 1e-3) with the encoder frozen. Stage 2 unlocks the full model with a warmup encoder learning rate (1e-7 → 5e-6) and a fixed head LR of 5e-5, for up to 20 epochs with the best validation AUROC checkpoint saved. Early stopping was removed from V9 onward — its removal yielded a confirmed +0.0259 AUROC on V10.

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
│   ├── evaluation_split/
│   │   └── train_val_test_split.json   # Standardized evaluation split
│   └── metrics/                  # ROC, PR, calibration evaluation scripts
│
├── scan/
│   └── unseen_q1_scan.py         # V12 population scan over 1,415 files
│
├── frontend/                     # React + Vite web application
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

The following pipeline is **deterministic and immutable** — the exact order of operations must be preserved. V7 takes 1-channel input with no ImageNet normalisation. V10/V11 replicate the single channel to 3 channels and apply ImageNet normalisation.

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

    # 5. Resize to 224x224 (bilinear interpolation)
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
| **Grade A** | High-confidence lens candidates (~90% true lenses) | 250 | Zenodo 20056736 |
| **Grade B** | Probable lens candidates (70–90% true lenses) | 247 | Zenodo 20056736 |
| **Grade C** | Low-confidence candidates (used as training negatives) | ~1,918 | Zenodo 20056736 |
| **Verified Negatives** | Spatially independent confirmed non-lenses (EDF-South) | 285 | Zenodo 20056736 |
| **Evaluation Split** | Train/val/test split JSON — locked, never regenerate | 1 file | Zenodo 20056736 |
| **V12 Scan Results** | 1,415 unseen candidates with per-model scores + 32-page gallery | 4 files | Zenodo 20037150 |
| **ESA SLDE Catalog** | Official ESA Euclid Q1 lens candidate catalog | — | Zenodo 15025832 |

The Grade A/B catalog originates from the ESA SLDE working group (see arXiv:2512.05899). FITS cutouts were downloaded from the ESA Datalabs cutout service and are released pre-cropped and pre-catalogued. Cutouts derived from ESA Euclid Q1 data — Credit: ESA Euclid/Euclid Consortium/NASA/Q1-2025.

---

## Web Application

The application is built with React and Vite, featuring browser-native inference using ONNX Runtime Web.

**Live:** [gravitational-lensing.vercel.app](https://gravitational-lensing.vercel.app)

| Tab | Description |
| :--- | :--- |
| **Overview** | Research summary, core stats, and the two-track pipeline architecture. |
| **Learn** | Fundamental science of gravitational lensing and dark matter substructure. |
| **Journey** | Chronological research log documenting every model version, evaluation result, and design decision. |
| **Explore** | Browse the 200-image test set with Grad-CAM overlays, P(lens) scores, and substructure classifications. |
| **Analyse** | Upload Euclid VIS FITS files for real-time, client-side lens detection. |
| **Results** | Complete benchmarking tables for both Track A and Track B, including the unseen population scan. |

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

@dataset{bhabhrawala2026scan,
  author    = {Bhabhrawala, Aliasger},
  title     = {Euclid Q1 Gravitational Lens Discovery Scan Results},
  year      = {2026},
  publisher = {Zenodo},
  doi       = {10.5281/zenodo.20037150},
  url       = {https://doi.org/10.5281/zenodo.20037150}
}

@dataset{bhabhrawala2026data,
  author    = {Bhabhrawala, Aliasger},
  title     = {Euclid Q1 Strong Lensing Dataset: Graded FITS Cutouts, Model Weights, and Training Split},
  year      = {2026},
  publisher = {Zenodo},
  doi       = {10.5281/zenodo.20056736},
  url       = {https://doi.org/10.5281/zenodo.20056736}
}
```

---

## Acknowledgements

- **ESA Euclid Consortium** — for the Q1 ERO data release, the SLDE catalog, and the Datalabs cutout service. Data credit: ESA Euclid/Euclid Consortium/NASA/Q1-2025.
- **Mike Walmsley** — for the Zoobot ConvNeXt encoders and for making galaxy-pretrained weights publicly available.
- **Meta AI Research** — for the DINOv2 ViT self-supervised backbones.
- **Kaggle** — for compute resources used during model training.

---

<div align="center">
<sub>Aliasger Bhabhrawala · BITS Pilani · 2026</sub>
</div>