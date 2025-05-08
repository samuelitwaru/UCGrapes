import { AppConfig } from "../../AppConfig";
import { ToolBoxService } from "../../services/ToolBoxService";
export class ActionListManager {
    constructor() {
        this.categoryData = [];
        this.pages = [];
        this.forms = [];
        this.config = AppConfig.getInstance();
    }
    setForms() {
        this.forms = this.config.forms;
    }
    setPages() {
        const toolboxService = new ToolBoxService();
        toolboxService.getPages().then((pages) => {
            this.pages = pages;
        });
    }
}
//# sourceMappingURL=ActionListManager.js.map