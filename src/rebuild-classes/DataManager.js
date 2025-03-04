"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataManager = void 0;
var LoadingManager_1 = require("../ui/LoadingManager");
var environment = "/Comforta_version2DevelopmentNETPostgreSQL";
var baseURL = window.location.origin + (window.location.origin.startsWith("http://localhost") ? environment : "");
var DataManager = /** @class */ (function () {
    function DataManager(services, forms, media) {
        if (services === void 0) { services = []; }
        if (forms === void 0) { forms = []; }
        if (media === void 0) { media = []; }
        this.services = services;
        this.forms = forms;
        this.media = media;
        this.pages = [];
        this.selectedTheme = null;
        this.loadingManager = new LoadingManager_1.LoadingManager(document.getElementById('preloader'));
    }
    // Helper method to handle API calls
    DataManager.prototype.fetchAPI = function (endpoint_1) {
        return __awaiter(this, arguments, void 0, function (endpoint, options, skipLoading) {
            var defaultOptions, response, error_1;
            if (options === void 0) { options = {}; }
            if (skipLoading === void 0) { skipLoading = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        defaultOptions = {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        if (!skipLoading) {
                            this.loadingManager.loading = true;
                        }
                        return [4 /*yield*/, fetch("".concat(baseURL).concat(endpoint), __assign(__assign({}, defaultOptions), options))];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("HTTP error! status: ".concat(response.status));
                        }
                        return [4 /*yield*/, response.json()];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        error_1 = _a.sent();
                        console.error("API Error (".concat(endpoint, "):"), error_1);
                        throw error_1;
                    case 5:
                        if (!skipLoading) {
                            this.loadingManager.loading = false;
                        }
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    // Pages API methods
    DataManager.prototype.getPages = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.fetchAPI('/api/toolbox/pages/list', {}, true)];
                    case 1:
                        _a.pages = _b.sent();
                        return [2 /*return*/, this.pages];
                }
            });
        });
    };
    DataManager.prototype.getServices = function () {
        return __awaiter(this, void 0, void 0, function () {
            var services;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchAPI('/api/toolbox/services', {}, true)];
                    case 1:
                        services = _a.sent();
                        this.services = services.SDT_ProductServiceCollection;
                        return [2 /*return*/, this.services];
                }
            });
        });
    };
    DataManager.prototype.getSinglePage = function (pageId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchAPI("/api/toolbox/singlepage?Pageid=".concat(pageId))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DataManager.prototype.deletePage = function (pageId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchAPI("/api/toolbox/deletepage?Pageid=".concat(pageId))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DataManager.prototype.getPagesService = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchAPI('/api/toolbox/pages/tree')];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DataManager.prototype.createNewPage = function (pageName, theme) {
        return __awaiter(this, void 0, void 0, function () {
            var pageJsonContent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pageJsonContent = {};
                        return [4 /*yield*/, this.fetchAPI('/api/toolbox/create-page', {
                                method: 'POST',
                                body: JSON.stringify({ PageName: pageName, PageJsonContent: JSON.stringify(pageJsonContent) }),
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DataManager.prototype.updatePage = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchAPI('/api/toolbox/update-page', {
                            method: 'POST',
                            body: JSON.stringify(data),
                        }, true)];
                    case 1: return [2 /*return*/, _a.sent()]; // Pass true to skip loading
                }
            });
        });
    };
    DataManager.prototype.updatePagesBatch = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchAPI('/api/toolbox/update-pages-batch', {
                            method: 'POST',
                            body: JSON.stringify(payload),
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DataManager.prototype.addPageChild = function (childPageId, currentPageId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchAPI('/api/toolbox/add-page-children', {
                            method: 'POST',
                            body: JSON.stringify({
                                ParentPageId: currentPageId,
                                ChildPageId: childPageId,
                            }),
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DataManager.prototype.createContentPage = function (pageId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchAPI('/api/toolbox/create-content-page', {
                            method: 'POST',
                            body: JSON.stringify({ PageId: pageId }),
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DataManager.prototype.createDynamicFormPage = function (formId, pageName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchAPI('/api/toolbox/create-dynamic-form-page', {
                            method: 'POST',
                            body: JSON.stringify({ FormId: formId, PageName: pageName }),
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // Theme API methods
    DataManager.prototype.getLocationTheme = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchAPI('/api/toolbox/location-theme')];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DataManager.prototype.updateLocationTheme = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!((_a = this.selectedTheme) === null || _a === void 0 ? void 0 : _a.ThemeId)) {
                            throw new Error('No theme selected');
                        }
                        return [4 /*yield*/, this.fetchAPI('/api/toolbox/update-location-theme', {
                                method: 'POST',
                                body: JSON.stringify({ ThemeId: this.selectedTheme.ThemeId }),
                            })];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    // Media API methods
    DataManager.prototype.getMediaFiles = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchAPI('/api/media/')];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DataManager.prototype.deleteMedia = function (mediaId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchAPI("/api/media/delete?MediaId=".concat(mediaId))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DataManager.prototype.uploadFile = function (fileData, fileName, fileSize, fileType) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!fileData) {
                            throw new Error('Please select a file!');
                        }
                        return [4 /*yield*/, this.fetchAPI('/api/media/upload', {
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
                            }, true)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DataManager.prototype.uploadLogo = function (logoUrl) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchAPI('/api/media/upload/logo', {
                            method: 'POST',
                            body: JSON.stringify({ LogoUrl: logoUrl }),
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DataManager.prototype.uploadProfileImage = function (profileImageUrl) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchAPI('/api/media/upload/profile', {
                            method: 'POST',
                            body: JSON.stringify({ ProfileImageUrl: profileImageUrl }),
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // Content API methods
    DataManager.prototype.getContentPageData = function (productServiceId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchAPI("/api/productservice?Productserviceid=".concat(productServiceId))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return DataManager;
}());

exports.DataManager = DataManager;
