var globalEditor = null;

class EditorManager {
  constructor(editor, currentLanguage) {
    globalEditor = editor;
    this.editor = editor;
    this.selectedTemplateWrapper = null;
    this.selectedComponent = null;
    this.templateComponent = null;
    this.isResizing = false;
    this.currentResizer = null;
    this.initialX = null;
    this.initialWidth = null;
    this.currentLanguage = currentLanguage;
    this.pageId = this.getCurrentPageId();
    this.pageName = "Home";
    this.toolsSection = null;
  }

  setToolsSection(toolBox) {
    this.toolsSection = toolBox;
  }

  init() {
    this.editor.on("load", () => {
      if (this.pageId === null) {
        const existingFrame = this.editor
          .getWrapper()
          .find("#frame-container")[0];
        if (!existingFrame) {
          this.initialTemplate();
        }
      } else {
        const projectData = localStorage.getItem(
          `page-${this.getCurrentPageId()}`
        );
        if (projectData) {
          try {
            let parsedData = JSON.parse(projectData);

            if (!parsedData.pages) {
              parsedData = {
                pages: [
                  {
                    component: parsedData,
                    frames: [
                      {
                        component: parsedData,
                      },
                    ],
                  },
                ],
              };
            }

            this.editor.loadProjectData(parsedData);
          } catch (error) {
            console.log("Error loading data:" + error);
            const message = this.currentLanguage.getTranslation(
              "error_loading_data_message"
            );
            const status = "error";
            this.toolsSection.displayAlertMessage(message, status);
          }
        } else {
          this.initialTemplate();
        }
      }

      const wrapper = this.editor.getWrapper();
      console.log(this.editor.getWrapper().view);
      wrapper.view.el.addEventListener("click", (e) => {
        const button = e.target.closest(".action-button");
        if (!button) return;

        const templateWrapper = button.closest(".template-wrapper");
        if (!templateWrapper) return;

        this.templateComponent = this.editor.Components.getById(
          templateWrapper.id
        );

        if (!this.templateComponent) return;

        if (button.classList.contains("delete-button")) {
          this.deleteTemplate(this.templateComponent);
        } else if (button.classList.contains("add-button-bottom")) {
          this.addTemplateBottom(this.templateComponent);
        } else if (button.classList.contains("add-button-right")) {
          this.addTemplateRight(this.templateComponent);
        }
      });

      wrapper.set({
        selectable: false,
        droppable: false,
        resizable: {
          handles: "e",
        },
      });

      // call right click handler
      this.rightClickEventHandler();
    });

    this.editor.on("component:selected", (component) => {
      this.selectedTemplateWrapper = component.getEl();
      this.selectedComponent = component;

      const sidebarInputTitle = document.getElementById("tile-title");
      if (this.selectedTemplateWrapper) {
        const tileLabel = this.selectedTemplateWrapper.querySelector(
          ".tile-title"
        );
        if (tileLabel) {
          sidebarInputTitle.value = tileLabel.textContent;
        }

        // remove tile icon
        const closeIconSection = this.editor
          .getSelected()
          .find(".selected-tile-icon")[0];
        if (closeIconSection) {
          const closeIconEl = closeIconSection.getEl();

          if (closeIconEl) {
            closeIconEl.onclick = () => {
              this.editor.getSelected().find(".tile-icon-section")[0].remove();
            };
          } else {
            console.warn("DOM element not found for selected-tile-icon");
          }
        }

        // remove tile title
        const closeTitleSection = this.editor
          .getSelected()
          .find(".selected-tile-title")[0];
        if (closeTitleSection) {
          const closeTitleEl = closeTitleSection.getEl();

          if (closeTitleEl) {
            closeTitleEl.onclick = () => {
              this.editor.getSelected().find(".tile-title-section")[0].remove();
            };
          } else {
            console.warn("DOM element not found for selected-tile-icon");
          }
        }

        document.querySelector(`#templates-button`).classList.remove("active");
        document.querySelector(`#pages-button`).classList.remove("active");
        document.querySelector(`#pages-button`).classList.add("active");
        document.querySelector(`#mapping-section`).style.display = "none";
        document.querySelector(`#tools-section`).style.display = "block";

        document
          .querySelector(`#templates-content`)
          .classList.remove("active-tab");
        document.querySelector(`#pages-content`).classList.add("active-tab");
      }

      this.toolsSection.updateTileProperties(this.editor);
    });

    // Listen for component drag start and change the cursor
    this.editor.on("component:drag:start", (component) => {
      const iframe = document.querySelector("#gjs iframe");
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.body.style.cursor = "grabbing";
    });

    // Listen for component drag end and reset the cursor
    this.editor.on("component:drag:end", (component) => {
      const iframe = document.querySelector("#gjs iframe");
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.body.style.cursor = "";
    });

    const sidebarInputTitle = document.getElementById("tile-title");

    sidebarInputTitle.addEventListener("input", (e) => {
      this.updateTileTitle(e.target.value);
    });

    const frameEl = this.editor.Canvas.getFrameEl();
    frameEl.contentDocument.addEventListener("mousedown", this.initResize);
    frameEl.contentDocument.addEventListener("mousemove", this.resize);
    frameEl.contentDocument.addEventListener("mouseup", this.stopResize);

    //auto save page every 2 seconds
    setInterval(() => {
      this.saveCurrentPage();
    }, 2000);
  }

