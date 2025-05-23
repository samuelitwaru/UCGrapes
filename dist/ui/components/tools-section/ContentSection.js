var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ThemeManager } from "../../../controls/themes/ThemeManager";
import { ToolBoxService } from "../../../services/ToolBoxService";
import { CtaButtonLayout } from "./content-section/CtaButtonLayout";
import { CtaColorPalette } from "./content-section/CtaColorPalette";
import { CtaIconList } from "./content-section/CtaIconList";
export class ContentSection {
    constructor(page) {
        this.page = page;
        this.themeManager = new ThemeManager();
        this.container = document.createElement('div');
        this.initializeContentSection();
    }
    initializeContentSection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.checkIfRendered())
                    return;
                this.toggleSideBar();
                yield this.prepareContentData();
                this.setupContainerStyles();
                this.renderComponents();
            }
            catch (error) {
                console.error('Error initializing Content Section:', error);
            }
        });
    }
    checkIfRendered() {
        const sidebar = document.getElementById('pages-content');
        if (sidebar) {
            const existingContent = sidebar.querySelector('#content-page-section');
            if (existingContent) {
                return true;
            }
        }
        return false;
    }
    prepareContentData() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const toolboxService = new ToolBoxService();
            if (this.page.PageName === "Location" || this.page.PageName === "Reception") {
                const location = yield toolboxService.getLocationData();
                if (!location)
                    return;
                const locationDetails = location === null || location === void 0 ? void 0 : location.BC_Trn_Location;
                this.iconsList = [
                    {
                        CallToActionName: "Phone",
                        CallToActionPhone: locationDetails === null || locationDetails === void 0 ? void 0 : locationDetails.LocationPhone,
                        CallToActionType: "Phone"
                    },
                    {
                        CallToActionName: "Email",
                        CallToActionEmail: locationDetails === null || locationDetails === void 0 ? void 0 : locationDetails.LocationEmail,
                        CallToActionType: "Email"
                    }
                ];
            }
            else {
                const response = yield toolboxService.getContentPageData((_a = this.page) === null || _a === void 0 ? void 0 : _a.PageId);
                if (response) {
                    this.iconsList = response.SDT_ProductService.CallToActions;
                }
            }
        });
    }
    setupContainerStyles() {
        this.container.classList.add('sidebar-section', 'content-page-section');
        this.container.id = 'content-page-section';
        this.container.style.display = 'block';
    }
    renderComponents() {
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
    toggleSideBar() {
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
//# sourceMappingURL=ContentSection.js.map