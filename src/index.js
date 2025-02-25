class EditorManager {
  // child editor manager
  editors = {};
  pages = [];
  theme = [];
  toolsSection = null;
  currentEditor = null;
  currentPageId = null;

  container = document.getElementById("child-container");

  constructor(dataManager, currentLanguage) {
    this.dataManager = dataManager;
    this.dataManager.getLocationTheme().then((res) => {
      if (this.toolsSection.checkIfNotAuthenticated(res)) {
        return;
      }

      this.theme = res.SDT_LocationTheme;
    });
    this.dataManager.getPages().then((res) => {
      if (this.toolsSection.checkIfNotAuthenticated(res)) {
        return;
      }

      this.pages = res.SDT_PageCollection;
      const homePage = this.pages.find((page) => page.PageName == "Home");
      if (homePage) {
        this.createChildEditor(homePage);
        this.currentPageId = homePage.PageId;
      } else {
        this.toolsSection.displayAlertMessage(
          `${this.currentLanguage.getTranslation("no_home_page_found")}`,
          "danger"
        );
        return;
      }
    });

    this.currentLanguage = currentLanguage;
  }

  /**
   * Retrieves the current GrapesJS editor instance.
   *
   * @returns {Object} The current GrapesJS editor instance.
   */
  getCurrentEditor() {
    return this.currentEditor.editor;
  }

  /**
   * Sets the current editor by its ID and activates the corresponding frame.
   *
   * @param {string} editorId - The ID of the editor to set as the current editor.
   */
  setCurrentEditor(editorId) {
    this.currentEditor = this.editors[editorId];
    this.activateFrame(editorId + "-frame");
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

  createChildEditor(page) {
    const editorDetails = this.setupEditorContainer(page);
    const editor = this.initializeGrapesEditor(editorDetails.editorId);

    this.addEditorEventListners(editor);
    this.toolsSection.unDoReDo(editor);

    this.loadEditorContent(editor, page);
    this.setupEditorLayout(editor, page, editorDetails.containerId);
    this.finalizeEditorSetup(editor, page, editorDetails);
  }

  setupEditorContainer(page) {
    const count = this.container.children.length;
    const editorId = `gjs-${count}`;
    const containerId = `${editorId}-frame`;

    const editorContainer = document.createElement("div");
    editorContainer.innerHTML = this.generateEditorHTML(page, editorId);
    this.configureEditorContainer(editorContainer, containerId, page.PageId);

    return { editorId, containerId };
  }

  generateEditorHTML(page, editorId) {
    const appBar = this.shouldShowAppBar(page)
      ? this.createAppBarHTML(page.PageName)
      : "";

    return `
        <div class="header">
            <span id="current-time-${page.PageId}"></span>
            <span class="icons">
                <i class="fas fa-signal"></i>
                <i class="fas fa-wifi"></i>
                <i class="fas fa-battery"></i>
            </span>
        </div>
        ${appBar}
        <div id="${editorId}"></div>
      `;
  }

  configureEditorContainer(container, containerId, pageId) {
    container.id = containerId;
    container.dataset.pageid = pageId;
    container.classList.add("mobile-frame", "adding");
    this.container.appendChild(container);

    requestAnimationFrame(() => {
      container.classList.remove("adding");
    });
  }

  shouldShowAppBar(page) {
    return (
      page.PageIsContentPage ||
      (page.PageIsPredefined && page.PageName !== "Home")
    );
  }

  createAppBarHTML(pageName) {
    return `
        <div class="app-bar">
            <button id="content-back-button" class="back-button">
                <svg class="back-arrow" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 12H5M5 12L12 19M5 12L12 5"/>
                    <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M19 12H5M5 12L12 19M5 12L12 5"/>
                </svg>
            </button>
            <h1 class="title" style="text-transform: uppercase">${pageName}</h1>
        </div>
      `;
  }

  initializeGrapesEditor(editorId) {
    return grapesjs.init({
      container: `#${editorId}`,
      fromElement: true,
      height: "100%",
      width: "auto",
      canvas: {
        styles: [
          "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css",
          "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css",
          "https://fonts.googleapis.com/css2?family=Lora&family=Merriweather&family=Poppins:wght@400;500&family=Roboto:wght@400;500&display=swap",
          "/Resources/UCGrapes1/src/css/toolbox.css",
          "/Resources/UCGrapes1/src/css/child-editor.css",
        ],
      },
      baseCss: " ",
      dragMode: "normal",
      panels: { defaults: [] },
      sidebarManager: false,
      storageManager: false,
      modal: false,
      commands: false,
      hoverable: false,
      highlightable: false,
      selectable: false,
    });
  }

  async loadEditorContent(editor, page) {
    if (page.PageGJSJson) {
      await this.loadExistingContent(editor, page);
    } else if (page.PageIsContentPage) {
      await this.loadNewContentPage(editor, page);
    }
  }

  async loadExistingContent(editor, page) {
    try {
      const pageData = JSON.parse(page.PageGJSJson);

      if (page.PageIsPredefined && page.PageName === "Location") {
        await this.handleLocationPage(editor, pageData);
      } else if (page.PageIsContentPage) {
        editor.loadProjectData(pageData);
        await this.handleContentPage(editor, page);
      } else {
        editor.loadProjectData(pageData);
      }
    } catch (error) {
      console.error("Error loading existing content:", error);
    }
  }

  async handleLocationPage(editor, pageData) {
    pageData.pages[0].frames[0].component.components[0].components[0].components[0].components[0].components[0].components[0].attributes.src =
      this.dataManager.Location.LocationImage_GXI;
    pageData.pages[0].frames[0].component.components[0].components[0].components[0].components[0].components[0].components[1].components[0].content =
      this.dataManager.Location.LocationDescription;
    editor.DomComponents.clear();
    editor.loadProjectData(pageData);
  }

  async handleContentPage(editor, page) {
    try {
      const res = await this.dataManager.getContentPageData(page.PageId);
      if (this.toolsSection.checkIfNotAuthenticated(res)) return;

      const contentPageData = res.SDT_ProductService;
      if (!contentPageData) {
        console.warn("No content page data received");
        return;
      }

      await this.updateContentPageElements(editor, contentPageData);
    } catch (error) {
      console.error("Error loading content page data:", error);
    }
  }

  async updateContentPageElements(editor, contentPageData) {
    const wrapper = editor.DomComponents.getWrapper();
    if (!wrapper) {
      console.error("Wrapper not found in editor");
      return;
    }

    await this.updateImage(wrapper, contentPageData);
    await this.updateDescription(wrapper, contentPageData);
    this.toolsSection.pageContentCtas(contentPageData.CallToActions, editor);
  }

  async updateImage(wrapper, contentPageData) {
    const img = wrapper.find("#product-service-image");
    if (img.length > 0) {
      if (!contentPageData?.ProductServiceImage) {
        img[0].remove();
      } else {
        try {
          img[0].setAttributes({
            src: contentPageData.ProductServiceImage,
            alt: "Product Service Image",
          });
        } catch (err) {
          console.error("Error updating image:", err);
        }
      }
    }
  }

  async updateDescription(wrapper, contentPageData) {
    const p = wrapper.find("#product-service-description");
    if (p.length > 0) {
      if (!contentPageData?.ProductServiceDescription) {
        p[0].remove();
      } else {
        try {
          p[0].textContent = contentPageData.ProductServiceDescription;
        } catch (err) {
          console.error("Error updating description:", err);
        }
      }
    }
  }

  async loadNewContentPage(editor, page) {
    try {
      const res = await this.dataManager.getContentPageData(page.PageId);
      if (this.toolsSection.checkIfNotAuthenticated(res)) return;

      const contentPageData = res.SDT_ProductService;
      if (contentPageData) {
        const projectData = this.initialContentPageTemplate(contentPageData);
        editor.addComponents(projectData)[0];
        this.toolsSection.pageContentCtas(
          contentPageData.CallToActions,
          editor
        );
      }
    } catch (error) {
      console.error("Error fetching content page data:", error);
    }
  }

  setupEditorLayout(editor, page, containerId) {
    if (this.shouldShowAppBar(page)) {
      const canvas = editor.Canvas.getElement();
      if (canvas) {
        canvas.style.setProperty("height", "calc(100% - 100px)", "important");
      }
      this.backButtonAction(containerId);
    }
  }

  finalizeEditorSetup(editor, page, editorDetails) {
    const editorData = {
      pageId: page.PageId,
      editor,
    };
    this.editors[`#${editorDetails.editorId}`] = editorData;

    if (page.PageName === "Home") {
      this.setCurrentEditor(`#${editorDetails.editorId}`);
    }

    const wrapper = editor.getWrapper();
    wrapper.set({
      selectable: false,
      droppable: false,
      draggable: false,
      hoverable: false,
    });

    const navigator = this.activateNavigators();
    navigator.updateButtonVisibility();
    navigator.scrollBy(200);
    new Clock(`current-time-${page.PageId}`);
  }

  getPage(pageId) {
    return this.dataManager.pages.SDT_PageCollection.find(
      (page) => page.PageId == pageId
    );
  }

  backButtonAction(editorContainerId) {
    const backButton = document.getElementById("content-back-button");
    if (backButton) {
      backButton.addEventListener("click", (e) => {
        e.preventDefault();
        $("#" + editorContainerId).remove();
        this.activateNavigators();
      });
    }
  }

  addEditorEventListners(editor) {
    this.editorOnLoad(editor);
    this.editorOnSelected(editor);

    editor.Keymaps.keymaster.unbind("backspace");
    editor.Keymaps.keymaster.unbind("delete");
    editor.Keymaps.keymaster.bind("ctrl+z");
    editor.Keymaps.keymaster.bind("ctrl+shift+z");
  }

  editorOnLoad(editor) {
    editor.on("load", (model) => {
      this.dataManager.getLocationTheme().then((theme) => {
        this.toolsSection.setTheme(theme.SDT_LocationTheme.ThemeName);
      });

      const wrapper = editor.getWrapper();
      wrapper.view.el.addEventListener("click", (e) => {
        const editorId = editor.getConfig().container;
        const editorContainerId = editorId + "-frame";

        document.querySelector(".cta-button-layout-container").style.display =
          "none";

        this.setCurrentEditor(editorId);
        this.currentPageId = $(editorContainerId).data().pageid;

        this.updateToolsSection();

        this.toolsSection.unDoReDo(editor);

        if (e.target.attributes["tile-action-object-id"]) {
          const page = this.getPage(
            e.target.attributes["tile-action-object-id"].value
          );
          if (page) {
            $(editorContainerId).nextAll().remove();

            this.createChildEditor(page);

            // $("#content-page-section").hide();
            // if (page.PageIsContentPage) {
            //     $("#content-page-section").show();
            // }
          }
        }

        if (e.target.classList.contains("fa-minus")) {
          // remove call to action
        }

        const button = e.target.closest(".action-button");
        if (!button) return;
        const templateWrapper = button.closest(".template-wrapper");
        if (!templateWrapper) return;

        this.templateComponent = editor.Components.getById(templateWrapper.id);
        if (!this.templateComponent) return;

        if (button.classList.contains("delete-button")) {
          this.deleteTemplate(this.templateComponent);
        } else if (button.classList.contains("add-button-bottom")) {
          this.addTemplateBottom(this.templateComponent, editor);
        } else if (button.classList.contains("add-button-right")) {
          this.addTemplateRight(this.templateComponent, editor);
        }
      });

      wrapper.view.el.addEventListener("contextmenu", (e) =>
        this.rightClickEventHandler(editor)
      );
    });
  }

  editorOnSelected(editor) {
    editor.on("component:selected", (component) => {
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
      }

      this.toolsSection.updateTileProperties(
        this.currentEditor.editor,
        this.currentPageId
      );
      const page = this.getPage(this.currentPageId);
      if (page && page.PageIsContentPage) {
        this.toolsSection.activateCtaBtnStyles(this.selectedComponent);
      }

      this.hideContextMenu();

      this.updateUIState();
    });
  }
  updateUIState() {
    document.querySelector("#templates-button").classList.remove("active");
    document.querySelector("#pages-button").classList.remove("active");
    document.querySelector("#pages-button").classList.add("active");
    document.querySelector("#mapping-section").style.display = "none";
    document.querySelector("#tools-section").style.display = "block";
    document.querySelector("#templates-content").style.display = "none";
    document.querySelector("#pages-content").style.display = "block";
  }

  updateToolsSection() {
    const page = this.getPage(this.currentPageId);
    if (page) {
      if (page.PageIsContentPage) {
        document.querySelector("#content-page-section").style.display = "block";
        document.querySelector("#menu-page-section").style.display = "none";
      } else {
        document.querySelector("#content-page-section").style.display = "none";
        document.querySelector("#menu-page-section").style.display = "block";
      }
    }
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
                      data-gjs-hoverable="false">${this.currentLanguage.getTranslation(
                        "tile_title"
                      )}</span>
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

  deleteTemplate(templateComponent) {
    if (
      !templateComponent ||
      templateComponent.getClasses().includes("default-template")
    )
      return;

    const containerRow = templateComponent.parent();
    if (!containerRow) return;

    templateComponent.remove();

    const templates = containerRow.components();
    const newWidth = 100 / templates.length;
    templates.forEach((template) => {
      if (template && template.setStyle) {
        template.addStyle({
          width: `${newWidth}%`,
        });
      }
    });

    this.updateRightButtons(containerRow);
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
    containerRow.append(newTemplate, {
      at: index + 1,
    });
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
    containerColumn.append(newRow, {
      at: index + 1,
    });
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
        rightButtonComponent.addStyle({
          display: "none",
        });
      } else {
        rightButton.removeAttribute("disabled");
        rightButtonComponent.addStyle({
          display: "flex",
        });
      }
    });
  }

  setToolsSection(toolBox) {
    this.toolsSection = toolBox;
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

  hideContextMenu() {
    const contextMenu = document.getElementById("contextMenu");
    if (contextMenu) {
      contextMenu.style.display = "none";
    }
  }

  activateNavigators() {
    const leftNavigator = document.querySelector(".page-navigator-left");
    const rightNavigator = document.querySelector(".page-navigator-right");

    const scrollContainer = document.getElementById("child-container");
    const prevButton = document.getElementById("scroll-left");
    const nextButton = document.getElementById("scroll-right");

    const frames = document.querySelectorAll(".mobile-frame");

    leftNavigator.style.display = "block";
    rightNavigator.style.display = "block";

    let alignment;
    if (window.innerWidth <= 1440) {
      // For screens with max-width 1440px, check the number of frames
      alignment = frames.length > 1 ? "flex-start" : "center";
    } else {
      // For larger screens, use frames.length > 3
      alignment = frames.length > 3 ? "flex-start" : "center";
    }
    scrollContainer.style.setProperty("justify-content", alignment);

    const scrollBy = (offset) => {
      scrollContainer.scrollTo({
        left: scrollContainer.scrollLeft + offset,
        behavior: "smooth",
      });
    };

    prevButton.addEventListener("click", () => scrollBy(-200));
    nextButton.addEventListener("click", () => scrollBy(200));

    const updateButtonVisibility = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;

      prevButton.style.display = scrollLeft > 0 ? "block" : "none";
      nextButton.style.display =
        scrollLeft + clientWidth < scrollWidth ? "block" : "none";
    };

    updateButtonVisibility();
    scrollContainer.addEventListener("scroll", updateButtonVisibility);

    return {
      updateButtonVisibility,
      scrollBy,
    };
  }

  initialContentPageTemplate(contentPageData) {
    return `
              <div
                class="content-frame-container test"
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
                        class="content-page-wrapper"
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
                          data-gjs-type="product-service-image"
                          alt="Full-width Image"
                        />
                        <p
                          style="flex: 1; padding: 0; margin: 0; height: auto;"
                          class="content-page-block"
                          data-gjs-draggable="true"
                          data-gjs-selectable="false"
                          data-gjs-editable="false"
                          data-gjs-droppable="false"
                          data-gjs-highlightable="false"
                          data-gjs-hoverable="false"
                          id="product-service-description"
                          data-gjs-type="product-service-description"
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

  addFreshTemplate(template) {
    this.currentEditor.editor.DomComponents.clear();
    let fullTemplate = "";

    template.forEach((columns, rowIndex) => {
      const templateRow = this.generateTemplateRow(columns, rowIndex);
      fullTemplate += templateRow;
    });

    this.currentEditor.editor.addComponents(`
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

  generateTemplateRow(columns, rowIndex) {
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
      // Only exclude delete button for first tile of first row
      const isFirstTileOfFirstRow = rowIndex === 0 && i === 0;
      const deleteButton = isFirstTileOfFirstRow
        ? ""
        : `
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
                    </button>`;

      wrappers += `
                <div class="template-wrapper"
                          style="flex: 0 0 ${columnWidth}%);"
                          data-gjs-type="template-wrapper"
                          data-gjs-selectable="false"
                          data-gjs-droppable="false">
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
                          ${deleteButton}
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

  rightClickEventHandler(editorInstance) {
    document.querySelectorAll("iframe").forEach((iframe) => {
      if (!iframe) {
        console.error("Iframe not found.");
        return;
      }

      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        console.error("Iframe document not accessible.");
        return;
      }

      const contextMenu = document.getElementById("contextMenu");
      if (!contextMenu) {
        console.error("Context menu element not found.");
        return;
      }

      const hideContextMenu = () => {
        contextMenu.style.display = "none";
        window.currentBlock = null;
      };

      document.addEventListener("click", (e) => {
        if (!contextMenu.contains(e.target)) {
          hideContextMenu();
        }
      });

      iframeDoc.addEventListener("click", () => {
        hideContextMenu();
      });

      iframeDoc.addEventListener("contextmenu", (e) => {
        const block = e.target.closest(".template-block");
        if (block) {
          e.preventDefault();

          const iframeRect = iframe.getBoundingClientRect();

          const x = e.clientX + iframeRect.left;
          const y = e.clientY + iframeRect.top;

          contextMenu.style.position = "fixed";
          contextMenu.style.left = `${x}px`;
          contextMenu.style.top = `${y}px`;
          contextMenu.style.display = "block";

          window.currentBlock = block;
        } else {
          hideContextMenu();
        }
      });

      const deleteImage = document.getElementById("delete-bg-image");
      if (deleteImage) {
        deleteImage.addEventListener("click", () => {
          const blockToDelete = window.currentBlock;
          if (blockToDelete) {
            editorInstance.select(null);
            const component = editorInstance
              .getWrapper()
              .find(`#${blockToDelete.id}`)[0];
            if (component) {
              editorInstance.select(component);
              this.selectedComponent = component;

              const currentStyles = component.getStyle() || {};
              delete currentStyles["background-image"];
              component.setStyle(currentStyles);
            }

            hideContextMenu();
          }
        });
      } else {
        console.error("Delete image button not found.");
      }

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          hideContextMenu();
        }
      });
    });
  }
}