  updateTileTitle(inputTitle) {
    if (this.selectedTemplateWrapper) {
      const titleComponent = this.editor.getSelected().find(".tile-title")[0];
      if (titleComponent) {
        titleComponent.components(inputTitle);
        this.editor.getSelected().addAttributes({ "tile-title": inputTitle });
      }
    }
  }

  getSelectedTemplateWrapper() {
    return this.selectedTemplateWrapper;
  }

  getSelectedComponent() {
    return this.selectedComponent;
  }

  setCurrentPage(page) {
    localStorage.setItem("pageId", page.PageId);
    localStorage.setItem("pageName", page.PageName);
    const localStorageKey = `page-${page.PageId}`;
    localStorage.setItem(localStorageKey, page.PageGJSJson);
  }

  setCurrentPageId(pageId) {
    localStorage.setItem("pageId", pageId);
  }

  getCurrentPageId() {
    return localStorage.getItem("pageId");
  }

  getCurrentPageName() {
    return this.pageName;
  }

  setCurrentPageName(pageName) {
    this.pageName = pageName;
    localStorage.setItem("pageName", pageName);
  }

  addFreshTemplate(template) {
    this.editor.DomComponents.clear();
    let fullTemplate = "";

    template.forEach((columns) => {
      const templateRow = this.generateTemplateRow(columns);
      fullTemplate += templateRow;
    });

    this.editor.addComponents(`
        <div class="frame-container"
             id="frame-container"
             data-gjs-type="template-wrapper"
             data-gjs-draggable="false"
             data-gjs-selectable="false"
             data-gjs-editable="false"
             data-gjs-highlightable="false"
             data-gjs-droppable="false"
             data-gjs-hoverable="false">
          <div class="container-column"
               data-gjs-type="template-wrapper"
               data-gjs-draggable="false"
               data-gjs-selectable="false"
               data-gjs-editable="false"
               data-gjs-highlightable="false"
               data-gjs-droppable="false"
               data-gjs-hoverable="false">
              ${fullTemplate}
          </div>
        </div>
        `);

    const message = this.currentLanguage.getTranslation(
      "template_added_success_message"
    );
    const status = "success";
    this.toolsSection.displayAlertMessage(message, status);
  }

  initialTemplate() {
    return this.editor.addComponents(`
        <div class="frame-container"
             id="frame-container"
             data-gjs-type="template-wrapper"
             data-gjs-draggable="false"
             data-gjs-selectable="false"
             data-gjs-editable="false"
             data-gjs-highlightable="false"
             data-gjs-droppable="false"
             data-gjs-hoverable="false">
          <div class="container-column"
               data-gjs-type="template-wrapper"
               data-gjs-draggable="false"
               data-gjs-selectable="false"
               data-gjs-editable="false"
               data-gjs-highlightable="false"
               data-gjs-droppable="false"
               data-gjs-hoverable="false">
            <div class="container-row"
                 data-gjs-type="template-wrapper"
                 data-gjs-draggable="false"
                 data-gjs-selectable="false"
                 data-gjs-editable="false"
                 data-gjs-highlightable="true"
                 data-gjs-hoverable="true">
              ${this.createTemplateHTML(true)}
            </div>
          </div>
        </div>
      `)[0];
  }

