class EditorManager {
  constructor(editor) {
    this.editor = editor;
    this.selectedTemplateWrapper = null;
    this.selectedComponent = null;
    this.templateComponent = null;
    this.isResizing = false;
    this.currentResizer = null;
    this.initialX = null;
    this.initialWidth = null;
  }

  init() {
    this.editor.on("load", () => {
      this.initialTemplate();

      const wrapper = this.editor.getWrapper();

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

        document.querySelector(`#templates-button`).classList.remove("active");
        document.querySelector(`#pages-button`).classList.remove("active");
        document.querySelector(`#pages-button`).classList.add("active");
        document.querySelector(`#mapping-section`).style.display = "none"
        document.querySelector(`#tools-section`).style.display = "block"
        
        document
          .querySelector(`#templates-content`)
          .classList.remove("active-tab");
        document.querySelector(`#pages-content`).classList.add("active-tab");

      }
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
  }

  updateTileTitle(inputTitle) {
    if (this.selectedTemplateWrapper) {
      const tileTitle = this.selectedTemplateWrapper.querySelector(
        ".tile-title"
      );

      if (tileTitle) {
        tileTitle.textContent = inputTitle;
      }
    }
  }

  getSelectedTemplateWrapper() {
    return this.selectedTemplateWrapper;
  }

  getSelectedComponent() {
    return this.selectedComponent;
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
  }

  initialTemplate() {
    return this.editor.addComponents(`
      <div class="frame-container"
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
            <span 
              id="tile-icon" 
              class="tile-icon"
              data-gjs-draggable="false"
              data-gjs-selectable="false"
              data-gjs-editable="false"
              data-gjs-droppable="false"
              data-gjs-highlightable="false"
              data-gjs-hoverable="false">
              
            </span>
            <span 
              id="tile-title" 
              class="tile-title"
              data-gjs-draggable="false"
              data-gjs-selectable="false"
              data-gjs-editable="false"
              data-gjs-droppable="false"
              data-gjs-highlightable="false"
              data-gjs-hoverable="false">Title</span>
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
                  <span 
                    id="tile-icon" 
                    class="tile-icon"
                    data-gjs-draggable="false"
                    data-gjs-selectable="false"
                    data-gjs-editable="false"
                    data-gjs-droppable="false"
                    data-gjs-highlightable="false"
                    data-gjs-hoverable="false">
                  </span>
                  <span 
                    id="tile-title" 
                    class="tile-title"
                    data-gjs-draggable="false"
                    data-gjs-selectable="false"
                    data-gjs-editable="false"
                    data-gjs-droppable="false"
                    data-gjs-highlightable="false"
                    data-gjs-hoverable="false">Title</span>
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

  // resize(e) {
  //   if (!this.isResizing) return;

  //   const templateWrapper = this.currentResizer.closest(".template-wrapper");
  //   const containerRow = templateWrapper.parentElement;

  //   if (!containerRow) return;

  //   const templates = Array.from(containerRow.children).filter((child) => {
  //     return child.classList.contains("template-wrapper");
  //   });

  //   // Stop resizing if there are three templates
  //   if (templates.length === 3) {
  //     this.stopResize();
  //     return;
  //   }

  //   const currentIndex = templates.indexOf(templateWrapper);
  //   const deltaX = e.clientX - this.initialX;
  //   const containerWidth = containerRow.getBoundingClientRect().width;
  //   const gap = parseFloat(getComputedStyle(containerRow).gap);
  //   const availableWidth = containerWidth - gap;

  //   let newWidthPercentage =
  //     ((this.initialWidth + deltaX) / availableWidth) * 100;

  //   const minWidth = 33.33;
  //   const maxWidth = templates.length === 2 ? 7 : 100; // Adjust maximum width for two templates

  //   // Adjust the new width percentage based on the min and max limits
  //   if (newWidthPercentage < minWidth) {
  //     newWidthPercentage = minWidth;
  //   } else if (newWidthPercentage > maxWidth) {
  //     newWidthPercentage = maxWidth;
  //   }

  //   templateWrapper.style.flex = `0 0 calc(${newWidthPercentage}% - 0.35rem)`;

  //   // Automatically resize the other template if there are two templates
  //   if (templates.length === 2) {
  //     const otherTemplate = templates[currentIndex === 0 ? 1 : 0];
  //     let otherNewWidthPercentage = 100 - newWidthPercentage;

  //     // Ensure the other template's width also does not exceed 70%
  //     if (otherNewWidthPercentage > 70) {
  //       otherNewWidthPercentage = 68;
  //     }

  //     otherTemplate.style.flex = `0 0 calc(${otherNewWidthPercentage}% - 0.35rem)`;
  //   }

  //   // Recalculate the bounding rect (optional)
  //   templateWrapper.getBoundingClientRect();
  // }
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
    console.log(availableWidth);
    const step = 33.33;
  
    // Calculate the current width percentage
    let newWidthPercentage =
      ((this.initialWidth + deltaX) / availableWidth) * 100;
  
    // Snap to nearest step of 33.33%
    newWidthPercentage = Math.round(newWidthPercentage / step) * step;
  
    const minWidth = step;
    const maxWidth = templates.length === 2 ? step : 100; // Adjust maximum width for two templates
  
    if (newWidthPercentage < minWidth) {
      newWidthPercentage = minWidth;
    } else if (newWidthPercentage > maxWidth) {
      newWidthPercentage = maxWidth;
    }
  
    templateWrapper.style.flex = `0 0 calc(${newWidthPercentage}% - 0.1rem)`;
  
    if (templates.length === 2) {
      const otherTemplate = templates[currentIndex === 0 ? 1 : 0];
      let otherNewWidthPercentage = 100 - newWidthPercentage;
  
      otherNewWidthPercentage = Math.round(otherNewWidthPercentage / step) * step;
      if (otherNewWidthPercentage > 66.66) {
        otherNewWidthPercentage = 66.66;
      }
  
      otherTemplate.style.flex = `0 0 calc(${otherNewWidthPercentage}% - 0.1rem)`;
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

      if (templates.length >= 3) {
        rightButton.setAttribute("disabled", "true");
      } else {
        rightButton.removeAttribute("disabled");
      }
    });
  }

  addTemplateRight(templateComponent) {
    const containerRow = templateComponent.parent();
    if (!containerRow || containerRow.components().length >= 3) return;

    const newComponents = this.editor.addComponents(this.createTemplateHTML());
    const newTemplate = newComponents[0];
    if (!newTemplate) return;

    containerRow.append(newTemplate);
    const templates = containerRow.components();

    const equalWidth = 100 / templates.length;
    templates.forEach((template) => {
      template.setStyle({
        flex: `0 0 calc(${equalWidth}% - 0.3.5rem)`,
      });
    });

    this.updateRightButtons(containerRow);
  }

  addTemplateBottom(templateComponent) {
    const currentRow = templateComponent.parent();
    const containerColumn = currentRow?.parent();

    if (!containerColumn) return;

    const newRow = editor.addComponents(`
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

    containerColumn.append(newRow);
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
        template.setStyle({ width: `${newWidth}%` });
      }
    });

