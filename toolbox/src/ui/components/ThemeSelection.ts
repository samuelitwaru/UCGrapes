import { ThemeManager } from "../../controls/themes/ThemeManager";
import { Theme } from "../../models/Theme";
import { ToolBoxService } from "../../services/ToolBoxService";

export class ThemeSelection extends ThemeManager{
    private container: HTMLElement;
    selectionDiv: HTMLElement;
    themeOptions: HTMLElement;
    selectedTheme: HTMLSpanElement;

    constructor() {
        super();
        this.container = document.createElement('div') as HTMLElement;
        this.selectionDiv = document.createElement('div') as HTMLElement;
        this.themeOptions = document.createElement('div') as HTMLElement;
        this.selectedTheme = document.createElement('span') as HTMLElement;
        this.init();

        document.addEventListener('click', this.handleOutsideClick.bind(this));
    }

    init() {
        this.container.classList.add('tb-custom-theme-selection');
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

        let themes: Theme [] = this.getThemes();

        themes.forEach((theme) => {
            const themeOption = document.createElement('div') as HTMLElement;
            themeOption.className = "theme-option";
            themeOption.role = "option";
            themeOption.setAttribute('data-value', theme.ThemeName);
            themeOption.textContent = theme.ThemeName;

            const currentTheme: Theme | undefined= this.currentTheme;
            
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
        const toolboxService = new ToolBoxService();
        toolboxService.updateLocationTheme(theme.ThemeId).then((res) => {
            // check if authenticte
            
            this.setTheme(theme);
        })
        ;
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