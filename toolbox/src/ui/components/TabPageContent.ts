import { ContentSection } from "./tools-section/ContentSection";
import { MenuSection } from "./tools-section/MenuSection";
import { TabButtons } from "./tools-section/TabButtons";

export class TabPageContent {
  container: HTMLElement;
  contentSection: ContentSection = new ContentSection;

  constructor() {
    this.container = document.createElement("div");
    this.init();
  }

  init() {
    this.container.className = "tb-tab-content active-tab";
    this.container.id = "pages-content";

    const menuSection = new MenuSection();
    menuSection.render(this.container);
    this.contentSection = new ContentSection();
    this.contentSection.render(this.container)
  }

  render(container: HTMLElement) {
    container.appendChild(this.container);
  }
}
