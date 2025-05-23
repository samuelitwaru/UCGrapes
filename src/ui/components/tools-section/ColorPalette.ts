import { TileMapper } from "../../../controls/editor/TileMapper";
import { InfoSectionManager } from "../../../controls/InfoSectionManager";
import { InfoType, ThemeColors } from "../../../types";

export class ColorPalette {
  private paletteContainer: HTMLDivElement;
  private containerId: string;

  constructor(colors: ThemeColors, containerId: string) {
    this.containerId = containerId;
    this.paletteContainer = this.createPaletteContainer(containerId);
    this.populateColorPalette(colors);
  }

  render(container: HTMLElement): void {
    container.appendChild(this.paletteContainer);
  }

  refresh(container: HTMLElement): void {
    const existingComponent = document.getElementById(this.containerId);

    if (existingComponent) {
      existingComponent.replaceWith(this.paletteContainer);
    } else {
      container.appendChild(this.paletteContainer);
    }
  }

  private createPaletteContainer(containerId: string): HTMLDivElement {
    const container = document.createElement("div");
    container.className = "color-palette";
    container.id = containerId;
    return container;
  }

  private populateColorPalette(colors: ThemeColors): void {
    Object.entries(colors).forEach(([colorName, colorValue]) => {
      const colorItem = this.createColorItem(colorName, colorValue);
      this.paletteContainer.appendChild(colorItem);
    });
  }

  private createColorItem(
    colorName: string,
    colorValue: string
  ): HTMLDivElement {
    const colorItem = document.createElement("div");
    colorItem.className = "color-item";

    const input = this.createRadioInput(colorName, colorValue);
    const label = this.createColorLabel(colorName, colorValue);

    colorItem.appendChild(input);
    colorItem.appendChild(label);

    colorItem.addEventListener("click", (e) =>
      this.handleColorSelection(e, colorValue, colorName, input)
    );

    return colorItem;
  }

  private createRadioInput(
    colorName: string,
    colorValue: string
  ): HTMLInputElement {
    const input = document.createElement("input");
    input.type = "radio";
    input.id = `color-${colorName}`;
    input.name = "theme-color";
    input.value = colorValue;
    return input;
  }

  private createColorLabel(
    colorName: string,
    colorValue: string
  ): HTMLLabelElement {
    const label = document.createElement("label");
    label.htmlFor = `color-${colorName}`;
    label.className = "color-box";
    label.setAttribute("data-tile-bgcolor", colorValue);
    label.style.backgroundColor = colorValue;
    return label;
  }

  private handleColorSelection(
    e: Event,
    colorValue: string,
    colorName: string,
    input: HTMLInputElement
  ): void {
    e.preventDefault();

    const selectedComponent = this.getSelectedComponent();
    if (!selectedComponent) return;

    const tileWrapper = selectedComponent.parent();
    const rowComponent = tileWrapper.parent();
    const pageData = this.getPageData();

    const tileAttributes = this.getTileAttributes(
      pageData,
      rowComponent,
      tileWrapper,
      selectedComponent
    );
    if (tileAttributes?.BGImageUrl) return;

    const currentColor = selectedComponent.getStyle()["background-color"];
    const newColor = currentColor === colorValue ? "transparent" : colorValue;
    const newColorName = currentColor === colorValue ? "transparent" : colorName;
    
    this.updateComponentStyle(selectedComponent, newColor);
    this.updateTileData(
      pageData,
      rowComponent,
      tileWrapper,
      selectedComponent,
      newColorName
    );

    // Toggle radio button state
    input.checked = selectedComponent.getStyle()["background-color"] === colorValue;
  }

  private getSelectedComponent(): any {
    return (globalThis as any).selectedComponent;
  }

  private getPageData(): any {
    return (globalThis as any).pageData;
  }

  private getTileAttributes(
    pageData: any,
    rowComponent: any,
    tileWrapper: any,
    selectedComponent: any
  ): any {
    if (pageData.PageType === "Information") {
      const tileInfoSectionAttributes: InfoType = (
        globalThis as any
      ).infoContentMapper.getInfoContent(
        selectedComponent.parent().parent().getId()
      );

      return tileInfoSectionAttributes?.Tiles?.find(
        (tile) => tile.Id === selectedComponent.parent().getId()
      );
    } else {
      return (globalThis as any).tileMapper.getTile(
        rowComponent.getId(),
        tileWrapper.getId()
      );
    }
  }

  private updateComponentStyle(component: any, colorValue: string): void {
    component.addStyle({
      "background-color": colorValue,
    });

    component.getEl().style.backgroundColor = colorValue;
  }

  private updateTileData(
    pageData: any,
    rowComponent: any,
    tileWrapper: any,
    selectedComponent: any,
    colorName: string
  ): void {
    if (pageData.PageType === "Information") {
      const infoSectionManager = new InfoSectionManager();
      infoSectionManager.updateInfoTileAttributes(
        rowComponent.getId(),
        tileWrapper.getId(),
        "BGColor",
        colorName
      );
    } else {
      (globalThis as any).tileMapper.updateTile(
        selectedComponent.parent().getId(),
        "BGColor",
        colorName
      );
    }
  }
}