  createTemplateHTML(isDefault = false) {
    return `
        <div class="template-wrapper ${isDefault ? "default-template" : ""}"
              data-gjs-type="template-wrapper"
              data-gjs-droppable="false">
          <div class="template-block"
             data-gjs-draggable="false"
             data-gjs-selectable="false"
             data-gjs-editable="false"
             data-gjs-highlightable="false"
             data-gjs-droppable="false"
             data-gjs-resizable="false"
             data-gjs-hoverable="false">
            
             <div class="tile-icon-section"
              data-gjs-draggable="false"
              data-gjs-selectable="false"
              data-gjs-editable="false"
              data-gjs-highlightable="false"
              data-gjs-droppable="false"
              data-gjs-resizable="false"
              data-gjs-hoverable="false"
              >
                <span class="tile-close-icon top-right selected-tile-icon"
                  data-gjs-draggable="false"
                  data-gjs-selectable="false"
                  data-gjs-editable="false"
                  data-gjs-highlightable="false"
                  data-gjs-droppable="false"
                  data-gjs-resizable="false"
                  data-gjs-hoverable="false"
                  >&times;</span>
                <span 
                  class="tile-icon"
                  data-gjs-draggable="false"
                  data-gjs-selectable="false"
                  data-gjs-editable="false"
                  data-gjs-droppable="false"
                  data-gjs-highlightable="false"
                  data-gjs-hoverable="false">
                </span>
            </div>
            <div class="tile-title-section"
              data-gjs-draggable="false"
              data-gjs-selectable="false"
              data-gjs-editable="false"
              data-gjs-highlightable="false"
              data-gjs-droppable="false"
              data-gjs-resizable="false"
              data-gjs-hoverable="false"
              >
                <span class="tile-close-icon top-right selected-tile-title"
                  data-gjs-draggable="false"
                  data-gjs-selectable="false"
                  data-gjs-editable="false"
                  data-gjs-highlightable="false"
                  data-gjs-droppable="false"
                  data-gjs-resizable="false"
                  data-gjs-hoverable="false"
                  >&times;</span>
                <span 
                  class="tile-title"
                  data-gjs-draggable="false"
                  data-gjs-selectable="false"
                  data-gjs-editable="false"
                  data-gjs-droppable="false"
                  data-gjs-highlightable="false"
                  data-gjs-hoverable="false">Title</span>
                </div>
            </div>
          ${
            !isDefault
              ? `
            <button class="action-button delete-button" title="Delete template"
                      data-gjs-draggable="false"
                      data-gjs-selectable="false"
                      data-gjs-editable="false"
                      data-gjs-droppable="false"
                      data-gjs-highlightable="false"
                      data-gjs-hoverable="false">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                      data-gjs-draggable="false"
                      data-gjs-selectable="false"
                      data-gjs-editable="false"
                      data-gjs-editable="false"
                      data-gjs-droppable="false"
                      data-gjs-highlightable="false"
                      data-gjs-hoverable="false">
                <line x1="5" y1="12" x2="19" y2="12" 
                  data-gjs-draggable="false"
                  data-gjs-selectable="false"
                  data-gjs-editable="false"
                  data-gjs-highlightable="false"
                  data-gjs-droppable="false"
                  data-gjs-hoverable="false"/>
              </svg>
            </button>
          `
              : ""
          }
          <button class="action-button add-button-bottom" title="Add template below"
                  data-gjs-draggable="false"
                  data-gjs-selectable="false"
                  data-gjs-droppable="false"
                  data-gjs-editable="false"
                  data-gjs-highlightable="false"
                  data-gjs-hoverable="false">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  data-gjs-draggable="false"
                  data-gjs-selectable="false"
                  data-gjs-editable="false"
                  data-gjs-editable="false"
                  data-gjs-droppable="false"
                  data-gjs-highlightable="false"
                  data-gjs-hoverable="false">
              <line x1="12" y1="5" x2="12" y2="19" 
                  data-gjs-draggable="false"
                  data-gjs-selectable="false"
                  data-gjs-editable="false"
                  data-gjs-highlightable="false"
                  data-gjs-droppable="false"
                  data-gjs-hoverable="false"/>
              <line x1="5" y1="12" x2="19" y2="12" 
                  data-gjs-draggable="false"
                  data-gjs-selectable="false"
                  data-gjs-editable="false"
                  data-gjs-highlightable="false"
                  data-gjs-droppable="false"
                  data-gjs-hoverable="false"/>
            </svg>
          </button>
          <button class="action-button add-button-right" title="Add template right"
                  data-gjs-draggable="false"
                  data-gjs-selectable="false"
                  data-gjs-editable="false"
                  data-gjs-droppable="false"
                  data-gjs-highlightable="false"
                  data-gjs-hoverable="false">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  data-gjs-draggable="false"
                  data-gjs-selectable="false"
                  data-gjs-editable="false"
                  data-gjs-editable="false"
                  data-gjs-highlightable="false"
                  data-gjs-droppable="false"
                  data-gjs-hoverable="false">
              <line x1="12" y1="5" x2="12" y2="19" 
                  data-gjs-draggable="false"
                  data-gjs-selectable="false"
                  data-gjs-editable="false"
                  data-gjs-highlightable="false"
                  data-gjs-droppable="false"
                  data-gjs-hoverable="false"/>
              <line x1="5" y1="12" x2="19" y2="12" 
                  data-gjs-draggable="false"
                  data-gjs-selectable="false"
                  data-gjs-editable="false"
                  data-gjs-highlightable="false"
                  data-gjs-droppable="false"
                  data-gjs-hoverable="false"/>
            </svg>
          </button>
          <div class="resize-handle"
                  data-gjs-draggable="false"
                  data-gjs-selectable="false"
                  data-gjs-editable="false"
                  data-gjs-highlightable="false"
                  data-gjs-droppable="false"
                  data-gjs-hoverable="false">
          </div>
        </div>
      `;
  }

