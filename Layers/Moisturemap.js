import { createNoise2D } from 'simplex-noise';

// Set up the Simplex noise generator
let noise2D = createNoise2D(Math.random);

// Default values for frequency
let frequency = 0.003;

// Number of octaves
let octaves = 10;

// Generate the moisture map
function generateMoistureMap(canvas, ctx) {
  // Reinitialize the Simplex noise generator with a new random seed
  noise2D = createNoise2D(Math.random);

  // Get the actual dimensions of the canvas
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // Create ImageData for optimized drawing
  const moisturemapImageData = ctx.createImageData(canvasWidth, canvasHeight);
  
  // Generate the moisture map
  for (let x = 0; x < canvasWidth; x++) {
    for (let y = 0; y < canvasHeight; y++) {
      // Calculate the moisture based on Simplex noise
      const moisture = generateMoisture(x, y);

      // Set the color based on the moisture value
      const color = getColor(moisture);
      const [r, g, b] = color.match(/\d+/g).map(Number);  // Extract RGB values

      const index = (y * canvasWidth + x) * 4;
      moisturemapImageData.data[index] = r;
      moisturemapImageData.data[index + 1] = g;
      moisturemapImageData.data[index + 2] = b;
      moisturemapImageData.data[index + 3] = 255; // alpha channel, fully opaque
    }
  }

  // Draw the entire ImageData to the canvas
  ctx.putImageData(moisturemapImageData, 0, 0);
}

// Generate the moisture value for a given position
function generateMoisture(x, y) {
  // Generate the moisture value based on Simplex noise with multiple octaves
  let moisture = 0;
  let amplitude = 1;
  for (let i = 0; i < octaves; i++) {
    moisture += amplitude * noise2D(x * frequency * Math.pow(2, i), y * frequency * Math.pow(2, i));
    amplitude /= 2;
  }
  return moisture;
}

// Get the color based on the moisture value
function getColor(moisture) {
  const value = Math.floor((moisture + 1) / 2 * 255);
  return `rgb(${value},${value},${value})`;
}

function getMoistureValue(x, y, width, height) {
  const noiseFunction = createNoise2D(Math.random);  
  const frequency = 5.0;
  const amplitude = 1.0;
  let noiseValue = noiseFunction(x * frequency / width, y * frequency / height);
  noiseValue = (noiseValue + 1) * 0.5;
  noiseValue *= amplitude;
  return Math.min(Math.max(noiseValue, 0), 1);
}

export { generateMoistureMap, getMoistureValue };
