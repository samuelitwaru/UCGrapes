import Quill from "quill";
import { ActionListManager } from "../../controls/ActionListManager";
import { InfoSectionManager } from "../../controls/InfoSectionManager";
import { ImageUpload } from "../components/tools-section/tile-image/ImageUpload";
import { MenuItemManager } from "./MenuItemManager";
import { Modal } from "../components/Modal";
import { InfoSectionUI } from "./InfoSectionUI";
import { randomIdGenerator } from "../../utils/helpers";
import { PageCreationService } from "../components/tools-section/action-list/PageCreationService";
import { i18n } from "../../i18n/i18n";

export class InfoSectionPopup {
  private controller: InfoSectionManager;
  private menuContainer: HTMLDivElement;
  private templateContainer: HTMLElement;
  private menuList: HTMLUListElement;
  private submenuContainer: HTMLDivElement;
  private parentContainer: HTMLElement;
  private infoSectionUi: InfoSectionUI;
  private sectionId: string;
  pageCreationService!: PageCreationService;

  constructor(
    templateContainer: HTMLElement,
    parentContainer: HTMLElement,
    sectionId: string
  ) {
    this.templateContainer = templateContainer;
    this.parentContainer = parentContainer;
    this.menuContainer = document.createElement("div");
    this.controller = new InfoSectionManager();
    this.menuList = document.createElement("ul");
    this.submenuContainer = document.createElement("div");
    this.infoSectionUi = new InfoSectionUI();
    this.sectionId = sectionId;

    this.init();
  }

  async init(): Promise<void> {
    this.menuContainer.classList.add("menu-container");
    this.menuContainer.classList.add("info-section-popup");
    this.menuList.innerHTML = "";

    const sectionItems = [
      {
        name: "Cta",
        label: i18n.t("sidebar.action_list.call_to_action"),
        expandable: true,
      },
      {
        name: "Tile",
        label: "Tile",
        handler: (sectionId: string | undefined) => this.addTile(sectionId),
      },
      {
        name: "Image",
        label: "Image",
        handler: (sectionId?: string) => this.addImage(sectionId),
      },
      {
        name: "Description",
        label: "Description",
        handler: (sectionId?: string) => this.addDescription(sectionId),
      },
    ];

    sectionItems.sort((a, b) => a.label.localeCompare(b.label));
    sectionItems?.forEach((item) => {
      const menuCategory = document.createElement("div");
      menuCategory.classList.add("menu-category");

      const menuItem = this.controller.createMenuItem(item, () => {
        this.menuContainer.remove();
      });
      menuCategory.appendChild(menuItem);
      if (item?.expandable) {
        const arrowIcon = document.createElement("span");
        arrowIcon.classList.add("fa", "fa-chevron-right");
        arrowIcon.style.fontSize = "10px";
        arrowIcon.style.color = "#6c757d";
        menuItem.appendChild(arrowIcon);

        // Create submenu for expandable items
        menuItem.addEventListener("mouseenter", async () => {
          // Remove any existing submenu
          const existingSubmenu = document.querySelector(
            ".info-section-popup .menu-list"
          );
          if (existingSubmenu) {
            existingSubmenu.remove();
          }
          menuItem.classList.add("expandable");

          // Create submenu
          this.submenuContainer.innerHTML = "";
          this.submenuContainer.className = "menu-list";
          this.submenuContainer.style.position = "absolute";
          this.submenuContainer.style.left = "100%";
          this.submenuContainer.style.top = `${menuItem.offsetTop + 10}px`;
          this.submenuContainer.style.backgroundColor = "white";
          this.submenuContainer.style.boxShadow =
            "0 2px 6px rgba(0, 0, 0, 0.2)";
          this.submenuContainer.style.borderRadius = "9px";
          this.submenuContainer.style.width = "100px";
          this.submenuContainer.style.minHeight = "fit-content";
          this.submenuContainer.style.zIndex = "1001";

          // Get submenu items
          const subMenuItems = await this.getSubMenuItems({}, "Cta");

          // Create submenu items
          subMenuItems.forEach((subItem) => {
            const subMenuItem = document.createElement("div");
            subMenuItem.classList.add("menu-item", "sub-menu-item");
            subMenuItem.textContent = subItem.label;

            subMenuItem.addEventListener("click", (e) => {
              e.stopPropagation();
              subItem.action();
              this.menuContainer.remove();
            });

            this.submenuContainer.appendChild(subMenuItem);
          });

          this.menuContainer.appendChild(this.submenuContainer);
        });
      } else {
        // For non-expandable items, just perform the action on click
        menuItem.addEventListener("click", () => {
          if (item.handler) {
            item.handler(this.sectionId);
          }
          this.menuContainer.remove();
        });

        menuItem.addEventListener("mouseenter", () => {
          this.submenuContainer.remove();
          this.menuContainer.querySelectorAll(".expandable").forEach((el) => {
            el.classList.remove("expandable");
          });
        });
      }

      this.menuContainer.appendChild(menuCategory);
    });
  }

