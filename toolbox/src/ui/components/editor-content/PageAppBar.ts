import { EditorEvents } from "../../../controls/editor/EditorEvents";
import { EditorManager } from "../../../controls/editor/EditorManager";
import { PageNameEditor } from "./PageNameEditor";

export class PageAppBar {
    private container: HTMLElement;
    private editor: EditorManager;
    private title: string;
    private id: string;

    constructor(id: string, title?: string) {
        this.title = title || "Page Name";
        this.id = id;
        this.container = document.createElement("div");
        this.editor = new EditorManager();
        this.init();
    }

    init() {
        this.container.classList.add("app-bar");

        const backButton: HTMLElement = document.createElement('svg');
        backButton.innerHTML = `
          <svg class="content-back-button" xmlns="http://www.w3.org/2000/svg" data-name="Group 14" width="47" height="47" viewBox="0 0 47 47">
            <g id="Ellipse_6" data-name="Ellipse 6" fill="none" stroke="#262626" stroke-width="1">
              <circle cx="23.5" cy="23.5" r="23.5" stroke="none"></circle>
              <circle cx="23.5" cy="23.5" r="23" fill="none"></circle>
            </g>
            <path id="Icon_ionic-ios-arrow-round-up" data-name="Icon ionic-ios-arrow-round-up" d="M13.242,7.334a.919.919,0,0,1-1.294.007L7.667,3.073V19.336a.914.914,0,0,1-1.828,0V3.073L1.557,7.348A.925.925,0,0,1,.263,7.341.91.91,0,0,1,.27,6.054L6.106.26h0A1.026,1.026,0,0,1,6.394.07.872.872,0,0,1,6.746,0a.916.916,0,0,1,.64.26l5.836,5.794A.9.9,0,0,1,13.242,7.334Z" transform="translate(13 30.501) rotate(-90)" fill="#262626"></path>
          </svg>
        `;

        backButton.addEventListener('click', (e) => {
            e.preventDefault();
            const currentFrame = document.querySelector(`#${this.id}-frame`)
            if (currentFrame) {
                let nextElement = currentFrame.nextElementSibling;
                while (nextElement) {
                    const elementToRemove = nextElement;
                    nextElement = nextElement.nextElementSibling;
                    elementToRemove.remove();
                }
                currentFrame.remove();
                new EditorEvents().activateNavigators();
            }
        });

        const pageTitle = document.createElement('h1');
        pageTitle.className = 'title';

        const truncatedTitle = this.title.length > 20 ? this.title.substring(0, 16) + "..." : this.title
        pageTitle.setAttribute('title', truncatedTitle || 'Page Name');
        pageTitle.textContent = truncatedTitle || 'Page Name';

        // PageNameEditor()

        this.container.appendChild(backButton);
        this.container.appendChild(pageTitle);
    }

    render(container: HTMLElement) {
        container.appendChild(this.container);        
    }
}