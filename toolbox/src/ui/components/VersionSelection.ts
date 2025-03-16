import { ThemeManager } from "../../controls/themes/ThemeManager";
import { Theme } from "../../models/Theme";
import { ToolBoxService } from "../../services/ToolBoxService";
import { demoPages } from "../../utils/test-data/pages";

export class VersionSelection extends ThemeManager{
    private container: HTMLElement;
    selectionDiv: HTMLElement;
    versionSelection: HTMLElement;
    activeVersion: HTMLSpanElement;

    constructor() {
        super();
        this.container = document.createElement('div') as HTMLElement;
        this.selectionDiv = document.createElement('div') as HTMLElement;
        this.versionSelection = document.createElement('div') as HTMLElement;
        this.activeVersion = document.createElement('span') as HTMLElement;
        this.init();
    }

    init() {
        this.container.classList.add('tb-custom-theme-selection');
        const button = document.createElement('button');
        button.classList.add('theme-select-button');
        button.setAttribute('aria-haspopup', 'listbox');

        this.activeVersion.classList.add('selected-theme-value');
        this.activeVersion.textContent = 'Select Theme';

        button.appendChild(this.activeVersion);
        this.container.appendChild(button);

        button.onclick = (e) => {
            e.preventDefault();
            const isOpen: boolean = button.classList.contains("open");
            if (isOpen) {
                this.closeSelection();
                return;
            }
            
            this.versionSelection.classList.toggle("show");
            button.classList.toggle("open");
            button.setAttribute("aria-expanded", 'true');
        }

        this.selectionDiv.appendChild(button);
        this.container.appendChild(this.selectionDiv);

        this.initializeCategoryOptions();
    }

    async initializeCategoryOptions() {
        this.versionSelection.className = "theme-options-list";
        this.versionSelection.setAttribute("role", "listbox");

        const toolBoxService = new ToolBoxService();
        let versions = await toolBoxService.getVersions();

        versions.AppVersions.forEach((version: any) => {
            const themeOption = document.createElement('div') as HTMLElement;
            themeOption.className = "theme-option";
            themeOption.role = "option";
            themeOption.setAttribute('data-value', version.AppVersionName);
            themeOption.textContent = version.AppVersionName;

            const duplicateBtn = document.createElement('span');
            duplicateBtn.className = "clone-version fa fa-clone";
            duplicateBtn.title = "Duplicate";
            themeOption.append(duplicateBtn);

            if (version.IsActive) {
                themeOption.classList.add("selected");
                this.activeVersion.textContent = version.AppVersionName;
            }

            themeOption.onclick = () => {
                const allOptions = this.versionSelection.querySelectorAll(".theme-option");
                allOptions.forEach((opt) => opt.classList.remove("selected"));
                themeOption.classList.add("selected");
                
                this.activeVersion.textContent = version.AppVersionName;
                // this.saveActiveVersion(theme);

                this.closeSelection();
            }

            this.versionSelection.appendChild(themeOption);
        })
        const newVersionBtn = document.createElement('div');
        newVersionBtn.className = "theme-option";
        newVersionBtn.innerHTML = `<i class="fa fa-plus"></i> Create new version"`;
        newVersionBtn.onclick = () => {
            // this.closeSelection();
            // this.newVersion();
        }
        this.versionSelection.appendChild(newVersionBtn);
        this.selectionDiv.appendChild(this.versionSelection);
    }

    // saveActiveVersion(theme: Theme) {
    //     const toolboxService = new ToolBoxService();
    //     toolboxService.updateLocationTheme(version.ThemeId).then((res) => {
    //         // check if authenticte
            
    //         this.setTheme(theme);
    //     })
    //     ;
    // }

    closeSelection() {
        const isOpen: boolean = this.versionSelection.classList.contains("show");
        if (isOpen) {
            this.versionSelection.classList.remove("show");

            const button = this.container.querySelector(".theme-select-button") as HTMLElement;
            button.setAttribute("aria-expanded", 'false');
            button.classList.toggle("open");
        }
    }

    render(container: HTMLElement) {
        container.appendChild(this.container);
    }
}