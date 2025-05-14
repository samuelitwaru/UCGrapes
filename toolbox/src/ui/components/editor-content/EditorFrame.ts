import { DeletePageButton } from "../../../controls/editor/DeletePageButton";
import { FrameHeader } from "./FrameHeader";
import { HomeAppBar } from "./HomeAppBar";
import { PageAppBar } from "./PageAppBar";

export class EditorFrame {
    private container: HTMLElement;
    private id: string;
    private isHome: boolean;
    private pageName?: string;
    pageData: any;
    isNewPage: boolean = false;

    constructor(id: string, isHome: boolean = false, pageData:any, pageName?: string, isNewPage: boolean = false) {
        this.container = document.createElement('div');
        this.id = id;
        this.isHome = isHome
        this.pageName = pageName;
        this.pageData = pageData
        this.isNewPage = isNewPage
        this.init();
    }

    init() {
        this.container.className = "mobile-frame";
        this.container.id = `${this.id}-frame`;
        this.container.setAttribute('data-pageid', this.pageData.PageId);

        const frameHeader = new FrameHeader();
        const homeAppBar = new HomeAppBar();
        const pageAppBar = new PageAppBar(this.id, this.pageName, this.isNewPage); 

        frameHeader.render(this.container);
        if (this.isHome) {
            homeAppBar.render(this.container);
        } else {
            pageAppBar.render(this.container);
        }
        
        const editor = document.createElement('div');
        editor.id = this.id;
        this.container.appendChild(editor);

        const deletePageButton = new DeletePageButton(this.pageData, this.container);
    }

    render(container: HTMLElement) {
        container.appendChild(this.container);
    }
}