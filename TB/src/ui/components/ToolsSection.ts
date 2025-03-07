import { TabButtons } from "./tools-section/TabButtons";
import { TabPageContent } from "./TabPageContent";

export class ToolsSection {
  container: HTMLElement;
  constructor() {
    this.container = document.getElementById("tools-section") as HTMLElement;
    this.init();
  }

  init() {
    const tabButtons = new TabButtons();
    const pagesTab = new TabPageContent();

    tabButtons.render(this.container);
    pagesTab.render(this.container);
  }

  render(container: HTMLElement) {
    container.appendChild(this.container);
  }
}
