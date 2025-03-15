import { AppVersionManager } from "../../../../controls/versions/AppVersionManager";
import { ToolBoxService } from "../../../../services/ToolBoxService";
import { Alert } from "../../Alert";
import { Form } from "../../Form";
import { FormField } from "../../FormField";
import { Modal } from "../../Modal";

export class PageCreationService {
    appVersionManager: any;
    toolBoxService: any;

    constructor() {
        this.appVersionManager = new AppVersionManager();
        this.toolBoxService = new ToolBoxService();
    }

    addNewService() {
        console.log("addNewService");
    }

    addNewMenuPage() {
        const form = this.createForm('menu-page-form', [
            {
                label: 'Page Title',
                type: 'text',
                id: 'page_title',
                placeholder: 'Enter page title',
                required: true,
                errorMessage: 'Please enter a page title',
                minLength: 3,
                maxLength: 50
            }
        ]);

        this.createModal({
            title: "Add New Menu Page",
            form,
            onSave: () => this.processMenuPageData(form.getData()),
        });
    }

    handleWebLinks() {
        const form = this.createForm('web-link-form', [
            {
                label: 'Link Url',
                type: 'text',
                id: 'link_url',
                placeholder: 'https://example.com',
                required: true,
                errorMessage: 'Please enter a valid URL',
                validate: this.isValidUrl
            },
            {
                label: 'Link Label',
                type: 'text',
                id: 'link_label',
                placeholder: 'Example Link',
                required: true,
                errorMessage: 'Please enter a label for your link',
                minLength: 2
            }
        ]);

        this.createModal({
            title: "Add Web Link",
            form,
            onSave: () => this.processFormData(form.getData()),
        });
    }

    /** 
     * Creates a new form dynamically.
     */
    private createForm(formId: string, fields: any[]): Form {
        const form = new Form(formId);
        fields.forEach(field => form.addField(field));
        return form;
    }

    /**
     * Creates and opens a modal with a given form.
     */
    private createModal({ title, form, onSave }: { title: string; form: Form; onSave: () => void }) {
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

    /**
     * Creates a button element.
     */
    private createButton(id: string, className: string, text: string): HTMLButtonElement {
        const btn = document.createElement('button');
        btn.id = id;
        btn.classList.add('tb-btn', className);
        btn.innerText = text;
        return btn;
    }

    /**
     * Validates form fields based on given conditions.
     */
    private validateFields(form: Form): boolean {
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
            }
        });

        return isValid;
    }

    /**
     * Processes menu page data.
     */
    private async processMenuPageData(formData: Record<string, string>) {
        const version = await this.appVersionManager.getActiveVersion();
        
        this.toolBoxService.createMenuPage(version.AppVersionId, formData.page_title).then((res: any) => {            
            console.log('Res:', res);
            new Alert('success', 'Page created successfully');
        });
    }

    /**
     * Processes web link form data.
     */
    private processFormData(formData: Record<string, string>): void {
        console.log('Form data:', formData);
    }

    /**
     * Validates if the given URL is correctly formatted.
     */
    private isValidUrl(url: string): boolean {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch (e) {
            return false;
        }
    }
}
