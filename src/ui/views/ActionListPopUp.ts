import { ActionListManager } from "../../controls/ActionListManager";
import { MenuItemManager } from "./MenuItemManager";

export class ActionListPopUp {
  private controller: ActionListManager;
  private menuContainer: HTMLDivElement;
  private templateContainer: HTMLElement;
  private menuList: HTMLUListElement;
  private parentContainer: HTMLElement;
  private menuItemManager: MenuItemManager;

  constructor(templateContainer: HTMLElement, parentContainer: HTMLElement) {
    this.controller = new ActionListManager();
    this.templateContainer = templateContainer;
    this.parentContainer = parentContainer;
    this.menuContainer = document.createElement("div");
    this.menuList = document.createElement("ul");
    this.menuItemManager = new MenuItemManager(
      this.menuContainer,
      this.controller
    );

    this.init();
  }

  async init(): Promise<void> {
    this.menuContainer.classList.add("menu-container");
    this.menuList.innerHTML = "";

    const menuCategories = await this.controller.getMenuCategories();
    menuCategories?.forEach((category) => {
      const menuCategory = document.createElement("div");
      menuCategory.classList.add("menu-category");

      // category.sort((a, b) => a.label.localeCompare(b.label));

      category.forEach((item) => {
        const menuItem = this.menuItemManager.createMenuItem(item, () => {
          this.menuContainer.remove();
        });
        menuCategory.appendChild(menuItem);
      });

      this.menuContainer.appendChild(menuCategory);
    });
  }

  render(triggerRect?: DOMRect, iframeRect?: DOMRect) {
    if (!triggerRect) {
      const trigger = this.templateContainer.querySelector(
        ".tile-open-menu"
      ) as HTMLElement;
      if (!trigger) return;

      triggerRect = trigger.getBoundingClientRect();
    }

    this.displayMenu(triggerRect, iframeRect);
  }

  private displayMenu(triggerRect: DOMRect, iframeRect?: DOMRect) {
    const parentRect = this.parentContainer.getBoundingClientRect();

    if (!iframeRect) {
      return;
    }

    this.menuContainer.style.position = "absolute";
    this.menuContainer.style.left = "-9999px";
    this.menuContainer.style.top = "-9999px";
    this.menuContainer.style.opacity = "0";
    this.menuContainer.style.visibility = "visible";
    this.parentContainer.appendChild(this.menuContainer);

    void this.menuContainer.offsetHeight;

    const popupRect = this.menuContainer.getBoundingClientRect();

    const relTriggerLeft = iframeRect.left - parentRect.left + triggerRect.left;
    const relTriggerTop = iframeRect.top - parentRect.top + triggerRect.top;
    const relTriggerRight = relTriggerLeft + triggerRect.width;
    const relTriggerBottom = relTriggerTop + triggerRect.height;

    const containerWidth = parentRect.width;
    const containerHeight = parentRect.height;

    this.menuContainer.style.left = "";
    this.menuContainer.style.top = "";
    this.menuContainer.style.right = "";
    this.menuContainer.style.bottom = "";

    const spaceBelow = containerHeight - relTriggerBottom;
    const spaceAbove = relTriggerTop;

    const effectiveMenuHeight = popupRect.height > 0 ? popupRect.height : 200;

    // if (spaceBelow >= effectiveMenuHeight + 10) {
    //   console.log()
    //   this.menuContainer.style.top = `${relTriggerBottom - 10}px`;
    // } else
    if (spaceAbove >= effectiveMenuHeight + 10) {
      this.menuContainer.style.top = `${relTriggerTop - effectiveMenuHeight - 0
        }px`;
    } else {
      this.menuContainer.style.top = "10px";
      if (effectiveMenuHeight > containerHeight - 20) {
        this.menuContainer.style.maxHeight = `${containerHeight - 20}px`;
        this.menuContainer.style.overflowY = "auto";
      }
    }

    if (relTriggerLeft + popupRect.width <= containerWidth - 10) {
      this.menuContainer.style.left = `${relTriggerLeft + 16}px`;
    } else {
      const rightAlignedPos = containerWidth - popupRect.width - 10;
      this.menuContainer.style.left = `${Math.max(10, rightAlignedPos + 16)}px`;
    }

    this.menuContainer.style.visibility = "visible";
    this.menuContainer.style.opacity = "1";
  }
}
