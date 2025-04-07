import { ActionInput } from "../../ui/components/tools-section/content-section/ActionInput";
import { truncateString } from "../../utils/helpers";
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
        this.ctaActionDisplay();
        this.selectedButtonLayout();
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

    private selectedButtonLayout() {
        if (this.ctaAttributes) {
            let buttons = document.querySelectorAll(".cta-button-layout") as NodeListOf<HTMLElement>;
            buttons.forEach((button) => {
                if (this.ctaAttributes.CtaButtonType === "FullWidth" && button.id === "plain-button-layout") {
                    button.style.border = "2px solid #5068a8";
                } else if (this.ctaAttributes.CtaButtonType === "Icon" && button.id === "icon-button-layout") {
                    button.style.border = "2px solid #5068a8";
                } else if (this.ctaAttributes.CtaButtonType === "Image" && button.id === "image-button-layout") {
                    button.style.border = "2px solid #5068a8";
                } else {
                    button.style.border = "";                    
                }
            });
            
        }
    }

    ctaColorAttributes() {        
        const contentSection = document.querySelector("#content-page-section");
        const colorItems = contentSection?.querySelectorAll(".color-item > input");
        let ctaColorAttribute = this.themeManager.getThemeCtaColor(this.ctaAttributes.CtaBGColor);

        colorItems?.forEach((input: any) => {
            if (input.value === ctaColorAttribute) {
                input.checked = true;
            }
        });
    }  
    
    ctaActionDisplay () {
        const contentSection = document.querySelector("#content-page-section");
        const value = this.ctaAttributes.CtaLabel;
        const actionInput = new ActionInput(value, this.ctaAttributes);
        actionInput.render(contentSection as HTMLElement);
    }
}