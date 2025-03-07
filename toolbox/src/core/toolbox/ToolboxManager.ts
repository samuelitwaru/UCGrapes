import { ToolboxStructure } from "../../ui/ToolboxStructure.js";

class ToolboxManager {
    init() {
        const toolboxStructure = new ToolboxStructure();
        toolboxStructure.getNavBarButtons();
    }
}