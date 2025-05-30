import { randomIdGenerator } from "../../utils/helpers";

export class TileMapper {
  pageId: string;
  history: any[] = [];
  future: any[] = [];
  private maxHistory = 20;

  constructor(pageId: string) {
    this.pageId = pageId;

    const initialData = localStorage.getItem(`data-${this.pageId}`);
    if (initialData) {
      try {
        // Save initial state to reference
        const parsedData = JSON.parse(initialData);
        this.history.push(parsedData);
      } catch (e) {
        console.error("Failed to parse initial data:", e);
      }
    }
  }

  private saveState(): boolean {
    try {
      const data = localStorage.getItem(`data-${this.pageId}`);
      if (data) {
        const currentState = JSON.parse(data);
        
        // Option: Only save if there's a real change
        const lastState = this.history.length ? this.history[this.history.length - 1] : null;
        const isChanged = !lastState || JSON.stringify(lastState) !== JSON.stringify(currentState);
        
        if (isChanged) {
          this.history.push(currentState);
          if (this.history.length > this.maxHistory) {
            this.history.shift();
          }
          this.future = []; // Clear redo stack on new action
          return true;
        }
        return false;
      }
      return false;
    } catch (e) {
      console.error("Error saving state:", e);
      return false;
    }
  }

  public undo(): { affectedTiles?: string[], affectedRows?: string[] } | null {
    if (this.history.length === 0) return null;
  
    // 1. Save current state to future stack
    const currentState = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
    this.future.push(currentState);
  
    // 2. Get the previous state from history
    const previousState = this.history.pop();
    localStorage.setItem(`data-${this.pageId}`, JSON.stringify(previousState));
  
    // 3. Compare and find changed tiles/rows
    return this.findChanges(currentState, previousState);
  }
  
  public redo(): { affectedTiles?: string[], affectedRows?: string[] } | null {
    if (this.future.length === 0) return null;
  
    // 1. Save current state to history
    const currentState = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
    this.history.push(currentState);
  
    // 2. Get the next state from future
    const nextState = this.future.pop();
    localStorage.setItem(`data-${this.pageId}`, JSON.stringify(nextState));
  
    // 3. Compare and find changed tiles/rows
    return this.findChanges(currentState, nextState);
  }
  
  private findChanges(
    oldState: any,
    newState: any
  ): { affectedTiles?: string[], affectedRows?: string[] } {
    const affectedTiles = new Set<string>();
    const affectedRows = new Set<string>();
  
    const oldRows = oldState.PageMenuStructure?.Rows || [];
    const newRows = newState.PageMenuStructure?.Rows || [];
  
    // Check for added/removed rows
    const oldRowIds = new Set(oldRows.map((r: any) => r.Id));
    const newRowIds = new Set(newRows.map((r: any) => r.Id));
  
    // Find modified or deleted rows
    oldRows.forEach((oldRow: any) => {
      const newRow = newRows.find((r: any) => r.Id === oldRow.Id);
      if (!newRow) {
        affectedRows.add(oldRow.Id); // Row was deleted
      } else if (JSON.stringify(oldRow) !== JSON.stringify(newRow)) {
        affectedRows.add(oldRow.Id); // Row was modified
      }
    });
  
    // Find added rows
    newRows.forEach((newRow: any) => {
      if (!oldRowIds.has(newRow.Id)) {
        affectedRows.add(newRow.Id); // Row was added
      }
    });
  
    // Find modified tiles
    oldRows.forEach((oldRow: any) => {
      const newRow = newRows.find((r: any) => r.Id === oldRow.Id);
      if (newRow) {
        const oldTileIds = new Set(oldRow.Tiles?.map((t: any) => t.Id) || []);
        const newTileIds = new Set(newRow.Tiles?.map((t: any) => t.Id) || []);
  
        // Check for added/removed tiles
        oldRow.Tiles?.forEach((oldTile: any) => {
          if (!newTileIds.has(oldTile.Id)) {
            affectedTiles.add(oldTile.Id); // Tile was removed
          }
        });
  
        newRow.Tiles?.forEach((newTile: any) => {
          if (!oldTileIds.has(newTile.Id)) {
            affectedTiles.add(newTile.Id); // Tile was added
          } else {
            const oldTile = oldRow.Tiles.find((t: any) => t.Id === newTile.Id);
            if (JSON.stringify(oldTile) !== JSON.stringify(newTile)) {
              affectedTiles.add(newTile.Id); // Tile was modified
            }
          }
        });
      }
    });
  
    return {
      affectedTiles: Array.from(affectedTiles),
      affectedRows: Array.from(affectedRows),
    };
  }

