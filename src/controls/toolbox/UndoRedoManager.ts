// Define action types for better type safety
export enum ActionType {
  ADD_ROW = 'ADD_ROW',
  REMOVE_ROW = 'REMOVE_ROW',
  ADD_TILE = 'ADD_TILE',
  REMOVE_TILE = 'REMOVE_TILE',
  MODIFY_TILE = 'MODIFY_TILE',
  MOVE_TILE = 'MOVE_TILE',
  BATCH = 'BATCH' // New type for grouped actions
}

// Interface for action objects
export interface Action {
  type: ActionType;
  pageId: string;
  rowId?: string;
  tileId?: string;
  data?: any;
  timestamp: number;
}

export class UndoRedoManager {
  private pageId: string;
  private undoStack: Action[] = [];
  private redoStack: Action[] = [];
  private maxStackSize: number = 100;
  private isUndoing: boolean = false;
  private isRedoing: boolean = false;
  private subscribers: ((action: Action) => void)[] = [];
  private batchActions: Action[] | null = null;

  constructor(pageId: string) {
    this.pageId = pageId;
    this.setupKeyboardShortcuts();
  }

  // ========================
  // Public API
  // ========================

  public subscribe(callback: (action: Action) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  public startBatch() {
    if (!this.batchActions) {
      this.batchActions = [];
    }
  }

  public endBatch() {
    if (this.batchActions && this.batchActions.length > 0) {
      this.addToUndoStack({
        type: ActionType.BATCH,
        pageId: this.pageId,
        data: [...this.batchActions],
        timestamp: Date.now()
      });
    }
    this.batchActions = null;
  }

  // Row Actions
  public addRow(rowData: any) {
    const action = {
      type: ActionType.ADD_ROW,
      pageId: this.pageId,
      rowId: rowData.Id,
      data: rowData,
      timestamp: Date.now()
    };
    
    if (this.batchActions) {
      this.batchActions.push(action);
    } else {
      this.addToUndoStack(action);
    }
  }

  public removeRow(rowId: string, rowData: any) {
    const action = {
      type: ActionType.REMOVE_ROW,
      pageId: this.pageId,
      rowId: rowId,
      data: rowData,
      timestamp: Date.now()
    };
    
    if (this.batchActions) {
      this.batchActions.push(action);
    } else {
      this.addToUndoStack(action);
    }
  }

  // Tile Actions
  public addTile(rowId: string, tileData: any) {
    const action = {
      type: ActionType.ADD_TILE,
      pageId: this.pageId,
      rowId: rowId,
      tileId: tileData.Id,
      data: tileData,
      timestamp: Date.now()
    };
    
    if (this.batchActions) {
      this.batchActions.push(action);
    } else {
      this.addToUndoStack(action);
    }
  }

  public removeTile(tileId: string, rowId?: string, tileData?: any) {
    if (!rowId || !tileData) {
      const data = this.getPageData();
      data.PageMenuStructure?.Rows?.forEach((row: any) => {
        const tile = row.Tiles.find((t: any) => t.Id === tileId);
        if (tile) {
          rowId = row.Id;
          tileData = tile;
        }
      });
    }

    const action = {
      type: ActionType.REMOVE_TILE,
      pageId: this.pageId,
      rowId: rowId,
      tileId: tileId,
      data: tileData,
      timestamp: Date.now()
    };
    
    if (this.batchActions) {
      this.batchActions.push(action);
    } else {
      this.addToUndoStack(action);
    }
  }

  public modifyTile(tileId: string, oldValues: any, newValues: any) {
    const action = {
      type: ActionType.MODIFY_TILE,
      pageId: this.pageId,
      tileId: tileId,
      data: { oldValues, newValues },
      timestamp: Date.now()
    };
    
    if (this.batchActions) {
      this.batchActions.push(action);
    } else {
      this.addToUndoStack(action);
    }
  }

  public moveTile(
    sourceTileId: string,
    sourceRowId: string,
    targetRowId: string,
    targetIndex: number,
    originalIndex: number
  ) {
    const action = {
      type: ActionType.MOVE_TILE,
      pageId: this.pageId,
      tileId: sourceTileId,
      rowId: sourceRowId,
      data: {
        sourceRowId,
        targetRowId,
        targetIndex,
        originalIndex
      },
      timestamp: Date.now()
    };
    
    if (this.batchActions) {
      this.batchActions.push(action);
    } else {
      this.addToUndoStack(action);
    }
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public undo(): boolean {
    if (!this.canUndo()) return false;
    
    this.isUndoing = true;
    const action = this.undoStack.pop()!;
    
    try {
      if (action.type === ActionType.BATCH) {
        // Handle batch undo in reverse order
        const batchActions = action.data as Action[];
        for (let i = batchActions.length - 1; i >= 0; i--) {
          this.applyAction(batchActions[i], true);
        }
      } else {
        this.applyAction(action, true);
      }
      
      this.redoStack.push(action);
      this.notifySubscribers(action);
      return true;
    } catch (error) {
      console.error("Undo failed:", error);
      this.undoStack.push(action); // Put it back if failed
      return false;
    } finally {
      this.isUndoing = false;
    }
  }

  public redo(): boolean {
    if (!this.canRedo()) return false;
    
    this.isRedoing = true;
    const action = this.redoStack.pop()!;
    
    try {
      if (action.type === ActionType.BATCH) {
        // Handle batch redo in original order
        const batchActions = action.data as Action[];
        batchActions.forEach(a => this.applyAction(a, false));
      } else {
        this.applyAction(action, false);
      }
      
      this.undoStack.push(action);
      this.notifySubscribers(action);
      return true;
    } catch (error) {
      console.error("Redo failed:", error);
      this.redoStack.push(action); // Put it back if failed
      return false;
    } finally {
      this.isRedoing = false;
    }
  }

  public clearHistory(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.notifySubscribers({
      type: ActionType.MODIFY_TILE,
      pageId: this.pageId,
      timestamp: Date.now()
    });
  }

  public getStackSizes(): { undoSize: number; redoSize: number } {
    return {
      undoSize: this.undoStack.length,
      redoSize: this.redoStack.length
    };
  }

  // ========================
  // Private Methods
  // ========================

  private addToUndoStack(action: Action): void {
    if (this.isUndoing || this.isRedoing) return;
    
    // Coalesce rapid-fire modifications
    if (this.shouldCoalesceWithLastAction(action)) {
      this.undoStack.pop();
    }
    
    // Enforce stack size limit
    if (this.undoStack.length >= this.maxStackSize) {
      this.undoStack.shift();
    }
    
    this.undoStack.push(action);
    this.redoStack = []; // Clear redo stack on new action
    this.notifySubscribers(action);
  }

  private applyAction(action: Action, isUndo: boolean): void {
    const data = this.getPageData();
    
    switch (action.type) {
      case ActionType.ADD_ROW:
        isUndo ? this.undoAddRow(data, action) : this.redoAddRow(data, action);
        break;
      case ActionType.REMOVE_ROW:
        isUndo ? this.undoRemoveRow(data, action) : this.redoRemoveRow(data, action);
        break;
      case ActionType.ADD_TILE:
        isUndo ? this.undoAddTile(data, action) : this.redoAddTile(data, action);
        break;
      case ActionType.REMOVE_TILE:
        isUndo ? this.undoRemoveTile(data, action) : this.redoRemoveTile(data, action);
        break;
      case ActionType.MODIFY_TILE:
        const values = isUndo ? action.data.oldValues : action.data.newValues;
        this.applyTileChanges(data, action.tileId!, values);
        break;
      case ActionType.MOVE_TILE:
        isUndo ? this.undoMoveTile(data, action) : this.redoMoveTile(data, action);
        break;
    }
    
    this.savePageData(data);
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          this.undo();
        } else if ((e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
          e.preventDefault();
          this.redo();
        }
      }
    });
  }

  private shouldCoalesceWithLastAction(newAction: Action): boolean {
    if (this.undoStack.length === 0) return false;
    const lastAction = this.undoStack[this.undoStack.length - 1];
    
    return (
      newAction.type === ActionType.MODIFY_TILE &&
      lastAction.type === ActionType.MODIFY_TILE &&
      newAction.tileId === lastAction.tileId &&
      Date.now() - lastAction.timestamp < 1000 // 1s threshold
    );
  }

  private getPageData(): any {
    return JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
  }

  private savePageData(data: any): void {
    localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
  }

  private notifySubscribers(action: Action): void {
    this.subscribers.forEach(callback => callback(action));
  }

  // ========================
  // Action Implementations
  // ========================

  private undoAddRow(data: any, action: Action): void {
    data.PageMenuStructure.Rows = data.PageMenuStructure.Rows.filter(
      (row: any) => row.Id !== action.rowId
    );
  }

  private redoAddRow(data: any, action: Action): void {
    if (!data.PageMenuStructure) {
      data.PageMenuStructure = { Rows: [] };
    }
    data.PageMenuStructure.Rows.push(action.data);
  }

  private undoRemoveRow(data: any, action: Action): void {
    if (!data.PageMenuStructure) {
      data.PageMenuStructure = { Rows: [] };
    }
    data.PageMenuStructure.Rows.push(action.data);
  }

  private redoRemoveRow(data: any, action: Action): void {
    data.PageMenuStructure.Rows = data.PageMenuStructure.Rows.filter(
      (row: any) => row.Id !== action.rowId
    );
  }

  private undoAddTile(data: any, action: Action): void {
    const row = data.PageMenuStructure.Rows.find(
      (r: any) => r.Id === action.rowId
    );
    if (row) {
      row.Tiles = row.Tiles.filter((tile: any) => tile.Id !== action.tileId);
      
      if (row.Tiles.length === 0) {
        data.PageMenuStructure.Rows = data.PageMenuStructure.Rows.filter(
          (r: any) => r.Id !== action.rowId
        );
      }
    }
  }

  private redoAddTile(data: any, action: Action): void {
    let row = data.PageMenuStructure.Rows.find(
      (r: any) => r.Id === action.rowId
    );
    
    if (!row) {
      row = { Id: action.rowId, Tiles: [] };
      data.PageMenuStructure.Rows.push(row);
    }
    
    row.Tiles.push(action.data);
    
    if (row.Tiles.length === 3) {
      row.Tiles.forEach((tile: any) => {
        tile.Align = "center";
      });
    }
  }

  private undoRemoveTile(data: any, action: Action): void {
    let row = data.PageMenuStructure.Rows.find(
      (r: any) => r.Id === action.rowId
    );
    
    if (!row) {
      row = { Id: action.rowId, Tiles: [] };
      data.PageMenuStructure.Rows.push(row);
    }
    
    row.Tiles.push(action.data);
  }

  private redoRemoveTile(data: any, action: Action): void {
    const row = data.PageMenuStructure.Rows.find(
      (r: any) => r.Id === action.rowId
    );
    
    if (row) {
      row.Tiles = row.Tiles.filter((tile: any) => tile.Id !== action.tileId);
      
      if (row.Tiles.length === 0) {
        data.PageMenuStructure.Rows = data.PageMenuStructure.Rows.filter(
          (r: any) => r.Id !== action.rowId
        );
      }
    }
  }

  private applyTileChanges(data: any, tileId: string, changes: any): void {
    data.PageMenuStructure?.Rows?.forEach((row: any) => {
      row.Tiles.forEach((tile: any) => {
        if (tile.Id === tileId) {
          Object.keys(changes).forEach(key => {
            if (key.includes(".")) {
              const parts = key.split(".");
              let current = tile;
              
              for (let i = 0; i < parts.length - 1; i++) {
                current = current[parts[i]];
              }
              
              current[parts[parts.length - 1]] = changes[key];
            } else {
              tile[key] = changes[key];
            }
          });
        }
      });
    });
  }

  private undoMoveTile(data: any, action: Action): void {
    const { sourceRowId, targetRowId, originalIndex } = action.data;
    
    const targetRow = data.PageMenuStructure.Rows.find(
      (r: any) => r.Id === targetRowId
    );
    
    let sourceRow = data.PageMenuStructure.Rows.find(
      (r: any) => r.Id === sourceRowId
    );
    
    if (targetRow) {
      const tileIndex = targetRow.Tiles.findIndex(
        (t: any) => t.Id === action.tileId
      );
      
      if (tileIndex !== -1) {
        const [tileToMove] = targetRow.Tiles.splice(tileIndex, 1);
        
        if (!sourceRow) {
          sourceRow = { Id: sourceRowId, Tiles: [] };
          data.PageMenuStructure.Rows.push(sourceRow);
        }
        
        sourceRow.Tiles.splice(originalIndex, 0, tileToMove);
        
        if (sourceRow.Tiles.length === 3) {
          sourceRow.Tiles.forEach((tile: any) => {
            tile.Align = "center";
          });
        }
        
        if (targetRow.Tiles.length === 0) {
          data.PageMenuStructure.Rows = data.PageMenuStructure.Rows.filter(
            (r: any) => r.Id !== targetRow.Id
          );
        }
      }
    }
  }

  private redoMoveTile(data: any, action: Action): void {
    const { sourceRowId, targetRowId, targetIndex } = action.data;
    
    const sourceRow = data.PageMenuStructure.Rows.find(
      (r: any) => r.Id === sourceRowId
    );
    
    let targetRow = data.PageMenuStructure.Rows.find(
      (r: any) => r.Id === targetRowId
    );
    
    if (sourceRow) {
      const tileIndex = sourceRow.Tiles.findIndex(
        (t: any) => t.Id === action.tileId
      );
      
      if (tileIndex !== -1) {
        const [tileToMove] = sourceRow.Tiles.splice(tileIndex, 1);
        
        if (!targetRow) {
          targetRow = { Id: targetRowId, Tiles: [] };
          data.PageMenuStructure.Rows.push(targetRow);
        }
        
        targetRow.Tiles.splice(targetIndex, 0, tileToMove);
        
        if (targetRow.Tiles.length === 3) {
          targetRow.Tiles.forEach((tile: any) => {
            tile.Align = "center";
          });
        }
        
        if (sourceRow.Tiles.length === 0) {
          data.PageMenuStructure.Rows = data.PageMenuStructure.Rows.filter(
            (r: any) => r.Id !== sourceRow.Id
          );
        }
      }
    }
  }
}