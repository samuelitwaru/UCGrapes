import { ContentDataUi } from "./ContentDataUi";
import { ContentMapper } from "./ContentMapper";
import { CtaButtonProperties } from "./CtaButtonProperties";
import { InfoContentMapper } from "./InfoContentMapper";
import { TileManager } from "./TileManager";
import { TileMapper } from "./TileMapper";
import { TileProperties } from "./TileProperties";
import { TileUpdate } from "./TileUpdate";
import { ChildEditor } from "./ChildEditor";
import { ActionListPopUp } from "../../ui/views/ActionListPopUp";
import { InfoSectionPopup } from "../../ui/views/InfoSectionPopup";
import { ContentSection } from "../../ui/components/tools-section/ContentSection";
import { ActionSelectContainer } from "../../ui/components/tools-section/action-list/ActionSelectContainer";
import { ToolboxManager } from "../toolbox/ToolboxManager";
import { InfoType } from "../../types";
import { svg } from "d3";
import { InfoSectionManager } from "../InfoSectionManager";
import { AddInfoSectionButton } from "../../ui/components/AddInfoSectionButton";
import { AppVersionManager } from "../versions/AppVersionManager";

export class EditorUIManager {
  editor: any;
  pageId: any;
  frameId: any;
  pageData: any;
  tileManager: any;
  tileProperties: any;
  appVersionManager: any;
  tilePropsSection: HTMLElement;
  ctaPropsSection: HTMLDivElement;
  isMenuOpen: boolean = false;

  constructor(
    editor: any,
    pageId: any,
    frameId: any,
    pageData: any,
    appVersionManager: AppVersionManager
  ) {
    this.editor = editor;
    this.pageId = pageId;
    this.frameId = frameId;
    this.pageData = pageData;
    this.appVersionManager = appVersionManager;

    this.tilePropsSection = document.getElementById(
      "menu-page-section") as HTMLElement
    this.ctaPropsSection = document.getElementById(
      "content-page-section"
    ) as HTMLDivElement;
  }

  handleTileManager(e: MouseEvent) {
    this.tileManager = new TileManager(
      e,
      this.editor,
      this.pageId,
      this.frameId,
      this.pageData
    );
  }

  initContentDataUi(e: MouseEvent, pageData: any) {
    new ContentDataUi(e, this.editor, pageData);
  }

  clearAllMenuContainers(excludeTileMenu: boolean = false) {
    const existingMenu = document.querySelectorAll(".menu-container");
    existingMenu.forEach((menu: any) => {
      if (!excludeTileMenu || menu.classList.contains("info-section-popup")) {
        menu.remove();
      }
    });

    const infoSections = this.editor?.getWrapper()?.find(".info-section-spacing-container");
    infoSections?.forEach((component: any) => {
      component.getEl().style.removeProperty("height");
      const svgTrigger = component.getEl().querySelector('[data-name="Ellipse 6"]') as HTMLElement;
      const addButton = component.getEl().querySelector(".add-new-info-section") as HTMLDivElement;
      if (addButton) {
        addButton.style.removeProperty("opacity");
      }
      if (svgTrigger) {
        svgTrigger.setAttribute("fill", "#fdfdfd");
      }
      const svgGPath = component.getEl().querySelector('path') as SVGPathElement;
      if (svgGPath) {
        svgGPath.setAttribute("fill", "#5068a8");
      }
    });
  }

