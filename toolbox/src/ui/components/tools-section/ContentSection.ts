import { CtaButtonLayout } from "./content-section/CtaButtonLayout";
import { CtaIconList } from "./content-section/CtaIconList";

export class ContentSection {
    container: HTMLElement;
    iconsList: any;

    constructor(iconsList: any) {
        this.iconsList = iconsList;
        this.container = document.createElement('div');
        this.toggleSideBar();
        this.init();
    }

    private init() {
        this.container.classList.add('sidebar-section', 'content-page-section');
        this.container.id = 'content-page-section';
        this.container.style.display = 'block';

        const ctaButtonSection = new CtaButtonLayout();
        const ctaIconList = new CtaIconList(this.iconsList);

        this.container.appendChild(ctaButtonSection.container);
        this.container.appendChild(ctaIconList.container);

        this.render();
    }

    private toggleSideBar () {
        const menuSection = document.getElementById('menu-page-section');
        if (menuSection) {
            menuSection.style.display = 'none';
        }
    }

    render() {
        const sidebar = document.getElementById('pages-content');
        if (sidebar) {
            sidebar.appendChild(this.container);
        }
    }
}