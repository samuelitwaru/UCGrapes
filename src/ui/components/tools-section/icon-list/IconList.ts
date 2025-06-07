import { TileProperties } from "../../../../controls/editor/TileProperties";
import { InfoSectionManager } from "../../../../controls/InfoSectionManager";
import { ThemeManager } from "../../../../controls/themes/ThemeManager";
import { InfoType, ThemeIcon } from "../../../../types";
import { DefaultAttributes } from "../../../../utils/default-attributes";

export class IconList {
  private themeManager: ThemeManager;
  private icons: HTMLElement[] = [];
  iconsCategory: string = "Technical Services & Support";

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
          iconComponent.addAttributes({
            title: themeIcon.IconName,
          });

          const iconCompParent = iconComponent.parent();
          iconCompParent.addStyle({
            display: "block",
          });

          const tileWrapper = selectedComponent.parent();
          const rowComponent = tileWrapper.parent();
          let tileAttributes;

          const pageData = (globalThis as any).pageData;
          if (pageData.PageType === "Information") {
            const infoSectionManager = new InfoSectionManager();
            infoSectionManager.updateInfoTileAttributes(
              rowComponent.getId(),
              tileWrapper.getId(),
              "Icon",
              themeIcon.IconName
            );

            const tileInfoSectionAttributes: InfoType = (
              globalThis as any
            ).infoContentMapper.getInfoContent(rowComponent.getId());

            tileAttributes = tileInfoSectionAttributes?.Tiles?.find(
              (tile: any) => tile.Id === tileWrapper.getId()
            );
          } else {
            (globalThis as any).tileMapper.updateTile(
              selectedComponent.parent().getId(),
              "Icon",
              themeIcon.IconName
            );
            tileAttributes = (globalThis as any).tileMapper.getTile(
              rowComponent.getId(),
              tileWrapper.getId()
            );
          }

          const tileProperties = new TileProperties(
            selectedComponent,
            tileAttributes
          );

          tileProperties.setTileAttributes();
        });

        this.icons.push(icon);
      });
  }

  render(container: HTMLElement) {
    this.icons.forEach((icon) => container.appendChild(icon));
  }
}
