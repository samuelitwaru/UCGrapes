import ToolboxApp from './app';
import { AppConfig } from './AppConfig';
import { Form, Media, ProductService, Theme } from './types';


class App {
  private toolboxApp: ToolboxApp;
  currentVersion: string | null;
  currentThemeId: string | null;
  editors: { [key: string]: any } = {}
  suppliers: any[];
  forms: Form[];
  
  constructor(
    UC: any,
    themes: Theme[],
    suppliers: any[],
    services: ProductService[],
    forms: Form[],
    media: Media[],
    currentThemeId: string | null,
    currentVersion: string | null,
    organisationLogo: string | null,
    currentLanguage: string,
    addServiceButtonEvent: any,
    addTemplatesButtonEvent: any
  ) {
    this.currentVersion = currentVersion
    this.currentThemeId = currentThemeId
    this.suppliers = suppliers
    this.forms = forms

    const config = AppConfig.getInstance();
    config.init(
      UC,
      themes,
      suppliers,
      services,
      forms,
      media,
      currentThemeId,
      currentVersion,
      organisationLogo,
      currentLanguage,
      addServiceButtonEvent,
      addTemplatesButtonEvent
    );

    (window as any).app = this;
    this.toolboxApp = new ToolboxApp();
  }
}

// Expose the App class globally
(window as any).App = App;