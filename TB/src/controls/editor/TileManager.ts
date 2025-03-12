import { DefaultAttributes, rowDefaultAttributes, tileDefaultAttributes } from "../../utils/default-attributes";
import { randomIdGenerator } from "../../utils/helpers";
import { TileMapper } from "./TileMapper";
import { TileUpdate } from "./TileUpdate";

export class TileManager {
  private event: MouseEvent;
  editor: any;
  pageId: any;
  tileUpdate: TileUpdate;
  tileMapper: TileMapper;
  
  constructor(e: MouseEvent, editor: any, pageId: any) {
    this.event = e;
    this.editor = editor;
    this.pageId = pageId;
    this.tileUpdate = new TileUpdate();
    this.tileMapper = new TileMapper(this.pageId);
    this.init();
  }

  private init() {
    this.addTileBottom();
    this.addTileRight();
    this.deleteTile();
    this.removeTileIcon();
    this.removeTileTile();
  }

  addTileBottom() {
    const addBottomButton = (this.event.target as Element).closest(
      ".action-button.add-button-bottom"
    );
    if (addBottomButton) {
      const templateWrapper =  addBottomButton.closest(".template-wrapper");
      if (!templateWrapper) return;

      let currentRow = templateWrapper.parentElement;
      let currentColumn = currentRow?.parentElement;

      if (!currentRow || !currentColumn) return;

      const index = Array.from(currentColumn.children).indexOf(currentRow);

      const columnComponent = this.editor.Components.getWrapper().find('#' + currentColumn.id)[0];
      if (!columnComponent) return;

      const newRowComponent = this.editor.Components.addComponent(this.getTileRow());
      columnComponent.append(newRowComponent, { at: index + 1 });

      (globalThis as any).tileManager.addFreshRow(newRowComponent.getId() as string);
    }
  }

  addTileRight() {
    const addRightutton = (this.event.target as Element).closest(
        ".action-button.add-button-right"
      );    
      if (addRightutton) {
        const currentTile = addRightutton.closest(".template-wrapper");
        const currentTileComponent = this.editor.Components.getWrapper().find('#' + currentTile?.id)[0];
        if (!currentTileComponent) return;
        
        const containerRowComponent = currentTileComponent.parent();
        const tiles = containerRowComponent.components().filter((comp: any) => {
            const type = comp.get("type");
            return type === "tile-wrapper";
          });

        if (tiles.length >= 3) return;

        const newTileComponent = this.editor.Components.addComponent(this.getTile());

        const index = currentTileComponent.index();
        containerRowComponent.append(newTileComponent, { at: index + 1 });
        this.tileUpdate.updateTile(containerRowComponent);

        (globalThis as any).tileManager.addTile(currentTile?.parentElement?.id as string, newTileComponent.getId() as string);
      }
  }

  deleteTile() {
    const deleteButton = (this.event.target as Element).closest(
      ".action-button.delete-button"
    );
    if (deleteButton) {
      const templateWrapper = deleteButton.closest(".template-wrapper");
      if (templateWrapper) {
        const tileComponent = this.editor.Components.getWrapper().find('#' + templateWrapper?.id)[0];
        const parentComponent = tileComponent.parent();
        tileComponent.remove();
        
        this.tileUpdate.updateTile(parentComponent);
        (globalThis as any).tileManager.removeTile(tileComponent.getId() as string, parentComponent.getId() as string);
      }
    }
  }  

  private removeTileIcon() {
    const tileIcon = (this.event.target as Element).closest(".tile-close-icon");
    if (tileIcon) {
        const tileIconParent = tileIcon.parentElement;
        const tileIconParentComponent = this.editor.Components.getWrapper().find('#' + tileIconParent?.id)[0];
        if (this.checkTileHasIconOrTitle(tileIconParentComponent)) {
            tileIconParentComponent.addStyle({"display": "none"})
        } else {
            console.warn("Tile has no icon or title")
        }
    }
  }
  
  private removeTileTile() {
    const tileTitle = (this.event.target as Element).closest(".tile-close-title");
    if (tileTitle) {
        const tileTitleParent = tileTitle.parentElement;
        const tileTitleParentComponent = this.editor.Components.getWrapper().find('#' + tileTitleParent?.id)[0];
        if (this.checkTileHasIconOrTitle(tileTitleParentComponent)) {
            tileTitleParentComponent.addStyle({"display": "none"})
        } else {
            console.warn("Tile has no icon or title")
        }
    }
  }

  checkTileHasIconOrTitle(component: any): boolean {
    const parentComponent = component.parent();
    if (!parentComponent) return false;

    const sectionComponents = parentComponent.components();
    let hasIcon: boolean;
    let hasTitle: boolean;

    const hasTitleVisible = sectionComponents.some((comp: any) => {
      const displayStyle = comp.getStyle()?.["display"];
      return comp.getClasses().includes('tile-title-section') && displayStyle !== "none" && displayStyle !== undefined;
    });

    const hasIconVisible = sectionComponents.some((comp: any) => {
      const displayStyle = comp.getStyle()?.["display"];
      return comp.getClasses().includes('tile-icon-section') && displayStyle !== "none" && displayStyle !== undefined;
    });

   return hasTitleVisible && hasIconVisible;
  }


  private getTileRow() {
    const tile = this.getTile();
    return `<div class="container-row" ${rowDefaultAttributes} id="${randomIdGenerator(8)}">${tile}</div>`;
  }

  private getTile() {
    return `
      <div ${DefaultAttributes} class="template-wrapper" id="${randomIdGenerator(8)}">
        <div ${tileDefaultAttributes} class="template-block" style="background-color: transparent; color: #fff justify-content: left">
            <div ${DefaultAttributes} id="igtdq" data-gjs-type="default" class="tile-icon-section">
              <span ${DefaultAttributes} id="is1dw" data-gjs-type="text" class="tile-close-icon top-right selected-tile-title">×</span>
              <span ${DefaultAttributes} id="ic26t" data-gjs-type="text" class="tile-icon">Title</span>
            </div>
            <div ${DefaultAttributes} id="igtdq" data-gjs-type="default" class="tile-title-section">
              <span ${DefaultAttributes} id="is1dw" data-gjs-type="text" class="tile-close-icon top-right selected-tile-title">×</span>
              <span ${DefaultAttributes} style="display: block" id="ic26t" data-gjs-type="text" is-hidden="false" title="Title" class="tile-title">Title</span>
            </div>
        </div>
        <button ${DefaultAttributes} id="i9sxl" data-gjs-type="default" title="Delete template" class="action-button delete-button">&minus;</button>
        <button ${DefaultAttributes} id="ifvvi" data-gjs-type="default" title="Add template right" class="action-button add-button-right">+</button>
        <button ${DefaultAttributes} id="i4ubt" data-gjs-type="default" title="Delete template" class="action-button add-button-bottom">&plus;</button>
      </div>
    `;
  }
}
