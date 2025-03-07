import { ActionSelectContainer } from "./action-list/ActionSelectContainer";
import { IconListCategories } from "./icon-list/IconListCategories";
import { ThemeSection } from "./ThemeSection";
import { TileImgSection } from "./TileImgSection";
import { TitleSection } from "./TitleSection";

export class MenuSection {
  container: HTMLElement;
  constructor() {
    this.container = document.createElement("div");
    this.init();
  }

  init() {
      this.container.id = 'menu-page-section';
      
      const themeSection = new ThemeSection();
      const tileImgSection = new TileImgSection();
      const titleSection = new TitleSection();
      const actionListContainer = new ActionSelectContainer();
      const iconListCategories = new IconListCategories()

      themeSection.render(this.container);
      tileImgSection.render(this.container);
      titleSection.render(this.container);
      actionListContainer.render(this.container);
      iconListCategories.render(this.container);
  }

  render(container: HTMLElement) {
    container.appendChild(this.container);
  }
}
