class EditorManager {
  editors = {};
  pages = [];
  theme = [];
  currentEditor = null;
  currentPageId = null;
  selectedTemplateWrapper = null;
  selectedComponent = null;
  container = document.getElementById("child-container");

  constructor(
    dataManager,
    currentLanguage,
    LocationLogo,
    LocationProfileImage, ///
    themes,
    iconsData,
    templates,
    mapping,
    mediaCollection,
    addServiceButtonEvent,
    organisationLogo
  ) {
    this.dataManager = dataManager;
    this.currentLanguage = currentLanguage;
    this.LocationLogo = LocationLogo;
    this.LocationProfileImage = LocationProfileImage; //
    this.themes = themes;
    this.iconsData = iconsData;
    this.templates = templates;
    this.mapping = mapping;
    this.mediaCollection = mediaCollection;
    this.addServiceButtonEvent = addServiceButtonEvent;
    this.organisationLogo = organisationLogo;
    this.newPageComponent = new NewPageComponent(this)
    this.tileContextMenu = new TileContextMenu(this);

    this.templateManager = new TemplateManager(this.currentLanguage, this); //
    this.editorEventManager = new EditorEventManager(
      this,
      this.templateManager
    );

    this.initializeEditorManager();
  }

  async initializeEditorManager() {
    this.toolsSection = new ToolBoxManager(
      this,
      this.dataManager,
      this.themes,
      this.iconsData,
      this.templates,
      this.mapping,
      this.mediaCollection,
      this.currentLanguage,
      this.addServiceButtonEvent
    );
    const theme = await this.dataManager.getLocationTheme();
    if (this.toolsSection.checkIfNotAuthenticated(theme)) return;
    this.theme = theme.SDT_LocationTheme;

    const pagesResponse = await this.dataManager.getPages();
    if (this.toolsSection.checkIfNotAuthenticated(pagesResponse)) return;

    this.pages = pagesResponse.SDT_PageCollection;
    this.initializeHomePage();
  }

  initializeHomePage() {
    const homePage = this.pages.find((page) => page.PageName == "Home");
    if (homePage) {
      this.createChildEditor(homePage);
      this.currentPageId = homePage.PageId;
    } else {
      this.toolsSection.ui.displayAlertMessage(
        `${this.currentLanguage.getTranslation("no_home_page_found")}`,
        "danger"
      );
    }
  }

  getCurrentEditor() {
    return this.currentEditor.editor;
  }

  setCurrentEditor(editorId) {
    this.currentEditor = this.editors[editorId];
    this.activateFrame(editorId + "-frame");
    this.toolsSection.unDoReDo(this.currentEditor.editor);
  }

  activateFrame(activeFrameClass) {
    const activeFrame = document.querySelector(activeFrameClass);
    document.querySelectorAll(".active-editor").forEach((frame) => {
      if (frame !== activeFrame) {
        frame.classList.remove("active-editor");
      }
    });
    activeFrame.classList.add("active-editor");
  }

  createChildEditor(page, linkUrl = "", linkLabel = "") {
    const editorDetails = this.setupEditorContainer(page, linkLabel);
    const editor = this.initializeGrapesEditor(editorDetails.editorId);
    if (page.PageId) {
      this.editorEventManager.addEditorEventListeners(editor, page);
      this.loadEditorContent(editor, page, linkUrl);
    }
    this.setupEditorLayout(editor, page, editorDetails.containerId);
    this.finalizeEditorSetup(editor, page, editorDetails);
    return editor
  }

  setupEditorContainer(page, linkLabel) {
    const count = this.container.children.length;
    const editorId = `gjs-${count}`;
    const containerId = `${editorId}-frame`;
    const editorContainer = document.createElement("div");
    editorContainer.innerHTML = this.generateEditorHTML(
      page,
      editorId,
      linkLabel
    );
    this.configureEditorContainer(editorContainer, containerId, page.PageId);
    if (!page.PageId) {
      this.newPageComponent.createNewPageMenu();
    }
    return { editorId, containerId };
  }

  generateEditorHTML(page, editorId, linkLabel) {
    let pageTitle = "";
    if (page.PageIsWebLinkPage || page.PageIsDynamicForm) {
      pageTitle = linkLabel;
    } else {
      pageTitle = page.PageName;
      if (page.PageName == "Calendar") {
        pageTitle = "Events"
      }else if (page.PageName == "Mailbox") {
        pageTitle = "My Activity"
      }
    }
    const appBar = this.shouldShowAppBar(page)
      ? this.createContentPageAppBar(pageTitle, page.PageId)
      : this.createHomePageAppBar();
    let editorContainer = `<div id="${editorId}"></div>`;
    if (!page.PageId) {
      editorContainer = `<div id="new-page-menu"></div>`
    }
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
      ${editorContainer}
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
    return page.PageIsContentPage || page.PageName !== "Home";
  }

