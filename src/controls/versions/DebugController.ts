import { ToolBoxService } from "../../services/ToolBoxService";
import { DebugResults, Image, InfoType, Tile } from "../../types";
import { AppVersionManager } from "./AppVersionManager";
import { DebugUIManager } from "./DebugUIManager";

export class DebugController {
    appVersions: AppVersionManager;
    constructor() {
        this.appVersions = new AppVersionManager();
    }

    async init() {
        const pageUrls: { page: string; urls: { url: string; affectedType: string; affectedName?: string }[] }[] = await this.getUrls();
        console.log("Page URLs to debug:", pageUrls);
        this.debugProcess(pageUrls);
    }

    private async debugProcess(pageUrls: any) {
        let results;
        try {
            const toolBoxService = new ToolBoxService();
            const response = await toolBoxService.debugApp(pageUrls);
            if (response) {                
                results = response.DebugResults;
            }
        } catch (error) {
            console.error(error);
        } finally {
            this.displayResults(results);
        }
    }

    private async getUrls() {
        let pageUrls: { page: string; urls: { url: string; affectedType: string; affectedName?: string }[] }[] = [];

        const activeVersion = await this.appVersions.getUpdatedActiveVersion();
        const pages = activeVersion?.Pages;

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
            const content = page.PageInfoStructure?.InfoContent;
            if (content) {
                for (const item of content as InfoType[]) {
                    if (item.InfoType === "Image" && item.Images) {
                        const images = item.Images;
                        for (const image of images as Image[]) {
                            urls.push({ url: image.InfoImageValue || "", affectedType: "Content", affectedName: item.InfoType || "Unnamed Content" });
                        }                        
                    } 
                    if (item.InfoType === "Cta" && item.CtaAttributes && item.CtaAttributes?.CtaButtonImgUrl) {
                        urls.push({ url: item.CtaAttributes?.CtaButtonImgUrl, affectedType: "Cta", affectedName: item.InfoType || "Unnamed Cta" });
                        if (item.CtaAttributes?.CtaAction && (item.CtaAttributes?.CtaType === "WebLink" || item.CtaAttributes?.CtaType === "Form")) {
                            urls.push({ url: item.CtaAttributes?.CtaAction, affectedType: "Cta", affectedName: item.InfoType || "Unnamed Cta" });                            
                        }
                    } 
                    if (item.InfoType === "TileRow" && item.Tiles) {
                        item.Tiles?.forEach((tile: Tile) => {
                            if (tile.Action?.ObjectUrl) {
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