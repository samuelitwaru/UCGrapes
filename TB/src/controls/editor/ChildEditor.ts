import { EditorFrame } from "../../ui/components/editor-content/EditorFrame";
import { EditorEvents } from "./EditorEvents";
import { EditorManager } from "./EditorManager";
import { JSONToGrapesJS } from "./JSONToGrapesJS";

export class ChildEditor {
    editorManager: EditorManager;
    editorEvents: EditorEvents;
    pageId: any;
    pageData: any;


    constructor(pageId: any, pageData: any){
        this.pageId = pageId;
        this.pageData = pageData;
        this.editorManager = new EditorManager();
        this.editorEvents = new EditorEvents(this.editorManager);
    }

    init(){
        this.createNewEditor();
        const childEditor = this.editorManager.initializeGrapesEditor('gjs-'+this.pageId);
        const converter = new JSONToGrapesJS(this.pageData);
        const htmlOutput = converter.generateHTML();
        childEditor.setComponents(htmlOutput);
        // console.log(this.pageData)
        this.editorEvents.init(childEditor, this.pageId);
        this.editorManager.finalizeEditorSetup(childEditor);
        localStorage.setItem(`data-${this.pageId}`, JSON.stringify(this.pageData));
    }

    createNewEditor () {
        const frameContainer = document.getElementById('child-container') as HTMLElement;
        const newEditor = new EditorFrame('gjs-'+this.pageId, false, this.pageData.PageName);
        newEditor.render(frameContainer);
    }


}