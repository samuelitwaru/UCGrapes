var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ToolBoxService } from "../../../../services/ToolBoxService";
import { ActionDetails } from "./ActionDetails";
import { i18n } from "../../../../i18n/i18n";
import { AppVersionManager } from "../../../../controls/versions/AppVersionManager";
export class ActionListDropDown {
    constructor() {
        this.container = document.createElement("div");
        this.toolBoxService = new ToolBoxService();
        this.appVersion = new AppVersionManager();
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.container.className = "tb-dropdown-menu";
            this.container.id = "dropdownMenu";
            const categoryData = yield this.getCategoryData();
            categoryData.forEach((category) => {
                const dropdownContent = new ActionDetails(category);
                dropdownContent.render(this.container);
            });
        });
    }
    getCategoryData() {
        return __awaiter(this, void 0, void 0, function* () {
            const activePage = globalThis.pageData;
            const categories = [
                {
                    name: "Page",
                    displayName: i18n.t("sidebar.action_list.page"),
                    label: i18n.t("sidebar.action_list.page"),
                    options: yield this.getPages(),
                    canCreatePage: true,
                },
                // {
                //       name: "Services",
                //       displayName: i18n.t("sidebar.action_list.services"),
                //       label: i18n.t("sidebar.action_list.services"),
                //       options: this.getServices(activePage),
                //       canCreatePage: true,
                //     },
                (activePage) && (activePage.PageType === "MyCare" ||
                    activePage.PageType === "MyService" ||
                    activePage.PageType === "MyLiving")
                    ? {
                        name: "Content",
                        displayName: i18n.t("sidebar.action_list.services"),
                        label: i18n.t("sidebar.action_list.services"),
                        options: this.getServices(activePage),
                        canCreatePage: true,
                    }
                    : null,
                {
                    name: "DynamicForm",
                    displayName: i18n.t("sidebar.action_list.forms"),
                    label: i18n.t("sidebar.action_list.forms"),
                    options: this.getDynamicForms(),
                    canCreatePage: false,
                },
                {
                    name: "Modules",
                    displayName: i18n.t("sidebar.action_list.module"),
                    label: i18n.t("sidebar.action_list.module"),
                    options: yield this.getPredefinedPages(),
                    canCreatePage: false,
                },
                // {
                //   name: "Content",
                //   displayName: i18n.t("sidebar.action_list.services"),
                //   label: i18n.t("sidebar.action_list.services"),
                //   options: await this.getContentPages(),
                //   canCreatePage: true,
                // },
                {
                    name: "WebLink",
                    displayName: i18n.t("sidebar.action_list.weblink"),
                    label: i18n.t("sidebar.action_list.weblink"),
                    options: [],
                    canCreatePage: false,
                },
            ];
            return categories.filter((category) => category !== null);
        });
    }
    getDynamicForms() {
        const forms = (this.toolBoxService.forms || []).map((form) => ({
            PageId: form.FormId,
            PageName: form.ReferenceName,
            TileName: form.ReferenceName,
            PageUrl: form.FormUrl,
        }));
        return forms;
    }
    getServices(activePage) {
        let services = (this.toolBoxService.services || []);
        services = services.filter((service) => service.ProductServiceClass.replace(/\s+/g, "") == activePage.PageType)
            .map((service) => ({
            PageId: service.ProductServiceId,
            PageName: service.ProductServiceName,
            TileName: service.ProductServiceTileName || service.ProductServiceName,
            TileCategory: service.ProductServiceClass
        }));
        console.log("services", services);
        return services;
    }
    // getServices(activePage: any) {
    //   let services = (this.toolBoxService.services || []);
    //   services = services.map((service) => ({
    //       PageId: service.ProductServiceId,
    //       PageName: service.ProductServiceName,
    //       TileName: service.ProductServiceTileName || service.ProductServiceName,
    //       TileCategory: service.ProductServiceClass
    //     }));
    //   return services;
    // }
    // async getContentPages() {
    //   try {
    //     const versions = await this.appVersion.getActiveVersion();
    //     const res = versions?.Pages || [];
    //     const pages = res.filter(
    //       (page: any) => 
    //         page.PageType == "Content"
    //     ).map((page: any) => ({
    //       PageId: page.PageId,
    //       PageName: page.PageName,
    //       TileName: page.PageName
    //     }))
    //     return pages;
    //   } catch (error) {
    //     console.error("Error fetching pages:", error);
    //     throw error;
    //   }
    // }
    getPages() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const versions = this.appVersion.getPages() || [];
                const pages = versions.filter((page) => page.PageType == "Menu"
                    && (page.PageName !== "Home"
                        && page.PageName !== "My Care"
                        && page.PageName !== "My Living"
                        && page.PageName !== "My Services")).map((page) => ({
                    PageId: page.PageId,
                    PageName: page.PageName,
                    TileName: page.PageName
                }));
                return pages;
            }
            catch (error) {
                console.error("Error fetching pages:", error);
                throw error;
            }
        });
    }
    getPredefinedPages() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const version = (yield this.appVersion.preDefinedPages()) || [];
                const pages = version.map((page) => ({
                    PageId: page.PageId,
                    PageName: page.PageName,
                    TileName: page.PageName,
                    PageType: page.PageType
                }));
                return pages;
            }
            catch (error) {
                console.error("Error fetching pages:", error);
                throw error;
            }
        });
    }
    render(container) {
        container.appendChild(this.container);
    }
}
//# sourceMappingURL=ActionListDropDown.js.map