import { ToolBoxService } from "../../services/ToolBoxService";
import { EditorThumbs } from "../../ui/components/editor-content/EditorThumbs";
import { PageSelector } from "../../ui/components/page-selector/PageSelector";
import { ActionSelectContainer } from "../../ui/components/tools-section/action-list/ActionSelectContainer";
import { ContentSection } from "../../ui/components/tools-section/ContentSection";
import { ActionListPopUp } from "../../ui/views/ActionListPopUp";
import { ThemeManager } from "../themes/ThemeManager";
import { ToolboxManager } from "../toolbox/ToolboxManager";
import { AppVersionManager } from "../versions/AppVersionManager";
import { ChildEditor } from "./ChildEditor";
import { ContentDataUi } from "./ContentDataUi";
import { ContentMapper } from "./ContentMapper";
import { CtaButtonProperties } from "./CtaButtonProperties";
import { DeletePageButton } from "./DeletePageButton";
import { FrameEvent } from "./FrameEvent";
import { NewPageButton } from "./NewPageButton";
import { TileManager } from "./TileManager";
import { TileMapper } from "./TileMapper";
import { TileProperties } from "./TileProperties";
import { TileUpdate } from "./TileUpdate";
export class EditorEvents {
  editor: any;
  pageId: any;
  frameId: any;
  pageData: any;
  editorManager: any;
  tileManager: any;
  tileProperties: any;
  appVersionManager: any;
  toolboxService: any;
  themeManager: any;
  isHome?: boolean;

  constructor() {
    this.appVersionManager = new AppVersionManager();
    this.toolboxService = new ToolBoxService();
    this.themeManager = new ThemeManager();
  }

  init(editor: any, pageData: any, frameEditor: any, isHome?: boolean) {
    this.editor = editor;
    this.pageData = pageData;
    this.pageId = pageData.PageId;
    this.frameId = frameEditor;
    this.isHome = isHome;
    new FrameEvent(this.frameId);
    this.onDragAndDrop();
    this.onSelected();
    this.onComponentUpdate();
    this.onLoad();
  }

