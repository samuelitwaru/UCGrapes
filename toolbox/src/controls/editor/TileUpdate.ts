import { TileMapper } from "./TileMapper";

export class TileUpdate {
    rowComponent: any;
    pageId: any;

    constructor(pageId?: string) {
        this.pageId = pageId || null;
    }

    updateTile(rowComponent: any, isDragging: boolean = false) {
        alert()
        this.rowComponent = rowComponent;
        const tiles = rowComponent.components();
        const length = tiles.length;
        tiles.forEach((tile: any) => {
            const rightButton = tile.find(".add-button-right")[0];
            if (rightButton) {
                rightButton.addStyle({
                    "display": length >= 3 ? "none" : "flex"
                });
            }
            const tileAlignment = {
                "justify-content": length === 3 ? "center" : "start",
                "align-items": length === 3 ? "center" : "start"
            }
    
            const titleAlignment = {
                "text-align": length === 3 ? "center" : "left"
            }
            
            this.updateTileHeight(tile, length);
            this.updateAlignment(tile, tileAlignment, titleAlignment);
            this.updateTileTitleLength(tile, length);
            if (!isDragging) {
                this.updateTileAttributes(tile.getId(), 'Align', tileAlignment["justify-content"])
            }
        });
      }

    //   updateTileButtons(tile: any) {
    //     console.log("calling updateTileButtons: ", tile.getId());
    //     // if a page is info page, remove the bottom add buttons
    //     const page = (globalThis as any).pageData;
    //     console.log("Page: ", page);
    //     if (page.PageType === "Information") {
    //         console.log("Page type is Information, removing bottom add buttons.");
    //         const belowButton = tile.find(".action-button.add-button-bottom")[0];
    //         if (belowButton) {
    //             belowButton.addStyle({
    //                 "display": "none"
    //             });
    //         }  
    //     }     
    //   }

      private updateTileHeight(tile: any, length: number) {
        const templateBlock = tile.find(".template-block")[0];
        if (length === 1) {
            if(templateBlock.getClasses().includes("first-tile")) {
                templateBlock.addClass("high-priority-template");
            }                
        } else {
            templateBlock.removeClass("high-priority-template");
        }
      }
    
      private updateAlignment(tile: any, tileAlignment: any, titleAlignment: any) {
        const templateBlock = tile.find(".template-block")[0];
        const tileTitle = tile.find(".tile-title-section")[0];
        templateBlock.addStyle(tileAlignment);    
        tileTitle.addStyle(titleAlignment);
      }
    
      private updateTileTitleLength(tile: any, length: number) {
          const tileTitle = tile.find(".tile-title")[0];
          if (tileTitle) {
            const textLength = length === 3 ? 11 : (length === 2 ? 15 : 20);
             const title = 
                this.truncateText(textLength, tileTitle.getAttributes()?.["title"] || tileTitle.getEl().innerText);
            
                if (length === 3) {
                    tileTitle.components(this.wrapTileTitle(title));
                } else {
                    tileTitle.components(title);
                }
          }
      }
    
      private truncateText(titleLength: number, tileTitle: string) {
        const screenWidth: number = window.innerWidth;
        if (tileTitle.length > (screenWidth <= 280 ? titleLength : titleLength + 4)) {
            return tileTitle.substring(0, screenWidth <= 280 ? titleLength : titleLength + 4)
                .trim() + '..';
        }
        return tileTitle;
      }
    
      private wrapTileTitle(title: any) {
        const words = title.split(" ");
        if (words.length > 1) {
            return words[0] + "<br>" + words[1];
        }
        return title.replace("<br>", "");;
      }
    
    updateTileAttributes (tileId: string, attribute: string, value: string) {
        const tileAttributes = new TileMapper(this.pageId);
        let align = value;
        if (value === "start") {
            align = "left"
        }
        tileAttributes.updateTile(tileId, attribute, align)
    }
    
}