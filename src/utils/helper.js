function hexToRgb(hex) {
    hex = hex.replace(/^#/, ""); 
    let r, g, b;
  
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
  
    return `${r}, ${g}, ${b}`;
  }

function truncateText(text, length) {
    if (text.length > length) {
      return text.slice(0, length);
    }
    return text;
}