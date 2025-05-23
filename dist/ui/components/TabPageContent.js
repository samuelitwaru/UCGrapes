import { MenuSection } from "./tools-section/MenuSection";
export class TabPageContent {
    constructor() {
        this.container = document.createElement("div");
        this.init();
    }
    init() {
        this.container.className = "tb-tab-content active-tab";
        this.container.id = "pages-content";
        const menuSection = new MenuSection();
        menuSection.render(this.container);
    }
    render(container) {
        container.appendChild(this.container);
    }
}
//# sourceMappingURL=TabPageContent.js.map