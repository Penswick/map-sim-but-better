import seedrandom from 'seedrandom';
import { createNoise2D } from 'simplex-noise';

function generateMoistureMap(canvas, ctx, seed) {
  const rng = seedrandom(seed); 
  const noise2D = createNoise2D(rng); 
  console.log(`moistureseed: ${seed}`); 


  // Gets the actual dimensions of the canvas
  const width = canvas.width;
  const height = canvas.height;
  
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      // Calculate the moisture value
      const moisture = getMoistureValue(x, y, noise2D);
      
      // Map the moisture value to a grayscale color
      const value = Math.floor(moisture * 255);
      const color = `rgb(${value},${value},${value})`;
      
      // Draw a pixel on the canvas
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

function getMoistureValue(x, y, noise2D) {
  const moistureFrequency = 0.006;  
  const moistureOctaves = 10; 
  
  let moisture = 0;
  let amplitude = 1;
  for (let i = 0; i < moistureOctaves; i++) {
    moisture += amplitude * noise2D(x * moistureFrequency * Math.pow(2, i), y * moistureFrequency * Math.pow(2, i));
    amplitude /= 2;
  }
  return (moisture + 1) / 2;  // Normalizing the moisture to be between 0 and 1
}

export { generateMoistureMap, getMoistureValue };