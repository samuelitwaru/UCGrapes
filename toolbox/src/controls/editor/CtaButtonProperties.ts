import { ThemeManager } from "../themes/ThemeManager";

export class CtaButtonProperties {
    ctaAttributes: any;
    selectedComponent: any;
    themeManager: any;

    constructor(selectedComponent: any, ctaAttributes: any) {
        this.selectedComponent = selectedComponent;
        this.ctaAttributes = ctaAttributes;
        this.themeManager = new ThemeManager();
    }

    public setctaAttributes() {
        this.ctaColorAttributes();
    }

    ctaColorAttributes() {        
        const contentSection = document.querySelector("#content-page-section");
        console.log("this.contentSection", contentSection);
        const colorItems = contentSection?.querySelectorAll(".color-item > input");
        let ctaColorAttribute = this.themeManager.getThemeCtaColor(this.ctaAttributes.CtaBGColor);

        colorItems?.forEach((input: any) => {
            if (input.value === ctaColorAttribute) {
                input.checked = true;
            }
        });
    }
    
}