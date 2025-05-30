import { ContentMapper } from "../../../../controls/editor/ContentMapper";
import { InfoSectionManager } from "../../../../controls/InfoSectionManager";
import { CtaAttributes } from "../../../../types";

export class ActionInput {
  input: HTMLInputElement;
  value: CtaAttributes["CtaLabel"] | CtaAttributes["CtaAction"];
  ctaAttributes: CtaAttributes;
  pageData: any;
  type: "label" | "action" = "label";
  inputId: string;

  constructor(
    value: CtaAttributes["CtaLabel"] | CtaAttributes["CtaAction"],
    ctaAttributes: any,
    type: "label" | "action" = "label"
  ) {
    this.value = value;
    this.ctaAttributes = ctaAttributes;
    this.type = type;
    this.pageData = (globalThis as any).pageData;
    this.inputId = `cta-${this.type}-input}`;
    this.input = document.createElement("input");
    this.init();
  }

  init() {
    this.input.type = "text";
    this.input.placeholder = this.type === "label" ? "Label" : "Action";
    this.input.classList.add("tb-form-control");
    this.input.classList.add(`cta-${this.type}-input`);
    this.input.id = this.inputId;
    this.input.style.marginTop = "10px";
    this.input.value = (this.value as string) || "";

    this.input.addEventListener("input", (e) => {
      const selectedComponent = (globalThis as any).selectedComponent;
      if (!selectedComponent) return;

      const isRoundButton = this.ctaAttributes.CtaButtonType;
      const ctaButton = selectedComponent.find(".cta-styled-btn")[0];
      
      if (this.type === "label") {
        const ctaTitle = selectedComponent.find(".label")[0];
        if (ctaTitle) {
          const truncatedTitle =
            isRoundButton === "Round" ? this.truncate(10) : this.truncate(14);

          ctaTitle.components(truncatedTitle);
          ctaTitle.addAttributes({ title: this.input.value });
        }
      }
      
      const ctaButtonComponent = ctaButton.parent();
      const currentPageId = (globalThis as any).currentPageId;
      
      if (this.pageData.PageType === "Information") {
        const infoSectionManager = new InfoSectionManager();
        const propertyName = this.type === "label" ? "CtaLabel" : "CtaAction";
        
        infoSectionManager.updateInfoCtaAttributes(
          selectedComponent.getId(),
          propertyName,
          this.input.value.trim()
        );
      }
    });
  }

  truncate(length: number) {
    if (this.input.value.length > length) {
      return this.input.value.substring(0, length) + "..";
    }
    return this.input.value;
  }

  render(container: HTMLElement) {
    const existingInput = document.getElementById(this.inputId);
    
    if (existingInput) {
      (existingInput as HTMLInputElement).value = this.input.value;
      return;
    }
    
    container.appendChild(this.input);
  }
}