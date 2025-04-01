export class FrameEvent {
    frameId: any;

    constructor(frameId: any) {
        this.frameId = frameId;
    }

    init() {
        const frame = document.getElementById(this.frameId);
        if (frame) {    
          console.log("frameClickListener", frame)  
          frame.addEventListener("click", (e: MouseEvent) => {
            console.log("frameClickListener", this.frameId);
          })
        }
    }

    activateEditor () {
        const framelist = document.querySelectorAll('.mobile-frame');
        framelist.forEach((frame: any) => {
          frame.classList.remove('active-editor');
          if (frame.id.includes(this.frameId)) {
            frame.classList.add('active-editor');
          }
        })
    }
}