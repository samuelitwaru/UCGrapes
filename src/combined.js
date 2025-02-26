// Content from classes/Clock.js
class Clock {
    constructor(pageId) {
      this.pageId = pageId;
      this.updateTime();
    }
  
    updateTime() {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // Adjust hours for 12-hour format
      const timeString = `${hours}:${minutes} ${ampm}`;
      document.getElementById(this.pageId).textContent = timeString;
    }
}


// Content from classes/Locale.js
class Locale {
  constructor(language) {
    this.currentLanguage = language;
    this.defaultLanguage = "english";
    this.translations = {};
  }

  async init() {
    await this.loadTranslations();
    return this; // Allow chaining
  }

  async loadTranslations() {
    try {
      const languages = ["english", "dutch"];
      for (const lang of languages) {
        const response = await fetch(
          `${window.location.origin}/Resources/UCGrapes1/src/i18n/${lang}.json`
        );
        if (!response.ok)
          throw new Error(`Failed to load ${lang} translations`);
        const data = await response.json();
        this.translations[lang] = data;
      }
    } catch (error) {
      console.error("Error loading translations:", error);
      throw new Error(`Failed to load translations: ${error.message}`);
    }
  }

  async setLanguage(language) {
    // Wait for translations to be loaded
    if (Object.keys(this.translations).length === 0) {
      await this.loadTranslations();
    }

    const elementsToTranslate = [
      "navbar_title",
      "navbar_tree_label",
      "navbar_publish_label",
      "sidebar_tabs_pages_label",
      "sidebar_tabs_templates_label",
      "sidebar_select_action_label",
      "new_page_submit_label",
      "template_added_success_message",
      "theme_applied_success_message",
      "page_loaded_success_message",
      "no_tile_selected_error_message",
      "error_loading_data_message",
      "failed_to_save_current_page_message",
      "tile_has_bg_image_error_message",
      "error_applying_theme_message",
      "no_icon_selected_error_message",
      "error_save_message",
      "accept_popup",
      "close_popup",
      "sidebar_mapping_title",
      "alert_type_success",
      "alert_type_error",
      "cancel_btn",
      "save_btn",
      "publish_confirm_title",
      "publish_confirm_message",
      "nofity_residents_on_publish",
      "publish_confirm_button",
      "publish_cancel_button",
      "enter_title_place_holder",
    ];

    elementsToTranslate.forEach((elementId) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.innerText = this.getTranslation(elementId);
      } else {
        console.warn(`Element with id '${elementId}' not found`);
      }
    });

  }

  translateTilesTitles(editor){
    
    const tileTitlesToTranslate = [
      "tile-reception", "tile-calendar", "tile-mailbox", "tile-location",
      "tile-my-care", "tile-my-living", "tile-my-services"
    ]

    tileTitlesToTranslate.forEach(elementClass => {
      const components = editor.DomComponents.getWrapper().find(`.${elementClass}`);
      if (components.length) {
        const newHTML = `<span data-gjs-type="text" class="tile-title ${elementClass}">${this.getTranslation(elementClass)}</span>`
        components[0].replaceWith(newHTML);
      } 
    })
  }

  getTranslation(key) {
    if (!this.translations || Object.keys(this.translations).length === 0) {
      console.warn("Translations not yet loaded");
      return key;
    }

    const translation =
      this.translations[this.currentLanguage]?.[key] ||
      this.translations[this.defaultLanguage]?.[key];

    if (!translation) {
      console.warn(`Translation missing for key '${key}'`);
      return key;
    }
    return translation;
  }

  translateUCStrings() {
    document.getElementById("tile-title").placeholder = this.getTranslation(
      "enter_title_place_holder"
    );

    const options = [
      {
        value: "Services",
        label: "icon_category_services",
      },
      {
        value: "General",
        label: "icon_category_general",
        selected: true,
      },
      {
        value: "Health",
        label: "icon_category_health",
      },
      {
        value: "Living",
        label: "icon_category_living",
      },
    ];

    const select = document.querySelector(".tb-custom-category-selection");
    const button = select.querySelector(".category-select-button");
    const selectedValue = button.querySelector(".selected-category-value");

    const closeDropdown = () => {
      optionsList.classList.remove("show");
      button.classList.remove("open");
      button.setAttribute("aria-expanded", "false");
    };
    
    // Handle outside clicks
    document.addEventListener("click", (e) => {
      const isClickInside = select.contains(e.target);
      
      if (!isClickInside) {
        closeDropdown();
      }
    });
    
    // Toggle dropdown visibility
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation(); // Prevent the document click handler from immediately closing the dropdown
      const isOpen = optionsList.classList.contains("show");
      optionsList.classList.toggle("show");
      button.classList.toggle("open");
      button.setAttribute("aria-expanded", !isOpen);
    });
    
    const optionsList = document.createElement("div");
    optionsList.classList.add("category-options-list");
    optionsList.setAttribute("role", "listbox");
    optionsList.innerHTML = "";
    
    // Populate themes into the dropdown
    options.forEach((opt, index) => {
      const option = document.createElement("div");
      option.classList.add("category-option");
      option.setAttribute("role", "option");
      option.setAttribute("data-value", opt.value);
      option.textContent = this.getTranslation(opt.label);
      if (opt.selected) {
        selectedValue.textContent = this.getTranslation(opt.label);
        option.classList.add("selected");
      }
    
      option.addEventListener("click", (e) => {
        e.stopPropagation(); 
        selectedValue.textContent = this.getTranslation(opt.label);
    
        // Mark as selected
        const allOptions = optionsList.querySelectorAll(".category-option");
        allOptions.forEach((opt) => opt.classList.remove("selected"));
        option.classList.add("selected");
    
        // Close the dropdown
        closeDropdown();
      });
    
      // Append option to the options list
      optionsList.appendChild(option);
    });
    
    select.appendChild(optionsList);
    
    // Cleanup function to remove event listeners when needed
    const cleanup = () => {
      document.removeEventListener("click", closeDropdown);
    };
  }
}


// Content from classes/LoadingManager.js
class LoadingManager {
  constructor(preloaderElement, minDuration = 300) {
    this.preloaderElement = preloaderElement;
    this._loading = false;
    this._startTime = 0;
    this.minDuration = minDuration;
    this.transitionDuration = 200;
  }

  get loading() {
    return this._loading;
  }

  set loading(value) {
    this._loading = value;
    if (value) {
      this._startTime = performance.now();
      this.showPreloader();
    } else {
      this.hidePreloader();
    }
  }

  showPreloader() {
    this.preloaderElement.style.display = "flex";
    requestAnimationFrame(() => {
      this.preloaderElement.style.transition = `opacity ${this.transitionDuration}ms ease-in-out`;
      this.preloaderElement.style.opacity = "1";
    });
  }

  hidePreloader() {
    const elapsedTime = performance.now() - this._startTime;
    if (elapsedTime >= this.minDuration) {
      this.preloaderElement.style.transition = `opacity ${this.transitionDuration}ms ease-in-out`;
      this.preloaderElement.style.opacity = "0";
      setTimeout(() => {
        this.preloaderElement.style.display = "none";
      }, this.transitionDuration);
    } else {
      setTimeout(() => {
        this.hidePreloader();
      }, this.minDuration - elapsedTime);
    }
  }
}

// Content from classes/DataManager.js
const environment = "/Comforta_version2DevelopmentNETPostgreSQL";
const baseURL = window.location.origin + (window.location.origin.startsWith("http://localhost") ? environment : "");

class DataManager {
  constructor(services = [], forms = [], media = []) {
    this.services = services;
    this.forms = forms;
    this.media = media;
    this.pages = [];
    this.selectedTheme = null;
    this.loadingManager = new LoadingManager(document.getElementById('preloader'));
  }

  // Helper method to handle API calls
  async fetchAPI(endpoint, options = {}, skipLoading = false) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
  
    try {
      if (!skipLoading) {
        this.loadingManager.loading = true;
      }
  
      const response = await fetch(`${baseURL}${endpoint}`, {
        ...defaultOptions,
        ...options,
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    } finally {
      if (!skipLoading) {
        this.loadingManager.loading = false;
      }
    }
  }
  

  // Pages API methods
  async getPages() {
    this.pages = await this.fetchAPI('/api/toolbox/pages/list', {}, true);
    return this.pages;
  }

  async getServices() {
    const services = await this.fetchAPI('/api/toolbox/services', {}, true);
    this.services = services.SDT_ProductServiceCollection;
    return this.services;
  }

  async getSinglePage(pageId) {
    return await this.fetchAPI(`/api/toolbox/singlepage?Pageid=${pageId}`);
  }

  async deletePage(pageId) {
    return await this.fetchAPI(`/api/toolbox/deletepage?Pageid=${pageId}`);
  }

  async getPagesService() {
    return await this.fetchAPI('/api/toolbox/pages/tree');
  }

  async createNewPage(pageName, theme) {
    let pageJsonContent = generateNewPage(theme)
    return await this.fetchAPI('/api/toolbox/create-page', {
      method: 'POST',
      body: JSON.stringify({ PageName: pageName, PageJsonContent: JSON.stringify(pageJsonContent) }),
    });
  }

  async updatePage(data) {
    return await this.fetchAPI('/api/toolbox/update-page', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true); // Pass true to skip loading
  }

  async updatePagesBatch(payload) {
    return await this.fetchAPI('/api/toolbox/update-pages-batch', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async addPageChild(childPageId, currentPageId) {
    return await this.fetchAPI('/api/toolbox/add-page-children', {
      method: 'POST',
      body: JSON.stringify({
        ParentPageId: currentPageId,
        ChildPageId: childPageId,
      }),
    });
  }

  async createContentPage(pageId) {
    return await this.fetchAPI('/api/toolbox/create-content-page', {
      method: 'POST',
      body: JSON.stringify({ PageId: pageId }),
    });
  }

  async createDynamicFormPage(formId, pageName) {
    return await this.fetchAPI('/api/toolbox/create-dynamic-form-page', {
      method: 'POST',
      body: JSON.stringify({ FormId: formId, PageName: pageName }),
    });
  }

  // Theme API methods
  async getLocationTheme() {
    return await this.fetchAPI('/api/toolbox/location-theme');
  }

  async updateLocationTheme() {
    if (!this.selectedTheme?.ThemeId) {
      throw new Error('No theme selected');
    }

    return await this.fetchAPI('/api/toolbox/update-location-theme', {
      method: 'POST',
      body: JSON.stringify({ ThemeId: this.selectedTheme.ThemeId }),
    });
  }

  // Media API methods
  async getMediaFiles() {
    return await this.fetchAPI('/api/media/');
  }

  async deleteMedia(mediaId) {
    return await this.fetchAPI(`/api/media/delete?MediaId=${mediaId}`);
  }

  async uploadFile(fileData, fileName, fileSize, fileType) {
    if (!fileData) {
      throw new Error('Please select a file!');
    }

    return await this.fetchAPI('/api/media/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: JSON.stringify({
        MediaName: fileName,
        MediaImageData: fileData,
        MediaSize: fileSize,
        MediaType: fileType,
      }),
    }, true);
  }

  async uploadLogo(logoUrl) {
    return await this.fetchAPI('/api/media/upload/logo', {
      method: 'POST',
      body: JSON.stringify({ LogoUrl: logoUrl }),
    });
  }

  async uploadProfileImage(profileImageUrl) {
    return await this.fetchAPI('/api/media/upload/profile', {
      method: 'POST',
      body: JSON.stringify({ ProfileImageUrl: profileImageUrl }),
    });
  }

  // Content API methods
  async getContentPageData(productServiceId) {
    return await this.fetchAPI(`/api/productservice?Productserviceid=${productServiceId}`);
  }
}


