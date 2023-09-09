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

  while (highPoints.length < numPoints) {
    const x = Math.floor(Math.random() * canvasWidth);
    const y = Math.floor(Math.random() * canvasHeight);
    const color = getPixelColor(heightmapCtx, x, y);

    if (color === snowColor) {
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
  const riverColor = "rgb(255, 0, 47)";
  const highPoints = findHighPoints(heightmapCtx, canvasWidth, canvasHeight, 1);
  let currentX = highPoints[0].x;
  let currentY = highPoints[0].y;
  let currentValue = getColorValue(getPixelColor(heightmapCtx, currentX, currentY));

  const visitedPoints = new Set();

  for (let step = 0; step < maxSteps; step++) {
    setPixelColor(heightmapCtx, currentX, currentY, riverColor);
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
      break; // If no lower points are found, stop generating the river
    }

    // Add some randomness for more natural rivers 0.05 = 5% chance of picking a different path instead of just the lowest elevation
    if (Math.random() < 0.05) {
      candidatePoints.sort((a, b) => a.value - b.value);
    } else {
      candidatePoints = candidatePoints.sort(() => Math.random() - 0.5);
    }

    const lowestPoint = candidatePoints[0];
    currentX = lowestPoint.x;
    currentY = lowestPoint.y;
    currentValue = lowestPoint.value;
  }
}






export { generateRivers };
