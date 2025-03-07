import { Book } from '../../models/Book';
import { BookCard } from './BookCard';
import { BookService } from '../../services/BookService';
import { CategoryFilter } from './CategoryFilter';

export class BookList {
  private element: HTMLElement;
  private bookService: BookService;
  private books: Book[] = [];
  private categoryFilter: CategoryFilter;
  private currentCategoryId: string = '';
  private searchQuery: string = '';

  constructor(containerId: string) {
    this.element = document.getElementById(containerId) as HTMLElement;
    if (!this.element) {
      throw new Error(`Element with id '${containerId}' not found`);
    }
    
    this.bookService = new BookService();
    this.categoryFilter = new CategoryFilter('category-filter');
    this.categoryFilter.addFilterChangeListener(this.handleFilterChange.bind(this));
    
    this.setupSearchBar();
    this.loadBooks();
  }

  private setupSearchBar(): void {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
      <input type="text" id="search-input" placeholder="Search books...">
      <button id="search-button">Search</button>
    `;
    
    this.element.before(searchContainer);
    
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    const searchButton = document.getElementById('search-button') as HTMLButtonElement;
    
    searchButton.addEventListener('click', () => {
      this.searchQuery = searchInput.value;
      this.loadBooks();
    });
    
    searchInput.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        this.searchQuery = searchInput.value;
        this.loadBooks();
      }
    });
  }

  private async loadBooks(): Promise<void> {
    this.element.innerHTML = '<div class="loading">Loading books...</div>';
    
    try {
      let books: Book[];
      
      if (this.searchQuery) {
        books = await this.bookService.searchBooks(this.searchQuery);
      } else if (this.currentCategoryId) {
        books = await this.bookService.getBooksByCategory(this.currentCategoryId);
      } else {
        books = await this.bookService.getBooks();
      }
      
      this.books = books;
      this.render();
    } catch (error) {
      this.element.innerHTML = '<div class="error">Error loading books</div>';
      console.error('Error loading books:', error);
    }
  }

  private handleFilterChange(categoryId: string): void {
    this.currentCategoryId = categoryId;
    this.loadBooks();
  }

  private render(): void {
    this.element.innerHTML = '';
    
    if (this.books.length === 0) {
      this.element.innerHTML = '<div class="no-books">No books found</div>';
      return;
    }
    
    const booksGrid = document.createElement('div');
    booksGrid.className = 'books-grid';
    
    this.books.forEach(book => {
      const bookCard = new BookCard(book);
      booksGrid.appendChild(bookCard.getElement());
    });
    
    this.element.appendChild(booksGrid);
  }
}