import { JSONToGrapesJSContent } from "../../../../controls/editor/JSONToGrapesJSContent";
import { ToolBoxService } from "../../../../services/ToolBoxService";
import { DefaultAttributes, tileDefaultAttributes } from "../../../../utils/default-attributes";
import { randomIdGenerator } from "../../../../utils/helpers";
import { Modal } from "../../Modal";

export class CreateCTAComponent {
    toolboxService: ToolBoxService;
    modal: Modal | undefined;
    ctaSelectInput: HTMLSelectElement | undefined;
    ctaLabelInput: HTMLInputElement | undefined;
    phoneInput: HTMLInputElement | undefined;
    emailInput: HTMLInputElement | undefined;
    urlInput: HTMLInputElement | undefined;
    formSelect: HTMLSelectElement  | undefined;
    errorLabel: HTMLLabelElement | undefined;
    countrySelect: HTMLSelectElement | undefined;
    serviceId: string;
    constructor(serviceId:string) {
        this.serviceId = serviceId
        this.toolboxService = new ToolBoxService();
    }


    renderForm() {
        // Create a new form element
        const form = document.createElement("form");

        // error Label
        const errorDiv = document.createElement("div")
        this.errorLabel = document.createElement("label") 
        this.errorLabel.style.color = "red"
        errorDiv.appendChild(this.errorLabel)
        form.appendChild(errorDiv)

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
            const opt = document.createElement("option");
            opt.value = option.value;
            opt.text = option.text;
            this.ctaSelectInput?.appendChild(opt);
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
            const value = (e.target as HTMLSelectElement).value;
            this.changeCTAValueInput(value, ctaValueDiv);
        });

        const container = document.getElementById("create-cta-container");
        container?.appendChild(form);

        const submitSection = this.renderModalFooter();
        container?.appendChild(submitSection);
    }

    private async changeCTAValueInput(
        value: string,
        ctaValueDiv: HTMLDivElement
    ) {
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
            this.toolboxService.forms.forEach((dynamicForm: any) => {
                const opt = document.createElement("option");
                opt.value = dynamicForm.FormUrl;
                opt.text = dynamicForm.ReferenceName;
                this.formSelect?.appendChild(opt);
            });
        } else if (value === "Phone") {
            // add phone input field
            const phoneInput = await this.renderPhoneInput();
            ctaValueDiv.appendChild(phoneInput);
        } else if (value === "Email") {
            // add email input field
            this.emailInput = document.createElement("input");
            this.emailInput.classList.add("tb-form-control");
            this.emailInput.type = "email";
            ctaValueDiv.appendChild(this.emailInput);
        } else if (value === "Url") {
            // add url input field
            this.urlInput = document.createElement("input");
            this.urlInput.classList.add("tb-form-control");
            this.urlInput.type = "url";
            ctaValueDiv.appendChild(this.urlInput);
        }
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
            this.modal?.close();
        });
        addBtn.addEventListener("click", (e) => {
            this.addCtaToPage();
        })
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

    async renderPhoneInput() {
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
            const response = await fetch("https://restcountries.com/v3.1/all");
            const countries = await response.json();

            // Extract relevant data and sort alphabetically
            const countryCodes = countries
                .filter((country: { idd: { root: any } }) => country.idd?.root) // Ensure the country has a phone code
                .map(
                    (country: {
                        idd: { root: any; suffixes: any[] };
                        name: { common: any };
                        flags: { svg: any };
                    }) => ({
                        code: `${country.idd.root}${country.idd.suffixes ? country.idd.suffixes[0] : ""
                            }`, // Combine root and suffix
                        name: country.name.common,
                        flag: country.flags.svg,
                    })
                )
                .sort((a: { name: string }, b: { name: any }) =>
                    a.name.localeCompare(b.name)
                );

            // Populate the select dropdown
            countryCodes.forEach(
                ({
                    code,
                    name,
                    flag,
                }: {
                    code: string;
                    name: string;
                    flag: string;
                }) => {
                    const option = document.createElement("option");
                    option.value = code;
                    option.innerHTML = `(${code}) ${name}`; // Default flag in case flag image fails
                    this.countrySelect?.appendChild(option);
                }
            );

            // Append elements to container
            container.appendChild(this.countrySelect);
            container.appendChild(this.phoneInput);
        } catch (error) {
            console.error("Error fetching country data:", error);
            this.countrySelect.innerHTML = "<option>Error loading codes</option>";
        }
        return container;
    }

    addCtaToPage() {
        let payload = {
            ProductServiceId: this.serviceId,
            CallToActionName:this.ctaLabelInput?.value,
            CallToActionType: "",
            CallToActionPhone: "",
            CallToActionPhoneCode: "",
            CallToActionPhoneNumber: "",
            CallToActionUrl: "",
            CallToActionEmail: "",
            LocationDynamicFormId: "",
        }

        const data = {
            CtaId: randomIdGenerator(5),
            CtaLabel: this.ctaLabelInput?.value,
            CtaType: this.ctaSelectInput?.value,
            CtaValue: "",
        }


        if (this.ctaSelectInput?.value === "Form") {
            payload.LocationDynamicFormId = this.formSelect?.value || "";
            data.CtaValue = payload.LocationDynamicFormId
        }else if (this.ctaSelectInput?.value === "Phone") {
            payload.CallToActionPhoneNumber = this.phoneInput?.value || "";
            payload.CallToActionPhoneCode = this.countrySelect?.value || "";
            data.CtaValue = payload.CallToActionPhoneNumber
        }else if (this.ctaSelectInput?.value === "Email") {
            payload.CallToActionEmail = this.emailInput?.value || "";
            data.CtaValue = payload.CallToActionEmail
        }else if (this.ctaSelectInput?.value === "Url") {
            payload.CallToActionUrl = this.urlInput?.value || "";
            data.CtaValue = payload.CallToActionUrl
        }

        const res = this.validateCta(data)
        if (res.isValid) {
            console.log(payload)
            this.toolboxService.createServiceCTA(payload).then(res=>{
                console.log(res)
            })
            return
            const editor = (globalThis as any).activeEditor
            if (editor) {
                const components = editor.DomComponents.getWrapper().find('.content-page-wrapper')
                if(components.length > 0) {
                    const contentWrapper = components[0];
                    contentWrapper.append(this.generateCta(data))
                }
                this.modal?.close();
            }
        }else{
            if (this.errorLabel) {
                this.errorLabel.textContent = res.message
            }
        }
    }

    validateCta(data:any) {
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

    generateCta(cta:any) {
        let icon:string = ""
        switch (cta.CtaType) {
            case "Phone":
                icon = ""
                break;
            case "Email":
                icon = ""
                break;
            case "Url":
                icon = ""
                break;
            case "Form":
                icon = ""
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
        `
    }

}
