// ImageCrop.ts

// Create and export the ImageCrop modal
export const ImageCrop = document.createElement('div');
ImageCrop.id = 'image-cropper';
ImageCrop.style.cssText = `
  display: none;
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-color: rgba(0,0,0,0.7);
  justify-content: center;
  align-items: center;
`;

ImageCrop.innerHTML = `
  <div style="background: white; padding: 20px; border-radius: 10px; text-align: center;">
    <canvas id="canvas" style="max-width: 100%; border: 1px solid #ccc;"></canvas>
    <div style="margin-top: 10px;">
      <button id="zoomIn">Zoom In</button>
      <button id="zoomOut">Zoom Out</button>
      <button id="crop">Crop</button>
      <button id="close">Close</button>
    </div>
  </div>
`;

document.body.appendChild(ImageCrop);

// Add close logic
document.getElementById('close')?.addEventListener('click', () => {
  ImageCrop.style.display = 'none';
});
