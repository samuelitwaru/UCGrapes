import { version } from "eslint-scope";
import { ToolBoxService } from "../../services/ToolBoxService";
import { NavbarButtons } from "../../ui/components/NavbarButtons";
import { ToolsSection } from "../../ui/components/ToolsSection";
import { AppVersionManager } from "../versions/AppVersionManager";
import { PageAttacher } from "../../ui/components/tools-section/action-list/PageAttacher";
import { NavbarLeftButtons } from "../../ui/components/NavBarLeftButtons";
import { TileMapper } from "../editor/TileMapper";
import { TreeComponent } from "../../ui/components/TreeComponent";
import { HistoryManager } from "./HistoryManager";
import { JSONToGrapesJSInformation } from "../editor/JSONToGrapesJSInformation";

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
    // this.autoSave();
    const navBar = document.getElementById("tb-navbar") as HTMLElement;

    const navBarButtons = new NavbarButtons();
    const leftNavBarButtons = new NavbarLeftButtons();

    leftNavBarButtons.render(navBar);
    navBarButtons.render(navBar);
  }

  public setUpSideBar() {
    const sideBar = document.getElementById("tb-sidebar") as HTMLElement;
    const toolsSection = new ToolsSection();
    toolsSection.render(sideBar);
    const toolSectionElement = document.getElementById(
      "tools-section"
    ) as HTMLDivElement;
    if (toolSectionElement) toolSectionElement.style.display = "none";
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

  // autoSave() {
  //   setInterval(async () => {
  //     this.savePages();
  //   }, 10000);
  // }

  async savePages(publish = false) {
    try {
      const lastSavedStates = new Map<string, string>();
      const activeVersion = await this.appVersions.getUpdatedActiveVersion();
      const pages = activeVersion.Pages;
      await Promise.all(
        pages.map(async (page: any) => {
          const pageId = page.PageId;
          const localStorageKey = `data-${pageId}`;
          const pageData = JSON.parse(
            localStorage.getItem(localStorageKey) || "{}"
          );

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
          ) {
            localStructureProperty = "PageContentStructure";
          } else if (page.PageType === "Information") {
            localStructureProperty = "PageInfoStructure";
          }

          if (!localStructureProperty || !pageData[localStructureProperty])
            return;

          const localStructureString = JSON.stringify(
            pageData[localStructureProperty]
          );

          // Ensure page.PageStructure is a string for comparison
          const pageStructureString =
            typeof page.PageStructure === "string"
              ? page.PageStructure
              : JSON.stringify(page.PageStructure);
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
              // console.log(`Saving page: ${page.PageName}`);
              await this.toolboxService.autoSavePage(pageInfo);
              lastSavedStates.set(pageId, localStructureString);
              // if (!publish) this.openToastMessage();
            } catch (error) {
              console.error(`Failed to save page ${page.PageName}:`, error);
              throw error; // Re-throw to be caught by the outer try/catch
            }
          }
        })
      );

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
    const undoButton = document.getElementById("undo") as HTMLButtonElement;
    const redoButton = document.getElementById("redo") as HTMLButtonElement;
    const pageId = (globalThis as any).currentPageId;

    if (!pageId) {
      console.log("No editor found");
      return;
    }

    const historyManager = new HistoryManager(pageId);
    const updateButtonStates = () => {
      if (undoButton) {
        undoButton.disabled = !historyManager.canUndo();
      }

      if (redoButton) {
        redoButton.disabled = !historyManager.canRedo();
      }
    };

    updateButtonStates();

    if (undoButton) {
      undoButton.onclick = (e) => {
        e.preventDefault();
        const undoResult = historyManager.undo();

        if (undoResult) {
          this.applyNewState(undoResult, pageId);
        }
        updateButtonStates();
      };
    }

    if (redoButton) {
      redoButton.onclick = (e) => {
        e.preventDefault();
        const redoResult = historyManager.redo();

        if (redoResult) {
          this.applyNewState(redoResult, pageId);
        }
        updateButtonStates();
      };
    }
  }

  applyNewState(stateData: any, pageId: string) {
    const editor = (globalThis as any).activeEditor;
    if (!editor) return;

    const frameContainer = editor.getWrapper().find("#frame-container")[0];
    if (!frameContainer) return;

    // Capture current state
    const currentState = this.captureCurrentState(frameContainer);

    // Apply the new state
    this.replaceFrameContent(stateData, pageId, frameContainer);

    // Restore scroll and selection
    this.restoreUIState(editor, currentState);
  }

  private captureCurrentState(frameContainer: any) {
    const selectedComponent = (globalThis as any).selectedComponent;
    let scrollPosition = { top: 0, left: 0 };
    let frameContainerEl = null;

    try {
      frameContainerEl = frameContainer.getEl();
      if (frameContainerEl) {
        scrollPosition = {
          top: frameContainerEl.scrollTop || 0,
          left: frameContainerEl.scrollLeft || 0,
        };

        // Hide container to prevent flicker
        frameContainerEl.style.visibility = "hidden";
      }
    } catch (error) {
      console.warn("Could not capture current state:", error);
    }

    return {
      selectedComponent: selectedComponent || null,
      scrollPosition,
      frameContainerEl,
    };
  }

  private replaceFrameContent(
    stateData: any,
    pageId: string,
    frameContainer: any
  ) {
    const jsonFormatter = new JSONToGrapesJSInformation(stateData);
    const updatedHtml = jsonFormatter.generateHTML();
    const storageKey = `data-${pageId}`;

    frameContainer.replaceWith(updatedHtml);
    localStorage.setItem(storageKey, JSON.stringify(stateData));
    this.savePages();
  }

  private restoreUIState(editor: any, currentState: any) {
    const { selectedComponent, scrollPosition } = currentState;

    const restoreState = () => {
      this.restoreScrollPosition(editor, scrollPosition);
      this.restoreSelectedComponent(editor, selectedComponent);
    };

    // for smooth restoration
    requestAnimationFrame(() => {
      restoreState();
      setTimeout(restoreState, 10);
    });
  }

  private restoreScrollPosition(
    editor: any,
    scrollPosition: { top: number; left: number }
  ) {
    try {
      const newFrameContainer = editor.getWrapper().find("#frame-container")[0];
      const newFrameContainerEl = newFrameContainer?.getEl();

      if (!newFrameContainerEl) return;

      const hasScrollToRestore =
        scrollPosition.top > 0 || scrollPosition.left > 0;

      if (hasScrollToRestore) {
        newFrameContainerEl.scrollTop = scrollPosition.top;
        newFrameContainerEl.scrollLeft = scrollPosition.left;
      }

      newFrameContainerEl.style.visibility = "visible";
    } catch (error) {
      console.log("Could not restore scroll position:", error);
      this.ensureContainerVisibility(editor);
    }
  }

  private restoreSelectedComponent(
    editor: any,
    selectedComponent: any | null
  ) {
    if (!selectedComponent) return;

    setTimeout(() => {
      try {
        const newFrameContainer = editor
          .getWrapper()
          .find("#frame-container")[0];
        if (!newFrameContainer) return;

        let selectedComponentId;
        let newComponent;
        if (selectedComponent.is("info-cta-section")) {
          selectedComponentId = selectedComponent.getId();   
          newComponent = editor
            .getWrapper()
            .find(`#${selectedComponentId}`)[0];       
        } else {
          // it is a tile
          const tileSectionId = selectedComponent?.parent()?.getId();
          if (!tileSectionId) return;
          const newTileSection = editor
            .getWrapper()
            .find(`#${tileSectionId}`)[0];
          if (!newTileSection) return;
          newComponent = newTileSection
            .find(`.template-block`)[0]; 
        }
        if (newComponent) {
          editor.select(newComponent);
          (globalThis as any).selectedComponent = newComponent;
        } else {
          console.log("Previously selected component no longer exists");
        }
      } catch (error) {
        console.log("Could not restore selected component:", error);
      }
    }, 150);
  }

  private ensureContainerVisibility(editor: any) {
    try {
      const frameContainer = editor.getWrapper().find("#frame-container")[0];
      const frameContainerEl = frameContainer?.getEl();
      if (frameContainerEl) {
        frameContainerEl.style.visibility = "visible";
      }
    } catch (error) {
      console.log("Could not ensure container visibility:", error);
    }
  }
}
