import React, { useState, useEffect, useRef, useCallback } from 'react';
import OrientationStrip from '../OrientationStrip';
import { preprocessFITS } from '../../utils/fitsPipeline';
import { initONNX, runONNX } from '../../utils/onnxInference';

// ─── Icons ────────────────────────────────────────────────────────────────────
const UploadCloud = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m16 16-4-4-4 4" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);

const Spinner = ({ size = 16 }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ animation: 'spin 1s linear infinite' }}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const ChevronDown = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const ChevronUp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m18 15-6-6-6 6" />
  </svg>
);

// ─── Constants ─────────────────────────────────────────────────────────────────
const THRESHOLD = 0.623;
const MAX_FILES = 20;
const MAX_FILE_SIZE_MB = 50;
const VALID_EXTS = ['.fits', '.fit', '.fts'];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  return (bytes / 1024).toFixed(1) + ' KB';
}

function getConfidence(pLens) {
  if (pLens >= 0.85) return { label: 'HIGH CONFIDENCE', color: '#4caf7d' };
  if (pLens >= THRESHOLD) return { label: 'MODERATE CONFIDENCE', color: '#c8b89a' };
  if (pLens >= 0.40) return { label: 'BORDERLINE — below threshold', color: '#888' };
  return { label: 'UNLIKELY LENS', color: '#666' };
}

