import { demoPages } from "../../utils/test-data/pages";
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

  constructor(editorManager: any) {
    this.editorManager = editorManager;
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
            this.tileManager = new TileManager(e, this.editor, this.pageId);
            this.activateEditor();
        })
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

  createChildEditor () {
    const selectedComponent = (globalThis as any).selectedComponent;
    const tileWrapper = selectedComponent.parent();
    const rowComponent = tileWrapper.parent();
    const tileAttributes = (globalThis as any).tileMapper.getTile(rowComponent.getId(), tileWrapper.getId());
    if (tileAttributes?.Action.ObjectId) {
      const objectId = tileAttributes.Action.ObjectId;
      const data: any = JSON.parse(localStorage.getItem(`data-${objectId}`) || "{}");
      console.log(data);
      let childPage;
      if (Object.keys(data).length > 0) {
        childPage = data
      } else {
        childPage = demoPages.AppVersions.find((version: any) => version.IsActive == true)?.Pages.find((page: any) => page.PageId === objectId);
      }

      this.removeOtherEditors();
      if (childPage) {
        new ChildEditor(objectId, childPage).init();
      }
    } else{
      this.removeOtherEditors();
    }
  }

  removeOtherEditors(): void {
    // const currentFrame = document.querySelector(`#gjs-${this.pageId}-frame`)

    // if (currentFrame) {
    //   let nextElement = currentFrame.nextElementSibling;
      // while (nextElement) {
      //   const elementToRemove = nextElement;
      //   nextElement = nextElement.nextElementSibling;
      //   elementToRemove.remove();
      // }
    // }
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
}

