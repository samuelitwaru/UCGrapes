var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { AppConfig } from "../AppConfig";
import { LoadingManager } from "../controls/LoadingManager";
import { environment } from "../utils/env";
export const baseURL = window.location.origin +
    (window.location.origin.startsWith("http://localhost") ? environment : "");
export class ToolBoxService {
    constructor() {
        this.services = [];
        this.forms = [];
        this.preloaderEl = document.getElementById("preloader");
        this.config = AppConfig.getInstance();
        this.init();
    }
    init() {
        this.services = this.config.services;
        this.forms = this.config.forms;
        this.loadingManager = new LoadingManager(this.preloaderEl);
    }
    // Helper method to handle API calls
    fetchAPI(endpoint_1) {
        return __awaiter(this, arguments, void 0, function* (endpoint, options = {}, skipLoading = false) {
            const defaultOptions = {
                headers: {
                    "Content-Type": "application/json",
                },
            };
            try {
                if (!skipLoading) {
                    this.loadingManager.loading = true;
                }
                const response = yield fetch(`${baseURL}${endpoint}`, Object.assign(Object.assign({}, defaultOptions), options));
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return yield response.json();
            }
            catch (error) {
                console.error(`API Error (${endpoint}):`, error);
                throw error;
            }
            finally {
                if (!skipLoading) {
                    this.loadingManager.loading = false;
                }
            }
        });
    }
    debugApp(urlList) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.fetchAPI("/api/toolbox/v2/debug", {
                method: "POST",
                body: JSON.stringify({
                    PageUrlList: urlList
                }),
            }, true);
            return response;
        });
    }
    getVersions() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.fetchAPI("/api/toolbox/v2/appversions", {}, true);
            return response;
        });
    }
    getVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.fetchAPI("/api/toolbox/v2/appversion", {}, true);
            return response;
        });
    }
    createVersion(versionName) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.fetchAPI("/api/toolbox/v2/create-appversion", {
                method: "POST",
                body: JSON.stringify({
                    AppVersionName: versionName
                }),
            });
            return response;
        });
    }
    duplicateVersion(appVersionId, versionName) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.fetchAPI("/api/toolbox/v2/copy-appversion", {
                method: "POST",
                body: JSON.stringify({
                    AppVersionId: appVersionId,
                    AppVersionName: versionName
                }),
            });
            return response;
        });
    }
    activateVersion(versionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.fetchAPI("/api/toolbox/v2/activate-appversion", {
                method: "POST",
                body: JSON.stringify({
                    AppVersionId: versionId
                }),
            });
            return response;
        });
    }
    deleteVersion(appVersionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI("/api/toolbox/v2/delete-version", {
                method: "POST",
                body: JSON.stringify({
                    AppVersionId: appVersionId
                }),
            });
        });
    }
    createMenuPage(appVersionId, pageName) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log({
                appVersionId: appVersionId,
                pageName: pageName
            });
            const response = yield this.fetchAPI("/api/toolbox/v2/create-menu-page", {
                method: "POST",
                body: JSON.stringify({
                    appVersionId: appVersionId,
                    pageName: pageName
                }),
            });
            return response;
        });
    }
    createInfoPage(appVersionId, pageName) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log({
                appVersionId: appVersionId,
                pageName: pageName
            });
            const response = yield this.fetchAPI("/api/toolbox/v2/create-info-page", {
                method: "POST",
                body: JSON.stringify({
                    appVersionId: appVersionId,
                    pageName: pageName
                }),
            });
            return response;
        });
    }
    createServicePage(appVersionId, productServiceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.fetchAPI("/api/toolbox/v2/create-service-page", {
                method: "POST",
                body: JSON.stringify({
                    appVersionId: appVersionId,
                    ProductServiceId: productServiceId,
                }),
            });
            return response;
        });
    }
    createContentPage(appVersionId, pageName) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.fetchAPI("/api/toolbox/v2/create-content-page", {
                method: "POST",
                body: JSON.stringify({
                    appVersionId: appVersionId,
                    PageName: pageName
                }),
            });
            return response;
        });
    }
    createServiceCTA(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.fetchAPI("/api/toolbox/v2/create-service-cta", {
                method: "POST",
                body: JSON.stringify(payload),
            });
            console.log(response);
            return response;
        });
    }
    autoSavePage(pageData) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.fetchAPI("/api/toolbox/v2/save-page", {
                method: "POST",
                body: JSON.stringify(pageData),
            }, true);
            return response;
        });
    }
    savePageThumbnail(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.fetchAPI("/api/toolbox/v2/save-page-thumbnail", {
                method: "POST",
                body: JSON.stringify(data),
            }, true);
            return response;
        });
    }
    updatePageTitle(pageData) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.fetchAPI("/api/toolbox/v2/update-page-title", {
                method: "POST",
                body: JSON.stringify(pageData),
            }, true);
            return response;
        });
    }
    publishAppVersion(appVersionId_1) {
        return __awaiter(this, arguments, void 0, function* (appVersionId, notify = false) {
            return yield this.fetchAPI("/api/toolbox/v2/publish-appversion", {
                method: "POST",
                body: JSON.stringify({
                    AppVersionId: appVersionId,
                    Notify: notify,
                }),
            });
        });
    }
    // Pages API methods
    getPages() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.fetchAPI("/api/toolbox/pages/list", {}, true);
            return response.SDT_PageCollection;
        });
    }
    getServices() {
        return __awaiter(this, void 0, void 0, function* () {
            const services = yield this.fetchAPI("/api/toolbox/services", {}, true);
            this.services = services.SDT_ProductServiceCollection;
            return this.services;
        });
    }
    getSinglePage(pageId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI(`/api/toolbox/singlepage?Pageid=${pageId}`);
        });
    }
    deletePage(appVersionId, pageId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI("/api/toolbox/V2/delete-page", {
                method: "POST",
                body: JSON.stringify({
                    AppVersionId: appVersionId,
                    PageId: pageId,
                }),
            });
        });
    }
    getPagesService() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI("/api/toolbox/pages/tree");
        });
    }
    createNewPage(pageName, theme) {
        return __awaiter(this, void 0, void 0, function* () {
            let pageJsonContent = {};
            return yield this.fetchAPI("/api/toolbox/create-page", {
                method: "POST",
                body: JSON.stringify({
                    PageName: pageName,
                    PageJsonContent: JSON.stringify(pageJsonContent),
                }),
            });
        });
    }
    updatePage(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI("/api/toolbox/update-page", {
                method: "POST",
                body: JSON.stringify(data),
            }, true); // Pass true to skip loading
        });
    }
    updatePagesBatch(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI("/api/toolbox/update-pages-batch", {
                method: "POST",
                body: JSON.stringify(payload),
            });
        });
    }
    addPageChild(childPageId, currentPageId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI("/api/toolbox/add-page-children", {
                method: "POST",
                body: JSON.stringify({
                    ParentPageId: currentPageId,
                    ChildPageId: childPageId,
                }),
            });
        });
    }
    // async createServicePage(pageId: string | number) {
    //   return await this.fetchAPI("/api/toolbox/create-content-page", {
    //     method: "POST",
    //     body: JSON.stringify({ PageId: pageId }),
    //   });
    // }
    createDynamicFormPage(formId, pageName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI("/api/toolbox/create-dynamic-form-page", {
                method: "POST",
                body: JSON.stringify({ FormId: formId, PageName: pageName }),
            });
        });
    }
    // Theme API methods
    getLocationTheme() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI("/api/toolbox/location-theme");
        });
    }
    updateLocationTheme(themeId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI("/api/toolbox/update-location-theme", {
                method: "POST",
                body: JSON.stringify({ ThemeId: themeId }),
            });
        });
    }
    // Media API methods
    getMediaFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.fetchAPI("/api/toolbox/media", {}, true);
            return response.SDT_MediaCollection;
        });
    }
    deleteMedia(mediaId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI(`/api/media/delete?MediaId=${mediaId}`);
        });
    }
    uploadFile(fileData, fileName, fileSize, fileType) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!fileData) {
                throw new Error("Please select a file!");
            }
            return yield this.fetchAPI("/api/media/upload", {
                method: "POST",
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                body: JSON.stringify({
                    MediaName: fileName,
                    MediaImageData: fileData,
                    MediaSize: fileSize,
                    MediaType: fileType,
                }),
            }, true);
        });
    }
    uploadLogo(logoUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI("/api/media/upload/logo", {
                method: "POST",
                body: JSON.stringify({ LogoUrl: logoUrl }),
            });
        });
    }
    uploadProfileImage(profileImageUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI("/api/media/upload/profile", {
                method: "POST",
                body: JSON.stringify({ ProfileImageUrl: profileImageUrl }),
            });
        });
    }
    // Content API methods
    getContentPageData(productServiceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI(`/api/productservice?Productserviceid=${productServiceId}`, {}, true);
        });
    }
    updateDescription(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI('/api/toolbox/v2/update-service', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        });
    }
    updateContentImage(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI('/api/toolbox/v2/update-service', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        });
    }
    deleteContentImage(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI('/api/toolbox/v2/delete-service-image', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        });
    }
    getLocationData() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI('/api/toolbox/v2/get-location', {}, true);
        });
    }
    updateLocationInfo(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI('/api/toolbox/v2/update-location', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        });
    }
}
//# sourceMappingURL=ToolBoxService.js.map