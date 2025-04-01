import { AppVersion } from "../../interfaces/AppVersion ";
import { baseURL, ToolBoxService } from "../../services/ToolBoxService";
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

    async createVersion(versionName: string, isDuplicating = false): Promise<AppVersion | null> {
        try {
            let result;    
            if (isDuplicating) {
                const activeVersionId = await this.appVersion.getActiveVersionId();
                result = await this.toolboxService.duplicateVersion(activeVersionId, versionName);
            } else {
                result = await this.toolboxService.createVersion(versionName);
            }      
            return result;
        } catch (error) {
            console.error("Version creation failed:", error);
            return null;
        }
    }

    async getActiveVersion(): Promise<AppVersion | null> {
        const versions = await this.getVersions();
        return versions.find(version => version.IsActive) || null;
    }
}