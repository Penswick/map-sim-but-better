function getPixelColor(ctx, x, y) {
  const pixel = ctx.getImageData(x, y, 1, 1).data;
  return `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
}

function setPixelColor(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}

function findHighPoints(heightmapCtx, canvasWidth, canvasHeight, numPoints) {
  const highPoints = [];
  const snowColor = 'rgb(236,236,235)'; // Snowy areas
  const heightThreshold = 0.7 * 255 * 3; // Adjusted based on lowerMountainThreshold in getBiomeColor

  while (highPoints.length < numPoints) {
    const x = Math.floor(Math.random() * canvasWidth);
    const y = Math.floor(Math.random() * canvasHeight);
    const color = getPixelColor(heightmapCtx, x, y);
    const value = getColorValue(color);

    if (value > heightThreshold || color === snowColor) {
      highPoints.push({ x, y });
    }
  }

  return highPoints;
}

function getColorValue(color) {
  const rgb = color.match(/\d+/g); // Extract numbers
  return rgb.reduce((acc, val) => acc + parseInt(val, 10), 0);
}

function generateRivers(heightmapCtx, canvasWidth, canvasHeight) {
  const maxSteps = 100;
  const riverColor = 'rgb(10,82,196)';
  const startPointColor = 'rgb(255,0,0)'; // Color for the starting point

  const highPoints = findHighPoints(heightmapCtx, canvasWidth, canvasHeight, 1);
  let currentX = highPoints[0].x;
  let currentY = highPoints[0].y;
  let currentValue = getColorValue(getPixelColor(heightmapCtx, currentX, currentY));

  // Set the starting point of the river to red
  setPixelColor(heightmapCtx, currentX, currentY, startPointColor);

  const visitedPoints = new Set();

  for (let step = 0; step < maxSteps; step++) {
    // Skip coloring the starting point
    if (step !== 0) {
      setPixelColor(heightmapCtx, currentX, currentY, riverColor);
    }
    visitedPoints.add(`${currentX},${currentY}`);

    let candidatePoints = [];

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const newX = currentX + dx;
        const newY = currentY + dy;

        if (newX < 0 || newX >= canvasWidth || newY < 0 || newY >= canvasHeight || visitedPoints.has(`${newX},${newY}`)) {
          continue;
        }

        const color = getPixelColor(heightmapCtx, newX, newY);
        const value = getColorValue(color);

        if (value <= currentValue) {
          candidatePoints.push({ x: newX, y: newY, value });
        }
      }
    }

    if (candidatePoints.length === 0) {
      break;
    }

    // Pick a candidate point randomly from all the available options
    const randomIndex = Math.floor(Math.random() * candidatePoints.length);
    const selectedPoint = candidatePoints[randomIndex];
    currentX = selectedPoint.x;
    currentY = selectedPoint.y;
    currentValue = selectedPoint.value;
  }
}





export { generateRivers };