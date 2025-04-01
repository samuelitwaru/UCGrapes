import { EditorManager } from "../../controls/editor/EditorManager";
import { ToolBoxService } from "../../services/ToolBoxService";
import { Alert } from "./Alert";
import { Modal } from "./Modal";

export class AllPagesComponent {
    pages: any[];
    toolboxService: ToolBoxService;
    appVersion: any;
    constructor(appVersion:any){
        this.appVersion = appVersion
        this.pages = this.appVersion.Pages
        this.toolboxService = new ToolBoxService()
        this.showList()
    }

    showList() {
        const listContainer = document.createElement("ul");
        listContainer.classList.add("tb-custom-list");
        this.pages.forEach(page => {
            const listItem = this.buildListItem(page)
            listContainer.appendChild(listItem)
        })

        const treeContainer = document.getElementById("tree-container") as HTMLDivElement
        treeContainer.innerHTML = ""
        treeContainer.appendChild(listContainer);
    }

    buildListItem(page:any) {
        const listItem = document.createElement("li");
        listItem.classList.add("tb-custom-list-item");

        const menuItem = document.createElement("div");
        menuItem.classList.add("tb-custom-menu-item");
        menuItem.classList.add("page-list-items");

        const toggle = document.createElement("span");
        toggle.style.textTransform = "capitalize";
        toggle.classList.add("tb-dropdown-toggle");
        toggle.setAttribute("role", "button");
        toggle.setAttribute("aria-expanded", "false");
        toggle.innerHTML = `<i class="fa-regular fa-file tree-icon"></i><span>&nbsp; ${page.PageName}</span>`;

        const deleteIcon = document.createElement("i");
        deleteIcon.classList.add("fa-regular", "fa-trash-can", "tb-delete-icon");

        const updateIcon = document.createElement("i");
        updateIcon.classList.add("fa-regular", "fa-edit", "tb-update-icon");

        if (page.PageName === "Home" || page.PageName === "Web Link") {
            deleteIcon.style.display = "none";
            updateIcon.style.display = "none";
        }

        const iconDiv = document.createElement("div");
        iconDiv.classList.add("tb-menu-icons-container");

        deleteIcon.setAttribute("data-id", page.PageId);
        updateIcon.setAttribute("data-id", page.PageId);

        deleteIcon.addEventListener("click", (event) => 
            this.handleDelete(event)
        );

        menuItem.appendChild(toggle);
        if (page.PageName === "Web Link") {
            menuItem.style.display = "none";
        }
        if (page.PageName !== "Home") {
            // iconDiv.append(updateIcon);
            iconDiv.append(deleteIcon);
            menuItem.appendChild(iconDiv);
        }
        listItem.appendChild(menuItem);
        return listItem;
    }

    handleDelete(event:Event) {
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
            this.toolboxService.deletePage(this.appVersion.AppVersionId, pageId).then((res)=>{
                console.log(res)
                if(!res.error.message) {
                    this.appVersion = res.AppVersion
                    this.pages = this.appVersion.Pages
                    this.showList()
                    deleteModal.close();
                    // reload the editor
                    console.log((window as any).app.toolboxApp.editor.init())
                    // console.log(window.App)
                }else {
                    new Alert("error", res.error.message)
                }
            })
        })

    }
  
}