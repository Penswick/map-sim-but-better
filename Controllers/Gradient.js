function generateGradient(x, y, width, height, strength = 3) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    const distanceX = Math.abs(x - centerX) / centerX;
    const distanceY = Math.abs(y - centerY) / centerY;
  
    let gradientValue = Math.max(distanceX, distanceY);
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
  
  export { generateGradient, generateSquareGradient };