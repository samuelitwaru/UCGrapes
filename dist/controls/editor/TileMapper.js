export class TileMapper {
    constructor(pageId) {
        this.history = [];
        this.future = [];
        this.maxHistory = 20;
        this.pageId = pageId;
        const initialData = localStorage.getItem(`data-${this.pageId}`);
        if (initialData) {
            try {
                // Save initial state to reference
                const parsedData = JSON.parse(initialData);
                this.history.push(parsedData);
            }
            catch (e) {
                console.error("Failed to parse initial data:", e);
            }
        }
    }
    saveState() {
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
        }
        catch (e) {
            console.error("Error saving state:", e);
            return false;
        }
    }
    undo() {
        if (this.history.length === 0)
            return null;
        // 1. Save current state to future stack
        const currentState = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        this.future.push(currentState);
        // 2. Get the previous state from history
        const previousState = this.history.pop();
        localStorage.setItem(`data-${this.pageId}`, JSON.stringify(previousState));
        // 3. Compare and find changed tiles/rows
        return this.findChanges(currentState, previousState);
    }
    redo() {
        if (this.future.length === 0)
            return null;
        // 1. Save current state to history
        const currentState = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        this.history.push(currentState);
        // 2. Get the next state from future
        const nextState = this.future.pop();
        localStorage.setItem(`data-${this.pageId}`, JSON.stringify(nextState));
        // 3. Compare and find changed tiles/rows
        return this.findChanges(currentState, nextState);
    }
    findChanges(oldState, newState) {
        var _a, _b;
        const affectedTiles = new Set();
        const affectedRows = new Set();
        const oldRows = ((_a = oldState.PageMenuStructure) === null || _a === void 0 ? void 0 : _a.Rows) || [];
        const newRows = ((_b = newState.PageMenuStructure) === null || _b === void 0 ? void 0 : _b.Rows) || [];
        // Check for added/removed rows
        const oldRowIds = new Set(oldRows.map((r) => r.Id));
        const newRowIds = new Set(newRows.map((r) => r.Id));
        // Find modified or deleted rows
        oldRows.forEach((oldRow) => {
            const newRow = newRows.find((r) => r.Id === oldRow.Id);
            if (!newRow) {
                affectedRows.add(oldRow.Id); // Row was deleted
            }
            else if (JSON.stringify(oldRow) !== JSON.stringify(newRow)) {
                affectedRows.add(oldRow.Id); // Row was modified
            }
        });
        // Find added rows
        newRows.forEach((newRow) => {
            if (!oldRowIds.has(newRow.Id)) {
                affectedRows.add(newRow.Id); // Row was added
            }
        });
        // Find modified tiles
        oldRows.forEach((oldRow) => {
            var _a, _b, _c, _d;
            const newRow = newRows.find((r) => r.Id === oldRow.Id);
            if (newRow) {
                const oldTileIds = new Set(((_a = oldRow.Tiles) === null || _a === void 0 ? void 0 : _a.map((t) => t.Id)) || []);
                const newTileIds = new Set(((_b = newRow.Tiles) === null || _b === void 0 ? void 0 : _b.map((t) => t.Id)) || []);
                // Check for added/removed tiles
                (_c = oldRow.Tiles) === null || _c === void 0 ? void 0 : _c.forEach((oldTile) => {
                    if (!newTileIds.has(oldTile.Id)) {
                        affectedTiles.add(oldTile.Id); // Tile was removed
                    }
                });
                (_d = newRow.Tiles) === null || _d === void 0 ? void 0 : _d.forEach((newTile) => {
                    if (!oldTileIds.has(newTile.Id)) {
                        affectedTiles.add(newTile.Id); // Tile was added
                    }
                    else {
                        const oldTile = oldRow.Tiles.find((t) => t.Id === newTile.Id);
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
    addFreshRow(rowId, tileId) {
        var _a, _b;
        this.saveState();
        const data = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
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
                },
            ],
        };
        (_b = (_a = data.PageMenuStructure) === null || _a === void 0 ? void 0 : _a.Rows) === null || _b === void 0 ? void 0 : _b.push(newRow);
        localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
    }
    addTile(rowId, tileId) {
        var _a, _b;
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
        };
        const data = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        const row = (_b = (_a = data.PageMenuStructure) === null || _a === void 0 ? void 0 : _a.Rows) === null || _b === void 0 ? void 0 : _b.find((r) => r.Id === rowId);
        if (row) {
            row.Tiles.push(newTile);
            localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
        }
    }
    removeTile(tileId, rowId) {
        var _a, _b;
        this.saveState();
        const data = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        const row = data.PageMenuStructure.Rows.find((r) => String(r.Id) === String(rowId));
        if (row) {
            row.Tiles = row.Tiles.filter((t) => t.Id !== tileId);
            if (row.Tiles.length === 0) {
                data.PageMenuStructure.Rows = (_b = (_a = data.PageMenuStructure) === null || _a === void 0 ? void 0 : _a.Rows) === null || _b === void 0 ? void 0 : _b.filter((r) => r.Id !== row.Id);
            }
            localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
        }
    }
    updateTile(tileId, attribute, value) {
        var _a, _b;
        this.saveState();
        const data = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        (_b = (_a = data === null || data === void 0 ? void 0 : data.PageMenuStructure) === null || _a === void 0 ? void 0 : _a.Rows) === null || _b === void 0 ? void 0 : _b.forEach((row) => {
            row.Tiles.forEach((tile) => {
                if (tile.Id === tileId) {
                    if (attribute.includes(".")) {
                        const parts = attribute.split(".");
                        let current = tile;
                        for (let i = 0; i < parts.length - 1; i++) {
                            current = current[parts[i]];
                        }
                        current[parts[parts.length - 1]] = value;
                    }
                    else {
                        tile[attribute] = value;
                    }
                }
            });
        });
        localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
    }
    getTile(rowId, tileId) {
        var _a, _b;
        const data = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        let tile = null;
        // if current page is Information type
        if (data.PageType === "Information") {
            data.PageInfoStructure.InfoContent
                .filter((content) => content.InfoType == "TileRow")
                .forEach((content) => {
                tile = content.Tiles.find((t) => t.Id === tileId);
                // return tile || null;
            });
            return tile;
        }
        // if current page is Menu type
        else if (data.PageType === "Menu") {
            if (rowId) {
                const row = (_b = (_a = data === null || data === void 0 ? void 0 : data.PageMenuStructure) === null || _a === void 0 ? void 0 : _a.Rows) === null || _b === void 0 ? void 0 : _b.find((r) => r.Id === rowId);
                if (row) {
                    tile = row.Tiles.find((t) => t.Id === tileId);
                    return tile || null;
                }
            }
        }
        return tile;
    }
    moveTile(sourceTileId, sourceRowId, targetRowId, targetIndex) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        this.saveState();
        const data = JSON.parse(localStorage.getItem(`data-${this.pageId}`) || "{}");
        const sourceRow = (_a = data === null || data === void 0 ? void 0 : data.PageMenuStructure) === null || _a === void 0 ? void 0 : _a.Rows.find((r) => r.Id === sourceRowId);
        if (!sourceRow)
            return;
        const sourceTileIndex = (_b = sourceRow === null || sourceRow === void 0 ? void 0 : sourceRow.Tiles) === null || _b === void 0 ? void 0 : _b.findIndex((t) => t.Id === sourceTileId);
        if (sourceTileIndex === -1)
            return;
        const [tileToMove] = (_c = sourceRow === null || sourceRow === void 0 ? void 0 : sourceRow.Tiles) === null || _c === void 0 ? void 0 : _c.splice(sourceTileIndex, 1);
        const targetRow = (_e = (_d = data.PageMenuStructure) === null || _d === void 0 ? void 0 : _d.Rows) === null || _e === void 0 ? void 0 : _e.find((r) => r.Id === targetRowId);
        if (!targetRow) {
            sourceRow.Tiles.splice(sourceTileIndex, 0, tileToMove);
            return;
        }
        targetRow.Tiles.splice(targetIndex, 0, tileToMove);
        if (((_f = targetRow === null || targetRow === void 0 ? void 0 : targetRow.Tiles) === null || _f === void 0 ? void 0 : _f.length) === 3) {
            targetRow === null || targetRow === void 0 ? void 0 : targetRow.Tiles.forEach((tile) => {
                tile.Align = "center";
            });
        }
        if (((_g = sourceRow === null || sourceRow === void 0 ? void 0 : sourceRow.Tiles) === null || _g === void 0 ? void 0 : _g.length) === 0) {
            data.PageMenuStructure.Rows = (_h = data === null || data === void 0 ? void 0 : data.PageMenuStructure) === null || _h === void 0 ? void 0 : _h.Rows.filter((r) => r.Id !== sourceRow.Id);
        }
        localStorage.setItem(`data-${this.pageId}`, JSON.stringify(data));
    }
}
//# sourceMappingURL=TileMapper.js.map