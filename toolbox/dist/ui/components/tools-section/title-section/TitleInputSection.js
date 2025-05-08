import { InfoSectionController } from "../../../../controls/InfoSectionController";
export class TitleInputSection {
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
            const selectedComponent = globalThis.selectedComponent;
            let isFirstTile = selectedComponent.getClasses().includes("first-tile") && selectedComponent.getClasses().includes("high-priority-template");
            if (!selectedComponent)
                return;
            const componentRow = selectedComponent.closest(".container-row");
            const rowTilesLength = componentRow.components().length;
            const tileTitle = selectedComponent.find(".tile-title")[0];
            if (tileTitle) {
                const truncatedTitle = rowTilesLength === 3
                    ? this.truncate(11)
                    : rowTilesLength === 2
                        ? this.truncate(14)
                        : this.truncate(25);
                tileTitle.components(truncatedTitle);
                tileTitle.addAttributes({ title: this.input.value });
            }
            // if tile is first and high priority, set text to upper case
            if (isFirstTile)
                this.input.value = this.input.value.toUpperCase();
            const pageData = this.getPageData();
            if (pageData.PageType === "Information") {
                const infoSectionController = new InfoSectionController();
                infoSectionController.updateInfoTileAttributes(selectedComponent.parent().parent().getId(), selectedComponent.parent().getId(), "Text", this.input.value.trim());
            }
            else {
                globalThis.tileMapper.updateTile(selectedComponent.parent().getId(), "Text", this.input.value.trim());
            }
            const parentComponent = tileTitle.parent();
            if (parentComponent) {
                if (parentComponent.getStyle()["display"] === "none") {
                    parentComponent.addStyle({ display: "block" });
                }
            }
        });
    }
    truncate(length) {
        if (this.input.value.length > length) {
            return this.input.value.substring(0, length) + "..";
        }
        return this.input.value;
    }
    getPageData() {
        return globalThis.pageData;
    }
    render(container) {
        container.appendChild(this.input);
    }
}
//# sourceMappingURL=TitleInputSection.js.map