// Content from classes/EditorManager.js
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
    LocationProfileImage
  ) {
    this.dataManager = dataManager;
    this.currentLanguage = currentLanguage;
    this.LocationLogo = LocationLogo;
    this.LocationProfileImage = LocationProfileImage;
    this.templateManager = new TemplateManager(this.currentLanguage, this);
    this.editorEventManager = new EditorEventManager(
      this,
      this.templateManager
    );

    this.initializeEditorManager();
  }

  async initializeEditorManager() {
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
    this.editorEventManager.addEditorEventListeners(editor, page);
    this.loadEditorContent(editor, page, linkUrl);
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

    return { editorId, containerId };
  }

  generateEditorHTML(page, editorId, linkLabel) {
    let pageTitle = "";
    if (page.PageIsWebLinkPage) {
      pageTitle = linkLabel;
    } else {
      pageTitle = page.PageName;
    }
    const appBar = this.shouldShowAppBar(page)
      ? this.createContentPageAppBar(pageTitle, page.PageId)
      : this.createHomePageAppBar();

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
          <h1 class="title" title=${pageName} style="text-transform: uppercase;">${
      pageName.length > 20 ? pageName.substring(0, 16) + "..." : pageName
    }</h1>
      </div>
    `;
  }

  createHomePageAppBar() {
    return `
      <div class="home-app-bar">
        <div id="added-logo" class="logo-added" style="display:flex">
          <img id="toolbox-logo" style="${window.innerWidth < 1440 ? "height: 35px" : "height: 40px"}" src="/Resources/UCGrapes1/src/images/logo.png" alt="logo" /> 
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
    editor.DomComponents.clear();
    if (page.PageGJSJson && !page.PageIsWebLinkPage) {
      await this.loadExistingContent(editor, page);
    } else if (page.PageIsContentPage) {
      await this.loadNewContentPage(editor, page);
    } else if (page.PageIsDynamicForm) {
      await this.loadDynamicFormContent(editor, page);
    } else if (page.PageIsWebLinkPage) {
      await this.loadWebLinkContent(editor, linkUrl);
    }

    this.updatePageJSONContent(editor, page);
  }

  async loadExistingContent(editor, page) {
    try {
      const pageData = JSON.parse(page.PageGJSJson);

      if (page.PageIsPredefined && page.PageName === "Location") {
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
    // if (this.toolsSection.checkIfNotAuthenticated(locationData)) return;

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
          p[0].components(contentPageData.ProductServiceDescription);
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

      const ctaRoundButtons = ctaContainer.find(".cta-container-child");

      if (ctaRoundButtons.length > 0) {
        ctaRoundButtons.forEach(button => {
          const windowWidth = window.innerWidth;
          button.getEl().style.marginRight = windowWidth <= 1440 ? "0.5rem" : "1.1rem";
        })
        
      }
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

  async loadDynamicFormContent(editor, page) {
    try {
      editor.DomComponents.clear();
      // Add the component to the editor with preloader in a wrapper
      editor.setComponents(`
        <div class="form-frame-container" id="frame-container" ${defaultConstraints}>
          <div class="preloader-wrapper" ${defaultConstraints}>
            <div class="preloader" ${defaultConstraints}></div>
          </div>
          <object 
            data="${baseURL}/utoolboxdynamicform.aspx?WWPFormId=${page.WWPFormId}&WWPDynamicFormMode=DSP&DefaultFormType=&WWPFormType=0"
            type="text/html"
            width="100%"
            height="800px"
            fallbackMessage="Unable to load the content. Please try opening it in a new window." ${defaultConstraints}>
          </object>
        </div>
      `);
    } catch (error) {
      console.error("Error setting up object component:", error.message);
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
              console.log("Object content loaded");
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
              console.error("Error loading object content:", e);
            });
          },
        },
      });

      // Add the component to the editor with preloader in a wrapper
      editor.setComponents(`
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

  setToolsSection(toolBox) {
    this.toolsSection = toolBox;
  }
}


// Content from classes/EditorEventManager.js
class EditorEventManager {
  constructor(editorManager, templateManager) {
    this.editorManager = editorManager;
    this.templateManager = templateManager;
  }

  addEditorEventListeners(editor, page) {
    this.editorOnLoad(editor);
    this.editorOnDragDrop(editor);
    this.editorOnSelected(editor);
    this.setupKeyboardBindings(editor);
  }

  setupKeyboardBindings(editor) {
    const { keymaster } = editor.Keymaps;
    keymaster.unbind("backspace");
    keymaster.unbind("delete");
    keymaster.bind("ctrl+z");
    keymaster.bind("ctrl+shift+z");
  }

  editorOnLoad(editor) {
    editor.on("load", () => this.handleEditorLoad(editor));
  }

  handleEditorLoad(editor) {
    this.loadTheme();
    const wrapper = editor.getWrapper();
    this.updateEditorAfterLoad(editor);
    this.editorManager.toolsSection.currentLanguage.translateTilesTitles(
      editor
    );

    wrapper.view.el.addEventListener("click", (e) => {
      const previousSelected =
        this.editorManager.currentEditor.editor.getSelected();
      if (previousSelected) {
        this.editorManager.currentEditor.editor.selectRemove(previousSelected);
        this.editorManager.selectedComponent = null;
        this.editorManager.selectedTemplateWrapper = null;
      }

      this.handleEditorClick(e, editor);
    });
  }

  updateEditorAfterLoad(editor) {
    
    const titles = editor.DomComponents.getWrapper().find(".tile-title");
    titles.forEach((title) => {
      if (!title.getAttributes()?.["title"]) {
        title.addAttributes({"title": title.getEl().textContent});
      }

      if (!title.getAttributes()?.["is-hidden"]) {
        console.log("Hello world");
        title.addAttributes({"is-hidden": "false"}); 
      }
    });

    const tileIcons = editor.DomComponents.getWrapper().find(".tile-icon");
    tileIcons.forEach((icon) => {
      if (!icon.getAttributes()?.["is-hidden"]) {
        console.log("Hello world");
        icon.addAttributes({"is-hidden": "true"}); 
      }
    });

    const rowContainers = editor.DomComponents.getWrapper().find(".container-row");
    rowContainers.forEach((rowContainer) => {
      this.templateManager.templateUpdate.updateRightButtons(rowContainer);
    });

  }

  loadTheme() {
    this.editorManager.toolsSection.themeManager.setTheme(
      this.editorManager.theme.ThemeName
    );

    this.editorManager.toolsSection.themeManager.listThemesInSelectField();
  }

  handleEditorClick(e, editor) {
    const editorId = editor.getConfig().container;
    const editorContainerId = `${editorId}-frame`;

    this.editorManager.setCurrentEditor(editorId);
    this.editorManager.currentPageId = $(editorContainerId).data().pageid;

    this.updateToolsSection();
    this.editorManager.toolsSection.unDoReDo(editor);

    const ctaBtnSelected = e.target.closest("[cta-buttons]");
    if (ctaBtnSelected) {
      this.editorManager.toolsSection.ui.activateCtaBtnStyles(
        this.editorManager.selectedComponent
      );
    }

    const tileElement = e.target.closest("[tile-action-object-id]");
    if (tileElement) {
      const customEvent = {
        ...e,
        target: tileElement,
      };
      this.handleTileActionClick(customEvent, editorContainerId);
    }

    const button = e.target.closest(".action-button");
    if (button) {
      this.handleActionButtonClick(button, editor);
    }
  }

  handleTileActionClick(e, editorContainerId) {
    const pageId = e.target.attributes["tile-action-object-id"]?.value;
    const pageUrl = e.target.attributes["tile-action-object-url"]?.value;
    const pageLinkLabel = e.target.attributes["tile-action-object"]?.value;

    let linkLabel = "";
    if (pageLinkLabel) {
      linkLabel = pageLinkLabel.replace("Web Link, ", "");
    }

    const page = this.editorManager.getPage(pageId);
    $(editorContainerId).nextAll().remove();
    if (page) {
      this.editorManager.createChildEditor(page, pageUrl, linkLabel);
    }
  }

  handleActionButtonClick(button, editor) {
    const templateWrapper = button.closest(".template-wrapper");
    if (!templateWrapper) return;

    const templateComponent = editor.Components.getById(templateWrapper.id);
    if (!templateComponent) return;

    this.templateComponent = templateComponent;

    if (button.classList.contains("delete-button")) {
      this.templateManager.deleteTemplate(this.templateComponent);
    } else if (button.classList.contains("add-button-bottom")) {
      this.templateManager.addTemplateBottom(this.templateComponent, editor);
    } else if (button.classList.contains("add-button-right")) {
      this.templateManager.addTemplateRight(this.templateComponent, editor);
    }
  }

  editorOnSelected(editor) {
    editor.on("component:selected", (component) =>
      this.handleComponentSelected(component)
    );
    this.editorOnComponentAdd(editor)
  }

  editorOnComponentAdd(editor) {
    editor.on('component:mount', (model) => {
      if (model.get('type') === 'svg') {
        model.set({selectable:false})
      }
      if(model.get('type') === 'tile-wrapper') {
        model.addStyle({'background':'#00000000'})
        // const tileMapper = new TileMapper(model.components().first())
        // tileMapper.setTileAttributes()
      }
    });
  }

  editorOnDragDrop(editor) {
    
    let startDragComponent;
    editor.on("component:drag:start", (model) => {
      startDragComponent =  model.parent;
    });

    editor.on("component:drag:end", (model) => {

      const parentEl = model.parent.getEl();
      if (!parentEl || !parentEl.classList.contains("container-row")) return;

      const tileWrappers = model.parent.components().filter((comp) => {
        const type = comp.get("type");
        return type === "tile-wrapper";
      });
      if (tileWrappers.length > 3) {
        model.target.remove();

        editor.UndoManager.undo();
      }
      this.templateManager.templateUpdate.updateRightButtons(model.parent);
      this.templateManager.templateUpdate.updateRightButtons(startDragComponent);
    });
  }

  handleComponentSelected(component) {
    this.editorManager.selectedTemplateWrapper = component.getEl();
    this.editorManager.selectedComponent = component;

    const sidebarInputTitle = document.getElementById("tile-title");
    if (this.editorManager.selectedTemplateWrapper) {
      const tileLabel =
        this.editorManager.selectedTemplateWrapper.querySelector(".tile-title");
      if (tileLabel) {
        sidebarInputTitle.value = tileLabel.title;
      }

      this.templateManager.removeElementOnClick(
        ".selected-tile-icon",
        ".tile-icon-section"
      );
      this.templateManager.removeElementOnClick(
        ".selected-tile-title",
        ".tile-title-section"
      );
    }

    const page = this.editorManager.getPage(this.editorManager.currentPageId);
    if (page?.PageIsContentPage) {
      this.editorManager.toolsSection.ui.activateCtaBtnStyles(
        this.editorManager.selectedComponent
      );
    }

    this.editorManager.toolsSection.ui.updateTileProperties(
      this.editorManager.selectedComponent,
      page
    );

    this.editorManager.toolsSection.checkTileBgImage();

    this.activateNavigators();

    this.updateUIState();
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
    const page = this.editorManager.getPage(this.editorManager.currentPageId);
    if (page) {
      document.querySelector("#content-page-section").style.display =
        page.PageIsContentPage ? "block" : "none";
      document.querySelector("#menu-page-section").style.display =
        page.PageIsContentPage ? "none" : "block";
    }
  }

  activateNavigators() {
    const leftNavigator = document.querySelector(".page-navigator-left");
    const rightNavigator = document.querySelector(".page-navigator-right");
    const scrollContainer = document.getElementById("child-container");
    const prevButton = document.getElementById("scroll-left");
    const nextButton = document.getElementById("scroll-right");
    const frames = document.querySelectorAll(".mobile-frame");

    leftNavigator.style.display = "flex";
    rightNavigator.style.display = "flex";

    const alignment =
      window.innerWidth <= 1440
        ? frames.length > 1
          ? "flex-start"
          : "center"
        : frames.length > 3
        ? "flex-start"
        : "center";

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
      prevButton.style.display = scrollLeft > 0 ? "flex" : "none";
      nextButton.style.display =
        scrollLeft + clientWidth < scrollWidth ? "flex" : "none";
    };

    updateButtonVisibility();
    scrollContainer.addEventListener("scroll", updateButtonVisibility);

    return { updateButtonVisibility, scrollBy };
  }

  setupUndoRedoButtons() {
    // Assuming you have undo and redo buttons in your UI
    const undoBtn = document.getElementById("undo");
    const redoBtn = document.getElementById("redo");

    if (!this.editorManager.currentEditor) return;

    const undoRedoManager = new UndoRedoManager(
      this.editorManager.currentEditor.editor
    );

    // Update button states
    if (undoBtn) {
      undoBtn.disabled = !undoRedoManager.canUndo();
      undoBtn.onclick = (e) => {
        e.preventDefault();
        undoRedoManager.undo();
      };
    }

    if (redoBtn) {
      redoBtn.disabled = !undoRedoManager.canRedo();
      redoBtn.onclick = () => undoRedoManager.redo();
    }
  }

  // setupAppBarEvents() {
  //   const buttonConfigs = [
  //     { id: "appbar-add-logo", type: "logo" },
  //     { id: "appbar-add-profile", type: "profile-image" },
  //     { id: "appbar-edit-logo", type: "logo" },
  //     { id: "appbar-edit-profile", type: "profile-image" },
  //   ];

  //   const toolboxManager = this.editorManager.toolsSection;

  //   buttonConfigs.forEach(({ id, type }) => {
  //     const element = document.getElementById(id);
  //     if (element) {
  //       element.addEventListener("click", (e) => {
  //         e.preventDefault();
  //         toolboxManager.openFileManager(type);
  //       });
  //     }
  //   });
  // }
}


// Content from classes/TemplateManager.js
class TemplateManager {
  constructor(currentLanguage, editorManager) {
    this.currentLanguage = currentLanguage;
    this.editorManager = editorManager;
    this.defaultConstraints = {
      draggable: false,
      selectable: false,
      editable: false,
      highlightable: false,
      droppable: false,
      hoverable: false,
    };
    this.templateUpdate = new TemplateUpdate(this);
  }

  createTemplateHTML(isDefault = false) {
    let tileBgColor =
      this.editorManager.toolsSection.currentTheme.ThemeColors.accentColor;
    tileBgColor = '#ffffff'
    return `
            <div class="template-wrapper ${
              isDefault ? "default-template" : ""
            }"        
                  data-gjs-selectable="false"
                  data-gjs-type="tile-wrapper"
                  data-gjs-editable="false"
                  data-gjs-highlightable="false"
                  data-gjs-droppable="false"
                  data-gjs-resizable="false"
                  data-gjs-hoverable="false">
              <div class="template-block"
                style="background-color:${tileBgColor}; color:#FFFFFF"
                tile-bgcolor="${tileBgColor}"
                tile-bgcolor-name="accentColor"
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
                      is-hidden = "true"
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
                      is-hidden = "false"
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

  generateTemplateRow(columns, rowIndex) {
    let tileBgColor =
      this.editorManager.toolsSection.currentTheme.ThemeColors.accentColor;
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
                          style="flex: 0 0 ${columnWidth}%); background: ${tileBgColor}; color:#ffffff"
                          data-gjs-type="tile-wrapper"
                          data-gjs-selectable="false"
                          data-gjs-droppable="false">

                          <div class="template-block ${
                            isFirstTileOfFirstRow
                              ? "high-priority-template"
                              : ""
                          }"
                            tile-bgcolor="${tileBgColor}"
                            tile-bgcolor-name="accentColor"
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
                                  is-hidden = "true"
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
                                  is-hidden = "false"
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
                          data-gjs-droppable="[data-gjs-type='tile-wrapper']"
                          data-gjs-hoverable="true">
                        ${wrappers}
                    </div>
              `;
  }

  addFreshTemplate(template) {
    const currentEditor = this.editorManager.currentEditor;

    const page = this.editorManager.getPage(currentEditor.pageId);
    if (
      page &&
      (page.PageIsContentPage ||
        page.PageName === "Location" ||
        page.PageName === "Reception" ||
        page.PageName === "Mailbox" ||
        page.PageName === "Calendar" ||
        page.PageIsDynamicForm)
    ) {
      const message = this.currentLanguage.getTranslation(
        "templates_only_added_to_menu_pages"
      );
      this.editorManager.toolsSection.ui.displayAlertMessage(message, "error");
      return;
    }

    currentEditor.editor.DomComponents.clear();
    let fullTemplate = "";

    template.forEach((columns, rowIndex) => {
      const templateRow = this.generateTemplateRow(columns, rowIndex);
      fullTemplate += templateRow;
    });

    currentEditor.editor.addComponents(`
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
    this.editorManager.toolsSection.ui.displayAlertMessage(message, status);
  }

  deleteTemplate(templateComponent) {
    if (
      !templateComponent ||
      templateComponent.getClasses().includes("default-template")
    )
      return;

    const containerRow = templateComponent.parent();
    if (!containerRow) return;

    const tileComponent = templateComponent.find(".template-block")[0];
    const tileActionActionId =
      tileComponent.getAttributes()?.["tile-action-object-id"];

    if (tileActionActionId) {
      const editors = Object.entries(this.editorManager.editors);

      editors.forEach(([key, element]) => {
        if (element.pageId === tileActionActionId) {
          const frameId = key.replace("#", "");
          this.editorManager.removePageOnTileDelete(frameId);
        }
      });
    }

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

    this.templateUpdate.updateRightButtons(containerRow);
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

    this.templateUpdate.updateRightButtons(containerRow);
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
                data-gjs-droppable="[data-gjs-type='tile-wrapper']"
                data-gjs-hoverable="false">
                ${this.createTemplateHTML()}
            </div>
            `)[0];

    const index = currentRow.index();
    containerColumn.append(newRow, {
      at: index + 1,
    });
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
                    data-gjs-droppable="[data-gjs-type='tile-wrapper']"
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
                            data-gjs-droppable="[data-gjs-type='product-service-description'], [data-gjs-type='product-service-image']"
                            data-gjs-resizable="false"
                            data-gjs-hoverable="false"
                            style="flex: 1; padding: 0"
                            class="content-page-wrapper"
                        >
                            ${
                              contentPageData.ProductServiceImage
                                ? `
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
                            `
                                : ""
                            }
                            ${
                              contentPageData.ProductServiceDescription
                                ? `
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
                            `
                                : ""
                            }
                        </div>
                    </div>
                </div>
                <div class="cta-button-container" ${defaultConstraints}></div>
            </div>
        </div>
    `;
  }

  removeElementOnClick(targetSelector, sectionSelector) {
    const closeSection =
      this.editorManager.selectedComponent?.find(targetSelector)[0];
    if (closeSection) {
      const closeEl = closeSection.getEl();
      const selectedComponent =
              this.editorManager.selectedComponent;
      if (closeEl) {
        closeEl.onclick = () => {
          if (!this.checkIfTileHasTitleOrIcon(selectedComponent)) {
            const message = this.currentLanguage.getTranslation(
              "tile_must_have_title_or_icon"
            );
            this.editorManager.toolsSection.ui.displayAlertMessage(message, "error");
            return;
          }
          if (sectionSelector === ".tile-title-section") {
            const component =
              selectedComponent.find(".tile-title")[0];
            component.components("");
            this.editorManager.toolsSection.setAttributeToSelected(
              "TileText",
              ""
            );
            $("#tile-title").val("");
            component.addStyle({ display: "none" });
            component.addAttributes({"title": ""});
            component.addAttributes({"is-hidden": "true"});
          } else if (sectionSelector === ".tile-icon-section") {
            const component =
              selectedComponent.find(".tile-icon")[0];
            component.components("");
            this.editorManager.toolsSection.setAttributeToSelected(
              "tile-icon",
              ""
            );
            component.addStyle({ display: "none" });
            component.addAttributes({"is-hidden": "true"});
          }
        };
      }
    }
  }

  checkIfTileHasTitleOrIcon(selectedComponent) {
    const isIconHidden = selectedComponent.find(".tile-icon")[0]?.getAttributes()?.["is-hidden"] === "false";
    const isTitleHidden = selectedComponent.find(".tile-title")[0]?.getAttributes()?.["is-hidden"] === "false";
    
    // Return true if both elements are hidden
    return isIconHidden && isTitleHidden;
  }

}


// Content from classes/TemplateUpdate.js
class TemplateUpdate {
  constructor(templateManager) {
    this.templateManager = templateManager;
  }

  updateRightButtons(containerRow) {
    if (!containerRow) return;

    const templates = containerRow.components();
    if (!templates.length) return;

    const count = templates.length;
    const styleConfig = this.getStyleConfig(count);
    if (!styleConfig) return;

    const screenWidth = window.innerWidth;
    const isTemplateOne = count === 1;

    this.updateTitleElements(containerRow, count, screenWidth, styleConfig);
    this.updateTemplateElements(
      containerRow,
      templates,
      count,
      screenWidth,
      isTemplateOne,
      styleConfig
    );
  }

  getStyleConfig(count) {
    const styleConfigs = {
      1: {
        title: { "letter-spacing": "1.1px", "font-size": "16px" },
        template: { "justify-content": "start", "align-items": "start" },
        rightButton: { display: "flex" },
        titleSection: { "text-align": "left" },
        attributes: { "tile-align": "left"}
      },
      2: {
        title: { "letter-spacing": "0.9px", "font-size": "14px" },
        template: { "justify-content": "start", "align-items": "start" },
        rightButton: { display: "flex" },
        titleSection: { "text-align": "left" },
        attributes: { "tile-align": "left"}
      },
      3: {
        title: { "letter-spacing": "0.9px", "font-size": "12px" },
        template: { "justify-content": "center", "align-items": "center" },
        rightButton: { display: "none" },
        titleSection: { "text-align": "center" },
        attributes: { "tile-align": "center"}
      },
    };

    return styleConfigs[count] || null;
  }

  updateTitleElements(containerRow, count, screenWidth, styleConfig) {
    // Update titles
    const titles = containerRow.find(".tile-title");
    titles.forEach((title) => {
      title.parent().addStyle({
        ...styleConfig.title,
        textAlign: count === 3 ? "center" : "left",
      });
      let tileTitle =
        title.getEl().getAttribute("title") || title.getEl().innerText;

      if (count === 3) {
        // Format title for three templates
        let words = tileTitle.split(" ");
        if (words.length > 2) {
          tileTitle = words.slice(0, 2).join(" ");
        }

        if (tileTitle.length > 13) {
          tileTitle = tileTitle.substring(0, 13).trim() + "..";
        }

        let truncatedWords = tileTitle.split(" ");
        if (truncatedWords.length > 1) {
          tileTitle =
            truncatedWords.slice(0, 1).join(" ") + "<br>" + truncatedWords[1];
        }

        title.parent().addStyle({ textAlign: "center" });
      } else {
        tileTitle = tileTitle.replace("<br>", "");

        // Handle title length based on template count and screen width
        if (count === 2) {
          if (tileTitle.length > (screenWidth <= 1440 ? 11 : 13)) {
            tileTitle =
              tileTitle.substring(0, screenWidth <= 1440 ? 11 : 13).trim() +
              "...";
          }
        }

        if (count === 1) {
          if (tileTitle.length > (screenWidth <= 1440 ? 20 : 24)) {
            tileTitle =
              tileTitle.substring(0, screenWidth <= 1440 ? 20 : 24).trim() +
              "...";
          }
        }
      }

      title.components(tileTitle);
    });

    // Update title sections
    const titleSections = containerRow.find(".tile-title-section");
    if (titleSections.length) {
      titleSections.forEach((section) =>
        section.addStyle(styleConfig.titleSection)
      );
    }
  }

  updateTemplateElements(
    containerRow,
    templates,
    count,
    screenWidth,
    isTemplateOne,
    styleConfig
  ) {
    // Update template blocks
    const templateBlocks = containerRow.find(".template-block");
    templateBlocks.forEach((template) => {
      const isPriority = template
        .getClasses()
        ?.includes("high-priority-template");

      const templateHeight =
        screenWidth <= 1440
          ? isPriority && isTemplateOne
            ? "6.0rem"
            : "4.5em"
          : isPriority && isTemplateOne
          ? "7rem"
          : "5.5rem";

      const templateStyles = {
        ...styleConfig.template,
        height: templateHeight,
        "text-transform":
          isPriority && isTemplateOne ? "uppercase" : "capitalize",
      };

      template.addStyle(templateStyles);
      template.addAttributes(styleConfig.attributes);
    });

    // Update right buttons and template attributes
    templates.forEach((template) => {
      if (!template?.view?.el) return;

      const rightButton = template.find(".add-button-right")[0];
      if (rightButton) rightButton.addStyle(styleConfig.rightButton);
    });
  }
}


// Content from classes/ToolboxManager.js
class ToolBoxManager {
  constructor(
    editorManager,
    dataManager,
    themes,
    icons,
    templates,
    mapping,
    media,
    locale,
    newServiceEvent
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
    this.currentLanguage = locale;
    this.ui = new ToolBoxUI(this);
    this.init(locale.currentLanguage);
    this.newServiceEvent = newServiceEvent;
  }

  async init(language) {
    try {
      this.currentLanguage = await new Locale(language).init();
      this.themeManager = new ThemeManager(this);
      this.eventListenerManager = new EventListenerManager(this);
      this.popupManager = new PopupManager(this);
      this.pageManager = new PageManager(this);

      await this.initializeManagers();
      await this.setupComponents();
      this.setupEventListeners();
    } catch (error) {
      console.error("Failed to initialize toolbox:", error);
    }
  }

  async initializeManagers() {
    await this.dataManager.getPages().then((res) => {
      if (this.checkIfNotAuthenticated(res)) {
        return;
      }
      localStorage.clear();
    });

    this.themeManager.loadTheme();
    // this.themeManager.listThemesInSelectField();
    this.themeManager.colorPalette();
    this.themeManager.ctaColorPalette();
    this.pageManager.loadPageTemplates();
  }

  setupComponents() {
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
  }

  setupEventListeners() {
    this.eventListenerManager.setupTabListeners();
    this.eventListenerManager.setupMappingListeners();
    this.eventListenerManager.setupPublishListeners();
    this.eventListenerManager.setupAlignmentListeners();
    this.eventListenerManager.setupOpacityListener();
    this.eventListenerManager.setupAutoSave();

    const sidebarInputTitle = document.getElementById("tile-title");
    sidebarInputTitle.addEventListener("input", (e) => {
      let inputValue = e.target.value;

      if (inputValue.length > 30) {
        inputValue = truncateText(inputValue, 35);
        e.target.value = inputValue; 
      }

      if (inputValue.trim() === "") {
        const titleComponent =
        this.editorManager.selectedComponent.find(".tile-title")[0];
        if (titleComponent) {
          titleComponent.getEl().innerHTML = "";
        }
      }

      this.ui.updateTileTitle(inputValue);
    });
  }

  publishPages(isNotifyResidents) {
    const editors = Object.values(this.editorManager.editors);
    if (editors && editors.length) {
      const pageDataList = this.preparePageDataList(editors);

      if (pageDataList.length) {
        this.sendPageUpdateRequest(pageDataList, isNotifyResidents);
      }
    }
  }

  preparePageDataList(editors) {
    let skipPages = ["Mailbox", "Calendar", "My Activity"];
    return this.dataManager.pages.SDT_PageCollection.filter(
      (page) => !skipPages.includes(page.PageName)
    ).map((page) => {
      let projectData;
      try {
        projectData = JSON.parse(page.PageGJSJson);
      } catch (error) {
        projectData = {};
      }
      const jsonData = page.PageIsContentPage
        ? mapContentToPageData(projectData, page)
        : mapTemplateToPageData(projectData, page);
      return {
        PageId: page.PageId,
        PageName: page.PageName,
        PageJsonContent: JSON.stringify(jsonData),
        PageGJSHtml: page.PageGJSHtml,
        PageGJSJson: page.PageGJSJson,
        SDT_Page: jsonData,
        PageIsPublished: true,
      };
    });
  }

  async sendPageUpdateRequest(pageDataList, isNotifyResidents) {
    const payload = {
      IsNotifyResidents: isNotifyResidents,
      PagesList: pageDataList,
    };

    try {
      const res = await this.dataManager.updatePagesBatch(payload);
      if (this.checkIfNotAuthenticated(res)) {
        return;
      }
      this.ui.displayAlertMessage("All Pages Saved Successfully", "success");
    } catch (error) {
      console.error("Error saving pages:", error);
      this.ui.displayAlertMessage(
        "An error occurred while saving pages.",
        "error"
      );
    }
  }

