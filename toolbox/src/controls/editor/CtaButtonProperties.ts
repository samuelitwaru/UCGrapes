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
        this.displayButtonLayouts();
        this.ctaColorAttributes();
    }

    private displayButtonLayouts() {
        const buttonLayoutContainer = document.querySelector(".cta-button-layout-container") as HTMLElement;
        if (this.selectedComponent.parent().getClasses().includes("cta-button-container")) {
            if (buttonLayoutContainer) {
                buttonLayoutContainer.style.display = "flex";
            }
        } else {
            if (buttonLayoutContainer) buttonLayoutContainer.style.display = "none";
        }
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