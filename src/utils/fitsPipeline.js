import { FITS } from './fits.js';

// Inferno colormap lookup table (256 RGB values)
const INFERNO_CMAP = [
  [0,0,4],[2,0,5],[3,0,6],[5,0,8],[6,0,9],[8,0,10],[10,0,12],[11,0,13],
  [13,0,15],[14,0,16],[16,0,18],[18,0,19],[19,0,21],[21,0,22],[23,0,24],[24,0,25],
  [26,0,27],[27,0,28],[29,0,30],[31,0,32],[32,0,33],[34,0,35],[35,0,36],[37,0,38],
  [39,0,40],[40,0,41],[42,0,43],[44,1,44],[45,1,46],[47,1,47],[49,1,49],[50,1,50],
  [52,1,52],[54,2,53],[55,2,55],[57,2,56],[59,2,58],[60,2,59],[62,2,60],[64,3,62],
  [65,3,63],[67,3,64],[69,3,66],[70,3,67],[72,3,68],[74,3,69],[75,4,71],[77,4,72],
  [79,4,73],[80,4,74],[82,4,75],[84,4,76],[85,5,77],[87,5,78],[89,5,79],[90,5,80],
  [92,5,81],[94,6,82],[95,6,83],[97,6,84],[99,6,85],[100,7,86],[102,7,87],[104,7,87],
  [105,7,88],[107,8,89],[109,8,90],[111,8,91],[112,8,91],[114,9,92],[116,9,93],[117,9,93],
  [119,10,94],[121,10,95],[122,10,95],[124,11,96],[126,11,96],[127,11,97],[129,12,97],[131,12,98],
  [132,12,98],[134,13,99],[136,13,99],[137,14,99],[139,14,100],[141,14,100],[142,15,100],[144,15,101],
  [146,16,101],[147,16,101],[149,17,101],[151,17,102],[152,18,102],[154,18,102],[156,19,102],[157,19,102],
  [159,20,102],[161,20,102],[162,21,102],[164,22,102],[166,22,102],[167,23,102],[169,23,101],[171,24,101],
  [172,25,101],[174,25,101],[176,26,100],[177,27,100],[179,28,100],[181,28,99],[182,29,99],[184,30,98],
  [186,31,98],[187,32,97],[189,33,97],[190,34,96],[192,34,96],[194,35,95],[195,36,94],[197,37,94],
  [199,38,93],[200,39,92],[202,40,91],[203,41,91],[205,42,90],[206,43,89],[208,44,88],[210,45,87],
  [211,46,86],[213,48,85],[214,49,84],[216,50,83],[217,51,82],[219,52,81],[220,53,80],[222,54,79],
  [223,56,78],[225,57,77],[226,58,76],[228,59,75],[229,60,74],[230,62,72],[232,63,71],[233,64,70],
  [235,66,69],[236,67,68],[237,68,66],[239,70,65],[240,71,64],[241,73,63],[242,74,61],[244,76,60],
  [245,77,59],[246,79,57],[247,80,56],[248,82,54],[249,84,53],[250,85,51],[251,87,50],[252,88,48],
  [253,90,47],[253,92,45],[254,94,44],[255,95,42],[255,97,41],[255,99,39],[255,101,37],[255,102,36],
  [255,104,34],[255,106,32],[255,108,31],[255,110,29],[255,112,27],[255,114,25],[254,116,24],[254,118,22],
  [254,120,20],[254,122,18],[253,124,17],[253,126,15],[252,128,13],[252,130,11],[251,132,10],[251,134,8],
  [250,137,6],[249,139,5],[248,141,4],[248,143,2],[247,146,2],[246,148,1],[245,150,1],[244,153,1],
  [243,155,1],[242,157,2],[241,160,3],[240,162,4],[239,165,5],[238,167,7],[237,170,8],[236,172,10],
  [235,175,11],[233,177,13],[232,180,15],[231,182,17],[230,185,19],[229,187,22],[228,190,24],[226,192,26],
  [225,195,29],[224,198,31],[223,200,34],[222,203,36],[221,205,39],[220,208,42],[219,210,44],[218,213,47],
  [217,215,50],[216,218,53],[216,220,56],[215,223,59],[214,225,62],[214,228,65],[213,230,68],[213,233,71],
  [212,235,74],[212,238,78],[212,240,81],[212,243,84],[212,245,88],[212,248,91],[212,250,95],[212,253,98]
];

