import React from 'react';
import OrientationStrip from '../OrientationStrip';

export default function Hero({ setActiveTab }) {
  const handleTabSwitch = (e, tab) => {
    e.preventDefault();
    setActiveTab(tab);
    window.scrollTo(0, 0);
  };

  return (
    <div className="tab-content">
      <div className="hero-dot-grid" aria-hidden="true" />
      <OrientationStrip 
        title="OVERVIEW" 
        description="The research at a glance — what was built, why it matters, and what the numbers say." 
      />
      
      <div className="container hero-wrapper">
        <div className="hero-columns">
          <div className="hero-left">
            <span className="hero-label">ESA Euclid Q1 · 2024</span>
            <h1 className="hero-title playfair">Gravitational Lens Detection</h1>
            <p className="hero-subtitle">
              A two-stage deep learning pipeline applied to real ESA Euclid Q1 imagery — a binary detector that identifies strong gravitational lenses, followed by a substructure classifier that characterises their dark matter halos as smooth, CDM, or axion.
            </p>
            <div className="hero-ctas">
              <a href="#explore" onClick={(e) => handleTabSwitch(e, 'EXPLORE')}>Explore the Data →</a>
              <a href="#analyse" onClick={(e) => handleTabSwitch(e, 'ANALYSE')}>Test the Model →</a>
            </div>
          </div>
          
          <div className="hero-right">
            <div className="stats-wrapper">
              <div className="premium-grid">
                <div className="stat-item">
                  <div className="stat-label">BINARY DETECTOR AUROC</div>
                  <div className="stat-value playfair">0.8871</div>
                  <div className="stat-sub">V12 Ensemble</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">BINARY DETECTOR F1</div>
                  <div className="stat-value playfair">0.7609</div>
                  <div className="stat-sub">200-Image Test Set</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">REAL EUCLID IMAGES</div>
                  <div className="stat-value playfair">2,415</div>
                  <div className="stat-sub">Grade A+B+C</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">SUBSTRUCTURE METHODS</div>
                  <div className="stat-value playfair">7</div>
                  <div className="stat-sub">Track B — Baseline to Deep Ensemble</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">LENSES DETECTED</div>
                  <div className="stat-value playfair">42</div>
                  <div className="stat-sub">150 Neg. + 50 Pos. Test Set</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">SUBSTRUCTURE CLASSES</div>
                  <div className="stat-value playfair">3</div>
                  <div className="stat-sub">Smooth · CDM · Axion</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ height: '120px' }}></div>
        <hr className="hr" />
        
        <div className="hero-bottom-cols">
          <div>
            <h4 className="playfair">The Problem</h4>
            <p>
              Detecting rare gravitational lenses in telescope data, then determining whether their dark matter halos are smooth, clumpy (CDM), or ultralight (axion).
            </p>
          </div>
          <div>
            <h4 className="playfair">The Data</h4>
            <p>
              497 real ESA Euclid Q1 VIS cutouts — 250 confirmed Grade A gravitational lens candidates and 247 Grade B probable candidates, plus 285 spatially independent verified non-lenses from the EDF-South field. Training used 160 Grade A positives; 50 were held out as a locked test set. Substructure classification was applied to 205 real Euclid lens images. No synthetic data was used in any final evaluation.
            </p>
          </div>
          <div>
            <h4 className="playfair">The Approach</h4>
            <p>
              A two-stage pipeline: a weighted ensemble of three galaxy-pretrained networks (Zoobot ConvNeXt-Nano, DINOv2-Small, DINOv2-Base) for binary lens detection, followed by an EfficientNet-B0 substructure classifier adapted to real Euclid data via noise injection retraining. Seven methods were evaluated for substructure classification — including three domain adaptation strategies (CORAL, DANN, ADDA), all of which failed — with all results reported transparently including failures.
            </p>
          </div>
        </div>
      </div>

      <div className="hero-pipeline-strip">
        <div className="container">
          <div className="hero-pipeline-flex">
            <div className="hp-step">
              <div className="hp-box">EUCLID FITS</div>
              <div className="hp-desc">300×300px VIS cutout</div>
            </div>
            <div className="hp-connector"></div>
            <div className="hp-step">
              <div className="hp-box">PREPROCESSING</div>
              <div className="hp-desc">log1p · pct-normalise · 224×224</div>
            </div>
            <div className="hp-connector"></div>
            <div className="hp-step">
              <div className="hp-box">BINARY DETECTOR</div>
              <div className="hp-desc">Lens / Not a Lens · t=0.70</div>
            </div>
            <div className="hp-connector">
              <div className="hp-condition">IF LENS</div>
            </div>
            <div className="hp-step">
              <div className="hp-box">SUBSTRUCTURE</div>
              <div className="hp-desc">Smooth · CDM · Axion</div>
            </div>
            <div className="hp-connector"></div>
            <div className="hp-step">
              <div className="hp-box">VERDICT</div>
              <div className="hp-desc">Class + Confidence</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