  autoSavePage(editorData) {
    const pageId = editorData.pageId;
    const editor = editorData.editor;
    const page = this.dataManager.pages.SDT_PageCollection.find(
      (page) => page.PageId == pageId
    );

    if (pageId) {
      const data = {
        PageId: pageId,
        PageName: page.PageName,
        PageGJSHtml: editor.getHtml(),
        PageGJSJson: JSON.stringify(editor.getProjectData()),
      };

      this.dataManager.updatePage(data).then((res) => {
        if (this.checkIfNotAuthenticated(res)) {
          return;
        }

        this.dataManager.getPages().then((pages) => {
          this.editorManager.pages = pages.SDT_PageCollection;
        });

        this.ui.openToastMessage();
      });
    }
  }

  unDoReDo(editorInstance) {
    const um = editorInstance.UndoManager;

    const undoButton = document.getElementById("undo");
    const redoButton = document.getElementById("redo");
    // Update button states
    if (undoButton) {
      undoButton.disabled = !um.hasUndo();
      undoButton.onclick = (e) => {
        e.preventDefault();
        um.undo();
        this.editorManager.currentEditor.editor.refresh();
      };
    }

    if (redoButton) {
      redoButton.disabled = !um.hasRedo();
      redoButton.onclick = (e) => {
        e.preventDefault();
        um.redo();
        this.editorManager.currentEditor.editor.refresh();
      };
    }
  }

  checkIfNotAuthenticated(res) {
    if (res.error.Status === "Error") {
      this.ui.displayAlertMessage(
        this.currentLanguage.getTranslation("not_authenticated_message"),
        "error"
      );

      return true;
    }
    return false;
  }

  setAttributeToSelected(attributeName, attributeValue) {
    if (this.editorManager.selectedComponent) {
      this.editorManager.selectedComponent.addAttributes({
        [attributeName]: attributeValue,
      });
    } else {
      this.ui.displayAlertMessage(
        this.currentLanguage.getTranslation("no_tile_selected_error_message"),
        "error"
      );
    }
  }

  checkTileBgImage() {
    if (this.editorManager.selectedTemplateWrapper) {
      const templateBlock = this.editorManager.selectedComponent;

      if (templateBlock) {
        const tileImgContainer = document.getElementById("tile-img-container");
        // first check if templateBlock has a background image
        if (templateBlock.getStyle()["background-image"]) {
          const currentBgImage = templateBlock
            .getStyle()
            ["background-image"].match(/url\((.*?)\)/)[1];

          if (currentBgImage) {
            if (tileImgContainer) {
              const tileImg = tileImgContainer.querySelector("img");
              if (tileImg) {
                tileImg.src = currentBgImage;
                tileImgContainer.style.display = "block";

                const tileBtn = tileImgContainer.querySelector("button");
                if (tileBtn) {
                  tileBtn.onclick = (e) => {
                    e.preventDefault();
                    const currentStyles = templateBlock.getStyle() || {};
                    delete currentStyles["background-image"];
                    templateBlock.setStyle(currentStyles);
                    tileImgContainer.style.display = "none";
                    this.setAttributeToSelected("tile-bg-image-url", "");
                  };
                }
              }
            }
          }
        } else {
          tileImgContainer.style.display = "none";
        }
      }
    }
  }

  setServiceToSelectedTile(serviceId) {
    const categoryName = "Service/Product Page";
    this.dataManager.getServices().then((services) => {
      const service = services.find(
        (service) => service.ProductServiceId == serviceId
      );

      if (service) {
        this.editorManager.selectedComponent.addAttributes({
          "tile-action-object-id": service.ProductServiceId,
          "tile-action-object": `${categoryName}, ${service.ProductServiceName}`,
        });

        this.setAttributeToSelected("tile-action-object-id", serviceId);

        this.setAttributeToSelected(
          "tile-action-object",
          `${categoryName}, ${service.ProductServiceName}`
        );

        const editor = this.editorManager.getCurrentEditor();
        const editorId = editor.getConfig().container;
        const editorContainerId = `${editorId}-frame`;
        this.actionList.createContentPage(
          service.ProductServiceId,
          editorContainerId
        );
      }
    });
  }

  openFileManager(type) {
    const fileInputField = this.mediaComponent.createFileInputField();
    const modal = this.mediaComponent.openFileUploadModal();

    let allUploadedFiles = [];

    const isTile = false;

    this.mediaComponent.handleModalOpen(
      modal,
      fileInputField,
      allUploadedFiles,
      isTile,
      type
    );
  }
}


// Content from classes/EventListenerManager.js
class EventListenerManager {
  constructor(toolBoxManager) {
    this.toolBoxManager = toolBoxManager;
  }

  setupTabListeners() {
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
  }

  setupMappingListeners() {
    const mappingButton = document.getElementById("open-mapping");
    const publishButton = document.getElementById("publish");
    const mappingSection = document.getElementById("mapping-section");
    const toolsSection = document.getElementById("tools-section");

    this.toolBoxManager.mappingComponent = new MappingComponent(
      this.toolBoxManager.dataManager,
      this.toolBoxManager.editorManager,
      this.toolBoxManager,
      this.toolBoxManager.currentLanguage
    );

    mappingButton.addEventListener("click", (e) => {
      e.preventDefault();

      toolsSection.style.display =
        toolsSection.style.display === "none" ? "block" : "none";

      mappingSection.style.display =
        mappingSection.style.display === "block" ? "none" : "block";

      this.toolBoxManager.mappingComponent.init();
    });
  }

  setupPublishListeners() {
    const publishButton = document.getElementById("publish");

    publishButton.onclick = (e) => {
      e.preventDefault();
      const popup = document.createElement("div");
      popup.className = "popup-modal";
      popup.innerHTML = `
                <div class="popup">
                  <div class="popup-header">
                    <span>${this.toolBoxManager.currentLanguage.getTranslation(
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
                  ${this.toolBoxManager.currentLanguage.getTranslation(
                    "publish_confirm_message"
                  )}
                    <label for="notify_residents" class="notify_residents">
                        <input type="checkbox" id="notify_residents" name="notify_residents">
                        <span>${this.toolBoxManager.currentLanguage.getTranslation(
                          "nofity_residents_on_publish"
                        )}</span>
                    </label>
                  </div>
                  <div class="popup-footer">
                    <button id="yes_publish" class="tb-btn tb-btn-primary">
                    ${this.toolBoxManager.currentLanguage.getTranslation(
                      "publish_confirm_button"
                    )}
                    </button>
                    <button id="close_popup" class="tb-btn tb-btn-outline">
                    ${this.toolBoxManager.currentLanguage.getTranslation(
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
        this.toolBoxManager.publishPages(isNotifyResidents);
        popup.remove();
      });

      closeButton.addEventListener("click", () => {
        popup.remove();
      });

      closePopup.addEventListener("click", () => {
        popup.remove();
      });
    };
  }

  setupAlignmentListeners() {
    const leftAlign = document.getElementById("tile-left");
    const centerAlign = document.getElementById("tile-center");

    leftAlign.addEventListener("click", () => {
      if (this.toolBoxManager.editorManager.selectedTemplateWrapper) {
        const templateBlock =
          this.toolBoxManager.editorManager.selectedComponent;

        if (templateBlock) {
          templateBlock.addStyle({
            "align-items": "start",
            "justify-content": "start",
          });
          this.toolBoxManager.setAttributeToSelected("tile-align", "left");
        }
      } else {
        const message = this.toolBoxManager.currentLanguage.getTranslation(
          "no_tile_selected_error_message"
        );
        this.toolBoxManager.ui.displayAlertMessage(message, "error");
      }
    });

    centerAlign.addEventListener("click", () => {
      if (this.toolBoxManager.editorManager.selectedTemplateWrapper) {
        const templateBlock =
          this.toolBoxManager.editorManager.selectedComponent;
        if (templateBlock) {
          templateBlock.addStyle({
            "align-items": "center",
            "justify-content": "center",
          });

          this.toolBoxManager.setAttributeToSelected(
            "tile-align",
            "center"
          );
        }
      } else {
        const message = this.toolBoxManager.currentLanguage.getTranslation(
          "no_tile_selected_error_message"
        );
        this.toolBoxManager.ui.displayAlertMessage(message, "error");
      }
    });

    // const iconLeftAlign = document.getElementById("icon-align-left");
    // const iconRightAlign = document.getElementById("icon-align-right");

    // iconLeftAlign.addEventListener("click", () => {
    //   if (this.toolBoxManager.editorManager.selectedTemplateWrapper) {
    //     const templateBlock =
    //       this.toolBoxManager.editorManager.selectedComponent.find(
    //         ".tile-icon-section"
    //       )[0];
    //     if (templateBlock) {
    //       templateBlock.setStyle({
    //         display: "flex",
    //         "align-self": "start",
    //       });
    //       this.toolBoxManager.setAttributeToSelected("tile-icon-align", "left");
    //     }
    //   } else {
    //     const message = this.toolBoxManager.currentLanguage.getTranslation(
    //       "no_tile_selected_error_message"
    //     );
    //     this.toolBoxManager.ui.displayAlertMessage(message, "error");
    //   }
    // });


    // iconRightAlign.addEventListener("click", () => {
    //   if (this.toolBoxManager.editorManager.selectedTemplateWrapper) {
    //     const templateBlock =
    //       this.toolBoxManager.editorManager.selectedComponent.find(
    //         ".tile-icon-section"
    //       )[0];

    //     if (templateBlock) {
    //       templateBlock.setStyle({
    //         display: "flex",
    //         "align-self": "end",
    //       });
    //       this.toolBoxManager.setAttributeToSelected(
    //         "tile-icon-align",
    //         "right"
    //       );
    //     } else {
    //     }
    //   } else {
    //     const message = this.toolBoxManager.currentLanguage.getTranslation(
    //       "no_tile_selected_error_message"
    //     );
    //     this.toolBoxManager.ui.displayAlertMessage(message, "error");
    //   }
    // });
  }

  setupOpacityListener() {
    const imageOpacity = document.getElementById("bg-opacity");

    imageOpacity.addEventListener("input", (event) => {
      const value = event.target.value;

      if (this.toolBoxManager.editorManager.selectedTemplateWrapper) {
        const templateBlock =
          this.toolBoxManager.editorManager.selectedComponent;

        if (templateBlock) {
          const currentBgStyle = templateBlock.getStyle()["background-color"];
          let currentBgColor;
          
          if (currentBgStyle.length > 7) {
            currentBgColor = currentBgStyle.substring(0, 7);
          } else {
            currentBgColor = currentBgStyle;
          }

          const bgColor = addOpacityToHex(currentBgColor, value)

          templateBlock.addStyle({
            "background-color": bgColor,
          });

          templateBlock.addAttributes({
            "tile-bg-image-opacity": value,
          })

          templateBlock.addAttributes({
            "tile-bgcolor": bgColor,
          })
        }
      }
    });
  }

  setupAutoSave() {
    setInterval(() => {
      const editors = Object.values(this.toolBoxManager.editorManager.editors);

      if (!this.toolBoxManager.previousStates) {
        this.toolBoxManager.previousStates = new Map();
      }
      if (editors && editors.length) {
        for (let index = 0; index < editors.length; index++) {
          const editorData = editors[index];
          const editor = editorData.editor;
          const pageId = editorData.pageId;

          if (!this.toolBoxManager.previousStates.has(pageId)) {
            this.toolBoxManager.previousStates.set(pageId, editor.getHtml());
          }

          const currentState = editor.getHtml();

          if (currentState !== this.toolBoxManager.previousStates.get(pageId)) {
            this.toolBoxManager.autoSavePage(editorData);

            this.toolBoxManager.previousStates.set(pageId, currentState);
          }
        }
      }
    }, 10000);
  }
}


// Content from classes/PageManager.js
class PageManager {
    constructor(toolBoxManager) {
      this.toolBoxManager = toolBoxManager;
    }
  
    loadPageTemplates() {
      const pageTemplates = document.getElementById("page-templates");
      this.toolBoxManager.templates.forEach((template, index) => {
        const blockElement = document.createElement("div");
  
        blockElement.className = "page-template-wrapper";
        // Create the number element
        const numberElement = document.createElement("div");
        numberElement.className = "page-template-block-number";
        numberElement.textContent = index + 1; // Set the number
        const templateBlock = document.createElement("div");
        templateBlock.className = "page-template-block";
        templateBlock.title = this.toolBoxManager.currentLanguage.getTranslation(
          "click_to_load_template"
        ); //
        templateBlock.innerHTML = `<div>${template.media}</div>`;
  
        blockElement.addEventListener("click", () => {
          const popup = this.toolBoxManager.popupManager.popupModal();
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
            this.toolBoxManager.editorManager.templateManager.addFreshTemplate(
              template.content
            );
          };
        });
  
        // Append number and template block to the wrapper
        blockElement.appendChild(numberElement);
        blockElement.appendChild(templateBlock);
        pageTemplates.appendChild(blockElement);
      });
    }
  }


// Content from classes/PopupManager.js
class PopupManager {
    constructor(toolBoxManager) {
      this.toolBoxManager = toolBoxManager;
    }
  
    popupModal() {
      const popup = document.createElement("div");
      popup.className = "popup-modal";
      popup.innerHTML = `
            <div class="popup">
              <div class="popup-header">
                <span>${this.toolBoxManager.currentLanguage.getTranslation(
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
                ${this.toolBoxManager.currentLanguage.getTranslation(
                  "confirmation_modal_message"
                )}
              </div>
              <div class="popup-footer">
                <button id="accept_popup" class="tb-btn tb-btn-primary">
                ${this.toolBoxManager.currentLanguage.getTranslation(
                  "accept_popup"
                )}
                </button>
                <button id="close_popup" class="tb-btn tb-btn-outline">
                ${this.toolBoxManager.currentLanguage.getTranslation(
                  "cancel_btn"
                )}
                </button>
              </div>
            </div>
          `;
  
      return popup;
    }
  }

// Content from classes/ThemeManager.js
class ThemeManager {
  constructor(toolBoxManager) {
    this.toolBoxManager = toolBoxManager;
  }

  loadTheme() {
    this.toolBoxManager.dataManager.getLocationTheme().then((theme) => {
      this.toolBoxManager.themeManager.setTheme(
        theme.SDT_LocationTheme.ThemeName
      );
    });
  }

  setTheme(themeName) {
    const theme = this.toolBoxManager.themes.find(
      (theme) => theme.ThemeName === themeName
    );

    const select = document.querySelector(".tb-custom-theme-selection");
    select.querySelector(".selected-theme-value").textContent = themeName;

    if (!theme) {
      return false;
    }

    this.toolBoxManager.currentTheme = theme;

    this.applyTheme();

    this.toolBoxManager.icons = theme.ThemeIcons.map((icon) => {
      return {
        name: icon.IconName,
        svg: icon.IconSVG,
        category: icon.IconCategory,
      };
    });
    this.loadThemeIcons(theme.ThemeIcons);

    this.themeColorPalette(this.toolBoxManager.currentTheme.ThemeColors);
    localStorage.setItem("selectedTheme", themeName);

    const page = this.toolBoxManager.editorManager.getPage(
      this.toolBoxManager.editorManager.currentPageId
    );
    this.toolBoxManager.ui.updateTileProperties(
      this.toolBoxManager.editorManager.selectedComponent,
      page
    );

    this.applyThemeIconsAndColor(themeName);
    // this.updatePageTitleFontFamily(theme.fontFamily)

    this.listThemesInSelectField();
    return true;
  }

  applyTheme() {
    const iframes = document.querySelectorAll(".mobile-frame iframe");

    if (!iframes.length) return;

    iframes.forEach((iframe) => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

      this.updateRootStyle(
        iframeDoc,
        "primary-color",
        this.toolBoxManager.currentTheme.ThemeColors.primaryColor
      );
      this.updateRootStyle(
        iframeDoc,
        "secondary-color",
        this.toolBoxManager.currentTheme.ThemeColors.secondaryColor
      );
      this.updateRootStyle(
        iframeDoc,
        "background-color",
        this.toolBoxManager.currentTheme.ThemeColors.backgroundColor
      );
      this.updateRootStyle(
        iframeDoc,
        "text-color",
        this.toolBoxManager.currentTheme.ThemeColors.textColor
      );
      this.updateRootStyle(
        iframeDoc,
        "button-bg-color",
        this.toolBoxManager.currentTheme.ThemeColors.buttonBgColor
      );
      this.updateRootStyle(
        iframeDoc,
        "button-text-color",
        this.toolBoxManager.currentTheme.ThemeColors.buttonTextColor
      );
      this.updateRootStyle(
        iframeDoc,
        "card-bg-color",
        this.toolBoxManager.currentTheme.ThemeColors.cardBgColor
      );
      this.updateRootStyle(
        iframeDoc,
        "card-text-color",
        this.toolBoxManager.currentTheme.ThemeColors.cardTextColor
      );
      this.updateRootStyle(
        iframeDoc,
        "accent-color",
        this.toolBoxManager.currentTheme.ThemeColors.accentColor
      );
      this.updateRootStyle(
        iframeDoc,
        "font-family",
        this.toolBoxManager.currentTheme.ThemeFontFamily
      );

      this.updatePageTitleFontFamily(
        this.toolBoxManager.currentTheme.ThemeFontFamily
      );
    });
  }

  updateRootStyle(iframeDoc, property, value) {
    const styleTag = iframeDoc.body.querySelector("style");

    if (styleTag) {
      let styleContent = styleTag.innerHTML;

      // Regular expression to find and update the variable
      const regex = new RegExp(`(--${property}:\\s*)([^;]+)(;)`);

      if (regex.test(styleContent)) {
        // Update the existing property
        styleContent = styleContent.replace(regex, `$1${value}$3`);
      } else {
        // If the property does not exist, add it inside :root
        styleContent = styleContent.replace(
          /:root\s*{/,
          `:root {\n  --${property}: ${value};`
        );
      }

      styleTag.innerHTML = styleContent;
    } else {
      console.log("No style tag found");
    }
  }

  applyThemeIconsAndColor(themeName) {
    const editors = Object.values(this.toolBoxManager.editorManager.editors);

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

          const theme = this.toolBoxManager.themes.find(
            (theme) => theme.ThemeName === themeName
          );
          const tiles = wrapper.find(".template-block");

          tiles.forEach((tile) => {
            if (!tile) return;
            // icons change and its color
            const tileIconName = tile.getAttributes()?.["tile-icon"];
            if (tileIconName) {
              const matchingIcon = theme.ThemeIcons?.find(
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
            if (currentTileBgColorName && theme.ThemeColors) {
              const matchingColorCode =
                theme.ThemeColors[currentTileBgColorName];

              if (matchingColorCode) {
                tile.addAttributes({
                  "tile-bgcolor-name": currentTileBgColorName,
                  "tile-bgcolor": matchingColorCode,
                });

                const currentTileOpacity =
                  tile.getAttributes()?.["tile-bg-image-opacity"];

                tile.addStyle({
                  "background-color": addOpacityToHex(
                    matchingColorCode,
                    currentTileOpacity
                  ),
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
          this.toolBoxManager.currentTheme.ThemeFontFamily
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
        if (this.toolBoxManager.editorManager.selectedComponent) {
          const selectedComponent =
            this.toolBoxManager.editorManager.selectedComponent;
          const currentColor =
            selectedComponent.getAttributes()?.["tile-bgcolor"];
          const currentTileOpacity =
            selectedComponent.getAttributes()?.["tile-bg-image-opacity"];

          if (currentColor === colorValue) {
            selectedComponent.addStyle({
              "background-color": "transparent",
            });

            this.toolBoxManager.setAttributeToSelected("tile-bgcolor", null);
            this.toolBoxManager.setAttributeToSelected(
              "tile-bgcolor-name",
              null
            );

            radioInput.checked = false;
            alignItem.style.border = "none";
          } else {
            selectedComponent.addStyle({
              "background-color": addOpacityToHex(
                colorValue,
                currentTileOpacity
              ),
            });

            this.toolBoxManager.setAttributeToSelected(
              "tile-bgcolor",
              colorValue
            );

            this.toolBoxManager.setAttributeToSelected(
              "tile-bgcolor-name",
              colorName
            );
            alignItem.removeAttribute("style");
          }
        } else {
          const message = this.toolBoxManager.currentLanguage.getTranslation(
            "no_tile_selected_error_message"
          );
          this.toolBoxManager.ui.displayAlertMessage(message, "error");
        }
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
        const selectedComponent =
          this.toolBoxManager.editorManager.selectedComponent;
        if (selectedComponent) {
          selectedComponent.addStyle({
            color: colorValue,
          });
          this.toolBoxManager.setAttributeToSelected(
            "tile-text-color",
            colorValue
          );

          const svgIcon = selectedComponent.find(".tile-icon path")[0];
          if (svgIcon) {
            svgIcon.removeAttributes("fill");
            svgIcon.addAttributes({
              fill: colorValue,
            });
            this.toolBoxManager.setAttributeToSelected(
              "tile-icon-color",
              colorValue
            );
          } 
        } else {
          const message = this.toolBoxManager.currentLanguage.getTranslation(
            "no_tile_selected_error_message"
          );
          this.toolBoxManager.ui.displayAlertMessage(message, "error");
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
        if (this.toolBoxManager.editorManager.selectedComponent) {
          const selectedComponent =
            this.toolBoxManager.editorManager.selectedComponent;

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
          this.toolBoxManager.setAttributeToSelected(
            "cta-background-color",
            colorValue
          );
        }
      };
    });
  }

  listThemesInSelectField() {
    const select = document.querySelector(".tb-custom-theme-selection");
    const button = select.querySelector(".theme-select-button");
    const selectedValue = button.querySelector(".selected-theme-value");

    // Remove existing options list if it exists
    let existingOptionsList = select.querySelector(".theme-options-list");
    if (existingOptionsList) {
      existingOptionsList.remove();
    }

    // Create new options list
    const optionsList = document.createElement("div");
    optionsList.classList.add("theme-options-list");
    optionsList.setAttribute("role", "listbox");

    // Append new options list to the select container
    select.appendChild(optionsList);

    // Toggle dropdown visibility
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const isOpen = optionsList.classList.contains("show");
      optionsList.classList.toggle("show");
      button.classList.toggle("open");
      button.setAttribute("aria-expanded", !isOpen);
    });

    document.addEventListener("click", (e) => {
      if (!select.contains(e.target)) {
        optionsList.classList.remove("show");
        button.classList.remove("open");
        button.setAttribute("aria-expanded", "false");
      }
    });

    // Populate themes into the dropdown
    this.toolBoxManager.themes.forEach((theme) => {
      const option = document.createElement("div");
      option.classList.add("theme-option");
      option.setAttribute("role", "option");
      option.setAttribute("data-value", theme.ThemeName);
      option.textContent = theme.ThemeName;

      if (
        this.toolBoxManager.currentTheme &&
        theme.ThemeName === this.toolBoxManager.currentTheme.ThemeName
      ) {
        option.classList.add("selected");
        selectedValue.textContent = theme.ThemeName;
      }

      option.addEventListener("click", () => {
        selectedValue.textContent = theme.ThemeName;

        // Remove 'selected' class from all options and apply to clicked one
        optionsList
          .querySelectorAll(".theme-option")
          .forEach((opt) => opt.classList.remove("selected"));
        option.classList.add("selected");

        // Close dropdown
        optionsList.classList.remove("show");
        button.classList.remove("open");
        button.setAttribute("aria-expanded", "false");

        // Update theme selection
        this.toolBoxManager.dataManager.selectedTheme =
          this.toolBoxManager.themes.find(
            (t) => t.ThemeName === theme.ThemeName
          );

        this.toolBoxManager.dataManager.updateLocationTheme().then((res) => {
          if (this.toolBoxManager.checkIfNotAuthenticated(res)) return;

          if (this.setTheme(theme.ThemeName)) {
            this.themeColorPalette(
              this.toolBoxManager.currentTheme.ThemeColors
            );
            localStorage.setItem("selectedTheme", theme.ThemeName);
            this.toolBoxManager.editorManager.theme = theme;

            this.updatePageTitleFontFamily(theme.ThemeFontFamily);

            const message = this.toolBoxManager.currentLanguage.getTranslation(
              "theme_applied_success_message"
            );
            this.toolBoxManager.ui.displayAlertMessage(message, "success");
          } else {
            const message = this.toolBoxManager.currentLanguage.getTranslation(
              "error_applying_theme_message"
            );
            this.toolBoxManager.ui.displayAlertMessage(message, "error");
          }
        });
      });

      // Append option to options list
      optionsList.appendChild(option);
    });
  }

  closeDropdowns() {
    const dropdowns = document.querySelectorAll(".tb-custom-theme-selection");

    dropdowns.forEach((dropdown) => {
      const button = dropdown.querySelector(".theme-select-button");
      const optionsList = dropdown.querySelector(".theme-options-list");

      if (optionsList.classList.contains("show")) {
        optionsList.classList.remove("show");
        button.classList.remove("open");
        button.setAttribute("aria-expanded", "false");
      }
    });
  }

  updatePageTitleFontFamily(fontFamily) {
    const appBars = document.querySelectorAll(".app-bar");
    appBars.forEach((appBar) => {
      const h1 = appBar.querySelector("h1");
      h1.style.fontFamily = fontFamily;
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
          const maxChars = 5;
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

        // iconItem.innerHTML = `
        //             ${icon.IconSVG}
        //             <span class="icon-title">${displayName}</span>
        //         `;

        iconItem.innerHTML = `${icon.IconSVG}`;

        iconItem.onclick = () => {
          if (this.toolBoxManager.editorManager.selectedTemplateWrapper) {
            const iconComponent =
              this.toolBoxManager.editorManager.selectedComponent.find(
                ".tile-icon"
              )[0];

            if (iconComponent) {
              const iconSvgComponent = icon.IconSVG;
              const whiteIconSvg = iconSvgComponent.replace(
                'fill="#7c8791"',
                'fill="white"'
              );
              iconComponent.addStyle({ display: "block" });
              iconComponent.addAttributes({ "is-hidden": "false" });
              iconComponent.components(whiteIconSvg);
              this.toolBoxManager.setAttributeToSelected(
                "tile-icon",
                icon.IconName
              );

              this.toolBoxManager.setAttributeToSelected(
                "tile-icon",
                icon.IconName
              );

              this.toolBoxManager.setAttributeToSelected(
                "tile-icon-color",
                "#ffffff"
              );
            }
          } else {
            const message = this.toolBoxManager.currentLanguage.getTranslation(
              "no_tile_selected_error_message"
            );
            const status = "error";
            this.toolBoxManager.ui.displayAlertMessage(message, status);
          }
        };

        themeIcons.appendChild(iconItem);
      });
    };

    renderIcons();
  }
}


// Content from classes/ToolBoxUI.js
class ToolBoxUI {
  constructor(toolBoxManager) {
    this.manager = toolBoxManager;
    this.currentLanguage = toolBoxManager.currentLanguage;
  }

