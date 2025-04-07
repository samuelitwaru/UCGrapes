import { ActionListController } from "../../controls/ActionListController";

export class ActionListPopUp {
  private controller: ActionListController;
  private menuContainer: HTMLDivElement;
  private templateContainer: HTMLElement;
  private menuList: HTMLUListElement;

  constructor(templateContainer: HTMLElement) {
    this.controller = new ActionListController();
    this.templateContainer = templateContainer;
    this.menuContainer = document.createElement("div");
    this.menuList = document.createElement("ul");
    this.controller.handleSubMenuAction = (type: string) => {
      this.showSubMenu(type);
    };
    this.init();
  }

  async init(): Promise<void> {
    this.menuContainer.classList.add("menu-container");
    this.menuList.innerHTML = "";

    const menuCategories = await this.controller.getMenuCategories();

    menuCategories?.forEach((category) => {
      const menuCategory = document.createElement("div");
      menuCategory.classList.add("menu-category");

      category.forEach((item) => {
        const menuItem = this.createMenuItem(item);
        menuCategory.appendChild(menuItem);
      });

      this.menuContainer.appendChild(menuCategory);
    });
  }

  private createMenuItem(item: any): HTMLElement {
    const menuItem = document.createElement("li");
    menuItem.classList.add("menu-item");
    menuItem.innerHTML =
      item.label.length > 20 ? item.label.substring(0, 20) + "..." : item.label;
    menuItem.setAttribute("data-name", item.name || "");

    if (item.expandable) {
      const icon = document.createElement("i");
      icon.classList.add("fa", "fa-chevron-right", "expandable-icon");
      menuItem.appendChild(icon);
    }

    menuItem.id = item.id;
    menuItem.addEventListener("click", (e) => {
      e.stopPropagation();
      if (item.action) {
        // For submenu items, we'll handle them specially
        if (item.expandable) {
          this.showSubMenu(item.name); // Pass the name (Services/Forms/Modules)
        } else {
          item.action();
          this.menuContainer.remove();
        }
      }
    });
    return menuItem;
  }

  render() {
    const trigger = this.templateContainer.querySelector(
      ".tile-open-menu"
    ) as HTMLElement;
    if (!trigger) return;

    const triggerRect = trigger.getBoundingClientRect();
    const popupRect = this.menuContainer.getBoundingClientRect();
    const windowWidth = (globalThis as any).deviceWidth;
    const windowHeight = (globalThis as any).deviceHeight;

    // Reset positioning
    this.menuContainer.style.top = "";
    this.menuContainer.style.left = "";
    this.menuContainer.style.right = "";
    this.menuContainer.style.bottom = "";

    // Position the menu based on available space
    if (triggerRect.right + popupRect.width < windowWidth / 2) {
      this.menuContainer.style.left = `6px`;
      this.menuContainer.style.top = "8px";
    } if (triggerRect.left - popupRect.width > 0) {
      this.menuContainer.style.right = `8px`;
      this.menuContainer.style.top = "12px";
    } else if (triggerRect.bottom + popupRect.height < windowHeight) {
      this.menuContainer.style.top = `8px`;
      this.menuContainer.style.left = "0";
    } else if (triggerRect.top - popupRect.height > 0) {
      this.menuContainer.style.bottom = `${triggerRect.height + 8}px`;
      this.menuContainer.style.left = "0";
    } else {
      this.menuContainer.style.left = `8px`;
      this.menuContainer.style.top = "8px";
    }

    // Make the menu visible
    this.menuContainer.style.opacity = "1";
    this.menuContainer.style.visibility = "visible";
    this.templateContainer.appendChild(this.menuContainer);
  }

  async showSubMenu(type: string) {
    this.menuContainer.innerHTML = "";
    this.menuList = document.createElement("ul");
    this.menuList.classList.add("menu-list");
  
    this.createSubMenuHeader(type);
    const categoryData = await this.controller.actionList.getCategoryData();
  
    const items = await this.controller.getSubMenuItems(categoryData, type);
    
    if (items && items.length > 0) {
      // If we have items, display them
      items.forEach((item) => {
        const menuItem = this.createMenuItem(item);
        this.menuList.appendChild(menuItem);
      });
    } else {
      // If no items are available, show a message
      const noItemsMessage = document.createElement("li");
      noItemsMessage.classList.add("menu-item", "no-items");
      noItemsMessage.innerHTML = `No ${type.toLowerCase()} available`;
      this.menuList.appendChild(noItemsMessage);
    }
  
    this.menuContainer.appendChild(this.menuList);
    this.menuContainer.style.opacity = "1";
    this.menuContainer.style.visibility = "visible";
  }

  private createSubMenuHeader(type: string) {
    const menuHeader = document.createElement("div");
    menuHeader.classList.add("sub-menu-header");

    const backIcon = document.createElement("span");
    backIcon.classList.add("menu-back-icon");
    backIcon.style.width = "20px";
    backIcon.innerHTML = `<i class="fas fa-chevron-left"></i>`;
    backIcon.addEventListener("click", () => {
      this.menuContainer.innerHTML = "";
      this.init();
    });

    menuHeader.appendChild(backIcon);

    const searchContainer = document.createElement("div");
    searchContainer.className = "search-container";
    searchContainer.innerHTML = `
      <i class="fas fa-search search-icon"></i>
      <input type="text" placeholder="Search" class="search-input" />
    `;

    menuHeader.appendChild(searchContainer);
    this.menuContainer.appendChild(menuHeader);

    const searchInput = searchContainer.querySelector(
      ".search-input"
    ) as HTMLInputElement;
    searchInput?.addEventListener("input", (e) => {
      const searchTerm = (e.target as HTMLInputElement).value;
      this.filterMenuItems(searchTerm);
    });
  }

  private filterMenuItems(searchTerm: string) {
    const menuItems = Array.from(
      this.menuList.querySelectorAll(".menu-item")
    ) as HTMLElement[];
    const filteredItems = this.controller.filterMenuItems(
      menuItems,
      searchTerm
    );

    menuItems.forEach((item) => {
      item.style.display = filteredItems.includes(item) ? "flex" : "none";
    });
  }
}
