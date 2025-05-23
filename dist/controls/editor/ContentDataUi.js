var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Modal } from "../../ui/components/Modal";
import Quill from "quill";
import { ContentDataManager } from "./ContentDataManager";
import { ImageUpload } from "../../ui/components/tools-section/tile-image/ImageUpload";
import { ConfirmationBox } from "../../ui/components/ConfirmationBox";
import { InfoSectionController } from "../InfoSectionController";
import { CtaIconsListPopup } from "../../ui/views/CtaIconsListPopup";
import { i18n } from "../../i18n/i18n";
export class ContentDataUi {
    constructor(e, editor, page) {
        this.e = e;
        this.editor = editor;
        this.page = page;
        this.infoSectionController = new InfoSectionController();
        this.contentDataManager = new ContentDataManager(this.editor, this.page);
        this.init();
    }
    init() {
        this.openContentEditModal();
        this.openImageEditModal();
        this.openDeleteModal();
        this.updateCtaButtonImage();
        this.updateCtaButtonIcon();
    }
    openContentEditModal() {
        if (this.e.target.closest('.tb-edit-content-icon')) {
            const modalBody = document.createElement('div');
            const infoDescSection = this.e.target.closest('[data-gjs-type="info-desc-section"].info-desc-section');
            const modalContent = document.createElement('div');
            modalContent.id = 'editor';
            modalContent.innerHTML = `${this.getDescription()}`;
            const submitSection = document.createElement('div');
            submitSection.classList.add('popup-footer');
            submitSection.style.marginBottom = '-12px';
            const saveBtn = this.createButton('submit_form', 'tb-btn-primary', i18n.t("tile.save_button"));
            const cancelBtn = this.createButton('cancel_form', 'tb-btn-outline', i18n.t("tile.cancel_button"));
            submitSection.appendChild(saveBtn);
            submitSection.appendChild(cancelBtn);
            modalBody.appendChild(modalContent);
            modalBody.appendChild(submitSection);
            const modal = new Modal({
                title: i18n.t("tile.edit_content"),
                width: "500px",
                body: modalBody
            });
            modal.open();
            const quill = new Quill("#editor", {
                modules: {
                    toolbar: [
                        ["bold", "italic", "underline", "link"],
                        [{ list: "ordered" }, { list: "bullet" }],
                    ],
                },
                theme: "snow",
            });
            saveBtn.addEventListener('click', () => {
                const content = document.querySelector("#editor .ql-editor");
                if (this.page.PageType === "Information" && infoDescSection) {
                    this.infoSectionController.updateDescription(content.innerHTML, infoDescSection.id);
                    modal.close();
                    return;
                }
                this.contentDataManager.saveContentDescription(content.innerHTML);
                modal.close();
            });
            cancelBtn.addEventListener('click', () => {
                modal.close();
            });
        }
    }
    openImageEditModal() {
        if (this.e.target.closest('.tb-edit-image-icon')) {
            const image = this.e.target.closest('[data-gjs-type="info-image-section"].info-image-section');
            const modal = document.createElement("div");
            modal.classList.add("tb-modal");
            modal.style.display = "flex";
            const type = this.page.PageType === "Information" ? "info" : "content";
            const modalContent = new ImageUpload(type, image === null || image === void 0 ? void 0 : image.id);
            modalContent.render(modal);
            const uploadInput = document.createElement("input");
            uploadInput.type = "file";
            uploadInput.multiple = true;
            uploadInput.accept = "image/jpeg, image/jpg, image/png";
            uploadInput.id = "fileInput";
            uploadInput.style.display = "none";
            document.body.appendChild(modal);
            document.body.appendChild(uploadInput);
        }
    }
    openDeleteModal() {
        if (this.e.target.closest('.tb-delete-image-icon')) {
            if (this.page.PageType === "Location" || this.page.PageType === "Reception") {
                return;
            }
            const title = this.page.PageType === "Information" ? "Delete Description" : "Delete Image";
            const message = "Are you sure you want to delete this section?";
            const handleConfirmation = () => __awaiter(this, void 0, void 0, function* () {
                if (this.page.PageType === "Information") {
                    const targetElement = this.e.target;
                    const infoSection = targetElement.closest('[data-gjs-type="info-desc-section"].info-desc-section') ||
                        targetElement.closest('[data-gjs-type="info-image-section"].info-image-section');
                    if (infoSection) {
                        this.infoSectionController.deleteInfoImageOrDesc(infoSection.id);
                    }
                }
                else {
                    this.contentDataManager.deleteContentImage();
                }
            });
            const confirmationBox = new ConfirmationBox(message, title, handleConfirmation);
            confirmationBox.render(document.body);
        }
    }
    updateCtaButtonImage() {
        const ctaImageEditButton = this.e.target.closest('.edit-cta-image');
        if (ctaImageEditButton) {
            const cta = this.e.target.closest('[data-gjs-type="info-cta-section"]');
            const ctaParentContainer = ctaImageEditButton.closest(".img-button-container");
            globalThis.ctaContainerId = ctaParentContainer ? ctaParentContainer.id : "";
            const modal = document.createElement("div");
            modal.classList.add("tb-modal");
            modal.style.display = "flex";
            const modalContent = new ImageUpload("cta", cta.id);
            modalContent.render(modal);
            const uploadInput = document.createElement("input");
            uploadInput.type = "file";
            uploadInput.multiple = true;
            uploadInput.accept = "image/jpeg, image/jpg, image/png";
            uploadInput.id = "fileInput";
            uploadInput.style.display = "none";
            document.body.appendChild(modal);
            document.body.appendChild(uploadInput);
        }
    }
    updateCtaButtonIcon() {
        const ctaIconEditButton = this.e.target.closest('.icon-edit-button');
        const selectedComponent = globalThis.selectedComponent;
        if (ctaIconEditButton && selectedComponent && selectedComponent.getClasses().includes("img-button-container")) {
            this.e.preventDefault();
            this.e.stopPropagation();
            const editButton = ctaIconEditButton.closest(".icon-edit-button");
            const templateContainer = editButton.closest("[data-gjs-type='info-cta-section']");
            // Get the mobileFrame for positioning context
            const mobileFrame = document.getElementById(`${globalThis.frameId}-frame`);
            const iframe = mobileFrame === null || mobileFrame === void 0 ? void 0 : mobileFrame.querySelector("iframe");
            const iframeRect = iframe === null || iframe === void 0 ? void 0 : iframe.getBoundingClientRect();
            // Pass the mobileFrame to the ActionListPopUp constructor
            const list = new CtaIconsListPopup(templateContainer, mobileFrame);
            const triggerRect = editButton.getBoundingClientRect();
            list.render();
        }
    }
    getDescription() {
        if (this.page.PageType === "Information") {
            const description = this.e.target.closest('[data-gjs-type="info-desc-section"].info-desc-section');
            if (description) {
                const descComponent = this.editor.Components.getWrapper().find(".info-desc-content")[0];
                if (descComponent) {
                    return descComponent.getEl().innerHTML;
                }
            }
        }
        else {
            const description = this.e.target.closest(".content-page-block");
            if (description) {
                const descComponent = this.editor.Components.getWrapper().find("#contentDescription")[0];
                if (descComponent) {
                    return descComponent.getEl().innerHTML;
                }
            }
        }
    }
    createButton(id, className, text) {
        const btn = document.createElement('button');
        btn.id = id;
        btn.classList.add('tb-btn', className);
        btn.innerText = text;
        return btn;
    }
}
//# sourceMappingURL=ContentDataUi.js.map