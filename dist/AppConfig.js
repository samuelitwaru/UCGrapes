export class AppConfig {
    constructor() {
        this._themes = [];
        this._suppliers = [];
        this._services = [];
        this._forms = [];
        this._media = [];
        this._currentVersion = null; 
        
        this._currentThemeId = null;
        this._organisationLogo = null;
        this.currentLanguage = "en";
        this._isInitialized = false;
    }
    // Singleton pattern to ensure only one instance exists
    static getInstance() {
        if (!AppConfig.instance) {
            AppConfig.instance = new AppConfig();
        }
        return AppConfig.instance;
    }
    // Initialize with data - should be called only once
    init(UC, themes, suppliers, services, forms, media, currentThemeId, currentVersion, organisationLogo, currentLanguage, addServiceButtonEvent, addTemplatesButtonEvent) {
        if (this._isInitialized) {
            console.warn("AppConfig already initialized - ignoring new data");
            return;
        }
        this.UC = UC;
        this._themes = themes;
        this._suppliers = suppliers;
        this._services = services;
        this._forms = forms;
        this._media = media;
        this._currentThemeId = currentThemeId,
            this._currentVersion = currentVersion;
        this._organisationLogo = organisationLogo;
        this.addServiceButtonEvent = addServiceButtonEvent;
        this.addTemplatesButtonEvent = addTemplatesButtonEvent;
        this.currentLanguage = currentLanguage;
        this._isInitialized = true;
    }
    // Getters
    get themes() {
        return this._themes;
    }
    get suppliers() {
        return this._suppliers;
    }
    get services() {
        return this._services;
    }
    get forms() {
        return this._forms;
    }
    get media() {
        return this._media;
    }
    set media(value) {
        this._media = value;
    }
    get currentThemeId() {
        return this._currentThemeId;
    }
    get currentVersion() {
        return this._currentVersion;
    }
    set currentThemeId(value) {
        this._currentThemeId = value;
    }
    get organisationLogo() {
        return this._organisationLogo;
    }
    get isInitialized() {
        return this._isInitialized;
    }
}
AppConfig.instance = null;
//# sourceMappingURL=AppConfig.js.map