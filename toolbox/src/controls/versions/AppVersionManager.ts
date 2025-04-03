import { AppConfig } from "../../AppConfig";
import { ToolBoxService } from "../../services/ToolBoxService";
import { TileMapper } from "../editor/TileMapper";

export class AppVersionManager {
  private config: AppConfig;
  toolboxService: any;
  themes: any[] = [];
  appVersion: any = (globalThis as any).activeVersion;

  constructor() {
    this.config = AppConfig.getInstance();
  }

  public async getActiveVersion() {
    const toolboxService = new ToolBoxService(); // No need to reassign `this.toolboxService`
    const versions = await toolboxService.getVersions();
    (globalThis as any).activeVersion = versions?.AppVersions?.find((version: any) => version.IsActive) || null
    return (globalThis as any).activeVersion;
  }

  public getPages() {
    return (
      (globalThis as any).activeVersion?.Pages || null
    );
  }

  async getActiveVersionId() {
    const activeVersion = (globalThis as any).activeVersion;
    return activeVersion.AppVersionId;
  }

  async updatePageTitle(pageTitle: string) {
    const pageId = (globalThis as any).currentPageId;
    const selectedTileMapper = (globalThis as any).tileMapper;
    const selectedComponent = (globalThis as any).selectedComponent;

    if (!pageId) return;

    const toolboxService = new ToolBoxService();

    if (selectedComponent && selectedTileMapper) {
      const tileId = selectedComponent.parent().getId();
      const tileTitle = selectedComponent.find(".tile-title")[0];
      if (!tileTitle) return;
      tileTitle.setAttributes({ title: pageTitle });
      tileTitle.empty();
      tileTitle.append(pageTitle, { at: 0 });

      const pageData = {
        AppVersionId: await this.getActiveVersionId(),
        PageId: pageId,
        PageName: pageTitle,
      };
      await toolboxService.updatePageTitle(pageData);
      selectedTileMapper.updateTile(tileId, 'Name', pageTitle);
      selectedTileMapper.updateTile(tileId, 'Text', pageTitle);
    }

    // await toolboxService.updatePageTitle(pageId, pageTitle);
  }
}
