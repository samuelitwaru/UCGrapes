import { EditorFrame } from "../../ui/components/editor-content/EditorFrame";
import { EditorEvents } from "./EditorEvents";
import { EditorManager } from "./EditorManager";
import { JSONToGrapesJS } from "./JSONToGrapesJS";

export class ChildEditor {
    editorManager: EditorManager;
    // editorEvents: EditorEvents

    constructor(){
        this.editorManager = new EditorManager();
        // this.editorEvents = new EditorEvents(this.editorManager);
    }

    init(){
        this.createNewEditor();
        const childEditor = this.editorManager.initializeGrapesEditor('gjs-1');
        const jsonData = {"PageName":"Home","PageId":"12901290129","Content":{"Rows":[{"Id":"1741700734462","Tiles":[{"Id":"1741700736875","Name":"New Tile","Text":"Tile Description","Color":"Red","Align":"left","Icon":"home","BGColor":"White","BGImageUrl":"https://via.placeholder.com/150","Opacity":"50","Action":{"ObjectType":"Page","ObjectId":"12901290129","ObjectUrl":"https://example.com/12901290129"}}]}]}}
        const converter = new JSONToGrapesJS(jsonData);
        const htmlOutput = converter.generateHTML();
        childEditor.setComponents(htmlOutput);
        // this.editorEvents.init(childEditor);
        this.editorManager.finalizeEditorSetup(childEditor);
    }

    createNewEditor () {
        const frameContainer = document.getElementById('child-container') as HTMLElement;
        const newEditor = new EditorFrame('gjs-1', false);
        newEditor.render(frameContainer);
    }


}