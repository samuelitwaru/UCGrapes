import { ThemeManager } from "../../../../controls/themes/ThemeManager";
import { IconList } from "./IconList";
import { i18n } from "../../../../i18n/i18n";
export class IconListCategories {
    // icons: string[];
    constructor(categoryTitle = "General") {
        this.categoryTitle = categoryTitle;
        this.container = document.createElement("div");
        this.selectionDiv = document.createElement("div");
        this.categoryOptions = document.createElement("div");
        this.selectedCategory = document.createElement("span");
        this.themeManager = new ThemeManager();
        this.init();
        document.addEventListener("click", this.handleOutsideClick.bind(this));
    }
    init() {
        this.container.className = "sidebar-section services-section";
        this.container.id = "icon-categories-list";
        this.selectionDiv.className = "tb-custom-category-selection";
        const openSelection = document.createElement("button");
        openSelection.className = "category-select-button";
        openSelection.setAttribute("aria-haspopup", "listbox");
        openSelection.setAttribute("aria-expanded", "false");
        this.selectedCategory.className = "selected-category-value";
        this.selectedCategory.textContent = i18n.t("sidebar.icon_category.general");
        openSelection.appendChild(this.selectedCategory);
        openSelection.onclick = (e) => {
            e.preventDefault();
            const isOpen = openSelection.classList.contains("open");
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
        this.loadThemeIcons(this.categoryTitle);
    }
    initializeCategoryOptions() {
        this.categoryOptions.className = "category-options-list";
        this.categoryOptions.setAttribute("role", "listbox");
        let categories = [
            {
                name: "General",
                label: i18n.t("sidebar.icon_category.general"),
            },
            {
                name: "Services",
                label: i18n.t("sidebar.icon_category.services"),
            },
            {
                name: "Health",
                label: i18n.t("sidebar.icon_category.health"),
            },
            {
                name: "Living",
                label: i18n.t("sidebar.icon_category.living"),
            },
        ];
        categories.forEach((category) => {
            const categoryOption = document.createElement("div");
            categoryOption.className = "category-option";
            categoryOption.role = "option";
            categoryOption.setAttribute("data-value", category.name);
            categoryOption.textContent = category.label;
            categoryOption.onclick = () => {
                const allOptions = this.categoryOptions.querySelectorAll(".category-option");
                allOptions.forEach((opt) => opt.classList.remove("selected"));
                categoryOption.classList.add("selected");
                this.selectedCategory.textContent = category.label;
                this.loadThemeIcons(category.name);
                this.closeSelection();
            };
            this.categoryOptions.appendChild(categoryOption);
        });
        this.selectionDiv.appendChild(this.categoryOptions);
    }
    closeSelection() {
        const isOpen = this.categoryOptions.classList.contains("show");
        if (isOpen) {
            this.categoryOptions.classList.remove("show");
            const button = this.container.querySelector(".category-select-button");
            button.setAttribute("aria-expanded", "false");
            button.classList.toggle("open");
        }
    }
    loadThemeIcons(iconsCategory) {
        document.querySelectorAll("#icons-list").forEach((el) => el.remove());
        const iconsList = document.createElement("div");
        iconsList.classList.add("icons-list");
        iconsList.id = "icons-list";
        const themeIcons = new IconList(this.themeManager, iconsCategory || this.categoryTitle);
        themeIcons.render(iconsList);
        this.container.appendChild(iconsList);
    }
    handleOutsideClick(event) {
        if (this.categoryOptions.classList.contains("show") &&
            !this.container.contains(event.target)) {
            this.closeSelection();
        }
    }
    render(container) {
        const existingCategory = container.querySelector("#icon-categories-list");
        if (existingCategory) {
            existingCategory.replaceWith(this.container);
            return;
        }
        container.appendChild(this.container);
    }
}
//# sourceMappingURL=IconListCategories.js.map