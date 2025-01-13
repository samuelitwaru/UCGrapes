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
                  `${this.currentLanguage.getTranslation(
                    "no_home_page_found"
                  )}`,
                  "danger"
                );
                return;
            }
        });

        this.currentLanguage = currentLanguage;
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
        const pageId = page.PageId;
        const count = this.container.children.length;
        const editorContainer = document.createElement("div");
        const editorId = `gjs-${count}`;
        let appBar = "";

        // AppBar HTML
        if (
            page.PageIsContentPage ||
            (page.PageIsPredefined && page.PageName != "Home")
        ) {
            appBar = `
            <div class="app-bar">
                <button id="content-back-button" class="back-button">
                    <svg class="back-arrow" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 12H5M5 12L12 19M5 12L12 5"/>
                        <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M19 12H5M5 12L12 19M5 12L12 5"/>
                    </svg>
                </button>
                <h1 class="title" style="text-transform: uppercase">${page.PageName}</h1>
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
            panels: {
                defaults: []
            },
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
        this.toolsSection.unDoReDo(editor);
        
        if (page.PageGJSJson) {
            
            editor.loadProjectData(JSON.parse(page.PageGJSJson));

            if (page.PageIsPredefined) {
                if (page.PageName == "Location") {
                    const pageData = JSON.parse(page.PageGJSJson);
                    pageData.pages[0].frames[0].component.components[0].components[0].components[0].components[0].components[0].components[0].attributes.src =
                        this.dataManager.Location.LocationImage_GXI;
                    pageData.pages[0].frames[0].component.components[0].components[0].components[0].components[0].components[0].components[1].components[0].content =
                        this.dataManager.Location.LocationDescription;
                    editor.DomComponents.clear();
                    editor.loadProjectData(pageData);
                }
            } else if (page.PageIsContentPage) {
                this.dataManager
                    .getContentPageData(page.PageId)
                    .then((res) => {
                        if (this.toolsSection.checkIfNotAuthenticated(res)) {
                            return;
                        }

                        const contentPageData = res.SDT_ProductService;

                        const wrapper = editor.DomComponents.getWrapper();

                        if (!wrapper) {
                            console.error('Wrapper not found in editor');
                            return;
                        }

                        const img = wrapper.find('#product-service-image');
                        const p = wrapper.find('#product-service-description');

                        if (img.length > 0) {
                            if (!contentPageData?.ProductServiceImage) {
                                img[0].remove(); // Hide the image element
                                console.warn('ProductServiceImage is missing in contentPageData');
                            } else {
                                try {
                                    img[0].setAttributes({
                                        src: contentPageData.ProductServiceImage,
                                        alt: 'Product Service Image' // Adding alt for accessibility
                                    });
                                } catch (err) {
                                    console.error('Error updating image:', err);
                                }
                            }
                        }

                        // Validate paragraph element
                        if (p.length > 0) {
                            if (!contentPageData?.ProductServiceDescription) {
                                p[0].remove();
                                console.warn('ProductServiceDescription is missing in contentPageData');
                            } else {
                                try {
                                    p[0].replaceWith(`
                                      <p 
                                        id="product-service-description" 
                                        class="content-page-block" 
                                        style="flex: 1; padding: 0; margin: 0; height: auto;"
                                      >
                                        ${contentPageData.ProductServiceDescription}
                                      </p>
                                    `);
                                } catch (err) {
                                    console.error('Error updating description:', err);
                                }
                            }
                        } else {
                            console.warn('#product-service-description element not found');
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
            }
        } else {
            this.dataManager
                .getContentPageData(page.PageId)
                .then((res) => {
                    if (this.toolsSection.checkIfNotAuthenticated(res)) {
                        return;
                    }
                    const contentPageData = res.SDT_ProductService;

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

        if (
            page.PageIsContentPage ||
            (page.PageIsPredefined && page.PageName != "Home")
        ) {
            const canvas = editor.Canvas.getElement();
            if (canvas) {
                canvas.style.setProperty("height", "calc(100% - 100px)", "important");
            }
            this.backButtonAction(editorContainer.id);
        }

        const editorData = {
            pageId,
            editor
        };
        this.editors[`#${editorId}`] = editorData;
        if (page.PageName === "Home") {
            this.setCurrentEditor(`#${editorId}`);
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
        new Clock(`current-time-${pageId}`);
    }

    getPage(pageId) {
        return this.dataManager.pages.SDT_PageCollection.find((page) => page.PageId == pageId);
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

    loadContentPage(editor, page) {
        editor.on("load", (model) => {
            const wrapper = editor.getWrapper();
            if (page.PageIsContentPage) {
                this.dataManager
                    .getContentPageData(page.PageId)
                    .then((res) => {
                        if (this.toolsSection.checkIfNotAuthenticated(res)) {
                            return;
                        }

                        const contentPageData = res.SDT_ProductService;

                        if (wrapper) {
                            // Adjusted the way components are searched
                            const img = wrapper.find(
                                '[data-gjs-type="product-service-image"]'
                            );
                            const p = wrapper.find(
                                '[data-gjs-type="product-service-description"]'
                            );

                            if (img.length > 0 && p.length > 0) {
                                img[0].setAttributes({
                                    src: contentPageData.ProductServiceImage,
                                });
                                p[0].replaceWith(`
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
                              `);
                            }
                        }

                        const validCallToActionIds =
                            contentPageData.CallToActions?.map(
                                (action) => action.CallToActionId
                            ) || [];

                        const ctaComponents = wrapper.find('[data-gjs-type="cta-buttons"]');

                        if (validCallToActionIds.length === 0) {
                            ctaComponents.forEach((ctaButton) => {
                                ctaButton.remove();
                            });
                        } else {
                            ctaComponents.forEach((ctaButton) => {
                                const ctaButtonId = ctaButton.attributes.attributes.id.replace(
                                    "id-",
                                    ""
                                );

                                if (ctaButtonId) {
                                    if (!validCallToActionIds.includes(ctaButtonId)) {
                                        ctaButton.remove();
                                    }
                                }
                            });
                        }

                        this.toolsSection.pageContentCtas(
                            contentPageData.CallToActions,
                            editor
                        );
                    })
                    .catch((error) => {
                        console.error("Error loading content page data:", error);
                    });
            }
        });
    }

    addEditorEventListners(editor) {
        editor.on("load", (model) => {
            this.dataManager.getLocationTheme().then((theme) => {
                this.toolsSection.setTheme(theme.SDT_LocationTheme.ThemeName);
            });
            const wrapper = editor.getWrapper();
            wrapper.view.el.addEventListener("click", (e) => {
                const editorId = editor.getConfig().container;
                const editorContainerId = editorId + "-frame";

                this.setCurrentEditor(editorId);
                this.currentPageId = $(editorContainerId).data().pageid;

                this.toolsSection.unDoReDo(editor);

                if (e.target.attributes["tile-action-object-id"]) {
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
            }

            this.toolsSection.updateTileProperties(
                this.currentEditor.editor,
                this.currentPageId
            );
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
                    width: `${newWidth}%`
                });
            }
        });

        this.updateRightButtons(containerRow);
    }

    addTemplateRight(templateComponent, editorInstance) {
        const containerRow = templateComponent.parent();
        if (!containerRow || containerRow.components().length >= 3) return;
        const newComponents = editorInstance.addComponents(this.createTemplateHTML());
        const newTemplate = newComponents[0];
        if (!newTemplate) return;

        const index = templateComponent.index();
        containerRow.append(newTemplate, {
            at: index + 1
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
            at: index + 1
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
                    display: "none"
                });
            } else {
                rightButton.removeAttribute("disabled");
                rightButtonComponent.addStyle({
                    display: "flex"
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
            const {
                scrollLeft,
                scrollWidth,
                clientWidth
            } = scrollContainer;

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
            this.themeData = this.toolsSection.themes.find(
                (theme) => theme.name === this.theme.ThemeName
            );

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
                        const currentStyles = editorInstance.getStyle() || {};

                        delete currentStyles["background-image"];

                        this.selectedComponent.setStyle(currentStyles);

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