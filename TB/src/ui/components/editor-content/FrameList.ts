import { EditorFrame } from "./EditorFrame";

export class FrameList {
    private container: HTMLElement;

    constructor() {
        this.container = document.createElement("div");
        this.init();
    }

    init() {
        this.container.style.justifyContent = "center";
        this.container.className = "frame-list";
        this.container.id = "child-container";

        const editorFrame = new EditorFrame('gjs-0', true);
        editorFrame.render(this.container);
    }

    render(container: HTMLElement) {
        container.appendChild(this.container);
    }
}