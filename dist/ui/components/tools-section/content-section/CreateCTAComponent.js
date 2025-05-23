var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ToolBoxService } from "../../../../services/ToolBoxService";
import { DefaultAttributes, tileDefaultAttributes } from "../../../../utils/default-attributes";
import { randomIdGenerator } from "../../../../utils/helpers";
import { Modal } from "../../Modal";
export class CreateCTAComponent {
    constructor(serviceId) {
        this.serviceId = serviceId;
        this.toolboxService = new ToolBoxService();
    }
    renderForm() {
        // Create a new form element
        const form = document.createElement("form");
        // error Label
        const errorDiv = document.createElement("div");
        this.errorLabel = document.createElement("label");
        this.errorLabel.style.color = "red";
        errorDiv.appendChild(this.errorLabel);
        form.appendChild(errorDiv);
        // Create call to action type select
        const selectlabel = document.createElement("label");
        selectlabel.textContent = "Select CTA Type";
        form.appendChild(selectlabel);
        this.ctaSelectInput = document.createElement("select");
        this.ctaSelectInput.classList.add("tb-form-control");
        form.appendChild(this.ctaSelectInput);
        // Create options for the select element
        const options = [
            { value: "Phone", text: "Phone" },
            { value: "Email", text: "Email" },
            { value: "Form", text: "Form" },
            { value: "Url", text: "Url" },
        ];
        // Add options to the select element
        options.forEach((option) => {
            var _a;
            const opt = document.createElement("option");
            opt.value = option.value;
            opt.text = option.text;
            (_a = this.ctaSelectInput) === null || _a === void 0 ? void 0 : _a.appendChild(opt);
        });
        // Add label input
        const ctalabel = document.createElement("label");
        ctalabel.textContent = "Label *";
        form.appendChild(ctalabel);
        this.ctaLabelInput = document.createElement("input");
        this.ctaLabelInput.classList.add("tb-form-control");
        this.ctaLabelInput.type = "text";
        this.ctaLabelInput.placeholder = "Label";
        form.appendChild(this.ctaLabelInput);
        // add div for cta value
        const ctaValueDiv = document.createElement("div");
        ctaValueDiv.id = "cta-value-div";
        form.appendChild(ctaValueDiv);
        this.changeCTAValueInput(this.ctaSelectInput.value, ctaValueDiv);
        // for each of the options in the select element, add a corresponding input field
        this.ctaSelectInput.addEventListener("change", (e) => {
            const value = e.target.value;
            this.changeCTAValueInput(value, ctaValueDiv);
        });
        const container = document.getElementById("create-cta-container");
        container === null || container === void 0 ? void 0 : container.appendChild(form);
        const submitSection = this.renderModalFooter();
        container === null || container === void 0 ? void 0 : container.appendChild(submitSection);
    }
    changeCTAValueInput(value, ctaValueDiv) {
        return __awaiter(this, void 0, void 0, function* () {
            ctaValueDiv.innerHTML = "";
            const valueLabel = document.createElement("label");
            valueLabel.textContent = `${value} *`;
            ctaValueDiv.appendChild(valueLabel);
            if (value === "Form") {
                // add select field for form
                this.formSelect = document.createElement("select");
                this.formSelect.classList.add("tb-form-control");
                this.formSelect.id = "form-select";
                ctaValueDiv.appendChild(this.formSelect);
                this.toolboxService.forms.forEach((dynamicForm) => {
                    var _a;
                    const opt = document.createElement("option");
                    opt.value = dynamicForm.FormUrl;
                    opt.text = dynamicForm.ReferenceName;
                    (_a = this.formSelect) === null || _a === void 0 ? void 0 : _a.appendChild(opt);
                });
            }
            else if (value === "Phone") {
                // add phone input field
                const phoneInput = yield this.renderPhoneInput();
                ctaValueDiv.appendChild(phoneInput);
            }
            else if (value === "Email") {
                // add email input field
                this.emailInput = document.createElement("input");
                this.emailInput.classList.add("tb-form-control");
                this.emailInput.type = "email";
                ctaValueDiv.appendChild(this.emailInput);
            }
            else if (value === "Url") {
                // add url input field
                this.urlInput = document.createElement("input");
                this.urlInput.classList.add("tb-form-control");
                this.urlInput.type = "url";
                ctaValueDiv.appendChild(this.urlInput);
            }
        });
    }
    renderModalFooter() {
        const submitSection = document.createElement("div");
        submitSection.classList.add("popup-footer");
        submitSection.style.marginBottom = "-12px";
        const addBtn = document.createElement("button");
        addBtn.classList.add("tb-btn", "tb-btn-primary");
        addBtn.innerText = "Add CTA";
        submitSection.appendChild(addBtn);
        const cancelBtn = document.createElement("button");
        cancelBtn.classList.add("tb-btn", "tb-btn-secondary");
        cancelBtn.innerText = "Cancel";
        cancelBtn.addEventListener("click", (e) => {
            var _a;
            (_a = this.modal) === null || _a === void 0 ? void 0 : _a.close();
        });
        addBtn.addEventListener("click", (e) => {
            this.addCtaToPage();
        });
        submitSection.appendChild(cancelBtn);
        submitSection.appendChild(addBtn);
        submitSection.appendChild(cancelBtn);
        return submitSection;
    }
    showPopup() {
        const options = {
            title: "Create CTA",
            body: `<div id="create-cta-container"></div>`,
        };
        this.modal = new Modal(options);
        this.modal.open();
        this.renderForm();
    }
    renderPhoneInput() {
        return __awaiter(this, void 0, void 0, function* () {
            const container = document.createElement("div");
            container.style.display = "flex";
            container.style.gap = "2px";
            // Create country code select
            this.countrySelect = document.createElement("select");
            this.countrySelect.classList.add("tb-form-control");
            this.countrySelect.style.width = "100px";
            // Create phone input field
            this.phoneInput = document.createElement("input");
            this.phoneInput.type = "number";
            this.phoneInput.placeholder = "Enter phone number";
            this.phoneInput.classList.add("tb-form-control");
            try {
                // Fetch country data
                const response = yield fetch("https://restcountries.com/v3.1/all");
                const countries = yield response.json();
                // Extract relevant data and sort alphabetically
                const countryCodes = countries
                    .filter((country) => { var _a; return (_a = country.idd) === null || _a === void 0 ? void 0 : _a.root; }) // Ensure the country has a phone code
                    .map((country) => ({
                    code: `${country.idd.root}${country.idd.suffixes ? country.idd.suffixes[0] : ""}`, // Combine root and suffix
                    name: country.name.common,
                    flag: country.flags.svg,
                }))
                    .sort((a, b) => a.name.localeCompare(b.name));
                // Populate the select dropdown
                countryCodes.forEach(({ code, name, flag, }) => {
                    var _a;
                    const option = document.createElement("option");
                    option.value = code;
                    option.innerHTML = `(${code}) ${name}`; // Default flag in case flag image fails
                    (_a = this.countrySelect) === null || _a === void 0 ? void 0 : _a.appendChild(option);
                });
                // Append elements to container
                container.appendChild(this.countrySelect);
                container.appendChild(this.phoneInput);
            }
            catch (error) {
                console.error("Error fetching country data:", error);
                this.countrySelect.innerHTML = "<option>Error loading codes</option>";
            }
            return container;
        });
    }
    addCtaToPage() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        let payload = {
            ProductServiceId: this.serviceId,
            CallToActionName: (_a = this.ctaLabelInput) === null || _a === void 0 ? void 0 : _a.value,
            CallToActionType: "",
            CallToActionPhone: "",
            CallToActionPhoneCode: "",
            CallToActionPhoneNumber: "",
            CallToActionUrl: "",
            CallToActionEmail: "",
            LocationDynamicFormId: "",
        };
        const data = {
            CtaId: randomIdGenerator(5),
            CtaLabel: (_b = this.ctaLabelInput) === null || _b === void 0 ? void 0 : _b.value,
            CtaType: (_c = this.ctaSelectInput) === null || _c === void 0 ? void 0 : _c.value,
            CtaValue: "",
        };
        if (((_d = this.ctaSelectInput) === null || _d === void 0 ? void 0 : _d.value) === "Form") {
            payload.LocationDynamicFormId = ((_e = this.formSelect) === null || _e === void 0 ? void 0 : _e.value) || "";
            data.CtaValue = payload.LocationDynamicFormId;
        }
        else if (((_f = this.ctaSelectInput) === null || _f === void 0 ? void 0 : _f.value) === "Phone") {
            payload.CallToActionPhoneNumber = ((_g = this.phoneInput) === null || _g === void 0 ? void 0 : _g.value) || "";
            payload.CallToActionPhoneCode = ((_h = this.countrySelect) === null || _h === void 0 ? void 0 : _h.value) || "";
            data.CtaValue = payload.CallToActionPhoneNumber;
        }
        else if (((_j = this.ctaSelectInput) === null || _j === void 0 ? void 0 : _j.value) === "Email") {
            payload.CallToActionEmail = ((_k = this.emailInput) === null || _k === void 0 ? void 0 : _k.value) || "";
            data.CtaValue = payload.CallToActionEmail;
        }
        else if (((_l = this.ctaSelectInput) === null || _l === void 0 ? void 0 : _l.value) === "Url") {
            payload.CallToActionUrl = ((_m = this.urlInput) === null || _m === void 0 ? void 0 : _m.value) || "";
            data.CtaValue = payload.CallToActionUrl;
        }
        const res = this.validateCta(data);
        if (res.isValid) {
            this.toolboxService.createServiceCTA(payload).then(res => {
                console.log(res);
            });
            return;
            const editor = globalThis.activeEditor;
            if (editor) {
                const components = editor.DomComponents.getWrapper().find('.content-page-wrapper');
                if (components.length > 0) {
                    const contentWrapper = components[0];
                    contentWrapper.append(this.generateCta(data));
                }
                (_o = this.modal) === null || _o === void 0 ? void 0 : _o.close();
            }
        }
        else {
            if (this.errorLabel) {
                this.errorLabel.textContent = res.message;
            }
        }
    }
    validateCta(data) {
        const phoneRegex = /^\d{10}$/;
        const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.CtaLabel || !data.CtaType || !data.CtaValue) {
            return { isValid: false, message: `Type, Label, and ${data.CtaType} are required.` };
        }
        switch (data.CtaType) {
            case "Phone":
                if (!phoneRegex.test(data.CtaValue)) {
                    return { isValid: false, message: "CtaValue must be a 10-digit number for Phone type." };
                }
                break;
            case "Url":
            case "Form":
                if (!urlRegex.test(data.CtaValue)) {
                    return { isValid: false, message: "CtaValue must be a valid URL for Url or Form type." };
                }
                break;
            case "Email":
                if (!emailRegex.test(data.CtaValue)) {
                    return { isValid: false, message: "CtaValue must be a valid email address for Email type." };
                }
                break;
            default:
                return { isValid: false, message: "Invalid CtaType." };
        }
        return { isValid: true, message: "Validation successful." };
    }
    generateCta(cta) {
        let icon = "";
        switch (cta.CtaType) {
            case "Phone":
                icon = "";
                break;
            case "Email":
                icon = "";
                break;
            case "Url":
                icon = "";
                break;
            case "Form":
                icon = "";
                break;
            default:
                break;
        }
        return `
        <div ${tileDefaultAttributes} data-gjs-type="cta-buttons" cta-button-label="${cta.CtaLabel}" cta-button-type="${cta.CtaType}" cta-button-action="${cta.CtaValue}" cta-background-color="#b2b997" class="cta-container-child cta-child">
            <div class="cta-button" ${DefaultAttributes}>
                ${icon}
                <div class="cta-badge" ${DefaultAttributes}><i ${DefaultAttributes} data-gjs-type="default" class="fa fa-minus"></i></div>
            </div>
            <div class="cta-label" ${DefaultAttributes}>${cta.CtaLabel}</div>
        </div>
        `;
    }
}
//# sourceMappingURL=CreateCTAComponent.js.map