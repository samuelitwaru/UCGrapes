import { ToolBoxService } from "../../services/ToolBoxService";
import { EditorThumbs } from "../../ui/components/editor-content/EditorThumbs";
import { PageSelector } from "../../ui/components/page-selector/PageSelector";
import { ActionSelectContainer } from "../../ui/components/tools-section/action-list/ActionSelectContainer";
import { ContentSection } from "../../ui/components/tools-section/ContentSection";
import { ImageUpload } from "../../ui/components/tools-section/tile-image/ImageUpload";
import { minTileHeight } from "../../utils/default-attributes";
import { ThemeManager } from "../themes/ThemeManager";
import { ToolboxManager } from "../toolbox/ToolboxManager";
import { AppVersionManager } from "../versions/AppVersionManager";
import { EditorUIManager } from "./EditorUiManager";
import { FrameEvent } from "./FrameEvent";
import { PageMapper } from "./PageMapper";

export class EditorEvents {
  editor: any;
  pageId: any;
  frameId: any;
  pageData: any;
  editorManager: any;
  appVersionManager: any;
  toolboxService: any;
  themeManager: any;
  uiManager!: EditorUIManager;
  isHome?: boolean;
  isResizing: boolean = false;
  resizingRowHeight: number = 0;
  resizingRow: HTMLDivElement | undefined;
  resizeYStart: number = 0;
  selectedComponent: any;

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

    this.uiManager = new EditorUIManager(
      this.editor,
      this.pageId,
      this.frameId,
      this.pageData,
      this.appVersionManager
    );

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
        (globalThis as any).wrapper = wrapper;
        (globalThis as any).activeEditor = this.editor;
        (globalThis as any).currentPageId = this.pageId;
        (globalThis as any).pageData = this.pageData;

