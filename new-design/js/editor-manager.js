var globalEditor = null;

class EditorManager {
  constructor(editor, currentLanguage) {
    globalEditor = editor;
    this.editor = editor;
    this.selectedTemplateWrapper = null;
    this.selectedComponent = null;
    this.wrapperClickHandler = null;
    this.templateComponent = null;
    this.isResizing = false;
    this.currentResizer = null;
    this.initialX = null;
    this.initialWidth = null;
    this.currentLanguage = currentLanguage;
    this.pageId = this.getCurrentPageId();
    this.pageName = "Home";
    this.toolsSection = null;
    this.dataManager = null;
    this.newEditor = null;
    //this.editors = []
  }

  setToolsSection(toolBox) {
    this.toolsSection = toolBox;
  }

  setDataManager(dataManager) {
    this.dataManager = dataManager;
  }

  init() {
    this.editor.on("load", () => {
      this.toolsSection.resetPropertySection();

      const setupWrapperEvents = (editorInstance) => {
        const wrapper = editorInstance.getWrapper();
        if (!wrapper || !wrapper.view || !wrapper.view.el) return;

        if (this.wrapperClickHandler) {
          wrapper.view.el.removeEventListener(
            "click",
            this.wrapperClickHandler
          );
        }

        this.wrapperClickHandler = (e) => {
          const button = e.target.closest(".action-button");
          if (!button) return;

          const templateWrapper = button.closest(".template-wrapper");
          if (!templateWrapper) return;

          this.templateComponent = editorInstance.Components.getById(
            templateWrapper.id
          );
          if (!this.templateComponent) return;

          if (button.classList.contains("delete-button")) {
            this.deleteTemplate(this.templateComponent);
          } else if (button.classList.contains("add-button-bottom")) {
            this.addTemplateBottom(this.templateComponent, editorInstance);
          } else if (button.classList.contains("add-button-right")) {
            this.addTemplateRight(this.templateComponent, editorInstance);
          }
        };

        wrapper.view.el.addEventListener("click", this.wrapperClickHandler);
        wrapper.view.el.addEventListener("contextmenu", (e) =>
          this.rightClickEventHandler(this.editor)
        );

        wrapper.set({
          selectable: false,
          droppable: false,
          resizable: { handles: "e" },
        });
      };

      const handlePageData = (pageData) => {
        if (pageData && pageData.PageGJSJson) {
          let parsedData;
          try {
            parsedData = JSON.parse(pageData.PageGJSJson);
            if (!parsedData.pages) {
              parsedData = {
                pages: [
                  {
                    component: parsedData,
                    frames: [{ component: parsedData }],
                  },
                ],
              };
            }

            if (pageData.PageIsContentPage) {
              this.dataManager
                .getContentPageData(this.getCurrentPageId())
                .then((contentPageData) => {
                  if (contentPageData) {
                    this.toolsSection.pageContentCtas(
                      contentPageData.CallToActions,
                      this.editor
                    );
                  }
                })
                .catch((error) =>
                  console.error("Error fetching content page data:", error)
                );

              this.toolsSection.updatePropertySection();
            }

            this.editor.loadProjectData(parsedData);

            this.editor.once("load:components", () => {
              setupWrapperEvents(this.editor);
            });
          } catch (error) {
            const message = this.currentLanguage.getTranslation(
              "no_icon_selected_error_message"
            );
            this.toolsSection.displayAlertMessage(message, "error");
          }
        } else if (pageData && pageData.PageIsContentPage) {
          this.dataManager
            .getContentPageData(this.getCurrentPageId())
            .then((contentPageData) => {
              if (contentPageData) {
                this.initialContentPageTemplate(contentPageData);
                this.toolsSection.pageContentCtas(
                  contentPageData.CallToActions,
                  this.editor
                );
              }
            })
            .catch((error) =>
              console.error("Error fetching content page data:", error)
            );
          this.toolsSection.updatePropertySection();
          this.toolsSection.unDoReDo(this.editor);
        } else {
          this.initialTemplate();
        }
      };

      this.dataManager
        .getSinglePage(this.getCurrentPageId())
        .then((pageData) => {
          handlePageData(pageData);
          setupWrapperEvents(this.editor);
          this.rightClickEventHandler(this.editor);
        })
        .catch((error) => console.error("Error fetching page data:", error));
    });

    this.editor.on("component:selected", (component) => {
      this.toolsSection.resetPropertySection();
      this.selectedTemplateWrapper = component.getEl();

      this.selectedComponent = component;

      const sidebarInputTitle = document.getElementById("tile-title");
      if (this.selectedTemplateWrapper) {
        const tileLabel =
          this.selectedTemplateWrapper.querySelector(".tile-title");
        if (tileLabel) {
          sidebarInputTitle.value = tileLabel.textContent;
        }

        this.removeElementOnClick(".selected-tile-icon", ".tile-icon-section");
        this.removeElementOnClick(
          ".selected-tile-title",
          ".tile-title-section"
        );

        this.updateUIState();
        this.activateFrame(`#default-container`);

        // clear existing frames first
        this.clearEditors();

        this.handlePageSelection();
      }

      this.toolsSection.updateTileProperties(
        this.editor,
        this.getCurrentPageId()
      );
      this.hideContextMenu();

      this.toolsSection.unDoReDo(this.editor);
    });

    this.addDragEventListeners(this.editor);

    const sidebarInputTitle = document.getElementById("tile-title");
    sidebarInputTitle.addEventListener("input", (e) => {
      this.updateTileTitle(e.target.value);
    });

    const frameEl = this.editor.Canvas.getFrameEl();
    if (frameEl && frameEl.contentDocument) {
      frameEl.contentDocument.addEventListener("mousedown", this.initResize);
      frameEl.contentDocument.addEventListener("mousemove", this.resize);
      frameEl.contentDocument.addEventListener("mouseup", this.stopResize);
    }

    // run save every 1 minute
    // setInterval(() => {
    //   this.saveAllPages();
    // }, 60000);
  }

