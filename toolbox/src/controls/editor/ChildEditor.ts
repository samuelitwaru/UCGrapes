import { EditorFrame } from "../../ui/components/editor-content/EditorFrame";
import { randomIdGenerator } from "../../utils/helpers";
import { EditorEvents } from "./EditorEvents";
import { EditorManager } from "./EditorManager";
import { JSONToGrapesJSContent } from "./JSONToGrapesJSContent";
import { JSONToGrapesJSMenu } from "./JSONToGrapesJSMenu";

export class ChildEditor {
  editorManager: EditorManager;
  editorEvents: EditorEvents;
  pageId: any;
  pageData: any;

  constructor(pageId: any, pageData: any) {
    this.pageId = pageId;
    this.pageData = pageData;
    this.editorManager = new EditorManager();
    this.editorEvents = new EditorEvents();
  }

  init() {
    let editorId: any = `gjs-${this.getEditorId()}`;
    this.createNewEditor(editorId);
    const childEditor = this.editorManager.initializeGrapesEditor(editorId);
    
    let converter;
    if (this.pageData?.PageType === "Menu") {
      converter = new JSONToGrapesJSMenu(this.pageData);
    } else if(this.pageData?.PageType === "Content") {
        converter = new JSONToGrapesJSContent(this.pageData);
    }

    if (converter) {
        const htmlOutput = converter.generateHTML();
        childEditor.setComponents(htmlOutput);
        this.editorEvents.init(childEditor, this.pageId, editorId);
        this.editorManager.finalizeEditorSetup(childEditor);
        localStorage.setItem(`data-${this.pageId}`, JSON.stringify(this.pageData));
    } else {
        console.error("Invalid PageType or pageData is undefined:", this.pageData);
    }
    
  }

  createNewEditor(editorId: string) {
    const frameContainer = document.getElementById(
      "child-container"
    ) as HTMLElement;
    const newEditor = new EditorFrame(editorId, false, this.pageData.PageName);
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
