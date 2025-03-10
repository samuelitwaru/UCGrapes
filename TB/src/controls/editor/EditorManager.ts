import { AppConfig } from "../../AppConfig";
import { ToolBoxService } from "../../services/ToolBoxService";
import { FrameList } from "../../ui/components/editor-content/FrameList";
import { LeftNavigatorButton } from "../../ui/components/editor-content/LeftNavigatorButton";
import { RightNavigatorButton } from "../../ui/components/editor-content/RightNavigatorButton";
import { EditorEvents } from "./EditorEvents";
import { JSONToGrapesJS } from "./JSONToGrapesJS";

declare const grapesjs: any;

export class EditorManager {
  private config: AppConfig;
  organisationLogo: string | any;
  toolboxService: ToolBoxService;
  selectedComponent: any;
  editors: { pageId: string; frameId: string; editor: any }[] = [];
  editorEvents: EditorEvents
  jsonToGrapes: JSONToGrapesJS;

  constructor() {
    this.config = AppConfig.getInstance();
    this.organisationLogo = this.config.organisationLogo;
    this.toolboxService = new ToolBoxService();
    this.editorEvents = new EditorEvents(this);
    this.jsonToGrapes = new JSONToGrapesJS(this);
  }

  init() {
    this.setUpEditorFrame();
    this.setUpEditor();
  }

  setUpEditorFrame() {
    const leftNavigatorButton = new LeftNavigatorButton();
    const rightNavigatorButton = new RightNavigatorButton();
    const frameList = new FrameList();

    const editorFrameArea = document.getElementById(
      "main-content"
    ) as HTMLElement;

    leftNavigatorButton.render(editorFrameArea);
    frameList.render(editorFrameArea);
    rightNavigatorButton.render(editorFrameArea);
  }

  async setUpEditor() {
    const editor = this.initializeGrapesEditor("gjs-0");
    this.finalizeEditorSetup(editor);
    await this.loadHomePage(editor);  
  }

  async loadHomePage(editor: any) {
    const pages = await this.toolboxService.getPages();

    const homePage = pages.find((page: any) => page.PageName === "Home");

    if (homePage) {
      const pageData = JSON.parse(homePage.PageGJSJson);
      editor.loadProjectData(pageData);
      this.editorEvents.init(editor);
    }
  }

  initializeGrapesEditor(editorId: string) {
    return grapesjs.init({
      container: `#${editorId}`,
      fromElement: true,
      height: "100%",
      width: "auto",
      canvas: {
        styles: [
          "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css",
          "/DVelop/Bootstrap/Shared/fontawesome_vlatest/css/all.min.css?202521714271081",
          "https://fonts.googleapis.com/css2?family=Inter:opsz@14..32&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap",
          "/Resources/UCGrapes1/src/css/toolbox.css",
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
  }

  updateEditors(pageId: string, frameId: string, editor: any) {
    // // Check if editor exists for the given pageId and frameId
    // const existingEditor = this.editors.find(
    //   (ed) => ed.pageId === pageId && ed.frameId === frameId
    // );

    // if (!existingEditor) {
    //   this.editors.push({ pageId, frameId, editor });
    // }
  }
}
