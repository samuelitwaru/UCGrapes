import { TileMapper } from "../../../controls/editor/TileMapper";
import { ThemeColors } from "../../../models/Theme";

export class ColorPalette {
  private paletteContainer: HTMLDivElement;
  private containerId: string;

  constructor(colors: ThemeColors, containerId: string) {
    this.containerId = containerId;
    this.paletteContainer = document.createElement("div");
    this.paletteContainer.className = "color-palette";
    this.paletteContainer.id = containerId;
    this;

    Object.entries(colors).forEach(([colorName, colorValue]) => {
      const colorItem = document.createElement("div");
      colorItem.className = "color-item";

      const input = document.createElement("input");
      input.type = "radio";
      input.id = `color-${colorName}`;
      input.name = "theme-color";
      input.value = colorValue;

      const label = document.createElement("label");
      label.htmlFor = `color-${colorName}`;
      label.className = "color-box";
      label.setAttribute("data-tile-bgcolor", colorValue);
      label.style.backgroundColor = colorValue;

      colorItem.appendChild(input);
      colorItem.appendChild(label);

      colorItem.addEventListener("click", (e) => {
        e.preventDefault();
        const selectedComponent = (globalThis as any).selectedComponent;
        if (!selectedComponent) return;

        const tileWrapper = selectedComponent.parent();
        const rowComponent = tileWrapper.parent();

        const tileAttributes = (globalThis as any).tileMapper.getTile(
          rowComponent.getId(),
          tileWrapper.getId()
        );

        if (tileAttributes?.BGImageUrl) {
          return;
        }

        const currentColor = selectedComponent.getStyle()["background-color"];

        selectedComponent.addStyle({
          "background-color":
            currentColor === colorValue ? "transparent" : colorValue,
        });

        console.log("Tile Attributes", colorValue);
        selectedComponent.getEl().style.backgroundColor = currentColor === colorValue ? "transparent" : colorValue,

        (globalThis as any).tileMapper.updateTile(
          selectedComponent.parent().getId(),
          "BGColor",
          colorName
        );

        input.checked = currentColor !== colorValue;
      });
      this.paletteContainer.appendChild(colorItem);
    });
  }

  render(container: HTMLElement) {
    container.appendChild(this.paletteContainer);
  }

  refresh(container: HTMLElement) {
    const existingComponent = document.getElementById(this.containerId);

    if (existingComponent) {
      existingComponent.replaceWith(this.paletteContainer);
    } else {
      container.appendChild(this.paletteContainer);
    }
  }
}
