import { ToolBoxService } from "../../services/ToolBoxService";
import { PageSelector } from "../../ui/components/page-selector/PageSelector";
import { ActionSelectContainer } from "../../ui/components/tools-section/action-list/ActionSelectContainer";
import { ContentSection } from "../../ui/components/tools-section/ContentSection";
import { ToolboxManager } from "../toolbox/ToolboxManager";
import { AppVersionManager } from "../versions/AppVersionManager";
import { ChildEditor } from "./ChildEditor";
import { ContentDataUi } from "./ContentDataUi";
import { ContentMapper } from "./ContentMapper";
import { CtaButtonProperties } from "./CtaButtonProperties";
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
  
  constructor() {
    this.appVersionManager = new AppVersionManager();
    this.toolboxService = new ToolBoxService();
  }

  init(editor: any, pageData: any, frameEditor: any) {
    this.editor = editor;
    this.pageData = pageData;
    this.pageId = pageData.PageId;
    this.frameId = frameEditor;
    new FrameEvent(this.frameId);
    this.onDragAndDrop();
    this.onSelected();
    this.onComponentUpdate();
    this.onLoad();
  }

  onLoad() {
    if (this.editor !== undefined) {

      this.editor.on('load', () => {
        const wrapper = this.editor.getWrapper();
        if (wrapper) {
          wrapper.view.el.addEventListener("click", (e: MouseEvent) => {
            this.tileManager = new TileManager(e, this.editor, this.pageId, this.frameId);
            (globalThis as any).activeEditor = this.editor;
            (globalThis as any).currentPageId = this.pageId;
            (globalThis as any).pageData = this.pageData;
            new ToolboxManager().unDoReDo();
            new ContentDataUi(e, this.editor, this.pageData);
            this.activateEditor();
          })
          
        } else {
          console.error("Wrapper not found!");
        }

        this.frameEventListener();
        this.activateNavigators();
      });
    }
  }

  onComponentUpdate() {
    this.editor.on("component:update", (model: any) => {
      // console.log("Component updated", model);
      window.dispatchEvent(new CustomEvent('pageChanged', { 
        detail: { pageId: this.pageId } 
      }));
    })
  }
  onDragAndDrop() {
    let sourceComponent: any;
    let destinationComponent: any;
    const tileMapper = new TileMapper(this.pageId)
    const contentMapper = new ContentMapper(this.pageId)

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
      } else if (parentEl && parentEl.classList.contains("content-page-wrapper")) {
          contentMapper.moveContentRow(model.target.getId(), model.index);
      } else if (parentEl && parentEl.classList.contains("cta-button-container")) {
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
    if (containerRow && containerRow.getEl()?.classList.contains("container-row")) {
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
  }

  frameEventListener() {
    const framelist = document.querySelectorAll('.mobile-frame');
    framelist.forEach((frame: any) => {
      if (frame.id.includes(this.frameId)) {
        frame.addEventListener('click', (event:MouseEvent) => {
          (globalThis as any).activeEditor = this.editor;
          (globalThis as any).currentPageId = this.pageId;
          (globalThis as any).pageData = this.pageData;
          this.activateEditor();
        });
      }
    })
  }

  activateEditor () {
    const framelist = document.querySelectorAll('.mobile-frame');
    framelist.forEach((frame: any) => {
      frame.classList.remove('active-editor');
      if (frame.id.includes(this.frameId)) {
        frame.classList.add('active-editor');
        this.toggleSidebar();
      }
    })
  }

  async toggleSidebar() {
    const toolSection = document.getElementById('tools-section') as HTMLDivElement
    const mappingSection = document.querySelector('#mapping-section') as HTMLDListElement
    toolSection.style.display = "block"
    mappingSection.style.display = "none"
    if (
      this.pageData?.PageType === "Content" ||
      this.pageData?.PageType === "Location" ||
      this.pageData?.PageType === "Reception"
    ) {
      new ContentSection(this.pageData)
    } else {
      const menuSection = document.getElementById('menu-page-section') as HTMLElement;
      const contentection = document.getElementById('content-page-section');
      if (menuSection) menuSection.style.display = 'block';
      if (contentection) contentection.remove();

      const actionListContainer = new ActionSelectContainer();
      actionListContainer.render(menuSection);
    }
  }

  setTileProperties() {
    const selectedComponent = (globalThis as any).selectedComponent;
    const tileWrapper = selectedComponent.parent();
    const rowComponent = tileWrapper.parent();
    const tileAttributes = (globalThis as any).tileMapper.getTile(rowComponent.getId(), tileWrapper.getId()); 

    if (selectedComponent && tileAttributes) {
      this.tileProperties = new TileProperties(selectedComponent, tileAttributes);
      this.tileProperties.setTileAttributes();
    }
  }

  setCtaProperties() {
    const selectedComponent = (globalThis as any).selectedComponent;
    const ctaAttributes = new ContentMapper(this.pageId).getContentCta(selectedComponent.getId()); 

    if (ctaAttributes) {
      const ctaProperties = new CtaButtonProperties(selectedComponent, ctaAttributes);
      ctaProperties.setctaAttributes();
    }
  }

  async createChildEditor () {
    const selectedComponent = (globalThis as any).selectedComponent;
    const tileWrapper = selectedComponent.parent();
    const rowComponent = tileWrapper.parent();
    const tileAttributes = (globalThis as any).tileMapper.getTile(rowComponent.getId(), tileWrapper.getId());
    if (tileAttributes?.Action?.ObjectId) {
      const objectId = tileAttributes.Action.ObjectId;
      const data: any = JSON.parse(localStorage.getItem(`data-${objectId}`) || "{}");
    
      let childPage;
      if (Object.keys(data).length > 0) {
        childPage = data
      } else {
        // const version = await this.appVersionManager.getActiveVersion();
        childPage = this.appVersionManager.getPages()?.find((page: any) => page.PageId === objectId);
      }

      this.removeOtherEditors();
      this.activateNavigators();
      if (childPage) {
        new ChildEditor(objectId, childPage).init(tileAttributes);
      }
    } else{
      this.removeOtherEditors();
      if (selectedComponent.getClasses().includes('template-block')) {
        const newPageButton = new NewPageButton(this.toolboxService, this.appVersionManager, this.pageData)
        newPageButton.render();
        const activateNav = this.activateNavigators();
        activateNav.scrollBy(200)
      }
    }
  }

  removeOtherEditors(): void {
    const framelist = document.querySelectorAll('.mobile-frame');
    framelist.forEach((frame: any) => {
      if (frame.id.includes(this.frameId)) {
        let nextElement = frame.nextElementSibling;
        while (nextElement) {
          const elementToRemove = nextElement;
          nextElement = nextElement.nextElementSibling;
          if (elementToRemove) {  // Add this check
            elementToRemove.remove();
          }
        }
      }
    });
  }

  activateNavigators(): any {
    const leftNavigator = document.querySelector(".page-navigator-left") as HTMLElement;
    const rightNavigator = document.querySelector(".page-navigator-right") as HTMLElement;
    const scrollContainer = document.getElementById("child-container") as HTMLElement;
    const prevButton = document.getElementById("scroll-left") as HTMLElement;
    const nextButton = document.getElementById("scroll-right") as HTMLElement;
    const frames = document.querySelectorAll(".mobile-frame");
    const menuContainer = document.querySelector(".menu-container") as HTMLElement;

    // Show navigation buttons only when content overflows
    const menuWidth = menuContainer ? menuContainer.clientWidth : 0;
    const totalFramesWidth = Array.from(frames).reduce((sum, frame) => sum + frame.clientWidth, 0) + menuWidth;
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
          ? "flex-start"
          : "center"
        : frames.length > 3
        ? "flex-start"
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
    nextButton.addEventListener("click", () => scrollBy(200));

    const updateButtonVisibility = () => {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
        prevButton.style.display = scrollLeft > 0 ? "flex" : "none";
        nextButton.style.display = scrollLeft + clientWidth < scrollWidth ? "flex" : "none";
    };

    updateButtonVisibility();
    scrollContainer.addEventListener("scroll", updateButtonVisibility);

    return { updateButtonVisibility, scrollBy };
  }
} 

