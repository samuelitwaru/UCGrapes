import ToolboxApp from "../../../app";
import { ThemeManager } from "../../../controls/themes/ThemeManager";
import { Theme, ThemeColors } from "../../../models/Theme";
import { ColorPalette } from "./ColorPalette";

export class ThemeSection extends ThemeManager {
  container: HTMLElement;
  
  constructor() {
    super(); 
    this.container = document.createElement("div");
    this.init();
  }

  init() {
    this.container.className = "sidebar-section theme-section";
    this.container.style.paddingTop = "0px";

    const colors: ThemeColors  = this.getActiveThemeColors();

    const colorPalette = new ColorPalette(colors, 'theme-color-palette');
    colorPalette.render(this.container);
  }

  render(container: HTMLElement) {
    container.appendChild(this.container);
  }
}