  generateTemplateRow(columns) {
    let columnWidth = 100 / columns;
    if (columns === 1) {
      columnWidth = 100;
    } else if (columns === 2) {
      columnWidth = 49;
    } else if (columns === 3) {
      columnWidth = 32;
    }

    let wrappers = "";

    for (let i = 0; i < columns; i++) {
      wrappers += `
        <div class="template-wrapper"
                  ${defaultTileAttrs}
                  style="flex: 0 0 ${columnWidth}%);"
                  data-gjs-type="template-wrapper"
                  data-gjs-droppable="false">
                  <div class="template-block"
                    data-gjs-draggable="false"
                    data-gjs-selectable="false"
                    data-gjs-editable="false"
                    data-gjs-highlightable="false"
                    data-gjs-droppable="false"
                    data-gjs-resizable="false"
                    data-gjs-hoverable="false">
                    
                    <div class="tile-icon-section"
                      data-gjs-draggable="false"
                      data-gjs-selectable="false"
                      data-gjs-editable="false"
                      data-gjs-highlightable="false"
                      data-gjs-droppable="false"
                      data-gjs-resizable="false"
                      data-gjs-hoverable="false"
                      >
                        <span class="tile-close-icon top-right selected-tile-icon"
                          data-gjs-draggable="false"
                          data-gjs-selectable="false"
                          data-gjs-editable="false"
                          data-gjs-highlightable="false"
                          data-gjs-droppable="false"
                          data-gjs-resizable="false"
                          data-gjs-hoverable="false"
                          >&times;</span>
                        <span 
                          class="tile-icon"
                          data-gjs-draggable="false"
                          data-gjs-selectable="false"
                          data-gjs-editable="false"
                          data-gjs-droppable="false"
                          data-gjs-highlightable="false"
                          data-gjs-hoverable="false">
                        </span>
                    </div>
                    <div class="tile-title-section"
                      data-gjs-draggable="false"
                      data-gjs-selectable="false"
                      data-gjs-editable="false"
                      data-gjs-highlightable="false"
                      data-gjs-droppable="false"
                      data-gjs-resizable="false"
                      data-gjs-hoverable="false"
                      >
                        <span class="tile-close-icon top-right selected-tile-title"
                          data-gjs-draggable="false"
                          data-gjs-selectable="false"
                          data-gjs-editable="false"
                          data-gjs-highlightable="false"
                          data-gjs-droppable="false"
                          data-gjs-resizable="false"
                          data-gjs-hoverable="false"
                          >&times;</span>
                        <span 
                          class="tile-title"
                          data-gjs-draggable="false"
                          data-gjs-selectable="false"
                          data-gjs-editable="false"
                          data-gjs-droppable="false"
                          data-gjs-highlightable="false"
                          data-gjs-hoverable="false">Title</span>
                        </div>
                  </div>
                  <button class="action-button delete-button" title="Delete template"
                      data-gjs-draggable="false"
                      data-gjs-selectable="false"
                      data-gjs-editable="false"
                      data-gjs-droppable="false"
                      data-gjs-highlightable="false"
                      data-gjs-hoverable="false">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                      data-gjs-draggable="false"
                      data-gjs-selectable="false"
                      data-gjs-editable="false"
                      data-gjs-editable="false"
                      data-gjs-droppable="false"
                      data-gjs-highlightable="false"
                      data-gjs-hoverable="false">
                      <line x1="5" y1="12" x2="19" y2="12" 
                        data-gjs-draggable="false"
                        data-gjs-selectable="false"
                        data-gjs-editable="false"
                        data-gjs-highlightable="false"
                        data-gjs-droppable="false"
                        data-gjs-hoverable="false"/>
                    </svg>
                  </button>
                  <button class="action-button add-button-bottom" title="Add template below"
                          data-gjs-draggable="false"
                          data-gjs-selectable="false"
                          data-gjs-droppable="false"
                          data-gjs-editable="false"
                          data-gjs-highlightable="false"
                          data-gjs-hoverable="false"
                          >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                          data-gjs-draggable="false"
                          data-gjs-selectable="false"
                          data-gjs-editable="false"
                          data-gjs-editable="false"
                          data-gjs-highlightable="false"
                          data-gjs-droppable="false"
                          data-gjs-hoverable="false">
                      <line x1="12" y1="5" x2="12" y2="19" 
                          data-gjs-draggable="false"
                          data-gjs-selectable="false"
                          data-gjs-editable="false"
                          data-gjs-highlightable="false"
                          data-gjs-droppable="false"
                          data-gjs-hoverable="false"/>
                      <line x1="5" y1="12" x2="19" y2="12" 
                          data-gjs-draggable="false"
                          data-gjs-selectable="false"
                          data-gjs-editable="false"
                          data-gjs-highlightable="false"
                          data-gjs-droppable="false"
                          data-gjs-hoverable="false"/>
                    </svg>
                  </button>
                  <button class="action-button add-button-right" title="Add template right"
                          data-gjs-draggable="false"
                          data-gjs-selectable="false"
                          data-gjs-editable="false"
                          data-gjs-droppable="false"
                          data-gjs-highlightable="false"
                          data-gjs-hoverable="false">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                          data-gjs-draggable="false"
                          data-gjs-selectable="false"
                          data-gjs-editable="false"
                          data-gjs-editable="false"
                          data-gjs-highlightable="false"
                          data-gjs-droppable="false"
                          data-gjs-hoverable="false">
                      <line x1="12" y1="5" x2="12" y2="19" 
                          data-gjs-draggable="false"
                          data-gjs-selectable="false"
                          data-gjs-editable="false"
                          data-gjs-highlightable="false"
                          data-gjs-droppable="false"
                          data-gjs-hoverable="false"/>
                      <line x1="5" y1="12" x2="19" y2="12" 
                          data-gjs-draggable="false"
                          data-gjs-selectable="false"
                          data-gjs-editable="false"
                          data-gjs-highlightable="false"
                          data-gjs-droppable="false"
                          data-gjs-hoverable="false"/>
                    </svg>
                  </button>
                  <div class="resize-handle"
                      data-gjs-draggable="false"
                      data-gjs-selectable="false"
                      data-gjs-editable="false"
                      data-gjs-highlightable="false"
                      data-gjs-droppable="false"
                      data-gjs-hoverable="false">
                  </div>
              </div>
        `;
    }
    return `
              <div class="container-row"
                  data-gjs-type="template-wrapper"
                  data-gjs-draggable="false"
                  data-gjs-selectable="false"
                  data-gjs-editable="false"
                  data-gjs-highlightable="true"
                  data-gjs-hoverable="true">
                ${wrappers}
            </div>
      `;
  }

