import { useState } from 'react';
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
            {/* Best model label */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              marginBottom: '16px'
            }}>
              <span style={{
                fontSize: '11px', color: 'var(--text-tertiary)',
                textTransform: 'uppercase', letterSpacing: '0.18em',
                fontFamily: "'IBM Plex Mono', monospace"
              }}>Best Model</span>
              <span style={{ width: '1px', height: '12px', backgroundColor: 'var(--border)', display: 'inline-block' }} />
              <span className="playfair" style={{
                fontSize: '17px', color: 'var(--accent)',
                letterSpacing: '0.04em'
              }}>V12 — Ensemble</span>
            </div>

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
                <div className="res-kv-row"><div className="res-kv-key">Images evaluated:</div><div className="res-kv-val">200 (50 Grade A candidates + 150 Grade C candidates)</div></div>
                <div className="res-kv-row"><div className="res-kv-key">Positive source:</div><div className="res-kv-val">Grade A from ESA SLDE Q1 catalog — high-confidence candidates (~90% expected lenses; source TODO)</div></div>
                <div className="res-kv-row"><div className="res-kv-key">Negative source:</div><div className="res-kv-val">Grade C — low-confidence candidates treated as non-lenses</div></div>
                <div className="res-kv-row"><div className="res-kv-key">Split:</div><div className="res-kv-val">Locked before any training. Never modified. Seed = 42.</div></div>
                <div className="res-kv-row"><div className="res-kv-key">Threshold:</div><div className="res-kv-val">0.70 — selected to maximise F1 on the 200-image test set (test metrics are therefore optimistic)</div></div>
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
                      <td>V2</td><td>EfficientNet-B0 (ImageNet)</td><td>0.9910</td><td>0.8920</td><td>0.9760</td><td>0.9320</td><td>0.5000</td><td className="strikethrough">INVALIDATED</td>
                    </tr>
                    <tr className="muted">
                      <td>V3</td><td>EfficientNet-B0</td><td>0.6700</td><td>—</td><td>—</td><td>—</td><td>—</td><td className="strikethrough">FAILED</td>
                    </tr>
                    <tr className="muted">
                      <td>V4</td><td>EfficientNet-B0 (ImageNet)</td><td>0.8717</td><td>—</td><td>—</td><td>—</td><td>—</td><td className="strikethrough">INVALIDATED</td>
                    </tr>
                    <tr className="muted">
                      <td>V5</td><td>EfficientNet-B0 (ImageNet)</td><td>0.9018</td><td>0.8770</td><td>0.6240</td><td>0.7290</td><td>0.5000</td><td className="strikethrough">INVALIDATED</td>
                    </tr>
                    <tr>
                      <td>V6</td><td>EfficientNet-B0 (sim backbone)</td><td>0.7283</td><td>0.5790</td><td>0.4400</td><td>0.5000</td><td>0.5830</td><td>VALIDATED ✓</td>
                    </tr>
                    <tr>
                      <td>V7</td><td>Zoobot ConvNeXt-Nano</td><td>0.8541</td><td>0.7040</td><td>0.7600</td><td>0.7310</td><td>0.6230</td><td>VALIDATED ✓</td>
                    </tr>
                    <tr>
                      <td>V8</td><td>Zoobot ConvNeXt-Small</td><td>0.8499</td><td>0.4096</td><td>0.6800</td><td>0.5113</td><td>0.2700</td><td>VALIDATED ✓</td>
                    </tr>
                    <tr>
                      <td>V9</td><td>Zoobot ConvNeXt-Nano + challenging negative samples</td><td>0.8587</td><td>0.5450</td><td>0.7200</td><td>0.6210</td><td>0.4800</td><td>VALIDATED ✓</td>
                    </tr>
                    <tr>
                      <td>V10</td><td>DINOv2-S + challenging negative samples</td><td>0.8756</td><td>0.5760</td><td>0.7600</td><td>0.6550</td><td>0.2300</td><td>VALIDATED ✓</td>
                    </tr>
                    <tr>
                      <td>V11</td><td>DINOv2-B + challenging negative samples</td><td>0.8776</td><td>0.5560</td><td>0.8000</td><td>0.6560</td><td>0.3000</td><td>VALIDATED ✓</td>
                    </tr>
                    <tr className="highlighted best-row">
                      <td>V12</td><td>Ensemble V7+V10+V11 (0.3/0.2/0.5)</td><td><strong>0.8871</strong></td><td><strong>0.8333</strong></td><td><strong>0.7000</strong></td><td><strong>0.7609</strong></td><td>0.7000</td><td><strong>BEST ✓</strong></td>
                    </tr>
                    <tr className="muted">
                      <td>V13</td><td>Teacher model (V12 as teacher)</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>DATA MINING</td>
                    </tr>
                    <tr className="muted">
                      <td>V14</td><td>Data mining step</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>DATA MINING</td>
                    </tr>
                    <tr>
                      <td>V15</td><td>DINOv2-B + 234 pseudo-labeled positives (394 total)</td><td>0.8687</td><td>—</td><td>—</td><td>—</td><td>—</td><td>VALIDATED ✓</td>
                    </tr>
                    <tr className="muted">
                      <td>V16</td><td>DINOv2-B + 285 Hard Negatives</td><td>0.8421</td><td>—</td><td>—</td><td>—</td><td>—</td><td className="strikethrough">FAILED GATE</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="res-footnote">
                INVALIDATED = test set overlapped training data. Results not trustworthy. FAILED = model failed to converge. FAILED GATE = performance dropped below V11 baseline (-0.0355 AUROC). The threshold 0.70 for V12 was selected to maximise F1 on the 200-image test set; test metrics are therefore optimistic (TODO (author to provide): exact split used for selecting operating thresholds of V6–V11). Ensemble weights (V7=0.3, V10=0.2, V11=0.5): TODO (author to provide): how weights were chosen. V13 and V14 are data-mining steps to extract high-confidence candidates (P &gt; 0.98), not independently evaluated models. V15: TODO (author to provide): precision, recall, F1, threshold, and pseudo-label generation method. V16 added 285 verified EDF-South non-lenses to training but dropped AUROC to 0.8421, failing its gate.
              </div>
            </div>

            {/* Population Inference */}
            <div className="res-section">
              <h3 className="res-title playfair">Population Inference & Candidate Screening</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '14px', marginBottom: '16px', fontFamily: "'IBM Plex Mono', monospace" }}>
                Following the finalization of the V12 ensemble, the model was run on 1,415 untouched Euclid Q1 files (247 Grade B, 1,168 Grade C) that had zero overlap with the training, validation, or test sets. This served as a test of out-of-distribution candidate screening. No flagged object has been independently verified.
              </p>
              <div className="res-list">
                <div className="res-list-item">
                  <div className="res-list-label">PURE GRADE B CANDIDATES</div>
                  <div className="res-list-text">Of the 86 independent Grade B files with positive declination, the V12 model flagged <strong style={{color:'var(--text-primary)'}}>33 (38.4%)</strong> at threshold 0.70 (recall of ~70% was measured on Grade A test images, not Grade B; TODO (author to provide): recall measured on Grade B). No flagged candidate has been independently verified.</div>
                </div>
                <div className="res-list-item">
                  <div className="res-list-label">OUT-OF-DISTRIBUTION LIMITATIONS</div>
                  <div className="res-list-text">While V12 achieved a 4.67% (7/150) false-positive rate on the in-split Grade C test set at threshold t=0.70, the holdout flag rate is 45.0% (526/1,168) (44.2% across all 1,415 files); the cause is not established. Specific morphology causes (such as edge-on spirals, tidal features, or ring galaxies) have not been verified. TODO (author to provide): how the test negatives were sampled.</div>
                </div>
                <div className="res-list-item" style={{ borderLeftColor: '#c8b89a', backgroundColor: 'rgba(200, 184, 154, 0.05)' }}>
                  <div className="res-list-label" style={{ color: '#c8b89a' }}>OPEN SCIENCE DATA RELEASE</div>
                  <div className="res-list-text">
                    The complete scan results, including a 32-page visual candidate gallery of top candidates and full scoring logs, are permanently hosted and citable via Zenodo: <br/>
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
                  <div className="res-list-text">Switching from a simulation-pretrained EfficientNet-B0 (V6, AUROC 0.7283) to a galaxy-morphology-pretrained Zoobot ConvNeXt-Nano encoder (V7, AUROC 0.8541) yielded +0.1258 AUROC, reflecting the combined gain of the ConvNeXt-Nano architecture and real galaxy-morphology pretraining.</div>
                </div>
                <div className="res-list-item">
                  <div className="res-list-label">ENSEMBLE BEATS ANY SINGLE MODEL</div>
                  <div className="res-list-text">V12 (weighted average of V7, V10, V11) reached AUROC=0.8871 — higher than the best single model V11 at 0.8776. Diverse architectures produce complementary errors.</div>
                </div>
                <div className="res-list-item">
                  <div className="res-list-label">MORE DATA HELPS LESS THAN LABEL QUALITY</div>
                  <div className="res-list-text">Adding 234 pseudo-labeled positives (V15, 394 total positive training samples, +146% positive data) scored AUROC 0.8687 (lower than V11 on 160 clean positive labels); the cause of the lower score is not established (unverified hypothesis: pseudo-label noise). In contrast, V16 (adding 285 verified EDF-South non-lenses) dropped AUROC by 0.0355; the cause of the drop is not established (unverified hypothesis: negative-class distribution shift relative to the Grade C test set negatives).</div>
                </div>
                <div className="res-list-item">
                  <div className="res-list-label">CHALLENGING NEGATIVE SAMPLES REDUCE FALSE POSITIVES</div>
                  <div className="res-list-text">Adding 200 challenging negative samples to training (V9–V11) dropped the false positive rate on independent images from 9.1% (V7) to 2.4–3.5%. At the cost of precision.</div>
                </div>
                <div className="res-list-item">
                  <div className="res-list-label">OPERATING THRESHOLD FOR PRODUCTION</div>
                  <div className="res-list-text">V10 and V11 have AUROC above V7 but their optimal thresholds are 0.23 and 0.30 — indicating skewed threshold behavior. V7's threshold of 0.623 provides a balanced operating point (precision 0.7040). This is why V7 is used in the Analyse tab.</div>
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
                <li><strong>Distribution shift.</strong> All training and test data comes from the three Euclid Deep Fields (EDF-N, EDF-S, EDF-F). Performance on wide-field sky regions or future Euclid data releases is unknown.</li>
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

            <div className="res-subtitle" style={{ marginBottom: '32px' }}>
              Evaluated on 205 real Euclid lens images from the ESA SLDE catalog. Task: classify each lens as smooth dark matter halo, CDM subhalo, or axion-like dark matter.
            </div>

            {/* Simple, integrated breakdown */}
            <div className="res-section" style={{ marginBottom: '60px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '40px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', letterSpacing: '0.1em', marginBottom: '4px' }}>REAL DATA PREDICTIONS (N=42)</span>
                  <div style={{ display: 'flex', gap: '24px', alignItems: 'baseline' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '24px', fontWeight: 600, color: 'var(--accent)', fontFamily: "'Playfair Display', serif" }}>31</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>AXION</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '24px', fontWeight: 600, color: '#c8b89a', fontFamily: "'Playfair Display', serif" }}>11</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>CDM</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-tertiary)', fontFamily: "'Playfair Display', serif" }}>0</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>SMOOTH</span>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1, borderLeft: '1px solid var(--border)', paddingLeft: '24px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  <strong>Note:</strong> N=42 is the subset of the 200-image binary test set flagged as LENS at threshold 0.70 (35 true positives + 7 false alarms from Grade C). The N=205 figure cited elsewhere refers to the separate real Euclid lens catalog used for Track B evaluation. Zero smooth predictions are expected as catalogued lenses show visible arc distortion. These results are <em>indicative hypotheses only</em> and do not constitute ground-truth detections.
                </div>
              </div>
            </div>

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
              <h3 className="res-title playfair">Methods Used — Track B</h3>
              <div className="res-table-wrap">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>METHOD</th>
                      <th>APPROACH</th>
                      <th>ENTROPY (bits)</th>
                      <th>UNCERTAIN</th>
                      <th>HIGH-CONFIDENCE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Baseline (Method 1)</td><td>MC Dropout on original model, no adaptation</td><td>1.1236</td><td>94.6%</td><td>11 / 205</td>
                    </tr>
                    <tr className="muted">
                      <td>CORAL (Method 2) [Under Review]*</td><td>Covariance alignment, 50 epochs</td><td>0.1429*</td><td>100%*</td><td>0 / 205*</td>
                    </tr>
                    <tr className="muted">
                      <td>DANN (Method 3)</td><td>Adversarial domain adaptation, λ=0.5</td><td>1.5807</td><td>100%</td><td>0 / 205</td>
                    </tr>
                    <tr className="muted">
                      <td>ADDA (Method 4)</td><td>Adversarial discriminative adaptation, 50 epochs</td><td>1.5732</td><td>100%</td><td>0 / 205</td>
                    </tr>
                    <tr className="highlighted best-row">
                      <td><strong>Noise Injection (Method 5)</strong></td><td>Add real Euclid noise to simulation training</td><td><strong>0.7524</strong></td><td><strong>71.2%</strong></td><td><strong>59 / 205</strong></td>
                    </tr>
                    <tr>
                      <td>PSF + Noise + TTA (Method 6)</td><td>PSF blur + progressive noise + test-time augmentation</td><td>1.0759</td><td>88.8%</td><td>23 / 205</td>
                    </tr>
                    <tr>
                      <td>Deep Ensemble (Method 7)</td><td>3 seeds × Method 5, majority vote</td><td>0.9626</td><td>90.2%</td><td>20 / 205</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="res-footnote">
                Entropy max = 1.585 bits (uniform over 3 classes). High-confidence = entropy &lt; 0.5 bits. Uncertain % is the fraction of images with predictive entropy ≥ 0.5 bits. Evaluation criteria: 1. No single-class mode collapse or severe class skew (TODO (author to provide): objective measurable definition), 2. Mean entropy &lt; 1.10 bits, 3. Mean entropy &lt; 0.90 bits, 4. At least 25% (≥ 52 / 205) high-confidence predictions (entropy &lt; 0.5 bits). TODO (author to provide): reason for each cut-off, and whether it was set before or after the results. *CORAL row is under review: a reported mean entropy of 0.1429 bits is internally inconsistent with 0 / 205 high-confidence predictions (&lt; 0.5 bits) and 100% uncertain; a mean of 0.1429 bits requires at least one image with entropy &lt; 0.5 bits. TODO (author to provide): raw entropy and high-confidence output for CORAL. Regarding Criteria Passed: criteria 2 (&lt; 1.10) and 3 (&lt; 0.90) are met by 0.1429 bits, criterion 4 (≥ 52 high-confidence) is not met, and criterion 1 depends on whether the "CDM collapse" label disqualifies the model. The count of 1 / 4 is retained pending confirmation of how criterion 1 is judged. Predictive entropy across the 205 unlabeled real Euclid cutouts measures model confidence and domain-shift stability rather than ground-truth substructure accuracy. Note on Model Regeneration: An earlier substructure model had a head weight remapping bug producing uniform ~33/33/34 predictions; the current version was regenerated, and Track B results must be re-checked.
              </div>
            </div>

            {/* Why Methods 2, 3, 4 Failed */}
            <div className="res-section">
              <h3 className="res-title playfair">Why Methods 2, 3, 4 Failed</h3>
              <div className="res-list">
                <div className="res-list-item">
                  <div className="res-list-label">SIMULATION VS REAL DATA ASYMMETRY</div>
                  <div className="res-list-text">Every domain adaptation method tried to align simulation features to real image features. But with a simulation-to-real domain sample-size asymmetry reported as 30,000:205 (TODO (author to provide): source for 30,000 simulation count; 146× more simulation data), the models converged to the dominant simulation class rather than adapting. CORAL produced 100% CDM predictions. ADDA produced 100% axion predictions.</div>
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
                  <div className="res-list-label">SUBSTRUCTURE SIGNAL AND RESOLUTION</div>
                  <div className="res-list-text">The PSF FWHM of Q1 data is ~0.18 arcsec (~1.8 pixels). Substructure signatures are sub-arcsecond arc perturbations. A dedicated sensitivity study reported only 2.35% of pixels inside the Einstein radius are sensitive to subhalos under Euclid-like PSF conditions.</div>
                </div>
                <div className="res-list-item">
                  <div className="res-list-label">TASK COMPLEXITY ACROSS METHODS</div>
                  <div className="res-list-text">We tested 7 different approaches including three domain adaptation methods and a deep ensemble. Under the entropy measures reported, the classifiers did not identify substructure with high confidence on these images. Entropy measures confidence, not accuracy.</div>
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
              <p>"Under the entropy measures reported, the classifiers did not identify substructure with high confidence on these images. Entropy measures confidence, not accuracy. Track B concluded after evaluating seven domain adaptation and noise-injection methods."</p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
