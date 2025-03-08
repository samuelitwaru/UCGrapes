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
        console.log("IconList init");
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
                
                // We don't add the click event here anymore
                // It will be added in the loadThemeIcons method
                
                this.icons.push(icon);
            });
            console.log("icons count: ", this.icons.length);
    }

    render(container: HTMLElement) {
        this.icons.forEach(icon => container.appendChild(icon));
    }
}