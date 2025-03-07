"use strict";
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
// function createPageForm() {
//     const form = new Form('page-form');
//     // Add page title field
//     form.addField({
//         label: 'Page Title',
//         type: 'text',
//         id: 'page_title',
//         placeholder: 'New page title',
//         required: true
//     });
//     // Add description field
//     form.addField({
//         label: 'Description',
//         type: 'text',
//         id: 'page_description',
//         placeholder: 'Page description'
//     });
//     // Render form
//     form.render(document.body);
//     return form;
// }
// // Create the form
// const pageForm = createPageForm();
//# sourceMappingURL=Form.js.map