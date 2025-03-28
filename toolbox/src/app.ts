import { AppConfig } from "./AppConfig";
import { EditorManager } from "./controls/editor/EditorManager";
import { Localisation } from "./controls/Localisation";
import { ThemeManager } from "./controls/themes/ThemeManager";
import { ToolboxManager } from "./controls/toolbox/ToolboxManager";
import { i18n } from "./i18n/i18n";
import { Theme } from "./models/Theme";
import { I18n } from "i18n-js";

class ToolboxApp {
  private toolboxManager: ToolboxManager;
  private editor: EditorManager;
  private config: AppConfig;
  translations: any;

  constructor() {
    this.config = AppConfig.getInstance();
    this.toolboxManager = new ToolboxManager();
    this.editor = new EditorManager();
    if (!this.config.isInitialized) {
      console.error("ToolboxApp created before AppConfig was initialized!");
    }

    this.initialiseLocalisation();
    this.initialise();
  }

  initialise(): void {
    this.toolboxManager.setUpNavBar();
    this.toolboxManager.setUpSideBar();
    this.toolboxManager.closeDropDowns();
    this.editor.init();
  }

  initialiseLocalisation() {
    console.log(this.config.currentLanguage)
    if (this.config.currentLanguage == "Dutch") {
      i18n.locale = "nl"
    } else {
      i18n.locale = "en"
    }
    console.log("i18n.locale", i18n.locale)
  }
}

export default ToolboxApp;