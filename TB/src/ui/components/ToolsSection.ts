import { TabButtons } from "./tools-section/TabButtons";
import { TabPageContent } from "./TabPageContent";
import { TabTemplateContent } from "./TabTemplateContent";

export class ToolsSection {
  container: HTMLElement;
  constructor() {
    this.container = document.getElementById("tools-section") as HTMLElement;
    this.init();
  }

  init() {
    const tabButtons = new TabButtons();
    const pagesTabContent = new TabPageContent();
    const templatesTabContent = new TabTemplateContent();

    tabButtons.render(this.container);
    pagesTabContent.render(this.container);
    templatesTabContent.render(this.container);
  }

  render(container: HTMLElement) {
    container.appendChild(this.container);
  }
}