  updateTileTitle(inputTitle) {
    if (this.manager.editorManager.selectedTemplateWrapper) {
      const titleComponent =
        this.manager.editorManager.selectedComponent.find(".tile-title")[0];
      if (titleComponent) {
        titleComponent.addAttributes({ title: inputTitle });
        // titleComponent.components(inputTitle);
        titleComponent.addStyle({ display: "block" });
        this.manager.editorManager.editorEventManager.editorOnUpdate(
          this.manager.editorManager.getCurrentEditor()
        );
      }
    }
  }

  displayAlertMessage(message, status) {
    const alertContainer = document.getElementById("tb-alerts-container");
    const alertId = Math.random().toString(10);
    const alertBox = this.alertMessage(message, status, alertId);
    alertBox.style.display = "flex";

    const closeButton = alertBox.querySelector(".tb-alert-close-btn");
    closeButton.addEventListener("click", () => {
      this.closeAlert(alertId);
    });

    setTimeout(() => this.closeAlert(alertId), 5000);
    alertContainer.appendChild(alertBox);
  }

  alertMessage(message, status, alertId) {
    const alertBox = document.createElement("div");
    alertBox.id = alertId;
    alertBox.classList = `tb-alert ${
      status == "success" ? "success" : "error"
    }`;
    alertBox.innerHTML = `
        <div class="tb-alert-header">
          <strong>
            ${
              status == "success"
                ? this.currentLanguage.getTranslation("alert_type_success")
                : this.currentLanguage.getTranslation("alert_type_error")
            }
          </strong>
          <span class="tb-alert-close-btn">✖</span>
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

  updateTileProperties(selectComponent, page) {
    if (page && page.PageIsContentPage) {
      this.updateContentPageProperties(selectComponent);
    } else {
      this.updateTemplatePageProperties(selectComponent);
    }
  }

  updateContentPageProperties(selectComponent) {
    const currentCtaBgColor =
      selectComponent?.getAttributes()?.["cta-background-color"];
    const CtaRadios = document.querySelectorAll(
      '#cta-color-palette input[type="radio"]'
    );

    if (currentCtaBgColor) {
      CtaRadios.forEach((radio) => {
        const colorBox = radio.nextElementSibling;
        radio.checked =
          colorBox.getAttribute("data-cta-color").toUpperCase() ===
          currentCtaBgColor.toUpperCase();
      });
    }
  }

  updateTemplatePageProperties(selectComponent) {
    this.updateTileOpacityProperties(selectComponent);
    this.updateAlignmentProperties(selectComponent);
    this.updateColorProperties(selectComponent);
    this.updateActionProperties(selectComponent);
  }

  updateTileOpacityProperties(selectComponent) {
    const tileOpacity =
      selectComponent?.getAttributes()?.["tile-bg-image-opacity"];

    if (tileOpacity) {
      document.getElementById("bg-opacity").value = tileOpacity;
      document.getElementById("valueDisplay").textContent = tileOpacity + " %";
    }
  }

  updateAlignmentProperties(selectComponent) {
    const alignmentTypes = [
      { type: "text", attribute: "tile-text-align" },
      { type: "icon", attribute: "tile-icon-align" },
    ];

    alignmentTypes.forEach(({ type, attribute }) => {
      const currentAlign = selectComponent?.getAttributes()?.[attribute];
      ["left", "center", "right"].forEach((align) => {
        document.getElementById(`${type}-align-${align}`).checked =
          currentAlign === align;
      });
    });
  }

  updateColorProperties(selectComponent) {
    const currentTextColor =
      selectComponent?.getAttributes()?.["tile-text-color"];
    const textColorRadios = document.querySelectorAll(
      '.text-color-palette.text-colors .color-item input[type="radio"]'
    );
    textColorRadios.forEach((radio) => {
      const colorBox = radio.nextElementSibling;
      radio.checked =
        colorBox.getAttribute("data-tile-text-color") === currentTextColor;
    });

    // Update icon color
    const currentIconColor =
      selectComponent?.getAttributes()?.["tile-icon-color"];
    const iconColorRadios = document.querySelectorAll(
      '.text-color-palette.icon-colors .color-item input[type="radio"]'
    );
    iconColorRadios.forEach((radio) => {
      const colorBox = radio.nextElementSibling;
      radio.checked =
        colorBox.getAttribute("data-tile-icon-color") === currentIconColor;
    });

    // Update background color
    const currentBgColor = selectComponent?.getAttributes()?.["tile-bgcolor"];
    const radios = document.querySelectorAll(
      '#theme-color-palette input[type="radio"]'
    );
    radios.forEach((radio) => {
      const colorBox = radio.nextElementSibling;
      radio.checked =
        colorBox.getAttribute("data-tile-bgcolor") === currentBgColor;
    });

    // opacity
    const currentTileOpacity =
      selectComponent?.getAttributes()?.["tile-bg-image-opacity"];

    const imageOpacity = document.getElementById("bg-opacity");
    imageOpacity.value = currentTileOpacity;
  }

  updateActionProperties(selectComponent) {
    const currentActionName =
      selectComponent?.getAttributes()?.["tile-action-object"];
    const currentActionId =
      selectComponent?.getAttributes()?.["tile-action-object-id"];

    const propertySection = document.getElementById("selectedOption");
    const selectedOptionElement = document.getElementById(currentActionId);

    const allOptions = document.querySelectorAll(".category-content li");
    allOptions.forEach((option) => {
      option.style.background = "";
    });
    propertySection.innerHTML = `<span id="sidebar_select_action_label">
                  ${this.currentLanguage.getTranslation(
                    "sidebar_select_action_label"
                  )}
                  </span>
                  <i class="fa fa-angle-down">
                  </i>`;
    const targetPage = this.manager.dataManager.pages.SDT_PageCollection.find((page) => page.PageId == currentActionId)
    if (currentActionName && currentActionId && targetPage) {
      propertySection.textContent = currentActionName;
      propertySection.innerHTML += ' <i class="fa fa-angle-down"></i>';
      if (selectedOptionElement) {
        selectedOptionElement.style.background = "#f0f0f0";
      }
    }
  }

  pageContentCtas(callToActions, editorInstance) {
    if (callToActions == null || callToActions.length <= 0) {
      this.noCtaSection();
    } else {
      const contentPageCtas = document.getElementById("call-to-actions");
      document.getElementById("cta-style").style.display = "flex";
      document.getElementById("no-cta-message").style.display = "none";

      this.renderCtas(callToActions, editorInstance, contentPageCtas);
      this.setupButtonLayoutListeners(editorInstance);
      this.setupBadgeClickListener(editorInstance);
    }
  }

  renderCtas(callToActions, editorInstance, contentPageCtas) {
    contentPageCtas.innerHTML = "";
    callToActions.forEach((cta) => {
      const ctaItem = this.createCtaItem(cta);
      this.attachClickHandler(ctaItem, cta, editorInstance);
      contentPageCtas.appendChild(ctaItem);
    });
  }

  createCtaItem(cta) {
    const ctaItem = document.createElement("div");
    ctaItem.classList.add("call-to-action-item");
    ctaItem.title = cta.CallToActionName;
    ctaItem.id = cta.CallToActionId;
    ctaItem.setAttribute("data-cta-id", cta.CallToActionId);

    const ctaType = this.getCtaType(cta.CallToActionType);
    ctaItem.innerHTML = `<i class="${ctaType.icon}"></i>`;

    return ctaItem;
  }

  getCtaType(type) {
    const ctaTypeMap = {
      Phone: {
        icon: "fas fa-phone-alt",
        iconList: ".fas.fa-phone-alt",
        iconBgColor: "#4c9155",
      },
      Email: {
        icon: "fas fa-envelope",
        iconList: ".fas.fa-envelope",
        iconBgColor: "#eea622",
      },
      SiteUrl: {
        icon: "fas fa-link",
        iconList: ".fas.fa-link",
        iconBgColor: "#ff6c37",
      },
      Form: {
        icon: "fas fa-file",
        iconList: ".fas.fa-file",
        iconBgColor: "#5068a8",
      },
    };

    return (
      ctaTypeMap[type] || {
        icon: "fas fa-question",
        iconList: ".fas.fa-question",
        iconBgColor: "#5068a8",
      }
    );
  }

  generateCtaComponent(cta, backgroundColor) {
    const ctaType = this.getCtaType(cta.CallToActionType);
    const windowWidth = window.innerWidth;
    return `
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
          cta-background-color="${ctaType.iconBgColor}"
          style="margin-right: ${windowWidth <= 1440 ? "0.5rem" : "1.1rem"}"
          >
            <div class="cta-button" ${defaultConstraints} style="background-color: ${
      backgroundColor || ctaType.iconBgColor
    };">
              <i class="${ctaType.icon}" ${defaultConstraints}></i>
              <div class="cta-badge" ${defaultConstraints}><i class="fa fa-minus" ${defaultConstraints}></i></div>
            </div>
            <div class="cta-label" ${defaultConstraints}>${
      cta.CallToActionName
    }</div>
      </div>
    `;
  }

  handleExistingButton(existingButton, cta, selectedComponent, editorInstance) {
    const existingBackgroundColor =
      existingButton.getAttributes()["cta-background-color"];
    const updatedCtaComponent = this.generateCtaComponent(
      cta,
      existingBackgroundColor
    );

    if (
      selectedComponent.getAttributes()["cta-button-id"] === cta.CallToActionId
    ) {
      editorInstance.once("component:add", (component) => {
        const addedComponent = editorInstance
          .getWrapper()
          .find(`#id-${cta.CallToActionId}`)[0];
        if (addedComponent) {
          editorInstance.select(addedComponent);
        }
      });
      selectedComponent.replaceWith(updatedCtaComponent);
    }
  }

  attachClickHandler(ctaItem, cta, editorInstance) {
    ctaItem.onclick = (e) => {
      e.preventDefault();
      const ctaButton = editorInstance
        .getWrapper()
        .find(".cta-button-container")[0];

      if (!ctaButton) {
        console.error("CTA Button container not found.");
        return;
      }

      const selectedComponent = this.manager.editorManager.selectedComponent;
      // if (!selectedComponent) {
      //   console.error("No selected component found.");
      //   return;
      // }

      const existingButton = ctaButton.find(`#id-${cta.CallToActionId}`)?.[0];

      if (existingButton) {
        this.handleExistingButton(
          existingButton,
          cta,
          selectedComponent,
          editorInstance
        );
        return;
      }

      ctaButton.append(this.generateCtaComponent(cta));
    };
  }

  setupButtonLayoutListeners(editorInstance) {
    this.setupPlainButtonListener(editorInstance);
    this.setupImageButtonListener(editorInstance);
  }

  // Helper method to check if component is a valid CTA
  isValidCtaComponent(attributes) {
    return (
      attributes.hasOwnProperty("cta-button-label") &&
      attributes.hasOwnProperty("cta-button-type") &&
      attributes.hasOwnProperty("cta-button-action")
    );
  }

  // Extract CTA attributes from component
  extractCtaAttributes(component) {
    const attributes = component.getAttributes();
    return {
      ctaId: attributes["cta-button-id"],
      ctaName: attributes["cta-button-label"],
      ctaType: attributes["cta-button-type"],
      ctaAction: attributes["cta-button-action"],
      ctaButtonBgColor: attributes["cta-background-color"],
    };
  }

  // Get icon based on CTA type
  getCtaTypeIcon(ctaType) {
    const iconMap = {
      Phone: "fas fa-phone-alt",
      Email: "fas fa-envelope",
      SiteUrl: "fas fa-link",
      Form: "fas fa-file",
    };
    return iconMap[ctaType] || "fas fa-question";
  }

  // Generate common button attributes
  getCommonButtonAttributes(ctaAttributes) {
    const { ctaId, ctaName, ctaType, ctaAction, ctaButtonBgColor } =
      ctaAttributes;
    return `
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
    `;
  }

  // Generate plain button component
  generatePlainButtonComponent(ctaAttributes) {
    const { ctaName, ctaButtonBgColor } = ctaAttributes;
    return `
      <div class="plain-button-container" ${this.getCommonButtonAttributes(
        ctaAttributes
      )}>
        <button style="background-color: ${ctaButtonBgColor}; border-color: ${ctaButtonBgColor};" 
                class="plain-button" ${defaultConstraints}>
          <div class="cta-badge" ${defaultConstraints}>
            <i class="fa fa-minus" ${defaultConstraints}></i>
          </div>
          ${ctaName}
        </button>
      </div>
    `;
  }

  // Generate image button component
  generateImageButtonComponent(ctaAttributes) {
    const { ctaName, ctaButtonBgColor, ctaType } = ctaAttributes;
    const icon = this.getCtaTypeIcon(ctaType);
    return `
      <div class="img-button-container" ${this.getCommonButtonAttributes(
        ctaAttributes
      )}>
        <div style="background-color: ${ctaButtonBgColor}; border-color: ${ctaButtonBgColor};" 
             class="img-button" ${defaultConstraints}>
          <i class="${icon} img-button-icon" ${defaultConstraints}></i>
          <div class="cta-badge" ${defaultConstraints}>
            <i class="fa fa-minus" ${defaultConstraints}></i>
          </div>
          <span class="img-button-label" ${defaultConstraints}>${ctaName}</span>
          <i class="fa fa-angle-right img-button-arrow" ${defaultConstraints}></i>
        </div>
      </div>
    `;
  }

  // Handle component replacement
  handleComponentReplacement(editorInstance, ctaId, newComponent) {
    editorInstance.once("component:add", () => {
      const addedComponent = editorInstance
        .getWrapper()
        .find(`#id-${ctaId}`)[0];
      if (addedComponent) {
        editorInstance.select(addedComponent);
      }
    });
    this.manager.editorManager.selectedComponent.replaceWith(newComponent);
  }

  // Handle button click
  handleButtonClick(editorInstance, generateComponent) {
    const ctaContainer = editorInstance
      .getWrapper()
      .find(".cta-button-container")[0];
    if (!ctaContainer) return;

    const selectedComponent = this.manager.editorManager.selectedComponent;
    if (!selectedComponent) return;

    const attributes = selectedComponent.getAttributes();
    if (!this.isValidCtaComponent(attributes)) {
      const message = this.currentLanguage.getTranslation(
        "please_select_cta_button"
      );
      this.displayAlertMessage(message, "error");
      return;
    }

    const ctaAttributes = this.extractCtaAttributes(selectedComponent);
    const newComponent = generateComponent(ctaAttributes);
    this.handleComponentReplacement(
      editorInstance,
      ctaAttributes.ctaId,
      newComponent
    );
  }

  // Setup plain button listener
  setupPlainButtonListener(editorInstance) {
    const plainButton = document.getElementById("plain-button-layout");
    plainButton.onclick = (e) => {
      e.preventDefault();
      this.handleButtonClick(editorInstance, (attrs) =>
        this.generatePlainButtonComponent(attrs)
      );
    };
  }

  // Setup image button listener
  setupImageButtonListener(editorInstance) {
    const imgButton = document.getElementById("img-button-layout");
    imgButton.onclick = (e) => {
      e.preventDefault();
      this.handleButtonClick(editorInstance, (attrs) =>
        this.generateImageButtonComponent(attrs)
      );
    };
  }

  setupBadgeClickListener(editorInstance) {
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
      const isCtaButtonSelected = selectedCtaComponent.findType("cta-buttons");
      if (isCtaButtonSelected) {
        document.querySelector(".cta-button-layout-container").style.display =
          "flex";
      }
    }
  }

  noCtaSection() {
    const contentPageSection = document.getElementById("cta-style");
    if (contentPageSection) {
      contentPageSection.style.display = "none";
      document.getElementById("call-to-actions").innerHTML = "";
      const noCtaDisplayMessage = document.getElementById("no-cta-message");
      if (noCtaDisplayMessage) {
        noCtaDisplayMessage.style.display = "block";
      }

      document.querySelector(".cta-button-layout-container").style.display =
        "none";
    }
  }
}


