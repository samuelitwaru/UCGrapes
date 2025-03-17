import ToolboxApp from "../../app";
import { ThemeManager } from "../../controls/themes/ThemeManager";
import { Theme } from "../../models/Theme";
import { ToolBoxService } from "../../services/ToolBoxService";
import { demoPages } from "../../utils/test-data/pages";
import { Form } from "./Form";
import { Modal } from "./Modal";

export class VersionSelection extends ThemeManager{
    private container: HTMLElement;
    selectionDiv: HTMLElement;
    versionSelection: HTMLElement;
    activeVersion: HTMLSpanElement;
    toolboxService: ToolBoxService;

    constructor() {
        super();
        this.toolboxService = new ToolBoxService();
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

        this.initializeVersionOptions();
    }

    async initializeVersionOptions() {
        this.versionSelection.className = "theme-options-list";
        this.versionSelection.setAttribute("role", "listbox");

        const toolBoxService = new ToolBoxService();
        let versions = await toolBoxService.getVersions();
        console.log(versions);
        versions.AppVersions.forEach((version: any) => {
            const versionOption = document.createElement('div') as HTMLElement;
            versionOption.className = "theme-option";
            versionOption.role = "option";
            versionOption.setAttribute('data-value', version.AppVersionName);
            versionOption.textContent = version.AppVersionName;

            const duplicateBtn = document.createElement('span');
            duplicateBtn.className = "clone-version fa fa-clone";
            duplicateBtn.title = "Duplicate";
            versionOption.append(duplicateBtn);

            if (version.IsActive) {
                versionOption.classList.add("selected");
                this.activeVersion.textContent = version.AppVersionName;
            }

            versionOption.onclick = () => {
                const allOptions = this.versionSelection.querySelectorAll(".theme-option");
                allOptions.forEach((opt) => opt.classList.remove("selected"));
                versionOption.classList.add("selected");
                
                this.activeVersion.textContent = version.AppVersionName;
                this.toolboxService.activateVersion(version.AppVersionId).then((res) => {
                    if (res) {
                        this.clearActiveTheme();
                        new ToolboxApp();
                        this.closeSelection();
                    }
                });

                this.closeSelection();
            }

            this.versionSelection.appendChild(versionOption);
        })
        const newVersionBtn = document.createElement('div');
        newVersionBtn.className = "theme-option";
        newVersionBtn.innerHTML = `<i class="fa fa-plus"></i> Create new version"`;
        newVersionBtn.onclick = () => {
            const form = new Form('page-form');
            form.addField({
                type: 'text',
                id: 'version_name',
                placeholder: 'Version name',
                required: true
            });

            const div = document.createElement('div');
            form.render(div);

            const submitSection = document.createElement('div');
            submitSection.classList.add('popup-footer');
            submitSection.style.marginBottom = '-12px';

            const saveBtn = this.createButton('submit_form', 'tb-btn-primary', 'Save');
            const cancelBtn = this.createButton('cancel_form', 'tb-btn-secondary', 'Cancel');

            submitSection.appendChild(saveBtn);
            submitSection.appendChild(cancelBtn);

            div.appendChild(submitSection);

            const modal = new Modal({
                title: "Create new version",
                width: "400px",
                body: div
            });

            modal.open();

            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const inputValue = div.querySelector('#version_name') as HTMLInputElement;
                const newVersion = inputValue.value;
                if (newVersion) {
                    this.toolboxService.createVersion(newVersion).then((res) => {
                        console.log(res);
                        modal.close();
                    });
                }
            });
    
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                modal.close();
            });
        }
        this.versionSelection.appendChild(newVersionBtn);
        this.selectionDiv.appendChild(this.versionSelection);
    }

    clearActiveTheme() {
        const navBar = document.getElementById("tb-navbar") as HTMLElement
        const sideBar = document.getElementById("tb-sidebar") as HTMLElement
        const editorFrameArea = document.getElementById("main-content") as HTMLElement;

        navBar.innerHTML = '';
        sideBar.innerHTML = '';
        editorFrameArea.innerHTML = '';
    }

    closeSelection() {
        const isOpen: boolean = this.versionSelection.classList.contains("show");
        if (isOpen) {
            this.versionSelection.classList.remove("show");

            const button = this.container.querySelector(".theme-select-button") as HTMLElement;
            button.setAttribute("aria-expanded", 'false');
            button.classList.toggle("open");
        }
    }

    private createButton(id: string, className: string, text: string): HTMLButtonElement {
        const btn = document.createElement('button');
        btn.id = id;
        btn.classList.add('tb-btn', className);
        btn.innerText = text;
        return btn;
    }

    render(container: HTMLElement) {
        container.appendChild(this.container);
    }
}