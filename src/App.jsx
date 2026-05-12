import React, { useState, useEffect } from 'react';
import Nav from './components/Nav';
import Hero from './components/tabs/Hero';
import Learn from './components/tabs/Learn';
import Journey from './components/tabs/Journey';
import Explore from './components/tabs/Explore';
import Analyse from './components/tabs/Analyse';
import Results from './components/tabs/Results';
import MobileBlock from './components/MobileBlock';
import { isMobileDevice } from './utils/mobileDetection';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  if (isMobile) {
    return <MobileBlock />;
  }

  return (
    <div>
      <Nav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main style={{ paddingTop: '60px' }}>
        {activeTab === 'OVERVIEW' && <Hero setActiveTab={setActiveTab} />}
        {activeTab === 'LEARN' && <Learn />}
        {activeTab === 'JOURNEY' && <Journey />}
        {activeTab === 'EXPLORE' && <Explore />}
        {activeTab === 'ANALYSE' && <Analyse />}
        {activeTab === 'RESULTS' && <Results />}
      </main>

      <footer>
        <div className="container footer-inner">
          <div className="footer-left">
            <h3 className="playfair">Gravitational Lensing</h3>
            <p>A two-stage deep learning pipeline trained on real ESA Euclid Q1 cutouts.</p>
          </div>
          <div className="footer-right">
            <span className="footer-link-disabled" data-coming-soon>ESA Euclid Archive</span>
            <span className="footer-link-disabled" data-coming-soon>Kaggle Dataset</span>
            <span className="footer-link-disabled" data-coming-soon>GitHub</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
