// function hexToRgb(hex) {
//   hex = hex.replace(/^#/, "");
//   let r, g, b;

//   if (hex.length === 3) {
//     r = parseInt(hex[0] + hex[0], 16);
//     g = parseInt(hex[1] + hex[1], 16);
//     b = parseInt(hex[2] + hex[2], 16);
//   } else {
//     r = parseInt(hex.substring(0, 2), 16);
//     g = parseInt(hex.substring(2, 4), 16);
//     b = parseInt(hex.substring(4, 6), 16);
//   }

//   return `${r}, ${g}, ${b}`;
// }

// function rgbaToHex(rgba) {
//   // Extract the RGBA values using regex
//   const rgbaMatch = rgba.match(
//     /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)/
//   );

//   if (!rgbaMatch) {
//     throw new Error("Invalid RGBA format");
//   }

//   // Convert the RGB values to hex
//   const r = parseInt(rgbaMatch[1]).toString(16).padStart(2, "0");
//   const g = parseInt(rgbaMatch[2]).toString(16).padStart(2, "0");
//   const b = parseInt(rgbaMatch[3]).toString(16).padStart(2, "0");

//   // Convert alpha to hex if it exists
//   let a = "";
//   if (rgbaMatch[4] !== undefined) {
//     // Convert alpha from 0-1 to 0-255 and then to hex
//     a = Math.round(parseFloat(rgbaMatch[4]) * 255)
//       .toString(16)
//       .padStart(2, "0");
//   }

//   return `#${r}${g}${b}${a}`;
// }

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
