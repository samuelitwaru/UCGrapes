import { randomIdGenerator } from "../../utils/helpers";
import { UndoRedoManager } from "../toolbox/UndoRedoManager";

export class TileMapper {
  pageId: string;
  undoRedo: UndoRedoManager;

  constructor(pageId: string) {
    this.pageId = pageId;
    this.undoRedo = new UndoRedoManager(pageId);
  }

  public addFreshRow(rowId: string, tileId: string): void {
    const data: any = JSON.parse(
      localStorage.getItem(`data-${this.pageId}`) || "{}"
    );
    const newRow = {
      Id: rowId,
      Tiles: [
        {
          Id: tileId,
          Name: "Title",
          Text: "Title",
          Color: "#333333",
          Align: "left",
          Icon: "",
          BGColor: "transparent",
          BGImageUrl: "",
          Opacity: 0,
          Action: {
            ObjectType: "",
            ObjectId: "",
            ObjectUrl: "",
          }
        },
      ],
    };

    data.PageMenuStructure?.Rows?.push(newRow);
    localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
    this.undoRedo.addRow(newRow);
  }

  public addTile(rowId: string, tileId: string): void {
    const newTile = {
      Id: tileId,
      Name: "Title",
      Text: "Title",
      Color: "#333333",
      Align: "left",
      Icon: "",
      BGColor: "transparent",
      BGImageUrl: "",
      Opacity: 0,
      Action: {
        ObjectType: "",
        ObjectId: "",
        ObjectUrl: "",
      },
    };

    const data: any = JSON.parse(
      localStorage.getItem(`data-${this.pageId}`) || "{}"
    );
    const row = data.PageMenuStructure?.Rows?.find((r: any) => r.Id === rowId);
    if (row) {
      row.Tiles.push(newTile);
      localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
    }

    this.undoRedo.addTile(rowId, newTile);
  }

  removeTile(tileId: string, rowId: string): void {
    const data: any = JSON.parse(
      localStorage.getItem(`data-${this.pageId}`) || "{}"
    );
    const row = data.PageMenuStructure.Rows.find(
      (r: any) => String(r.Id) === String(rowId)
    );
    if (row) {
      row.Tiles = row.Tiles.filter((t: any) => t.Id !== tileId);
      if (row.Tiles.length === 0) {
        data.PageMenuStructure.Rows = data.PageMenuStructure?.Rows?.filter(
          (r: any) => r.Id !== row.Id
        );
      }
      localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
      this.undoRedo.removeTile(tileId);
    }
  }

  updateTile(tileId: string, attribute: string, value: any): void {
    const data: any = JSON.parse(
      localStorage.getItem(`data-${this.pageId}`) || "{}"
    );
    let oldValue;
    data?.PageMenuStructure?.Rows?.forEach((row: any) => {
      row.Tiles.forEach((tile: any) => {
        if (tile.Id === tileId) {
          // Capture old value
          oldValue = tile[attribute];
          
          if (attribute.includes(".")) {
            const parts = attribute.split(".");
            let current = tile;
  
            for (let i = 0; i < parts.length - 1; i++) {
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
    this.undoRedo.modifyTile(tileId, { [attribute]: oldValue });
  }

  getTile(rowId: string, tileId: string): any {
    const data: any = JSON.parse(
      localStorage.getItem(`data-${this.pageId}`) || "{}"
    );
    if (rowId) {
      const row = data?.PageMenuStructure?.Rows?.find(
        (r: any) => r.Id === rowId
      );
      if (row) {
        const tile = row.Tiles.find((t: any) => t.Id === tileId);
        return tile || null;
      }
    }
    return null;
  }

  findPageByTileId(pagesCollection: any, tileId: string): any {
    for (const page of pagesCollection) {
      for (const row of page?.PageMenuStructure?.Rows) {
        for (const tile of row.Tiles) {
          if (tile.Id === tileId) {
            return page.PageId;
          }
        }
      }
    }
    return null;
  }

  moveTile(
    sourceTileId: string,
    sourceRowId: string,
    targetRowId: string,
    targetIndex: number
  ): void {
    const data: any = JSON.parse(
      localStorage.getItem(`data-${this.pageId}`) || "{}"
    );

    const sourceRow = data?.PageMenuStructure?.Rows.find(
      (r: any) => r.Id === sourceRowId
    );
    if (!sourceRow) return;

    const sourceTileIndex = sourceRow?.Tiles?.findIndex(
      (t: any) => t.Id === sourceTileId
    );
    if (sourceTileIndex === -1) return;

    const [tileToMove] = sourceRow?.Tiles?.splice(sourceTileIndex, 1);

    const targetRow = data.PageMenuStructure?.Rows?.find(
      (r: any) => r.Id === targetRowId
    );
    if (!targetRow) {
      // If target row doesn't exist, put the tile back
      sourceRow.Tiles.splice(sourceTileIndex, 0, tileToMove);
      return;
    }
    // Insert tile at target position
    targetRow.Tiles.splice(targetIndex, 0, tileToMove);

    if (targetRow?.Tiles?.length === 3) {
      targetRow?.Tiles.forEach((tile: any) => {
        tile.Align = "center";
      });
    }

    // Remove source row if it's now empty
    if (sourceRow?.Tiles?.length === 0) {
      data.PageMenuStructure.Rows = data?.PageMenuStructure?.Rows.filter(
        (r: any) => r.Id !== sourceRow.Id
      );
    }
    localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
  }
}