  render(triggerRect?: DOMRect, iframeRect?: DOMRect) {
    if (!triggerRect) {
      const trigger = this.templateContainer.querySelector(
        ".tb-add-new-info-section, .add-new-info-section"
      ) as HTMLElement;
      if (!trigger) return;

      triggerRect = trigger.getBoundingClientRect();
    }

    this.displayMenu(triggerRect, iframeRect);
  }

  addTile(sectionId?: string) {
    const tile = this.infoSectionUi.infoTileUi();
    this.controller.addTile(tile, sectionId);
  }

  addImage(sectionId?: string) {
    // this.controller.addImage();
    this.infoSectionUi.openImageUpload(sectionId);
  }

  addDescription(sectionId?: string) {
    // const content: string = `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,...</p>`;
    this.controller.openContentEditModal(sectionId);
    // this.infoSectionUi.openContentEditModal();
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

    const relTriggerLeft = 0.28 * iframeRect.width;
    const relTriggerTop =
      iframeRect.top - parentRect.top + triggerRect.top - 15;
    const relTriggerRight = relTriggerLeft + triggerRect.width;
    const relTriggerBottom = relTriggerTop + triggerRect.height;

    const containerWidth = parentRect.width;
    const containerHeight = parentRect.height;

    this.menuContainer.style.left = "";
    this.menuContainer.style.top = "";
    this.menuContainer.style.right = "";
    this.menuContainer.style.bottom = "";
    this.menuContainer.style.width = "120px";

    const spaceBelow = containerHeight - relTriggerBottom;
    const spaceAbove = relTriggerTop;

    const effectiveMenuHeight = popupRect.height > 0 ? popupRect.height : 200;

    // First priority: show at the bottom if there's enough space
    if (spaceBelow >= effectiveMenuHeight + 10) {
      this.menuContainer.style.top = `${relTriggerBottom + 20}px`;
    }
    // Second priority: show at the top if there's enough space
    else if (spaceAbove >= effectiveMenuHeight + 10) {
      this.menuContainer.style.top = `${relTriggerTop - effectiveMenuHeight - 0
        }px`;
    }
    // Last resort: show at the top with scroll if needed
    else {
      this.menuContainer.style.top = "10px";
      if (effectiveMenuHeight > containerHeight - 20) {
        this.menuContainer.style.maxHeight = `${containerHeight - 20}px`;
        this.menuContainer.style.overflowY = "auto";
      }
    }

    this.menuContainer.style.left = `calc(50% - ${this.menuContainer.clientWidth / 2
      }px)`;

    this.menuContainer.style.visibility = "visible";
    this.menuContainer.style.opacity = "1";
  }

  async getSubMenuItems(categoryData: any, type: any) {
    const itemsList = [
      {
        id: "add-address",
        label: "Address",
        type: "Map",
        name: "",
        handler: (service: any) => service.handleWebLinks(),
      },
      {
        id: "add-email",
        label: "Email",
        type: "Email",
        name: "",
        handler: (service: any) => service.handleEmail(),
      },
      {
        id: "add-form",
        label: "Form",
        type: "Form",
        name: "",
        handler: (service: any) => service.handleForm(),
      },
      {
        id: "add-phone",
        label: "Phone",
        type: "Phone",
        name: "",
        handler: (service: any) => service.handlePhone(),
      },
      {
        id: "add-web-link",
        label: "Web link",
        type: "WebLink",
        name: "",
        handler: (service: any) => service.handleWebLinks(),
      },
    ];

    return itemsList.map((item: any) => {
      return {
        id: item.id,
        name: item.name,
        label: item.label,
        type: item.type,
        action: () => {
          const service = new PageCreationService(
            true,
            item.type,
            this.sectionId
          );
          item.handler(service);
        },
      };
    });
  }
}
