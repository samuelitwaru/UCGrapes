var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ChildEditor } from "../../../../controls/editor/ChildEditor";
import { ToolBoxService } from "../../../../services/ToolBoxService";
import { Alert } from "../../Alert";
import { AppVersionManager } from "../../../../controls/versions/AppVersionManager";
import { EditorEvents } from "../../../../controls/editor/EditorEvents";
import { TileProperties } from "../../../../controls/editor/TileProperties";
import { i18n } from "../../../../i18n/i18n";
import { ActionSelectContainer } from "./ActionSelectContainer";
import { InfoSectionController } from "../../../../controls/InfoSectionController";
export class PageAttacher {
    constructor() {
        this.appVersionManager = new AppVersionManager();
        this.toolboxService = new ToolBoxService();
    }
    attachNewServiceToTile(serviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const services = yield this.toolboxService.getServices();
            const newService = services.find((service) => service.ProductServiceId == serviceId);
            if (newService) {
                const page = {
                    PageId: serviceId,
                    PageName: newService.ProductServiceName,
                    TileName: newService.ProductServiceTileName,
                    PageType: "Content",
                };
                this.attachToTile(page, "Content", i18n.t("sidebar.action_list.services"));
                // reload the action list container
                const menuSection = document.getElementById("menu-page-section");
                const contentection = document.getElementById("content-page-section");
                if (menuSection)
                    menuSection.style.display = "block";
                if (contentection)
                    contentection.remove();
                const actionListContainer = new ActionSelectContainer();
                actionListContainer.render(menuSection);
            }
        });
    }
    attachToTile(page, categoryName, categoryLabel) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const selectedComponent = globalThis.selectedComponent;
            if (!selectedComponent)
                return;
            const tileTitle = selectedComponent.find(".tile-title")[0];
            if (tileTitle) {
                tileTitle.addAttributes({ 'title': page.PageName });
                tileTitle.components(page.PageName);
            }
            ;
            const tileId = selectedComponent.parent().getId();
            const rowId = selectedComponent.parent().parent().getId();
            const currentPageId = globalThis.currentPageId;
            if (currentPageId === page.PageId) {
                new Alert("error", i18n.t("messages.error.page_linking"));
                return;
            }
            const updates = [
                ["Text", page.PageName],
                ["Name", page.PageName],
                ["Action.ObjectType", `${categoryName}`],
                ["Action.ObjectId", page.PageId],
            ];
            let tileAttributes;
            const pageData = globalThis.pageData;
            console.log("pageData,", selectedComponent.parent().is('info-tiles-section'));
            if (pageData.PageType === "Information") {
                const infoSectionController = new InfoSectionController();
                if (selectedComponent.is('info-cta-section')) {
                }
                else if (selectedComponent.parent().parent().is('info-tiles-section')) {
                    for (const [property, value] of updates) {
                        infoSectionController.updateInfoTileAttributes(selectedComponent.parent().parent().getId(), selectedComponent.parent().getId(), property, value);
                    }
                    const tileInfoSectionAttributes = globalThis.infoContentMapper.getInfoContent(rowId);
                    tileAttributes = (_a = tileInfoSectionAttributes === null || tileInfoSectionAttributes === void 0 ? void 0 : tileInfoSectionAttributes.Tiles) === null || _a === void 0 ? void 0 : _a.find((tile) => tile.Id === tileId);
                }
            }
            else {
                for (const [property, value] of updates) {
                    globalThis.tileMapper.updateTile(tileId, property, value);
                }
                tileAttributes = globalThis.tileMapper.getTile(rowId, tileId);
            }
            const version = yield this.appVersionManager.getUpdatedActiveVersion();
            this.attachPage(page, version, tileAttributes);
            // set tile properties
            if (selectedComponent && tileAttributes) {
                const tileProperties = new TileProperties(selectedComponent, tileAttributes);
                tileProperties.setTileAttributes();
            }
        });
    }
    attachPage(page, version, tileAttributes) {
        const selectedItemPageId = page.PageId;
        const childPage = (version === null || version === void 0 ? void 0 : version.Pages.find((page) => page.PageId === selectedItemPageId)) ||
            null;
        this.removeOtherEditors();
        if (childPage) {
            new ChildEditor(page.PageId, childPage).init(tileAttributes);
        }
        else {
            this.toolboxService
                .createServicePage(version.AppVersionId, selectedItemPageId)
                .then((newPage) => {
                new ChildEditor(newPage.ContentPage.PageId, newPage.ContentPage).init(tileAttributes);
            });
        }
    }
    removeOtherEditors() {
        new EditorEvents().removeOtherEditors();
        new EditorEvents().activateNavigators();
    }
    updateActionProperty(type, pageName) {
        const actionHeaderLabel = document.querySelector("#sidebar_select_action_label");
        if (actionHeaderLabel) {
            actionHeaderLabel.innerText = `${type}, ${pageName.length > 10 ? pageName.substring(0, 10) + "..." : pageName}`;
        }
    }
}
//# sourceMappingURL=PageAttacher.js.map