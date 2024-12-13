let currentIndex = 0;

class ChildEditorManager {
  // child editor manager
  editors = {};
  pages = [];
  theme = [];
  toolsSection = null;
  currentEditor = null;
  currentPageId = null;

  container = document.getElementById("child-container");

  constructor(dataManager) {
    this.dataManager = dataManager;
    this.dataManager.getLocationTheme().then((res) => {
      this.theme = res;
    });
    this.dataManager.getPages().then((pages) => {
      this.pages = pages;
      console.log(pages);
      const homePage = this.pages.find((page) => page.PageName == "Home");
      if (homePage) {
        this.createChildEditor(homePage);
        this.currentPageId = homePage.PageId;
      } else {
        alert("No Home Page Found");
        return;
      }
    });
  }

  getCurrentEditor() {
    return this.currentEditor.editor;
  }

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
    console.log("Page is: ", page)
    const pageId = page.PageId;
    const count = this.container.children.length;
    const editorContainer = document.createElement("div");
    const editorId = `gjs-${count}`;
    let appBar = "";

    // AppBar HTML
    if (page.PageIsContentPage) {
      appBar = `
            <div class="app-bar">
                <button id="content-back-button" class="back-button">
                    <svg class="back-arrow" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 12H5M5 12L12 19M5 12L12 5"/>
                        <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M19 12H5M5 12L12 19M5 12L12 5"/>
                    </svg>
                </button>
                <h1 class="title">${page.PageName}</h1>
            </div>
        `;
    }

    // Editor Container Setup
    editorContainer.innerHTML = `
        <div class="header">
            <span id="current-time-${pageId}"></span>
            <span class="icons">
                <i class="fas fa-signal"></i>
                <i class="fas fa-wifi"></i>
                <i class="fas fa-battery"></i>
            </span>
        </div>
        ${appBar}
        <div id="${editorId}"></div>
    `;
    editorContainer.id = `${editorId}-frame`;
    editorContainer.dataset.pageid = pageId;
    editorContainer.classList.add("mobile-frame", "adding");
    this.container.appendChild(editorContainer);

    // Remove 'adding' class on next frame
    requestAnimationFrame(() => {
      editorContainer.classList.remove("adding");
    });

