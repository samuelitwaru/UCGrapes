import { ToolBoxService } from "../../services/ToolBoxService";
import { EditorThumbs } from "../../ui/components/editor-content/EditorThumbs";
import { PageSelector } from "../../ui/components/page-selector/PageSelector";
import { ActionSelectContainer } from "../../ui/components/tools-section/action-list/ActionSelectContainer";
import { ContentSection } from "../../ui/components/tools-section/ContentSection";
import { ImageUpload } from "../../ui/components/tools-section/tile-image/ImageUpload";
import { minTileHeight } from "../../utils/default-attributes";
import { InfoSectionController } from "../InfoSectionController";
import { ThemeManager } from "../themes/ThemeManager";
import { ToolboxManager } from "../toolbox/ToolboxManager";
import { AppVersionManager } from "../versions/AppVersionManager";
import { ChildEditor } from "./ChildEditor";
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
  initialHeight!: number;

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
    this.initialHeight = 80;

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
            if (targetElement.closest(".tile-resize-button")) {
              this.isResizing = true;
              this.resizingRow = targetElement.closest(
                ".template-wrapper"
              ) as HTMLDivElement;
              this.resizingRowHeight = this.resizingRow.offsetHeight;
              this.resizeYStart = e.clientY;
              this.initialHeight = this.resizingRow.offsetHeight;

              this.resizingRow.style.setProperty(
                "cursor",
                "ns-resize",
                "important"
              );

              // this.templateBlock = targetElement.closest(
              //   ".template-block"
              // ) as HTMLDivElement;
              // if (this.templateBlock) {
              //   this.templateBlock.style.setProperty(
              //     "cursor",
              //     "",
              //     ""
              //   );                
              // }
            }
          });

          document.addEventListener("mousemove", (e: MouseEvent) => {
            if (this.isResizing) {
              this.resizingRow?.style.setProperty(
                "cursor",
                "ns-resize",
                "important"
              );

              const deltaY = e.clientY - this.resizeYStart;

              const minHeight = 80;
              const mediumHeight = 120;
              const maxHeight = 160;

              // Determine which snap point to use based on drag distance
              let newHeight;

              if (this.initialHeight === minHeight) {
                if (deltaY > 20) {
                  newHeight = mediumHeight;
                } else {
                  newHeight = minHeight;
                }
              } else if (this.initialHeight === mediumHeight) {
                if (deltaY > 20) {
                  newHeight = maxHeight;
                } else if (deltaY < -20) {
                  newHeight = minHeight;
                } else {
                  newHeight = mediumHeight;
                }
              } else if (this.initialHeight === maxHeight) {
                if (deltaY < -20) {
                  newHeight = mediumHeight;
                } else {
                  newHeight = maxHeight;
                }
              } else {
                const draggedHeight = this.initialHeight + deltaY;

                if (draggedHeight < (minHeight + mediumHeight) / 2) {
                  newHeight = minHeight;
                } else if (draggedHeight < (mediumHeight + maxHeight) / 2) {
                  newHeight = mediumHeight;
                } else {
                  newHeight = maxHeight;
                }
              }

              const comps = wrapper.find(`#${this.resizingRow?.id}`);
              if (comps.length) {
                comps[0].addStyle({
                  height: `${newHeight}px`,
                });
              }

              (globalThis as any).tileMapper?.updateTile(
                this.resizingRow?.id,
                "Size",
                newHeight
              );
            }
          });

          document.addEventListener("mouseup", (e: MouseEvent) => {
            if (this.isResizing) {
              this.isResizing = false;

              this.resizingRow?.style.setProperty(
                "cursor",
                "",
              );
            }
          });

          wrapper.view.el.addEventListener("dblclick", (e: MouseEvent) => {
            e.preventDefault();
            const selectedComponent = (globalThis as any).selectedComponent;
            if (!selectedComponent) return;

            const modal = document.createElement("div");
            modal.classList.add("tb-modal");
            modal.style.display = "flex";

            const tileComp = selectedComponent.closest(".template-wrapper");
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
          });

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
            this.uiManager.resetTitleFromDOM();

            (globalThis as any).activeEditor = this.editor;
            (globalThis as any).currentPageId = this.pageId;
            (globalThis as any).pageData = this.pageData;
            (globalThis as any).eventTarget = targetElement;

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
        const infoSectionController = new InfoSectionController();
        infoSectionController.removeConsecutivePlusButtons();
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
      if (this.isResizing) return;
      destinationComponent = model.parent;
      this.uiManager.handleDragEnd(
        model,
        sourceComponent,
        destinationComponent
      );
    });
  }

  onSelected() {
    this.editor.on("component:selected", async (component: any) => {
      const pageMapper = new PageMapper(this.editor);
      (globalThis as any).selectedComponent = component;
      (globalThis as any).tileMapper = this.uiManager.createTileMapper();
      (globalThis as any).infoContentMapper =
        this.uiManager.createInfoContentMapper();
      (globalThis as any).frameId = this.frameId;
      const isTile = component.getClasses().includes("template-block");
      const isCta = [
        "img-button-container",
        "plain-button-container",
        "cta-container-child",
      ].some((cls) => component.getClasses().includes(cls));

      if (isCta) {
        this.uiManager.toggleSidebar(true);
        this.uiManager.setInfoCtaProperties();
        this.uiManager.showCtaTools();
        this.uiManager.hidePageInfo()

        const ctaAttrs = (globalThis as any).tileMapper.getCta(component.getId())
        const version = (globalThis as any).activeVersion;
        this.uiManager.removeOtherEditors();

        if (ctaAttrs.CtaAction) {
          const pageType = ctaAttrs.CtaType == "Form" ? "DynamicForm" : ctaAttrs.CtaType
          if (pageType === 'DynamicForm' || pageType === 'WebLink') {
            let childPage = version?.Pages.find((page: any) => {
              if (page.PageType == pageType) {
                return page.PageType == pageType && page.PageLinkStructure?.WWPFormId == Number(ctaAttrs.Action?.ObjectId)
              }
            })
            // console.log(pageType, childPage);
            if (childPage) {
              this.uiManager.removeOtherEditors();
              new ChildEditor(childPage?.PageId, childPage).init({});
            }
          }
        }


      
      }

      else if (isTile) {
        this.uiManager.toggleSidebar(true);
        this.uiManager.setTileProperties();
        this.uiManager.setInfoTileProperties();
        this.uiManager.showTileTools();
        this.uiManager.createChildEditor();
        this.uiManager.hidePageInfo()
      } else {
        this.uiManager.toggleSidebar(false);
        this.uiManager.showPageInfo()
      }
      // this.uiManager.toggleSidebar()
      // this.uiManager.setCtaProperties();
    });

    this.editor.on("component:deselected", () => {
      (globalThis as any).selectedComponent = null;
      this.uiManager.toggleSidebar(false);
      this.uiManager.showPageInfo()
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
