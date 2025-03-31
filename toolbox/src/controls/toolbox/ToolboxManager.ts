import { version } from "eslint-scope";
import { ToolBoxService } from "../../services/ToolBoxService";
import { NavbarButtons } from "../../ui/components/NavbarButtons";
import { ToolsSection } from "../../ui/components/ToolsSection";
import { AppVersionManager } from "../versions/AppVersionManager";
import { PageAttacher } from "../../ui/components/tools-section/action-list/PageAttacher";
import { NavbarLeftButtons } from "../../ui/components/NavBarLeftButtons";
import { UndoRedoManager } from "./UndoRedoManager";

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
      this.savePages();
    }, 10000);
  }

  async savePages(publish = false) {
    try {
      const lastSavedStates = new Map<string, string>();
      const activeVersion = await this.appVersions.getActiveVersion();
      const pages = activeVersion.Pages;
      console.log("Saving pages");
      
      await Promise.all(pages.map(async (page: any) => {
        const pageId = page.PageId;
        const localStorageKey = `data-${pageId}`;
        const pageData = JSON.parse(localStorage.getItem(localStorageKey) || "{}");
      
        let localStructureProperty = null;
        if (
          page.PageType === "Menu" ||
          page.PageType === "MyCare" ||
          page.PageType === "MyLiving" ||
          page.PageType === "MyService"
        )
          localStructureProperty = "PageMenuStructure";
        else if (
          page.PageType === "Content" ||
          page.PageType === "Location" ||
          page.PageType === "Reception"
        )
          localStructureProperty = "PageContentStructure";
      
        if (!localStructureProperty || !pageData[localStructureProperty]) return;
      
        const localStructureString = JSON.stringify(pageData[localStructureProperty]);
        
        // Ensure page.PageStructure is a string for comparison
        const pageStructureString = typeof page.PageStructure === 'string' 
          ? page.PageStructure 
          : JSON.stringify(page.PageStructure);
        
        // console.log(`Saving localStructureProperty ${localStructureString}`);
        // console.log(`Saving page.PageStructure ${pageStructureString}`);
      
        // Compare serialized versions to avoid hidden character differences
        if (localStructureString !== pageStructureString) {
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
            throw error; // Re-throw to be caught by the outer try/catch
          }
        }
      }));
      
      return lastSavedStates; // Return something meaningful
    } catch (error) {
      console.error("Error saving pages:", error);
      throw error; // Re-throw so caller knows something went wrong
    }
  }
  

  openToastMessage(message?: string) {
    const toast = document.createElement("div") as HTMLElement;
    toast.id = "toast";
    toast.textContent = message || "Your changes are saved";

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

  unDoReDo() {
    const editorInstance = (globalThis as any).activeEditor;

    if (!editorInstance) return;
    const undoButton = document.getElementById("undo") as HTMLButtonElement;
    const redoButton = document.getElementById("redo") as HTMLButtonElement;

    const um = editorInstance.UndoManager;
    // Update button states
    undoButton.disabled = !um.hasUndo();
    redoButton.disabled = !um.hasRedo();
    if (undoButton) {
      undoButton.onclick = (e) => {
        e.preventDefault();
        console.log("Undo button clicked");
        um.undo();
        editorInstance.refresh();
      };
    }

    if (redoButton) {
      redoButton.onclick = (e) => {
        e.preventDefault();
        console.log("Redo button clicked");
        um.redo();
        editorInstance.refresh();
      };
    }
  }
}
