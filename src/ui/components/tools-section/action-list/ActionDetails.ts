import { Category } from "../../../../types";
import { CategoryView } from "./CategoryView";

export class ActionDetails {
  categoryView: CategoryView;
  
  constructor(categoryData: Category) {
    this.categoryView = new CategoryView(categoryData);
  }

  render(container: HTMLElement) {
    this.categoryView.render(container);
  }
}