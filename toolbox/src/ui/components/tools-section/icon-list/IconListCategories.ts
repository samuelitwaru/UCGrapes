import { ThemeManager } from "../../../../controls/themes/ThemeManager";
import { ThemeIcon } from "../../../../models/Theme";
import { IconList } from "./IconList";
import { i18n } from "../../../../i18n/i18n";

export class IconListCategories {
  container: HTMLElement;
  selectionDiv: HTMLElement;
  categoryOptions: HTMLElement;
  selectedCategory: HTMLSpanElement;
  private themeManager: ThemeManager;
  // icons: string[];

  constructor() {
    this.container = document.createElement("div") as HTMLElement;
    this.selectionDiv = document.createElement("div") as HTMLElement;
    this.categoryOptions = document.createElement("div") as HTMLElement;
    this.selectedCategory = document.createElement("span") as HTMLElement;
    this.themeManager = new ThemeManager();
    this.init();

    document.addEventListener("click", this.handleOutsideClick.bind(this));
  }

  init() {
    this.container.className = "sidebar-section services-section";
    this.container.id = "dropdownMenu";

    this.selectionDiv.className = "tb-custom-category-selection";

    const openSelection = document.createElement("button");
    openSelection.className = "category-select-button";
    openSelection.setAttribute("aria-haspopup", "listbox");
    openSelection.setAttribute("aria-expanded", "false");

    this.selectedCategory.className = "selected-category-value";
    this.selectedCategory.textContent = i18n.t("icon_category_general");
    openSelection.appendChild(this.selectedCategory);

    openSelection.onclick = (e) => {
      e.preventDefault();
      const isOpen: boolean = openSelection.classList.contains("open");
      if (isOpen) {
        this.closeSelection();
        return;
      }

      this.categoryOptions.classList.toggle("show");
      openSelection.classList.toggle("open");
      openSelection.setAttribute("aria-expanded", "true");
    };

    this.selectionDiv.appendChild(openSelection);
    this.container.appendChild(this.selectionDiv);

    this.initializeCategoryOptions();
    this.loadThemeIcons();
  }

  initializeCategoryOptions() {
    this.categoryOptions.className = "category-options-list";
    this.categoryOptions.setAttribute("role", "listbox");

    let categories: string[] = [i18n.t("icon_category_general"), i18n.t("icon_category_services"), i18n.t("icon_category_health"), i18n.t("icon_category_living")];

    categories.forEach((category) => {
      const categoryOption = document.createElement("div") as HTMLElement;
      categoryOption.className = "category-option";
      categoryOption.role = "option";
      categoryOption.setAttribute("data-value", category);
      categoryOption.textContent = category;

      categoryOption.onclick = () => {
        const allOptions =
          this.categoryOptions.querySelectorAll(".category-option");
        allOptions.forEach((opt) => opt.classList.remove("selected"));
        categoryOption.classList.add("selected");

        this.selectedCategory.textContent = category;

        this.loadThemeIcons(category);
        this.closeSelection();
      };

      this.categoryOptions.appendChild(categoryOption);
    });
    this.selectionDiv.appendChild(this.categoryOptions);
  }

  closeSelection() {
    const isOpen: boolean = this.categoryOptions.classList.contains("show");
    if (isOpen) {
      this.categoryOptions.classList.remove("show");

      const button = this.container.querySelector(
        ".category-select-button"
      ) as HTMLElement;
      button.setAttribute("aria-expanded", "false");
      button.classList.toggle("open");
    }
  }

  loadThemeIcons(iconsCategory = "General") {
    document.querySelectorAll("#icons-list").forEach((el) => el.remove());
    const iconsList = document.createElement("div") as HTMLElement;
    iconsList.classList.add("icons-list");
    iconsList.id = "icons-list";

    const themeIcons = new IconList(this.themeManager, iconsCategory);
    themeIcons.render(iconsList);

    this.container.appendChild(iconsList);
  }

  private handleOutsideClick(event: MouseEvent) {
    if (
      this.categoryOptions.classList.contains("show") &&
      !this.container.contains(event.target as Node)
    ) {
      this.closeSelection();
    }
  }

  render(container: HTMLElement) {
    container.appendChild(this.container);
  }
}
