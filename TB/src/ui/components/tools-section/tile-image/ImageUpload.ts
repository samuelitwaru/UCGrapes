import { Media } from "../../../../models/Media";
import { ToolBoxService } from "../../../../services/ToolBoxService";
import { SingleImageFile } from "./SingleImageFile";

export class ImageUpload {
    private type: "tile" | "cta";
    modalContent: HTMLElement;
    toolboxService: ToolBoxService;
    
    constructor(type: any) {
        this.type = type;
        this.modalContent = document.createElement("div");
        this.toolboxService = new ToolBoxService();
        this.init();
    }

    private init() {
        this.modalContent.className = "tb-modal-content";
        
        const modalHeader = document.createElement("div");
        modalHeader.className = "tb-modal-header";
        const h2 = document.createElement("h2");
        h2.innerText = "Upload";

        const closeBtn = document.createElement("span");
        closeBtn.className = "close";
        closeBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21">
              <path id="Icon_material-close" data-name="Icon material-close" d="M28.5,9.615,26.385,7.5,18,15.885,9.615,7.5,7.5,9.615,15.885,18,7.5,26.385,9.615,28.5,18,20.115,26.385,28.5,28.5,26.385,20.115,18Z" transform="translate(-7.5 -7.5)" fill="#6a747f" opacity="0.54"></path>
            </svg>
        `;
        closeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const modal = this.modalContent.parentElement as HTMLElement;
            modal.style.display = "none";
            modal?.remove()
        });

        modalHeader.appendChild(h2);
        modalHeader.appendChild(closeBtn);


        const modalActions = document.createElement("div");
        modalActions.className = "modal-actions";

        const cancelBtn = document.createElement("button");
        cancelBtn.className = "tb-btn tb-btn-outline";
        cancelBtn.id = "cancel-modal";
        cancelBtn.innerText = "Cancel";

        const saveBtn = document.createElement("button");
        saveBtn.className = "tb-btn tb-btn-primary";
        saveBtn.id = "save-modal";
        saveBtn.innerText = "Save";

        modalActions.appendChild(cancelBtn);
        modalActions.appendChild(saveBtn);

        this.modalContent.appendChild(modalHeader);
        this.uploadArea();
        this.fileList();
        this.modalContent.appendChild(modalActions);
    }

    private uploadArea() {
        const uploadArea = document.createElement("div");
        uploadArea.className = "upload-area";
        uploadArea.id = "uploadArea";
        uploadArea.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="40.999" height="28.865" viewBox="0 0 40.999 28.865">
            <path id="Path_1040" data-name="Path 1040" d="M21.924,11.025a3.459,3.459,0,0,0-3.287,3.608,3.459,3.459,0,0,0,3.287,3.608,3.459,3.459,0,0,0,3.287-3.608A3.459,3.459,0,0,0,21.924,11.025ZM36.716,21.849l-11.5,14.432-8.218-9.02L8.044,39.89h41Z" transform="translate(-8.044 -11.025)" fill="#afadad"></path>
          </svg>
          <div class="upload-text">
            <p>Drag and drop or <a href="#" id="browseLink">browse</a></p>
        </div>
        `;
        
        this.modalContent.appendChild(uploadArea);
    }

    private fileList() {
        const fileList = document.createElement("div");
        fileList.className = "file-list";
        fileList.id = "fileList";
        
        this.toolboxService.media.forEach((media) => {
            const singleImageFile = new SingleImageFile(media);
            singleImageFile.render(fileList)
        });
        
        this.modalContent.appendChild(fileList);
    }

    public render(container: HTMLElement) {
        container.appendChild(this.modalContent);        
    }
}