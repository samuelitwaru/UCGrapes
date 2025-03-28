import { version } from "eslint-scope";
import { ToolBoxService } from "../../services/ToolBoxService";
import { NavbarButtons } from "../../ui/components/NavbarButtons";
import { ToolsSection } from "../../ui/components/ToolsSection";
import { AppVersionManager } from "../versions/AppVersionManager";
import { PageAttacher } from "../../ui/components/tools-section/action-list/PageAttacher";
import { NavbarLeftButtons } from "../../ui/components/NavBarLeftButtons";

export class ToolboxManager {
  appVersions: any;
  toolboxService: any;
  pageAttacher: PageAttacher;
  constructor() {
    this.appVersions = new AppVersionManager();
    this.toolboxService = new ToolBoxService();
    this.pageAttacher = new PageAttacher();
  }

  public setUpNavBar() {
    this.autoSave();
    const navBar = document.getElementById("tb-navbar") as HTMLElement;
    // const navbarTitle = document.getElementById("navbar_title") as HTMLElement;
    // if (!navBar || !navbarTitle) {
    //   console.error("Navigation bar elements not found!");
    //   return;
    // }

    // navbarTitle.textContent = "App toolbox";

    const navBarButtons = new NavbarButtons();
    const leftNavBarButtons = new NavbarLeftButtons();
    leftNavBarButtons.render(navBar);
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
    setInterval(async () => {
      this.savePages()
    }, 10000);
  }

  async savePages(publish=false){
    const lastSavedStates = new Map<string, string>();
    const activeVersion = await this.appVersions.getActiveVersion();
    const pages = activeVersion.Pages;

    pages.forEach(async (page: any) => {
      const pageId = page.PageId;
      const localStorageKey = `data-${pageId}`;
      const pageData = JSON.parse(localStorage.getItem(localStorageKey) || "{}");
      
      let localStructureProperty = null;
      if (page.PageType === "Menu") localStructureProperty = "PageMenuStructure";
      else if (page.PageType === "Content") localStructureProperty = "PageContentStructure";
      
      if (!localStructureProperty || !pageData[localStructureProperty]) return;
      
      const localStructureString = JSON.stringify(pageData[localStructureProperty]);
      console.log(localStructureProperty)
      console.log(page.PageStructure)
      if (localStructureString !== page.PageStructure) {
        const pageInfo = {
          AppVersionId: activeVersion.AppVersionId,
          PageId: pageId,
          PageName: page.PageName,
          PageType: page.PageType,
          PageStructure: localStructureString,
        };

        try {
          await this.toolboxService.autoSavePage(pageInfo);
          lastSavedStates.set(pageId, localStructureString);
          if (!publish) this.openToastMessage();
        } catch (error) {
          console.error(`Failed to save page ${page.PageName}:`, error);
        }
      }
    });
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

  closeDropDowns() {
    // document.addEventListener("click", (e) => {
      
    //   const dropDowns = document.querySelectorAll(".theme-options-list");
    //   dropDowns.forEach((dropDown) => {
    //     console.log("clicked");
    //     dropDown.classList.remove("show");
    //   })
    // });
  }
}
