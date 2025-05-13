export class UrlPageEditor {
    editor: any;
    constructor(editor: any) {
        this.editor = editor;
    }

    async initialise(tileAction: any) {
        const linkUrl = tileAction?.ObjectUrl;
        try {
            this.editor.DomComponents.clear();
    
          // Define custom 'object' component
          this.editor.DomComponents.addType("object", {
            isComponent: (el: any) => el.tagName === "OBJECT",
    
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
              onRender({ el, model }: any) {
                const fallbackMessage =
                  model.get("attributes").fallbackMessage ||
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
                  const preloaderWrapper =
                    container.querySelector(".preloader-wrapper");
                  if (preloaderWrapper) preloaderWrapper.style.display = "none";
    
                  const fallback = el.querySelector(".fallback-content");
                  if (fallback) {
                  }
                  fallback.style.display = "none";
                });
    
                el.addEventListener("error", (e: any) => {
                  // Hide preloader and show fallback on error
                  const container = el.closest(".form-frame-container");
                  const preloaderWrapper =
                    container.querySelector(".preloader-wrapper");
                  if (preloaderWrapper) preloaderWrapper.style.display = "none";
    
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
        } catch (error: any) {
          console.error("Error setting up object component:", error.message);
        }
      }
}