import { ToolBoxService } from "../../../../services/ToolBoxService";
import { randomIdGenerator } from "../../../../utils/helpers";
import { Modal } from "../../Modal";

export class CreateCTA {
    toolboxService: ToolBoxService;
    modal: Modal | undefined;
    ctaSelectInput: HTMLSelectElement | undefined;
    ctaLabelInput: HTMLInputElement | undefined;
    phoneInput: HTMLDivElement | undefined;
    emailInput: HTMLInputElement | undefined;
    urlInput: HTMLInputElement | undefined;
    formSelect: HTMLSelectElement  | undefined;
    constructor() {
        this.renderAddButton();
        this.toolboxService = new ToolBoxService();
    }

    renderAddButton() {
        // Create a new button element
        const button = document.createElement("button");

        // Set button text
        button.textContent = "Add CTA";
        button.classList.add("tb-btn");
        button.id = "add-cta-button";

        // Add a click event
        button.addEventListener("click", (e) => {
            e.preventDefault();
            this.showPopup();
        });

        // Append the button to the body
        const container = document.getElementById("tb-sidebar");
        container?.appendChild(button);
    }

    renderForm() {
        // Create a new form element
        const form = document.createElement("form");

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
            this.phoneInput = await this.renderPhoneInput2();
            ctaValueDiv.appendChild(this.phoneInput);
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
            this.modal?.close();
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

    renderPhoneInput() {
        // render phone input with country code
        const container = document.createElement("div");
        container.style.display = "flex";

        // Create country code select
        const countrySelect = document.createElement("select");
        const countryCodes = [
            { code: "+1", country: "🇺🇸 USA" },
            { code: "+44", country: "🇬🇧 UK" },
            { code: "+91", country: "🇮🇳 India" },
            { code: "+81", country: "🇯🇵 Japan" },
            { code: "+61", country: "🇦🇺 Australia" },
        ];

        countryCodes.forEach(({ code, country }) => {
            const option = document.createElement("option");
            option.value = code;
            option.textContent = `${country} (${code})`;
            countrySelect.appendChild(option);
        });

        // Create phone input field
        const phoneInput = document.createElement("input");
        phoneInput.type = "tel";
        phoneInput.placeholder = "Enter phone number";
        phoneInput.style.marginLeft = "10px";
        phoneInput.style.padding = "5px";

        // Update phone input with country code on change
        countrySelect.addEventListener("change", () => {
            phoneInput.value = countrySelect.value + " ";
        });

        // Default country code
        phoneInput.value = countrySelect.value + " ";

        // Append elements to container
        container.appendChild(countrySelect);
        container.appendChild(phoneInput);
        return container;
    }

    async renderPhoneInput2() {
        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.gap = "2px";

        // Create country code select
        const countrySelect = document.createElement("select");
        countrySelect.classList.add("tb-form-control");
        countrySelect.style.width = "100px";

        // Create phone input field
        const phoneInput = document.createElement("input");
        phoneInput.type = "number";
        phoneInput.placeholder = "Enter phone number";
        phoneInput.classList.add("tb-form-control");

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
                    countrySelect.appendChild(option);
                }
            );

            // Append elements to container
            container.appendChild(countrySelect);
            container.appendChild(phoneInput);
        } catch (error) {
            console.error("Error fetching country data:", error);
            countrySelect.innerHTML = "<option>Error loading codes</option>";
        }
        return container;
    }



    addCtaToPage() {
        const data = {
            CtaId: randomIdGenerator(5),
            CtaLabel: this.ctaLabelInput?.value,
            CtaType: this.ctaSelectInput?.value,
            CtaValue: "",
        }

        if (this.ctaSelectInput?.value === "Form") {
            data.CtaValue = this.formSelect?.value || "";
        }else if (this.ctaSelectInput?.value === "Phone") {
            data.CtaValue = this.phoneInput?.querySelector("input")?.value || "";
        }else if (this.ctaSelectInput?.value === "Email") {
            data.CtaValue = this.emailInput?.value || "";
        }else if (this.ctaSelectInput?.value === "Url") {
            data.CtaValue = this.urlInput?.value || "";
        }

        console.log(data);
    }

}
