import { CtaManager } from "../../../../controls/themes/CtaManager";

export class CtaColorPalette {
    colorList: any;
    container: HTMLElement;
    ctaManager: CtaManager;

    constructor(colorList: any) {
        this.colorList = colorList;
        this.ctaManager = new CtaManager();
        this.container = document.createElement('div');
        this.init();
    }

    private init() {
        this.container.classList.add('cta-style');
        this.container.id = 'cta-style';
        this.container.style.display = "flex";

        const paletteDiv = document.createElement('div');
        paletteDiv.classList.add('text-color-palette');
        paletteDiv.classList.add('text-colors');
        paletteDiv.id = "cta-color-palette";

        this.colorList.forEach((color: any) => {
            const colorItem = document.createElement("div");
            colorItem.classList.add("color-item");

            const input = document.createElement("input");
            input.type = "radio";
            input.name = "cta-color";
            input.value = color.CtaColorCode
            input.id = color.CtaColorCode;

            const label = document.createElement("label");
            label.setAttribute("for", color.CtaColorCode);
            label.classList.add("color-box");
            label.style.backgroundColor = color.CtaColorCode;

            colorItem.appendChild(input);
            colorItem.appendChild(label);
            paletteDiv.appendChild(colorItem);

            label.addEventListener('click', () => {
                this.ctaManager.changeCtaColor(color);
            })

            paletteDiv.appendChild(colorItem);
        });

        this.container.appendChild(paletteDiv);
    }

    render(container: HTMLElement) {
        container.appendChild(this.container);
    }

    refresh(container: HTMLElement) {
        const existingComponent = document.getElementById('cta-style');
    
        if (existingComponent) {
          existingComponent.replaceWith(this.container);
        } else {
          container.appendChild(this.container);
        }
    }
}