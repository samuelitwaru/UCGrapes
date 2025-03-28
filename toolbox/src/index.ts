import ToolboxApp from './app';
import { AppConfig } from './AppConfig';
import { Form } from './models/Form';
import { Media } from './models/Media';
import { ProductService } from './models/Service';
import { Theme } from './models/Theme';


class App {
  private toolboxApp: ToolboxApp;
  
  constructor(
    themes: Theme[],
    services: ProductService[],
    forms: Form[],
    media: Media[],
    currentThemeId: string | null,
    organisationLogo: string | null,
    currentLanguage: string,
    addServiceButtonEvent: any,
  ) {
    const config = AppConfig.getInstance();
    config.init(
      themes,
      services,
      forms,
      media,
      currentThemeId,
      organisationLogo,
      currentLanguage,
      addServiceButtonEvent,
    );
    
    this.toolboxApp = new ToolboxApp();
  }
}

// Expose the App class globally
(window as any).App = App;