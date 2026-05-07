import * as ort from 'onnxruntime-web';

// Disable telemetry and unnecessary logging
ort.env.telemetry.optOut = true;
ort.env.logLevel = 'warning';

let session = null;
let activeBackend = null;

// Initialize the model
async function initModel() {
  if (session) return { success: true, backend: activeBackend };
  
  try {
    const hasWebGPU = !!navigator.gpu;
    activeBackend = hasWebGPU ? 'WebGPU' : 'WebAssembly';
    
    // We load from the public folder
    session = await ort.InferenceSession.create('/models/lens_detector_v7_int8.onnx', {
      executionProviders: hasWebGPU ? ['webgpu', 'wasm'] : ['wasm'],
      graphOptimizationLevel: 'all',
    });
    
    return { success: true, backend: activeBackend };
  } catch (error) {
    console.error("ONNX initialization failed:", error);
    // Silent fallback to WASM if WebGPU failed
    try {
      activeBackend = 'WebAssembly';
      session = await ort.InferenceSession.create('/models/lens_detector_v7_int8.onnx', {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
      });
      return { success: true, backend: activeBackend, warning: 'WebGPU failed, fell back to WebAssembly' };
    } catch (fallbackError) {
      console.error("ONNX fallback initialization failed:", fallbackError);
      return { success: false, error: fallbackError.message };
    }
  }
}

// Run inference
async function runInference(preprocessedData) {
  if (!session) {
    throw new Error("Model not initialized");
  }
  
  try {
    const tensor = new ort.Tensor('float32', preprocessedData, [1, 1, 224, 224]);
    const results = await session.run({ input: tensor });
    const logits = results.output.data;
    
    // Softmax
    const maxLogit = Math.max(logits[0], logits[1]);
    const exp0 = Math.exp(logits[0] - maxLogit);
    const exp1 = Math.exp(logits[1] - maxLogit);
    const pLens = exp1 / (exp0 + exp1);
    
    return { success: true, pLens };
  } catch (error) {
    console.error("Inference failed:", error);
    return { success: false, error: error.message };
  }
}

// Listen for messages from the main thread
self.onmessage = async (e) => {
  const { type, id, data } = e.data;
  
  if (type === 'INIT') {
    const result = await initModel();
    self.postMessage({ type: 'INIT_RESULT', id, ...result });
  } 
  else if (type === 'INFERENCE') {
    const startTime = performance.now();
    const result = await runInference(data);
    const inferenceMs = performance.now() - startTime;
    self.postMessage({ type: 'INFERENCE_RESULT', id, ...result, inferenceMs });
  }
};
