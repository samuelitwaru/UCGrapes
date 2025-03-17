import { CartService } from '../../services/CartService';
export class BookCard {
    constructor(book) {
        this.book = book;
        this.cartService = new CartService();
        this.element = document.createElement('div');
        this.render();
    }
    render() {
        this.element.className = 'book-card';
        this.element.innerHTML = `
      <img src="${this.book.imageUrl}" alt="${this.book.title}" class="book-cover">
      <div class="book-info">
        <h3 class="book-title">${this.book.title}</h3>
        <p class="book-author">by ${this.book.author}</p>
        <p class="book-price">${this.book.getFormattedPrice()}</p>
        <p class="book-description">${this.book.getShortDescription()}</p>
        <button class="add-to-cart-btn">Add to Cart</button>
        <a href="#/book/${this.book.id}" class="view-details-btn">View Details</a>
      </div>
    `;
        // Add event listeners
        const addToCartBtn = this.element.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', this.handleAddToCart.bind(this));
        }
    }
    handleAddToCart(event) {
        event.preventDefault();
        this.cartService.addToCart(this.book);
        // Show confirmation message
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = 'Added!';
        button.classList.add('added');
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('added');
        }, 1500);
    }
    getElement() {
        return this.element;
    }
}
//# sourceMappingURL=BookCard.js.map