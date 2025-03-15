import { ActionPage } from "../../../../interfaces/ActionPage";
import { ChildEditor } from "../../../../controls/editor/ChildEditor";
import { ToolBoxService } from "../../../../services/ToolBoxService";
import { Alert } from "../../Alert";
import { AppVersionManager } from "../../../../controls/versions/AppVersionManager";

export class PageAttacher {
  toolboxService: ToolBoxService;
  appVersionManager: any;

  constructor() {
    this.appVersionManager = new AppVersionManager();
    this.toolboxService = new ToolBoxService();
  }

  async attachToTile(page: ActionPage, categoryName: string) {
    const selectedComponent = (globalThis as any).selectedComponent;
    if (!selectedComponent) return;

    const tileTitle = selectedComponent.find(".tile-title")[0];
    if (tileTitle) tileTitle.components(page.PageName);

    const tileId = selectedComponent.parent().getId();
    const rowId = selectedComponent.parent().parent().getId();

    const tileAttributes = (globalThis as any).tileMapper.getTile(
      rowId,
      tileId
    );
    const currentPageId = (globalThis as any).currentPageId;

    if (currentPageId === page.PageId) {
      new Alert("error", "Page cannot be linked to itself");
      return;
    }
    const updates = [
        ["Text", page.PageName],
        ["Name", page.PageName],
        ["Action.ObjectType", "Page"],
        ["Action.ObjectId", page.PageId],
      ];
      
      for (const [property, value] of updates) {
        (globalThis as any).tileMapper.updateTile(tileId, property, value);
      }
  
      const version = await this.appVersionManager.getActiveVersion(); 
      this.attachPage(page, version);
  }

  attachPage(page: ActionPage, version: any) {
    const selectedItemPageId = page.PageId;

    const childPage =
        version?.Pages.find(
            (page: any) => page.PageId === selectedItemPageId
        ) || null;

    this.removeOtherEditors();

    if (childPage) {
        new ChildEditor(page.PageId, childPage).init();
    } else{
        this.toolboxService.createContentPage(version.AppVersionId, selectedItemPageId).then((newPage: any) => {  
            new ChildEditor(newPage.PageId, newPage.ContentPage).init();
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
          }
        }
      }
    });
  }
}
