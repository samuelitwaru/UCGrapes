import { EditorFrame } from "./EditorFrame";

export class FrameList {
    container: HTMLElement;
    editorId: any;
    pageData: any;

    constructor(editorId: any, pageData:any) {
        this.editorId = editorId;
        this.pageData = pageData
        this.container = document.createElement("div");
        this.init();
    }

    init() {
        this.container.style.justifyContent = "center";
        this.container.className = "frame-list";
        this.container.id = "child-container";

        const editorFrame = new EditorFrame(`${this.editorId}`, true, this.pageData);
        editorFrame.render(this.container);
    }

    render(container: HTMLElement) {
        container.appendChild(this.container);
    }
}