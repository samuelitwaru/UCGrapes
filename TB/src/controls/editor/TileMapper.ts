import { randomIdGenerator } from "../../utils/helpers";

export class TileMapper {
    pageId: string;
    constructor (pageId: string) {
        this.pageId = pageId;
    }

    public addFreshRow(rowId: string, tileId: string): void {
        const data: any = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");      
        const newRow = {
            "Id": rowId,
            "Tiles": [
                {
                    "Id": tileId,
                    "Name": "Title",
                    "Text": "Title",
                    "Color": "#333333",
                    "Align": "left",
                    "Icon": "home",
                    "BGColor": "transparent",
                    "BGImageUrl": "",
                    "Opacity": "0",
                    "Action": {
                        "ObjectType": "",
                        "ObjectId": "",
                        "ObjectUrl": ""
                    },
                    "TilePermissionName": ""
                }
            ]
        };
    
        data.PageStructure.Rows?.push(newRow);    
        localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
    }
    
    public addTile (rowId: string, tileId: string): void {
        const newTile = {
            "Id": tileId, 
            "Name": "Title",
            "Text": "Title",
            "Color": "#333333",
            "Align": "left",
            "Icon": "home",
            "BGColor": "transparent",
            "BGImageUrl": "",
            "Opacity": "0",
            "Action": {
                "ObjectType": "",
                "ObjectId": "",
                "ObjectUrl": ""
            },
            "TilePermissionName": ""
        }

        const data: any = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        const row = data.PageStructure.Rows.find((r: any) => r.Id === rowId);
        if (row) {
            row.Tiles.push(newTile);
            localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
        }
    }

    removeTile (tileId: string, rowId: string): void {
        const data: any = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        const row = data.PageStructure.Rows.find((r: any) => String(r.Id) === String(rowId));
        if (row) {            
            row.Tiles = row.Tiles.filter((t: any) => t.Id !== tileId);
            if (row.Tiles.length === 0) {
                data.PageStructure.Rows = data.PageStructure.Rows.filter((r: any) => r.Id !== row.Id);
            }
            localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
        }
    }

    updateTile (tileId: string, attribute: string, value: any): void {
        const data: any = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        data.PageStructure.Rows.forEach((row: any) => {
            console.log(row);
            row.Tiles.forEach((tile: any) => {
                if (tile.Id === tileId) {
                    if (attribute.includes('.')) {
                        const parts = attribute.split('.');
                        let current = tile;

                        for(let i =0; i < parts.length - 1; i++) {
                            current = current[parts[i]];
                        }
                        
                        current[parts[parts.length - 1]] = value;
                    } else {
                        tile[attribute] = value;
                    }
                }
            });
        });
        localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
    }

    getTile (rowId: string,tileId: string): any {
        const data: any = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        if (rowId) {
            const row = data.PageStructure.Rows.find((r: any) => r.Id === rowId);
            if (row) {
                const tile = row.Tiles.find((t: any) => t.Id === tileId);
                return tile || null;
            }
        } 
        return null;
    }

    findPageByTileId(pagesCollection: any, tileId: string): any {
        for (const page of pagesCollection) {
          for (const row of page.PageStructure.Rows) {
            for (const tile of row.Tiles) {
              if (tile.Id === tileId) {
                return page.PageId;
              }
            }
          }
        }
        return null; 
    }

    moveTile (
        sourceTileId: string,
        sourceRowId: string,
        targetRowId: string,
        targetIndex: number
    ): void {
        const data: any = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");

        const sourceRow = data.PageStructure.Rows.find((r: any) => r.Id === sourceRowId);
        if (!sourceRow) return;
        
        const sourceTileIndex = sourceRow.Tiles.findIndex((t: any) => t.Id === sourceTileId);
        if (sourceTileIndex === -1) return;

        const [tileToMove] = sourceRow.Tiles.splice(sourceTileIndex, 1);

        const targetRow = data.PageStructure.Rows.find((r: any) => r.Id === targetRowId);
        if (!targetRow) {
            // If target row doesn't exist, put the tile back
            sourceRow.Tiles.splice(sourceTileIndex, 0, tileToMove);
            return;
        }
        // Insert tile at target position
        targetRow.Tiles.splice(targetIndex, 0, tileToMove);
        // Remove source row if it's now empty
        if (sourceRow.Tiles.length === 0) {
            data.PageStructure.Rows = data.PageStructure.Rows.filter((r: any) => r.Id !== sourceRow.Id);            
        }
        localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
    }
}