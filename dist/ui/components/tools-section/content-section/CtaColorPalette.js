import { CtaManager } from "../../../../controls/themes/CtaManager";
export class CtaColorPalette {
    constructor(colorList) {
        this.colorList = colorList;
        this.ctaManager = new CtaManager();
        this.container = document.createElement('div');
        this.init();
    }
    init() {
        this.container.classList.add('cta-style');
        this.container.id = 'cta-style';
        this.container.style.display = "flex";
        const paletteDiv = document.createElement('div');
        paletteDiv.classList.add('text-color-palette');
        paletteDiv.classList.add('text-colors');
        paletteDiv.id = "cta-color-palette";
        this.colorList.forEach((color) => {
            const colorItem = document.createElement("div");
            colorItem.classList.add("color-item");
            const input = document.createElement("input");
            input.type = "radio";
            input.name = "cta-color";
            input.value = color.CtaColorCode;
            input.id = color.CtaColorCode;
            const label = document.createElement("label");
            label.setAttribute("for", color.CtaColorCode);
            label.classList.add("color-box");
            label.style.backgroundColor = color.CtaColorCode;
            colorItem.appendChild(input);
            colorItem.appendChild(label);
            paletteDiv.appendChild(colorItem);
            colorItem.addEventListener('click', () => {
                this.ctaManager.changeCtaColor(color);
            });
            paletteDiv.appendChild(colorItem);
        });
        this.container.appendChild(paletteDiv);
    }
    render(container) {
        container.appendChild(this.container);
    }
    refresh(container) {
        const existingComponent = document.getElementById('cta-style');
        if (existingComponent) {
            existingComponent.replaceWith(this.container);
        }
        else {
            container.appendChild(this.container);
        }
    }
}
//# sourceMappingURL=CtaColorPalette.js.map