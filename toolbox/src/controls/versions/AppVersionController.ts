import { ToolBoxService } from "../../services/ToolBoxService";

export class AppVersionController {
    toolboxService: any;

    constructor() {
        this.toolboxService = new ToolBoxService();
    } 
    
}