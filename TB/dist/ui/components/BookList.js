var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BookCard } from './BookCard';
import { BookService } from '../../services/BookService';
import { CategoryFilter } from './CategoryFilter';
export class BookList {
    constructor(containerId) {
        this.books = [];
        this.currentCategoryId = '';
        this.searchQuery = '';
        this.element = document.getElementById(containerId);
        if (!this.element) {
            throw new Error(`Element with id '${containerId}' not found`);
        }
        this.bookService = new BookService();
        this.categoryFilter = new CategoryFilter('category-filter');
        this.categoryFilter.addFilterChangeListener(this.handleFilterChange.bind(this));
        this.setupSearchBar();
        this.loadBooks();
    }
    setupSearchBar() {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
      <input type="text" id="search-input" placeholder="Search books...">
      <button id="search-button">Search</button>
    `;
        this.element.before(searchContainer);
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-button');
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
    loadBooks() {
        return __awaiter(this, void 0, void 0, function* () {
            this.element.innerHTML = '<div class="loading">Loading books...</div>';
            try {
                let books;
                if (this.searchQuery) {
                    books = yield this.bookService.searchBooks(this.searchQuery);
                }
                else if (this.currentCategoryId) {
                    books = yield this.bookService.getBooksByCategory(this.currentCategoryId);
                }
                else {
                    books = yield this.bookService.getBooks();
                }
                this.books = books;
                this.render();
            }
            catch (error) {
                this.element.innerHTML = '<div class="error">Error loading books</div>';
                console.error('Error loading books:', error);
            }
        });
    }
    handleFilterChange(categoryId) {
        this.currentCategoryId = categoryId;
        this.loadBooks();
    }
    render() {
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
//# sourceMappingURL=BookList.js.map