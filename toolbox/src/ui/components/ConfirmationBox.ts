import { ToolBoxService } from "../../services/ToolBoxService";
import { ImageUpload } from "./tools-section/tile-image/ImageUpload";

export class ConfirmationBox {
    private container: HTMLElement;
    private message: string;
    private title: string; 
    private mediaId: string;
    private toolboxService: ToolBoxService;

    constructor(message: string, title: string, mediaId: string) {
        this.container = document.createElement('div');
        this.message = message;
        this.title = title;
        this.toolboxService = new ToolBoxService();
        this.mediaId = mediaId;

        this.init();
    }

    private init(): void {
        this.container.classList.add('popup-modal');
        this.container.style.display = "flex";

        const confirmationBox = document.createElement('div');
        confirmationBox.classList.add('popup');

        const confirmationHeader = document.createElement('div');
        confirmationHeader.classList.add('popup-header');

        const span = document.createElement('span');
        span.innerText = this.title;

        const closeBtn = document.createElement('button');
        closeBtn.classList.add('close');
        closeBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 21 21">
                <path id="Icon_material-close" data-name="Icon material-close" d="M28.5,9.615,26.385,7.5,18,15.885,9.615,7.5,7.5,9.615,15.885,18,7.5,26.385,9.615,28.5,18,20.115,26.385,28.5,28.5,26.385,20.115,18Z" transform="translate(-7.5 -7.5)" fill="#6a747f" opacity="0.54"></path>
            </svg>
        `;

        closeBtn.addEventListener('click', () => {
            this.close();
        });

        confirmationHeader.appendChild(span);
        confirmationHeader.appendChild(closeBtn);

        const hr = document.createElement('hr');

        const confirmationBody = document.createElement('div');
        confirmationBody.classList.add('popup-body');
        confirmationBody.id = "confirmation_modal_message";
        confirmationBody.innerText = this.message;

        const confirmationFooter = document.createElement('div');
        confirmationFooter.classList.add('popup-footer');

        const cancelBtn = document.createElement('button');
        cancelBtn.className = "tb-btn tb-btn-outline";
        cancelBtn.id = "cancel_confirmation";
        cancelBtn.innerText = "Cancel";

        cancelBtn.addEventListener('click', () => {
            this.close();
        });

        const confirmBtn = document.createElement('button');
        confirmBtn.className = "tb-btn tb-btn-primary";
        confirmBtn.id = "confirm_action";
        confirmBtn.innerText = "Confirm";

        confirmBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await this.toolboxService.deleteMedia(this.mediaId);
                this.toolboxService.media = this.toolboxService.media.filter(
                    item => item.MediaId !== this.mediaId
                );
                const mediaItem = document.getElementById(this.mediaId);                
                if (mediaItem) {
                    mediaItem.remove();
                }                
                
                if (this.toolboxService.media.length === 0) {
                    const modalFooter = document.querySelector(".modal-actions") as HTMLElement;
                    modalFooter.style.display = "none";
                }
                this.close();
            } catch (error) {
                console.error("Error deleting media:", error);
                // Optionally add error handling UI here
            }
        });

        confirmationFooter.appendChild(confirmBtn);
        confirmationFooter.appendChild(cancelBtn);

        confirmationBox.appendChild(confirmationHeader);
        confirmationBox.appendChild(hr);
        confirmationBox.appendChild(confirmationBody);
        confirmationBox.appendChild(confirmationFooter);

        this.container.appendChild(confirmationBox);
    }

    close() {
        this.container.remove();
    }
    
    public render(container: HTMLElement) {
        container.appendChild(this.container);        
    }
}