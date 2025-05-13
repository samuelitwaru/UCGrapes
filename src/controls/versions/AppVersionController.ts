import { baseURL, ToolBoxService } from "../../services/ToolBoxService";
import { AppVersion } from "../../types";
import { Alert } from "../../ui/components/Alert";
import { Modal } from "../../ui/components/Modal";
import { AppVersionManager } from "./AppVersionManager";

export class AppVersionController {
    toolboxService: any;
    appVersion: any;

    constructor() {
        this.toolboxService = new ToolBoxService();
        this.appVersion = new AppVersionManager();
    } 
    
    async generateShareLink(): Promise<string> {
        try {
            const activeVersionId = await this.appVersion.getActiveVersionId();
            
            if (!activeVersionId) {
                throw new Error('No active version found');
            }

            return `${baseURL}/wp_apppreview.aspx?AppVersionId=${activeVersionId}`;
        } catch (error) {
            console.error('Error generating share link:', error);
            throw error;
        }
    }

    async copyToClipboard(text: string): Promise<boolean> {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Clipboard copy failed:', err);
            return false;
        }
    }

    async getVersions(): Promise<AppVersion[]> {
        try {
            const versionsResponse = await this.toolboxService.getVersions();
            return versionsResponse.AppVersions;
        } catch (error) {
            console.error("Failed to fetch versions:", error);
            return [];
        }
    }

    async activateVersion(versionId: string): Promise<boolean> {
        try {
            const result = await this.toolboxService.activateVersion(versionId);
            return result;
        } catch (error) {
            console.error("Version activation failed:", error);
            return false;
        }
    }

    async createVersion(versionName: string): Promise<any | null> {
        try {
            let result;    
            result = await this.toolboxService.createVersion(versionName);     
            return result;
        } catch (error) {
            console.error("Version creation failed:", error);
            return null;
        }
    }

    async duplicateVersion(activeVersionId: string, versionName: string): Promise<any | null> {
        try {
            let result;    
            result = await this.toolboxService.duplicateVersion(activeVersionId, versionName);    
            return result;
        } catch (error) {
            console.error("Version creation failed:", error);
            return null;
        }
    }

    async renameVersion(activeVersionId: string, versionName: string): Promise<any | null> {
        try {
            let result;    
            result = await this.toolboxService.renameVersion(activeVersionId, versionName);    
            return result;
        } catch (error) {
            console.error("Version creation failed:", error);
            return null;
        }
    }

    async deleteVersion(appVersionId: any): Promise<any | null> {
        try {
            await this.toolboxService.deleteVersion(appVersionId).then((deleteVersion: any) => {
                if (deleteVersion.result == "OK") {
                    new Alert("success", "Version deleted successfully");
                }
            })
            
        } catch (error) {
            console.error("Version deletion failed:", error);
            return null;
        }
    }

    async getActiveVersion(): Promise<AppVersion | null> {
        const versions = await this.getVersions();
        return versions.find(version => version.IsActive) || null;
    }
}