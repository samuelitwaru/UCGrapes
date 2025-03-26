import {
  DefaultAttributes,
  rowDefaultAttributes,
  tileDefaultAttributes,
  tileWrapperDefaultAttributes,
} from "../../utils/default-attributes";
import { randomIdGenerator } from "../../utils/helpers";
import { CtaManager } from "../themes/CtaManager";
import { EditorEvents } from "./EditorEvents";
import { TileMapper } from "./TileMapper";
import { TileUpdate } from "./TileUpdate";

export class TileManager {
  private event: MouseEvent;
  editor: any;
  pageId: any;
  frameId: any;
  tileUpdate: TileUpdate;

  constructor(e: MouseEvent, editor: any, pageId: any, frameId: any) {
    this.event = e;
    this.editor = editor;
    this.pageId = pageId;
    this.frameId = frameId;
    this.tileUpdate = new TileUpdate(pageId);
    (globalThis as any).tileMapper = new TileMapper(this.pageId);
    this.init();
  }

  private init() {
    this.addTileBottom();
    this.addTileRight();
    this.deleteTile();
    this.removeTileIcon();
    this.removeTileTile();
    this.removeCTa();
  }

  addTileBottom() {
    const addBottomButton = (this.event.target as Element).closest(
      ".action-button.add-button-bottom"
    );
    if (addBottomButton) {
      const templateWrapper = addBottomButton.closest(".template-wrapper");
      if (!templateWrapper) return;

      let currentRow = templateWrapper.parentElement;
      let currentColumn = currentRow?.parentElement;

      if (!currentRow || !currentColumn) return;

      const index = Array.from(currentColumn.children).indexOf(currentRow);

      const columnComponent = this.editor.Components.getWrapper().find(
        "#" + currentColumn.id
      )[0];
      if (!columnComponent) return;

      const newRowComponent = this.editor.Components.addComponent(
        this.getTileRow()
      );
      columnComponent.append(newRowComponent, { at: index + 1 });
      const tileId = newRowComponent.find(".template-wrapper")[0]?.getId();

      (globalThis as any).tileMapper.addFreshRow(
        newRowComponent.getId() as string,
        tileId as string
      );
    }
  }

  addTileRight() {
    const addRightutton = (this.event.target as Element).closest(
      ".action-button.add-button-right"
    );
    if (addRightutton) {
      const currentTile = addRightutton.closest(".template-wrapper");
      const currentTileComponent = this.editor.Components.getWrapper().find(
        "#" + currentTile?.id
      )[0];
      if (!currentTileComponent) return;

      const containerRowComponent = currentTileComponent.parent();
      const tiles = containerRowComponent.components().filter((comp: any) => {
        const type = comp.get("type");
        return type === "tile-wrapper";
      });

      if (tiles.length >= 3) return;

      const newTileComponent = this.editor.Components.addComponent(
        this.getTile()
      );

      const index = currentTileComponent.index();
      containerRowComponent.append(newTileComponent, { at: index + 1 });

      (globalThis as any).tileMapper.addTile(
        currentTile?.parentElement?.id as string,
        newTileComponent.getId() as string
      );
      this.tileUpdate.updateTile(containerRowComponent);
    }
  }

  deleteTile() {
    const deleteButton = (this.event.target as Element).closest(
      ".action-button.delete-button"
    );
    if (deleteButton) {
      const templateWrapper = deleteButton.closest(".template-wrapper");
      if (templateWrapper) {
        const tileComponent = this.editor.Components.getWrapper().find(
          "#" + templateWrapper?.id
        )[0];
        const parentComponent = tileComponent.parent();
        tileComponent.remove();

        this.tileUpdate.updateTile(parentComponent);
        (globalThis as any).tileMapper.removeTile(
          tileComponent.getId() as string,
          parentComponent.getId() as string
        );

        this.removeEditor(tileComponent.getId() as string);
      }
    }
  }

