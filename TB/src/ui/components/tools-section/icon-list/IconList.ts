import { ThemeManager } from "../../../../controls/themes/ThemeManager";
import { Theme, ThemeIcon } from "../../../../models/Theme";

export class IconList {
    private themeManager: ThemeManager;
    private icons: HTMLElement[] = [];
    iconsCategory: string = "General"

    constructor(themeManager: ThemeManager, iconsCategory: string) {
        this.themeManager = themeManager;
        this.iconsCategory = iconsCategory;
        this.init();
    }

    init() {
        this.icons = [];
        const themeIcons: ThemeIcon[] = this.themeManager.getActiveThemeIcons();
        const activeTheme: Theme = this.themeManager.getActiveTheme();
        // Filter icons by category and theme
        themeIcons
            .filter(icon => icon.IconCategory === this.iconsCategory)
            .forEach(themeIcon => {
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
                    alert(currentTileColor);
                    const whiteSVG = themeIcon.IconSVG.replace(/fill="#[^"]*"/g, `fill="${currentTileColor || "white"}"`);
                    iconComponent.components(whiteSVG);

                    const iconCompParent = iconComponent.parent();
                    iconCompParent.addStyle({
                        'display': 'block'
                    });
                });
                
                this.icons.push(icon);
            });
    }

    render(container: HTMLElement) {
        this.icons.forEach(icon => container.appendChild(icon));
    }
}