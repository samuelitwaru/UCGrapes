import ToolboxApp from "../../../app";
import { ThemeManager } from "../../../controls/themes/ThemeManager";
import { ThemeColors } from "../../../types";
import { ColorPalette } from "./ColorPalette";

export class ThemeSection {
  container: HTMLElement;
  themeManager: ThemeManager;

  constructor() {
    this.themeManager = new ThemeManager();
    this.container = document.createElement("div");
    this.init();
  }

  init() {
    this.container.className = "sidebar-section theme-section";
    this.container.style.paddingTop = "0px";

    const colors = this.themeManager.getActiveThemeColors() as ThemeColors;

    const colorPalette = new ColorPalette(colors, 'theme-color-palette');
    colorPalette.render(this.container);
  }

  render(container: HTMLElement) {
    container.appendChild(this.container);
  }
}
