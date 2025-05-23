import { TileProperties } from "../../../../controls/editor/TileProperties";
import { InfoSectionController } from "../../../../controls/InfoSectionController";
import { DefaultAttributes } from "../../../../utils/default-attributes";
export class IconList {
    constructor(themeManager, iconsCategory) {
        this.icons = [];
        this.iconsCategory = "General";
        this.themeManager = themeManager;
        this.iconsCategory = iconsCategory;
        this.init();
    }
    init() {
        this.icons = [];
        const themeIcons = this.themeManager.getActiveThemeIcons();
        // Filter icons by category and theme
        themeIcons
            .filter((icon) => icon.IconCategory === this.iconsCategory)
            .forEach((themeIcon) => {
            const icon = document.createElement("div");
            icon.classList.add("icon");
            icon.title = themeIcon.IconName;
            icon.innerHTML = `${themeIcon.IconSVG}`;
            icon.addEventListener("click", (e) => {
                var _a, _b;
                e.preventDefault();
                const selectedComponent = globalThis.selectedComponent;
                if (!selectedComponent)
                    return;
                const iconComponent = selectedComponent.find(".tile-icon")[0];
                if (!iconComponent)
                    return;
                const currentTileColor = (_a = selectedComponent.getStyle()) === null || _a === void 0 ? void 0 : _a["color"];
                const whiteSVG = themeIcon.IconSVG.replace(/fill="#[^"]*"/g, `fill="${currentTileColor || "white"}"`);
                const iconSVGWithAttributes = whiteSVG.replace("<svg", `<svg ${DefaultAttributes}`);
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
                const pageData = globalThis.pageData;
                if (pageData.PageType === "Information") {
                    const infoSectionController = new InfoSectionController();
                    infoSectionController.updateInfoTileAttributes(rowComponent.getId(), tileWrapper.getId(), "Icon", themeIcon.IconName);
                    const tileInfoSectionAttributes = globalThis.infoContentMapper.getInfoContent(rowComponent.getId());
                    tileAttributes = (_b = tileInfoSectionAttributes === null || tileInfoSectionAttributes === void 0 ? void 0 : tileInfoSectionAttributes.Tiles) === null || _b === void 0 ? void 0 : _b.find((tile) => tile.Id === tileWrapper.getId());
                }
                else {
                    globalThis.tileMapper.updateTile(selectedComponent.parent().getId(), "Icon", themeIcon.IconName);
                    tileAttributes = globalThis.tileMapper.getTile(rowComponent.getId(), tileWrapper.getId());
                }
                const tileProperties = new TileProperties(selectedComponent, tileAttributes);
                tileProperties.setTileAttributes();
            });
            this.icons.push(icon);
        });
    }
    render(container) {
        this.icons.forEach((icon) => container.appendChild(icon));
    }
}
//# sourceMappingURL=IconList.js.map