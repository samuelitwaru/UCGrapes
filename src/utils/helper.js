function addOpacityToHex(hexColor, opacityPercent=100) {
  hexColor = hexColor.replace('#', '');
  if (!/^[0-9A-Fa-f]{6}$/.test(hexColor)) {
      throw new Error('Invalid hex color format. Please use 6 digit hex color (e.g., 758a71)');
  }

  if (opacityPercent < 0 || opacityPercent > 100) {
      throw new Error('Opacity must be between 0 and 100');
  }

  const opacityDecimal = opacityPercent / 100;

  const alphaHex = Math.round(opacityDecimal * 255).toString(16).padStart(2, '0');

  return `#${hexColor}${alphaHex}`;
}

function truncateText(text, length) {
  if (text.length > length) {
    return text.slice(0, length);
  }
  return text;
}
