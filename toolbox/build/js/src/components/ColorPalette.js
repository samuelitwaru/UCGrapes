"use strict";
class ColorPalette {
    constructor(colors, containerId) {
        this.paletteContainer = document.createElement('div');
        this.paletteContainer.className = 'color-palette';
        this.paletteContainer.id = containerId;
        colors.forEach(color => {
            const colorItem = document.createElement('div');
            colorItem.className = 'color-item';
            const input = document.createElement('input');
            input.type = 'radio';
            input.id = `color-${color.id}`;
            input.name = 'theme-color';
            input.value = color.hex;
            const label = document.createElement('label');
            label.htmlFor = `color-${color.id}`;
            label.className = 'color-box';
            label.setAttribute('data-tile-bgcolor', color.hex);
            label.style.backgroundColor = color.hex;
            colorItem.appendChild(input);
            colorItem.appendChild(label);
            this.paletteContainer.appendChild(colorItem);
        });
    }
    ;
    render(container) {
        container.appendChild(this.paletteContainer);
    }
}
// Example usage:
const colors = [
    { id: "ButtonBgColor", name: "Button Background", hex: "#a48f79" },
    { id: "accentColor", name: "Accent Color", hex: "#393736" },
    { id: "backgroundColor", name: "Background Color", hex: "#2c405a" },
    { id: "borderColor", name: "Border Color", hex: "#666e61" },
    { id: "buttonTextColor", name: "Button Text", hex: "#d4a76a" },
    { id: "cardBgColor", name: "Card Background", hex: "#969674" },
    { id: "cardTextColor", name: "Card Text", hex: "#b2b997" },
    { id: "primaryColor", name: "Primary Color", hex: "#c4a082" },
    { id: "secondaryColor", name: "Secondary Color", hex: "#e9c4aa" },
    { id: "textColor", name: "Text Color", hex: "#b7b7b7" }
];
const colorPalette = new ColorPalette(colors, 'theme-color-palette');
colorPalette.render(document.body);
//# sourceMappingURL=ColorPalette.js.map