var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EditorEvents } from "../../../controls/editor/EditorEvents";
import html2canvas from "html2canvas";
export class EditorThumbs {
    constructor(frameId, pageId, editor, pageData, isHome = false) {
        this.frameId = frameId;
        this.editor = editor;
        this.pageId = pageId;
        this.pageData = pageData;
        this.isHome = isHome;
        this.thumbnailWrapper = document.createElement("div");
        this.container = document.getElementById("editor-thumbs-list");
        this.init();
    }
    init() {
        const editorDiv = document.getElementById(`${this.frameId}-frame`);
        const thumbnail = this.captureMiniature(editorDiv);
        thumbnail.style.cursor = "pointer";
        thumbnail.addEventListener("click", (event) => {
            const childContainer = document.getElementById("child-container");
            if (childContainer && editorDiv) {
                const editorFrames = Array.from(childContainer.children);
                const isFirstItem = editorFrames[0] === editorDiv;
                const isLastItem = editorFrames[editorFrames.length - 1] === editorDiv;
                if (isFirstItem) {
                    childContainer.scrollLeft = 0;
                    if (childContainer.children.length > 2) {
                        childContainer.style.justifyContent = "start";
                    }
                }
                else if (isLastItem) {
                    childContainer.scrollLeft = childContainer.scrollWidth - childContainer.clientWidth;
                }
                else {
                    const editorDivLeft = editorDiv.offsetLeft;
                    const editorDivWidth = editorDiv.offsetWidth;
                    const targetScrollPosition = editorDivLeft - (childContainer.offsetWidth / 2) + (editorDivWidth / 2);
                    childContainer.scrollLeft = targetScrollPosition;
                }
            }
            const editorEvents = new EditorEvents();
            editorEvents.setPageFocus(this.editor, this.frameId, this.pageId, this.pageData);
        });
        this.container.appendChild(thumbnail);
    }
    captureMiniature(editorDiv) {
        const updateMirror = () => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const canvasWrapper = editorDiv.querySelector(".gjs-cv-canvas");
            if (!canvasWrapper)
                return;
            const clone = disableInteractivity(editorDiv);
            const iframe = canvasWrapper.querySelector("iframe");
            if (iframe) {
                try {
                    yield ensureIframeLoaded(iframe);
                    if (iframe.contentWindow && ((_a = iframe.contentDocument) === null || _a === void 0 ? void 0 : _a.body)) {
                        yield waitForIframeResources(iframe);
                        const canvas = yield html2canvas(iframe.contentDocument.body, {
                            allowTaint: true,
                            useCORS: true,
                            logging: false
                        });
                        const img = document.createElement("img");
                        img.src = canvas.toDataURL("image/png");
                        img.style.width = iframe.offsetWidth + "px";
                        img.style.height = iframe.offsetHeight + "px";
                        img.style.display = "block";
                        const iframeClone = clone.querySelector("iframe");
                        if (iframeClone === null || iframeClone === void 0 ? void 0 : iframeClone.parentNode) {
                            iframeClone.parentNode.replaceChild(img, iframeClone);
                        }
                    }
                }
                catch (err) {
                    console.warn("Failed to render iframe with html2canvas:", err);
                }
            }
            const miniWrapper = document.createElement("div");
            miniWrapper.style.position = "relative";
            miniWrapper.style.width = `${Math.ceil(canvasWrapper.offsetWidth * 0.15)}px`;
            miniWrapper.style.height = `${Math.ceil(canvasWrapper.offsetHeight * 0.15) + 6}px`; // Add extra height for space + highlighter
            miniWrapper.style.display = "flex";
            miniWrapper.style.flexDirection = "column";
            clone.style.transform = "scale(0.15)";
            clone.style.transformOrigin = "top left";
            clone.style.width = `${canvasWrapper.offsetWidth}px`;
            clone.style.height = `${canvasWrapper.offsetHeight}px`;
            clone.style.overflow = "hidden";
            const cloneContainer = document.createElement("div");
            cloneContainer.style.flex = "1";
            cloneContainer.style.overflow = "hidden";
            cloneContainer.appendChild(clone);
            miniWrapper.appendChild(cloneContainer);
            const spacer = document.createElement("div");
            spacer.style.height = "3px"; // 5px space
            miniWrapper.appendChild(spacer);
            const highlighter = document.createElement("div");
            highlighter.classList.add("tb-highlighter");
            highlighter.id = "tb-highlighter";
            highlighter.style.height = "1px";
            highlighter.style.width = "100%";
            highlighter.style.display = this.isHome ? "block" : "none";
            highlighter.style.backgroundColor = "#FFFFFF";
            miniWrapper.appendChild(highlighter);
            this.thumbnailWrapper.innerHTML = "";
            this.thumbnailWrapper.appendChild(miniWrapper);
            observer.disconnect();
        });
        const ensureIframeLoaded = (iframe) => {
            return new Promise((resolve) => {
                var _a;
                if (((_a = iframe.contentDocument) === null || _a === void 0 ? void 0 : _a.readyState) === 'complete') {
                    resolve();
                }
                else {
                    iframe.onload = () => resolve();
                    // Fallback if onload doesn't trigger
                    setTimeout(() => {
                        resolve();
                    }, 2000);
                }
            });
        };
        const waitForIframeResources = (iframe) => {
            return new Promise((resolve) => {
                if (!iframe.contentDocument || !iframe.contentWindow) {
                    resolve();
                    return;
                }
                const doc = iframe.contentDocument;
                if (doc.readyState === 'complete') {
                    setTimeout(resolve, 500);
                    return;
                }
                iframe.contentWindow.addEventListener('load', () => {
                    setTimeout(resolve, 500);
                }, { once: true });
                setTimeout(resolve, 3000);
            });
        };
        const disableInteractivity = (element) => {
            const clone = element.cloneNode(false);
            element.childNodes.forEach((child) => {
                if (child.nodeType === Node.ELEMENT_NODE) {
                    clone.appendChild(disableInteractivity(child));
                }
                else {
                    clone.appendChild(child.cloneNode(true));
                }
            });
            if (["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(clone.tagName)) {
                clone.disabled = true;
            }
            clone.style.pointerEvents = "none";
            clone.tabIndex = -1;
            return clone;
        };
        const observer = new MutationObserver(() => {
            if (updateTimeoutId)
                clearTimeout(updateTimeoutId);
            updateTimeoutId = setTimeout(updateMirror, 300);
        });
        let updateTimeoutId = null;
        observer.observe(editorDiv, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true,
        });
        updateMirror();
        return this.thumbnailWrapper;
    }
}
//# sourceMappingURL=EditorThumbs.js.map