  removeElementOnClick(targetSelector, sectionSelector) {
    const closeSection = this.selectedComponent?.find(targetSelector)[0];
    if (closeSection) {
      const closeEl = closeSection.getEl();
      if (closeEl) {
        closeEl.onclick = () => {
          this.selectedComponent.find(sectionSelector)[0].remove();
        };
      }
    }
  }

  updateUIState() {
    document.querySelector("#templates-button").classList.remove("active");
    document.querySelector("#pages-button").classList.remove("active");
    document.querySelector("#pages-button").classList.add("active");
    document.querySelector("#mapping-section").style.display = "none";
    document.querySelector("#tools-section").style.display = "block";
  }

  activateFrame(activeFrameClass) {
    const activeFrame = document.querySelector(activeFrameClass);

    const inactiveFrames = document.querySelectorAll(".active-editor");
    inactiveFrames.forEach((frame) => {
      if (frame !== activeFrame) {
        frame.classList.remove("active-editor");
      }
    });

    activeFrame.classList.add("active-editor");
  }

  handlePageSelection() {
    const selectedTile =
      this.selectedComponent?.getAttributes()?.["tile-action-object-id"];
    const previousEditorId = localStorage.getItem("createdEditor");
    const page = this.dataManager.pages.find(
      (page) => page.PageId === selectedTile
    );

    this.childEditorManager.createChildEditor(page)

    if (page) {
      if (previousEditorId && previousEditorId !== page.PageId) {
        try {
          this.removeEditor(previousEditorId);
        } catch (error) {
          console.warn(
            `Could not remove previous editor ${previousEditorId}:`,
            error
          );
        }
      }
      const parentId = this.getCurrentPageId();
      this.createEditor(page, parentId);
      this.handleNewEditor(page, parentId);
      localStorage.setItem("createdEditor", selectedTile);
    } else {
      this.removeEditor(previousEditorId);
    }
  }

  hideContextMenu() {
    const contextMenu = document.getElementById("contextMenu");
    if (contextMenu) {
      contextMenu.style.display = "none";
    }
  }

  addDragEventListeners(editorInstance) {
    editorInstance.on("component:drag:start", () => {
      const iframe = document.querySelector("#gjs iframe");
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.body.style.cursor = "grabbing";
    });

    editorInstance.on("component:drag:end", () => {
      const iframe = document.querySelector("#gjs iframe");
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.body.style.cursor = "";
    });
  }

