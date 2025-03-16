export class TileProperties {
    tileAttributes: any;
    selectedComponent: any;

    constructor(selectedComponent: any, tileAttributes: any) {
        this.tileAttributes = tileAttributes;
        this.selectedComponent = selectedComponent;
    }

    public setTileAttributes() {
        this.setBgColorProperties();
        this.setOpacityProperties();
        this.setTitleStyleProperties();
        this.setTileActionProperties();
    }

    private setBgColorProperties(): void {
        const themeColors = document.getElementById('theme-color-palette');
        const tileBGColor = this.selectedComponent.getStyle()?.['background-color'];
        const hasBgImage: boolean = this.selectedComponent.getStyle()?.['background-image'];
        const tileBgColorAttr = this.tileAttributes.BGColor;
        if (hasBgImage) {
            console.log('has bg image');
        }
        const colorBoxes: any = themeColors?.children;
        for (let i = 0; i < colorBoxes.length; i++) {
            const colorBox = colorBoxes[i] as HTMLElement;
            const inputBox = colorBox.querySelector("input") as HTMLInputElement;
            if (!hasBgImage && (tileBGColor === tileBgColorAttr && tileBGColor === inputBox.value)) {
                inputBox.checked = true;
            } else {
                inputBox.checked = false;
            }            
        }
    }

    private setOpacityProperties(): void {
        const tileBgImageAttrUrl = this.tileAttributes.BGImageUrl;
        const tileBgImageAttrOpacity = this.tileAttributes.Opacity;
        const bgImageStyle = this.selectedComponent.getStyle()?.['background-image'];
        let tileBGImage = '';

        if (bgImageStyle && bgImageStyle.startsWith("url(")) {
            tileBGImage = bgImageStyle.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        }

        if (tileBGImage && tileBgImageAttrUrl) { 
            if (tileBGImage === tileBgImageAttrUrl) {
                const opactySection = document.querySelector('.tile-img-section');
                if (opactySection) {
                    const slider = opactySection.querySelector('#slider-wrapper') as HTMLElement;
                    slider.style.display = 'flex';
                    const input = opactySection.querySelector("#bg-opacity") as HTMLInputElement;
                    input.value = tileBgImageAttrOpacity;
                    const opacityValue = opactySection.querySelector('#valueDisplay') as HTMLElement;
                    opacityValue.textContent = tileBgImageAttrOpacity + '%';
                    const tileImageSection = opactySection.querySelector('#tile-img-container') as HTMLElement;
                    tileImageSection.style.display = 'block';
                    const imageThumbnail = tileImageSection.querySelector('#tile-img-thumbnail') as HTMLImageElement;
                    if (imageThumbnail) {
                        imageThumbnail.src = tileBgImageAttrUrl;
                    }
                    this.selectedComponent.addStyle({
                        'background-color': `rgba(0, 0, 0, ${tileBgImageAttrOpacity / 100})`
                    });
                }
            }
        } else {
            const slider = document.querySelector('#slider-wrapper') as HTMLElement;
            const tileImageSection = document.querySelector('#tile-img-container') as HTMLElement;
            slider.style.display = 'none';
            tileImageSection.style.display = 'none';
        }
    }

    private setTitleStyleProperties () {
        const title = document.querySelector('#tile-title') as HTMLInputElement;
        const tileTitle = this.tileAttributes.Text;
        title.value = tileTitle;

        const tileColor = this.tileAttributes.Color;
        const tileColorSection = document.querySelector('#text-color-palette');
        const tileColorsOptions = tileColorSection?.querySelectorAll("input");
        tileColorsOptions?.forEach((option) => {
            if (option.value === tileColor) {
                option.checked = true;
            } else {
                option.checked = false;
            }
        });
    }

    private setTileActionProperties () {
        const tileAlign = this.tileAttributes.Align;
        const tileAlignSection = document.querySelector('.text-alignment');
        const tileAlignsOption = tileAlignSection?.querySelectorAll("input");
        tileAlignsOption?.forEach((option) => {
            if (option.value === tileAlign) {
                option.checked = true;
            } else {
                option.checked = false;
            }
        });
    }

    private setActionProperties(): void {

    }
}