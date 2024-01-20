import seedrandom from 'seedrandom';
import { createNoise2D } from 'simplex-noise';
import { generateMoistureMap, getMoistureValue } from './Controllers/Moisturemap.js';

const heightmapCanvas = document.querySelector('.heightmap');
const heightmapCtx = heightmapCanvas.getContext('2d');
const moisturemapCanvas = document.querySelector('.moisturemap');
const moisturemapCtx = moisturemapCanvas.getContext('2d');
const gradientCanvas = document.querySelector('.gradient');
gradientCanvas.width = heightmapCanvas.width;
gradientCanvas.height = heightmapCanvas.height;
const gradientCtx = gradientCanvas.getContext('2d');
const generateButton = document.querySelector('.generate');
const generateRandomButton = document.querySelector('.generateRandom');
const seedInput = document.querySelector('#seedInput');

let frequency = 0.003;
let octaves = 10;

// TODO: Remove later when moist map + grad are hidden completely.
moisturemapCanvas.style.display = 'none';
gradientCanvas.style.display = 'none';

window.addEventListener('load', () => {
  const initialSize = canvasSizeSelect.value;
  updateCanvasSize(heightmapCanvas, initialSize);
  updateCanvasSize(moisturemapCanvas, initialSize);
  updateCanvasSize(gradientCanvas, initialSize);
});

generateButton.addEventListener('click', () => generateTerrain(seedInput.value));
generateRandomButton.addEventListener('click', () => generateTerrain());

const toggleMoistButton = document.querySelector('.togglemoist');
toggleMoistButton.addEventListener('click', () => {
  moisturemapCanvas.style.display = moisturemapCanvas.style.display === 'none' ? 'block' : 'none';
});

const toggleGradientButton = document.querySelector('.togglegradient');
toggleGradientButton.addEventListener('click', () => {
  gradientCanvas.style.display = gradientCanvas.style.display === 'none' ? 'block' : 'none';
});


function updateCanvasSize(canvas, size) {
  switch(size) {
    case 'small':
      canvas.width = 500;
      canvas.height = 500;
      break;
    case 'medium':
      canvas.width = 1000;
      canvas.height = 1000;
      break;
    case 'large':
      canvas.width = 1500;
      canvas.height = 1500;
      break;
    case 'extraLarge':
      canvas.width = 4096;
      canvas.height = 2160;
      break;
    default:
      console.error(`Invalid size: ${size}`);
  }
}

function generateTerrain(seed) {
  if (!seed) {
    seed = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  console.log(`Seed: ${seed}`); 
  seedInput.value = seed; 

  const rng = seedrandom(seed);
  const noise2D = createNoise2D(rng); // Re-create noise2D with the seed-based RNG

  // Update the canvas size before generating the terrain
  updateCanvasSize(heightmapCanvas);
  updateCanvasSize(moisturemapCanvas);
  updateCanvasSize(gradientCanvas);

  const canvasWidth = heightmapCanvas.width;
  const canvasHeight = heightmapCanvas.height;
  
  heightmapCtx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  // Generate height map
  for (let x = 0; x < canvasWidth; x++) {
    for (let y = 0; y < canvasHeight; y++) {
      let height = generateHeight(x, y, noise2D); 
      const gradientValue = generateGradient(x, y, canvasWidth, canvasHeight);
      height -= gradientValue;
      height = Math.max(height, -1);
      const moisture = getMoistureValue(x, y, noise2D);
      const color = getBiomeColor(height, moisture);
      heightmapCtx.fillStyle = color;
      heightmapCtx.fillRect(x, y, 1, 1);
    }
  }

  // Generate other map layers
  generateMoistureMap(moisturemapCanvas, moisturemapCtx, seed);
  generateSquareGradient(gradientCanvas, gradientCtx);
}

function generateHeight(x, y, noise2D) { 
  let height = 0;
  let amplitude = 1;
  for (let i = 0; i < octaves; i++) {
    height += amplitude * noise2D(x * frequency * Math.pow(2, i), y * frequency * Math.pow(2, i));
    amplitude /= 2;
  }
  return (height + 1) / 2;
  
}

function generateGradient(x, y, width, height, strength = 3) {
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Calculate distance from center on X and Y axis separately
  const distanceX = Math.abs(x - centerX) / centerX;
  const distanceY = Math.abs(y - centerY) / centerY;

  // Uses the maximum value for the gradient
  let gradientValue = Math.max(distanceX, distanceY);

  // Adjust gradient value based on the strength
  gradientValue = Math.pow(gradientValue, strength);

  return gradientValue;
}

function generateSquareGradient(canvas, ctx, strength) {
  const width = canvas.width;
  const height = canvas.height;
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const gradientValue = generateGradient(x, y, width, height, strength);
      const value = Math.floor(gradientValue * 255);
      const color = `rgb(${value},${value},${value})`;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

function getBiomeColor(height, moisture) {
  const biomes = [
    { threshold: 0.25, color: 'rgb(0,63,178)' }, // Deep water
    { threshold: 0.33, color: 'rgb(10,82,196)' }, // Shallow water
    { threshold: 0.35, color: 'rgb(194,175,125,255)' }, // Beach
    { threshold: 0.7, color: (moisture > 0.5) ? 'rgb(60,98,22,255)' : (moisture > 0.2) ? 'rgb(90,127,51,255)' : 'rgb(117,155,76)' }, // Forest, Woodlands, Grasslands
    { threshold: 0.8, color: 'rgb(141,143,124)' }, // Lower mountains
    { threshold: 0.9, color: 'rgb(170,170,170)' }, // Higher mountains
    { threshold: Infinity, color: 'rgb(236,236,235)' } // Snow cap
  ];

  return biomes.find(biome => height < biome.threshold).color;
}

// Menu buttons
const menuButton = document.querySelector('.menu-button');
const controls = document.querySelector('.controls');

menuButton.addEventListener('click', () => {
  controls.classList.toggle('show');
});

const canvasSizeSelect = document.querySelector('#canvasSize');

canvasSizeSelect.addEventListener('change', () => {
  const size = canvasSizeSelect.value;
  updateCanvasSize(heightmapCanvas, size);
  updateCanvasSize(moisturemapCanvas, size);
  updateCanvasSize(gradientCanvas, size);
});