  initResize(e) {
    const resizer = e.target.closest(".resize-handle");
    if (!resizer) return;

    const templateWrapper = resizer.closest(".template-wrapper");
    const containerRow = templateWrapper.parentElement;
    if (!containerRow) return;

    const templates = Array.from(containerRow.children).filter((child) => {
      child.classList.contains("template-wrapper");
    });
    if (templates.length === 3) return;

    this.isResizing = true;
    this.currentResizer = resizer;

    this.initialWidth = templateWrapper.offsetWidth;
    this.initialX = e.clientX;
  }

  resize(e) {
    if (!this.isResizing) return;

    const templateWrapper = this.currentResizer.closest(".template-wrapper");
    const containerRow = templateWrapper.parentElement;

    if (!containerRow) return;

    const templates = Array.from(containerRow.children).filter((child) => {
      return child.classList.contains("template-wrapper");
    });

    // Stop resizing if there are three templates
    if (templates.length === 3) {
      this.stopResize();
      return;
    }

    const currentIndex = templates.indexOf(templateWrapper);
    const deltaX = e.clientX - this.initialX;
    const containerWidth = containerRow.getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(containerRow).gap);
    const availableWidth = containerWidth - gap;
    const step = 100;

    // Calculate the current width percentage
    let newWidth = ((this.initialWidth + deltaX) / availableWidth) * 100;

