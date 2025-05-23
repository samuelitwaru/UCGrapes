import { InfoSectionController } from "../InfoSectionController";
import { TileMapper } from "./TileMapper";
export class TileUpdate {
    constructor(pageId) {
        this.pageId = pageId || null;
    }
    updateTile(rowComponent, isDragging = false) {
        this.rowComponent = rowComponent;
        const tiles = rowComponent.components();
        const length = tiles.length;
        tiles.forEach((tile) => {
            const tileAttributes = this.getTileAttributes(rowComponent, tile);
            const rightButton = tile.find(".add-button-right")[0];
            if (rightButton) {
                rightButton.addStyle({
                    "display": length >= 3 ? "none" : "flex"
                });
            }
            const alignValue = length === 3 ? "center" : tileAttributes.Align;
            const cssAlignValue = alignValue === "left" ? "start" : alignValue;
            const tileAlignment = {
                "justify-content": cssAlignValue,
                "align-items": cssAlignValue
            };
            const titleAlignment = {
                "text-align": alignValue
            };
            this.updateTileHeight(tile, length);
            this.updateAlignment(tile, tileAlignment, titleAlignment);
            this.updateTileTitleLength(tile, length);
            if (!isDragging) {
                this.updateTileAttributes(tile.getId(), 'Align', alignValue);
            }
        });
        this.removeEmptyRows();
    }
    getTileAttributes(rowComponent, tileWrapper) {
        var _a;
        const pageData = globalThis.pageData;
        let tileAttributes;
        if (pageData.PageType === "Information") {
            const tileInfoSectionAttributes = globalThis.infoContentMapper.getInfoContent(rowComponent.getId());
            tileAttributes = (_a = tileInfoSectionAttributes === null || tileInfoSectionAttributes === void 0 ? void 0 : tileInfoSectionAttributes.Tiles) === null || _a === void 0 ? void 0 : _a.find((tile) => tile.Id === tileWrapper.getId());
        }
        else {
            tileAttributes = globalThis.tileMapper.getTile(rowComponent.getId(), tileWrapper.getId());
        }
        return tileAttributes;
    }
    updateTileHeight(tile, length) {
        const templateBlock = tile.find(".template-block")[0];
        if (length === 1) {
            if (templateBlock.getClasses().includes("first-tile")) {
                templateBlock.addClass("high-priority-template");
            }
        }
        else {
            templateBlock.removeClass("high-priority-template");
        }
    }
    updateAlignment(tile, tileAlignment, titleAlignment) {
        const templateBlock = tile.find(".template-block")[0];
        const tileTitle = tile.find(".tile-title-section")[0];
        templateBlock.addStyle(tileAlignment);
        tileTitle.addStyle(titleAlignment);
    }
    updateTileTitleLength(tile, length) {
        var _a;
        const tileTitle = tile.find(".tile-title")[0];
        if (tileTitle) {
            const textLength = length === 3 ? 11 : (length === 2 ? 15 : 20);
            const title = this.truncateText(textLength, ((_a = tileTitle.getAttributes()) === null || _a === void 0 ? void 0 : _a["title"]) || tileTitle.getEl().innerText);
            if (length === 3) {
                tileTitle.components(this.wrapTileTitle(title));
            }
            else {
                tileTitle.components(title);
            }
        }
    }
    truncateText(titleLength, tileTitle) {
        const screenWidth = window.innerWidth;
        if (tileTitle.length > (screenWidth <= 280 ? titleLength : titleLength + 4)) {
            return tileTitle.substring(0, screenWidth <= 280 ? titleLength : titleLength + 4)
                .trim() + '..';
        }
        return tileTitle;
    }
    wrapTileTitle(title) {
        const words = title.split(" ");
        if (words.length > 1) {
            return words[0] + "<br>" + words[1];
        }
        return title.replace("<br>", "");
        ;
    }
    updateTileAttributes(tileId, attribute, value) {
        const tileAttributes = new TileMapper(this.pageId);
        let align = value;
        if (value === "start") {
            align = "left";
        }
        const pageData = globalThis.pageData;
        if (pageData.PageType === "Information") {
            const infoSectionController = new InfoSectionController();
            infoSectionController.updateInfoTileAttributes(this.rowComponent.getId(), tileId, "Align", align);
        }
        else {
            tileAttributes.updateTile(tileId, attribute, align);
        }
    }
    removeEmptyRows() {
        const container = this.rowComponent.parent();
        const rows = container.components();
        rows.forEach((row) => {
            var _a;
            if (((_a = row === null || row === void 0 ? void 0 : row.components()) === null || _a === void 0 ? void 0 : _a.length) === 0) {
                row === null || row === void 0 ? void 0 : row.remove();
            }
        });
    }
}
//# sourceMappingURL=TileUpdate.js.map