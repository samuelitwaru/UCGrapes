import { ThemeManager } from "../../../../controls/themes/ThemeManager";
import { Theme, ThemeIcon } from "../../../../models/Theme";
import { DefaultAttributes } from "../../../../utils/default-attributes";

export class IconList {
  private themeManager: ThemeManager;
  private icons: HTMLElement[] = [];
  iconsCategory: string = "General";

  constructor(themeManager: ThemeManager, iconsCategory: string) {
    this.themeManager = themeManager;
    this.iconsCategory = iconsCategory;
    this.init();

  }

  init() {
    this.icons = [];
    const themeIcons: ThemeIcon[] = this.themeManager.getActiveThemeIcons();
    // Filter icons by category and theme
    themeIcons
      .filter((icon) => icon.IconCategory === this.iconsCategory)
      .forEach((themeIcon) => {
        const icon = document.createElement("div");
        icon.classList.add("icon");
        icon.title = themeIcon.IconName;
        icon.innerHTML = `${themeIcon.IconSVG}`;

        icon.addEventListener("click", (e) => {
          e.preventDefault();

          const selectedComponent = (globalThis as any).selectedComponent;
          if (!selectedComponent) return;

          const iconComponent = selectedComponent.find(".tile-icon")[0];
          if (!iconComponent) return;
          const currentTileColor = selectedComponent.getStyle()?.["color"];
          const whiteSVG = themeIcon.IconSVG.replace(
            /fill="#[^"]*"/g,
            `fill="${currentTileColor || "white"}"`
          );
          const iconSVGWithAttributes = whiteSVG.replace(
            "<svg",
            `<svg ${DefaultAttributes}`
          );

          iconComponent.components(iconSVGWithAttributes);

          const iconCompParent = iconComponent.parent();
          iconCompParent.addStyle({
            display: "block",
          });

          (globalThis as any).tileMapper.updateTile(
            selectedComponent.parent().getId(),
            "Icon",
            themeIcon.IconName
          );
        });

        this.icons.push(icon);
      });
  }

  render(container: HTMLElement) {
    this.icons.forEach((icon) => container.appendChild(icon));
  }
}
