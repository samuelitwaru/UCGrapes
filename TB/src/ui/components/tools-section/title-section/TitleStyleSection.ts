import { TextColor } from "./TextColor";
import { TileAlignmentSection } from "./TileAlignmentSection";

export class TitleStyleSection {
  container: HTMLElement;

  constructor() {
    this.container = document.createElement("div");
    this.init();
  }

  init() {
    this.container.classList.add("title-style");

    const textColorSection = new TextColor();
    const tileAlignmentSection = new TileAlignmentSection();

    textColorSection.render(this.container);    
    tileAlignmentSection.render(this.container);
  }

  render(container: HTMLElement) {
    container.appendChild(this.container)
  }
}
