import { createNoise2D } from 'simplex-noise';
import { generateMoistureMap, getMoistureValue } from './Layers/Moisturemap.js';

let noise2D = createNoise2D(Math.random);

const heightmapCanvas = document.querySelector('.heightmap');
const heightmapCtx = heightmapCanvas.getContext('2d');
const moisturemapCanvas = document.querySelector('.moisturemap');
const moisturemapCtx = moisturemapCanvas.getContext('2d');
const gradientCanvas = document.querySelector('.gradient');
gradientCanvas.width = heightmapCanvas.width;
gradientCanvas.height = heightmapCanvas.height;
const gradientCtx = gradientCanvas.getContext('2d');

let frequency = 0.003;
let octaves = 10;

const generateButton = document.querySelector('.generate');
generateButton.addEventListener('click', generateTerrain);

const toggleMoistButton = document.querySelector('.togglemoist');
toggleMoistButton.addEventListener('click', () => {
  moisturemapCanvas.style.display = moisturemapCanvas.style.display === 'none' ? 'block' : 'none';
});

const toggleGradientButton = document.querySelector('.togglegradient');
toggleGradientButton.addEventListener('click', () => {
  gradientCanvas.style.display = gradientCanvas.style.display === 'none' ? 'block' : 'none';
});

function generateTerrain() {
  noise2D = createNoise2D(Math.random);
  const canvasWidth = heightmapCanvas.width;
  const canvasHeight = heightmapCanvas.height;

  heightmapCtx.clearRect(0, 0, canvasWidth, canvasHeight);
  moisturemapCtx.clearRect(0, 0, canvasWidth, canvasHeight);
  gradientCtx.clearRect(0, 0, canvasWidth, canvasHeight);

  for (let x = 0; x < canvasWidth; x++) {
    for (let y = 0; y < canvasHeight; y++) {
      let height = generateHeight(x, y);
      const gradientValue = generateGradient(x, y, canvasWidth, canvasHeight);
      height -= gradientValue;
      height = Math.max(height, -1);
      const moisture = getMoistureValue(x, y, canvasWidth, canvasHeight);
      const color = getBiomeColor(height, moisture);
      heightmapCtx.fillStyle = color;
      heightmapCtx.fillRect(x, y, 1, 1);
    }
  }
  generateMoistureMap(moisturemapCanvas, moisturemapCtx);
  generateSquareGradient(gradientCanvas, gradientCtx);
}

function generateHeight(x, y) {
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
  const deepWaterThreshold = 0.3;  // Increased to 0.2
  const shallowWaterThreshold = 0.33;  // Increased to 0.3
  const beachThreshold = 0.35;  // Increased to 0.35
  const forestMoisture = 0.5;
  const woodlandsMoisture = 0.2;
  const lowerMountainThreshold = 0.8;

  if (height < deepWaterThreshold) {
      return 'rgb(0,63,178)';  // Deep water color
  } else if (height < shallowWaterThreshold) {
      return 'rgb(10,82,196)';  // Shallow water color
  } else if (height < beachThreshold) {
      return 'rgb(194,175,125,255)';  // Beach color
  } else if (height < 0.7) {
      if (moisture > forestMoisture) {
          return 'rgb(60,98,22,255)';  // Heavy forest color
      } else if (moisture > woodlandsMoisture) {
          return 'rgb(90,127,51,255)';  // Woodlands color
      } else {
          return 'rgb(117,155,76)';  // Grasslands color
      }
    } else if (height < lowerMountainThreshold) {
      return 'rgb(141,143,124)';  // Darker gray for the lower mountains
    } else if (height < 0.9) {
      return 'rgb(170,170,170)';  // lighter gray for the higher mountains
    } else {
      return 'rgb(236,236,235)';  // Snow cap 
  }
}
