import { useState, useRef, useEffect } from 'react';

const GLOSSARY = {
  'AUROC': 'Area Under the Receiver Operating Characteristic curve; a performance metric where 1.0 is perfect and 0.5 is random guessing.',
  'PSF': 'Point Spread Function; describes how a telescope blurs a perfect point of light into a smudge due to diffraction and optics.',
  'FITS': 'Flexible Image Transport System; the standard digital file format used in astronomy for storing images and data tables.',
  'TTA': 'Test-Time Augmentation; averaging a model\'s predictions across multiple rotated/flipped versions of the same image to increase robustness.',
  'CDM': 'Cold Dark Matter; the leading theory that dark matter is composed of slow-moving particles, predicting a "clumpy" halo substructure.',
  'Axion': 'An ultralight dark matter candidate that behaves like a wave, predicting a much smoother halo structure than CDM.',
  'Ensemble': 'A machine learning strategy that combines multiple models to achieve better performance than any single model.',
  'Logits': 'The raw, unnormalized output scores from a neural network before they are converted into probabilities via softmax.',
  'Grad-CAM': 'Gradient-weighted Class Activation Mapping; a technique to visualize which pixels in an image drove the model\'s decision.',
  'FPR': 'False Positive Rate; the probability that a model incorrectly flags a non-lens galaxy as a gravitational lens candidate.',
  'Domain Adaptation': 'A technique used when a model trained on one dataset (like simulations) must be adapted to work on another (like real images).',
  'Hubble Constant': 'The cosmological parameter describing the expansion rate of the universe (in km/s/Mpc).',
  'Quasar': 'The extremely bright core of a distant galaxy, powered by a supermassive black hole consuming massive amounts of gas.',
  'Spacetime': 'The four-dimensional continuum combining the three dimensions of space and the one dimension of time.',
  'General Relativity': 'Einstein\'s 1915 theory stating that gravity is the curvature of spacetime caused by mass and energy.',
  'Subhalos': 'Smaller, localized knots of dark matter trapped inside the gravitational pull of a larger parent dark matter halo.'
};

export default function GlossaryTooltip({ term, children }) {
  const definition = GLOSSARY[term];
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [placement, setPlacement] = useState('top');
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!isVisible || !wrapperRef.current) return;

    const rect = wrapperRef.current.getBoundingClientRect();
    const tooltipWidth = 280;
    const tooltipHeight = 110;
    const margin = 12;

    // Calculate centered position
    let x = rect.left + rect.width / 2;
    const viewportWidth = window.innerWidth;

    // Adjust if tooltip would go off-screen horizontally
    if (x - tooltipWidth / 2 < 16) {
      x = tooltipWidth / 2 + 16;
    } else if (x + tooltipWidth / 2 > viewportWidth - 16) {
      x = viewportWidth - tooltipWidth / 2 - 16;
    }

    // If not enough space above, show below
    const showBelow = rect.top < tooltipHeight + margin;
    const y = showBelow ? rect.bottom : rect.top;

    setPlacement(showBelow ? 'bottom' : 'top');
    setPosition({ x, y });
  }, [isVisible]);

  if (!definition) {
    return <span>{children || term}</span>;
  }

  return (
    <>
      <span
        ref={wrapperRef}
        className="ls-tooltip-wrapper"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        <span style={{ fontWeight: 400 }}>{children || term}</span>
      </span>
      {isVisible && (
        <div
          className={`ls-tooltip-fixed ${placement === 'bottom' ? 'ls-tooltip-bottom' : ''}`}
          style={{
            left: position.x,
            top: position.y,
          }}
        >
          <span className="ls-tt-term">{term}</span>
          {definition}
        </div>
      )}
    </>
  );
}
