import { Book } from '../models/Book';
import { Category } from '../models/Category';
// Sample data
const categories = [
    new Category('cat1', 'Fiction'),
    new Category('cat2', 'Non-Fiction'),
    new Category('cat3', 'Science'),
    new Category('cat4', 'Technology')
];
const books = [
    new Book('book1', 'The Great Gatsby', 'F. Scott Fitzgerald', 9.99, 'A novel about the American Dream set in the Roaring Twenties.', 'cat1', 'https://via.placeholder.com/150', new Date(1925, 3, 10)),
    new Book('book2', 'Sapiens', 'Yuval Noah Harari', 14.99, 'A brief history of humankind exploring how humans evolved.', 'cat2', 'https://via.placeholder.com/150', new Date(2011, 1, 15)),
    new Book('book3', 'A Brief History of Time', 'Stephen Hawking', 12.99, 'A landmark book in science writing that explores the cosmos.', 'cat3', 'https://via.placeholder.com/150', new Date(1988, 0, 1)),
    new Book('book4', 'Clean Code', 'Robert C. Martin', 24.99, 'A handbook of agile software craftsmanship.', 'cat4', 'https://via.placeholder.com/150', new Date(2008, 7, 1))
];
export class BookService {
    getBooks() {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => resolve(books), 300);
        });
    }
    getBookById(id) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const book = books.find(b => b.id === id);
                resolve(book);
            }, 300);
        });
    }
    getBooksByCategory(categoryId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const filteredBooks = books.filter(b => b.categoryId === categoryId);
                resolve(filteredBooks);
            }, 300);
        });
    }
    getCategories() {
        return new Promise((resolve) => {
            setTimeout(() => resolve(categories), 300);
        });
    }
    searchBooks(query) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const searchTerm = query.toLowerCase();
                const results = books.filter(book => book.title.toLowerCase().includes(searchTerm) ||
                    book.author.toLowerCase().includes(searchTerm));
                resolve(results);
            }, 300);
        });
    }
}
//# sourceMappingURL=BookService.js.map