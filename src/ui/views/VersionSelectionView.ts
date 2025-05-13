import { AppConfig } from "../../AppConfig";
import { Modal } from "../components/Modal";
import { Form } from "../components/Form";
import { AppVersionController } from "../../controls/versions/AppVersionController";
import { i18n } from "../../i18n/i18n";
import { ConfirmationBox } from "../components/ConfirmationBox";
import { truncateString } from "../../utils/helpers";
import { AppVersion } from "../../interfaces/AppVersion ";

export class VersionSelectionView {
  private container: HTMLElement;
  private selectionDiv: HTMLElement;
  private versionSelection: HTMLElement;
  private activeVersion: HTMLSpanElement;
  private versionController: AppVersionController;
  private versionList: HTMLDivElement;

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

  private init(): void {
    this.container.classList.add("tb-custom-theme-selection");
    const button = this.createSelectionButton();

    this.selectionDiv.appendChild(button);
    this.container.appendChild(this.selectionDiv);

    this.initializeVersionOptions();
  }

  private createSelectionButton(): HTMLButtonElement {
    const button = document.createElement("button");
    button.classList.add("theme-select-button");
    button.setAttribute("aria-haspopup", "listbox");

    this.activeVersion.classList.add("selected-theme-value");
    this.activeVersion.textContent = "Select Version";

    button.appendChild(this.activeVersion);
    button.onclick = (e) => {
      e.preventDefault();
      const isOpen = button.classList.contains("open");
      isOpen ? this.closeSelection() : this.toggleSelection(button);
    };

    return button;
  }

  private toggleSelection(button: HTMLButtonElement): void {
    this.versionSelection.classList.toggle("show");
    button.classList.toggle("open");
    button.setAttribute("aria-expanded", button.classList.contains("open").toString());
  }

  public async initializeVersionOptions(): Promise<void> {
    this.versionSelection.className = "theme-options-list";
    this.versionSelection.setAttribute("role", "listbox");
    this.versionSelection.innerHTML = ""; // Clear existing options
    
    this.versionList.classList.add("tb-version-list");
    this.versionList.innerHTML = "";
    
    this.addNewVersionButton();
    this.versionSelection.appendChild(this.versionList);

    const versions = await this.versionController.getVersions();
    versions.forEach((version: AppVersion) => this.createVersionOption(version));

    this.addTemplatesButton();
    this.selectionDiv.appendChild(this.versionSelection);
  }

  private addNewVersionButton(): void {
    const newVersionBtn = document.createElement("div");
    newVersionBtn.className = "theme-option";
    newVersionBtn.style.justifyContent = "start";
    newVersionBtn.innerHTML = `<i class="fa fa-plus"></i> &nbsp; ${i18n.t("navbar.appversion.create_new")}`;
    newVersionBtn.onclick = () => this.openVersionModal();
    this.versionSelection.appendChild(newVersionBtn);
  }

  private addTemplatesButton(): void {
    const templatesBtn = document.createElement("div");
    templatesBtn.className = "theme-option";
    templatesBtn.innerHTML = `Select Templates`;
    templatesBtn.onclick = () => {
      const config = AppConfig.getInstance();
      config.addTemplatesButtonEvent();
    };
    this.versionSelection.appendChild(templatesBtn);
  }

  private async createVersionOption(version: AppVersion): Promise<void> {
    const versionOption = document.createElement("div");
    versionOption.className = "theme-option submenu";
    versionOption.setAttribute("role", "option");
    versionOption.setAttribute("data-value", version.AppVersionName);
    versionOption.textContent = truncateString(version.AppVersionName, 25);

    const optionButtons = document.createElement("div");
    optionButtons.className = "option-buttons";
    versionOption.append(optionButtons);
    
    // Check if this is the active version
    const activeVersion = (window as any).app.currentVersion;
    const isActive = (version.AppVersionId === activeVersion.AppVersionId);
    
    if (isActive) {
      versionOption.classList.add("selected");
      this.activeVersion.textContent = truncateString(version.AppVersionName, 15);
    }

    versionOption.addEventListener("click", (e) => this.handleVersionSelection(e, version));

    // Create submenu with options
    const subMenu = this.createVersionSubMenu(version, isActive);
    versionOption.appendChild(subMenu);

    this.versionList.appendChild(versionOption);
  }

  private createVersionSubMenu(version: AppVersion, isActive: boolean): HTMLDivElement {
    const subMenu = document.createElement("div");
    subMenu.className = "submenu-list";
    
    // Duplicate option
    const duplicateOption = document.createElement("div");
    duplicateOption.classList.add("theme-option");
    duplicateOption.innerHTML = "Duplicate";
    duplicateOption.addEventListener("click", (e) => {
      e.stopPropagation();
      this.openVersionModal(
        version.AppVersionName + " - Copy",
        "Duplicate version",
        "Duplicate",
        "duplicate",
        version.AppVersionId
      );
    });
    subMenu.appendChild(duplicateOption);

    // Rename option
    const renameOption = document.createElement("div");
    renameOption.classList.add("theme-option");
    renameOption.innerHTML = "Rename";
    renameOption.addEventListener("click", (e) => {
      e.stopPropagation();
      this.openVersionModal(
        version.AppVersionName,
        "Rename version",
        "Rename",
        "rename",
        version.AppVersionId
      );
    });
    subMenu.appendChild(renameOption);
    
    // Delete option (only if not active)
    if (!isActive) {
      const deleteOption = document.createElement("div");
      deleteOption.classList.add("theme-option");
      deleteOption.innerHTML = "Move to Trash";
      deleteOption.addEventListener("click", (e) => {
        e.stopPropagation();
        this.confirmDeleteVersion(version);
      });
      subMenu.appendChild(deleteOption);
    }

    // Adjust submenu position if active
    if (isActive) {
      subMenu.style.marginTop = "33px";
    }

    return subMenu;
  }