    // Initialize GrapesJS Editor
    const editor = grapesjs.init({
      container: `#${editorId}`,
      fromElement: true,
      height: "100%",
      width: "auto",
      canvas: {
        styles: [
          "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css",
          "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css",
          "https://fonts.googleapis.com/css2?family=Lora&family=Merriweather&family=Poppins:wght@400;500&family=Roboto:wght@400;500&display=swap",
          "/Resources/UCGrapes1/new-design/css/toolbox.css",
          "/Resources/UCGrapes1/new-design/css/child-editor.css",
        ],
        scripts: ["/Resources/UCGrapes1/new-design/js/child-editor.js"],
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

    // Add Event Listeners
    this.addEditorEventListners(editor);
    // Load or Initialize Editor Content
    if (page.PageGJSJson) {
      editor.loadProjectData(JSON.parse(page.PageGJSJson));

      if (page.PageIsContentPage) {
        this.dataManager
          .getContentPageData(page.PageId)
          .then((contentPageData) => {
            // Then check and update elements
            const wrapper = editor.getWrapper();
            if (wrapper) {
              const img = wrapper.components().find("#product-service-image");
              const p = wrapper
                .components()
                .find("#product-service-description");

              if (img && p) {
                img[0].setAttributes({
                  src: contentPageData.ProductServiceImage,
                });
                p[0].replaceWith(`
                          <p id="product-service-description" class="content-page-block" style="flex: 1; padding: 0; margin: 0; height: auto; margin-bottom: 15px">
                              ${contentPageData.ProductServiceDescription}
                          </p>
                      `);
              }
            }
            // Ensure Call To Actions are applied
            this.toolsSection.pageContentCtas(
              contentPageData.CallToActions,
              editor
            );
          })
          .catch((error) => {
            console.error("Error loading content page data:", error);
          });
      } else {
        editor.loadProjectData(JSON.parse(page.PageGJSJson));
      }
    } else {
      this.dataManager
        .getContentPageData(page.PageId)
        .then((contentPageData) => {
          if (contentPageData) {
            const projectData =
              this.initialContentPageTemplate(contentPageData);
            editor.addComponents(projectData)[0];

            // Ensure Call To Actions are applied
            this.toolsSection.pageContentCtas(
              contentPageData.CallToActions,
              editor
            );
          }
        })
        .catch((error) => {
          console.error("Error fetching content page data:", error);
        });
    }

    // Adjust Canvas for Content Pages
    if (page.PageIsContentPage) {
      const canvas = editor.Canvas.getElement();
      if (canvas) {
        canvas.style.setProperty("height", "calc(100% - 100px)", "important");
      }
      this.backButtonAction(editorContainer.id);
    }

    // Save Editor Instance
    const editorData = { pageId, editor };
    this.editors[`#${editorId}`] = editorData;
    if (page.PageName === "Home") {
      this.setCurrentEditor(`#${editorId}`);
    }

    console.log("Editor Instances are:", this.editors);

    // Wrapper Settings
    const wrapper = editor.getWrapper();
    wrapper.set({
      selectable: false,
      droppable: false,
      draggable: false,
      hoverable: false,
    });

    const navigator = this.activateNavigators();
    navigator.updateButtonVisibility();
    new Clock(`current-time-${pageId}`);
  }

  getPage(pageId) {
    return this.dataManager.pages.find((page) => page.PageId == pageId);
  }

  backButtonAction(editorContainerId) {
    const backButton = document.getElementById("content-back-button");
    if (backButton) {
      backButton.addEventListener("click", (e) => {
        e.preventDefault();
        $("#" + editorContainerId).remove();
        // currentIndex = currentIndex - 1;
        const navigator = this.activateNavigators();
        navigator.updateScroll();
        navigator.updateButtonsVisibility();
      });
    }
  }

  loadContentPage(page, editor) {
    this.dataManager.getContentPageData(page.PageId).then((contentPageData) => {
      console.log("Loaded Wrapper is: ", editor);
      let img = editor.getWrapper().find("#product-service-image");
      let p = editor.getWrapper().find("#product-service-description");
      if (img.length && p.length) {
        img[0].setAttributes({ src: contentPageData.ProductServiceImage });
        p[0].replaceWith(`
                    <p id="product-service-description" class="content-page-block" style="flex: 1; padding: 0; margin: 0; height: auto; margin-bottom: 15px"
                      class="content-page-block"
                      data-gjs-draggable="true"
                      data-gjs-selectable="false"
                      data-gjs-editable="false"
                      data-gjs-droppable="false"
                      data-gjs-highlightable="false"
                      data-gjs-hoverable="false">
                        ${contentPageData.ProductServiceDescription}
                    </p>
                `);
      } else {
        const projectData = this.initialContentPageTemplate(contentPageData);
        editor.setComponents(projectData)[0];
      }
    });
  }

  addEditorEventListners(editor) {
    editor.on("load", (model) => {
      this.dataManager.getLocationTheme().then((theme) => {
        this.toolsSection.setTheme(theme.ThemeName);
      });
      const wrapper = editor.getWrapper();
      wrapper.view.el.addEventListener("click", (e) => {
        const editorId = editor.getConfig().container;
        const editorContainerId = editorId + "-frame";

        this.setCurrentEditor(editorId);
        this.currentPageId = $(editorContainerId).data().pageid;

        if (e.target.attributes["tile-action-object-id"]) {
          console.log(this.dataManager.pages);
          const page = this.getPage(
            e.target.attributes["tile-action-object-id"].value
          );
          if (page) {
            $(editorContainerId).nextAll().remove();

            this.createChildEditor(page);

            $("#content-page-section").hide();
            if (page.PageIsContentPage) {
              $("#content-page-section").show();
            }
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

    editor.on("component:selected", (component) => {
      // this.toolsSection.resetPropertySection();
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

        //   this.updateUIState();
        //   this.activateFrame(`#default-container`);

        // clear existing frames first
        //   this.clearEditors();

        //   this.handlePageSelection();
      }

      this.toolsSection.updateTileProperties(
        this.currentEditor.editor,
        this.currentPageId
      );
      this.hideContextMenu();

      this.toolsSection.unDoReDo(this.currentEditor.editor);
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

  addTemplateRight(templateComponent, editorInstance) {
    const containerRow = templateComponent.parent();
    if (!containerRow || containerRow.components().length >= 3) return;
    const newComponents = editorInstance.addComponents(createTemplateHTML());
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
            ${createTemplateHTML()}
        </div>
        `)[0];

    const index = currentRow.index();
    containerColumn.append(newRow, { at: index + 1 });
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

  // activateNavigators() {
  //   const wrapper = document.getElementById("child-container");
  //   const prevButton = document.getElementById("scroll-left");
  //   const nextButton = document.getElementById("scroll-right");

  //   if (!wrapper || !prevButton || !nextButton) {
  //     console.error("Essential elements are missing from the DOM");
  //     return;
  //   }

  //   const items = document.querySelectorAll(".mobile-frame");
  //   const itemWidth = 250; // Item width + gap
  //   const totalItems = items.length;

  //   if (totalItems > 1) {
  //     wrapper.style.justifyContent = "flex-start";
  //   } else {
  //     wrapper.style.justifyContent = "center";
  //   }

  //   const moveSlide = (direction) => {
  //     const itemsToScroll = 1; // Number of items to scroll at a time

  //     // Calculate the new index
  //     const newIndex = currentIndex + (direction * itemsToScroll);

  //     // Prevent scrolling out of bounds
  //     currentIndex = Math.max(0, Math.min(newIndex, totalItems - 1));

  //     // Scroll by translating the wrapper
  //     const translateX = currentIndex * itemWidth;
  //     wrapper.style.transform = `translateX(-${translateX}px)`;

  //     // Update button visibility
  //     updateButtonsVisibility();
  //   }

  //   const updateButtonsVisibility = () => {
  //     prevButton.style.visibility = currentIndex === 0 ? "hidden" : "visible";
  //     nextButton.style.visibility =
  //       currentIndex === totalItems - 1 ? "hidden" : "visible";
  //   }

  //   prevButton.addEventListener("click", () => moveSlide(-1));
  //   nextButton.addEventListener("click", () => moveSlide(1));

  //   const updateScroll = () => {
  //     // Remove the specific item
  //     const items = document.querySelectorAll(".mobile-frame");
  //     const totalItems = items.length;

  //     // Adjust current index if it's now out of bounds
  //     currentIndex = Math.min(currentIndex, totalItems - 1);

  //     // Reposition the view
  //     const translateX = currentIndex * itemWidth;
  //     wrapper.style.transform = `translateX(-${translateX}px)`;

  //     // Update button visibility
  //     updateButtonsVisibility();
  //   }

  //   const scrollToFrame = () => {
  //     const items = document.querySelectorAll(".mobile-frame");
  //     const totalItems = items.length;

  //     currentIndex = totalItems - 1;

  //     // Calculate the translation value
  //     const translateX = currentIndex * itemWidth;

  //     // Apply the transformation to scroll
  //     wrapper.style.transform = `translateX(-${translateX}px)`;
  //     // Update button visibility
  //     updateButtonsVisibility();
  //   };

  //   // Initialize button visibility
  //   updateButtonsVisibility();

  //   // Return the utility functions
  //   return {
  //     updateScroll,
  //     scrollToFrame,
  //     updateButtonsVisibility,
  //   };
  // }
  activateNavigators() {
    const scrollContainer = document.getElementById("child-container");
    const prevButton = document.getElementById("scroll-left");
    const nextButton = document.getElementById("scroll-right");

    const frames = document.querySelectorAll(".mobile-frame");

    // Adjust the alignment based on the number of frames
    const alignment = frames.length > 1 ? "flex-start" : "center";
    scrollContainer.style.setProperty("justify-content", alignment);

    // Smooth scroll functionality for buttons
    const scrollBy = (offset) => {
      scrollContainer.scrollTo({
        left: scrollContainer.scrollLeft + offset,
        behavior: "smooth",
      });
    };

    prevButton.addEventListener("click", () => scrollBy(-200));
    nextButton.addEventListener("click", () => scrollBy(200));

    // Update button visibility based on scroll position
    const updateButtonVisibility = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;

      prevButton.style.display = scrollLeft > 0 ? "block" : "none";
      nextButton.style.display =
        scrollLeft + clientWidth < scrollWidth ? "block" : "none";
    };

    // Ensure visibility is updated initially and on scroll
    updateButtonVisibility();
    scrollContainer.addEventListener("scroll", updateButtonVisibility);

    return {
      updateButtonVisibility,
    }
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

  addFreshTemplate(template) {
    this.currentEditor.editor.DomComponents.clear();
    let fullTemplate = "";

    template.forEach((columns) => {
      const templateRow = this.generateTemplateRow(columns);
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

  applyTheme() {
    $("iframe").each((index, iframe) => {
      const root = document.documentElement;
      // const iframe = document.querySelector(".mobile-frame iframe");
      this.themeData = this.toolsSection.themes.find(
        (theme) => theme.name === this.theme.ThemeName
      );
      console.log(this.themeData);
      if (!iframe) return;

      // Set CSS variables from the selected theme
      root.style.setProperty(
        "--primary-color",
        this.themeData.colors.primaryColor
      );
      root.style.setProperty(
        "--secondary-color",
        this.themeData.colors.secondaryColor
      );
      root.style.setProperty(
        "--background-color",
        this.themeData.colors.backgroundColor
      );
      root.style.setProperty("--text-color", this.themeData.colors.textColor);
      root.style.setProperty(
        "--button-bg-color",
        this.themeData.colors.buttonBgColor
      );
      root.style.setProperty(
        "--button-text-color",
        this.themeData.colors.buttonTextColor
      );
      root.style.setProperty(
        "--card-bg-color",
        this.themeData.colors.cardBgColor
      );
      root.style.setProperty(
        "--card-text-color",
        this.themeData.colors.cardTextColor
      );
      root.style.setProperty(
        "--accent-color",
        this.themeData.colors.accentColor
      );

      root.style.setProperty("--font-family", this.theme.fontFamily);

      // Apply this.theme to iframe (canvas editor)
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.body.style.setProperty(
        "--primary-color",
        this.themeData.colors.primaryColor
      );
      iframeDoc.body.style.setProperty(
        "--secondary-color",
        this.themeData.colors.secondaryColor
      );
      iframeDoc.body.style.setProperty(
        "--background-color",
        this.themeData.colors.backgroundColor
      );
      iframeDoc.body.style.setProperty(
        "--text-color",
        this.themeData.colors.textColor
      );
      iframeDoc.body.style.setProperty(
        "--button-bg-color",
        this.themeData.colors.buttonBgColor
      );
      iframeDoc.body.style.setProperty(
        "--button-text-color",
        this.themeData.colors.buttonTextColor
      );
      iframeDoc.body.style.setProperty(
        "--card-bg-color",
        this.themeData.colors.cardBgColor
      );
      iframeDoc.body.style.setProperty(
        "--card-text-color",
        this.themeData.colors.cardTextColor
      );
      iframeDoc.body.style.setProperty(
        "--accent-color",
        this.themeData.colors.accentColor
      );
      iframeDoc.body.style.setProperty("--font-family", this.theme.fontFamily);
    });
  }

  rightClickEventHandler(editorInstance) {
    // Select all iframes in the document
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

      // Helper function to hide context menu
      const hideContextMenu = () => {
        contextMenu.style.display = "none";
        window.currentBlock = null; // Reset current block reference
      };

      // Hide context menu when clicking outside of it
      document.addEventListener("click", (e) => {
        if (!contextMenu.contains(e.target)) {
          hideContextMenu();
        }
      });

      // Hide context menu when clicking inside iframe
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

          // Calculate position relative to viewport
          const x = e.clientX + iframeRect.left;
          const y = e.clientY + iframeRect.top;

          // Position and display context menu
          contextMenu.style.position = "fixed";
          contextMenu.style.left = `${x}px`;
          contextMenu.style.top = `${y}px`;
          contextMenu.style.display = "block";

          // Store the current block reference
          window.currentBlock = block;
        } else {
          hideContextMenu();
        }
      });

      // Handle delete image action
      const deleteImage = document.getElementById("delete-bg-image");
      if (deleteImage) {
        deleteImage.addEventListener("click", () => {
          const blockToDelete = window.currentBlock;
          if (blockToDelete) {
            const currentStyles = this.selectedComponent.getStyle() || {};

            // Remove the background-image property while preserving other styles
            delete currentStyles["background-image"];

            // Reapply the updated styles
            this.selectedComponent.setStyle(currentStyles);

            hideContextMenu();
          }
        });
      } else {
        console.error("Delete image button not found.");
      }

      // Close context menu on Escape key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          hideContextMenu();
        }
      });
    });
  }

}
