import { Form } from "./models/Form";
import { Media } from "./models/Media";
import { ProductService } from "./models/Service";
import { Theme } from "./models/Theme";

export class AppConfig {
    private static instance: AppConfig | null = null;
    
    private _themes: Theme[] = [];
    private _services: ProductService[] = [];
    private _forms: Form[] = [];
    private _media: Media[] = [];
    private _currentThemeId: string | null = null;
    private _organisationLogo: string | null = null;
    currentLanguage: string = "en";

    private _isInitialized: boolean = false;
    addServiceButtonEvent: any;
    UC: any;
  
    private constructor() {}
  
    // Singleton pattern to ensure only one instance exists
    public static getInstance(): AppConfig {
      if (!AppConfig.instance) {
        AppConfig.instance = new AppConfig();
      }
      return AppConfig.instance;
    }
  
    // Initialize with data - should be called only once
    public init(
      UC: any,
      themes: Theme[],
      services: ProductService[],
      forms: Form[],
      media: Media[],
      currentThemeId: string | null,
      organisationLogo: string | null,
      currentLanguage: string,
      addServiceButtonEvent: any,
    ): void {
      if (this._isInitialized) {
        console.warn("AppConfig already initialized - ignoring new data");
        return;
      }
      this.UC = UC;
      this._themes = themes;
      this._services = services;
      this._forms = forms;
      this._media = media;
      this._currentThemeId = currentThemeId,
      this._organisationLogo = organisationLogo;
      this.addServiceButtonEvent = addServiceButtonEvent;
      this.currentLanguage = currentLanguage;
      this._isInitialized = true;
    }
  
    // Getters
    get themes(): Theme[] {
      return this._themes;
    }

    get services(): ProductService[] {
      return this._services;
    }

    get forms(): Form[] {
      return this._forms;
    }

    get media(): Media[] {
      return this._media;
    }

    set media(value: Media[]) {
      this._media = value;
    }

    get currentThemeId(): string | null {
      return this._currentThemeId;
    }
    

    set currentThemeId(value: string | null) {
      this._currentThemeId = value;
    }

    get organisationLogo(): string | null {
      return this._organisationLogo;
    }
  
    get isInitialized(): boolean {
      return this._isInitialized;
    }
}