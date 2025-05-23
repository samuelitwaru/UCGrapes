import { CtaButtonProperties } from "../../../../controls/editor/CtaButtonProperties";
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
        this.container.style.display = "flex";
 
        const plainBtn = document.createElement('button');
        plainBtn.classList.add('cta-button-layout');
        plainBtn.id = 'plain-button-layout';
        plainBtn.innerText = "Button";

        const imgBtn = document.createElement('button');
        imgBtn.classList.add('cta-button-layout');
        imgBtn.id = 'image-button-layout';
        imgBtn.innerHTML = `
            <span class="img-button-icon">
                <img src="Resources/UCGrapes/dist/images/food.png" alt="img-button-icon" width="35px" height="auto">  
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

        const elipseBtn = document.createElement('div');
        elipseBtn.classList.add("call-to-action-item")
        elipseBtn.innerHTML = `
            <svg data-gjs-draggable="false" data-gjs-selectable="false" data-gjs-editable="false" data-gjs-highlightable="false" data-gjs-droppable="false" data-gjs-resizable="false" data-gjs-hoverable="false" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 49.417 49.418">
                <path data-gjs-draggable="false" data-gjs-selectable="false" data-gjs-editable="false" data-gjs-highlightable="false" data-gjs-droppable="false" data-gjs-resizable="false" data-gjs-hoverable="false" id="call" d="M29.782,3a2.149,2.149,0,1,0,0,4.3A19.3,19.3,0,0,1,49.119,26.634a2.149,2.149,0,1,0,4.3,0A23.667,23.667,0,0,0,29.782,3ZM12.032,7.305a2.548,2.548,0,0,0-.818.067,8.342,8.342,0,0,0-3.9,2.342C2.775,14.254.366,21.907,17.437,38.98S42.16,53.643,46.7,49.1a8.348,8.348,0,0,0,2.346-3.907,2.524,2.524,0,0,0-1.179-2.786c-2.424-1.418-7.654-4.484-10.08-5.9a2.523,2.523,0,0,0-2.568.012l-4.012,2.392a2.517,2.517,0,0,1-2.845-.168,65.811,65.811,0,0,1-5.711-4.981,65.07,65.07,0,0,1-4.981-5.711A2.512,2.512,0,0,1,17.5,25.2L19.9,21.191a2.533,2.533,0,0,0,.008-2.577L14.012,8.556A2.543,2.543,0,0,0,12.032,7.305Zm17.751,4.289a2.149,2.149,0,1,0,0,4.3A10.709,10.709,0,0,1,40.525,26.634a2.149,2.149,0,1,0,4.3,0A15.072,15.072,0,0,0,29.782,11.594Zm0,8.594a2.149,2.149,0,1,0,0,4.3,2.114,2.114,0,0,1,2.149,2.148,2.149,2.149,0,1,0,4.3,0A6.479,6.479,0,0,0,29.782,20.188Z" transform="translate(-4 -3)" fill="#fff"></path>
            </svg>
        `

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

        elipseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.ctaManager.changeToElipseButton();
        })

        this.container.appendChild(plainBtn);
        this.container.appendChild(iconBtn);
        this.container.appendChild(imgBtn);
        this.container.appendChild(elipseBtn);
    }

    public render(container: HTMLElement) {
        container.appendChild(this.container);
    }
}