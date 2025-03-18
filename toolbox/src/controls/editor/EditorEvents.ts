import { demoPages } from "../../utils/test-data/pages";
import { AppVersionManager } from "../versions/AppVersionManager";
import { ChildEditor } from "./ChildEditor";
import { TileManager } from "./TileManager";
import { TileMapper } from "./TileMapper";
import { TileProperties } from "./TileProperties";
import { TileUpdate } from "./TileUpdate";
export class EditorEvents {

  editor: any;
  pageId: any;
  frameId: any;
  editorManager: any;
  tileManager: any;
  tileProperties: any;
    appVersionManager: any;
  
  constructor() {
    this.appVersionManager = new AppVersionManager();
  }

  init(editor: any, pageId: any, frameEditor: any) {
    this.editor = editor;
    this.pageId = pageId;
    this.frameId = frameEditor;
    this.onLoad();
    this.onDragAndDrop();
    this.onSelected();
  }

  onLoad() {
    if (this.editor !== undefined) {
        const wrapper = this.editor.getWrapper();
        wrapper.view.el.addEventListener("click", (e: MouseEvent) => {
            this.tileManager = new TileManager(e, this.editor, this.pageId, this.frameId);
            this.activateEditor();
        })
        this.activateNavigators();
    }
  }

  onDragAndDrop() {
    let sourceComponent: any;
    let destinationComponent: any;
    const tileMapper = new TileMapper(this.pageId)

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
        )
        this.onTileUpdate(destinationComponent);
      }
    });
  }

  onSelected() {
    this.editor.on("component:selected", (component: any) => {
      (globalThis as any).selectedComponent = component;
      (globalThis as any).tileMapper = new TileMapper(this.pageId);
      (globalThis as any).currentPageId = this.pageId;
      (globalThis as any).frameId = this.frameId;
      this.setTileProperties();
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

  activateEditor () {
    const framelist = document.querySelectorAll('.mobile-frame');
    framelist.forEach((frame: any) => {
      frame.classList.remove('active-editor');
      if (frame.id.includes(this.frameId)) {
        frame.classList.add('active-editor');
      }
    })
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
        const version = await this.appVersionManager.getActiveVersion();
        childPage = version?.Pages.find((page: any) => page.PageId === objectId);
      }

      this.removeOtherEditors();
      if (childPage) {
        new ChildEditor(objectId, childPage).init(tileAttributes);
      }
    } else{
      this.removeOtherEditors();
      this.activateNavigators();
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

    // Show navigation buttons only when content overflows
    const totalFramesWidth = Array.from(frames).reduce((sum, frame) => sum + frame.clientWidth, 0);
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
        scrollContainer.scrollTo({
            left: scrollContainer.scrollLeft + offset,
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

