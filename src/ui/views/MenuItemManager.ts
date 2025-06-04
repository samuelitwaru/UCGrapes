import { ActionListManager } from "../../controls/ActionListManager";

export class MenuItemManager {
  private menuContainer: HTMLElement;
  private controller: ActionListManager;
  private activeSubmenu: HTMLElement | null = null;
  private hoverTimeout: number | null = null;

  constructor(menuContainer: HTMLElement, controller: ActionListManager) {
    this.menuContainer = menuContainer;
    this.controller = controller;
  }

  createMenuItem(item: any, onCloseCallback?: () => void): HTMLElement {
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

        const allItems = this.menuContainer.querySelectorAll(
          ".menu-item.expandable"
        );
        allItems.forEach((el) => el.classList.remove("expandable"));
        menuItem.classList.add("expandable");

        // Small delay to prevent flickering
        setTimeout(() => {
          this.showSubMenu(item.name, menuItem);
        }, 50);
      });
    } else {
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
          const allExpandableItems =
            this.menuContainer.querySelectorAll(".expandable");

          const subMenuContainer = this.menuContainer.querySelectorAll(
            ".sub-menu-container"
          );
          allExpandableItems.forEach((el) => el.classList.remove("expandable"));
          subMenuContainer.forEach((el) => el.remove());
        }
      });
    }

    menuItem.id = item.id;
    return menuItem;
  }

  async showSubMenu(type: string, menuItem: HTMLElement) {
    const parentDoc = document.querySelector(".frame-list");
    const parentDocRect = parentDoc?.getBoundingClientRect();

    let subMenuContainer: HTMLElement;
    const existingSubmenu = this.menuContainer.querySelector(
      ".sub-menu-container"
    ) as HTMLElement;
    if (existingSubmenu) {
      subMenuContainer = existingSubmenu;
      subMenuContainer.innerHTML = "";
    } else {
      subMenuContainer = document.createElement("div");
      subMenuContainer.classList.add("sub-menu-container");
      this.activeSubmenu = subMenuContainer;
    }
    const itemRect = menuItem.getBoundingClientRect();
    const parentMenuItemRect = this.menuContainer.getBoundingClientRect();

    const topPosition = itemRect.top - parentMenuItemRect.top;
    subMenuContainer.style.top = `${topPosition}px`;

    const menuWidth = 180; // The width of the submenu container

    if (parentDocRect && itemRect.right + menuWidth > parentDocRect.right) {
      subMenuContainer.style.left = "-178px";
    } else {
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

    if (type !== "CallToActions") {
      subMenuContainer.appendChild(menuHeader);
    }

    const submenuList = document.createElement("ul");
    submenuList.classList.add("menu-list");

    const categoryData = await this.controller.actionList.getCategoryData();
    const items = await this.controller.getSubMenuItems(categoryData, type);

    // Sort items alphabetically by label
    items.sort((a, b) => a.label.localeCompare(b.label));

    // Limit height only if there are more than 10 items
    if (items.length > 10) {
      submenuList.style.maxHeight = "400px"; // Adjust height to fit approx. 10 items
      submenuList.style.overflowY = "auto";
    } else {
      submenuList.style.maxHeight = "unset";
      submenuList.style.overflowY = "unset";
    }

    if (items && items.length > 0) {
      items.forEach((item, index) => {
        const menuItem = this.createMenuItem(item);
        if (type !== "CallToActions" && index === 0) {
          menuItem.classList.add("first-menu-item");
        }
        menuItem.classList.add("sub-menu-item");
        submenuList.appendChild(menuItem);
      });
    } else {
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
      const target = e.target as HTMLElement;
      const isMenuItem =
        target.classList.contains("menu-item") ||
        target.closest(".menu-item:not(.no-items)");

      if (!isMenuItem) {
        e.stopPropagation();
      }
    });

    this.menuContainer.appendChild(subMenuContainer);

    const searchInput = searchContainer.querySelector(
      ".search-input"
    ) as HTMLInputElement;

    searchInput?.addEventListener("input", (e) => {
      const searchTerm = (e.target as HTMLInputElement).value;
      const menuItems = Array.from(
        submenuList.querySelectorAll(".menu-item:not(.no-items)")
      ) as HTMLElement[];

      const existingNoItems = submenuList.querySelector(".no-items");
      if (existingNoItems) {
        existingNoItems.remove();
      }

      const filteredItems = this.controller.filterMenuItems(
        menuItems,
        searchTerm
      );

      menuItems.forEach((item) => {
        item.style.display = "flex";
      });

      if (searchTerm.trim() !== "") {
        menuItems.forEach((item) => {
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

    searchInput?.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    searchInput?.addEventListener("focus", (e) => {
      e.stopPropagation();
    });
  }
}
