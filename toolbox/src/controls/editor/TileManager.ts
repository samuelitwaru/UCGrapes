import { InfoType } from "../../interfaces/InfoType";
import { ActionListPopUp } from "../../ui/views/ActionListPopUp";
import {
  DefaultAttributes,
  minTileHeight,
  rowDefaultAttributes,
  tileDefaultAttributes,
  tileWrapperDefaultAttributes,
} from "../../utils/default-attributes";
import { randomIdGenerator } from "../../utils/helpers";
import { InfoSectionController } from "../InfoSectionController";
import { CtaManager } from "../themes/CtaManager";
import { EditorEvents } from "./EditorEvents";
import { InfoContentMapper } from "./InfoContentMapper";
import { NewPageButton } from "./NewPageButton";
import { TileMapper } from "./TileMapper";
import { TileUpdate } from "./TileUpdate";

export class TileManager {
  private event: MouseEvent;
  editor: any;
  pageId: any;
  frameId: any;
  pageData: any;
  page: any;
  tileUpdate: TileUpdate;

  constructor(
    e: MouseEvent,
    editor: any,
    pageId: any,
    frameId: any,
    pageData: any
  ) {
    this.event = e;
    this.editor = editor;
    this.pageId = pageId;
    this.frameId = frameId;
    this.pageData = pageData;
    this.tileUpdate = new TileUpdate(pageId);
    (globalThis as any).tileMapper = new TileMapper(this.pageId);
    this.page = (globalThis as any).pageData;
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

      if (this.page?.PageType === "Information") {
      } else {
        (globalThis as any).tileMapper.addFreshRow(
          newRowComponent.getId() as string,
          tileId as string
        );
      }
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

      if (this.page?.PageType === "Information") {
        this.updateInfoTileRow(
          containerRowComponent.getId(),
          "add",
          newTileComponent.getId()
        );
      } else {
        (globalThis as any).tileMapper.addTile(
          currentTile?.parentElement?.id as string,
          newTileComponent.getId() as string
        );
      }

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

        if (this.page?.PageType === "Information") {
          this.updateInfoTileRow(
            parentComponent.getId(),
            "delete",
            tileComponent.getId()
          );
        } else {
          (globalThis as any).tileMapper.removeTile(
            tileComponent.getId() as string,
            parentComponent.getId() as string
          );
        }

        this.removeEditor(tileComponent.getId() as string);
      }
    }
  }

  private updateInfoTileRow(
    tileRowId: any,
    method: "add" | "delete" = "add",
    tileId: string
  ) {
    const infoContentMapper = new InfoContentMapper(this.pageId);
    const tileSection: InfoType | null =
      infoContentMapper.getInfoContent(tileRowId);
    if (tileSection) {
      if (method === "add") {
        tileSection.Tiles?.push({
          Id: tileId,
          Name: "Title",
          Text: "Title",
          Color: "#333333",
          Align: "left",
          Action: {
            ObjectType: "",
            ObjectId: "",
            ObjectUrl: "",
          }
        });
      } else if (method === "delete") {
        const tile = tileSection.Tiles?.find((tile: any) => tile.Id === tileId);
        if (tile) {
          const index = tileSection.Tiles?.indexOf(tile);
          if (index !== undefined && index >= 0) {
            tileSection.Tiles?.splice(index, 1);
          }
        }
      }

      const infoSectionController = new InfoSectionController();
      infoSectionController.updateInfoMapper(tileRowId, tileSection);
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
          if (this.page?.PageType === "Information") {
            const infoSectionController = new InfoSectionController();
            infoSectionController.updateInfoTileAttributes(
              tileComponent.parent().getId(),
              tileComponent.getId(),
              "Icon",
              ""
            );
          } else {
            (globalThis as any).tileMapper.updateTile(
              tileComponent.getId(),
              "Icon",
              ""
            );
          }
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
          if (this.page?.PageType === "Information") {
            const infoSectionController = new InfoSectionController();
            infoSectionController.updateInfoTileAttributes(
              tileComponent.parent().getId(),
              tileComponent.getId(),
              "Text",
              ""
            );
          } else {
            (globalThis as any).tileMapper.updateTile(
              tileComponent.getId(),
              "Text",
              ""
            );
          }
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
    let tileAttributes;
    if (this.pageData.PageType === "Information") {
      const tileInfoSectionAttributes: InfoType = (
        globalThis as any
      ).infoContentMapper.getInfoContent(parentComponent.getId());
      tileAttributes = tileInfoSectionAttributes?.Tiles?.find(
        (tile: any) => tile.Id === component.getId()
      );
    } else {
      tileAttributes = (globalThis as any).tileMapper.getTile(
        parentComponent.getId(),
        component.getId()
      );
    }
    console.log("tileAttributes", tileAttributes);
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
    const framelist = document.querySelectorAll(".mobile-frame");
    framelist.forEach((frame: any) => {
      const frameHasTile = frame.querySelector(`#${tileId}`);
      if (frameHasTile) {
        console.log(frameHasTile);
      }
      if (frame.id.includes(this.frameId)) {
        let nextElement = frame.nextElementSibling;
        while (nextElement) {
          const elementToRemove = nextElement;
          nextElement = nextElement.nextElementSibling;
          if (elementToRemove) {
            const thumbsList = document.querySelector(
              ".editor-thumbs-list"
            ) as HTMLElement;
            const thumbToRemove = thumbsList.querySelector(
              `div[id="${elementToRemove.id}"]`
            );
            if (thumbToRemove) {
              thumbToRemove.parentElement?.parentElement?.parentElement?.remove();
            }

            elementToRemove.remove();
            new EditorEvents().activateNavigators();
          }
        }
      }
    });
  }

  private getTileRow() {
    const isSingleTile = true
    const tile = this.getTile(isSingleTile);
    return `<div class="container-row" ${rowDefaultAttributes} id="${randomIdGenerator(
      8
    )}">${tile}</div>`;
  }

  private getTile(isSingleTile:boolean=false) {
    return `
      <div ${tileWrapperDefaultAttributes} ${isSingleTile ? `style="height:${minTileHeight}px"`:``} class="template-wrapper" id="${randomIdGenerator(
      8
    )}">
        <div ${tileDefaultAttributes} class="template-block" style="background-color: transparent; color: #333333; justify-content: left">
            <div ${DefaultAttributes} id="igtdq" data-gjs-type="default" class="tile-icon-section">
              <span ${DefaultAttributes} id="is1dw" data-gjs-type="text" class="tile-close-icon top-right selected-tile-title">×</span>
              <span ${DefaultAttributes} id="ic26t" data-gjs-type="text" class="tile-icon">Title</span>
            </div>
            <div ${DefaultAttributes} id="igtdq" data-gjs-type="default" class="tile-title-section">
              <span ${DefaultAttributes} id="is1dw" data-gjs-type="text" class="tile-close-title top-right selected-tile-title">×</span>
              <span ${DefaultAttributes} style="display: block" id="ic26t" data-gjs-type="text" is-hidden="false" title="Title" class="tile-title">Title</span>
            </div>
        </div>
        <button ${DefaultAttributes} id="i9sxl" data-gjs-type="default" title="Delete template" class="action-button delete-button">&minus;</button>
        <button ${DefaultAttributes} id="ifvvi" data-gjs-type="default" title="Add template right" class="action-button add-button-right">
          <svg ${DefaultAttributes} fill="#fff" width="15" height="15" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path ${DefaultAttributes} d="M19,11H13V5a1,1,0,0,0-2,0v6H5a1,1,0,0,0,0,2h6v6a1,1,0,0,0,2,0V13h6a1,1,0,0,0,0-2Z"/>
          </svg>
        </button>
        ${isSingleTile ? `
            <button ${DefaultAttributes} title="Resize" class="tile-resize-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="18.6" height="18.6" viewBox="0 0 18.6 18.6">
              <g id="Icon_for_size" data-name="Icon for size" transform="translate(-253.747 -1134.203) rotate(45)">
                <path id="Path_1035" data-name="Path 1035" d="M4.588,3.99A.6.6,0,0,0,4,4.67V7.579a.6.6,0,1,0,1.194,0V6.035l7.341,7.341c.15.157.213.054.422,0S15.886,15.3,15.94,15.1h0l-9.9-9.9H7.58A.6.6,0,1,0,7.58,4H4.664A.6.6,0,0,0,4.588,3.99Zm8.36,8.36a.6.6,0,0,0-.416,1.025L15.1,15.94H13.552a.6.6,0,1,0,0,1.194h2.895a.6.6,0,0,0,.688-.688V13.551a.6.6,0,1,0-1.194,0V15.1C13.439,12.608,13.11,12.351,12.948,12.351Z" transform="translate(984.014 612.01)" fill="#5068a8"/>
              </g>
            </svg>
          </button>
          `:``}
        ${
          this.page?.PageType === "Information"
            ? ``
            : `
          <button ${DefaultAttributes} id="i4ubt" data-gjs-type="default" title="Add template bottom" class="action-button add-button-bottom">
          <svg ${DefaultAttributes} fill="#fff" width="15" height="15" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path ${DefaultAttributes} d="M19,11H13V5a1,1,0,0,0-2,0v6H5a1,1,0,0,0,0,2h6v6a1,1,0,0,0,2,0V13h6a1,1,0,0,0,0-2Z"/>
          </svg>
          </button>
        `
        }
        <svg ${DefaultAttributes} class="tile-open-menu" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 27 27">
          <g ${DefaultAttributes} id="Group_2383" data-name="Group 2383" transform="translate(-921 -417.999)">
            <g ${DefaultAttributes} id="Group_2382" data-name="Group 2382" transform="translate(921 418)">
              <circle ${DefaultAttributes} id="Ellipse_534" data-name="Ellipse 534" cx="13.5" cy="13.5" r="13.5" transform="translate(0 -0.001)" fill="#6a747f"/>
            </g>
            <path ${DefaultAttributes} id="Path_2320" data-name="Path 2320" d="M1.7,0a1.7,1.7,0,1,0,1.7,1.7A1.7,1.7,0,0,0,1.7,0ZM7.346,0a1.7,1.7,0,1,0,1.7,1.7A1.7,1.7,0,0,0,7.346,0ZM13,0a1.7,1.7,0,1,0,1.7,1.7A1.7,1.7,0,0,0,13,0Z" transform="translate(927 430)" fill="#fff"/>
          </g>
        </svg>
      </div>
    `;
  }
}
