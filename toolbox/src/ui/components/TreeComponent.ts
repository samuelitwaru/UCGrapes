import { AppVersionManager } from "../../controls/versions/AppVersionManager"
import { ToolBoxService } from "../../services/ToolBoxService";
import { AllPagesComponent } from "./AllPagesComponent";
import { Alert } from "./Alert";
import { i18n } from "../../i18n/i18n";

export class TreeComponent {
    appVersionManager: AppVersionManager
    pages: any;
    treeContainer: HTMLElement | null | undefined;
    mainContainer: HTMLElement | null;
    homePage: any;
    toolboxService: ToolBoxService;
    version: any;
    constructor(appVersionManager:AppVersionManager) {
        this.mainContainer = document.getElementById('mapping-section')
        this.treeContainer = document.getElementById('tree-container')
        this.renderTitle()
        this.renderHideOrShowPages()
        this.addPageCreationEvent()
        this.appVersionManager = appVersionManager
        this.toolboxService = new ToolBoxService()
        this.appVersionManager.getActiveVersion().then(res=>{
            this.version = res
            this.pages = res.Pages
            this.homePage = res.Pages?.find((page: any)=>page.PageName=="Home")
            if(this.homePage){
                this.clearMappings()
                this.createPageTree(this.homePage.PageId, "tree-container");
            }
        })
    }

    renderTitle () {
        const sidebarTitle = document.getElementById("sidebar_mapping_title") as HTMLSpanElement
        sidebarTitle.textContent = 'MAPPING';
    }

    renderHideOrShowPages() {
        const homeTitle = document.getElementById("current-page-title") as HTMLHeadElement

        // Remove all siblings after the homeTitle
        let nextElement = homeTitle.nextSibling;
        while (nextElement) {
            let toRemove = nextElement;
            nextElement = nextElement.nextSibling;
            if (toRemove.nodeType === 1) { // Ensure it's an element node
                toRemove.remove();
            }
        }

        const listPages = document.createElement('span');
        listPages.id = 'list_all_pages';
        listPages.style.display = 'block';
        listPages.textContent = 'List all pages';
        

        const hidePages = document.createElement('span');
        hidePages.id = 'hide_pages';
        hidePages.style.display = 'none';
        hidePages.textContent = 'Hide pages';

        listPages.addEventListener("click", (e)=>{
            hidePages.style.display = 'block';
            listPages.style.display = 'none';
            this.clearMappings()
            this.showAllPages()
        })

        hidePages.addEventListener("click", (e)=>{
            hidePages.style.display = 'none';
            listPages.style.display = 'block';
            if(this.homePage){
                this.clearMappings()
                this.createPageTree(this.homePage.PageId, "tree-container");
            }
        })

        homeTitle.insertAdjacentElement("afterend", hidePages)
        homeTitle.insertAdjacentElement("afterend", listPages)
        
    }

    getPage(pageId:string) {
        return this.pages.find((page: any)=>page.PageId==pageId)
    }

    showAllPages() {
        new AllPagesComponent(this.version)
    }

    createPageTree(rootPageId:string, childDivId:string) {
        let page = this.getPage(rootPageId);
        let childPages: any[] = [];
        if (page && page.PageMenuStructure) {
            page.PageMenuStructure.Rows.forEach((row:any )=> {
                row.Tiles.forEach((tile:any) => {
                    page = this.getPage(tile.Action.ObjectId)
                    if (page) {
                        childPages.push(page)
                    }
                })
            })                
            const newTree = this.createTree(rootPageId, childPages);
            const treeContainer = document.getElementById(childDivId) as HTMLDivElement;
            treeContainer.innerHTML = ""
            treeContainer.appendChild(newTree);
        }
    }

    createTree(rootPageId:string, childPages:any, isOpenable=true) {
        const listContainer = document.createElement("ul");
        listContainer.classList.add("tb-custom-list");
        childPages.forEach((page:any)=>{
            const listItem = this.buildListItem(rootPageId, page, isOpenable)
            listContainer.appendChild(listItem);
        })
        return listContainer
    }

    buildListItem(rootPageId:string, page:any, isOpenable=true) {

        if (page.PageType != "Menu") isOpenable = false

        const listItem = document.createElement("li");
        listItem.classList.add("tb-custom-list-item");
        listItem.dataset.parentPageId = rootPageId;
        const childDiv = document.createElement("div");
        childDiv.classList.add("child-div");
        childDiv.id = `child-div-${page.PageId}`;
        childDiv.style.position = "relative";
        childDiv.style.paddingLeft = "20px";

        const menuItem = document.createElement("div");
        menuItem.classList.add("tb-custom-menu-item");

        const toggle = document.createElement("span");
        toggle.classList.add("tb-dropdown-toggle");
        toggle.setAttribute("role", "button");
        toggle.setAttribute("aria-expanded", "false");

        let icon = "fa-regular fa-file tree-icon";
        
        if (isOpenable) {
            icon = "fa-caret-right tree-icon"
        }
        toggle.innerHTML = `<i class="fa ${icon}"></i><span>${page.PageName}</span>`;

        menuItem.appendChild(toggle);
        listItem.appendChild(menuItem);
        listItem.appendChild(childDiv);
        if (isOpenable) {
            listItem.addEventListener("click", (e) => {
                e.stopPropagation();
                this.createPageTree(page.PageId, `child-div-${page.PageId}`);
            });
        }
        return listItem;
    }

    clearMappings() {
        this.treeContainer?.replaceChildren('')
    }

    addPageCreationEvent() {
        const pageSubmitButton = document.getElementById("page-submit") as HTMLButtonElement
        const titleInput = document.getElementById("page-title") as HTMLInputElement
        pageSubmitButton.addEventListener("click", (e)=>{
            e.preventDefault()
            const pageName = titleInput.value
            if (pageName) {
                this.createPage(pageName)
            }else {
                new Alert("error", i18n.t("messages.error.empty_page_name"))
            }
        })
    }

    createPage (pageName:string) {
        this.toolboxService.createMenuPage(this.version.AppVersionId, pageName).then((res)=>{
            console.log(res)
        })
    }

}