  createContentPageAppBar(pageName, pageId) {
    return `
      <div class="app-bar">
          <svg id="back-button-${pageId}" class="content-back-button" xmlns="http://www.w3.org/2000/svg" id="Group_14" data-name="Group 14" width="47" height="47" viewBox="0 0 47 47">
            <g id="Ellipse_6" data-name="Ellipse 6" fill="none" stroke="#262626" stroke-width="1">
              <circle cx="23.5" cy="23.5" r="23.5" stroke="none"/>
              <circle cx="23.5" cy="23.5" r="23" fill="none"/>
            </g>
            <path id="Icon_ionic-ios-arrow-round-up" data-name="Icon ionic-ios-arrow-round-up" d="M13.242,7.334a.919.919,0,0,1-1.294.007L7.667,3.073V19.336a.914.914,0,0,1-1.828,0V3.073L1.557,7.348A.925.925,0,0,1,.263,7.341.91.91,0,0,1,.27,6.054L6.106.26h0A1.026,1.026,0,0,1,6.394.07.872.872,0,0,1,6.746,0a.916.916,0,0,1,.64.26l5.836,5.794A.9.9,0,0,1,13.242,7.334Z" transform="translate(13 30.501) rotate(-90)" fill="#262626"/>
          </svg>
          <h1 contenteditable class="title" title=${pageName} style="text-transform: uppercase;">${
      pageName.length > 20 ? pageName.substring(0, 16) + "..." : pageName
    }</h1>
      </div>
    `;
  }