    this.updateRightButtons(containerRow);
  }
}

class ToolBoxManager {
  constructor(editorManager) {
    this.editorManager = editorManager;
    this.themes = themesData;
    this.icons = iconsData;
    this.currentTheme = null;
    this.templates = templatesData;
    this.mappingsItems = mappingData;

    this.loadTheme();
    this.listThemesInSelectField();
    this.colorPalette();
    this.loadTiles();
    this.loadPageTemplates();
  }

  init() {
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");
    tabButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault()
        alert()
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        tabContents.forEach((content) =>
          content.classList.remove("active-tab")
        );

        button.classList.add("active");
        document
          .querySelector(`#${button.dataset.tab}-content`)
          .classList.add("active-tab");
      });
    });

    // mapping
    const mappingButton = document.getElementById("open-mapping");
    const mappingSection = document.getElementById("mapping-section");
    const toolsSection = document.getElementById("tools-section");

    mappingButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      toolsSection.style.display =
        toolsSection.style.display === "none" ? "block" : "none";

      mappingSection.style.display =
        mappingSection.style.display === "block" ? "none" : "block";

      this.loadMappings();
    });

    // alignment

    const leftAlign = document.getElementById("align-left");
    const centerAlign = document.getElementById("align-center");

    leftAlign.addEventListener("click", () => {
      if (this.editorManager.selectedTemplateWrapper) {
        const templateBlock = this.editorManager.selectedTemplateWrapper.querySelector(
          ".tile-title"
        );
        
        if (templateBlock) {
          templateBlock.style.display = "flex";
          templateBlock.style.justifyContent = "flex-start";
        }
      }
    });

    centerAlign.addEventListener("click", () => {
      if (this.editorManager.selectedTemplateWrapper) {
        const templateBlock = this.editorManager.selectedTemplateWrapper.querySelector(
          ".tile-title"
        );
        
        if (templateBlock) {
          templateBlock.style.display = "flex";
          templateBlock.style.justifyContent = "center";
        }
      }
    });
  }

  listThemesInSelectField() {
    const themeSelect = document.getElementById("theme-select");

    this.themes.forEach((theme) => {
      const option = document.createElement("option");
      option.value = theme.name;
      option.textContent = theme.name;

      themeSelect.appendChild(option);
    });

    themeSelect.addEventListener("change", (e) => {
      this.setTheme(e.target.value);
    });
  }

  loadTheme() {
    const savedTheme = localStorage.getItem("selectedTheme");
    if (savedTheme) {
      this.setTheme(savedTheme);
    }
  }

  setTheme(themeName) {
    this.currentTheme = this.themes.find((theme) => theme.name === themeName);
    this.applyTheme();
    this.themeColorPalette(this.currentTheme.colors);
    localStorage.setItem("selectedTheme", themeName);
  }

  applyTheme() {
    const root = document.documentElement;
    const iframe = document.querySelector("#gjs iframe");

    // Set CSS variables from the selected theme
    root.style.setProperty(
      "--primary-color",
      this.currentTheme.colors.primaryColor
    );
    root.style.setProperty(
      "--secondary-color",
      this.currentTheme.colors.secondaryColor
    );
    root.style.setProperty(
      "--background-color",
      this.currentTheme.colors.backgroundColor
    );
    root.style.setProperty("--text-color", this.currentTheme.colors.textColor);
    root.style.setProperty(
      "--button-bg-color",
      this.currentTheme.colors.buttonBgColor
    );
    root.style.setProperty(
      "--button-text-color",
      this.currentTheme.colors.buttonTextColor
    ); // New
    root.style.setProperty(
      "--card-bg-color",
      this.currentTheme.colors.cardBgColor
    ); // New
    root.style.setProperty(
      "--card-text-color",
      this.currentTheme.colors.cardTextColor
    ); // New
    root.style.setProperty(
      "--accent-color",
      this.currentTheme.colors.accentColor
    );
    root.style.setProperty("--font-family", this.currentTheme.fontFamily);

    // Apply this.currentTheme to iframe (canvas editor)
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.body.style.setProperty(
      "--primary-color",
      this.currentTheme.colors.primaryColor
    );
    iframeDoc.body.style.setProperty(
      "--secondary-color",
      this.currentTheme.colors.secondaryColor
    );
    iframeDoc.body.style.setProperty(
      "--background-color",
      this.currentTheme.colors.backgroundColor
    );
    iframeDoc.body.style.setProperty(
      "--text-color",
      this.currentTheme.colors.textColor
    );
    iframeDoc.body.style.setProperty(
      "--button-bg-color",
      this.currentTheme.colors.buttonBgColor
    );
    iframeDoc.body.style.setProperty(
      "--button-text-color",
      this.currentTheme.colors.buttonTextColor
    ); // New
    iframeDoc.body.style.setProperty(
      "--card-bg-color",
      this.currentTheme.colors.cardBgColor
    ); // New
    iframeDoc.body.style.setProperty(
      "--card-text-color",
      this.currentTheme.colors.cardTextColor
    ); // New
    iframeDoc.body.style.setProperty(
      "--accent-color",
      this.currentTheme.colors.accentColor
    );
    iframeDoc.body.style.setProperty(
      "--font-family",
      this.currentTheme.fontFamily
    );
  }

  themeColorPalette(colors) {
    const colorPaletteContainer = document.getElementById(
      "theme-color-palette"
    );
    colorPaletteContainer.innerHTML = ""; // Clear any existing content

    const colorEntries = Object.entries(colors); // Get an array of [key, value] pairs

    colorEntries.forEach(([colorName, colorValue], index) => {
      // Create the HTML for each color
      const alignItem = document.createElement("div");
      alignItem.className = "color-item";

      const radioInput = document.createElement("input");
      radioInput.type = "radio";
      radioInput.id = `color-${colorName}`;
      radioInput.name = "theme-color";
      radioInput.value = colorName;

      const colorBox = document.createElement("label");
      colorBox.className = "color-box";
      colorBox.setAttribute("for", `color-${colorName}`);
      colorBox.style.backgroundColor = colorValue;

      // Append radio and color box to the alignItem
      alignItem.appendChild(radioInput);
      alignItem.appendChild(colorBox);

      // Append the alignItem to the color palette container
      colorPaletteContainer.appendChild(alignItem);

      // Handle the click event to apply the color
      colorBox.onclick = () => {
        this.editorManager.selectedComponent.addStyle({
          "background-color": colorValue,
        });
      };
    });
  }

  colorPalette() {
    const textColorBoxes = document.querySelectorAll(
      "#text-color-palette .color-box"
    );
    const iconColorBoxes = document.querySelectorAll(
      "#icon-color-palette .color-box"
    );

    const colorValues = {
      color1: "#ffffff",
      color2: "#333333",
    };

    textColorBoxes.forEach((box, index) => {
      const colorKey = Object.keys(colorValues)[index];

      box.style.backgroundColor = colorValues[colorKey];

      box.onclick = () => {
        this.editorManager.selectedComponent.addStyle({
          color: colorValues[colorKey],
        });
      };
    });

    iconColorBoxes.forEach((box, index) => {
      const colorKey = Object.keys(colorValues)[index];

      box.style.backgroundColor = colorValues[colorKey];

      box.onclick = () => {
        const svgIcon = this.editorManager.selectedTemplateWrapper.querySelector(
          ".tile-icon svg path"
        );

        if (svgIcon) {
          svgIcon.setAttribute("fill", colorValues[colorKey]); // Use the correct color key
        } else {
          console.log("SVG icon not found.");
        }
      };
    });
  }

  loadTiles() {
    const tileIcons = document.getElementById("icons-list");

    this.icons.forEach((icon) => {
      const iconItem = document.createElement("div");
      iconItem.classList.add("icon");
      iconItem.innerHTML = `
          ${icon.svg}
          <span class="icon-title">${icon.name}</span>
      `;

      iconItem.onclick = () => {
        if (this.editorManager.selectedTemplateWrapper) {
          // Find the .template-block inside the selected template wrapper
          const templateBlock = this.editorManager.selectedTemplateWrapper.querySelector(
            ".template-block"
          );

          if (templateBlock) {
            // Insert the icon SVG into the tile-icon div
            const tileIcon = templateBlock.querySelector(".tile-icon");
            if (tileIcon) {
              tileIcon.innerHTML = icon.svg;
            }

            // Insert the icon name into the tile-title span
            const tileTitle = templateBlock.querySelector(".tile-title");
            if (tileTitle) {
              tileTitle.textContent = icon.name;
            }

            const sidebarInputTitle = document.getElementById("tile-title");
            if (sidebarInputTitle) {
              sidebarInputTitle.value = icon.name;
            }
          } else {
            console.log(
              "No .template-block found inside the selected template wrapper."
            );
          }
        } else {
          console.log("No selected template wrapper found.");
        }
      };

      tileIcons.appendChild(iconItem);
    });
  }

  loadPageTemplates() {
    const pageTemplates = document.getElementById("page-templates");

    this.templates.forEach((template, index) => {
      const blockElement = document.createElement("div");
      blockElement.className = "page-template-wrapper"; // Wrapper class for each template block

      // Create the number element
      const numberElement = document.createElement("div");
      numberElement.className = "page-template-block-number";
      numberElement.textContent = index + 1; // Set the number

      const templateBlock = document.createElement("div");
      templateBlock.className = "page-template-block";
      templateBlock.title = "Click to load template"; //
     templateBlock.innerHTML = `<div>${template.media}</div>`;

      // Prevent the image from being dragged
      templateBlock.querySelector("img").addEventListener("dragstart", (e) => {
        e.preventDefault();
      });

      // Add the block content (HTML) to the canvas when clicked
      blockElement.addEventListener("click", () => {
        const userConfirmed = confirm(
          "When you continue, all the changes you have made will be cleared."
        );

        if (userConfirmed) {
          this.editorManager.addFreshTemplate(template.content);
        } else {
          return;
        }
      });

      // Append number and template block to the wrapper
      blockElement.appendChild(numberElement);
      blockElement.appendChild(templateBlock);
      pageTemplates.appendChild(blockElement);
    });
  }

  loadMappings() {
    const treeContainer = document.getElementById("tree-container");
    this.clearMappings();
    treeContainer.appendChild(this.createTree(this.mappingsItems, true));
  }
  clearMappings() {
    const treeContainer = document.getElementById("tree-container");
    treeContainer.innerHTML = ""; // Clear previous mappings
  }

  createTree(data, isRoot = false) {
    const pagesManager = this.editorManager.editor.Pages;

    const ul = document.createElement("ul");
    if (!isRoot) ul.style.display = "block";

    data.forEach((item, index) => {
      pagesManager.add({
        id: item.id,
        name: item.name,
      });

      const li = document.createElement("li");
      const span = document.createElement("span");
      span.textContent = item.name;
      li.appendChild(span);

      if (item.children && item.children.length > 0) {
        const childrenContainer = this.createTree(item.children); // Recursively create children
        li.appendChild(childrenContainer);

        span.textContent = item.name + " +";
        span.style.cursor = "pointer";

        span.onclick = () => {
          childrenContainer.style.display =
            childrenContainer.style.display === "none" ? "block" : "none";

          span.textContent =
            childrenContainer.style.display === "none"
              ? item.name + " +"
              : item.name + " -";
        };
      } else {
        span.onclick = () => {
          pagesManager.getSelected().id == item.id;
          pagesManager.select(item.id);
          console.log(
            "Selected page " + item.name + " selected Id is " + item.id
          );
        };
      }
      ul.appendChild(li);
    });
    console.log(pagesManager.getAll());
    return ul;
  }
}

class PagesManager {
  constructor(editor) {
    this.editor = [];
    this.selectedPageId = null;
  }
}

class Clock {
  constructor() {
    this.updateTime();
    setInterval(() => this.updateTime(), 60000); // Update time every minute
  }

  updateTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // Adjust hours for 12-hour format
    const timeString = `${hours}:${minutes}`;
    document.getElementById("current-time").textContent = timeString;
  }
}

new Clock();
const editorManager = new EditorManager(editor);
editorManager.init();
new ToolBoxManager(editorManager).init();
