export class JSONToGrapesJS {
  private data: any;
  tileDefaultAttributes: string = `
      data-gjs-draggable="true"
      data-gjs-selectable="true"
      data-gjs-editable="false"
      data-gjs-highlightable="false"
      data-gjs-droppable="false"
      data-gjs-resizable="false"
      data-gjs-hoverable="false"
  `;

  DefaultAttributes: string = `
      data-gjs-draggable="false"
      data-gjs-selectable="false"
      data-gjs-editable="false"
      data-gjs-highlightable="false"
      data-gjs-droppable="false"
      data-gjs-resizable="false"
      data-gjs-hoverable="false"
  `;
  constructor(json: any) {
    this.data = json;
  }

  private generateTile(tile: any, isFirstSingleTile: boolean): string {
    return `
      <div class="template-wrapper">
        <div ${this.tileDefaultAttributes} class="template-block${isFirstSingleTile ? ' high-priority-template' : ''}" style="background-color: ${
          tile.TileBGColor
        }; color: ${tile.TileColor}; text-align: ${tile.TileAlignment};">
            <div ${this.DefaultAttributes} id="igtdq" data-gjs-type="default" class="tile-title-section">
              <span ${this.DefaultAttributes} id="is1dw" data-gjs-type="text" class="tile-close-icon top-right selected-tile-title">×</span>
              <span ${this.DefaultAttributes} id="ic26t" data-gjs-type="text" is-hidden="false" title="Calendar" class="tile-title">${tile.TileText}</span>
            </div>
        </div>
        <button ${this.DefaultAttributes} id="i9sxl" data-gjs-type="default" title="Delete template" class="action-button delete-button">&minus;</button>
        <button ${this.DefaultAttributes} id="ifvvi" data-gjs-type="default" title="Add template right" class="action-button add-button-right">+</button>
        <button ${this.DefaultAttributes} id="i4ubt" data-gjs-type="default" title="Delete template" class="action-button add-button-bottom">&plus;</button>
      </div>
    `;
  }

  private generateRow(row: any): string {
    const isFirstSingleTile = row.Col.length === 1;
    const tilesHTML = row.Col.map((col: any, index: number) => this.generateTile(col.Tile, isFirstSingleTile && index === 0)).join('');
    return `<div class="container-row">${tilesHTML}</div>`;
  }

  public generateHTML(): string {
    return `
      <div ${this.DefaultAttributes} id="frame-container" data-gjs-type="template-wrapper" class="frame-container">
        <div ${this.DefaultAttributes} id="i93m" data-gjs-type="template-wrapper" class="container-column">
          ${this.data.Row.map((row: any) => this.generateRow(row)).join('')}
        </div>
      </div>
    `;
  }
}