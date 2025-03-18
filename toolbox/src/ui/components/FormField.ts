export class FormField {
    private formField: HTMLDivElement;

    constructor (config: {
        label?: string,
        type: string,
        id: string,
        value?: string,
        placeholder?: string,
        required?: boolean,
        errorMessage?: string
    }) {
        this.formField = document.createElement('div');
        this.formField.className = 'form-field';
        this.formField.style.marginBottom = '10px';

        // label
        const label = document.createElement('label');
        if (config.label) {
            label.htmlFor = config.id;
            label.textContent = config.label;
        }

        // input
        const input = document.createElement('input');
        input.type = config.type;
        input.id = config.id;
        input.className = 'tb-form-control';
        input.value = config.value || '';

        // optional attributes
        if(config.placeholder) {
            input.placeholder = config.placeholder;
        }
        if(config.required) {
            input.required = true;
        }

        // error messahe span
        const errorSpan = document.createElement('span');
        errorSpan.className = 'error-message';
        errorSpan.style.cssText = `
            color: red;
            font-size: 12px;
            display: none;
            margin-top: 5px;
            font-weight: 300;
        `;

        errorSpan.textContent = config.errorMessage || 'Error message';

        if (config.label) {
            this.formField.appendChild(label);
        }
        this.formField.appendChild(input);
        this.formField.appendChild(errorSpan);
    }

    getElement(): HTMLDivElement {
        return this.formField;
    }

    showError(message: string) {
        const errorSpan = this.formField.querySelector('.error-message') as HTMLSpanElement;
        errorSpan.style.display = 'block';
        if (message) {
            errorSpan.textContent = message;
        }
    }

    hideError() {
        const errorSpan = this.formField.querySelector('.error-message') as HTMLSpanElement;
        errorSpan.style.display = 'none';
    }
}