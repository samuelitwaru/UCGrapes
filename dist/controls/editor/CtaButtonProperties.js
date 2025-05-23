import { ActionInput } from "../../ui/components/tools-section/content-section/ActionInput";
import { TextColor } from "../../ui/components/tools-section/title-section/TextColor";
import { ThemeManager } from "../themes/ThemeManager";
export class CtaButtonProperties {
    constructor(selectedComponent, ctaAttributes) {
        this.selectedComponent = selectedComponent;
        this.ctaAttributes = ctaAttributes;
        this.themeManager = new ThemeManager();
        this.pageData = globalThis.pageData;
    }
    setctaAttributes() {
        this.waitForButtonLayoutContainer(() => {
            this.displayButtonLayouts();
            this.ctaColorAttributes();
            this.ctaActionDisplay();
            this.selectedButtonLayout();
            this.ctaLabelColor();
        });
    }
    waitForButtonLayoutContainer(callback) {
        const interval = setInterval(() => {
            const buttonLayoutContainer = document === null || document === void 0 ? void 0 : document.querySelector(".cta-button-layout-container");
            const contentSection = document === null || document === void 0 ? void 0 : document.querySelector("#content-page-section");
            if (buttonLayoutContainer && contentSection) {
                clearInterval(interval);
                callback();
            }
        }, 100);
    }
    displayButtonLayouts() {
        const buttonLayoutContainer = document === null || document === void 0 ? void 0 : document.querySelector(".cta-button-layout-container");
        if (!buttonLayoutContainer)
            return;
        const shouldDisplay = this.pageData.PageType === "Information"
            ? this.selectedComponent.is('info-cta-section')
            : this.selectedComponent.parent().getClasses().includes("cta-button-container");
        buttonLayoutContainer.style.display = shouldDisplay ? "flex" : "none";
    }
    selectedButtonLayout() {
        if (this.ctaAttributes) {
            let buttons = document.querySelectorAll(".cta-button-layout");
            buttons.forEach((button) => {
                if (this.ctaAttributes.CtaButtonType === "FullWidth" && button.id === "plain-button-layout") {
                    button.style.border = "2px solid #5068a8";
                }
                else if (this.ctaAttributes.CtaButtonType === "Icon" && button.id === "icon-button-layout") {
                    button.style.border = "2px solid #5068a8";
                }
                else if (this.ctaAttributes.CtaButtonType === "Image" && button.id === "image-button-layout") {
                    button.style.border = "2px solid #5068a8";
                }
                else {
                    button.style.border = "";
                }
            });
        }
    }
    ctaColorAttributes() {
        var _a;
        const contentSection = document.querySelector("#content-page-section");
        const colorItems = contentSection === null || contentSection === void 0 ? void 0 : contentSection.querySelectorAll(".color-item > input");
        let ctaColorAttribute = this.themeManager.getThemeCtaColor((_a = this.ctaAttributes) === null || _a === void 0 ? void 0 : _a.CtaBGColor);
        colorItems === null || colorItems === void 0 ? void 0 : colorItems.forEach((input) => {
            if (input.value === ctaColorAttribute) {
                input.checked = true;
            }
        });
    }
    ctaActionDisplay() {
        var _a;
        const contentSection = document.querySelector("#content-page-section");
        const value = (_a = this.ctaAttributes) === null || _a === void 0 ? void 0 : _a.CtaLabel;
        const actionInput = new ActionInput(value, this.ctaAttributes);
        actionInput.render(contentSection);
    }
    ctaLabelColor() {
        var _a;
        const contentSection = document.querySelector("#content-page-section");
        const labelColor = new TextColor("cta");
        labelColor.render(contentSection);
        const color = (_a = this.ctaAttributes) === null || _a === void 0 ? void 0 : _a.CtaColor;
        const ctaColorSection = contentSection === null || contentSection === void 0 ? void 0 : contentSection.querySelector("#text-color-palette");
        const ctaColorsOptions = ctaColorSection === null || ctaColorSection === void 0 ? void 0 : ctaColorSection.querySelectorAll("input");
        ctaColorsOptions === null || ctaColorsOptions === void 0 ? void 0 : ctaColorsOptions.forEach((option) => {
            if (option.value === color) {
                option.checked = true;
            }
            else {
                option.checked = false;
            }
        });
    }
}
//# sourceMappingURL=CtaButtonProperties.js.map