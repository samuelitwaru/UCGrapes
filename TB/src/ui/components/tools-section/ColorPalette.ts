import { ThemeColors } from "../../../models/Theme";

export class ColorPalette {
    private paletteContainer: HTMLDivElement;

    constructor(
        colors: ThemeColors,
        containerId: string
    ) {
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
}

// Example usage:
// const colors = [
//     { id: "ButtonBgColor", name: "Button Background", hex: "#a48f79" },
//     { id: "accentColor", name: "Accent Color", hex: "#393736" },
//     { id: "backgroundColor", name: "Background Color", hex: "#2c405a" },
//     { id: "borderColor", name: "Border Color", hex: "#666e61" },
//     { id: "buttonTextColor", name: "Button Text", hex: "#d4a76a" },
//     { id: "cardBgColor", name: "Card Background", hex: "#969674" },
//     { id: "cardTextColor", name: "Card Text", hex: "#b2b997" },
//     { id: "primaryColor", name: "Primary Color", hex: "#c4a082" },
//     { id: "secondaryColor", name: "Secondary Color", hex: "#e9c4aa" },
//     { id: "textColor", name: "Text Color", hex: "#b7b7b7" }
// ];


// const colorPalette = new ColorPalette(colors, 'theme-color-palette');
// colorPalette.render(document.body);