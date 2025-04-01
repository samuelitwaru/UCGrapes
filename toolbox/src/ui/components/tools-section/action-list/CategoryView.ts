import { Category } from "../../../../interfaces/Category";
import { ActionPage } from "../../../../interfaces/ActionPage";
import { PageAttacher } from "./PageAttacher";
import { PageCreationService } from "./PageCreationService";
import { Alert } from "../../Alert";
import { AppConfig } from "../../../../AppConfig";
import { i18n } from "../../../../i18n/i18n";

export class CategoryView {
  details: HTMLDetailsElement;
  categoryData: Category;
  pageAttacher: PageAttacher;
  pageCreationService: PageCreationService;

  constructor(categoryData: Category) {
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
    const summary = document.createElement("summary");
    summary.innerText = `${this.categoryData.displayName}`;
    const icon = document.createElement("i");
    icon.className = "fa fa-angle-right";
    if (this.categoryData.name !== "Web Link") summary.appendChild(icon);

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
            const selectedComponent = (globalThis as any).selectedComponent;
            if (!selectedComponent) {
              new Alert("error", i18n.t("messages.error.select_tile"));
              return;
            }
            if (this.categoryData.name == "Content Page") {
              this.pageCreationService.addNewContentPage();
            }
            if (this.categoryData.name == "Service/Product Page") {
              // open popup
              const config = AppConfig.getInstance();
              console.log(config.addServiceButtonEvent)
              // config.addServiceButtonEvent()
            }
          });
        }
      }, 0);
    }

    const list = document.createElement("ul");
    list.className = "category-content";
    this.categoryData?.options?.forEach((page: ActionPage) => {
      const li = document.createElement("li") as HTMLElement;
      li.innerText = page.PageName;
      li.setAttribute("data-page-name", page.PageName);
      li.setAttribute("data-page-id", page.PageId);

      li.addEventListener("click", (e) => {
        e.preventDefault();
        const selectedComponent = (globalThis as any).selectedComponent;
        if (!selectedComponent) {
          new Alert("error", i18n.t("messages.error.select_tile"));
          return;
        }

        

        if (this.categoryData.name === "Dynamic Forms") {
          this.pageCreationService.handleDynamicForms(page);
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
      if (this.categoryData.name !== "Web Link") {
        const icon = summary.querySelector("i");
        if (icon) {
          icon.classList.toggle("fa-angle-right");
          icon.classList.toggle("fa-angle-down");
        }
      } else {
        const selectedComponent = (globalThis as any).selectedComponent;
        if (!selectedComponent) {
          new Alert("error", i18n.t("messages.error.select_tile"));
          return;
        }
        this.pageCreationService.handleWebLinks();
      }
    });

    if (this.categoryData.name === "Web Link") {
      this.details.appendChild(summary);
    } else {
      this.details.appendChild(summary);
      this.details.appendChild(searchContainer);
      this.details.appendChild(list);
    }

    this.searchItemsEvent(searchContainer);
  }

  searchItemsEvent(searchContainer: HTMLElement) {
    const searchInput = searchContainer.querySelector(
      "input"
    ) as HTMLInputElement;
    const list = this.details.querySelector("ul") as HTMLUListElement;

    searchInput.addEventListener("input", (e) => {
      const noRecordsMessage = list.querySelector(
        ".no-records-message"
      ) as HTMLElement;

      let hasVisibleItems = false;

      const value = (e.target as HTMLInputElement).value.toLowerCase().trim();

      const items: HTMLElement[] = Array.from(
        list.querySelectorAll("li:not(.no-records-message)")
      );
      items.forEach((item: HTMLElement) => {
        const text = item.textContent?.toLowerCase() ?? "";
        const isVisible: boolean = text.includes(value);
        item.style.display = isVisible ? "block" : "none";
        if (isVisible) hasVisibleItems = true;
      });

      if (noRecordsMessage) {
        noRecordsMessage.style.display = hasVisibleItems ? "none" : "block";
      }
    });
  }

  render(container: HTMLElement) {
    container.appendChild(this.details);
  }
}
