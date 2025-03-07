import { ToolboxManager } from './controls/toolbox/ToolboxManager';
class ToolboxApp {
    constructor() {
        this.toolboxManager = new ToolboxManager();
        this.initialise();
    }
    initialise() {
        this.toolboxManager.setUpNavBar();
        this.toolboxManager.setUpSideBar();
    }
}
export default ToolboxApp;
//# sourceMappingURL=app.js.map