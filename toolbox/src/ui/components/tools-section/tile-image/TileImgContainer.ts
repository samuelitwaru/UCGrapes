export class TileImgContainer {
  container: HTMLElement;

  constructor() {
    this.container = document.createElement("div");
    this.init();
  }

  init() {
    this.container.classList.add("tile-img-container");
    this.container.id = "tile-img-container";
    
    const img = document.createElement("img");
    img.alt = "Tile Image";
    img.src =
      "https://staging.comforta.yukon.software/media/receptie-197@3x.png";
    img.className = "tile-img-thumbnail";

    const button = document.createElement("button");
    button.className = "tile-img-delete-button";
    button.id = "tile-img-delete-button";
    button.innerHTML = '<i class="fa fa-xmark"></i>';
    
    let tileAttributes;
    button.addEventListener("click", (e) => {
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
      delete currentStyles["background-image"];
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
      const slider = document.getElementById(
        "slider-wrapper"
      ) as HTMLInputElement;
      slider.style.display = "none";
    });

    console.log("TileImgContainer: ", tileAttributes);

    this.container.appendChild(img);
    this.container.appendChild(button);
  }

  render(container: HTMLElement) {
    container.appendChild(this.container);
  }
}
