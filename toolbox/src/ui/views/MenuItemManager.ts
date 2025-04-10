import { ActionListController } from "../../controls/ActionListController";

export class MenuItemManager {
  private menuContainer: HTMLElement;
  private controller: ActionListController;
  private activeSubmenu: HTMLElement | null = null;
  private hoverTimeout: number | null = null;

  constructor(menuContainer: HTMLElement, controller: ActionListController) {
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
          this.hideSubMenu();
          const allItems = this.menuContainer.querySelectorAll(
            ".menu-item.expandable"
          );
          allItems.forEach((el) => el.classList.remove("expandable"));
          menuItem.classList.add("expandable");
        }
      });
    }

    menuItem.id = item.id;
    return menuItem;
  }

  hideSubMenu() {
    const allItems = this.menuContainer.querySelectorAll(
        ".sub-menu-container"
      );
      allItems.forEach((el) => el.remove());
    this.activeSubmenu = null;
  }

  async showSubMenu(type: string, menuItem: HTMLElement) {
    // Remove any existing submenu
    this.hideSubMenu();

    const parentDoc = document.querySelector(".frame-list");
    const parentDocRect = parentDoc?.getBoundingClientRect();

    const subMenuContainer = document.createElement("div");
    subMenuContainer.classList.add("sub-menu-container");
    this.activeSubmenu = subMenuContainer;

    const itemRect = menuItem.getBoundingClientRect();
    const parentMenuItemRect = this.menuContainer.getBoundingClientRect();
    
    const topPosition = itemRect.top - parentMenuItemRect.top;
    subMenuContainer.style.top = `${topPosition}px`;

    // Add check for available space on the right
    const menuWidth = 180; // The width of the submenu container
    
    // Check if there's enough space on the right side
    if (parentDocRect && 
        (itemRect.right + menuWidth > parentDocRect.right)) {
        // Not enough space on the right, position to the left
        subMenuContainer.style.left = "-178px";
    } else {
        // Default position (to the right)
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

    const categoryData = await this.controller.actionList.getCategoryData();
    const items = await this.controller.getSubMenuItems(categoryData, type);

    if (items && items.length > 0) {
      items.forEach((item) => {
        const menuItem = this.createMenuItem(item);
        menuItem.classList.add("sub-menu-item");
        submenuList.appendChild(menuItem);
      });
    } else {
      const noItemsMessage = document.createElement("li");
      noItemsMessage.classList.add("menu-item", "no-items");
      noItemsMessage.innerHTML = `No ${type.toLowerCase()} available`;
      submenuList.appendChild(noItemsMessage);
    }

    subMenuContainer.appendChild(submenuList);

    // Add hover protection to prevent submenu from closing
    subMenuContainer.addEventListener("mouseenter", () => {
      if (this.hoverTimeout !== null) {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = null;
      }
    });

    this.menuContainer.appendChild(subMenuContainer);

    // Set up search functionality
    const searchInput = searchContainer.querySelector(
      ".search-input"
    ) as HTMLInputElement;
    searchInput?.addEventListener("input", (e) => {
      const searchTerm = (e.target as HTMLInputElement).value;
      const menuItems = Array.from(
        submenuList.querySelectorAll(".menu-item")
      ) as HTMLElement[];
      const filteredItems = this.controller.filterMenuItems(
        menuItems,
        searchTerm
      );
      if (filteredItems.length === 0) {
        const noItemsMessage = document.createElement("li");
        noItemsMessage.classList.add("menu-item", "no-items");
        noItemsMessage.innerHTML = `No ${type.toLowerCase()} available`;
        submenuList.appendChild(noItemsMessage);
      }

      menuItems.forEach((item) => {
        item.style.display = filteredItems.includes(item) ? "flex" : "none";
      });
    });
}
}
