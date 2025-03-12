import { AppConfig } from "../../AppConfig";
import { ToolBoxService } from "../../services/ToolBoxService";
import { FrameList } from "../../ui/components/editor-content/FrameList";
import { LeftNavigatorButton } from "../../ui/components/editor-content/LeftNavigatorButton";
import { RightNavigatorButton } from "../../ui/components/editor-content/RightNavigatorButton";
import { EditorEvents } from "./EditorEvents";
import { JSONToGrapesJS } from "./JSONToGrapesJS";
import { TileMapper } from "./TileMapper";

declare const grapesjs: any;

export class EditorManager {
  private config: AppConfig;
  organisationLogo: string | any;
  toolboxService: ToolBoxService;
  selectedComponent: any;
  editors: { pageId: string; frameId: string; editor: any }[] = [];
  editorEvents: EditorEvents;
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
    // const pages = await this.toolboxService.getPages();

    // const homePage = pages.find((page: any) => page.PageName === "Home");

    // if (homePage) {
    // const pageData = JSON.parse(homePage.PageGJSJson);
    // editor.loadProjectData(pageData);
    // this.editorEvents.init(editor);

    //   // if data exits, load it to the localstorage too else create local storage
    //   const tileMapper = new TileMapper(homePage.PageId, homePage.PageName);
    //   tileMapper.init();
    // }
    const pageId = '12312321123213';
    const jsonData = {"PageName":"Home","PageId":"1741711658425","Content":{"Rows":[{"Id":"Row1","Tiles":[{"Id":"Tile1","Name":"About Us","Text":"About Us","Color":"#333","Align":"center","Icon":"info","BGColor":"transparent","BGImageUrl":"","Opacity":"50","Action":{"ObjectType":"Page","ObjectId":"1","ObjectUrl":""},"TilePermissionName":""}]},{"Id":"Row2","Tiles":[{"Id":"Tile2","Name":"Services","Text":"Services","Color":"#444","Align":"left","Icon":"cogs","BGColor":"#f0f0f0","BGImageUrl":"","Opacity":"70","Action":{"ObjectType":"Page","ObjectId":"2","ObjectUrl":""},"TilePermissionName":""},{"Id":"Tile3","Name":"Contact","Text":"Contact","Color":"#555","Align":"right","Icon":"phone","BGColor":"#ffffff","BGImageUrl":"","Opacity":"80","Action":{"ObjectType":"Page","ObjectId":"3","ObjectUrl":""},"TilePermissionName":""}]},{"Id":"Row3","Tiles":[{"Id":"Tile4","Name":"Portfolio","Text":"Portfolio","Color":"#666","Align":"center","Icon":"briefcase","BGColor":"transparent","BGImageUrl":"","Opacity":"60","Action":{"ObjectType":"Page","ObjectId":"4","ObjectUrl":""},"TilePermissionName":""}]},{"Id":"Row4","Tiles":[{"Id":"Tile5","Name":"Blog","Text":"Blog","Color":"#777","Align":"left","Icon":"edit","BGColor":"#e0e0e0","BGImageUrl":"","Opacity":"90","Action":{"ObjectType":"Page","ObjectId":"5","ObjectUrl":""},"TilePermissionName":""},{"Id":"Tile6","Name":"Testimonials","Text":"Testimonials","Color":"#888","Align":"center","Icon":"star","BGColor":"#ffffff","BGImageUrl":"","Opacity":"75","Action":{"ObjectType":"Page","ObjectId":"6","ObjectUrl":""},"TilePermissionName":""},{"Id":"Tile7","Name":"FAQs","Text":"FAQs","Color":"#999","Align":"right","Icon":"question-circle","BGColor":"transparent","BGImageUrl":"","Opacity":"85","Action":{"ObjectType":"Page","ObjectId":"7","ObjectUrl":""},"TilePermissionName":""}]},{"Id":"Row5","Tiles":[{"Id":"Tile8","Name":"Support","Text":"Support","Color":"#bbb","Align":"center","Icon":"life-ring","BGColor":"#ffffff","BGImageUrl":"","Opacity":"65","Action":{"ObjectType":"Page","ObjectId":"8","ObjectUrl":""},"TilePermissionName":""}]}]}}
    const converter = new JSONToGrapesJS(jsonData);
    const htmlOutput = converter.generateHTML();
    const cleanedHtmlData = this.filterHTML(htmlOutput);

    editor.setComponents(cleanedHtmlData);
    this.editorEvents.init(editor, pageId);

    const initialData = {
      PageName: "Home",
      PageId: pageId,
      Content: {
        Rows: [],
      },
    };
    localStorage.setItem(`data-${pageId}`, JSON.stringify(jsonData));
  }

  filterHTML(htmlData: string) {
    const div = document.createElement('div');
    div.innerHTML = htmlData;

    const rows = div.querySelectorAll('.container-row');

    rows.forEach(row => {
        const tiles = row.querySelectorAll('.template-block');
        if (tiles.length === 3) {
          const deleteButtons = row.querySelectorAll('.add-button-right');
          deleteButtons.forEach((button: any) => {
            button.style.display = 'none';
          });
        }
    });

    const modifiedHTML = div.innerHTML;
    return modifiedHTML;
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
