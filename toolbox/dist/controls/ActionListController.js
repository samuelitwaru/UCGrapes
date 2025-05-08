var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { baseURL, ToolBoxService } from "../services/ToolBoxService";
import { ActionListDropDown } from "../ui/components/tools-section/action-list/ActionListDropDown";
import { PageAttacher } from "../ui/components/tools-section/action-list/PageAttacher";
import { PageCreationService } from "../ui/components/tools-section/action-list/PageCreationService";
import { ChildEditor } from "./editor/ChildEditor";
import { AppVersionManager } from "./versions/AppVersionManager";
import { i18n } from "../i18n/i18n";
export class ActionListController {
    constructor() {
        this.toolboxService = new ToolBoxService();
        this.appVersionManager = new AppVersionManager();
        this.pageAttacher = new PageAttacher();
        this.actionList = new ActionListDropDown();
        this.pageCreationService = new PageCreationService();
        this.selectedComponent = globalThis.selectedComponent;
    }
    getMenuCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            const categoryData = yield this.actionList.getCategoryData();
            console.log("categoryData", categoryData);
            const activePage = globalThis.pageData;
            // Create the second category array with conditional logic
            const secondCategory = [];
            // Only add Services if the page type matches
            // if (activePage && activePage.PageType !== "Information") {
            secondCategory.push({
                id: "list-form",
                name: "DynamicForm",
                label: i18n.t("tile.forms"),
                expandable: true,
                action: () => this.getSubMenuItems(categoryData, "Forms"),
            });
            // }
            // if (activePage && activePage.PageType !== "Information") {
            secondCategory.push({
                id: "list-module",
                name: "Modules",
                label: i18n.t("tile.modules"),
                expandable: true,
                action: () => this.getSubMenuItems(categoryData, "Modules"),
            });
            // }
            secondCategory.push({
                id: "list-page",
                name: "Existing Pages",
                label: i18n.t("tile.existing_pages"),
                expandable: true,
                action: () => this.getSubMenuItems(categoryData, "Page"),
            });
            return [
                [
                    // {
                    //   id: "add-menu-page",
                    //   label: i18n.t("tile.add_menu_page"),
                    //   name: "",
                    //   action: async () => {
                    //     this.createNewPage("Untitled");
                    //   },
                    // },
                    {
                        id: "add-info-page",
                        label: i18n.t("tile.information_page"),
                        name: "",
                        action: () => __awaiter(this, void 0, void 0, function* () {
                            this.createNewInfoPage("Untitled");
                        }),
                    },
                    // {
                    //   id: "add-content-page",
                    //   label:  i18n.t("tile.add_content_page"),
                    //   name: "",
                    //   action: () => {
                    //     const config = AppConfig.getInstance();
                    //     config.addServiceButtonEvent()
                    //   },
                    // },
                ],
                secondCategory,
                [
                    { id: "add-email", label: i18n.t("tile.email"), name: "", action: () => { this.pageCreationService.handleEmail(); } },
                    { id: "add-phone", label: i18n.t("tile.phone"), name: "", action: () => { this.pageCreationService.handlePhone(); } },
                    { id: "add-web-link", label: "Web link", name: "", action: () => { this.pageCreationService.handleWebLinks(); } },
                ],
            ];
        });
    }
    getSubMenuItems(categoryData, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const category = categoryData.find((cat) => cat.name === type);
            const itemsList = (category === null || category === void 0 ? void 0 : category.options) || [];
            return itemsList.map((item) => {
                return {
                    id: item.PageId,
                    label: item.PageName,
                    url: item.PageUrl,
                    action: () => this.handleSubMenuItemSelection(item, type),
                };
            });
        });
    }
    createNewPage(title) {
        return __awaiter(this, void 0, void 0, function* () {
            const appVersion = yield this.appVersionManager.getActiveVersion();
            const res = yield this.toolboxService.createMenuPage(appVersion.AppVersionId, title);
            if (!res.error.message) {
                const page = {
                    PageId: res.MenuPage.PageId,
                    PageName: res.MenuPage.PageName,
                    TileName: res.MenuPage.PageName,
                    PageType: res.MenuPage.PageType,
                };
                this.pageAttacher.attachToTile(page, "Menu", "Menu");
            }
            else {
                console.error("error", res.error.message);
            }
        });
    }
    createNewInfoPage(title) {
        return __awaiter(this, void 0, void 0, function* () {
            const appVersion = yield this.appVersionManager.getActiveVersion();
            const res = yield this.toolboxService.createInfoPage(appVersion.AppVersionId, title);
            if (!res.error.message) {
                const page = {
                    PageId: res.MenuPage.PageId,
                    PageName: res.MenuPage.PageName,
                    TileName: res.MenuPage.PageName,
                    PageType: res.MenuPage.PageType,
                };
                this.pageAttacher.attachToTile(page, "Information", "Information");
            }
            else {
                console.error("error", res.error.message);
            }
        });
    }
    handleSubMenuItemSelection(item, type) {
        this.pageAttacher.removeOtherEditors();
        if (type === "DynamicForm") {
            this.handleDynamicForms(item);
        }
        else if (type === "Modules") {
            this.pageAttacher.attachToTile(item, item.PageType, item.PageName);
        }
        else {
            this.pageAttacher.attachToTile(item, type, item.PageName);
        }
    }
    handleDynamicForms(form) {
        return __awaiter(this, void 0, void 0, function* () {
            const selectedComponent = globalThis.selectedComponent;
            if (!selectedComponent)
                return;
            const tileTitle = selectedComponent.find(".tile-title")[0];
            if (tileTitle)
                tileTitle.components(form.PageName);
            const tileId = selectedComponent.parent().getId();
            const rowId = selectedComponent.parent().parent().getId();
            const version = globalThis.activeVersion;
            const childPage = version === null || version === void 0 ? void 0 : version.Pages.find((page) => page.PageName === "Dynamic Form" && page.PageType === "DynamicForm");
            const formUrl = `${baseURL}/utoolboxdynamicform.aspx?WWPFormId=${form.PageId}&WWPDynamicFormMode=DSP&DefaultFormType=&WWPFormType=0`;
            const updates = [
                ["Text", form.PageName],
                ["Name", form.PageName],
                ["Action.ObjectType", "DynamicForm"],
                ["Action.ObjectId", form.PageId],
                ["Action.ObjectUrl", formUrl],
            ];
            //  this.updateActionListDropDown("Dynamic Form", form.PageName);
            for (const [property, value] of updates) {
                globalThis.tileMapper.updateTile(tileId, property, value);
            }
            const tileAttributes = globalThis.tileMapper.getTile(rowId, tileId);
            new ChildEditor(childPage === null || childPage === void 0 ? void 0 : childPage.PageId, childPage).init(tileAttributes);
        });
    }
    filterMenuItems(items, searchTerm) {
        return items.filter((item) => {
            var _a;
            const itemText = ((_a = item.textContent) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "";
            return itemText.includes(searchTerm.toLowerCase());
        });
    }
}
//# sourceMappingURL=ActionListController.js.map