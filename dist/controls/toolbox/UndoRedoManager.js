// Define action types for better type safety
export var ActionType;
(function (ActionType) {
    ActionType["ADD_ROW"] = "ADD_ROW";
    ActionType["REMOVE_ROW"] = "REMOVE_ROW";
    ActionType["ADD_TILE"] = "ADD_TILE";
    ActionType["REMOVE_TILE"] = "REMOVE_TILE";
    ActionType["MODIFY_TILE"] = "MODIFY_TILE";
    ActionType["MOVE_TILE"] = "MOVE_TILE";
    ActionType["BATCH"] = "BATCH"; // New type for grouped actions
})(ActionType || (ActionType = {}));
export class UndoRedoManager {
    constructor(pageId) {
        this.undoStack = [];
        this.redoStack = [];
        this.maxStackSize = 100;
        this.isUndoing = false;
        this.isRedoing = false;
        this.subscribers = [];
        this.batchActions = null;
        this.pageId = pageId;
        this.setupKeyboardShortcuts();
    }
    // ========================
    // Public API
    // ========================
    subscribe(callback) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(cb => cb !== callback);
        };
    }
    startBatch() {
        if (!this.batchActions) {
            this.batchActions = [];
        }
    }
    endBatch() {
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
    addRow(rowData) {
        const action = {
            type: ActionType.ADD_ROW,
            pageId: this.pageId,
            rowId: rowData.Id,
            data: rowData,
            timestamp: Date.now()
        };
        if (this.batchActions) {
            this.batchActions.push(action);
        }
        else {
            this.addToUndoStack(action);
        }
    }
    removeRow(rowId, rowData) {
        const action = {
            type: ActionType.REMOVE_ROW,
            pageId: this.pageId,
            rowId: rowId,
            data: rowData,
            timestamp: Date.now()
        };
        if (this.batchActions) {
            this.batchActions.push(action);
        }
        else {
            this.addToUndoStack(action);
        }
    }
    // Tile Actions
    addTile(rowId, tileData) {
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
        }
        else {
            this.addToUndoStack(action);
        }
    }
    removeTile(tileId, rowId, tileData) {
        var _a, _b;
        if (!rowId || !tileData) {
            const data = this.getPageData();
            (_b = (_a = data.PageMenuStructure) === null || _a === void 0 ? void 0 : _a.Rows) === null || _b === void 0 ? void 0 : _b.forEach((row) => {
                const tile = row.Tiles.find((t) => t.Id === tileId);
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
        }
        else {
            this.addToUndoStack(action);
        }
    }
    modifyTile(tileId, oldValues, newValues) {
        const action = {
            type: ActionType.MODIFY_TILE,
            pageId: this.pageId,
            tileId: tileId,
            data: { oldValues, newValues },
            timestamp: Date.now()
        };
        if (this.batchActions) {
            this.batchActions.push(action);
        }
        else {
            this.addToUndoStack(action);
        }
    }
    moveTile(sourceTileId, sourceRowId, targetRowId, targetIndex, originalIndex) {
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
        }
        else {
            this.addToUndoStack(action);
        }
    }
    canUndo() {
        return this.undoStack.length > 0;
    }
    canRedo() {
        return this.redoStack.length > 0;
    }
    undo() {
        if (!this.canUndo())
            return false;
        this.isUndoing = true;
        const action = this.undoStack.pop();
        try {
            if (action.type === ActionType.BATCH) {
                // Handle batch undo in reverse order
                const batchActions = action.data;
                for (let i = batchActions.length - 1; i >= 0; i--) {
                    this.applyAction(batchActions[i], true);
                }
            }
            else {
                this.applyAction(action, true);
            }
            this.redoStack.push(action);
            this.notifySubscribers(action);
            return true;
        }
        catch (error) {
            console.error("Undo failed:", error);
            this.undoStack.push(action); // Put it back if failed
            return false;
        }
        finally {
            this.isUndoing = false;
        }
    }
    redo() {
        if (!this.canRedo())
            return false;
        this.isRedoing = true;
        const action = this.redoStack.pop();
        try {
            if (action.type === ActionType.BATCH) {
                // Handle batch redo in original order
                const batchActions = action.data;
                batchActions.forEach(a => this.applyAction(a, false));
            }
            else {
                this.applyAction(action, false);
            }
            this.undoStack.push(action);
            this.notifySubscribers(action);
            return true;
        }
        catch (error) {
            console.error("Redo failed:", error);
            this.redoStack.push(action); // Put it back if failed
            return false;
        }
        finally {
            this.isRedoing = false;
        }
    }
    clearHistory() {
        this.undoStack = [];
        this.redoStack = [];
        this.notifySubscribers({
            type: ActionType.MODIFY_TILE,
            pageId: this.pageId,
            timestamp: Date.now()
        });
    }
    getStackSizes() {
        return {
            undoSize: this.undoStack.length,
            redoSize: this.redoStack.length
        };
    }
    // ========================
    // Private Methods
    // ========================
    addToUndoStack(action) {
        if (this.isUndoing || this.isRedoing)
            return;
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
    applyAction(action, isUndo) {
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
                this.applyTileChanges(data, action.tileId, values);
                break;
            case ActionType.MOVE_TILE:
                isUndo ? this.undoMoveTile(data, action) : this.redoMoveTile(data, action);
                break;
        }
        this.savePageData(data);
    }
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    this.undo();
                }
                else if ((e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                    e.preventDefault();
                    this.redo();
                }
            }
        });
    }
    shouldCoalesceWithLastAction(newAction) {
        if (this.undoStack.length === 0)
            return false;
        const lastAction = this.undoStack[this.undoStack.length - 1];
        return (newAction.type === ActionType.MODIFY_TILE &&
            lastAction.type === ActionType.MODIFY_TILE &&
            newAction.tileId === lastAction.tileId &&
            Date.now() - lastAction.timestamp < 1000 // 1s threshold
        );
    }
    getPageData() {
        return JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
    }
    savePageData(data) {
        localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
    }
    notifySubscribers(action) {
        this.subscribers.forEach(callback => callback(action));
    }
    // ========================
    // Action Implementations
    // ========================
    undoAddRow(data, action) {
        data.PageMenuStructure.Rows = data.PageMenuStructure.Rows.filter((row) => row.Id !== action.rowId);
    }
    redoAddRow(data, action) {
        if (!data.PageMenuStructure) {
            data.PageMenuStructure = { Rows: [] };
        }
        data.PageMenuStructure.Rows.push(action.data);
    }
    undoRemoveRow(data, action) {
        if (!data.PageMenuStructure) {
            data.PageMenuStructure = { Rows: [] };
        }
        data.PageMenuStructure.Rows.push(action.data);
    }
    redoRemoveRow(data, action) {
        data.PageMenuStructure.Rows = data.PageMenuStructure.Rows.filter((row) => row.Id !== action.rowId);
    }
    undoAddTile(data, action) {
        const row = data.PageMenuStructure.Rows.find((r) => r.Id === action.rowId);
        if (row) {
            row.Tiles = row.Tiles.filter((tile) => tile.Id !== action.tileId);
            if (row.Tiles.length === 0) {
                data.PageMenuStructure.Rows = data.PageMenuStructure.Rows.filter((r) => r.Id !== action.rowId);
            }
        }
    }
    redoAddTile(data, action) {
        let row = data.PageMenuStructure.Rows.find((r) => r.Id === action.rowId);
        if (!row) {
            row = { Id: action.rowId, Tiles: [] };
            data.PageMenuStructure.Rows.push(row);
        }
        row.Tiles.push(action.data);
        if (row.Tiles.length === 3) {
            row.Tiles.forEach((tile) => {
                tile.Align = "center";
            });
        }
    }
    undoRemoveTile(data, action) {
        let row = data.PageMenuStructure.Rows.find((r) => r.Id === action.rowId);
        if (!row) {
            row = { Id: action.rowId, Tiles: [] };
            data.PageMenuStructure.Rows.push(row);
        }
        row.Tiles.push(action.data);
    }
    redoRemoveTile(data, action) {
        const row = data.PageMenuStructure.Rows.find((r) => r.Id === action.rowId);
        if (row) {
            row.Tiles = row.Tiles.filter((tile) => tile.Id !== action.tileId);
            if (row.Tiles.length === 0) {
                data.PageMenuStructure.Rows = data.PageMenuStructure.Rows.filter((r) => r.Id !== action.rowId);
            }
        }
    }
    applyTileChanges(data, tileId, changes) {
        var _a, _b;
        (_b = (_a = data.PageMenuStructure) === null || _a === void 0 ? void 0 : _a.Rows) === null || _b === void 0 ? void 0 : _b.forEach((row) => {
            row.Tiles.forEach((tile) => {
                if (tile.Id === tileId) {
                    Object.keys(changes).forEach(key => {
                        if (key.includes(".")) {
                            const parts = key.split(".");
                            let current = tile;
                            for (let i = 0; i < parts.length - 1; i++) {
                                current = current[parts[i]];
                            }
                            current[parts[parts.length - 1]] = changes[key];
                        }
                        else {
                            tile[key] = changes[key];
                        }
                    });
                }
            });
        });
    }
    undoMoveTile(data, action) {
        const { sourceRowId, targetRowId, originalIndex } = action.data;
        const targetRow = data.PageMenuStructure.Rows.find((r) => r.Id === targetRowId);
        let sourceRow = data.PageMenuStructure.Rows.find((r) => r.Id === sourceRowId);
        if (targetRow) {
            const tileIndex = targetRow.Tiles.findIndex((t) => t.Id === action.tileId);
            if (tileIndex !== -1) {
                const [tileToMove] = targetRow.Tiles.splice(tileIndex, 1);
                if (!sourceRow) {
                    sourceRow = { Id: sourceRowId, Tiles: [] };
                    data.PageMenuStructure.Rows.push(sourceRow);
                }
                sourceRow.Tiles.splice(originalIndex, 0, tileToMove);
                if (sourceRow.Tiles.length === 3) {
                    sourceRow.Tiles.forEach((tile) => {
                        tile.Align = "center";
                    });
                }
                if (targetRow.Tiles.length === 0) {
                    data.PageMenuStructure.Rows = data.PageMenuStructure.Rows.filter((r) => r.Id !== targetRow.Id);
                }
            }
        }
    }
    redoMoveTile(data, action) {
        const { sourceRowId, targetRowId, targetIndex } = action.data;
        const sourceRow = data.PageMenuStructure.Rows.find((r) => r.Id === sourceRowId);
        let targetRow = data.PageMenuStructure.Rows.find((r) => r.Id === targetRowId);
        if (sourceRow) {
            const tileIndex = sourceRow.Tiles.findIndex((t) => t.Id === action.tileId);
            if (tileIndex !== -1) {
                const [tileToMove] = sourceRow.Tiles.splice(tileIndex, 1);
                if (!targetRow) {
                    targetRow = { Id: targetRowId, Tiles: [] };
                    data.PageMenuStructure.Rows.push(targetRow);
                }
                targetRow.Tiles.splice(targetIndex, 0, tileToMove);
                if (targetRow.Tiles.length === 3) {
                    targetRow.Tiles.forEach((tile) => {
                        tile.Align = "center";
                    });
                }
                if (sourceRow.Tiles.length === 0) {
                    data.PageMenuStructure.Rows = data.PageMenuStructure.Rows.filter((r) => r.Id !== sourceRow.Id);
                }
            }
        }
    }
}
//# sourceMappingURL=UndoRedoManager.js.map