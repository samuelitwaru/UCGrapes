import { AppConfig } from "../../AppConfig";
import { ToolBoxService } from "../../services/ToolBoxService";
import { TileMapper } from "../editor/TileMapper";

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

    async updatePageTitle (pageTitle: string) {
        const pageId = (globalThis as any).currentPageId;
        const selectedTile = (globalThis as any).tileMapper;
        const selectedComponent = (globalThis as any).selectedComponent

        if (!pageId) return; 

        const tileMapper = new TileMapper(pageId)
        const toolboxService = new ToolBoxService(); 

        if (selectedComponent && selectedTile) {
            const tileId = selectedComponent.parent().getId();
            const tileTitle = selectedComponent.find('.tile-title')[0];
            if (!tileTitle) return;
            tileTitle.setAttributes({ title: pageTitle });
            tileTitle.empty();
            tileTitle.append(pageTitle, { at: 0 });
        }
        
        // await toolboxService.updatePageTitle(pageId, pageTitle);
    }
}