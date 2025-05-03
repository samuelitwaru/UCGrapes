import { AppConfig } from "../../../../AppConfig";
import { CtaAttributes } from "../../../../interfaces/CtaAttributes";
import { InfoType } from "../../../../interfaces/InfoType";
import { SupplierList } from "../../../../interfaces/SupplierList";
import { Form } from "../../Form";
import { FormField } from "../../FormField";
import { Modal } from "../../Modal";
import { SupplierSelectionComponent } from "../../SupplierSelectionComponent";

type CtaType = "Email" | "Phone" | "WebLink" | "Map";

interface ModalOptions {
  title: string;
  form: Form;
  onSave: () => void;
}

export class FormModalService {
  private config: AppConfig;
  private isInfoCtaSection: boolean;
  private type?: CtaType;
  
  constructor(isInfoCtaSection: boolean = false, type?: CtaType) {
    this.isInfoCtaSection = isInfoCtaSection;
    this.type = type;
    this.config = AppConfig.getInstance();
  }

  createForm(formId: string, fields: any[]): Form {
    const form = new Form(formId);
    fields.forEach((field) => form.addField(field));
    return form;
  }

  createModal({ title, form, onSave }: ModalOptions): void {
    const formBody = document.createElement("div");
    
    if (this.isInfoCtaSection) {
      this.appendSupplierSelection(formBody, form);
    }
    
    form.render(formBody);

    const submitSection = this.createSubmitSection(form, onSave);
    
    const container = document.createElement("div");
    container.appendChild(formBody);
    container.appendChild(submitSection);

    const modal = new Modal({ title, width: "500px", body: container });
    modal.open();
  }

  validateFields(form: Form): boolean {
    let isValid = true;
    const fields = form["fields"] as FormField[];
    const reservedNames = ["home", "my care", "my living", "my services", "web link", "dynamic form"];

    // Reset all error states
    fields.forEach((field) => field.hideError());

    // Validate each field
    fields.forEach((field: any) => {
      const input = field.getElement().querySelector("input") as HTMLInputElement;
      if (!input) return;
      
      const value = input.value.trim();

      if (input.required && value === "") {
        field.showError(field["errorMessage"]);
        isValid = false;
      } else if (field["minLength"] && value.length < field["minLength"]) {
        field.showError(`Must be at least ${field["minLength"]} characters`);
        isValid = false;
      } else if (field["maxLength"] && value.length > field["maxLength"]) {
        field.showError(`Cannot exceed ${field["maxLength"]} characters`);
        isValid = false;
      } else if (field["validate"] && !field["validate"](value)) {
        field.showError(field["errorMessage"]);
        isValid = false;
      } else if (reservedNames.includes(value.toLowerCase())) {
        field.showError("Field name already exists");
        isValid = false;
      }
    });

    return isValid;
  }

  isValidUrl(url: string): boolean {
    try {
      const hasProtocol = /^https?:\/\//i.test(url);
      const urlObj = new URL(hasProtocol ? url : `http://${url}`);
      return urlObj.hostname.length > 0;
    } catch {
      return false;
    }
  }

