import { i18n } from "../../../i18n/i18n";

export class TabButtons {
    container: HTMLElement;

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
        templatesSpan.innerText = i18n.t("sidebar.templates");

        templatesButton.appendChild(templatesSpan);

        pagesButton.addEventListener('click', (e) => {
            e.preventDefault();
            pagesButton?.classList.add('active');
            templatesButton?.classList.remove('active');
            this.switchTabs('pages-content', 'templates-content');
        });

        templatesButton.addEventListener('click', (e) => {
            e.preventDefault();
            templatesButton?.classList.add('active');
            pagesButton?.classList.remove('active');
            this.switchTabs('templates-content', 'pages-content');
        });

        this.container.appendChild(pagesButton);
        this.container.appendChild(templatesButton);
    }

    switchTabs (activeTab: string, inactiveTab: string) {
        const activeTabDiv: HTMLElement | any = document.getElementById(activeTab);
        const inactiveTabDiv: HTMLElement | any = document.getElementById(inactiveTab);
        console.log(activeTabDiv, inactiveTabDiv);
        activeTabDiv.style.display = 'block';
        inactiveTabDiv.style.display = 'none';
    }

    render(container: HTMLElement) {
        container.appendChild(this.container);
    }
}