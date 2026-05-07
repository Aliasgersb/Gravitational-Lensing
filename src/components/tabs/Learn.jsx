import React from 'react';
import OrientationStrip from '../OrientationStrip';
import GlossaryTooltip from '../GlossaryTooltip';

export default function Learn() {
  return (
    <div className="tab-content">
      <OrientationStrip
        title="LEARN"
        description="The science behind gravitational lensing and dark matter — no prior knowledge needed."
      />

      <div className="container">

        {/* ── SECTION 1: What is Gravitational Lensing ── */}
        <div className="ls-block">
          <div className="ls-text">
            <div className="ls-tag">01 — FUNDAMENTALS</div>
            <h2 className="ls-h2 playfair">What is Gravitational Lensing?</h2>
            <p className="ls-p">
              Einstein's <GlossaryTooltip term="General Relativity">General Theory of Relativity</GlossaryTooltip> tells us that gravity is not a force — it is a curvature in the fabric of <GlossaryTooltip term="Spacetime">spacetime</GlossaryTooltip>. A massive object like a galaxy bends the space around it, and light, which always travels the shortest path through space, follows those curves.
            </p>
            <p className="ls-p">
              When a massive galaxy happens to sit directly between Earth and a more distant galaxy, the background galaxy's light bends around the foreground mass on multiple paths. The result is that we see distorted copies of the background source — stretched into arcs, rings, or multiple distinct images. The foreground galaxy is acting as a natural telescope.
            </p>
            <p className="ls-p">
              This effect was first predicted by Einstein in 1915 and confirmed by Arthur Eddington in 1919. Today, gravitational lensing is one of the most powerful probes in modern cosmology.
            </p>
          </div>
          <div className="ls-media">
            <div className="ls-img-box">
              <img src="/Einstein_cross.jpg" alt="The Einstein Cross" className="ls-img" />
            </div>
            <p className="ls-caption">
              The Einstein Cross (G2237+0305) — a single <GlossaryTooltip term="Quasar">quasar</GlossaryTooltip> imaged as four distinct copies by a foreground galaxy acting as a lens. Hubble Space Telescope. Credit: NASA/ESA.
            </p>
          </div>
        </div>

        <div className="ls-divider" style={{ margin: '56px 0' }} />

        {/* ── SECTION 2: The Geometry ── */}
        <div className="ls-full">
          <div className="ls-tag">02 — THE GEOMETRY</div>
          <h2 className="ls-h2 playfair">How Does It Actually Work?</h2>
          <p className="ls-p ls-p-narrow">
            There are always three actors: a distant source galaxy, a massive foreground galaxy acting as the lens, and an observer on Earth. Light from the source bends around the lens on multiple paths. Because we can only see the direction light arrives from — not the path it took — the source appears displaced, distorted, or multiplied.
          </p>
          <div className="ls-diagram">
            <img src="/How it works.jpeg" alt="How gravitational lensing works" className="ls-img" />
          </div>
          <p className="ls-caption-center">
            Light from the source bends around the lens on two paths, producing two (or more) images at displaced positions. The true position is invisible.
          </p>
        </div>

        <div className="ls-divider" />

        {/* ── SECTION 3: Video ── */}
        <div className="ls-full">
          <div className="ls-tag">03 — IN ACTION</div>
          <h2 className="ls-h2 playfair">Weak Lensing and Dark Matter Mapping</h2>
          <p className="ls-p ls-p-narrow">
            Beyond dramatic arcs and rings, gravitational lensing also operates subtly across the entire sky — slightly distorting the shapes of billions of galaxies. ESA's Euclid mission is designed to measure this effect across one third of the sky, building the largest dark matter map ever made.
          </p>
          <div className="ls-video" style={{ maxWidth: '800px', margin: '32px auto 0 auto' }}>
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/sAP5rauEyG4"
              title="Weak Gravitational Lensing — How Euclid Maps Dark Matter"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen>
            </iframe>
          </div>
          <p className="ls-caption-center" style={{ marginTop: '16px' }}>
            This project applies deep learning to real Euclid Q1 images — fine-tuning galaxy-pretrained networks to detect strong lens systems, and probing whether their dark matter substructure can be distinguished from space-based data.
          </p>
        </div>

        <div className="ls-divider" />

        {/* ── SECTION 4: Three types ── */}
        <div className="ls-full">
          <div className="ls-tag">04 — TYPES</div>
          <h2 className="ls-h2 playfair">Three Regimes of Lensing</h2>
          <div className="ls-three-cols">
            <div className="ls-col-card">
              <div className="ls-col-label">Strong</div>
              <h4 className="ls-col-title">Strong Lensing</h4>
              <p className="ls-col-p">Produces visible arcs, rings, and multiple images. Requires a massive lens and near-perfect alignment. This is what this project detects — individual galaxy-scale strong lenses in Euclid data.</p>
            </div>
            <div className="ls-col-card">
              <div className="ls-col-label">Weak</div>
              <h4 className="ls-col-title">Weak Lensing</h4>
              <p className="ls-col-p">Causes subtle, statistical distortions across millions of galaxy shapes. Not visible in a single image. Euclid's primary science goal — used to map dark matter and measure cosmic expansion.</p>
            </div>
            <div className="ls-col-card">
              <div className="ls-col-label">Micro</div>
              <h4 className="ls-col-title">Microlensing</h4>
              <p className="ls-col-p">A compact object crossing in front of a distant star causes a temporary brightening. Used to hunt for free-floating planets, black holes, and constrain dark matter candidates like MACHOs.</p>
            </div>
          </div>
        </div>

        <div className="ls-divider" style={{ margin: '56px 0' }} />

        {/* ── SECTION 5: What lenses tell us ── */}
        <div className="ls-block">
          <div className="ls-text">
            <div className="ls-tag">05 — SCIENTIFIC VALUE</div>
            <h2 className="ls-h2 playfair">What Can Lenses Tell Us?</h2>
            <p className="ls-p">Gravitational lenses are precision instruments. Analysing lensed images gives information that no other observation can provide.</p>
            <div className="ls-fact-list">
              <div className="ls-fact">
                <div className="ls-fact-title">Dark matter maps</div>
                <p className="ls-fact-desc">Lensing traces mass regardless of whether it emits light. The distortion pattern directly maps where dark matter is concentrated — making it the most direct probe of the invisible universe we have.</p>
              </div>
              <div className="ls-fact">
                <div className="ls-fact-title">Hubble constant</div>
                <p className="ls-fact-desc">When a <GlossaryTooltip term="Quasar">quasar</GlossaryTooltip> is lensed into multiple images, a flicker in the quasar arrives at different times via different paths. These time delays constrain the <GlossaryTooltip term="Hubble Constant">Hubble constant</GlossaryTooltip> — the rate at which the universe is expanding.</p>
              </div>
              <div className="ls-fact">
                <div className="ls-fact-title">Deep universe magnification</div>
                <p className="ls-fact-desc">The lens acts as a natural telescope. Some of the most distant galaxies ever observed were found behind foreground clusters — magnified by factors of ten or more.</p>
              </div>
            </div>
          </div>
          <div className="ls-media">
            <div className="ls-img-box">
              <img src="/1e0657_scale.jpg" alt="Bullet Cluster dark matter mapping" className="ls-img" />
            </div>
            <p className="ls-caption">
              The Bullet Cluster — blue shows dark matter mapped through gravitational lensing; pink shows hot gas detected by X-ray. The two passed through each other, separating dark matter from ordinary matter. Credit: NASA/CXC/CfA.
            </p>
          </div>
        </div>

        <div className="ls-divider" />

        {/* ── SECTION 6: Dark matter substructure ── */}
        <div className="ls-full">
          <div className="ls-tag">06 — DARK MATTER SUBSTRUCTURE</div>
          <h2 className="ls-h2 playfair">CDM vs Axion: The Substructure Question</h2>
          <div className="ls-two-col-text">
            <div>
              <p className="ls-p">
                Dark matter makes up roughly 27% of the universe. It emits no light and interacts only through gravity. We know it exists because galaxies would fly apart without it, and because lensing maps reveal mass where no stars are visible.
              </p>
              <p className="ls-p">
                The dominant model — Cold Dark Matter (CDM) — predicts that dark matter halos are not smooth. They are filled with thousands of smaller clumps called <GlossaryTooltip term="Subhalos">subhalos</GlossaryTooltip>. These are invisible knots of dark matter inside a larger halo.
              </p>
            </div>
            <div>
              <p className="ls-p">
                An alternative — Axion dark matter (fuzzy dark matter) — predicts much smoother halos. Axions are ultralight particles whose quantum behaviour prevents them from clumping at small scales. The two models produce physically different halos.
              </p>
              <p className="ls-p">
                CDM subhalos create tiny kinks in lensing arcs at sub-arcsecond scales. Detecting or ruling out these perturbations is how we test dark matter theory. This was Track B of this project — and the honest result was that Euclid Q1's resolution is not yet sufficient to resolve these signals.
              </p>
            </div>
          </div>
        </div>

        <div className="ls-divider" />

        {/* ── SECTION 7: ESA Euclid ── */}
        <div className="ls-block ls-block-rev">
          <div className="ls-media">
            <div className="ls-img-box">
              <img src="/1280px-Euclid_spacecraft_ESA24912474.jpg" alt="ESA Euclid space telescope" className="ls-img" />
            </div>
            <p className="ls-caption">ESA Euclid space telescope. Credit: ESA/ATG medialab.</p>
          </div>
          <div className="ls-text">
            <div className="ls-tag">07 — THE TELESCOPE</div>
            <h2 className="ls-h2 playfair">What is ESA Euclid?</h2>
            <p className="ls-p">
              Euclid is a space telescope launched by the European Space Agency on 1 July 2023. Its mission is to map the geometry of the dark universe over a 10-year survey covering 15,000 square degrees — roughly one third of the full sky.
            </p>
            <p className="ls-p">
              It images in optical (VIS instrument) and near-infrared (NISP) wavelengths simultaneously, with 0.1 arcseconds per pixel in the optical — a sharper view of the sky than any previous wide-field survey telescope.
            </p>
            <p className="ls-p">
              The Q1 Early Release Observations were made public in 2024 and contain 497 gravitational lens candidates graded by experts. This project uses those 300×300 pixel VIS cutouts as its raw data.
            </p>
          </div>
        </div>

        <div className="ls-divider" />

        {/* ── SECTION 8: Needle in Haystack ── */}
        <div className="ls-full">
          <div className="ls-tag">08 — THE CHALLENGE</div>
          <h2 className="ls-h2 playfair">The Needle in the Cosmic Haystack</h2>
          <div className="ls-two-col-text">
            <div>
              <p className="ls-p">
                If gravitational lenses are so magnificent and scientifically valuable, why don't we just look for them? The problem is scale. A perfect alignment between a distant source, a massive lens, and Earth is a cosmic coincidence.
              </p>
              <p className="ls-p">
                In the Euclid survey, strong lenses are incredibly rare. Out of millions of galaxies photographed, only a fraction of a percent will exhibit visible lensing features. Finding them manually is like looking for a needle in a cosmic haystack.
              </p>
            </div>
            <div>
              <p className="ls-p">
                Human astronomers would need hundreds of lifetimes to visually inspect the billions of galaxies Euclid will image over its 10-year mission. We need a way to automate discovery at scale.
              </p>
              <p className="ls-p">
                This is exactly why this project exists. By training deep neural networks to recognise the subtle geometric signatures of lensing arcs and rings, we can process millions of images in minutes — leaving only the strongest candidates for human review.
              </p>
            </div>
          </div>
        </div>

        <div className="ls-divider" />

        {/* ── SECTION 9: How the model works ── */}
        <div className="ls-full">
          <div className="ls-tag">09 — THE MODEL</div>
          <h2 className="ls-h2 playfair">How We Trained the Detector</h2>
          <p className="ls-p ls-p-narrow">
            The challenge: only 160 confirmed lens images were available for training. Training a model from scratch on this little data would fail. The solution was to start from neural networks already trained on millions of galaxy images — and fine-tune them on the Euclid data.
          </p>

          <div className="ls-pipeline">
            <div className="lp-node">
              <div className="lp-num">01</div>
              <div className="lp-title">Raw FITS Image</div>
              <div className="lp-desc">300×300 px Euclid VIS cutout. Single channel. Raw <GlossaryTooltip term="Photon Flux">photon flux</GlossaryTooltip> values from space.</div>
            </div>
            <div className="lp-arrow">&#8594;</div>
            <div className="lp-node">
              <div className="lp-num">02</div>
              <div className="lp-title">Preprocessing</div>
              <div className="lp-desc">Background subtracted, log-stretched, normalised, resized to 224×224 px.</div>
            </div>
            <div className="lp-arrow">&#8594;</div>
            <div className="lp-node">
              <div className="lp-num">03</div>
              <div className="lp-title">3 Neural Networks</div>
              <div className="lp-desc">Zoobot ConvNeXt-Nano, DINOv2-Small, DINOv2-Base — each pretrained on millions of galaxies.</div>
            </div>
            <div className="lp-arrow">&#8594;</div>
            <div className="lp-node">
              <div className="lp-num">04</div>
              <div className="lp-title">Weighted Ensemble</div>
              <div className="lp-desc">Three predictions combined at weights 0.3 / 0.2 / 0.5. AUROC = 0.8871 on held-out test set.</div>
            </div>
            <div className="lp-arrow">&#8594;</div>
            <div className="lp-node">
              <div className="lp-num">05</div>
              <div className="lp-title">Verdict</div>
              <div className="lp-desc">Lens or Not a Lens, with a calibrated confidence score.</div>
            </div>
          </div>

          <p className="ls-p ls-p-narrow" style={{ marginTop: '48px' }}>
            The key breakthrough was choosing Zoobot — a neural network pretrained on 100 million citizen-science galaxy classifications. It already understood galaxy shapes and textures before seeing a single Euclid image. Fine-tuning it on 160 real Euclid Grade A lens cutouts improved AUROC by over 12 points — from 0.73 to 0.85 — compared to the EfficientNet baseline trained without galaxy pretraining.
          </p>
          <p className="ls-p ls-p-narrow">
            For substructure classification, seven methods were evaluated — from adversarial <GlossaryTooltip term="Domain Adaptation">domain adaptation</GlossaryTooltip> to noise injection retraining. Three approaches collapsed entirely, predicting a single class for every image. The best method, noise injection retraining, reduced prediction uncertainty by 33% and produced confident classifications on 59 of 205 real Euclid lenses. But a fundamental physical limit remains: the sub-arcsecond arc perturbations that distinguish CDM from axion halos are smaller than Euclid Q1's <GlossaryTooltip term="Point Spread Function">point spread function</GlossaryTooltip>. The telescope is not yet sharp enough to resolve the signal. This is an honest null result, not a modelling failure.
          </p>
        </div>

        <div style={{ height: '120px' }} />
      </div>
    </div>
  );
}
