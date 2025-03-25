import { TabButtons } from "./TabButtons";
export class ToolsSection {
    constructor() {
        this.container = document.getElementById("tools-section");
        this.init();
    }
    init() {
        const tabButtons = new TabButtons();
        tabButtons.render(this.container);
    }
    render(container) {
        container.appendChild(this.container);
    }
}
//# sourceMappingURL=ToolsSection.js.map