// parseFITS accepts a File or Blob object — NOT an ArrayBuffer.
// The fitsjs Parser has two branches: string (URL via XHR) and else (File/Blob via FileReader).
// Passing an ArrayBuffer triggers the else branch, but ArrayBuffer has no .size property
// and ArrayBuffer.slice() returns an ArrayBuffer (not a Blob), making FileReader crash.
// Always pass the raw File object so the library can use FileReader correctly.
export async function parseFITS(file) {
  return new Promise((resolve, reject) => {
    try {
      const fits = new FITS(file, function() {
        try {
          const hdu = this.getHDU();
          if (!hdu) {
            reject(new Error("No valid HDU with data found in this FITS file."));
            return;
          }
          const header = hdu.header;
          const width = header.get('NAXIS1');
          const height = header.get('NAXIS2');

          if (!width || !height) {
            reject(new Error("This FITS file does not contain a 2D image. The model requires a single-band image HDU."));
            return;
          }

          hdu.data.getFrame(0, (data) => {
            resolve({ data, width, height });
          });
        } catch (e) {
          console.error('FITS parsing internal error:', e);
          reject(new Error('Error extracting FITS data: ' + (e.message || e.toString())));
        }
      });
    } catch (e) {
      console.error('FITS parsing outer error:', e);
      reject(new Error('Could not initialize FITS parser: ' + (e.message || e.toString())));
    }
  });
}

function processPixels(data, width, height) {
  let nanCount = 0;
  for (let i = 0; i < data.length; i++) {
    if (isNaN(data[i]) || !isFinite(data[i])) {
      data[i] = 0;
      nanCount++;
    }
  }
  
  if (nanCount / data.length > 0.3) {
    throw new Error("More than 30% of pixels are invalid (NaN). This file may be corrupted.");
  }
  
  // Crop to 300x300
  const cropSize = 300;
  const startX = Math.max(0, Math.floor((width - cropSize) / 2));
  const startY = Math.max(0, Math.floor((height - cropSize) / 2));
  const actualWidth = Math.min(width, cropSize);
  const actualHeight = Math.min(height, cropSize);
  
  const croppedData = new Float32Array(actualWidth * actualHeight);
  for (let y = 0; y < actualHeight; y++) {
    for (let x = 0; x < actualWidth; x++) {
      croppedData[y * actualWidth + x] = data[(startY + y) * width + (startX + x)];
    }
  }
  
  // Border ring sky subtraction (10px border)
  const borderPixels = [];
  for (let y = 0; y < actualHeight; y++) {
    for (let x = 0; x < actualWidth; x++) {
      if (x < 10 || x >= actualWidth - 10 || y < 10 || y >= actualHeight - 10) {
        borderPixels.push(croppedData[y * actualWidth + x]);
      }
    }
  }
  
  borderPixels.sort((a, b) => a - b);
  const medianSky = borderPixels[Math.floor(borderPixels.length / 2)] || 0;
  
  for (let i = 0; i < croppedData.length; i++) {
    croppedData[i] = Math.max(0, croppedData[i] - medianSky);
    // log1p stretch
    croppedData[i] = Math.log1p(croppedData[i]);
  }
  
  // Percentile [1, 99] min-max normalize
  const sorted = new Float32Array(croppedData).sort();
  const p1 = sorted[Math.floor(sorted.length * 0.01)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  const range = p99 - p1 || 1;
  
  for (let i = 0; i < croppedData.length; i++) {
    let val = (croppedData[i] - p1) / range;
    croppedData[i] = Math.max(0, Math.min(1, val));
  }
  
  // Check if empty
  let isEmpty = true;
  for (let i = 0; i < croppedData.length; i++) {
    if (croppedData[i] > 0) isEmpty = false;
  }
  if (isEmpty) {
    throw new Error("Image appears to be empty after processing. Check the FITS file.");
  }
  
  return { processed: croppedData, width: actualWidth, height: actualHeight };
}

export function generateInfernoDataURL(normalizedData, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);
  
  for (let i = 0; i < normalizedData.length; i++) {
    let val = normalizedData[i];
    val = Math.max(0, Math.min(1, val));
    // Safely map [0,1] to the colormap array length
    const colorIdx = Math.floor(val * (INFERNO_CMAP.length - 1));
    const [r, g, b] = INFERNO_CMAP[colorIdx];
    
    const px = i * 4;
    imgData.data[px] = r;
    imgData.data[px + 1] = g;
    imgData.data[px + 2] = b;
    imgData.data[px + 3] = 255;
  }
  
  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}

