import React, { useState } from 'react';
import OrientationStrip from '../OrientationStrip';

export default function Results() {
  const [activeSection, setActiveSection] = useState('BINARY DETECTOR');

  return (
    <div className="tab-content">
      <OrientationStrip 
        title="RESULTS" 
        description="Complete evaluation metrics — including a transparent account of where the model falls short." 
      />

      <div className="container section" style={{ paddingTop: 0 }}>
        
        <div className="section-switcher">
          <button 
            className={`switcher-btn ${activeSection === 'BINARY DETECTOR' ? 'active' : ''}`}
            onClick={() => setActiveSection('BINARY DETECTOR')}
          >
            BINARY DETECTOR
          </button>
          <button 
            className={`switcher-btn ${activeSection === 'SUBSTRUCTURE CLASSIFIER' ? 'active' : ''}`}
            onClick={() => setActiveSection('SUBSTRUCTURE CLASSIFIER')}
          >
            SUBSTRUCTURE CLASSIFIER
          </button>
        </div>

        {activeSection === 'BINARY DETECTOR' && (
          <div>
            {/* Top Metric Boxes */}
            <div className="metrics-grid-container" style={{ marginBottom: '24px' }}>
              <div className="metrics-grid">
                <div className="metric-card" data-tooltip="Overall ability of the model to distinguish between lenses and non-lenses.">
                  <div className="metric-value playfair">0.8871</div>
                  <div className="metric-label">AUROC</div>
                </div>
                <div className="metric-card" data-tooltip="A balanced measure of accuracy combining precision and recall.">
                  <div className="metric-value playfair">0.7609</div>
                  <div className="metric-label">F1 Score</div>
                </div>
                <div className="metric-card" data-tooltip="Out of all images the model claimed were lenses, this percentage actually were.">
                  <div className="metric-value playfair">0.8333</div>
                  <div className="metric-label">Precision</div>
                </div>
                <div className="metric-card" data-tooltip="Out of all true lenses in the dataset, the model successfully found this percentage.">
                  <div className="metric-value playfair">0.7000</div>
                  <div className="metric-label">Recall</div>
                </div>
              </div>
            </div>
            <div className="res-subtitle">V12 ensemble metrics at threshold = 0.70 on the locked test set (200 images: 50 Grade A positives + 150 Grade C negatives).</div>

            {/* Confusion Matrix */}
            <div className="cm-container" style={{ marginTop: '80px', marginBottom: '80px' }}>
              <h3 className="cm-title playfair">Confusion Matrix (V12 at t=0.70)</h3>
              <div className="cm-grid">
                <div className="cm-header-top">Predicted</div>
                <div className="cm-header-left">Actual</div>
                
                <div className="cm-cell bg-surface-2" style={{ gridColumn: 2, gridRow: 2 }} data-tooltip="Real lenses that the model correctly identified as lenses.">
                  <div className="cm-number">35</div>
                  <div className="cm-label">True Positives</div>
                </div>
                <div className="cm-cell bg-surface" style={{ gridColumn: 3, gridRow: 2 }} data-tooltip="Non-lenses that the model mistakenly flagged as lenses.">
                  <div className="cm-number">7</div>
                  <div className="cm-label">False Positives</div>
                </div>
                <div className="cm-cell bg-surface" style={{ gridColumn: 2, gridRow: 3 }} data-tooltip="Real lenses that the model missed or ignored.">
                  <div className="cm-number">15</div>
                  <div className="cm-label">False Negatives</div>
                </div>
                <div className="cm-cell bg-surface-2" style={{ gridColumn: 3, gridRow: 3 }} data-tooltip="Non-lenses that the model correctly ignored.">
                  <div className="cm-number">143</div>
                  <div className="cm-label">True Negatives</div>
                </div>
              </div>
            </div>

            {/* About This Test Set */}
            <div className="res-section">
              <h3 className="res-title playfair">About This Test Set</h3>
              <div className="res-kv-grid">
                <div className="res-kv-row"><div className="res-kv-key">Images evaluated:</div><div className="res-kv-val">200 (50 confirmed lens candidates + 150 non-lenses)</div></div>
                <div className="res-kv-row"><div className="res-kv-key">Positive source:</div><div className="res-kv-val">Grade A from ESA SLDE Q1 catalog — expert-confirmed lens candidates</div></div>
                <div className="res-kv-row"><div className="res-kv-key">Negative source:</div><div className="res-kv-val">Grade C — low-confidence candidates treated as non-lenses</div></div>
                <div className="res-kv-row"><div className="res-kv-key">Split:</div><div className="res-kv-val">Locked before any training. Never modified. Seed = 42.</div></div>
                <div className="res-kv-row"><div className="res-kv-key">Threshold:</div><div className="res-kv-val">0.70 — images scoring above this are classified as LENS</div></div>
                <div className="res-kv-row"><div className="res-kv-key">Contamination note:</div><div className="res-kv-val">Models V2–V5 were trained on data that overlapped the test set. Their results are invalid and shown in the table marked as INVALIDATED for transparency.</div></div>
              </div>
            </div>

            {/* Model Progression */}
            <div className="res-section">
              <h3 className="res-title playfair">All Models Trained — Track A</h3>
              <div className="res-table-wrap">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>MODEL</th>
                      <th>ARCHITECTURE</th>
                      <th>AUROC</th>
                      <th>PRECISION</th>
                      <th>RECALL</th>
                      <th>F1</th>
                      <th>THRESHOLD</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="muted">
                      <td>V2</td><td>EfficientNet-B0 (ImageNet)</td><td>0.9910</td><td>0.892</td><td>0.976</td><td>0.929</td><td>0.50</td><td className="strikethrough">INVALIDATED</td>
                    </tr>
                    <tr className="muted">
                      <td>V3</td><td>EfficientNet-B0</td><td>0.6700</td><td>—</td><td>—</td><td>—</td><td>—</td><td className="strikethrough">FAILED</td>
                    </tr>
                    <tr className="muted">
                      <td>V4</td><td>EfficientNet-B0 (ImageNet)</td><td>0.8717</td><td>—</td><td>—</td><td>—</td><td>—</td><td className="strikethrough">INVALIDATED</td>
                    </tr>
                    <tr className="muted">
                      <td>V5</td><td>EfficientNet-B0 (ImageNet)</td><td>0.9018</td><td>0.877</td><td>0.624</td><td>0.729</td><td>0.50</td><td className="strikethrough">INVALIDATED</td>
                    </tr>
                    <tr>
                      <td>V6</td><td>EfficientNet-B0 (sim backbone)</td><td>0.7283</td><td>0.579</td><td>0.440</td><td>0.500</td><td>0.583</td><td>VALIDATED ✓</td>
                    </tr>
                    <tr>
                      <td>V7</td><td>Zoobot ConvNeXt-Nano</td><td>0.8541</td><td>0.704</td><td>0.760</td><td>0.731</td><td>0.623</td><td>VALIDATED ✓</td>
                    </tr>
                    <tr>
                      <td>V8</td><td>Zoobot ConvNeXt-Small</td><td>0.8499</td><td>0.4096</td><td>0.6800</td><td>0.5113</td><td>0.2700</td><td>VALIDATED ✓</td>
                    </tr>
                    <tr>
                      <td>V9</td><td>Zoobot ConvNeXt-Nano + challenging negative samples</td><td>0.8587</td><td>0.546</td><td>0.720</td><td>0.621</td><td>0.480</td><td>VALIDATED ✓</td>
                    </tr>
                    <tr>
                      <td>V10</td><td>DINOv2-S + challenging negative samples</td><td>0.8756</td><td>0.576</td><td>0.760</td><td>0.655</td><td>0.230</td><td>VALIDATED ✓</td>
                    </tr>
                    <tr>
                      <td>V11</td><td>DINOv2-B + challenging negative samples</td><td>0.8776</td><td>0.556</td><td>0.800</td><td>0.656</td><td>0.300</td><td>VALIDATED ✓</td>
                    </tr>
                    <tr className="highlighted best-row">
                      <td>V12</td><td>Ensemble V7+V10+V11 (0.3/0.2/0.5)</td><td><strong>0.8871</strong></td><td><strong>0.833</strong></td><td><strong>0.700</strong></td><td><strong>0.761</strong></td><td>0.700</td><td><strong>BEST ✓</strong></td>
                    </tr>
                    <tr className="muted">
                      <td>V13</td><td>Teacher model (V12 as teacher)</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>DATA MINING</td>
                    </tr>
                    <tr className="muted">
                      <td>V14</td><td>Data mining step</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>DATA MINING</td>
                    </tr>
                    <tr>
                      <td>V15</td><td>DINOv2-B + 394 pseudo-labeled positives</td><td>0.8687</td><td>—</td><td>—</td><td>—</td><td>—</td><td>VALIDATED ✓</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="res-footnote">
                INVALIDATED = test set overlapped training data. Results not trustworthy. FAILED = model failed to converge.
              </div>
            </div>

            {/* Population Inference */}
            <div className="res-section">
              <h3 className="res-title playfair">Population Inference & Discovery</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '14px', marginBottom: '16px', fontFamily: "'IBM Plex Mono', monospace" }}>
                Following the finalization of the V12 ensemble, the model was run on 1,415 untouched Euclid Q1 files (247 Grade B, 1,168 Grade C) that had zero overlap with the training, validation, or test sets. This served as the ultimate test of out-of-distribution discovery.
              </p>
              <div className="res-list">
                <div className="res-list-item">
                  <div className="res-list-label">PURE GRADE B CANDIDATES</div>
                  <div className="res-list-text">Of the 86 human-vetted, independent Grade B files, the V12 model flagged <strong style={{color:'var(--text-primary)'}}>33 (38.4%)</strong> as high-confidence lenses (P ≥ 0.70). These represent the most scientifically credible new candidates produced by the project.</div>
                </div>
                <div className="res-list-item">
                  <div className="res-list-label">OUT-OF-DISTRIBUTION LIMITATIONS</div>
                  <div className="res-list-text">The model exhibited a 44.2% overall flag rate across all 1,415 files, driven by false positives on diverse Grade C morphologies never seen in training. This confirms the generalization limits documented by ESA.</div>
                </div>
                <div className="res-list-item" style={{ borderLeftColor: '#c8b89a', backgroundColor: 'rgba(200, 184, 154, 0.05)' }}>
                  <div className="res-list-label" style={{ color: '#c8b89a' }}>OPEN SCIENCE DATA RELEASE</div>
                  <div className="res-list-text">
                    The complete scan results, including a 32-page visual discovery gallery of the top candidates and full scoring logs, are permanently hosted and citable via Zenodo: <br/>
                    <a href="https://doi.org/10.5281/zenodo.20037150" target="_blank" rel="noopener noreferrer" style={{ color: '#c8b89a', textDecoration: 'underline', marginTop: '8px', display: 'inline-block' }}>
                      doi.org/10.5281/zenodo.20037150
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Findings */}
            <div className="res-section">
              <h3 className="res-title playfair">Key Findings</h3>
              <div className="res-list">
                <div className="res-list-item">
                  <div className="res-list-label">GALAXY-PRETRAINED BACKBONES ARE ESSENTIAL</div>
                  <div className="res-list-text">Switching from a simulation-pretrained backbone (V6, AUROC=0.7283) to Zoobot pretrained on real galaxy images (V7, AUROC=0.8541) gave +0.1258 AUROC improvement. The model needs to have already seen galaxies.</div>
                </div>
                <div className="res-list-item">
                  <div className="res-list-label">ENSEMBLE BEATS ANY SINGLE MODEL</div>
                  <div className="res-list-text">V12 (weighted average of V7, V10, V11) reached AUROC=0.8871 — higher than the best single model V11 at 0.8776. Diverse architectures produce complementary errors.</div>
                </div>
                <div className="res-list-item">
                  <div className="res-list-label">MORE DATA HELPS LESS THAN LABEL QUALITY</div>
                  <div className="res-list-text">V15 used 394 training positives (vs 160 for V11) by mining pseudo-labels. Result: AUROC=0.8687 — worse than V11's 0.8776. Pseudo-label noise offset the quantity gain.</div>
                </div>
                <div className="res-list-item">
                  <div className="res-list-label">CHALLENGING NEGATIVE SAMPLES REDUCE FALSE POSITIVES</div>
                  <div className="res-list-text">Adding 200 challenging negative samples to training (V9–V11) dropped the false positive rate on independent images from 9.1% (V7) to 2.4–3.5%. At the cost of precision.</div>
                </div>
                <div className="res-list-item">
                  <div className="res-list-label">CALIBRATION MATTERS FOR A PRODUCTION MODEL</div>
                  <div className="res-list-text">V10 and V11 have AUROC above V7 but their optimal thresholds are 0.23 and 0.30 — indicating miscalibrated probabilities. V7's threshold of 0.623 is meaningful. This is why V7 is used in the Analyse tab.</div>
                </div>
                <div className="res-list-item">
                  <div className="res-list-label">FOCAL LOSS IS NOT RECOMMENDED</div>
                  <div className="res-list-text">V3 used focal loss (gamma=2.0) and failed to converge at AUROC=0.67. It down-weighted the most reliable training examples. Never used again in any version.</div>
                </div>
              </div>
            </div>

            {/* Limitations */}
            <div className="res-section">
              <h3 className="res-title playfair">Limitations</h3>
              <ul className="res-bullet-list">
                <li><strong>Only 50 true test positives.</strong> AUROC differences smaller than ~0.02 between models may not be statistically meaningful at this sample size.</li>
                <li><strong>Grade A is not ground truth.</strong> ESA experts estimate ~10% of Grade A are false positives. Some "true positives" in our test set may not actually be lenses.</li>
                <li><strong>Distribution shift.</strong> All training and test data comes from two ESA sky fields. Performance on other sky regions or future Euclid data releases is unknown.</li>
                <li><strong>Threshold is a choice.</strong> At t=0.70, recall is 0.70 — meaning 30% of real lenses in our test set were missed. A lower threshold catches more lenses but increases false positives. There is no universally correct threshold.</li>
              </ul>
            </div>
          </div>
        )}

        {activeSection === 'SUBSTRUCTURE CLASSIFIER' && (
          <div>
            {/* Top Metric Boxes */}
            <div className="metrics-grid-container" style={{ marginBottom: '24px' }}>
              <div className="metrics-grid">
                <div className="metric-card" data-tooltip="Adding artificial noise to simulations helped the model handle real noisy telescope images.">
                  <div className="metric-value playfair" style={{fontSize: '24px'}}>Method 5</div>
                  <div className="metric-label">Best Method (Noise Injection)</div>
                </div>
                <div className="metric-card" data-tooltip="How uncertain the model is. Lower entropy means higher confidence in its prediction.">
                  <div className="metric-value playfair">0.7524</div>
                  <div className="metric-label">Entropy (bits)</div>
                </div>
                <div className="metric-card" data-tooltip="Number of images where the model was highly certain (entropy < 0.5).">
                  <div className="metric-value playfair">59/205</div>
                  <div className="metric-label">High-Confidence</div>
                </div>
                <div className="metric-card" data-tooltip="Passed our strict tests for reliability: low entropy, low uncertainty, no class collapse.">
                  <div className="metric-value playfair">4/4</div>
                  <div className="metric-label">Criteria Passed</div>
                </div>
              </div>
            </div>
            <div className="res-subtitle">Evaluated on 205 real Euclid lens images from the ESA SLDE catalog. Task: classify each lens as smooth dark matter halo, CDM subhalo, or axion-like dark matter.</div>

            {/* What Is This Task? */}
            <div className="res-section" style={{ marginTop: '80px' }}>
              <h3 className="res-title playfair">What Is This Task?</h3>
              <ul className="res-clean-list">
                <li>The lensing galaxy distorts background light. The exact shape of distortion depends on the dark matter distribution inside it.</li>
                <li><strong>Smooth</strong> = undisturbed halo. <strong>CDM</strong> = cold dark matter subhalos clumped inside. <strong>Axion</strong> = diffuse wave-like dark matter.</li>
                <li>A model trained on simulations of each type was adapted to classify real Euclid images.</li>
              </ul>
            </div>

            {/* All Methods Tried */}
            <div className="res-section">
              <h3 className="res-title playfair">Domain Adaptation Methods — Track B</h3>
              <div className="res-table-wrap">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>METHOD</th>
                      <th>APPROACH</th>
                      <th>ENTROPY (bits)</th>
                      <th>UNCERTAIN</th>
                      <th>HIGH-CONFIDENCE</th>
                      <th>CRITERIA PASSED</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Baseline (Method 1)</td><td>MC Dropout on original model, no adaptation</td><td>1.1236</td><td>94.6%</td><td>11 / 205</td><td>0 / 4</td>
                    </tr>
                    <tr className="muted">
                      <td>CORAL (Method 2)</td><td>Covariance alignment, 50 epochs</td><td>0.1429</td><td>100%</td><td>0 / 205</td><td className="strikethrough">0 / 4</td>
                    </tr>
                    <tr className="muted">
                      <td>DANN (Method 3)</td><td>Adversarial domain adaptation, λ=0.5</td><td>1.5807</td><td>100%</td><td>0 / 205</td><td className="strikethrough">0 / 4</td>
                    </tr>
                    <tr className="muted">
                      <td>ADDA (Method 4)</td><td>Adversarial discriminative adaptation, 50 epochs</td><td>1.5732</td><td>100%</td><td>0 / 205</td><td className="strikethrough">0 / 4</td>
                    </tr>
                    <tr className="highlighted best-row">
                      <td><strong>Noise Injection (Method 5)</strong></td><td>Add real Euclid noise to simulation training</td><td><strong>0.7524</strong></td><td><strong>71.2%</strong></td><td><strong>59 / 205</strong></td><td><strong>4 / 4</strong></td>
                    </tr>
                    <tr>
                      <td>PSF + Noise + TTA (Method 6)</td><td>PSF blur + progressive noise + test-time augmentation</td><td>1.0759</td><td>88.8%</td><td>23 / 205</td><td>3 / 4</td>
                    </tr>
                    <tr>
                      <td>Deep Ensemble (Method 7)</td><td>3 seeds × Method 5, majority vote</td><td>0.9626</td><td>90.2%</td><td>20 / 205</td><td>—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="res-footnote">
                Entropy max = 1.585 bits (uniform over 3 classes). High-confidence = entropy &lt; 0.5 bits. Criteria: entropy &lt; 0.9, uncertain fraction &lt; 80%, high-confidence count &gt; 40, no class collapse.
              </div>
            </div>

            {/* Why Methods 2, 3, 4 Failed */}
            <div className="res-section">
              <h3 className="res-title playfair">Why Methods 2, 3, 4 Failed</h3>
              <div className="res-list">
                <div className="res-list-item">
                  <div className="res-list-label">THE CORE PROBLEM: 30,000 SIMULATIONS VS 205 REAL IMAGES</div>
                  <div className="res-list-text">Every domain adaptation method tried to align simulation features to real image features. But with 147× more simulation data, the models converged to the dominant simulation class rather than adapting. CORAL produced 100% CDM predictions. ADDA produced 100% axion predictions.</div>
                </div>
                <div className="res-list-item">
                  <div className="res-list-label">WHY NOISE INJECTION WORKED</div>
                  <div className="res-list-text">Instead of aligning features, Method 5 made the model uncertain where it should be uncertain. Adding Gaussian noise matching real Euclid sensor noise (σ ≈ 0.03 in log1p space) during training taught the model that some of what it was confident about in simulations doesn't exist in real data.</div>
                </div>
                <div className="res-list-item">
                  <div className="res-list-label">WHY THE DEEP ENSEMBLE (METHOD 7) WAS WORSE THAN A SINGLE MODEL</div>
                  <div className="res-list-text">Three independently trained models disagreed on individual images — the same image got CDM from seed 1 and AXION from seed 2. Ensemble entropy (0.9626) was higher than single-model entropy (0.7524). This proved that individual model confidence on real Euclid substructure images is partially spurious.</div>
                </div>
              </div>
            </div>

            {/* Key Findings */}
            <div className="res-section">
              <h3 className="res-title playfair">Key Findings</h3>
              <div className="res-list">
                <div className="res-list-item">
                  <div className="res-list-label">SUBSTRUCTURE SIGNAL IS BELOW EUCLID Q1 DETECTION THRESHOLD</div>
                  <div className="res-list-text">The PSF FWHM of Q1 data is ~0.18 arcsec (~1.8 pixels). Substructure signatures are sub-arcsecond arc perturbations. The telescope blurs exactly the features needed to tell substructure classes apart. A dedicated sensitivity study found only 2.35% of pixels inside the Einstein radius are sensitive to subhalos under Euclid-like PSF conditions.</div>
                </div>
                <div className="res-list-item">
                  <div className="res-list-label">THIS IS A PHYSICS LIMITATION, NOT AN ARCHITECTURE LIMITATION</div>
                  <div className="res-list-text">We tested 7 different approaches including three domain adaptation methods and a deep ensemble. The conclusion is consistent: this task cannot be solved with Q1 data quality at this scale. The DeepLense GSoC 2025 team independently reached the same conclusion. ESA confirmed Q1 PSF is inadequate for substructure studies.</div>
                </div>
                <div className="res-list-item">
                  <div className="res-list-label">THE 59 HIGH-CONFIDENCE PREDICTIONS ARE EXPLORATORY, NOT GROUND TRUTH</div>
                  <div className="res-list-text">Method 5 produced 59 images where the model was confident (entropy &lt; 0.5 bits). These are the most defensible substructure inferences this project can make. They should be treated as hypotheses, not detections.</div>
                </div>
              </div>
            </div>

            {/* Limitations */}
            <div className="res-section">
              <h3 className="res-title playfair">Limitations</h3>
              <ul className="res-bullet-list">
                <li><strong>No labeled real data.</strong> There are no real Euclid images with verified substructure class labels. The model was trained entirely on simulations. There is no way to validate substructure predictions on real images.</li>
                <li><strong>Simulation gap.</strong> Simulations do not fully capture real telescope noise, PSF variation, neighbouring galaxy light contamination, or detector artifacts. Every model trained only on simulations inherits this gap.</li>
                <li><strong>205 real images is not enough.</strong> Even if PSF quality were sufficient, 205 labeled examples is far below what is needed for reliable domain adaptation with three classes.</li>
                <li><strong>Future data.</strong> Euclid DR2 and later releases will have better PSF characterisation and more images. The substructure classification task may become tractable with future data, better simulations, or foundation models pretrained on astronomical surveys.</li>
              </ul>
            </div>

            {/* Scientific Conclusion */}
            <div className="res-conclusion-box">
              <p>"The simulation-to-real substructure domain gap is unsolvable at current Q1 data quality. The limitation is physics — not model architecture, not data quantity, not training methodology. This result is consistent with ESA's own assessment and an independent finding by the DeepLense GSoC 2025 team. Track B is scientifically complete."</p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