  handleNewEditor(page, parentId) {
    this.newEditor.once("load", () => {
      // Reset tools section and set up undo/redo
      this.toolsSection.resetPropertySection();
      this.toolsSection.unDoReDo(this.newEditor);

      // Handle back button action
      this.backButtonAction(page.PageId);

      // Get canvas and frame
      const canvas = this.newEditor.Canvas;
      const frame = canvas.getFrameEl();
      const frameDoc = frame.contentDocument || frame.contentWindow.document;

      if (!frameDoc || !frameDoc.body) {
        console.error("Frame document is unavailable");
        return;
      }

      // Unified click handler with delegation
      const clickHandler = (e) => {
        const target = e.target;

        // Handle action buttons
        const button = target.closest(".action-button");
        if (button) {
          this.handleActionButtonClick(button);
          return;
        }

        // Activate frame
        this.activateFrame(`.frame-${page.PageId}`);
      };

      // Content page-specific click handler
      const contentPageClickHandler = (e) => {
        console.log("Content Page Clicked");
        this.dataManager
          .getContentPageData(page.PageId)
          .then((contentData) => {
            console.log("Content Data: ", contentData);
            this.toolsSection.pageContentCtas(
              contentData.CallToActions,
              this.newEditor
            );
            this.toolsSection.updatePropertySection();
          })
          .catch((error) =>
            console.error("Failed to load page content:", error.message)
          );
      };

      // Add click listener with delegation
      frameDoc.body.addEventListener("click", clickHandler);

      // Additional setup for content pages
      if (page.PageIsContentPage) {
        frameDoc.body.addEventListener("click", contentPageClickHandler);
      }

      // Cleanup when editor is replaced
      this.newEditor.on("destroy", () => {
        frameDoc.body.removeEventListener("click", clickHandler);
        if (page.PageIsContentPage) {
          frameDoc.body.removeEventListener("click", contentPageClickHandler);
        }
      });
    });

    // Component selection handler
    this.newEditor.on("component:selected", (component) => {
      this.selectedTemplateWrapper = component.getEl();
      this.selectedComponent = component;

      const selectedTileId = component.getAttributes()["tile-action-object-id"];

      if (page.PageIsContentPage) {
        this.toolsSection.updateTileProperties(this.newEditor, page);
        return;
      }

      if (
        !this.activePageId ||
        selectedTileId !== this.activePageId ||
        !this.activeEditor
      ) {
        this.replaceEditor(selectedTileId, parentId);
      }

      this.activateFrame(`.frame-${page.PageId}`);
      this.toolsSection.updateTileProperties(this.newEditor, page);
      this.toolsSection.unDoReDo(this.newEditor);
    });
  }

  handleActionButtonClick(button) {
    const templateWrapper = button.closest(".template-wrapper");
    if (!templateWrapper) return;

    const templateComponent = this.newEditor.Components.getById(
      templateWrapper.id
    );
    if (!templateComponent) return;

    if (button.classList.contains("delete-button")) {
      this.deleteTemplate(templateComponent);
    } else if (button.classList.contains("add-button-bottom")) {
      this.addTemplateBottom(templateComponent, this.newEditor);
    } else if (button.classList.contains("add-button-right")) {
      this.addTemplateRight(templateComponent, this.newEditor);
    }
  }

  replaceEditor(pageId, parentId) {
    const existingEditorIndex = this.editors.findIndex(
      (editorObj) => editorObj.pageId === pageId
    );

    if (existingEditorIndex !== -1) {
      const existingEditor = this.editors[existingEditorIndex];
      this.newEditor = existingEditor.editor;
      this.activeEditor = existingEditor.editor;
      this.activePageId = pageId;
      this.activateFrame(`.frame-${pageId}`);
      return;
    }

    // Find the page details
    const page = this.dataManager.pages.find((p) => p.PageId === pageId);

    if (!page) {
      return;
    }

    // Check if the current active editor has the same parent ID as the incoming editor
    const currentEditor = this.editors.find(
      (editorObj) => editorObj.pageId === this.activePageId
    );

    if (currentEditor && currentEditor.parentId === parentId) {
      this.removeEditor(this.activePageId);
    } else {
      console.log(
        `Outgoing and incoming editors have different parent IDs. Keeping existing editors.`
      );
    }

    this.clearDescendants(parentId);
    // Create and activate the new editor
    this.activeEditor = this.createEditor(page, parentId);
    this.activePageId = pageId;

    // Handle events for the new editor
    this.handleNewEditor(page);

    // Activate navigators
    this.activateNavigators();
  }

