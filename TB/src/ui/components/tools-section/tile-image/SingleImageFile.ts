import { Media } from "../../../../models/Media";
import { ImageUpload } from "./ImageUpload";

export class SingleImageFile {
    private container: HTMLElement;
    private mediaFile: Media

    constructor(mediaFile: Media) {
        this.mediaFile = mediaFile;
        this.container = document.createElement('div');
        this.init();
    }

    private init() {
        this.container.className = "file-item valid";
        
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
        
        this.itemClickEvent(statusCheck);

        const deleteSpan = document.createElement("span");
        deleteSpan.className = "delete-media fa-regular fa-trash-can";
        deleteSpan.title = "Delete image";

        this.container.appendChild(img)
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

    private itemClickEvent(statusCheck: HTMLElement) {
        this.container.onclick = () => {
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
                        <path id="Icon_awesome-check" d="M6.114,17.736l-5.85-5.85a.9.9,0,0,1,0-1.273L1.536,9.341a.9.9,0,0,1,1.273,0L6.75,13.282l8.441-8.441a.9.9,0,0,1,1.273,0l1.273,1.273a.9.9,0,0,1,0,1.273L7.386,17.736A.9.9,0,0,1,6.114,17.736Z" transform="translate(0 -4.577)" fill="#3a9341"></path>
                    </svg>
                `;
            }
            this.container.classList.toggle("selected");
            this.handleModalActions();
        }
    }

    
    public handleModalActions () {
        const modalActions = document.querySelector(".modal-actions") as HTMLElement;
        if (modalActions) {
            modalActions.style.display = 'flex';
        }

        const cancelBtn = modalActions.querySelector("#cancel-modal") as HTMLElement;
        const saveBtn = modalActions.querySelector("#save-modal") as HTMLElement;
        const modal = document.querySelector(".tb-modal") as HTMLElement;
        
        cancelBtn.addEventListener("click", () => {
            modal.style.display = "none";
            modal.remove();
        });

        saveBtn.addEventListener("click", () => {
            this.addImageToTile();
            modal.style.display = "none";
            modal.remove();
        })
    }

    addImageToTile() {
        const selectedComponent = (globalThis as any).selectedComponent;
        if (!selectedComponent) return;
        const safeMediaUrl = encodeURI(this.mediaFile.MediaUrl);
        selectedComponent.addStyle({
            "background-image": `url(${safeMediaUrl})`,
            "background-size": "cover",
            "background-position": "center",
            "background-blend-mode": "overlay",
          });
    }
    

    public render(container: HTMLElement) {
        container.appendChild(this.container);
    }
}