class ToolBoxManager {
  dataManager = null;
  constructor(
    editorManager,
    dataManager,
    themes,
    icons,
    templates,
    mapping,
    media,
    currentLanguage
  ) {
    this.editorManager = editorManager;
    this.dataManager = dataManager;
    this.themes = themes;
    this.icons = icons;
    this.currentTheme = null;
    this.templates = templates;
    this.mappingsItems = mapping;
    this.selectedFile = null;
    this.media = media;
    this.currentLanguage = currentLanguage;

    this.currentLanguage.translateUCStrings(); // translating user control strings
  }

  init() {
    let self = this;
    this.dataManager.getPages().then((res) => {
      if (this.checkIfNotAuthenticated(res)) {
        return;
      }

      localStorage.clear();
    });

    this.loadTheme();
    this.listThemesInSelectField();
    this.colorPalette();
    this.ctaColorPalette();
    this.loadPageTemplates();

    this.actionList = new ActionListComponent(
      this.editorManager,
      this.dataManager,
      this.currentLanguage,
      this
    );

    this.mediaComponent = new MediaComponent(
      this.dataManager,
      this.editorManager,
      this.currentLanguage,
      this
    );

    const tabButtons = document.querySelectorAll(".tb-tab-button");
    const tabContents = document.querySelectorAll(".tb-tab-content");
    tabButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        tabContents.forEach((content) => (content.style.display = "none"));

        button.classList.add("active");
        document.querySelector(`#${button.dataset.tab}-content`).style.display =
          "block";
      });
    });

    // mapping
    const mappingButton = document.getElementById("open-mapping");
    const publishButton = document.getElementById("publish");
    const mappingSection = document.getElementById("mapping-section");
    const toolsSection = document.getElementById("tools-section");

    this.mappingComponent = new MappingComponent(
      this.dataManager,
      this.editorManager,
      this,
      this.currentLanguage
    );

    mappingButton.addEventListener("click", (e) => {
      e.preventDefault();

      toolsSection.style.display =
        toolsSection.style.display === "none" ? "block" : "none";

      mappingSection.style.display =
        mappingSection.style.display === "block" ? "none" : "block";

      this.mappingComponent.init();
    });

    publishButton.onclick = (e) => {
      e.preventDefault();
      const popup = document.createElement("div");
      popup.className = "popup-modal";
      popup.innerHTML = `
                <div class="popup">
                  <div class="popup-header">
                    <span>${this.currentLanguage.getTranslation(
                      "publish_confirm_title"
                    )}</span>
                    <button class="close">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 21 21">
                          <path id="Icon_material-close" data-name="Icon material-close" d="M28.5,9.615,26.385,7.5,18,15.885,9.615,7.5,7.5,9.615,15.885,18,7.5,26.385,9.615,28.5,18,20.115,26.385,28.5,28.5,26.385,20.115,18Z" transform="translate(-7.5 -7.5)" fill="#6a747f" opacity="0.54"/>
                      </svg>
                    </button>
                  </div>
                  <hr>
                  <div class="popup-body" id="confirmation_modal_message">
                  ${this.currentLanguage.getTranslation(
                    "publish_confirm_message"
                  )}
                    <label for="notify_residents" class="notify_residents">
                        <input type="checkbox" id="notify_residents" name="notify_residents">
                        <span>${this.currentLanguage.getTranslation(
                          "nofity_residents_on_publish"
                        )}</span>
                    </label>
                  </div>
                  <div class="popup-footer">
                    <button id="yes_publish" class="tb-btn tb-btn-primary">
                    ${this.currentLanguage.getTranslation(
                      "publish_confirm_button"
                    )}
                    </button>
                    <button id="close_popup" class="tb-btn tb-btn-outline">
                    ${this.currentLanguage.getTranslation(
                      "publish_cancel_button"
                    )}
                    </button>
                  </div>
                </div>
              `;

      document.body.appendChild(popup);
      popup.style.display = "flex";

      const publishButton = popup.querySelector("#yes_publish");
      const closeButton = popup.querySelector("#close_popup");
      const closePopup = popup.querySelector(".close");

      publishButton.addEventListener("click", () => {
        const isNotifyResidents =
          document.getElementById("notify_residents").checked;
        this.publishPages(isNotifyResidents);
        popup.remove();
      });

      closeButton.addEventListener("click", () => {
        popup.remove();
      });

      closePopup.addEventListener("click", () => {
        popup.remove();
      });
    };

    const sidebarInputTitle = document.getElementById("tile-title");
    sidebarInputTitle.addEventListener("input", (e) => {
      this.updateTileTitle(e.target.value);
    });

    const leftAlign = document.getElementById("text-align-left");
    const centerAlign = document.getElementById("text-align-center");
    const rightAlign = document.getElementById("text-align-right");

    leftAlign.addEventListener("click", () => {
      if (this.editorManager.selectedTemplateWrapper) {
        const templateBlock = this.editorManager.selectedComponent.find(
          ".tile-title-section"
        )[0];

        if (templateBlock) {
          templateBlock.setStyle({
            display: "flex",
            "align-self": "start",
          });
          this.setAttributeToSelected("tile-text-align", "left");
        }
      }
    });

    centerAlign.addEventListener("click", () => {
      if (this.editorManager.selectedTemplateWrapper) {
        const templateBlock = this.editorManager.selectedComponent.find(
          ".tile-title-section"
        )[0];

        if (templateBlock) {
          templateBlock.setStyle({
            display: "flex",
            "align-self": "center",
          });
          this.setAttributeToSelected("tile-text-align", "center");
        }
      }
    });

    rightAlign.addEventListener("click", () => {
      if (this.editorManager.selectedTemplateWrapper) {
        const templateBlock = this.editorManager.selectedComponent.find(
          ".tile-title-section"
        )[0];

        if (templateBlock) {
          templateBlock.setStyle({
            display: "flex",
            "align-self": "end",
          });
          this.setAttributeToSelected("tile-text-align", "right");
        }
      }
    });

    const iconLeftAlign = document.getElementById("icon-align-left");
    const iconCenterAlign = document.getElementById("icon-align-center");
    const iconRightAlign = document.getElementById("icon-align-right");

    iconLeftAlign.addEventListener("click", () => {
      if (this.editorManager.selectedTemplateWrapper) {
        const templateBlock =
          this.editorManager.selectedComponent.find(".tile-icon-section")[0];
        if (templateBlock) {
          templateBlock.setStyle({
            display: "flex",
            "align-self": "start",
          });
          this.setAttributeToSelected("tile-icon-align", "left");
        }
      }
    });

    iconCenterAlign.addEventListener("click", () => {
      if (this.editorManager.selectedTemplateWrapper) {
        const templateBlock =
          this.editorManager.selectedComponent.find(".tile-icon-section")[0];

        if (templateBlock) {
          templateBlock.setStyle({
            display: "flex",
            "align-self": "center",
          });
          this.setAttributeToSelected("tile-icon-align", "center");
        }
      }
    });

    iconRightAlign.addEventListener("click", () => {
      if (this.editorManager.selectedTemplateWrapper) {
        const templateBlock =
          this.editorManager.selectedComponent.find(".tile-icon-section")[0];

        if (templateBlock) {
          templateBlock.setStyle({
            display: "flex",
            "align-self": "end",
          });
          this.setAttributeToSelected("tile-icon-align", "right");
        }
      }
    });

    const imageOpacity = document.getElementById("bg-opacity");

    imageOpacity.addEventListener("input", (event) => {
      const value = event.target.value;

      if (this.editorManager.selectedTemplateWrapper) {
        const templateBlock = this.editorManager.selectedComponent;

        if (templateBlock) {
          const opacity = value / 100;
          const currentBgImage = templateBlock
            .getStyle()
            ["background-image"].match(/url\((.*?)\)/)[1];
          templateBlock.addStyle({
            "background-image": `linear-gradient(rgba(255, 255, 255, ${
              1 - value / 100
            }), rgba(255, 255, 255, ${
              1 - value / 100
            })), url(${currentBgImage})`,
          });
        }
      }
    });

    setInterval(() => {
      const editors = Object.values(this.editorManager.editors);

      if (!this.previousStates) {
        this.previousStates = new Map();
      }
      if (editors && editors.length) {
        for (let index = 0; index < editors.length; index++) {
          const editorData = editors[index];
          const editor = editorData.editor;
          const pageId = editorData.pageId;

          if (!this.previousStates.has(pageId)) {
            this.previousStates.set(pageId, editor.getHtml());
          }

          const currentState = editor.getHtml();

          if (currentState !== this.previousStates.get(pageId)) {
            this.autoSavePage(editorData);

            this.previousStates.set(pageId, currentState);
          }
        }
      }
    }, 10000);
  }

  updateTileTitle(inputTitle) {
    if (this.editorManager.selectedTemplateWrapper) {
      const titleComponent =
        this.editorManager.selectedComponent.find(".tile-title")[0];
      if (titleComponent) {
        titleComponent.components(inputTitle);
        this.selectedComponent.addAttributes({
          "tile-title": inputTitle,
        });
      }
    }
  }

  publishPages(isNotifyResidents) {
    const editors = Object.values(this.editorManager.editors);
    if (editors && editors.length) {
      const pageDataList = []; // Array to hold data for all pages

      editors.forEach((editorData) => {
        const pageId = editorData.pageId;
        const editor = editorData.editor;
        const page = this.dataManager.pages.SDT_PageCollection.find(
          (page) => page.PageId == pageId
        );

        if (!pageId) return;

        const projectData = editor.getProjectData();
        const htmlData = editor.getHtml();
        const pageName = page.PageName;
        let jsonData;

        if (page.PageIsContentPage) {
          jsonData = mapContentToPageData(projectData, page);
        } else {
          jsonData = mapTemplateToPageData(projectData, page);
        }

        const data = {
          PageId: pageId,
          PageName: pageName,
          PageJsonContent: JSON.stringify(jsonData),
          PageGJSHtml: htmlData,
          PageGJSJson: JSON.stringify(projectData),
          SDT_Page: jsonData,
          PageIsPublished: true,
        };

        pageDataList.push(data);
      });

      if (pageDataList.length) {
        const payload = {
          IsNotifyResidents: isNotifyResidents, // Universal field
          PagesList: pageDataList, // Array of page data
        };

        // Send all pages with the universal field at once
        this.dataManager
          .updatePagesBatch(payload)
          .then((res) => {
            if (this.checkIfNotAuthenticated(res)) {
              return;
            }
            this.displayAlertMessage("All Pages Saved Successfully", "success");
          })
          .catch((error) => {
            console.error("Error saving pages:", error);
            this.displayAlertMessage(
              "An error occurred while saving pages.",
              "error"
            );
          });
      }
    }
  }

  autoSavePage(editorData) {
    let pageId = editorData.pageId;
    let editor = editorData.editor;
    let page = this.dataManager.pages.SDT_PageCollection.find(
      (page) => page.PageId == pageId
    );
    let projectData = editor.getProjectData();
    let htmlData = editor.getHtml();
    let pageName = page.PageName;

    if (pageId) {
      let data = {
        PageId: pageId,
        PageName: pageName,
        PageGJSHtml: htmlData,
        PageGJSJson: JSON.stringify(projectData),
      };

      this.dataManager.updatePage(data).then((res) => {
        if (this.checkIfNotAuthenticated(res)) {
          return;
        }

        this.dataManager.getPages().then((pages) => {
          this.editorManager.pages = pages.SDT_PageCollection;
        });

        this.openToastMessage();
      });
    }
  }

  openToastMessage() {
    const toast = document.createElement("div");
    toast.id = "toast";
    toast.textContent = "Your changes are saved";

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateX(-50%) translateY(0)";
    }, 100);

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 500);
    }, 3000);
  }

  unDoReDo(editorInstance) {
    const um = editorInstance.UndoManager;
    //undo
    const undoButton = document.getElementById("undo");
    undoButton.addEventListener("click", (e) => {
      e.preventDefault();
      if (um.hasUndo()) {
        um.undo();
      }
    });

    // redo
    const redoButton = document.getElementById("redo");
    redoButton.addEventListener("click", (e) => {
      e.preventDefault();
      if (um.hasRedo()) {
        um.redo();
      }
    });
  }

  // listThemesInSelectField() {
  //   const themeSelect = document.getElementById("theme-select");

  //   themeSelect.innerHTML = "";

  //   this.themes.forEach((theme) => {
  //     const option = document.createElement("option");
  //     option.value = theme.name;
  //     option.textContent = theme.name;
  //     option.id = theme.id;

  //     // Check if the current theme matches this theme
  //     if (this.currentTheme && theme.name === this.currentTheme.name) {
  //       option.selected = true;
  //     }

  //     themeSelect.appendChild(option);
  //   });

  //   themeSelect.addEventListener("change", (e) => {
  // const themeName = e.target.value;
  // // update location theme
  // this.dataManager.selectedTheme = this.themes.find(
  //   (theme) => theme.name === themeName
  // );

  // this.dataManager.updateLocationTheme().then((res) => {
  //   if (this.checkIfNotAuthenticated(res)) {
  //     return;
  //   }

  //   if (this.setTheme(themeName)) {
  //     this.themeColorPalette(this.currentTheme.colors);

  //     localStorage.setItem("selectedTheme", themeName);

  //     const message = this.currentLanguage.getTranslation(
  //       "theme_applied_success_message"
  //     );
  //     const status = "success";
  //     this.displayAlertMessage(message, status);
  //   } else {
  //     const message = this.currentLanguage.getTranslation(
  //       "error_applying_theme_message"
  //     );
  //     const status = "error";
  //     this.displayAlertMessage(message, status);
  //   }
  // });
  //   });
  // }

  listThemesInSelectField() {
    const select = document.querySelector(".tb-custom-theme-selection");
    const button = select.querySelector(".theme-select-button");
    const selectedValue = button.querySelector(".selected-theme-value");

    // Toggle dropdown visibility
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const isOpen = optionsList.classList.contains("show");
      optionsList.classList.toggle("show");
      button.classList.toggle("open");
      button.setAttribute("aria-expanded", !isOpen);
    });

    const optionsList = document.createElement("div");
    optionsList.classList.add("theme-options-list");
    optionsList.setAttribute("role", "listbox");
    optionsList.innerHTML = "";

    // Populate themes into the dropdown
    this.themes.forEach((theme, index) => {
      const option = document.createElement("div");
      option.classList.add("theme-option");
      option.setAttribute("role", "option");
      option.setAttribute("data-value", theme.name);
      option.textContent = theme.name;

      if (this.currentTheme && theme.name === this.currentTheme.name) {
        option.classList.add("selected");
      }

      option.addEventListener("click", (e) => {
        selectedValue.textContent = theme.name;

        // Mark as selected
        const allOptions = optionsList.querySelectorAll(".theme-option");
        allOptions.forEach((opt) => opt.classList.remove("selected"));
        option.classList.add("selected");

        // Close the dropdown
        optionsList.classList.remove("show");
        button.classList.remove("open");
        button.setAttribute("aria-expanded", "false");

        const themeName = theme.name;
        // update location theme
        this.dataManager.selectedTheme = this.themes.find(
          (theme) => theme.name === themeName
        );

        this.dataManager.updateLocationTheme().then((res) => {
          if (this.checkIfNotAuthenticated(res)) {
            return;
          }

          if (this.setTheme(themeName)) {
            this.themeColorPalette(this.currentTheme.colors);

            localStorage.setItem("selectedTheme", themeName);

            const message = this.currentLanguage.getTranslation(
              "theme_applied_success_message"
            );
            const status = "success";
            this.displayAlertMessage(message, status);
          } else {
            const message = this.currentLanguage.getTranslation(
              "error_applying_theme_message"
            );
            const status = "error";
            this.displayAlertMessage(message, status);
          }
        });
      });

      // Append option to the options list
      optionsList.appendChild(option);
    });

    select.appendChild(optionsList);

    document.addEventListener("click", (e) => {
      if (!select.contains(e.target)) {
        optionsList.classList.remove("show");
        button.classList.remove("open");
        button.setAttribute("aria-expanded", "false");
      }
    });
  }

  loadTheme() {
    const savedTheme = localStorage.getItem("selectedTheme");
    if (savedTheme) {
      this.setTheme(savedTheme);
    }
    this.applyThemeIconsAndColor(savedTheme);
  }

  setTheme(themeName) {
    const theme = this.themes.find((theme) => theme.name === themeName);
    const select = document.querySelector(".tb-custom-theme-selection");
    select.querySelector(".selected-theme-value").textContent = themeName;
    if (!theme) {
      return false;
    }

    this.currentTheme = theme;

    this.applyTheme();

    this.icons = theme.icons.map((icon) => {
      return {
        name: icon.IconName,
        svg: icon.IconSVG,
        category: icon.IconCategory,
      };
    });
    this.loadThemeIcons(theme.icons);

    this.themeColorPalette(this.currentTheme.colors);
    localStorage.setItem("selectedTheme", themeName);

    this.applyThemeIconsAndColor(themeName);

    return true;
  }

  applyTheme() {
    const root = document.documentElement;
    const iframes = document.querySelectorAll(".mobile-frame iframe");

    if (!iframes.length) return;

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
    );
    root.style.setProperty(
      "--card-bg-color",
      this.currentTheme.colors.cardBgColor
    );
    root.style.setProperty(
      "--card-text-color",
      this.currentTheme.colors.cardTextColor
    );
    root.style.setProperty(
      "--accent-color",
      this.currentTheme.colors.accentColor
    );
    root.style.setProperty("--font-family", this.currentTheme.fontFamily);

    iframes.forEach((iframe) => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

      if (iframeDoc && iframeDoc.body) {
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
        );
        iframeDoc.body.style.setProperty(
          "--card-bg-color",
          this.currentTheme.colors.cardBgColor
        );
        iframeDoc.body.style.setProperty(
          "--card-text-color",
          this.currentTheme.colors.cardTextColor
        );
        iframeDoc.body.style.setProperty(
          "--accent-color",
          this.currentTheme.colors.accentColor
        );
        iframeDoc.body.style.setProperty(
          "--font-family",
          this.currentTheme.fontFamily
        );
      }
    });
  }

  applyThemeIconsAndColor(themeName) {
    const editors = Object.values(this.editorManager.editors);

    if (editors && editors.length) {
      for (let index = 0; index < editors.length; index++) {
        const editorData = editors[index];
        if (!editorData || !editorData.editor) {
          console.error(`Invalid editorData at index ${index}:`, editorData);
          return;
        }

        try {
          let editor = editorData.editor;
          // Add additional null checks
          if (!editor || typeof editor.getWrapper !== "function") {
            console.error(`Invalid editor at index ${index}:`, editor);
            continue;
          }

          const wrapper = editor.getWrapper();

          const theme = this.themes.find((theme) => theme.name === themeName);
          const tiles = wrapper.find(".template-block");

          tiles.forEach((tile) => {
            if (!tile) return;
            // icons change and its color
            const tileIconName = tile.getAttributes()?.["tile-icon"];
            if (tileIconName) {
              const matchingIcon = theme.icons?.find(
                (icon) => icon.IconName === tileIconName
              );

              if (matchingIcon) {
                const tileIconComponent = tile.find(".tile-icon svg")?.[0];

                if (tileIconComponent) {
                  // get current icon color with null checks
                  const currentIconPath = tileIconComponent.find("path")?.[0];
                  let currentIconColor = "#7c8791"; // default color
                  if (currentIconPath && currentIconPath.getAttributes()) {
                    currentIconColor =
                      currentIconPath.getAttributes()["fill"] ||
                      currentIconColor;
                  }

                  let localizedSVG = matchingIcon.IconSVG;
                  if (localizedSVG) {
                    localizedSVG = localizedSVG.replace(
                      /fill="[^"]*"/g,
                      `fill="${currentIconColor}"`
                    );
                    tileIconComponent.replaceWith(localizedSVG);
                  }
                }
              }
            }

            const currentTileBgColorName =
              tile.getAttributes()?.["tile-bgcolor-name"];
            if (currentTileBgColorName && theme.colors) {
              const matchingColorCode = theme.colors[currentTileBgColorName];

              if (matchingColorCode) {
                tile.addAttributes({
                  "tile-bgcolor-name": currentTileBgColorName,
                  "tile-bgcolor": matchingColorCode,
                });

                tile.addStyle({
                  "background-color": matchingColorCode,
                });
              } else {
                console.warn(
                  `No matching color found for: ${currentTileBgColorName}`
                );
              }
            }
          });
        } catch (error) {
          console.error(`Error processing editor at index ${index}:`, error);
        }
      }
    }

    const iframes = document.querySelectorAll(".mobile-frame iframe");

    if (iframes === null) return;

    iframes.forEach((iframe) => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      if (iframeDoc && iframeDoc.body) {
        iframeDoc.body.style.setProperty(
          "--font-family",
          this.currentTheme.fontFamily
        );
      }
    });
  }

  themeColorPalette(colors) {
    const colorPaletteContainer = document.getElementById(
      "theme-color-palette"
    );
    colorPaletteContainer.innerHTML = "";

    const colorEntries = Object.entries(colors);

    colorEntries.forEach(([colorName, colorValue], index) => {
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
      colorBox.setAttribute("data-tile-bgcolor", colorValue);

      alignItem.appendChild(radioInput);
      alignItem.appendChild(colorBox);

      colorPaletteContainer.appendChild(alignItem);

      colorBox.onclick = () => {
        this.editorManager.selectedComponent.addStyle({
          "background-color": colorValue,
        });
        this.setAttributeToSelected("tile-bgcolor", colorValue);
        this.setAttributeToSelected("tile-bgcolor-name", colorName);
      };
    });
  }

  colorPalette() {
    const textColorPaletteContainer =
      document.getElementById("text-color-palette");
    const iconColorPaletteContainer =
      document.getElementById("icon-color-palette");

    // Fixed color values
    const colorValues = {
      color1: "#ffffff",
      color2: "#333333",
    };

    Object.entries(colorValues).forEach(([colorName, colorValue]) => {
      const alignItem = document.createElement("div");
      alignItem.className = "color-item";

      const radioInput = document.createElement("input");
      radioInput.type = "radio";
      radioInput.id = `text-color-${colorName}`;
      radioInput.name = "text-color";
      radioInput.value = colorName;

      const colorBox = document.createElement("label");
      colorBox.className = "color-box";
      colorBox.setAttribute("for", `text-color-${colorName}`);
      colorBox.style.backgroundColor = colorValue;
      colorBox.setAttribute("data-tile-color", colorValue);

      alignItem.appendChild(radioInput);
      alignItem.appendChild(colorBox);
      textColorPaletteContainer.appendChild(alignItem);

      radioInput.onclick = () => {
        this.editorManager.selectedComponent.addStyle({
          color: colorValue,
        });
        this.setAttributeToSelected("tile-text-color", colorValue);
      };
    });

    // Create options for icon color palette
    Object.entries(colorValues).forEach(([colorName, colorValue]) => {
      const alignItem = document.createElement("div");
      alignItem.className = "color-item";

      const radioInput = document.createElement("input");
      radioInput.type = "radio";
      radioInput.id = `icon-color-${colorName}`;
      radioInput.name = "icon-color";
      radioInput.value = colorName;

      const colorBox = document.createElement("label");
      colorBox.className = "color-box";
      colorBox.setAttribute("for", `icon-color-${colorName}`);
      colorBox.style.backgroundColor = colorValue;
      colorBox.setAttribute("data-tile-icon-color", colorValue);

      alignItem.appendChild(radioInput);
      alignItem.appendChild(colorBox);
      iconColorPaletteContainer.appendChild(alignItem);

      radioInput.onclick = () => {
        const svgIcon =
          this.editorManager.selectedComponent.find(".tile-icon path")[0];
        if (svgIcon) {
          svgIcon.removeAttributes("fill");
          svgIcon.addAttributes({
            fill: colorValue,
          });
          this.setAttributeToSelected("tile-icon-color", colorValue);
        } else {
          const message = this.currentLanguage.getTranslation(
            "no_icon_selected_error_message"
          );
          this.displayAlertMessage(message, "error");
        }
      };
    });
  }

  ctaColorPalette() {
    const ctaColorPaletteContainer =
      document.getElementById("cta-color-palette");
    const colorValues = {
      color1: "#4C9155",
      color2: "#5068A8",
      color3: "#EEA622",
      color4: "#FF6C37",
    };

    Object.entries(colorValues).forEach(([colorName, colorValue]) => {
      const colorItem = document.createElement("div");
      colorItem.className = "color-item";
      const radioInput = document.createElement("input");
      radioInput.type = "radio";
      radioInput.id = `cta-color-${colorName}`;
      radioInput.name = "cta-color";
      radioInput.value = colorName;

      const colorBox = document.createElement("label");
      colorBox.className = "color-box";
      colorBox.setAttribute("for", `cta-color-${colorName}`);
      colorBox.style.backgroundColor = colorValue;
      colorBox.setAttribute("data-cta-color", colorValue);

      colorItem.appendChild(radioInput);
      colorItem.appendChild(colorBox);
      ctaColorPaletteContainer.appendChild(colorItem);

      radioInput.onclick = () => {
        if (this.editorManager.selectedComponent) {
          const selectedComponent = this.editorManager.selectedComponent;

          // Search for components with either class
          const componentsWithClass = [
            ...selectedComponent.find(".cta-main-button"),
            ...selectedComponent.find(".cta-button"),
            ...selectedComponent.find(".img-button"),
            ...selectedComponent.find(".plain-button"),
          ];

          // Get the first matching component
          const button =
            componentsWithClass.length > 0 ? componentsWithClass[0] : null;

          if (button) {
            button.addStyle({
              "background-color": colorValue,
              "border-color": colorValue,
            });
          }
          this.setAttributeToSelected("cta-background-color", colorValue);
        }
      };
    });
  }

  pageContentCtas(callToActions, editorInstance) {
    const contentPageCtas = document.getElementById("call-to-actions");

    const renderCtas = () => {
      contentPageCtas.innerHTML = "";

      callToActions.forEach((cta) => {
        const ctaItem = document.createElement("div");
        ctaItem.classList.add("call-to-action-item");
        ctaItem.title = cta.CallToActionName;

        const ctaTypeMap = {
          Phone: {
            icon: "fas fa-phone-alt",
            iconList: ".fas.fa-phone-alt",
          },
          Email: {
            icon: "fas fa-envelope",
            iconList: ".fas.fa-envelope",
          },
          SiteUrl: {
            icon: "fas fa-link",
            iconList: ".fas.fa-link",
          },
          Form: {
            icon: "fas fa-file",
            iconList: ".fas.fa-file",
          },
        };

        const ctaType = ctaTypeMap[cta.CallToActionType] || {
          icon: "fas fa-question",
          iconList: ".fas.fa-question",
        };

        ctaItem.innerHTML = `<i class="${ctaType.icon}"></i>`;

        const ctaComponent = `
                    <div class="cta-container-child cta-child" 
                      id="id-${cta.CallToActionId}"
                      data-gjs-type="cta-buttons"
                      cta-button-id="${cta.CallToActionId}"
                      data-gjs-draggable="false"
                      data-gjs-editable="false"
                      data-gjs-highlightable="false"
                      data-gjs-droppable="false"
                      data-gjs-resizable="false"
                      data-gjs-hoverable="false"
                      cta-button-label="${cta.CallToActionName}"
                      cta-button-type="${cta.CallToActionType}"
                      cta-button-action="${
                        cta.CallToActionPhone ||
                        cta.CallToActionEmail ||
                        cta.CallToActionUrl
                      }"
                      cta-background-color="#5068a8"
                    >
                      <div class="cta-button" ${defaultConstraints} style="background-color: #5068a8;">
                        <i class="${ctaType.icon}" ${defaultConstraints}></i>
                        <div class="cta-badge" ${defaultConstraints}><i class="fa fa-minus" ${defaultConstraints}></i></div>
                      </div>
                      <div class="cta-label" ${defaultConstraints}>${
          cta.CallToActionName
        }</div>
                    </div>
                  `;

        ctaItem.onclick = (e) => {
          e.preventDefault();
          const ctaButton = editorInstance
            .getWrapper()
            .find(".cta-button-container")[0];

          if (!ctaButton) {
            console.error("CTA Button container not found.");
            return;
          }

          const selectedComponent = this.editorManager.selectedComponent;
          if (!selectedComponent) {
            console.error("No selected component found.");
            return;
          }

          const attributes = selectedComponent.getAttributes();

          const existingSelectedComponent =
            attributes["cta-button-id"] === cta.CallToActionId;

          const existingButton = ctaButton.find(
            `#id-${cta.CallToActionId}`
          )?.[0];

          if (existingButton) {
            const existingBackgroundColor =
              existingButton.getAttributes()["cta-background-color"];
            console.log("Existing background color: ", existingBackgroundColor);

            let updatedCtaComponent = ctaComponent.replace(
              /style="background-color: #5068a8;"/,
              `style="background-color: ${existingBackgroundColor};"`
            );

            updatedCtaComponent = updatedCtaComponent.replace(
              /cta-background-color="#5068a8"/,
              `cta-background-color="${existingBackgroundColor}"`
            );

            if (existingSelectedComponent) {
              // Listen for the component:add event
              editorInstance.once("component:add", (component) => {
                console.log("Editor being called");
                // Get the newly added component by searching in the wrapper
                const addedComponent = editorInstance
                  .getWrapper()
                  .find(`#id-${cta.CallToActionId}`)[0];
                if (addedComponent) {
                  console.log("Added component:", addedComponent);
                  editorInstance.select(addedComponent);
                }
              });
              selectedComponent.replaceWith(updatedCtaComponent);
            } else {
            }
            return;
          }
          ctaButton.append(ctaComponent);
        };

        contentPageCtas.appendChild(ctaItem);

        // change button layout to plain
        const plainButton = document.getElementById("plain-button-layout");

        plainButton.onclick = (e) => {
          e.preventDefault();
          const ctaContainer = editorInstance
            .getWrapper()
            .find(".cta-button-container")[0];

          if (ctaContainer) {
            const selectedComponent = this.editorManager.selectedComponent;

            if (selectedComponent) {
              // Check if the selected component is a CTA
              const attributes = selectedComponent.getAttributes();
              const isCta =
                attributes.hasOwnProperty("cta-button-label") &&
                attributes.hasOwnProperty("cta-button-type") &&
                attributes.hasOwnProperty("cta-button-action");

              if (isCta) {
                // Extract existing attributes
                const ctaId = attributes["cta-button-id"];
                const ctaName = attributes["cta-button-label"];
                const ctaType = attributes["cta-button-type"];
                const ctaAction = attributes["cta-button-action"];
                const ctaButtonBgColor = attributes["cta-background-color"];

                const plainButtonComponent = `
                                    <div class="plain-button-container" 
                                        data-gjs-draggable="false"
                                        data-gjs-editable="false"
                                        data-gjs-highlightable="false"
                                        data-gjs-droppable="false"
                                        data-gjs-resizable="false"
                                        data-gjs-hoverable="false"
                                        data-gjs-type="cta-buttons"
                                        id="id-${ctaId}"
                                        cta-button-id="${ctaId}"
                                        cta-button-label="${ctaName}"
                                        cta-button-type="${ctaType}"
                                        cta-button-action="${ctaAction}"
                                        cta-background-color="${ctaButtonBgColor}"
                                        cta-full-width="true"
                                      >
                                        <button style="background-color: ${ctaButtonBgColor}; border-color: ${ctaButtonBgColor};" class="plain-button" ${defaultConstraints}>
                                          <div class="cta-badge" ${defaultConstraints}><i class="fa fa-minus" ${defaultConstraints}></i></div>
                                          ${ctaName}
                                        </button>
                                    </div>
                                  `;

                // Listen for the component:add event
                editorInstance.once("component:add", (component) => {
                  console.log("Editor being called");
                  // Get the newly added component by searching in the wrapper
                  const addedComponent = editorInstance
                    .getWrapper()
                    .find(`#id-${ctaId}`)[0];
                  if (addedComponent) {
                    console.log("Added component:", addedComponent);
                    editorInstance.select(addedComponent);
                  }
                });
                // Remove the current component and replace it
                this.editorManager.selectedComponent.replaceWith(
                  plainButtonComponent
                );
              } else {
                const message = this.currentLanguage.getTranslation(
                  "please_select_cta_button"
                );
                this.displayAlertMessage(message, "error");
                return;
              }
            }
          }
        };

        // change button layout to plain
        const imgButton = document.getElementById("img-button-layout");

        imgButton.onclick = (e) => {
          e.preventDefault();
          const ctaContainer = editorInstance
            .getWrapper()
            .find(".cta-button-container")[0];

          if (ctaContainer) {
            const selectedComponent = this.editorManager.selectedComponent;

            if (selectedComponent) {
              // Check if the selected component is a CTA
              const attributes = selectedComponent.getAttributes();
              const isCta =
                attributes.hasOwnProperty("cta-button-label") &&
                attributes.hasOwnProperty("cta-button-type") &&
                attributes.hasOwnProperty("cta-button-action");

              if (isCta) {
                // Extract existing attributes
                const ctaId = attributes["cta-button-id"];
                const ctaName = attributes["cta-button-label"];
                const ctaType = attributes["cta-button-type"];
                const ctaAction = attributes["cta-button-action"];
                const ctaButtonBgColor = attributes["cta-background-color"];

                let icon;
                switch (ctaType) {
                  case "Phone":
                    icon = "fas fa-phone-alt";
                    break;

                  case "Email":
                    icon = "fas fa-envelope";
                    break;

                  case "SiteUrl":
                    icon = "fas fa-link";
                    break;

                  case "Form":
                    icon = "fas fa-file";
                    break;
                }

                const imgButtonComponent = `
                                    <div class="img-button-container" 
                                        data-gjs-draggable="false"
                                        data-gjs-editable="false"
                                        data-gjs-highlightable="false"
                                        data-gjs-droppable="false"
                                        data-gjs-resizable="false"
                                        data-gjs-hoverable="false"
                                        data-gjs-type="cta-buttons"
                                        id="id-${ctaId}"
                                        cta-button-id="${ctaId}"
                                        cta-button-label="${ctaName}"
                                        cta-button-type="${ctaType}"
                                        cta-button-action="${ctaAction}"
                                        cta-background-color="${ctaButtonBgColor}"
                                        cta-full-width="true"
                                      >
                                        <div style="background-color: ${ctaButtonBgColor}; border-color: ${ctaButtonBgColor};" class="img-button" ${defaultConstraints}>
                                          <i class="${icon} img-button-icon" ${defaultConstraints}></i>
                                          <div class="cta-badge" ${defaultConstraints}><i class="fa fa-minus" ${defaultConstraints}></i></div>
                                          <span class="img-button-label" ${defaultConstraints}>${ctaName}</span>
                                          <i class="fa fa-angle-right img-button-arrow" ${defaultConstraints}></i>
                                        </div>
                                    </div>
                                  `;

                editorInstance.once("component:add", (component) => {
                  console.log("Editor being called");
                  // Get the newly added component by searching in the wrapper
                  const addedComponent = editorInstance
                    .getWrapper()
                    .find(`#id-${ctaId}`)[0];
                  if (addedComponent) {
                    console.log("Added component:", addedComponent);
                    editorInstance.select(addedComponent);
                  }
                });
                // Remove the current component and replace it
                this.editorManager.selectedComponent.replaceWith(
                  imgButtonComponent
                );
              } else {
                const message = this.currentLanguage.getTranslation(
                  "please_select_cta_button"
                );
                this.displayAlertMessage(message, "error");
                return;
              }
            }
          }
        };
      });
    };

    renderCtas();

    // handling badge clicks
    const wrapper = editorInstance.getWrapper();
    wrapper.view.el.addEventListener("click", (e) => {
      const badge = e.target.closest(".cta-badge");
      if (!badge) return;

      e.stopPropagation();

      const ctaChild = badge.closest(
        ".cta-container-child, .plain-button-container, .img-button-container"
      );
      if (ctaChild)
        if (ctaChild) {
          // Check if this is the last child in the container
          const parentContainer = ctaChild.closest(".cta-button-container");
          const childId = ctaChild.getAttribute("id");
          const component = editorInstance.getWrapper().find(`#${childId}`)[0];

          if (component) {
            component.remove();
          }
        }
    });
  }

  activateCtaBtnStyles(selectedCtaComponent) {
    if (selectedCtaComponent) {
      document.querySelector(".cta-button-layout-container").style.display =
        "flex";
    }
  }

  setupColorRadios(radioGroup, colorValues, type) {
    Object.keys(colorValues).forEach((colorKey, index) => {
      const radio = radioGroup[index];
      const colorValue = colorValues[colorKey];

      const colorBox = radio.nextElementSibling;
      colorBox.style.backgroundColor = colorValue;
      colorBox.setAttribute("data-tile-bgcolor", colorValue);

      radio.onclick = () => {
        // Uncheck other radio buttons in the group
        radioGroup.forEach((r) => (r.checked = false));
        radio.checked = true;

        // Apply the color based on type
        if (type === "text") {
          this.editorManager.selectedComponent.addStyle({
            color: colorValue,
          });
          this.setAttributeToSelected("tile-text-color", colorValue);
        } else if (type === "icon") {
          const svgIcon =
            this.editorManager.selectedComponent.find(".tile-icon path")[0];
          if (svgIcon) {
            svgIcon.removeAttributes("fill");
            svgIcon.addAttributes({
              fill: colorValue,
            });
            this.setAttributeToSelected("tile-icon-color", colorValue);
          } else {
            const message = this.currentLanguage.getTranslation(
              "no_icon_selected_error_message"
            );
            this.displayAlertMessage(message, "error");
          }
        }
      };
    });
  }

  loadThemeIcons(themeIconsList) {
    const themeIcons = document.getElementById("icons-list");

    let selectedCategory;

    const categoryOptions = document.querySelectorAll(".category-option");
    // selected category is where the category option has a .selected class

    categoryOptions.forEach((option) => {
      if (option.classList.contains("selected")) {
        selectedCategory = option.getAttribute("data-value");
      }
      option.addEventListener("click", () => {
        selectedCategory = option.getAttribute("data-value");
        renderIcons();
      });
    });

    const renderIcons = () => {
      themeIcons.innerHTML = "";
      const filteredIcons = themeIconsList.filter(
        (icon) => icon.IconCategory.trim() === selectedCategory
      );

      if (filteredIcons.length === 0) {
        console.log("No icons found for selected category.");
      }
      // Render filtered icons
      filteredIcons.forEach((icon) => {
        const iconItem = document.createElement("div");
        iconItem.classList.add("icon");
        iconItem.title = icon.IconName;

        const displayName = (() => {
          const maxChars = 7;
          const words = icon.IconName.split(" ");

          if (words.length > 1) {
            const firstWord = words[0];
            if (firstWord.length >= maxChars) {
              return firstWord.slice(0, maxChars) + "...";
            } else {
              return firstWord;
            }
          }

          return icon.IconName.length > maxChars
            ? icon.IconName.slice(0, maxChars) + "..."
            : icon.IconName;
        })();

        iconItem.innerHTML = `
                      ${icon.IconSVG}
                      <span class="icon-title">${displayName}</span>
                  `;

        iconItem.onclick = () => {
          if (this.editorManager.selectedTemplateWrapper) {
            const iconComponent =
              this.editorManager.selectedComponent.find(".tile-icon")[0];

            if (iconComponent) {
              iconComponent.components(icon.IconSVG);
              this.setAttributeToSelected("tile-icon", icon.IconName);
            }
          } else {
            const message = this.currentLanguage.getTranslation(
              "no_tile_selected_error_message"
            );
            const status = "error";
            this.displayAlertMessage(message, status);
          }
        };

        themeIcons.appendChild(iconItem);
      });
    };

    renderIcons();
  }

  loadPageTemplates() {
    const pageTemplates = document.getElementById("page-templates");
    this.templates.forEach((template, index) => {
      const blockElement = document.createElement("div");

      blockElement.className = "page-template-wrapper";
      // Create the number element
      const numberElement = document.createElement("div");
      numberElement.className = "page-template-block-number";
      numberElement.textContent = index + 1; // Set the number
      const templateBlock = document.createElement("div");
      templateBlock.className = "page-template-block";
      templateBlock.title = this.currentLanguage.getTranslation(
        "click_to_load_template"
      ); //
      templateBlock.innerHTML = `<div>${template.media}</div>`;

      blockElement.addEventListener("click", () => {
        const popup = this.popupModal();
        document.body.appendChild(popup);
        popup.style.display = "flex";

        const closeButton = popup.querySelector(".close");
        closeButton.onclick = () => {
          popup.style.display = "none";
          document.body.removeChild(popup);
        };

        const cancelBtn = popup.querySelector("#close_popup");
        cancelBtn.onclick = () => {
          popup.style.display = "none";
          document.body.removeChild(popup);
        };

        const acceptBtn = popup.querySelector("#accept_popup");
        acceptBtn.onclick = () => {
          popup.style.display = "none";
          document.body.removeChild(popup);
          this.editorManager.templateManager.addFreshTemplate(template.content);
        };
      });

      // Append number and template block to the wrapper
      blockElement.appendChild(numberElement);
      blockElement.appendChild(templateBlock);
      pageTemplates.appendChild(blockElement);
    });
  }

  popupModal() {
    const popup = document.createElement("div");
    popup.className = "popup-modal";
    popup.innerHTML = `
            <div class="popup">
              <div class="popup-header">
                <span>${this.currentLanguage.getTranslation(
                  "confirmation_modal_title"
                )}</span>
                <button class="close">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 21 21">
                      <path id="Icon_material-close" data-name="Icon material-close" d="M28.5,9.615,26.385,7.5,18,15.885,9.615,7.5,7.5,9.615,15.885,18,7.5,26.385,9.615,28.5,18,20.115,26.385,28.5,28.5,26.385,20.115,18Z" transform="translate(-7.5 -7.5)" fill="#6a747f" opacity="0.54"/>
                  </svg>
                </button>
              </div>
              <hr>
              <div class="popup-body" id="confirmation_modal_message">
                ${this.currentLanguage.getTranslation(
                  "confirmation_modal_message"
                )}
              </div>
              <div class="popup-footer">
                <button id="accept_popup" class="tb-btn tb-btn-primary">
                ${this.currentLanguage.getTranslation("accept_popup")}
                </button>
                <button id="close_popup" class="tb-btn tb-btn-outline">
                ${this.currentLanguage.getTranslation("cancel_btn")}
                </button>
              </div>
            </div>
          `;

    return popup;
  }

  displayAlertMessage(message, status) {
    const alertContainer = document.getElementById("alerts-container");

    const alertId = Math.random().toString(10);

    const alertBox = this.alertMessage(message, status, alertId);
    alertBox.style.display = "flex";

    const closeButton = alertBox.querySelector(".alert-close-btn");
    closeButton.addEventListener("click", () => {
      this.closeAlert(alertId);
    });

    setTimeout(() => this.closeAlert(alertId), 5000);
    alertContainer.appendChild(alertBox);
  }
  alertMessage(message, status, alertId) {
    const alertBox = document.createElement("div");
    alertBox.id = alertId;
    alertBox.classList = `alert ${status == "success" ? "success" : "error"}`;
    alertBox.innerHTML = `
            <div class="alert-header">
              <strong>
                ${
                  status == "success"
                    ? this.currentLanguage.getTranslation("alert_type_success")
                    : this.currentLanguage.getTranslation("alert_type_error")
                }
              </strong>
              <span class="alert-close-btn">✖</span>
            </div>
            <p>${message}</p>
          `;

    return alertBox;
  }

  closeAlert(alertId) {
    const alert = document.getElementById(alertId);
    if (alert) {
      alert.style.opacity = 0;
      setTimeout(() => alert.remove(), 500);
    }
  }

  setAttributeToSelected(attributeName, attributeValue) {
    if (this.editorManager.selectedComponent) {
      this.editorManager.selectedComponent.addAttributes({
        [attributeName]: attributeValue,
      });
    } else {
      this.displayAlertMessage(
        this.currentLanguage.getTranslation("no_tile_selected_error_message"),
        "error"
      );
    }
  }

  updateTileProperties(editor, page) {
    if (page && page.PageIsContentPage) {
      const currentCtaBgColor =
        this.editorManager.selectedComponent?.getAttributes()?.[
          "cta-background-color"
        ];

      const CtaRadios = document.querySelectorAll(
        '#cta-color-palette input[type="radio"]'
      );

      CtaRadios.forEach((radio) => {
        const colorBox = radio.nextElementSibling;
        radio.checked =
          colorBox.getAttribute("data-cta-color").toUpperCase() ===
          currentCtaBgColor.toUpperCase();
      });
    } else {
      const alignmentTypes = [
        {
          type: "text",
          attribute: "tile-text-align",
        },
        {
          type: "icon",
          attribute: "tile-icon-align",
        },
      ];

      alignmentTypes.forEach(({ type, attribute }) => {
        const currentAlign =
          this.editorManager.selectedComponent?.getAttributes()?.[attribute];
        ["left", "center", "right"].forEach((align) => {
          document.getElementById(`${type}-align-${align}`).checked =
            currentAlign === align;
        });
      });

      const currentTextColor =
        this.editorManager.selectedComponent?.getAttributes()?.[
          "tile-text-color"
        ];
      const textColorRadios = document.querySelectorAll(
        '.text-color-palette.text-colors .color-item input[type="radio"]'
      );

      textColorRadios.forEach((radio) => {
        const colorBox = radio.nextElementSibling;
        radio.checked =
          colorBox.getAttribute("data-tile-color") === currentTextColor;
      });

      // Update tile icon color
      const currentIconColor =
        this.editorManager.selectedComponent?.getAttributes()?.[
          "tile-icon-color"
        ];
      const iconColorRadios = document.querySelectorAll(
        '.text-color-palette.icon-colors .color-item input[type="radio"]' // Added .icon-colors
      );

      iconColorRadios.forEach((radio) => {
        const colorBox = radio.nextElementSibling;
        radio.checked =
          colorBox.getAttribute("data-tile-icon-color") === currentIconColor;
      });

      // update tile bg color
      const currentBgColor =
        this.editorManager.selectedComponent?.getAttributes()?.["tile-bgcolor"];
      const radios = document.querySelectorAll(
        '#theme-color-palette input[type="radio"]'
      );
      radios.forEach((radio) => {
        const colorBox = radio.nextElementSibling;
        radio.checked =
          colorBox.getAttribute("data-tile-bgcolor") === currentBgColor;
      });

      // update action
      const currentActionName =
        this.editorManager.selectedComponent?.getAttributes()?.[
          "tile-action-object"
        ];

      const currentActionId =
        this.editorManager.selectedComponent?.getAttributes()?.[
          "tile-action-object-id"
        ];

      const propertySection = document.getElementById("selectedOption");
      const selectedOptionElement = document.getElementById(currentActionId);

      const allOptions = document.querySelectorAll(".category-content li");
      allOptions.forEach((option) => {
        option.style.background = "";
      });

      if (currentActionName && currentActionId && selectedOptionElement) {
        propertySection.textContent = currentActionName;
        propertySection.innerHTML += ' <i class="fa fa-angle-down"></i>';

        selectedOptionElement.style.background = "#f0f0f0";
      }
    }
  }

  resetPropertySection() {
    const themeSection = document.querySelector(".theme-section");
    const titleSection = document.querySelector(".title-section");
    const customSelectContainer = document.querySelector(
      ".custom-select-container"
    );
    const servicesSection = document.querySelector(".services-section");
    const contentPageSection = document.querySelector(".content-page-section");

    if (themeSection) themeSection.style.display = "block";
    if (titleSection) titleSection.style.display = "block";
    if (customSelectContainer) customSelectContainer.style.display = "block";
    if (servicesSection) servicesSection.style.display = "block";
    //if (contentPageSection) contentPageSection.style.display = "none";
  }

  updatePropertySection() {
    const themeSection = document.querySelector(".theme-section");
    const titleSection = document.querySelector(".title-section");
    const customSelectContainer = document.querySelector(
      ".custom-select-container"
    );
    const servicesSection = document.querySelector(".services-section");
    const contentPageSection = document.querySelector(".content-page-section");

    if (themeSection) themeSection.style.display = "none";
    if (titleSection) titleSection.style.display = "none";
    if (customSelectContainer) customSelectContainer.style.display = "none";
    if (servicesSection) servicesSection.style.display = "none";
    if (contentPageSection) contentPageSection.style.display = "block";
  }

  updateMenuPageToolSection() {
    const menuPageSection = document.getElementById("menu-page-section");
    const displayStyle = menuPageSection.style.display;
    menuPageSection.style.display = displayStyle === "block" ? "none" : "block";
  }

  updateContentPageToolSection() {
    const contentPageSection = document.getElementById("content-page-section");
    const displayStyle = contentPageSection.style.display;

    document.getElementById("menu-page-section").style.display = "none";
    contentPageSection.style.display =
      displayStyle === "none" ? "flex" : "none";
  }

  checkIfNotAuthenticated(res) {
    if (res.error.Status === "Error") {
      console.error(
        "Error updating theme. Status:",
        res.error.Status,
        "Message:",
        res.error.Message
      );

      this.displayAlertMessage(
        this.currentLanguage.getTranslation("not_authenticated_message"),
        "error"
      );

      return true;
    }
  }
}
