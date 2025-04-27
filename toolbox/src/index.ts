import ToolboxApp from './app';
import { AppConfig } from './AppConfig';
import { Form } from './models/Form';
import { Media } from './models/Media';
import { ProductService } from './models/Service';
import { Theme } from './models/Theme';


class App {
  private toolboxApp: ToolboxApp;
  
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
    
    this.toolboxApp = new ToolboxApp();
  }
}

// Expose the App class globally
(window as any).App = App;