  clearDescendants(parentId) {
    const getDescendants = (parentId) => {
      // Find the index of the first item with the specified parentId
      const startIndex = this.editors.findIndex(
        (item) => item.parentId === parentId
      );

      if (startIndex === -1) {
        console.warn(`No item found with parentId: ${parentId}`);
        return [];
      }

      // Skip the item with the specified parentId and return the items starting from the next one
      return this.editors.slice(startIndex);
    };

    const descendants = getDescendants(parentId);

    descendants.forEach((editorObj) => {
      this.removeEditor(editorObj.pageId);
    });
  }

  clearEditors() {
    if (!this.editors || this.editors.length === 0) {
      return;
    }

    this.editors.forEach((editorObj) => {
      // Destroy the editor instance if it exists
      if (editorObj.editor && typeof editorObj.editor.destroy === "function") {
        editorObj.editor.destroy();
      }

      // Remove the editor container from the DOM
      const container = document.getElementById(editorObj.containerId);
      if (container) {
        container.remove();
      }
    });

    // Reset the editors array and active editor references
    this.editors = [];
    this.activeEditor = null;
    this.activePageId = null;
    this.newEditor = null;
  }

  activateNavigators() {
    const leftNavigator = document.querySelector(".page-navigator-left");
    const rightNavigator = document.querySelector(".page-navigator-right");

    if (leftNavigator && rightNavigator) {
      // Display the navigators
      leftNavigator.style.display = "block";
      rightNavigator.style.display = "block";

      // Add event listeners for scrolling
      const scrollLeftButton = document.getElementById("scroll-left");
      const scrollRightButton = document.getElementById("scroll-right");
    }
  }

