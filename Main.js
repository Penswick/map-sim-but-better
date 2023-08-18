import { createNoise2D } from 'simplex-noise';
import { generateMoistureMap, getMoistureValue } from './Layers/Moisturemap.js';

// Set up the Simplex noise generator
let noise2D = createNoise2D(Math.random);

const biomeColors = {
  ocean: 'rgb(21, 109, 186)',      // Deep blue
  beach: 'rgb(238, 214, 175)',   // Sand color
  desert: 'rgb(204, 204, 128)',  // Desert yellow
  grassland: 'rgb(34, 139, 34)', // Green
  forest: 'rgb(0, 100, 0)',      // Dark green
  mountain: 'rgb(189, 189, 178)',  // Grey
  snow: 'rgb(255, 250, 250)',     // White
  unknown: 'rgb(255, 0, 0)'       // Red color to indicate unknown regions
};

// Get the canvas elements
const heightmapCanvas = document.querySelector('.heightmap');
const heightmapCtx = heightmapCanvas.getContext('2d');
const moisturemapCanvas = document.querySelector('.moisturemap');
const moisturemapCtx = moisturemapCanvas.getContext('2d');

// Get the map type element
const mapTypeElement = document.getElementById('map-type');

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
    mapTypeElement.textContent = 'Moisturemap';
  } else {
    moisturemapCanvas.style.display = 'none';
    mapTypeElement.textContent = 'Heightmap';
  }
});

// Generate the terrain
function generateTerrain() {
  console.log('Beep boop');
  
  // Reinitialize the Simplex noise generator with a new random seed
  noise2D = createNoise2D(Math.random);

  // Get the actual dimensions of the canvas
  const canvasWidth = heightmapCanvas.width;
  const canvasHeight = heightmapCanvas.height;
  
  // Clear the canvases
  heightmapCtx.clearRect(0, 0, canvasWidth, canvasHeight);
  moisturemapCtx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Create ImageData for optimized drawing
  const heightmapImageData = heightmapCtx.createImageData(canvasWidth, canvasHeight);

  // Generate the terrain
  for (let x = 0; x < canvasWidth; x++) {
    for (let y = 0; y < canvasHeight; y++) {
      // Calculate the height based on Simplex noise
      const height = generateHeight(x, y);

      const moisture = getMoistureValue(x, y, canvasWidth, canvasHeight);
      const biome = determineBiome(height, moisture);
      const color = biomeColors[biome];
      const [r, g, b] = color.match(/\d+/g).map(Number);  // Extract RGB values

      const index = (y * canvasWidth + x) * 4;
      heightmapImageData.data[index] = r;
      heightmapImageData.data[index + 1] = g;
      heightmapImageData.data[index + 2] = b;
      heightmapImageData.data[index + 3] = 255; // alpha channel, fully opaque
    }
  }

  // Draw the entire ImageData to the canvas
  heightmapCtx.putImageData(heightmapImageData, 0, 0);

  // Generate the moisture map
  generateMoistureMap(moisturemapCanvas, moisturemapCtx);
}

// Generate the height value for a given position
function generateHeight(x, y) {
  let height = 0;
  let amplitude = 1;
  for (let i = 0; i < octaves; i++) {
    height += amplitude * noise2D(x * frequency * Math.pow(2, i), y * frequency * Math.pow(2, i));
    amplitude /= 2;
  }
  return height;
}

function determineBiome(elevation, moisture) {
  // Define thresholds
  const elevationThresholds = {
      ocean: 0.2,
      beach: 0.25,
      desert: 0.3,
      grassland: 0.5,
      forest: 0.75,
      mountain: 0.85,
      snow: 0.93
  };

  const moistureThresholds = {
      low: 0.3,
      medium: 0.6,
      high: 1.0
  };

  // Determine biome based on elevation and moisture
  if (elevation < elevationThresholds.ocean) {
      return 'ocean';
  } else if (elevation < elevationThresholds.beach) {
      if (moisture > moistureThresholds.low && moisture < moistureThresholds.high) {
          return 'beach';
      } else {
          return 'ocean';  // Default to ocean for values outside this moisture range
      }
  } else if (elevation < elevationThresholds.desert) {
      if (moisture < moistureThresholds.low) {
          return 'desert';
      } else {
          return 'beach';  // Default to beach for values outside this moisture range
      }
  } else if (elevation < elevationThresholds.grassland) {
      if (moisture < moistureThresholds.high) {
          return 'grassland';
      } else {
          return 'forest';  // Default to forest for high moisture values
      }
  } else if (elevation < elevationThresholds.forest) {
      return 'forest';  // Forest takes precedence for this elevation range
  } else if (elevation < elevationThresholds.mountain) {
      if (moisture < moistureThresholds.high) {
          return 'mountain';
      } else {
          return 'forest';  // Forests can appear here with high moisture
      }
  } else if (elevation < elevationThresholds.snow) {
      return 'mountain';  // Handle the case just below snow threshold
  } else {
      return 'snow';  // Snow takes precedence for the highest elevation values
  }
}