  private confirmDeleteVersion(version: AppVersion): void {
    const title = "Delete version";
    const message = "Are you sure you want to delete this version?";

    const handleConfirmation = async () => {
      try {
        await this.versionController.deleteVersion(version.AppVersionId);
        await this.refreshVersionList();
      } catch (error) {
        console.error("Error deleting version:", error);
      }
    };
    
    const confirmationBox = new ConfirmationBox(
      message,
      title,
      handleConfirmation
    );
    confirmationBox.render(document.body);
  }

  private async handleVersionSelection(e: Event, version: AppVersion): Promise<void> {
    // Skip if clicking on a submenu item
    if ((e.target as HTMLElement).closest('.submenu-list')) {
      return;
    }

    try {
      // Mark selected in UI
      const allOptions = this.versionSelection.querySelectorAll(".theme-option");
      allOptions.forEach((opt) => opt.classList.remove("selected"));

      const selectedOption = e.currentTarget as HTMLElement;
      selectedOption.classList.add("selected");

      // Update display
      this.activeVersion.textContent = truncateString(version.AppVersionName, 15);

      // Activate version and reload if successful
      const activationResult = await this.versionController.activateVersion(version.AppVersionId);
      if (activationResult) {
        location.reload();
      }

      this.closeSelection();
    } catch (error) {
      console.error("Error activating version:", error);
    }
  }

  public openVersionModal(
    initialValue: string = "", 
    title: string = "Create new version", 
    buttonText: string = "Save",
    action: string = "create",
    versionId?: string
  ): void {
    const form = new Form("page-form");
    form.addField({
      type: "text",
      id: "version_name",
      placeholder: "Version name",
      required: true,
      value: initialValue,
    });

    const div = document.createElement("div");
    form.render(div);

    const submitSection = this.createSubmitSection(buttonText);
    div.appendChild(submitSection);

    const modal = new Modal({
      title: title,
      width: "400px",
      body: div,
    });

    modal.open();
    this.setupModalButtons(modal, div, action, versionId);
  }

  private createSubmitSection(buttonText: string = "Save"): HTMLDivElement {
    const submitSection = document.createElement("div");
    submitSection.classList.add("popup-footer");
    submitSection.style.marginBottom = "-12px";

    const saveBtn = this.createButton("submit_form", "tb-btn-primary", buttonText);
    const cancelBtn = this.createButton("cancel_form", "tb-btn-secondary", "Cancel");

    submitSection.appendChild(saveBtn);
    submitSection.appendChild(cancelBtn);

    return submitSection;
  }

  private setupModalButtons(
    modal: Modal,
    div: HTMLElement,
    action: string,
    versionId?: string
  ): void {
    const saveBtn = div.querySelector("#submit_form");
    const cancelBtn = div.querySelector("#cancel_form");

    saveBtn?.addEventListener("click", async (e) => {
      e.preventDefault();
      const inputElement = div.querySelector("#version_name") as HTMLInputElement;
      const versionName = inputElement.value.trim();

      if (!versionName) return;

      try {
        let result = false;
        
        switch (action) {
          case "create":
            result = await this.versionController.createVersion(versionName);
            break;
          case "duplicate":
            if (versionId) {
              result = await this.versionController.duplicateVersion(versionId, versionName);
            }
            break;
          case "rename":
            if (versionId) {
              result = await this.versionController.renameVersion(versionId, versionName);
            }
            break;
        }

        modal.close();
        await this.refreshVersionList();
        
        // Reload only for create and activate actions
        if (result && (action === "create" || action === "duplicate")) {
          location.reload();
        }
      } catch (error) {
        console.error(`Error during ${action} operation:`, error);
      }
    });

    cancelBtn?.addEventListener("click", () => modal.close());
  }

  private createButton(id: string, className: string, text: string): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.id = id;
    btn.classList.add("tb-btn", className);
    btn.innerText = text;
    return btn;
  }

  private closeSelection(): void {
    if (this.versionSelection.classList.contains("show")) {
      this.versionSelection.classList.remove("show");

      const button = this.container.querySelector(".theme-select-button") as HTMLElement;
      button.setAttribute("aria-expanded", "false");
      button.classList.remove("open");
    }
  }

  private handleOutsideClick(event: MouseEvent): void {
    if (
      this.versionSelection.classList.contains("show") &&
      !this.container.contains(event.target as Node)
    ) {
      this.closeSelection();
    }
  }

  public async refreshVersionList(): Promise<void> {
    await this.initializeVersionOptions();

    // Ensure the dropdown is visible
    this.versionSelection.classList.add("show");

    const button = this.container.querySelector(".theme-select-button") as HTMLElement;
    button.classList.add("open");
    button.setAttribute("aria-expanded", "true");
  }

  public render(container: HTMLElement): void {
    container.appendChild(this.container);
  }
}