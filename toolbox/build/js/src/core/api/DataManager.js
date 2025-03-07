var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { LoadingManager } from "../../controls/LoadingManager";
const environment = "/Comforta_version2DevelopmentNETPostgreSQL";
const baseURL = window.location.origin + (window.location.origin.startsWith("http://localhost") ? environment : "");
export class DataManager {
    constructor(services = [], forms = [], media = []) {
        this.preloaderEl = document.getElementById('preloader');
        this.services = services;
        this.forms = forms;
        this.media = media;
        this.pages = [];
        this.selectedTheme = null;
        this.loadingManager = new LoadingManager(this.preloaderEl);
    }
    // Helper method to handle API calls
    fetchAPI(endpoint_1) {
        return __awaiter(this, arguments, void 0, function* (endpoint, options = {}, skipLoading = false) {
            const defaultOptions = {
                headers: {
                    'Content-Type': 'application/json',
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
    // Pages API methods
    getPages() {
        return __awaiter(this, void 0, void 0, function* () {
            this.pages = yield this.fetchAPI('/api/toolbox/pages/list', {}, true);
            return this.pages;
        });
    }
    getServices() {
        return __awaiter(this, void 0, void 0, function* () {
            const services = yield this.fetchAPI('/api/toolbox/services', {}, true);
            this.services = services.SDT_ProductServiceCollection;
            return this.services;
        });
    }
    getSinglePage(pageId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI(`/api/toolbox/singlepage?Pageid=${pageId}`);
        });
    }
    deletePage(pageId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI(`/api/toolbox/deletepage?Pageid=${pageId}`);
        });
    }
    getPagesService() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI('/api/toolbox/pages/tree');
        });
    }
    createNewPage(pageName, theme) {
        return __awaiter(this, void 0, void 0, function* () {
            let pageJsonContent = {};
            return yield this.fetchAPI('/api/toolbox/create-page', {
                method: 'POST',
                body: JSON.stringify({ PageName: pageName, PageJsonContent: JSON.stringify(pageJsonContent) }),
            });
        });
    }
    updatePage(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI('/api/toolbox/update-page', {
                method: 'POST',
                body: JSON.stringify(data),
            }, true); // Pass true to skip loading
        });
    }
    updatePagesBatch(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI('/api/toolbox/update-pages-batch', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
        });
    }
    addPageChild(childPageId, currentPageId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI('/api/toolbox/add-page-children', {
                method: 'POST',
                body: JSON.stringify({
                    ParentPageId: currentPageId,
                    ChildPageId: childPageId,
                }),
            });
        });
    }
    createContentPage(pageId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI('/api/toolbox/create-content-page', {
                method: 'POST',
                body: JSON.stringify({ PageId: pageId }),
            });
        });
    }
    createDynamicFormPage(formId, pageName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI('/api/toolbox/create-dynamic-form-page', {
                method: 'POST',
                body: JSON.stringify({ FormId: formId, PageName: pageName }),
            });
        });
    }
    // Theme API methods
    getLocationTheme() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI('/api/toolbox/location-theme');
        });
    }
    updateLocationTheme() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!((_a = this.selectedTheme) === null || _a === void 0 ? void 0 : _a.ThemeId)) {
                throw new Error('No theme selected');
            }
            return yield this.fetchAPI('/api/toolbox/update-location-theme', {
                method: 'POST',
                body: JSON.stringify({ ThemeId: this.selectedTheme.ThemeId }),
            });
        });
    }
    // Media API methods
    getMediaFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI('/api/media/');
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
                throw new Error('Please select a file!');
            }
            return yield this.fetchAPI('/api/media/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
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
            return yield this.fetchAPI('/api/media/upload/logo', {
                method: 'POST',
                body: JSON.stringify({ LogoUrl: logoUrl }),
            });
        });
    }
    uploadProfileImage(profileImageUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI('/api/media/upload/profile', {
                method: 'POST',
                body: JSON.stringify({ ProfileImageUrl: profileImageUrl }),
            });
        });
    }
    // Content API methods
    getContentPageData(productServiceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchAPI(`/api/productservice?Productserviceid=${productServiceId}`);
        });
    }
}
//# sourceMappingURL=DataManager.js.map