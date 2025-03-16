export class Category {
    constructor(
      public id: string,
      public name: string,
      public description: string = ''
    ) {}
  
    static fromJSON(json: any): Category {
      return new Category(
        json.id,
        json.name,
        json.description
      );
    }
  
    toJSON(): any {
      return {
        id: this.id,
        name: this.name,
        description: this.description
      };
    }
  }