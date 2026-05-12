import React from 'react';

export default function MobileBlock() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#ffffff',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: '1.5rem',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        Gravitational Lensing
      </h1>
      <p style={{
        fontSize: '1.1rem',
        color: '#666666',
        marginBottom: '1rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '400px',
        lineHeight: '1.6'
      }}>
        This application is not intended for mobile devices.
      </p>
      <p style={{
        fontSize: '1rem',
        color: '#888888',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '400px',
        lineHeight: '1.6'
      }}>
        For the best experience, please use the app on a laptop or desktop computer.
      </p>
    </div>
  );
}
