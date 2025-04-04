import { AppConfig } from "../../AppConfig";
import { AppVersionManager } from "../../controls/versions/AppVersionManager";
import { ToolBoxService } from "../../services/ToolBoxService";
import { Alert } from "../../ui/components/Alert";
import { PageAttacher } from "../../ui/components/tools-section/action-list/PageAttacher";

export class ActionListPopUp {
  toolboxService: ToolBoxService;
  appVersionManager: AppVersionManager;
  pageAttacher: PageAttacher;
  menuContainer: HTMLDivElement;
  templateContainer: HTMLElement;

  constructor(templateContainer: HTMLElement) {
    this.toolboxService = new ToolBoxService();
    this.appVersionManager = new AppVersionManager();
    this.pageAttacher = new PageAttacher();
    this.templateContainer = templateContainer;
    this.menuContainer = document.createElement("div");
    this.init();
    // const menuContainer = this.render();
    // const childContainer = document.querySelector('mobile-frame')
    // childContainer?.appendChild(menuContainer)
  }

  init() {
    this.menuContainer.classList.add("menu-container");
    const menuItems = [
      "Add menu page",
      "Add content page",
      "Forms",
      "Modules",
      "Web link",
    ];

    const menuList = document.createElement("ul");
    menuList.classList.add("menu-list");

    menuItems.forEach((item) => {
      const menuItem = this.menuItems(item);
      menuList.appendChild(menuItem);
    });
    this.menuContainer.appendChild(menuList);
  }

  menuItems(item: any): HTMLElement {
    const menuItem = document.createElement("li");
    menuItem.classList.add("menu-item");
    menuItem.innerHTML = item;
    return menuItem;
  }

  render() {
    const trigger = this.templateContainer.querySelector(
      ".tile-open-menu"
    ) as HTMLElement;
    const triggerRect = trigger.getBoundingClientRect();
    const popupRect = this.menuContainer.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    this.menuContainer.style.top = "";
    this.menuContainer.style.right = "";
    this.menuContainer.style.bottom = "";
    this.menuContainer.style.left = "";

    if (triggerRect.bottom + popupRect.height < windowHeight) {
      this.menuContainer.style.top = "24px";
      this.menuContainer.style.left = "0";
    } else if (triggerRect.top - popupRect.height > 0) {
      this.menuContainer.style.bottom = "24px";
      this.menuContainer.style.left = "0";
    } else if (triggerRect.left - popupRect.width > 0) {
      this.menuContainer.style.top = "0";
      this.menuContainer.style.left = "24px";
    } else {
      this.menuContainer.style.top = "24px";
      this.menuContainer.style.left = "0";
    }

    // const frame = document.querySelector(".active-editor") as HTMLElement;
    // console.log("activeFrame", frame);
    this.templateContainer.appendChild(this.menuContainer);
  }

  async createNewPage(title: string) {
    const appVersion = (globalThis as any).activeVersion;
    this.toolboxService
      .createMenuPage(appVersion.AppVersionId, title)
      .then((res) => {
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
      });
  }
}
