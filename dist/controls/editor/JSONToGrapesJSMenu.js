import { DefaultAttributes, firstTileWrapperDefaultAttributes, infoRowDefaultAttributes, rowDefaultAttributes, tileDefaultAttributes, tileWrapperDefaultAttributes, } from "../../utils/default-attributes";
import { ThemeManager } from "../themes/ThemeManager";
import { i18n } from "../../i18n/i18n";
export class JSONToGrapesJSMenu {
    constructor(json) {
        this.data = json;
        this.themeManager = new ThemeManager();
    }
    generateTile(tile, isFirstSingleTile, isThreeTiles, isInfoPage) {
        return `
      <div ${isFirstSingleTile
            ? firstTileWrapperDefaultAttributes
            : tileWrapperDefaultAttributes} class="template-wrapper" id="${tile.Id}">
        <div ${tileDefaultAttributes} class="template-block${isFirstSingleTile ? " first-tile high-priority-template" : ""}" 
          style="color: ${tile.Color ? tile.Color : "#333333"}; text-align: ${tile.Align};
        ${isThreeTiles ? "align-items: center; justify-content: center;"
            : `align-items: ${tile.Align === "left" ? "start" : tile.Align}; justify-content: ${tile.Align === "left" ? "start" : tile.Align};`}; 
        ${tile.BGImageUrl
            ? `background-color: rgba(0,0,0, ${tile.Opacity / 100});
               background-image: url('${tile.BGImageUrl}');
               background-size: cover;
               background-position: center;
               background-blend-mode: overlay;`
            : `
            background-color: ${this.themeManager.getThemeColor(tile.BGColor)}; 
            `}">
        
        <div ${DefaultAttributes} class="tile-icon-section" ${tile.Icon ? 'style="display: block;"' : ''}>
          <span ${DefaultAttributes} class="tile-close-icon top-right">×</span>
          <span ${DefaultAttributes} title="${tile.Icon}" class="tile-icon">
            ${this.getTileIcon(tile)}
          </span>
        </div>
                
                <div ${DefaultAttributes} class="tile-title-section" style="${isThreeTiles ? "text-align: center;" : "text-align: left"}">
                  <span ${DefaultAttributes} class="tile-close-title top-right">×</span>
                  <span ${DefaultAttributes} class="tile-title" title="${tile.Text}" style="${isThreeTiles ? "text-align: center;" : `text-align: ${tile.Align}`}">${this.truncateText(tile, tile.Text, isThreeTiles)}</span>
        </div>
      </div>
      ${isFirstSingleTile
            ? ""
            : `
        <button ${DefaultAttributes} title="${i18n.t("tile.delete_tile")}" class="action-button delete-button">−</button>`}
      <button ${DefaultAttributes} title="${i18n.t("tile.add_template_right")}" ${(isThreeTiles && isInfoPage) ? `style="display: none;"` : ""} class="action-button add-button-right">
        <svg ${DefaultAttributes} fill="#fff" width="15" height="15" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path ${DefaultAttributes} d="M19,11H13V5a1,1,0,0,0-2,0v6H5a1,1,0,0,0,0,2h6v6a1,1,0,0,0,2,0V13h6a1,1,0,0,0,0-2Z"/>
        </svg>
      </button>
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
    translateTileLabel(tile, tileTitle) {
        const tileActionType = tile.Action.ObjectType;
        if (tileActionType === "Map") {
            return i18n.t("default.map");
        }
        else if (tileActionType === "location") {
            return i18n.t("default.location");
        }
        else if (tileActionType === "calendar") {
            return i18n.t("default.calendar");
        }
        else if (tileActionType === "reception") {
            return i18n.t("default.reception");
        }
        else if (tileActionType === "mycare") {
            return i18n.t("default.mycare");
        }
        else if (tileActionType === "myliving") {
            return i18n.t("default.calendar");
        }
        else if (tileActionType === "myliving") {
            return i18n.t("default.calendar");
        }
        else if (tileActionType === "myservice") {
            return i18n.t("default.myservice");
        }
        else if (tileActionType === "myactivity") {
            return i18n.t("default.myactivity");
        }
        return tileTitle;
    }
    truncateText(tile, tileTitle, isThreeTiles) {
        // const translatedTitle = this.translateTileLabel(tile, tileTitle);
        const screenWidth = window.innerWidth;
        const textLength = length === 3 ? 11 : (length === 2 ? 15 : 20);
        if (tileTitle.length > (screenWidth <= 280 ? 20 : textLength + 4)) {
            return tileTitle.substring(0, screenWidth <= 280 ? textLength : textLength + 4)
                .trim() + '..';
        }
        if (isThreeTiles) {
            return this.wrapTileTitle(tileTitle);
        }
        else {
            return tileTitle;
        }
    }
    wrapTileTitle(title) {
        const words = title.split(" ");
        if (words.length > 1) {
            return words[0] + "<br>" + words[1];
        }
        return title.replace("<br>", "");
    }
    getTileIcon(tile) {
        const iconSVG = this.themeManager.getThemeIcon(tile.Icon);
        let cleanedSVG;
        if (iconSVG) {
            // replace path fill with tile.icon
            cleanedSVG = iconSVG.replace('fill="#7c8791"', `fill="${tile.Color}"`);
        }
        return cleanedSVG;
    }
    generateRow(row, rowIndex) {
        const isFirstSingleTile = rowIndex === 0 && row.Tiles.length === 1;
        const isThreeTiles = row.Tiles.length === 3;
        const tilesHTML = row.Tiles.map((tile, index) => this.generateTile(tile, isFirstSingleTile && index === 0, isThreeTiles)).join("");
        return `<div id="${row.Id}" ${rowDefaultAttributes} class="container-row">${tilesHTML}</div>`;
    }
    generateInfoRow(infoTilesRow) {
        var _a, _b, _c;
        const isFirstSingleTile = false;
        const isThreeTiles = ((_a = infoTilesRow === null || infoTilesRow === void 0 ? void 0 : infoTilesRow.Tiles) === null || _a === void 0 ? void 0 : _a.length) === 3;
        const tilesHTML = (_b = infoTilesRow === null || infoTilesRow === void 0 ? void 0 : infoTilesRow.Tiles) === null || _b === void 0 ? void 0 : _b.map((tile) => this.generateTile(tile, isFirstSingleTile, isThreeTiles, true)).join("");
        return ((_c = infoTilesRow === null || infoTilesRow === void 0 ? void 0 : infoTilesRow.Tiles) === null || _c === void 0 ? void 0 : _c.length) === 0 ? `` : `<div id="${infoTilesRow.InfoId}" ${infoRowDefaultAttributes} class="container-row">${tilesHTML}</div>`;
    }
    generateHTML() {
        const htmlData = `
    <div ${DefaultAttributes} id="frame-container" data-gjs-type="template-wrapper" class="frame-container">
      <div ${DefaultAttributes} class="container-column">
        ${this.data.PageMenuStructure.Rows.map((row, rowIndex) => this.generateRow(row, rowIndex)).join("")}
      </div>
    </div>
  `;
        return this.filterHTML(htmlData);
    }
    filterHTML(htmlData) {
        const div = document.createElement("div");
        div.innerHTML = htmlData;
        const rows = div.querySelectorAll(".container-row");
        rows.forEach((row) => {
            const tiles = row.querySelectorAll(".template-block");
            if (tiles.length === 3) {
                const deleteButtons = row.querySelectorAll(".add-button-right");
                deleteButtons.forEach((button) => {
                    button.style.display = "none";
                });
            }
        });
        const modifiedHTML = div.innerHTML;
        return modifiedHTML;
    }
}
//# sourceMappingURL=JSONToGrapesJSMenu.js.map