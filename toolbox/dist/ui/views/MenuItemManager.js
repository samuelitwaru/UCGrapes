var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class MenuItemManager {
    constructor(menuContainer, controller) {
        this.activeSubmenu = null;
        this.hoverTimeout = null;
        this.menuContainer = menuContainer;
        this.controller = controller;
    }
    createMenuItem(item, onCloseCallback) {
        const menuItem = document.createElement("li");
        menuItem.classList.add("menu-item");
        menuItem.innerHTML =
            item.label.length > 20 ? item.label.substring(0, 20) + "..." : item.label;
        menuItem.setAttribute("data-name", item.name || "");
        if (item.expandable) {
            const icon = document.createElement("i");
            icon.classList.add("fa", "fa-chevron-right", "expandable-icon");
            menuItem.appendChild(icon);
            // Fix hover issue with better event handling
            menuItem.addEventListener("mouseenter", (e) => {
                e.stopPropagation();
                // Clear any existing timeout
                if (this.hoverTimeout !== null) {
                    clearTimeout(this.hoverTimeout);
                    this.hoverTimeout = null;
                }
                const allItems = this.menuContainer.querySelectorAll(".menu-item.expandable");
                allItems.forEach((el) => el.classList.remove("expandable"));
                menuItem.classList.add("expandable");
                // Small delay to prevent flickering
                setTimeout(() => {
                    this.showSubMenu(item.name, menuItem);
                }, 50);
            });
        }
        else {
            // Handle non-expandable items on click
            menuItem.addEventListener("click", (e) => {
                e.stopPropagation();
                if (item.action) {
                    item.action();
                    if (onCloseCallback) {
                        onCloseCallback();
                    }
                }
                this.menuContainer.remove();
            });
            menuItem.addEventListener("mouseenter", (e) => {
                e.stopPropagation();
                if (!menuItem.classList.contains("sub-menu-item")) {
                    const allExpandableItems = this.menuContainer.querySelectorAll(".expandable");
                    const subMenuContainer = this.menuContainer.querySelectorAll(".sub-menu-container");
                    allExpandableItems.forEach((el) => el.classList.remove("expandable"));
                    subMenuContainer.forEach((el) => el.remove());
                }
            });
        }
        menuItem.id = item.id;
        return menuItem;
    }
    showSubMenu(type, menuItem) {
        return __awaiter(this, void 0, void 0, function* () {
            const parentDoc = document.querySelector(".frame-list");
            const parentDocRect = parentDoc === null || parentDoc === void 0 ? void 0 : parentDoc.getBoundingClientRect();
            let subMenuContainer;
            const existingSubmenu = this.menuContainer.querySelector(".sub-menu-container");
            if (existingSubmenu) {
                subMenuContainer = existingSubmenu;
                subMenuContainer.innerHTML = "";
            }
            else {
                subMenuContainer = document.createElement("div");
                subMenuContainer.classList.add("sub-menu-container");
                this.activeSubmenu = subMenuContainer;
            }
            const itemRect = menuItem.getBoundingClientRect();
            const parentMenuItemRect = this.menuContainer.getBoundingClientRect();
            const topPosition = itemRect.top - parentMenuItemRect.top;
            subMenuContainer.style.top = `${topPosition}px`;
            const menuWidth = 180; // The width of the submenu container
            if (parentDocRect &&
                (itemRect.right + menuWidth > parentDocRect.right)) {
                subMenuContainer.style.left = "-178px";
            }
            else {
                subMenuContainer.style.left = "100%";
            }
            const menuHeader = document.createElement("div");
            menuHeader.classList.add("sub-menu-header");
            const searchContainer = document.createElement("div");
            searchContainer.className = "search-container";
            searchContainer.innerHTML = `
      <i class="fas fa-search search-icon"></i>
      <input type="text" placeholder="Search" class="search-input" />
    `;
            menuHeader.appendChild(searchContainer);
            subMenuContainer.appendChild(menuHeader);
            const submenuList = document.createElement("ul");
            submenuList.classList.add("menu-list");
            const categoryData = yield this.controller.actionList.getCategoryData();
            const items = yield this.controller.getSubMenuItems(categoryData, type);
            if (items && items.length > 0) {
                items.forEach((item) => {
                    const menuItem = this.createMenuItem(item);
                    menuItem.classList.add("sub-menu-item");
                    submenuList.appendChild(menuItem);
                });
            }
            else {
                const noItemsMessage = document.createElement("li");
                noItemsMessage.classList.add("menu-item", "no-items");
                noItemsMessage.innerHTML = `No ${type.toLowerCase()} available`;
                noItemsMessage.style.pointerEvents = "none";
                noItemsMessage.style.cursor = "default";
                submenuList.appendChild(noItemsMessage);
            }
            subMenuContainer.appendChild(submenuList);
            subMenuContainer.addEventListener("mouseenter", () => {
                if (this.hoverTimeout !== null) {
                    clearTimeout(this.hoverTimeout);
                    this.hoverTimeout = null;
                }
            });
            subMenuContainer.addEventListener("click", (e) => {
                const target = e.target;
                const isMenuItem = target.classList.contains('menu-item') ||
                    target.closest('.menu-item:not(.no-items)');
                if (!isMenuItem) {
                    e.stopPropagation();
                }
            });
            this.menuContainer.appendChild(subMenuContainer);
            const searchInput = searchContainer.querySelector(".search-input");
            searchInput === null || searchInput === void 0 ? void 0 : searchInput.addEventListener("input", (e) => {
                const searchTerm = e.target.value;
                const menuItems = Array.from(submenuList.querySelectorAll(".menu-item:not(.no-items)"));
                const existingNoItems = submenuList.querySelector(".no-items");
                if (existingNoItems) {
                    existingNoItems.remove();
                }
                const filteredItems = this.controller.filterMenuItems(menuItems, searchTerm);
                menuItems.forEach(item => {
                    item.style.display = "flex";
                });
                if (searchTerm.trim() !== "") {
                    menuItems.forEach(item => {
                        item.style.display = filteredItems.includes(item) ? "flex" : "none";
                    });
                    if (filteredItems.length === 0) {
                        const noItemsMessage = document.createElement("li");
                        noItemsMessage.classList.add("menu-item", "no-items");
                        noItemsMessage.innerHTML = `No ${type.toLowerCase()} available`;
                        noItemsMessage.style.pointerEvents = "none";
                        noItemsMessage.style.cursor = "default";
                        submenuList.appendChild(noItemsMessage);
                    }
                }
            });
            searchInput === null || searchInput === void 0 ? void 0 : searchInput.addEventListener("click", (e) => {
                e.stopPropagation();
            });
            searchInput === null || searchInput === void 0 ? void 0 : searchInput.addEventListener("focus", (e) => {
                e.stopPropagation();
            });
        });
    }
}
//# sourceMappingURL=MenuItemManager.js.map