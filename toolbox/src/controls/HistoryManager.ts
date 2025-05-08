export class HistoryManager {
    history: any[];
    currentIndex: number;
    limit: number;
    constructor(initialState: any) {
        this.history = [JSON.parse(JSON.stringify(initialState))];
        this.currentIndex = 0;
        this.limit = 50; 
    }
    
    get currentState() {
        return this.history[this.currentIndex];
    }
    
    addState(newState: any) {
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }
        
        // Add new state
        this.history.push(JSON.parse(JSON.stringify(newState)));
        
        // Enforce history limit
        if (this.history.length > this.limit) {
            this.history.shift();
        } else {
            this.currentIndex++;
        }
        
        return this.currentState;
    }

    canUndo() {
        return this.currentIndex > 0;
    }

    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }

    undo() {
        if (this.canUndo()) {
            this.currentIndex--;
            return this.currentState;
        }
        return null;
    }

    redo() {
        if (this.canRedo()) {
            this.currentIndex++;
            return this.currentState;
        }
        return null;
    }
    
    getHistoryStatus() {
        return `History: ${this.currentIndex + 1}/${this.history.length}`;
    }
}