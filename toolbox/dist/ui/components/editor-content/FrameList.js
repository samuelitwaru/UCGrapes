import { EditorFrame } from "./EditorFrame";
export class FrameList {
    constructor(pageId) {
        this.pageId = pageId;
        this.container = document.createElement("div");
        this.init();
    }
    init() {
        this.container.style.justifyContent = "center";
        this.container.className = "frame-list";
        this.container.id = "child-container";
        const editorFrame = new EditorFrame(`${this.pageId}`, true);
        editorFrame.render(this.container);
    }
    render(container) {
        container.appendChild(this.container);
    }
}
//# sourceMappingURL=FrameList.js.map