export class IconListCategories {
    container: HTMLElement;
    selectionDiv: HTMLElement;
    categoryOptions: HTMLElement;
    selectedCategory: HTMLSpanElement;
    // icons: string[];

    constructor() {
        this.container = document.createElement('div');
        this.selectionDiv = document.createElement('div');
        this.categoryOptions = document.createElement('div');
        this.selectedCategory = document.createElement('span');
        this.init();
    }

    init() {
        this.container.className = "sidebar-section services-section";
        this.container.id = "dropdownMenu";

        this.selectionDiv.className = "tb-custom-category-selection";

        const openSelection = document.createElement('button');
        openSelection.className = "category-select-button";
        openSelection.setAttribute('aria-haspopup', 'listbox')
        openSelection.setAttribute('aria-expanded', 'false');

        this.selectedCategory.className = "selected-category-value";
        this.selectedCategory.textContent = "General";
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
            openSelection.setAttribute("aria-expanded", 'true');
        }

        this.selectionDiv.appendChild(openSelection);
        this.container.appendChild(this.selectionDiv);

        this.initializeCategoryOptions();
    }

    initializeCategoryOptions() {
        this.categoryOptions.className = "category-options-list";
        this.categoryOptions.setAttribute("role", "listbox");

        let categories: string [] = ['General', 'Services', 'Health', 'Living'];

        categories.forEach((category) => {
            const categoryOption = document.createElement('div') as HTMLElement;
            categoryOption.className = "category-option";
            categoryOption.role = "option";
            categoryOption.setAttribute('data-value', category);
            categoryOption.textContent = category;

            categoryOption.onclick = () => {
                const allOptions = this.categoryOptions.querySelectorAll(".category-option");
                allOptions.forEach((opt) => opt.classList.remove("selected"));
                categoryOption.classList.add("selected");
                
                this.selectedCategory.textContent = category;

                this.closeSelection();
            }

            this.categoryOptions.appendChild(categoryOption);
        })
        this.selectionDiv.appendChild(this.categoryOptions);
    }

    closeSelection() {
        const isOpen: boolean = this.categoryOptions.classList.contains("show");
        if (isOpen) {
            this.categoryOptions.classList.remove("show");

            const button = this.container.querySelector(".category-select-button") as HTMLElement;
            button.setAttribute("aria-expanded", 'false');
            button.classList.toggle("open");
        }
    }

    render(container: HTMLElement) {
        container.appendChild(this.container);
    }
}