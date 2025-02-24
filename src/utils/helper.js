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

function processTileTitles(projectData) {
  // Helper function to recursively process components
  function processComponent(component) {
    // Check if this is an array of components
    if (Array.isArray(component)) {
      component.forEach(processComponent);
      return;
    }
    
    // If not an object or doesn't have components, return
    if (!component || typeof component !== 'object') {
      return;
    }

    // Check if this is a tile-title component
    if (component.classes && component.classes.includes('tile-title')) {
      // Check if title attribute exists
      if (!component.attributes || !component.attributes.title) {
        // Find the content in the components array
        const textNode = component.components?.find(comp => comp.type === 'textnode');
        if (textNode && textNode.content) {
          // Create attributes object if it doesn't exist
          if (!component.attributes) {
            component.attributes = {};
          }
          // Add the content as title attribute
          component.attributes.title = textNode.content;
        }
      }
    }

    // Recursively process nested components
    if (component.components) {
      processComponent(component.components);
    }
  }

  // Create a deep copy of the project data to avoid modifying the original
  const updatedData = JSON.parse(JSON.stringify(projectData));
  
  // Process the entire project data
  processComponent(updatedData);
  
  return updatedData;
}