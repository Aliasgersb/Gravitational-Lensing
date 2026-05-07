/**
 * onnxInference.js
 * Direct (non-worker) ONNX session management.
 * We explicitly configure WASM paths and force single-threaded mode
 * so SharedArrayBuffer / COEP headers are never needed.
 */

import * as ort from 'onnxruntime-web';

// Force single-threaded mode — avoids any SharedArrayBuffer requirement
// so the model works on ALL browsers without special server headers.
ort.env.wasm.numThreads = 1;

// Suppress verbose logging
ort.env.logLevel = 'warning';

let session = null;
let activeBackend = null;

export async function initONNX() {
  if (session) return { backend: activeBackend };

  const modelUrl = '/models/lens_detector_v7_int8.onnx';

  // Try WebGPU first, fall back silently to WASM
  if (typeof navigator !== 'undefined' && navigator.gpu) {
    try {
      session = await ort.InferenceSession.create(modelUrl, {
        executionProviders: ['webgpu', 'wasm'],
        graphOptimizationLevel: 'all',
      });
      activeBackend = 'WebGPU';
      return { backend: activeBackend };
    } catch (e) {
      console.warn('WebGPU unavailable, falling back to WASM:', e.message);
      session = null;
    }
  }

  // WASM (single-threaded, universally supported)
  session = await ort.InferenceSession.create(modelUrl, {
    executionProviders: ['wasm'],
    graphOptimizationLevel: 'all',
  });
  activeBackend = 'WebAssembly';
  return { backend: activeBackend };
}

export async function runONNX(tensorData) {
  if (!session) throw new Error('Model not initialized. Call initONNX() first.');

  // Use the actual input/output names from the exported model
  const inputName  = session.inputNames[0];
  const outputName = session.outputNames[0];

  const tensor  = new ort.Tensor('float32', tensorData, [1, 1, 224, 224]);
  const results = await session.run({ [inputName]: tensor });
  const logits  = results[outputName].data; // Float32Array of length 2

  if (!logits || logits.length < 2 || isNaN(logits[0]) || isNaN(logits[1])) {
    throw new Error('Model returned invalid output. Try a different file.');
  }

  // Numerically stable softmax
  const maxLogit = Math.max(logits[0], logits[1]);
  const exp0 = Math.exp(logits[0] - maxLogit);
  const exp1 = Math.exp(logits[1] - maxLogit);
  return exp1 / (exp0 + exp1); // P(lens)
}
