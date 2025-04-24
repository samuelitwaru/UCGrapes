export class TileImgContainer {
  container: HTMLElement;
  positionX: number = 50;
  positionY: number = 50;

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

    // Position control UI 
    const controls = document.createElement("div");
    controls.className = "image-controls";
    controls.style.display = "flex";
    controls.style.flexDirection = "column";
    controls.style.alignItems = "left";
    controls.style.marginTop = "10px";
    controls.style.marginBottom = "20px";

    const row1 = document.createElement("div");
    const row2 = document.createElement("div");

    const up = this.createArrow("↑", () => this.moveImage(0, -5));
    const down = this.createArrow("↓", () => this.moveImage(0, 5));
    const left = this.createArrow("←", () => this.moveImage(-5, 0));
    const right = this.createArrow("→", () => this.moveImage(5, 0));

    row1.appendChild(up);
    row2.appendChild(left);
    row2.appendChild(down);
    row2.appendChild(right);

    row1.style.marginBottom = "4px";
    row1.style.display = "flex";
    row1.style.justifyContent = "center";

    row2.style.display = "flex";
    row2.style.gap = "6px";
    row2.style.justifyContent = "center";
    row2.style.marginBottom = "4px";
  
    controls.appendChild(row1);
    controls.appendChild(row2);

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
      currentStyles["background-position"] = `${this.positionX}% ${this.positionY}%`;
      
      selectedComponent.addStyle({
        "background-color": `rgba(0, 0, 0, )`,
      });
      
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
      const slider = document.getElementById("slider-wrapper") as HTMLInputElement;
      slider.style.display = "none";
    });

    this.container.appendChild(img);
    this.container.appendChild(button);
    this.container.appendChild(controls);
  }

  createArrow(label: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.type = "button"; 
    btn.textContent = label;
    btn.style.padding = "4px 8px";
    btn.style.cursor = "pointer";
    btn.onclick = (e) => {
      e.preventDefault(); 
      onClick();
    };
    return btn;
  }

  moveImage(dx: number, dy: number) {
    this.positionX = Math.max(0, Math.min(100, this.positionX + dx));
    this.positionY = Math.max(0, Math.min(100, this.positionY + dy));
    const selectedComponent = (globalThis as any).selectedComponent;
      selectedComponent.addStyle({
        "background-position":`${this.positionX}% ${this.positionY}%`
      });
  }

  render(container: HTMLElement) {
    container.appendChild(this.container);
  }
}
