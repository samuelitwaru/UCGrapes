import { ToolBoxService } from "../../services/ToolBoxService";
import { Alert } from "../../ui/components/Alert";
import { Modal } from "../../ui/components/Modal";
import { AppVersionManager } from "../versions/AppVersionManager";
import { EditorEvents } from "./EditorEvents";

export class DeletePageButton {
    button: HTMLButtonElement | null = null;
    pageData: any;
    toolboxService: ToolBoxService;
    appVersion: AppVersionManager
    constructor(pageData: any, container: HTMLElement) {
        this.pageData = pageData;
        this.toolboxService = new ToolBoxService();
        this.appVersion = new AppVersionManager();
        if (pageData) {
            this.pageData = pageData;
            this.button = document.createElement('button');
            // add icon
            this.button.innerHTML = `
                <svg fill="#4f6ba5" width="60" height="60" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19,6 L19,18.5 C19,19.8807119 17.8807119,21 16.5,21 L7.5,21 C6.11928813,21 5,19.8807119 5,18.5 L5,6 L4.5,6 C4.22385763,6 4,5.77614237 4,5.5 C4,5.22385763 4.22385763,5 4.5,5 L9,5 L9,4.5 C9,3.67157288 9.67157288,3 10.5,3 L13.5,3 C14.3284271,3 15,3.67157288 15,4.5 L15,5 L19.5,5 C19.7761424,5 20,5.22385763 20,5.5 C20,5.77614237 19.7761424,6 19.5,6 L19,6 Z M6,6 L6,18.5 C6,19.3284271 6.67157288,20 7.5,20 L16.5,20 C17.3284271,20 18,19.3284271 18,18.5 L18,6 L6,6 Z M14,5 L14,4.5 C14,4.22385763 13.7761424,4 13.5,4 L10.5,4 C10.2238576,4 10,4.22385763 10,4.5 L10,5 L14,5 Z M14,9.5 C14,9.22385763 14.2238576,9 14.5,9 C14.7761424,9 15,9.22385763 15,9.5 L15,16.5 C15,16.7761424 14.7761424,17 14.5,17 C14.2238576,17 14,16.7761424 14,16.5 L14,9.5 Z M9,9.5 C9,9.22385763 9.22385763,9 9.5,9 C9.77614237,9 10,9.22385763 10,9.5 L10,16.5 C10,16.7761424 9.77614237,17 9.5,17 C9.22385763,17 9,16.7761424 9,16.5 L9,9.5 Z"></path>
                </svg>
            `;
            this.button.className = 'delete-page-icon';
            this.button.title = 'Delete Page';
            this.button.setAttribute('data-id', pageData.PageId);
            this.button.addEventListener('click', (e) => this.handleDelete(e));
            
            if (!pageData.IsPredefined) {
                container.insertBefore(this.button, container.firstChild);    
            }

        }
    }
    
    handleDelete(event:Event) {
        event.preventDefault()
        const el = event.target as HTMLElement
        const pageId = el.dataset.id as string
        const body = document.createElement("div")
        const modal = document.createElement("div");
        modal.classList.add("popup-body");
        modal.id = "confirmation_modal_message";
        modal.innerText = "Are you sure you want to delete this page?";

        // Create footer container
        const footer = document.createElement("div");
        footer.classList.add("popup-footer");

        // Create delete button
        const deleteButton = document.createElement("button");
        deleteButton.id = "yes_delete";
        deleteButton.classList.add("tb-btn", "tb-btn-primary");
        deleteButton.innerText = "Delete";

        // Create cancel button
        const cancelButton = document.createElement("button");
        cancelButton.id = "close_popup";
        cancelButton.classList.add("tb-btn", "tb-btn-outline");
        cancelButton.innerText = "Cancel";

        // Append buttons to footer
        footer.appendChild(deleteButton);
        footer.appendChild(cancelButton);

        // Append modal and footer to document body
        body.appendChild(modal);
        body.appendChild(footer);
    
        const options = {
            title: 'Delete Page', 
            width: '100', 
            body: body
        }
        const deleteModal = new Modal(options)
        deleteModal.open()

        cancelButton.addEventListener('click', (e)=>{
            deleteModal.close()
        })
    
        deleteButton.addEventListener('click', (e)=>{
            this.toolboxService.deletePage(this.appVersion.appVersion.AppVersionId, this.pageData.PageId).then((res)=>{
                if(!res.error.message) {
                    deleteModal.close();
                    localStorage.removeItem(`data-${this.pageData.PageId}`);
                    const versionManager = new AppVersionManager();
                    versionManager.refreshVersion();
                    const editorEvents = new EditorEvents();
                    editorEvents.removeEditor()
                    //console.log((globalThis as any).activeVersion)
                    //(window as any).app.toolboxApp.editor.init((globalThis as any).activeVersion)
                }else {
                    new Alert("error", res.error.message)
                }
            })
        })
    }
}