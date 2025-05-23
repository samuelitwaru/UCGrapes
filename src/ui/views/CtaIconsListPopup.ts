import Quill from "quill";
import { ActionListManager } from "../../controls/ActionListManager";
import { InfoSectionManager } from "../../controls/InfoSectionManager";
import { ImageUpload } from "../components/tools-section/tile-image/ImageUpload";
import { MenuItemManager } from "./MenuItemManager";
import { Modal } from "../components/Modal";
import { InfoSectionUI } from "./InfoSectionUI";
import { randomIdGenerator } from "../../utils/helpers";
import { ctaIcons } from "../../utils/cta-icons";
import { ContentMapper } from "../../controls/editor/ContentMapper";
import { CtaManager } from "../../controls/themes/CtaManager";
import { InfoType } from "../../types";

export class CtaIconsListPopup {
  private modalContainer: HTMLDivElement;
  private modalBackdrop: HTMLDivElement;
  private modalContent: HTMLDivElement;
  private searchContainer: HTMLDivElement;
  private iconsList: HTMLDivElement;
  private templateContainer: HTMLElement;
  private parentContainer: HTMLElement;

  constructor(templateContainer: HTMLElement, parentContainer: HTMLElement) {
    this.templateContainer = templateContainer;
    this.parentContainer = parentContainer;

    // Create modal elements
    this.modalContainer = document.createElement("div");
    this.modalBackdrop = document.createElement("div");
    this.modalContent = document.createElement("div");
    this.searchContainer = document.createElement("div");
    this.iconsList = document.createElement("div");

    this.init();
  }

  async init(): Promise<void> {
    // Set up modal container
    this.modalContainer.style.display = "none";
    this.modalContainer.style.position = "fixed";
    this.modalContainer.style.top = "0";
    this.modalContainer.style.left = "0";
    this.modalContainer.style.width = "100%";
    this.modalContainer.style.height = "100%";
    this.modalContainer.style.zIndex = "1000000";

    // Set up backdrop
    this.modalBackdrop.style.position = "absolute";
    this.modalBackdrop.style.top = "0";
    this.modalBackdrop.style.left = "0";
    this.modalBackdrop.style.width = "100%";
    this.modalBackdrop.style.height = "100%";
    this.modalBackdrop.style.backgroundColor = "rgba(0, 0, 0, 0.3)";

    // Add click event to close modal when clicking on backdrop
    this.modalBackdrop.addEventListener("click", () => {
      this.modalContainer.remove();
    });

    // Set up modal content
    this.modalContent.style.position = "absolute";
    this.modalContent.style.top = "30%";
    this.modalContent.style.left = "50%";
    this.modalContent.style.transform = "translateX(-50%)";
    this.modalContent.style.backgroundColor = "white";
    this.modalContent.style.padding = "15px";
    this.modalContent.style.borderRadius = "8px";
    this.modalContent.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.2)";
    this.modalContent.style.width = "350px";

    // Set up search container
    this.searchContainer.style.marginBottom = "15px";
    this.searchContainer.style.marginTop = "15px";

    // Add search input
    const searchInputWrapper = document.createElement("div");
    searchInputWrapper.style.position = "relative";

    const searchIcon = document.createElement("i");
    searchIcon.className = "fas fa-search";
    searchIcon.style.position = "absolute";
    searchIcon.style.left = "10px";
    searchIcon.style.top = "50%";
    searchIcon.style.transform = "translateY(-50%)";
    searchIcon.style.color = "#888";

    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Search";
    searchInput.style.width = "100%";
    searchInput.style.padding = "8px 12px 8px 32px";
    searchInput.style.border = "1px solid #ccc";
    searchInput.style.borderRadius = "20px";
    searchInput.style.fontSize = "14px";
    searchInput.style.boxSizing = "border-box";

    const closeButton = document.createElement("span");
    closeButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 21 21">
                <path id="Icon_material-close" data-name="Icon material-close" d="M28.5,9.615,26.385,7.5,18,15.885,9.615,7.5,7.5,9.615,15.885,18,7.5,26.385,9.615,28.5,18,20.115,26.385,28.5,28.5,26.385,20.115,18Z" transform="translate(-7.5 -7.5)" fill="#BCBCBC" opacity="0.44"></path>
            </svg>
    `;

    closeButton.style.position = "absolute";
    closeButton.style.right = "5px";
    closeButton.style.top = "6px";
    closeButton.style.cursor = "pointer";
    closeButton.style.color = "#bcbcbc";
    closeButton.addEventListener("click", () => {
      this.modalContainer.remove();
    });

    searchInputWrapper.appendChild(searchIcon);
    searchInputWrapper.appendChild(searchInput);
    this.searchContainer.appendChild(searchInputWrapper);
    this.searchContainer.appendChild(closeButton);

    // Set up icons list
    this.iconsList.classList.add("cta-icons-list");
    console.log("cta icons", ctaIcons);
    // Add icons to the list
    ctaIcons?.forEach((item) => {
      const iconItem = document.createElement("div");
      iconItem.classList.add("cta-icon-item");
      iconItem.title = item.name;
      iconItem.innerHTML = item.svg;

      // Add click event to select icon
      iconItem.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.changeIcon(item);
        this.modalContainer.remove();
      });

      this.iconsList.appendChild(iconItem);
    });

    // Assemble modal structure
    this.modalContent.appendChild(this.searchContainer);
    this.modalContent.appendChild(this.iconsList);
    this.modalContainer.appendChild(this.modalBackdrop);
    this.modalContainer.appendChild(this.modalContent);
  }

  render() {
    // Display the modal
    this.parentContainer.appendChild(this.modalContainer);
    this.modalContainer.style.display = "block";

    // Focus search input
    const searchInput = this.searchContainer.querySelector("input");
    if (searchInput) {
      searchInput.focus();
    }

    // Add search functionality
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
        const iconItems = this.iconsList.querySelectorAll("div");

        iconItems.forEach((item) => {
          const iconTitle = item.title.toLowerCase();
          if (iconTitle.includes(searchTerm)) {
            item.style.display = "flex";
          } else {
            item.style.display = "none";
          }
        });
      });
    }
  }

  private changeIcon(item: any) {
    const selectedComponent = (globalThis as any).selectedComponent;
    const pageData = (globalThis as any).pageData;
    let ctaAttributes: any | null = null;
    let ctaId!: string;
    if (selectedComponent && pageData) {
      if (pageData.PageType === "Information") {
        const tileInfoSectionAttributes: InfoType = (
          globalThis as any
        ).infoContentMapper.getInfoContent(selectedComponent.getId());
        if (tileInfoSectionAttributes) {
          ctaId = tileInfoSectionAttributes.InfoId;
          ctaAttributes = tileInfoSectionAttributes?.CtaAttributes;
        }
      } else {
        const pageId = (globalThis as any).pageId;
        const contentMapper = new ContentMapper(pageData?.PageId);
        ctaAttributes = contentMapper.getContentCta(selectedComponent.getId());
        ctaId = selectedComponent.getId();
      }
      new CtaManager().changeCtaButtonIcon(item, ctaId, ctaAttributes);
    }
  }
}
