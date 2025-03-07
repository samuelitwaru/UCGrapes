import { TitleInputSection } from "./title-section/TitleInputSection";
import { TitleStyleSection } from "./title-section/TitleStyleSection";

export class TitleSection {
    container: HTMLElement;

    constructor() {
        this.container = document.createElement('div');
        this.init();
    }

    init() {
        this.container.className = "sidebar-section title-section";
        const titleInput = new TitleInputSection();
        const titleStyle = new TitleStyleSection();
        

        titleInput.render(this.container);
        titleStyle.render(this.container);
    }

    render (container: HTMLElement) {
        container.appendChild(this.container);
    }
}