// Content from classes/UndoRedoManager.js
class UndoRedoManager {
    constructor(editor) {
        this.editor = editor;
        this.undoStack = [];
        this.redoStack = [];
        this.currentState = null;
        
        // Capture initial state
        this.captureState();
        
        // Bind event listeners
        this.bindEditorEvents();
    }

    bindEditorEvents() {
        // Capture state on significant changes
        this.editor.on('component:add', () => this.captureState());
        this.editor.on('component:remove', () => this.captureState());
        this.editor.on('component:update', () => this.captureState());
        this.editor.on('style:update', () => this.captureState());
    }

    captureState() {
        // Get current project data
        const currentState = this.editor.getProjectData();

        // Prevent duplicate state captures
        if (this.areStatesEqual(currentState, this.currentState)) return;

        // Clear redo stack when a new action is performed
        this.redoStack = [];

        // Add to undo stack
        this.undoStack.push(currentState);
        
        // Limit undo stack size
        if (this.undoStack.length > 50) {
            this.undoStack.shift();
        }

        // Update current state
        this.currentState = currentState;
    }

    undo() {
        if (this.undoStack.length <= 1) return;

        // Remove current state
        const currentState = this.undoStack.pop();
        
        // Add to redo stack
        this.redoStack.push(currentState);

        // Restore previous state
        const previousState = this.undoStack[this.undoStack.length - 1];
        this.restoreState(previousState);
    }

    redo() {
        if (this.redoStack.length === 0) return;

        // Get state from redo stack
        const stateToRedo = this.redoStack.pop();
        
        // Add to undo stack
        this.undoStack.push(stateToRedo);

        // Restore redo state
        this.restoreState(stateToRedo);
    }

    restoreState(state) {
        // Clear existing components
        this.editor.DomComponents.clear();
        
        // Load project data
        this.editor.loadProjectData(state);
        
        // Update current state
        this.currentState = state;
    }

    areStatesEqual(state1, state2) {
        if (state1 === state2) return true;
        if (!state1 || !state2) return false;
    
        // Recursive deep equality check
        const deepEqual = (obj1, obj2) => {
            // Check for strict equality first
            if (obj1 === obj2) return true;
    
            // Check types and handle null/undefined
            if (obj1 === null || obj2 === null || 
                typeof obj1 !== typeof obj2) {
                return false;
            }
    
            // Handle arrays
            if (Array.isArray(obj1) && Array.isArray(obj2)) {
                if (obj1.length !== obj2.length) return false;
                return obj1.every((item, index) => deepEqual(item, obj2[index]));
            }
    
            // Handle objects
            if (typeof obj1 === 'object') {
                const keys1 = Object.keys(obj1);
                const keys2 = Object.keys(obj2);
    
                if (keys1.length !== keys2.length) return false;
    
                return keys1.every(key => 
                    keys2.includes(key) && deepEqual(obj1[key], obj2[key])
                );
            }
    
            // For primitive values
            return obj1 === obj2;
        };
    
        return deepEqual(state1, state2);
    }
    

    canUndo() {
        // Can undo if more than one state in stack
        return this.undoStack.length > 1;
    }

    canRedo() {
        // Can redo if redo stack is not empty
        return this.redoStack.length > 0;
    }
}

// Content from components/ActionListComponent.js
class ActionListComponent {
  constructor(editorManager, dataManager, currentLanguage, toolBoxManager) {
    this.editorManager = editorManager;
    this.dataManager = dataManager;
    this.currentLanguage = currentLanguage;
    this.toolBoxManager = toolBoxManager;
    this.selectedObject = null;
    this.selectedId = null;
    this.pageOptions = [];
    this.added = false;
    this.formErrors = 0;

    this.categoryData = [
      {
        name: "Page",
        displayName: "Page",
        label: this.currentLanguage.getTranslation("category_page"),
        options: [],
        canAdd: true,
        addAction: () => this.showModal(this.createNewPageModal()),
      },
      {
        name: "Service/Product Page",
        displayName: "Service Page",
        label: this.currentLanguage.getTranslation("category_services_or_page"),
        options: [],
        canAdd: true,
        addAction: () => this.toolBoxManager.newServiceEvent(),
      },
      {
        name: "Dynamic Forms",
        displayName: "Dynamic Forms",
        label: this.currentLanguage.getTranslation("category_dynamic_form"),
        options: [],
      },
      {
        name: "Predefined Page",
        displayName: "Module",
        label: this.currentLanguage.getTranslation("category_predefined_page"),
        options: [],
      },
      {
        name: "Web Link",
        displayName: "Web Link",
        label: this.currentLanguage.getTranslation("category_link"),
        options: [],
        isWebLink: true,
        addAction: () =>
          this.showModal(this.createWebLinkModal("Add Web Link")),
      },
    ];

    this.init();
  }

  async init() {
    try {
      await this.dataManager.getPages();
      await this.populateCategories();
      this.populateDropdownMenu();
    } catch (error) {
      console.error("Error initializing ActionListComponent:", error);
    }
  }

  async populateCategories() {
    try {
      this.pageOptions = this.filterPages(
        (page) =>
          !page.PageIsContentPage &&
          !page.PageIsPredefined &&
          !page.PageIsDynamicForm &&
          !page.PageIsWebLinkPage
      );

      this.predefinedPageOptions = this.filterPages(
        (page) => page.PageIsPredefined && page.PageName != "Home"
      );

      this.servicePageOptions = (this.dataManager.services || []).map(
        (service) => ({
          PageId: service.ProductServiceId,
          PageName: service.ProductServiceName,
          PageTileName:
            service.ProductServiceTileName || service.ProductServiceName,
        })
      );

      this.dynamicForms = (this.dataManager.forms || []).map((form) => ({
        PageId: form.FormId,
        PageName: form.ReferenceName,
        PageTileName: form.ReferenceName,
        FormUrl: form.FormUrl,
      }));

      const categoryMap = {
        Page: this.pageOptions,
        "Service/Product Page": this.servicePageOptions,
        "Dynamic Forms": this.dynamicForms,
        "Predefined Page": this.predefinedPageOptions,
      };

      this.categoryData.forEach((category) => {
        category.options = categoryMap[category.name] || [];
      });
    } catch (error) {
      console.error("Error populating categories:", error);
    }
  }

  filterPages(filterFn) {
    if (!this.dataManager.pages?.SDT_PageCollection) {
      console.warn("Page collection is not available");
      return [];
    }
    return this.dataManager.pages.SDT_PageCollection.filter((page) => {
      if (page) {
        page.PageTileName = page.PageName;
        return filterFn(page);
      }
      return false;
    });
  }

  createWebLinkModal(title) {
    return this.createModal(title, true);
  }

  createNewPageModal() {
    return this.createModal("Create new page", false);
  }

  createModal(title, isWebLink = false) {
    const selectedTile = this.editorManager.getCurrentEditor().getSelected();
    let label = selectedTile.getAttributes()?.["tile-action-object"];
    label = label.replace("Web Link, ", "");

    const url = selectedTile.getAttributes()?.["tile-action-object-url"];

    const fields = isWebLink
      ? [
          {
            id: "link_url",
            label: "Link Url",
            placeholder: "https://www.example.com",
            value: isWebLink ? url || "" : "",
          },
          {
            id: "link_label",
            label: "Link Label",
            placeholder: "Open Website",
            value: isWebLink ? (url !== undefined ? label : "") : "", // Fixed here
          },
        ]
      : [
          {
            id: "page_title",
            label: "Page Title",
            placeholder: "New page title",
            value: "",
          },
        ];

    const popup = document.createElement("div");
    popup.className = "popup-modal-link";
    popup.innerHTML = `
      <div class="popup">
        <div class="popup-header">
          <span>${title}</span>
          <button class="close">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 21 21">
              <path id="Icon_material-close" data-name="Icon material-close" d="M28.5,9.615,26.385,7.5,18,15.885,9.615,7.5,7.5,9.615,15.885,18,7.5,26.385,9.615,28.5,18,20.115,26.385,28.5,28.5,26.385,20.115,18Z" transform="translate(-7.5 -7.5)" fill="#6a747f" opacity="0.54"/>
            </svg>
          </button>
        </div>
        <hr>
        <div class="popup-body" id="confirmation_modal_message">
          ${fields
            .map(
              (field) => `
            <div class="form-field"style="${
              field !== fields[0] ? "margin-top: 10px" : ""
            }">
              <label for="${field.id}">${field.label}</label>
              <input required class="tb-form-control" type="text" id="${
                field.id
              }" placeholder="${field.placeholder}" value="${field.value}"/>
              <span class="error-message" style="color: red; font-size: 12px; display: none; margin-top: 5px; font-weight: 300">Error message</span>
            </div>
          `
            )
            .join("")}
        </div>
        <div class="popup-footer">
          <button id="submit_link" submit class="tb-btn tb-btn-primary">Save</button>
          <button id="close_web_url_popup" class="tb-btn tb-btn-outline">Cancel</button>
        </div>
      </div>
    `;

    return popup;
  }

  showModal(popup) {
    try {
      document.body.appendChild(popup);
      popup.style.display = "flex";

      const closeButton = popup.querySelector("#close_web_url_popup");
      const closeX = popup.querySelector(".close");
      const saveButton = popup.querySelector("#submit_link");

      const removePopup = (e) => {
        e.preventDefault();
        e.stopPropagation();
        popup.remove();
      };

      closeButton?.addEventListener("click", removePopup);
      closeX?.addEventListener("click", removePopup);
      saveButton?.addEventListener("click", () => this.handleModalSave(popup));
    } catch (error) {
      console.error("Error showing modal:", error);
    }
  }

  handleModalSave(popup) {
    try {
      // Run validation first
      if (!this.validateModalForm()) {
        return; // Stop if validation fails
      }

      const isWebLink = popup.querySelector("#link_url") !== null;
      const dropdownHeader = document.getElementById("selectedOption");
      const dropdownMenu = document.getElementById("dropdownMenu");

      if (isWebLink) {
        const linkUrl = document.getElementById("link_url")?.value.trim();
        const linkLabel = document.getElementById("link_label")?.value.trim();

        this.createWebLinkPage(linkUrl, linkLabel);
      } else {
        const pageTitle = document.getElementById("page_title")?.value.trim();
        this.updateSelectedComponent(pageTitle);
      }

      // If dropdown elements exist, update UI
      if (dropdownHeader && dropdownMenu) {
        dropdownHeader.innerHTML += ' <i class="fa fa-angle-down"></i>';
        dropdownMenu.style.display = "none";
      }

      // Close the popup after successful save
      popup.remove();
    } catch (error) {
      console.error("Error handling modal save:", error);
    }
  }

  validateModalForm() {
    this.formErrors = 0; // Reset error count

    document
      .querySelectorAll(".popup-body .tb-form-control")
      .forEach((field) => {
        const errorField = field.nextElementSibling;
        errorField.style.display = "none"; // Hide previous error messages
        errorField.textContent = "";

        // Check for required fields
        if (field.value.trim() === "") {
          errorField.textContent = "This field is required";
          errorField.style.display = "block";
          this.formErrors++;
        }

        // Validate Link URL
        if (field.id === "link_url" && field.value.trim() !== "") {
          const urlPattern = /^https:\/\/.+/; // Must start with https://
          if (!urlPattern.test(field.value.trim())) {
            errorField.textContent = "Enter a valid URL starting with https://";
            errorField.style.display = "block";
            this.formErrors++;
          }
        }

        // Validate Page Title
        if (field.id === "page_title" && field.value.trim() === "") {
          errorField.textContent = "Enter a valid page title";
          errorField.style.display = "block";
          this.formErrors++;
        }

        if (field.id === "page_title" && field.value.length < 3) {
          errorField.textContent = "Page title must be at least 3 characters long";
          errorField.style.display = "block";
          this.formErrors++;
        }
      });

    return this.formErrors === 0;
  }

  async createWebLinkPage(linkUrl, linkLabel) {
    const editor = this.editorManager.getCurrentEditor();
    try {
      const res = await this.dataManager.getPages();
      if (this.toolBoxManager.checkIfNotAuthenticated(res)) {
        return;
      }
      if (editor.getSelected()) {
        const titleComponent = editor.getSelected().find(".tile-title")[0];

        // const tileTitle = truncateText(linkLabel, 12);
        const tileTitle = linkLabel;

        const page = res.SDT_PageCollection.find(
          (page) => page.PageName === "Web Link"
        );
        if (!page) {
          console.warn("Web Link page not found");
          return;
        }

        const editorId = editor.getConfig().container;
        const editorContainerId = `${editorId}-frame`;

        this.toolBoxManager.setAttributeToSelected(
          "tile-action-object-id",
          `${page.PageId}`
        );

        this.toolBoxManager.setAttributeToSelected(
          "tile-action-object-url",
          linkUrl
        );

        this.toolBoxManager.setAttributeToSelected(
          "tile-action-object",
          `Web Link, ${linkLabel}`
        );

        $(editorContainerId).nextAll().remove();
        this.editorManager.createChildEditor(page, linkUrl, linkLabel);

        if (titleComponent) {
          titleComponent.addAttributes({ title: linkLabel });
          titleComponent.components(tileTitle);
          titleComponent.addStyle({ display: "block" });

          const sidebarInputTitle = document.getElementById("tile-title");
          if (sidebarInputTitle) {
            sidebarInputTitle.value = tileTitle;
            sidebarInputTitle.title = tileTitle;
          }
        }
      }
    } catch (error) {
      console.error("Error creating web link page:", error);
    }
  }

  async updateSelectedComponent(title, url = null) {
    try {
      const editor = this.editorManager.getCurrentEditor();
      const selected = editor.getSelected();
      if (!selected) return;

      const titleComponent = selected.find(".tile-title")[0];
      // const tileTitle = this.truncateText(title, 12);
      const tileTitle = title;
      const editorId = editor.getConfig().container;
      const editorContainerId = `${editorId}-frame`;
      await this.dataManager
        .createNewPage(title, this.toolBoxManager.currentTheme)
        .then((res) => {
          if (this.toolBoxManager.checkIfNotAuthenticated(res)) {
            return;
          }

          const result = JSON.parse(res.result);
          const pageId = result.Trn_PageId;
          const pageName = result.Trn_PageName;

          this.dataManager.getPages().then((res) => {
            this.toolBoxManager.actionList.init();

            this.toolBoxManager.setAttributeToSelected(
              "tile-action-object-id",
              pageId
            );

            this.toolBoxManager.setAttributeToSelected(
              "tile-action-object",
              `Page, ${pageName}`
            );

            $(editorContainerId).nextAll().remove();
            this.editorManager.createChildEditor(
              this.editorManager.getPage(pageId)
            );

            // this.toolBoxManager.ui.displayMessage(
            //   `${this.currentLanguage.getTranslation("page_created")}`,
            //   "success"
            // );
          });
        });

      if (titleComponent) {
        titleComponent.addAttributes({ title: title });
        titleComponent.components(tileTitle);
        titleComponent.addStyle({ display: "block" });

        const sidebarInputTitle = document.getElementById("tile-title");
        if (sidebarInputTitle) {
          sidebarInputTitle.value = tileTitle;
          sidebarInputTitle.title = tileTitle;
        }
      }
      // dropdownHeader.innerHTML += ' <i class="fa fa-angle-down"></i>';
      // dropdownMenu.style.display = "none";
    } catch (error) {
      console.error("Error updating selected component:", error);
    }
  }

  truncateText(text, maxLength) {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength - 3) + "..."
      : text;
  }

  populateDropdownMenu() {
    try {
      const dropdownMenu = document.getElementById("dropdownMenu");
      if (!dropdownMenu) return;

      dropdownMenu.innerHTML = "";
      this.categoryData.forEach((category) => {
        const categoryElement = this.createCategoryElement(category);
        dropdownMenu.appendChild(categoryElement);
      });

      this.setupEventListeners();
    } catch (error) {
      console.error("Error populating dropdown menu:", error);
    }
  }

  createCategoryElement(category) {
    const categoryElement = document.createElement("details");
    categoryElement.classList.add("category");
    categoryElement.setAttribute("data-category", category.label);

    const summaryElement = document.createElement("summary");
    summaryElement.innerHTML = `${category.displayName}${
      category.isWebLink ? "" : ' <i class="fa fa-angle-right"></i>'
    }`;
    categoryElement.appendChild(summaryElement);

    if (!category.isWebLink) {
      this.appendSearchBox(categoryElement, category);
      this.appendCategoryContent(categoryElement, category);
    } else {
      categoryElement.addEventListener("click", (e) => {
        e.preventDefault();
        category.addAction();
      });
    }

    return categoryElement;
  }

  appendSearchBox(categoryElement, category) {
    const searchBox = document.createElement("div");
    searchBox.classList.add("search-container");
    searchBox.innerHTML = `
      <i class="fas fa-search search-icon"></i>
      <input type="text" placeholder="Search" class="search-input" />
    `;

    if (category.canAdd) {
      const addButton = document.createElement("button");
      addButton.innerHTML = '<i class="fa fa-plus"></i>';
      addButton.title = `Add New ${category.name}`;
      addButton.classList.add("add-new-service");
      addButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        category.addAction();
      });
      searchBox.appendChild(addButton);
    }

    categoryElement.appendChild(searchBox);
  }

  appendCategoryContent(categoryElement, category) {
    const categoryContent = document.createElement("ul");
    categoryContent.classList.add("category-content");

    category.options.forEach((option) => {
      if (!option) return;

      const optionElement = document.createElement("li");
      optionElement.textContent = option.PageName;
      optionElement.id = option.PageId;

      if (category.name === "Dynamic Forms") {
        optionElement.dataset.objectUrl = option.FormUrl;
      }

      optionElement.dataset.category = category.name;
      optionElement.dataset.tileName = option.PageTileName;
      categoryContent.appendChild(optionElement);
    });

    const noRecordsMessage = document.createElement("li");
    noRecordsMessage.textContent = "No records found";
    noRecordsMessage.classList.add("no-records-message");
    noRecordsMessage.style.display = "none";
    categoryContent.appendChild(noRecordsMessage);

    categoryElement.appendChild(categoryContent);
  }

  setupEventListeners() {
    this.setupDropdownHeader();
    this.setupOutsideClickListener();
    this.setupCategoryToggle();
    this.setupItemClickListener();
    this.setupSearchInputListener();
  }

  setupDropdownHeader() {
    const dropdownHeader = document.getElementById("selectedOption");
    const dropdownMenu = document.getElementById("dropdownMenu");

    if (!dropdownHeader || !dropdownMenu) return;

    if (!this.added) {
      dropdownHeader.addEventListener("click", () => {
        this.init();
        dropdownMenu.style.display =
          dropdownMenu.style.display === "block" ? "none" : "block";
        const icon = dropdownHeader.querySelector("i");
        if (icon) {
          icon.classList.toggle("fa-angle-up");
          icon.classList.toggle("fa-angle-down");
        }
      });
    }

    this.added = true;
  }

  setupOutsideClickListener() {
    const dropdownHeader = document.getElementById("selectedOption");
    const dropdownMenu = document.getElementById("dropdownMenu");

    if (!dropdownHeader || !dropdownMenu) return;

    document.addEventListener("click", (event) => {
      if (
        !dropdownHeader.contains(event.target) &&
        !dropdownMenu.contains(event.target)
      ) {
        dropdownMenu.style.display = "none";
        const icon = dropdownHeader.querySelector("i");
        if (icon) {
          icon.classList.remove("fa-angle-up");
          icon.classList.add("fa-angle-down");
        }
        document.querySelectorAll(".category").forEach((details) => {
          details.open = false;
        });
      }
    });
  }

  setupCategoryToggle() {
    document.querySelectorAll(".category").forEach((category) => {
      if (
        category.dataset.category !==
        this.currentLanguage.getTranslation("category_link")
      ) {
        category.addEventListener("toggle", () => {
          this.selectedObject = category.dataset.category;
          const searchBox = category.querySelector(".search-container");
          const icon = category.querySelector("summary i");
          const isOpen = category.open;

          document.querySelectorAll(".category").forEach((otherCategory) => {
            if (otherCategory !== category) {
              otherCategory.open = false;
              const otherSearchBox =
                otherCategory.querySelector(".search-container");
              if (otherSearchBox) {
                otherSearchBox.style.display = "none";
              }
              const otherIcon = otherCategory.querySelector("summary i");
              if (otherIcon) {
                otherIcon.classList.replace("fa-angle-down", "fa-angle-right");
              }
            }
          });

          if (searchBox && icon) {
            searchBox.style.display = isOpen ? "flex" : "none";
            icon.classList.replace(
              isOpen ? "fa-angle-right" : "fa-angle-down",
              isOpen ? "fa-angle-down" : "fa-angle-right"
            );
          }
        });
      }
    });
  }

  setupItemClickListener() {
    try {
      const dropdownHeader = document.getElementById("selectedOption");
      const dropdownMenu = document.getElementById("dropdownMenu");

      if (!dropdownHeader || !dropdownMenu) return;

      document.querySelectorAll(".category-content li").forEach((item) => {
        if (item.classList.contains("no-records-message")) return;

        item.addEventListener("click", async () => {
          try {
            const category = item.dataset.category;
            const categoryElement = item.closest(".category");

            if (!category || !categoryElement) return;

            this.selectedObject = category;
            dropdownHeader.textContent = `${categoryElement.dataset.category}, ${item.textContent}`;

            const editor = this.editorManager.getCurrentEditor();
            if (!editor) return;

            const editorId = editor.getConfig().container;
            const editorContainerId = `${editorId}-frame`;
            const selected = editor.getSelected();

            if (selected && editorContainerId) {
              await this.handleItemSelection(item, category, editorContainerId);
            }

            dropdownHeader.innerHTML += ' <i class="fa fa-angle-down"></i>';
            dropdownMenu.style.display = "none";
          } catch (error) {
            console.error("Error in item click handler:", error);
          }
        });
      });
    } catch (error) {
      console.error("Error setting up item click listener:", error);
    }
  }

  async handleItemSelection(item, category, editorContainerId) {
    try {
      const selected = this.editorManager.getCurrentEditor().getSelected();
      const titleComponent = selected.find(".tile-title")[0];
      // const tileTitle = this.truncateText(item.dataset.tileName, 12);
      const tileTitle = item.dataset.tileName;

      if (selected) {
        this.toolBoxManager.setAttributeToSelected(
          "tile-action-object-id",
          item.id
        );

        if (item.dataset.objectUrl) {
          this.toolBoxManager.setAttributeToSelected(
            "tile-action-object-url",
            item.dataset.objectUrl
          );
        }

        this.toolBoxManager.setAttributeToSelected(
          "tile-action-object",
          `${category}, ${item.textContent}`
        );

        await this.handlePageCreation(
          category,
          item.id,
          editorContainerId,
          item.textContent
        );
      }

      if (titleComponent) {
        titleComponent.addAttributes({ title: item.dataset.tileName });
        titleComponent.components(tileTitle);
        titleComponent.addStyle({ display: "block" });

        const sidebarInputTitle = document.getElementById("tile-title");
        if (sidebarInputTitle) {
          sidebarInputTitle.value = tileTitle;
          sidebarInputTitle.title = tileTitle;
        }
      }
    } catch (error) {
      console.error("Error handling item selection:", error);
    }
  }

  async handlePageCreation(category, itemId, editorContainerId, itemText) {
    try {
      $(editorContainerId).nextAll().remove();
      switch (category) {
        case "Service/Product Page":
          await this.createContentPage(itemId, editorContainerId);
          break;
        case "Dynamic Forms":
          await this.createDynamicFormPage(itemId, itemText, editorContainerId);
          break;
        default:
          this.editorManager.createChildEditor(
            this.editorManager.getPage(itemId)
          );
      }
    } catch (error) {
      console.error("Error handling page creation:", error);
    }
  }

  async createContentPage(pageId, editorContainerId) {
    try {
      const res = await this.dataManager.createContentPage(pageId);
      if (this.toolBoxManager.checkIfNotAuthenticated(res)) {
        return;
      }

      await this.dataManager.getPages();
      $(editorContainerId).nextAll().remove();
      this.editorManager.createChildEditor(this.editorManager.getPage(pageId));
    } catch (error) {
      console.error("Error creating content page:", error);
    }
  }

  async createDynamicFormPage(formId, formName, editorContainerId) {
    try {
      const res = await this.dataManager.createDynamicFormPage(
        formId,
        formName
      );
      if (this.toolBoxManager.checkIfNotAuthenticated(res)) {
        return;
      }

      await this.dataManager.getPages();
      $(editorContainerId).nextAll().remove();
      this.editorManager.createChildEditor(this.editorManager.getPage(formId));
    } catch (error) {
      console.error("Error creating dynamic form page:", error);
    }
  }

  setupSearchInputListener() {
    document.querySelectorAll(".search-input").forEach((input) => {
      input.addEventListener("input", function () {
        const filter = this.value.toLowerCase();
        const category = this.closest(".category");
        if (!category) return;

        const items = category.querySelectorAll(
          ".category-content li:not(.no-records-message)"
        );
        const noRecordsMessage = category.querySelector(".no-records-message");

        let hasVisibleItems = false;

        items.forEach((item) => {
          const isVisible = item.textContent.toLowerCase().includes(filter);
          item.style.display = isVisible ? "block" : "none";
          if (isVisible) hasVisibleItems = true;
        });

        if (noRecordsMessage) {
          noRecordsMessage.style.display = hasVisibleItems ? "none" : "block";
        }
      });
    });
  }
}


