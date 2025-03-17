import { version } from "eslint-scope";
import { ToolBoxService } from "../../services/ToolBoxService";
import { NavbarButtons } from "../../ui/components/NavbarButtons";
import { ToolsSection } from "../../ui/components/ToolsSection";
import { AppVersionManager } from "../versions/AppVersionManager";

export class ToolboxManager {
  appVersions: any;
  toolboxService: any;
  constructor() {
    this.appVersions = new AppVersionManager();
    this.toolboxService = new ToolBoxService();
  }

  public setUpNavBar() {
    this.autoSave();
    const navBar = document.getElementById("tb-navbar") as HTMLElement;

    const navbarTitle = document.getElementById("navbar_title") as HTMLElement;
    navbarTitle.textContent = "App toolbox";

    let navBarButtons = new NavbarButtons();

    navBarButtons.render(navBar);
  }

  public setUpSideBar() {
    const sideBar = document.getElementById("tb-sidebar") as HTMLElement;
    const toolsSection = new ToolsSection();

    toolsSection.render(sideBar);
  }

  public setUpScrollButtons() {
    const scrollContainer = document.getElementById(
      "child-container"
    ) as HTMLElement;
    const leftScroll = document.querySelector(
      ".navigator .page-navigator-left"
    ) as HTMLElement;
    const rightScroll = document.querySelector(
      ".navigator .page-navigator-right"
    ) as HTMLElement;

    const scrollAmount: number = 300;

    const updateButtonVisibility = () => {
      leftScroll.style.display =
        scrollContainer.scrollLeft > 0 ? "none" : "block";
      const maxScrollLeft =
        scrollContainer.scrollWidth - scrollContainer.clientWidth;
      rightScroll.style.display =
        scrollContainer.scrollLeft < maxScrollLeft - 5 ? "none" : "block";
    };

    leftScroll.onclick = () => {
      scrollContainer.scrollLeft -= scrollAmount;
    };

    rightScroll.onclick = () => {
      scrollContainer.scrollLeft += scrollAmount;
    };

    scrollContainer.addEventListener("scroll", updateButtonVisibility);
    window.addEventListener("resize", updateButtonVisibility);

    updateButtonVisibility();
  }

  autoSave() {
    const lastSavedStates = new Map<string, string>();
    
    setInterval(async () => {
      const activeVersion = await this.appVersions.getActiveVersion();
      const pages = activeVersion.Pages;
      
      pages.forEach(async (page: any) => {
        const pageId = page.PageId;
        const localStorageKey = `data-${pageId}`;
        const pageData = JSON.parse(localStorage.getItem(localStorageKey) || "{}");
        
        if (pageData.PageMenuStructure) {
          const currentStructureString = JSON.stringify(pageData.PageMenuStructure);
          const lastSavedStructure = lastSavedStates.get(pageId);
          
          // Check if the structure has changed since last save
          if (!lastSavedStructure || currentStructureString !== lastSavedStructure) {
            
            const pageInfo = {
              AppVersionId: activeVersion.AppVersionId,
              PageId: pageId,
              PageName: page.PageName,
              PageType: page.PageType,
              PageStructure: currentStructureString,
            };
            
            try {
              await this.toolboxService.autoSavePage(pageInfo);
              lastSavedStates.set(pageId, currentStructureString);
              this.openToastMessage();
            } catch (error) {
              console.error(`Failed to save page ${page.PageName}:`, error);
            }
          }
        }
      });
    }, 10000);
  }

  openToastMessage() {
    const toast = document.createElement("div") as HTMLElement;
    toast.id = "toast";
    toast.textContent = "Your changes are saved";

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateX(-50%) translateY(0)";
    }, 100);

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 500);
    }, 3000);
  }
}
