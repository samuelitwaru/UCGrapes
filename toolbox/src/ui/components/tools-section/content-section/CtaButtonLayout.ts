import { CtaManager } from "../../../../controls/themes/CtaManager";

export class CtaButtonLayout {
    container: HTMLElement;
    ctaManager: any;
    constructor() {
        this.ctaManager = new CtaManager();
        this.container = document.createElement('div');
        this.init();
    }

    private init() {
        this.container.classList.add('cta-button-layout-container');
        this.container.style.display = "none";

        const plainBtn = document.createElement('button');
        plainBtn.classList.add('tb-btn', 'cta-button-layout');
        plainBtn.id = 'plain-button-layout';
        plainBtn.innerText = "Plain";

        const imgBtn = document.createElement('button');
        imgBtn.classList.add('tb-btn', 'cta-button-layout');
        imgBtn.id = 'image-button-layout';
        imgBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40.999 28.865">
                <path id="Path_1040" data-name="Path 1040" d="M21.924,11.025a3.459,3.459,0,0,0-3.287,3.608,3.459,3.459,0,0,0,3.287,3.608,3.459,3.459,0,0,0,3.287-3.608A3.459,3.459,0,0,0,21.924,11.025ZM36.716,21.849l-11.5,14.432-8.218-9.02L8.044,39.89h41Z" transform="translate(-8.044 -11.025)" fill="#4c5357"></path>
            </svg>
            Image
        `;

        const iconBtn = document.createElement('button');
        iconBtn.classList.add('tb-btn', 'cta-button-layout');
        iconBtn.id = 'image-button-layout';
        iconBtn.innerHTML = `
            <svg width="800px" height="800px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.135 12.736l-.764 1.058A6.297 6.297 0 1 1 13.281 5h-1.138a5.286 5.286 0 1 0-4.644 7.8 5.201 5.201 0 0 0 .636-.064zM11 6v6.923l1 1.385V7h10v10h-8.056l.723 1H23V6zm6.044 17H1.956L9.5 12.554zM9.5 14.262L3.911 22H15.09z"/>
                <path fill="none" d="M0 0h24v24H0z"/>
            </svg>
            Icon
        `;

        plainBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.ctaManager.changeToPlainButton();
        });

        iconBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.ctaManager.changeToIconButton();
        })

        imgBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.ctaManager.changeToImgButton();
        });

        this.container.appendChild(plainBtn);
        this.container.appendChild(iconBtn);
        this.container.appendChild(imgBtn);
    }

    public render(container: HTMLElement) {
        container.appendChild(this.container);
    }
}