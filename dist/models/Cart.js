export class Cart {
    constructor() {
        this.items = new Map();
    }
    addItem(book, quantity = 1) {
        const existingItem = this.items.get(book.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        }
        else {
            this.items.set(book.id, { book, quantity });
        }
    }
    removeItem(bookId) {
        this.items.delete(bookId);
    }
    updateQuantity(bookId, quantity) {
        const item = this.items.get(bookId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(bookId);
            }
            else {
                item.quantity = quantity;
            }
        }
    }
    getItems() {
        return Array.from(this.items.values());
    }
    getTotalItems() {
        return Array.from(this.items.values())
            .reduce((total, item) => total + item.quantity, 0);
    }
    getTotalPrice() {
        return Array.from(this.items.values())
            .reduce((total, item) => total + (item.book.price * item.quantity), 0);
    }
    clear() {
        this.items.clear();
    }
}
//# sourceMappingURL=Cart.js.map