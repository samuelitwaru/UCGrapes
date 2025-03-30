import { ActionPage } from "../../../../interfaces/ActionPage";
import { ChildEditor } from "../../../../controls/editor/ChildEditor";
import { ToolBoxService } from "../../../../services/ToolBoxService";
import { Alert } from "../../Alert";
import { AppVersionManager } from "../../../../controls/versions/AppVersionManager";
import { EditorEvents } from "../../../../controls/editor/EditorEvents";
import { PageCreationService } from "./PageCreationService";
import { TileProperties } from "../../../../controls/editor/TileProperties";

export class PageAttacher {
  toolboxService: ToolBoxService;
  appVersionManager: any;

  constructor() {
    this.appVersionManager = new AppVersionManager();
    this.toolboxService = new ToolBoxService();
  }

  async attachNewServiceToTile(serviceId:string) {
    const services = await this.toolboxService.getServices()
    const newService = services.find(service => service.ProductServiceId==serviceId)
    if (newService) {
      const page = {
        "PageId": serviceId,
        "PageName": newService.ProductServiceName,
        "TileName": newService.ProductServiceTileName,
      }
      this.attachToTile(page, "Service/Product Page")
    }
  }

  async attachToTile(page: ActionPage, categoryName: string) {
    const selectedComponent = (globalThis as any).selectedComponent;
    if (!selectedComponent) return;

    const tileTitle = selectedComponent.find(".tile-title")[0];
    if (tileTitle) tileTitle.components(page.PageName);

    const tileId = selectedComponent.parent().getId();
    const rowId = selectedComponent.parent().parent().getId();

    const currentPageId = (globalThis as any).currentPageId;

    if (currentPageId === page.PageId) {
      new Alert("error", "Page cannot be linked to itself");
      return;
    }
    const updates = [
        ["Text", page.PageName],
        ["Name", page.PageName],
        ["Action.ObjectType", `${categoryName}`],
        ["Action.ObjectId", page.PageId],
      ];
      
      for (const [property, value] of updates) {
        (globalThis as any).tileMapper.updateTile(tileId, property, value);
      }

      const tileAttributes = (globalThis as any).tileMapper.getTile(
        rowId,
        tileId
      );
      
      new PageCreationService().updateActionListDropDown("Dynamic Form", page.PageName);
  
      const version = await this.appVersionManager.getActiveVersion(); 
      this.attachPage(page, version, tileAttributes);

      // set tile properties
      if (selectedComponent && tileAttributes) {
        const tileProperties = new TileProperties(
          selectedComponent,
          tileAttributes
        );
        tileProperties.setTileAttributes();
      }
  }

  attachPage(page: ActionPage, version: any, tileAttributes: any) {
    const selectedItemPageId = page.PageId;

    const childPage =
        version?.Pages.find(
            (page: any) => page.PageId === selectedItemPageId
        ) || null;

    this.removeOtherEditors();

    if (childPage) {
        new ChildEditor(page.PageId, childPage).init(tileAttributes);
    } else{
        this.toolboxService.createServicePage(version.AppVersionId, selectedItemPageId).then((newPage: any) => {  
          new ChildEditor(newPage.ContentPage.PageId, newPage.ContentPage).init(tileAttributes);
        });
    }
  }

  removeOtherEditors(): void {
    const frameId = (globalThis as any).frameId;
    const framelist = document.querySelectorAll('.mobile-frame');
    framelist.forEach((frame: any) => {
      if (frame.id.includes(frameId)) {
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

  updateActionProperty(type: string, pageName: string) {
    const actionHeaderLabel = document.querySelector('#sidebar_select_action_label') as HTMLElement;

    if (actionHeaderLabel) {
        actionHeaderLabel.innerText = `${type}, ${pageName.length > 10 ? pageName.substring(0, 10) + "..." : pageName}`
    }     
  }
}
