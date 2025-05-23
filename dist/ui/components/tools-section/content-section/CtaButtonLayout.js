import { CtaManager } from "../../../../controls/themes/CtaManager";
export class CtaButtonLayout {
    constructor() {
        this.ctaManager = new CtaManager();
        this.container = document.createElement('div');
        this.init();
    }
    init() {
        this.container.classList.add('cta-button-layout-container');
        this.container.style.display = "none";
        const plainBtn = document.createElement('button');
        plainBtn.classList.add('cta-button-layout');
        plainBtn.id = 'plain-button-layout';
        plainBtn.innerText = "Button";
        const imgBtn = document.createElement('button');
        imgBtn.classList.add('cta-button-layout');
        imgBtn.id = 'image-button-layout';
        imgBtn.innerHTML = `
            <span class="img-button-icon">
                <img src="Resources/UCGrapes1/toolbox/public/images/food.png" alt="img-button-icon" width="35px" height="auto">  
            </span>
            <label>Button</label>
            <i class="fa fa-angle-right img-button-arrow"></i>
        `;
        const iconBtn = document.createElement('button');
        iconBtn.classList.add('cta-button-layout');
        iconBtn.id = 'icon-button-layout';
        iconBtn.innerHTML = `
            <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 35.401 42.251">
                    <path id="calendar" d="M31.713,3.7H28.858V.849a1.713,1.713,0,0,0-3.425,0h0V3.7H15.157V.849a1.713,1.713,0,1,0-3.425,0h0V3.7H8.877A6.281,6.281,0,0,0,2.6,9.984h0V35.106a6.281,6.281,0,0,0,6.281,6.281H31.716A6.281,6.281,0,0,0,38,35.106h0V9.984A6.281,6.281,0,0,0,31.716,3.7h0ZM8.876,7.13H11.73V9.984a1.713,1.713,0,1,0,3.425,0h0V7.13H25.432V9.984a1.713,1.713,0,0,0,3.425,0h0V7.13h2.855a2.855,2.855,0,0,1,2.855,2.855h0v6.281H6.018V9.984A2.855,2.855,0,0,1,8.873,7.13h0ZM31.713,37.96H8.874A2.855,2.855,0,0,1,6.02,35.106h0V19.69H34.568V35.106a2.855,2.855,0,0,1-2.855,2.855Z" transform="translate(-2.596 0.864)" fill="#747474"/>
                </svg>
            </span>
            <label>Button</label>
            <i class="fa fa-angle-right img-button-arrow"></i>
        `;
        plainBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.ctaManager.changeToPlainButton();
        });
        iconBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.ctaManager.changeToIconButton();
        });
        imgBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.ctaManager.changeToImgButton();
        });
        this.container.appendChild(plainBtn);
        this.container.appendChild(iconBtn);
        this.container.appendChild(imgBtn);
    }
    render(container) {
        container.appendChild(this.container);
    }
}
//# sourceMappingURL=CtaButtonLayout.js.map