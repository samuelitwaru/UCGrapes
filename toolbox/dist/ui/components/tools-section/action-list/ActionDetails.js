import { CategoryView } from "./CategoryView";
export class ActionDetails {
    constructor(categoryData) {
        this.categoryView = new CategoryView(categoryData);
    }
    render(container) {
        this.categoryView.render(container);
    }
}
//# sourceMappingURL=ActionDetails.js.map