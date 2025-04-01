import { Modal } from "../components/Modal";
import { Form } from "../components/Form";
import { AppVersion } from "../../interfaces/AppVersion ";
import { AppVersionController } from "../../controls/versions/AppVersionController";
import { i18n } from "../../i18n/i18n";

export class VersionSelectionView {
  private container: HTMLElement;
  private selectionDiv: HTMLElement;
  private versionSelection: HTMLElement;
  private activeVersion: HTMLSpanElement;
  private versionController: AppVersionController;

  constructor() {
    this.versionController = new AppVersionController();
    this.container = document.createElement("div");
    this.selectionDiv = document.createElement("div");
    this.versionSelection = document.createElement("div");
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
    button.classList.add("theme-select-button");
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

    const versions = await this.versionController.getVersions();
    versions.forEach((version: any) => this.createVersionOption(version));

    this.addNewVersionButton();
    this.selectFromTemplateButton();
    this.selectionDiv.appendChild(this.versionSelection);
  }

  private addNewVersionButton() {
    const newVersionBtn = document.createElement("div");
    newVersionBtn.className = "theme-option";
    newVersionBtn.innerHTML = `<i class="fa fa-plus"></i> ${i18n.t(
      "navbar.appversion.create_new"
    )}`;
    newVersionBtn.onclick = () => {
      this.createVersionModal();
    };
    this.versionSelection.appendChild(newVersionBtn);
  }

  private selectFromTemplateButton() {
    const selectFromTemplateBtn = document.createElement("div");
    selectFromTemplateBtn.className = "theme-option";
    selectFromTemplateBtn.innerHTML = `<i class="fa fa-plus"></i> Select from template`;
    // selectFromTemplateBtn.onclick = () => {
    //   this.selectFromTemplateModal();
    // };
    this.versionSelection.appendChild(selectFromTemplateBtn);
  }

  private createVersionOption(version: AppVersion) {
    const versionOption = document.createElement("div");
    versionOption.className = "theme-option";
    versionOption.role = "option";
    versionOption.setAttribute("data-value", version.AppVersionName);
    versionOption.textContent = version.AppVersionName;

    const duplicateBtn = this.createDuplicateButton(version);
    versionOption.append(duplicateBtn);

    if (version.IsActive) {
      versionOption.classList.add("selected");
      this.activeVersion.textContent = version.AppVersionName;
    }

    versionOption.addEventListener("click", (e) =>
      this.handleVersionSelection(e, version)
    );
    this.versionSelection.appendChild(versionOption);
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

  private async handleVersionSelection(e: Event, version: AppVersion) {
    // Prevent selection if duplicate button was clicked
    if ((e.target as HTMLElement).classList.contains("clone-version")) {
      return;
    }

    const allOptions = this.versionSelection.querySelectorAll(".theme-option");
    allOptions.forEach((opt) => opt.classList.remove("selected"));

    const selectedOption = e.currentTarget as HTMLElement;
    selectedOption.classList.add("selected");

    this.activeVersion.textContent = version.AppVersionName;

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
        await this.versionController.createVersion(newVersion, isDuplicating);
        modal.close();
        await this.refreshVersionList();
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
        ".theme-select-button"
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
    await this.initializeVersionOptions();

    // Ensure the dropdown is visible
    if (!this.versionSelection.classList.contains("show")) {
      this.versionSelection.classList.add("show");
    }

    const button = this.container.querySelector(
      ".theme-select-button"
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
