import { AppConfig } from "../../../../AppConfig";
import { Form } from "../../Form";
import { Modal } from "../../Modal";
import { SupplierSelectionComponent } from "../../SupplierSelectionComponent";
export class FormModalService {
    constructor(isInfoCtaSection = false, type) {
        this.isInfoCtaSection = isInfoCtaSection;
        this.type = type;
        this.config = AppConfig.getInstance();
    }
    createForm(formId, fields) {
        const form = new Form(formId);
        fields.forEach((field) => form.addField(field));
        return form;
    }
    createModal({ title, form, onSave }) {
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
    validateFields(form) {
        let isValid = true;
        const fields = form["fields"];
        const reservedNames = ["home", "my care", "my living", "my services", "web link", "dynamic form"];
        // Reset all error states
        fields.forEach((field) => field.hideError());
        // Validate each field
        fields.forEach((field) => {
            const input = field.getElement().querySelector("input");
            if (!input)
                return;
            const value = input.value.trim();
            if (input.required && value === "") {
                field.showError(field["errorMessage"]);
                isValid = false;
            }
            else if (field["minLength"] && value.length < field["minLength"]) {
                field.showError(`Must be at least ${field["minLength"]} characters`);
                isValid = false;
            }
            else if (field["maxLength"] && value.length > field["maxLength"]) {
                field.showError(`Cannot exceed ${field["maxLength"]} characters`);
                isValid = false;
            }
            else if (field["validate"] && !field["validate"](value)) {
                field.showError(field["errorMessage"]);
                isValid = false;
            }
            else if (reservedNames.includes(value.toLowerCase())) {
                field.showError("Field name already exists");
                isValid = false;
            }
        });
        return isValid;
    }
    isValidUrl(url) {
        try {
            const hasProtocol = /^https?:\/\//i.test(url);
            const urlObj = new URL(hasProtocol ? url : `http://${url}`);
            return urlObj.hostname.length > 0;
        }
        catch (_a) {
            return false;
        }
    }
    isValidPhone(phone) {
        const cleaned = phone.replace(/(?!^\+)\D/g, "");
        return /^\+?[0-9]{10,15}$/.test(cleaned);
    }
    isValidEmail(email) {
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
        return emailRegex.test(email) && email.length <= 254;
    }
    isValidAddress(address) {
        return address.length > 5 && address.length <= 100;
    }
    appendSupplierSelection(formBody, form) {
        const supplierItemsList = this.config.suppliers;
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
                var _a;
                if (clearCheckbox.checked) {
                    itemsSelect.removeSelection();
                    const valueField = formBody.querySelector("#field_value");
                    if (valueField) {
                        valueField.value = "";
                        valueField.disabled = false;
                    }
                    form.setSelectedSupplierId("");
                }
                else {
                    const supplierId = (_a = lastConnectedSupplier.CtaAttributes) === null || _a === void 0 ? void 0 : _a.CtaConnectedSupplierId;
                    if (supplierId) {
                        itemsSelect.setValue(supplierId);
                        this.updateFieldWithSupplierData(formBody, supplierItemsList.find(item => item.SupplierGenId === supplierId), form);
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
    setupSupplierSelection(itemsSelect, formBody, form) {
        var _a;
        const supplierItemsList = this.config.suppliers;
        const lastConnectedSupplier = this.findLastConnectedSupplier();
        if (lastConnectedSupplier) {
            itemsSelect.setValue((_a = lastConnectedSupplier.CtaAttributes) === null || _a === void 0 ? void 0 : _a.CtaConnectedSupplierId);
            this.updateFieldWithSupplierData(formBody, supplierItemsList.find(item => { var _a; return item.SupplierGenId === ((_a = lastConnectedSupplier.CtaAttributes) === null || _a === void 0 ? void 0 : _a.CtaConnectedSupplierId); }), form);
        }
        itemsSelect.onChange((selectedOption) => {
            this.updateFieldWithSupplierData(formBody, selectedOption, form);
        });
    }
    findLastConnectedSupplier() {
        var _a;
        const pageId = globalThis.currentPageId;
        const infoData = localStorage.getItem(`data-${pageId}`);
        const parsedInfoData = infoData ? JSON.parse(infoData) : null;
        if ((_a = parsedInfoData === null || parsedInfoData === void 0 ? void 0 : parsedInfoData.PageInfoStructure) === null || _a === void 0 ? void 0 : _a.InfoContent) {
            const items = [...parsedInfoData.PageInfoStructure.InfoContent].reverse();
            return items.find(item => {
                var _a;
                return (item === null || item === void 0 ? void 0 : item.InfoType) === "Cta" &&
                    ((_a = item === null || item === void 0 ? void 0 : item.CtaAttributes) === null || _a === void 0 ? void 0 : _a.CtaSupplierIsConnected) === true;
            });
        }
        return null;
    }
    updateFieldWithSupplierData(formBody, supplier, form) {
        if (!supplier)
            return;
        setTimeout(() => {
            var _a, _b, _c, _d;
            const valueField = formBody.querySelector("#field_value");
            if (!valueField) {
                console.warn("Could not find field_value element in the form");
                return;
            }
            let value = "";
            switch (this.type) {
                case "Phone":
                    value = ((_a = supplier.SupplierGenContactPhone) === null || _a === void 0 ? void 0 : _a.trim()) || "";
                    break;
                case "Email":
                    value = ((_b = supplier.SupplierGenEmail) === null || _b === void 0 ? void 0 : _b.trim()) || "";
                    break;
                case "WebLink":
                    value = ((_c = supplier.SupplierGenWebsite) === null || _c === void 0 ? void 0 : _c.trim()) || "";
                    break;
                case "Map":
                    value = ((_d = supplier.SupplierGenAddressLine1) === null || _d === void 0 ? void 0 : _d.trim()) || "";
                    break;
            }
            valueField.value = value;
            valueField.disabled = true;
            form.setSelectedSupplierId(supplier.SupplierGenId);
        }, 0);
    }
    createSubmitSection(form, onSave) {
        const submitSection = document.createElement("div");
        submitSection.classList.add("popup-footer");
        submitSection.style.marginBottom = "-12px";
        const saveBtn = this.createButton("submit_form", "tb-btn-primary", "Save");
        const cancelBtn = this.createButton("cancel_form", "tb-btn-outline", "Cancel");
        saveBtn.addEventListener("click", (e) => {
            var _a;
            e.preventDefault();
            if (this.validateFields(form)) {
                onSave();
                (_a = document.querySelector(".popup-modal-link")) === null || _a === void 0 ? void 0 : _a.remove();
            }
        });
        cancelBtn.addEventListener("click", (e) => {
            var _a;
            e.preventDefault();
            (_a = document.querySelector(".popup-modal-link")) === null || _a === void 0 ? void 0 : _a.remove();
        });
        submitSection.appendChild(saveBtn);
        submitSection.appendChild(cancelBtn);
        return submitSection;
    }
    createButton(id, className, text) {
        const btn = document.createElement("button");
        btn.id = id;
        btn.classList.add("tb-btn", className);
        btn.innerText = text;
        return btn;
    }
}
//# sourceMappingURL=FormModalService.js.map