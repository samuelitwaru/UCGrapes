import Quill from "quill";
import { ActionListController } from "../../controls/ActionListController";
import { InfoSectionController } from "../../controls/InfoSectionController";
import { ImageUpload } from "../components/tools-section/tile-image/ImageUpload";
import { MenuItemManager } from "./MenuItemManager";
import { Modal } from "../components/Modal";
import { InfoSectionUI } from "./InfoSectionUI";
import { randomIdGenerator } from "../../utils/helpers";

export class InfoSectionPopup {
  private controller: InfoSectionController;
  private menuContainer: HTMLDivElement;
  private templateContainer: HTMLElement;
  private menuList: HTMLUListElement;
  private parentContainer: HTMLElement;
  private infoSectionUi: InfoSectionUI;

  constructor(templateContainer: HTMLElement, parentContainer: HTMLElement) {
    this.templateContainer = templateContainer;
    this.parentContainer = parentContainer;
    this.menuContainer = document.createElement("div");
    this.controller = new InfoSectionController();
    this.menuList = document.createElement("ul");
    this.infoSectionUi = new InfoSectionUI();

    this.init();
  }

  async init(): Promise<void> {
    this.menuContainer.classList.add("menu-container");
    this.menuContainer.classList.add("info-section-popup");
    this.menuList.innerHTML = "";

    const sectionItems = [
      {
        name: "Image",
        label: "Image",
        action: () => {
          this.addImage();
        },
      },
      {
        name: "Description",
        label: "Description",
        action: () => {
          this.addDescription();
        },
      },
      {
        name: "Cta",
        label: "Call to Action",
        action: () => {
          this.addButton();
        },
      },
      {
        name: "Tile",
        label: "Tile",
        action: () => {
          this.addTile();
        },
      },
      {
        name: "WebLink",
        label: "Web Link",
        action: () => {
          // this.addButton();
        },
      },
    ];

    sectionItems?.forEach((item) => {
      const menuCategory = document.createElement("div");
      menuCategory.classList.add("menu-category");

      const menuItem = this.controller.createMenuItem(item, () => {
        this.menuContainer.remove();
      });
      menuCategory.appendChild(menuItem);
      this.menuContainer.appendChild(menuCategory);
    });
  }

  render(triggerRect?: DOMRect, iframeRect?: DOMRect) {
    if (!triggerRect) {
      const trigger = this.templateContainer.querySelector(
        ".add-new-info-section"
      ) as HTMLElement;
      if (!trigger) return;

      triggerRect = trigger.getBoundingClientRect();
    }

    this.displayMenu(triggerRect, iframeRect);
  }

  addButton() {
    const cta = {
        "CtaId": randomIdGenerator(15),
        "CtaType": "Phone",
        "CtaLabel": "CALL US",
        "CtaAction": "+256773034311",
        "CtaColor": "",
        "CtaBGColor": "",
        "CtaButtonType": "Image",
        "CtaButtonImgUrl": "/Resources/UCGrapes1/src/images/image.png"
    }
    const button = this.infoSectionUi.addCtaButton(cta);
    this.controller.addCtaButton(button);
  }

  addTile() {
    const tile = this.infoSectionUi.infoTileUi();
    this.controller.addTile(tile);
  }

  addImage() {
    // this.infoSectionUi.openImageUpload();
    this.controller.addImage();
  }

  addDescription () {
    const content: string = `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,...</p>`
    this.controller.addDescription(content);
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
    this.menuContainer.style.width = "max-content";

    const spaceBelow = containerHeight - relTriggerBottom;
    const spaceAbove = relTriggerTop;

    const effectiveMenuHeight = popupRect.height > 0 ? popupRect.height : 200;

    // if (spaceBelow >= effectiveMenuHeight + 10) {
    //   console.log()
    //   this.menuContainer.style.top = `${relTriggerBottom - 10}px`;
    // } else
    if (spaceAbove >= effectiveMenuHeight + 10) {
      this.menuContainer.style.top = `${
        relTriggerTop - effectiveMenuHeight - 0
      }px`;
    } else {
      this.menuContainer.style.top = "10px";
      if (effectiveMenuHeight > containerHeight - 20) {
        this.menuContainer.style.maxHeight = `${containerHeight - 20}px`;
        this.menuContainer.style.overflowY = "auto";
      }
    }

    this.menuContainer.style.left = `calc(50% - ${this.menuContainer.clientWidth / 2}px)`;

    this.menuContainer.style.visibility = "visible";
    this.menuContainer.style.opacity = "1";
  }
}
