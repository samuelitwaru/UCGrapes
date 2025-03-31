import { AppConfig } from "../../AppConfig";
import { ToolBoxService } from "../../services/ToolBoxService";
import { Alert } from "../../ui/components/Alert";
import { PageAttacher } from "../../ui/components/tools-section/action-list/PageAttacher";
import { AppVersionManager } from "../versions/AppVersionManager";
import { EditorManager } from "./EditorManager";

export class NewPageButton {
    toolboxService: ToolBoxService;
    appVersionManager: AppVersionManager;
    pageAttacher: PageAttacher;
    constructor(toolboxService:ToolBoxService, appVersionManager:AppVersionManager) {
        this.toolboxService = toolboxService
        this.appVersionManager = appVersionManager
        this.pageAttacher = new PageAttacher();
        const menuContainer = this.render();
        const childContainer = document.getElementById('child-container')
        childContainer?.appendChild(menuContainer)
    }

    render() {
        // Create menu container
        const menuContainer = document.createElement("div");
        menuContainer.classList.add("menu-container");

        // Create button
        const menuButton = document.createElement("button");
        menuButton.classList.add("menu-button");
        menuButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24.053" height="26.783" viewBox="0 0 24.053 26.783">                 <path class="icon-path" d="M2.672.038a2.041,2.041,0,0,0-1.4.408,2.87,2.87,0,0,0-1.154,1.6l-.094.3V22.761l.093.32a2.724,2.724,0,0,0,.7,1.207,2.65,2.65,0,0,0,1.04.706l.288.117H7.692c5.545,0,5.555,0,5.629.083a4.979,4.979,0,0,0,.418.337A6.472,6.472,0,0,0,16.6,26.738a8.81,8.81,0,0,0,2,0,6.5,6.5,0,0,0,5.409-5.425,7.669,7.669,0,0,0-.023-2.078,6.5,6.5,0,0,0-4.323-5.046,5.3,5.3,0,0,0-.516-.152L19,14.012l.012-2.195c.01-1.66,0-2.305-.042-2.651l-.054-.457-.445-.487Q16.888,6.5,15.289,4.8c-3.2-3.414-4.34-4.6-4.541-4.714A23.429,23.429,0,0,0,6.971.016q-2.15-.009-4.3.022m6.82,4.753a14.651,14.651,0,0,0,.1,3.184,2.955,2.955,0,0,0,1.551,1.847c.5.24.518.241,4.914.258l1.135.005V13.85l-.371.051a6.48,6.48,0,0,0-5.495,8.034,6.926,6.926,0,0,0,.4,1.126l.083.162H2.345l-.168-.144a1.487,1.487,0,0,1-.269-.315l-.1-.171L1.8,12.612l-.01-9.98L1.9,2.4a.736.736,0,0,1,.626-.476c.123-.013,1.737-.026,3.585-.03l3.361-.006.018,2.9m3.87.641c.885.935,1.82,1.926,2.078,2.2l.468.5-.531.032c-.292.018-1.155.024-1.917.014-1.6-.022-1.718-.041-1.925-.3a1.537,1.537,0,0,1-.171-.27c-.056-.133-.1-3.62-.053-4.071l.028-.261.206.227c.114.125.932.992,1.817,1.927m5.066,9.959a5.047,5.047,0,0,1,3.626,2.649,4.5,4.5,0,0,1,.545,2.29,4.806,4.806,0,0,1-.843,2.818,6.309,6.309,0,0,1-1.393,1.374,5.022,5.022,0,0,1-7.053-1.6,5.09,5.09,0,0,1-.467-4.129A5.21,5.21,0,0,1,14.1,16.765a4.988,4.988,0,0,1,4.328-1.374m-.972,1.85a.638.638,0,0,0-.241.158l-.119.124-.012,1.223-.012,1.223H15.9c-1.1,0-1.182,0-1.305.08a.528.528,0,0,0-.217.721c.146.272.206.283,1.523.283h1.176v1.191c0,1.124,0,1.2.081,1.322a.539.539,0,0,0,.913-.01c.063-.1.072-.242.083-1.305l.012-1.2H19.33c1.263,0,1.307-.006,1.479-.225a.6.6,0,0,0,0-.611c-.143-.234-.229-.248-1.5-.248H18.161V18.854a11.308,11.308,0,0,0-.041-1.265.549.549,0,0,0-.663-.348" fill="#6e7276" fill-rule="evenodd"/>             </svg>`;

        // Create dropdown menu
        const dropdownMenu = document.createElement("div");
        dropdownMenu.classList.add("menu");
        dropdownMenu.id = "dropdownMenu";

        // Create menu items
        const menuItem1 = document.createElement("div");
        menuItem1.classList.add("menu-item");
        menuItem1.textContent = "Add menu page";
        menuItem1.addEventListener("click", () => {
            this.createNewPage("Untitled");
        });

        const menuItem2 = document.createElement("div");
        menuItem2.classList.add("menu-item");
        menuItem2.textContent = "Add content page";
        menuItem2.addEventListener("click", () => {
            const config = AppConfig.getInstance();
            config.addServiceButtonEvent()
        });

        dropdownMenu.appendChild(menuItem1);
        dropdownMenu.appendChild(menuItem2);

        menuButton.addEventListener("click", (e) => {
            e.preventDefault(); 
        });

        // Append elements to the container
        menuContainer.appendChild(menuButton);
        menuContainer.appendChild(dropdownMenu);

        // on button hover
        menuButton.addEventListener("mouseover", () => {
            // get position of the button in parent div
            const rect = menuContainer.getBoundingClientRect();
            
            const children = menuContainer?.parentNode?.children || [];

            if (children.length > 2) {
                dropdownMenu.style.top = "60px"
                dropdownMenu.style.left = "-100%"
            } else {
                dropdownMenu.style.top = "-10px";
                dropdownMenu.style.left = "100%";
            }
        });

        return menuContainer;
    }

    async createNewPage(title:string) {
        const appVersion = await this.appVersionManager.getActiveVersion()
        this.toolboxService.createMenuPage(appVersion.AppVersionId, title).then(res=>{
            if(!res.error.message) {
                const page = {
                    PageId: res.MenuPage.PageId,
                    PageName: res.MenuPage.PageName,
                    TileName: res.MenuPage.PageName
                }
                this.pageAttacher.attachToTile(page, "Menu", "Menu")
            }else{
                console.error("error", res.error.message)
            }

        })
    }
}