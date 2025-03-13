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
      const selectedComponent = (globalThis as any).selectedComponent;
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
        tileTitle.addAttributes({ title: this.input.value });
      }

      (globalThis as any).tileMapper.updateTile(
        selectedComponent.parent().getId(),
        "Text",
        this.input.value.trim()
      );
    });
  }

  truncate(length: number) {
    if (this.input.value.length > length) {
      return this.input.value.substring(0, length) + "..";
    }
    return this.input.value;
  }

  render(container: HTMLElement) {
    container.appendChild(this.input);
  }
}
