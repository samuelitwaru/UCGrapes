export class TextColor {
  container: HTMLElement;

  constructor() {
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

      colorBox.onclick = (e) => {
        e.preventDefault();
        const selectedComponent = (globalThis as any).selectedComponent;
        if (!selectedComponent) return;

        const iconPath = selectedComponent.find("path")[0];

        if (iconPath) {
          iconPath.addAttributes({"fill": colorValue});
        }

        selectedComponent.addStyle({
          color: colorValue,
        });

        (globalThis as any).tileMapper.updateTile(
          selectedComponent.parent().getId(),
          "Color",
          colorValue
        );

        radioInput.checked = true;
      };
    });
  }

  render(container: HTMLElement) {
    container.appendChild(this.container);
  }
}
