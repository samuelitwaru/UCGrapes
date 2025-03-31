import { DebugResults } from "../../interfaces/DebugResults";
import { ToolBoxService } from "../../services/ToolBoxService";
import { AppVersionManager } from "./AppVersionManager";
import { DebugUIManager } from "./DebugUIManager";

export class DebugController {
    appVersions: AppVersionManager;
    constructor() {
        this.appVersions = new AppVersionManager();
    }

    async init() {
        const pageUrls: { page: string; urls: { url: string; affectedType: string; affectedName?: string }[] }[] = await this.getUrls();
        this.debugProcess(pageUrls);
    }

    private async debugProcess(pageUrls: any) {
        let results;
        try {
            const toolBoxService = new ToolBoxService();
            const response = await toolBoxService.debugApp(pageUrls);
            if (response) {                
                results = response.DebugResults;
                console.log("DebugController results", response);
            }
        } catch (error) {
            console.error(error);
        } finally {
            this.displayResults(results);
        }
    }

    private async getUrls() {
        let pageUrls: { page: string; urls: { url: string; affectedType: string; affectedName?: string }[] }[] = [];

        const activeVersion = await this.appVersions.getActiveVersion();
        const pages = activeVersion.Pages;

        for (const page of pages) {
            let urls: { url: string; affectedType: string; affectedName?: string }[] = [];

            // Process tiles (menu structure)
            const rows = page.PageMenuStructure?.Rows;
            if (rows) {
                for (const row of rows) {
                    const tiles = row.Tiles;
                    if (tiles) {
                        for (const tile of tiles) {
                            if (tile.Action?.ObjectUrl) {
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
            const content = page.PageContentStructure?.Content;
            if (content) {
                for (const item of content) {
                    if (item.ContentType === "Image" && item.ContentValue) {
                        urls.push({ url: item.ContentValue, affectedType: "Content", affectedName: item.ContentType || "Unnamed Content" });
                    }
                }
            }

            // Process call-to-action (CTA) buttons
            const ctas = page.PageContentStructure?.Cta;
            if (ctas) {
                for (const cta of ctas) {
                    if (cta.CtaButtonImgUrl) {
                        urls.push({ url: cta.CtaButtonImgUrl, affectedType: "Cta", affectedName: cta.CtaLabel || "Unnamed CTA" });
                    }

                    if (cta.CtaType == "SiteUrl" && cta.CtaAction) {
                        urls.push({ url: cta.CtaAction, affectedType: "Cta", affectedName: cta.CtaLabel || "Unnamed CTA" });
                    }

                    if (cta.CtaType == "Form" && cta.CtaAction) {
                        urls.push({ url: cta.CtaAction, affectedType: "Cta", affectedName: cta.CtaLabel || "Unnamed CTA" });
                    }
                }
            }

            // Only add the page if it has URLs
            if (urls.length > 0) {
                pageUrls.push({ page: page.PageName || `Page-${pages.indexOf(page) + 1}`, urls });
            }
        }

        return pageUrls;
    }

    displayResults(results: DebugResults) {
        const debugUIManager = new DebugUIManager(results);
        const debugDiv = document.getElementById("tb-debugging");
        if (debugDiv) {
            debugDiv.innerHTML = "";
            debugDiv.appendChild(debugUIManager.buildDebugUI());
        }
    }
}