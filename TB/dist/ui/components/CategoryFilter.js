var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BookService } from '../../services/BookService';
export class CategoryFilter {
    constructor(containerId) {
        this.categories = [];
        this.selectedCategoryId = '';
        this.filterChangeListeners = [];
        this.element = document.getElementById(containerId);
        if (!this.element) {
            throw new Error(`Element with id '${containerId}' not found`);
        }
        this.bookService = new BookService();
        this.loadCategories();
    }
    loadCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.categories = yield this.bookService.getCategories();
                this.render();
            }
            catch (error) {
                console.error('Error loading categories:', error);
                this.element.innerHTML = '<div class="error">Error loading categories</div>';
            }
        });
    }
    render() {
        this.element.innerHTML = `
      <div class="category-filter">
        <h3>Filter by Category</h3>
        <div class="category-list">
          <button class="category-btn ${!this.selectedCategoryId ? 'active' : ''}" data-id="">All</button>
          ${this.categories.map(category => `
            <button class="category-btn ${this.selectedCategoryId === category.id ? 'active' : ''}" 
                    data-id="${category.id}">
              ${category.name}
            </button>
          `).join('')}
        </div>
      </div>
    `;
        // Add event listeners
        const categoryButtons = this.element.querySelectorAll('.category-btn');
        categoryButtons.forEach(button => {
            button.addEventListener('click', this.handleCategoryClick.bind(this));
        });
    }
    handleCategoryClick(event) {
        const button = event.currentTarget;
        const categoryId = button.getAttribute('data-id') || '';
        if (this.selectedCategoryId !== categoryId) {
            this.selectedCategoryId = categoryId;
            this.render();
            // Notify listeners
            this.notifyFilterChanged();
        }
    }
    notifyFilterChanged() {
        this.filterChangeListeners.forEach(listener => {
            listener(this.selectedCategoryId);
        });
    }
    addFilterChangeListener(listener) {
        this.filterChangeListeners.push(listener);
    }
    removeFilterChangeListener(listener) {
        const index = this.filterChangeListeners.indexOf(listener);
        if (index > -1) {
            this.filterChangeListeners.splice(index, 1);
        }
    }
}
//# sourceMappingURL=CategoryFilter.js.map