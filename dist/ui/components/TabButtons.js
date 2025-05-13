export class TabButtons {
    constructor() {
        this.container = document.createElement('div');
        console.log("tools section init");
        this.init();
    }
    init() {
        this.container.classList.add('tb-tabs');
        const pagesButton = document.createElement('button');
        pagesButton.id = 'pages-button';
        pagesButton.classList.add('tb-tab-button active');
        pagesButton.setAttribute('data-tab', 'pages');
        const pagesSpan = document.createElement('span');
        pagesSpan.id = 'sidebar_tabs_pages_label';
        pagesSpan.innerText = 'Pages';
        pagesButton.appendChild(pagesSpan);
        const templatesButton = document.createElement('button');
        templatesButton.id = 'templates-button';
        templatesButton.classList.add('tb-tab-button');
        templatesButton.setAttribute('data-tab', 'templates');
        const templatesSpan = document.createElement('span');
        templatesSpan.id = 'sidebar_tabs_templates_label';
        templatesSpan.innerText = 'Templates';
        templatesButton.appendChild(templatesSpan);
        this.container.appendChild(pagesButton);
    }
    render(container) {
        container.appendChild(this.container);
    }
}
//# sourceMappingURL=TabButtons.js.map