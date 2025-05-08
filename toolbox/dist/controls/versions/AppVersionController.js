var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { baseURL, ToolBoxService } from "../../services/ToolBoxService";
import { Alert } from "../../ui/components/Alert";
import { AppVersionManager } from "./AppVersionManager";
export class AppVersionController {
    constructor() {
        this.toolboxService = new ToolBoxService();
        this.appVersion = new AppVersionManager();
    }
    generateShareLink() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const activeVersionId = yield this.appVersion.getActiveVersionId();
                if (!activeVersionId) {
                    throw new Error('No active version found');
                }
                return `${baseURL}/wp_apppreview.aspx?AppVersionId=${activeVersionId}`;
            }
            catch (error) {
                console.error('Error generating share link:', error);
                throw error;
            }
        });
    }
    copyToClipboard(text) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield navigator.clipboard.writeText(text);
                return true;
            }
            catch (err) {
                console.error('Clipboard copy failed:', err);
                return false;
            }
        });
    }
    getVersions() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const versionsResponse = yield this.toolboxService.getVersions();
                return versionsResponse.AppVersions;
            }
            catch (error) {
                console.error("Failed to fetch versions:", error);
                return [];
            }
        });
    }
    activateVersion(versionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.toolboxService.activateVersion(versionId);
                return result;
            }
            catch (error) {
                console.error("Version activation failed:", error);
                return false;
            }
        });
    }
    createVersion(versionName_1) {
        return __awaiter(this, arguments, void 0, function* (versionName, isDuplicating = false) {
            try {
                let result;
                if (isDuplicating) {
                    const activeVersionId = yield this.appVersion.getActiveVersionId();
                    result = yield this.toolboxService.duplicateVersion(activeVersionId, versionName);
                }
                else {
                    result = yield this.toolboxService.createVersion(versionName);
                }
                return result;
            }
            catch (error) {
                console.error("Version creation failed:", error);
                return null;
            }
        });
    }
    deleteVersion(appVersionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.toolboxService.deleteVersion(appVersionId).then((deleteVersion) => {
                    if (deleteVersion.result == "OK") {
                        new Alert("success", "Version deleted successfully");
                    }
                });
            }
            catch (error) {
                console.error("Version deletion failed:", error);
                return null;
            }
        });
    }
    getActiveVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            const versions = yield this.getVersions();
            return versions.find(version => version.IsActive) || null;
        });
    }
}
//# sourceMappingURL=AppVersionController.js.map