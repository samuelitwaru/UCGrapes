import { ToolBoxService } from "../../services/ToolBoxService";
import { ResizeState, TileHeights } from "../../types";
import { EditorThumbs } from "../../ui/components/editor-content/EditorThumbs";
import { ImageUpload } from "../../ui/components/tools-section/tile-image/ImageUpload";
import { minTileHeight } from "../../utils/default-attributes";
import { ImageUploadManager } from "../ImageUploadManager";
import { InfoSectionManager } from "../InfoSectionManager";
import { ThemeManager } from "../themes/ThemeManager";
import { AppVersionManager } from "../versions/AppVersionManager";
import { ChildEditor } from "./ChildEditor";
import { EditorManager } from "./EditorManager";
import { EditorUIManager } from "./EditorUiManager";
import { FrameEvent } from "./FrameEvent";
import { PageMapper } from "./PageMapper";



export class EditorEvents {
  // Core editor properties
  private editor: any;
  private pageId: any;
  private frameId: any;
  private pageData: any;
  private isHome?: boolean;
  private isNewPage?: boolean;

  // Services and managers
  private editorManager: any;
  private appVersionManager: AppVersionManager;
  private toolboxService: ToolBoxService;
  private uiManager!: EditorUIManager;

  // Component state
  private selectedComponent: any;
  private resizeState!: ResizeState;
  private tileHeights!: TileHeights;

  constructor() {
    this.appVersionManager = new AppVersionManager();
    this.toolboxService = new ToolBoxService();
    this.initializeResizeState();
    this.initializeTileHeights();
    this.isNewPage = false;
  }

  private initializeResizeState(): void {
    this.resizeState = {
      isResizing: false,
      isDragging: false,
      resizingRowHeight: 0,
      resizingRow: null,
      resizingRowParent: null,
      resizeYStart: 0,
      initialHeight: 80,
      templateBlock: null,
      affectedElements: null,
      originalCursors: null,
      resizeOverlay: null,
      infoSectionSpacer: null,
      frameChildren: []
    };
  }

  private initializeTileHeights(): void {
    this.tileHeights = {
      min: minTileHeight,
      medium: minTileHeight * 1.5,
      max: minTileHeight * 2,
      snapThreshold: 10
    };
  }

  public init(editor: any, pageData: any, frameEditor: any, isHome?: boolean, isNewPage?: boolean): void {
    this.editor = editor;
    this.pageData = pageData;
    this.pageId = pageData.PageId;
    this.frameId = frameEditor;
    this.isHome = isHome;
    this.isNewPage = isNewPage;

    this.initializeUIManager();
    this.setupGlobalReferences();
    this.initializeEventListeners();
  }

  private initializeUIManager(): void {
    this.uiManager = new EditorUIManager(
      this.editor,
      this.pageId,
      this.frameId,
      this.pageData,
      this.appVersionManager
    );
  }

  private setupGlobalReferences(): void {
    (globalThis as any).uiManager = this.uiManager;
  }

  private initializeEventListeners(): void {
    new FrameEvent(this.frameId);
    this.onDragAndDrop();
    this.onSelected();
    this.onComponentUpdate();
    this.onLoad();
  }

  private onLoad(): void {
    if (!this.editor) return;

    this.editor.on("load", () => {
      const wrapper = this.editor.getWrapper();
      if (!wrapper) {
        console.error("Wrapper not found!");
        return;
      }

      this.setupGlobalWrapper(wrapper, this.editor);
      this.setupWrapperEventListeners(wrapper);
      this.initializePostLoadComponents();
      this.activateFrameEvents(wrapper);
    });
  }

  private setupGlobalWrapper(wrapper: any, editor: any): void {
    (globalThis as any).wrapper = wrapper;
    (globalThis as any).nextEditor = editor
  }

  private setupWrapperEventListeners(wrapper: any): void {
    const viewEl = wrapper.view.el;

    viewEl.addEventListener("mousedown", this.handleMouseDown.bind(this));
    viewEl.addEventListener("mousemove", this.handleMouseMove.bind(this));
    viewEl.addEventListener("mouseup", this.handleMouseUp.bind(this));
    viewEl.addEventListener("dblclick", this.handleDoubleClick.bind(this));
    viewEl.addEventListener("click", this.handleClick.bind(this));
    viewEl.addEventListener("mouseover", this.handleMouseOver.bind(this));

    // Document-level events for resize functionality
    document.addEventListener("mousemove", this.handleDocumentMouseMove.bind(this));
    document.addEventListener("mouseup", this.handleDocumentMouseUp.bind(this));
  }

