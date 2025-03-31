export class UndoRedoManager {
  private pageId: string;
  private maxSteps: number;
  private undoStack: any[] = [];
  private redoStack: any[] = [];

  constructor(pageId: string, maxSteps: number = 10) {
    this.pageId = pageId;
    this.maxSteps = maxSteps;
  }

  private trimStack(stack: any[]): void {
    if (stack.length > this.maxSteps) {
      stack.shift();
    }
  }

  public addRow(row: any): void {
    this.undoStack.push({ type: 'addRow', row });
    this.redoStack = []; // Clear redo stack when a new action is performed
    this.trimStack(this.undoStack);
  }

  public addTile(rowId: string, tile: any): void {
    this.undoStack.push({ type: 'addTile', rowId, tile });
    this.redoStack = [];
    this.trimStack(this.undoStack);
  }

  public removeTile(tileId: string): void {
    this.undoStack.push({ type: 'removeTile', tileId });
    this.redoStack = [];
    this.trimStack(this.undoStack);
  }

  public modifyTile(tileId: string, changes: any): void {
    this.undoStack.push({ type: 'modifyTile', tileId, changes });
    this.redoStack = [];
    this.trimStack(this.undoStack);
  }

  public undo(): boolean {
    if (this.undoStack.length === 0) return false;

    const lastAction = this.undoStack.pop();
    const data: any = JSON.parse(
      localStorage.getItem(`data-${this.pageId}`) || "{}"
    );

    switch (lastAction.type) {
      case 'addRow':
        // Remove the last added row
        data.PageMenuStructure.Rows = data.PageMenuStructure.Rows.filter(
          (row: any) => row.Id !== lastAction.row.Id
        );
        this.redoStack.push(lastAction);
        break;

      case 'addTile':
        // Find and remove the tile from its row
        const addTileRow = data.PageMenuStructure.Rows.find(
          (row: any) => row.Id === lastAction.rowId
        );
        if (addTileRow) {
          addTileRow.Tiles = addTileRow.Tiles.filter(
            (tile: any) => tile.Id !== lastAction.tile.Id
          );
        }
        this.redoStack.push(lastAction);
        break;

      case 'removeTile':
        // Find the row and add the tile back
        const row = data.PageMenuStructure.Rows.find(
          (r: any) => r.Tiles.some((t: any) => t.Id === lastAction.tileId)
        );
        if (row) {
          const removedTile = {
            Id: lastAction.tileId,
            Name: "Title",
            Text: "Title",
            Color: "#333333",
            Align: "left",
            Icon: "",
            BGColor: "transparent",
            BGImageUrl: "",
            Opacity: "0",
            Action: {
              ObjectType: "",
              ObjectId: "",
              ObjectUrl: "",
            },
          };
          row.Tiles.push(removedTile);
        }
        this.redoStack.push(lastAction);
        break;

      case 'modifyTile':
        // Revert the tile to its previous state
        data.PageMenuStructure.Rows.forEach((row: any) => {
          row.Tiles.forEach((tile: any) => {
            if (tile.Id === lastAction.tileId) {
              Object.keys(lastAction.changes).forEach((key) => {
                tile[key] = lastAction.oldValue;
              });
            }
          });
        });
        this.redoStack.push(lastAction);
        break;
    }

    localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
    return true;
  }

  public redo(): boolean {
    if (this.redoStack.length === 0) return false;

    const lastUndoneAction = this.redoStack.pop();
    const data: any = JSON.parse(
      localStorage.getItem(`data-${this.pageId}`) || "{}"
    );

    switch (lastUndoneAction.type) {
      case 'addRow':
        data.PageMenuStructure.Rows.push(lastUndoneAction.row);
        this.undoStack.push(lastUndoneAction);
        break;

      case 'addTile':
        const addTileRow = data.PageMenuStructure.Rows.find(
          (row: any) => row.Id === lastUndoneAction.rowId
        );
        if (addTileRow) {
          addTileRow.Tiles.push(lastUndoneAction.tile);
        }
        this.undoStack.push(lastUndoneAction);
        break;

      case 'removeTile':
        const row = data.PageMenuStructure.Rows.find(
          (r: any) => r.Tiles.some((t: any) => t.Id === lastUndoneAction.tileId)
        );
        if (row) {
          row.Tiles = row.Tiles.filter(
            (tile: any) => tile.Id !== lastUndoneAction.tileId
          );
        }
        this.undoStack.push(lastUndoneAction);
        break;

      case 'modifyTile':
        data.PageMenuStructure.Rows.forEach((row: any) => {
          row.Tiles.forEach((tile: any) => {
            if (tile.Id === lastUndoneAction.tileId) {
              Object.keys(lastUndoneAction.changes).forEach((key) => {
                tile[key] = lastUndoneAction.changes[key];
              });
            }
          });
        });
        this.undoStack.push(lastUndoneAction);
        break;
    }

    localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
    return true;
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }
}