  openMenu(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest(".tile-open-menu")) {
      e.stopPropagation();
      const menuBtn = target.closest(".tile-open-menu") as HTMLElement;
      const templateContainer = menuBtn.closest(
        ".template-wrapper"
      ) as HTMLElement;

      this.clearAllMenuContainers();

      // Get the mobileFrame for positioning context
      const mobileFrame = document.getElementById(
        `${this.frameId}-frame`
      ) as HTMLElement;
      const iframe = mobileFrame?.querySelector("iframe") as HTMLIFrameElement;
      const iframeRect = iframe?.getBoundingClientRect();

      // Pass the mobileFrame to the ActionListPopUp constructor
      const menu = new ActionListPopUp(templateContainer, mobileFrame);

      const triggerRect = menuBtn.getBoundingClientRect();

      menu.render(triggerRect, iframeRect);
    }
  }

  handleInfoSectionHover(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (this.isMenuOpen) {
      this.isMenuOpen = false;
      return;
    };
    // Check if the target is within a '.add-new-info-section svg'
    const svgTrigger = target.closest(".add-new-info-section svg") as HTMLElement;

    if (svgTrigger) {
      // Find the nearest parent container with class 'info-section-spacing-container'
      let el: HTMLElement | null = svgTrigger;
      const sectionContainer = (() => {
        while (el) {
          if (el.classList.contains("info-section-spacing-container")) return el;
          el = el.parentElement;
        }
        return null;
      })();

      if (!sectionContainer) {
        console.warn("No parent info-section-spacing-container found.");
        return;
      }

      // Find the next div with class starting with 'info' and ending with 'section'
      const nextSectionId = this.getNextInfoSectionId(sectionContainer);

      if (nextSectionId) {
        console.log("Found next sectionId:", nextSectionId);
      } else {
        console.warn("No matching info section found below.");
      }

      // Proceed with your logic (menu rendering, iframe positioning, etc.)
      const mobileFrame = document.getElementById(`${this.frameId}-frame`) as HTMLElement;
      const iframe = mobileFrame?.querySelector("iframe") as HTMLIFrameElement;
      const iframeRect = iframe?.getBoundingClientRect();

      const menu = new InfoSectionPopup(sectionContainer, mobileFrame, nextSectionId);
      const triggerRect = svgTrigger.getBoundingClientRect();

      menu.render(triggerRect, iframeRect);
      this.isMenuOpen = true;
      const addNewSectionContainer = svgTrigger.closest(".info-section-spacing-container") as HTMLDivElement
      if (addNewSectionContainer) {
        addNewSectionContainer.style.height = "3.2rem";
        const addButton = addNewSectionContainer.querySelector(".add-new-info-section") as HTMLDivElement;
        if (addButton) {
          addButton.style.opacity = "1";
        }
        const svgGEl = svgTrigger.querySelector('[data-name="Ellipse 6"]') as HTMLElement;
        if (svgGEl) {
          svgGEl.setAttribute("fill", "#5068a8");
        }

        const svgGPath = svgTrigger.querySelector('path') as SVGPathElement;
        if (svgGPath) {
          svgGPath.setAttribute("fill", "#fff");
        }
      }

      (globalThis as any).pageData = this.pageData;
      this.activateEditor(this.frameId);
    }
  }

  getNextInfoSectionId(target: HTMLElement): string {
    // console.log('target :>> ', target);
    // Check if the target has the class 'info-section-spacing-container'
    if (!target.classList.contains('info-section-spacing-container')) {
      // console.warn('Target element does not have the correct class');
      return '';
    }

    // Find the next sibling of the target element
    let nextElement = target.nextElementSibling;

    // Loop through the sibling elements until we find the next div with the class starting with 'info' and ending with 'section'
    while (nextElement) {
      // console.log('nextElement :>> ', nextElement);
      if (nextElement instanceof HTMLElement && nextElement.dataset.gjsType?.startsWith('info') && nextElement.dataset.gjsType?.endsWith('section')) {
        // console.log('nextElementId :>> ', nextElement.id);
        // Return the sectionId of the found element
        return nextElement.id || '';
      }
      // Move to the next sibling
      nextElement = nextElement.nextElementSibling;
    }

    // If no matching element is found
    // console.warn('No matching info section found');
    return '';
  }

  handleDragEnd(model: any, sourceComponent: any, destinationComponent: any) {
    this.activateEditor(this.frameId);
    let parentEl = destinationComponent.getEl();
    let isDraggingTile = false;

    // manage plus button sections
    const containerColumn = this.editor?.getWrapper()
      .find(".container-column-info")[0];
    if (containerColumn) {
      const modelId = model.target?.getId?.() ?? model.getId();
      const components = containerColumn.components().models;
      const modelIndex = components.findIndex((comp: any) => comp.getId() === modelId);

      const addInfoSectionButton = new AddInfoSectionButton().getHTML();

      // Add plus above
      const plusAbove = this.editor?.addComponents(addInfoSectionButton);
      containerColumn.append(plusAbove, { at: modelIndex });

      // Add plus below
      const plusBelow = this.editor?.addComponents(addInfoSectionButton);
      containerColumn.append(plusBelow, { at: modelIndex + 2 });

      // Clean up redundant plus buttons
      const infoSectionManager = new InfoSectionManager();
      infoSectionManager.removeConsecutivePlusButtons();
      infoSectionManager.markFirstAndLastPlusButtons('first');
      infoSectionManager.markFirstAndLastPlusButtons('last');
    }

    // If dragged element is a tile, get the main container-column-info parent
    if (parentEl && parentEl.getAttribute("data-gjs-type") === "info-tiles-section") {
      const containerParent = parentEl.closest(".container-column-info");
      if (containerParent) {
        isDraggingTile = true;
        parentEl = containerParent;
      }
    }

    if (
      parentEl &&
      parentEl.classList.contains("container-column-info")
    ) {

      // Same logic for info content rows
      const siblings = Array.from(parentEl.children).filter(
        (el) =>
          !(el as Element).classList.contains("info-section-spacing-container")
      );
      const modelEl = isDraggingTile ? model.parent.getEl() : model.target.getEl();
      const filteredIndex = siblings.findIndex((el) => el === modelEl);

      const infoContentMapper = new InfoContentMapper(this.pageId);
      infoContentMapper.moveContentRow(modelEl.getAttribute("id"), filteredIndex);
    }

    const infoSectionMapper = new InfoSectionManager();
    infoSectionMapper.removeConsecutivePlusButtons();
  }

  onTileUpdate(containerRow: any) {
    if (
      containerRow &&
      containerRow.getEl()?.classList.contains("container-row")
    ) {
      this.editor.off("component:add", this.handleComponentAdd);
      this.editor.on("component:add", this.handleComponentAdd);
    }
  }

  private handleComponentAdd = (model: any) => {
    const parent = model.parent();
    if (parent && parent.getEl()?.classList.contains("container-row")) {
      const tileWrappers = parent.components().filter((comp: any) => {
        const type = comp.get("type");
        return type === "tile-wrapper";
      });
      if (tileWrappers.length === 3) {
        console.log("more than 3");
      }
    }
  };

  frameEventListener() {
    const framelist = document.querySelectorAll(".mobile-frame");
    framelist.forEach((frame: any) => {
      if (frame.id.includes(this.frameId)) {
        frame.addEventListener("click", (event: MouseEvent) => {
          (globalThis as any).currentPageId = this.pageId;
          (globalThis as any).pageData = this.pageData;
          (globalThis as any).frameId = this.frameId;
          this.activateEditor(this.frameId);
          this.clearAllMenuContainers();
        });

        frame.addEventListener("input", (event: MouseEvent) => {
          (globalThis as any).currentPageId = this.pageId;
          (globalThis as any).pageData = this.pageData;
          (globalThis as any).frameId = this.frameId;
          this.activateEditor(this.frameId);
        });
      }
    });

    document.addEventListener("click", (event: MouseEvent) => {
      this.clearAllMenuContainers();
    })
  }

  setPageFocus(editor: any, frameId: string, pageId: string, pageData: any) {
    const framelist = document.querySelectorAll(".mobile-frame");
    framelist.forEach((frame: any) => {
      if (frame.id.includes(frameId)) {
        (globalThis as any).activeEditor = editor;
        (globalThis as any).currentPageId = pageId;
        (globalThis as any).pageData = pageData;
        (globalThis as any).frameId = frameId;
        this.activateEditor(frameId);
        this.clearAllMenuContainers();
      }
    });
  }

  activateEditor(frameId: any) {
    const mobileFrame = document.getElementById(`${frameId}-frame`) as HTMLDivElement
    if (!mobileFrame) return
    (globalThis as any).pageId = mobileFrame.dataset.pageid;
    const currentPageId = mobileFrame.dataset.pageid
    const currentPage = this.appVersionManager.getPages()?.find((page: any) => page.PageId == currentPageId)
    this.pageData = currentPage
    const framelist = document.querySelectorAll(".mobile-frame");
    framelist.forEach((frame: any) => {
      // deselect in active editors
      const editors = (window as any).app.editors;
      const inactiveEditors = Object.entries(editors).filter(
        ([key]) => key !== frameId
      );
      inactiveEditors.forEach(([key, editor]: [string, any]) => {
        editor.select(null);
      });

      frame.classList.remove("active-editor");

      if (frame.id.includes(frameId)) {
        frame.classList.add("active-editor");

        this.activateMiniatureFrame(frame.id);
      }
    });
    this.showPageInfo();
    (globalThis as any).activeEditor = this.editor;
    (globalThis as any).currentPageId = this.pageId;
    (globalThis as any).pageData = this.pageData;
    new ToolboxManager().unDoReDo();
  }

  showPageInfo() {
    if ((globalThis as any).selectedComponent) {
      return
    }
    let listHTML = ``
    const pageInfoSection = document.querySelector('#page-info-section') as HTMLDivElement
    if (!this.pageData) return;

    if (this.pageData?.PageType == "Information" && this.pageData?.PageInfoStructure.InfoContent) {
      this.pageData.PageInfoStructure.InfoContent.forEach((info: any) => {
        if (info.InfoType == "TileRow") {
          info.Tiles.forEach((tile: any) => {
            listHTML += `<li>${tile.Text}</li>`
          })
        } else if (info.InfoType == "Cta" && info.CtaAttributes.Action) {
          const objectType = info.CtaAttributes.Action.ObjectType
          if (["DynamicForm", "WebLink"].includes(objectType)) {
            listHTML += `<li>${info.CtaAttributes.CtaLabel}</li>`
          }
        }
      })
    }
    pageInfoSection.innerHTML = `
      <h5>${listHTML ? 'Linked Pages' : ''}</h5>
      <ul>
        ${listHTML}
      </ul>
    `
    const pageTitle = document.getElementById('page-info-title') as HTMLDivElement
    pageTitle.innerHTML = `
      <h3>${this.pageData.PageName.toUpperCase()}</h3>
      <hr/>
    `
    pageInfoSection.style.display = "block";
  }

  hidePageInfo() {
    const pageInfoSection = document.querySelector('#page-info-section') as HTMLElement
    pageInfoSection.style.display = "none";
  }

  activateMiniatureFrame(frameId: string) {
    const thumbsList = document.querySelector(
      ".editor-thumbs-list"
    ) as HTMLElement;
    const highlighters = thumbsList.querySelectorAll(".tb-highlighter");
    highlighters.forEach((el: any) => {
      el.style.display = "none";
    });

    const activeThumb = thumbsList.querySelector(`div[id="${frameId}"]`);
    if (activeThumb) {
      const highlighter =
        activeThumb.parentElement?.parentElement?.querySelector(
          ".tb-highlighter"
        ) as HTMLElement;
      if (highlighter) {
        highlighter.style.display = "block";
      }
    }
  }

  showCtaTools() {
    this.ctaPropsSection.style.display = "block";
    this.tilePropsSection.style.display = "none"
  }

  showTileTools() {
    this.tilePropsSection.style.display = "block"
    this.ctaPropsSection.style.display = "none";
  }

  toggleSidebar(show: boolean = false) {
    const toolSection = document.getElementById(
      "tools-section"
    ) as HTMLDivElement;
    // hide sidebar if no active content to work with
    if (show) {
      // console.log('show sidebar :>> ', show);
      toolSection.style.display = "block";
      const menuSection = document.getElementById(
        "menu-page-section"
      ) as HTMLElement;
      const contentection = document.getElementById("content-page-section");
      if (menuSection) menuSection.style.display = "block";
      // if (contentection) contentection.remove();
    } else toolSection.style.display = "none";

  }

  createTileMapper() {
    return new TileMapper(this.pageId);
  }

  createInfoContentMapper() {
    return new InfoContentMapper(this.pageId);
  }

  setTileProperties() {
    const selectedComponent = (globalThis as any).selectedComponent;
    const tileWrapper = selectedComponent.parent();
    const rowComponent = tileWrapper.parent();
    const tileAttributes = (globalThis as any).tileMapper.getTile(
      rowComponent.getId(),
      tileWrapper.getId()
    );

    if (selectedComponent && tileAttributes) {
      this.tileProperties = new TileProperties(
        selectedComponent,
        tileAttributes
      );
      this.tileProperties.setTileAttributes();
    }
  }

  setInfoTileProperties() {
    if (this.pageData.PageType !== "Information") return;
    const selectedComponent = (globalThis as any).selectedComponent;
    const tileWrapper = selectedComponent.parent();
    const rowComponent = tileWrapper.parent();
    const tileInfoSectionAttributes: InfoType = (
      globalThis as any
    ).infoContentMapper.getInfoContent(rowComponent.getId());
    if (selectedComponent && tileInfoSectionAttributes) {
      const tileAttributes = tileInfoSectionAttributes?.Tiles?.find(
        (tile: any) => tile.Id === tileWrapper.getId()
      );
      this.tileProperties = new TileProperties(
        selectedComponent,
        tileAttributes
      );
      this.tileProperties.setTileAttributes();
    }
  }

  setInfoCtaProperties() {
    // render cta component
    (window as any).app.toolsSection.pagesTabContent.contentSection.renderComponents()

    const selectedComponent = (globalThis as any).selectedComponent;
    if (this.pageData.PageType !== "Information") return;

    if (!selectedComponent.is("info-cta-section")) return;

    this.clearCtaProperties();

    const tileInfoSectionAttributes: InfoType = (
      globalThis as any
    ).infoContentMapper.getInfoContent(selectedComponent.getId());

    if (selectedComponent && tileInfoSectionAttributes) {
      const ctaAttributes = tileInfoSectionAttributes?.CtaAttributes;
      const ctaProperties = new CtaButtonProperties(
        selectedComponent,
        ctaAttributes
      );
      ctaProperties.setctaAttributes();
    }
  }

  clearCtaProperties() {
    const selectedComponent = (globalThis as any).selectedComponent;
    if (selectedComponent && selectedComponent.find(".cta-styled-btn")[0]) {
      return;
    }
    const buttonLayoutContainer = document?.querySelector(
      ".cta-button-layout-container"
    ) as HTMLElement;
    if (buttonLayoutContainer) buttonLayoutContainer.style.display = "flex";
    const contentSection = document.querySelector("#content-page-section");
    const colorItems = contentSection?.querySelectorAll(".color-item > input");
    colorItems?.forEach((input: any) => (input.checked = false));

    const buttonLabel = contentSection?.querySelector(".cta-action-input");
    if (buttonLabel) buttonLabel.remove();
  }

  async createChildEditor() {
    const selectedComponent = (globalThis as any).selectedComponent;
    const tileWrapper = selectedComponent.parent();
    const rowComponent = tileWrapper.parent();
    let tileAttributes;

    const isTile = selectedComponent.getClasses().includes('template-block')
    const isCta = ['img-button-container', 'plain-button-container', 'cta-container-child']
      .some(cls => selectedComponent.getClasses().includes(cls))



    if (this.pageData.PageType === "Information") {
      const tileInfoSectionAttributes: InfoType = (
        globalThis as any
      ).infoContentMapper.getInfoContent(rowComponent.getId());

      tileAttributes = tileInfoSectionAttributes?.Tiles?.find(
        (tile: any) => tile.Id === tileWrapper.getId()
      );
    } else {
      tileAttributes = (globalThis as any).tileMapper.getTile(
        rowComponent.getId(),
        tileWrapper.getId()
      );
    }

    this.removeOtherEditors();
    if (tileAttributes?.Action?.ObjectId) {
      if (
        tileAttributes?.Action?.ObjectType === "Phone" ||
        tileAttributes?.Action?.ObjectType === "Email"
      ) {
        return;
      }
      const objectId = tileAttributes.Action.ObjectId;
      const data: any = JSON.parse(
        localStorage.getItem(`data-${objectId}`) || "{}"
      );
      let childPage;
      if (Object.keys(data).length > 0) {
        childPage = data;
      } else {
        const pages = this.appVersionManager.getPages();
        childPage = pages?.find((page: any) => page.PageId === objectId);
      }
      if (childPage) {
        new ChildEditor(objectId, childPage).init(tileAttributes);
      }
    }
    this.activateNavigators();
  }

  removeEditor(): void {
    const frameId = (globalThis as any).frameId;
    const editorContainer = document.querySelector(
      `#${frameId}-frame`
    ) as HTMLElement;
    if (editorContainer) {
      this.removeOtherEditors();
      editorContainer.remove();
    }

    // Remove the corresponding thumbnail from the thumbs list
    const thumbsList = document.querySelector(
      ".editor-thumbs-list"
    ) as HTMLElement;
    const thumbToRemove = thumbsList.querySelector(
      `div[id="${frameId}"]`
    );
    if (thumbToRemove) {
      thumbToRemove.parentElement?.parentElement?.parentElement?.remove();
    }
  }

  removeOtherEditors(): void {
    const framelist = document.querySelectorAll(".mobile-frame");
    framelist.forEach((frame: any) => {
      if (frame.id.includes((globalThis as any).frameId)) {
        let nextElement = frame.nextElementSibling;
        while (nextElement) {
          const elementToRemove = nextElement;
          nextElement = nextElement.nextElementSibling;
          if (elementToRemove) {
            const thumbsList = document.querySelector(
              ".editor-thumbs-list"
            ) as HTMLElement;
            const thumbToRemove = thumbsList.querySelector(
              `div[id="${elementToRemove.id}"]`
            );
            if (thumbToRemove) {
              thumbToRemove.parentElement?.parentElement?.parentElement?.remove();
            }

            elementToRemove.remove();
          }
        }
      }
    });
  }

  clearAllEditors(): void {
    const framelist = document.querySelectorAll(".mobile-frame");
    framelist.forEach((frame: any) => {
      const thumbsList = document.querySelector(
        ".editor-thumbs-list"
      ) as HTMLElement;
      const thumbToRemove = thumbsList.querySelector(
        `div[id="${frame.id}"]`
      );
      if (thumbToRemove) {
        thumbToRemove.parentElement?.parentElement?.parentElement?.remove();
      }

      frame.remove();
    });
  }

  activateNavigators(): any {
    const leftNavigator = document.querySelector(
      ".page-navigator-left"
    ) as HTMLElement;
    const rightNavigator = document.querySelector(
      ".page-navigator-right"
    ) as HTMLElement;
    const scrollContainer = document.getElementById(
      "child-container"
    ) as HTMLElement;
    const prevButton = document.getElementById("scroll-left") as HTMLElement;
    const nextButton = document.getElementById("scroll-right") as HTMLElement;
    const frames = document.querySelectorAll("#child-container .mobile-frame");
    const menuContainer = document.querySelector(
      ".menu-container"
    ) as HTMLElement;

    // Show navigation buttons only when content overflows
    const menuWidth = menuContainer ? menuContainer.clientWidth : 0;
    const totalFramesWidth =
      Array.from(frames).reduce((sum, frame) => sum + frame.clientWidth, 0) +
      menuWidth;
    const containerWidth = scrollContainer.clientWidth;

    const alignment =
      window.innerWidth <= 1440
        ? frames.length > 1
          ? "center"
          : "center"
        : frames.length > 3
          ? "center"
          : "center";

    scrollContainer.style.setProperty("justify-content", alignment);

    const scrollBy = (offset: number) => {
      const adjustedOffset = offset + menuWidth;
      scrollContainer.scrollTo({
        left: scrollContainer.scrollLeft + adjustedOffset,
        behavior: "smooth",
      });
    };

    const updateButtonVisibility = () => {
      // Visibility logic maintained but commented out as in original
    };

    scrollContainer.addEventListener("scroll", updateButtonVisibility);

    return { updateButtonVisibility, scrollBy };
  }

  resetTitleFromDOM() {
    const pageTitle = document.querySelector('.app-bar .title') as HTMLHeadingElement;
    const editHeader = document.getElementById('edit_page_title') as HTMLElement;
    const saveChange = document.getElementById('save_page_title') as HTMLElement;
    const titleDiv = document.querySelector('.app-bar .appbar-title-container') as HTMLDivElement;

    if (!pageTitle || !editHeader || !saveChange || !titleDiv) {
      console.warn('resetTitleFromDOM: Required elements not found in DOM');
      return;
    }

    if (pageTitle.contentEditable === "false") return

    // Reset UI elements
    pageTitle.contentEditable = "false";
    editHeader.style.display = "block";
    saveChange.style.display = "none";
    titleDiv.style.removeProperty("border-width");
    pageTitle.style.whiteSpace = "";
    pageTitle.style.overflow = "";
    pageTitle.style.textOverflow = "";

    const editorWidth = (globalThis as any).deviceWidth;
    const length = editorWidth ? (editorWidth <= 300 ? 18 : 23) : 23;
    if (pageTitle.textContent && this.pageData.PageName) {
      pageTitle.title = this.pageData.PageName
      if (pageTitle.textContent.length > length) {
        pageTitle.textContent = this.pageData.PageName.substring(0, length) + "...";
      } else {
        pageTitle.textContent = this.pageData.PageName;
      }
    }
  }
}