  private handleMouseDown(e: MouseEvent): void {
    const targetElement = e.target as Element;

    if (targetElement.closest(".tile-resize-button")) {
      this.startResize(e, targetElement);
    }

    if (targetElement.closest(".template-block")) {
      this.resizeState.isDragging = true;
    }
  }

  private startResize(e: MouseEvent, targetElement: Element): void {
    this.resizeState.isResizing = true;
    this.resizeState.resizingRow = targetElement.closest(".template-wrapper") as HTMLDivElement;
    this.resizeState.resizingRowParent = targetElement.closest(".container-row") as HTMLDivElement;
    this.resizeState.resizingRowHeight = this.resizeState.resizingRow.offsetHeight;
    this.resizeState.resizeYStart = e.clientY;
    this.resizeState.initialHeight = this.resizeState.resizingRow.offsetHeight;

    this.setupResizeUI(targetElement);
  }

  private setupResizeUI(targetElement: Element): void {
    const frameContainer = targetElement.closest("#frame-container") as HTMLDivElement;

    // Setup frame children cursors
    this.resizeState.frameChildren = Array.from(frameContainer?.querySelectorAll("*"))
      .filter((child): child is HTMLDivElement => child !== this.resizeState.resizingRow);

    this.resizeState.frameChildren.forEach((child) => {
      child.style.setProperty("cursor", "ns-resize", "important");
    });

    // Create resize overlay
    this.createResizeOverlay();

    // Setup affected elements
    this.setupAffectedElements();

    // Setup info section spacer
    this.setupInfoSectionSpacer(targetElement);

    this.resizeState.templateBlock = targetElement.closest(".template-block") as HTMLDivElement;
  }

