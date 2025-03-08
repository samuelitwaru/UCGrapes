import { ChildEditor } from "./ChildEditor";

export class EditorEvents {
    editor: any;

    constructor(editor: any) {
        this.editor = editor;
        this.init();
    }

    private init() {
        this.onLoad();
        this.onDragAndDrop();
        this.onSelected();
    }

    onLoad() {
        
    }

    onDragAndDrop() {

    }

    onSelected() {
        this.editor.on("component:selected", (component: any) => {
            console.log(component);
            const childEditor = new ChildEditor();
            childEditor.init();
        })
    }

    createNewEditor () {

    }
}