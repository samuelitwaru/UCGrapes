import { CreateCTA } from "./CreateCTA";

export class CtaButtonLayout {
    container: HTMLElement;
    constructor() {
        new CreateCTA();
        this.container = document.createElement('div');
        this.init();
    }

    private init() {
        this.container.classList.add('cta-button-layout-container');
        this.container.style.display = "none";

        const plainBtn = document.createElement('button');
        plainBtn.classList.add('tb-btn', 'cta-button-layout');
        plainBtn.id = 'plain-button-layout';

        const imgBtn = document.createElement('button');
        imgBtn.classList.add('tb-btn', 'cta-button-layout');
        imgBtn.id = 'image-button-layout';
        imgBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40.999 28.865">
                <path id="Path_1040" data-name="Path 1040" d="M21.924,11.025a3.459,3.459,0,0,0-3.287,3.608,3.459,3.459,0,0,0,3.287,3.608,3.459,3.459,0,0,0,3.287-3.608A3.459,3.459,0,0,0,21.924,11.025ZM36.716,21.849l-11.5,14.432-8.218-9.02L8.044,39.89h41Z" transform="translate(-8.044 -11.025)" fill="#4c5357"></path>
            </svg>
            Button
        `;

        this.container.appendChild(plainBtn);
        this.container.appendChild(imgBtn);
    }

    public render(container: HTMLElement) {
        container.appendChild(this.container);
    }
}