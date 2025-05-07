import { AppConfig } from "../../AppConfig";
import { Modal } from "../components/Modal";
import { Form } from "../components/Form";
import { AppVersion } from "../../interfaces/AppVersion ";
import { AppVersionController } from "../../controls/versions/AppVersionController";
import { i18n } from "../../i18n/i18n";
import { ConfirmationBox } from "../components/ConfirmationBox";
import { Alert } from "../components/Alert";
import { truncateString } from "../../utils/helpers";

export class VersionSelectionView {
  private container: HTMLElement;
  private selectionDiv: HTMLElement;
  private versionSelection: HTMLElement;
  private activeVersion: HTMLSpanElement;
  private versionController: AppVersionController;
  versionList: HTMLDivElement;

  constructor() {
    this.versionController = new AppVersionController();
    this.container = document.createElement("div");
    this.selectionDiv = document.createElement("div");
    this.versionSelection = document.createElement("div");
    this.versionList = document.createElement("div");
    this.activeVersion = document.createElement("span");

    this.init();
    document.addEventListener("click", this.handleOutsideClick.bind(this));
  }

  private init() {
    this.container.classList.add("tb-custom-theme-selection");
    const button = this.createSelectionButton();

    this.selectionDiv.appendChild(button);
    this.container.appendChild(this.selectionDiv);

    this.initializeVersionOptions();
  }

  private createSelectionButton(): HTMLButtonElement {
    const button = document.createElement("button");
    button.classList.add("version-select-button");
    button.setAttribute("aria-haspopup", "listbox");

    this.activeVersion.classList.add("selected-theme-value");
    this.activeVersion.textContent = "Select Version";

    button.appendChild(this.activeVersion);
    button.onclick = (e) => {
      e.preventDefault();
      const isOpen: boolean = button.classList.contains("open");
      isOpen ? this.closeSelection() : this.toggleSelection(button);
    };

    return button;
  }

  private toggleSelection(button: HTMLButtonElement) {
    this.versionSelection.classList.toggle("show");
    button.classList.toggle("open");
    button.setAttribute("aria-expanded", "true");
  }

  async initializeVersionOptions() {
    this.versionSelection.className = "theme-options-list";
    this.versionSelection.setAttribute("role", "listbox");
    this.versionSelection.innerHTML = ""; // Clear existing options
    this.versionList.classList.add("tb-version-list");
    this.versionList.innerHTML = ""
    
    this.addNewVersionButton();
    this.versionSelection.appendChild(this.versionList);

    const versions = await this.versionController.getVersions();
    versions.forEach((version: any) => this.createVersionOption(version));

    this.addNewTemplateButton();
    this.selectionDiv.appendChild(this.versionSelection);
  }

  private addNewVersionButton() {
    const newVersionBtn = document.createElement("div");
    newVersionBtn.className = "theme-option";
    newVersionBtn.style.justifyContent = "start"
    newVersionBtn.innerHTML = `<i class="fa fa-plus"></i> &nbsp; ${i18n.t(
      "navbar.appversion.create_new"
    )}`;
    newVersionBtn.onclick = () => {
      this.createVersionModal();
    };
    this.versionSelection.appendChild(newVersionBtn);
  }

   private addNewTemplateButton() {
      const newVersionBtn = document.createElement("div");
      newVersionBtn.className = "theme-option";
      newVersionBtn.innerHTML = `Select Templates`;
      newVersionBtn.onclick = () => {
        const config = AppConfig.getInstance();
        config.addTemplatesButtonEvent();
      };
      this.versionSelection.appendChild(newVersionBtn);
    }

