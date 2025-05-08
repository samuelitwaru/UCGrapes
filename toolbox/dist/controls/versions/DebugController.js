var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ToolBoxService } from "../../services/ToolBoxService";
import { AppVersionManager } from "./AppVersionManager";
import { DebugUIManager } from "./DebugUIManager";
export class DebugController {
    constructor() {
        this.appVersions = new AppVersionManager();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const pageUrls = yield this.getUrls();
            this.debugProcess(pageUrls);
        });
    }
    debugProcess(pageUrls) {
        return __awaiter(this, void 0, void 0, function* () {
            let results;
            try {
                const toolBoxService = new ToolBoxService();
                const response = yield toolBoxService.debugApp(pageUrls);
                if (response) {
                    results = response.DebugResults;
                }
            }
            catch (error) {
                console.error(error);
            }
            finally {
                this.displayResults(results);
            }
        });
    }
    getUrls() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            let pageUrls = [];
            const activeVersion = yield this.appVersions.getUpdatedActiveVersion();
            const pages = activeVersion === null || activeVersion === void 0 ? void 0 : activeVersion.Pages;
            for (const page of pages) {
                let urls = [];
                // Process tiles (menu structure)
                const rows = (_a = page.PageMenuStructure) === null || _a === void 0 ? void 0 : _a.Rows;
                if (rows) {
                    for (const row of rows) {
                        const tiles = row.Tiles;
                        if (tiles) {
                            for (const tile of tiles) {
                                if ((_b = tile.Action) === null || _b === void 0 ? void 0 : _b.ObjectUrl) {
                                    urls.push({ url: tile.Action.ObjectUrl, affectedType: "Tile", affectedName: tile.Name || "Unnamed Tile" });
                                }
                                if (tile.BGImageUrl) {
                                    urls.push({ url: tile.BGImageUrl, affectedType: "Tile", affectedName: tile.Name || "Unnamed Tile" });
                                }
                            }
                        }
                    }
                }
                // Process content items
                const content = (_c = page.PageInfoStructure) === null || _c === void 0 ? void 0 : _c.InfoContent;
                if (content) {
                    for (const item of content) {
                        if (item.InfoType === "Image" && item.InfoValue) {
                            urls.push({ url: item.InfoValue, affectedType: "Content", affectedName: item.InfoType || "Unnamed Content" });
                        }
                        if (item.InfoType === "Cta" && item.CtaAttributes) {
                            urls.push({ url: (_d = item.CtaAttributes) === null || _d === void 0 ? void 0 : _d.CtaButtonImgUrl, affectedType: "Cta", affectedName: item.InfoType || "Unnamed Cta" });
                            if (((_e = item.CtaAttributes) === null || _e === void 0 ? void 0 : _e.CtaType) === "WebLink" || ((_f = item.CtaAttributes) === null || _f === void 0 ? void 0 : _f.CtaType) === "Form") {
                                urls.push({ url: (_g = item.CtaAttributes) === null || _g === void 0 ? void 0 : _g.CtaAction, affectedType: "Cta", affectedName: item.InfoType || "Unnamed Cta" });
                            }
                        }
                        if (item.InfoType === "TileRow" && item.Tiles) {
                            (_h = item.Tiles) === null || _h === void 0 ? void 0 : _h.forEach((tile) => {
                                var _a;
                                if ((_a = tile.Action) === null || _a === void 0 ? void 0 : _a.ObjectUrl) {
                                    urls.push({ url: tile.Action.ObjectUrl, affectedType: "Tile", affectedName: tile.Name || "Unnamed Tile" });
                                }
                                if (tile.BGImageUrl) {
                                    urls.push({ url: tile.BGImageUrl, affectedType: "Tile", affectedName: tile.Name || "Unnamed Tile" });
                                }
                            });
                        }
                    }
                }
                // Only add the page if it has URLs
                if (urls.length > 0) {
                    pageUrls.push({ page: page.PageName || `Page-${pages.indexOf(page) + 1}`, urls });
                }
            }
            return pageUrls;
        });
    }
    displayResults(results) {
        const debugUIManager = new DebugUIManager(results);
        const debugDiv = document.getElementById("tb-debugging");
        if (debugDiv) {
            debugDiv.innerHTML = "";
            debugDiv.appendChild(debugUIManager.buildDebugUI());
        }
    }
}
//# sourceMappingURL=DebugController.js.map