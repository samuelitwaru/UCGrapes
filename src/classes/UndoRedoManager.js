class UndoRedoManager {
    constructor(editor) {
        this.editor = editor;
        this.undoStack = [];
        this.redoStack = [];
        this.currentState = null;
        
        // Capture initial state
        this.captureState();
        
        // Bind event listeners
        this.bindEditorEvents();
    }

    bindEditorEvents() {
        // Capture state on significant changes
        this.editor.on('component:add', () => this.captureState());
        this.editor.on('component:remove', () => this.captureState());
        this.editor.on('component:update', () => this.captureState());
        this.editor.on('style:update', () => this.captureState());
    }

    captureState() {
        // Get current project data
        const currentState = this.editor.getProjectData();

        // Prevent duplicate state captures
        if (this.areStatesEqual(currentState, this.currentState)) return;

        // Clear redo stack when a new action is performed
        this.redoStack = [];

        // Add to undo stack
        this.undoStack.push(currentState);
        
        // Limit undo stack size
        if (this.undoStack.length > 50) {
            this.undoStack.shift();
        }

        // Update current state
        this.currentState = currentState;
    }

    undo() {
        if (this.undoStack.length <= 1) return;

        // Remove current state
        const currentState = this.undoStack.pop();
        
        // Add to redo stack
        this.redoStack.push(currentState);

        // Restore previous state
        const previousState = this.undoStack[this.undoStack.length - 1];
        this.restoreState(previousState);
    }

    redo() {
        if (this.redoStack.length === 0) return;

        // Get state from redo stack
        const stateToRedo = this.redoStack.pop();
        
        // Add to undo stack
        this.undoStack.push(stateToRedo);

        // Restore redo state
        this.restoreState(stateToRedo);
    }

    restoreState(state) {
        // Clear existing components
        this.editor.DomComponents.clear();
        
        // Load project data
        this.editor.loadProjectData(state);
        
        // Update current state
        this.currentState = state;
    }

    areStatesEqual(state1, state2) {
        if (state1 === state2) return true;
        if (!state1 || !state2) return false;
    
        // Recursive deep equality check
        const deepEqual = (obj1, obj2) => {
            // Check for strict equality first
            if (obj1 === obj2) return true;
    
            // Check types and handle null/undefined
            if (obj1 === null || obj2 === null || 
                typeof obj1 !== typeof obj2) {
                return false;
            }
    
            // Handle arrays
            if (Array.isArray(obj1) && Array.isArray(obj2)) {
                if (obj1.length !== obj2.length) return false;
                return obj1.every((item, index) => deepEqual(item, obj2[index]));
            }
    
            // Handle objects
            if (typeof obj1 === 'object') {
                const keys1 = Object.keys(obj1);
                const keys2 = Object.keys(obj2);
    
                if (keys1.length !== keys2.length) return false;
    
                return keys1.every(key => 
                    keys2.includes(key) && deepEqual(obj1[key], obj2[key])
                );
            }
    
            // For primitive values
            return obj1 === obj2;
        };
    
        return deepEqual(state1, state2);
    }
    

    canUndo() {
        // Can undo if more than one state in stack
        return this.undoStack.length > 1;
    }

    canRedo() {
        // Can redo if redo stack is not empty
        return this.redoStack.length > 0;
    }
}