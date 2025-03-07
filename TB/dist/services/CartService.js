import { Cart } from '../models/Cart';
import { StorageService } from './StorageService';
export class CartService {
    constructor() {
        this.STORAGE_KEY = 'bookstore_cart';
        // Simple event handling for cart updates
        this.listeners = [];
        this.storageService = new StorageService();
        this.cart = new Cart();
        this.loadCart();
    }
    loadCart() {
        // Implementation would deserialize cart data from storage
        // This is a simplified version
        console.log('Cart loaded from storage');
    }
    saveCart() {
        // Implementation would serialize cart data to storage
        console.log('Cart saved to storage');
    }
    addToCart(book, quantity = 1) {
        this.cart.addItem(book, quantity);
        this.saveCart();
        this.notifyCartUpdated();
    }
    removeFromCart(bookId) {
        this.cart.removeItem(bookId);
        this.saveCart();
        this.notifyCartUpdated();
    }
    updateQuantity(bookId, quantity) {
        this.cart.updateQuantity(bookId, quantity);
        this.saveCart();
        this.notifyCartUpdated();
    }
    getCart() {
        return this.cart;
    }
    clearCart() {
        this.cart.clear();
        this.saveCart();
        this.notifyCartUpdated();
    }
    addCartUpdateListener(listener) {
        this.listeners.push(listener);
    }
    removeCartUpdateListener(listener) {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }
    notifyCartUpdated() {
        this.listeners.forEach(listener => listener());
    }
}
//# sourceMappingURL=CartService.js.map