  public addFreshRow(rowId: string, tileId: string, index:number): void {
    this.saveState();
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
          },
          BGSize: 0,
          BGPosition: 0
        },
      ],
    };
    data.PageMenuStructure?.Rows.splice(index, 0, newRow);
    // data.PageMenuStructure?.Rows?.push(newRow);
    localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
  }

  public addTile(rowId: string, tileId: string): void {
    this.saveState();
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
      BGSize: 0,
      BGPosition: 0
    };

    const data: any = JSON.parse(
      localStorage.getItem(`data-${this.pageId}`) || "{}"
    );
    const row = data.PageMenuStructure?.Rows?.find((r: any) => r.Id === rowId);
    if (row) {
      row.Tiles.push(newTile);
      localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
    }
  }

  removeTile(tileId: string, rowId: string): void {
    this.saveState();
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
    }
  }

  updateTile(tileId: string, attribute: string, value: any): void {
    this.saveState();
    const data: any = JSON.parse(
      localStorage.getItem(`data-${this.pageId}`) || "{}"
    );

    // if current page is Information type
    if (data.PageType === "Information") {
      data.PageInfoStructure.InfoContent
      .filter((content:any)=>content.InfoType == "TileRow")
      .forEach((content: any) => {
        content.Tiles.forEach((tile: any) => {
          if (tile.Id === tileId) {
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
      return;
    }

    // if current page is Menu type
    else if (data.PageType === "Menu" || data.PageType === "MyCare"  || data.PageType === "MyLiving"  || data.PageType === "MyServices") {
      const row = data?.PageMenuStructure?.Rows?.find(
        (r: any) => r.Tiles.some((t: any) => t.Id === tileId)
      );
      if (row) {
        row.Tiles.forEach((tile: any) => {
          if (tile.Id === tileId) {
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
      }
    }
    localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
  }

  getTile(rowId: string, tileId: string): any {
    const data: any = JSON.parse(
      localStorage.getItem(`data-${this.pageId}`) || "{}"
    );
    let tile: any = null;
    if (data.PageType === "Information") {      
      const row = data.PageInfoStructure.InfoContent.find((item:any)=>item.InfoId==rowId)
      if (row) {
        const tile = row.Tiles.find((t:any) => t.Id == tileId)
        return tile
      }
    }

    // if current page is Menu type
    else if (data.PageType === "Menu" || data.PageType === "MyCare"  || data.PageType === "MyLiving"  || data.PageType === "MyServices") {
      if (rowId) {
        const row = data?.PageMenuStructure?.Rows?.find(
          (r: any) => r.Id === rowId
        );
        if (row) {
          tile = row.Tiles.find((t: any) => t.Id === tileId);
          return tile || null;
        }
      }
    }

    return tile;
  }

  getCta(infoId:string): any {
    const data: any = JSON.parse(
      localStorage.getItem(`data-${this.pageId}`) || "{}"
    );
    const cta = data.PageInfoStructure.InfoContent.find((row:any) => row.InfoType == 'Cta' && row.InfoId == infoId)
    return cta.CtaAttributes || {}
  }

  moveTile(
    sourceTileId: string,
    sourceRowId: string,
    targetRowId: string,
    targetIndex: number
  ): void {
    this.saveState();
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
      sourceRow.Tiles.splice(sourceTileIndex, 0, tileToMove);
      return;
    }
    targetRow.Tiles.splice(targetIndex, 0, tileToMove);

    if (targetRow?.Tiles?.length === 3) {
      targetRow?.Tiles.forEach((tile: any) => {
        tile.Align = "center";
      });
    }

    if (sourceRow?.Tiles?.length === 0) {
      data.PageMenuStructure.Rows = data?.PageMenuStructure?.Rows.filter(
        (r: any) => r.Id !== sourceRow.Id
      );
    }
    localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
  }
}
