import {
  DefaultAttributes,
  firstTileWrapperDefaultAttributes,
  rowDefaultAttributes,
  tileDefaultAttributes,
  tileWrapperDefaultAttributes,
} from "../../utils/default-attributes";

export class JSONToGrapesJSMenu {
  private data: any;

  constructor(json: any) {
    this.data = json;
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
      isFirstSingleTile ? " high-priority-template" : ""
    }" 
          style="background-color: ${tile.BGColor}; color: ${
      tile.Color
    }; text-align: ${tile.Align};
          ${
            isThreeTiles ? "align-items: center; justify-content: center;" : ""
          }; 
          ${
            tile.BGImageUrl
              ? `background-image: url('${tile.BGImageUrl}');
          background-size: cover;
          background-position: center;
          background-blend-mode: overlay;`
              : ``
          }">
          
          <div ${DefaultAttributes} class="tile-icon-section">
            <span ${DefaultAttributes} class="tile-close-icon top-right">×</span>
            <span ${DefaultAttributes} title="${tile.Icon}" class="tile-icon">${
      tile.Icon
    }</span>
          </div>
          
          <div ${DefaultAttributes} class="tile-title-section" style="${
      isThreeTiles ? "text-align: center;" : "text-align: left"
    }">
            <span ${DefaultAttributes} class="tile-close-icon top-right">×</span>
            <span ${DefaultAttributes} class="tile-title" title="${
      tile.Text
    }">${tile.Text}</span>
          </div>
        </div>
        ${
          isFirstSingleTile
            ? ""
            : `
          <button ${DefaultAttributes} title="Delete tile" class="action-button delete-button">&minus;</button>`
        }
        <button ${DefaultAttributes} title="Add tile right" class="action-button add-button-right">+</button>
        <button ${DefaultAttributes} title="Add tile below" class="action-button add-button-bottom">&plus;</button>
      </div>
    `;
  }

  private generateContent(content: any): string {
    if (content.ContentType === "Image") {
      return `
        <img id="product-service-image" data-gjs-type="product-service-image" draggable="true" src="${content.ContentValue}" alt="Product Service Image" class="content-page-block">
      `;      
    } else {
      return `
        <p id="product-service-description" data-gjs-type="product-service-description" draggable="true" class="content-page-block">
          ${content.ContentValue}
        </p>
      `;
    }
  }

  public generateHTML(): any {
    const htmlData = `
      <div ${DefaultAttributes} id="frame-container" data-gjs-type="template-wrapper" class="content-frame-container">
        <div ${DefaultAttributes} class="container-column">
        <div ${rowDefaultAttributes} class="container-row">
          <div data-gjs-type="default" class="template-wrapper">
            <div id="iuel" data-gjs-type="default" class="content-page-wrapper">
            ${this.data.Content.map((content: any) =>
              this.generateContent(content)
            ).join("")}
            </div>
          </div>
        </div>          
        </div>
      </div>
    `;
  }
}
