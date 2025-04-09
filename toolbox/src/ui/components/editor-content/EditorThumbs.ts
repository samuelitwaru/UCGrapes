import { EditorEvents } from "../../../controls/editor/EditorEvents";
import { EditorFrame } from "./EditorFrame";
import html2canvas from "html2canvas";

export class EditorThumbs {
  container: HTMLElement;
  frameId: any;
  editor: any;
  pageId: any;
  pageData: any;
  thumbnailWrapper: HTMLElement;
  isHome?: boolean;

  constructor(frameId: any, pageId:any, editor: any, pageData: any, isHome: boolean = false) {
    this.frameId = frameId;
    this.editor = editor;
    this.pageId = pageId;
    this.pageData = pageData;
    this.isHome = isHome;
    this.thumbnailWrapper = document.createElement("div");
    this.container = document.getElementById(
      "editor-thumbs-list"
    ) as HTMLElement;
    this.init();
  }

  init() {
    const editorDiv = document.getElementById(
      `${this.frameId}-frame`
    ) as HTMLDivElement;
    const thumbnail = this.captureMiniature(editorDiv);
    thumbnail.style.cursor = "pointer";
    thumbnail.addEventListener("click", (event: MouseEvent) => {
      const childContainer = document.getElementById("child-container") as HTMLDivElement;

      if (childContainer && editorDiv) {
        const editorDivLeft = editorDiv.offsetLeft;
        const editorDivWidth = editorDiv.offsetWidth;

        const targetScrollPosition = editorDivLeft - (childContainer.offsetWidth / 2) + (editorDivWidth / 2);

        childContainer.scrollLeft = targetScrollPosition;
      }

      const editorEvents = new EditorEvents();
      editorEvents.setPageFocus(this.editor, this.frameId, this.pageId, this.pageData)
    });
    this.container.appendChild(thumbnail);
  }

  private captureMiniature(editorDiv: HTMLDivElement) {
    const updateMirror = async () => {
      const canvasWrapper = editorDiv.querySelector(".gjs-cv-canvas") as HTMLElement;
      if (!canvasWrapper) return;
  
      const clone = disableInteractivity(editorDiv);
  
      // Handle iframe inside .gjs-cv-canvas
      const iframe = canvasWrapper.querySelector("iframe") as HTMLIFrameElement;
      if (iframe && iframe.contentWindow && iframe.contentDocument?.body) {
        try {
          const canvas = await html2canvas(iframe.contentDocument.body);
          const img = document.createElement("img");
          img.src = canvas.toDataURL("image/png");
          img.style.width = iframe.offsetWidth + "px";
          img.style.height = iframe.offsetHeight + "px";
          img.style.display = "block";
  
          const iframeClone = clone.querySelector("iframe");
          if (iframeClone?.parentNode) {
            iframeClone.parentNode.replaceChild(img, iframeClone);
          }
        } catch (err) {
          console.warn("Failed to render iframe with html2canvas:", err);
        }
      }
  
      // Create the wrapper that will contain clone, space, and highlighter
      const miniWrapper = document.createElement("div");
      miniWrapper.style.position = "relative";
      miniWrapper.style.width = `${Math.ceil(canvasWrapper.offsetWidth * 0.15)}px`;
      miniWrapper.style.height = `${Math.ceil(canvasWrapper.offsetHeight * 0.15) + 6}px`; // Add extra height for space + highlighter
      miniWrapper.style.display = "flex";
      miniWrapper.style.flexDirection = "column";
  
      // Set up the clone
      clone.style.transform = "scale(0.15)";
      clone.style.transformOrigin = "top left";
      clone.style.width = `${canvasWrapper.offsetWidth}px`;
      clone.style.height = `${canvasWrapper.offsetHeight}px`;
      clone.style.overflow = "hidden";
      
      // Create a container for the clone
      const cloneContainer = document.createElement("div");
      cloneContainer.style.flex = "1";
      cloneContainer.style.overflow = "hidden";
      cloneContainer.appendChild(clone);
      
      // Add clone container to the mini wrapper
      miniWrapper.appendChild(cloneContainer);
      
      // Create spacer element
      const spacer = document.createElement("div");
      spacer.style.height = "3px"; // 5px space
      miniWrapper.appendChild(spacer);
      
      // Create highlighter with space above it
      const highlighter = document.createElement("div");
      highlighter.classList.add("tb-highlighter");
      highlighter.id = "tb-highlighter";
      highlighter.style.height = "1px";
      highlighter.style.width = "100%";
      highlighter.style.display = this.isHome ? "block" : "none";
      highlighter.style.backgroundColor = "#FFFFFF";
      
      // Add highlighter to the mini wrapper
      miniWrapper.appendChild(highlighter);
      
      // Clear and set up the thumbnail wrapper
      this.thumbnailWrapper.innerHTML = "";
      this.thumbnailWrapper.appendChild(miniWrapper);
  
      // Disconnect the observer after the first successful capture
      observer.disconnect();
    };
  
    const disableInteractivity = (element: HTMLElement) => {
      const clone = element.cloneNode(false) as HTMLElement;
  
      element.childNodes.forEach((child: any) => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          clone.appendChild(disableInteractivity(child));
        } else {
          clone.appendChild(child.cloneNode(true));
        }
      });
  
      if (["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(clone.tagName)) {
        (clone as HTMLInputElement).disabled = true;
      }
  
      clone.style.pointerEvents = "none";
      clone.tabIndex = -1;
  
      return clone;
    };
  
    const observer = new MutationObserver(updateMirror);
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