  createHomePageAppBar() {
    return `
      <div class="home-app-bar">
        <div id="added-logo" class="logo-added" style="display:flex">
          <img id="toolbox-logo" style="${window.innerWidth < 1440 ? "height: 35px" : "height: 40px"}" src="${this.organisationLogo || '/Resources/UCGrapes1/src/images/logo.png'}" alt="logo" /> 
        </div>

        <div id="add-profile-image" class="profile-section" style="display:flex">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 19.422 21.363">
            <path id="Path_1327" data-name="Path 1327" d="M15.711,5a6.8,6.8,0,0,0-3.793,12.442A9.739,9.739,0,0,0,6,26.364H7.942a7.769,7.769,0,1,1,15.537,0h1.942A9.739,9.739,0,0,0,19.5,17.442,6.8,6.8,0,0,0,15.711,5Zm0,1.942A4.855,4.855,0,1,1,10.855,11.8,4.841,4.841,0,0,1,15.711,6.942Z" transform="translate(-6 -5)" fill="#fff"/>
          </svg>
        </div>
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
          "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css",
          "/DVelop/Bootstrap/Shared/fontawesome_vlatest/css/all.min.css?202521714271081",
          "https://fonts.googleapis.com/css2?family=Inter:opsz@14..32&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap",
          "/Resources/UCGrapes1/src/css/toolbox.css",
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

  updatePageJSONContent(editor, page) {
    const PageGJSJson = editor.getProjectData();
    this.dataManager.pages.SDT_PageCollection.map((p) => {
      if (p.PageId == page.PageId) {
        p.PageGJSJson = JSON.stringify(PageGJSJson);
      }
      return p;
    });
  }

  async loadEditorContent(editor, page, linkUrl) {
    if (page.PageGJSJson && !page.PageIsWebLinkPage && !page.PageIsDynamicForm) {
      await this.loadExistingContent(editor, page);
    } else if (page.PageIsContentPage) {
      await this.loadNewContentPage(editor, page);
    } else if (page.PageIsWebLinkPage || page.PageIsDynamicForm) {
      await this.loadWebLinkContent(editor, linkUrl);
    }

    this.updatePageJSONContent(editor, page);
  }

  async loadExistingContent(editor, page) {
    try {
      const pageData = JSON.parse(page.PageGJSJson);
      if (page.PageIsPredefined && page.PageName === "Calendar") {
        await this.handleCalendarPage(editor);
      } else if (page.PageIsPredefined && page.PageName === "Location") {
        await this.handleLocationPage(editor, pageData);
      } else if (page.PageIsPredefined && page.PageName === "Reception") {
        editor.loadProjectData(pageData);
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
    const locationData = this.dataManager.Location;

    const dataComponents =
      pageData.pages[0].frames[0].component.components[0].components[0]
        .components[0].components[0].components[0].components;

    if (dataComponents.length) {
      const imgComponent = dataComponents.find(
        (component) => component.attributes.src
      );
      const descriptionComponent = dataComponents.find(
        (component) => component.type == "product-service-description"
      );
      if (imgComponent) {
        imgComponent.attributes.src = locationData.LocationImage_GXI;
      }
      if (descriptionComponent) {
        descriptionComponent.components[0].content =
          locationData.LocationDescription;
      }
      editor.DomComponents.clear();
      editor.loadProjectData(pageData);
    }
  }

  formatDate() {
    const date = new Date().toLocaleDateString('en-GB', {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).replace(/(\d{2} \w{3}) (\d{4})/, "$1, $2");

    return date;
 }

  async handleCalendarPage(editor) {
    let pageData = `
      <div class="tb-date-selector" ${defaultConstraints}>
        <span class="tb-arrow" ${defaultConstraints}>❮</span>
        <span class="tb-date-text" id="current-date" ${defaultConstraints}> ${this.formatDate()}</span>
        <span class="tb-arrow" ${defaultConstraints}>❯</span>
      </div>
      <div class="tb-schedule" id="schedule-container" ${defaultConstraints}>
    `;
    
    for (let hour = 0; hour < 24; hour++) {
        const formattedHour = hour.toString().padStart(2, "0") + ":00";
        pageData += `
          <div class="tb-time-slot" ${defaultConstraints}>
            <div class="tb-time" ${defaultConstraints}>${formattedHour}</div>
            <div class="tb-events" ${defaultConstraints}></div>
            ${hour === new Date().getHours() ? `
              <div class="tb-current-time-indicator" ${defaultConstraints}></div>
              <div class="tb-current-time-dot" ${defaultConstraints}></div>` : ''}
          </div>
        `;
    }
    
    pageData += `</div>`;
    
    editor.setComponents(pageData);
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
      await this.updateEditorCtaButtons(editor, contentPageData);
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
    this.toolsSection.ui.pageContentCtas(contentPageData.CallToActions, editor);
  }

  async updateImage(wrapper, contentPageData) {
    if (contentPageData?.ProductServiceImage) {
      const imageWrapper = wrapper.find("#content-image")[0];
      if(imageWrapper) {
        const image = `
        <img
            id="product-service-image"
            data-gjs-draggable="true"
            data-gjs-selectable="false"
            data-gjs-editable="false"
            data-gjs-droppable="false"
            data-gjs-highlightable="false"
            data-gjs-hoverable="true"
            src="${contentPageData.ProductServiceImage}"
            data-gjs-type="product-service-image"
            alt="Full-width Image"
        />
        `;

        const existingImage = imageWrapper.find("#product-service-image")[0];
        if (existingImage) {
          existingImage.replaceWith(image);
        } else {
          imageWrapper.append(image, { at: 2});
        }        
      }
    } else{
      const img = wrapper.find("#product-service-image")[0];
      if (img) {
        img.remove();
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
          const content = this.editorEventManager.templateManager
            .addDefaultConstraintsToContentDesc(contentPageData.ProductServiceDescription);
          const updatedContent = `
            <button ${defaultConstraints} class="tb-edit-content-icon">
              <?xml ${defaultConstraints}  version="1.0" ?>
              <svg ${defaultConstraints} width="14px" height="14px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path ${defaultConstraints} fill-rule="evenodd" clip-rule="evenodd" d="M18.4324 4C18.2266 4 18.0227 4.04055 17.8325 4.11933C17.6423 4.19811 17.4695 4.31358 17.3239 4.45914L5.25659 16.5265L4.42524 19.5748L7.47353 18.7434L19.5409 6.67608C19.6864 6.53051 19.8019 6.3577 19.8807 6.16751C19.9595 5.97732 20 5.77348 20 5.56761C20 5.36175 19.9595 5.1579 19.8807 4.96771C19.8019 4.77752 19.6864 4.60471 19.5409 4.45914C19.3953 4.31358 19.2225 4.19811 19.0323 4.11933C18.8421 4.04055 18.6383 4 18.4324 4ZM17.0671 2.27157C17.5 2.09228 17.9639 2 18.4324 2C18.9009 2 19.3648 2.09228 19.7977 2.27157C20.2305 2.45086 20.6238 2.71365 20.9551 3.04493C21.2864 3.37621 21.5492 3.7695 21.7285 4.20235C21.9077 4.63519 22 5.09911 22 5.56761C22 6.03611 21.9077 6.50003 21.7285 6.93288C21.5492 7.36572 21.2864 7.75901 20.9551 8.09029L8.69996 20.3454C8.57691 20.4685 8.42387 20.5573 8.25597 20.6031L3.26314 21.9648C2.91693 22.0592 2.54667 21.9609 2.29292 21.7071C2.03917 21.4534 1.94084 21.0831 2.03526 20.7369L3.39694 15.7441C3.44273 15.5762 3.53154 15.4231 3.6546 15.3001L15.9097 3.04493C16.241 2.71365 16.6343 2.45086 17.0671 2.27157Z" fill="#5068a8"/>
              </svg>
            </button>
            <div ${defaultConstraints} id="contentDescription">${content}</div>
          `
          p[0].components(updatedContent);
        } catch (err) {
          console.error("Error updating description:", err);
        }
      }
    }
  }

  async updateEditorCtaButtons(editor, contentPageData) {
    const wrapper = editor.DomComponents.getWrapper();
    const ctaContainer = wrapper.find(".cta-button-container")[0];
    if (ctaContainer) {
      const ctaButtons = ctaContainer.findType("cta-buttons");
      if (ctaButtons.length > 0) {
        ctaButtons.forEach((ctaButton) => {
          const ctaButtonId = ctaButton.getAttributes()?.["cta-button-id"];
          if (
            !contentPageData?.CallToActions?.some(
              (cta) => cta.CallToActionId === ctaButtonId
            )
          ) {
            ctaButton.remove();
          }
        });
      }
      const windowWidth = window.innerWidth;
      ctaContainer.getEl().style.gap = windowWidth <= 1440 ? "0.2rem" : "1.0rem";
      console.log("ctaContainer");
    }
  }

  async loadNewContentPage(editor, page) {
    try {
      const res = await this.dataManager.getContentPageData(page.PageId);
      if (this.toolsSection.checkIfNotAuthenticated(res)) return;
      const contentPageData = res.SDT_ProductService;
      if (contentPageData) {
        const projectData =
          this.templateManager.initialContentPageTemplate(contentPageData);
        editor.addComponents(projectData)[0];
        this.toolsSection.ui.pageContentCtas(
          contentPageData.CallToActions,
          editor
        );
      }
    } catch (error) {
      console.error("Error fetching content page data:", error);
    }
  }

  async loadWebLinkContent(editor, linkUrl) {
    try {
      editor.DomComponents.clear();

      // Define custom 'object' component
      editor.DomComponents.addType("object", {
        isComponent: (el) => el.tagName === "OBJECT",

        model: {
          defaults: {
            tagName: "object",
            draggable: true,
            droppable: false,
            selectable: false,
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
            const fallbackMessage =
              model.get("attributes").fallbackMessage ||
              "Content cannot be displayed";

            const fallbackContent = `
              <div class="fallback-content" ${defaultConstraints}>
                <p class="fallback-message" ${defaultConstraints}>${fallbackMessage}</p>
                <a href="${model.get("attributes").data}" 
                   target="_blank" 
                   class="fallback-link" ${defaultConstraints}>
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

            el.addEventListener("error", (e) => {
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
      editor.setComponents(`
        <div class="form-frame-container" id="frame-container" ${defaultConstraints}>
          <div class="preloader-wrapper" ${defaultConstraints}>
            <div class="preloader" ${defaultConstraints}></div>
          </div>
          <object 
          ${defaultConstraints}
            data="${linkUrl}"
            type="text/html"
            width="100%"
            height="800px"
            fallbackMessage="Unable to load the content. Please try opening it in a new window.">
          </object>
        </div>
      `);
    } catch (error) {
      console.error("Error setting up object component:", error.message);
    }
  }

  setupEditorLayout(editor, page, containerId) {
    if (this.shouldShowAppBar(page)) {
    }
    const canvas = editor.Canvas.getElement();
    if (canvas) {
      canvas.style.setProperty("height", "calc(100% - 100px)", "important");
    }

    const canvasBody = editor.Canvas.getBody();
    if (canvasBody) {
      canvasBody.style.setProperty("background-color", "#EFEEEC", "important");
    }    
    this.backButtonAction(containerId, page.PageId);
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

    const navigator = this.editorEventManager.activateNavigators();
    navigator.updateButtonVisibility();
    navigator.scrollBy(200);
    new Clock(`current-time-${page.PageId}`);
  }

  getPage(pageId) {
    return this.dataManager.pages.SDT_PageCollection.find(
      (page) => page.PageId == pageId
    );
  }

  backButtonAction(editorContainerId, pageId) {
    const backButton = document.getElementById(`back-button-${pageId}`);
    if (backButton) {
      backButton.addEventListener("click", (e) => {
        e.preventDefault();
        const currentContainer = document.getElementById(editorContainerId);
        if (!currentContainer) return;

        this.removeFrameContainer(currentContainer);
      });
    }
  }

  removePageOnTileDelete(editorContainerId) {
    const currentContainer = document.getElementById(
      editorContainerId + "-frame"
    );
    if (!currentContainer) return;

    this.removeFrameContainer(currentContainer);
  }

  removeFrameContainer(currentContainer) {
    const frameList = currentContainer.parentElement;
    const allFrames = Array.from(frameList.children);

    const currentIndex = allFrames.indexOf(currentContainer);

    allFrames.forEach((frame, index) => {
      if (index >= currentIndex) {
        frame.remove();
      }
    });

    this.editorEventManager.activateNavigators();
  }

  // setToolsSection(toolBox) {
  //   this.toolsSection = toolBox;
  // }
}
