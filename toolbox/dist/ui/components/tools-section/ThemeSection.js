import { ThemeManager } from "../../../controls/themes/ThemeManager";
import { ColorPalette } from "./ColorPalette";
export class ThemeSection extends ThemeManager {
    constructor() {
        super();
        this.container = document.createElement("div");
        this.init();
    }
    init() {
        this.container.className = "sidebar-section theme-section";
        this.container.style.paddingTop = "0px";
        const colors = this.getActiveThemeColors();
        const colorPalette = new ColorPalette(colors, 'theme-color-palette');
        colorPalette.render(this.container);
    }
    render(container) {
        container.appendChild(this.container);
    }
}
//# sourceMappingURL=ThemeSection.js.map