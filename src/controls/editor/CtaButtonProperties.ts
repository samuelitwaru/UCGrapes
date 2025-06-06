import { CallToAction, CtaAttributes } from "../../types";
import { ActionInput } from "../../ui/components/tools-section/content-section/ActionInput";
import { TextColor } from "../../ui/components/tools-section/title-section/TextColor";
import { TileAlignmentSection } from "../../ui/components/tools-section/title-section/TileAlignmentSection";
import { truncateString } from "../../utils/helpers";
import { ThemeManager } from "../themes/ThemeManager";

export class CtaButtonProperties {
    ctaAttributes: CtaAttributes;
    selectedComponent: any;
    themeManager: any;
    pageData: any;

    constructor(selectedComponent: any, ctaAttributes: any) {
        this.selectedComponent = selectedComponent;
        this.ctaAttributes = ctaAttributes;
        this.themeManager = new ThemeManager();
        this.pageData = (globalThis as any).pageData;
    }

    public setctaAttributes() {
        this.waitForButtonLayoutContainer(() => {
            this.checkButtonLayouts();
            this.ctaColorAttributes();
            this.ctaActionDisplay();
            this.ctaLabelColor();
        });
    }

    private waitForButtonLayoutContainer(callback: () => void) {
        const interval = setInterval(() => {
            const buttonLayoutContainer = document?.querySelector(".cta-button-layout-container");
            const contentSection = document?.querySelector("#content-page-section");
            if (buttonLayoutContainer && contentSection) {
                clearInterval(interval);
                callback();
            }
        }, 100);
    }

    private checkButtonLayouts() {
        if (this.ctaAttributes) {
            let buttons = document.querySelectorAll(".cta-button-layout") as NodeListOf<HTMLElement>;
            buttons.forEach((button) => {
                if (this.ctaAttributes.CtaButtonType === "FullWidth" && button.id === "plain-button-layout") {
                    button.style.border = "2px solid #5068a8";
                } else if (this.ctaAttributes.CtaButtonType === "Icon" && button.id === "icon-button-layout") {
                    button.style.border = "2px solid #5068a8";
                } else if (this.ctaAttributes.CtaButtonType === "Image" && button.id === "image-button-layout") {
                    button.style.border = "2px solid #5068a8";
                } else if (this.ctaAttributes.CtaButtonType === "Round" && button.id === "round-button-layout") {
                    button.style.border = "2px solid #5068a8";
                    button.style.borderRadius = "50%";
                } else {
                    button.style.border = "";
                }
            });
        }
    }

    private ctaColorAttributes() {
        const contentSection = document.querySelector("#content-page-section");
        const colorItems = contentSection?.querySelectorAll(".color-item > input");
        let ctaColorAttribute = this.themeManager.getThemeCtaColor(this.ctaAttributes?.CtaBGColor);

        colorItems?.forEach((input: any) => {
            if (input.value === ctaColorAttribute) {
                input.checked = true;
            }
        });
    }

    private ctaActionDisplay() {
        const contentSection = document.querySelector("#content-page-section");
        const labelValue = this.ctaAttributes?.CtaLabel;
        const labelInput = new ActionInput(labelValue, this.ctaAttributes, "label", "cta");
        labelInput.render(contentSection as HTMLElement);

        const actionValue = this.ctaAttributes?.CtaAction;
        const actionInput = new ActionInput(actionValue, this.ctaAttributes, "action", "cta");
        actionInput.render(contentSection as HTMLElement);
    }

    private ctaLabelColor() {
        const contentSection = document.querySelector("#content-page-section");
        const labelColor = new TextColor("cta");
        labelColor.render(contentSection as HTMLElement);

        const color = this.ctaAttributes?.CtaColor;

        const ctaColorSection = contentSection?.querySelector("#text-color-palette");
        const ctaColorsOptions = ctaColorSection?.querySelectorAll("input");
        ctaColorsOptions?.forEach((option) => {
            if (option.value === color) {
                option.checked = true;
            } else {
                option.checked = false;
            }
        });
    }
}