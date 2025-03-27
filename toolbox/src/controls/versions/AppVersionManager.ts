import { AppConfig } from "../../AppConfig";
import { ToolBoxService } from "../../services/ToolBoxService";

export class AppVersionManager {
    private config: AppConfig;
    toolboxService: any;
    themes: any[] = [];

    constructor() {
    this.config = AppConfig.getInstance();
    }

    public async getActiveVersion() {
        const toolboxService = new ToolBoxService(); // No need to reassign `this.toolboxService`
        const versions = await toolboxService.getVersions();       
        return versions?.AppVersions?.find((version: any) => version.IsActive) || null;
    } 
    
    async getActiveVersionId() {
        const activeVersion = await this.getActiveVersion();
        return activeVersion.AppVersionId;
    }
}