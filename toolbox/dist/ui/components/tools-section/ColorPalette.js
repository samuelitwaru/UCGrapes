import { InfoSectionController } from "../../../controls/InfoSectionController";
export class ColorPalette {
    constructor(colors, containerId) {
        this.containerId = containerId;
        this.paletteContainer = this.createPaletteContainer(containerId);
        this.populateColorPalette(colors);
    }
    render(container) {
        container.appendChild(this.paletteContainer);
    }
    refresh(container) {
        const existingComponent = document.getElementById(this.containerId);
        if (existingComponent) {
            existingComponent.replaceWith(this.paletteContainer);
        }
        else {
            container.appendChild(this.paletteContainer);
        }
    }
    createPaletteContainer(containerId) {
        const container = document.createElement("div");
        container.className = "color-palette";
        container.id = containerId;
        return container;
    }
    populateColorPalette(colors) {
        Object.entries(colors).forEach(([colorName, colorValue]) => {
            const colorItem = this.createColorItem(colorName, colorValue);
            this.paletteContainer.appendChild(colorItem);
        });
    }
    createColorItem(colorName, colorValue) {
        const colorItem = document.createElement("div");
        colorItem.className = "color-item";
        const input = this.createRadioInput(colorName, colorValue);
        const label = this.createColorLabel(colorName, colorValue);
        colorItem.appendChild(input);
        colorItem.appendChild(label);
        colorItem.addEventListener("click", (e) => this.handleColorSelection(e, colorValue, colorName, input));
        return colorItem;
    }
    createRadioInput(colorName, colorValue) {
        const input = document.createElement("input");
        input.type = "radio";
        input.id = `color-${colorName}`;
        input.name = "theme-color";
        input.value = colorValue;
        return input;
    }
    createColorLabel(colorName, colorValue) {
        const label = document.createElement("label");
        label.htmlFor = `color-${colorName}`;
        label.className = "color-box";
        label.setAttribute("data-tile-bgcolor", colorValue);
        label.style.backgroundColor = colorValue;
        return label;
    }
    handleColorSelection(e, colorValue, colorName, input) {
        e.preventDefault();
        const selectedComponent = this.getSelectedComponent();
        if (!selectedComponent)
            return;
        const tileWrapper = selectedComponent.parent();
        const rowComponent = tileWrapper.parent();
        const pageData = this.getPageData();
        const tileAttributes = this.getTileAttributes(pageData, rowComponent, tileWrapper, selectedComponent);
        if (tileAttributes === null || tileAttributes === void 0 ? void 0 : tileAttributes.BGImageUrl)
            return;
        this.updateComponentStyle(selectedComponent, colorValue);
        this.updateTileData(pageData, rowComponent, tileWrapper, selectedComponent, colorName);
        // Toggle radio button state
        input.checked = selectedComponent.getStyle()["background-color"] !== colorValue;
    }
    getSelectedComponent() {
        return globalThis.selectedComponent;
    }
    getPageData() {
        return globalThis.pageData;
    }
    getTileAttributes(pageData, rowComponent, tileWrapper, selectedComponent) {
        var _a;
        if (pageData.PageType === "Information") {
            const tileInfoSectionAttributes = globalThis.infoContentMapper.getInfoContent(selectedComponent.parent().parent().getId());
            return (_a = tileInfoSectionAttributes === null || tileInfoSectionAttributes === void 0 ? void 0 : tileInfoSectionAttributes.Tiles) === null || _a === void 0 ? void 0 : _a.find((tile) => tile.Id === selectedComponent.parent().getId());
        }
        else {
            return globalThis.tileMapper.getTile(rowComponent.getId(), tileWrapper.getId());
        }
    }
    updateComponentStyle(component, colorValue) {
        const currentColor = component.getStyle()["background-color"];
        const newColor = currentColor === colorValue ? "transparent" : colorValue;
        component.addStyle({
            "background-color": newColor
        });
        component.getEl().style.backgroundColor = newColor;
    }
    updateTileData(pageData, rowComponent, tileWrapper, selectedComponent, colorName) {
        if (pageData.PageType === "Information") {
            const infoSectionController = new InfoSectionController();
            infoSectionController.updateInfoTileAttributes(rowComponent.getId(), tileWrapper.getId(), "BGColor", colorName);
        }
        else {
            globalThis.tileMapper.updateTile(selectedComponent.parent().getId(), "BGColor", colorName);
        }
    }
}
//# sourceMappingURL=ColorPalette.js.map