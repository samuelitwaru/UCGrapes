import { AppConfig } from "../../AppConfig";
import { ToolBoxService } from "../../services/ToolBoxService";
import { FrameList } from "../../ui/components/editor-content/FrameList";
import { LeftNavigatorButton } from "../../ui/components/editor-content/LeftNavigatorButton";
import { RightNavigatorButton } from "../../ui/components/editor-content/RightNavigatorButton";
import { demoPages } from "../../utils/test-data/pages";
import { ThemeManager } from "../themes/ThemeManager";
import { EditorEvents } from "./EditorEvents";
import { JSONToGrapesJSMenu } from "./JSONToGrapesJSMenu";
import { TileMapper } from "./TileMapper";

declare const grapesjs: any;

export class EditorManager {
  private config: AppConfig;
  organisationLogo: string | any;
  toolboxService: ToolBoxService;
  selectedComponent: any;
  editors: { pageId: string; frameId: string; editor: any }[] = [];
  editorEvents: EditorEvents;
  jsonToGrapes: JSONToGrapesJSMenu;
  homepage: any;
  themeManager: any;

  constructor() {
    this.config = AppConfig.getInstance();
    this.organisationLogo = this.config.organisationLogo;
    this.themeManager = new ThemeManager();
    this.toolboxService = new ToolBoxService();
    this.editorEvents = new EditorEvents();
    this.jsonToGrapes = new JSONToGrapesJSMenu(this);
  }

  async init() {
    const versions = await this.toolboxService.getVersions();
    this.homepage = versions.AppVersions.find(
      (version: any) => version.IsActive == true
    )?.Pages.find((page: any) => page.PageName === "Home");
    console.log(this.homepage)
    const mainContainer = document.getElementById('main-content') as HTMLDivElement
    mainContainer.innerHTML = ""
    this.setUpEditorFrame();
    this.setUpEditor();
  }

  setUpEditorFrame() {
    const leftNavigatorButton = new LeftNavigatorButton();
    const rightNavigatorButton = new RightNavigatorButton();
    const frameList = new FrameList(`gjs-0`);

    const editorFrameArea = document.getElementById(
      "main-content"
    ) as HTMLElement;

    leftNavigatorButton.render(editorFrameArea);
    frameList.render(editorFrameArea);
    rightNavigatorButton.render(editorFrameArea);
  }

  async setUpEditor() {
    const editor = this.initializeGrapesEditor(`gjs-0`);
    this.finalizeEditorSetup(editor);
    await this.loadHomePage(editor);
    this.activateHomeEditor(`gjs-0`);
    this.themeManager.applyTheme(this.themeManager.currentTheme);
  }

  async loadHomePage(editor: any) {
    const converter = new JSONToGrapesJSMenu(this.homepage);
    const htmlOutput = converter.generateHTML();

    editor.setComponents(htmlOutput);
    this.editorEvents.init(editor, this.homepage, `gjs-0`);
    localStorage.setItem(
      `data-${this.homepage?.PageId}`,
      JSON.stringify(this.homepage)
    );
  }

  initializeGrapesEditor(editorId: string) {
    return grapesjs.init({
      container: `#${editorId}`,
      fromElement: true,
      height: "100%",
      width: "auto",
      canvas: {
        styles: [
          "/Resources/UCGrapes1/src/css/toolbox.css",
          "/DVelop/Bootstrap/Shared/fontawesome_vlatest/css/all.min.css?202521714271081",
          "https://fonts.googleapis.com/css2?family=Inter:opsz@14..32&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap",
        ],
      },
      baseCss: " ",
      dragMode: "normal",
      panels: { defaults: [] },
      sidebarManager: false,
      storageManager: false,
      modal: false,
      commands: false,
      hoverable: false,
      highlightable: false,
      selectable: false,
      richTextEditor: {},
    });
  }

  finalizeEditorSetup(editor: any) {
    const wrapper = editor.getWrapper();

    wrapper.set({
      selectable: false,
      droppable: false,
      draggable: false,
      hoverable: false,
    });

    const canvas = editor.Canvas.getElement();
    if (canvas) {
      canvas.style.setProperty("height", "calc(100% - 100px)", "important");
    }
    
    const canvasBody = editor.Canvas.getBody();
    if (canvasBody) {
      canvasBody.style.setProperty("background-color", "#EFEEEC", "important");
    }
  }

  activateHomeEditor(frameId: string) {
    const homeFrame = document.getElementById(`${frameId}-frame`);
    homeFrame?.classList.add("active-editor");
  }

  

}
