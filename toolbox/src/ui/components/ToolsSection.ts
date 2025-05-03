import { TabButtons } from "./tools-section/TabButtons";
import { TabPageContent } from "./TabPageContent";
import { TabTemplateContent } from "./TabTemplateContent";

export class ToolsSection {
  container: HTMLElement;
  pagesTabContent: TabPageContent | undefined;
  constructor() {
    this.container = document.getElementById("tools-section") as HTMLElement;
    this.init();
  }

  init() {
    const tabButtons = new TabButtons();
    this.pagesTabContent = new TabPageContent();
    const templatesTabContent = new TabTemplateContent();

    // tabButtons.render(this.container);
    this.pagesTabContent.render(this.container);
    templatesTabContent.render(this.container);

    (window as any).app.toolsSection = this
  }

  render(container: HTMLElement) {
    container.appendChild(this.container);
  }
}
