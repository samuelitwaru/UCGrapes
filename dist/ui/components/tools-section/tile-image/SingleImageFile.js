var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ContentDataManager } from "../../../../controls/editor/ContentDataManager";
import { TileProperties } from "../../../../controls/editor/TileProperties";
import { InfoSectionController } from "../../../../controls/InfoSectionController";
import { ToolBoxService } from "../../../../services/ToolBoxService";
import { ConfirmationBox } from "../../ConfirmationBox";
export class SingleImageFile {
    constructor(mediaFile, type, infoId) {
        this.mediaFile = mediaFile;
        this.type = type;
        this.infoId = infoId;
        this.toolboxService = new ToolBoxService();
        this.container = document.createElement("div");
        this.init();
    }
    init() {
        this.container.className = "file-item valid";
        this.container.id = this.mediaFile.MediaId;
        const img = document.createElement("img");
        img.src = this.mediaFile.MediaUrl;
        img.alt = this.mediaFile.MediaName;
        img.className = "preview-image";
        const fileInfo = document.createElement("div");
        fileInfo.className = "file-info";
        const fileName = document.createElement("div");
        fileName.className = "file-name";
        fileName.innerText = this.mediaFile.MediaName;
        const fileSize = document.createElement("div");
        fileSize.className = "file-size";
        fileSize.innerText = this.formatBytes(this.mediaFile.MediaSize);
        fileInfo.appendChild(fileName);
        fileInfo.appendChild(fileSize);
        const statusCheck = document.createElement("span");
        statusCheck.className = "status-icon";
        statusCheck.style.color = "green";
        this.setupItemClickEvent(statusCheck);
        const deleteSpan = document.createElement("span");
        deleteSpan.className = "delete-media fa-regular fa-trash-can";
        deleteSpan.title = "Delete image";
        deleteSpan.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent triggering the container's click event
            this.deleteEvent();
        });
        this.container.appendChild(img);
        this.container.appendChild(fileInfo);
        this.container.appendChild(statusCheck);
        this.container.appendChild(deleteSpan);
    }
    formatBytes(bytes) {
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        if (bytes === 0)
            return "0 Byte";
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
        if (i === 0)
            return bytes + " " + sizes[i];
        return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
    }
    setupItemClickEvent(statusCheck) {
        this.container.addEventListener("click", () => {
            document.querySelectorAll(".file-item").forEach((el) => {
                el.classList.remove("selected");
                const icon = el.querySelector(".status-icon");
                if (icon) {
                    icon.innerHTML = el.classList.contains("invalid") ? "⚠" : "";
                }
            });
            if (this.container.classList.contains("selected")) {
                statusCheck.innerHTML = ""; // Remove checkmark if already selected
            }
            else {
                statusCheck.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="13.423" viewBox="0 0 18 13.423">
                        <path id="Icon_awesome-check" data-name="Icon awesome-check" d="M6.114,17.736l-5.85-5.85a.9.9,0,0,1,0-1.273L1.536,9.341a.9.9,0,0,1,1.273,0L6.75,13.282l8.441-8.441a.9.9,0,0,1,1.273,0l1.273,1.273a.9.9,0,0,1,0,1.273L7.386,17.736A.9.9,0,0,1,6.114,17.736Z" transform="translate(0 -4.577)" fill="#3a9341"></path>
                    </svg>
                `;
            }
            this.container.classList.toggle("selected");
            this.setupModalActions();
        });
    }
    setupModalActions() {
        var _a, _b;
        const modalActions = document.querySelector(".modal-actions");
        if (!modalActions)
            return;
        modalActions.style.display = "flex";
        // Remove existing event listeners by cloning and replacing elements
        const cancelBtn = modalActions.querySelector("#cancel-modal");
        const saveBtn = modalActions.querySelector("#save-modal");
        if (!cancelBtn || !saveBtn)
            return;
        const newCancelBtn = cancelBtn.cloneNode(true);
        const newSaveBtn = saveBtn.cloneNode(true);
        (_a = cancelBtn.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(newCancelBtn, cancelBtn);
        (_b = saveBtn.parentNode) === null || _b === void 0 ? void 0 : _b.replaceChild(newSaveBtn, saveBtn);
        const modal = document.querySelector(".tb-modal");
        if (!modal)
            return;
        newCancelBtn.addEventListener("click", () => {
            modal.style.display = "none";
            modal.remove();
        });
        newSaveBtn.addEventListener("click", () => {
            if (this.type === "tile") {
                this.addImageToTile();
            }
            else if (this.type === "content") {
                this.addImageToContentPage();
            }
            else if (this.type === "cta" && this.infoId) {
                this.updateInfoCtaButtonImage();
            }
            else if (this.type === "cta") {
                this.updateCtaButtonImage();
            }
            else if (this.type === "info") {
                this.updateInfoImage();
            }
            modal.style.display = "none";
            modal.remove();
        });
    }
    addImageToTile() {
        var _a;
        const selectedComponent = globalThis.selectedComponent;
        if (!selectedComponent)
            return;
        try {
            const safeMediaUrl = encodeURI(this.mediaFile.MediaUrl);
            selectedComponent.addStyle({
                "background-image": `url(${safeMediaUrl})`,
                "background-color": "transparent",
                "background-size": "cover",
                "background-position": "center",
                "background-blend-mode": "overlay",
            });
            selectedComponent.getEl().style.backgroundColor = "transparent";
            const updates = [
                ["BGImageUrl", safeMediaUrl],
                ["Opacity", "0"],
                ["BGColor", "transparent"],
            ];
            let tileAttributes;
            const tileWrapper = selectedComponent.parent();
            const rowComponent = tileWrapper.parent();
            const pageData = globalThis.pageData;
            if (pageData.PageType === "Information") {
                const infoSectionController = new InfoSectionController();
                for (const [property, value] of updates) {
                    infoSectionController.updateInfoTileAttributes(rowComponent.getId(), tileWrapper.getId(), property, value);
                }
                const tileInfoSectionAttributes = globalThis.infoContentMapper.getInfoContent(rowComponent.getId());
                tileAttributes = (_a = tileInfoSectionAttributes === null || tileInfoSectionAttributes === void 0 ? void 0 : tileInfoSectionAttributes.Tiles) === null || _a === void 0 ? void 0 : _a.find((tile) => tile.Id === tileWrapper.getId());
            }
            else {
                console.log("Updating tile mapper value: ", globalThis.tileMapper);
                for (const [property, value] of updates) {
                    globalThis.tileMapper.updateTile(tileWrapper.getId(), property, value);
                }
                tileAttributes = globalThis.tileMapper.getTile(rowComponent.getId(), tileWrapper.getId());
            }
            if (selectedComponent && tileAttributes) {
                const tileProperties = new TileProperties(selectedComponent, tileAttributes);
                tileProperties.setTileAttributes();
            }
        }
        catch (error) {
            console.error("Error adding image to tile:", error);
        }
    }
    addImageToContentPage() {
        return __awaiter(this, void 0, void 0, function* () {
            const safeMediaUrl = encodeURI(this.mediaFile.MediaUrl);
            const activeEditor = globalThis.activeEditor;
            const activePage = globalThis.pageData;
            const contentManager = new ContentDataManager(activeEditor, activePage);
            contentManager.updateContentImage(safeMediaUrl);
        });
    }
    updateCtaButtonImage() {
        return __awaiter(this, void 0, void 0, function* () {
            const safeMediaUrl = encodeURI(this.mediaFile.MediaUrl);
            const activeEditor = globalThis.activeEditor;
            const activePage = globalThis.pageData;
            const contentManager = new ContentDataManager(activeEditor, activePage);
            contentManager.updateCtaButtonImage(safeMediaUrl);
        });
    }
    updateInfoImage() {
        return __awaiter(this, void 0, void 0, function* () {
            const safeMediaUrl = encodeURI(this.mediaFile.MediaUrl);
            const infoSectionController = new InfoSectionController();
            infoSectionController.updateInfoImage(safeMediaUrl, this.infoId);
        });
    }
    updateInfoCtaButtonImage() {
        const safeMediaUrl = encodeURI(this.mediaFile.MediaUrl);
        const infoSectionController = new InfoSectionController();
        infoSectionController.updateInfoCtaButtonImage(safeMediaUrl, this.infoId);
    }
    deleteEvent() {
        const title = "Delete media";
        const message = "Are you sure you want to delete this media file?";
        const handleConfirmation = () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.toolboxService.deleteMedia(this.mediaFile.MediaId);
                let media = yield this.toolboxService.getMediaFiles();
                media = media.filter((item) => item.MediaId !== this.mediaFile.MediaId);
                const mediaItem = document.getElementById(this.mediaFile.MediaId);
                if (mediaItem) {
                    mediaItem.remove();
                }
                if (media.length === 0) {
                    const modalFooter = document.querySelector(".modal-actions");
                    modalFooter.style.display = "none";
                }
            }
            catch (error) {
                console.error("Error deleting media:", error);
            }
        });
        const confirmationBox = new ConfirmationBox(message, title, handleConfirmation);
        confirmationBox.render(document.body);
    }
    getElement() {
        return this.container;
    }
    render(container) {
        container.appendChild(this.container);
    }
}
//# sourceMappingURL=SingleImageFile.js.map