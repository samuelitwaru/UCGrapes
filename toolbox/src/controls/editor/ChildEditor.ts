import { EditorFrame } from "../../ui/components/editor-content/EditorFrame";
import { randomIdGenerator } from "../../utils/helpers";
import { ThemeManager } from "../themes/ThemeManager";
import { EditorEvents } from "./EditorEvents";
import { EditorManager } from "./EditorManager";
import { JSONToGrapesJSContent } from "./JSONToGrapesJSContent";
import { JSONToGrapesJSMenu } from "./JSONToGrapesJSMenu";
import { UrlPageEditor } from "./UrlPageEditor";

export class ChildEditor {
  editorManager: EditorManager;
  editorEvents: EditorEvents;
  pageId: any;
  pageData: any;
  themeManager: any;
  pageTitle: any;

  constructor(pageId: any, pageData?: any) {
    this.pageId = pageId;
    this.pageData = pageData;
    this.themeManager = new ThemeManager();
    this.editorManager = new EditorManager();
    this.editorEvents = new EditorEvents();
  }

  init(tileAttributes: any) {
    let editorId: any = `gjs-${this.getEditorId()}`;
    this.pageTitle = tileAttributes.Text;
    this.createNewEditor(editorId);
    const childEditor = this.editorManager.initializeGrapesEditor(editorId);

    const setUpEditor = (converter: any) => {
      if (converter) {
          const htmlOutput = converter.generateHTML();
          childEditor.setComponents(htmlOutput);        
          localStorage.setItem(`data-${this.pageId}`, JSON.stringify(this.pageData));
      } else {
          console.error("Invalid PageType or pageData is undefined:", this.pageData);
      }
    }

    let converter;
    if (this.pageData?.PageType === "Menu") {
      converter = new JSONToGrapesJSMenu(this.pageData);
      setUpEditor(converter);
    } else if(this.pageData?.PageType === "Content") {
        converter = new JSONToGrapesJSContent(this.pageData);
        setUpEditor(converter);
    } else if(this.pageData?.PageType === "WebLink" || this.pageData?.PageType === "DynamicForm") {
        const urlPageEditor =  new UrlPageEditor(childEditor);
        urlPageEditor.initialise(tileAttributes.Action);
    }

    this.editorEvents.init(childEditor, this.pageId, editorId);
    this.editorManager.finalizeEditorSetup(childEditor);
    this.themeManager.applyTheme(this.themeManager.currentTheme);
  }

  createNewEditor(editorId: string) {
    const frameContainer = document.getElementById(
      "child-container"
    ) as HTMLElement;
    const newEditor = new EditorFrame(editorId, false, this.pageTitle);
    newEditor.render(frameContainer);
  }

  getEditorId(): number {
    let id = 0;
    const framelist = document.querySelectorAll(".mobile-frame");
      framelist.forEach((frame: any) => {
        id++;
    });
    return id;
  }
}
