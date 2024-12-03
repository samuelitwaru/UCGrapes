class ChildEditorManager{
    // child editor manager
    editors = {}
    pages = []
    theme = []
    toolsSection = null
    currentEditor = null
    currentPageId = null

    container = document.getElementById('child-container')

    constructor(dataManager) {
        this.dataManager = dataManager
        this.dataManager.getLocationTheme().then(res => {
          this.theme = res
        })
        this.dataManager.getPages().then(pages=>{
            this.pages = pages
            console.log(pages)
            const homePage = this.pages.find(page=>page.PageName=="Home")
            if (homePage) {
                this.createChildEditor(homePage)
                this.currentPageId = homePage.PageId
            }
            else {
                alert("No Home Page Found")
                return
            }
        })
    }

    getCurrentEditor(){
      return this.currentEditor.editor
    }

    setCurrentEditor(editorId){

        this.currentEditor = this.editors[editorId]
        this.activateFrame(editorId + '-frame')
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
        const pageId = page.PageId
        const count = this.container.children.length
        const editorContainer = document.createElement('div')
        let appBar = ""
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
          `
        }

        editorContainer.innerHTML = `
            <div class="header">
                <span id="current-time"></span>
                <span class="icons">
                <i class="fas fa-signal"></i>
                <i class="fas fa-wifi"></i>
                <i class="fas fa-battery"></i>
                </span>
            </div>
            ${appBar}
            <div id="gjs-${count}"></div>
        `
        const editorId = `gjs-${count}`
        editorContainer.id = `${editorId}-frame`
        editorContainer.dataset.pageid = pageId
        editorContainer.classList.add('mobile-frame')
        editorContainer.classList.add('adding')
        this.container.appendChild(editorContainer)

        requestAnimationFrame(() => {
            editorContainer.classList.remove('adding');
        });

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
                scripts: [
                    "/Resources/UCGrapes1/new-design/js/child-editor.js",
                ]
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
        this.addEditorEventListners(editor)

        if (page.PageIsContentPage) {
            try {
                editor.loadProjectData(JSON.parse(page.PageGJSJson))
            } catch (error) {
            }
            this.loadContentPage(page, editor)
            this.backButtonAction(editorContainer.id)
            const canvas = editor.Canvas.getElement();
            if (canvas) {
              canvas.style.setProperty("height", "calc(100% - 100px)", "important");
            }
        }else{
            editor.loadProjectData(JSON.parse(page.PageGJSJson))
        }
        const editorData = {
            pageId: pageId,
            editor: editor
        }
        this.editors[`#${editorId}`] = editorData
        if (page.PageName == "Home") {
            this.setCurrentEditor(`#${editorId}`)
        }
        this.applyTheme()
        this.activateNavigators()
    }

    getPage(pageId){
        return this.dataManager.pages.find(page=>page.PageId==pageId)
    }

    backButtonAction(editorContainerId) {
      const backButton = document.getElementById("content-back-button");
      if (backButton) {
        backButton.addEventListener("click", (e) => {
          e.preventDefault();
          $('#'+editorContainerId).remove()
        });
      }
    }

    loadContentPage(page, editor) {
        this.dataManager.getContentPageData(page.PageId).then((contentPageData) => {
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
                editor.addComponents(projectData)
            }

            this.toolsSection.pageContentCtas(
                contentPageData.CallToActions,
                editor
            );    
        });
    }

    addEditorEventListners(editor) {
        editor.on('load', (model) => {
            const wrapper = editor.getWrapper();
            wrapper.view.el.addEventListener("click", (e) => {
                const editorId = editor.getConfig().container
                const editorContainerId = editorId + '-frame'
                $(editorContainerId).nextAll().remove()
                this.setCurrentEditor(editorId)
                this.currentPageId = $(editorContainerId).data().pageid
                if (e.target.attributes['tile-action-object-id']) {
                    console.log(this.dataManager.pages)
                    const page = this.getPage(e.target.attributes['tile-action-object-id'].value)
                    console.log(page)
                    if (page) {
                        this.createChildEditor(page)
                        $("#content-page-section").hide()
                        if (page.PageIsContentPage) {
                            $("#content-page-section").show()
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
                
                console.log(templateWrapper)

                this.templateComponent = editor.Components.getById(
                    templateWrapper.id
                );
                if (!this.templateComponent) return;
    
                if (button.classList.contains("delete-button")) {
                    this.deleteTemplate(this.templateComponent);
                } else if (button.classList.contains("add-button-bottom")) {
                this.addTemplateBottom(this.templateComponent, editor);
                } else if (button.classList.contains("add-button-right")) {
                this.addTemplateRight(this.templateComponent, editor);
                }
            })
        });

        editor.on("component:selected", (component) => {
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
        });
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
        const newComponents = editorInstance.addComponents(
          createTemplateHTML()
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
  
    applyTheme() {
      $('iframe').each((index, iframe) => {
        const root = document.documentElement;
        // const iframe = document.querySelector(".mobile-frame iframe");
        this.themeData = this.toolsSection.themes.find((theme) => theme.name === this.theme.ThemeName);
        console.log(this.themeData)
        if (!iframe) return
    
    
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
        root.style.setProperty("--text-color",this.themeData.colors.textColor);
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
        iframeDoc.body.style.setProperty(
          "--font-family",
          this.theme.fontFamily
        );
      })

    }

}