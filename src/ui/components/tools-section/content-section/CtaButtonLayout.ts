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
        this.container.style.flexDirection = "column";

        // --- Top row container for ellipseBtn and plainBtn ---
        const topRow = document.createElement('div');
        topRow.style.display = "flex";
        topRow.style.flexDirection = "row";
        topRow.style.gap = "9.73px"; // Optional: space between buttons

        const plainBtn = document.createElement('button');
        plainBtn.classList.add('cta-button-layout');
        plainBtn.id = 'plain-button-layout';
        plainBtn.innerHTML = "<label>Button</label>";

        const ellipseBtn = document.createElement('div');
        // ellipseBtn.classList.add("call-to-action-item");
        ellipseBtn.innerHTML = `
        <svg class="cta-button-layout" id="round-button-layout" xmlns="http://www.w3.org/2000/svg" width="36.269" height="36.269" viewBox="0 0 36.269 36.269">
                <g id="Group_2511" data-name="Group 2511" transform="translate(-1615 -188)">
                    <g id="Group_2503" data-name="Group 2503" transform="translate(-73 -180)">
                    <g id="Group_685" data-name="Group 685" transform="translate(1688 368)">
                        <g id="Ellipse_108" data-name="Ellipse 108" fill="#e9e9e9" stroke="#e2e2e2" stroke-width="1">
                        <circle cx="18.134" cy="18.134" r="18.134" stroke="none"/>
                        <circle cx="18.134" cy="18.134" r="17.634" fill="none"/>
                        </g>
                    </g>
                    </g>
                    <path id="Path_2462" data-name="Path 2462" d="M12.426,18.769,17.607,21.9a1.079,1.079,0,0,0,1.609-1.169l-1.375-5.895,4.579-3.967A1.079,1.079,0,0,0,21.8,8.975l-6.027-.511L13.419,2.9a1.08,1.08,0,0,0-1.988,0L9.074,8.464l-6.027.511a1.079,1.079,0,0,0-.615,1.891L7.01,14.833,5.635,20.728A1.079,1.079,0,0,0,7.244,21.9Z" transform="translate(1620.711 193.984)" fill="#afadad"/>
                </g>
            </svg>
    `;

        // Add event listeners as before...
        plainBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.ctaManager.changeToPlainButton();
        });
        ellipseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.ctaManager.changeToElipseButton();
        });

        // Add both to the top row
        topRow.appendChild(ellipseBtn);
        topRow.appendChild(plainBtn);

        // --- Other buttons as before ---
        const imgBtn = document.createElement('button');
        imgBtn.classList.add('cta-button-layout');
        imgBtn.id = 'image-button-layout';
        imgBtn.innerHTML = `
        <span class="img-button-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <g id="Group_2502" data-name="Group 2502" transform="translate(-1629 -379)">
                <rect id="Rectangle_2452" data-name="Rectangle 2452" width="32" height="32" rx="6" transform="translate(1629 379)" fill="#fff"/>
                <path id="Path_1040" data-name="Path 1040" d="M14.106,11.025A1.511,1.511,0,0,0,12.671,12.6a1.511,1.511,0,0,0,1.436,1.576A1.511,1.511,0,0,0,15.542,12.6,1.511,1.511,0,0,0,14.106,11.025Zm6.461,4.728-5.025,6.3-3.589-3.94L8.044,23.632H25.951Z" transform="translate(1628.003 377.671)" fill="#afadad"/>
            </g>
        </svg>
        </span>
        <label>Button</label>
        <i class="fa fa-angle-right img-button-arrow"></i>
    `;

        const iconBtn = document.createElement('button');
        iconBtn.classList.add('cta-button-layout');
        iconBtn.id = 'icon-button-layout';
        iconBtn.innerHTML = `
        <span style="display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="36.269" height="36.269" viewBox="0 0 36.269 36.269">
                <g id="Group_2511" data-name="Group 2511" transform="translate(-1615 -188)">
                    <g id="Group_2503" data-name="Group 2503" transform="translate(-73 -180)">
                    <g id="Group_685" data-name="Group 685" transform="translate(1688 368)">
                        <g id="Ellipse_108" data-name="Ellipse 108" fill="none" stroke="none" stroke-width="1">
                        <circle cx="18.134" cy="18.134" r="18.134" stroke="none"/>
                        <circle cx="18.134" cy="18.134" r="17.634" fill="none"/>
                        </g>
                    </g>
                    </g>
                    <path id="Path_2462" data-name="Path 2462" d="M12.426,18.769,17.607,21.9a1.079,1.079,0,0,0,1.609-1.169l-1.375-5.895,4.579-3.967A1.079,1.079,0,0,0,21.8,8.975l-6.027-.511L13.419,2.9a1.08,1.08,0,0,0-1.988,0L9.074,8.464l-6.027.511a1.079,1.079,0,0,0-.615,1.891L7.01,14.833,5.635,20.728A1.079,1.079,0,0,0,7.244,21.9Z" transform="translate(1620.711 193.984)" fill="#afadad"/>
                </g>
            </svg>
        </span>
        <label>Button</label>
        <i class="fa fa-angle-right img-button-arrow"></i>
    `;

        iconBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.ctaManager.changeToIconButton();
        });

        imgBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.ctaManager.changeToImgButton();
        });

        // Append the top row first, then the other buttons
        this.container.appendChild(topRow);
        this.container.appendChild(iconBtn);
        this.container.appendChild(imgBtn);
    }

    public render(container: HTMLElement) {
        container.appendChild(this.container);
    }
}