import { DefaultAttributes, rowDefaultAttributes, tileDefaultAttributes } from "../../utils/default-attributes";

export class JSONToGrapesJS {
  private data: any;

  constructor(json: any) {
    this.data = json;
  }

  private generateTile(tile: any, isFirstSingleTile: boolean): string {
    return `
      <div ${tileDefaultAttributes} class="template-wrapper">
        <div ${DefaultAttributes} class="template-block${isFirstSingleTile ? ' high-priority-template' : ''}" style="background-color: ${
          tile.TileBGColor
        }; color: ${tile.TileColor}; text-align: ${tile.TileAlignment};">
            <div ${DefaultAttributes} id="igtdq" data-gjs-type="default" class="tile-title-section">
              <span ${DefaultAttributes} id="is1dw" data-gjs-type="text" class="tile-close-icon top-right selected-tile-title">×</span>
              <span ${DefaultAttributes} id="ic26t" data-gjs-type="text" is-hidden="false" title="Calendar" class="tile-title">${tile.TileText}</span>
            </div>
        </div>
        <button ${DefaultAttributes} id="i9sxl" data-gjs-type="default" title="Delete template" class="action-button delete-button">&minus;</button>
        <button ${DefaultAttributes} id="ifvvi" data-gjs-type="default" title="Add template right" class="action-button add-button-right">+</button>
        <button ${DefaultAttributes} id="i4ubt" data-gjs-type="default" title="Delete template" class="action-button add-button-bottom">&plus;</button>
      </div>
    `;
  }

  private generateRow(row: any): string {
    const isFirstSingleTile = row.Col.length === 1;
    const tilesHTML = row.Col.map((col: any, index: number) => this.generateTile(col.Tile, isFirstSingleTile && index === 0)).join('');
    return `<div ${rowDefaultAttributes} class="container-row">${tilesHTML}</div>`;
  }

  public generateHTML(): string {
    return `
      <div ${DefaultAttributes} id="frame-container" data-gjs-type="template-wrapper" class="frame-container">
        <div ${DefaultAttributes} id="i93m" data-gjs-type="template-wrapper" class="container-column">
          ${this.data.Row.map((row: any) => this.generateRow(row)).join('')}
        </div>
      </div>
    `;
  }
}