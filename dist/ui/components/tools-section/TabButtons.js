import { i18n } from "../../../i18n/i18n";
export class TabButtons {
    constructor() {
        this.container = document.createElement('div');
        this.init();
    }
    init() {
        this.container.classList.add('tb-tabs');
        const pagesButton = document.createElement('button');
        pagesButton.id = 'pages-button';
        pagesButton.className = 'tb-tab-button active';
        pagesButton.setAttribute('data-tab', 'pages');
        const pagesSpan = document.createElement('span');
        pagesSpan.id = 'sidebar_tabs_pages_label';
        pagesSpan.innerText = i18n.t("sidebar.pages");
        pagesButton.appendChild(pagesSpan);
        const templatesButton = document.createElement('button');
        templatesButton.id = 'templates-button';
        templatesButton.className = 'tb-tab-button';
        templatesButton.setAttribute('data-tab', 'templates');
        const templatesSpan = document.createElement('span');
        templatesSpan.id = 'sidebar_tabs_templates_label';
        templatesSpan.innerText = i18n.t("sidebar.templates.label");
        templatesButton.appendChild(templatesSpan);
        pagesButton.addEventListener('click', (e) => {
            e.preventDefault();
            pagesButton === null || pagesButton === void 0 ? void 0 : pagesButton.classList.add('active');
            templatesButton === null || templatesButton === void 0 ? void 0 : templatesButton.classList.remove('active');
            this.switchTabs('pages-content', 'templates-content');
        });
        templatesButton.addEventListener('click', (e) => {
            e.preventDefault();
            templatesButton === null || templatesButton === void 0 ? void 0 : templatesButton.classList.add('active');
            pagesButton === null || pagesButton === void 0 ? void 0 : pagesButton.classList.remove('active');
            this.switchTabs('templates-content', 'pages-content');
        });
        this.container.appendChild(pagesButton);
        this.container.appendChild(templatesButton);
    }
    switchTabs(activeTab, inactiveTab) {
        const activeTabDiv = document.getElementById(activeTab);
        const inactiveTabDiv = document.getElementById(inactiveTab);
        console.log(activeTabDiv, inactiveTabDiv);
        activeTabDiv.style.display = 'block';
        inactiveTabDiv.style.display = 'none';
    }
    render(container) {
        container.appendChild(this.container);
    }
}
//# sourceMappingURL=TabButtons.js.map