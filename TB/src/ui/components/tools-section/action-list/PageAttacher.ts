import { ActionPage } from "../../../../interfaces/ActionPage";
import { ChildEditor } from "../../../../controls/editor/ChildEditor";
import { ToolBoxService } from "../../../../services/ToolBoxService";
import { Alert } from "../../Alert";

export class PageAttacher {
  toolboxService: ToolBoxService;

  constructor() {
    this.toolboxService = new ToolBoxService();
  }

  async attachToTile(page: ActionPage) {
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

    const newPageId = page.PageId;
    const versions = await this.toolboxService.getVersions();

    const childPage =
      versions.AppVersions.find((version: any) => version.IsActive)?.Pages.find(
        (page: any) => page.PageId === newPageId
      ) || null;

    const removeOtherEditors = () => {
      const currentFrame = document.querySelector(`#gjs-${page.PageId}-frame`);

      if (currentFrame) {
        let nextElement = currentFrame.nextElementSibling;
        while (nextElement) {
          const elementToRemove = nextElement;
          nextElement = nextElement.nextElementSibling;
          elementToRemove.remove();
        }
      }
    };

    removeOtherEditors();
    if (childPage) {
      new ChildEditor(page.PageId, childPage).init();
    }
  }
}