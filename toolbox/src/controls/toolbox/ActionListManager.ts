import { AppConfig } from "../../AppConfig";
import { Form } from "../../models/Form";
import { Page } from "../../models/Page";
import { ToolBoxService } from "../../services/ToolBoxService";

export class ActionListManager {
    categoryData: any[] = [];
    private config: AppConfig;
    selectedObject: any;
    pages: Page[] = [];
    forms: Form[] = [];

    constructor() {
        this.config = AppConfig.getInstance();
    }

    setForms () {
        this.forms = this.config.forms;
    }

    setPages () {
        const toolboxService = new ToolBoxService();
        toolboxService.getPages().then((pages) => {
            this.pages = pages;
        })
    }
}