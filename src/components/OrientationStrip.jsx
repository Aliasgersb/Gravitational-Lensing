import React from 'react';

export default function OrientationStrip({ title, description, children }) {
  return (
    <div className="orientation-strip">
      <div className="orientation-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '32px' }}>
          <span className="orientation-title">{title}</span>
          <div className="orientation-divider"></div>
          <span className="orientation-desc">{description}</span>
        </div>
        {children && (
          <div>{children}</div>
        )}
      </div>
    </div>
  );
}