// Content from components/MappingComponent.js
class MappingComponent {
  treeContainer = document.getElementById("tree-container");
  isLoading = false;

  constructor(dataManager, editorManager, toolBoxManager, currentLanguage) {
    this.dataManager = dataManager;
    this.editorManager = editorManager;
    this.toolBoxManager = toolBoxManager;
    this.currentLanguage = currentLanguage;
    this.boundCreatePage = this.handleCreatePage.bind(this);
  }

  init() {
    this.setupEventListeners();
    this.listPagesListener();
    document.getElementById("list-all-pages").style.display = "block";
    document.getElementById("hide-pages").style.display = "none";
    this.homePage = this.dataManager.pages.SDT_PageCollection.find(
      (page) => page.PageName == "Home"
    );
    if (this.homePage) {
      this.createPageTree(this.homePage.PageId, "tree-container");
    }
  }

  listPagesListener() {
    const listAllPages = document.getElementById("list-all-pages");
    listAllPages.addEventListener("click", () => {
      this.handleListAllPages();
    });
  }

  handleListAllPages() {
    try {
      this.dataManager.getPages().then((res) => {
        if (this.toolBoxManager.checkIfNotAuthenticated(res)) {
          return;
        }
        this.treeContainer = document.getElementById("tree-container");
        this.clearMappings();
        const newTree = this.createPageList(res.SDT_PageCollection, true);
        this.treeContainer.appendChild(newTree);
        this.hidePagesList();
      });
    } catch (error) {
      this.displayMessage("Error loading pages", "error");
    } finally {
      this.isLoading = false;
    }
  }

  hidePagesList() {
    const listAllPages = document.getElementById("list-all-pages");
    listAllPages.style.display = "none";

    const hidePagesList = document.getElementById("hide-pages");
    hidePagesList.style.display = "block";

    hidePagesList.addEventListener("click", () => {
      listAllPages.style.display = "block";
      hidePagesList.style.display = "none";
      this.createPageTree(this.homePage.PageId, "tree-container");
    });
  }

  getPage(pageId) {
    return this.dataManager.pages.SDT_PageCollection.find(
      (page) => page.PageId == pageId
    );
  }

  createPageTree(rootPageId, childDivId) {
    let homePage = this.getPage(rootPageId);
    let homePageJSON = JSON.parse(homePage.PageGJSJson);
    const pages = homePageJSON.pages;
    if (!pages[0].frames) return;
    const containerRows =
      pages[0]?.frames[0]?.component.components[0].components[0].components;

    let childPages = [];

    containerRows.forEach((containerRow) => {
      let templateWrappers = containerRow.components;
      if (templateWrappers) {
        templateWrappers.forEach((templateWrapper) => {
          let templateBlocks = templateWrapper.components;
          templateBlocks.forEach((templateBlock) => {
            if (templateBlock.classes.includes("template-block")) {
              let pageId = templateBlock.attributes["tile-action-object-id"];
              let page = this.getPage(pageId);
              if (page) {
                childPages.push({
                  Id: pageId,
                  Name: page.PageName,
                  IsContentPage: page.PageIsContentPage,
                });
              }
            }
          });
        });
      }
    });
    const newTree = this.createTree(rootPageId, childPages, true);
    this.treeContainer = document.getElementById(childDivId);
    this.clearMappings();
    this.treeContainer.appendChild(newTree);
  }

  setupEventListeners() {
    const createPageButton = document.getElementById("page-submit");
    const pageInput = document.getElementById("page-title");

    createPageButton.removeEventListener("click", this.boundCreatePage);

    pageInput.addEventListener("input", () => {
      createPageButton.disabled = !pageInput.value.trim() || this.isLoading;
    });

    createPageButton.addEventListener("click", this.boundCreatePage);
  }

  async handleCreatePage(e) {
    e.preventDefault();

    if (this.isLoading) return;

    const pageInput = document.getElementById("page-title");
    const createPageButton = document.getElementById("page-submit");
    const pageTitle = pageInput.value.trim();

    if (!pageTitle) return;

    try {
      this.isLoading = true;
      createPageButton.disabled = true;
      pageInput.disabled = true; // Disable input during creation
      // Create the page
      await this.dataManager
        .createNewPage(pageTitle, this.toolBoxManager.currentTheme)
        .then((res) => {
          if (this.toolBoxManager.checkIfNotAuthenticated(res)) {
            return;
          }

          pageInput.value = "";

          this.clearMappings();

          this.dataManager.getPages().then((res) => {
            this.handleListAllPages();
            this.toolBoxManager.actionList.init();

            this.displayMessage(
              `${this.currentLanguage.getTranslation("page_created")}`,
              "success"
            );
          });
        });
    } catch (error) {
      this.displayMessage(
        `${this.currentLanguage.getTranslation("error_creating_page")}`,
        "error"
      );
    } finally {
      this.isLoading = false;
      createPageButton.disabled = !pageInput.value.trim();
      pageInput.disabled = false; // Re-enable input
    }
  }

  clearMappings() {
    while (this.treeContainer.firstChild) {
      this.treeContainer.removeChild(this.treeContainer.firstChild);
    }
  }

  createTree(rootPageId, data) {
    const buildListItem = (item) => {
      const listItem = document.createElement("li");
      listItem.classList.add("tb-custom-list-item");
      listItem.dataset.parentPageId = rootPageId;
      const childDiv = document.createElement("div");
      childDiv.classList.add("child-div");
      childDiv.id = `child-div-${item.Id}`;
      childDiv.style.position = "relative";
      childDiv.style.paddingLeft = "20px";

      const menuItem = document.createElement("div");
      menuItem.classList.add("tb-custom-menu-item");

      const toggle = document.createElement("span");
      toggle.classList.add("tb-dropdown-toggle");
      toggle.setAttribute("role", "button");
      toggle.setAttribute("aria-expanded", "false");
      const icon = "fa-caret-right tree-icon";
      toggle.innerHTML = `<i class="fa ${icon}"></i><span>${item.Name}</span>`;

      menuItem.appendChild(toggle);
      listItem.appendChild(menuItem);
      listItem.appendChild(childDiv);

      if (item.Children) {
        const dropdownMenu = document.createElement("ul");
        dropdownMenu.classList.add("tb-tree-dropdown-menu");

        item.Children.forEach((child) => {
          const dropdownItem = buildDropdownItem(child, item);
          dropdownMenu.appendChild(dropdownItem);
        });

        listItem.appendChild(dropdownMenu);
        listItem.classList.add("tb-dropdown");

        listItem.addEventListener("click", (e) =>
          toggleDropdown(e, listItem, menuItem)
        );
      }

      if (item.Name === "Web Link") {
        listItem.style.display = "none";
      }

      listItem.addEventListener("click", (e) => {
        e.stopPropagation();
        let pages = [item.Id];
        let liElement = listItem;

        while (liElement) {
          let parentLiElement =
            liElement.parentElement.parentElement.parentElement;
          if (parentLiElement instanceof HTMLLIElement) {
            pages.unshift(liElement.dataset.parentPageId);
            liElement = parentLiElement;
          } else {
            liElement = null;
          }
        }
        this.handlePageSelection(item, pages);
        // this.handlePageSelection(item);
        this.createPageTree(item.Id, `child-div-${item.Id}`);
      });

      return listItem;
    };

    const buildDropdownItem = (child, parent) => {
      const dropdownItem = document.createElement("li");
      dropdownItem.classList.add("tb-dropdown-item");
      dropdownItem.innerHTML = `<span><i style="margin-right: 10px;" class="fa-regular fa-file tree-icon"></i>${child.Name}</span>`;

      dropdownItem.addEventListener("click", (e) => {
        e.stopPropagation();
        this.handlePageSelection(child, true, parent);
      });

      return dropdownItem;
    };

    const toggleDropdown = (event, listItem, menuItem) => {
      event.stopPropagation();

      const isActive = listItem.classList.contains("active");

      document.querySelectorAll(".tb-dropdown.active").forEach((dropdown) => {
        dropdown.classList.remove("active");
        dropdown
          .querySelector(".tb-dropdown-toggle")
          .setAttribute("aria-expanded", "false");
        dropdown
          .querySelector(".tb-custom-menu-item")
          .classList.remove("active-tree-item");
      });

      if (!isActive) {
        listItem.classList.add("active");
        menuItem.classList.add("active-tree-item");
        listItem
          .querySelector(".tb-dropdown-toggle")
          .setAttribute("aria-expanded", "true");
      } else {
        menuItem.classList.remove("active-tree-item");
        listItem
          .querySelector(".tb-dropdown-toggle")
          .setAttribute("aria-expanded", "false");
      }
    };

    const container = document.createElement("ul");
    container.classList.add("tb-custom-list");

    const sortedData = JSON.parse(JSON.stringify(data)).sort((a, b) =>
      a.Name === "Home" ? -1 : b.Name === "Home" ? 1 : 0
    );

    sortedData.forEach((item) => {
      const listItem = buildListItem(item);
      container.appendChild(listItem);
    });

    return container;
  }

  createPageList(data) {
    const buildListItem = (item) => {
      const listItem = document.createElement("li");
      listItem.classList.add("tb-custom-list-item");

      const menuItem = document.createElement("div");
      menuItem.classList.add("tb-custom-menu-item");
      menuItem.classList.add("page-list-items");

      const toggle = document.createElement("span");
      toggle.style.textTransform = "capitalize";
      toggle.classList.add("tb-dropdown-toggle");
      toggle.setAttribute("role", "button");
      toggle.setAttribute("aria-expanded", "false");
      toggle.innerHTML = `<i class="fa-regular fa-file tree-icon"></i><span>&nbsp; ${item.PageName}</span>`;

      const deleteIcon = document.createElement("i");
      deleteIcon.classList.add("fa-regular", "fa-trash-can", "tb-delete-icon");

      if (item.PageName === "Home" || item.PageName === "Web Link") {
        deleteIcon.style.display = "none";
      }

      deleteIcon.setAttribute("data-id", item.Id);

      deleteIcon.addEventListener("click", (event) =>
        handleDelete(event, item.PageId, listItem)
      );

      menuItem.appendChild(toggle);
      if (item.PageName === "Web Link") {
        menuItem.style.display = "none";
      }
      if (item.Name !== "Home") {
        menuItem.appendChild(deleteIcon);
      }
      listItem.appendChild(menuItem);

      // listItem.addEventListener("click", (e) => {
      //     e.stopPropagation();
      //     this.handlePageSelection(item);
      // });

      return listItem;
    };

    const handleDelete = (event, id, elementToRemove) => {
      event.stopPropagation();
      const title = "Delete Page";
      const message = "Are you sure you want to delete this page?";
      const popup = this.popupModal(title, message);
      document.body.appendChild(popup);
      popup.style.display = "flex";

      const deleteButton = popup.querySelector("#yes_delete");
      const closeButton = popup.querySelector("#close_popup");
      const closePopup = popup.querySelector(".close");

      deleteButton.addEventListener("click", () => {
        const editors = Object.values(this.editorManager.editors);

        // Find the editor where pageId matches id
        const targetEditor = editors.find((editor) => editor.pageId === id);
        
        if (this.dataManager.deletePage(id)) {
          elementToRemove.remove();

          if (targetEditor) {
            const editorId = targetEditor.editor.getConfig().container;
            const editorContainerId = `${editorId}`;
            this.editorManager.removePageOnTileDelete(editorContainerId.replace("#", ""));
          }

          this.dataManager.getPages().then((res) => {
            this.handleListAllPages();
            this.toolBoxManager.actionList.init();
          });

          this.displayMessage(
            `${this.currentLanguage.getTranslation("page_deleted")}`,
            "success"
          );
        } else {
          this.displayMessage(
            `${this.currentLanguage.getTranslation(
              "error_while_deleting_page"
            )}`,
            "error"
          );
        }
        popup.remove();
      });

      closeButton.addEventListener("click", () => {
        popup.remove();
      });

      closePopup.addEventListener("click", () => {
        popup.remove();
      });
    };

    const container = document.createElement("ul");
    container.classList.add("tb-custom-list");

    const sortedData = JSON.parse(JSON.stringify(data)).sort((a, b) =>
      a.PageName === "Home" ? -1 : b.PageName === "Home" ? 1 : 0
    );

    sortedData.forEach((item) => {
      const listItem = buildListItem(item);
      container.appendChild(listItem);
    });

    return container;
  }

