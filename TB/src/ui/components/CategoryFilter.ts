import { Category } from '../../models/Category';
import { BookService } from '../../services/BookService';

export class CategoryFilter {
  private element: HTMLElement;
  private categories: Category[] = [];
  private selectedCategoryId: string = '';
  private bookService: BookService;
  private filterChangeListeners: Array<(categoryId: string) => void> = [];

  constructor(containerId: string) {
    this.element = document.getElementById(containerId) as HTMLElement;
    if (!this.element) {
      throw new Error(`Element with id '${containerId}' not found`);
    }
    
    this.bookService = new BookService();
    this.loadCategories();
  }

  private async loadCategories(): Promise<void> {
    try {
      this.categories = await this.bookService.getCategories();
      this.render();
    } catch (error) {
      console.error('Error loading categories:', error);
      this.element.innerHTML = '<div class="error">Error loading categories</div>';
    }
  }

  private render(): void {
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

  private handleCategoryClick(event: Event): void {
    const button = event.currentTarget as HTMLElement;
    const categoryId = button.getAttribute('data-id') || '';
    
    if (this.selectedCategoryId !== categoryId) {
      this.selectedCategoryId = categoryId;
      this.render();
      
      // Notify listeners
      this.notifyFilterChanged();
    }
  }

  private notifyFilterChanged(): void {
    this.filterChangeListeners.forEach(listener => {
      listener(this.selectedCategoryId);
    });
  }

  addFilterChangeListener(listener: (categoryId: string) => void): void {
    this.filterChangeListeners.push(listener);
  }

  removeFilterChangeListener(listener: (categoryId: string) => void): void {
    const index = this.filterChangeListeners.indexOf(listener);
    if (index > -1) {
      this.filterChangeListeners.splice(index, 1);
    }
  }
}