    // Snap to nearest step of 100px
    newWidth = Math.round(newWidth / step) * step;

    const minWidth = step;
    const maxWidth = templates.length === 2 ? step : 100; // Adjust maximum width for two templates

    if (newWidth < minWidth) {
      newWidth = minWidth;
    } else if (newWidth > maxWidth) {
      newWidth = maxWidth;
    }

    templateWrapper.style.flex = `0 0 ${newWidth}px`;

    if (templates.length === 2) {
      const otherTemplate = templates[currentIndex === 0 ? 1 : 0];
      let otherNewWidth = 100 - newWidth;

      otherNewWidth = Math.round(otherNewWidth / step) * step;
      if (otherNewWidth > 200) {
        otherNewWidth = 200;
      }

      otherTemplate.style.flex = `0 0 calc(${otherNewWidth}px + 0.8rem)`;
    }

    templateWrapper.getBoundingClientRect();
  }

  stopResize() {
    this.isResizing = false;
  }

  updateRightButtons(containerRow) {
    if (!containerRow) return;

    const templates = containerRow.components();
    let totalWidth = 0;
    templates.forEach((template) => {
      if (!template || !template.view || !template.view.el) return;

      const rightButton = template.view.el.querySelector(".add-button-right");
      if (!rightButton) return;
      const rightButtonComponent = template.find(".add-button-right")[0];

      if (templates.length >= 3) {
        rightButton.setAttribute("disabled", "true");
        rightButtonComponent.addStyle({ display: "none" });
      } else {
        rightButton.removeAttribute("disabled");
        rightButtonComponent.addStyle({ display: "flex" });
      }
    });
  }

  addTemplateRight(templateComponent) {
    const containerRow = templateComponent.parent();
    if (!containerRow || containerRow.components().length >= 3) return;

    const newComponents = this.editor.addComponents(this.createTemplateHTML());
    const newTemplate = newComponents[0];
    if (!newTemplate) return;

    const index = templateComponent.index();
    containerRow.append(newTemplate, { at: index + 1 });
    const templates = containerRow.components();

    const equalWidth = 100 / templates.length;
    templates.forEach((template) => {
      template.addStyle({
        flex: `0 0 calc(${equalWidth}% - 0.3.5rem)`,
      });
    });

    this.updateRightButtons(containerRow);
  }

  addTemplateBottom(templateComponent) {
    const currentRow = templateComponent.parent();
    const containerColumn = currentRow?.parent();

    if (!containerColumn) return;

    const newRow = this.editor.addComponents(`
        <div class="container-row"
            data-gjs-type="template-wrapper"
            data-gjs-draggable="false"
            data-gjs-selectable="false"
            data-gjs-editable="false"
            data-gjs-highlightable="false"
            data-gjs-hoverable="false">
          ${this.createTemplateHTML()}
        </div>
      `)[0];

    const index = currentRow.index();
    containerColumn.append(newRow, { at: index + 1 });
  }

  deleteTemplate(templateComponent) {
    if (
      !templateComponent ||
      templateComponent.getClasses().includes("default-template")
    )
      return;

    const containerRow = templateComponent.parent();
    if (!containerRow) return;

    templateComponent.remove();

    // Adjust widths of remaining templates
    const templates = containerRow.components();
    const newWidth = 100 / templates.length;
    templates.forEach((template) => {
      if (template && template.setStyle) {
        template.addStyle({ width: `${newWidth}%` });
      }
    });

    this.updateRightButtons(containerRow);
  }

  saveCurrentPage() {
    const localStorageKey = `page-${this.getCurrentPageId()}`;
    try {
      const data = this.editor.getProjectData();
      localStorage.setItem(localStorageKey, JSON.stringify(data));
      let pageData = mapTemplateToPageData(this.editor.getProjectData());
      let pageId = this.getCurrentPageId();
      if (pageId) {
        let data = {
          PageId: pageId,
          PageJsonContent: JSON.stringify(pageData),
          PageGJSHtml: this.editor.getHtml(),
          PageGJSJson: JSON.stringify(this.editor.getProjectData()),
          SDT_Page: pageData,
          PageIsPublished: true,
        };
        
        this.toolsSection.dataManager.updatePage(data).then((res) => {
          console.log("Page Save Successfully");
        });
      }
    } catch (error) {
      console.log(error);
      const message = this.currentLanguage.getTranslation(
        "failed_to_save_current_page_message"
      );
      const status = "error";
      this.toolsSection.displayAlertMessage(message, status);
    }
  }

  rightClickEventHandler() {
    const iframe = document.querySelector("#gjs iframe");
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    const contextMenu = document.getElementById("contextMenu");

    // Helper function to hide context menu
    const hideContextMenu = () => {
      contextMenu.style.display = "none";
    };

    document.addEventListener("click", (e) => {
      if (!contextMenu.contains(e.target)) {
        hideContextMenu();
      }
    });

    iframeDoc.addEventListener("click", () => {
      hideContextMenu();
    });

    // Handle right-click (context menu)
    iframeDoc.addEventListener("contextmenu", (e) => {
      const block = e.target.closest(".template-block");
      if (block) {
        e.preventDefault();

        // Get iframe's position relative to viewport
        const iframeRect = iframe.getBoundingClientRect();

        // Calculate position relative to viewport without scroll position
        const x = e.clientX + iframeRect.left;
        const y = e.clientY + iframeRect.top;

        // Position context menu
        contextMenu.style.position = "fixed";
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        contextMenu.style.display = "block";

        // Store current block reference
        window.currentBlock = block;
      } else {
        hideContextMenu();
      }
    });

    // Handle delete image action
    const deleteImage = document.getElementById("delete-bg-image");
    deleteImage.addEventListener("click", () => {
      const blockToDelete = window.currentBlock;
      if (blockToDelete) {
        const component = this.editor
          .getWrapper()
          .find('[data-gjs-type="default"]')
          .filter((comp) => comp.getEl() === blockToDelete)[0];

        if (component) {
          component.setStyle({
            "background-image": "",
          });
          console.log("Background image removed from component:", component);
        } else {
          console.log("Component not found for the block.");
        }

        hideContextMenu();
      }
    });

    // Close context menu on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        hideContextMenu();
      }
    });
  }
}
