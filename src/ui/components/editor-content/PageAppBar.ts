import { EditorEvents } from "../../../controls/editor/EditorEvents";
import { EditorManager } from "../../../controls/editor/EditorManager";
import { AppVersionManager } from "../../../controls/versions/AppVersionManager";

export class PageAppBar {
    private container: HTMLElement;
    private editor: EditorManager;
    private title: string;
    private id: string;
    editorWidth: number;
    isNewPage: boolean;
    private pageTitle: HTMLHeadingElement | null = null;
    private editHeader: SVGSVGElement | null = null;
    private saveChange: SVGSVGElement | null = null;
    private titleDiv: HTMLDivElement | null = null;
    private isInEditMode: boolean = false;
    private originalTitle: string; // Store the original title for cancellation

    constructor(id: string, title?: string, isNewPage: boolean = false) {
        this.title = title || "Page Name";
        this.originalTitle = this.title; // Store original title
        this.id = id;
        this.isNewPage = isNewPage;
        this.container = document.createElement("div");
        this.editor = new EditorManager();
        this.editorWidth = (globalThis as any).deviceWidth;
        this.init();
    }

    init() {
        this.container.classList.add("app-bar");

        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
        <svg class="content-back-button" xmlns="http://www.w3.org/2000/svg" data-name="Group 14" width="47" height="47" viewBox="0 0 47 47">
            <g id="Ellipse_6" data-name="Ellipse 6" fill="none" stroke="#262626" stroke-width="1">
            <circle cx="23.5" cy="23.5" r="23.5" stroke="none"></circle>
            <circle cx="23.5" cy="23.5" r="23" fill="none"></circle>
            </g>
            <path id="Icon_ionic-ios-arrow-round-up" data-name="Icon ionic-ios-arrow-round-up" d="M13.242,7.334a.919.919,0,0,1-1.294.007L7.667,3.073V19.336a.914.914,0,0,1-1.828,0V3.073L1.557,7.348A.925.925,0,0,1,.263,7.341.91.91,0,0,1,.27,6.054L6.106.26h0A1.026,1.026,0,0,1,6.394.07.872.872,0,0,1,6.746,0a.916.916,0,0,1,.64.26l5.836,5.794A.9.9,0,0,1,13.242,7.334Z" transform="translate(13 30.501) rotate(-90)" fill="#262626"></path>
        </svg>
        `;

        const backButton = wrapper.firstElementChild;
        const thumbsList = document.querySelector(".editor-thumbs-list") as HTMLElement;
        backButton?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation()
            const currentFrame = document.querySelector(`#${this.id}-frame`)
            const previousFrame = currentFrame?.previousElementSibling as HTMLDivElement

            if(previousFrame && previousFrame?.classList.contains("mobile-frame")) {
                (globalThis as any).pageId = previousFrame.dataset.pageid;
                (globalThis as any).uiManager.activateEditor(previousFrame.id.replace('-frame', ''))
            } 
            if (currentFrame) {
                let nextElement = currentFrame.nextElementSibling;
                while (nextElement) {
                    const elementToRemove = nextElement;
                    nextElement = nextElement.nextElementSibling;

                    const thumbToRemove = thumbsList.querySelector(`div[id="${elementToRemove.id}"]`);
                    if (thumbToRemove) {
                        thumbToRemove.parentElement?.parentElement?.parentElement?.remove();
                    }

                    elementToRemove.remove();
                }
                const thumbToRemove = thumbsList.querySelector(`div[id="${currentFrame.id}"]`);
                if (thumbToRemove) {
                    thumbToRemove.parentElement?.parentElement?.parentElement?.remove();
                }
                currentFrame.remove();
                new EditorEvents().activateNavigators();
            }
        });

        const titleDiv = document.createElement('div');
        titleDiv.classList.add('appbar-title-container');
        this.titleDiv = titleDiv;

        const pageTitle = document.createElement('h1');
        pageTitle.className = 'title';
        const length = this.editorWidth ? (this.editorWidth <= 350 ? 16 : 24) : 16;
        const truncatedTitle = this.title.length > length ? this.title.substring(0, length) + "..." : this.title;
        pageTitle.setAttribute('title', this.title || 'Page Name');
        pageTitle.textContent = truncatedTitle || 'Page Name';
        this.pageTitle = pageTitle;

        // Create a container div for the edit/save icons
        const iconContainer = document.createElement('div');
        iconContainer.classList.add('icon-container');

        const editHeader = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        editHeader.id = "edit_page_title";
        editHeader.setAttribute("width", "14px");
        editHeader.setAttribute("height", "14px");
        editHeader.setAttribute("viewBox", "0 0 24 24");
        editHeader.setAttribute("fill", "none");
        editHeader.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        editHeader.innerHTML = `
            <path fill-rule="evenodd" clip-rule="evenodd" d="M18.4324 4C18.2266 4 18.0227 4.04055 17.8325 4.11933C17.6423 4.19811 17.4695 4.31358 17.3239 4.45914L5.25659 16.5265L4.42524 19.5748L7.47353 18.7434L19.5409 6.67608C19.6864 6.53051 19.8019 6.3577 19.8807 6.16751C19.9595 5.97732 20 5.77348 20 5.56761C20 5.36175 19.9595 5.1579 19.8807 4.96771C19.8019 4.77752 19.6864 4.60471 19.5409 4.45914C19.3953 4.31358 19.2225 4.19811 19.0323 4.11933C18.8421 4.04055 18.6383 4 18.4324 4ZM17.0671 2.27157C17.5 2.09228 17.9639 2 18.4324 2C18.9009 2 19.3648 2.09228 19.7977 2.27157C20.2305 2.45086 20.6238 2.71365 20.9551 3.04493C21.2864 3.37621 21.5492 3.7695 21.7285 4.20235C21.9077 4.63519 22 5.09911 22 5.56761C22 6.03611 21.9077 6.50003 21.7285 6.93288C21.5492 7.36572 21.2864 7.75901 20.9551 8.09029L8.69996 20.3454C8.57691 20.4685 8.42387 20.5573 8.25597 20.6031L3.26314 21.9648C2.91693 22.0592 2.54667 21.9609 2.29292 21.7071C2.03917 21.4534 1.94084 21.0831 2.03526 20.7369L3.39694 15.7441C3.44273 15.5762 3.53154 15.4231 3.6546 15.3001L15.9097 3.04493C16.241 2.71365 16.6343 2.45086 17.0671 2.27157Z" fill="#5068a8"></path>
        `;
        this.editHeader = editHeader;

        const saveChange = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        saveChange.id = "save_page_title";
        saveChange.style.display = "none";
        saveChange.setAttribute('width', '24px');
        saveChange.setAttribute('height', '24px');
        saveChange.setAttribute('viewBox', '0 0 48 48');
        saveChange.setAttribute('fill', 'none');
        saveChange.innerHTML = `
            <rect width="48" height="48" fill="white" fill-opacity="0.01"/>
            <path d="M43 11L16.875 37L5 25.1818" stroke="#5068a8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        `;
        this.saveChange = saveChange;

        // Append the icons to the container
        iconContainer.appendChild(editHeader);
        iconContainer.appendChild(saveChange);

        const enterEditMode = () => {
            if (this.pageTitle) {
                this.isInEditMode = true;
                // Store the current title for possible cancellation
                this.originalTitle = this.pageTitle.title;

                this.pageTitle.contentEditable = 'true';
                this.pageTitle.textContent = this.isNewPage || this.title === "Untitled" ? '' : this.pageTitle.title;
                this.pageTitle.focus();

                const range = document.createRange();
                range.selectNodeContents(this.pageTitle);
                range.collapse(false);
                const selection = window.getSelection();
                selection?.removeAllRanges();
                selection?.addRange(range);

                // Remove focus border
                this.pageTitle.style.outline = "none";
                this.pageTitle.style.whiteSpace = "nowrap";
                this.pageTitle.style.overflow = "hidden";
                this.pageTitle.style.textOverflow = "clip";

                if (this.editHeader && this.saveChange && this.titleDiv) {
                    this.editHeader.style.display = "none";
                    this.saveChange.style.display = "block";
                    this.titleDiv.style.borderWidth = "1px";

                    this.updateSaveButtonState();
                }
            }
        };

        editHeader.addEventListener('click', enterEditMode);

        this.updateSaveButtonState();

        pageTitle.addEventListener("input", () => {
            if (this.pageTitle) {
                this.pageTitle.textContent || "";
                this.pageTitle.title = this.pageTitle.textContent || "";
                this.title = this.pageTitle.title
                this.updateSaveButtonState();
            }
        });

        saveChange.addEventListener("click", (e) => {
            e.preventDefault();
            if (this.pageTitle && this.pageTitle.title.trim() !== "") {
                const appVersionManager = new AppVersionManager();
                appVersionManager.updatePageTitle(this.pageTitle.title);
                this.title = this.pageTitle.title;
                this.originalTitle = this.title;
                this.resetTitle(true);
                this.refreshPage();
            }
        });

        // Handle clicks outside the title editing area
        document.addEventListener("click", (event: MouseEvent) => {
            const target = event.target as Element;
            if (this.isInEditMode && this.shouldResetTitle(target)) {
                this.resetTitle();
            }
        });

        if (backButton) this.container.appendChild(backButton);
        titleDiv.appendChild(pageTitle);
        titleDiv.appendChild(iconContainer);
        this.container.appendChild(titleDiv);

        if (this.isNewPage || this.title === "Untitled") {
            setTimeout(() => {
                enterEditMode();
            }, 0);
        }
    }

    private shouldResetTitle(clickTarget: Element): boolean {
        if (!this.isInEditMode) return false;

        return !(
            clickTarget === this.editHeader ||
            clickTarget === this.pageTitle ||
            clickTarget === this.titleDiv ||
            this.titleDiv?.contains(clickTarget) ||
            (clickTarget.closest && clickTarget.closest('.appbar-title-container'))
        );
    }

    private updateSaveButtonState() {
        if (!this.saveChange) return;

        const titleText = this.pageTitle?.title || "";
        const trimmedTitle = titleText.trim();

        if (trimmedTitle === "") {
            this.saveChange.style.pointerEvents = "none";
            this.saveChange.style.opacity = "0.5";
        } else {
            this.saveChange.style.pointerEvents = "all";
            this.saveChange.style.opacity = "1";
        }
    }

    resetTitle(isSaved: boolean = false) {
        if (!this.pageTitle || !this.editHeader || !this.saveChange || !this.titleDiv) return;

        this.isInEditMode = false;
        this.pageTitle.contentEditable = "false";
        this.editHeader.style.display = "block";
        this.saveChange.style.display = "none";
        this.titleDiv.style.removeProperty("border-width");
        this.pageTitle.style.whiteSpace = "";
        this.pageTitle.style.overflow = "";
        this.pageTitle.style.textOverflow = "";

        if (!isSaved) {
            const length = this.editorWidth ? (this.editorWidth <= 350 ? 16 : 24) : 16;
            const displayTitle = this.title;

            if (displayTitle.length > length) {
                this.pageTitle.textContent = displayTitle.substring(0, length) + "...";
            } else {
                this.pageTitle.textContent = displayTitle;
            }
        }
    }

    private refreshPage() {
        const editor = (globalThis as any).activeEditor;
        if (editor) {
            const newInfoSectionButton = editor.getWrapper().find(".add-new-info-section")[0];
            if (newInfoSectionButton) {
                newInfoSectionButton.addStyle({ display: "flex" });
            }

            const unTitledPage = editor.getWrapper().find(".untitled-page")[0];
            if (unTitledPage) {
                unTitledPage.removeClass("untitled-page");
            }
        }
    }


    render(container: HTMLElement) {
        container.appendChild(this.container);
    }
}