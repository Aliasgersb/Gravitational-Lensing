import React, { useState, useEffect, useCallback, useRef } from 'react';
import OrientationStrip from '../OrientationStrip';

// ── Largest-remainder rounding so percentages always sum to 100 ──────────────
function roundToHundred(smooth, cdm, axion) {
  const vals = [smooth, cdm, axion];
  let floored = vals.map(v => Math.floor(v * 100));
  const remainders = vals.map((v, i) => (v * 100) - floored[i]);
  let remaining = 100 - floored.reduce((a, b) => a + b, 0);
  const indices = [0, 1, 2].sort((a, b) => remainders[b] - remainders[a]);
  for (let i = 0; i < remaining; i++) floored[indices[i]]++;
  
  for (let i = 0; i < 3; i++) {
    if (floored[i] === 0) {
      floored[i] = 1;
      let maxIdx = floored.indexOf(Math.max(...floored));
      floored[maxIdx]--;
    }
  }
  
  return { smooth: floored[0], cdm: floored[1], axion: floored[2] };
}

// ── Image with fallback ───────────────────────────────────────────────────────
function FallbackImg({ src, alt, className, style }) {
  const [error, setError] = useState(false);
  return error ? (
    <div className={`exp-img-fallback ${className || ''}`} style={style}>
      <span>Image unavailable</span>
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      onError={() => setError(true)}
    />
  );
}

