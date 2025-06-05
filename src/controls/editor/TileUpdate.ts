import { InfoType } from "../../types";
import { minTileHeight } from "../../utils/default-attributes";
import { resizeButton } from "../../utils/gjs-components";
import { InfoSectionManager } from "../InfoSectionManager";
import { InfoContentMapper } from "./InfoContentMapper";
import { TileMapper } from "./TileMapper";

export class TileUpdate {
  rowComponent: any;
  pageId: any;

  constructor(pageId?: string) {
    this.pageId = pageId || null;
  }

  updateTile(rowComponent: any, isDragging: boolean = false) {
    this.rowComponent = rowComponent;
    const tiles = rowComponent.find(".template-wrapper");
    const length = tiles.length;
    tiles.forEach((tile: any) => {
      const tileAttributes = this.getTileAttributes(rowComponent, tile);
      const rightButton = tile.find(".add-button-right")[0];
      if (rightButton) {
        rightButton.addStyle({
          display: length >= 3 ? "none" : "flex",
        });
      }
      const alignValue = length === 3 ? "center" : tileAttributes?.Align;
      const cssAlignValue = alignValue === "left" ? "start" : alignValue;

      // if tiles are 2 or 3, remove resize button else add the resize button
      if (length > 1) {
        tile.addStyle({ height: `${minTileHeight}px` });
        (globalThis as any).tileMapper.updateTile(
          tile.getId(),
          "Size",
          minTileHeight
        );
        tile.find(".tile-resize-button").forEach((comp: any) => comp.remove());
      } else {
        tile.append(resizeButton("Resize"));
      }

      const tileAlignment = {
        "justify-content": cssAlignValue,
        "align-items": cssAlignValue,
      };

      const titleAlignment = {
        "text-align": alignValue,
      };

      this.updateTileHeight(tile, length);
      this.updateAlignment(tile, tileAlignment, titleAlignment);
      this.updateTileTitleLength(tile, length);
      if (!isDragging) {
        this.updateTileAttributes(tile.getId(), "Align", alignValue);
      }
    });
    this.removeEmptyRows();
  }

  getTileAttributes(rowComponent: any, tileWrapper: any) {
    const pageData = (globalThis as any).pageData;
    let tileAttributes;
    if (pageData.PageType === "Information") {
      const infoContentMapper = new InfoContentMapper(this.pageId);
      const tileInfoSectionAttributes: InfoType | null = infoContentMapper.getInfoContent(rowComponent.getId());

      if (!tileInfoSectionAttributes) return;

      tileAttributes = tileInfoSectionAttributes?.Tiles?.find(
        (tile: any) => tile.Id === tileWrapper.getId()
      );
    } else {
      tileAttributes = (globalThis as any).tileMapper.getTile(
        rowComponent.getId(),
        tileWrapper.getId()
      );
    }
    return tileAttributes;
  }

  private updateTileHeight(tile: any, length: number) {
    const templateBlock = tile.find(".template-block")[0];
    if (length === 1) {
      if (templateBlock.getClasses().includes("first-tile")) {
        templateBlock.addClass("high-priority-template");
      }
    } else {
      templateBlock.removeClass("high-priority-template");
    }
  }

  private updateAlignment(tile: any, tileAlignment: any, titleAlignment: any) {
    const templateBlock = tile.find(".template-block")[0];
    const tileTitle = tile.find(".tile-title-section")[0];
    templateBlock.addStyle(tileAlignment);
    tileTitle.addStyle(titleAlignment);
  }

  private updateTileTitleLength(tile: any, length: number) {
    const tileTitle = tile.find(".tile-title")[0];
    if (tileTitle) {
      const textLength = length === 3 ? 11 : length === 2 ? 15 : 20;
      const title = this.truncateText(
        textLength,
        tileTitle.getAttributes()?.["title"] || tileTitle.getEl().innerText
      );

      if (length === 3) {
        tileTitle.components(this.wrapTileTitle(title));
      } else {
        tileTitle.components(title);
      }
    }
  }

  private truncateText(titleLength: number, tileTitle: string) {
    const screenWidth: number = window.innerWidth;
    if (
      tileTitle.length > (screenWidth <= 280 ? titleLength : titleLength + 4)
    ) {
      return (
        tileTitle
          .substring(0, screenWidth <= 280 ? titleLength : titleLength + 4)
          .trim() + ".."
      );
    }
    return tileTitle;
  }

  private wrapTileTitle(title: any) {
    const words = title.split(" ");
    if (words.length > 1) {
      return words[0] + "<br>" + words[1];
    }
    return title.replace("<br>", "");
  }

  updateTileAttributes(tileId: string, attribute: string, value: string) {
    const tileAttributes = new TileMapper(this.pageId);
    let align = value;
    if (value === "start") {
      align = "left";
    }

    const pageData = (globalThis as any).pageData;

    if (pageData.PageType === "Information") {
      const infoSectionManager = new InfoSectionManager();
      infoSectionManager.updateInfoTileAttributes(
        this.rowComponent.getId(),
        tileId,
        "Align",
        align
      );
    } else {
      tileAttributes.updateTile(tileId, attribute, align);
    }
  }

  removeEmptyRows() {
    const container = this.rowComponent.parent();
    const rows = container.components();
    rows.forEach((row: any) => {
      if (row?.components()?.length === 0) {
        row?.remove();
      }
    });
  }
}