// ─── Result Card ──────────────────────────────────────────────────────────────
function ResultCard({ f, res, onViewToggle }) {
  const isWaiting   = !res || res.status === 'waiting';
  const isRunning   = res?.status === 'processing';
  const isDone      = res?.status === 'done';
  const isError     = res?.status === 'error';

  const pLens       = res?.pLens ?? 0;
  const isLens      = isDone && pLens >= THRESHOLD;
  const conf        = isDone ? getConfidence(pLens) : null;
  const viewMode    = res?.viewMode ?? 'RAW';

  return (
    <div style={{
      backgroundColor: 'var(--surface)',
      border: `1px solid ${isError ? '#c0392b' : 'var(--border)'}`,
      display: 'flex', flexDirection: 'column',
      opacity: isWaiting ? 0.55 : 1,
      transition: 'opacity 0.3s'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '11px', gap: '8px'
      }}>
        <span style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.name}>{f.name}</span>
        <span style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>{formatSize(f.file.size)}</span>
      </div>

      {/* Image panel */}
      <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#050505', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {(isRunning || isDone) && res?.rawDataUrl ? (
          <img
            src={viewMode === 'PROCESSING' ? (res.processedDataUrl || res.rawDataUrl) : res.rawDataUrl}
            alt="FITS render"
            style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }}
          />
        ) : isWaiting ? (
          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Queued</span>
        ) : isRunning ? (
          <Spinner size={24} />
        ) : isError ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#e74c3c', fontSize: '12px', lineHeight: 1.6 }}>{res.errorMsg}</div>
        ) : null}
      </div>

      {/* Toggle RAW / PROCESSING */}
      {(isRunning || isDone) && res?.rawDataUrl && (
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {['RAW', 'PROCESSING'].map(mode => (
            <button key={mode} onClick={() => onViewToggle(f.id, mode)} style={{
              flex: 1, padding: '7px', fontSize: '10px', letterSpacing: '0.06em',
              background: viewMode === mode ? 'var(--surface-2)' : 'transparent',
              color: viewMode === mode ? 'var(--text-primary)' : 'var(--text-tertiary)',
              border: 'none', borderRight: mode === 'RAW' ? '1px solid var(--border)' : 'none',
              cursor: 'pointer', transition: 'all 0.15s'
            }}>{mode}</button>
          ))}
        </div>
      )}

      {/* Result panel */}
      <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {(isWaiting || isRunning) && (
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '14px', minHeight: '120px' }}>
            {isRunning && <Spinner size={20} />}
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center' }}>{res?.step || 'Queued'}</div>
          </div>
        )}

        {isDone && (
          <>
            {/* Verdict */}
            <div className="playfair" style={{
              fontSize: '28px', textAlign: 'center', letterSpacing: '0.06em', marginBottom: '24px',
              color: isLens ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}>
              {isLens ? 'LENS' : 'NOT A LENS'}
            </div>

            {/* P(lens) bar */}
            <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
              <span>P(LENS)</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{pLens.toFixed(3)}</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--surface-2)', position: 'relative', marginBottom: '12px', borderRadius: '2px' }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: '2px',
                width: `${Math.min(100, pLens * 100)}%`,
                backgroundColor: isLens ? 'var(--accent)' : '#555',
                transition: 'width 0.6s ease-out'
              }} />
              {/* Threshold tick at 62.3% */}
              <div style={{ position: 'absolute', top: '-5px', bottom: '-5px', left: `${THRESHOLD * 100}%`, width: '2px', backgroundColor: 'var(--text-primary)', borderRadius: '1px', zIndex: 2 }} />
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textAlign: 'right', marginBottom: '4px' }}>threshold 0.623</div>

            {/* Confidence label */}
            <div style={{ fontSize: '11px', color: conf.color, textAlign: 'center', letterSpacing: '0.05em', marginBottom: '24px', fontWeight: 500 }}>
              {conf.label}
            </div>

            {/* Stat boxes */}
            <div style={{ display: 'flex', borderTop: '1px solid var(--border)', paddingTop: '14px', fontSize: '9px', color: 'var(--text-secondary)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              {[
                ['Threshold', '0.623'],
                ['Time', res.inferenceMs != null ? `${Math.round(res.inferenceMs)}ms` : '—'],
              ].map(([label, val], i, arr) => (
                <div key={label} style={{ flex: 1, textAlign: 'center', borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  {label}<br />
                  <span style={{ color: 'var(--text-primary)', marginTop: '4px', display: 'block', fontSize: '10px' }}>{val}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {isError && (
          <div style={{ color: '#e74c3c', fontSize: '12px', textAlign: 'center', padding: '16px 0' }}>{res.errorMsg}</div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Analyse() {
  const [modelState, setModelState]   = useState('loading');
  const [backend, setBackend]         = useState(null);
  const [loadError, setLoadError]     = useState('');

  const [files, setFiles]             = useState([]);
  const [results, setResults]         = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [limitNotice, setLimitNotice] = useState(false);
  const [isBoxCollapsed, setIsBoxCollapsed] = useState(() => localStorage.getItem('v7BoxCollapsed') === 'true');

  const fileInputRef  = useRef(null);
  const processingRef = useRef(false); // guard against double-runs

  // ── Load model once on mount ─────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { backend: b } = await initONNX();
        if (!cancelled) {
          setBackend(b);
          setModelState('ready');
        }
      } catch (err) {
        console.error('ONNX init failed:', err);
        if (!cancelled) {
          setLoadError(err.message || 'Could not load model. Check your connection and try refreshing.');
          setModelState('error');
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Explainer box ────────────────────────────────────────────────────────────
  const toggleBox = () => {
    setIsBoxCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('v7BoxCollapsed', String(next));
      return next;
    });
  };

  const handleRetry = () => {
    setModelState('loading');
    setLoadError('');
    initONNX()
      .then(({ backend: b }) => { setBackend(b); setModelState('ready'); })
      .catch(err => { setLoadError(err.message); setModelState('error'); });
  };

  // ── File handling ────────────────────────────────────────────────────────────
  const addFiles = useCallback((incoming) => {
    if (processingRef.current) return;
    const arr = Array.from(incoming);
    const errors = [];
    const valid = [];

    for (const file of arr) {
      const name = file.name.toLowerCase();
      if (!VALID_EXTS.some(e => name.endsWith(e))) {
        errors.push(`"${file.name}" — only .fits .fit .fts accepted`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        errors.push(`"${file.name}" — exceeds ${MAX_FILE_SIZE_MB}MB limit`);
        continue;
      }
      valid.push({ id: Math.random().toString(36).slice(2), file, name: file.name });
    }

    if (errors.length) alert(errors.join('\n'));

    setFiles(prev => {
      const combined = [...prev, ...valid];
      const capped = combined.slice(0, MAX_FILES);
      setLimitNotice(combined.length > MAX_FILES);
      return capped;
    });
  }, []);

  const removeFile = (id) => {
    if (processingRef.current) return;
    setFiles(f => f.filter(x => x.id !== id));
    setResults(r => { const n = { ...r }; delete n[id]; return n; });
  };

  const handleDrop = (e) => { e.preventDefault(); addFiles(e.dataTransfer.files); };
  const handleDragOver = (e) => e.preventDefault();

  // ── Sequential processing ────────────────────────────────────────────────────
  const processFiles = async () => {
    if (processingRef.current || files.length === 0 || modelState !== 'ready') return;
    processingRef.current = true;
    setIsProcessing(true);
    setLimitNotice(false);

    // Seed all cards as waiting
    setResults(() => {
      const init = {};
      files.forEach(f => { init[f.id] = { status: 'waiting', step: 'Queued', viewMode: 'RAW' }; });
      return init;
    });

    const updateCard = (id, patch) =>
      setResults(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));

    for (const f of files) {
      try {
        // Step 1 – reading
        updateCard(f.id, { status: 'processing', step: 'Reading FITS file...' });
        await tick(); // let React paint

        // Step 2 – preprocessing (also generates RAW data URL for image preview)
        updateCard(f.id, { status: 'processing', step: 'Applying preprocessing pipeline...' });
        await tick();
        const { tensorData, rawDataUrl, processedDataUrl } = await preprocessFITS(f.file);

        // Show image as soon as preprocessing is done, before inference
        updateCard(f.id, { status: 'processing', step: 'Running inference (V7 · INT8)...', rawDataUrl, processedDataUrl });
        await tick();

        // Step 3 – inference
        const t0 = performance.now();
        const pLens = await runONNX(tensorData);
        const inferenceMs = performance.now() - t0;

        if (isNaN(pLens)) throw new Error('Model returned NaN. Try a different file.');

        updateCard(f.id, { status: 'done', step: 'Done', pLens, inferenceMs });

      } catch (err) {
        console.error(`Error on ${f.name}:`, err);
        updateCard(f.id, { status: 'error', step: 'Error', errorMsg: err.message || 'Unknown error.' });
      }
    }

    processingRef.current = false;
    setIsProcessing(false);
  };

  const toggleViewMode = (id, mode) =>
    setResults(prev => ({ ...prev, [id]: { ...prev[id], viewMode: mode } }));

  // ── Flex layout ──────────────────────────────────────────────────────────────
  const count = files.length;

  const hasResults = Object.keys(results).length > 0;

  return (
    <div className="tab-content" style={{ paddingBottom: '100px' }}>
      {/* Spin keyframe injected once */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <OrientationStrip title="ANALYSE" description="Upload your own FITS file and run the detection model directly in the browser.">
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px',
          letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)'
        }}>
          {modelState === 'loading' && (
            <>
              <Spinner size={12} />
              <span>LOAD MODEL…</span>
            </>
          )}
          {modelState === 'ready' && (
            <>
              <span style={{ color: 'var(--positive)', fontSize: '8px' }}>●</span>
              <span>
                System Ready <span style={{ opacity: 0.3, margin: '0 8px' }}>|</span>
                <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{backend}</strong>
              </span>
            </>
          )}
          {modelState === 'error' && (
            <>
              <span style={{ color: 'var(--negative)' }}>●</span>
              <span style={{ color: 'var(--negative)' }}>Offline</span>
              <button onClick={handleRetry} style={{ marginLeft: '12px', color: 'var(--accent)', textDecoration: 'underline', fontSize: '11px', background: 'none', border: 'none', cursor: 'pointer' }}>Retry</button>
            </>
          )}
        </div>
      </OrientationStrip>

      <div className="container" style={{ paddingTop: '40px', paddingBottom: '0', maxWidth: '1200px', margin: '0 auto' }}>

        {/* ── Explainer box ──────────────────────────────────── */}
        <div
          onClick={toggleBox}
          style={{
            marginBottom: '48px', padding: '24px 32px',
            border: '1px solid var(--border)', backgroundColor: 'var(--surface)',
            cursor: 'pointer', userSelect: 'none', transition: 'all 0.2s ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-dim)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 className="playfair" style={{ fontSize: '19px', margin: 0, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
              Why V7 is used in the Analyse tab, not V12
            </h4>
            <div style={{ color: 'var(--accent)' }}>
              {isBoxCollapsed ? <ChevronDown /> : <ChevronUp />}
            </div>
          </div>
          {!isBoxCollapsed && (
            <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-primary)', opacity: 0.9, lineHeight: 1.8, margin: '0 0 16px 0' }}>
                V12 is an ensemble of three separate models and cannot be exported to a single ONNX file for browser-side inference. V7 (Zoobot ConvNeXt-Nano) is the best single model that is properly calibrated — its threshold of 0.623 is meaningful, unlike V10's 0.23 or V11's 0.30.
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text-primary)', opacity: 0.9, lineHeight: 1.8, margin: '0 0 24px 0' }}>
                V7 has 15M parameters (fast in-browser), accepts single-channel input, and is officially deployed in the ESA Euclid pipeline.
              </p>
              <div style={{ 
                marginTop: '14px', padding: '12px 16px', backgroundColor: 'var(--surface-2)', 
                fontSize: '11px', color: 'var(--accent)', fontStyle: 'italic',
                borderLeft: '2px solid var(--accent-dim)', letterSpacing: '0.03em'
              }}>
                AUROC = 0.8541 · Precision = 0.7037 · Threshold = 0.623 · Parameters = 15M
              </div>
            </div>
          )}
        </div>

        {/* ── Requirements & Guidelines ────────────────────── */}
        <div style={{ 
          backgroundColor: 'var(--surface)', border: '1px solid var(--border)', 
          padding: '28px 32px', marginBottom: '48px', textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '18px' }}>
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
             </svg>
             <h5 className="playfair" style={{ margin: 0, fontSize: '17px', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>FITS Submission Guidelines</h5>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
            {[
               { label: 'File Compatibility', value: '.fits, .fit, .fts', desc: 'Ensure your file contains standard 2D image HDUs.' },
               { label: 'Recommended Area', value: '300 × 300 Pixels', desc: 'Pipeline crops to the central 30 px region for analysis.' },
               { label: 'Spatial Resolution', value: '0.1 Arcsec/Pixel', desc: 'Optimized for high-resolution VIS-band imaging.' },
               { label: 'Data Treatment', value: 'Linear Raw Counts', desc: 'Pipeline handles background and log-scaling automatically.' },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: '9px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px', fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '6px', fontWeight: 500 }}>{item.value}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Upload zone ───────────────────────────────────── */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          style={{
            minHeight: files.length ? '110px' : '220px',
            border: '1px dashed var(--border)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '14px', padding: '24px', marginBottom: '24px',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            backgroundColor: 'var(--surface-2)', transition: 'min-height 0.3s'
          }}
        >
          <input ref={fileInputRef} type="file" accept=".fits,.fit,.fts" multiple style={{ display: 'none' }}
            onChange={e => addFiles(e.target.files)} disabled={isProcessing} />
          <div style={{ color: 'var(--accent)' }}><UploadCloud /></div>
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.5 }}>
            {files.length > 0 ? 'Drop more files or click to add' : 'Drop FITS files here\nor click to browse'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>.fits · .fit · .fts · max {MAX_FILES} files · max {MAX_FILE_SIZE_MB}MB each</div>
        </div>

        {limitNotice && (
          <div style={{ fontSize: '12px', color: 'var(--accent)', textAlign: 'center', marginBottom: '16px' }}>
            Maximum {MAX_FILES} files. Only the first {MAX_FILES} were kept.
          </div>
        )}
        


        {/* ── File list ─────────────────────────────────────── */}
        {files.length > 0 && (
          <div style={{ maxWidth: '640px', margin: '0 auto 32px auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {files.map(f => (
              <div key={f.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', fontSize: '13px'
              }}>
                <span style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{f.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>{formatSize(f.file.size)}</span>
                  <button onClick={e => { e.stopPropagation(); removeFile(f.id); }} disabled={isProcessing}
                    style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: isProcessing ? 'not-allowed' : 'pointer', padding: 0 }}>
                    <XIcon />
                  </button>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <button
                onClick={processFiles}
                disabled={isProcessing || modelState !== 'ready'}
                style={{
                  padding: '13px 36px', fontSize: '13px', fontWeight: 600, letterSpacing: '0.07em',
                  backgroundColor: (isProcessing || modelState !== 'ready') ? 'var(--surface-2)' : 'var(--accent)',
                  color: (isProcessing || modelState !== 'ready') ? 'var(--text-tertiary)' : '#111',
                  border: 'none', cursor: (isProcessing || modelState !== 'ready') ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s'
                }}
              >
                {isProcessing && <Spinner size={14} />}
                {isProcessing ? 'ANALYSING…' : `ANALYSE ${files.length} FILE${files.length > 1 ? 'S' : ''}`}
              </button>
            </div>
          </div>
        )}

        {/* ── Results grid ──────────────────────────────────── */}
        {hasResults && (
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '24px', 
            width: '100%',
            maxWidth: '100%', 
            margin: '0 auto' 
          }}>
            {files.map(f => (
              <div key={f.id} style={{
                width: count === 1 ? '600px' : count === 2 ? 'calc(50% - 12px)' : 'calc(33.333% - 16px)',
                minWidth: '280px',
                maxWidth: count === 1 ? '600px' : '400px'
              }}>
                <ResultCard
                  f={f}
                  res={results[f.id]}
                  onViewToggle={toggleViewMode}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── Info footer ───────────────────────────────────── */}
        <div style={{
          marginTop: '80px', padding: '20px 24px', borderLeft: '2px solid var(--accent)',
          fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: '780px', margin: '80px auto 0 auto'
        }}>
          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>About this analysis</strong>
          Results are produced by V7 — Zoobot ConvNeXt-Nano, a 15M parameter model trained on real ESA Euclid Q1 images. AUROC = 0.8541 on 200 held-out test images. At threshold 0.623, precision = 0.70. <strong>Inference runs entirely in your browser — your file is never uploaded anywhere.</strong>
          <br /><br />
          The model was trained specifically on Euclid VIS-band 300×300px cutouts at 0.1 arcsec/px. Results on images from other telescopes or at different resolutions may not be reliable.
        </div>
      </div>
    </div>
  );
}

// tiny helper to yield back to the event loop so React can paint
function tick() {
  return new Promise(r => setTimeout(r, 0));
}
