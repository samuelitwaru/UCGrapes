var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ToolboxManager } from "../../controls/toolbox/ToolboxManager";
import { AppVersionController } from "../../controls/versions/AppVersionController";
import { i18n } from "../../i18n/i18n";
import { Modal } from "../components/Modal";
export class ShareLinkView {
    constructor() {
        this.appVersionController = new AppVersionController();
        this.toolboxManager = new ToolboxManager();
    }
    createButton(id, className, text) {
        const btn = document.createElement('button');
        btn.id = id;
        btn.classList.add('tb-btn', className);
        btn.innerText = text;
        return btn;
    }
    openShareLinkModal() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const div = this.createModalContent();
                const modal = new Modal({
                    title: i18n.t("navbar.share.modal_title"),
                    width: "500px",
                    body: div,
                });
                modal.open();
                this.setupModalEventListeners(div, modal);
            }
            catch (error) {
                console.error('Error opening share link modal:', error);
            }
        });
    }
    createModalContent() {
        const div = document.createElement("div");
        const p = document.createElement("p");
        // p.innerText = i18n.t("hello");
        p.innerText = i18n.t("navbar.share.modal_description");
        const linkSection = this.createLinkSection();
        const submitSection = this.createSubmitSection(linkSection);
        div.appendChild(p);
        div.appendChild(linkSection);
        div.appendChild(submitSection);
        return div;
    }
    createLinkSection() {
        const linkSection = document.createElement("div");
        linkSection.classList.add("share-link-body");
        linkSection.style.display = "flex";
        linkSection.style.flexDirection = "column";
        linkSection.style.padding = "10px";
        const link = document.createElement("a");
        link.target = "_blank";
        link.style.overflowWrap = "break-word";
        link.style.maxWidth = "100%";
        // We'll populate the link asynchronously
        this.populateLinkAsync(link);
        linkSection.appendChild(link);
        return linkSection;
    }
    populateLinkAsync(linkElement) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const shareLink = yield this.appVersionController.generateShareLink();
                linkElement.href = shareLink;
                linkElement.innerText = shareLink;
            }
            catch (error) {
                linkElement.innerText = 'Failed to generate link';
                linkElement.href = '#';
            }
        });
    }
    createSubmitSection(linkSection) {
        const submitSection = document.createElement("div");
        submitSection.classList.add("popup-footer");
        submitSection.style.marginBottom = "-12px";
        const copyBtn = this.createButton("copy-link", "tb-btn-primary", i18n.t("navbar.share.copy"));
        const cancelBtn = this.createButton("cancel", "tb-btn-outline", i18n.t("navbar.share.close"));
        submitSection.appendChild(copyBtn);
        submitSection.appendChild(cancelBtn);
        return submitSection;
    }
    setupModalEventListeners(div, modal) {
        const link = div.querySelector('a');
        const copyBtn = div.querySelector('#copy-link');
        const cancelBtn = div.querySelector('#cancel');
        if (copyBtn && link) {
            copyBtn.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
                e.preventDefault();
                if (link.href) {
                    const copied = yield this.appVersionController.copyToClipboard(link.href);
                    if (copied) {
                        setTimeout(() => {
                            modal.close();
                            this.toolboxManager.openToastMessage(i18n.t("navbar.share.copied"));
                        }, 500);
                    }
                    else {
                        modal.close();
                        console.error("Failed to copy link");
                    }
                }
            }));
        }
        if (cancelBtn) {
            cancelBtn.addEventListener("click", (e) => {
                e.preventDefault();
                modal.close();
            });
        }
    }
}
//# sourceMappingURL=ShareLinkView.js.map