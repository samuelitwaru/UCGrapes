import { ContentMapper } from "../../../../controls/editor/ContentMapper";
import { InfoSectionManager } from "../../../../controls/InfoSectionManager";

export class TextColor {
  container: HTMLElement;
  private type: "tile" | "cta";

  constructor(type: "tile" | "cta") {
    this.type = type;
    this.container = document.createElement("div");
    this.init();
  }

  init() {
    const colorValues = {
      color1: "#ffffff",
      color2: "#333333",
    };

    this.container.className = "text-color-palette text-colors";
    this.container.id = "text-color-palette";

    Object.entries(colorValues).forEach(([colorName, colorValue]) => {
      const colorItem = document.createElement("div");
      colorItem.className = "color-item";

      const radioInput = document.createElement("input");
      radioInput.type = "radio";
      radioInput.id = `text-color-${colorName}`;
      radioInput.name = "text-color";
      radioInput.value = colorValue;

      const colorBox = document.createElement("label");
      colorBox.className = "color-box";
      colorBox.setAttribute("for", `text-color-${colorName}`);
      colorBox.style.backgroundColor = colorValue;
      colorBox.setAttribute("data-tile-color", colorValue);

      colorItem.appendChild(radioInput);
      colorItem.appendChild(colorBox);
      this.container.appendChild(colorItem);

      colorItem.onclick = (e) => {
        e.preventDefault();
        const selectedComponent = (globalThis as any).selectedComponent;
        if (!selectedComponent) return;
        if (this.type === "tile") {
          this.tileStyle(selectedComponent, colorValue);
        } else if (this.type === "cta") {
          this.ctaStyle(selectedComponent, colorValue);
        }

        radioInput.checked = true;
      };
    });
  }

  private tileStyle(selectedComponent: any, colorValue: string) {
    const iconPath = selectedComponent.find(".tile-icon")[0];

    if (iconPath) {
      const svgElement = iconPath && iconPath.view.el.querySelector("svg");
      if (svgElement) {
        svgElement.querySelector("path")?.setAttribute("fill", colorValue);
      }
    }

    selectedComponent.addStyle({
      color: colorValue,
    });

    const pageData = (globalThis as any).pageData;

    if (pageData.PageType === "Information") {
      const infoSectionManager = new InfoSectionManager();
      infoSectionManager.updateInfoTileAttributes(
        selectedComponent.parent().parent().getId(),
        selectedComponent.parent().getId(),
        "Color",
        colorValue
      );
    } else {
      (globalThis as any).tileMapper.updateTile(
        selectedComponent.parent().getId(),
        "Color",
        colorValue
      );
    }
  }

  private ctaStyle(selectedComponent: any, colorValue: string) {
    const iconPath = selectedComponent.find(".img-button-icon > svg > path")[0];
    if (iconPath) {
      iconPath.addAttributes({ fill: colorValue });
    }

    const buttonLabel = selectedComponent.find(".label")[0];
    if (buttonLabel) {
      buttonLabel.addStyle({
        color: colorValue,
      });
    }

    const arrowIcon = selectedComponent.find(".fa.fa-angle-right")[0];
    if (arrowIcon) {
      arrowIcon.addStyle({
        color: colorValue,
      });
    }

    const roundButtonIcon = selectedComponent.find(
      ".cta-button > svg > path"
    )[0];

    if (roundButtonIcon) {
      roundButtonIcon.addAttributes({ fill: colorValue });
      buttonLabel.addStyle({
        color: "#333333",
      });
    }

    const pageId = (globalThis as any).currentPageId;
    const pageData = (globalThis as any).pageData;

    if (pageData.PageType === "Information") {
      const infoSectionManager = new InfoSectionManager();
      infoSectionManager.updateInfoCtaAttributes(
        selectedComponent.getId(),
        "CtaColor",
        colorValue
      );
    } else {
      new ContentMapper(pageId).updateContentCtaColor(
        selectedComponent.getId(),
        colorValue
      );
    }
  }

  render(container: HTMLElement) {
    const existingTextColor = container.querySelector("#text-color-palette");
    if (existingTextColor) {
      existingTextColor.remove();
    }
    container.appendChild(this.container);
  }
}