  private async createVersionOption(version: AppVersion) {
    const versionOption = document.createElement("div");
    versionOption.className = "theme-option submenu";
    versionOption.role = "option";
    versionOption.setAttribute("data-value", version.AppVersionName);
    versionOption.textContent = version.AppVersionName;

    const optionButtons = document.createElement("div");
    optionButtons.className = "option-buttons";

    // const duplicateBtn = this.createDuplicateButton(version);
    // optionButtons.append(duplicateBtn);

    const activeVersion = (window as any).app.currentVersion;
    const isActive = (version.AppVersionId == activeVersion.AppVersionId)     
    versionOption.append(optionButtons);
    
    if (isActive) {
      versionOption.classList.add("selected");
      this.activeVersion.textContent = truncateString(version.AppVersionName, 20);
    }

    versionOption.addEventListener("click", (e) =>
      this.handleVersionSelection(e, version)
    );

    const subMenu = document.createElement("div");
    subMenu.className = "submenu-list";
    const duplicateOption = document.createElement("div");
    duplicateOption.classList.add("theme-option");
    duplicateOption.innerHTML = "Duplicate";
    subMenu.appendChild(duplicateOption);
    duplicateOption.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.createVersionModal(
        version.AppVersionName + " - Copy",
        "Duplicate version",
        "Duplicate"
      );
    });

    const renameOption = document.createElement("div");
    renameOption.classList.add("theme-option");
    renameOption.innerHTML = "Rename";
    subMenu.appendChild(renameOption);

    
    if (!isActive) {
      const trashOption = document.createElement("div");
      trashOption.classList.add("theme-option");
      trashOption.innerHTML = "Move to Trash";
      trashOption.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        const title = "Delete version";
        const message = "Are you sure you want to delete this version?";
    
        const handleConfirmation = async () => {
            this.versionController.deleteVersion(version.AppVersionId).then(async(res: any) => {
              await this.refreshVersionList();
            });
        }
        const confirmationBox = new ConfirmationBox(
            message,
            title,
            handleConfirmation,
        );
        confirmationBox.render(document.body);
      });
      subMenu.appendChild(trashOption);
    }  

    if (isActive) {
      subMenu.style.marginTop = "33px";
    }

    versionOption.appendChild(subMenu);


    this.versionList.appendChild(versionOption);
  }

  private createDuplicateButton(version: AppVersion): HTMLSpanElement {
    const duplicateBtn = document.createElement("span");
    duplicateBtn.className = "clone-version fa fa-clone";
    duplicateBtn.title = `${i18n.t("navbar.appversion.duplicate")}`;

    duplicateBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.createVersionModal(
        version.AppVersionName + " - Copy",
        "Duplicate version",
        "Duplicate"
      );
    });

    return duplicateBtn;
  }

  private createDeleteButton(version: AppVersion): HTMLSpanElement {
    const deleteBtn = document.createElement("span");
    deleteBtn.className = "delete-version fa fa-trash";
    deleteBtn.title = `${i18n.t("navbar.appversion.delete")}`;

    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      const title = "Delete version";
      const message = "Are you sure you want to delete this version?";
  
      const handleConfirmation = async () => {
          this.versionController.deleteVersion(version.AppVersionId).then(async(res: any) => {
            await this.refreshVersionList();
          });
      }
      const confirmationBox = new ConfirmationBox(
          message,
          title,
          handleConfirmation,
      );
      confirmationBox.render(document.body);
    });

    return deleteBtn;
  }

  private async handleVersionSelection(e: Event, version: AppVersion) {
    // Prevent selection if duplicate button was clicked
    if ((e.target as HTMLElement).classList.contains("clone-version")) {
      return;
    }

    const allOptions = this.versionSelection.querySelectorAll(".theme-option");
    allOptions.forEach((opt) => opt.classList.remove("selected"));

    const selectedOption = e.currentTarget as HTMLElement;
    selectedOption.classList.add("selected");

    this.activeVersion.textContent = truncateString(version.AppVersionName, 15);

    const activationResult = await this.versionController.activateVersion(
      version.AppVersionId
    );
    if (activationResult) {
      this.clearActiveTheme();
    }

    this.closeSelection();
  }

  private clearActiveTheme() {
    location.reload();
  }

  createVersionModal(value?: string, title?: string, buttonText?: string) {
    const form = new Form("page-form");
    form.addField({
      type: "text",
      id: "version_name",
      placeholder: "Version name",
      required: true,
      value: value,
    });

    const div = document.createElement("div");
    form.render(div);

    const submitSection = this.createSubmitSection(buttonText);
    div.appendChild(submitSection);

    const modal = new Modal({
      title: title || "Create new version",
      width: "400px",
      body: div,
    });

    modal.open();
    let isDuplicating: boolean = false;
    if (title) {
      isDuplicating = true;
    }
    this.setupModalButtons(modal, div, isDuplicating);
  }

  private createSubmitSection(buttonText?: string): HTMLDivElement {
    const submitSection = document.createElement("div");
    submitSection.classList.add("popup-footer");
    submitSection.style.marginBottom = "-12px";

    const saveBtn = this.createButton(
      "submit_form",
      "tb-btn-primary",
      `${buttonText || "Save"}`
    );
    const cancelBtn = this.createButton(
      "cancel_form",
      "tb-btn-secondary",
      "Cancel"
    );

    submitSection.appendChild(saveBtn);
    submitSection.appendChild(cancelBtn);

    return submitSection;
  }

  private setupModalButtons(
    modal: Modal,
    div: HTMLElement,
    isDuplicating: boolean
  ) {
    const saveBtn = div.querySelector("#submit_form");
    const cancelBtn = div.querySelector("#cancel_form");

    saveBtn?.addEventListener("click", async (e) => {
      e.preventDefault();
      const inputValue = div.querySelector("#version_name") as HTMLInputElement;
      const newVersion = inputValue.value;

      if (newVersion) {
        await this.versionController.createVersion(newVersion, isDuplicating).then(async (result) => {
          modal.close();
          await this.refreshVersionList();
          if (result) {
            this.clearActiveTheme();
          }
        });        
      }
    });

    cancelBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      modal.close();
    });
  }

  private createButton(
    id: string,
    className: string,
    text: string
  ): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.id = id;
    btn.classList.add("tb-btn", className);
    btn.innerText = text;
    return btn;
  }

  private closeSelection() {
    const isOpen: boolean = this.versionSelection.classList.contains("show");
    if (isOpen) {
      this.versionSelection.classList.remove("show");

      const button = this.container.querySelector(
        ".version-select-button"
      ) as HTMLElement;
      button.setAttribute("aria-expanded", "false");
      button.classList.toggle("open");
    }
  }

  private handleOutsideClick(event: MouseEvent) {
    if (
      this.versionSelection.classList.contains("show") &&
      !this.container.contains(event.target as Node)
    ) {
      this.closeSelection();
    }
  }

  async refreshVersionList() {
    this.initializeVersionOptions();

    // Ensure the dropdown is visible
    if (!this.versionSelection.classList.contains("show")) {
      this.versionSelection.classList.add("show");
    }

    const button = this.container.querySelector(
      ".version-select-button"
    ) as HTMLElement;
    if (!button.classList.contains("open")) {
      button.classList.add("open");
    }
    button.setAttribute("aria-expanded", "true");
  }

  render(container: HTMLElement) {
    container.appendChild(this.container);
  }
}
