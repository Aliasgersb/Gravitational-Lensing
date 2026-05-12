import React from 'react';

export default function MobileBlock() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#0a0a0a',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: '400',
        color: '#e8e6e0',
        marginBottom: '2rem',
        fontFamily: "'Playfair Display', serif",
        fontStyle: 'italic',
        letterSpacing: '0.02em'
      }}>
        Gravitational Lensing
      </h1>
      <p style={{
        fontSize: '0.95rem',
        color: '#7a7870',
        marginBottom: '1rem',
        fontFamily: "'IBM Plex Mono', monospace",
        maxWidth: '420px',
        lineHeight: '1.8',
        letterSpacing: '0.01em'
      }}>
        This application is not intended for mobile devices.
      </p>
      <p style={{
        fontSize: '0.85rem',
        color: '#c8b89a',
        fontFamily: "'IBM Plex Mono', monospace",
        maxWidth: '420px',
        lineHeight: '1.8',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        marginTop: '0.5rem'
      }}>
        For the best experience, please use the app on a laptop or desktop computer.
      </p>
    </div>
  );
}
