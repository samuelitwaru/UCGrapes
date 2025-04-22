import { ToolBoxService } from "../../services/ToolBoxService";
import { EditorThumbs } from "../../ui/components/editor-content/EditorThumbs";
import { PageSelector } from "../../ui/components/page-selector/PageSelector";
import { ActionSelectContainer } from "../../ui/components/tools-section/action-list/ActionSelectContainer";
import { ContentSection } from "../../ui/components/tools-section/ContentSection";
import { ThemeManager } from "../themes/ThemeManager";
import { ToolboxManager } from "../toolbox/ToolboxManager";
import { AppVersionManager } from "../versions/AppVersionManager";
import { EditorUIManager } from "./EditorUiManager";
import { FrameEvent } from "./FrameEvent";

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

            // if (targetElement.closest("[data-gjs-type='tile-wrapper']")) {
            //   const tileWrapper = targetElement.closest(
            //     "[data-gjs-type='tile-wrapper']"
            //   ) as HTMLElement;
              
            //   const tileWrapperComponent = wrapper.find("#" + tileWrapper?.id)[0];
            //   if (tileWrapperComponent) {
            //     (globalThis as any).selectedComponent = null;
            //     this.editor.select(tileWrapperComponent);
            //     console.log("Tile wrapper selected:", this.editor.getSelected().getHTML());
            //     this.onSelected();              
            //   }

            // }

            this.uiManager.clearAllMenuContainers();
            
            (globalThis as any).activeEditor = this.editor;
            (globalThis as any).currentPageId = this.pageId;
            (globalThis as any).pageData = this.pageData;

            this.uiManager.handleTileManager(e);
            this.uiManager.openMenu(e);

            new ToolboxManager().unDoReDo();
            this.uiManager.initContentDataUi(e);
            this.uiManager.activateEditor(this.frameId);
          });

          wrapper.view.el.addEventListener("mouseover", (e: MouseEvent) => {
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
      destinationComponent = model.parent;
      this.uiManager.handleDragEnd(model, sourceComponent, destinationComponent);
    });
  }

  onSelected() {
    this.editor.on("component:selected", (component: any) => {
      (globalThis as any).selectedComponent = component;
      (globalThis as any).tileMapper = this.uiManager.createTileMapper();
      (globalThis as any).infoContentMapper = this.uiManager.createInfoContentMapper();
      (globalThis as any).frameId = this.frameId;
      
      this.uiManager.setTileProperties();
      this.uiManager.setInfoTileProperties();
      this.uiManager.setCtaProperties();
      this.uiManager.setInfoCtaProperties();
      this.uiManager.createChildEditor();
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
}