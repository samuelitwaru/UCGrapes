import { ToolBoxService } from "../../services/ToolBoxService";
import { EditorThumbs } from "../../ui/components/editor-content/EditorThumbs";
import { ThemeManager } from "../themes/ThemeManager";
import { ToolboxManager } from "../toolbox/ToolboxManager";
import { AppVersionManager } from "../versions/AppVersionManager";
import { EditorUIManager } from "./EditorUiManager";
import { FrameEvent } from "./FrameEvent";
export class EditorEvents {
    constructor() {
        this.handleComponentAdd = (model) => {
            var _a;
            const parent = model.parent();
            if (parent && ((_a = parent.getEl()) === null || _a === void 0 ? void 0 : _a.classList.contains("container-row"))) {
                const tileWrappers = parent.components().filter((comp) => {
                    const type = comp.get("type");
                    return type === "tile-wrapper";
                });
                if (tileWrappers.length === 3) {
                    console.log("more than 3");
                }
            }
        };
        this.appVersionManager = new AppVersionManager();
        this.toolboxService = new ToolBoxService();
        this.themeManager = new ThemeManager();
    }
    init(editor, pageData, frameEditor, isHome) {
        this.editor = editor;
        this.pageData = pageData;
        this.pageId = pageData.PageId;
        this.frameId = frameEditor;
        this.isHome = isHome;
        this.uiManager = new EditorUIManager(this.editor, this.pageId, this.frameId, this.pageData, this.appVersionManager);
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
                    wrapper.view.el.addEventListener("click", (e) => {
                        const targetElement = e.target;
                        if (targetElement.closest(".menu-container") ||
                            targetElement.closest(".menu-category") ||
                            targetElement.closest(".sub-menu-header")) {
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
                        globalThis.activeEditor = this.editor;
                        globalThis.currentPageId = this.pageId;
                        globalThis.pageData = this.pageData;
                        this.uiManager.handleTileManager(e);
                        this.uiManager.openMenu(e);
                        new ToolboxManager().unDoReDo();
                        this.uiManager.initContentDataUi(e);
                        this.uiManager.activateEditor(this.frameId);
                    });
                    wrapper.view.el.addEventListener("mouseover", (e) => {
                        this.uiManager.handleInfoSectionHover(e);
                    });
                }
                else {
                    console.error("Wrapper not found!");
                }
                new EditorThumbs(this.frameId, this.pageId, this.editor, this.pageData, this.isHome);
                this.uiManager.frameEventListener();
                this.uiManager.activateNavigators();
            });
        }
    }
    onComponentUpdate() {
        this.editor.on("component:update", (model) => {
            window.dispatchEvent(new CustomEvent("pageChanged", {
                detail: { pageId: this.pageId },
            }));
        });
    }
    onDragAndDrop() {
        let sourceComponent;
        let destinationComponent;
        this.editor.on("component:drag:start", (model) => {
            sourceComponent = model.parent;
        });
        this.editor.on("component:drag:end", (model) => {
            destinationComponent = model.parent;
            this.uiManager.handleDragEnd(model, sourceComponent, destinationComponent);
        });
    }
    onSelected() {
        this.editor.on("component:selected", (component) => {
            globalThis.selectedComponent = component;
            globalThis.tileMapper = this.uiManager.createTileMapper();
            globalThis.infoContentMapper = this.uiManager.createInfoContentMapper();
            globalThis.frameId = this.frameId;
            this.uiManager.setTileProperties();
            this.uiManager.setInfoTileProperties();
            this.uiManager.setCtaProperties();
            this.uiManager.setInfoCtaProperties();
            this.uiManager.createChildEditor();
        });
        this.editor.on("component:deselected", () => {
            globalThis.selectedComponent = null;
        });
    }
    onTileUpdate(containerRow) {
        var _a;
        if (containerRow &&
            ((_a = containerRow.getEl()) === null || _a === void 0 ? void 0 : _a.classList.contains("container-row"))) {
            this.editor.off("component:add", this.handleComponentAdd);
            this.editor.on("component:add", this.handleComponentAdd);
        }
    }
    setPageFocus(editor, frameId, pageId, pageData) {
        if (!this.uiManager) {
            this.uiManager = new EditorUIManager(this.editor, this.pageId, this.frameId, this.pageData, this.appVersionManager);
        }
        this.uiManager.setPageFocus(editor, frameId, pageId, pageData);
    }
    activateNavigators() {
        if (!this.uiManager) {
            this.uiManager = new EditorUIManager(this.editor, this.pageId, this.frameId, this.pageData, this.appVersionManager);
        }
        this.uiManager.activateNavigators();
    }
    removeOtherEditors() {
        if (!this.uiManager) {
            this.uiManager = new EditorUIManager(this.editor, this.pageId, this.frameId, this.pageData, this.appVersionManager);
        }
        this.uiManager.removeOtherEditors();
    }
    reAlignEditor(editorDiv) {
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
}
//# sourceMappingURL=EditorEvents.js.map