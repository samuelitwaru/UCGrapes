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
    
    ctaActionDisplay () {
        const contentSection = document.querySelector("#content-page-section");
        const ctaActionDiv = document.createElement("div")
        console.log("this.selectedComponent", contentSection);
        ctaActionDiv.id = "cta-selected-actions";
        ctaActionDiv.style.display = "flex";

        const type = document.createElement("span");
        type.innerHTML = `<strong>Type:</strong> ${this.ctaAttributes.CtaType}`;
        ctaActionDiv.appendChild(type);

        const action = document.createElement("span");
        action.innerHTML = `<strong>Action:</strong> ${truncateString(this.ctaAttributes.CtaAction, 30)}`;
        ctaActionDiv.appendChild(action);

        contentSection?.appendChild(ctaActionDiv);
    }
}