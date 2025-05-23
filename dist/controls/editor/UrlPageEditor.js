var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class UrlPageEditor {
    constructor(editor) {
        this.editor = editor;
    }
    initialise(tileAction) {
        return __awaiter(this, void 0, void 0, function* () {
            const linkUrl = tileAction === null || tileAction === void 0 ? void 0 : tileAction.ObjectUrl;
            try {
                this.editor.DomComponents.clear();
                // Define custom 'object' component
                this.editor.DomComponents.addType("object", {
                    isComponent: (el) => el.tagName === "OBJECT",
                    model: {
                        defaults: {
                            tagName: "object",
                            draggable: true,
                            droppable: false,
                            attributes: {
                                width: "100%",
                                height: "300vh",
                            },
                            styles: `
                  .form-frame-container {
                    overflow-x: hidden;
                    overflow-y: auto;
                    position: relative;
                    min-height: 300px;
                  }
      
                  /* Preloader styles */
                  .preloader-wrapper {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 1000;
                  }
      
                  .preloader {
                    width: 32px;
                    height: 32px;
                    background-image: url('/Resources/UCGrapes1/src/images/spinner.gif');
                    background-size: contain;
                    background-repeat: no-repeat;
                  }
      
                  /* Custom scrollbar styles */
                  .form-frame-container::-webkit-scrollbar {
                    width: 6px;
                    height: 0;
                  }
      
                  .form-frame-container::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 3px;
                  }
      
                  .form-frame-container::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 3px;
                  }
      
                  .form-frame-container::-webkit-scrollbar-thumb:hover {
                    background: #555;
                  }
      
                  /* Firefox scrollbar styles */
                  .form-frame-container {
                    scrollbar-width: thin;
                    scrollbar-color: #888 #f1f1f1;
                  }
                  .fallback-message {
                    margin-bottom: 10px;
                    color: #666;
                  }
                `,
                        },
                    },
                    view: {
                        onRender({ el, model }) {
                            const fallbackMessage = model.get("attributes").fallbackMessage ||
                                "Content cannot be displayed";
                            const fallbackContent = `
                  <div class="fallback-content">
                    <p class="fallback-message">${fallbackMessage}</p>
                    <a href="${model.get("attributes").data}" 
                       target="_blank" 
                       class="fallback-link">
                      Open in New Window
                    </a>
                  </div>
                `;
                            el.insertAdjacentHTML("beforeend", fallbackContent);
                            el.addEventListener("load", () => {
                                // Hide preloader and fallback on successful load
                                const container = el.closest(".form-frame-container");
                                const preloaderWrapper = container.querySelector(".preloader-wrapper");
                                if (preloaderWrapper)
                                    preloaderWrapper.style.display = "none";
                                const fallback = el.querySelector(".fallback-content");
                                if (fallback) {
                                }
                                fallback.style.display = "none";
                            });
                            el.addEventListener("error", (e) => {
                                // Hide preloader and show fallback on error
                                const container = el.closest(".form-frame-container");
                                const preloaderWrapper = container.querySelector(".preloader-wrapper");
                                if (preloaderWrapper)
                                    preloaderWrapper.style.display = "none";
                                const fallback = el.querySelector(".fallback-content");
                                if (fallback) {
                                    fallback.style.display = "flex";
                                    fallback.style.flexDirection = "column";
                                    fallback.style.justifyContent = "start";
                                }
                            });
                        },
                    },
                });
                // Add the component to the editor with preloader in a wrapper
                this.editor.setComponents(`
            <div class="form-frame-container" id="frame-container">
              <div class="preloader-wrapper">
                <div class="preloader"></div>
              </div>
              <object 
                data="${linkUrl}"
                type="text/html"
                width="100%"
                height="800px"
                fallbackMessage="Unable to load the content. Please try opening it in a new window.">
              </object>
            </div>
          `);
            }
            catch (error) {
                console.error("Error setting up object component:", error.message);
            }
        });
    }
}
//# sourceMappingURL=UrlPageEditor.js.map