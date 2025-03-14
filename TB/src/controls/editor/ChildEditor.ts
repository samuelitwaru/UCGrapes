import { EditorFrame } from "../../ui/components/editor-content/EditorFrame";
import { randomIdGenerator } from "../../utils/helpers";
import { EditorEvents } from "./EditorEvents";
import { EditorManager } from "./EditorManager";
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
    this.editorEvents = new EditorEvents(this.editorManager);
  }

  init() {
    let editorId: any = `gjs-${this.getEditorId()}`;
    this.createNewEditor(editorId);
    const childEditor = this.editorManager.initializeGrapesEditor(editorId);
    const converter = new JSONToGrapesJSMenu(this.pageData);
    const htmlOutput = converter.generateHTML();
    childEditor.setComponents(htmlOutput);
    // console.log(this.pageData)
    this.editorEvents.init(childEditor, this.pageId, editorId);
    this.editorManager.finalizeEditorSetup(childEditor);
    localStorage.setItem(`data-${this.pageId}`, JSON.stringify(this.pageData));
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
