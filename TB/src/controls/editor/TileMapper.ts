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
                    "Opacity": "50",
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
            "Color": "#333",
            "Align": "left",
            "Icon": "home",
            "BGColor": "transparent",
            "BGImageUrl": "",
            "Opacity": "50",
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
        console.log("data", data)
        if (rowId) {
            const row = data.PageStructure.Rows.find((r: any) => r.Id === rowId);
            if (row) {
                console.log("row", row)
                const tile = row.Tiles.find((t: any) => t.Id === tileId);
                return tile || null;
            }
        } 
        return null;
    }
}