        if (wrapper) {
          wrapper.view.el.addEventListener("mousedown", (e: MouseEvent) => {
            const targetElement = e.target as Element;
            if (targetElement.closest('.tile-resize-button')) {
              this.isResizing = true;
              this.resizingRow = targetElement.closest('.template-wrapper') as HTMLDivElement
              this.resizingRowHeight = this.resizingRow.offsetHeight
              this.resizeYStart = e.clientY
            }
          })

          document.addEventListener("mousemove", (e: MouseEvent) => {
            if (this.isResizing) {
              let newHeight = this.resizingRowHeight + (e.clientY - this.resizeYStart)
              if (newHeight < minTileHeight) newHeight = minTileHeight;
              const comps = wrapper.find(`#${this.resizingRow?.id}`)
              if (comps.length) {
                comps[0].addStyle({
                  height: `${newHeight}px`
                })
              }
              (globalThis as any).tileMapper.updateTile(
                this.resizingRow?.id,
                "Size",
                newHeight
              )

            }
          })

          document.addEventListener("mouseup", (e: MouseEvent) => {
            if (this.isResizing) {
              this.isResizing = false
            }
          })

          wrapper.view.el.addEventListener("dblclick", (e: MouseEvent) => {
            e.preventDefault();
            const selectedComponent = (globalThis as any).selectedComponent;
            if (!selectedComponent) return;

            const modal = document.createElement("div");
            modal.classList.add("tb-modal");
            modal.style.display = "flex";

            const tileComp = selectedComponent.closest('.template-wrapper')
            const modalContent = new ImageUpload("tile", tileComp.getId());
            modalContent.render(modal);

            const uploadInput = document.createElement("input");
            uploadInput.type = "file";
            uploadInput.multiple = true;
            uploadInput.accept = "image/jpeg, image/jpg, image/png";
            uploadInput.id = "fileInput";
            uploadInput.style.display = "none";

            document.body.appendChild(modal);
            document.body.appendChild(uploadInput);
          })

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

            this.uiManager.clearAllMenuContainers();

            (globalThis as any).activeEditor = this.editor;
            (globalThis as any).currentPageId = this.pageId;
            (globalThis as any).pageData = this.pageData;

            this.uiManager.handleTileManager(e);
            this.uiManager.openMenu(e);

            this.uiManager.initContentDataUi(e);
            this.uiManager.activateEditor(this.frameId);
            this.uiManager.handleInfoSectionHover(e);
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
        this.uiManager.frameEventListener();
        this.uiManager.activateNavigators();
      });
    }
  }

  onComponentUpdate() {
    this.editor.on("component:update", (model: any) => {
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

    this.editor.on("component:drag:start", (model: any) => {
      sourceComponent = model.parent;
    });

    this.editor.on("component:drag:end", (model: any) => {
      if (this.isResizing) return
      destinationComponent = model.parent;
      this.uiManager.handleDragEnd(model, sourceComponent, destinationComponent);
    });
  }

  onSelected() {
    this.editor.on("component:selected", (component: any) => {
      const pageMapper = new PageMapper(this.editor);
      (globalThis as any).selectedComponent = component;
      (globalThis as any).tileMapper = this.uiManager.createTileMapper();
      (globalThis as any).infoContentMapper = this.uiManager.createInfoContentMapper();
      (globalThis as any).frameId = this.frameId;
      const isTile = component.getClasses().includes('template-block')
      const isCta = ['img-button-container', 'plain-button-container', 'cta-container-child']
        .some(cls => component.getClasses().includes(cls))

      if (isCta) {
        this.uiManager.toggleSidebar(true)
        this.uiManager.setInfoCtaProperties();
        this.uiManager.showCtaTools()
      }
      else if (isTile) {
        this.uiManager.toggleSidebar(true)
        this.uiManager.setTileProperties();
        this.uiManager.setInfoTileProperties();
        this.uiManager.showTileTools()
        this.uiManager.createChildEditor();
      } else {
        this.uiManager.toggleSidebar(false);
      }
      // this.uiManager.toggleSidebar()
      // this.uiManager.setCtaProperties();
    });

    this.editor.on("component:deselected", () => {
      (globalThis as any).selectedComponent = null;
      this.uiManager.toggleSidebar(false)
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

  setPageFocus(editor: any, frameId: string, pageId: string, pageData: any) {
    if (!this.uiManager) {
      this.uiManager = new EditorUIManager(
        this.editor,
        this.pageId,
        this.frameId,
        this.pageData,
        this.appVersionManager
      );
    }
    this.uiManager.setPageFocus(editor, frameId, pageId, pageData);
  }

  activateNavigators() {
    if (!this.uiManager) {
      this.uiManager = new EditorUIManager(
        this.editor,
        this.pageId,
        this.frameId,
        this.pageData,
        this.appVersionManager
      );
    }
    this.uiManager.activateNavigators();
  }

  removeOtherEditors() {
    if (!this.uiManager) {
      this.uiManager = new EditorUIManager(
        this.editor,
        this.pageId,
        this.frameId,
        this.pageData,
        this.appVersionManager
      );
    }
    this.uiManager.removeOtherEditors();
  }

  reAlignEditor(editorDiv: HTMLDivElement) {
    // const childContainer = document.getElementById("child-container") as HTMLDivElement;

    //   if (childContainer && editorDiv) {
    //     const editorFrames = Array.from(childContainer.children);
    //     const isFirstItem = editorFrames[0] === editorDiv;
    //     const isLastItem = editorFrames[editorFrames.length - 1] === editorDiv;

    //     if (isFirstItem) {
    //       childContainer.scrollLeft = 0;
    //       if (childContainer.children.length > 2) {
    //         childContainer.style.justifyContent = "start"
    //       }
    //     } else if (isLastItem) {
    //       childContainer.scrollLeft = childContainer.scrollWidth - childContainer.clientWidth;
    //     } else {
    //       const editorDivLeft = editorDiv.offsetLeft;
    //       const editorDivWidth = editorDiv.offsetWidth;
    //       const targetScrollPosition = editorDivLeft - (childContainer.offsetWidth / 2) + (editorDivWidth / 2);
    //       childContainer.scrollLeft = targetScrollPosition;
    //     }
    //   }
  }

  activateEditor(frameId: any) {
    if (!this.uiManager) {
      this.uiManager = new EditorUIManager(
        this.editor,
        this.pageId,
        this.frameId,
        this.pageData,
        this.appVersionManager
      );
    }

    this.uiManager.activateEditor(frameId);
  }
}