// ── About Banner ──────────────────────────────────────────────────────────────
function AboutBanner({ meta }) {
  const [open, setOpen] = useState(false);
  const aurocMatch = meta.plens_model.match(/AUROC=([\d.]+)/);
  const auroc = aurocMatch ? aurocMatch[1] : '0.8871';

  return (
    <div className="exp-about">
      <button className="exp-about-toggle" onClick={() => setOpen(o => !o)}>
        <span>About these results</span>
        <span className="exp-about-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="exp-about-body">
          <div className="exp-about-grid">
            <div className="exp-about-item">
              <div className="exp-about-label">What you're looking at</div>
              <div className="exp-about-text">{meta.total_images} real images from the locked test split of the ESA Euclid telescope, each processed by our V12 ensemble model. The model assigns a probability that each image contains a gravitational lens — a massive galaxy bending light from something behind it.</div>
            </div>
            <div className="exp-about-item">
              <div className="exp-about-label">Threshold</div>
              <div className="exp-about-text">Images scoring above {meta.threshold.toFixed(2)} are labelled LENS. This is a chosen operating point, not a physical truth. At this threshold our model achieves AUROC = {auroc} on this exact set of images.</div>
            </div>
            <div className="exp-about-item">
              <div className="exp-about-label">Grade A vs Grade C</div>
              <div className="exp-about-text">Grade A images are expert-confirmed high-confidence lens candidates from the ESA SLDE catalog. Grade C are low-confidence candidates treated as non-lenses. A Grade A image labelled NOT A LENS here means our model made a false negative on an expert candidate.</div>
            </div>
            <div className="exp-about-item">
              <div className="exp-about-label">Grad-CAM</div>
              <div className="exp-about-text">The attention overlay shows which pixels drove the model's decision. Because the V12 ensemble combines three architectures, these overlays are computed from the individual components (V7, V10, V11) and blended at the ensemble's respective weights (0.3 / 0.2 / 0.5). For lenses, hot red regions typically highlight the central deflecting galaxy or arc structure.</div>
            </div>
            <div className="exp-about-item exp-about-item--wide">
              <div className="exp-about-label">Substructure</div>
              <div className="exp-about-text">For images classified as LENS, a second model predicts whether the lens appears smooth, CDM-like (cold dark matter subhalos), or axion-like. Because the true underlying dark matter distribution is fundamentally unknown for real telescope images, this model can only be trained on simulated data. Furthermore, Euclid Q1 data has a PSF resolution that blurs sub-arcsecond features, so these predictions carry significant uncertainty. They are exploratory, not ground truth.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Grid Card ─────────────────────────────────────────────────────────────────
function ExploreCard({ item, onClick }) {
  const [showGradcam, setShowGradcam] = useState(false);
  const [hovered, setHovered] = useState(false);

  const imgSrc = showGradcam
    ? `/explore/images/${item.id}_gradcam.png`
    : `/explore/images/${item.id}_raw.png`;

  const handleToggle = (e) => {
    e.stopPropagation();
    setShowGradcam(v => !v);
  };

  const isFallback = item.p_lens_source === 'v7_fallback';

  return (
    <div
      className="exp-card"
      onClick={() => onClick(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="exp-card-img-wrap">
        <FallbackImg
          src={imgSrc}
          alt={`${item.id} ${showGradcam ? 'gradcam' : 'raw'}`}
          className="exp-card-img"
        />
        {item.has_gradcam && hovered && (
          <button
            className={`exp-gradcam-pill ${showGradcam ? 'active' : ''}`}
            onClick={handleToggle}
            title={showGradcam ? 'Switch to raw image' : 'Switch to GradCAM overlay'}
          >
            {showGradcam ? 'RAW' : 'GRAD-CAM'}
          </button>
        )}
        <div className={`exp-verdict-chip exp-verdict-chip--${item.verdict === 'LENS' ? 'lens' : 'not'}`}>
          {item.verdict === 'LENS' ? 'LENS' : 'NOT A LENS'}
        </div>
      </div>

      <div className="exp-card-info">
        <div className="exp-card-coords">RA: {item.ra.toFixed(4)} · Dec: {item.dec.toFixed(4)}</div>

        <div className="exp-card-score-row">
          <span className="exp-card-score">
            P(lens): {item.p_lens.toFixed(3)}
            {isFallback && (
              <span className="exp-fallback-marker" title="Score from single model (V7), not full ensemble">~</span>
            )}
          </span>
          <span className={`exp-grade-pill exp-grade-pill--${item.grade.toLowerCase()}`}>
            GRADE {item.grade}
          </span>
        </div>

        {item.verdict === 'LENS' && item.substructure && (
          <div className="exp-card-sub">
            <span className="exp-sub-label">SUBSTRUCTURE</span>
            <span className="exp-sub-class">{item.substructure.top_class}</span>
            <span className={`exp-sub-conf ${item.substructure.confidence === 'HIGH' ? 'high' : 'low'}`}>
              {item.substructure.confidence === 'HIGH' ? 'HIGH CONFIDENCE' : 'UNCERTAIN'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Entropy Bar ───────────────────────────────────────────────────────────────
function EntropyBar({ entropy, maxEntropy = 1.585 }) {
  const pct = Math.min((entropy / maxEntropy) * 100, 100);
  return (
    <div className="exp-entropy-bar-wrap">
      <div className="exp-entropy-bar-track">
        <div className="exp-entropy-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="exp-entropy-val">{entropy.toFixed(3)} / {maxEntropy} bits</span>
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function DetailModal({ item, meta, onClose }) {
  const [modalView, setModalView] = useState('raw');
  const overlayRef = useRef(null);

  const aurocMatch = meta.plens_model.match(/AUROC=([\d.]+)/);
  const auroc = aurocMatch ? aurocMatch[1] : '0.8871';

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    };
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const imgSrc = modalView === 'gradcam'
    ? `/explore/images/${item.id}_gradcam.png`
    : `/explore/images/${item.id}_raw.png`;

  const isFallback = item.p_lens_source === 'v7_fallback';

  let subPcts = null;
  if (item.substructure) {
    const { smooth: sm, cdm, axion: ax } = roundToHundred(
      item.substructure.smooth,
      item.substructure.cdm,
      item.substructure.axion
    );
    subPcts = { smooth: sm, cdm, axion: ax };
  }

  const isLens = item.verdict === 'LENS';

  return (
    <div className="exp-modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="exp-modal" role="dialog" aria-modal="true">
        <button className="exp-modal-close" onClick={onClose} aria-label="Close">✕</button>

        {/* ── Left: image ── */}
        <div className="exp-modal-left">
          {item.has_gradcam && (
            <div className="exp-modal-img-tabs">
              <button
                className={`exp-modal-img-tab ${modalView === 'raw' ? 'active' : ''}`}
                onClick={() => setModalView('raw')}
              >IMAGE</button>
              <button
                className={`exp-modal-img-tab ${modalView === 'gradcam' ? 'active' : ''}`}
                onClick={() => setModalView('gradcam')}
              >GRAD-CAM</button>
            </div>
          )}
          <div className="exp-modal-img-wrap">
            <FallbackImg src={imgSrc} alt={`${item.id} ${modalView}`} className="exp-modal-img" />
            {modalView === 'gradcam' && (
              <div className="exp-gradcam-legend">
                <span className="exp-gradcam-legend-bar" />
                <span className="exp-gradcam-legend-label">Low attention</span>
                <span className="exp-gradcam-legend-label right">High attention</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: metadata ── */}
        <div className="exp-modal-right">

          {/* Section 1 — Coordinates */}
          <div className="exp-modal-section">
            <div className="exp-modal-section-label">Coordinates</div>
            <div className="exp-modal-coords-row">
              <div className="exp-modal-coord">
                <span className="exp-modal-coord-key">RA</span>
                <span className="exp-modal-coord-val">{item.ra.toFixed(4)}</span>
              </div>
              <div className="exp-modal-coord">
                <span className="exp-modal-coord-key">DEC</span>
                <span className="exp-modal-coord-val">{item.dec.toFixed(4)}</span>
              </div>
              <div className="exp-modal-coord">
                <span className="exp-modal-coord-key">Grade</span>
                <span className={`exp-modal-coord-val exp-modal-grade--${item.grade.toLowerCase()}`}>{item.grade}</span>
              </div>
            </div>
          </div>

          <div className="exp-modal-divider" />

          {/* Section 2 — Binary Classification */}
          <div className="exp-modal-section">
            <div className="exp-modal-section-label">Binary Classification — V12 Ensemble</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className={`exp-modal-verdict-v2 exp-modal-verdict--${isLens ? 'lens' : 'not'}`}>
                <span className="exp-modal-verdict-dot">{isLens ? '●' : '○'}</span>
                <span className="exp-modal-verdict-text">{isLens ? 'LENS' : 'NOT A LENS'}</span>
              </div>
              <span className="exp-modal-verdict-model-note">(Predicted by model)</span>
            </div>
            <div className="exp-modal-plens-row">
              <span className="exp-modal-plens-label">P(lens)</span>
              <div className="exp-modal-plens-bar-wrap">
                <div className="exp-modal-plens-bar-track">
                  <div className="exp-modal-plens-bar-fill" style={{ width: `${Math.min(100, item.p_lens * 100).toFixed(1)}%`, backgroundColor: isLens ? 'var(--accent)' : '#555' }} />
                  <div className="exp-modal-plens-bar-tick" style={{ left: `${meta.threshold * 100}%` }} />
                </div>
              </div>
              <span className="exp-modal-plens-val">
                {item.p_lens.toFixed(3)}
                {isFallback && <span className="exp-fallback-marker" title="Score from V7 single model, not full V12 ensemble">~</span>}
              </span>
            </div>
            <div className="exp-modal-threshold-note">Threshold: {meta.threshold.toFixed(2)} · AUROC: {auroc}</div>

            {!isLens && item.grade === 'A' && (
              <div className="exp-modal-fn-alert">
                <span className="exp-modal-fn-icon">!</span>
                <span><strong>False negative.</strong> Grade A = expert-confirmed lens candidate. Missed at the {meta.threshold.toFixed(2)} threshold.</span>
              </div>
            )}
            {!isLens && item.grade === 'C' && (
              <div className="exp-modal-grade-note">
                Grade C — low-confidence catalog candidate. Model verdict aligns with expert assessment.
              </div>
            )}
            {!isLens && item.has_gradcam && (
              <div className="exp-modal-gradcam-note">
                <p className="exp-modal-gradcam-note-title">Reading the Grad-CAM</p>
                <p>Diffuse or edge-biased attention confirms no compelling lens structure. Switch to GRAD-CAM above to inspect.</p>
              </div>
            )}
          </div>

          {/* Section 3 — Substructure (LENS only) */}
          {isLens && item.substructure && subPcts && (
            <>
              <div className="exp-modal-divider" />
              <div className="exp-modal-section">
                <div className="exp-modal-section-label">Substructure Classification</div>
                <div className="exp-modal-sub-boxes">
                  {[
                    { key: 'smooth', label: 'SMOOTH', pct: subPcts.smooth },
                    { key: 'cdm',    label: 'CDM',    pct: subPcts.cdm    },
                    { key: 'axion',  label: 'AXION',  pct: subPcts.axion  },
                  ].map(({ key, label, pct }) => (
                    <div key={key} className={`exp-modal-sub-box ${item.substructure.top_class === label ? 'active' : ''}`}>
                      <div className="exp-modal-sub-name">{label}</div>
                      <div className="exp-modal-sub-pct">{pct}<span>%</span></div>
                    </div>
                  ))}
                </div>
                <div className="exp-modal-entropy-row">
                  <span className="exp-modal-entropy-label">Model Uncertainty</span>
                  <EntropyBar entropy={item.substructure.entropy} />
                </div>
                <div className={`exp-modal-conf-tag ${item.substructure.confidence === 'HIGH' ? 'high' : 'low'}`}>
                  {item.substructure.confidence === 'HIGH'
                    ? '✓ HIGH CONFIDENCE — entropy below 0.5 bits'
                    : `⚠ UNCERTAIN — entropy ${item.substructure.entropy.toFixed(3)} / 1.585 bits`}
                </div>
                <p className="exp-modal-disclaimer">
                  Classifies dark matter substructure type (Smooth / CDM / Axion) — not a direct detection. Trained on simulations only; Euclid Q1 PSF limits substructure detectability.
                </p>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="exp-modal-divider" />
          <div className="exp-modal-filename">
            <span className="exp-modal-filename-label">File</span>
            <span className="exp-modal-filename-val">{item.filename}</span>
          </div>
          {isFallback && (
            <div className="exp-modal-fallback-note">~ Score from V7 single model (fallback) — not the full V12 ensemble.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Explore Component ────────────────────────────────────────────────────
export default function Explore() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [verdictFilter, setVerdictFilter] = useState('ALL');
  const [subFilter, setSubFilter] = useState('ALL TYPES');
  const [sortMode, setSortMode] = useState('conf_desc');
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch data
  useEffect(() => {
    fetch('/explore/data.json')
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  // Reset sub-filter when verdict filter changes away from LENS
  useEffect(() => {
    if (verdictFilter !== 'LENS') setSubFilter('ALL TYPES');
  }, [verdictFilter]);

  const handleCardClick = useCallback((item) => setSelectedItem(item), []);
  const handleModalClose = useCallback(() => setSelectedItem(null), []);

  if (loading) {
    return (
      <div className="tab-content">
        <OrientationStrip title="EXPLORE" description="Browse 200 real ESA Euclid images scored by the V12 ensemble model." />
        <div className="exp-loading">
          <div className="exp-loading-spinner" />
          <p>Loading image data…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="tab-content">
        <OrientationStrip title="EXPLORE" description="Browse 200 real ESA Euclid images scored by the V12 ensemble model." />
        <div className="exp-error">
          <p>Failed to load explore data.</p>
          <p className="exp-error-detail">{error}</p>
        </div>
      </div>
    );
  }

  // ── Filter ──
  let filtered = data.images.filter(item => {
    if (verdictFilter === 'LENS' && item.verdict !== 'LENS') return false;
    if (verdictFilter === 'NOT_A_LENS' && item.verdict !== 'NOT_A_LENS') return false;
    if (verdictFilter === 'LENS' && subFilter !== 'ALL TYPES') {
      if (!item.substructure || item.substructure.top_class !== subFilter) return false;
    }
    return true;
  });

  // ── Sort ──
  filtered = [...filtered].sort((a, b) => {
    if (sortMode === 'conf_desc') return b.p_lens - a.p_lens;
    if (sortMode === 'conf_asc') return a.p_lens - b.p_lens;
    if (sortMode === 'grade_a') {
      if (a.grade !== b.grade) return a.grade === 'A' ? -1 : 1;
      return b.p_lens - a.p_lens;
    }
    return 0;
  });

  const subActive = verdictFilter === 'LENS';

  return (
    <div className="tab-content">
      <OrientationStrip
        title="EXPLORE"
        description={`Browse ${data.meta.total_images} real ESA Euclid images scored by the V12 ensemble model, with Grad-CAM attention overlays.`}
      />

      <div className="container" style={{ paddingBottom: '120px' }}>
        <AboutBanner meta={data.meta} />

        {/* ── Filter Bar ── */}
        <div className="exp-filterbar">
          {/* Verdict tabs */}
          <div className="exp-filter-group">
            {[
              { val: 'ALL', label: `ALL (${data.meta.total_images})` },
              { val: 'LENS', label: `LENS (${data.meta.lens_count})` },
              { val: 'NOT_A_LENS', label: `NOT A LENS (${data.meta.not_lens_count})` },
            ].map(({ val, label }) => (
              <button
                key={val}
                className={`exp-filter-tab ${verdictFilter === val ? 'active' : ''}`}
                onClick={() => setVerdictFilter(val)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Substructure tabs */}
          <div className={`exp-filter-group exp-filter-group--sub ${!subActive ? 'dimmed' : ''}`}>
            {['ALL TYPES', 'SMOOTH', 'CDM', 'AXION'].map(sf => (
              <button
                key={sf}
                className={`exp-filter-tab exp-filter-tab--sub ${subFilter === sf && subActive ? 'active' : ''}`}
                onClick={() => { if (subActive) setSubFilter(sf); }}
                disabled={!subActive}
                data-tooltip={sf === 'SMOOTH' && subActive ? 'No lenses in this set were classified as smooth — consistent with the expectation that real confirmed lenses are not undisturbed halos.' : undefined}
              >
                {sf}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="exp-filter-group exp-filter-group--sort">
            <select
              value={sortMode}
              onChange={e => setSortMode(e.target.value)}
              className="exp-sort-select"
            >
              <option value="conf_desc">CONFIDENCE: HIGH → LOW</option>
              <option value="conf_asc">CONFIDENCE: LOW → HIGH</option>
              <option value="grade_a">GRADE A FIRST</option>
            </select>
          </div>
        </div>

        {/* ── Result count ── */}
        <div className="exp-result-count">
          {filtered.length} image{filtered.length !== 1 ? 's' : ''}
        </div>

        {/* ── Grid ── */}
        {filtered.length === 0 ? (
          <div className="exp-empty">No images match the current filters.</div>
        ) : (
          <div className="exp-grid">
            {filtered.map(item => (
              <ExploreCard key={item.id} item={item} onClick={handleCardClick} />
            ))}
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selectedItem && (
        <DetailModal item={selectedItem} meta={data.meta} onClose={handleModalClose} />
      )}
    </div>
  );
}
