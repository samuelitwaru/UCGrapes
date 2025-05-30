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

    constructor() {
        this.themeManager = new ThemeManager();
        this.container = document.createElement("div") as HTMLElement
        this.container.id = "content-page-section"
        this.initializeContentSection();
    }

    private async initializeContentSection() {
        this.toggleSideBar();
        this.setupContainerStyles();
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
        this.container.style.display = 'block';
    }

    public renderComponents() {
        this.container.innerHTML = '';        
        const ctaButtonSection = new CtaButtonLayout();
        const themeId = (globalThis as any).activeVersion.ThemeId;
        const theme = this.themeManager.getThemeById(themeId);
        const activeCtaColors = theme?.ThemeCtaColors;
        if (!activeCtaColors) return;
        const ctaColorList = new CtaColorPalette(activeCtaColors);

        ctaButtonSection.render(this.container);
        ctaColorList.render(this.container);        
    }

    private toggleSideBar() {
        const menuSection = document.getElementById('menu-page-section');
        if (menuSection) {
            menuSection.style.display = 'none';
        }
    }

    render(container:HTMLElement) {
        container.append(this.container)
    }
}