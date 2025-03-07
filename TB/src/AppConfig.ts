import { Theme } from "./models/Theme";

export class AppConfig {
    private static instance: AppConfig | null = null;
    
    private _themes: Theme[] = [];
    // private _dataManagerCollection: DataManager[] = [];
    private _isInitialized: boolean = false;
  
    private constructor() {}
  
    // Singleton pattern to ensure only one instance exists
    public static getInstance(): AppConfig {
      if (!AppConfig.instance) {
        AppConfig.instance = new AppConfig();
      }
      return AppConfig.instance;
    }
  
    // Initialize with data - should be called only once
    public init(themes: Theme[]): void {
      if (this._isInitialized) {
        console.warn("AppConfig already initialized - ignoring new data");
        return;
      }
      
      this._themes = themes;
      this._isInitialized = true;
      console.log("AppConfig initialized with data");
    }
  
    // Getters
    get themes(): Theme[] {
      return this._themes;
    }

  
    get isInitialized(): boolean {
      return this._isInitialized;
    }
}