import { Form } from "../../Form";
import { FormField } from "../../FormField";
import { Modal } from "../../Modal";

export class FormModalService {
    createForm(formId: string, fields: any[]): Form {
        const form = new Form(formId);
        fields.forEach(field => form.addField(field));
        return form;
    }

    createModal({ title, form, onSave }: { title: string; form: Form; onSave: () => void }) {
        const formBody = document.createElement('div');
        form.render(formBody);

        const submitSection = document.createElement('div');
        submitSection.classList.add('popup-footer');
        submitSection.style.marginBottom = '-12px';

        const saveBtn = this.createButton('submit_form', 'tb-btn-primary', 'Save');
        const cancelBtn = this.createButton('cancel_form', 'tb-btn-secondary', 'Cancel');

        submitSection.appendChild(saveBtn);
        submitSection.appendChild(cancelBtn);

        const div = document.createElement('div');
        div.appendChild(formBody);
        div.appendChild(submitSection);

        const modal = new Modal({ title, width: "500px", body: div });
        modal.open();

        // Event Handlers
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.validateFields(form)) {
                onSave();
                modal.close();
            }
        });

        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.close();
        });
    }

    private createButton(id: string, className: string, text: string): HTMLButtonElement {
        const btn = document.createElement('button');
        btn.id = id;
        btn.classList.add('tb-btn', className);
        btn.innerText = text;
        return btn;
    }

    validateFields(form: Form): boolean {
        let isValid = true;
        const fields = form['fields'] as FormField[];

        fields.forEach(field => field.hideError());

        fields.forEach((field: any) => {
            const input = field.getElement().querySelector('input') as HTMLInputElement;
            const value = input.value.trim();

            if (input.required && value === '') {
                field.showError(field['errorMessage']);
                isValid = false;
            } else if (field['minLength'] && value.length < field['minLength']) {
                field.showError(`Must be at least ${field['minLength']} characters`);
                isValid = false;
            } else if (field['maxLength'] && value.length > field['maxLength']) {
                field.showError(`Cannot exceed ${field['maxLength']} characters`);
                isValid = false;
            } else if (field['validate'] && !field['validate'](value)) {
                field.showError(field['errorMessage']);
                isValid = false;
            } else if (value.toLowerCase() === 'home' 
                || value.toLowerCase() === 'my care'
                || value.toLowerCase() === 'my living'
                || value.toLowerCase() === 'my services'
                || value.toLowerCase() === 'web link'
                || value.toLowerCase() === 'dynamic form') {
                field.showError('Field name already exists');
                isValid = false;
            }
        });

        return isValid;
    }

    isValidUrl(url: string): boolean {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch (e) {
            return false;
        }
    }
}