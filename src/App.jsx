import React, { useState } from 'react';
import Nav from './components/Nav';
import Hero from './components/tabs/Hero';
import Learn from './components/tabs/Learn';
import Journey from './components/tabs/Journey';
import Explore from './components/tabs/Explore';
import Analyse from './components/tabs/Analyse';
import Results from './components/tabs/Results';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('OVERVIEW');

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
            <a href="#">ESA Euclid Archive</a>
            <a href="#">Kaggle Dataset</a>
            <a href="#">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