  popupModal(title, message) {
    const popup = document.createElement("div");
    popup.className = "popup-modal";
    popup.innerHTML = `
            <div class="popup">
              <div class="popup-header">
                <span>${title}</span>
                <button class="close">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 21 21">
                      <path id="Icon_material-close" data-name="Icon material-close" d="M28.5,9.615,26.385,7.5,18,15.885,9.615,7.5,7.5,9.615,15.885,18,7.5,26.385,9.615,28.5,18,20.115,26.385,28.5,28.5,26.385,20.115,18Z" transform="translate(-7.5 -7.5)" fill="#6a747f" opacity="0.54"/>
                  </svg>
                </button>
              </div>
              <hr>
              <div class="popup-body" id="confirmation_modal_message">
                ${message}
              </div>
              <div class="popup-footer">
                <button id="yes_delete" class="tb-btn tb-btn-primary">
                  Delete
                </button>
                <button id="close_popup" class="tb-btn tb-btn-outline">
                  Cancel
                </button>
              </div>
            </div>
          `;

    return popup;
  }

  async handlePageSelection(item, pages, isChild = false, parent = null) {
    if (this.isLoading) return;

    try {
      this.isLoading = true;
      // Locate the page data
      const page = this.dataManager.pages.SDT_PageCollection.find(
        (page) => page.PageId === item.Id
      );
      if (!page) throw new Error(`Page with ID ${item.Id} not found`);

      const editors = Object.values(this.editorManager.editors);
      const mainEditor = editors[0];

      if (mainEditor) {
        const editor = mainEditor.editor;
        const editorId = editor.getConfig().container;
        const editorContainerId = `${editorId}-frame`;

        if (isChild) {
          if (parent?.Id) {
            const parentEditorId = editors[1].editor.getConfig().container;
            document
              .querySelector(`${parentEditorId}-frame`)
              .nextElementSibling?.remove();
            this.editorManager.createChildEditor(page);
          }
        } else {
          // Remove extra frames
          $(editorContainerId).nextAll().remove();
          pages.forEach((pageId) => {
            const page = this.getPage(pageId);
            this.editorManager.createChildEditor(page);
          });
        }
      }
    } catch (error) {
      console.error("Error selecting page:", error);
      this.displayMessage("Error loading page", "error");
    } finally {
      this.isLoading = false;
    }
  }

  checkActivePage(id) {
    return localStorage.getItem("pageId") === id;
  }

  updateActivePageName() {
    return this.editorManager.getCurrentPageName();
  }

  displayMessage(message, status) {
    this.toolBoxManager.ui.displayAlertMessage(message, status);
  }
}


// Content from components/MediaComponent.js
class MediaComponent {
  constructor(dataManager, editorManager, currentLanguage, toolBoxManager) {
    this.dataManager = dataManager;
    this.editorManager = editorManager;
    this.toolBoxManager = toolBoxManager;
    this.currentLanguage = currentLanguage;
    this.selectedFile = null;
    this.init();
  }

  init() {
    this.setupFileManager();
  }

  formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${Math.round(bytes / 1024 / 1024)} MB`;
    return `${Math.round(bytes / 1024 / 1024 / 1024)} GB`;
  }

  createModalHeader() {
    const header = document.createElement("div");
    header.className = "tb-modal-header";
    header.innerHTML = `
          <h2>${this.currentLanguage.getTranslation(
            "file_upload_modal_title"
          )}</h2>
          <span class="close">
            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21">
              <path id="Icon_material-close" data-name="Icon material-close" d="M28.5,9.615,26.385,7.5,18,15.885,9.615,7.5,7.5,9.615,15.885,18,7.5,26.385,9.615,28.5,18,20.115,26.385,28.5,28.5,26.385,20.115,18Z" transform="translate(-7.5 -7.5)" fill="#6a747f" opacity="0.54"/>
            </svg>
          </span>
        `;
    return header;
  }

  createUploadArea() {
    const uploadArea = document.createElement("div");
    uploadArea.className = "upload-area";
    uploadArea.id = "uploadArea";
    uploadArea.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="40.999" height="28.865" viewBox="0 0 40.999 28.865">
            <path id="Path_1040" data-name="Path 1040" d="M21.924,11.025a3.459,3.459,0,0,0-3.287,3.608,3.459,3.459,0,0,0,3.287,3.608,3.459,3.459,0,0,0,3.287-3.608A3.459,3.459,0,0,0,21.924,11.025ZM36.716,21.849l-11.5,14.432-8.218-9.02L8.044,39.89h41Z" transform="translate(-8.044 -11.025)" fill="#afadad"/>
          </svg>
          <div class="upload-text">
            ${this.currentLanguage.getTranslation("upload_section_text")}
          </div>
        `;

    // Add drag and drop event listeners
    this.setupDragAndDrop(uploadArea);

