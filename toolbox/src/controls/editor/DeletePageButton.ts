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
            this.button.innerHTML = `
                <svg id="Component_63_1" data-name="Component 63 – 1" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 46 46">
                    <path id="Icon_feather-trash-2-converted" data-name="Icon feather-trash-2-converted" d="M7.134.03A2.728,2.728,0,0,0,5.026,1.548a2.879,2.879,0,0,0-.251,1.543l-.019.9L2.613,4,.471,4,.33,4.085a.624.624,0,0,0-.312.56.543.543,0,0,0,.19.452c.2.178.18.174.809.19l.6.017.017,6.861c.016,6.52.02,6.872.076,7.055a2.713,2.713,0,0,0,2.325,1.972c.374.042,10.793.042,11.167,0a2.676,2.676,0,0,0,2.16-1.55,3.9,3.9,0,0,0,.165-.422c.056-.183.06-.535.076-7.055L17.615,5.3l.6-.017c.629-.016.612-.012.809-.19a.543.543,0,0,0,.19-.452.624.624,0,0,0-.312-.56L18.758,4,16.615,4,14.472,3.99l-.017-.9-.017-.9-.1-.3A2.733,2.733,0,0,0,12.42.087,12.086,12.086,0,0,0,9.759.01c-1.323,0-2.5.005-2.625.02m4.924,1.318a1.468,1.468,0,0,1,.921.686c.159.285.178.417.178,1.218V3.99H6.071l-.009-.625a7.721,7.721,0,0,1,.024-.851A1.433,1.433,0,0,1,7.129,1.356c.218-.053,4.68-.061,4.929-.008m4.258,10.57c0,4.182-.012,6.7-.032,6.822A1.426,1.426,0,0,1,15.2,19.874c-.241.052-10.931.052-11.172,0a1.426,1.426,0,0,1-1.084-1.134c-.02-.121-.032-2.639-.032-6.822V5.287h13.4v6.63M7.491,9.712A.69.69,0,0,0,7.078,10L7,10.109v5.306l.1.137a.65.65,0,0,0,1.065-.013l.089-.129.009-2.568q.013-1.338-.011-2.675a.753.753,0,0,0-.378-.418.7.7,0,0,0-.381-.037m3.941.016a.692.692,0,0,0-.442.4c-.021.074-.029,1.007-.023,2.7l.009,2.583.089.129a.65.65,0,0,0,1.065.013l.1-.137.009-2.586c.007-1.7,0-2.626-.024-2.7a.748.748,0,0,0-.321-.366.666.666,0,0,0-.46-.034" transform="translate(13.386 12.383)" fill="#4f6ba5" fill-rule="evenodd"/>
                </svg>
            `;
            this.button.className = 'delete-page-icon';
            this.button.title = 'Delete Page';
            this.button.setAttribute('data-id', pageData.PageId);
            this.button.addEventListener('click', (e) => this.handleDelete(e));
            console.log('pageData', pageData.PageType)
            if (pageData.PageType == "Menu" || pageData.PageType == "Content") {
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
                    (window as any).app.toolboxApp.editor.init()
                }else {
                    new Alert("error", res.error.message)
                }
            })
        })
    }
}