export class ToolboxStructure {
    private _navBarButtons: HTMLElement;
    
    constructor() {
        this._navBarButtons = document.getElementById("navbar-buttons") as HTMLElement;
    }

    public getNavBarButtons(): HTMLElement {
        return this._navBarButtons;
    }
}