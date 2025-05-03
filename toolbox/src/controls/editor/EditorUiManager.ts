import { InfoType } from "../../interfaces/InfoType";
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

  constructor(
    editor: any,
    pageId: any,
    frameId: any,
    pageData: any,
    appVersionManager: any
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

  initContentDataUi(e: MouseEvent) {
    new ContentDataUi(e, this.editor, this.pageData);
  }

  clearAllMenuContainers() {
    const existingMenu = document.querySelectorAll(".menu-container");
    existingMenu.forEach((menu: any) => {
      menu.remove();
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
    if (target.closest(".add-new-info-section svg")) {
      const menuBtn = target.closest(
        ".add-new-info-section svg"
      ) as HTMLElement;
      const templateContainer = menuBtn.closest(
        ".container-column"
      ) as HTMLElement;

      this.clearAllMenuContainers();
      // Get the mobileFrame for positioning context
      const mobileFrame = document.getElementById(
        `${this.frameId}-frame`
      ) as HTMLElement;
      const iframe = mobileFrame?.querySelector("iframe") as HTMLIFrameElement;
      const iframeRect = iframe?.getBoundingClientRect();

      // Pass the mobileFrame to the InfoSectionPopup constructor
      const menu = new InfoSectionPopup(templateContainer, mobileFrame);

      const triggerRect = menuBtn.getBoundingClientRect();

      menu.render(triggerRect, iframeRect);

      (globalThis as any).activeEditor = this.editor;
      (globalThis as any).currentPageId = this.pageId;
      (globalThis as any).pageData = this.pageData;
      this.activateEditor(this.frameId);
    }
  }

  handleDragEnd(model: any, sourceComponent: any, destinationComponent: any) {
    const parentEl = destinationComponent.getEl();
    if (parentEl && parentEl.classList.contains("container-row")) {
      const tileWrappers = model.parent.components().filter((comp: any) => {
        const type = comp.get("type");
        return type === "tile-wrapper";
      });
      console.log(tileWrappers);
      if (tileWrappers.length > 3) {
        model.target.remove();
        this.editor.UndoManager.undo();
      }
      // return
      const isDragging: boolean = true;
      const tileUpdate = new TileUpdate();

      tileUpdate.updateTile(destinationComponent, isDragging);
      tileUpdate.updateTile(sourceComponent, isDragging);

      const tileMapper = new TileMapper(this.pageId);
      tileMapper.moveTile(
        model.target.getId(),
        sourceComponent.getId(),
        destinationComponent.getId(),
        model.index
      );
      console.log("tileMapper", tileMapper);
      this.onTileUpdate(destinationComponent);
    } else if (
      parentEl &&
      parentEl.classList.contains("content-page-wrapper")
    ) {
      const contentMapper = new ContentMapper(this.pageId);
      contentMapper.moveContentRow(model.target.getId(), model.index);
    } else if (
      parentEl &&
      parentEl.classList.contains("cta-button-container")
    ) {
      const contentMapper = new ContentMapper(this.pageId);
      contentMapper.moveCta(model.target.getId(), model.index);
    }
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
          (globalThis as any).activeEditor = this.editor;
          (globalThis as any).currentPageId = this.pageId;
          (globalThis as any).pageData = this.pageData;
          (globalThis as any).frameId = this.frameId;
          this.activateEditor(this.frameId);
          this.clearAllMenuContainers();
        });
      }
    });
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

  showCtaTools () {
    this.ctaPropsSection.style.display = "block";
    this.tilePropsSection.style.display = "none"
  }
  
  showTileTools () {
    // this.ctaPropsSection = document.getElementById(
    //   "content-page-section"
    // ) as HTMLDivElement;
    this.tilePropsSection.style.display = "block"
    this.ctaPropsSection.style.display = "none";
  }

  async toggleSidebar() {
    const toolSection = document.getElementById(
      "tools-section"
    ) as HTMLDivElement;
    toolSection.style.display = "block";

    const menuSection = document.getElementById(
      "menu-page-section"
    ) as HTMLElement;
    const contentection = document.getElementById("content-page-section");
    if (menuSection) menuSection.style.display = "block";
    // if (contentection) contentection.remove();
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

  setCtaProperties() {
    const selectedComponent = (globalThis as any).selectedComponent;
    const contentMapper = new ContentMapper(this.pageId);
    const ctaAttributes = contentMapper.getContentCta(
      selectedComponent.getId()
    );

    if (ctaAttributes && selectedComponent) {
      const ctaProperties = new CtaButtonProperties(
        selectedComponent,
        ctaAttributes
      );
      ctaProperties.setctaAttributes();
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
    if (buttonLayoutContainer) buttonLayoutContainer.style.display = "none";
    const contentSection = document.querySelector("#content-page-section");
    const colorItems = contentSection?.querySelectorAll(".color-item > input");
    colorItems?.forEach((input: any) => (input.checked = false));

    const buttonLabel = contentSection?.querySelector("#cta-action-title");
    if (buttonLabel) buttonLabel.remove();
  }

  async createChildEditor() {
    const selectedComponent = (globalThis as any).selectedComponent;
    const tileWrapper = selectedComponent.parent();
    const rowComponent = tileWrapper.parent();
    let tileAttributes;

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
        if (tileAttributes.Action.ObjectType === "WebLink") {
          childPage = pages?.find((page: any) => page.PageName === "Web Link");
        } else if (tileAttributes.Action.ObjectType === "DynamicForm") {
          childPage = pages?.find(
            (page: any) => page.PageName === "Dynamic Form"
          );
        } else {
          childPage = this.appVersionManager
            .getPages()
            ?.find((page: any) => page.PageId === objectId);
        }
      }
      console.log("childPage", childPage);
      if (childPage) {
        new ChildEditor(objectId, childPage).init(tileAttributes);
      }
    }
    this.activateNavigators();
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
}
