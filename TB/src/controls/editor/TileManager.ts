import { DefaultAttributes, rowDefaultAttributes, tileDefaultAttributes } from "../../utils/default-attributes";

export class TileManager {
  private event: MouseEvent;
  editor: any;
  
  constructor(e: MouseEvent, editor: any) {
    this.event = e;
    this.editor = editor;
    this.init();
  }

  private init() {
    this.addTileBottom();
    this.addTileRight();
    this.deleteTile();
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
        this.updateTile(containerRowComponent);
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
        
        this.updateTile(parentComponent);
      }
    }
  }

  updateTile(rowComponent: any) {
    const tiles = rowComponent.components();
    const length = tiles.length;
    tiles.forEach((tile: any) => {
        console.log(tile.index(), tile.getEl())
        const rightButton = tile.find(".add-button-right")[0];
        if (rightButton) {
            rightButton.addStyle({
                "display": length >= 3 ? "none" : "flex"
            });
        }
    });
  }

  updateAlignment(tiles: any) {
      
  }

  private getTileRow() {
    const tile = this.getTile();
    return `<div class="container-row" ${rowDefaultAttributes}>${tile}</div>`;
  }

  private getTile() {
    return `
      <div ${DefaultAttributes} class="template-wrapper">
        <div ${tileDefaultAttributes} class="template-block" style="background-color: transparent; color: #fff text-align: left">
            <div ${DefaultAttributes} id="igtdq" data-gjs-type="default" class="tile-title-section">
              <span ${DefaultAttributes} id="is1dw" data-gjs-type="text" class="tile-close-icon top-right selected-tile-title">×</span>
              <span ${DefaultAttributes} id="ic26t" data-gjs-type="text" is-hidden="false" title="Calendar" class="tile-title">Title</span>
            </div>
        </div>
        <button ${DefaultAttributes} id="i9sxl" data-gjs-type="default" title="Delete template" class="action-button delete-button">&minus;</button>
        <button ${DefaultAttributes} id="ifvvi" data-gjs-type="default" title="Add template right" class="action-button add-button-right">+</button>
        <button ${DefaultAttributes} id="i4ubt" data-gjs-type="default" title="Delete template" class="action-button add-button-bottom">&plus;</button>
      </div>
    `;
  }
}
