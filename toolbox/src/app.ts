import { AppConfig } from './AppConfig';
import { EditorManager } from './controls/editor/EditorManager';
import { ThemeManager } from './controls/themes/ThemeManager';
import { ToolboxManager } from './controls/toolbox/ToolboxManager';
import { Theme } from './models/Theme';

class ToolboxApp {
  private toolboxManager: ToolboxManager;
  private editor: EditorManager;
  private config: AppConfig;

  constructor() {
    this.config = AppConfig.getInstance();
    this.toolboxManager = new ToolboxManager();
    this.editor = new EditorManager();
    if (!this.config.isInitialized) {
      console.error("ToolboxApp created before AppConfig was initialized!");
    }
    this.initialise();
  } 

  initialise(): void {
    this.toolboxManager.setUpNavBar();
    this.toolboxManager.setUpSideBar();
    this.toolboxManager.closeDropDowns();
    this.editor.init();
  }
}

export default ToolboxApp;
