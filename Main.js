import { createNoise2D } from 'simplex-noise';
import { generateMoistureMap, getMoistureValue } from './Layers/Moisturemap.js';

// Set up the Simplex noise generator
let noise2D = createNoise2D(Math.random);

// Get the canvas elements
const heightmapCanvas = document.querySelector('.heightmap');
const heightmapCtx = heightmapCanvas.getContext('2d');
const moisturemapCanvas = document.querySelector('.moisturemap');
const moisturemapCtx = moisturemapCanvas.getContext('2d');
const gradientCanvas = document.createElement('canvas');
gradientCanvas.width = heightmapCanvas.width;
gradientCanvas.height = heightmapCanvas.height;
const gradientCtx = gradientCanvas.getContext('2d');

// Default values for frequency
let frequency = 0.003;

// Number of octaves
let octaves = 10;

// Generate terrain on button click
const generateButton = document.querySelector('.generate');
generateButton.addEventListener('click', generateTerrain);

// Toggle moisture map on button click
const toggleMoistButton = document.querySelector('.togglemoist');
toggleMoistButton.addEventListener('click', () => {
  if (moisturemapCanvas.style.display === 'none') {
    moisturemapCanvas.style.display = 'block';
  } else {
    moisturemapCanvas.style.display = 'none';
  }
});

const toggleGradientButton = document.querySelector('.togglegradient');
toggleGradientButton.addEventListener('click', () => {
  if (gradientCanvas.style.display === 'none') {
    gradientCanvas.style.display = 'block';
  } else {
    gradientCanvas.style.display = 'none';
  }
});

// Generate the terrain
function generateTerrain() {
  // Reinitialize the Simplex noise generator with a new random seed
  noise2D = createNoise2D(Math.random);

  // Get the actual dimensions of the canvas
  const canvasWidth = heightmapCanvas.width;
  const canvasHeight = heightmapCanvas.height;
  
  // Clear the canvases
  heightmapCtx.clearRect(0, 0, canvasWidth, canvasHeight);
  moisturemapCtx.clearRect(0, 0, canvasWidth, canvasHeight);
  gradientCtx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Generate the terrain
  for (let x = 0; x < canvasWidth; x++) {
    for (let y = 0; y < canvasHeight; y++) {
      // Calculate the height based on Simplex noise
      let height = generateHeight(x, y);
      const gradientValue = generateGradient(x, y, canvasWidth, canvasHeight);
      height -= gradientValue; // Subtract the gradient value
      height = Math.max(height, -1); // Ensure the height stays in the range [-1, 1]

      // Map the height value to a grayscale color
      const value = Math.floor((height + 1) / 2 * 255);
      const color = `rgb(${value},${value},${value})`;

      // Draw a pixel on the heightmap canvas
      heightmapCtx.fillStyle = color;
      heightmapCtx.fillRect(x, y, 1, 1);
    }
  }

  // Generate the moisture map
  generateMoistureMap(moisturemapCanvas, moisturemapCtx);
  generateSquareGradient(gradientCanvas, gradientCtx);
}

// Generate the height value for a given position
function generateHeight(x, y) {
  // Generate the height value based on Simplex noise with multiple octaves
  let height = 0;
  let amplitude = 1;
  for (let i = 0; i < octaves; i++) {
    height += amplitude * noise2D(x * frequency * Math.pow(2, i), y * frequency * Math.pow(2, i));
    amplitude /= 2;
  }
  return height;
}

// Generate a gradient value to ensure the outer edges are faded
function generateGradient(x, y, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;

  const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
  const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
  const gradientValue = 4 * (distanceFromCenter / maxDistance);  // adjusts strength of gradient
  
  return gradientValue;
}

// Function to generate the square gradient
function generateSquareGradient(canvas, ctx) {
  const width = canvas.width;
  const height = canvas.height;

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const gradientValue = generateGradient(x, y, width, height);
      const value = Math.floor(gradientValue * 255);
      const color = `rgb(${value},${value},${value})`;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}
