export class EditActions {
    constructor() {
        this.container = document.createElement('div');
        this.undoButton = document.createElement("button");
        this.redoButton = document.createElement("button");
        this.init();
    }
    init() {
        this.container.classList.add("edit-actions");
        this.undoButton.id = "undo";
        this.undoButton.className = "btn-transparent";
        this.undoButton.title = "Undo (ctrl+z)";
        this.undoButton.innerHTML = "<span class='fa fa-undo'></span>";
        this.undoButton.addEventListener("click", this.handleUndo);
        this.redoButton.id = "redo";
        this.redoButton.className = "btn-transparent";
        this.redoButton.title = "Redo (ctrl+shift+z)";
        this.redoButton.innerHTML = "<span class='fa fa-redo'></span>";
        this.redoButton.addEventListener("click", this.handleRedo);
        this.container.appendChild(this.undoButton);
        this.container.appendChild(this.redoButton);
    }
    handleUndo() {
        console.log("Undo action triggered");
    }
    handleRedo() {
        console.log("Redo action triggered");
    }
    render(container) {
        container.appendChild(this.container);
    }
}
// Usage
//# sourceMappingURL=EditActions.js.map