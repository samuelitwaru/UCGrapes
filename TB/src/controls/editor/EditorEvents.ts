import { ChildEditor } from "./ChildEditor";
import { TileManager } from "./TileManager";
import { TileMapper } from "./TileMapper";
import { TileProperties } from "./TileProperties";
import { TileUpdate } from "./TileUpdate";
export class EditorEvents {

  editor: any;
  pageId: any;
  editorManager: any;
  tileManager: any;

  constructor(editorManager: any) {
    this.editorManager = editorManager;
  }

  init(editor: any, pageId: any) {
    this.editor = editor;
    this.pageId = pageId;
    this.onLoad();
    this.onDragAndDrop();
    this.onSelected();
    (globalThis as any).tileManager = new TileMapper(this.pageId) 
  }

  onLoad() {
    if (this.editor !== undefined) {
        const wrapper = this.editor.getWrapper();
        wrapper.view.el.addEventListener("click", (e: MouseEvent) => {
            this.tileManager = new TileManager(e, this.editor, this.pageId);
        })
    }
  }

  onDragAndDrop() {
    let sourceComponent: any;
    let destinationComponent: any;

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
        const tileUpdate = new TileUpdate();
        tileUpdate.updateTile(destinationComponent);
        tileUpdate.updateTile(sourceComponent);
        this.onTileUpdate(destinationComponent);
      }
    });
  }

  onSelected() {
    this.editor.on("component:selected", (component: any) => {
      (globalThis as any).selectedComponent = component;
      this.setTileProperties();
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

  createNewEditor() {}

  setTileProperties() {
    const selectedComponent = (globalThis as any).selectedComponent;
    const tileWrapper = selectedComponent.parent();
    const rowComponent = tileWrapper.parent();
    const tileAttributes = (globalThis as any).tileManager.getTile(rowComponent.getId(), tileWrapper.getId()); 

    if (selectedComponent && tileAttributes) {
      const tileProperties = new TileProperties(selectedComponent, tileAttributes);
      tileProperties.setTileAttributes();
    }
  }

}