  private removeTileIcon() {
    const tileIcon = (this.event.target as Element).closest(".tile-close-icon");
    if (tileIcon) {
      const templateWrapper = tileIcon.closest(".template-wrapper");
      if (templateWrapper) {
          const tileComponent = this.editor.Components.getWrapper().find(
            "#" + templateWrapper?.id
          )[0];

          if (this.checkTileHasIconOrTitle(tileComponent)) {
              (globalThis as any).tileMapper
                .updateTile(tileComponent.getId(), "Icon", "");
              const iconSection = tileComponent.find(".tile-icon-section")[0];
              if (iconSection) {
                iconSection.addStyle({ display: "none" });
              }
          } else {
          console.warn("Tile has no icon or title");
        }
      }
    }
  }

  private removeTileTile() {
    const tileTitle = (this.event.target as Element).closest(
      ".tile-close-title"
    );
    if (tileTitle) {
      const templateWrapper = tileTitle.closest(".template-wrapper");
      if (templateWrapper) {
          const tileComponent = this.editor.Components.getWrapper().find(
            "#" + templateWrapper?.id
          )[0];

        if (this.checkTileHasIconOrTitle(tileComponent)) {
            (globalThis as any).tileMapper
              .updateTile(tileComponent.getId(), "Text", "");
            const tileSection = tileComponent.find(".tile-title-section")[0];
            if (tileSection) {
              tileSection.addStyle({ display: "none" });
            }
        } else {
          console.warn("Tile has no icon or title");
        }
      }
    }
  }

  checkTileHasIconOrTitle(component: any): boolean {
    const parentComponent = component.parent();
    if (!parentComponent) return false;
    const tileAttributes = (globalThis as any).tileMapper.getTile(parentComponent.getId(), component.getId());
    if (tileAttributes) {
      if (tileAttributes.Icon && tileAttributes.Text) {
        return true;
      }
    }
    return false;
  }

  removeCTa() {
    const ctaBadgeBtn = (this.event.target as Element).closest(
      ".cta-badge"
    ) as HTMLElement;
    if (ctaBadgeBtn) {
      new CtaManager().removeCta(ctaBadgeBtn);
    }
  }

  removeEditor(tileId: string): void {
    const framelist = document.querySelectorAll('.mobile-frame');
    framelist.forEach((frame: any) => {
      const frameHasTile = frame.querySelector(`#${tileId}`)
      if (frameHasTile) {
        console.log(frameHasTile)
      }
      if (frame.id.includes(this.frameId)) {
        let nextElement = frame.nextElementSibling;
        while (nextElement) {
          const elementToRemove = nextElement;
          nextElement = nextElement.nextElementSibling;
          if (elementToRemove) {  // Add this check
            elementToRemove.remove();
            new EditorEvents().activateNavigators();
          }
        }
      }
    });
  }

  private getTileRow() {
    const tile = this.getTile();
    return `<div class="container-row" ${rowDefaultAttributes} id="${randomIdGenerator(
      8
    )}">${tile}</div>`;
  }

  private getTile() {
    return `
      <div ${tileWrapperDefaultAttributes} class="template-wrapper" id="${randomIdGenerator(
      8
    )}">
        <div ${tileDefaultAttributes} class="template-block" style="background-color: transparent; color: #333333; justify-content: left">
            <div ${DefaultAttributes} id="igtdq" data-gjs-type="default" class="tile-icon-section">
              <span ${DefaultAttributes} id="is1dw" data-gjs-type="text" class="tile-close-icon top-right selected-tile-title">×</span>
              <span ${DefaultAttributes} id="ic26t" data-gjs-type="text" class="tile-icon">Title</span>
            </div>
            <div ${DefaultAttributes} id="igtdq" data-gjs-type="default" class="tile-title-section">
              <span ${DefaultAttributes} id="is1dw" data-gjs-type="text" class="tile-close-icon top-right selected-tile-title">×</span>
              <span ${DefaultAttributes} style="display: block" id="ic26t" data-gjs-type="text" is-hidden="false" title="Title" class="tile-title">Title</span>
            </div>
        </div>
        <button ${DefaultAttributes} id="i9sxl" data-gjs-type="default" title="Delete template" class="action-button delete-button">&minus;</button>
        <button ${DefaultAttributes} id="ifvvi" data-gjs-type="default" title="Add template right" class="action-button add-button-right">+</button>
        <button ${DefaultAttributes} id="i4ubt" data-gjs-type="default" title="Delete template" class="action-button add-button-bottom">&plus;</button>
      </div>
    `;
  }
}