  updateTileTitle(inputTitle) {
    if (this.selectedTemplateWrapper) {
      const titleComponent = this.selectedComponent.find(".tile-title")[0];
      if (titleComponent) {
        titleComponent.components(inputTitle);
        this.selectedComponent.addAttributes({ "tile-title": inputTitle });
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

  addFreshTemplate(template, editorInstance) {
    editorInstance.DomComponents.clear();
    let fullTemplate = "";

    template.forEach((columns) => {
      const templateRow = this.generateTemplateRow(columns);
      fullTemplate += templateRow;
    });

    editorInstance.addComponents(`
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
                 data-gjs-highlightable="false"
                 data-gjs-hoverable="false">
              ${this.createTemplateHTML(true)}
            </div>
          </div>
        </div>
      `)[0];
  }

  initialContentPageTemplate(contentPageData) {
    return `
      <div
        class="content-frame-container"
        id="frame-container"
        data-gjs-draggable="false"
        data-gjs-selectable="false"
        data-gjs-editable="false"
        data-gjs-highlightable="false"
        data-gjs-droppable="false"
        data-gjs-hoverable="false"
      >
        <div
          class="container-column"
          data-gjs-draggable="false"
          data-gjs-selectable="false"
          data-gjs-editable="false"
          data-gjs-highlightable="false"
          data-gjs-droppable="false"
          data-gjs-hoverable="false"
        >
          <div
            class="container-row"
            data-gjs-draggable="false"
            data-gjs-selectable="false"
            data-gjs-editable="false"
            data-gjs-droppable="false"
            data-gjs-highlightable="true"
            data-gjs-hoverable="true"
          >
            <div
              class="template-wrapper"
              data-gjs-draggable="false"
              data-gjs-selectable="false"
              data-gjs-editable="false"
              data-gjs-droppable="false"
              data-gjs-highlightable="true"
              data-gjs-hoverable="true"
              style="display: flex; width: 100%"
            >
              <div
                data-gjs-draggable="false"
                data-gjs-selectable="false"
                data-gjs-editable="false"
                data-gjs-highlightable="false"
                data-gjs-droppable="true"
                data-gjs-resizable="false"
                data-gjs-hoverable="false"
                style="flex: 1; padding: 0"
              >
                <img
                  class="content-page-block"
                  id="product-service-image"
                  data-gjs-draggable="true"
                  data-gjs-selectable="false"
                  data-gjs-editable="false"
                  data-gjs-droppable="false"
                  data-gjs-highlightable="false"
                  data-gjs-hoverable="false"
                  src="${contentPageData.ProductServiceImage}"
                  style="width: 100%; height: 7rem; border-radius: 14px; margin-bottom: 15px"
                  alt="Full-width Image"
                />
                <p
                  style="flex: 1; padding: 0; margin: 0; height: auto; margin-bottom: 15px"
                  class="content-page-block"
                  data-gjs-draggable="true"
                  data-gjs-selectable="false"
                  data-gjs-editable="false"
                  data-gjs-droppable="false"
                  data-gjs-highlightable="false"
                  data-gjs-hoverable="false"
                  id="product-service-description"
                >
                ${contentPageData.ProductServiceDescription}
                </p>
              </div>
            </div>
          </div>
          <div class="cta-button-container" ${defaultConstraints}></div>      
        </div>
      </div>

    `;
  }

  createTemplateHTML(isDefault = false) {
    return `
        <div class="template-wrapper ${
          isDefault ? "default-template" : ""
        }"        
              data-gjs-selectable="false"
              data-gjs-type="template-wrapper"
              data-gjs-editable="false"
              data-gjs-highlightable="false"
              data-gjs-droppable="false"
              data-gjs-resizable="false"
              data-gjs-hoverable="false">
          <div class="template-block"
              ${defaultTileAttrs} 
             data-gjs-draggable="false"
             data-gjs-selectable="true"
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
                  data-gjs-selectable="false"
                  data-gjs-droppable="false">
                  <div class="template-block"
                    data-gjs-draggable="false"
                    data-gjs-selectable="true"
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

  addTemplateRight(templateComponent, editorInstance) {
    const containerRow = templateComponent.parent();
    if (!containerRow || containerRow.components().length >= 3) return;
    const newComponents = editorInstance.addComponents(
      this.createTemplateHTML()
    );
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

  addTemplateBottom(templateComponent, editorInstance) {
    const currentRow = templateComponent.parent();
    const containerColumn = currentRow?.parent();

    if (!containerColumn) return;

    const newRow = editorInstance.addComponents(`
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

  saveAllPages() {
    if (!this.editors || this.editors.length === 0) {
      console.warn("No editors found to save.");
      return;
    }

    this.editors.forEach((editorObj) => {
      const { editor, pageId } = editorObj;

      if (!editor || !pageId) {
        console.warn("Editor or PageId is missing for an editor entry.");
        return;
      }

      let projectData = editor.getProjectData();
      let htmlData = editor.getHtml();
      let jsonData;

      const pageIsContent = this.dataManager.pages.find(
        (page) => page.PageId === pageId
      );

      if (pageIsContent.PageIsContentPage) {
        jsonData = mapContentToPageData(projectData);
        console.log("ProjectData is: ", jsonData);
      } else {
        jsonData = mapTemplateToPageData(projectData);
        console.log("ProjectData is: ", jsonData);
      }

      if (pageId) {
        let data = {
          PageId: pageId,
          PageJsonContent: JSON.stringify(jsonData),
          PageGJSHtml: htmlData,
          PageGJSJson: JSON.stringify(projectData),
          SDT_Page: jsonData,
          PageIsPublished: true,
        };
        this.dataManager.updatePage(data).then((res) => {
          this.displayAlertMessage("Page Save Successfully", "success");
        });
      }
    });
  }

  rightClickEventHandler(editorInstance) {
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
        const component = editorInstance
          .getWrapper()
          .find('[data-gjs-type="default"]')
          .filter((comp) => comp.getEl() === blockToDelete)[0];

        if (component) {
          component.setStyle({
            "background-image": "",
          });
        } else {
          console.error("Component not found for the block.");
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

  sanitizeId(id) {
    return `id-${id.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  }

  createEditor(page, parentId) {
    console.log("Creating editor for page:", page);
    const editorsContainer = document.getElementById("editors-container");
    const sanitizedId = this.sanitizeId(page.PageId);

    this.parentId = page.PageId;
    // Deactivate any currently active editors
    if (this.editors) {
      this.editors.forEach((editorObj) => {
        const container = document.getElementById(editorObj.containerId);
        if (container) {
          container.classList.remove("active-editor");
        }
      });
    }

    // Create a container for the editor
    const editorContainer = document.createElement("div");
    editorContainer.className = `mobile-frame frame-${page.PageId}`; // Add active-editor class
    editorContainer.id = `container-${sanitizedId}`;

    // Header
    const header = document.createElement("div");
    header.innerHTML = `
      <div class="header">
        <span id="current-time"></span>
        <span class="icons">
          <i class="fas fa-signal"></i>
          <i class="fas fa-wifi"></i>
          <i class="fas fa-battery"></i>
        </span>
      </div>`;
    const appBar = document.createElement("div");
    appBar.className = "app-bar";
    appBar.innerHTML = `
    <button id="content-back-button" class="back-button">
        <svg class="back-arrow" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5"/>
            <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M19 12H5M5 12L12 19M5 12L12 5"/>
        </svg>
    </button>
    <h1 class="title">${page.PageName}</h1>
    `;

    const editorDiv = document.createElement("div");
    editorDiv.id = sanitizedId;
    editorDiv.className = "gjs-container";

    // Append the title and the editor container to the main container
    editorContainer.appendChild(header);
    if (page.PageIsContentPage) {
      editorContainer.appendChild(appBar);
    }
    editorContainer.appendChild(editorDiv);
    editorsContainer.appendChild(editorContainer);

    // Initialize the GrapesJS editor
    this.newEditor = grapesjs.init({
      container: `#${sanitizedId}`,
      fromElement: true,
      height: "100%",
      width: "auto",
      storageManager: {
        type: "local",
      },
      canvas: {
        styles: [
          "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css",
          "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css",
          "https://fonts.googleapis.com/css2?family=Lora&family=Merriweather&family=Poppins:wetts@400;500&family=Roboto:wght@400;500&display=swap",
          "/Resources/UCGrapes/new-design/css/toolbox.css",
        ],
      },
      baseCss: " ",
      dragMode: "normal",
      panels: { defaults: [] },
      sidebarManager: false,
      modal: false,
      commands: false,
      hoverable: false,
      highlightable: false,
    });

    // Set this new editor as the active editor
    // this.editor = editor;

    // Load page content
    if (page.PageGJSJson) {
      this.pageContent(page.PageId)
        .then((parsedData) => {
          this.newEditor.loadProjectData(parsedData);
          console.log("Project data successfully loaded:", parsedData);
          if (page.PageIsContentPage) {
            this.dataManager.getContentPageData(page.PageId).then((res) => {
              console.log(res);
              console.log(parsedData.pages[0]);
              let img = this.newEditor
                .getWrapper()
                .find("#product-service-image");
              let p = this.newEditor
                .getWrapper()
                .find("#product-service-description");
              if (img.length) {
                img[0].setAttributes({ src: res.ProductServiceImage });
              }
              if (p.length) {
                p[0].replaceWith(`
                  <p id="product-service-description" class="content-page-block">
                    ${res.ProductServiceDescription}
                  </p>
                  `);
              }
            });
          }
        })
        .catch((error) => {
          console.error("Failed to load page content:", error.message);
        });
    } else {
      // load product/service content
      this.dataManager
        .getContentPageData(page.PageId)
        .then((contentPageData) => {
          if (contentPageData) {
            this.newEditor.DomComponents.clear();
            console.log("Content page data from products");
            console.log("Page Id is: ", page.PageId);
            const projectData =
              this.initialContentPageTemplate(contentPageData);
            this.newEditor.addComponents(projectData)[0];
          }
        })
        .catch((error) =>
          console.error("Error fetching content page data:", error)
        );
    }
    // Store editor reference and its associated metadata
    if (!this.editors) {
      this.editors = [];
    }

    // Check if an editor with this pageId already exists and remove it
    const existingEditorIndex = this.editors.findIndex(
      (editorObj) => editorObj.pageId === page.PageId
    );

    if (existingEditorIndex !== -1) {
      const existingEditor = this.editors[existingEditorIndex];

      // Destroy existing editor
      if (
        existingEditor.editor &&
        typeof existingEditor.editor.destroy === "function"
      ) {
        existingEditor.editor.destroy();
      }

      // Remove container from DOM
      const existingContainer = document.getElementById(
        existingEditor.containerId
      );
      if (existingContainer) {
        existingContainer.remove();
      }

      // Remove from editors array
      this.editors.splice(existingEditorIndex, 1);
    }

    // Add new editor to the array
    this.editors.push({
      id: sanitizedId,
      containerId: `container-${sanitizedId}`,
      editor: this.newEditor,
      pageId: page.PageId,
      parentId: parentId,
    });

    console.log("Editors are ", this.editors);
    // Scroll to the new editor
    const container = document.getElementById(`container-${sanitizedId}`);
    if (container) {
      container.scrollIntoView({
        left: 300,
        behavior: "smooth",
        block: "nearest",
      });
    }

    if (page.PageIsContentPage) {
      const canvas = this.newEditor.Canvas.getElement();

      if (canvas) {
        canvas.style.setProperty("height", "calc(100% - 100px)", "important");
        console.log("canvas found, ", canvas);
      }
    }
    localStorage.setItem("createdEditor", page.PageId);

    const wrapper = this.newEditor.getWrapper();

    // Enable selectable behavior for the wrapper
    wrapper.set({
      selectable: false,
      droppable: false,
      draggable: false,
      hoverable: false,
    });
    return this.newEditor;
  }

  removeEditor(id) {
    if (!this.editors) {
      console.log("No editors array exists");
      return;
    }

    console.log("Current editors:", this.editors);
    console.log("ID trying to remove:", id);

    // Log the details of each editor for comparison
    this.editors.forEach((editorObj, index) => {
      console.log(`Editor ${index}:`, {
        id: editorObj.id,
        containerId: editorObj.containerId,
        pageId: editorObj.pageId,
      });
    });

    const index = this.editors.findIndex((editorObj) => {
      // Try different matching strategies
      return (
        editorObj.id === id ||
        editorObj.containerId === id ||
        editorObj.pageId === id
      );
    });

    console.log("Found index:", index);

    if (index !== -1) {
      const editorObj = this.editors[index];
      console.log("Reached here at delete function", editorObj);

      // Destroy the editor
      if (editorObj.editor && typeof editorObj.editor.destroy === "function") {
        editorObj.editor.destroy();
      }

      // Remove the container from the DOM
      const containerElement = document.getElementById(editorObj.containerId);
      if (containerElement) {
        containerElement.remove();
      }

      // Remove from the editors array
      this.editors.splice(index, 1);
    } else {
      console.warn(`No editor found matching id: ${id}`);
    }
  }

  pageContent(pageId) {
    return this.dataManager
      .getSinglePage(pageId)
      .then((pageData) => {
        console.log("Page Data received:", pageData);

        if (pageData && pageData.PageGJSJson) {
          try {
            let parsedData = JSON.parse(pageData.PageGJSJson);

            // Ensure data is in the expected structure
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

            return parsedData; // Return parsed and formatted data
          } catch (error) {
            console.error("Error parsing page data:", error);
            throw new Error("Invalid JSON format in PageGJSJson.");
          }
        } else {
          console.warn("Page data or PageGJSJson is missing.");
          throw new Error("Page data or PageGJSJson is unavailable.");
        }
      })
      .catch((error) => {
        console.error("Error fetching page data from dataManager:", error);
        throw new Error("Failed to fetch page data.");
      });
  }

  backButtonAction(pageId) {
    const backButton = document.getElementById("content-back-button");
    if (backButton) {
      backButton.addEventListener("click", (e) => {
        e.preventDefault();
        this.removeEditor(pageId);
      });
    }
  }
}
