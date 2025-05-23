import { AppConfig } from "../../AppConfig";
import { ToolBoxService } from "../../services/ToolBoxService";

export class ActionListManager {
    categoryData: any[] = [];
    private config: AppConfig;
    selectedObject: any;
    pages: any[] = [];
    forms: any[] = [];

    constructor() {
        this.config = AppConfig.getInstance();
    }

    setForms () {
        this.forms = (window as any).app.forms;
    }

    setPages () {
        const toolboxService = new ToolBoxService();
        toolboxService.getPages().then((pages) => {
            this.pages = pages;
        })
    }
}