export function resizeBilinear(data, srcWidth, srcHeight, dstWidth, dstHeight) {
  // Use canvas for high quality resize
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = srcWidth;
  srcCanvas.height = srcHeight;
  const ctxSrc = srcCanvas.getContext('2d');
  const srcImgData = ctxSrc.createImageData(srcWidth, srcHeight);
  
  for (let i = 0; i < data.length; i++) {
    const val = Math.floor(data[i] * 255);
    const px = i * 4;
    srcImgData.data[px] = val;
    srcImgData.data[px+1] = val;
    srcImgData.data[px+2] = val;
    srcImgData.data[px+3] = 255;
  }
  ctxSrc.putImageData(srcImgData, 0, 0);
  
  const dstCanvas = document.createElement('canvas');
  dstCanvas.width = dstWidth;
  dstCanvas.height = dstHeight;
  const ctxDst = dstCanvas.getContext('2d', { willReadFrequently: true });
  
  // Draw and resize
  ctxDst.drawImage(srcCanvas, 0, 0, dstWidth, dstHeight);
  const dstImgData = ctxDst.getImageData(0, 0, dstWidth, dstHeight);
  
  const result = new Float32Array(dstWidth * dstHeight);
  for (let i = 0; i < result.length; i++) {
    result[i] = dstImgData.data[i * 4] / 255.0;
  }
  
  return result;
}

export async function preprocessFITS(file) {
  // Pass the File directly — parseFITS expects a File/Blob, NOT an ArrayBuffer.
  const { data, width, height } = await parseFITS(file);
  
  // For RAW view, we'll just do a basic min-max percentile stretch without sky sub or log1p to show the noisy structure
  const rawSorted = new Float32Array(data).sort();
  // Filter out NaNs for raw stretch
  let validCount = 0;
  for(let i = 0; i < rawSorted.length; i++) {
    if (!isNaN(rawSorted[i]) && isFinite(rawSorted[i])) validCount++;
  }
  
  const p1Raw = rawSorted[Math.floor(validCount * 0.01)] || 0;
  const p99Raw = rawSorted[Math.floor(validCount * 0.99)] || 1;
  const rawRange = (p99Raw - p1Raw) || 1;
  
  const rawNormalized = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) {
    if (isNaN(data[i]) || !isFinite(data[i])) rawNormalized[i] = 0;
    else rawNormalized[i] = Math.max(0, Math.min(1, (data[i] - p1Raw) / rawRange));
  }
  const rawDataUrl = generateInfernoDataURL(rawNormalized, width, height);

  // Now process for the model
  const { processed, width: pWidth, height: pHeight } = processPixels(data, width, height);
  
  // Generate PROCESSING view data URL (pre-resize for better visual quality)
  const processedDataUrl = generateInfernoDataURL(processed, pWidth, pHeight);
  
  // Resize to 224x224 for ONNX
  const resized = resizeBilinear(processed, pWidth, pHeight, 224, 224);
  
  return {
    tensorData: resized, // Float32Array [1, 1, 224, 224]
    rawDataUrl,
    processedDataUrl
  };
}
