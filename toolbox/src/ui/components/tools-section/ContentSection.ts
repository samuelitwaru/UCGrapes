import { ThemeManager } from "../../../controls/themes/ThemeManager";
import { ToolBoxService } from "../../../services/ToolBoxService";
import { CreateCTAComponent } from "./content-section/CreateCTAComponent";
import { CtaButtonLayout } from "./content-section/CtaButtonLayout";
import { CtaColorPalette } from "./content-section/CtaColorPalette";
import { CtaIconList } from "./content-section/CtaIconList";

export class ContentSection {
    container: HTMLElement;
    iconsList: any;
    themeManager: ThemeManager
    createCTAComponent: CreateCTAComponent | undefined;
    page: any;

    constructor(page: any) {
        this.page = page;
        this.themeManager = new ThemeManager();
        this.container = document.createElement('div');
        
        this.initializeContentSection();
    }

    private async initializeContentSection() {
        try {
            if (this.checkIfRendered()) return;

            this.toggleSideBar();
            await this.prepareContentData();
            this.setupContainerStyles();
            this.renderComponents();
            
        } catch (error) {
            console.error('Error initializing Content Section:', error);
        }
    }


    private checkIfRendered(): boolean {
        const sidebar = document.getElementById('pages-content');
        if (sidebar) {
            const existingContent = sidebar.querySelector('#content-page-section');
            if (existingContent) {
                return true;
            }
        }
        return false;
    }
    private async prepareContentData() {
        const toolboxService = new ToolBoxService();
        if (this.page.PageName === "Location" || this.page.PageName === "Reception") {
            const location = await toolboxService.getLocationData();

            if (!location) return;
            const locationDetails = location?.BC_Trn_Location;
            this.iconsList = [
                {
                    CallToActionName: "Phone",
                    CallToActionPhone: locationDetails?.LocationPhone,
                    CallToActionType: "Phone"
                },
                {
                    CallToActionName: "Email",
                    CallToActionEmail: locationDetails?.LocationEmail,
                    CallToActionType: "Email"
                }
            ];
        } else {
            const response = await toolboxService.getContentPageData(this.page?.PageId);
            if (response) {
                this.iconsList = response.SDT_ProductService.CallToActions;
            }
        }
    }

    private setupContainerStyles() {
        this.container.classList.add('sidebar-section', 'content-page-section');
        this.container.id = 'content-page-section';
        this.container.style.display = 'block';
    }

    private renderComponents() {
        const ctaButtonSection = new CtaButtonLayout();
        const ctaIconList = new CtaIconList(this.iconsList);
        const activeCtaColors = this.themeManager.currentTheme.ThemeCtaColors;
        const ctaColorList = new CtaColorPalette(activeCtaColors);

        // Clear previous content before rendering
        this.container.innerHTML = '';

        ctaButtonSection.render(this.container);
        ctaIconList.render(this.container);
        ctaColorList.render(this.container);
        
        this.render();
    }

    private toggleSideBar() {
        const menuSection = document.getElementById('menu-page-section');
        if (menuSection) {
            menuSection.style.display = 'none';
        }
    }

    render() {
        const sidebar = document.getElementById('pages-content');
        if (sidebar) {
            // Remove existing content section if it exists
            const existingContent = sidebar.querySelector('#content-page-section');
            if (existingContent) {
                sidebar.removeChild(existingContent);
            }
            
            // Append the new container
            sidebar.appendChild(this.container);
        }
    }
}