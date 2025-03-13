import { Category } from "../../../../interfaces/Category";

export class ActionDetails {
  details: HTMLDetailsElement;
  categoryData: Category;

  constructor(categoryData: Category) {
    this.categoryData = categoryData;
    this.details = document.createElement("details");
    this.init();
  }

  init() {
    this.details.className = "category";
    this.details.setAttribute("data-category", "Page");

    this.createCategoryElement();    
  }

  createCategoryElement() {
    const summary = document.createElement("summary");
    summary.innerText = `${this.categoryData.name}`;
    const icon = document.createElement("i");
    icon.className = "fa fa-angle-right";
    summary.appendChild(icon);

    const searchContainer = document.createElement("div");
    searchContainer.className = "search-container";
    searchContainer.innerHTML = `
            <i class="fas fa-search search-icon"></i>
            <input type="text" placeholder="Search" class="search-input" />
            <button title="Add New Service/Product Page" class="add-new-service">
            <i class="fa fa-plus"></i>
            </button>
        `;

    const list = document.createElement("ul");
    list.className = "category-content";

    this.categoryData.options.forEach((category) => {
      const li = document.createElement("li") as HTMLElement;
      li.innerText = category.PageName;
      li.setAttribute("data-category", category.PageName);
      list.appendChild(li);
    });

    const noItem = document.createElement("li");
    noItem.className = "no-records-message";
    noItem.style.display = "none";
    noItem.innerText = "No records found";

    list.appendChild(noItem);

    this.details.addEventListener("toggle", (e) => {
      // document.querySelectorAll("details").forEach((otherDetail) => {
      //   if (otherDetail) {
      //     otherDetail.open = false;
      //   }
      // });
      const icon = summary.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-angle-right");
        icon.classList.toggle("fa-angle-down");
      }
    });

    this.details.appendChild(summary);
    this.details.appendChild(searchContainer);
    this.details.appendChild(list); 
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

      const items: HTMLElement[] = Array.from(list.querySelectorAll("li:not(.no-records-message)"));
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
