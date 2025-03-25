import { baseURL, ToolBoxService } from "../../services/ToolBoxService";
import { Modal } from "../../ui/components/Modal";
import { AppVersionManager } from "./AppVersionManager";

export class AppVersionController {
    toolboxService: any;
    appVersion: any;

    constructor() {
        this.toolboxService = new ToolBoxService();
        this.appVersion = new AppVersionManager();
    } 
    
    async openShareLinkModal() {
        const div = document.createElement("div");
        const p = document.createElement("p");
        p.innerText = "A shareable link has been generated for you. Copy it and share for previews!";
        
        const linkSection = document.createElement("div");
        linkSection.classList.add("share-link-body");
        linkSection.style.display = "flex";
        linkSection.style.flexDirection = "column";
        linkSection.style.padding = "10px";

        const link = document.createElement("a");
        link.href = await this.createLink();
        link.innerText = await this.createLink();
        link.target = "_blank";
        link.style.overflowWrap = "break-word";
        link.style.maxWidth = "100%";

        linkSection.appendChild(link);

        const submitSection = document.createElement("div");
        submitSection.classList.add("popup-footer");
        submitSection.style.marginBottom = "-12px";

        const copyBtn = this.createButton(
            "copy-link",
            "tb-btn-primary",
            "Copy"
        );
        const cancelBtn = this.createButton(
            "cancel",
            "tb-btn-outline",
            "Close"
        );

        submitSection.appendChild(copyBtn);
        submitSection.appendChild(cancelBtn);

        div.appendChild(p);
        div.appendChild(linkSection);
        div.appendChild(submitSection);

        const modal = new Modal({
            title: "Share link for a preview",
            width: "500px",
            body: div,
        });

        modal.open();

        copyBtn.addEventListener("click", (e) => {
            e.preventDefault();
            navigator.clipboard.writeText(link.href)
                .then(() => {
                    alert("Link copied to clipboard");
                })
                .catch((err) => {
                    console.error('Something went wrong', err);
                })
                .finally(() => {
                    modal.close();
                })
                ;
        });

        cancelBtn.addEventListener("click", (e) => {
            e.preventDefault();
            modal.close();
        });
    }

    private createButton(id: string, className: string, text: string): HTMLButtonElement {
        const btn = document.createElement('button');
        btn.id = id;
        btn.classList.add('tb-btn', className);
        btn.innerText = text;
        return btn;
    }

    private async createLink() {
        const activeVersionId = await this.appVersion.getActiveVersionId();
        console.log("Active version ID:", activeVersionId);
        return `${baseURL}/wp_apppreview.aspx?AppVersionId=${activeVersionId}`;
    }
}