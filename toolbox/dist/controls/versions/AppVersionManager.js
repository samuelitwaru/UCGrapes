var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { AppConfig } from "../../AppConfig";
import { ToolBoxService } from "../../services/ToolBoxService";
export class AppVersionManager {
    constructor() {
        this.themes = [];
        this.appVersion = globalThis.activeVersion;
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
    getActiveVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            globalThis.activeVersion = window.app.currentVersion;
            console.log(globalThis.activeVersion);
            return globalThis.activeVersion;
        });
    }
    getUpdatedActiveVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            const toolboxService = new ToolBoxService(); //  
            const appVersion = yield toolboxService.getVersion();
            globalThis.activeVersion = appVersion.AppVersion;
            return globalThis.activeVersion;
        });
    }
    getPages() {
        var _a;
        return ((_a = globalThis.activeVersion) === null || _a === void 0 ? void 0 : _a.Pages) || null;
    }
    preDefinedPages() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = this.getPages() || [];
            const pages = res.filter((page) => page.PageType == "Maps" ||
                page.PageType == "Map" ||
                page.PageType == "MyActivity" ||
                (page.PageType == "Calendar" && page.PageName !== "Home"));
            return pages;
        });
    }
    getActiveVersionId() {
        return __awaiter(this, void 0, void 0, function* () {
            const activeVersion = window.app.currentVersion;
            return activeVersion.AppVersionId;
        });
    }
    updatePageTitle(pageTitle) {
        return __awaiter(this, void 0, void 0, function* () {
            const pageId = globalThis.currentPageId;
            const selectedTileMapper = globalThis.tileMapper;
            const selectedComponent = globalThis.selectedComponent;
            if (!pageId)
                return;
            const toolboxService = new ToolBoxService();
            const pageData = {
                AppVersionId: yield this.getActiveVersionId(),
                PageId: pageId,
                PageName: pageTitle,
            };
            const res = yield toolboxService.updatePageTitle(pageData);
            if (res) {
                const data = localStorage.getItem(`data-${pageId}`);
                if (data) {
                    const page = JSON.parse(data);
                    page.PageName = pageTitle;
                    localStorage.setItem(`data-${pageId}`, JSON.stringify(page));
                }
            }
            // await toolboxService.updatePageTitle(pageId, pageTitle);
        });
    }
}
//# sourceMappingURL=AppVersionManager.js.map