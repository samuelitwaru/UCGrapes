export class Category {
    constructor(id, name, description = '') {
        this.id = id;
        this.name = name;
        this.description = description;
    }
    static fromJSON(json) {
        return new Category(json.id, json.name, json.description);
    }
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description
        };
    }
}
//# sourceMappingURL=Category.js.map