import { AppConfig } from "../AppConfig";
import { MenuItem } from "../interfaces/MenuItem";
import { baseURL, ToolBoxService } from "../services/ToolBoxService";
import { ActionListDropDown } from "../ui/components/tools-section/action-list/ActionListDropDown";
import { PageAttacher } from "../ui/components/tools-section/action-list/PageAttacher";
import { PageCreationService } from "../ui/components/tools-section/action-list/PageCreationService";
import { ChildEditor } from "./editor/ChildEditor";
import { AppVersionManager } from "./versions/AppVersionManager";
import { i18n } from "../i18n/i18n";

export class ActionListController {
  private toolboxService: ToolBoxService;
  private appVersionManager: AppVersionManager;
  private pageAttacher: PageAttacher;
  actionList: ActionListDropDown;
  private selectedComponent: any;
  pageCreationService: PageCreationService;

  constructor() {
    this.toolboxService = new ToolBoxService();
    this.appVersionManager = new AppVersionManager();
    this.pageAttacher = new PageAttacher();
    this.actionList = new ActionListDropDown();
    this.pageCreationService = new PageCreationService();
    this.selectedComponent = (globalThis as any).selectedComponent;
  }

  async getMenuCategories(): Promise<MenuItem[][] | null> {
    const categoryData = await this.actionList.getCategoryData();
    console.log("categoryData", categoryData);
    const activePage = (globalThis as any).pageData;

    // Create the second category array with conditional logic
    const secondCategory: MenuItem[] = [];

    // Only add Services if the page type matches
    // if (activePage && activePage.PageType !== "Information") {
      secondCategory.push({
        id: "list-form",
        name: "DynamicForm",
        label: i18n.t("tile.forms"),
        expandable: true,
        action: () => this.getSubMenuItems(categoryData, "Forms"),
      });
    // }
    // if (activePage && activePage.PageType !== "Information") {
      secondCategory.push({
        id: "list-module",
        name: "Modules",
        label: i18n.t("tile.modules"),
        expandable: true,
        action: () => this.getSubMenuItems(categoryData, "Modules"),
      });
    // }

    secondCategory.push({
      id: "list-page",
      name: "Existing Pages",
      label: i18n.t("tile.existing_pages"),
      expandable: true,
      action: () => this.getSubMenuItems(categoryData, "Page"),
    });
  
    return [
      [
        // {
        //   id: "add-menu-page",
        //   label: i18n.t("tile.add_menu_page"),
        //   name: "",
        //   action: async () => {
        //     this.createNewPage("Untitled");
        //   },
        // },
        {
          id: "add-info-page",
          label: i18n.t("tile.information_page"),
          name: "",
          action: async () => {
            this.createNewInfoPage("Untitled");
          },
        },
        // {
        //   id: "add-content-page",
        //   label:  i18n.t("tile.add_content_page"),
        //   name: "",
        //   action: () => {
        //     const config = AppConfig.getInstance();
        //     config.addServiceButtonEvent()
        //   },
        // },
      ],
      secondCategory,
      [
        { id: "add-email", label: i18n.t("tile.email"), name: "", action: () => {this.pageCreationService.handleEmail()} },
        { id: "add-phone", label: i18n.t("tile.phone"), name: "", action: () => {this.pageCreationService.handlePhone()} },
        { id: "add-web-link", label: "Web link", name: "", action: () => {this.pageCreationService.handleWebLinks()} },
      ],
    ];
  }

  async getSubMenuItems(categoryData: any, type: string): Promise<MenuItem[]> {
    const category = categoryData.find((cat: any) => cat.name === type);
    const itemsList = category?.options || [];
    return itemsList.map((item: any) => {
      return {
        id: item.PageId,
        label: item.PageName,
        url: item.PageUrl,
        action: () => this.handleSubMenuItemSelection(item, type),
      };
    });
  }

  async createNewPage(title: string): Promise<void> {
    const appVersion = await this.appVersionManager.getActiveVersion();
    const res = await this.toolboxService.createMenuPage(
      appVersion.AppVersionId,
      title
    );

    if (!res.error.message) {
      const page = {
        PageId: res.MenuPage.PageId,
        PageName: res.MenuPage.PageName,
        TileName: res.MenuPage.PageName,
        PageType: res.MenuPage.PageType,
      };
      this.pageAttacher.attachToTile(page, "Menu", "Menu");
    } else {
      console.error("error", res.error.message);
    }
  }

  async createNewInfoPage(title: string): Promise<void> {
    const appVersion = await this.appVersionManager.getActiveVersion();
    const res = await this.toolboxService.createInfoPage(
      appVersion.AppVersionId,
      title
    );

    if (!res.error.message) {
      const page = {
        PageId: res.MenuPage.PageId,
        PageName: res.MenuPage.PageName,
        TileName: res.MenuPage.PageName,
        PageType: res.MenuPage.PageType,
      };
      this.pageAttacher.attachToTile(page, "Information", "Information");
    } else {
      console.error("error", res.error.message);
    }
  }

  private handleSubMenuItemSelection(item: any, type: string): void {
    this.pageAttacher.removeOtherEditors();
    if (type === "DynamicForm") {
      this.handleDynamicForms(item);
    } else if (type === "Modules") {
      this.pageAttacher.attachToTile(item, item.PageType, item.PageName);
    } else {
      this.pageAttacher.attachToTile(item, type, item.PageName);
    }
  }

  async handleDynamicForms(form: any) {
    const selectedComponent = (globalThis as any).selectedComponent;
    if (!selectedComponent) return;
    const tileTitle = selectedComponent.find(".tile-title")[0];
    if (tileTitle) tileTitle.components(form.PageName);

    const tileId = selectedComponent.parent().getId();
    const rowId = selectedComponent.parent().parent().getId();

    const version = (globalThis as any).activeVersion;
    const childPage = version?.Pages.find(
      (page: any) =>
        page.PageName === "Dynamic Form" && page.PageType === "DynamicForm"
    );

    const formUrl = `${baseURL}/utoolboxdynamicform.aspx?WWPFormId=${form.PageId}&WWPDynamicFormMode=DSP&DefaultFormType=&WWPFormType=0`;
    const updates = [
      ["Text", form.PageName],
      ["Name", form.PageName],
      ["Action.ObjectType", "DynamicForm"],
      ["Action.ObjectId", form.PageId],
      ["Action.ObjectUrl", formUrl],
    ];

    //  this.updateActionListDropDown("Dynamic Form", form.PageName);

    for (const [property, value] of updates) {
      (globalThis as any).tileMapper.updateTile(tileId, property, value);
    }
    const tileAttributes = (globalThis as any).tileMapper.getTile(
      rowId,
      tileId
    );

    new ChildEditor(childPage?.PageId, childPage).init(tileAttributes);
  }

  filterMenuItems(items: HTMLElement[], searchTerm: string): HTMLElement[] {
    return items.filter((item) => {
      const itemText = item.textContent?.toLowerCase() || "";
      return itemText.includes(searchTerm.toLowerCase());
    });
  }
}
