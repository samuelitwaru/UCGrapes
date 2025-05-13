import { ContentMapper } from "../../../../controls/editor/ContentMapper";
import { InfoSectionController } from "../../../../controls/InfoSectionController";

export class ActionInput {
    input: HTMLInputElement;
    value: string;
    ctaAttributes: any;
    pageData: any;

    constructor(value: string, ctaAttributes: any) {
      this.value = value;
      this.ctaAttributes = ctaAttributes;
      this.pageData = (globalThis as any).pageData;
      this.input = document.createElement("input");
      this.init();
    }
  
    init() {
      this.input.type = "text";
      this.input.placeholder = "Action";
      this.input.classList.add("tb-form-control");
      this.input.id = "cta-action-title";
      this.input.style.marginTop = "10px";
      this.input.value = this.value;
  
      this.input.addEventListener("input", (e) => {
        const selectedComponent = (globalThis as any).selectedComponent;        
        if (!selectedComponent) return;

        const isRoundButton = this.ctaAttributes.CtaButtonType;
        const ctaButton = selectedComponent.find(".cta-styled-btn")[0];
  
        const ctaTitle = selectedComponent.find(".label")[0];
        if (ctaTitle) {
          const truncatedTitle =
          isRoundButton === "Round"
              ? this.truncate(10)
              : this.truncate(14);

              ctaTitle.components(truncatedTitle);
              ctaTitle.addAttributes({ title: this.input.value });
        }
  
        const ctaButtonComponent = ctaButton.parent();
        const currentPageId = (globalThis as any).currentPageId;
        if (this.pageData.PageType === "Information") {
            const infoSectionController = new InfoSectionController();
            infoSectionController.updateInfoCtaAttributes(selectedComponent.getId(), 'CtaLabel', this.input.value.trim());                
        } else {
          const contentMapper = new ContentMapper(currentPageId);
          contentMapper.updateContentCtaLabel(ctaButtonComponent.getId(), this.input.value.trim());
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
        const existingInput = container.querySelector("#cta-action-title");
        if (existingInput) {
          existingInput.remove();
        }
      container.appendChild(this.input);
    }
  }
  