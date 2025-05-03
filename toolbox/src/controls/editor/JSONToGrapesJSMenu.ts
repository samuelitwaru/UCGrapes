import {
  DefaultAttributes,
  firstTileWrapperDefaultAttributes,
  infoRowDefaultAttributes,
  rowDefaultAttributes,
  tileDefaultAttributes,
  tileWrapperDefaultAttributes,
  minTileHeight
} from "../../utils/default-attributes";
import {
  ThemeManager
} from "../themes/ThemeManager";
import { i18n } from "../../i18n/i18n";
import { InfoType } from "../../interfaces/InfoType";

export class JSONToGrapesJSMenu {
  private data: any;
  themeManager: ThemeManager;


  constructor(json: any) {
      this.data = json;
      this.themeManager = new ThemeManager();
  }

  private generateTile(
      tile: any,
      row: any,
      isFirstSingleTile: boolean,
      isThreeTiles: boolean,
      isInfoPage?: boolean
  ): string {
      return `
      <div ${
        isFirstSingleTile
          ? firstTileWrapperDefaultAttributes
          : tileWrapperDefaultAttributes
      } class="template-wrapper" id="${tile.Id}" style="height:${tile.Size || minTileHeight}px;">
        <div ${tileDefaultAttributes} class="template-block${
              isFirstSingleTile ? " first-tile high-priority-template" : ""
          }" 
          style="color: ${
        tile.Color ? tile.Color : "#333333"
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
                  }" style="${
                      isThreeTiles ? "text-align: center;" : `text-align: ${tile.Align}`
                  }">${this.truncateText(tile, tile.Text, isThreeTiles)}</span>
        </div>
      </div>
      ${
        isFirstSingleTile
          ? ""
          : `
        <button ${DefaultAttributes} title="${i18n.t("tile.delete_tile")}" class="action-button delete-button">−</button>`
      }
      <button ${DefaultAttributes} title="${i18n.t("tile.add_template_right")}" ${(isThreeTiles && isInfoPage) ? `style="display: none;"` : ""} class="action-button add-button-right">
        <svg ${DefaultAttributes} fill="#fff" width="15" height="15" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path ${DefaultAttributes} d="M19,11H13V5a1,1,0,0,0-2,0v6H5a1,1,0,0,0,0,2h6v6a1,1,0,0,0,2,0V13h6a1,1,0,0,0,0-2Z"/>
        </svg>
      </button>
      ${
        (row.Tiles.length === 1) ? `
          <button ${DefaultAttributes} title="Resize" class="tile-resize-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="18.6" height="18.6" viewBox="0 0 18.6 18.6">
              <g id="Icon_for_size" data-name="Icon for size" transform="translate(-253.747 -1134.203) rotate(45)">
                <path id="Path_1035" data-name="Path 1035" d="M4.588,3.99A.6.6,0,0,0,4,4.67V7.579a.6.6,0,1,0,1.194,0V6.035l7.341,7.341c.15.157.213.054.422,0S15.886,15.3,15.94,15.1h0l-9.9-9.9H7.58A.6.6,0,1,0,7.58,4H4.664A.6.6,0,0,0,4.588,3.99Zm8.36,8.36a.6.6,0,0,0-.416,1.025L15.1,15.94H13.552a.6.6,0,1,0,0,1.194h2.895a.6.6,0,0,0,.688-.688V13.551a.6.6,0,1,0-1.194,0V15.1C13.439,12.608,13.11,12.351,12.948,12.351Z" transform="translate(984.014 612.01)" fill="#5068a8"/>
              </g>
            </svg>
          </button>
        ` : 
        ``
      }
      ${isInfoPage ? "" : `
        <button ${DefaultAttributes} title="${i18n.t("tile.add_template_bottom")}" class="action-button add-button-bottom">
          <svg ${DefaultAttributes} fill="#fff" width="15" height="15" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path ${DefaultAttributes} d="M19,11H13V5a1,1,0,0,0-2,0v6H5a1,1,0,0,0,0,2h6v6a1,1,0,0,0,2,0V13h6a1,1,0,0,0,0-2Z"/>
          </svg>
        </button>`}
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

  private translateTileLabel(tile: any, tileTitle: string) {
    const tileActionType = tile.Action.ObjectType;
    if (tileActionType === "Map") {
      return i18n.t("default.map");
    } else if (tileActionType === "location") {
      return i18n.t("default.location");
    } else if (tileActionType === "calendar") {
      return i18n.t("default.calendar");      
    } else if (tileActionType === "reception") {
      return i18n.t("default.reception");      
    } else if (tileActionType === "mycare") {
      return i18n.t("default.mycare");      
    } else if (tileActionType === "myliving") {
      return i18n.t("default.calendar");      
    } else if (tileActionType === "myliving") {
      return i18n.t("default.calendar");      
    } else if (tileActionType === "myservice") {
      return i18n.t("default.myservice");      
    } else if (tileActionType === "myactivity") {
      return i18n.t("default.myactivity");      
    }
    return tileTitle;
  }

  private truncateText(tile: any, tileTitle: string, isThreeTiles: boolean) {
      // const translatedTitle = this.translateTileLabel(tile, tileTitle);
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
          this.generateTile(tile, row, isFirstSingleTile && index === 0, isThreeTiles)
      ).join("");
      return `<div id="${row.Id}" ${rowDefaultAttributes} class="container-row">${tilesHTML}</div>`;
  }

  public generateInfoRow(infoTilesRow: InfoType): string {
      const isFirstSingleTile = false;
      const isThreeTiles = infoTilesRow?.Tiles?.length === 3;
      const tilesHTML = infoTilesRow?.Tiles?.map((tile: any) =>
          this.generateTile(tile, infoTilesRow, isFirstSingleTile, isThreeTiles, true)
      ).join("");
      return infoTilesRow?.Tiles?.length === 0 ? `` :`<div id="${infoTilesRow.InfoId}" ${infoRowDefaultAttributes} class="container-row">${tilesHTML}</div>`;
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