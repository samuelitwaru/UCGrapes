import { MenuSection } from "./tools-section/MenuSection";
import { TabButtons } from "./tools-section/TabButtons";

export class TabPageContent {
  container: HTMLElement;

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

  render(container: HTMLElement) {
    container.appendChild(this.container);
  }
}
