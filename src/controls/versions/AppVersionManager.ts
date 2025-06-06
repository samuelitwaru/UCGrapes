import { version } from "d3";
import { AppConfig } from "../../AppConfig";
import { ToolBoxService } from "../../services/ToolBoxService";
import { TileMapper } from "../editor/TileMapper";
import { AppVersionController } from "./AppVersionController";

export class AppVersionManager {
  private config: AppConfig;
  toolboxService: any;
  themes: any[] = [];
  appVersion: any = (globalThis as any).activeVersion;

  constructor() {
    this.config = AppConfig.getInstance();
  }

  // public async getActiveVersion() {
  //   const toolboxService = new ToolBoxService(); // No need to reassign `this.toolboxService`
  //   console.log("AppVersionManager: getActiveVersion called");
  //   const appVersion = await toolboxService.getVersion();
  //   const versions = await toolboxService.getVersions();
    
  //   (globalThis as any).activeVersion = 
  //   appVersion.AppVersion
  //   // versions?.AppVersions?.find((version: any) => version.IsActive) || null

  //   return (globalThis as any).activeVersion;
  // }

  public async getCurrentVersion() {
    const versionController = new AppVersionController();
    const toolboxService = new ToolBoxService();
    const versions = await versionController.getVersions();
    const location = await toolboxService.getLocationData();
    const cureentPublishedAppId = location.BC_Trn_Location.PublishedActiveAppVersionId;
    console.log(location);
    console.log(versions);
    console.log(cureentPublishedAppId);
    return versions.find((version: any) => version.AppVersionId == cureentPublishedAppId);
    
  }

  public async getActiveVersion() {
    (globalThis as any).activeVersion = (window as any).app.currentVersion;
    return (globalThis as any).activeVersion;
  }

  public async getUpdatedActiveVersion() {  
    const toolboxService = new ToolBoxService(); //  
    const appVersion = await toolboxService.getVersion();
    (globalThis as any).activeVersion = appVersion.AppVersion
    return (globalThis as any).activeVersion;
  }

  public async refreshVersion() {
    const toolboxService = new ToolBoxService(); //
    const appVersion = await toolboxService.getVersion();
    (globalThis as any).activeVersion = appVersion.AppVersion
  }

  public getPages() {
    return (globalThis as any).activeVersion?.Pages || null;
  }

  public async preDefinedPages() {
    const res = this.getPages() || [];
    const pages = res.filter(
      (page: any) =>
        page.PageType == "Maps" ||
        page.PageType == "Map" ||
        page.PageType == "MyActivity" ||
        (page.PageType == "Calendar" && page.PageName !== "Home")
    );
    return pages;
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

    const pageData = {
      AppVersionId: await this.getActiveVersionId(),
      PageId: pageId,
      PageName: pageTitle,
    };
    const res = await toolboxService.updatePageTitle(pageData);
    if (res) {
      const data = localStorage.getItem(`data-${pageId}`);
      if (data) {
        const page = JSON.parse(data);
        page.PageName = pageTitle;
        localStorage.setItem(`data-${pageId}`, JSON.stringify(page)); 
        this.refreshVersion();       
      }
    }

    this.refreshVersion();
    // await toolboxService.updatePageTitle(pageId, pageTitle);
  }
}
