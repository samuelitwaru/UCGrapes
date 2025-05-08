var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ActionListController } from "../../controls/ActionListController";
import { MenuItemManager } from "./MenuItemManager";
export class ActionListPopUp {
    constructor(templateContainer, parentContainer) {
        this.controller = new ActionListController();
        this.templateContainer = templateContainer;
        this.parentContainer = parentContainer;
        this.menuContainer = document.createElement("div");
        this.menuList = document.createElement("ul");
        this.menuItemManager = new MenuItemManager(this.menuContainer, this.controller);
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.menuContainer.classList.add("menu-container");
            this.menuList.innerHTML = "";
            const menuCategories = yield this.controller.getMenuCategories();
            console.log("Menu Categories:", menuCategories);
            menuCategories === null || menuCategories === void 0 ? void 0 : menuCategories.forEach((category) => {
                const menuCategory = document.createElement("div");
                menuCategory.classList.add("menu-category");
                category.forEach((item) => {
                    const menuItem = this.menuItemManager.createMenuItem(item, () => {
                        this.menuContainer.remove();
                    });
                    menuCategory.appendChild(menuItem);
                });
                this.menuContainer.appendChild(menuCategory);
            });
        });
    }
    render(triggerRect, iframeRect) {
        if (!triggerRect) {
            const trigger = this.templateContainer.querySelector(".tile-open-menu");
            if (!trigger)
                return;
            triggerRect = trigger.getBoundingClientRect();
        }
        this.displayMenu(triggerRect, iframeRect);
    }
    displayMenu(triggerRect, iframeRect) {
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
            this.menuContainer.style.top = `${relTriggerTop - effectiveMenuHeight - 0}px`;
        }
        else {
            this.menuContainer.style.top = "10px";
            if (effectiveMenuHeight > containerHeight - 20) {
                this.menuContainer.style.maxHeight = `${containerHeight - 20}px`;
                this.menuContainer.style.overflowY = "auto";
            }
        }
        if (relTriggerLeft + popupRect.width <= containerWidth - 10) {
            this.menuContainer.style.left = `${relTriggerLeft + 16}px`;
        }
        else {
            const rightAlignedPos = containerWidth - popupRect.width - 10;
            this.menuContainer.style.left = `${Math.max(10, rightAlignedPos + 16)}px`;
        }
        this.menuContainer.style.visibility = "visible";
        this.menuContainer.style.opacity = "1";
    }
}
//# sourceMappingURL=ActionListPopUp.js.map