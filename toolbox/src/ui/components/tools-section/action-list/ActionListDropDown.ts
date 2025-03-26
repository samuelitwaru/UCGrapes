import { ActionPage } from "../../../../interfaces/ActionPage";
import { Category } from "../../../../interfaces/Category";
import { ToolBoxService } from "../../../../services/ToolBoxService";
import { demoPages } from "../../../../utils/test-data/pages";
import { ActionDetails } from "./ActionDetails";

export class ActionListDropDown {
  container: HTMLElement;
  toolBoxService: ToolBoxService;  

  constructor() {
    this.container = document.createElement("div");
    this.toolBoxService = new ToolBoxService();
    this.init();
    this.getPages()
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

  async getCategoryData() {
    return [
      {
        name: "Page",
        displayName: "Pages",
        label: "Pages",
        options: await this.getPages(),
        canCreatePage: true,
      },
      {
        name: "Service/Product Page",
        displayName: "Service Pages",
        label: "Service Page",
        options: this.getServices(),
        canCreatePage: true,
      },
      {
        name: "Dynamic Forms",
        displayName: "Forms",
        label: "Dynamic Forms",
        options: this.getDynamicForms(),
        canCreatePage: false,
      },
      {
        name: "Predefined Pages",
        displayName: "Modules",
        label: "Modules",
        options: await this.getPredefinedPages(),
        canCreatePage: false,
      },
      {
        name: "Web Link",
        displayName: "Web Links",
        label: "Web Link",
        options: [],
        canCreatePage: false,
      },
      {
        name: "Content Page",
        displayName: "Content Page",
        label: "Content Page",
        options: await this.getContentPages(),
        canCreatePage: true,
      },
    ];
  }

  getDynamicForms() {
    const forms = (this.toolBoxService.forms || []).map((form) => ({
        PageId: form.FormId,
        PageName: form.ReferenceName,
        TileName: form.ReferenceName
      }));
    return forms;
  }

  getServices() {
    const forms = (this.toolBoxService.services || []).map((service) => ({
        PageId: service.ProductServiceId,
        PageName: service.ProductServiceName,
        TileName: service.ProductServiceTileName || service.ProductServiceName
      }));
    return forms;
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
          page.PageType == "Content"
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
