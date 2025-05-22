import { EditorEvents } from "../../../controls/editor/EditorEvents";
import html2canvas from "html2canvas";
import { ToolBoxService } from "../../../services/ToolBoxService";

export class EditorThumbs {
  container: HTMLElement;
  frameId: any;
  editor: any;
  pageId: any;
  pageData: any;
  thumbnailWrapper: HTMLElement;
  isHome?: boolean;
  appVersion: any;

  constructor(
    frameId: any,
    pageId: any,
    editor: any,
    pageData: any,
    isHome: boolean = false
  ) {
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
    if (!editorDiv) {
      console.error("Editor div not found");
      return;
    }
    const thumbnail = this.captureMiniature(editorDiv);
    thumbnail.style.cursor = "pointer";
    thumbnail.addEventListener("click", (event: MouseEvent) => {
      const childContainer = document.getElementById(
        "child-container"
      ) as HTMLDivElement; 

      if (childContainer && editorDiv) {
        const editorFrames = Array.from(childContainer.children);
        const isFirstItem = editorFrames[0] === editorDiv;
        const isLastItem = editorFrames[editorFrames.length - 1] === editorDiv;

        if (isFirstItem) {
          childContainer.scrollLeft = 0;
          if (childContainer.children.length > 2) {
            childContainer.style.justifyContent = "start";
          }
        } else if (isLastItem) {
          childContainer.scrollLeft =
            childContainer.scrollWidth - childContainer.clientWidth;
        } else {
          const editorDivLeft = editorDiv.offsetLeft;
          const editorDivWidth = editorDiv.offsetWidth;
          const targetScrollPosition =
            editorDivLeft - childContainer.offsetWidth / 2 + editorDivWidth / 2;
          childContainer.scrollLeft = targetScrollPosition;
        }
      }

      const editorEvents = new EditorEvents();
      editorEvents.setPageFocus(
        this.editor,
        this.frameId,
        this.pageId,
        this.pageData
      );
    });
    this.container.appendChild(thumbnail);
  }

  private captureMiniature(editorDiv: HTMLDivElement) {
    const updateMirror = async () => {
      const canvasWrapper = editorDiv.querySelector(
        ".gjs-cv-canvas"
      ) as HTMLElement;
      if (!canvasWrapper) return;

      const clone = disableInteractivity(editorDiv);

      const iframe = canvasWrapper.querySelector("iframe") as HTMLIFrameElement;
      if (iframe) {
        try {
          await ensureIframeLoaded(iframe);

          if (iframe.contentWindow && iframe.contentDocument?.body) {
            await waitForIframeResources(iframe);

            const canvas = await html2canvas(iframe.contentDocument.body, {
              allowTaint: true,
              useCORS: true,
              logging: false,
            });

            const dataUrl = canvas.toDataURL("image/png");
            const img = document.createElement("img");
            img.src = dataUrl;
            img.style.width = iframe.offsetWidth + "px";
            img.style.height = iframe.offsetHeight + "px";
            img.style.display = "block";
            const iframeClone = clone.querySelector("iframe");
            if (iframeClone?.parentNode) {
              iframeClone.parentNode.replaceChild(img, iframeClone);
            }
          }
        } catch (err) {
          console.warn("Failed to render iframe with html2canvas:", err);
        }
      }

      const miniWrapper = document.createElement("div");
      miniWrapper.style.position = "relative";
      miniWrapper.style.width = `${Math.ceil(
        canvasWrapper.offsetWidth * 0.15
      )}px`;
      miniWrapper.style.height = `${
        Math.ceil(canvasWrapper.offsetHeight * 0.15) + 6
      }px`; // Add extra height for space + highlighter
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
    };

    const ensureIframeLoaded = (iframe: HTMLIFrameElement): Promise<void> => {
      return new Promise((resolve) => {
        if (iframe.contentDocument?.readyState === "complete") {
          resolve();
        } else {
          iframe.onload = () => resolve();

          // Fallback if onload doesn't trigger
          setTimeout(() => {
            resolve();
          }, 2000);
        }
      });
    };

    const waitForIframeResources = (
      iframe: HTMLIFrameElement
    ): Promise<void> => {
      return new Promise((resolve) => {
        if (!iframe.contentDocument || !iframe.contentWindow) {
          resolve();
          return;
        }

        const doc = iframe.contentDocument;

        if (doc.readyState === "complete") {
          setTimeout(resolve, 500);
          return;
        }

        iframe.contentWindow.addEventListener(
          "load",
          () => {
            setTimeout(resolve, 500);
          },
          { once: true }
        );

        setTimeout(resolve, 3000);
      });
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

    const observer = new MutationObserver(() => {
      if (updateTimeoutId) clearTimeout(updateTimeoutId);
      updateTimeoutId = setTimeout(updateMirror, 300);
    });

    let updateTimeoutId: ReturnType<typeof setTimeout> | null = null;
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
