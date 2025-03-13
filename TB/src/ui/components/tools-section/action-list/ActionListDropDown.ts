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
      },
      {
        name: "Service/Product Page",
        displayName: "Service Pages",
        label: "Service Page",
        options: this.getServices(),
      },
      {
        name: "Dynamic Forms",
        displayName: "Dynamic Forms",
        label: "Dynamic Forms",
        options: this.getDynamicForms(),
      },
      {
        name: "Predefined Page",
        displayName: "Modules",
        label: "Modules",
        options: [],
      },
      {
        name: "Web Link",
        displayName: "Web Links",
        label: "Web Link",
        options: [],
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

  async getPages() {
    try {
      const res = await demoPages.AppVersions.find((version) => version.IsActive)?.Pages || [];
      const pages = res.filter(
        (page: any) => 
          page.PageType = "Menu" 
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
