import { ChildEditor } from "../../../../controls/editor/ChildEditor";
import { ToolBoxService } from "../../../../services/ToolBoxService";
import { Alert } from "../../Alert";
import { AppVersionManager } from "../../../../controls/versions/AppVersionManager";
import { EditorEvents } from "../../../../controls/editor/EditorEvents";
import { PageCreationService } from "./PageCreationService";
import { TileProperties } from "../../../../controls/editor/TileProperties";
import { i18n } from "../../../../i18n/i18n";
import { ActionSelectContainer } from "./ActionSelectContainer";
import { InfoSectionManager } from "../../../../controls/InfoSectionManager";
import { ActionPage, InfoType } from "../../../../types";

export class PageAttacher {
  toolboxService: ToolBoxService;
  appVersionManager: any;

  constructor() {
    this.appVersionManager = new AppVersionManager();
    this.toolboxService = new ToolBoxService();
  }

  async attachNewServiceToTile(serviceId: string) {
    const services = await this.toolboxService.getServices();
    const newService = services.find(
      (service) => service.ProductServiceId == serviceId
    );
    if (newService) {
      const page = {
        PageId: serviceId,
        PageName: newService.ProductServiceName,
        TileName: newService.ProductServiceTileName,
        PageType: "Content",
      };
      this.attachToTile(
        page,
        "Content",
        i18n.t("sidebar.action_list.services")
      );

      // reload the action list container
      const menuSection = document.getElementById(
        "menu-page-section"
      ) as HTMLElement;
      const contentection = document.getElementById("content-page-section");
      if (menuSection) menuSection.style.display = "block";
      if (contentection) contentection.remove();
      // const actionListContainer = new ActionSelectContainer();
      // actionListContainer.render(menuSection);
    }
  }

  async attachToTile(
    page: ActionPage,
    categoryName: string,
    categoryLabel: string,
    isNewPage: boolean = false
  ) {
    const selectedComponent = (globalThis as any).selectedComponent;
    if (!selectedComponent) return;

    const tileTitle = selectedComponent.find(".tile-title")[0];
    if (tileTitle) {
      // tileTitle.addAttributes({ 'title': page.PageName });
      // tileTitle.components(page.PageName)
    }

    const tileId = selectedComponent.parent().getId();
    const rowId = selectedComponent.parent().parent().getId();

    const currentPageId = (globalThis as any).currentPageId;

    if (currentPageId === page.PageId) {
      new Alert("error", i18n.t("messages.error.page_linking"));
      return;
    }
    const updates = [
      // ["Text", page.PageName],
      // ["Name", page.PageName],
      ["Action.ObjectType", `${categoryName}`],
      ["Action.ObjectId", page.PageId],
    ];

    let tileAttributes;

    const pageData = (globalThis as any).pageData;
    if (pageData.PageType === "Information") {
      const infoSectionManager = new InfoSectionManager();
      if (selectedComponent.is("info-cta-section")) {
      } else if (selectedComponent.parent().parent().is("info-tiles-section")) {
        for (const [property, value] of updates) {
          infoSectionManager.updateInfoTileAttributes(
            selectedComponent.parent().parent().getId(),
            selectedComponent.parent().getId(),
            property,
            value
          );
        }

        const tileInfoSectionAttributes: InfoType = (
          globalThis as any
        ).infoContentMapper.getInfoContent(rowId);

        tileAttributes = tileInfoSectionAttributes?.Tiles?.find(
          (tile: any) => tile.Id === tileId
        );
      }
    } else {
      for (const [property, value] of updates) {
        (globalThis as any).tileMapper.updateTile(tileId, property, value);
      }
      tileAttributes = (globalThis as any).tileMapper.getTile(rowId, tileId);
    }

    const version = await this.appVersionManager.getUpdatedActiveVersion();
    this.attachPage(page, version, tileAttributes, isNewPage);

    // set tile properties
    if (selectedComponent && tileAttributes) {
      const tileProperties = new TileProperties(
        selectedComponent,
        tileAttributes
      );
      tileProperties.setTileAttributes();
    }
  }

  attachPage(
    page: ActionPage,
    version: any,
    tileAttributes: any,
    isNewPage: boolean
  ) {
    const selectedItemPageId = page.PageId;
    const childPage =
      version?.Pages.find((page: any) => page.PageId === selectedItemPageId) ||
      null;

    this.removeOtherEditors();
    if (childPage) {
      new ChildEditor(page.PageId, childPage, isNewPage).init(tileAttributes);
    } else {
      this.toolboxService
        .createServicePage(version.AppVersionId, selectedItemPageId)
        .then((newPage: any) => {
          new ChildEditor(newPage.ContentPage.PageId, newPage.ContentPage).init(
            tileAttributes
          );
        });
    }
  }

  removeOtherEditors(): void {
    new EditorEvents().removeOtherEditors();
    new EditorEvents().activateNavigators();
  }

  updateActionProperty(type: string, pageName: string) {
    const actionHeaderLabel = document.querySelector(
      "#sidebar_select_action_label"
    ) as HTMLElement;

    if (actionHeaderLabel) {
      actionHeaderLabel.innerText = `${type}, ${
        pageName.length > 10 ? pageName.substring(0, 10) + "..." : pageName
      }`;
    }
  }
}
