export class FrameEvent {
    constructor(frameId) {
        this.frameId = frameId;
    }
    init() {
        const frame = document.getElementById(this.frameId);
        if (frame) {
            frame.addEventListener("click", (e) => {
                console.log("frameClickListener", this.frameId);
            });
        }
    }
    activateEditor() {
        const framelist = document.querySelectorAll('.mobile-frame');
        framelist.forEach((frame) => {
            frame.classList.remove('active-editor');
            if (frame.id.includes(this.frameId)) {
                frame.classList.add('active-editor');
            }
        });
    }
}
//# sourceMappingURL=FrameEvent.js.map