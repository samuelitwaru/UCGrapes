import {
  DefaultAttributes,
  firstTileWrapperDefaultAttributes,
  rowDefaultAttributes,
  tileDefaultAttributes,
  tileWrapperDefaultAttributes,
} from "../../utils/default-attributes";
import {
  ThemeManager
} from "../themes/ThemeManager";

export class JSONToGrapesJSMenu {
  private data: any;
  themeManager: ThemeManager;


  constructor(json: any) {
      this.data = json;
      this.themeManager = new ThemeManager();
  }

  private generateTile(
      tile: any,
      isFirstSingleTile: boolean,
      isThreeTiles: boolean
  ): string {
      return `
      <div ${
        isFirstSingleTile
          ? firstTileWrapperDefaultAttributes
          : tileWrapperDefaultAttributes
      } class="template-wrapper" id="${tile.Id}">
        <div ${tileDefaultAttributes} class="template-block${
              isFirstSingleTile ? " first-tile high-priority-template" : ""
          }" 
          style="color: ${
        tile.Color
      }; text-align: ${tile.Align};
        ${
          isThreeTiles ? "align-items: center; justify-content: center;" 
          : `align-items: ${tile.Align === "left" ? "start" : tile.Align}; justify-content: ${tile.Align === "left" ? "start" : tile.Align};`
        }; 
        ${
          tile.BGImageUrl
            ? `background-color: rgba(0,0,0, ${tile.Opacity / 100});
               background-image: url('${tile.BGImageUrl}');
               background-size: cover;
               background-position: center;
               background-blend-mode: overlay;`
            : `
            background-color: ${this.themeManager.getThemeColor(tile.BGColor)}; 
            `
        }">
        
        <div ${DefaultAttributes} class="tile-icon-section" ${tile.Icon ? 'style="display: block;"' : ''}>
          <span ${DefaultAttributes} class="tile-close-icon top-right">×</span>
          <span ${DefaultAttributes} title="${tile.Icon}" class="tile-icon">
            ${this.getTileIcon(tile)}
          </span>
        </div>
                
                <div ${DefaultAttributes} class="tile-title-section" style="${
                    isThreeTiles ? "text-align: center;" : "text-align: left"
                  }">
                  <span ${DefaultAttributes} class="tile-close-title top-right">×</span>
                  <span ${DefaultAttributes} class="tile-title" title="${
            tile.Text
          }">${this.truncateText(tile.Text, isThreeTiles)}</span>
        </div>
      </div>
      ${
        isFirstSingleTile
          ? ""
          : `
        <button ${DefaultAttributes} title="Delete tile" class="action-button delete-button">−</button>`
      }
      <button ${DefaultAttributes} title="Add tile right" class="action-button add-button-right">+</button>
      <button ${DefaultAttributes} title="Add tile below" class="action-button add-button-bottom">+</button>
    </div>
  `;
  }

  private truncateText(tileTitle: string, isThreeTiles: boolean) {
      const screenWidth: number = window.innerWidth;
      const textLength = length === 3 ? 11 : (length === 2 ? 15 : 20);
      if (tileTitle.length > (screenWidth <= 280 ? 20 : textLength + 4)) {
          return tileTitle.substring(0, screenWidth <= 280 ? textLength : textLength + 4)
              .trim() + '..';
      }

      if (isThreeTiles) {
          return this.wrapTileTitle(tileTitle);
      } else {
          return tileTitle;
      }
  }

  private wrapTileTitle(title: any) {
      const words = title.split(" ");
      if (words.length > 1) {
          return words[0] + "<br>" + words[1];
      }
      return title.replace("<br>", "");
  }

  private getTileIcon(tile: any) {
      const iconSVG = this.themeManager.getThemeIcon(tile.Icon);
      let cleanedSVG;
      if (iconSVG) {
        // replace path fill with tile.icon
        cleanedSVG = iconSVG.replace('fill="#7c8791"', `fill="${tile.Color}"`);
      }
      return cleanedSVG;
  }

  private generateRow(row: any, rowIndex: number): string {
      const isFirstSingleTile = rowIndex === 0 && row.Tiles.length === 1;
      const isThreeTiles = row.Tiles.length === 3;
      const tilesHTML = row.Tiles.map((tile: any, index: number) =>
          this.generateTile(tile, isFirstSingleTile && index === 0, isThreeTiles)
      ).join("");
      return `<div id="${row.Id}" ${rowDefaultAttributes} class="container-row">${tilesHTML}</div>`;
  }

  public generateHTML(): any {
      const htmlData = `
    <div ${DefaultAttributes} id="frame-container" data-gjs-type="template-wrapper" class="frame-container">
      <div ${DefaultAttributes} class="container-column">
        ${this.data.PageMenuStructure.Rows.map((row: any, rowIndex: number) =>
          this.generateRow(row, rowIndex)
        ).join("")}
      </div>
    </div>
  `;
      return this.filterHTML(htmlData);
  }

  filterHTML(htmlData: string) {
      const div = document.createElement("div");
      div.innerHTML = htmlData;

      const rows = div.querySelectorAll(".container-row");

      rows.forEach((row) => {
          const tiles = row.querySelectorAll(".template-block");
          if (tiles.length === 3) {
              const deleteButtons = row.querySelectorAll(".add-button-right");
              deleteButtons.forEach((button: any) => {
                  button.style.display = "none";
              });
          }
      });

      const modifiedHTML = div.innerHTML;
      return modifiedHTML;
  }
}