  isValidPhone(phone: string): boolean {
    const cleaned = phone.replace(/(?!^\+)\D/g, "");
    return /^\+?[0-9]{10,15}$/.test(cleaned);
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  isValidAddress(address: string): boolean {
    return address.length > 5 && address.length <= 100;
  }

  private appendSupplierSelection(formBody: HTMLDivElement, form: Form): void {
    // const supplierItemsList = this.config.suppliers;
    const supplierItemsList = (window as any).app.suppliers;
    console.log("supplierItemsList", supplierItemsList);
    const itemsSelect = new SupplierSelectionComponent(supplierItemsList);

    const formSupplierField = document.createElement("div");
    formSupplierField.classList.add("form-field");
    formSupplierField.style.marginBottom = "10px";

    // Create a flex container to hold label and checkbox
    const labelContainer = document.createElement("div");
    labelContainer.style.display = "flex";
    labelContainer.style.justifyContent = "space-between";
    labelContainer.style.alignItems = "center";

    // Create the label text
    const label = document.createElement("label");
    label.innerText = "Connect Supplier (optional)";
    
    labelContainer.appendChild(label);

    // Check if there's a last connected supplier
    const lastConnectedSupplier = this.findLastConnectedSupplier();
    
    // Only show clear selection if there's a previously connected supplier
    if (lastConnectedSupplier) {
      // Create the checkbox and its label
      const clearLabel = document.createElement("label");
      clearLabel.style.display = "flex";
      clearLabel.style.alignItems = "center";
      clearLabel.style.fontSize = "13px";
      clearLabel.style.cursor = "pointer";
      clearLabel.style.userSelect = "none";
      clearLabel.style.gap = "22px";

      const clearCheckbox = document.createElement("input");
      clearCheckbox.style.marginBottom = "8px";
      clearCheckbox.type = "checkbox";
      
      const clearText = document.createTextNode("Clear Selection");
      
      clearLabel.appendChild(clearCheckbox);
      clearLabel.appendChild(clearText);
      
      // Add the clear checkbox label to the container
      labelContainer.appendChild(clearLabel);
      
      // Set up toggle functionality
      clearCheckbox.addEventListener("change", () => {
        if (clearCheckbox.checked) {
          itemsSelect.removeSelection();
          const valueField = formBody.querySelector("#field_value") as HTMLInputElement;
          if (valueField) {
            valueField.value = "";
            valueField.disabled = false;
          }
          form.setSelectedSupplierId("");
        } else {
          const supplierId = lastConnectedSupplier.CtaAttributes?.CtaConnectedSupplierId;
          if (supplierId) {
            itemsSelect.setValue(supplierId);
            this.updateFieldWithSupplierData(
              formBody,
              supplierItemsList.find((item:any) => item.SupplierGenId === supplierId),
              form
            );
          }
        }
      });
    }

    formSupplierField.appendChild(labelContainer);

    const selectElement = itemsSelect.getElement();
    
    this.setupSupplierSelection(itemsSelect, formBody, form);
    
    formSupplierField.appendChild(selectElement);
    formBody.appendChild(formSupplierField);
  }

  private setupSupplierSelection(
    itemsSelect: SupplierSelectionComponent, 
    formBody: HTMLDivElement, 
    form: Form
  ): void {
    const supplierItemsList = this.config.suppliers;
    
    const lastConnectedSupplier = this.findLastConnectedSupplier();
    if (lastConnectedSupplier) {
      itemsSelect.setValue(lastConnectedSupplier.CtaAttributes?.CtaConnectedSupplierId);
      this.updateFieldWithSupplierData(
        formBody,
        supplierItemsList.find(
          item => item.SupplierGenId === lastConnectedSupplier.CtaAttributes?.CtaConnectedSupplierId
        ),
        form
      );
    }

    itemsSelect.onChange((selectedOption) => {
      this.updateFieldWithSupplierData(formBody, selectedOption, form);
    });
  }

  private findLastConnectedSupplier(): InfoType | null {
    const pageId = (globalThis as any).currentPageId;
    const infoData = localStorage.getItem(`data-${pageId}`);
    const parsedInfoData = infoData ? JSON.parse(infoData) : null;

    if (parsedInfoData?.PageInfoStructure?.InfoContent) {
      const items = [...parsedInfoData.PageInfoStructure.InfoContent].reverse();
      return items.find(item => 
        item?.InfoType === "Cta" && 
        (item?.CtaAttributes as CtaAttributes)?.CtaSupplierIsConnected === true
      );
    }
    
    return null;
  }

  private updateFieldWithSupplierData(
    formBody: HTMLDivElement, 
    supplier: SupplierList | undefined, 
    form: Form
  ): void {
    if (!supplier) return;
    
    setTimeout(() => {
      const valueField = formBody.querySelector("#field_value") as HTMLInputElement;
      
      if (!valueField) {
        console.warn("Could not find field_value element in the form");
        return;
      }
      
      let value = "";
      switch (this.type) {
        case "Phone": value = supplier.SupplierGenContactPhone?.trim() || ""; break;
        case "Email": value = supplier.SupplierGenEmail?.trim() || ""; break;
        case "WebLink": value = supplier.SupplierGenWebsite?.trim() || ""; break;
        case "Map": value = supplier.SupplierGenAddressLine1?.trim() || ""; break;
      }
      
      valueField.value = value;
      valueField.disabled = true;
      form.setSelectedSupplierId(supplier.SupplierGenId);
    }, 0);
  }

  private createSubmitSection(form: Form, onSave: () => void): HTMLDivElement {
    const submitSection = document.createElement("div");
    submitSection.classList.add("popup-footer");
    submitSection.style.marginBottom = "-12px";

    const saveBtn = this.createButton("submit_form", "tb-btn-primary", "Save");
    const cancelBtn = this.createButton("cancel_form", "tb-btn-outline", "Cancel");

    saveBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (this.validateFields(form)) {
        onSave();
        document.querySelector(".popup-modal-link")?.remove();
      }
    });

    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelector(".popup-modal-link")?.remove();
    });

    submitSection.appendChild(saveBtn);
    submitSection.appendChild(cancelBtn);
    
    return submitSection;
  }

  private createButton(id: string, className: string, text: string): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.id = id;
    btn.classList.add("tb-btn", className);
    btn.innerText = text;
    return btn;
  }
}