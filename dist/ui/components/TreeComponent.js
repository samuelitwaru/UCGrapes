import { ToolBoxService } from "../../services/ToolBoxService";
import { AllPagesComponent } from "./AllPagesComponent";
import { Alert } from "./Alert";
import { i18n } from "../../i18n/i18n";
export class TreeComponent {
    constructor(appVersionManager) {
        this.mainContainer = document.getElementById('mapping-section');
        this.treeContainer = document.getElementById('tree-container');
        this.renderTitle();
        this.renderHideOrShowPages();
        this.addPageCreationEvent();
        this.appVersionManager = appVersionManager;
        this.toolboxService = new ToolBoxService();
        this.appVersionManager.getUpdatedActiveVersion().then(res => {
            var _a;
            this.version = res;
            this.pages = res.Pages;
            this.homePage = (_a = res.Pages) === null || _a === void 0 ? void 0 : _a.find((page) => page.PageName == "Home");
            if (this.homePage) {
                this.clearMappings();
                this.createPageTree(this.homePage.PageId, "tree-container");
            }
        });
    }
    renderTitle() {
        const sidebarTitle = document.getElementById("sidebar_mapping_title");
        sidebarTitle.textContent = i18n.t('navbar.publish.sidebar_mapping_title');
    }
    renderHideOrShowPages() {
        const homeTitle = document.getElementById("current-page-title");
        // Remove all siblings after the homeTitle
        let nextElement = homeTitle.nextSibling;
        while (nextElement) {
            let toRemove = nextElement;
            nextElement = nextElement.nextSibling;
            if (toRemove.nodeType === 1) { // Ensure it's an element node
                toRemove.remove();
            }
        }
        const listPages = document.createElement('span');
        listPages.id = 'list_all_pages';
        listPages.style.display = 'block';
        listPages.textContent = 'List all pages';
        const hidePages = document.createElement('span');
        hidePages.id = 'hide_pages';
        hidePages.style.display = 'none';
        hidePages.textContent = 'Hide pages';
        listPages.addEventListener("click", (e) => {
            hidePages.style.display = 'block';
            listPages.style.display = 'none';
            this.clearMappings();
            this.showAllPages();
        });
        hidePages.addEventListener("click", (e) => {
            hidePages.style.display = 'none';
            listPages.style.display = 'block';
            if (this.homePage) {
                this.clearMappings();
                this.createPageTree(this.homePage.PageId, "tree-container");
            }
        });
        homeTitle.insertAdjacentElement("afterend", hidePages);
        homeTitle.insertAdjacentElement("afterend", listPages);
    }
    getPage(pageId) {
        return this.pages.find((page) => page.PageId == pageId);
    }
    showAllPages() {
        new AllPagesComponent(this.version);
    }
    createPageTree(rootPageId, childDivId) {
        let page = this.getPage(rootPageId);
        let childPages = [];
        if (page && page.PageMenuStructure) {
            page.PageMenuStructure.Rows.forEach((row) => {
                row.Tiles.forEach((tile) => {
                    page = this.getPage(tile.Action.ObjectId);
                    if (page) {
                        childPages.push(page);
                    }
                });
            });
            const newTree = this.createTree(rootPageId, childPages);
            const treeContainer = document.getElementById(childDivId);
            treeContainer.innerHTML = "";
            treeContainer.appendChild(newTree);
        }
    }
    createTree(rootPageId, childPages, isOpenable = true) {
        const listContainer = document.createElement("ul");
        listContainer.classList.add("tb-custom-list");
        childPages.forEach((page) => {
            const listItem = this.buildListItem(rootPageId, page, isOpenable);
            listContainer.appendChild(listItem);
        });
        return listContainer;
    }
    buildListItem(rootPageId, page, isOpenable = true) {
        if (page.PageType != "Menu")
            isOpenable = false;
        const listItem = document.createElement("li");
        listItem.classList.add("tb-custom-list-item");
        listItem.dataset.parentPageId = rootPageId;
        const childDiv = document.createElement("div");
        childDiv.classList.add("child-div");
        childDiv.id = `child-div-${page.PageId}`;
        childDiv.style.position = "relative";
        childDiv.style.paddingLeft = "20px";
        const menuItem = document.createElement("div");
        menuItem.classList.add("tb-custom-menu-item");
        const toggle = document.createElement("span");
        toggle.classList.add("tb-dropdown-toggle");
        toggle.setAttribute("role", "button");
        toggle.setAttribute("aria-expanded", "false");
        let icon = "fa-regular fa-file tree-icon";
        if (isOpenable) {
            icon = "fa-caret-right tree-icon";
        }
        toggle.innerHTML = `<i class="fa ${icon}"></i><span>${page.PageName}</span>`;
        menuItem.appendChild(toggle);
        listItem.appendChild(menuItem);
        listItem.appendChild(childDiv);
        if (isOpenable) {
            listItem.addEventListener("click", (e) => {
                e.stopPropagation();
                this.createPageTree(page.PageId, `child-div-${page.PageId}`);
            });
        }
        return listItem;
    }
    clearMappings() {
        var _a;
        (_a = this.treeContainer) === null || _a === void 0 ? void 0 : _a.replaceChildren('');
    }
    addPageCreationEvent() {
        const pageSubmitButton = document.getElementById("page-submit");
        const titleInput = document.getElementById("page-title");
        pageSubmitButton.addEventListener("click", (e) => {
            e.preventDefault();
            const pageName = titleInput.value;
            if (pageName) {
                this.createPage(pageName);
            }
            else {
                new Alert("error", i18n.t("messages.error.empty_page_name"));
            }
        });
    }
    createPage(pageName) {
        this.toolboxService.createMenuPage(this.version.AppVersionId, pageName).then((res) => {
            console.log(res);
        });
    }
}
//# sourceMappingURL=TreeComponent.js.map