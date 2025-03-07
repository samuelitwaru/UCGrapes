import { Book } from './Book';

export interface CartItem {
  book: Book;
  quantity: number;
}

export class Cart {
  private items: Map<string, CartItem> = new Map();

  addItem(book: Book, quantity: number = 1): void {
    const existingItem = this.items.get(book.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.set(book.id, { book, quantity });
    }
  }

  removeItem(bookId: string): void {
    this.items.delete(bookId);
  }

  updateQuantity(bookId: string, quantity: number): void {
    const item = this.items.get(bookId);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(bookId);
      } else {
        item.quantity = quantity;
      }
    }
  }

  getItems(): CartItem[] {
    return Array.from(this.items.values());
  }

  getTotalItems(): number {
    return Array.from(this.items.values())
      .reduce((total, item) => total + item.quantity, 0);
  }

  getTotalPrice(): number {
    return Array.from(this.items.values())
      .reduce((total, item) => total + (item.book.price * item.quantity), 0);
  }

  clear(): void {
    this.items.clear();
  }
}