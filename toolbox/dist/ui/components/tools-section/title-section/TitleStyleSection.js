import { TextColor } from "./TextColor";
import { TileAlignmentSection } from "./TileAlignmentSection";
export class TitleStyleSection {
    constructor() {
        this.container = document.createElement("div");
        this.init();
    }
    init() {
        this.container.classList.add("title-style");
        const textColorSection = new TextColor("tile");
        const tileAlignmentSection = new TileAlignmentSection();
        textColorSection.render(this.container);
        tileAlignmentSection.render(this.container);
    }
    render(container) {
        container.appendChild(this.container);
    }
}
//# sourceMappingURL=TitleStyleSection.js.map