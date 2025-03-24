import { RichEditor } from "../../../controls/quill/RichEditor";
import { ThemeManager } from "../../../controls/themes/ThemeManager";
import { CreateCTAComponent } from "./content-section/CreateCTAComponent";
import { CtaButtonLayout } from "./content-section/CtaButtonLayout";
import { CtaColorPalette } from "./content-section/CtaColorPalette";
import { CtaIconList } from "./content-section/CtaIconList";

export class ContentSection {
    container: HTMLElement;
    iconsList: any;
    themeManager: ThemeManager
    createCTAComponent: CreateCTAComponent | undefined ;

    constructor(iconsList: any) {
        this.iconsList = iconsList;
        this.themeManager = new ThemeManager();
        this.container = document.createElement('div');
        this.toggleSideBar();
        this.init();
    }

    private init() {
        if (this.container.style.display === 'block') {
            console.log('Content Section is already initialized');
            return;
        } else {
            // console.log("Hello wolrldl")
        }
        this.container.classList.add('sidebar-section', 'content-page-section');
        this.container.id = 'content-page-section';
        this.container.style.display = 'block';

        const ctaButtonSection = new CtaButtonLayout();
        const ctaIconList = new CtaIconList(this.iconsList);
        const activeCtaColors = this.themeManager.currentTheme.ThemeCtaColors;
        const ctaColorList = new CtaColorPalette(activeCtaColors);
        this.createCTAComponent = new CreateCTAComponent()
        ctaButtonSection.render(this.container);
        ctaIconList.render(this.container);
        ctaColorList.render(this.container);
        this.renderCreateCTAButton()
        this.render();
    }

    renderCreateCTAButton(){
        // const button = document.createElement("button");
        // // Set button text
        // button.textContent = "Add CTA";
        // button.classList.add("tb-btn");
        // button.id = "add-cta-button";

        // // Add a click event
        // button.addEventListener("click", (e) => {
        //     e.preventDefault();
        //     this.createCTAComponent?.showPopup();
        // });
        // this.container.append(button)
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
            const existingContent = sidebar.querySelector('#content-page-section');
            if (existingContent) {
                sidebar.removeChild(existingContent);
            }
            sidebar.appendChild(this.container);
        }
    }
    
}