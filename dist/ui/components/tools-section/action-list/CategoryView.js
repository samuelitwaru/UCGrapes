import { PageAttacher } from "./PageAttacher";
import { PageCreationService } from "./PageCreationService";
import { Alert } from "../../Alert";
import { AppConfig } from "../../../../AppConfig";
import { i18n } from "../../../../i18n/i18n";
import { ActionListController } from "../../../../controls/ActionListController";
export class CategoryView {
    constructor(categoryData) {
        this.categoryData = categoryData;
        this.pageAttacher = new PageAttacher();
        this.pageCreationService = new PageCreationService();
        this.details = document.createElement("details");
        this.init();
    }
    init() {
        this.details.className = "category";
        this.details.setAttribute("data-category", this.categoryData.name);
        this.createCategoryElement();
    }
    createCategoryElement() {
        var _a, _b;
        const summary = document.createElement("summary");
        summary.innerText = `${this.categoryData.displayName}`;
        const icon = document.createElement("i");
        icon.className = "fa fa-angle-right";
        if (this.categoryData.name !== "WebLink")
            summary.appendChild(icon);
        const searchContainer = document.createElement("div");
        searchContainer.className = "search-container";
        searchContainer.innerHTML = `
            <i class="fas fa-search search-icon"></i>
            <input type="text" placeholder="Search" class="search-input" />
        `;
        // Add event listener for the add new service button if it exists
        if (this.categoryData.canCreatePage) {
            setTimeout(() => {
                const addButton = searchContainer.querySelector("#add-new-service");
                if (addButton) {
                    addButton.addEventListener("click", (e) => {
                        e.preventDefault();
                        const selectedComponent = globalThis.selectedComponent;
                        if (!selectedComponent) {
                            new Alert("error", i18n.t("messages.error.select_tile"));
                            return;
                        }
                        if (this.categoryData.name == "Content Page") {
                            // this.pageCreationService.addNewContentPage();
                        }
                        if (this.categoryData.name == "Service/Product Page") {
                            // open popup
                            const config = AppConfig.getInstance();
                            // config.addServiceButtonEvent()
                        }
                    });
                }
            }, 0);
        }
        const list = document.createElement("ul");
        list.className = "category-content";
        (_b = (_a = this.categoryData) === null || _a === void 0 ? void 0 : _a.options) === null || _b === void 0 ? void 0 : _b.forEach((page) => {
            const li = document.createElement("li");
            li.innerText = page.PageName;
            li.setAttribute("data-page-name", page.PageName);
            li.setAttribute("data-page-id", page.PageId);
            li.addEventListener("click", (e) => {
                e.preventDefault();
                const selectedComponent = globalThis.selectedComponent;
                if (!selectedComponent) {
                    new Alert("error", i18n.t("messages.error.select_tile"));
                    return;
                }
                if (this.categoryData.name === "DynamicForm") {
                    new ActionListController().handleDynamicForms(page);
                }
                else if (this.categoryData.name == "Modules") {
                    this.pageAttacher.attachToTile(page, page.PageType, this.categoryData.label);
                }
                else {
                    this.pageAttacher.attachToTile(page, this.categoryData.name, this.categoryData.label);
                }
            });
            list.appendChild(li);
        });
        const noItem = document.createElement("li");
        noItem.className = "no-records-message";
        noItem.style.display = "none";
        noItem.innerText = "No records found";
        list.appendChild(noItem);
        this.details.addEventListener("toggle", (e) => {
            if (this.categoryData.name !== "WebLink") {
                const icon = summary.querySelector("i");
                if (icon) {
                    icon.classList.toggle("fa-angle-right");
                    icon.classList.toggle("fa-angle-down");
                }
            }
            else {
                const selectedComponent = globalThis.selectedComponent;
                if (!selectedComponent) {
                    new Alert("error", i18n.t("messages.error.select_tile"));
                    return;
                }
                this.pageCreationService.handleWebLinks();
            }
        });
        if (this.categoryData.name === "WebLink") {
            this.details.appendChild(summary);
        }
        else {
            this.details.appendChild(summary);
            this.details.appendChild(searchContainer);
            this.details.appendChild(list);
        }
        this.searchItemsEvent(searchContainer);
    }
    searchItemsEvent(searchContainer) {
        const searchInput = searchContainer.querySelector("input");
        const list = this.details.querySelector("ul");
        searchInput.addEventListener("input", (e) => {
            const noRecordsMessage = list.querySelector(".no-records-message");
            let hasVisibleItems = false;
            const value = e.target.value.toLowerCase().trim();
            const items = Array.from(list.querySelectorAll("li:not(.no-records-message)"));
            items.forEach((item) => {
                var _a, _b;
                const text = (_b = (_a = item.textContent) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : "";
                const isVisible = text.includes(value);
                item.style.display = isVisible ? "block" : "none";
                if (isVisible)
                    hasVisibleItems = true;
            });
            if (noRecordsMessage) {
                noRecordsMessage.style.display = hasVisibleItems ? "none" : "block";
            }
        });
    }
    render(container) {
        container.appendChild(this.details);
    }
}
//# sourceMappingURL=CategoryView.js.map