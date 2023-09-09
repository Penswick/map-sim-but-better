import { createNoise2D } from 'simplex-noise';

// Set up the Simplex noise generator for moisture
let noise2D = createNoise2D(Math.random);

// Generate the moisture map
function generateMoistureMap(canvas, ctx) {
  // Get the actual dimensions of the canvas
  const width = canvas.width;
  const height = canvas.height;
  
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      // Calculate the moisture value
      const moisture = getMoistureValue(x, y);
      
      // Map the moisture value to a grayscale color
      const value = Math.floor(moisture * 255);
      const color = `rgb(${value},${value},${value})`;
      
      // Draw a pixel on the canvas
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

function getMoistureValue(x, y) {
  const moistureFrequency = 0.006;  // Adjust this value to change the size of moisture patterns
  const moistureOctaves = 10;  // Adjust this value to change the number of detail layers in the moisture map
  
  let moisture = 0;
  let amplitude = 1;
  for (let i = 0; i < moistureOctaves; i++) {
    moisture += amplitude * noise2D(x * moistureFrequency * Math.pow(2, i), y * moistureFrequency * Math.pow(2, i));
    amplitude /= 2;
  }
  return (moisture + 1) / 2;  // Normalizing the moisture to be between 0 and 1
}

export { generateMoistureMap, getMoistureValue };
