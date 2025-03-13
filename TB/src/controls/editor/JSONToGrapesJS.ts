import { DefaultAttributes, rowDefaultAttributes, tileDefaultAttributes, tileWrapperDefaultAttributes } from "../../utils/default-attributes";

export class JSONToGrapesJS {
  private data: any;

  constructor(json: any) {
    this.data = json;
  }

  private generateTile(tile: any, isFirstSingleTile: boolean, isThreeTiles: boolean): string {
    return `
      <div${tileWrapperDefaultAttributes} class="template-wrapper" id="${tile.Id}">
        <div ${tileDefaultAttributes} class="template-block${isFirstSingleTile ? ' high-priority-template' : ''}" 
          style="background-color: ${tile.BGColor}; color: ${tile.Color}; text-align: ${tile.Align};
          ${isThreeTiles ? 'align-items: center; justify-content: center;' : ''}; 
          ${tile.BGImageUrl ? `background-image: url('${tile.BGImageUrl}');
          background-size: cover;
          background-position: center;
          background-blend-mode: overlay;` : ``}">
          
          <div ${DefaultAttributes} class="tile-icon-section">
            <span ${DefaultAttributes} class="tile-close-icon top-right">×</span>
            <span ${DefaultAttributes} title="${tile.Icon}" class="tile-icon">${tile.Icon}</span>
          </div>
          
          <div ${DefaultAttributes} class="tile-title-section" style="${isThreeTiles ? 'text-align: center;' : 'text-align: left'}">
            <span ${DefaultAttributes} class="tile-close-icon top-right">×</span>
            <span ${DefaultAttributes} class="tile-title">${tile.Text}</span>
          </div>
        </div>
        ${isFirstSingleTile ? '' :`
          <button ${DefaultAttributes} title="Delete tile" class="action-button delete-button">&minus;</button>`
         }
        <button ${DefaultAttributes} title="Add tile right" class="action-button add-button-right">+</button>
        <button ${DefaultAttributes} title="Add tile below" class="action-button add-button-bottom">&plus;</button>
      </div>
    `;
  }

  private generateRow(row: any, rowIndex: number): string {
    const isFirstSingleTile = rowIndex === 0 && row.Tiles.length === 1;
    const isThreeTiles = row.Tiles.length === 3;
    const tilesHTML = row.Tiles.map((tile: any, index: number) => 
      this.generateTile(tile, isFirstSingleTile && index === 0, isThreeTiles)).join('');
    return `<div id="${row.Id}" ${rowDefaultAttributes} class="container-row">${tilesHTML}</div>`;
  }

  public generateHTML(): any {
    const htmlData = `
      <div ${DefaultAttributes} id="frame-container" data-gjs-type="template-wrapper" class="frame-container">
        <div ${DefaultAttributes} class="container-column">
          ${this.data.PageStructure.Rows.map((row: any, rowIndex: number) => this.generateRow(row, rowIndex)).join('')}
        </div>
      </div>
    `
    return this.filterHTML(htmlData);
  }

  filterHTML(htmlData: string) {
    const div = document.createElement('div');
    div.innerHTML = htmlData;

    const rows = div.querySelectorAll('.container-row');

    rows.forEach(row => {
        const tiles = row.querySelectorAll('.template-block');
        if (tiles.length === 3) {
          const deleteButtons = row.querySelectorAll('.add-button-right');
          deleteButtons.forEach((button: any) => {
            button.style.display = 'none';
          });
        }
    });

    const modifiedHTML = div.innerHTML;
    return modifiedHTML;
  }
}