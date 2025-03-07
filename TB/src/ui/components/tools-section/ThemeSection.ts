import { ColorPalette } from "./ColorPalette";

export class ThemeSection {
  container: HTMLElement;
  constructor() {
    this.container = document.createElement("div");
    this.init();
  }

  init() {
    this.container.className = "sidebar-section theme-section";
    this.container.style.paddingTop = "0px";

    const colors = [
      { id: "ButtonBgColor", name: "Button Background", hex: "#a48f79" },
      { id: "accentColor", name: "Accent Color", hex: "#393736" },
      { id: "backgroundColor", name: "Background Color", hex: "#2c405a" },
      { id: "borderColor", name: "Border Color", hex: "#666e61" },
      { id: "buttonTextColor", name: "Button Text", hex: "#d4a76a" },
      { id: "cardBgColor", name: "Card Background", hex: "#969674" },
      { id: "cardTextColor", name: "Card Text", hex: "#b2b997" },
      { id: "primaryColor", name: "Primary Color", hex: "#c4a082" },
      { id: "secondaryColor", name: "Secondary Color", hex: "#e9c4aa" },
      { id: "textColor", name: "Text Color", hex: "#b7b7b7" },
    ];

    const colorPalette = new ColorPalette(colors, 'theme-color-palette');
    colorPalette.render(this.container);
  }

  render(container: HTMLElement) {
    container.appendChild(this.container);
  }
}
