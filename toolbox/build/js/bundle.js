// Content from /ui/ToolboxStructure.js
export class ToolboxStructure {
    constructor() {
        this._navBarButtons = document.getElementById("navbar-buttons");
    }
    getNavBarButtons() {
        return this._navBarButtons;
    }
}
//# sourceMappingURL=ToolboxStructure.js.map

// Content from /core/toolbox/ToolboxManager.js
// import { ToolboxStructure } from "../../ui/ToolboxStructure.js";
class ToolboxManager {
    init() {
        const toolboxStructure = new ToolboxStructure();
        toolboxStructure.getNavBarButtons();
    }
}
//# sourceMappingURL=ToolboxManager.js.map

