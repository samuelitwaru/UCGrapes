import { ChildEditor } from "./ChildEditor";
import { TileManager } from "./TileManager";
export class EditorEvents {

  editor: any;
  editorManager: any;
  tileManager: any;

  constructor(editorManager: any) {
    this.editorManager = editorManager;
  }

  init(editor: any) {
    this.editor = editor;
    this.onLoad();
    this.onDragAndDrop();
    this.onSelected();
  }

  onLoad() {
    if (this.editor !== undefined) {
        const wrapper = this.editor.getWrapper();
        wrapper.view.el.addEventListener("click", (e: MouseEvent) => {
            this.tileManager = new TileManager(e, this.editor);
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

        this.onTileUpdate(destinationComponent);
      }
    });
  }

  onSelected() {
    this.editor.on("component:selected", (component: any) => {
      (globalThis as any).selectedComponent = component;
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
}
