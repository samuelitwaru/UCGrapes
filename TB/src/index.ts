import ToolboxApp from './app';
import { AppConfig } from './AppConfig';
import { Theme } from './models/Theme';

class App {
  private toolboxApp: ToolboxApp;
  
  constructor(themes: Theme[]) {
    const config = AppConfig.getInstance();
    config.init(themes);
    
    this.toolboxApp = new ToolboxApp();
  }
}

// Expose the App class globally
(window as any).App = App;