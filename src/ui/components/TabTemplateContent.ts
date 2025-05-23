import { TemplateWrapper } from "./TemplateWrapper";
import { MenuSection } from "./tools-section/MenuSection";
import { TabButtons } from "./tools-section/TabButtons";

export class TabTemplateContent {
  container: HTMLElement;

  constructor() {
    this.container = document.createElement("div");
    this.init();
  }

  init() {
    this.container.className = "tb-tab-content active-tab";
    this.container.id = "templates-content";
    this.container.style.display = "none";

    const div = document.createElement("div");
    div.className = "sidebar-section";
    div.id = "page-templates";

    const templates = [
      { id: "template-one", image: "/Resources/UCGrapes1/src/images/template-1.png" },
      { id: "template-two", image: "/Resources/UCGrapes1/src/images/template-2.png" },
      { id: "template-three", image: "/Resources/UCGrapes1/src/images/template-3.png" },
      { id: "template-four", image: "/Resources/UCGrapes1/src/images/template-4.png" },
    ];

    const templateWrapper = new TemplateWrapper(templates);
    templateWrapper.render(div);

    this.container.appendChild(div);
  }

  render(container: HTMLElement) {
    container.appendChild(this.container);
  }
}
