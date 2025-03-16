export class Book {
    constructor(id, title, author, price, description, categoryId, imageUrl = '', publishedDate = new Date(), inStock = true) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.price = price;
        this.description = description;
        this.categoryId = categoryId;
        this.imageUrl = imageUrl;
        this.publishedDate = publishedDate;
        this.inStock = inStock;
    }
    getFormattedPrice() {
        return `$${this.price.toFixed(2)}`;
    }
    getShortDescription() {
        return this.description.length > 100
            ? `${this.description.substring(0, 97)}...`
            : this.description;
    }
}
//# sourceMappingURL=Book.js.map