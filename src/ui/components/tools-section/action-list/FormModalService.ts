import { AppConfig } from "../../../../AppConfig";
import { ToolBoxService } from "../../../../services/ToolBoxService";
import { CtaAttributes, InfoType, SupplierList } from "../../../../types";
import { Form } from "../../Form";
import { FormField } from "../../FormField";
import { Modal } from "../../Modal";
import { SupplierSelectionComponent } from "../../SupplierSelectionComponent";

type CtaType = "Email" | "Phone" | "WebLink" | "Map" | "Form";

interface ModalOptions {
  title: string;
  form: Form;
  onSave: () => void;
}

export class FormModalService {
  private config: AppConfig;
  private isInfoCtaSection: boolean;
  private type?: CtaType;
  private toolBoxService: ToolBoxService;
  private supplierSelectComponent?: SupplierSelectionComponent<any>;

  constructor(isInfoCtaSection: boolean = false, type?: CtaType) {
    this.isInfoCtaSection = isInfoCtaSection;
    this.type = type;
    this.config = AppConfig.getInstance();
    this.toolBoxService = new ToolBoxService();
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
      if (this.type === 'Form') {
        this.appendSupplierFormSelection(formBody, form);
      }
    }

    form.render(formBody);

    // Now call setupSupplierSelection after rendering
    if (this.isInfoCtaSection && this.supplierSelectComponent) {
      this.setupSupplierSelection(this.supplierSelectComponent, formBody, form);
    }

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
    const itemsSelect = new SupplierSelectionComponent<any>(supplierItemsList, {
      labelField: 'SupplierGenCompanyName',
      valueField: 'SupplierGenId',
      placeholder: 'Select supplier to connect...'
    });

    this.supplierSelectComponent = itemsSelect;

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

    formSupplierField.appendChild(labelContainer);

    const selectElement = itemsSelect.getElement();

    // this.setupSupplierSelection(itemsSelect, formBody, form);

    formSupplierField.appendChild(selectElement);
    formBody.appendChild(formSupplierField);

    // Listen for the clear event to reset dependent fields
    selectElement.addEventListener('supplier-cleared', () => {
      this.resetSupplierDependentFields(formBody, form);
    });
  }

  private appendSupplierFormSelection(formBody: HTMLDivElement, form: Form, isRefresh?: boolean): void {
    const selectedSupplierId = form.getSelectedSupplierId();
    const filteredForms = selectedSupplierId && isRefresh
      ? this.toolBoxService.forms.filter((f: any) => f.SupplierId === selectedSupplierId)
      : this.toolBoxService.forms;

    const itemsSelect = new SupplierSelectionComponent<any>(filteredForms, {
      labelField: "PageName",
      valueField: "FormUrl",
      placeholder: "Select form..."
    });

    const formSupplierField = document.createElement("div");
    formSupplierField.classList.add("form-field");
    formSupplierField.style.marginBottom = "10px";

    const labelContainer = document.createElement("div");
    labelContainer.style.display = "flex";
    labelContainer.style.justifyContent = "space-between";
    labelContainer.style.alignItems = "center";

    const label = document.createElement("label");
    label.innerText = "Select Form";
    labelContainer.appendChild(label);
    formSupplierField.appendChild(labelContainer);

    const selectElement = itemsSelect.getElement();
    formSupplierField.appendChild(selectElement);

    // Simply append the new field at the end of the formBody
    const firstChild = formBody.firstElementChild;
    if (firstChild && firstChild.nextSibling) {
      formBody.insertBefore(formSupplierField, firstChild.nextSibling);
    } else {
      formBody.appendChild(formSupplierField); // fallback if there's only one or no children
    }

    // Update valueField on selection change
    itemsSelect.onChange((selectedForm: any) => {
      const valueField = formBody.querySelector("#field_value") as HTMLInputElement;
      const formIdField = formBody.querySelector("#field_id") as HTMLInputElement;
      if ((valueField || formIdField) && selectedForm?.FormUrl) {
        valueField.value = selectedForm.FormUrl;
        formIdField.value = selectedForm.FormId
      }
    });
  }

  private resetSupplierDependentFields(formBody: HTMLDivElement, form: Form): void {
    form.setSelectedSupplierId("");
    // Example: reset the value field and enable it
    const valueField = formBody.querySelector("#field_value") as HTMLInputElement;
    if (valueField) {
      valueField.value = "";
      valueField.disabled = false;
    }
    // Reset other fields as needed
    // For example, reset a form selection dropdown:
    if (this.type === 'Form') {
      const formField = formBody.querySelector("#field_id") as HTMLInputElement;
      if (formField) {
        formField.value = "";
        formField.disabled = false;
      }
      const formSelect = formBody.querySelector(".form-field select");
      if (formSelect) {
        (formSelect as HTMLSelectElement).selectedIndex = 0; // Reset to first option
      }
      // refresh form list dropdown when supplier changes
      this.refreshFormSelection(formBody, form);
    }
  }



  private setupSupplierSelection(
    itemsSelect: SupplierSelectionComponent<any>,
    formBody: HTMLDivElement,
    form: Form
  ): void {
    const supplierItemsList = this.config.suppliers;

    const lastConnectedSupplier = this.findLastConnectedSupplier();
    if (lastConnectedSupplier) {
      const supplierId = lastConnectedSupplier.CtaAttributes?.CtaConnectedSupplierId;
      itemsSelect.setValue(supplierId);
      form.setSelectedSupplierId(supplierId ?? null);
      // Update the form with the supplier data
      this.updateFieldWithSupplierData(
        formBody,
        supplierItemsList.find(
          item => item.SupplierGenId === supplierId
        ),
        form
      );
    }

    itemsSelect.onChange((selectedOption: SupplierList | undefined) => {
      form.setSelectedSupplierId(selectedOption?.SupplierGenId ?? null);
      this.updateFieldWithSupplierData(formBody, selectedOption, form);
    });
  }

  private refreshFormSelection(formBody: HTMLDivElement, form: Form): void {
    // Find the existing .form-field that contains the "Select Form" label
    const existingField = Array.from(formBody.querySelectorAll(".form-field label"))
      .find(label => label.textContent?.includes("Select Form"))
      ?.closest(".form-field");

    // Safely remove the existing form-field, if found and present in formBody
    if (existingField && formBody.contains(existingField)) {
      formBody.removeChild(existingField);
    }

    // Append a fresh one
    if (this.type === 'Form') this.appendSupplierFormSelection(formBody, form, true);
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

    const valueField = formBody.querySelector("#field_value") as HTMLInputElement;

    if (!valueField) {
      // console.warn("Could not find field_value element in the form");
      return;
    }

    let value = "";
    switch (this.type) {
      case "Phone": value = supplier.SupplierGenContactPhone?.trim() || ""; break;
      case "Email": value = supplier.SupplierGenEmail?.trim() || ""; break;
      case "WebLink": value = supplier.SupplierGenWebsite?.trim() || ""; break;
      case "Map": value = supplier.SupplierGenAddressLine1?.trim() || ""; break;
      case "Form": this.refreshFormSelection(formBody, form); break; // refresh form list.
    }

    // Only update the field value, not structure
    valueField.value = value;
    valueField.disabled = true;

    form.setSelectedSupplierId(supplier.SupplierGenId);
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