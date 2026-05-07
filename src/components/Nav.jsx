import React from 'react';

export default function Nav({ activeTab, setActiveTab }) {
  const tabs = ['OVERVIEW', 'LEARN', 'JOURNEY', 'EXPLORE', 'ANALYSE', 'RESULTS'];

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '60px',
      backgroundColor: 'var(--bg)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      zIndex: 1000
    }}>
      <div className="playfair" style={{ fontStyle: 'italic', fontSize: '18px' }}>
        Gravitational Lensing
      </div>
      <div style={{ display: 'flex', gap: '32px' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: activeTab === tab ? 'var(--accent)' : 'var(--text-secondary)',
              transition: 'color 0.15s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>
    </nav>
  );
}
