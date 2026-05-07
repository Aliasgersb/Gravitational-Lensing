import React from 'react';

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
  'Hubble Constant': 'The unit of measurement that describes the rate at which the universe is expanding.',
  'Quasar': 'The extremely bright core of a distant galaxy, powered by a supermassive black hole consuming massive amounts of gas.',
  'Spacetime': 'The four-dimensional continuum combining the three dimensions of space and the one dimension of time.',
  'General Relativity': 'Einstein\'s 1915 theory stating that gravity is the curvature of spacetime caused by mass and energy.',
  'Subhalos': 'Smaller, localized knots of dark matter trapped inside the gravitational pull of a larger parent dark matter halo.'
};

export default function GlossaryTooltip({ term, children }) {
  const definition = GLOSSARY[term];
  
  return (
    <span className="ls-tooltip-wrapper">
      {children || term}
      {definition && (
        <span className="ls-tooltip">
          <span className="ls-tt-term">{term}</span>
          {definition}
        </span>
      )}
    </span>
  );
}
