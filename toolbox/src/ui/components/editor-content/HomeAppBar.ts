import { EditorManager } from "../../../controls/editor/EditorManager";

export class HomeAppBar {
    private container: HTMLElement;
    private editor: EditorManager;

    constructor() {
        this.container = document.createElement("div");
        this.editor = new EditorManager();
        this.init();
    }

    init() {
        this.container.classList.add("home-app-bar");

        const logoSection = document.createElement("div");
        logoSection.classList.add("logo-added");
        
        const logo: HTMLImageElement | any = document.createElement("img") as HTMLImageElement;
        logo.src = this.editor.organisationLogo || `/Resources/ComfortaLogo1.png`;
        logo.style.height = "35px";

        logoSection.appendChild(logo);

        const profileSection = document.createElement("div");
        profileSection.classList.add("profile-section");
        profileSection.style.display = "flex";
        profileSection.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 19.422 21.363">
                <path id="Path_1327" data-name="Path 1327" d="M15.711,5a6.8,6.8,0,0,0-3.793,12.442A9.739,9.739,0,0,0,6,26.364H7.942a7.769,7.769,0,1,1,15.537,0h1.942A9.739,9.739,0,0,0,19.5,17.442,6.8,6.8,0,0,0,15.711,5Zm0,1.942A4.855,4.855,0,1,1,10.855,11.8,4.841,4.841,0,0,1,15.711,6.942Z" transform="translate(-6 -5)" fill="#fff"></path>
            </svg>
        `;

        this.container.appendChild(logoSection);
        this.container.appendChild(profileSection);
    }

    render(container: HTMLElement) {
        container.appendChild(this.container);        
    }
}