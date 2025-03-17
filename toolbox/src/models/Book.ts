export class Book {
    constructor(
      public id: string,
      public title: string,
      public author: string,
      public price: number,
      public description: string,
      public categoryId: string,
      public imageUrl: string = '',
      public publishedDate: Date = new Date(),
      public inStock: boolean = true
    ) {}
  
    getFormattedPrice(): string {
      return `$${this.price.toFixed(2)}`;
    }
  
    getShortDescription(): string {
      return this.description.length > 100 
        ? `${this.description.substring(0, 97)}...` 
        : this.description;
    }
  }