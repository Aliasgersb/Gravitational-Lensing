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
              <div className="exp-about-text">{meta.total_images} real images from the sacred test split of the ESA Euclid telescope, each processed by our V12 ensemble model. The model assigns a probability that each image contains a gravitational lens — a massive galaxy bending light from something behind it.</div>
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

  // Prevent body scroll while modal open
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

  // Substructure percentages with largest-remainder rounding
  let subPcts = null;
  if (item.substructure) {
    const { smooth: sm, cdm, axion: ax } = roundToHundred(
      item.substructure.smooth,
      item.substructure.cdm,
      item.substructure.axion
    );
    subPcts = { smooth: sm, cdm, axion: ax };
  }

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
            <FallbackImg
              src={imgSrc}
              alt={`${item.id} ${modalView}`}
              className="exp-modal-img"
            />
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
          {/* Stats row */}
          <div className="exp-modal-stats">
            <div className="exp-modal-stat">
              <div className="exp-modal-stat-label">RA</div>
              <div className="exp-modal-stat-val">{item.ra.toFixed(4)}</div>
            </div>
            <div className="exp-modal-stat">
              <div className="exp-modal-stat-label">DEC</div>
              <div className="exp-modal-stat-val">{item.dec.toFixed(4)}</div>
            </div>
            <div className="exp-modal-stat">
              <div className="exp-modal-stat-label">P(LENS)</div>
              <div className="exp-modal-stat-val">
                {item.p_lens.toFixed(3)}
                {isFallback && (
                  <span className="exp-fallback-marker" title="Score from single model (V7), not full ensemble">~</span>
                )}
              </div>
            </div>
            <div className="exp-modal-stat">
              <div className="exp-modal-stat-label">GRADE</div>
              <div className={`exp-modal-stat-val exp-modal-grade--${item.grade.toLowerCase()}`}>
                {item.grade}
              </div>
            </div>
          </div>

          {/* Verdict badge */}
          <div className={`exp-modal-verdict exp-modal-verdict--${item.verdict === 'LENS' ? 'lens' : 'not'}`}>
            <span className="exp-modal-verdict-main">
              {item.verdict === 'LENS' ? '● LENS' : '○ NOT A LENS'}
            </span>
            <span className="exp-modal-verdict-sub">
              (Model prediction)
            </span>
          </div>

          {/* ── LENS panel ── */}
          {item.verdict === 'LENS' && item.substructure && subPcts && (
            <div className="exp-modal-sub-section">
              <div className="exp-modal-section-title">Substructure Prediction</div>
              <div className="exp-modal-sub-boxes">
                {[
                  { key: 'smooth', label: 'SMOOTH', pct: subPcts.smooth },
                  { key: 'cdm', label: 'CDM', pct: subPcts.cdm },
                  { key: 'axion', label: 'AXION', pct: subPcts.axion },
                ].map(({ key, label, pct }) => (
                  <div
                    key={key}
                    className={`exp-modal-sub-box ${item.substructure.top_class === label ? 'active' : ''}`}
                  >
                    <div className="exp-modal-sub-name">{label}</div>
                    <div className="exp-modal-sub-pct">{pct}<span>%</span></div>
                  </div>
                ))}
              </div>

              <div className="exp-modal-sub-info">
                <p className="exp-modal-sub-info-title">What does this mean?</p>
                <p>This classifies what type of dark matter substructure may be distorting the lens — <em>not</em> a direct detection of dark matter itself. Because the true dark matter ground-truth is unknown for real Euclid images, the model can only be trained on mathematical simulations. Applying this simulation-trained model to real telescope data means all predictions carry significant uncertainty.</p>

                <div className="exp-modal-entropy-row">
                  <span className="exp-modal-entropy-label">Model uncertainty</span>
                  <EntropyBar entropy={item.substructure.entropy} />
                </div>

                <div className={`exp-modal-conf-tag ${item.substructure.confidence === 'HIGH' ? 'high' : 'low'}`}>
                  {item.substructure.confidence === 'HIGH'
                    ? '✓ HIGH CONFIDENCE — entropy below 0.5 bits, model strongly prefers one class'
                    : `⚠ UNCERTAIN — The model's uncertainty is high for this image (entropy = ${item.substructure.entropy.toFixed(3)} / 1.585 bits). This is expected — Euclid Q1 resolution limits substructure detectability.`}
                </div>

                <p className="exp-modal-disclaimer">
                  These predictions are not ground truth. Q1 telescope data has a PSF resolution that limits substructure detectability. Treat these as indicative only.
                </p>
              </div>
            </div>
          )}

          {/* ── NOT A LENS panel ── */}
          {item.verdict === 'NOT_A_LENS' && (
            <div className="exp-modal-not-lens-section">
              <div className="exp-modal-section-title">Why NOT A LENS?</div>

              <div className="exp-modal-not-lens-body">
                <p>The model assigned this image a score of <strong>{item.p_lens.toFixed(3)}</strong> — below the {meta.threshold.toFixed(2)} threshold required to be classified as a lens candidate.</p>

                {item.grade === 'A' && (
                  <div className="exp-modal-fn-alert">
                    <span className="exp-modal-fn-icon">!</span>
                    <span><strong>False negative.</strong> This is a Grade A image — an expert-confirmed lens candidate from the ESA SLDE catalog. The model missed it. At AUROC {auroc} on this test set, some real lenses are missed at the {meta.threshold.toFixed(2)} threshold.</span>
                  </div>
                )}

                {item.grade === 'C' && (
                  <div className="exp-modal-grade-note">
                    This is a Grade C image — a low-confidence candidate from the catalog, treated as a non-lens for evaluation. The model's verdict is consistent with the expert assessment.
                  </div>
                )}

                {item.has_gradcam && (
                  <div className="exp-modal-gradcam-note">
                    <p className="exp-modal-gradcam-note-title">Why is GradCAM still shown?</p>
                    <p>The attention map for a non-lens is scientifically interesting — it shows <em>where the model looked and found nothing compelling</em>. Diffuse blue attention or edge-biased red heat confirms the model saw no central galaxy structure worth flagging. This is a diagnostic, not a failure. Switch to GRAD-CAM above to inspect it.</p>
                  </div>
                )}

                <p className="exp-modal-disclaimer">
                  The model is not perfect. At the {meta.threshold.toFixed(2)} threshold on this test set: AUROC = {auroc}. Some real lenses are missed.
                </p>
              </div>
            </div>
          )}

          {/* Filename */}
          <div className="exp-modal-filename">
            <span className="exp-modal-filename-label">FILE</span>
            <span className="exp-modal-filename-val">{item.filename}</span>
          </div>

          {isFallback && (
            <div className="exp-modal-fallback-note">
              ~ Score from V7 single model (fallback) — not the full V12 ensemble.
            </div>
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
