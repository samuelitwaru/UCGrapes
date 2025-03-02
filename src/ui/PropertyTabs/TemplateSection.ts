class TemplateSection {
    private template: string;
    constructor() {
        this.template = `
            <div class="template-section">
                <h2>Template Section</h2>
                <p>This is a template section</p>
            </div>
        `;
    }
    render() {
        return this.template;
    }
}