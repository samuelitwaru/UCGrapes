import { ToolBoxService } from "../../../../services/ToolBoxService";
import { ActionDetails } from "./ActionDetails";
import { i18n } from "../../../../i18n/i18n";
import { AppVersionManager } from "../../../../controls/versions/AppVersionManager";
import { capitalizeWords } from "../../../../utils/helpers";
import { Category } from "../../../../types";

export class ActionListDropDown {
  container: HTMLElement;
  toolBoxService: ToolBoxService;  
  currentLanguage: any;
  appVersion: AppVersionManager;

  constructor() {
    this.container = document.createElement("div");
    this.toolBoxService = new ToolBoxService();
    this.appVersion = new AppVersionManager();
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
        displayName: i18n.t("sidebar.action_list.page"),
        label: i18n.t("sidebar.action_list.page"),
        options: await this.getPages(),
        canCreatePage: true,
      },
      (activePage) &&
      (
        activePage.PageType === "MyCare" ||
        activePage.PageType === "MyService" ||
        activePage.PageType === "MyLiving"
      )
        ? {
            name: "Content",
            displayName: i18n.t("sidebar.action_list.services"),
            label: i18n.t("sidebar.action_list.services"),
            options: this.getServices(activePage),
            canCreatePage: true,
          }
        : null,
      {
        name: "DynamicForm",
        displayName: i18n.t("sidebar.action_list.forms"),
        label: i18n.t("sidebar.action_list.forms"),
        options: this.getDynamicForms(),
        canCreatePage: false,
      },
      {
        name: "Modules",
        displayName: i18n.t("sidebar.action_list.module"),
        label: i18n.t("sidebar.action_list.module"),
        options: await this.getPredefinedPages(),
        canCreatePage: false,
      },
      {
        name: "WebLink",
        displayName: i18n.t("sidebar.action_list.weblink"),
        label: i18n.t("sidebar.action_list.weblink"),
        options: [],
        canCreatePage: false,
      },
      {
        name: "CallToActions",
        displayName: i18n.t("sidebar.action_list.call_to_action"),
        label: i18n.t("sidebar.action_list.call_to_action"),
        options:
        [
          { PageId: "add-email", PageName: i18n.t("tile.email"), TileName: "", PageType: "CtaEmail", },
          { PageId: "add-phone", PageName: i18n.t("tile.phone"), TileName: "", PageType: "CtaPhone", },
          { PageId: "add-web-link", PageName: "Web link", TileName: "", PageType: "CtaWebLink", },
        ],
        canCreatePage: false,
      },
    ];
  
    return categories
      .filter((category): category is Category => category !== null)
      .sort((a, b) => a.label.localeCompare(b.label));
  }
  

  getDynamicForms() {
    const forms = (this.toolBoxService.forms || []).map((form) => ({
        PageId: form.FormId,
        PageName: form.PageName,
        TileName: form.PageName,
        PageUrl: form.FormUrl,
        PageType: "DynamicForm",
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


  async getPages() {
    try {
      const versions = this.appVersion.getPages() || [];
      const pages = versions.filter(
        (page: any) => 
          (page.PageType == "Menu" || page.PageType == "Information") 
          && (page.PageName !== "Home"
          && page.PageName !== "My Care"
          && page.PageName !== "My Living"
          && page.PageName !== "My Services")
      ).map((page: any) => ({
        PageId: page.PageId,
        PageName: capitalizeWords(page.PageName),
        TileName: capitalizeWords(page.PageName),
        PageType: page.PageType,
      }))

      return pages;
    } catch (error) {
      console.error("Error fetching pages:", error);
      throw error;
    }
  }

  async getPredefinedPages() {
    try {
      const version = await this.appVersion.preDefinedPages() || [];
      const pages = version.map((page: any) => ({
        PageId: page.PageId,
        PageName: page.PageName,
        TileName: page.PageName,
        PageType: page.PageType
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