    return uploadArea;
  }

  setupDragAndDrop(uploadArea) {
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      uploadArea.addEventListener(eventName, preventDefaults, false);
      document.body.addEventListener(eventName, preventDefaults, false);
    });

    ["dragenter", "dragover"].forEach((eventName) => {
      uploadArea.addEventListener(eventName, () => {
        uploadArea.classList.add("drag-over");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      uploadArea.addEventListener(eventName, () => {
        uploadArea.classList.remove("drag-over");
      });
    });

    uploadArea.addEventListener("drop", (e) => {
      const files = Array.from(e.dataTransfer.files);
      this.handleDroppedFiles(files);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  handleDroppedFiles(files) {
    const validFiles = files.filter((file) =>
      ["image/jpeg", "image/jpg", "image/png"].includes(file.type)
    );

    if (validFiles.length !== files.length) {
      this.toolBoxManager.ui.displayAlertMessage(
        `${this.currentLanguage.getTranslation("invalid_file_type_message")}`,
        "error"
      );
    }

    const fileList = document.querySelector("#fileList");
    if (!fileList) return;

    validFiles.forEach((file) => {
      const imageName = `${Date.now()}-${file.name}`;
      this.processUploadedFile(file, imageName, fileList);
    });
  }

  createModalActions() {
    const actions = document.createElement("div");
    actions.className = "modal-actions";
    actions.innerHTML = `
          <button class="tb-btn tb-btn-outline" id="cancelBtn">${this.currentLanguage.getTranslation(
            "cancel_btn"
          )}</button>
          <button class="tb-btn tb-btn-primary" id="saveBtn">${this.currentLanguage.getTranslation(
            "save_btn"
          )}</button>
        `;
    return actions;
  }

  openFileUploadModal() {
    const modal = document.createElement("div");
    modal.className = "tb-modal";

    const modalContent = document.createElement("div");
    modalContent.className = "tb-modal-content";

    const fileListHtml = this.createExistingFileListHTML();

    modalContent.appendChild(this.createModalHeader());
    modalContent.appendChild(this.createUploadArea());

    const fileListContainer = document.createElement("div");
    fileListContainer.className = "file-list";
    fileListContainer.id = "fileList";
    fileListContainer.innerHTML = fileListHtml;
    modalContent.appendChild(fileListContainer);

    modalContent.appendChild(this.createModalActions());

    modal.appendChild(modalContent);
    return modal;
  }

  createExistingFileListHTML() {
    const removeBeforeFirstHyphen = (str) => str.split("-").slice(1).join("-");
    return this.dataManager.media
      .map(
        (file) => `
                <div class="file-item valid" 
                    data-MediaId="${file.MediaId}" 
                    data-MediaUrl="${file.MediaUrl}" 
                    data-MediaName="${file.MediaName}">
                  <img src="${file.MediaUrl}" alt="${
          file.MediaName
        }" class="preview-image">
                  <div class="file-info">
                    <div class="file-name">${removeBeforeFirstHyphen(
                      file.MediaName
                    )}</div>
                    <div class="file-size">${this.formatFileSize(
                      file.MediaSize
                    )}</div>
                  </div>
                  <span class="status-icon" style="color: green;"></span>
                  <span title="Delete file" class="delete-media fa-regular fa-trash-can" data-mediaid="${
                    file.MediaId
                  }"></span>
                </div>
              `
      )
      .join("");
  }

  setupFileManager() {
    const openModal = document.getElementById("image-bg");
    const fileInputField = this.createFileInputField();
    const modal = this.openFileUploadModal();

    let allUploadedFiles = [];

    openModal.addEventListener("click", (e) => {
      e.preventDefault();
      this.handleModalOpen(modal, fileInputField, allUploadedFiles);
    });
  }

  createFileInputField() {
    const fileInputField = document.createElement("input");
    fileInputField.type = "file";
    fileInputField.multiple = true;
    fileInputField.accept = "image/jpeg, image/jpg, image/png";
    fileInputField.id = "fileInput";
    fileInputField.style.display = "none";
    return fileInputField;
  }

  handleModalOpen(
    modal,
    fileInputField,
    allUploadedFiles,
    isTile = true,
    type = ""
  ) {
    if (isTile && !this.editorManager.selectedComponent) {
      this.toolBoxManager.ui.displayAlertMessage(
        `${this.currentLanguage.getTranslation(
          "no_tile_selected_error_message"
        )}`,
        "error"
      );
      return;
    } else {
      this.isTile = isTile;
      this.type = type;
    }

    $(".delete-media").on("click", (e) => {
      e.stopPropagation();
      const mediaId = e.target.dataset.mediaid;
      if (mediaId) {
        this.deleteMedia(mediaId);
      }
    });

    document.body.appendChild(modal);
    document.body.appendChild(fileInputField);

    this.setupModalEventListeners(modal, fileInputField, allUploadedFiles);
  }

  setupModalEventListeners(modal, fileInputField, allUploadedFiles) {
    this.addFileItemClickListeners(modal);
    this.addDeleteMediaListeners(modal);
    this.setupModalInteractions(modal, fileInputField, allUploadedFiles);

    // Add drag and drop styling
    const style = document.createElement("style");
    style.textContent = `
            .upload-area {
                position: relative;
                border: 2px dashed #ccc;
                border-radius: 8px;
                padding: 40px 20px;
                text-align: center;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            
            .upload-area.drag-over {
                background-color: rgba(33, 150, 243, 0.05);
                border-color: #222f54;
            }
            
            .upload-text {
                margin-top: 15px;
                color: #666;
            }            
        `;
    document.head.appendChild(style);
  }

  addFileItemClickListeners(modal) {
    const fileItems = modal.querySelectorAll(".file-item");
    fileItems.forEach((element) => {
      element.addEventListener("click", () => {
        this.mediaFileClicked(element);
      });
    });
  }

  addDeleteMediaListeners(modal) {
    $(modal)
      .find(".delete-media")
      .on("click", (e) => {
        const mediaId = e.target.dataset.mediaid;
        if (mediaId) {
          const popup = this.popupModal(
            `${this.currentLanguage.getTranslation(
              "delete_media_modal_title"
            )}`,
            `${this.currentLanguage.getTranslation(
              "delete_media_modal_message"
            )}`
          );
          document.body.appendChild(popup);
          popup.style.display = "flex";

          this.setupPopupButtonListeners(popup, mediaId);
        }
      });
  }

  setupPopupButtonListeners(popup, mediaId) {
    const confirmButton = popup.querySelector("#yes_delete");
    confirmButton.onclick = () => {
      this.deleteMedia(mediaId);
      popup.style.display = "none";
    };

    const cancelButton = popup.querySelector("#close_popup");
    cancelButton.onclick = () => {
      popup.style.display = "none";
    };

    const closePopup = popup.querySelector(".close");
    closePopup.addEventListener("click", () => {
      popup.remove();
    });
  }

  setupModalInteractions(modal, fileInputField, allUploadedFiles) {
    const uploadArea = modal.querySelector("#uploadArea");
    const fileList = modal.querySelector("#fileList");
    const closeButton = modal.querySelector(".close");
    const cancelBtn = modal.querySelector("#cancelBtn");
    const saveBtn = modal.querySelector("#saveBtn");

    uploadArea.onclick = () => fileInputField.click();

    fileInputField.onchange = (event) => {
      this.handleFileInputChange(event, allUploadedFiles, fileList);
    };

    closeButton.onclick = cancelBtn.onclick = () => {
      this.closeModal(modal, fileInputField);
    };

    saveBtn.onclick = () => {
      if (!this.isTile) {
        if (this.selectedFile?.MediaUrl) {
          const safeMediaUrl = encodeURI(this.selectedFile.MediaUrl);
          this.closeModal(modal, fileInputField);
          if (this.type === "logo") {
            this.changeLogo(safeMediaUrl);
          } else if (this.type === "profile-image") {
            this.changeProfile(safeMediaUrl);
          }
        }

        this.closeModal(modal, fileInputField);
      } else {
        this.saveSelectedFile(modal, fileInputField);
      }
    };

    modal.style.display = "flex";
  }

  handleFileInputChange(event, allUploadedFiles, fileList) {
    const newFiles = Array.from(event.target.files).filter((file) =>
      ["image/jpeg", "image/jpg", "image/png"].includes(file.type)
    );
    allUploadedFiles.push(...newFiles);

    newFiles.forEach((file) => {
      const imageName = `${Date.now()}-${file.name}`;
      this.processUploadedFile(file, imageName, fileList);
    });
  }

  async processUploadedFile(file, imageName, fileList) {
    try {
      const imageCropper = new ImageCropper(532, 250);
      const resizedBlob = await imageCropper.processImage(file);

      const resizedFile = new File([resizedBlob], file.name, {
        type: file.type,
      });

      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(resizedBlob);
      });

      const cleanImageName = imageName.replace(/'/g, "");

      const response = await this.dataManager.uploadFile(
        dataUrl,
        cleanImageName,
        resizedFile.size,
        resizedFile.type
      );

      if (this.toolBoxManager.checkIfNotAuthenticated(response)) {
        return;
      }

      if (response.BC_Trn_Media.MediaId) {
        this.dataManager.media.push(response.BC_Trn_Media);
        this.displayMediaFileProgress(fileList, response.BC_Trn_Media);
      }
    } catch (error) {
      console.error("Failed to process image:", error);
    }
  }

  displayMediaFileProgress(fileList, file) {
    const fileItem = document.createElement("div");
    fileItem.className = `file-item ${
      this.validateFile(file) ? "valid" : "invalid"
    }`;
    fileItem.setAttribute("data-mediaid", file.MediaId);

    const removeBeforeFirstHyphen = (str) => str.split("-").slice(1).join("-");

    const isValid = this.validateFile(file);
    fileItem.innerHTML = `
          <img src="${
            file.MediaUrl
          }" alt="File thumbnail" class="preview-image">
          <div class="file-info">
            <div class="file-info-details">
              <div>
                <div class="file-name">${removeBeforeFirstHyphen(
                  file.MediaName
                )}</div>
                <div class="file-size">${this.formatFileSize(
                  file.MediaSize
                )}</div>
              </div>
              <div class="progress-text">0%</div>
            </div>
            <div class="progress-bar">
                <div class="progress" style="width: 0%"></div>
            </div>
          </div>
          <span class="status-icon" style="color: ${isValid ? "green" : "red"}">
            ${isValid ? "" : "⚠"}
          </span>
        `;
    fileList.insertBefore(fileItem, fileList.firstChild);

    let progress = 0;
    const progressBar = fileItem.querySelector(".progress");
    const progressText = fileItem.querySelector(".progress-text");

    const interval = setInterval(() => {
      progress += 10;
      progressBar.style.width = `${progress}%`;
      progressText.textContent = `${progress}%`;

      if (progress >= 100) {
        clearInterval(interval);
        fileList.removeChild(fileItem);
        this.displayMediaFile(fileList, file);
      }
    }, 300);
  }

  displayMediaFile(fileList, file) {
    const fileItem = document.createElement("div");
    fileItem.className = `file-item ${
      this.validateFile(file) ? "valid" : "invalid"
    }`;
    fileItem.setAttribute("data-mediaid", file.MediaId);

    const removeBeforeFirstHyphen = (str) => str.split("-").slice(1).join("-");

    const isValid = this.validateFile(file);
    fileItem.innerHTML = `
          <img src="${
            file.MediaUrl
          }" alt="File thumbnail" class="preview-image">
          <div class="file-info">
              <div class="file-name">${removeBeforeFirstHyphen(
                file.MediaName
              )}</div>
              <div class="file-size">${this.formatFileSize(
                file.MediaSize
              )}</div>
          </div>
          <span class="status-icon" style="color: ${isValid ? "green" : "red"}">
            ${isValid ? "" : "⚠"}
          </span>
          <span class="delete-media fa-regular fa-trash-can" data-mediaid="${
            file.MediaId
          }"></span>
        `;

    fileItem.onclick = () => {
      if (!fileItem.classList.contains("invalid")) {
        this.mediaFileClicked(fileItem);
      }
    };

    $(fileItem)
      .find(".delete-media")
      .on("click", (e) => {
        const mediaId = e.target.dataset.mediaid;
        if (mediaId) {
          const popup = this.popupModal(
            `${this.currentLanguage.getTranslation(
              "delete_media_modal_title"
            )}`,
            `${this.currentLanguage.getTranslation(
              "delete_media_modal_message"
            )}`
          );
          document.body.appendChild(popup);
          popup.style.display = "flex";

          this.setupPopupButtonListeners(popup, mediaId);
        }
      });
    fileList.insertBefore(fileItem, fileList.firstChild);
  }

  validateFile(file) {
    const isValidSize = file.MediaSize <= 2 * 1024 * 1024;
    const isValidType = ["image/jpeg", "image/jpg", "image/png"].includes(
      file.MediaType
    );
    return isValidSize && isValidType;
  }

  closeModal(modal, fileInputField) {
    modal.style.display = "none";
    document.body.removeChild(modal);
    document.body.removeChild(fileInputField);
  }

  saveSelectedFile(modal, fileInputField) {
    if (this.selectedFile) {
      const templateBlock = this.editorManager.selectedComponent;

      if (this.selectedFile?.MediaUrl) {
        const safeMediaUrl = encodeURI(this.selectedFile.MediaUrl);
        templateBlock.addStyle({
          "background-image": `url(${safeMediaUrl})`,
          "background-size": "cover",
          "background-position": "center",
          "background-blend-mode": "overlay",
        });
      } else {
        console.error("MediaUrl is missing or undefined", this.selectedFile);
      }

      this.toolBoxManager.setAttributeToSelected(
        "tile-bg-image-url",
        this.selectedFile.MediaUrl
      );

      this.toolBoxManager.checkTileBgImage();
    }

    this.closeModal(modal, fileInputField);
  }

  mediaFileClicked(fileItem) {
    if (fileItem.classList.contains("invalid")) return;

    document.querySelector(".modal-actions").style.display = "flex";

    // Reset other file items
    document.querySelectorAll(".file-item").forEach((el) => {
      el.classList.remove("selected");
      const icon = el.querySelector(".status-icon");
      if (icon) {
        icon.innerHTML = el.classList.contains("invalid") ? "⚠" : "";
      }
    });

    // Select current file item
    fileItem.classList.add("selected");
    let statusIcon = fileItem.querySelector(".status-icon");
    statusIcon.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="13.423" viewBox="0 0 18 13.423">
            <path id="Icon_awesome-check" d="M6.114,17.736l-5.85-5.85a.9.9,0,0,1,0-1.273L1.536,9.341a.9.9,0,0,1,1.273,0L6.75,13.282l8.441-8.441a.9.9,0,0,1,1.273,0l1.273,1.273a.9.9,0,0,1,0,1.273L7.386,17.736A.9.9,0,0,1,6.114,17.736Z" transform="translate(0 -4.577)" fill="#3a9341"/>
          </svg>
        `;
    statusIcon.style.color = "green";

    // Find and set selected file
    this.selectedFile = this.dataManager.media.find(
      (file) => file.MediaId == fileItem.dataset.mediaid
    );
  }

  deleteMedia(mediaId) {
    this.dataManager
      .deleteMedia(mediaId)
      .then((res) => {
        if (this.toolBoxManager.checkIfNotAuthenticated(res)) {
          return;
        }

        if (res.result === "success") {
          // Remove the media item from the DOM
          const mediaItem = document.querySelector(
            `[data-mediaid="${mediaId}"]`
          );
          if (mediaItem) {
            mediaItem.remove();
          }

          const modalActions = document.querySelector(".modal-actions");
          if (!this.dataManager.media || this.dataManager.media.length === 0) {
            modalActions.style.display = "none";
          }
          // Provide feedback to the user
          this.toolBoxManager.ui.displayAlertMessage(
            `${this.currentLanguage.getTranslation(
              "media_deleted_successfully"
            )}`,
            "success"
          );
          this.checkAndHideModalActions();
        } else {
          this.toolBoxManager.ui.displayAlertMessage(
            `${this.currentLanguage.getTranslation("failed_to_delete_media")}`,
            "error"
          );
        }
      })
      .catch((error) => {
        console.error("Error deleting media file:", error);
        this.toolBoxManager.ui.displayAlertMessage(
          `${this.currentLanguage.getTranslation(
            "error_during_deleting_media"
          )}`,
          "error"
        );
      });
  }

  popupModal(title, message) {
    const popup = document.createElement("div");
    popup.className = "popup-modal";
    popup.innerHTML = `
          <div class="popup">
            <div class="popup-header">
              <span>${title}</span>
              <button class="close">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 21 21">
                  <path id="Icon_material-close" data-name="Icon material-close" d="M28.5,9.615,26.385,7.5,18,15.885,9.615,7.5,7.5,9.615,15.885,18,7.5,26.385,9.615,28.5,18,20.115,26.385,28.5,28.5,26.385,20.115,18Z" transform="translate(-7.5 -7.5)" fill="#6a747f" opacity="0.54"/>
                </svg>
              </button>
            </div>
            <hr>
            <div class="popup-body" id="confirmation_modal_message">
              ${message}
            </div>
            <div class="popup-footer">
              <button id="yes_delete" class="tb-btn tb-btn-primary">
                ${this.currentLanguage.getTranslation("delete_btn")}
              </button>
              <button id="close_popup" class="tb-btn tb-btn-outline">
                ${this.currentLanguage.getTranslation("cancel_btn")}
              </button>
            </div>
          </div>
        `;
    return popup;
  }

  checkAndHideModalActions() {
    const fileList = document.querySelector("#fileList");
    const modalActions = document.querySelector(".modal-actions");

    if (fileList && fileList.children.length === 0) {
      modalActions.style.display = "none";
    } else {
      modalActions.style.display = "flex";
    }
  }

  changeLogo(logoUrl) {
    this.dataManager.uploadLogo(logoUrl).then((res) => {
      const logoAddedSection = document.getElementById("added-logo");
      const addLogoSection = document.getElementById("add-logo");

      if (logoAddedSection && addLogoSection) {
        logoAddedSection.style.display = "block"; // Show added logo section
        addLogoSection.style.display = "none"; // Hide add logo section

        const logo = logoAddedSection.querySelector("#toolbox-logo");
        if (logo) {
          logo.setAttribute("src", logoUrl);
        }
      }
    });
  }

  changeProfile(profileImageUrl) {
    this.dataManager.uploadProfileImage(profileImageUrl).then((res) => {
      const profileAddedSection = document.getElementById(
        "profile-image-added"
      );
      const addProfileSection = document.getElementById("add-profile-image");

      if (profileAddedSection && addProfileSection) {
        profileAddedSection.style.display = "block"; // Show added profile section
        addProfileSection.style.display = "none"; // Hide add profile section

        const profileImg = profileAddedSection.querySelector("#profile-img");
        if (profileImg) {
          profileImg.setAttribute("src", profileImageUrl);
        }
      }
    });
  }
}


// Content from classes/ImageCropper.js
class ImageCropper {
    constructor(targetWidth = 532, targetHeight = 250) {
        this.targetWidth = targetWidth;
        this.targetHeight = targetHeight;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    async processImage(source) {
        try {
            let img;
            if (typeof source === 'string') {
                img = await this.loadImageFromURL(source);
            } else if (source instanceof File) {
                if (!source.type.startsWith('image/')) {
                    throw new Error('File must be an image');
                }
                const imageData = await this.readFileAsDataURL(source);
                img = await this.loadImage(imageData);
            } else {
                throw new Error('Source must be either a File or URL string');
            }

            if (img.width <= this.targetWidth && img.height <= this.targetHeight) {
                return source instanceof File ? source : this.dataURLToBlob(img.src);
            }
            
            return this.resizeImage(img, source instanceof File ? source.type : 'image/jpeg');
        } catch (error) {
            throw new Error(`Failed to process image: ${error.message}`);
        }
    }

    loadImageFromURL(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image from URL'));
            img.src = url;
        });
    }

    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    }

    loadImage(dataUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = dataUrl;
        });
    }

    resizeImage(img, fileType) {
        this.canvas.width = this.targetWidth;
        this.canvas.height = this.targetHeight;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(img, 0, 0, this.targetWidth, this.targetHeight);
        
        return new Promise((resolve) => {
            this.canvas.toBlob((blob) => resolve(blob), fileType);
        });
    }

    dataURLToBlob(dataURL) {
        const byteString = atob(dataURL.split(",")[1]);
        const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
        }
        return new Blob([arrayBuffer], { type: mimeString });
    }
}


// Content from utils/defaults.js
const iconsData = [
    {
      name: "Broom",
      svg: `
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="25" viewBox="0 0 32.86 26.791">
            <path id="Path_942" data-name="Path 942" d="M27.756,3.986a1.217,1.217,0,0,0-1.2,1.234v9.736a2.433,2.433,0,0,0-2.434,2.434v1.217H27.57a1.217,1.217,0,0,0,.4,0h3.459V17.39a2.433,2.433,0,0,0-2.434-2.434V5.22a1.217,1.217,0,0,0-1.236-1.234ZM11.953,4a4.049,4.049,0,0,0-3.6,2.579,3.784,3.784,0,0,0-.663-.145,4.278,4.278,0,0,0-4.26,4.26,4.152,4.152,0,0,0,.062.609H3.434a1.217,1.217,0,1,0,0,2.434H3.6l.825,6.19-3,2.629a1.218,1.218,0,0,0,1.6,1.835l1.79-1.566-.385-2.9,6.729-5.89a1.217,1.217,0,0,1,1.6,1.835L4.808,22.826l.777,5.838A2.437,2.437,0,0,0,8,30.777h7.906a2.434,2.434,0,0,0,2.413-2.113l1.992-14.925h.162a1.217,1.217,0,1,0,0-2.434h-.062a4.152,4.152,0,0,0,.062-.609,4.278,4.278,0,0,0-4.26-4.26,3.784,3.784,0,0,0-.663.145A4.049,4.049,0,0,0,11.953,4Zm0,2.434a1.8,1.8,0,0,1,1.8,1.626,1.217,1.217,0,0,0,1.709.975A1.817,1.817,0,0,1,18.038,10.7a1.858,1.858,0,0,1-.107.609H5.975a1.859,1.859,0,0,1-.107-.609A1.817,1.817,0,0,1,8.445,9.037a1.217,1.217,0,0,0,1.709-.975A1.8,1.8,0,0,1,11.953,6.437Zm12.17,14.6a16.837,16.837,0,0,0-2.434,8.519,1.217,1.217,0,0,0,1.217,1.217h9.736a1.216,1.216,0,0,0,1.21-1.348,16.907,16.907,0,0,0-2.427-8.388h-7.3Z" transform="translate(-1 -3.986)" fill="#7c8791"/>
          </svg>
         `,
    },
    {
      name: "Car",
      svg: `
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="25" viewBox="0 0 33.969 27.499">
            <path id="Path_940" data-name="Path 940" d="M33.625,15.208l-2.689-7.7A5.236,5.236,0,0,0,26,4H11.967A5.233,5.233,0,0,0,7.034,7.507l-2.689,7.7A5.247,5.247,0,0,0,2,19.588V28.88a2.613,2.613,0,1,0,5.226,0V27.228s6.9.342,11.758.342,11.758-.342,11.758-.342V28.88a2.613,2.613,0,1,0,5.226,0V19.588A5.248,5.248,0,0,0,33.625,15.208ZM8,12.659,9.5,8.372a2.614,2.614,0,0,1,2.467-1.753H26a2.614,2.614,0,0,1,2.467,1.753l1.5,4.287a.936.936,0,0,1-1.03,1.24,62.318,62.318,0,0,0-9.952-.733,62.318,62.318,0,0,0-9.952.733A.936.936,0,0,1,8,12.659Zm-.124,9.673a1.964,1.964,0,1,1,1.96-1.964A1.963,1.963,0,0,1,7.879,22.332ZM22.9,21.023H15.065a1.309,1.309,0,0,1,0-2.619H22.9a1.309,1.309,0,0,1,0,2.619Zm7.186,1.309a1.964,1.964,0,1,1,1.96-1.964A1.963,1.963,0,0,1,30.09,22.332Z" transform="translate(-2 -4)" fill="#7c8791"/>
          </svg>
  
         `,
    },
    {
      name: "Heart",
      svg: `
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="25" viewBox="0 0 31.83 28.479">
            <path id="Path_941" data-name="Path 941" d="M24.689,3.007a9.543,9.543,0,0,0-6.774,3.3,9.543,9.543,0,0,0-6.774-3.3A8.865,8.865,0,0,0,3.768,6.654C-2.379,14.723,9.259,24.162,12,26.7c1.638,1.516,3.659,3.317,4.865,4.384a1.583,1.583,0,0,0,2.106,0c1.206-1.067,3.228-2.868,4.865-4.384,2.738-2.534,14.377-11.973,8.228-20.041A8.86,8.86,0,0,0,24.689,3.007Z" transform="translate(-2 -3.001)" fill="#7c8791"/>
          </svg>
         `,
    },
    {
      name: "Home",
      svg: `
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="25" viewBox="0 0 28.752 28.752">
            <path id="Path_937" data-name="Path 937" d="M17.376,2a1.2,1.2,0,0,0-.838.342L3.47,13.03l-.044.035-.044.037v0A1.2,1.2,0,0,0,4.2,15.178H5.4V28.356a2.4,2.4,0,0,0,2.4,2.4H26.96a2.4,2.4,0,0,0,2.4-2.4V15.178h1.2a1.2,1.2,0,0,0,.817-2.075l-.019-.014q-.039-.036-.082-.068l-1.914-1.565V6.792a1.2,1.2,0,0,0-1.2-1.2h-1.2a1.2,1.2,0,0,0-1.2,1.2V8.516l-7.574-6.2A1.2,1.2,0,0,0,17.376,2ZM20.97,17.574h4.792v9.584H20.97Z" transform="translate(-3 -2)" fill="#7c8791"/>
          </svg>
         `,
    },
    {
      name: "Health",
      svg: `
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="25" viewBox="0 0 26.214 27.498">
            <path id="Path_938" data-name="Path 938" d="M26.3,4.75H20.208a4.433,4.433,0,0,0-8.2,0H5.913A2.834,2.834,0,0,0,3,7.5V26.748A2.834,2.834,0,0,0,5.913,29.5H26.3a2.834,2.834,0,0,0,2.913-2.75V7.5A2.834,2.834,0,0,0,26.3,4.75Zm-10.194,0a1.418,1.418,0,0,1,1.456,1.375,1.459,1.459,0,0,1-2.913,0A1.418,1.418,0,0,1,16.107,4.75Zm4.369,15.124H17.564v2.75A1.418,1.418,0,0,1,16.107,24h0a1.418,1.418,0,0,1-1.456-1.375v-2.75H11.738A1.418,1.418,0,0,1,10.282,18.5h0a1.418,1.418,0,0,1,1.456-1.375h2.913v-2.75A1.418,1.418,0,0,1,16.107,13h0a1.418,1.418,0,0,1,1.456,1.375v2.75h2.913A1.418,1.418,0,0,1,21.933,18.5h0A1.418,1.418,0,0,1,20.476,19.874Z" transform="translate(-3 -2)" fill="#7c8791"/>
          </svg>
         `,
    },
    {
      name: "Foods",
      svg: `
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="25" viewBox="0 0 32.813 27.572">
            <path id="Path_939" data-name="Path 939" d="M22.959,3.986a.656.656,0,0,0-.646.665V5.964q0,.019,0,.038A5.905,5.905,0,0,0,17.1,11.214H15.75a.656.656,0,0,0-.656.656v4.594H11.933a7.534,7.534,0,0,0,.445-1.969h.091a.656.656,0,1,0,0-1.313H11.9a6.673,6.673,0,0,0,.481-1.969h.091a.656.656,0,1,0,0-1.313H11.9a6.673,6.673,0,0,0,.481-1.969h.091a.656.656,0,1,0,0-1.313H2.625a.656.656,0,1,0,0,1.313h.091A6.674,6.674,0,0,0,3.2,9.9H2.625a.656.656,0,1,0,0,1.313h.091A6.674,6.674,0,0,0,3.2,13.183H2.625a.656.656,0,1,0,0,1.313h.091a7.535,7.535,0,0,0,.445,1.969H.656A.656.656,0,0,0,0,17.12v6.563a3.271,3.271,0,0,0,5.906,1.948,3.251,3.251,0,0,0,5.25,0,3.251,3.251,0,0,0,5.25,0,3.251,3.251,0,0,0,5.25,0,3.251,3.251,0,0,0,5.25,0,3.271,3.271,0,0,0,5.906-1.948V17.12a.656.656,0,0,0-.656-.656H30.844V11.87a.656.656,0,0,0-.656-.656H28.837A5.905,5.905,0,0,0,23.624,6q0-.019,0-.038V4.652a.656.656,0,0,0-.666-.665ZM4.029,7.933h7.037A5.272,5.272,0,0,1,10.473,9.9H4.621A5.272,5.272,0,0,1,4.029,7.933Zm0,3.281h7.037a5.272,5.272,0,0,1-.592,1.969H4.621A5.272,5.272,0,0,1,4.029,11.214Zm12.378,1.313H29.531v3.938H16.406ZM4.029,14.5h7.037a5.272,5.272,0,0,1-.592,1.969H4.621A5.272,5.272,0,0,1,4.029,14.5Zm-1.4,13.729V30.9a.656.656,0,0,0,1.313,0V28.23a4.352,4.352,0,0,1-.656.046A3.64,3.64,0,0,1,2.625,28.224Zm27.562,0a3.64,3.64,0,0,1-.656.053,4.352,4.352,0,0,1-.656-.046V30.9a.656.656,0,0,0,1.313,0Z" transform="translate(0 -3.986)" fill="#7c8791"/>
          </svg>
         `,
    },
    {
      name: "Laundry",
      svg: `
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="25" viewBox="0 0 30.411 28.722">
            <path id="Path_943" data-name="Path 943" d="M13.236,4a2.053,2.053,0,0,0,0,4.1h2.323l-.32.333-.034.033-2.493,2.58a8.153,8.153,0,0,1-1.539-1.907.674.674,0,0,0-1.158,0c-.021.036-1.94,3.543-5.723,3.73l-.98-6.247a.669.669,0,0,0-.638-.584.652.652,0,0,0-.517.238.7.7,0,0,0-.149.564l1.07,6.83s0,.005,0,.008L5.973,32.147s0,.006,0,.009a.7.7,0,0,0,.071.21l.012.02a.679.679,0,0,0,.137.17l.009.007a.657.657,0,0,0,.186.114l.008,0a.641.641,0,0,0,.227.041H27.778A.641.641,0,0,0,28,32.68l.019-.007a.656.656,0,0,0,.186-.114h0l0-.005a.679.679,0,0,0,.136-.168l.009-.017a.7.7,0,0,0,.075-.22l2.9-18.464s0-.005,0-.008l1.07-6.83a.7.7,0,0,0-.222-.662.644.644,0,0,0-.668-.112.681.681,0,0,0-.413.555l-.98,6.252a6.184,6.184,0,0,1-2.519-.672A4.91,4.91,0,0,0,26.423,7.5L24.262,5.265a4.348,4.348,0,0,0-3.184-1.256L13.238,4Zm0,1.368,7.84.009a3.031,3.031,0,0,1,2.251.855l2.161,2.236a3.493,3.493,0,0,1,0,4.832l-6.758,6.9,0,0a.636.636,0,0,1-.935,0,.685.685,0,0,1-.154-.711l2.573-2.662.009-.009q.024-.024.045-.049a.7.7,0,0,0-.016-.908.645.645,0,0,0-.874-.091l-.005.005-.026.021q-.021.018-.041.037l-.008.008-.01.009-.022.023-2.4,2.383-.009.009a2,2,0,0,0-.292.4l-1.508,1.56a.636.636,0,0,1-.935,0,.69.69,0,0,1,0-.967l4.228-4.374a.682.682,0,0,0,.12-.162h0a.7.7,0,0,0-.094-.793.646.646,0,0,0-.756-.16l-.005,0a.659.659,0,0,0-.161.108l-.037.037L13.191,18.29l-.8.825a.636.636,0,0,1-.935,0,.69.69,0,0,1,0-.967l.567-.586,4.185-4.33a.682.682,0,0,0,.12-.163.7.7,0,0,0-.166-.863.644.644,0,0,0-.85.02l-.005.005-.034.033-4.185,4.329a.636.636,0,0,1-.935,0,.688.688,0,0,1,0-.966L16.14,9.436,17.623,7.9a.7.7,0,0,0,.143-.745.661.661,0,0,0-.61-.422H13.236a.684.684,0,0,1,0-1.368Z" transform="translate(-1.998 -4)" fill="#7c8791"/>
          </svg>
         `,
    },
  ];
  
  const defaultTileAttrs = `
    tile-text="Tile"
    tile-text-color="#ffffff"
    tile-text-align="left"
  
    tile-icon=""
    tile-icon-color="#ffffff"
    tile-icon-align="left"
  
    tile-bg-image=""
    tile-bg-image-opacity=100
  
    tile-action-object="Page"
    tile-action-object-id=""
  `;
  
  const defaultConstraints = `
      data-gjs-draggable="false"
      data-gjs-selectable="false"
      data-gjs-editable="false"
      data-gjs-highlightable="false"
      data-gjs-droppable="false"
      data-gjs-resizable="false"
      data-gjs-hoverable="false"
  `;

let globalVar = null

// Content from utils/helper.js
function addOpacityToHex(hexColor, opacityPercent=100) {
  hexColor = hexColor.replace('#', '');
  if (!/^[0-9A-Fa-f]{6}$/.test(hexColor)) {
      throw new Error('Invalid hex color format. Please use 6 digit hex color (e.g., 758a71)');
  }

  if (opacityPercent < 0 || opacityPercent > 100) {
      throw new Error('Opacity must be between 0 and 100');
  }

  const opacityDecimal = opacityPercent / 100;

  const alphaHex = Math.round(opacityDecimal * 255).toString(16).padStart(2, '0');

  return `#${hexColor}${alphaHex}`;
}

function truncateText(text, length) {
  if (text.length > length) {
    return text.slice(0, length);
  }
  return text;
}

function processTileTitles(projectData) {
  // Helper function to recursively process components
  function processComponent(component) {
    // Check if this is an array of components
    if (Array.isArray(component)) {
      component.forEach(processComponent);
      return;
    }
    
    // If not an object or doesn't have components, return
    if (!component || typeof component !== 'object') {
      return;
    }

    // Check if this is a tile-title component
    if (component.classes && component.classes.includes('tile-title')) {
      // Check if title attribute exists
      if (!component.attributes || !component.attributes.title) {
        // Find the content in the components array
        const textNode = component.components?.find(comp => comp.type === 'textnode');
        if (textNode && textNode.content) {
          // Create attributes object if it doesn't exist
          if (!component.attributes) {
            component.attributes = {};
          }
          // Add the content as title attribute
          component.attributes.title = textNode.content;
        }
      }
    }

    // Recursively process nested components
    if (component.components) {
      processComponent(component.components);
    }
  }

  // Create a deep copy of the project data to avoid modifying the original
  const updatedData = JSON.parse(JSON.stringify(projectData));
  
  // Process the entire project data
  processComponent(updatedData);
  
  return updatedData;
}

