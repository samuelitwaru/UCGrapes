import { Cart } from '../models/Cart';
import { Book } from '../models/Book';
import { StorageService } from './StorageService';

export class CartService {
  private cart: Cart;
  private storageService: StorageService;
  private readonly STORAGE_KEY = 'bookstore_cart';
  
  constructor() {
    this.storageService = new StorageService();
    this.cart = new Cart();
    this.loadCart();
  }

  private loadCart(): void {
    // Implementation would deserialize cart data from storage
    // This is a simplified version
    console.log('Cart loaded from storage');
  }

  private saveCart(): void {
    // Implementation would serialize cart data to storage
    console.log('Cart saved to storage');
  }

  addToCart(book: Book, quantity: number = 1): void {
    this.cart.addItem(book, quantity);
    this.saveCart();
    this.notifyCartUpdated();
  }

  removeFromCart(bookId: string): void {
    this.cart.removeItem(bookId);
    this.saveCart();
    this.notifyCartUpdated();
  }

  updateQuantity(bookId: string, quantity: number): void {
    this.cart.updateQuantity(bookId, quantity);
    this.saveCart();
    this.notifyCartUpdated();
  }

  getCart(): Cart {
    return this.cart;
  }

  clearCart(): void {
    this.cart.clear();
    this.saveCart();
    this.notifyCartUpdated();
  }

  // Simple event handling for cart updates
  private listeners: Array<() => void> = [];

  addCartUpdateListener(listener: () => void): void {
    this.listeners.push(listener);
  }

  removeCartUpdateListener(listener: () => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyCartUpdated(): void {
    this.listeners.forEach(listener => listener());
  }
}