export class TileImgContainer {
  container: HTMLElement;
  positionX: number = 50;
  positionY: number = 50;
  zoomLevel: number = 1;

  constructor() {
    this.container = document.createElement("div");
    this.init();
   }


  init() {
    this.container.classList.add("tile-img-container");
    this.container.id = "tile-img-container";
    
    this.container.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#4C5357" stroke-width="1" stroke-linecap="round" stroke-linejoin="miter">
      <line x1="2" y1="6" x2="22" y2="6"></line>
      <polyline points="8 6 8 2 16 2 16 6"></polyline>
      <line x1="9" y1="10" x2="9" y2="18"></line><line x1="15" y1="10" x2="15" y2="18"></line>
      <polyline points="20 6 20 22 4 22 4 6"></polyline>
    </svg>
    `;

    let tileAttributes;
    this.container.addEventListener("click", (e) => {
      e.preventDefault();
      const selectedComponent = (globalThis as any).selectedComponent;
      if (!selectedComponent) return;

      const tileWrapper = selectedComponent.parent();
      const rowComponent = tileWrapper.parent();
      tileAttributes = (globalThis as any).tileMapper.getTile(
        rowComponent.getId(),
        tileWrapper.getId()
      );

      const currentStyles = selectedComponent.getStyle();
      console.log('currentStyles ',currentStyles)
      delete currentStyles["background-image"];
      console.log(tileAttributes)
      currentStyles["background-color"] = tileAttributes.BGColor;
           
      selectedComponent.setStyle(currentStyles);

      (globalThis as any).tileMapper.updateTile(
        selectedComponent.parent().getId(),
        "BGImageUrl",
        ""
      );

      (globalThis as any).tileMapper.updateTile(
        selectedComponent.parent().getId(),
        "Opacity",
        "0"
      );

      this.container.style.display = "none";
      this.container.style.position = "relative";
      this.container.style.overflow = "hidden";
      const slider = document.getElementById("slider-wrapper") as HTMLInputElement;
      slider.style.display = "none";
    });
  }


   render(container: HTMLElement) {
     container.appendChild(this.container);
   }
  
}
