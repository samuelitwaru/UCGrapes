import { InfoSectionManager } from "../../../../controls/InfoSectionManager";
import { capitalizeWords } from "../../../../utils/helpers";

export class TitleInputSection {
  input: HTMLInputElement;

  constructor() {
    this.input = document.createElement("input");
    this.init();
  }

  init() {
    this.input.type = "text";
    this.input.placeholder = "Enter a title";
    this.input.classList.add("tb-form-control");
    this.input.id = "tile-title";

    this.input.addEventListener("input", (e) => {
      let titleValue = capitalizeWords(this.input.value)
      const selectedComponent = (globalThis as any).selectedComponent;

      let isFirstTile =
        selectedComponent.getClasses().includes("first-tile") &&
        selectedComponent.getClasses().includes("high-priority-template");

      if (!selectedComponent) return;
      const componentRow = selectedComponent.closest(".container-row");
      const rowTilesLength = componentRow.components().length;

      const tileTitle = selectedComponent.find(".tile-title")[0];
      if (tileTitle) {
        const truncatedTitle =
          rowTilesLength === 3
            ? this.truncate(11)
            : rowTilesLength === 2
            ? this.truncate(14)
            : this.truncate(25);
        tileTitle.components(truncatedTitle);
        tileTitle.addAttributes({ title: titleValue });
      }

      // if tile is first and high priority, set text to upper case
      if (isFirstTile) titleValue = titleValue.toUpperCase();
      const pageData = this.getPageData();
      if (pageData.PageType === "Information") {
        const infoSectionManager = new InfoSectionManager();
        infoSectionManager.updateInfoTileAttributes(
          selectedComponent.parent().parent().getId(),
          selectedComponent.parent().getId(),
          "Text",
          titleValue.trim()
        );
      } else {
        (globalThis as any).tileMapper.updateTile(
          selectedComponent.parent().getId(),
          "Text",
          titleValue.trim()
        );
      }

      const parentComponent = tileTitle.parent();
      if (parentComponent) {
        if (parentComponent.getStyle()["display"] === "none") {
          parentComponent.addStyle({ display: "block" });
        }
      }
    });
  }

  truncate(length: number) {
    if (this.input.value.length > length) {
      return this.input.value.substring(0, length) + "..";
    }
    return this.input.value;
  }

  private getPageData(): any {
    return (globalThis as any).pageData;
  }

  render(container: HTMLElement) {
    container.appendChild(this.input);
  }
}
