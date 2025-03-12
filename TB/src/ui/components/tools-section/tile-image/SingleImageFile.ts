import { Media } from "../../../../models/Media"; // Fixed typo in import name
import { ConfirmationBox } from "../../ConfirmationBox";
import { ImageUpload } from "./ImageUpload";

export class SingleImageFile {
    private container: HTMLElement;
    private mediaFile: Media;

    constructor(mediaFile: Media) {
        this.mediaFile = mediaFile;
        this.container = document.createElement('div');
        this.init();
    }

    private init() {
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

    private formatBytes(bytes: number) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
        if (i === 0) return bytes + ' ' + sizes[i];
        return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
    }

    private setupItemClickEvent(statusCheck: HTMLElement) {
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
            } else {
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

    private setupModalActions() {
        const modalActions = document.querySelector(".modal-actions") as HTMLElement;
        if (!modalActions) return;
        
        modalActions.style.display = 'flex';

        // Remove existing event listeners by cloning and replacing elements
        const cancelBtn = modalActions.querySelector("#cancel-modal") as HTMLElement;
        const saveBtn = modalActions.querySelector("#save-modal") as HTMLElement;
        
        if (!cancelBtn || !saveBtn) return;
        
        const newCancelBtn = cancelBtn.cloneNode(true) as HTMLElement;
        const newSaveBtn = saveBtn.cloneNode(true) as HTMLElement;
        
        cancelBtn.parentNode?.replaceChild(newCancelBtn, cancelBtn);
        saveBtn.parentNode?.replaceChild(newSaveBtn, saveBtn);
        
        const modal = document.querySelector(".tb-modal") as HTMLElement;
        if (!modal) return;
        
        newCancelBtn.addEventListener("click", () => {
            modal.style.display = "none";
            modal.remove();
        });

        newSaveBtn.addEventListener("click", () => {
            this.addImageToTile();
            modal.style.display = "none";
            modal.remove();
        });
    }

    private addImageToTile() {
        const selectedComponent = (globalThis as any).selectedComponent;
        if (!selectedComponent) return;
        
        try {
            const safeMediaUrl = encodeURI(this.mediaFile.MediaUrl);
            console.log(safeMediaUrl);
            selectedComponent.addStyle({
                "background-image": `url(${safeMediaUrl})`,
                "background-color": "transparent",
                "background-size": "cover",
                "background-position": "center",
                "background-blend-mode": "overlay",
            });

            (globalThis as any).tileManager.updateTile(
                selectedComponent.parent().getId(),
                "BGImageUrl",
                safeMediaUrl
              );
            
            (globalThis as any).tileManager.updateTile(
                selectedComponent.parent().getId(),
                "Opacity",
                '0'
              );
        } catch (error) {
            console.error("Error adding image to tile:", error);
        }
    }

    private deleteEvent() {
        const title = "Delete media";
        const message = "Are you sure you want to delete this media file?";
        const confirmationBox = new ConfirmationBox(
            message,
            title,
            this.mediaFile.MediaId
        );
        confirmationBox.render(document.body);
    }

    public getElement(): HTMLElement {
        return this.container;
    }

    public render(container: HTMLElement) {
        container.appendChild(this.container);
    }
}