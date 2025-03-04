"use strict";
class FormField {
    constructor(config) {
        this.formField = document.createElement('div');
        this.formField.className = 'form-field';
        // label
        const label = document.createElement('label');
        label.htmlFor = config.id;
        label.textContent = config.label;
        // input
        const input = document.createElement('input');
        input.type = config.type;
        input.id = config.id;
        input.className = 'tb-form-control';
        // optional attributes
        if (config.placeholder) {
            input.placeholder = config.placeholder;
        }
        if (config.required) {
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
        this.formField.appendChild(label);
        this.formField.appendChild(input);
        this.formField.appendChild(errorSpan);
    }
    getElement() {
        return this.formField;
    }
    showError(message) {
        const errorSpan = this.formField.querySelector('.error-message');
        errorSpan.style.display = 'block';
        if (message) {
            errorSpan.textContent = message;
        }
    }
    hideError() {
        const errorSpan = this.formField.querySelector('.error-message');
        errorSpan.style.display = 'none';
    }
}
class Form {
    constructor(id) {
        this.form = document.createElement('form');
        this.form.id = id;
        this.fields = [];
    }
    addField(config) {
        const field = new FormField(config);
        this.fields.push(field);
        this.form.appendChild(field.getElement());
        return field;
    }
    render(container) {
        container.appendChild(this.form);
    }
    getData() {
        const data = {};
        this.fields.forEach(field => {
            const input = field.getElement().querySelector('input');
            data[input.name] = input.value;
        });
        return data;
    }
}

function createPageForm() {
    const form = new Form('page-form');
    // Add page title field
    form.addField({
        label: 'Page Title',
        type: 'text',
        id: 'page_title',
        placeholder: 'New page title',
        required: true
    });
    // Add description field
    form.addField({
        label: 'Description',
        type: 'text',
        id: 'page_description',
        placeholder: 'Page description'
    });

    form.addField({
        label: 'Password',
        type: 'password',
        id: 'page_description',
        placeholder: 'Page description'
    });
    // Render form
    form.render(document.body);
    return form;
}
// Create the form
const pageForm = createPageForm();