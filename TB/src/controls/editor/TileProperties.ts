export class TileProperties {
    tileAttributes: any;
    selectedComponent: any;

    constructor(selectedComponent: any, tileAttributes: any) {
        this.tileAttributes = tileAttributes;
        this.selectedComponent = selectedComponent;
    }

    public setTileAttributes() {
        this.setBgColorProperties();
    }

    private setBgColorProperties(): void {
        const themeColors = document.getElementById('theme-color-palette');
        const tileBGColor = this.selectedComponent.getStyle()?.['background-color'];
        const tileBgColorAttr = this.tileAttributes.BGColor;

        const colorBoxes: any = themeColors?.children;
        for (let i = 0; i < colorBoxes.length; i++) {
            const colorBox = colorBoxes[i] as HTMLElement;
            const inputBox = colorBox.querySelector("input") as HTMLInputElement;
            if (tileBGColor === tileBgColorAttr && tileBGColor === inputBox.value) {
                inputBox.checked = true;
                console.log("true");
            } else {
                inputBox.checked = false;
            }            
        }
    }

    private setOpacityProperties(): void {
        
    }

    private setTileStyleProperties () {

    }

    private setActionProperties(): void {

    }
}