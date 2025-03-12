export class TileUpdate {
    constructor() {
    }

    updateTile(rowComponent: any) {
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
    
            this.updateAlignment(tile, tileAlignment, titleAlignment);
            this.updateTileTitleLength(tile, length);
        });
      }
    
      private updateAlignment(tile: any, tileAlignment: any, titleAlignment: any) {
        const templateBlock = tile.find(".template-block")[0];
        const tileTitle = tile.find(".tile-title-section")[0];
        templateBlock.addStyle(tileAlignment)    
        tileTitle.addStyle(titleAlignment)
      }
    
      private updateTileTitleLength(tile: any, length: number) {
          // truncate title
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
        if (tileTitle.length > (screenWidth <= 1440 ? titleLength : titleLength + 4)) {
            return tileTitle.substring(0, screenWidth <= 1440 ? titleLength : titleLength + 4)
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
    
}