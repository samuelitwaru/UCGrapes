import { ThemeColors } from "../../../models/Theme";

export class ColorPalette {
    private paletteContainer: HTMLDivElement;
    private containerId: string;

    constructor(
        colors: ThemeColors,
        containerId: string
    ) {
        this.containerId = containerId;
        this.paletteContainer = document.createElement('div');
        this.paletteContainer.className = 'color-palette'
        this.paletteContainer.id = containerId;

        Object.entries(colors).forEach(([colorName, colorValue]) => {
            const colorItem = document.createElement('div');
            colorItem.className = 'color-item';

            const input = document.createElement('input');
            input.type = 'radio';
            input.id = `color-${colorName}`;
            input.name = 'theme-color';
            input.value = colorValue;

            const label = document.createElement('label');
            label.htmlFor = `color-${colorName}`;
            label.className = 'color-box';
            label.setAttribute('data-tile-bgcolor', colorValue);
            label.style.backgroundColor = colorValue;

            colorItem.appendChild(input);
            colorItem.appendChild(label);
            this.paletteContainer.appendChild(colorItem);
        });
    };

    render(container: HTMLElement) {
            container.appendChild(this.paletteContainer);
    }

    refresh(container: HTMLElement) {
        const existingComponent = document.getElementById(this.containerId);
        
        if (existingComponent) {
            existingComponent.replaceWith(this.paletteContainer);
            console.log(`Replaced existing color palette with ID: ${this.containerId}`);
        } else {
            container.appendChild(this.paletteContainer);
        }
    }
}