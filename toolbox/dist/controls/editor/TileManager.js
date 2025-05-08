import { DefaultAttributes, rowDefaultAttributes, tileDefaultAttributes, tileWrapperDefaultAttributes, } from "../../utils/default-attributes";
import { randomIdGenerator } from "../../utils/helpers";
import { InfoSectionController } from "../InfoSectionController";
import { CtaManager } from "../themes/CtaManager";
import { EditorEvents } from "./EditorEvents";
import { InfoContentMapper } from "./InfoContentMapper";
import { TileMapper } from "./TileMapper";
import { TileUpdate } from "./TileUpdate";
export class TileManager {
    constructor(e, editor, pageId, frameId, pageData) {
        this.event = e;
        this.editor = editor;
        this.pageId = pageId;
        this.frameId = frameId;
        this.pageData = pageData;
        this.tileUpdate = new TileUpdate(pageId);
        globalThis.tileMapper = new TileMapper(this.pageId);
        this.page = globalThis.pageData;
        this.init();
    }
    init() {
        this.addTileBottom();
        this.addTileRight();
        this.deleteTile();
        this.removeTileIcon();
        this.removeTileTile();
        this.removeCTa();
    }
    addTileBottom() {
        var _a, _b;
        const addBottomButton = this.event.target.closest(".action-button.add-button-bottom");
        if (addBottomButton) {
            const templateWrapper = addBottomButton.closest(".template-wrapper");
            if (!templateWrapper)
                return;
            let currentRow = templateWrapper.parentElement;
            let currentColumn = currentRow === null || currentRow === void 0 ? void 0 : currentRow.parentElement;
            if (!currentRow || !currentColumn)
                return;
            const index = Array.from(currentColumn.children).indexOf(currentRow);
            const columnComponent = this.editor.Components.getWrapper().find("#" + currentColumn.id)[0];
            if (!columnComponent)
                return;
            const newRowComponent = this.editor.Components.addComponent(this.getTileRow());
            columnComponent.append(newRowComponent, { at: index + 1 });
            const tileId = (_a = newRowComponent.find(".template-wrapper")[0]) === null || _a === void 0 ? void 0 : _a.getId();
            if (((_b = this.page) === null || _b === void 0 ? void 0 : _b.PageType) === "Information") {
            }
            else {
                globalThis.tileMapper.addFreshRow(newRowComponent.getId(), tileId);
            }
        }
    }
    addTileRight() {
        var _a, _b;
        const addRightutton = this.event.target.closest(".action-button.add-button-right");
        if (addRightutton) {
            const currentTile = addRightutton.closest(".template-wrapper");
            const currentTileComponent = this.editor.Components.getWrapper().find("#" + (currentTile === null || currentTile === void 0 ? void 0 : currentTile.id))[0];
            if (!currentTileComponent)
                return;
            const containerRowComponent = currentTileComponent.parent();
            const tiles = containerRowComponent.components().filter((comp) => {
                const type = comp.get("type");
                return type === "tile-wrapper";
            });
            if (tiles.length >= 3)
                return;
            const newTileComponent = this.editor.Components.addComponent(this.getTile());
            const index = currentTileComponent.index();
            containerRowComponent.append(newTileComponent, { at: index + 1 });
            if (((_a = this.page) === null || _a === void 0 ? void 0 : _a.PageType) === "Information") {
                this.updateInfoTileRow(containerRowComponent.getId(), "add", newTileComponent.getId());
            }
            else {
                globalThis.tileMapper.addTile((_b = currentTile === null || currentTile === void 0 ? void 0 : currentTile.parentElement) === null || _b === void 0 ? void 0 : _b.id, newTileComponent.getId());
            }
            this.tileUpdate.updateTile(containerRowComponent);
        }
    }
    deleteTile() {
        var _a;
        const deleteButton = this.event.target.closest(".action-button.delete-button");
        if (deleteButton) {
            const templateWrapper = deleteButton.closest(".template-wrapper");
            if (templateWrapper) {
                const tileComponent = this.editor.Components.getWrapper().find("#" + (templateWrapper === null || templateWrapper === void 0 ? void 0 : templateWrapper.id))[0];
                const parentComponent = tileComponent.parent();
                tileComponent.remove();
                this.tileUpdate.updateTile(parentComponent);
                if (((_a = this.page) === null || _a === void 0 ? void 0 : _a.PageType) === "Information") {
                    this.updateInfoTileRow(parentComponent.getId(), "delete", tileComponent.getId());
                }
                else {
                    globalThis.tileMapper.removeTile(tileComponent.getId(), parentComponent.getId());
                }
                this.removeEditor(tileComponent.getId());
            }
        }
    }
    updateInfoTileRow(tileRowId, method = "add", tileId) {
        var _a, _b, _c, _d;
        const infoContentMapper = new InfoContentMapper(this.pageId);
        const tileSection = infoContentMapper.getInfoContent(tileRowId);
        if (tileSection) {
            if (method === "add") {
                (_a = tileSection.Tiles) === null || _a === void 0 ? void 0 : _a.push({
                    Id: tileId,
                    Name: "Title",
                    Text: "Title",
                    Color: "#333333",
                    Align: "left",
                });
            }
            else if (method === "delete") {
                const tile = (_b = tileSection.Tiles) === null || _b === void 0 ? void 0 : _b.find((tile) => tile.Id === tileId);
                if (tile) {
                    const index = (_c = tileSection.Tiles) === null || _c === void 0 ? void 0 : _c.indexOf(tile);
                    if (index !== undefined && index >= 0) {
                        (_d = tileSection.Tiles) === null || _d === void 0 ? void 0 : _d.splice(index, 1);
                    }
                }
            }
            const infoSectionController = new InfoSectionController();
            infoSectionController.updateInfoMapper(tileRowId, tileSection);
        }
    }
    removeTileIcon() {
        var _a;
        const tileIcon = this.event.target.closest(".tile-close-icon");
        if (tileIcon) {
            const templateWrapper = tileIcon.closest(".template-wrapper");
            if (templateWrapper) {
                const tileComponent = this.editor.Components.getWrapper().find("#" + (templateWrapper === null || templateWrapper === void 0 ? void 0 : templateWrapper.id))[0];
                if (this.checkTileHasIconOrTitle(tileComponent)) {
                    if (((_a = this.page) === null || _a === void 0 ? void 0 : _a.PageType) === "Information") {
                        const infoSectionController = new InfoSectionController();
                        infoSectionController.updateInfoTileAttributes(tileComponent.parent().getId(), tileComponent.getId(), "Icon", "");
                    }
                    else {
                        globalThis.tileMapper.updateTile(tileComponent.getId(), "Icon", "");
                    }
                    const iconSection = tileComponent.find(".tile-icon-section")[0];
                    if (iconSection) {
                        iconSection.addStyle({ display: "none" });
                    }
                }
                else {
                    console.warn("Tile has no icon or title");
                }
            }
        }
    }
    removeTileTile() {
        var _a;
        const tileTitle = this.event.target.closest(".tile-close-title");
        if (tileTitle) {
            const templateWrapper = tileTitle.closest(".template-wrapper");
            if (templateWrapper) {
                const tileComponent = this.editor.Components.getWrapper().find("#" + (templateWrapper === null || templateWrapper === void 0 ? void 0 : templateWrapper.id))[0];
                if (this.checkTileHasIconOrTitle(tileComponent)) {
                    if (((_a = this.page) === null || _a === void 0 ? void 0 : _a.PageType) === "Information") {
                        const infoSectionController = new InfoSectionController();
                        infoSectionController.updateInfoTileAttributes(tileComponent.parent().getId(), tileComponent.getId(), "Text", "");
                    }
                    else {
                        globalThis.tileMapper.updateTile(tileComponent.getId(), "Text", "");
                    }
                    const tileSection = tileComponent.find(".tile-title-section")[0];
                    if (tileSection) {
                        tileSection.addStyle({ display: "none" });
                    }
                }
                else {
                    console.warn("Tile has no icon or title");
                }
            }
        }
    }
    checkTileHasIconOrTitle(component) {
        var _a;
        const parentComponent = component.parent();
        if (!parentComponent)
            return false;
        let tileAttributes;
        if (this.pageData.PageType === "Information") {
            const tileInfoSectionAttributes = globalThis.infoContentMapper.getInfoContent(parentComponent.getId());
            tileAttributes = (_a = tileInfoSectionAttributes === null || tileInfoSectionAttributes === void 0 ? void 0 : tileInfoSectionAttributes.Tiles) === null || _a === void 0 ? void 0 : _a.find((tile) => tile.Id === component.getId());
        }
        else {
            tileAttributes = globalThis.tileMapper.getTile(parentComponent.getId(), component.getId());
        }
        console.log("tileAttributes", tileAttributes);
        if (tileAttributes) {
            if (tileAttributes.Icon && tileAttributes.Text) {
                return true;
            }
        }
        return false;
    }
    removeCTa() {
        const ctaBadgeBtn = this.event.target.closest(".cta-badge");
        if (ctaBadgeBtn) {
            new CtaManager().removeCta(ctaBadgeBtn);
        }
    }
    removeEditor(tileId) {
        const framelist = document.querySelectorAll(".mobile-frame");
        framelist.forEach((frame) => {
            var _a, _b, _c;
            const frameHasTile = frame.querySelector(`#${tileId}`);
            if (frameHasTile) {
                console.log(frameHasTile);
            }
            if (frame.id.includes(this.frameId)) {
                let nextElement = frame.nextElementSibling;
                while (nextElement) {
                    const elementToRemove = nextElement;
                    nextElement = nextElement.nextElementSibling;
                    if (elementToRemove) {
                        const thumbsList = document.querySelector(".editor-thumbs-list");
                        const thumbToRemove = thumbsList.querySelector(`div[id="${elementToRemove.id}"]`);
                        if (thumbToRemove) {
                            (_c = (_b = (_a = thumbToRemove.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.parentElement) === null || _c === void 0 ? void 0 : _c.remove();
                        }
                        elementToRemove.remove();
                        new EditorEvents().activateNavigators();
                    }
                }
            }
        });
    }
    getTileRow() {
        const tile = this.getTile();
        return `<div class="container-row" ${rowDefaultAttributes} id="${randomIdGenerator(8)}">${tile}</div>`;
    }
    getTile() {
        var _a;
        return `
      <div ${tileWrapperDefaultAttributes} class="template-wrapper" id="${randomIdGenerator(8)}">
        <div ${tileDefaultAttributes} class="template-block" style="background-color: transparent; color: #333333; justify-content: left">
            <div ${DefaultAttributes} id="igtdq" data-gjs-type="default" class="tile-icon-section">
              <span ${DefaultAttributes} id="is1dw" data-gjs-type="text" class="tile-close-icon top-right selected-tile-title">×</span>
              <span ${DefaultAttributes} id="ic26t" data-gjs-type="text" class="tile-icon">Title</span>
            </div>
            <div ${DefaultAttributes} id="igtdq" data-gjs-type="default" class="tile-title-section">
              <span ${DefaultAttributes} id="is1dw" data-gjs-type="text" class="tile-close-title top-right selected-tile-title">×</span>
              <span ${DefaultAttributes} style="display: block" id="ic26t" data-gjs-type="text" is-hidden="false" title="Title" class="tile-title">Title</span>
            </div>
        </div>
        <button ${DefaultAttributes} id="i9sxl" data-gjs-type="default" title="Delete template" class="action-button delete-button">&minus;</button>
        <button ${DefaultAttributes} id="ifvvi" data-gjs-type="default" title="Add template right" class="action-button add-button-right">
          <svg ${DefaultAttributes} fill="#fff" width="15" height="15" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path ${DefaultAttributes} d="M19,11H13V5a1,1,0,0,0-2,0v6H5a1,1,0,0,0,0,2h6v6a1,1,0,0,0,2,0V13h6a1,1,0,0,0,0-2Z"/>
          </svg>
        </button>
        ${((_a = this.page) === null || _a === void 0 ? void 0 : _a.PageType) === "Information"
            ? ``
            : `
          <button ${DefaultAttributes} id="i4ubt" data-gjs-type="default" title="Add template bottom" class="action-button add-button-bottom">
          <svg ${DefaultAttributes} fill="#fff" width="15" height="15" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path ${DefaultAttributes} d="M19,11H13V5a1,1,0,0,0-2,0v6H5a1,1,0,0,0,0,2h6v6a1,1,0,0,0,2,0V13h6a1,1,0,0,0,0-2Z"/>
          </svg>
          </button>
        `}
        <svg ${DefaultAttributes} class="tile-open-menu" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 27 27">
          <g ${DefaultAttributes} id="Group_2383" data-name="Group 2383" transform="translate(-921 -417.999)">
            <g ${DefaultAttributes} id="Group_2382" data-name="Group 2382" transform="translate(921 418)">
              <circle ${DefaultAttributes} id="Ellipse_534" data-name="Ellipse 534" cx="13.5" cy="13.5" r="13.5" transform="translate(0 -0.001)" fill="#6a747f"/>
            </g>
            <path ${DefaultAttributes} id="Path_2320" data-name="Path 2320" d="M1.7,0a1.7,1.7,0,1,0,1.7,1.7A1.7,1.7,0,0,0,1.7,0ZM7.346,0a1.7,1.7,0,1,0,1.7,1.7A1.7,1.7,0,0,0,7.346,0ZM13,0a1.7,1.7,0,1,0,1.7,1.7A1.7,1.7,0,0,0,13,0Z" transform="translate(927 430)" fill="#fff"/>
          </g>
        </svg>
      </div>
    `;
    }
}
//# sourceMappingURL=TileManager.js.map