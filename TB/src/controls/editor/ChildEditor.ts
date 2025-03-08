import { EditorFrame } from "../../ui/components/editor-content/EditorFrame";
import { EditorManager } from "./EditorManager";
import { JSONToGrapesJS } from "./JSONToGrapesJS";

export class ChildEditor {
    editorManager: EditorManager;

    constructor(){
        this.editorManager = new EditorManager();
    }

    init(){
        this.createNewEditor();
        const childEditor = this.editorManager.initializeGrapesEditor('gjs-1');
        const jsonData = {"PageId":"1b7cab12-fd15-4a87-ab1a-154dcd419cec","PageName":"Home","Row":[{"Col":[{"Tile":{"TileName":"TITLE","TileText":"TITLE","TileIcon":"","TileColor":"#ffffff","TileAlignment":"center","TileBGColor":"#2c405a","TileBGImageUrl":"","TileBGImageOpacity":"0","TileAction":{"ObjectType":"Page","ObjectId":"00000000-0000-0000-0000-000000000000","ObjectUrl":""}}}]},{"Col":[{"Tile":{"TileName":"Calendar","TileText":"Calendar","TileIcon":"Stamp","TileColor":"#333333","TileAlignment":"left","TileBGColor":"#ffffff","TileBGImageUrl":"","TileBGImageOpacity":"0","TileAction":{"ObjectType":"Predefined Page, Calendar","ObjectId":"8c29c860-9a83-47ae-acd2-f4bb4b57f0ef","ObjectUrl":""}}},{"Tile":{"TileName":"Mailbox","TileText":"Mailbox","TileIcon":"Calendar","TileColor":"#333333","TileAlignment":"left","TileBGColor":"#ffffff","TileBGImageUrl":"","TileBGImageOpacity":"0","TileAction":{"ObjectType":"Predefined Page, Mailbox","ObjectId":"cd0be4fc-efc2-4da5-9028-f6cb0927219c","ObjectUrl":""}}}]},{"Col":[{"Tile":{"TileName":"Title","TileText":"Title","TileIcon":"","TileColor":"#333333","TileAlignment":"center","TileBGColor":"#ffffff","TileBGImageUrl":"","TileBGImageOpacity":"0","TileAction":{"ObjectType":"Page","ObjectId":"00000000-0000-0000-0000-000000000000","ObjectUrl":""}}},{"Tile":{"TileName":"Title","TileText":"Title","TileIcon":"","TileColor":"#333333","TileAlignment":"center","TileBGColor":"#ffffff","TileBGImageUrl":"","TileBGImageOpacity":"0","TileAction":{"ObjectType":"Page","ObjectId":"00000000-0000-0000-0000-000000000000","ObjectUrl":""}}},{"Tile":{"TileName":"Title","TileText":"Title","TileIcon":"","TileColor":"#333333","TileAlignment":"center","TileBGColor":"#ffffff","TileBGImageUrl":"","TileBGImageOpacity":"0","TileAction":{"ObjectType":"Page","ObjectId":"00000000-0000-0000-0000-000000000000","ObjectUrl":""}}}]},{"Col":[{"Tile":{"TileName":"Lorem","TileText":"Lorem","TileIcon":"","TileColor":"#333333","TileAlignment":"left","TileBGColor":"#ffffff","TileBGImageUrl":"","TileBGImageOpacity":"0","TileAction":{"ObjectType":"Service/Product Page, Lorem","ObjectId":"b3722522-8f14-4a0d-be87-6119ed03e8ef","ObjectUrl":""}}}]},{"Col":[{"Tile":{"TileName":"Laundry","TileText":"Laundry","TileIcon":"","TileColor":"#333333","TileAlignment":"left","TileBGColor":"#ffffff","TileBGImageUrl":"","TileBGImageOpacity":"0","TileAction":{"ObjectType":"Service/Product Page, Laundry","ObjectId":"44e2cc17-eae4-425f-ac71-d3e62c2cbc61","ObjectUrl":""}}},{"Tile":{"TileName":"Repair","TileText":"Repair","TileIcon":"","TileColor":"#333333","TileAlignment":"left","TileBGColor":"#ffffff","TileBGImageUrl":"","TileBGImageOpacity":"0","TileAction":{"ObjectType":"Service/Product Page, Repair","ObjectId":"f2425cbd-b1c9-440b-8c47-0ceeed445726","ObjectUrl":""}}}]},{"Col":[{"Tile":{"TileName":"Very Long Title","TileText":"Very Long Title","TileIcon":"","TileColor":"#333333","TileAlignment":"left","TileBGColor":"#ffffff","TileBGImageUrl":"","TileBGImageOpacity":"0","TileAction":{"ObjectType":"Service/Product Page, Very Long Service Title Which Should be Cropped","ObjectId":"04166b3f-5cdd-477a-b0cc-ca1d2a8f1c71","ObjectUrl":""}}}]},{"Col":[]},{"Col":[]}]}
        const converter = new JSONToGrapesJS(jsonData);
        const htmlOutput = converter.generateHTML();
        childEditor.setComponents(htmlOutput);

        this.editorManager.finalizeEditorSetup(childEditor);
    }

    createNewEditor () {
        const frameContainer = document.getElementById('child-container') as HTMLElement;
        const newEditor = new EditorFrame('gjs-1', false);
        newEditor.render(frameContainer);
    }


}