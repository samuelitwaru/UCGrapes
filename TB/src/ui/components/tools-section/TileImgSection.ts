import { OpacitySection } from "./tile-image/OpacitySection";
import { TileImgContainer } from "./tile-image/TileImgContainer";

export class TileImgSection {
    container: HTMLElement;
    constructor() {
        this.container = document.createElement('div');
        this.init();
    }

    init() {
        this.container.classList.add('tile-img-section');
        const tileImgContainer = new TileImgContainer();
        const opacitySection = new OpacitySection();

        opacitySection.render(this.container);
        tileImgContainer.render(this.container);
    }

    render(container: HTMLElement) {
        container.appendChild(this.container);        
    }
}