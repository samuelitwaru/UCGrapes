import { ActionPage } from "../../../../interfaces/ActionPage";
import { Category } from "../../../../interfaces/Category";
import { ToolBoxService } from "../../../../services/ToolBoxService";
import { demoPages } from "../../../../utils/test-data/pages";
import { ActionDetails } from "./ActionDetails";
import { i18n } from "../../../../i18n/i18n";

export class ActionListDropDown {
  container: HTMLElement;
  toolBoxService: ToolBoxService;  
  currentLanguage: any;

  constructor() {
    this.container = document.createElement("div");
    this.toolBoxService = new ToolBoxService();
    this.init();
    
    
  }

  async init() {
    this.container.className = "tb-dropdown-menu";
    this.container.id = "dropdownMenu";


    const categoryData: Category[] = await this.getCategoryData();
    categoryData.forEach((category) => {
      const dropdownContent = new ActionDetails(category);
      dropdownContent.render(this.container);
    });
  }

  async getCategoryData(): Promise<Category[]> {
    const activePage = (globalThis as any).pageData;
    const categories = [
      {
        name: "Page",
        displayName: i18n.t("sidebar_tabs_pages_label"),
        label: i18n.t("sidebar_tabs_pages_label"),
        options: await this.getPages(),
        canCreatePage: true,
      },
      (activePage) && (
        activePage.PageType === "MyCare" || 
        activePage.PageType === "MyService" ||
        activePage.PageType === "MyLiving"
      )
        ? {
          name: "Service/Product Page",
          displayName: "Service Pages",
          label: i18n.t("category_services_or_page"),
          options: this.getServices(activePage),
          canCreatePage: true,
        }
        : null,
      {
        name: "Dynamic Forms",
        displayName: i18n.t("category_dynamic_form"),
        label: i18n.t("category_dynamic_form"),
        options: this.getDynamicForms(),
        canCreatePage: false,
      },
      {
        name: "Predefined Pages",
        displayName: i18n.t("category_predefined_page"),
        label: "Modules",
        options: await this.getPredefinedPages(),
        canCreatePage: false,
      },
      {
        name: "Content Page",
        displayName: i18n.t("content_page"),
        label: i18n.t("content_page"),
        options: await this.getContentPages(),
        canCreatePage: true,
      },
      {
        name: "Web Link",
        displayName: i18n.t("category_link"),
        label: i18n.t("category_link"),
        options: [],
        canCreatePage: false,
      },
    ];

    return categories.filter((category): category is Category => 
      category !== null
    );
  }

  getDynamicForms() {
    const forms = (this.toolBoxService.forms || []).map((form) => ({
        PageId: form.FormId,
        PageName: form.ReferenceName,
        TileName: form.ReferenceName
      }));
    return forms;
  }

  getServices(activePage: any) {
    let services = (this.toolBoxService.services || []);
    services = services.filter(
      (service: any) => 
        service.ProductServiceClass.replace(/\s+/g, "")== activePage.PageType
      )
      .map((service) => ({
        PageId: service.ProductServiceId,
        PageName: service.ProductServiceName,
        TileName: service.ProductServiceTileName || service.ProductServiceName,
        TileCategory: service.ProductServiceClass
      }));
    return services;
  }

  async getContentPages() {
    try {
      const versions = await this.toolBoxService.getVersions();
      const res = versions.AppVersions.find((version:any) => version.IsActive)?.Pages || [];
      const pages = res.filter(
        (page: any) => 
          page.PageType == "Content"
      ).map((page: any) => ({
        PageId: page.PageId,
        PageName: page.PageName,
        TileName: page.PageName
      }))

      return pages;
    } catch (error) {
      console.error("Error fetching pages:", error);
      throw error;
    }
  }

  async getPages() {
    try {
      const versions = await this.toolBoxService.getVersions();
      const res = versions.AppVersions.find((version:any) => version.IsActive)?.Pages || [];
      const pages = res.filter(
        (page: any) => 
          page.PageType == "Menu"
          && page.PageName !== "Home"
          && page.PageName !== "My Care"
          && page.PageName !== "My Living"
          && page.PageName !== "My Services"
      ).map((page: any) => ({
        PageId: page.PageId,
        PageName: page.PageName,
        TileName: page.PageName
      }))

      return pages;
    } catch (error) {
      console.error("Error fetching pages:", error);
      throw error;
    }
  }

  async getPredefinedPages() {
    try {
      const versions = await this.toolBoxService.getVersions();
      const res = versions.AppVersions.find((version:any) => version.IsActive)?.Pages || [];
      const pages = res.filter(
        (page: any) => 
          page.PageType == "Maps" ||
          page.PageType == "MyActivity" ||
          page.PageType == "Calendar"
          && page.PageName !== "Home"
      ).map((page: any) => ({
        PageId: page.PageId,
        PageName: page.PageName,
        TileName: page.PageName
      }))
      return pages;
    } catch (error) {
      console.error("Error fetching pages:", error);
      throw error;
    }
  }

  render(container: HTMLElement) {
    container.appendChild(this.container);
  }
}
