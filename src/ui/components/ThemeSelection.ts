import { ThemeManager } from "../../controls/themes/ThemeManager";
import { AppVersionManager } from "../../controls/versions/AppVersionManager";
import { ToolBoxService } from "../../services/ToolBoxService";
import { Theme } from "../../types";

export class ThemeSelection{
    private container: HTMLElement;
    selectionDiv: HTMLElement;
    themeOptions: HTMLElement;
    selectedTheme: HTMLSpanElement;
    themeManager: ThemeManager;

    constructor() {
        this.themeManager = new ThemeManager();
        this.container = document.createElement('div') as HTMLElement;
        this.selectionDiv = document.createElement('div') as HTMLElement;
        this.themeOptions = document.createElement('div') as HTMLElement;
        this.selectedTheme = document.createElement('span') as HTMLElement;
        this.init();

        document.addEventListener('click', this.handleOutsideClick.bind(this));
    }

    init() {
        this.container.classList.add('tb-custom-theme-selection');
        this.container.id = 'tb-custom-theme-selection';
        const button = document.createElement('button');
        button.classList.add('theme-select-button');
        button.setAttribute('aria-haspopup', 'listbox');

        this.selectedTheme.classList.add('selected-theme-value');
        this.selectedTheme.textContent = 'Select Theme';

        button.appendChild(this.selectedTheme);
        this.container.appendChild(button);

        button.onclick = (e) => {
            e.preventDefault();
            const isOpen: boolean = button.classList.contains("open");
            if (isOpen) {
                this.closeSelection();
                return;
            }
            
            this.themeOptions.classList.toggle("show");
            button.classList.toggle("open");
            button.setAttribute("aria-expanded", 'true');
        }

        this.selectionDiv.appendChild(button);
        this.container.appendChild(this.selectionDiv);

        this.initializeCategoryOptions();
    }

    initializeCategoryOptions() {
        this.themeOptions.className = "theme-options-list";
        this.themeOptions.setAttribute("role", "listbox");

        let themes: Theme [] = this.themeManager.getThemes();

        themes.forEach((theme) => {
            const themeOption = document.createElement('div') as HTMLElement;
            themeOption.classList.add("theme-option");
            themeOption.classList.add("theme");
            themeOption.role = "option";
            themeOption.setAttribute('data-value', theme.ThemeName);
            themeOption.textContent = theme.ThemeName;
            themeOption.id = theme.ThemeId;

            const currentTheme: Theme | null= this.themeManager.currentTheme;
            if (currentTheme &&currentTheme.ThemeName === theme.ThemeName) {
                themeOption.classList.add("selected");
                this.selectedTheme.textContent = theme.ThemeName;
            }

            themeOption.onclick = () => {
                const allOptions = this.themeOptions.querySelectorAll(".theme-option");
                allOptions.forEach((opt) => opt.classList.remove("selected"));
                themeOption.classList.add("selected");
                
                this.selectedTheme.textContent = theme.ThemeName;
                this.saveSelectedTheme(theme);

                this.closeSelection();
            }

            this.themeOptions.appendChild(themeOption);
        })
        this.selectionDiv.appendChild(this.themeOptions);
    }

    saveSelectedTheme(theme: Theme) {
        console.log('(globalThis as any).activeVersion: >> ', (globalThis as any).activeVersion)
        const appVersionId = (globalThis as any).activeVersion.AppVersionId;
        const toolboxService = new ToolBoxService();
        toolboxService.updateAppVersionTheme(appVersionId, theme.ThemeId).then((res) => {
            this.themeManager.setTheme(theme);
        })
    }

    closeSelection() {
        const isOpen: boolean = this.themeOptions.classList.contains("show");
        if (isOpen) {
            this.themeOptions.classList.remove("show");

            const button = this.container.querySelector(".theme-select-button") as HTMLElement;
            button.setAttribute("aria-expanded", 'false');
            button.classList.toggle("open");
        }
    }

    private handleOutsideClick(event: MouseEvent) {
        // Check if the dropdown is open and the click is outside the container
        if (this.themeOptions.classList.contains('show') && 
            !this.container.contains(event.target as Node)) {
            this.closeSelection();
        }
    }

    render(container: HTMLElement) {
        container.appendChild(this.container);
    }
}