  private createResizeOverlay(): void {
    this.resizeState.resizeOverlay = document.createElement("div");
    Object.assign(this.resizeState.resizeOverlay.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      zIndex: "9999",
      cursor: "ns-resize",
      backgroundColor: "transparent",
      pointerEvents: "auto",
    });
    document.body.appendChild(this.resizeState.resizeOverlay);
  }

  private setupAffectedElements(): void {
    if (!this.resizeState.resizingRow) return;

    this.resizeState.affectedElements = Array.from(
      this.resizeState.resizingRow.querySelectorAll("*")
    ) as HTMLElement[];

    this.resizeState.originalCursors = this.resizeState.affectedElements.map(
      (el) => el.style.cursor
    );

    this.resizeState.affectedElements.forEach((el) => {
      el.style.setProperty("cursor", "ns-resize", "important");
    });
  }

  private setupInfoSectionSpacer(targetElement: Element): void {
    this.resizeState.infoSectionSpacer = targetElement
      ?.closest(".container-row")
      ?.nextElementSibling?.closest(".info-section-spacing-container") as HTMLDivElement | null;

    if (this.resizeState.infoSectionSpacer) {
      this.resizeState.infoSectionSpacer.style.pointerEvents = "none";
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    if (this.resizeState.isDragging) {
      if ((e.target) as Element) {
        const targetElement = e.target as Element;
        const tileRow = targetElement.closest('[data-gjs-type="info-tiles-section"]') as HTMLDivElement;
        if (tileRow) {
          tileRow.tabIndex = 0;
          tileRow.focus();
        }
      }
    }
  }

  private handleMouseUp(e: MouseEvent): void {
    if (this.resizeState.isDragging) {
      this.resizeState.isDragging = false;
    }
  }

  private handleDocumentMouseMove(e: MouseEvent): void {
    if (!this.resizeState.isResizing || !this.resizeState.resizingRow) return;

    this.performResize(e);
  }

  private performResize(e: MouseEvent): void {
    if (this.resizeState.resizeOverlay) {
      e.preventDefault();
      e.stopPropagation();
    }

    const deltaY = e.clientY - this.resizeState.resizeYStart;
    const newHeight = this.calculateNewHeight(deltaY);

    this.applyResize(newHeight);
  }

  private calculateNewHeight(deltaY: number): number {
    const draggedHeight = this.resizeState.initialHeight + deltaY;
    const { min, medium, max, snapThreshold } = this.tileHeights;

    if (draggedHeight < min + snapThreshold) {
      return min;
    } else if (draggedHeight < medium - snapThreshold) {
      return draggedHeight;
    } else if (draggedHeight < medium + snapThreshold) {
      return medium;
    } else if (draggedHeight < max - snapThreshold) {
      return draggedHeight;
    } else {
      return max;
    }
  }

  private applyResize(newHeight: number): void {
    if (!this.resizeState.resizingRow) return;

    const wrapper = this.editor.getWrapper();
    const comps = wrapper.find(`#${this.resizeState.resizingRow.id}`);

    if (comps.length) {
      comps[0].addStyle({ height: `${newHeight}px` });
    }
  }

  private handleDocumentMouseUp(e: MouseEvent): void {
    if (!this.resizeState.isResizing || !this.resizeState.resizingRow) return;

    this.finishResize();
  }

  private finishResize(): void {
    const finalHeight = this.calculateFinalHeight();
    this.applyFinalResize(finalHeight);
    this.updateInfoTileAttributes(finalHeight);
    this.cleanupResize();
  }

  private calculateFinalHeight(): number {
    if (!this.resizeState.resizingRow) return this.tileHeights.min;

    const currentHeight = this.resizeState.resizingRow.offsetHeight;
    const { min, medium, max } = this.tileHeights;

    if (currentHeight < (min + medium) / 2) {
      return min;
    } else if (currentHeight < (medium + max) / 2) {
      return medium;
    } else {
      return max;
    }
  }

  private applyFinalResize(finalHeight: number): void {
    if (!this.resizeState.resizingRow) return;

    const wrapper = this.editor.getWrapper();
    const comps = wrapper.find(`#${this.resizeState.resizingRow.id}`);

    if (comps.length) {
      this.resizeState.resizingRow.style.transition = "height 0.05s ease-out";
      comps[0].addStyle({ height: `${finalHeight}px` });

      setTimeout(() => {
        if (this.resizeState.resizingRow) {
          this.resizeState.resizingRow.style.removeProperty("transition");
        }
      }, 150);
    }
  }

  private updateInfoTileAttributes(finalHeight: number): void {
    const infoSectionManager = new InfoSectionManager();
    const parentId = this.resizeState.resizingRowParent?.id;

    if (parentId && this.resizeState.resizingRow) {
      infoSectionManager.updateInfoTileAttributes(
        parentId,
        this.resizeState.resizingRow.id,
        "Size",
        finalHeight
      );
    }
  }

  private cleanupResize(): void {
    this.resizeState.isResizing = false;

    // Reset body cursor
    document.body.style.removeProperty("cursor");

    // Remove overlay
    if (this.resizeState.resizeOverlay) {
      document.body.removeChild(this.resizeState.resizeOverlay);
      this.resizeState.resizeOverlay = null;
    }

    // Reset affected element cursors
    this.resetAffectedElementCursors();

    // Reset frame children cursors
    this.resizeState.frameChildren?.forEach((child) => {
      child.style.removeProperty("cursor");
    });

    // Reset info section spacer
    if (this.resizeState.infoSectionSpacer) {
      this.resizeState.infoSectionSpacer.style.pointerEvents = "auto";
    }

    // Clear references
    this.clearResizeReferences();
  }

  private resetAffectedElementCursors(): void {
    if (this.resizeState.affectedElements && this.resizeState.originalCursors) {
      this.resizeState.affectedElements.forEach((el, i) => {
        if (this.resizeState.originalCursors && this.resizeState.originalCursors[i]) {
          el.style.cursor = this.resizeState.originalCursors[i];
        } else {
          el.style.removeProperty("cursor");
        }
      });
    }
  }

  private clearResizeReferences(): void {
    this.resizeState.resizingRow = null;
    this.resizeState.resizingRowParent = null;
    this.resizeState.affectedElements = null;
    this.resizeState.originalCursors = null;
    this.resizeState.resizeOverlay = null;
    this.resizeState.infoSectionSpacer = null;
    this.resizeState.templateBlock = null;
  }

  private handleDoubleClick(e: MouseEvent): void {
    e.preventDefault();
    const selectedComponent = (globalThis as any).selectedComponent;
    if (selectedComponent) {
      this.createImageUploadModal(selectedComponent);
      return;
    }

    const target = e.target as HTMLElement;
    if (target.id == "product-service-image") {
      // Open the image upload modal for info section
      const sectionId = target.parentElement?.id;
      if (!sectionId) return;
      const modal = document.createElement("div");
      modal.classList.add("tb-modal");
      modal.style.display = "flex";

      // Pass "info" as type and sectionId as id
      const modalContent = new ImageUploadManager("info", sectionId);
      modalContent.render(modal);

      document.body.appendChild(modal);
      return;
    }
  }

  private createImageUploadModal(selectedComponent: any): void {
    const modal = document.createElement("div");
    modal.classList.add("tb-modal");
    modal.style.display = "flex";

    const tileComp = selectedComponent.closest('[data-gjs-type="info-tiles-section"]');
    const modalContent = new ImageUploadManager("tile", tileComp?.getId());
    modalContent.render(modal);

    const uploadInput = this.createUploadInput();

    document.body.appendChild(modal);
    document.body.appendChild(uploadInput);
  }

  private createUploadInput(): HTMLInputElement {
    const uploadInput = document.createElement("input");
    uploadInput.type = "file";
    uploadInput.multiple = true;
    uploadInput.accept = "image/jpeg, image/jpg, image/png";
    uploadInput.id = "fileInput";
    uploadInput.style.display = "none";
    return uploadInput;
  }

  private handleClick(e: MouseEvent): void {
    const targetElement = e.target as Element;

    if (this.shouldIgnoreClick(targetElement)) {
      e.stopPropagation();
      return;
    }

    this.processClick(e, targetElement);
  }

  private shouldIgnoreClick(targetElement: Element): boolean {
    return !!(
      targetElement.closest(".menu-container") ||
      targetElement.closest(".menu-category") ||
      targetElement.closest(".sub-menu-header")
    );
  }

  private processClick(e: MouseEvent, targetElement: Element): void {
    this.uiManager.activateEditor(this.frameId);
    this.uiManager.clearAllMenuContainers();
    (globalThis as any).eventTarget = targetElement;

    this.uiManager.handleTileManager(e);
    this.uiManager.openMenu(e);
    this.uiManager.initContentDataUi(e, this.pageData);
    this.uiManager.activateEditor(this.frameId);

    const editorManager = new EditorManager();
    editorManager.loadPageHistory(this.pageData);

    this.uiManager.handleInfoSectionHover(e);
  }

  private handleMouseOver(e: MouseEvent): void {
    const targetElement = e.target as Element;

    const infoSection = targetElement.closest(".info-section-spacing-container") as HTMLDivElement;

    if (infoSection && infoSection.style.height !== "3.2rem") {
      this.uiManager.clearAllMenuContainers(true);
      this.uiManager.isMenuOpen = false;
    }
  }

  private initializePostLoadComponents(): void {
    new EditorThumbs(
      this.frameId,
      this.pageId,
      this.editor,
      this.pageData,
      this.isHome
    );

    this.uiManager.frameEventListener();
    this.uiManager.activateNavigators();

    const infoSectionManager = new InfoSectionManager();
    infoSectionManager.removeConsecutivePlusButtons(this.editor);
  }

  private onComponentUpdate(): void {
    this.editor.on("component:update", (model: any) => {
      window.dispatchEvent(
        new CustomEvent("pageChanged", {
          detail: { pageId: this.pageId },
        })
      );
    });
  }

  private onDragAndDrop(): void {
    let sourceComponent: any;
    let destinationComponent: any;

    this.editor.on("component:drag:start", (model: any) => {
      sourceComponent = model.parent;
    });

    this.editor.on("component:drag:end", (model: any) => {
      if (this.resizeState.isResizing) return;
      destinationComponent = model.parent;
      this.uiManager.handleDragEnd(model, sourceComponent, destinationComponent);
    });
  }

  private onSelected(): void {
    this.editor.on("component:selected", this.handleComponentSelected.bind(this));
    this.editor.on("component:deselected", this.handleComponentDeselected.bind(this));
  }

  private async handleComponentSelected(component: any): Promise<void> {
    this.setupGlobalComponentReferences(component);

    const componentType = this.determineComponentType(component);

    switch (componentType) {
      case 'cta':
        await this.handleCtaSelection(component);
        break;
      case 'tile':
        this.handleTileSelection();
        break;
      default:
        this.handleDefaultSelection();
        break;
    }
  }

  private setupGlobalComponentReferences(component: any): void {
    const pageMapper = new PageMapper(this.editor);
    (globalThis as any).selectedComponent = component;
    (globalThis as any).tileMapper = this.uiManager.createTileMapper();
    (globalThis as any).infoContentMapper = this.uiManager.createInfoContentMapper();
    (globalThis as any).frameId = this.frameId;
    (globalThis as any).activeEditor = this.editor;
  }

  private determineComponentType(component: any): 'cta' | 'tile' | 'default' {
    const classes = component.getClasses();

    if (classes.includes("template-block")) {
      return 'tile';
    }

    const ctaClasses = ["img-button-container", "plain-button-container", "cta-container-child"];
    if (ctaClasses.some(cls => classes.includes(cls))) {
      return 'cta';
    }

    return 'default';
  }

  private async handleCtaSelection(component: any): Promise<void> {
    this.uiManager.toggleSidebar(true);
    this.uiManager.setInfoCtaProperties();
    this.uiManager.showCtaTools();
    this.uiManager.hidePageInfo();

    const ctaAttrs = (globalThis as any).tileMapper.getCta(component.getId());

    if (ctaAttrs.CtaAction) {
      await this.setupChildEditor(ctaAttrs);
    }
  }

  private async setupChildEditor(ctaAttrs: any): Promise<void> {
    const version = (globalThis as any).activeVersion;
    this.uiManager.removeOtherEditors();

    const childPage = this.findChildPage(ctaAttrs, version);

    if (childPage) {
      this.uiManager.removeOtherEditors();
      new ChildEditor(childPage?.PageId, childPage).init(ctaAttrs);
    }
  }

  private findChildPage(ctaAttrs: any, version: any): any {
    const pageType = ctaAttrs.CtaType === "Form" ? "DynamicForm" : ctaAttrs.CtaType;

    if (pageType === "DynamicForm") {
      return version?.Pages.find((page: any) => {
        return page.PageType === pageType &&
          page.PageLinkStructure?.WWPFormId === Number(ctaAttrs.Action?.ObjectId);
      });
    } else if (pageType === "WebLink") {
      return version?.Pages.find((page: any) => {
        return page.PageLinkStructure?.Url === ctaAttrs.CtaAction;
      });
    }

    return null;
  }

  private handleTileSelection(): void {
    this.uiManager.toggleSidebar(true);
    this.uiManager.setTileProperties();
    this.uiManager.setInfoTileProperties();
    this.uiManager.showTileTools();
    this.uiManager.createChildEditor();
    this.uiManager.hidePageInfo();
  }

  private handleDefaultSelection(): void {
    this.uiManager.toggleSidebar(false);
    this.uiManager.showPageInfo();
  }

  handleComponentDeselected(): void {
    (globalThis as any).selectedComponent = null;
    this.uiManager.toggleSidebar(false);
    this.uiManager.showPageInfo();
  }

  private onTileUpdate(containerRow: any): void {
    if (containerRow && containerRow.getEl()?.classList.contains("container-row")) {
      this.editor.off("component:add", this.handleComponentAdd);
      this.editor.on("component:add", this.handleComponentAdd);
    }
  }

  private handleComponentAdd = (model: any): void => {
    const parent = model.parent();
    if (!parent || !parent.getEl()?.classList.contains("container-row")) return;

    const tileWrappers = parent.components().filter((comp: any) => {
      return comp.get("type") === "tile-wrapper";
    });

    if (tileWrappers.length === 3) {
      console.log("more than 3");
    }
  };

  public setPageFocus(editor: any, frameId: string, pageId: string, pageData: any): void {
    this.ensureUIManager();
    this.uiManager.setPageFocus(editor, frameId, pageId, pageData);
  }

  public activateNavigators(): void {
    this.ensureUIManager();
    this.uiManager.activateNavigators();
  }

  public removeOtherEditors(): void {
    this.ensureUIManager();
    this.uiManager.removeOtherEditors();
  }

  public removeEditor(): void {
    this.ensureUIManager();
    this.uiManager.removeEditor();
  }

  public clearAllEditors(): void {
    this.ensureUIManager();
    this.uiManager.clearAllEditors();
    this.handleComponentDeselected();
  }

  public activateEditor(frameId: any): void {
    this.ensureUIManager();
    this.uiManager.activateEditor(frameId);
  }

  private activateFrameEvents(wrapper: any): void {
    if (!this.isHome) return;
    const frameContainer = wrapper?.find('#frame-container')[0]?.getEl();

    if (frameContainer) frameContainer.style.pointerEvents = "all";
  }

  private ensureUIManager(): void {
    if (!this.uiManager) {
      this.uiManager = new EditorUIManager(
        this.editor,
        this.pageId,
        this.frameId,
        this.pageData,
        this.appVersionManager
      );
    }
  }
}