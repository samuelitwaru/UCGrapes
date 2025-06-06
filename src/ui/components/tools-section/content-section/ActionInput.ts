import { ContentMapper } from "../../../../controls/editor/ContentMapper";
import { InfoSectionManager } from "../../../../controls/InfoSectionManager";
import { CtaAttributes } from "../../../../types";
import { PageCreationService } from "../action-list/PageCreationService";

export class ActionInput {
  input: HTMLInputElement;
  value: CtaAttributes["CtaLabel"] | CtaAttributes["CtaAction"];
  ctaAttributes: CtaAttributes;
  pageData: any;
  type: "label" | "action" = "label";
  actionType: "cta" | "tile" = "cta";
  inputId: string;
  private debouncedUpdate: () => void;
  private updateTimeoutId: number | null = null;

  constructor(
    value: CtaAttributes["CtaLabel"] | CtaAttributes["CtaAction"],
    ctaAttributes: any,
    type: "label" | "action" = "label",
    actionType: "cta" | "tile"
  ) {
    this.value = value;
    this.ctaAttributes = ctaAttributes;
    this.type = type;
    this.actionType = actionType;
    this.pageData = (globalThis as any).pageData;
    this.inputId = `cta-${this.type}-input`;
    this.input = document.createElement("input");

    // Create debounced update function
    this.debouncedUpdate = this.debounce(this.updateInfoSection.bind(this), 500);

    this.init();
  }

  private debounce(func: Function, delay: number): () => void {
    return () => {
      if (this.updateTimeoutId) {
        clearTimeout(this.updateTimeoutId);
      }
      this.updateTimeoutId = window.setTimeout(() => {
        func();
      }, delay);
    };
  }

  private updateInfoSection(): void {
    if (this.pageData.PageType !== "Information") return;

    const selectedComponent = (globalThis as any).selectedComponent;
    if (!selectedComponent) return;

    const infoSectionManager = new InfoSectionManager();

    if (this.actionType === "cta") {
      const propertyName = this.type === "label" ? "CtaLabel" : "CtaAction";
      infoSectionManager.updateInfoCtaAttributes(
        selectedComponent.getId(),
        propertyName,
        this.input.value.trim()
      );
    } else if (this.actionType === "tile") {
      const tileWrapper = selectedComponent.parent();
      infoSectionManager.updateInfoTileAttributes(
        tileWrapper.parent().getId(),
        tileWrapper.getId(),
        "Action.ObjectUrl",
        this.input.value.trim()
      );
    }
  }

  private updateUIElements(): void {
    const selectedComponent = (globalThis as any).selectedComponent;
    if (!selectedComponent) return;

    if (this.type === "label") {
      const ctaTitle = selectedComponent.find(".label")[0];
      if (ctaTitle) {
        let truncatedTitle = this.input.value;
        if (this.ctaAttributes.CtaButtonType === "Round" || this.ctaAttributes.CtaButtonType === "FullWidth") {
          // set round to default 36 - truncating will happen in updateRoundCtaWidths
          truncatedTitle = this.truncate(36);
        } else if (this.ctaAttributes.CtaButtonType === "Icon" || this.ctaAttributes.CtaButtonType === "Image") {
          truncatedTitle = this.truncate(20);
        }

        ctaTitle.components(truncatedTitle);
        ctaTitle.addAttributes({ title: this.input.value });
      }
    }
  }

  private handleInputChange(): void {
    // Update UI immediately for better UX
    this.updateUIElements();

    // Debounce the InfoSectionManager updates
    this.debouncedUpdate();
  }

  init(): void {
    this.setupInputElement();
    this.attachEventListeners();
  }

  private setupInputElement(): void {
    this.input.type = "text";
    this.input.placeholder = this.type === "label" ? "Label" : "Action";
    this.input.classList.add("tb-form-control", `cta-${this.type}-input`);
    this.input.id = this.inputId;
    this.input.style.marginTop = "10px";
    this.input.value = (this.value as string) || "";

    // Use readonly instead of disabled for form inputs to allow click events
    if (this.ctaAttributes.CtaType === "Form") {
      this.input.readOnly = true;
      this.input.style.cursor = "pointer";
      this.input.style.backgroundColor = "#f8f9fa"; // Visual indicator it's not editable
    }
  }

  private attachEventListeners(): void {
    this.input.addEventListener("input", () => {
      this.handleInputChange();
    });

    this.input.addEventListener("click", (e) => {
      if (this.ctaAttributes.CtaType === "Form") {
        e.preventDefault();
        console.log('form clicked');
        this.openFormEditModal();
      }
    });
  }

  private openFormEditModal(): void {
    const service = new PageCreationService(
      true,
      'Form'
    );
    service.handleForm();
  }

  private truncate(length: number): string {
    if (this.input.value.length > length) {
      return this.input.value.substring(0, length) + "..";
    }
    return this.input.value;
  }

  getInputElement(): HTMLInputElement {
    return this.input;
  }

  render(container: HTMLElement): void {
    const existingInput = document.getElementById(this.inputId);

    if (existingInput) {
      (existingInput as HTMLInputElement).value = this.input.value;
      return;
    }

    container.appendChild(this.input);
  }

  // Clean up timeout when component is destroyed
  destroy(): void {
    if (this.updateTimeoutId) {
      clearTimeout(this.updateTimeoutId);
      this.updateTimeoutId = null;
    }
  }
}