import { ToolBoxService } from "../../services/ToolBoxService";
import { Alert } from "../../ui/components/Alert";
import { Modal } from "../../ui/components/Modal";
import { AppVersionManager } from "../versions/AppVersionManager";

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
            this.button.innerHTML = '<i class="fa fa-trash"></i>';
            this.button.className = 'delete-page-icon';
            this.button.title = 'Delete Page';
            this.button.setAttribute('data-id', pageData.PageId);
            this.button.addEventListener('click', (e) => this.handleDelete(e));
            container.insertBefore(this.button, container.firstChild);     
            
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
                console.log('fd', res)
                if(!res.error.message) {
                    deleteModal.close();
                    localStorage.removeItem(`data-${this.pageData.PageId}`);
                    (window as any).app.toolboxApp.editor.init()
                }else {
                    new Alert("error", res.error.message)
                }
            })
        })
    }
}