  onLoad() {
    if (this.editor !== undefined) {
      this.editor.on("load", () => {
        const wrapper = this.editor.getWrapper();
        if (wrapper) {
          wrapper.view.el.addEventListener("click", (e: MouseEvent) => {
            const targetElement = e.target as Element;
            if (
              targetElement.closest(".menu-container") ||
              targetElement.closest(".menu-category") ||
              targetElement.closest(".sub-menu-header")
            ) {
              e.stopPropagation();
              return;
            }

            this.clearAllMenuContainers();
            this.tileManager = new TileManager(
              e,
              this.editor,
              this.pageId,
              this.frameId
            );
            (globalThis as any).activeEditor = this.editor;
            (globalThis as any).currentPageId = this.pageId;
            (globalThis as any).pageData = this.pageData;
            new ToolboxManager().unDoReDo();
            new ContentDataUi(e, this.editor, this.pageData);
            this.activateEditor(this.frameId);
          });

          wrapper.view.el.addEventListener("mouseover", (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest(".tile-open-menu")) {
              const menuBtn = target.closest(".tile-open-menu") as HTMLElement;
              const templateContainer = menuBtn.closest(
                ".template-wrapper"
              ) as HTMLElement;

              this.clearAllMenuContainers();

              // Get the mobileFrame for positioning context
              const mobileFrame = document.getElementById(
                `${this.frameId}-frame`
              ) as HTMLElement;
              const iframe = mobileFrame?.querySelector(
                "iframe"
              ) as HTMLIFrameElement;
              const iframeRect = iframe?.getBoundingClientRect();

              // Pass the mobileFrame to the ActionListPopUp constructor
              const menu = new ActionListPopUp(templateContainer, mobileFrame);

              const triggerRect = menuBtn.getBoundingClientRect();

              menu.render(triggerRect, iframeRect);
              // const activateNav = this.activateNavigators();
              // activateNav.scrollBy(50)
            }
          });
        } else {
          console.error("Wrapper not found!");
        }

        new EditorThumbs(
          this.frameId,
          this.pageId,
          this.editor,
          this.pageData,
          this.isHome
        );
        this.frameEventListener();
        this.activateNavigators();
      });
    }
  }

  clearAllMenuContainers() {
    const existingMenu = document.querySelectorAll(".menu-container");
    existingMenu.forEach((menu: any) => {
      menu.remove();
    });
  }

  onComponentUpdate() {
    this.editor.on("component:update", (model: any) => {
      // console.log("Component updated", model);
      window.dispatchEvent(
        new CustomEvent("pageChanged", {
          detail: { pageId: this.pageId },
        })
      );
    });
  }
  onDragAndDrop() {
    let sourceComponent: any;
    let destinationComponent: any;
    const tileMapper = new TileMapper(this.pageId);
    const contentMapper = new ContentMapper(this.pageId);

    this.editor.on("component:drag:start", (model: any) => {
      sourceComponent = model.parent;
    });

    this.editor.on("component:drag:end", (model: any) => {
      destinationComponent = model.parent;

      const parentEl = destinationComponent.getEl();
      if (parentEl && parentEl.classList.contains("container-row")) {
        const tileWrappers = model.parent.components().filter((comp: any) => {
          const type = comp.get("type");
          return type === "tile-wrapper";
        });
        if (tileWrappers.length > 3) {
          model.target.remove();
          this.editor.UndoManager.undo();
        }

        const isDragging: boolean = true;
        const tileUpdate = new TileUpdate();
        tileUpdate.updateTile(destinationComponent, isDragging);
        tileUpdate.updateTile(sourceComponent, isDragging);

        tileMapper.moveTile(
          model.target.getId(),
          sourceComponent.getId(),
          destinationComponent.getId(),
          model.index
        );
        this.onTileUpdate(destinationComponent);
      } else if (
        parentEl &&
        parentEl.classList.contains("content-page-wrapper")
      ) {
        contentMapper.moveContentRow(model.target.getId(), model.index);
      } else if (
        parentEl &&
        parentEl.classList.contains("cta-button-container")
      ) {
        contentMapper.moveCta(model.target.getId(), model.index);
      }
    });
  }

  onSelected() {
    this.editor.on("component:selected", (component: any) => {
      (globalThis as any).selectedComponent = component;
      (globalThis as any).tileMapper = new TileMapper(this.pageId);

      (globalThis as any).frameId = this.frameId;
      this.setTileProperties();
      this.setCtaProperties();
      this.createChildEditor();
    });

    this.editor.on("component:deselected", () => {
      (globalThis as any).selectedComponent = null;
    });
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
      frame.classList.remove("active-editor");
      if (frame.id.includes(frameId)) {
        frame.classList.add("active-editor");
        this.activateMiniatureFrame(frame.id);
        this.toggleSidebar();
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

  async toggleSidebar() {
    const toolSection = document.getElementById(
      "tools-section"
    ) as HTMLDivElement;
    const mappingSection = document.querySelector(
      "#mapping-section"
    ) as HTMLDListElement;
    toolSection.style.display = "block";
    mappingSection.style.display = "none";
    if (
      this.pageData?.PageType === "Content" ||
      this.pageData?.PageType === "Location" ||
      this.pageData?.PageType === "Reception"
    ) {
      new ContentSection(this.pageData);
      this.clearCtaProperties();
    } else {
      const menuSection = document.getElementById(
        "menu-page-section"
      ) as HTMLElement;
      const contentection = document.getElementById("content-page-section");
      if (menuSection) menuSection.style.display = "block";
      if (contentection) contentection.remove();

      const actionListContainer = new ActionSelectContainer();
      actionListContainer.render(menuSection);
    }
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

  setCtaProperties() {
    const selectedComponent = (globalThis as any).selectedComponent;
    const ctaAttributes = new ContentMapper(this.pageId).getContentCta(
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
    const tileAttributes = (globalThis as any).tileMapper.getTile(
      rowComponent.getId(),
      tileWrapper.getId()
    );
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
        // const version = await this.appVersionManager.getActiveVersion();
        childPage = this.appVersionManager
          .getPages()
          ?.find((page: any) => page.PageId === objectId);
      }

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

    if (totalFramesWidth > containerWidth) {
      leftNavigator.style.display = "flex";
      rightNavigator.style.display = "flex";
    } else {
      leftNavigator.style.display = "none";
      rightNavigator.style.display = "none";
    }

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

    prevButton.addEventListener("click", () => scrollBy(-200));
    nextButton.addEventListener("click", () => {
      scrollBy(200);
    });

    const updateButtonVisibility = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
      prevButton.style.display = scrollLeft > 0 ? "flex" : "none";
      nextButton.style.display =
        scrollLeft + clientWidth < scrollWidth ? "flex" : "none";
    };

    updateButtonVisibility();
    scrollContainer.addEventListener("scroll", updateButtonVisibility);

    return { updateButtonVisibility, scrollBy };
  }
}
