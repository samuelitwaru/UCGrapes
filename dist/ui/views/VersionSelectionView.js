var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { AppConfig } from "../../AppConfig";
import { Modal } from "../components/Modal";
import { Form } from "../components/Form";
import { AppVersionController } from "../../controls/versions/AppVersionController";
import { i18n } from "../../i18n/i18n";
import { ConfirmationBox } from "../components/ConfirmationBox";
import { truncateString } from "../../utils/helpers";
export class VersionSelectionView {
    constructor() {
        this.versionController = new AppVersionController();
        this.container = document.createElement("div");
        this.selectionDiv = document.createElement("div");
        this.versionSelection = document.createElement("div");
        this.activeVersion = document.createElement("span");
        this.init();
        document.addEventListener("click", this.handleOutsideClick.bind(this));
    }
    init() {
        this.container.classList.add("tb-custom-theme-selection");
        const button = this.createSelectionButton();
        this.selectionDiv.appendChild(button);
        this.container.appendChild(this.selectionDiv);
        this.initializeVersionOptions();
    }
    createSelectionButton() {
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
    toggleSelection(button) {
        this.versionSelection.classList.toggle("show");
        button.classList.toggle("open");
        button.setAttribute("aria-expanded", "true");
    }
    initializeVersionOptions() {
        return __awaiter(this, void 0, void 0, function* () {
            this.versionSelection.className = "theme-options-list";
            this.versionSelection.setAttribute("role", "listbox");
            this.versionSelection.innerHTML = ""; // Clear existing options
            const versions = yield this.versionController.getVersions();
            versions.forEach((version) => this.createVersionOption(version));
            this.addNewVersionButton();
            this.addNewTemplateButton();
            this.selectionDiv.appendChild(this.versionSelection);
        });
    }
    addNewVersionButton() {
        const newVersionBtn = document.createElement("div");
        newVersionBtn.className = "theme-option";
        newVersionBtn.style.justifyContent = "start";
        newVersionBtn.innerHTML = `<i class="fa fa-plus"></i> &nbsp; ${i18n.t("navbar.appversion.create_new")}`;
        newVersionBtn.onclick = () => {
            this.createVersionModal();
        };
        this.versionSelection.appendChild(newVersionBtn);
    }
    addNewTemplateButton() {
        const newVersionBtn = document.createElement("div");
        newVersionBtn.className = "theme-option";
        newVersionBtn.innerHTML = `<i class="fa fa-plus"></i> Select Templates`;
        newVersionBtn.onclick = () => {
            const config = AppConfig.getInstance();
            config.addTemplatesButtonEvent();
        };
        this.versionSelection.appendChild(newVersionBtn);
    }
    createVersionOption(version) {
        return __awaiter(this, void 0, void 0, function* () {
            const versionOption = document.createElement("div");
            versionOption.className = "theme-option";
            versionOption.role = "option";
            versionOption.setAttribute("data-value", version.AppVersionName);
            versionOption.textContent = version.AppVersionName;
            const optionButtons = document.createElement("div");
            optionButtons.className = "option-buttons";
            const duplicateBtn = this.createDuplicateButton(version);
            optionButtons.append(duplicateBtn);
            const activeVersion = window.app.currentVersion;
            const isActive = (version.AppVersionId == activeVersion.AppVersionId);
            if (!isActive) {
                const deleteBtn = this.createDeleteButton(version);
                optionButtons.append(deleteBtn);
            }
            versionOption.append(optionButtons);
            if (isActive) {
                versionOption.classList.add("selected");
                this.activeVersion.textContent = truncateString(version.AppVersionName, 15);
            }
            versionOption.addEventListener("click", (e) => this.handleVersionSelection(e, version));
            this.versionSelection.appendChild(versionOption);
        });
    }
    createDuplicateButton(version) {
        const duplicateBtn = document.createElement("span");
        duplicateBtn.className = "clone-version fa fa-clone";
        duplicateBtn.title = `${i18n.t("navbar.appversion.duplicate")}`;
        duplicateBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.createVersionModal(version.AppVersionName + " - Copy", "Duplicate version", "Duplicate");
        });
        return duplicateBtn;
    }
    createDeleteButton(version) {
        const deleteBtn = document.createElement("span");
        deleteBtn.className = "delete-version fa fa-trash";
        deleteBtn.title = `${i18n.t("navbar.appversion.delete")}`;
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            const title = "Delete version";
            const message = "Are you sure you want to delete this version?";
            const handleConfirmation = () => __awaiter(this, void 0, void 0, function* () {
                this.versionController.deleteVersion(version.AppVersionId).then((res) => __awaiter(this, void 0, void 0, function* () {
                    yield this.refreshVersionList();
                }));
            });
            const confirmationBox = new ConfirmationBox(message, title, handleConfirmation);
            confirmationBox.render(document.body);
        });
        return deleteBtn;
    }
    handleVersionSelection(e, version) {
        return __awaiter(this, void 0, void 0, function* () {
            // Prevent selection if duplicate button was clicked
            if (e.target.classList.contains("clone-version")) {
                return;
            }
            const allOptions = this.versionSelection.querySelectorAll(".theme-option");
            allOptions.forEach((opt) => opt.classList.remove("selected"));
            const selectedOption = e.currentTarget;
            selectedOption.classList.add("selected");
            this.activeVersion.textContent = truncateString(version.AppVersionName, 15);
            const activationResult = yield this.versionController.activateVersion(version.AppVersionId);
            if (activationResult) {
                this.clearActiveTheme();
            }
            this.closeSelection();
        });
    }
    clearActiveTheme() {
        location.reload();
    }
    createVersionModal(value, title, buttonText) {
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
        let isDuplicating = false;
        if (title) {
            isDuplicating = true;
        }
        this.setupModalButtons(modal, div, isDuplicating);
    }
    createSubmitSection(buttonText) {
        const submitSection = document.createElement("div");
        submitSection.classList.add("popup-footer");
        submitSection.style.marginBottom = "-12px";
        const saveBtn = this.createButton("submit_form", "tb-btn-primary", `${buttonText || "Save"}`);
        const cancelBtn = this.createButton("cancel_form", "tb-btn-secondary", "Cancel");
        submitSection.appendChild(saveBtn);
        submitSection.appendChild(cancelBtn);
        return submitSection;
    }
    setupModalButtons(modal, div, isDuplicating) {
        const saveBtn = div.querySelector("#submit_form");
        const cancelBtn = div.querySelector("#cancel_form");
        saveBtn === null || saveBtn === void 0 ? void 0 : saveBtn.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            e.preventDefault();
            const inputValue = div.querySelector("#version_name");
            const newVersion = inputValue.value;
            if (newVersion) {
                yield this.versionController.createVersion(newVersion, isDuplicating).then((result) => __awaiter(this, void 0, void 0, function* () {
                    modal.close();
                    yield this.refreshVersionList();
                    if (result) {
                        this.clearActiveTheme();
                    }
                }));
            }
        }));
        cancelBtn === null || cancelBtn === void 0 ? void 0 : cancelBtn.addEventListener("click", (e) => {
            e.preventDefault();
            modal.close();
        });
    }
    createButton(id, className, text) {
        const btn = document.createElement("button");
        btn.id = id;
        btn.classList.add("tb-btn", className);
        btn.innerText = text;
        return btn;
    }
    closeSelection() {
        const isOpen = this.versionSelection.classList.contains("show");
        if (isOpen) {
            this.versionSelection.classList.remove("show");
            const button = this.container.querySelector(".theme-select-button");
            button.setAttribute("aria-expanded", "false");
            button.classList.toggle("open");
        }
    }
    handleOutsideClick(event) {
        if (this.versionSelection.classList.contains("show") &&
            !this.container.contains(event.target)) {
            this.closeSelection();
        }
    }
    refreshVersionList() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initializeVersionOptions();
            // Ensure the dropdown is visible
            if (!this.versionSelection.classList.contains("show")) {
                this.versionSelection.classList.add("show");
            }
            const button = this.container.querySelector(".theme-select-button");
            if (!button.classList.contains("open")) {
                button.classList.add("open");
            }
            button.setAttribute("aria-expanded", "true");
        });
    }
    render(container) {
        container.appendChild(this.container);
    }
}
//# sourceMappingURL=VersionSelectionView.js.map