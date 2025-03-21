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
      "no_cta_message",
      "list_all_pages",
      "hide_pages"
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
    console.log('Publish:', payload);
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

  async checkImage(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        if (!response.ok) {
            console.log(`Image not found: ${url} (Status: ${response.status})`);
            return false;
        }
        console.log(`Image exists: ${url}`);
        return true;
    } catch (error) {
        console.log(`Error checking image: ${error.message}`);
        return true;
    }
  }

  async updateDescription (data) {
    return await this.fetchAPI('/api/toolbox/v2/update-service', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContentImage (data) {
    console.log(data)
    return await this.fetchAPI('/api/toolbox/v2/update-service', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteContentImage (data) {
    console.log(data)
    return await this.fetchAPI('/api/toolbox/v2/delete-service-image', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLocationData() {
    return await this.fetchAPI('/api/toolbox/v2/get-location');
  }

  async updateLocationInfo (data) {
    return await this.fetchAPI('/api/toolbox/v2/update-location', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // async deleteLocationInfo (data) {
  //   console.log(data)
  //   return await this.fetchAPI('/api/toolbox/v2/delete-service-image', {
  //     method: 'POST',
  //     body: JSON.stringify(data),
  //   });
  // }
  
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
      console.log("Toolbox initialized successfully", this.themes);
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

      if (inputValue.length > 35) {
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
    // first update the JSON content of each page
    editors.forEach(editorInfo => {
      const page = this.dataManager.pages.SDT_PageCollection.find(
        (page) => page.PageId == editorInfo.pageId);
      this.editorManager.updatePageJSONContent(editorInfo.editor, page);
    });

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

        console.log('>>', res)

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
        // const stack = um.getStack();
        // stack.each(item => {
        //   if (item.getClasses().includes("high-priority-template")) {
        //     console.l
        //   }
        // });
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

  updateContentPageInformationOnEdit() {

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
                    currentStyles["background-color"] = templateBlock.getAttributes()?.["tile-bgcolor"];
                    templateBlock.setStyle(currentStyles);
                    tileImgContainer.style.display = "none";
                    this.setAttributeToSelected("tile-bg-image-url", "");
                    this.setAttributeToSelected("tile-bg-image-opacity", 0);
                    this.ui.updateTileOpacityProperties(templateBlock);
                    this.editorManager.editorEventManager.activateOpacitySlider(templateBlock);
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
        const titleComponent = editor.getSelected().find(".tile-title")[0];
        if (titleComponent) {
          titleComponent.components(service.ProductServiceTileName);
          titleComponent.addStyle({ display: "block" });
        }
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
    //new PageNameEditor(this, page);
    
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
          <div id="page-name-editor">
            <h1 class="title" title=${pageName} style="text-transform: uppercase;">${
              pageName.length > 20 ? pageName.substring(0, 16) + "..." : pageName
            }</h1>
          </div>
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
      if (page.PageIsPredefined && page.PageName === "My Activity") {
        await this.handleMyActivityPage(editor);
      }else if (page.PageIsPredefined && page.PageName === "Calendar") {
        await this.handleCalendarPage(editor);
      } else if (page.PageIsPredefined && page.PageName === "Location") {
        await this.handlePredefinedContentPage(editor, page);
      } else if (page.PageIsPredefined && page.PageName === "Reception") {
        this.handlePredefinedContentPage(editor, page);
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
  async handleMyActivityPage(editor) {
    let pageData = `
      <div class="tb-chat-container" ${defaultConstraints}>
            <div class="tb-toggle-buttons"  ${defaultConstraints}>
                <button style="background-color: #5068a8;border-radius: 6px;"  ${defaultConstraints}>Messages</button>
                <button style="background-color: #e1e1e1;border-radius: 6px;color:rgba(38, 38, 38, 0.47);"  ${defaultConstraints}>Requests</button>
            </div>
            <div class="tb-chat-body" ${defaultConstraints}>No messages yet</div>
        </div>
    `;
    
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
    } catch (error) {
      console.error("Error loading content page data:", error);
    }
  }

  async handlePredefinedContentPage(editor, page) {
    try {
      const res = await this.dataManager.getLocationData();
      if (this.toolsSection.checkIfNotAuthenticated(res)) return;
      console.log("Location data:", res.BC_Trn_Location, "page", page);
      const locationInfo = res.BC_Trn_Location;
      let contentPageData = "";
      if (page.PageName === "Location") {
        contentPageData = {
          ProductServiceImage: locationInfo.LocationImage,
          ProductServiceDescription: locationInfo.LocationDescription,
          // CallToActions: {
          //   CallToActionId: 
          //   CallToActionName: 
          //   CallToActionType: 
          // }
        }
      } else if(page.PageName === "Reception") {
        const defaultDesc = "Welkom bij de receptie van onze app. Hier kunt u al uw vragen stellen en krijgt u direct hulp van ons team. Of het nu gaat om technische ondersteuning, informatie over diensten, of algemene vragen, wij zijn er om u te helpen.";
        const defaultImage = "https://staging.comforta.yukon.software/media/receptie-197@3x.png";
        contentPageData = {
          ProductServiceImage: locationInfo.ReceptionImage === ""? defaultImage: locationInfo.ReceptionImage,
          ProductServiceDescription: locationInfo.ReceptionDescription === ""? defaultDesc: locationInfo.ReceptionDescription,
          // CallToActions: {
          //   CallToActionId: 
          //   CallToActionName: 
          //   CallToActionType: 
          // }
        }
      }

      if (!contentPageData) {
        console.warn("No content page data received");
        return;
      }

      await this.updatePredefinedPageElements(editor, contentPageData);
      // await this.updateEditorCtaButtons(editor, contentPageData);
    } catch (error) {
      console.error("Error loading content page data:", error);
    }
  }

  async updatePredefinedPageElements(editor, contentPageData) {
    const wrapper = editor.DomComponents.getWrapper();
    if (!wrapper) {
      console.error("Wrapper not found in editor");
      return;
    }
    const projectData =
      this.templateManager.initialContentPageTemplate(contentPageData);
    editor.addComponents(projectData)[0];
    // await this.updateImage(wrapper, contentPageData);
    // await this.updateDescription(wrapper, contentPageData);
      // await this.updateEditorCtaButtons(editor, contentPageData);
    this.toolsSection.ui.pageContentCtas(contentPageData.CallToActions, editor);
  }

  async updateContentPageElements(editor, contentPageData) {
    const wrapper = editor.DomComponents.getWrapper();
    if (!wrapper) {
      console.error("Wrapper not found in editor");
      return;
    }

    const existingCtaContainer = editor.getWrapper().find(".cta-button-container")[0];
    const projectData =
      this.templateManager.initialContentPageTemplate(contentPageData);
    
      editor.setComponents(projectData)[0];
    const newContainer = editor.getWrapper().find(".cta-button-container")[0];
    if (existingCtaContainer && newContainer) {
      newContainer.replaceWith(existingCtaContainer);
    }
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
          console.log("Image not found");
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
    editor.on("load", () => {
      this.handleEditorLoad(editor);
      this.updateEditorAfterLoad(editor);
    });
  }

  handleEditorLoad(editor) {
    this.loadTheme();
    const wrapper = editor.getWrapper();
    this.editorManager.toolsSection.currentLanguage.translateTilesTitles(
      editor
    );

    wrapper.view.el.addEventListener("click", (e) => {
      const previousSelected =
        this.editorManager.currentEditor.editor.getSelected();
      if (previousSelected) {
        // this.editorManager.currentEditor.editor.selectRemove(previousSelected);
        // this.editorManager.selectedComponent = null;
        // this.editorManager.selectedTemplateWrapper = null;
      }

      this.handleEditorClick(e, editor);
      new ContentEditorManager(e, editor, this.editorManager);
    });
  }

  updateEditorAfterLoad(editor) {
    const titles = editor.DomComponents.getWrapper().find(".tile-title");
    titles.forEach((title) => {
      if (!title.getAttributes()?.["title"]) {
        title.addAttributes({ title: title.getEl().textContent });
      }

      const displayStyle = title.getStyle()?.["display"];
      if (displayStyle === "none") {
        title.addAttributes({ "is-hidden": "true" });
      } else {
        title.addAttributes({ "is-hidden": "false" });
      }
    });

    const tileIcons = editor.DomComponents.getWrapper().find(".tile-icon");
    tileIcons.forEach((icon) => {
      const displayStyle = icon.getStyle()?.["display"];
      if (displayStyle === "none") {
        icon.addAttributes({ "is-hidden": "true" });
      } else {
        icon.addAttributes({ "is-hidden": "false" });
      }
    });

    const templateBlocks =
      editor.DomComponents.getWrapper().find(".template-block");

    templateBlocks.forEach((block) => {
      const isPriority = block.getClasses()?.includes("high-priority-template");
      const screenWidth = window.innerWidth;

      const parent = block.closest(".container-row");

      const siblingBlocks = parent.find(".template-block").length;
      const isAloneInParent = siblingBlocks === 1;

      const blockHeight =
        screenWidth <= 1440
          ? isPriority && isAloneInParent
            ? "6.0rem"
            : "4.5em"
          : isPriority && isAloneInParent
          ? "7rem"
          : "5rem";

      const currentStyles = block.getStyle();

      if (currentStyles["height"]) {
        delete currentStyles["height"];
      }
      
      delete currentStyles["textTransform"];

      block.setStyle({
        ...currentStyles,
        height: blockHeight+" !important",
      });
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

    document.getElementById("cta-selected-actions").style.display = "none";
  }

  handleTileActionClick(e, editorContainerId) {
    const pageId = e.target.attributes["tile-action-object-id"]?.value;
    const pageUrl = e.target.attributes["tile-action-object-url"]?.value;
    const pageLinkLabel = e.target.attributes["tile-action-object"]?.value;

    let linkLabel = "";
    if (pageLinkLabel) {
      linkLabel = pageLinkLabel
        .replace("Web Link, ", "")
        .replace("Dynamic Forms, ", "");
    }

    let page = this.editorManager.getPage(pageId);
    $(editorContainerId).nextAll().remove();
    console.log('page',page);
    if (page) {
      this.editorManager.createChildEditor(page, pageUrl, linkLabel);
    }else{
      // show new button component
      const container = document.getElementById("child-container");
      this.newPageButton = new NewPageButton(this.editorManager);
      container.appendChild(this.newPageButton.render());

      // page = {
      //   "PageId": null,
      //   "PageName": "New Page",
      //   "PageGJSJson": "",
      //   "PageGJSHtml": "",
      //   "PageJsonContent": ""
      // }
      // this.editorManager.createChildEditor(page, pageUrl, linkLabel);
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
    editor.on("component:selected", (component) => {
      this.handleComponentSelected(component)
    }
    );
    this.editorOnComponentAdd(editor);
  }

  editorOnComponentAdd(editor) {
    editor.on("component:mount", (model) => {
      if (model.get("type") === "svg") {
        model.set({ selectable: false });
      }
      if (model.get("type") === "tile-wrapper") {
        model.addStyle({ background: "#00000000" });
        if (model.find('.template-block').length) {
          const tileComponent = model.find('.template-block')[0];
          const tileBGUrl = tileComponent.getAttributes()["tile-bg-image-url"];
          if (tileBGUrl) {
            this.editorManager.dataManager.checkImage(tileBGUrl).then(res=>{
              console.log(res)
              if (!res) {
                tileComponent.addAttributes({ "tile-bg-image-url": "" });
                tileComponent.addStyle({"background-image": ""});
              }
            })
          }
        }
      }
    });
  }

  editorOnDragDrop(editor) {
    let startDragComponent;
    editor.on("component:drag:start", (model) => {
      startDragComponent = model.parent;
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
      this.templateManager.templateUpdate.updateRightButtons(
        startDragComponent
      );
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

    this.activateOpacitySlider(this.editorManager.selectedComponent);
  }

  activateOpacitySlider(selectedComponent) {
    const attributes = selectedComponent.getAttributes();
    const opacityEl = document.getElementById("slider-wrapper");
    if (attributes?.["tile-bg-image-url"]) {
      opacityEl.style.display = "flex";
      const opacityInput = opacityEl.querySelector("#bg-opacity");
      opacityInput.disabled = false;
      this.editorManager.toolsSection.ui.updateTileOpacityProperties(
        selectedComponent
      );
    } else {
      opacityEl.style.display = "none";
    }
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
        (page.PageIsContentPage && !page.PageIsPredefined) ? "block" : "none";
      document.querySelector("#menu-page-section").style.display =
        (page.PageIsContentPage && !page.PageIsPredefined) ? "none" : "block";
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
    this.screenWidth = window.innerWidth;
  }

  createTemplateHTML(isDefault = false) {
    let tileBgColor = "transparent";
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
                style="background-color:${tileBgColor}; color:#333333; height: ${
      this.screenWidth <= 1440 ? "4.5rem" : "5rem"
    }"
                tile-bgcolor="${tileBgColor}"
                tile-bgcolor-name=""
                tile-color="#333333"

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
                      title="${this.currentLanguage.getTranslation(
                        "tile_title"
                      )}"
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
    let tileBgColor = "transparent";
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
                          data-gjs-type="tile-wrapper"
                          data-gjs-selectable="false"
                          data-gjs-droppable="false">

                          <div class="template-block ${
                            isFirstTileOfFirstRow
                              ? "high-priority-template"
                              : ""
                          }"
                            tile-bgcolor="${tileBgColor}"
                            tile-bgcolor-name=""
                            style="background-color:${tileBgColor}; color:#333333; height: ${
        isFirstTileOfFirstRow
          ? this.screenWidth <= 1440
            ? "6.5rem"
            : "7rem"
          : this.screenWidth <= 1440
          ? "4.5rem"
          : "5rem"
      }"
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

    this.editorManager.toolsSection.mappingComponent.init();
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
    const contentPage = this.addDefaultConstraintsToContentDesc(contentPageData.ProductServiceDescription);
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
                                <div ${defaultConstraints} id="content-image">
                                  <button ${defaultConstraints} class="tb-edit-image-icon">
                                      <svg ${defaultConstraints} width="14px" height="14px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path ${defaultConstraints} fill-rule="evenodd" clip-rule="evenodd" d="M18.4324 4C18.2266 4 18.0227 4.04055 17.8325 4.11933C17.6423 4.19811 17.4695 4.31358 17.3239 4.45914L5.25659 16.5265L4.42524 19.5748L7.47353 18.7434L19.5409 6.67608C19.6864 6.53051 19.8019 6.3577 19.8807 6.16751C19.9595 5.97732 20 5.77348 20 5.56761C20 5.36175 19.9595 5.1579 19.8807 4.96771C19.8019 4.77752 19.6864 4.60471 19.5409 4.45914C19.3953 4.31358 19.2225 4.19811 19.0323 4.11933C18.8421 4.04055 18.6383 4 18.4324 4ZM17.0671 2.27157C17.5 2.09228 17.9639 2 18.4324 2C18.9009 2 19.3648 2.09228 19.7977 2.27157C20.2305 2.45086 20.6238 2.71365 20.9551 3.04493C21.2864 3.37621 21.5492 3.7695 21.7285 4.20235C21.9077 4.63519 22 5.09911 22 5.56761C22 6.03611 21.9077 6.50003 21.7285 6.93288C21.5492 7.36572 21.2864 7.75901 20.9551 8.09029L8.69996 20.3454C8.57691 20.4685 8.42387 20.5573 8.25597 20.6031L3.26314 21.9648C2.91693 22.0592 2.54667 21.9609 2.29292 21.7071C2.03917 21.4534 1.94084 21.0831 2.03526 20.7369L3.39694 15.7441C3.44273 15.5762 3.53154 15.4231 3.6546 15.3001L15.9097 3.04493C16.241 2.71365 16.6343 2.45086 17.0671 2.27157Z" fill="#5068a8"/>
                                      </svg>
                                    </button>
                                    <button ${defaultConstraints} class="tb-delete-image-icon">
                                      <svg fill="#5068a8" ${defaultConstraints} width="14px" height="14px" viewBox="0 0 36 36" version="1.1"  preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                          <title ${defaultConstraints}>delete</title>
                                          <path fill="#5068a8" ${defaultConstraints} class="clr-i-outline clr-i-outline-path-1" d="M27.14,34H8.86A2.93,2.93,0,0,1,6,31V11.23H8V31a.93.93,0,0,0,.86,1H27.14A.93.93,0,0,0,28,31V11.23h2V31A2.93,2.93,0,0,1,27.14,34Z"></path><path class="clr-i-outline clr-i-outline-path-2" d="M30.78,9H5A1,1,0,0,1,5,7H30.78a1,1,0,0,1,0,2Z"></path>
                                          <rect fill="#5068a8" ${defaultConstraints} class="clr-i-outline clr-i-outline-path-3" x="21" y="13" width="2" height="15"></rect>
                                          <rect fill="#5068a8" ${defaultConstraints} class="clr-i-outline clr-i-outline-path-4" x="13" y="13" width="2" height="15"></rect>
                                          <path fill="#5068a8" ${defaultConstraints} class="clr-i-outline clr-i-outline-path-5" d="M23,5.86H21.1V4H14.9V5.86H13V4a2,2,0,0,1,1.9-2h6.2A2,2,0,0,1,23,4Z"></path>
                                          <rect fill="#5068a8" ${defaultConstraints} x="0" y="0" width="36" height="36" fill-opacity="0"/>
                                      </svg>
                                    </button>
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
                                </div>
                            `
                                : ""
                            }
                            ${
                              contentPageData.ProductServiceDescription
                                ? `
                                <div
                                    style="flex: 1; padding: 0; margin: 0; height: auto; white-space: normal;"
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
                                  <button ${defaultConstraints} class="tb-edit-content-icon">
                                    <svg ${defaultConstraints} width="14px" height="14px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path ${defaultConstraints} fill-rule="evenodd" clip-rule="evenodd" d="M18.4324 4C18.2266 4 18.0227 4.04055 17.8325 4.11933C17.6423 4.19811 17.4695 4.31358 17.3239 4.45914L5.25659 16.5265L4.42524 19.5748L7.47353 18.7434L19.5409 6.67608C19.6864 6.53051 19.8019 6.3577 19.8807 6.16751C19.9595 5.97732 20 5.77348 20 5.56761C20 5.36175 19.9595 5.1579 19.8807 4.96771C19.8019 4.77752 19.6864 4.60471 19.5409 4.45914C19.3953 4.31358 19.2225 4.19811 19.0323 4.11933C18.8421 4.04055 18.6383 4 18.4324 4ZM17.0671 2.27157C17.5 2.09228 17.9639 2 18.4324 2C18.9009 2 19.3648 2.09228 19.7977 2.27157C20.2305 2.45086 20.6238 2.71365 20.9551 3.04493C21.2864 3.37621 21.5492 3.7695 21.7285 4.20235C21.9077 4.63519 22 5.09911 22 5.56761C22 6.03611 21.9077 6.50003 21.7285 6.93288C21.5492 7.36572 21.2864 7.75901 20.9551 8.09029L8.69996 20.3454C8.57691 20.4685 8.42387 20.5573 8.25597 20.6031L3.26314 21.9648C2.91693 22.0592 2.54667 21.9609 2.29292 21.7071C2.03917 21.4534 1.94084 21.0831 2.03526 20.7369L3.39694 15.7441C3.44273 15.5762 3.53154 15.4231 3.6546 15.3001L15.9097 3.04493C16.241 2.71365 16.6343 2.45086 17.0671 2.27157Z" fill="#5068a8"/>
                                    </svg>
                                  </button>
                                  <div ${defaultConstraints} id="contentDescription">${contentPage}</div>
                                </div>
                            `
                                : ""
                            }
                        </div>
                    </div>
                </div>
                <div 
                  class="cta-button-container"
                  data-gjs-draggable="false"
                  data-gjs-selectable="false"
                  data-gjs-editable="false"
                  data-gjs-highlightable="false"
                  data-gjs-droppable="[data-gjs-type='cta-buttons']"
                  data-gjs-resizable="false"
                  data-gjs-hoverable="false"
                ></div>
            </div>
        </div>
    `;

  }

  addDefaultConstraintsToContentDesc(htmlContent) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;

    function addAttributesToElements(element) {
      const parser = new DOMParser();
      const constraintsDoc = parser.parseFromString(
        `<div ${defaultConstraints.trim()}></div>`,
        "text/html"
      );
      const constraintsElement = constraintsDoc.body.firstChild;

      for (let attr of constraintsElement.attributes) {
        element.setAttribute(attr.name, attr.value);
      }

      for (let child of element.children) {
        addAttributesToElements(child);
      }
    }

    for (let child of tempDiv.children) {
      addAttributesToElements(child);
    }

    return tempDiv.innerHTML;
  }

  removeElementOnClick(targetSelector, sectionSelector) {
    const closeSection =
      this.editorManager.selectedComponent?.find(targetSelector)[0];
    if (closeSection) {
      const closeEl = closeSection.getEl();
      const selectedComponent = this.editorManager.selectedComponent;
      if (closeEl) {
        closeEl.onclick = () => {
          if (!this.checkIfTileHasTitleOrIcon(selectedComponent)) {
            const message = this.currentLanguage.getTranslation(
              "tile_must_have_title_or_icon"
            );
            this.editorManager.toolsSection.ui.displayAlertMessage(
              message,
              "error"
            );
            return;
          }
          if (sectionSelector === ".tile-title-section") {
            const component = selectedComponent.find(".tile-title")[0];
            component.components("");
            this.editorManager.toolsSection.setAttributeToSelected(
              "TileText",
              ""
            );
            $("#tile-title").val("");
            component.addStyle({ display: "none" });
            component.addAttributes({ title: "" });
            component.addAttributes({ "is-hidden": "true" });
          } else if (sectionSelector === ".tile-icon-section") {
            const component = selectedComponent.find(".tile-icon")[0];
            component.components("");
            this.editorManager.toolsSection.setAttributeToSelected(
              "tile-icon",
              ""
            );
            component.addStyle({ display: "none" });
            component.addAttributes({ "is-hidden": "true" });
          }
        };
      }
    }
  }

  checkIfTileHasTitleOrIcon(selectedComponent) {
    const isIconHidden =
      selectedComponent.find(".tile-icon")[0]?.getAttributes()?.[
        "is-hidden"
      ] === "false";
    const isTitleHidden =
      selectedComponent.find(".tile-title")[0]?.getAttributes()?.[
        "is-hidden"
      ] === "false";

    // Return true if both elements are hidden
    return isIconHidden && isTitleHidden;
  }
}


// Content from classes/TemplateUpdate.js
class TemplateUpdate {
  constructor(templateManager) {
    this.templateManager = templateManager;
  }

  updateRightButtons(containerRow, isTitleEditing = false) {
    if (!containerRow) return;

    const templates = containerRow.components();
    if (!templates.length) return;

    const count = templates.length;
    const styleConfig = this.getStyleConfig(count);
    if (!styleConfig) return;

    const screenWidth = window.innerWidth;
    const isTemplateOne = count === 1;

    this.updateTitleElements(containerRow, count, screenWidth, styleConfig, isTitleEditing);
    this.updateTemplateElements(
      containerRow,
      templates,
      count,
      screenWidth,
      isTemplateOne,
      styleConfig,
      isTitleEditing
    );
  }

  getStyleConfig(count) {
    const styleConfigs = {
      1: {
        title: { "letter-spacing": "1.1px", "font-size": "16px" },
        template: { "justify-content": "start", "align-items": "start" },
        rightButton: { display: "flex" },
        titleSection: { "text-align": "left" },
        attributes: { "tile-align": "left" },
      },
      2: {
        title: { "letter-spacing": "0.9px", "font-size": "14px" },
        template: { "justify-content": "start", "align-items": "start" },
        rightButton: { display: "flex" },
        titleSection: { "text-align": "left" },
        attributes: { "tile-align": "left" },
      },
      3: {
        title: { "letter-spacing": "0.9px", "font-size": "11.5px" },
        template: { "justify-content": "center", "align-items": "center" },
        rightButton: { display: "none" },
        titleSection: { "text-align": "center" },
        attributes: { "tile-align": "center" },
      },
    };

    return styleConfigs[count] || null;
  }

  updateTitleElements(containerRow, count, screenWidth, styleConfig, isTitleEditing) {
    // Update titles
    const titles = containerRow.find(".tile-title");
    titles.forEach((title) => {
      if (!isTitleEditing) {
        title.addStyle({
          ...styleConfig.title,
          "text-align": (count === 3) ? "center" : "left",
        });
      }

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

        title.parent().addStyle({ "text-align": "center" });
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
    styleConfig,
    isTitleEditing
  ) {
    if (isTitleEditing) {
      return;
    }

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
          : "5rem";

      const previousStyles = template.getStyle();
      delete previousStyles["height"];

      const templateStyles = {
        ...styleConfig.template,
        height: templateHeight + "!important",
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

          const tileTitle = templateBlock.find(".tile-title")[0];
          if (tileTitle) {
            tileTitle.addStyle({
              "text-align": "left",
            })
          }
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

          const tileTitle = templateBlock.find(".tile-title")[0];
          if (tileTitle) {
            tileTitle.addStyle({
              "text-align": "center",
            })
          }

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

  }

  setupOpacityListener() {
    const imageOpacity = document.getElementById("bg-opacity");
    
    imageOpacity.addEventListener("input", (event) => {
      const value = event.target.value;
      const selectedComponent = this.toolBoxManager.editorManager.selectedComponent;
      if (selectedComponent) {
        const templateBlock =
          this.toolBoxManager.editorManager.selectedComponent;

        if (templateBlock) {
          const hasBgImage = selectedComponent.getStyle()["background-image"];

          if (!hasBgImage) return;

          templateBlock.addStyle({
            "background-color": `rgba(0,0,0, ${value / 100})`,
          });

          templateBlock.addAttributes({
            "tile-bg-image-opacity": value,
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

                const tileStyle = tile.getStyle();
                if (!tileStyle["background-image"]) {
                  tile.addStyle({
                    "background-color": matchingColorCode,
                  });
                }
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

          if (currentColor === colorValue) {
            selectedComponent.addStyle({
              "background-color": "transparent",
            });

            this.toolBoxManager.setAttributeToSelected("tile-bgcolor", null);
            this.toolBoxManager.setAttributeToSelected(
              "tile-bgcolor-name",
              null
            );

            this.toolBoxManager.setAttributeToSelected(
              "tile-bg-image-opacity",
              0
            );

            this.toolBoxManager.ui.updateTileOpacityProperties(selectedComponent);

            radioInput.checked = false;
            alignItem.style.border = "none";
          } else {
            selectedComponent.addStyle({
              "background-color": colorValue
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
            "tile-color",
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
      color1: "#2c405a",
      color2: "#d4a76a",
      color3: "#b2b997",
      color4: "#c4a082",
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
            const selectedComponent = this.toolBoxManager.editorManager.selectedComponent;
            const iconComponent =
            selectedComponent.find(
                ".tile-icon"
              )[0];
            let tileTextColor =  this.toolBoxManager.editorManager.selectedComponent.getAttributes()["tile-text-color"] || "#333333"
            if (iconComponent) {
              const iconSvgComponent = icon.IconSVG;
              const defaultIconColor = selectedComponent.getAttributes()?.["tile-color"];
              const updatedIconColor = iconSvgComponent.replace(
                'fill="#7c8791"',
                `fill="${defaultIconColor}"`
              );
              iconComponent.addStyle({ display: "block" });
              iconComponent.addAttributes({ "is-hidden": "false" });
              iconComponent.components(updatedIconColor);
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
                defaultIconColor
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
    const selectedComponent = this.manager.editorManager.selectedComponent;
    if (selectedComponent) {
      const titleComponent = selectedComponent.find(".tile-title")[0];
      if (titleComponent) {
        titleComponent.addAttributes({ title: inputTitle });
        titleComponent.addAttributes({ "is-hidden": "false" });

        const isTitleEditing = true;
        // titleComponent.components(inputTitle);
        titleComponent.addStyle({ display: "block" });
        const rowContainer = selectedComponent.closest(".container-row");
        if (rowContainer) {
          this.manager.editorManager.templateManager.templateUpdate.updateRightButtons(
            rowContainer,
            isTitleEditing
          );
        }
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
      this.updateContentPageProperties(selectComponent, page);
    } else {
      this.updateTemplatePageProperties(selectComponent);
    }
  }

  updateContentPageProperties(selectComponent, page) {
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

    const ctaSelectedAction = document.getElementById("cta-selected-actions");
    document.getElementById("cta-selected-actions").style.display = "flex";
    const attributes = selectComponent?.getAttributes();
    if (selectComponent) {
      const actionUrl = attributes?.["cta-button-action"];
      let referenceName;
      if (attributes?.["cta-button-type"] === "Form") {
        const formLinkParams = new URL(actionUrl).searchParams;
        referenceName = formLinkParams.get("WWPFormReferenceName");
      }

      ctaSelectedAction.innerHTML = `
        <span><strong>Type:</strong> ${attributes?.["cta-button-type"]}</span>
        <span><strong>Action:</strong> ${
          attributes?.["cta-button-type"] === "Form"
            ? referenceName
            : attributes?.["cta-button-type"] === "SiteUrl"
            ? `<a href="${attributes?.["cta-button-action"]}" target="_blank">${attributes?.["cta-button-label"]}</a>`
            : attributes?.["cta-button-action"]
        }</span>
      `;
    } else {
      ctaSelectedAction.innerHTML = "";
    }
  }

  updateTemplatePageProperties(selectComponent) {
    this.updateTileOpacityProperties(selectComponent);
    this.updateAlignmentProperties(selectComponent);
    this.updateColorProperties(selectComponent);
    this.updateActionProperties(selectComponent);
    this.updateTileIconProperties(selectComponent);
  }

  updateTileOpacityProperties(selectComponent) {
    const tileOpacity =
      selectComponent?.getAttributes()?.["tile-bg-image-opacity"] || 0;
    document.getElementById("bg-opacity").value = tileOpacity;
    document.getElementById("valueDisplay").textContent = tileOpacity + " %";
  }

  updateAlignmentProperties(selectComponent) {
    const currentAlign = selectComponent?.getAttributes()?.["tile-align"];
    if (currentAlign) {
      ["center", "left"].forEach((align) => {
        const alignElement = document.getElementById(`tile-${align}`);
        if (alignElement) {
          alignElement.checked = currentAlign === align;
        }
      });
    }
  }

  updateColorProperties(selectComponent) {
    const currentTextColor = selectComponent?.getAttributes()?.["tile-color"];
    const textColorRadios = document.querySelectorAll(
      '.text-color-palette.text-colors .color-item input[type="radio"]'
    );
    textColorRadios.forEach((radio) => {
      const colorBox = radio.nextElementSibling;
      radio.checked =
        colorBox.getAttribute("data-tile-color") === currentTextColor;
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
    let currentActionName =
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
    if (currentActionName && currentActionId) {
      currentActionName = currentActionName
        .replace("Predefined Page", "Module") // Replace Predefined Page with Module (Temporary Fix)
        .replace("Service/Product Page", "Service Page"); // Replace Predefined Page with Module (Temporary Fix)
      propertySection.textContent = currentActionName;
      propertySection.innerHTML += ' <i class="fa fa-angle-down"></i>';
      if (selectedOptionElement) {
        selectedOptionElement.style.background = "#f0f0f0";
      }
    }
  }

  updateTileIconProperties(selectedComponent) {
    const selectedTileIcon = selectedComponent?.getAttributes()?.["tile-icon"];
    if (selectedTileIcon) {
      const iconsListSection = document.getElementById("icons-list");
      if (iconsListSection) {
        const icons = iconsListSection.querySelectorAll(".icon");
        icons.forEach((icon) => {
          if (icon.title === selectedTileIcon) {
            icon.classList.add("selected-tile-icon");
          } else {
            icon.classList.remove("selected-tile-icon");
          }
        });
      }
    }
  }

  pageContentCtas(callToActions, editorInstance) {
    if (callToActions == null || callToActions.length <= 0) {
      this.noCtaSection();
    } else {
      const contentPageCtas = document.getElementById("call-to-actions");
      document.getElementById("cta-style").style.display = "flex";
      document.getElementById("no_cta_message").style.display = "none";

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
    ctaItem.innerHTML = `${ctaType.icon}`;

    return ctaItem;
  }

  getCtaType(type) {
    const ctaTypeMap = {
      Phone: {
        icon: `<svg ${defaultConstraints} xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 49.417 49.418">
                <path ${defaultConstraints} id="call" d="M29.782,3a2.149,2.149,0,1,0,0,4.3A19.3,19.3,0,0,1,49.119,26.634a2.149,2.149,0,1,0,4.3,0A23.667,23.667,0,0,0,29.782,3ZM12.032,7.305a2.548,2.548,0,0,0-.818.067,8.342,8.342,0,0,0-3.9,2.342C2.775,14.254.366,21.907,17.437,38.98S42.16,53.643,46.7,49.1a8.348,8.348,0,0,0,2.346-3.907,2.524,2.524,0,0,0-1.179-2.786c-2.424-1.418-7.654-4.484-10.08-5.9a2.523,2.523,0,0,0-2.568.012l-4.012,2.392a2.517,2.517,0,0,1-2.845-.168,65.811,65.811,0,0,1-5.711-4.981,65.07,65.07,0,0,1-4.981-5.711A2.512,2.512,0,0,1,17.5,25.2L19.9,21.191a2.533,2.533,0,0,0,.008-2.577L14.012,8.556A2.543,2.543,0,0,0,12.032,7.305Zm17.751,4.289a2.149,2.149,0,1,0,0,4.3A10.709,10.709,0,0,1,40.525,26.634a2.149,2.149,0,1,0,4.3,0A15.072,15.072,0,0,0,29.782,11.594Zm0,8.594a2.149,2.149,0,1,0,0,4.3,2.114,2.114,0,0,1,2.149,2.148,2.149,2.149,0,1,0,4.3,0A6.479,6.479,0,0,0,29.782,20.188Z" transform="translate(-4 -3)" fill="#fff"></path>
              </svg>`,
        iconList: ".fas.fa-phone-alt",
        iconBgColor: "#2c405a",
      },
      Email: {
        icon: `<svg ${defaultConstraints} xmlns="http://www.w3.org/2000/svg" width="32" height="28" viewBox="0 0 41 32.8">
            <path ${defaultConstraints} id="Path_1218" data-name="Path 1218" d="M6.1,4A4.068,4.068,0,0,0,2.789,5.7a1.5,1.5,0,0,0,.444,2.126l18,11.219a2.387,2.387,0,0,0,2.531,0L41.691,7.732a1.5,1.5,0,0,0,.384-2.2A4.063,4.063,0,0,0,38.9,4Zm35.907,8.376a.963.963,0,0,0-.508.152L23.765,23.711a2.392,2.392,0,0,1-2.531,0L3.5,12.656a.98.98,0,0,0-1.5.833V32.7a4.1,4.1,0,0,0,4.1,4.1H38.9A4.1,4.1,0,0,0,43,32.7V13.357A.981.981,0,0,0,42.007,12.376Z" transform="translate(-2 -4)" fill="#fff"/>
          </svg>`,
        iconList: ".fas.fa-envelope",
        iconBgColor: "#d4a76a",
      },
      SiteUrl: {
        icon: `<svg ${defaultConstraints} xmlns="http://www.w3.org/2000/svg" width="26" height="30" viewBox="0 0 9.552 9.552">
              <path ${defaultConstraints} id="Path_1213" data-name="Path 1213" d="M11.064,4A2.485,2.485,0,0,0,9.3,4.734l-.585.585A2.488,2.488,0,0,0,7.98,7.084a2.45,2.45,0,0,0,.174.908L8.8,7.346a1.706,1.706,0,0,1,.473-1.468l.585-.585a1.7,1.7,0,0,1,1.206-.5,1.675,1.675,0,0,1,1.194.5,1.7,1.7,0,0,1,0,2.4l-.585.585a1.7,1.7,0,0,1-1.206.5,1.456,1.456,0,0,1-.261-.025L9.559,9.4a2.45,2.45,0,0,0,.908.174,2.486,2.486,0,0,0,1.766-.734l.585-.585a2.488,2.488,0,0,0,.734-1.766A2.506,2.506,0,0,0,11.064,4Zm-.983,2.9L6.9,10.082l.572.572L10.654,7.47Zm-3,1.082a2.485,2.485,0,0,0-1.766.734L4.734,9.3A2.488,2.488,0,0,0,4,11.064a2.506,2.506,0,0,0,2.487,2.487,2.486,2.486,0,0,0,1.766-.734l.585-.585a2.488,2.488,0,0,0,.734-1.766A2.45,2.45,0,0,0,9.4,9.559l-.647.647a1.706,1.706,0,0,1-.473,1.468l-.585.585a1.7,1.7,0,0,1-1.206.5,1.675,1.675,0,0,1-1.194-.5,1.7,1.7,0,0,1,0-2.4l.585-.585a1.7,1.7,0,0,1,1.206-.5,1.457,1.457,0,0,1,.261.025l.647-.647A2.45,2.45,0,0,0,7.084,7.98Z" transform="translate(-4 -4)" fill="#fff"/>
            </svg>`,
        iconList: ".fas.fa-link",
        iconBgColor: "#b2b997",
      },
      Form: {
        icon: `<svg ${defaultConstraints} xmlns="http://www.w3.org/2000/svg" width="26" height="30" viewBox="0 0 13 16">
            <path ${defaultConstraints} id="Path_1209" data-name="Path 1209" d="M9.828,4A1.823,1.823,0,0,0,8,5.8V18.2A1.823,1.823,0,0,0,9.828,20h9.344A1.823,1.823,0,0,0,21,18.2V9.8a.6.6,0,0,0-.179-.424l-.006-.006L15.54,4.176A.614.614,0,0,0,15.109,4Zm0,1.2H14.5V8.6a1.823,1.823,0,0,0,1.828,1.8h3.453v7.8a.6.6,0,0,1-.609.6H9.828a.6.6,0,0,1-.609-.6V5.8A.6.6,0,0,1,9.828,5.2Zm5.891.848L18.92,9.2H16.328a.6.6,0,0,1-.609-.6Z" transform="translate(-8 -4)" fill="#fff"/>
          </svg>`,
        iconList: ".fas.fa-file",
        iconBgColor: "#c4a082",
      },
    };

    return (
      ctaTypeMap[type] || {
        icon: "fas fa-question",
        iconList: ".fas.fa-question",
        iconBgColor: "#c4a082",
      }
    );
  }

  generateCtaComponent(cta, backgroundColor) {
    const ctaType = this.getCtaType(cta.CallToActionType);
    return `
      <div class="cta-container-child cta-child" 
            id="id-${cta.CallToActionId}"
            data-gjs-type="cta-buttons"
            cta-button-id="${cta.CallToActionId}"
            data-gjs-draggable="true"
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
          >
            <div class="cta-button" ${defaultConstraints} style="background-color: ${
      backgroundColor || ctaType.iconBgColor
    };">
              ${ctaType.icon}
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
      Phone: `<svg ${defaultConstraints} xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 49.417 49.418">
                <path ${defaultConstraints} id="call" d="M29.782,3a2.149,2.149,0,1,0,0,4.3A19.3,19.3,0,0,1,49.119,26.634a2.149,2.149,0,1,0,4.3,0A23.667,23.667,0,0,0,29.782,3ZM12.032,7.305a2.548,2.548,0,0,0-.818.067,8.342,8.342,0,0,0-3.9,2.342C2.775,14.254.366,21.907,17.437,38.98S42.16,53.643,46.7,49.1a8.348,8.348,0,0,0,2.346-3.907,2.524,2.524,0,0,0-1.179-2.786c-2.424-1.418-7.654-4.484-10.08-5.9a2.523,2.523,0,0,0-2.568.012l-4.012,2.392a2.517,2.517,0,0,1-2.845-.168,65.811,65.811,0,0,1-5.711-4.981,65.07,65.07,0,0,1-4.981-5.711A2.512,2.512,0,0,1,17.5,25.2L19.9,21.191a2.533,2.533,0,0,0,.008-2.577L14.012,8.556A2.543,2.543,0,0,0,12.032,7.305Zm17.751,4.289a2.149,2.149,0,1,0,0,4.3A10.709,10.709,0,0,1,40.525,26.634a2.149,2.149,0,1,0,4.3,0A15.072,15.072,0,0,0,29.782,11.594Zm0,8.594a2.149,2.149,0,1,0,0,4.3,2.114,2.114,0,0,1,2.149,2.148,2.149,2.149,0,1,0,4.3,0A6.479,6.479,0,0,0,29.782,20.188Z" transform="translate(-4 -3)" fill="#fff"></path>
              </svg>`,
      Email: `<svg ${defaultConstraints} xmlns="http://www.w3.org/2000/svg" width="32" height="28" viewBox="0 0 41 32.8">
            <path ${defaultConstraints} id="Path_1218" data-name="Path 1218" d="M6.1,4A4.068,4.068,0,0,0,2.789,5.7a1.5,1.5,0,0,0,.444,2.126l18,11.219a2.387,2.387,0,0,0,2.531,0L41.691,7.732a1.5,1.5,0,0,0,.384-2.2A4.063,4.063,0,0,0,38.9,4Zm35.907,8.376a.963.963,0,0,0-.508.152L23.765,23.711a2.392,2.392,0,0,1-2.531,0L3.5,12.656a.98.98,0,0,0-1.5.833V32.7a4.1,4.1,0,0,0,4.1,4.1H38.9A4.1,4.1,0,0,0,43,32.7V13.357A.981.981,0,0,0,42.007,12.376Z" transform="translate(-2 -4)" fill="#fff"/>
          </svg>`,
      SiteUrl: `<svg ${defaultConstraints} xmlns="http://www.w3.org/2000/svg" width="26" height="30" viewBox="0 0 9.552 9.552">
              <path ${defaultConstraints} id="Path_1213" data-name="Path 1213" d="M11.064,4A2.485,2.485,0,0,0,9.3,4.734l-.585.585A2.488,2.488,0,0,0,7.98,7.084a2.45,2.45,0,0,0,.174.908L8.8,7.346a1.706,1.706,0,0,1,.473-1.468l.585-.585a1.7,1.7,0,0,1,1.206-.5,1.675,1.675,0,0,1,1.194.5,1.7,1.7,0,0,1,0,2.4l-.585.585a1.7,1.7,0,0,1-1.206.5,1.456,1.456,0,0,1-.261-.025L9.559,9.4a2.45,2.45,0,0,0,.908.174,2.486,2.486,0,0,0,1.766-.734l.585-.585a2.488,2.488,0,0,0,.734-1.766A2.506,2.506,0,0,0,11.064,4Zm-.983,2.9L6.9,10.082l.572.572L10.654,7.47Zm-3,1.082a2.485,2.485,0,0,0-1.766.734L4.734,9.3A2.488,2.488,0,0,0,4,11.064a2.506,2.506,0,0,0,2.487,2.487,2.486,2.486,0,0,0,1.766-.734l.585-.585a2.488,2.488,0,0,0,.734-1.766A2.45,2.45,0,0,0,9.4,9.559l-.647.647a1.706,1.706,0,0,1-.473,1.468l-.585.585a1.7,1.7,0,0,1-1.206.5,1.675,1.675,0,0,1-1.194-.5,1.7,1.7,0,0,1,0-2.4l.585-.585a1.7,1.7,0,0,1,1.206-.5,1.457,1.457,0,0,1,.261.025l.647-.647A2.45,2.45,0,0,0,7.084,7.98Z" transform="translate(-4 -4)" fill="#fff"/>
            </svg>`,
      Form: `<svg ${defaultConstraints} xmlns="http://www.w3.org/2000/svg" width="26" height="30" viewBox="0 0 13 16">
            <path ${defaultConstraints} id="Path_1209" data-name="Path 1209" d="M9.828,4A1.823,1.823,0,0,0,8,5.8V18.2A1.823,1.823,0,0,0,9.828,20h9.344A1.823,1.823,0,0,0,21,18.2V9.8a.6.6,0,0,0-.179-.424l-.006-.006L15.54,4.176A.614.614,0,0,0,15.109,4Zm0,1.2H14.5V8.6a1.823,1.823,0,0,0,1.828,1.8h3.453v7.8a.6.6,0,0,1-.609.6H9.828a.6.6,0,0,1-.609-.6V5.8A.6.6,0,0,1,9.828,5.2Zm5.891.848L18.92,9.2H16.328a.6.6,0,0,1-.609-.6Z" transform="translate(-8 -4)" fill="#fff"/>
          </svg>`,
    };
    return iconMap[ctaType] || "fas fa-question";
  }

  // Generate common button attributes
  getCommonButtonAttributes(ctaAttributes) {
    const { ctaId, ctaName, ctaType, ctaAction, ctaButtonBgColor } =
      ctaAttributes;
    return `
      data-gjs-draggable="true"
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
          <span class="img-button-icon" ${defaultConstraints}>${icon}</span>
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
      const noCtaDisplayMessage = document.getElementById("no_cta_message");
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

// Content from components/FormPopupModal.js
class FormPopupModal {
    title = ""
    htmlBody = ""
    popup = null
    onConfirmHandler = null
    
    constructor(popupId, title, htmlBody, onConfirmHandler = null) {
        this.title = title
        this.htmlBody = htmlBody
        this.popupId = popupId
        this.onConfirmHandler = onConfirmHandler || this.defaultConfirmHandler
        this.popup = this.createPopup()
    }

    init(){}

    show() {
        document.body.appendChild(this.popup);
        this.popup.style.display = "flex";
        this.addEventListeners()
    }

    closePopup() {
        this.popup.remove()
    }

    createPopup () {
        const popup = document.createElement("div");
        popup.className = "popup-modal";
        popup.innerHTML = `
                <div id="${this.popupId}" class="popup">
                <div class="popup-header">
                    <span>${this.title}</span>
                    <button class="close">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 21 21">
                        <path id="Icon_material-close" data-name="Icon material-close" d="M28.5,9.615,26.385,7.5,18,15.885,9.615,7.5,7.5,9.615,15.885,18,7.5,26.385,9.615,28.5,18,20.115,26.385,28.5,28.5,26.385,20.115,18Z" transform="translate(-7.5 -7.5)" fill="#6a747f" opacity="0.54"/>
                    </svg>
                    </button>
                </div>
                <hr>
                <div class="popup-body" id="confirmation_modal_message">
                    ${this.htmlBody}
                </div>
                <div class="popup-footer">
                    <button id="confirm_button" class="tb-btn tb-btn-primary">
                    Confirm
                    </button>
                    <button id="close_popup" class="tb-btn tb-btn-outline">
                    Cancel
                    </button>
                </div>
                </div>
            `;

        return popup;
    }

    defaultConfirmHandler(event) {
        alert('Please provide a confirm handler function')
    }

    onConfirm(event) {
        this.onConfirmHandler(event)
    }

    addEventListeners () {
        this.cancelButton = document.querySelector(`#close_popup`)
        this.cancelButton.addEventListener("click", (event) => {
            this.closePopup()
        })

        this.closeButton = document.querySelector(`.close`)
        this.closeButton.addEventListener("click", (event) => {
            this.closePopup()
        })

        this.confirmButton = document.querySelector(`#confirm_button`)
        this.confirmButton.addEventListener("click", (event) => {
            this.onConfirm(event)
        })
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
        displayName: "Forms",
        label: this.currentLanguage.getTranslation("category_dynamic_form"),
        options: [],
      },
      {
        name: "Predefined Page",
        displayName: "Modules",
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
        (page) => page.PageIsPredefined && 
                  page.PageName !== "Home" && 
                  page.PageName !== "Web Link" && 
                  page.PageName !== "Dynamic Forms"
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
        const pageTitle = "Web Link";

        this.createWebLinkOrFormPage(linkUrl, linkLabel, pageTitle);
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
          errorField.textContent =
            "Page title must be at least 3 characters long";
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
          item.textContent,
          item.dataset.objectUrl
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

  async handlePageCreation(category, itemId, editorContainerId, itemText, formUrl="") {
    try {
      $(editorContainerId).nextAll().remove();
      switch (category) {
        case "Service/Product Page":
          await this.createContentPage(itemId, editorContainerId);
          break;
        case "Dynamic Forms":
          this.createDynamicFormPage(itemId,itemText, formUrl);
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

  async createDynamicFormPage(itemId,formName, formUrl) {
    const pageTitle = "Dynamic Forms";
    const linkUrl = `${baseURL}/utoolboxdynamicform.aspx?WWPFormId=${itemId}&WWPDynamicFormMode=DSP&DefaultFormType=&WWPFormType=0`;

    this.createWebLinkOrFormPage(linkUrl, formName, pageTitle, formUrl);
  }

  async createWebLinkOrFormPage(linkUrl, linkLabel, pageTitle, formUrl) {
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
          (page) => page.PageName === pageTitle
        );
        if (!page) {
          console.warn("page not found");
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
          "tile-action-form-url",
          formUrl
        );

        this.toolBoxManager.setAttributeToSelected(
          "tile-action-object",
          `${pageTitle}, ${linkLabel}`
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

  async getPage() {
    const res = await this.dataManager.getPages();
      if (this.toolBoxManager.checkIfNotAuthenticated(res)) {
        return;
      }
    
    return res.SDT_PageCollection;
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
    document.getElementById("list_all_pages").style.display = "block";
    document.getElementById("hide_pages").style.display = "none";
    this.homePage = this.dataManager.pages.SDT_PageCollection.find(
      (page) => page.PageName == "Home"
    );
    if (this.homePage) {
      this.createPageTree(this.homePage.PageId, "tree-container");
    }
  }

  listPagesListener() {
    const listAllPages = document.getElementById("list_all_pages");
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
    const listAllPages = document.getElementById("list_all_pages");
    listAllPages.style.display = "none";

    const hidePagesList = document.getElementById("hide_pages");
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

      const updateIcon = document.createElement("i");
      updateIcon.classList.add("fa-regular", "fa-edit", "tb-update-icon");

      if (item.PageName === "Home" || item.PageName === "Web Link") {
        deleteIcon.style.display = "none";
        updateIcon.style.display = "none";
      }

      const iconDiv = document.createElement("div");
      iconDiv.classList.add("tb-menu-icons-container");

      deleteIcon.setAttribute("data-id", item.Id);
      updateIcon.setAttribute("data-id", item.Id);

      deleteIcon.addEventListener("click", (event) =>
        handleDelete(event, item.PageId, listItem)
      );

      updateIcon.addEventListener("click", (event) =>
        this.handleUpdate(item.PageId)
      );

      menuItem.appendChild(toggle);
      if (item.PageName === "Web Link") {
        menuItem.style.display = "none";
      }
      if (item.Name !== "Home") {
        iconDiv.append(updateIcon);
        iconDiv.append(deleteIcon);
        menuItem.appendChild(iconDiv);
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
            this.editorManager.removePageOnTileDelete(
              editorContainerId.replace("#", "")
            );
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

  handleUpdate(PageId) {
    const page = this.getPage(PageId);
    if (page) {
      const htmlBody = `
      <input required class="tb-form-control" type="text" id="pageName" placeholder="" value="${page.PageName}"/>
      <small id="error_pageName" style="display:none; color:red"></small>
      `;
      const formPopup = new FormPopupModal(
        "update-page-popup",
        "Update Page",
        htmlBody
      );
      formPopup.onConfirm = (event) => {
        const input = document.querySelector(`#update-page-popup #pageName`);
        const errorLabel = document.querySelector(
          `#update-page-popup #error_pageName`
        );

        if (input.value) {
          const reservedNames = [
            "Home",
            "Reception",
            "Location",
            "Calendar",
            "My Activity",
            "Web Link",
            "Dynamic Forms"
          ];
          if (reservedNames.includes(input.value)) {
            errorLabel.innerHTML = "This name is reserved";
            errorLabel.style.display = "block";
            return;
          }
          page.PageName = input.value;
          this.dataManager.updatePage(page).then((res) => {
            if (res.result) {
              this.toolBoxManager.ui.displayAlertMessage(res.result, "success");
              formPopup.closePopup();
              this.init();
            }
          });
        } else {
          errorLabel.innerHTML = "This field is required";
          errorLabel.style.display = "block";
        }
      };
      formPopup.show();
    }
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
          console.log(this.selectedFile)
          const safeMediaUrl = encodeURI(this.selectedFile.MediaUrl);
          this.closeModal(modal, fileInputField);
          if (this.type === "logo") {
            this.changeLogo(safeMediaUrl);
          } else if (this.type === "profile-image") {
            this.changeProfile(safeMediaUrl);
          } else if (this.type === "update-content-image") {
            this.changeServiceImage(safeMediaUrl);
          } else if (this.type === "update-location-image") {
            this.changeLocationImage(safeMediaUrl);
          } else if (this.type === "update-reception-image") {
            this.changeReceptionImage(safeMediaUrl);
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
          "background-color": "",
        });
      } else {
        console.error("MediaUrl is missing or undefined", this.selectedFile);
      }

      this.toolBoxManager.setAttributeToSelected(
        "tile-bg-image-url",
        this.selectedFile.MediaUrl
      );

      this.toolBoxManager.setAttributeToSelected(
        "tile-bg-image-opacity",
        0
      );

      this.editorManager.editorEventManager.activateOpacitySlider(templateBlock);
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

  async changeServiceImage(newImageUrl) {
    try {
      const base64String = await imageToBase64(newImageUrl);
      
      const data = {
        ProductServiceId: this.editorManager.currentPageId,
        ProductServiceDescription: "",
        ProductServiceImageBase64: base64String
      };

      const res = await this.editorManager.dataManager.updateContentImage(data);
      
      if (res) {
        console.log(res)
        const imageComponent = this.editorManager
          .currentEditor.editor.Components
            .getWrapper().find("#product-service-image")[0];
        if (imageComponent) {
          imageComponent.setAttributes({
            src: newImageUrl,
            alt: "Product Service Image"
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async changeLocationImage(newImageUrl) {
    try {
      const base64String = await imageToBase64(newImageUrl);
      
      const data = {
        LocationDescription: "",
        LocationImageBase64: base64String,
        ReceptionDescription: "",
        ReceptionImageBase64: ""
      };

      const res = await this.editorManager.dataManager.updateLocationInfo(data);
      
      if (res) {
        console.log(res)
        const imageComponent = this.editorManager
          .currentEditor.editor.Components
            .getWrapper().find("#product-service-image")[0];
        if (imageComponent) {
          imageComponent.setAttributes({
            src: newImageUrl,
            alt: "Location Image"
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  } 

  async changeReceptionImage(newImageUrl) {
    try {
      const base64String = await imageToBase64(newImageUrl);
      
      const data = {
        LocationDescription: "",
        LocationImageBase64: "",
        ReceptionDescription: "",
        ReceptionImageBase64: base64String
      };

      const res = await this.editorManager.dataManager.updateLocationInfo(data);
      
      if (res) {
        console.log(res)
        const imageComponent = this.editorManager
          .currentEditor.editor.Components
            .getWrapper().find("#product-service-image")[0];
        if (imageComponent) {
          imageComponent.setAttributes({
            src: newImageUrl,
            alt: "Location Image"
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
}


// Content from components/NewPageComponent.js
class NewPageComponent  {
    constructor(editorManager) {
        this.editorManager = editorManager;
        this.dataManager = editorManager.dataManager;
    }
    createNewPageMenu() {
        // Create the menu container
        const menu = document.createElement('div');
        menu.classList.add('tb-menu');

        // Create first child div
        const addMenuPage = document.createElement('div');
        addMenuPage.textContent = 'Add menu page';
        addMenuPage.addEventListener('click', () => {
            this.createNewPage('Untitled', false);
        });

        // Create second child div
        const addNewPage = document.createElement('div');
        addNewPage.textContent = 'Add content page';
        addNewPage.addEventListener('click', () => {
            this.editorManager.toolsSection.newServiceEvent()
            // this.createNewPage('Untitled', true);
        });

        // Append child divs to menu
        menu.appendChild(addMenuPage);
        menu.appendChild(addNewPage);
        const container = document.getElementById(`new-page-menu`);
        container.appendChild(menu);
    }

    async createNewPage(title, isServicePage = false) {
        const editor = this.editorManager.getCurrentEditor();
        const selected = editor.getSelected();
        if (!selected) return;

        const titleComponent = selected.find(".tile-title")[0];
        // const tileTitle = this.truncateText(title, 12);
        const tileTitle = title;
        const editorId = editor.getConfig().container;
        const editorContainerId = `${editorId}-frame`;
        let res;
        if (isServicePage) {
            res = await this.dataManager.createContentPage('039fbad2-7a24-4111-8394-638e8e44a680')
        }else {
            res = await this.dataManager.createNewPage(title, this.editorManager.toolsSection.currentTheme)
        }
        
        if (this.editorManager.toolsSection.checkIfNotAuthenticated(res)) {
            return;
        }

        const result = JSON.parse(res.result);
        const pageId = result.Trn_PageId;
        const pageName = result.Trn_PageName;

        this.dataManager.getPages().then((res) => {
        this.editorManager.toolsSection.actionList.init();

        this.editorManager.toolsSection.setAttributeToSelected(
            "tile-action-object-id",
            pageId
        );

        this.editorManager.toolsSection.setAttributeToSelected(
            "tile-action-object",
            `Page, ${pageName}`
        );

        $(editorContainerId).nextAll().remove();
        this.editorManager.createChildEditor(
            this.editorManager.getPage(pageId)
        );
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
        
    }
}

// Content from components/NewPageButton.js
class NewPageButton {
    constructor(editorManager) {
        this.editorManager = editorManager;
        this.editorManager = editorManager;
        this.dataManager = editorManager.dataManager;
        this.render();
    }

    render() {
        // Create menu container
        const menuContainer = document.createElement("div");
        menuContainer.classList.add("menu-container");

        // Create button
        const menuButton = document.createElement("button");
        menuButton.classList.add("menu-button");
        menuButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24.053" height="26.783" viewBox="0 0 24.053 26.783">                 <path class="icon-path" d="M2.672.038a2.041,2.041,0,0,0-1.4.408,2.87,2.87,0,0,0-1.154,1.6l-.094.3V22.761l.093.32a2.724,2.724,0,0,0,.7,1.207,2.65,2.65,0,0,0,1.04.706l.288.117H7.692c5.545,0,5.555,0,5.629.083a4.979,4.979,0,0,0,.418.337A6.472,6.472,0,0,0,16.6,26.738a8.81,8.81,0,0,0,2,0,6.5,6.5,0,0,0,5.409-5.425,7.669,7.669,0,0,0-.023-2.078,6.5,6.5,0,0,0-4.323-5.046,5.3,5.3,0,0,0-.516-.152L19,14.012l.012-2.195c.01-1.66,0-2.305-.042-2.651l-.054-.457-.445-.487Q16.888,6.5,15.289,4.8c-3.2-3.414-4.34-4.6-4.541-4.714A23.429,23.429,0,0,0,6.971.016q-2.15-.009-4.3.022m6.82,4.753a14.651,14.651,0,0,0,.1,3.184,2.955,2.955,0,0,0,1.551,1.847c.5.24.518.241,4.914.258l1.135.005V13.85l-.371.051a6.48,6.48,0,0,0-5.495,8.034,6.926,6.926,0,0,0,.4,1.126l.083.162H2.345l-.168-.144a1.487,1.487,0,0,1-.269-.315l-.1-.171L1.8,12.612l-.01-9.98L1.9,2.4a.736.736,0,0,1,.626-.476c.123-.013,1.737-.026,3.585-.03l3.361-.006.018,2.9m3.87.641c.885.935,1.82,1.926,2.078,2.2l.468.5-.531.032c-.292.018-1.155.024-1.917.014-1.6-.022-1.718-.041-1.925-.3a1.537,1.537,0,0,1-.171-.27c-.056-.133-.1-3.62-.053-4.071l.028-.261.206.227c.114.125.932.992,1.817,1.927m5.066,9.959a5.047,5.047,0,0,1,3.626,2.649,4.5,4.5,0,0,1,.545,2.29,4.806,4.806,0,0,1-.843,2.818,6.309,6.309,0,0,1-1.393,1.374,5.022,5.022,0,0,1-7.053-1.6,5.09,5.09,0,0,1-.467-4.129A5.21,5.21,0,0,1,14.1,16.765a4.988,4.988,0,0,1,4.328-1.374m-.972,1.85a.638.638,0,0,0-.241.158l-.119.124-.012,1.223-.012,1.223H15.9c-1.1,0-1.182,0-1.305.08a.528.528,0,0,0-.217.721c.146.272.206.283,1.523.283h1.176v1.191c0,1.124,0,1.2.081,1.322a.539.539,0,0,0,.913-.01c.063-.1.072-.242.083-1.305l.012-1.2H19.33c1.263,0,1.307-.006,1.479-.225a.6.6,0,0,0,0-.611c-.143-.234-.229-.248-1.5-.248H18.161V18.854a11.308,11.308,0,0,0-.041-1.265.549.549,0,0,0-.663-.348" fill="#6e7276" fill-rule="evenodd"/>             </svg>`;

        // Create dropdown menu
        const dropdownMenu = document.createElement("div");
        dropdownMenu.classList.add("menu");
        dropdownMenu.id = "dropdownMenu";

        // Create menu items
        const menuItem1 = document.createElement("div");
        menuItem1.classList.add("menu-item");
        menuItem1.textContent = "Add menu page";
        menuItem1.addEventListener("click", () => {
            this.createNewPage("Untitled", false);
        });

        const menuItem2 = document.createElement("div");
        menuItem2.classList.add("menu-item");
        menuItem2.textContent = "Add content page";
        menuItem2.addEventListener("click", () => {
            this.editorManager.toolsSection.newServiceEvent()
            //this.createNewPage("Untitled", true);
        });

        dropdownMenu.appendChild(menuItem1);
        dropdownMenu.appendChild(menuItem2);

        menuButton.addEventListener("click", (e) => {
            e.preventDefault(); 
        });

        // Append elements to the container
        menuContainer.appendChild(menuButton);
        menuContainer.appendChild(dropdownMenu);

        return menuContainer;
    }

    async createNewPage(title, isServicePage = false) {
        const editor = this.editorManager.getCurrentEditor();
        const selected = editor.getSelected();
        if (!selected) return;

        const titleComponent = selected.find(".tile-title")[0];
        // const tileTitle = this.truncateText(title, 12);
        const tileTitle = title;
        const editorId = editor.getConfig().container;
        const editorContainerId = `${editorId}-frame`;
        let res;
        if (isServicePage) {
            res = await this.dataManager.createContentPage('80db3166-d4e2-4bd3-83c8-0ebfcd2a704d')
        }else {
            res = await this.dataManager.createNewPage(title, this.editorManager.toolsSection.currentTheme)
        }
        
        if (this.editorManager.toolsSection.checkIfNotAuthenticated(res)) {
            return;
        }
        if(res.error.Message) {
            this.editorManager.toolsSection.ui.displayAlertMessage(res.error.Message, "error");
        }
        const result = JSON.parse(res.result);
        const pageId = result.Trn_PageId;
        const pageName = result.Trn_PageName;

        this.dataManager.getPages().then((res) => {
        this.editorManager.toolsSection.actionList.init();

        this.editorManager.toolsSection.setAttributeToSelected(
            "tile-action-object-id",
            pageId
        );

        this.editorManager.toolsSection.setAttributeToSelected(
            "tile-action-object",
            `Page, ${pageName}`
        );

        $(editorContainerId).nextAll().remove();
        this.editorManager.createChildEditor(
            this.editorManager.getPage(pageId)
        );
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
        
    }
}

// Content from components/TileContextMenu.js
class TileContextMenu {
    constructor(editorManager, event) {
        this.editorManager = editorManager;
        this.event = event;
        console.log("TileContextMenu constructor called");
        // this.createMenu();
        // this.addEventListeners();
    }

    createMenu() {
        // Create context menu container
        const contextMenu = document.createElement("div");
        contextMenu.id = "contextMenu";
        contextMenu.classList.add("context-menu");
        // Create unordered list
        const ul = document.createElement("ul");
        // Menu options
        const options = ["Option 1", "Option 2", "Option 3"];
        options.forEach((option, index) => {
            const li = document.createElement("li");
            li.textContent = option;
            li.onclick = () => alert(`${option} selected`);
            ul.appendChild(li);
        });
        contextMenu.appendChild(ul);
        document.body.appendChild(contextMenu);

        contextMenu.style.top = `${this.event.clientY}vh`;
        contextMenu.style.left = `${40}vw`;
        contextMenu.style.display = "block";
    }

    addEventListeners() {
        document.addEventListener("contextmenu", (event) => {
            console.log(event)
            if (event.target.classList.contains("context-menu-box")) {
                event.preventDefault();
                contextMenu.style.top = `${event.clientY}px`;
                contextMenu.style.left = `${event.clientX}px`;
                contextMenu.style.display = "block";
            } else {
                contextMenu.style.display = "none";
            }
        });
        
        document.addEventListener("click", () => {
            contextMenu.style.display = "none";
        });
    }
}

// Content from components/PageNameEditor.js
class PageNameEditor {
    constructor(editorManager, page) {
        this.editorManager = editorManager;
        this.dataManager = editorManager.dataManager;
        this.page = page;
        this.pageName = page.PageName;
        this.pageId = page.PageId;
        const pageNameContainer = document.getElementById("page-name-editor");
        if (pageNameContainer) {
            pageNameContainer.appendChild(this.render());
        }
    }

    render(){
        const pageName = this.pageName;
        const header = document.createElement("h1");
        header.classList.add("title");
        header.setAttribute("title", pageName);
        //header.setAttribute("contenteditable", "true");
        header.style.textTransform = "uppercase";
        header.innerHTML = pageName.length > 20 ? pageName.substring(0, 16) + "..." : pageName;
        header.addEventListener("dblclick", (e) => {
            this.toggleEditMode();
        });
        return header;
    }

    toggleEditMode() {
        const header = document.querySelector("#page-name-editor h1");
        const input = document.querySelector("#page-name-editor input");
        console.log("header", header);
        console.log("input", input);
        if (header) {
            const input = this.createInput(this.pageName);
            header.replaceWith(input);
            input.focus();
        }
        if (input) {
            const header = this.render();
            input.replaceWith(header);
        }
    }

    createInput(pageName) {
        const input = document.createElement("input");
        input.style.textTransform = "uppercase";
        input.classList.add("page-name-editor", "tb-form-control");
        input.type = "text";
        input.value = pageName;
        input.classList.add("page-name-editor", "tb-form-control");

        // add on leave event
        input.addEventListener("blur", (e) => {
            const value = e.target.value;
            if(value.length > 0){
                this.updatePageName(value);
            }
        });
        input.setAttribute("placeholder", "Page Name");
        return input;
    }

    updatePageName(name) {
        const input = document.querySelector(`#update-page-popup #pageName`);
        const errorLabel = document.querySelector(
          `#update-page-popup #error_pageName`
        );

        if (name) {
          const reservedNames = [
            "Home",
            "Reception",
            "Location",
            "Calendar",
            "My Activity",
            "Web Link",
            "Dynamic Forms"
          ];
          if (reservedNames.includes(name)) {
            errorLabel.innerHTML = "This name is reserved";
            errorLabel.style.display = "block";
            return;
          }
          const page = this.page;
          page.PageName = name;
          this.dataManager.updatePage(page).then((res) => {
            if (res.result) {
                this.pageName = name;
                this.editorManager.toolsSection.ui.displayAlertMessage(res.result, "success");
                this.toggleEditMode();
            }
          });
        } else {
          errorLabel.innerHTML = "This field is required";
          errorLabel.style.display = "block";
        }
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


// Content from classes/ContentEditorManager.js
class ContentEditorManager {
  constructor(e, editor, editorManager) {
    this.editor = editor;
    this.event = e;
    this.editorManager = editorManager;
    this.init();
  }

  async init() {
    this.pages = await this.editorManager.dataManager.getPages();
    this.currentPage = this.pages?.SDT_PageCollection?.find((page) => page.PageId === this.editorManager.currentPageId);
    this.openContentEditModal();
    this.openImageUploadModal();
    this.openDeleteModal();
    this.templateManager = new TemplateManager;
  }

  openContentEditModal() {
    const editorTrigger = this.event.target.closest(".tb-edit-content-icon");
    if (editorTrigger) {
      const popupId = "edit-content-modal";
      const title = "Edit Content";
      const htmlBody = `<div id="editor">
                            ${this.getDescription()}
                        </div>`;
        const handleConfirm = async (event) => {
            const content = document.querySelector("#editor .ql-editor").innerHTML;
            if (this.currentPage) {
              if (this.currentPage.PageName === "Location") {
                this.saveLocationContent(content);
              } else if (this.currentPage.PageName === "Reception") {
                this.saveReceptionContent(content);
              } else {
                this.saveContentPageInfo(content);
              }      
            }
                        
            editModal.closePopup();
        };

      const editModal = new FormPopupModal(popupId, title, htmlBody, handleConfirm);
      editModal.show();

      const quill = new Quill("#editor", {
        modules: {
          toolbar: [
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
          ],
        },
        theme: "snow",
      });
    }
  }

  openImageUploadModal() {
    const editorTrigger = this.event.target.closest(".tb-edit-image-icon");
    if (editorTrigger) {
        const toolboxManager = this.editorManager.toolsSection;
        let type;

        if (this.currentPage.PageName === "Location") {
          type = 'update-location-image';
        } else if (this.currentPage.PageName === "Reception") {
          type = 'update-reception-image';
        } else {
          type = 'update-content-image';
        } 

        toolboxManager.openFileManager('update-content-image');
    }
  }

  openDeleteModal() {
    const deleteTrigger = this.event.target.closest(".tb-delete-image-icon");
    if (deleteTrigger) {
        const handleConfirm = async (event) => {
            const data = {
                ProductServiceId: this.editorManager.currentPageId,
            }

            const res = await this.editorManager.dataManager.deleteContentImage(data);
            if (res) {
                const descImageComponent = this.editor.Components.getWrapper().find("#product-service-image")[0];
                if (descImageComponent) {
                    const parentComponent = descImageComponent.parent();
                    if (parentComponent) {
                        parentComponent.remove();
                    }
                }
            }
            editModal.closePopup();
        };
        const popupId = "delete-desc-image";
        const title = "Delete content image";
        const htmlBody = "Are you sure you want to delete this image?";
        const editModal = new FormPopupModal(popupId, title, htmlBody, handleConfirm);
        editModal.show();
    }
  }

  getDescription () {
    const description = this.event.target.closest(".content-page-block");
    if (description) {
        const descComponent = this.editor.Components.getWrapper().find("#contentDescription")[0];
        if (descComponent) {
            console.log(descComponent.getEl().innerHTML);
            return descComponent.getEl().innerHTML;
        }
    }
  }

  async saveContentPageInfo(content) {
    const data = {
      ProductServiceId: this.editorManager.currentPageId,
      ProductServiceDescription: content
    }

    const res = await this.editorManager.dataManager.updateDescription(data);
    if (res) {
        const descComponent = this.editor.Components.getWrapper().find("#contentDescription")[0]; 
        if (descComponent) {
            descComponent.replaceWith(`<div ${defaultConstraints} id="contentDescription">${content}</div>`);
        }
    }
  }

  async saveLocationContent(content) {
    const data = {
      LocationDescription: content,
      LocationImageBase64: "",
      ReceptionDescription: "",
      ReceptionImageBase64: ""
    }

    const res = await this.editorManager.dataManager.updateLocationInfo(data);
    if (res) {
        const descComponent = this.editor.Components.getWrapper().find("#contentDescription")[0]; 
        if (descComponent) {
            descComponent.replaceWith(`<div ${defaultConstraints} id="contentDescription">${content}</div>`);
        }
    }
  }

  async saveReceptionContent(content) {
    const data = {
      LocationDescription: "",
      LocationImageBase64: "",
      ReceptionDescription: content,
      ReceptionImageBase64: ""
    }

    const res = await this.editorManager.dataManager.updateLocationInfo(data);
    if (res) {
        const descComponent = this.editor.Components.getWrapper().find("#contentDescription")[0]; 
        if (descComponent) {
            descComponent.replaceWith(`<div ${defaultConstraints} id="contentDescription">${content}</div>`);
        }
    }
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
    tile-text-color="#333333"
    tile-text-align="left"
  
    tile-icon=""
    tile-color="#333333"
    tile-align="left"
    tile-bg-image=""
    tile-bg-image-opacity=0
  
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
  return text + '...';
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

async function imageToBase64(url) {
  const response = await fetch(url);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
  });
}


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
  return text + '...';
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

async function imageToBase64(url) {
  const response = await fetch(url);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
  });
}


// Content from ../dist/quill/quill.js
/*! For license information please see quill.js.LICENSE.txt */
!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.Quill=e():t.Quill=e()}(self,(function(){return function(){var t={9698:function(t,e,n){"use strict";n.d(e,{Ay:function(){return c},Ji:function(){return d},mG:function(){return h},zo:function(){return u}});var r=n(6003),i=n(5232),s=n.n(i),o=n(3036),l=n(4850),a=n(5508);class c extends r.BlockBlot{cache={};delta(){return null==this.cache.delta&&(this.cache.delta=h(this)),this.cache.delta}deleteAt(t,e){super.deleteAt(t,e),this.cache={}}formatAt(t,e,n,i){e<=0||(this.scroll.query(n,r.Scope.BLOCK)?t+e===this.length()&&this.format(n,i):super.formatAt(t,Math.min(e,this.length()-t-1),n,i),this.cache={})}insertAt(t,e,n){if(null!=n)return super.insertAt(t,e,n),void(this.cache={});if(0===e.length)return;const r=e.split("\n"),i=r.shift();i.length>0&&(t<this.length()-1||null==this.children.tail?super.insertAt(Math.min(t,this.length()-1),i):this.children.tail.insertAt(this.children.tail.length(),i),this.cache={});let s=this;r.reduce(((t,e)=>(s=s.split(t,!0),s.insertAt(0,e),e.length)),t+i.length)}insertBefore(t,e){const{head:n}=this.children;super.insertBefore(t,e),n instanceof o.A&&n.remove(),this.cache={}}length(){return null==this.cache.length&&(this.cache.length=super.length()+1),this.cache.length}moveChildren(t,e){super.moveChildren(t,e),this.cache={}}optimize(t){super.optimize(t),this.cache={}}path(t){return super.path(t,!0)}removeChild(t){super.removeChild(t),this.cache={}}split(t){let e=arguments.length>1&&void 0!==arguments[1]&&arguments[1];if(e&&(0===t||t>=this.length()-1)){const e=this.clone();return 0===t?(this.parent.insertBefore(e,this),this):(this.parent.insertBefore(e,this.next),e)}const n=super.split(t,e);return this.cache={},n}}c.blotName="block",c.tagName="P",c.defaultChild=o.A,c.allowedChildren=[o.A,l.A,r.EmbedBlot,a.A];class u extends r.EmbedBlot{attach(){super.attach(),this.attributes=new r.AttributorStore(this.domNode)}delta(){return(new(s())).insert(this.value(),{...this.formats(),...this.attributes.values()})}format(t,e){const n=this.scroll.query(t,r.Scope.BLOCK_ATTRIBUTE);null!=n&&this.attributes.attribute(n,e)}formatAt(t,e,n,r){this.format(n,r)}insertAt(t,e,n){if(null!=n)return void super.insertAt(t,e,n);const r=e.split("\n"),i=r.pop(),s=r.map((t=>{const e=this.scroll.create(c.blotName);return e.insertAt(0,t),e})),o=this.split(t);s.forEach((t=>{this.parent.insertBefore(t,o)})),i&&this.parent.insertBefore(this.scroll.create("text",i),o)}}function h(t){let e=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];return t.descendants(r.LeafBlot).reduce(((t,n)=>0===n.length()?t:t.insert(n.value(),d(n,{},e))),new(s())).insert("\n",d(t))}function d(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=!(arguments.length>2&&void 0!==arguments[2])||arguments[2];return null==t?e:("formats"in t&&"function"==typeof t.formats&&(e={...e,...t.formats()},n&&delete e["code-token"]),null==t.parent||"scroll"===t.parent.statics.blotName||t.parent.statics.scope!==t.statics.scope?e:d(t.parent,e,n))}u.scope=r.Scope.BLOCK_BLOT},3036:function(t,e,n){"use strict";var r=n(6003);class i extends r.EmbedBlot{static value(){}optimize(){(this.prev||this.next)&&this.remove()}length(){return 0}value(){return""}}i.blotName="break",i.tagName="BR",e.A=i},580:function(t,e,n){"use strict";var r=n(6003);class i extends r.ContainerBlot{}e.A=i},4541:function(t,e,n){"use strict";var r=n(6003),i=n(5508);class s extends r.EmbedBlot{static blotName="cursor";static className="ql-cursor";static tagName="span";static CONTENTS="\ufeff";static value(){}constructor(t,e,n){super(t,e),this.selection=n,this.textNode=document.createTextNode(s.CONTENTS),this.domNode.appendChild(this.textNode),this.savedLength=0}detach(){null!=this.parent&&this.parent.removeChild(this)}format(t,e){if(0!==this.savedLength)return void super.format(t,e);let n=this,i=0;for(;null!=n&&n.statics.scope!==r.Scope.BLOCK_BLOT;)i+=n.offset(n.parent),n=n.parent;null!=n&&(this.savedLength=s.CONTENTS.length,n.optimize(),n.formatAt(i,s.CONTENTS.length,t,e),this.savedLength=0)}index(t,e){return t===this.textNode?0:super.index(t,e)}length(){return this.savedLength}position(){return[this.textNode,this.textNode.data.length]}remove(){super.remove(),this.parent=null}restore(){if(this.selection.composing||null==this.parent)return null;const t=this.selection.getNativeRange();for(;null!=this.domNode.lastChild&&this.domNode.lastChild!==this.textNode;)this.domNode.parentNode.insertBefore(this.domNode.lastChild,this.domNode);const e=this.prev instanceof i.A?this.prev:null,n=e?e.length():0,r=this.next instanceof i.A?this.next:null,o=r?r.text:"",{textNode:l}=this,a=l.data.split(s.CONTENTS).join("");let c;if(l.data=s.CONTENTS,e)c=e,(a||r)&&(e.insertAt(e.length(),a+o),r&&r.remove());else if(r)c=r,r.insertAt(0,a);else{const t=document.createTextNode(a);c=this.scroll.create(t),this.parent.insertBefore(c,this)}if(this.remove(),t){const i=(t,i)=>e&&t===e.domNode?i:t===l?n+i-1:r&&t===r.domNode?n+a.length+i:null,s=i(t.start.node,t.start.offset),o=i(t.end.node,t.end.offset);if(null!==s&&null!==o)return{startNode:c.domNode,startOffset:s,endNode:c.domNode,endOffset:o}}return null}update(t,e){if(t.some((t=>"characterData"===t.type&&t.target===this.textNode))){const t=this.restore();t&&(e.range=t)}}optimize(t){super.optimize(t);let{parent:e}=this;for(;e;){if("A"===e.domNode.tagName){this.savedLength=s.CONTENTS.length,e.isolate(this.offset(e),this.length()).unwrap(),this.savedLength=0;break}e=e.parent}}value(){return""}}e.A=s},746:function(t,e,n){"use strict";var r=n(6003),i=n(5508);const s="\ufeff";class o extends r.EmbedBlot{constructor(t,e){super(t,e),this.contentNode=document.createElement("span"),this.contentNode.setAttribute("contenteditable","false"),Array.from(this.domNode.childNodes).forEach((t=>{this.contentNode.appendChild(t)})),this.leftGuard=document.createTextNode(s),this.rightGuard=document.createTextNode(s),this.domNode.appendChild(this.leftGuard),this.domNode.appendChild(this.contentNode),this.domNode.appendChild(this.rightGuard)}index(t,e){return t===this.leftGuard?0:t===this.rightGuard?1:super.index(t,e)}restore(t){let e,n=null;const r=t.data.split(s).join("");if(t===this.leftGuard)if(this.prev instanceof i.A){const t=this.prev.length();this.prev.insertAt(t,r),n={startNode:this.prev.domNode,startOffset:t+r.length}}else e=document.createTextNode(r),this.parent.insertBefore(this.scroll.create(e),this),n={startNode:e,startOffset:r.length};else t===this.rightGuard&&(this.next instanceof i.A?(this.next.insertAt(0,r),n={startNode:this.next.domNode,startOffset:r.length}):(e=document.createTextNode(r),this.parent.insertBefore(this.scroll.create(e),this.next),n={startNode:e,startOffset:r.length}));return t.data=s,n}update(t,e){t.forEach((t=>{if("characterData"===t.type&&(t.target===this.leftGuard||t.target===this.rightGuard)){const n=this.restore(t.target);n&&(e.range=n)}}))}}e.A=o},4850:function(t,e,n){"use strict";var r=n(6003),i=n(3036),s=n(5508);class o extends r.InlineBlot{static allowedChildren=[o,i.A,r.EmbedBlot,s.A];static order=["cursor","inline","link","underline","strike","italic","bold","script","code"];static compare(t,e){const n=o.order.indexOf(t),r=o.order.indexOf(e);return n>=0||r>=0?n-r:t===e?0:t<e?-1:1}formatAt(t,e,n,i){if(o.compare(this.statics.blotName,n)<0&&this.scroll.query(n,r.Scope.BLOT)){const r=this.isolate(t,e);i&&r.wrap(n,i)}else super.formatAt(t,e,n,i)}optimize(t){if(super.optimize(t),this.parent instanceof o&&o.compare(this.statics.blotName,this.parent.statics.blotName)>0){const t=this.parent.isolate(this.offset(),this.length());this.moveChildren(t),t.wrap(this)}}}e.A=o},5508:function(t,e,n){"use strict";n.d(e,{A:function(){return i},X:function(){return o}});var r=n(6003);class i extends r.TextBlot{}const s={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function o(t){return t.replace(/[&<>"']/g,(t=>s[t]))}},3729:function(t,e,n){"use strict";n.d(e,{default:function(){return R}});var r=n(6142),i=n(9698),s=n(3036),o=n(580),l=n(4541),a=n(746),c=n(4850),u=n(6003),h=n(5232),d=n.n(h),f=n(5374);function p(t){return t instanceof i.Ay||t instanceof i.zo}function g(t){return"function"==typeof t.updateContent}class m extends u.ScrollBlot{static blotName="scroll";static className="ql-editor";static tagName="DIV";static defaultChild=i.Ay;static allowedChildren=[i.Ay,i.zo,o.A];constructor(t,e,n){let{emitter:r}=n;super(t,e),this.emitter=r,this.batch=!1,this.optimize(),this.enable(),this.domNode.addEventListener("dragstart",(t=>this.handleDragStart(t)))}batchStart(){Array.isArray(this.batch)||(this.batch=[])}batchEnd(){if(!this.batch)return;const t=this.batch;this.batch=!1,this.update(t)}emitMount(t){this.emitter.emit(f.A.events.SCROLL_BLOT_MOUNT,t)}emitUnmount(t){this.emitter.emit(f.A.events.SCROLL_BLOT_UNMOUNT,t)}emitEmbedUpdate(t,e){this.emitter.emit(f.A.events.SCROLL_EMBED_UPDATE,t,e)}deleteAt(t,e){const[n,r]=this.line(t),[o]=this.line(t+e);if(super.deleteAt(t,e),null!=o&&n!==o&&r>0){if(n instanceof i.zo||o instanceof i.zo)return void this.optimize();const t=o.children.head instanceof s.A?null:o.children.head;n.moveChildren(o,t),n.remove()}this.optimize()}enable(){let t=!(arguments.length>0&&void 0!==arguments[0])||arguments[0];this.domNode.setAttribute("contenteditable",t?"true":"false")}formatAt(t,e,n,r){super.formatAt(t,e,n,r),this.optimize()}insertAt(t,e,n){if(t>=this.length())if(null==n||null==this.scroll.query(e,u.Scope.BLOCK)){const t=this.scroll.create(this.statics.defaultChild.blotName);this.appendChild(t),null==n&&e.endsWith("\n")?t.insertAt(0,e.slice(0,-1),n):t.insertAt(0,e,n)}else{const t=this.scroll.create(e,n);this.appendChild(t)}else super.insertAt(t,e,n);this.optimize()}insertBefore(t,e){if(t.statics.scope===u.Scope.INLINE_BLOT){const n=this.scroll.create(this.statics.defaultChild.blotName);n.appendChild(t),super.insertBefore(n,e)}else super.insertBefore(t,e)}insertContents(t,e){const n=this.deltaToRenderBlocks(e.concat((new(d())).insert("\n"))),r=n.pop();if(null==r)return;this.batchStart();const s=n.shift();if(s){const e="block"===s.type&&(0===s.delta.length()||!this.descendant(i.zo,t)[0]&&t<this.length()),n="block"===s.type?s.delta:(new(d())).insert({[s.key]:s.value});b(this,t,n);const r="block"===s.type?1:0,o=t+n.length()+r;e&&this.insertAt(o-1,"\n");const l=(0,i.Ji)(this.line(t)[0]),a=h.AttributeMap.diff(l,s.attributes)||{};Object.keys(a).forEach((t=>{this.formatAt(o-1,1,t,a[t])})),t=o}let[o,l]=this.children.find(t);n.length&&(o&&(o=o.split(l),l=0),n.forEach((t=>{if("block"===t.type)b(this.createBlock(t.attributes,o||void 0),0,t.delta);else{const e=this.create(t.key,t.value);this.insertBefore(e,o||void 0),Object.keys(t.attributes).forEach((n=>{e.format(n,t.attributes[n])}))}}))),"block"===r.type&&r.delta.length()&&b(this,o?o.offset(o.scroll)+l:this.length(),r.delta),this.batchEnd(),this.optimize()}isEnabled(){return"true"===this.domNode.getAttribute("contenteditable")}leaf(t){const e=this.path(t).pop();if(!e)return[null,-1];const[n,r]=e;return n instanceof u.LeafBlot?[n,r]:[null,-1]}line(t){return t===this.length()?this.line(t-1):this.descendant(p,t)}lines(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:Number.MAX_VALUE;const n=(t,e,r)=>{let i=[],s=r;return t.children.forEachAt(e,r,((t,e,r)=>{p(t)?i.push(t):t instanceof u.ContainerBlot&&(i=i.concat(n(t,e,s))),s-=r})),i};return n(this,t,e)}optimize(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};this.batch||(super.optimize(t,e),t.length>0&&this.emitter.emit(f.A.events.SCROLL_OPTIMIZE,t,e))}path(t){return super.path(t).slice(1)}remove(){}update(t){if(this.batch)return void(Array.isArray(t)&&(this.batch=this.batch.concat(t)));let e=f.A.sources.USER;"string"==typeof t&&(e=t),Array.isArray(t)||(t=this.observer.takeRecords()),(t=t.filter((t=>{let{target:e}=t;const n=this.find(e,!0);return n&&!g(n)}))).length>0&&this.emitter.emit(f.A.events.SCROLL_BEFORE_UPDATE,e,t),super.update(t.concat([])),t.length>0&&this.emitter.emit(f.A.events.SCROLL_UPDATE,e,t)}updateEmbedAt(t,e,n){const[r]=this.descendant((t=>t instanceof i.zo),t);r&&r.statics.blotName===e&&g(r)&&r.updateContent(n)}handleDragStart(t){t.preventDefault()}deltaToRenderBlocks(t){const e=[];let n=new(d());return t.forEach((t=>{const r=t?.insert;if(r)if("string"==typeof r){const i=r.split("\n");i.slice(0,-1).forEach((r=>{n.insert(r,t.attributes),e.push({type:"block",delta:n,attributes:t.attributes??{}}),n=new(d())}));const s=i[i.length-1];s&&n.insert(s,t.attributes)}else{const i=Object.keys(r)[0];if(!i)return;this.query(i,u.Scope.INLINE)?n.push(t):(n.length()&&e.push({type:"block",delta:n,attributes:{}}),n=new(d()),e.push({type:"blockEmbed",key:i,value:r[i],attributes:t.attributes??{}}))}})),n.length()&&e.push({type:"block",delta:n,attributes:{}}),e}createBlock(t,e){let n;const r={};Object.entries(t).forEach((t=>{let[e,i]=t;null!=this.query(e,u.Scope.BLOCK&u.Scope.BLOT)?n=e:r[e]=i}));const i=this.create(n||this.statics.defaultChild.blotName,n?t[n]:void 0);this.insertBefore(i,e||void 0);const s=i.length();return Object.entries(r).forEach((t=>{let[e,n]=t;i.formatAt(0,s,e,n)})),i}}function b(t,e,n){n.reduce(((e,n)=>{const r=h.Op.length(n);let s=n.attributes||{};if(null!=n.insert)if("string"==typeof n.insert){const r=n.insert;t.insertAt(e,r);const[o]=t.descendant(u.LeafBlot,e),l=(0,i.Ji)(o);s=h.AttributeMap.diff(l,s)||{}}else if("object"==typeof n.insert){const r=Object.keys(n.insert)[0];if(null==r)return e;if(t.insertAt(e,r,n.insert[r]),null!=t.scroll.query(r,u.Scope.INLINE)){const[n]=t.descendant(u.LeafBlot,e),r=(0,i.Ji)(n);s=h.AttributeMap.diff(r,s)||{}}}return Object.keys(s).forEach((n=>{t.formatAt(e,r,n,s[n])})),e+r}),e)}var y=m,v=n(5508),A=n(584),x=n(4266);class N extends x.A{static DEFAULTS={delay:1e3,maxStack:100,userOnly:!1};lastRecorded=0;ignoreChange=!1;stack={undo:[],redo:[]};currentRange=null;constructor(t,e){super(t,e),this.quill.on(r.Ay.events.EDITOR_CHANGE,((t,e,n,i)=>{t===r.Ay.events.SELECTION_CHANGE?e&&i!==r.Ay.sources.SILENT&&(this.currentRange=e):t===r.Ay.events.TEXT_CHANGE&&(this.ignoreChange||(this.options.userOnly&&i!==r.Ay.sources.USER?this.transform(e):this.record(e,n)),this.currentRange=w(this.currentRange,e))})),this.quill.keyboard.addBinding({key:"z",shortKey:!0},this.undo.bind(this)),this.quill.keyboard.addBinding({key:["z","Z"],shortKey:!0,shiftKey:!0},this.redo.bind(this)),/Win/i.test(navigator.platform)&&this.quill.keyboard.addBinding({key:"y",shortKey:!0},this.redo.bind(this)),this.quill.root.addEventListener("beforeinput",(t=>{"historyUndo"===t.inputType?(this.undo(),t.preventDefault()):"historyRedo"===t.inputType&&(this.redo(),t.preventDefault())}))}change(t,e){if(0===this.stack[t].length)return;const n=this.stack[t].pop();if(!n)return;const i=this.quill.getContents(),s=n.delta.invert(i);this.stack[e].push({delta:s,range:w(n.range,s)}),this.lastRecorded=0,this.ignoreChange=!0,this.quill.updateContents(n.delta,r.Ay.sources.USER),this.ignoreChange=!1,this.restoreSelection(n)}clear(){this.stack={undo:[],redo:[]}}cutoff(){this.lastRecorded=0}record(t,e){if(0===t.ops.length)return;this.stack.redo=[];let n=t.invert(e),r=this.currentRange;const i=Date.now();if(this.lastRecorded+this.options.delay>i&&this.stack.undo.length>0){const t=this.stack.undo.pop();t&&(n=n.compose(t.delta),r=t.range)}else this.lastRecorded=i;0!==n.length()&&(this.stack.undo.push({delta:n,range:r}),this.stack.undo.length>this.options.maxStack&&this.stack.undo.shift())}redo(){this.change("redo","undo")}transform(t){E(this.stack.undo,t),E(this.stack.redo,t)}undo(){this.change("undo","redo")}restoreSelection(t){if(t.range)this.quill.setSelection(t.range,r.Ay.sources.USER);else{const e=function(t,e){const n=e.reduce(((t,e)=>t+(e.delete||0)),0);let r=e.length()-n;return function(t,e){const n=e.ops[e.ops.length-1];return null!=n&&(null!=n.insert?"string"==typeof n.insert&&n.insert.endsWith("\n"):null!=n.attributes&&Object.keys(n.attributes).some((e=>null!=t.query(e,u.Scope.BLOCK))))}(t,e)&&(r-=1),r}(this.quill.scroll,t.delta);this.quill.setSelection(e,r.Ay.sources.USER)}}}function E(t,e){let n=e;for(let e=t.length-1;e>=0;e-=1){const r=t[e];t[e]={delta:n.transform(r.delta,!0),range:r.range&&w(r.range,n)},n=r.delta.transform(n),0===t[e].delta.length()&&t.splice(e,1)}}function w(t,e){if(!t)return t;const n=e.transformPosition(t.index);return{index:n,length:e.transformPosition(t.index+t.length)-n}}var q=n(8123);class k extends x.A{constructor(t,e){super(t,e),t.root.addEventListener("drop",(e=>{e.preventDefault();let n=null;if(document.caretRangeFromPoint)n=document.caretRangeFromPoint(e.clientX,e.clientY);else if(document.caretPositionFromPoint){const t=document.caretPositionFromPoint(e.clientX,e.clientY);n=document.createRange(),n.setStart(t.offsetNode,t.offset),n.setEnd(t.offsetNode,t.offset)}const r=n&&t.selection.normalizeNative(n);if(r){const n=t.selection.normalizedToRange(r);e.dataTransfer?.files&&this.upload(n,e.dataTransfer.files)}}))}upload(t,e){const n=[];Array.from(e).forEach((t=>{t&&this.options.mimetypes?.includes(t.type)&&n.push(t)})),n.length>0&&this.options.handler.call(this,t,n)}}k.DEFAULTS={mimetypes:["image/png","image/jpeg"],handler(t,e){if(!this.quill.scroll.query("image"))return;const n=e.map((t=>new Promise((e=>{const n=new FileReader;n.onload=()=>{e(n.result)},n.readAsDataURL(t)}))));Promise.all(n).then((e=>{const n=e.reduce(((t,e)=>t.insert({image:e})),(new(d())).retain(t.index).delete(t.length));this.quill.updateContents(n,f.A.sources.USER),this.quill.setSelection(t.index+e.length,f.A.sources.SILENT)}))}};var _=k;const L=["insertText","insertReplacementText"];class S extends x.A{constructor(t,e){super(t,e),t.root.addEventListener("beforeinput",(t=>{this.handleBeforeInput(t)})),/Android/i.test(navigator.userAgent)||t.on(r.Ay.events.COMPOSITION_BEFORE_START,(()=>{this.handleCompositionStart()}))}deleteRange(t){(0,q.Xo)({range:t,quill:this.quill})}replaceText(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"";if(0===t.length)return!1;if(e){const n=this.quill.getFormat(t.index,1);this.deleteRange(t),this.quill.updateContents((new(d())).retain(t.index).insert(e,n),r.Ay.sources.USER)}else this.deleteRange(t);return this.quill.setSelection(t.index+e.length,0,r.Ay.sources.SILENT),!0}handleBeforeInput(t){if(this.quill.composition.isComposing||t.defaultPrevented||!L.includes(t.inputType))return;const e=t.getTargetRanges?t.getTargetRanges()[0]:null;if(!e||!0===e.collapsed)return;const n=function(t){return"string"==typeof t.data?t.data:t.dataTransfer?.types.includes("text/plain")?t.dataTransfer.getData("text/plain"):null}(t);if(null==n)return;const r=this.quill.selection.normalizeNative(e),i=r?this.quill.selection.normalizedToRange(r):null;i&&this.replaceText(i,n)&&t.preventDefault()}handleCompositionStart(){const t=this.quill.getSelection();t&&this.replaceText(t)}}var O=S;const T=/Mac/i.test(navigator.platform);class j extends x.A{isListening=!1;selectionChangeDeadline=0;constructor(t,e){super(t,e),this.handleArrowKeys(),this.handleNavigationShortcuts()}handleArrowKeys(){this.quill.keyboard.addBinding({key:["ArrowLeft","ArrowRight"],offset:0,shiftKey:null,handler(t,e){let{line:n,event:i}=e;if(!(n instanceof u.ParentBlot&&n.uiNode))return!0;const s="rtl"===getComputedStyle(n.domNode).direction;return!!(s&&"ArrowRight"!==i.key||!s&&"ArrowLeft"!==i.key)||(this.quill.setSelection(t.index-1,t.length+(i.shiftKey?1:0),r.Ay.sources.USER),!1)}})}handleNavigationShortcuts(){this.quill.root.addEventListener("keydown",(t=>{!t.defaultPrevented&&(t=>"ArrowLeft"===t.key||"ArrowRight"===t.key||"ArrowUp"===t.key||"ArrowDown"===t.key||"Home"===t.key||!(!T||"a"!==t.key||!0!==t.ctrlKey))(t)&&this.ensureListeningToSelectionChange()}))}ensureListeningToSelectionChange(){this.selectionChangeDeadline=Date.now()+100,this.isListening||(this.isListening=!0,document.addEventListener("selectionchange",(()=>{this.isListening=!1,Date.now()<=this.selectionChangeDeadline&&this.handleSelectionChange()}),{once:!0}))}handleSelectionChange(){const t=document.getSelection();if(!t)return;const e=t.getRangeAt(0);if(!0!==e.collapsed||0!==e.startOffset)return;const n=this.quill.scroll.find(e.startContainer);if(!(n instanceof u.ParentBlot&&n.uiNode))return;const r=document.createRange();r.setStartAfter(n.uiNode),r.setEndAfter(n.uiNode),t.removeAllRanges(),t.addRange(r)}}var C=j;r.Ay.register({"blots/block":i.Ay,"blots/block/embed":i.zo,"blots/break":s.A,"blots/container":o.A,"blots/cursor":l.A,"blots/embed":a.A,"blots/inline":c.A,"blots/scroll":y,"blots/text":v.A,"modules/clipboard":A.Ay,"modules/history":N,"modules/keyboard":q.Ay,"modules/uploader":_,"modules/input":O,"modules/uiNode":C});var R=r.Ay},5374:function(t,e,n){"use strict";n.d(e,{A:function(){return o}});var r=n(8920),i=n(7356);const s=(0,n(6078).A)("quill:events");["selectionchange","mousedown","mouseup","click"].forEach((t=>{document.addEventListener(t,(function(){for(var t=arguments.length,e=new Array(t),n=0;n<t;n++)e[n]=arguments[n];Array.from(document.querySelectorAll(".ql-container")).forEach((t=>{const n=i.A.get(t);n&&n.emitter&&n.emitter.handleDOM(...e)}))}))}));var o=class extends r{static events={EDITOR_CHANGE:"editor-change",SCROLL_BEFORE_UPDATE:"scroll-before-update",SCROLL_BLOT_MOUNT:"scroll-blot-mount",SCROLL_BLOT_UNMOUNT:"scroll-blot-unmount",SCROLL_OPTIMIZE:"scroll-optimize",SCROLL_UPDATE:"scroll-update",SCROLL_EMBED_UPDATE:"scroll-embed-update",SELECTION_CHANGE:"selection-change",TEXT_CHANGE:"text-change",COMPOSITION_BEFORE_START:"composition-before-start",COMPOSITION_START:"composition-start",COMPOSITION_BEFORE_END:"composition-before-end",COMPOSITION_END:"composition-end"};static sources={API:"api",SILENT:"silent",USER:"user"};constructor(){super(),this.domListeners={},this.on("error",s.error)}emit(){for(var t=arguments.length,e=new Array(t),n=0;n<t;n++)e[n]=arguments[n];return s.log.call(s,...e),super.emit(...e)}handleDOM(t){for(var e=arguments.length,n=new Array(e>1?e-1:0),r=1;r<e;r++)n[r-1]=arguments[r];(this.domListeners[t.type]||[]).forEach((e=>{let{node:r,handler:i}=e;(t.target===r||r.contains(t.target))&&i(t,...n)}))}listenDOM(t,e,n){this.domListeners[t]||(this.domListeners[t]=[]),this.domListeners[t].push({node:e,handler:n})}}},7356:function(t,e){"use strict";e.A=new WeakMap},6078:function(t,e){"use strict";const n=["error","warn","log","info"];let r="warn";function i(t){if(r&&n.indexOf(t)<=n.indexOf(r)){for(var e=arguments.length,i=new Array(e>1?e-1:0),s=1;s<e;s++)i[s-1]=arguments[s];console[t](...i)}}function s(t){return n.reduce(((e,n)=>(e[n]=i.bind(console,n,t),e)),{})}s.level=t=>{r=t},i.level=s.level,e.A=s},4266:function(t,e){"use strict";e.A=class{static DEFAULTS={};constructor(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};this.quill=t,this.options=e}}},6142:function(t,e,n){"use strict";n.d(e,{Ay:function(){return I}});var r=n(8347),i=n(6003),s=n(5232),o=n.n(s),l=n(3707),a=n(5123),c=n(9698),u=n(3036),h=n(4541),d=n(5508),f=n(8298);const p=/^[ -~]*$/;function g(t,e,n){if(0===t.length){const[t]=y(n.pop());return e<=0?`</li></${t}>`:`</li></${t}>${g([],e-1,n)}`}const[{child:r,offset:i,length:s,indent:o,type:l},...a]=t,[c,u]=y(l);if(o>e)return n.push(l),o===e+1?`<${c}><li${u}>${m(r,i,s)}${g(a,o,n)}`:`<${c}><li>${g(t,e+1,n)}`;const h=n[n.length-1];if(o===e&&l===h)return`</li><li${u}>${m(r,i,s)}${g(a,o,n)}`;const[d]=y(n.pop());return`</li></${d}>${g(t,e-1,n)}`}function m(t,e,n){let r=arguments.length>3&&void 0!==arguments[3]&&arguments[3];if("html"in t&&"function"==typeof t.html)return t.html(e,n);if(t instanceof d.A)return(0,d.X)(t.value().slice(e,e+n)).replaceAll(" ","&nbsp;");if(t instanceof i.ParentBlot){if("list-container"===t.statics.blotName){const r=[];return t.children.forEachAt(e,n,((t,e,n)=>{const i="formats"in t&&"function"==typeof t.formats?t.formats():{};r.push({child:t,offset:e,length:n,indent:i.indent||0,type:i.list})})),g(r,-1,[])}const i=[];if(t.children.forEachAt(e,n,((t,e,n)=>{i.push(m(t,e,n))})),r||"list"===t.statics.blotName)return i.join("");const{outerHTML:s,innerHTML:o}=t.domNode,[l,a]=s.split(`>${o}<`);return"<table"===l?`<table style="border: 1px solid #000;">${i.join("")}<${a}`:`${l}>${i.join("")}<${a}`}return t.domNode instanceof Element?t.domNode.outerHTML:""}function b(t,e){return Object.keys(e).reduce(((n,r)=>{if(null==t[r])return n;const i=e[r];return i===t[r]?n[r]=i:Array.isArray(i)?i.indexOf(t[r])<0?n[r]=i.concat([t[r]]):n[r]=i:n[r]=[i,t[r]],n}),{})}function y(t){const e="ordered"===t?"ol":"ul";switch(t){case"checked":return[e,' data-list="checked"'];case"unchecked":return[e,' data-list="unchecked"'];default:return[e,""]}}function v(t){return t.reduce(((t,e)=>{if("string"==typeof e.insert){const n=e.insert.replace(/\r\n/g,"\n").replace(/\r/g,"\n");return t.insert(n,e.attributes)}return t.push(e)}),new(o()))}function A(t,e){let{index:n,length:r}=t;return new f.Q(n+e,r)}var x=class{constructor(t){this.scroll=t,this.delta=this.getDelta()}applyDelta(t){this.scroll.update();let e=this.scroll.length();this.scroll.batchStart();const n=v(t),l=new(o());return function(t){const e=[];return t.forEach((t=>{"string"==typeof t.insert?t.insert.split("\n").forEach(((n,r)=>{r&&e.push({insert:"\n",attributes:t.attributes}),n&&e.push({insert:n,attributes:t.attributes})})):e.push(t)})),e}(n.ops.slice()).reduce(((t,n)=>{const o=s.Op.length(n);let a=n.attributes||{},u=!1,h=!1;if(null!=n.insert){if(l.retain(o),"string"==typeof n.insert){const o=n.insert;h=!o.endsWith("\n")&&(e<=t||!!this.scroll.descendant(c.zo,t)[0]),this.scroll.insertAt(t,o);const[l,u]=this.scroll.line(t);let d=(0,r.A)({},(0,c.Ji)(l));if(l instanceof c.Ay){const[t]=l.descendant(i.LeafBlot,u);t&&(d=(0,r.A)(d,(0,c.Ji)(t)))}a=s.AttributeMap.diff(d,a)||{}}else if("object"==typeof n.insert){const o=Object.keys(n.insert)[0];if(null==o)return t;const l=null!=this.scroll.query(o,i.Scope.INLINE);if(l)(e<=t||this.scroll.descendant(c.zo,t)[0])&&(h=!0);else if(t>0){const[e,n]=this.scroll.descendant(i.LeafBlot,t-1);e instanceof d.A?"\n"!==e.value()[n]&&(u=!0):e instanceof i.EmbedBlot&&e.statics.scope===i.Scope.INLINE_BLOT&&(u=!0)}if(this.scroll.insertAt(t,o,n.insert[o]),l){const[e]=this.scroll.descendant(i.LeafBlot,t);if(e){const t=(0,r.A)({},(0,c.Ji)(e));a=s.AttributeMap.diff(t,a)||{}}}}e+=o}else if(l.push(n),null!==n.retain&&"object"==typeof n.retain){const e=Object.keys(n.retain)[0];if(null==e)return t;this.scroll.updateEmbedAt(t,e,n.retain[e])}Object.keys(a).forEach((e=>{this.scroll.formatAt(t,o,e,a[e])}));const f=u?1:0,p=h?1:0;return e+=f+p,l.retain(f),l.delete(p),t+o+f+p}),0),l.reduce(((t,e)=>"number"==typeof e.delete?(this.scroll.deleteAt(t,e.delete),t):t+s.Op.length(e)),0),this.scroll.batchEnd(),this.scroll.optimize(),this.update(n)}deleteText(t,e){return this.scroll.deleteAt(t,e),this.update((new(o())).retain(t).delete(e))}formatLine(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};this.scroll.update(),Object.keys(n).forEach((r=>{this.scroll.lines(t,Math.max(e,1)).forEach((t=>{t.format(r,n[r])}))})),this.scroll.optimize();const r=(new(o())).retain(t).retain(e,(0,l.A)(n));return this.update(r)}formatText(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};Object.keys(n).forEach((r=>{this.scroll.formatAt(t,e,r,n[r])}));const r=(new(o())).retain(t).retain(e,(0,l.A)(n));return this.update(r)}getContents(t,e){return this.delta.slice(t,t+e)}getDelta(){return this.scroll.lines().reduce(((t,e)=>t.concat(e.delta())),new(o()))}getFormat(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=[],r=[];0===e?this.scroll.path(t).forEach((t=>{const[e]=t;e instanceof c.Ay?n.push(e):e instanceof i.LeafBlot&&r.push(e)})):(n=this.scroll.lines(t,e),r=this.scroll.descendants(i.LeafBlot,t,e));const[s,o]=[n,r].map((t=>{const e=t.shift();if(null==e)return{};let n=(0,c.Ji)(e);for(;Object.keys(n).length>0;){const e=t.shift();if(null==e)return n;n=b((0,c.Ji)(e),n)}return n}));return{...s,...o}}getHTML(t,e){const[n,r]=this.scroll.line(t);if(n){const i=n.length();return n.length()>=r+e&&(0!==r||e!==i)?m(n,r,e,!0):m(this.scroll,t,e,!0)}return""}getText(t,e){return this.getContents(t,e).filter((t=>"string"==typeof t.insert)).map((t=>t.insert)).join("")}insertContents(t,e){const n=v(e),r=(new(o())).retain(t).concat(n);return this.scroll.insertContents(t,n),this.update(r)}insertEmbed(t,e,n){return this.scroll.insertAt(t,e,n),this.update((new(o())).retain(t).insert({[e]:n}))}insertText(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return e=e.replace(/\r\n/g,"\n").replace(/\r/g,"\n"),this.scroll.insertAt(t,e),Object.keys(n).forEach((r=>{this.scroll.formatAt(t,e.length,r,n[r])})),this.update((new(o())).retain(t).insert(e,(0,l.A)(n)))}isBlank(){if(0===this.scroll.children.length)return!0;if(this.scroll.children.length>1)return!1;const t=this.scroll.children.head;if(t?.statics.blotName!==c.Ay.blotName)return!1;const e=t;return!(e.children.length>1)&&e.children.head instanceof u.A}removeFormat(t,e){const n=this.getText(t,e),[r,i]=this.scroll.line(t+e);let s=0,l=new(o());null!=r&&(s=r.length()-i,l=r.delta().slice(i,i+s-1).insert("\n"));const a=this.getContents(t,e+s).diff((new(o())).insert(n).concat(l)),c=(new(o())).retain(t).concat(a);return this.applyDelta(c)}update(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:void 0;const r=this.delta;if(1===e.length&&"characterData"===e[0].type&&e[0].target.data.match(p)&&this.scroll.find(e[0].target)){const i=this.scroll.find(e[0].target),s=(0,c.Ji)(i),l=i.offset(this.scroll),a=e[0].oldValue.replace(h.A.CONTENTS,""),u=(new(o())).insert(a),d=(new(o())).insert(i.value()),f=n&&{oldRange:A(n.oldRange,-l),newRange:A(n.newRange,-l)};t=(new(o())).retain(l).concat(u.diff(d,f)).reduce(((t,e)=>e.insert?t.insert(e.insert,s):t.push(e)),new(o())),this.delta=r.compose(t)}else this.delta=this.getDelta(),t&&(0,a.A)(r.compose(t),this.delta)||(t=r.diff(this.delta,n));return t}},N=n(5374),E=n(7356),w=n(6078),q=n(4266),k=n(746),_=class{isComposing=!1;constructor(t,e){this.scroll=t,this.emitter=e,this.setupListeners()}setupListeners(){this.scroll.domNode.addEventListener("compositionstart",(t=>{this.isComposing||this.handleCompositionStart(t)})),this.scroll.domNode.addEventListener("compositionend",(t=>{this.isComposing&&queueMicrotask((()=>{this.handleCompositionEnd(t)}))}))}handleCompositionStart(t){const e=t.target instanceof Node?this.scroll.find(t.target,!0):null;!e||e instanceof k.A||(this.emitter.emit(N.A.events.COMPOSITION_BEFORE_START,t),this.scroll.batchStart(),this.emitter.emit(N.A.events.COMPOSITION_START,t),this.isComposing=!0)}handleCompositionEnd(t){this.emitter.emit(N.A.events.COMPOSITION_BEFORE_END,t),this.scroll.batchEnd(),this.emitter.emit(N.A.events.COMPOSITION_END,t),this.isComposing=!1}},L=n(9609);const S=t=>{const e=t.getBoundingClientRect(),n="offsetWidth"in t&&Math.abs(e.width)/t.offsetWidth||1,r="offsetHeight"in t&&Math.abs(e.height)/t.offsetHeight||1;return{top:e.top,right:e.left+t.clientWidth*n,bottom:e.top+t.clientHeight*r,left:e.left}},O=t=>{const e=parseInt(t,10);return Number.isNaN(e)?0:e},T=(t,e,n,r,i,s)=>t<n&&e>r?0:t<n?-(n-t+i):e>r?e-t>r-n?t+i-n:e-r+s:0;const j=["block","break","cursor","inline","scroll","text"];const C=(0,w.A)("quill"),R=new i.Registry;i.ParentBlot.uiClass="ql-ui";class I{static DEFAULTS={bounds:null,modules:{clipboard:!0,keyboard:!0,history:!0,uploader:!0},placeholder:"",readOnly:!1,registry:R,theme:"default"};static events=N.A.events;static sources=N.A.sources;static version="2.0.3";static imports={delta:o(),parchment:i,"core/module":q.A,"core/theme":L.A};static debug(t){!0===t&&(t="log"),w.A.level(t)}static find(t){let e=arguments.length>1&&void 0!==arguments[1]&&arguments[1];return E.A.get(t)||R.find(t,e)}static import(t){return null==this.imports[t]&&C.error(`Cannot import ${t}. Are you sure it was registered?`),this.imports[t]}static register(){if("string"!=typeof(arguments.length<=0?void 0:arguments[0])){const t=arguments.length<=0?void 0:arguments[0],e=!!(arguments.length<=1?void 0:arguments[1]),n="attrName"in t?t.attrName:t.blotName;"string"==typeof n?this.register(`formats/${n}`,t,e):Object.keys(t).forEach((n=>{this.register(n,t[n],e)}))}else{const t=arguments.length<=0?void 0:arguments[0],e=arguments.length<=1?void 0:arguments[1],n=!!(arguments.length<=2?void 0:arguments[2]);null==this.imports[t]||n||C.warn(`Overwriting ${t} with`,e),this.imports[t]=e,(t.startsWith("blots/")||t.startsWith("formats/"))&&e&&"boolean"!=typeof e&&"abstract"!==e.blotName&&R.register(e),"function"==typeof e.register&&e.register(R)}}constructor(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(this.options=function(t,e){const n=B(t);if(!n)throw new Error("Invalid Quill container");const s=!e.theme||e.theme===I.DEFAULTS.theme?L.A:I.import(`themes/${e.theme}`);if(!s)throw new Error(`Invalid theme ${e.theme}. Did you register it?`);const{modules:o,...l}=I.DEFAULTS,{modules:a,...c}=s.DEFAULTS;let u=M(e.modules);null!=u&&u.toolbar&&u.toolbar.constructor!==Object&&(u={...u,toolbar:{container:u.toolbar}});const h=(0,r.A)({},M(o),M(a),u),d={...l,...U(c),...U(e)};let f=e.registry;return f?e.formats&&C.warn('Ignoring "formats" option because "registry" is specified'):f=e.formats?((t,e,n)=>{const r=new i.Registry;return j.forEach((t=>{const n=e.query(t);n&&r.register(n)})),t.forEach((t=>{let i=e.query(t);i||n.error(`Cannot register "${t}" specified in "formats" config. Are you sure it was registered?`);let s=0;for(;i;)if(r.register(i),i="blotName"in i?i.requiredContainer??null:null,s+=1,s>100){n.error(`Cycle detected in registering blot requiredContainer: "${t}"`);break}})),r})(e.formats,d.registry,C):d.registry,{...d,registry:f,container:n,theme:s,modules:Object.entries(h).reduce(((t,e)=>{let[n,i]=e;if(!i)return t;const s=I.import(`modules/${n}`);return null==s?(C.error(`Cannot load ${n} module. Are you sure you registered it?`),t):{...t,[n]:(0,r.A)({},s.DEFAULTS||{},i)}}),{}),bounds:B(d.bounds)}}(t,e),this.container=this.options.container,null==this.container)return void C.error("Invalid Quill container",t);this.options.debug&&I.debug(this.options.debug);const n=this.container.innerHTML.trim();this.container.classList.add("ql-container"),this.container.innerHTML="",E.A.set(this.container,this),this.root=this.addContainer("ql-editor"),this.root.classList.add("ql-blank"),this.emitter=new N.A;const s=i.ScrollBlot.blotName,l=this.options.registry.query(s);if(!l||!("blotName"in l))throw new Error(`Cannot initialize Quill without "${s}" blot`);if(this.scroll=new l(this.options.registry,this.root,{emitter:this.emitter}),this.editor=new x(this.scroll),this.selection=new f.A(this.scroll,this.emitter),this.composition=new _(this.scroll,this.emitter),this.theme=new this.options.theme(this,this.options),this.keyboard=this.theme.addModule("keyboard"),this.clipboard=this.theme.addModule("clipboard"),this.history=this.theme.addModule("history"),this.uploader=this.theme.addModule("uploader"),this.theme.addModule("input"),this.theme.addModule("uiNode"),this.theme.init(),this.emitter.on(N.A.events.EDITOR_CHANGE,(t=>{t===N.A.events.TEXT_CHANGE&&this.root.classList.toggle("ql-blank",this.editor.isBlank())})),this.emitter.on(N.A.events.SCROLL_UPDATE,((t,e)=>{const n=this.selection.lastRange,[r]=this.selection.getRange(),i=n&&r?{oldRange:n,newRange:r}:void 0;D.call(this,(()=>this.editor.update(null,e,i)),t)})),this.emitter.on(N.A.events.SCROLL_EMBED_UPDATE,((t,e)=>{const n=this.selection.lastRange,[r]=this.selection.getRange(),i=n&&r?{oldRange:n,newRange:r}:void 0;D.call(this,(()=>{const n=(new(o())).retain(t.offset(this)).retain({[t.statics.blotName]:e});return this.editor.update(n,[],i)}),I.sources.USER)})),n){const t=this.clipboard.convert({html:`${n}<p><br></p>`,text:"\n"});this.setContents(t)}this.history.clear(),this.options.placeholder&&this.root.setAttribute("data-placeholder",this.options.placeholder),this.options.readOnly&&this.disable(),this.allowReadOnlyEdits=!1}addContainer(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;if("string"==typeof t){const e=t;(t=document.createElement("div")).classList.add(e)}return this.container.insertBefore(t,e),t}blur(){this.selection.setRange(null)}deleteText(t,e,n){return[t,e,,n]=P(t,e,n),D.call(this,(()=>this.editor.deleteText(t,e)),n,t,-1*e)}disable(){this.enable(!1)}editReadOnly(t){this.allowReadOnlyEdits=!0;const e=t();return this.allowReadOnlyEdits=!1,e}enable(){let t=!(arguments.length>0&&void 0!==arguments[0])||arguments[0];this.scroll.enable(t),this.container.classList.toggle("ql-disabled",!t)}focus(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this.selection.focus(),t.preventScroll||this.scrollSelectionIntoView()}format(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:N.A.sources.API;return D.call(this,(()=>{const n=this.getSelection(!0);let r=new(o());if(null==n)return r;if(this.scroll.query(t,i.Scope.BLOCK))r=this.editor.formatLine(n.index,n.length,{[t]:e});else{if(0===n.length)return this.selection.format(t,e),r;r=this.editor.formatText(n.index,n.length,{[t]:e})}return this.setSelection(n,N.A.sources.SILENT),r}),n)}formatLine(t,e,n,r,i){let s;return[t,e,s,i]=P(t,e,n,r,i),D.call(this,(()=>this.editor.formatLine(t,e,s)),i,t,0)}formatText(t,e,n,r,i){let s;return[t,e,s,i]=P(t,e,n,r,i),D.call(this,(()=>this.editor.formatText(t,e,s)),i,t,0)}getBounds(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=null;if(n="number"==typeof t?this.selection.getBounds(t,e):this.selection.getBounds(t.index,t.length),!n)return null;const r=this.container.getBoundingClientRect();return{bottom:n.bottom-r.top,height:n.height,left:n.left-r.left,right:n.right-r.left,top:n.top-r.top,width:n.width}}getContents(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.getLength()-t;return[t,e]=P(t,e),this.editor.getContents(t,e)}getFormat(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.getSelection(!0),e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;return"number"==typeof t?this.editor.getFormat(t,e):this.editor.getFormat(t.index,t.length)}getIndex(t){return t.offset(this.scroll)}getLength(){return this.scroll.length()}getLeaf(t){return this.scroll.leaf(t)}getLine(t){return this.scroll.line(t)}getLines(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:Number.MAX_VALUE;return"number"!=typeof t?this.scroll.lines(t.index,t.length):this.scroll.lines(t,e)}getModule(t){return this.theme.modules[t]}getSelection(){return arguments.length>0&&void 0!==arguments[0]&&arguments[0]&&this.focus(),this.update(),this.selection.getRange()[0]}getSemanticHTML(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,e=arguments.length>1?arguments[1]:void 0;return"number"==typeof t&&(e=e??this.getLength()-t),[t,e]=P(t,e),this.editor.getHTML(t,e)}getText(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,e=arguments.length>1?arguments[1]:void 0;return"number"==typeof t&&(e=e??this.getLength()-t),[t,e]=P(t,e),this.editor.getText(t,e)}hasFocus(){return this.selection.hasFocus()}insertEmbed(t,e,n){let r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:I.sources.API;return D.call(this,(()=>this.editor.insertEmbed(t,e,n)),r,t)}insertText(t,e,n,r,i){let s;return[t,,s,i]=P(t,0,n,r,i),D.call(this,(()=>this.editor.insertText(t,e,s)),i,t,e.length)}isEnabled(){return this.scroll.isEnabled()}off(){return this.emitter.off(...arguments)}on(){return this.emitter.on(...arguments)}once(){return this.emitter.once(...arguments)}removeFormat(t,e,n){return[t,e,,n]=P(t,e,n),D.call(this,(()=>this.editor.removeFormat(t,e)),n,t)}scrollRectIntoView(t){((t,e)=>{const n=t.ownerDocument;let r=e,i=t;for(;i;){const t=i===n.body,e=t?{top:0,right:window.visualViewport?.width??n.documentElement.clientWidth,bottom:window.visualViewport?.height??n.documentElement.clientHeight,left:0}:S(i),o=getComputedStyle(i),l=T(r.left,r.right,e.left,e.right,O(o.scrollPaddingLeft),O(o.scrollPaddingRight)),a=T(r.top,r.bottom,e.top,e.bottom,O(o.scrollPaddingTop),O(o.scrollPaddingBottom));if(l||a)if(t)n.defaultView?.scrollBy(l,a);else{const{scrollLeft:t,scrollTop:e}=i;a&&(i.scrollTop+=a),l&&(i.scrollLeft+=l);const n=i.scrollLeft-t,s=i.scrollTop-e;r={left:r.left-n,top:r.top-s,right:r.right-n,bottom:r.bottom-s}}i=t||"fixed"===o.position?null:(s=i).parentElement||s.getRootNode().host||null}var s})(this.root,t)}scrollIntoView(){console.warn("Quill#scrollIntoView() has been deprecated and will be removed in the near future. Please use Quill#scrollSelectionIntoView() instead."),this.scrollSelectionIntoView()}scrollSelectionIntoView(){const t=this.selection.lastRange,e=t&&this.selection.getBounds(t.index,t.length);e&&this.scrollRectIntoView(e)}setContents(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:N.A.sources.API;return D.call(this,(()=>{t=new(o())(t);const e=this.getLength(),n=this.editor.deleteText(0,e),r=this.editor.insertContents(0,t),i=this.editor.deleteText(this.getLength()-1,1);return n.compose(r).compose(i)}),e)}setSelection(t,e,n){null==t?this.selection.setRange(null,e||I.sources.API):([t,e,,n]=P(t,e,n),this.selection.setRange(new f.Q(Math.max(0,t),e),n),n!==N.A.sources.SILENT&&this.scrollSelectionIntoView())}setText(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:N.A.sources.API;const n=(new(o())).insert(t);return this.setContents(n,e)}update(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:N.A.sources.USER;const e=this.scroll.update(t);return this.selection.update(t),e}updateContents(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:N.A.sources.API;return D.call(this,(()=>(t=new(o())(t),this.editor.applyDelta(t))),e,!0)}}function B(t){return"string"==typeof t?document.querySelector(t):t}function M(t){return Object.entries(t??{}).reduce(((t,e)=>{let[n,r]=e;return{...t,[n]:!0===r?{}:r}}),{})}function U(t){return Object.fromEntries(Object.entries(t).filter((t=>void 0!==t[1])))}function D(t,e,n,r){if(!this.isEnabled()&&e===N.A.sources.USER&&!this.allowReadOnlyEdits)return new(o());let i=null==n?null:this.getSelection();const s=this.editor.delta,l=t();if(null!=i&&(!0===n&&(n=i.index),null==r?i=z(i,l,e):0!==r&&(i=z(i,n,r,e)),this.setSelection(i,N.A.sources.SILENT)),l.length()>0){const t=[N.A.events.TEXT_CHANGE,l,s,e];this.emitter.emit(N.A.events.EDITOR_CHANGE,...t),e!==N.A.sources.SILENT&&this.emitter.emit(...t)}return l}function P(t,e,n,r,i){let s={};return"number"==typeof t.index&&"number"==typeof t.length?"number"!=typeof e?(i=r,r=n,n=e,e=t.length,t=t.index):(e=t.length,t=t.index):"number"!=typeof e&&(i=r,r=n,n=e,e=0),"object"==typeof n?(s=n,i=r):"string"==typeof n&&(null!=r?s[n]=r:i=n),[t,e,s,i=i||N.A.sources.API]}function z(t,e,n,r){const i="number"==typeof n?n:0;if(null==t)return null;let s,o;return e&&"function"==typeof e.transformPosition?[s,o]=[t.index,t.index+t.length].map((t=>e.transformPosition(t,r!==N.A.sources.USER))):[s,o]=[t.index,t.index+t.length].map((t=>t<e||t===e&&r===N.A.sources.USER?t:i>=0?t+i:Math.max(e,t+i))),new f.Q(s,o-s)}},8298:function(t,e,n){"use strict";n.d(e,{Q:function(){return a}});var r=n(6003),i=n(5123),s=n(3707),o=n(5374);const l=(0,n(6078).A)("quill:selection");class a{constructor(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;this.index=t,this.length=e}}function c(t,e){try{e.parentNode}catch(t){return!1}return t.contains(e)}e.A=class{constructor(t,e){this.emitter=e,this.scroll=t,this.composing=!1,this.mouseDown=!1,this.root=this.scroll.domNode,this.cursor=this.scroll.create("cursor",this),this.savedRange=new a(0,0),this.lastRange=this.savedRange,this.lastNative=null,this.handleComposition(),this.handleDragging(),this.emitter.listenDOM("selectionchange",document,(()=>{this.mouseDown||this.composing||setTimeout(this.update.bind(this,o.A.sources.USER),1)})),this.emitter.on(o.A.events.SCROLL_BEFORE_UPDATE,(()=>{if(!this.hasFocus())return;const t=this.getNativeRange();null!=t&&t.start.node!==this.cursor.textNode&&this.emitter.once(o.A.events.SCROLL_UPDATE,((e,n)=>{try{this.root.contains(t.start.node)&&this.root.contains(t.end.node)&&this.setNativeRange(t.start.node,t.start.offset,t.end.node,t.end.offset);const r=n.some((t=>"characterData"===t.type||"childList"===t.type||"attributes"===t.type&&t.target===this.root));this.update(r?o.A.sources.SILENT:e)}catch(t){}}))})),this.emitter.on(o.A.events.SCROLL_OPTIMIZE,((t,e)=>{if(e.range){const{startNode:t,startOffset:n,endNode:r,endOffset:i}=e.range;this.setNativeRange(t,n,r,i),this.update(o.A.sources.SILENT)}})),this.update(o.A.sources.SILENT)}handleComposition(){this.emitter.on(o.A.events.COMPOSITION_BEFORE_START,(()=>{this.composing=!0})),this.emitter.on(o.A.events.COMPOSITION_END,(()=>{if(this.composing=!1,this.cursor.parent){const t=this.cursor.restore();if(!t)return;setTimeout((()=>{this.setNativeRange(t.startNode,t.startOffset,t.endNode,t.endOffset)}),1)}}))}handleDragging(){this.emitter.listenDOM("mousedown",document.body,(()=>{this.mouseDown=!0})),this.emitter.listenDOM("mouseup",document.body,(()=>{this.mouseDown=!1,this.update(o.A.sources.USER)}))}focus(){this.hasFocus()||(this.root.focus({preventScroll:!0}),this.setRange(this.savedRange))}format(t,e){this.scroll.update();const n=this.getNativeRange();if(null!=n&&n.native.collapsed&&!this.scroll.query(t,r.Scope.BLOCK)){if(n.start.node!==this.cursor.textNode){const t=this.scroll.find(n.start.node,!1);if(null==t)return;if(t instanceof r.LeafBlot){const e=t.split(n.start.offset);t.parent.insertBefore(this.cursor,e)}else t.insertBefore(this.cursor,n.start.node);this.cursor.attach()}this.cursor.format(t,e),this.scroll.optimize(),this.setNativeRange(this.cursor.textNode,this.cursor.textNode.data.length),this.update()}}getBounds(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;const n=this.scroll.length();let r;t=Math.min(t,n-1),e=Math.min(t+e,n-1)-t;let[i,s]=this.scroll.leaf(t);if(null==i)return null;if(e>0&&s===i.length()){const[e]=this.scroll.leaf(t+1);if(e){const[n]=this.scroll.line(t),[r]=this.scroll.line(t+1);n===r&&(i=e,s=0)}}[r,s]=i.position(s,!0);const o=document.createRange();if(e>0)return o.setStart(r,s),[i,s]=this.scroll.leaf(t+e),null==i?null:([r,s]=i.position(s,!0),o.setEnd(r,s),o.getBoundingClientRect());let l,a="left";if(r instanceof Text){if(!r.data.length)return null;s<r.data.length?(o.setStart(r,s),o.setEnd(r,s+1)):(o.setStart(r,s-1),o.setEnd(r,s),a="right"),l=o.getBoundingClientRect()}else{if(!(i.domNode instanceof Element))return null;l=i.domNode.getBoundingClientRect(),s>0&&(a="right")}return{bottom:l.top+l.height,height:l.height,left:l[a],right:l[a],top:l.top,width:0}}getNativeRange(){const t=document.getSelection();if(null==t||t.rangeCount<=0)return null;const e=t.getRangeAt(0);if(null==e)return null;const n=this.normalizeNative(e);return l.info("getNativeRange",n),n}getRange(){const t=this.scroll.domNode;if("isConnected"in t&&!t.isConnected)return[null,null];const e=this.getNativeRange();return null==e?[null,null]:[this.normalizedToRange(e),e]}hasFocus(){return document.activeElement===this.root||null!=document.activeElement&&c(this.root,document.activeElement)}normalizedToRange(t){const e=[[t.start.node,t.start.offset]];t.native.collapsed||e.push([t.end.node,t.end.offset]);const n=e.map((t=>{const[e,n]=t,i=this.scroll.find(e,!0),s=i.offset(this.scroll);return 0===n?s:i instanceof r.LeafBlot?s+i.index(e,n):s+i.length()})),i=Math.min(Math.max(...n),this.scroll.length()-1),s=Math.min(i,...n);return new a(s,i-s)}normalizeNative(t){if(!c(this.root,t.startContainer)||!t.collapsed&&!c(this.root,t.endContainer))return null;const e={start:{node:t.startContainer,offset:t.startOffset},end:{node:t.endContainer,offset:t.endOffset},native:t};return[e.start,e.end].forEach((t=>{let{node:e,offset:n}=t;for(;!(e instanceof Text)&&e.childNodes.length>0;)if(e.childNodes.length>n)e=e.childNodes[n],n=0;else{if(e.childNodes.length!==n)break;e=e.lastChild,n=e instanceof Text?e.data.length:e.childNodes.length>0?e.childNodes.length:e.childNodes.length+1}t.node=e,t.offset=n})),e}rangeToNative(t){const e=this.scroll.length(),n=(t,n)=>{t=Math.min(e-1,t);const[r,i]=this.scroll.leaf(t);return r?r.position(i,n):[null,-1]};return[...n(t.index,!1),...n(t.index+t.length,!0)]}setNativeRange(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:t,r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:e,i=arguments.length>4&&void 0!==arguments[4]&&arguments[4];if(l.info("setNativeRange",t,e,n,r),null!=t&&(null==this.root.parentNode||null==t.parentNode||null==n.parentNode))return;const s=document.getSelection();if(null!=s)if(null!=t){this.hasFocus()||this.root.focus({preventScroll:!0});const{native:o}=this.getNativeRange()||{};if(null==o||i||t!==o.startContainer||e!==o.startOffset||n!==o.endContainer||r!==o.endOffset){t instanceof Element&&"BR"===t.tagName&&(e=Array.from(t.parentNode.childNodes).indexOf(t),t=t.parentNode),n instanceof Element&&"BR"===n.tagName&&(r=Array.from(n.parentNode.childNodes).indexOf(n),n=n.parentNode);const i=document.createRange();i.setStart(t,e),i.setEnd(n,r),s.removeAllRanges(),s.addRange(i)}}else s.removeAllRanges(),this.root.blur()}setRange(t){let e=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:o.A.sources.API;if("string"==typeof e&&(n=e,e=!1),l.info("setRange",t),null!=t){const n=this.rangeToNative(t);this.setNativeRange(...n,e)}else this.setNativeRange(null);this.update(n)}update(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:o.A.sources.USER;const e=this.lastRange,[n,r]=this.getRange();if(this.lastRange=n,this.lastNative=r,null!=this.lastRange&&(this.savedRange=this.lastRange),!(0,i.A)(e,this.lastRange)){if(!this.composing&&null!=r&&r.native.collapsed&&r.start.node!==this.cursor.textNode){const t=this.cursor.restore();t&&this.setNativeRange(t.startNode,t.startOffset,t.endNode,t.endOffset)}const n=[o.A.events.SELECTION_CHANGE,(0,s.A)(this.lastRange),(0,s.A)(e),t];this.emitter.emit(o.A.events.EDITOR_CHANGE,...n),t!==o.A.sources.SILENT&&this.emitter.emit(...n)}}}},9609:function(t,e){"use strict";class n{static DEFAULTS={modules:{}};static themes={default:n};modules={};constructor(t,e){this.quill=t,this.options=e}init(){Object.keys(this.options.modules).forEach((t=>{null==this.modules[t]&&this.addModule(t)}))}addModule(t){const e=this.quill.constructor.import(`modules/${t}`);return this.modules[t]=new e(this.quill,this.options.modules[t]||{}),this.modules[t]}}e.A=n},8276:function(t,e,n){"use strict";n.d(e,{Hu:function(){return l},gS:function(){return s},qh:function(){return o}});var r=n(6003);const i={scope:r.Scope.BLOCK,whitelist:["right","center","justify"]},s=new r.Attributor("align","align",i),o=new r.ClassAttributor("align","ql-align",i),l=new r.StyleAttributor("align","text-align",i)},9541:function(t,e,n){"use strict";n.d(e,{l:function(){return s},s:function(){return o}});var r=n(6003),i=n(8638);const s=new r.ClassAttributor("background","ql-bg",{scope:r.Scope.INLINE}),o=new i.a2("background","background-color",{scope:r.Scope.INLINE})},9404:function(t,e,n){"use strict";n.d(e,{Ay:function(){return h},Cy:function(){return d},EJ:function(){return u}});var r=n(9698),i=n(3036),s=n(4541),o=n(4850),l=n(5508),a=n(580),c=n(6142);class u extends a.A{static create(t){const e=super.create(t);return e.setAttribute("spellcheck","false"),e}code(t,e){return this.children.map((t=>t.length()<=1?"":t.domNode.innerText)).join("\n").slice(t,t+e)}html(t,e){return`<pre>\n${(0,l.X)(this.code(t,e))}\n</pre>`}}class h extends r.Ay{static TAB="  ";static register(){c.Ay.register(u)}}class d extends o.A{}d.blotName="code",d.tagName="CODE",h.blotName="code-block",h.className="ql-code-block",h.tagName="DIV",u.blotName="code-block-container",u.className="ql-code-block-container",u.tagName="DIV",u.allowedChildren=[h],h.allowedChildren=[l.A,i.A,s.A],h.requiredContainer=u},8638:function(t,e,n){"use strict";n.d(e,{JM:function(){return o},a2:function(){return i},g3:function(){return s}});var r=n(6003);class i extends r.StyleAttributor{value(t){let e=super.value(t);return e.startsWith("rgb(")?(e=e.replace(/^[^\d]+/,"").replace(/[^\d]+$/,""),`#${e.split(",").map((t=>`00${parseInt(t,10).toString(16)}`.slice(-2))).join("")}`):e}}const s=new r.ClassAttributor("color","ql-color",{scope:r.Scope.INLINE}),o=new i("color","color",{scope:r.Scope.INLINE})},7912:function(t,e,n){"use strict";n.d(e,{Mc:function(){return s},VL:function(){return l},sY:function(){return o}});var r=n(6003);const i={scope:r.Scope.BLOCK,whitelist:["rtl"]},s=new r.Attributor("direction","dir",i),o=new r.ClassAttributor("direction","ql-direction",i),l=new r.StyleAttributor("direction","direction",i)},6772:function(t,e,n){"use strict";n.d(e,{q:function(){return s},z:function(){return l}});var r=n(6003);const i={scope:r.Scope.INLINE,whitelist:["serif","monospace"]},s=new r.ClassAttributor("font","ql-font",i);class o extends r.StyleAttributor{value(t){return super.value(t).replace(/["']/g,"")}}const l=new o("font","font-family",i)},664:function(t,e,n){"use strict";n.d(e,{U:function(){return i},r:function(){return s}});var r=n(6003);const i=new r.ClassAttributor("size","ql-size",{scope:r.Scope.INLINE,whitelist:["small","large","huge"]}),s=new r.StyleAttributor("size","font-size",{scope:r.Scope.INLINE,whitelist:["10px","18px","32px"]})},584:function(t,e,n){"use strict";n.d(e,{Ay:function(){return S},hV:function(){return I}});var r=n(6003),i=n(5232),s=n.n(i),o=n(9698),l=n(6078),a=n(4266),c=n(6142),u=n(8276),h=n(9541),d=n(9404),f=n(8638),p=n(7912),g=n(6772),m=n(664),b=n(8123);const y=/font-weight:\s*normal/,v=["P","OL","UL"],A=t=>t&&v.includes(t.tagName),x=/\bmso-list:[^;]*ignore/i,N=/\bmso-list:[^;]*\bl(\d+)/i,E=/\bmso-list:[^;]*\blevel(\d+)/i,w=[function(t){"urn:schemas-microsoft-com:office:word"===t.documentElement.getAttribute("xmlns:w")&&(t=>{const e=Array.from(t.querySelectorAll("[style*=mso-list]")),n=[],r=[];e.forEach((t=>{(t.getAttribute("style")||"").match(x)?n.push(t):r.push(t)})),n.forEach((t=>t.parentNode?.removeChild(t)));const i=t.documentElement.innerHTML,s=r.map((t=>((t,e)=>{const n=t.getAttribute("style"),r=n?.match(N);if(!r)return null;const i=Number(r[1]),s=n?.match(E),o=s?Number(s[1]):1,l=new RegExp(`@list l${i}:level${o}\\s*\\{[^\\}]*mso-level-number-format:\\s*([\\w-]+)`,"i"),a=e.match(l);return{id:i,indent:o,type:a&&"bullet"===a[1]?"bullet":"ordered",element:t}})(t,i))).filter((t=>t));for(;s.length;){const t=[];let e=s.shift();for(;e;)t.push(e),e=s.length&&s[0]?.element===e.element.nextElementSibling&&s[0].id===e.id?s.shift():null;const n=document.createElement("ul");t.forEach((t=>{const e=document.createElement("li");e.setAttribute("data-list",t.type),t.indent>1&&e.setAttribute("class","ql-indent-"+(t.indent-1)),e.innerHTML=t.element.innerHTML,n.appendChild(e)}));const r=t[0]?.element,{parentNode:i}=r??{};r&&i?.replaceChild(n,r),t.slice(1).forEach((t=>{let{element:e}=t;i?.removeChild(e)}))}})(t)},function(t){t.querySelector('[id^="docs-internal-guid-"]')&&((t=>{Array.from(t.querySelectorAll('b[style*="font-weight"]')).filter((t=>t.getAttribute("style")?.match(y))).forEach((e=>{const n=t.createDocumentFragment();n.append(...e.childNodes),e.parentNode?.replaceChild(n,e)}))})(t),(t=>{Array.from(t.querySelectorAll("br")).filter((t=>A(t.previousElementSibling)&&A(t.nextElementSibling))).forEach((t=>{t.parentNode?.removeChild(t)}))})(t))}];const q=(0,l.A)("quill:clipboard"),k=[[Node.TEXT_NODE,function(t,e,n){let r=t.data;if("O:P"===t.parentElement?.tagName)return e.insert(r.trim());if(!R(t)){if(0===r.trim().length&&r.includes("\n")&&!function(t,e){return t.previousElementSibling&&t.nextElementSibling&&!j(t.previousElementSibling,e)&&!j(t.nextElementSibling,e)}(t,n))return e;r=r.replace(/[^\S\u00a0]/g," "),r=r.replace(/ {2,}/g," "),(null==t.previousSibling&&null!=t.parentElement&&j(t.parentElement,n)||t.previousSibling instanceof Element&&j(t.previousSibling,n))&&(r=r.replace(/^ /,"")),(null==t.nextSibling&&null!=t.parentElement&&j(t.parentElement,n)||t.nextSibling instanceof Element&&j(t.nextSibling,n))&&(r=r.replace(/ $/,"")),r=r.replaceAll(" "," ")}return e.insert(r)}],[Node.TEXT_NODE,M],["br",function(t,e){return T(e,"\n")||e.insert("\n"),e}],[Node.ELEMENT_NODE,M],[Node.ELEMENT_NODE,function(t,e,n){const i=n.query(t);if(null==i)return e;if(i.prototype instanceof r.EmbedBlot){const e={},r=i.value(t);if(null!=r)return e[i.blotName]=r,(new(s())).insert(e,i.formats(t,n))}else if(i.prototype instanceof r.BlockBlot&&!T(e,"\n")&&e.insert("\n"),"blotName"in i&&"formats"in i&&"function"==typeof i.formats)return O(e,i.blotName,i.formats(t,n),n);return e}],[Node.ELEMENT_NODE,function(t,e,n){const i=r.Attributor.keys(t),s=r.ClassAttributor.keys(t),o=r.StyleAttributor.keys(t),l={};return i.concat(s).concat(o).forEach((e=>{let i=n.query(e,r.Scope.ATTRIBUTE);null!=i&&(l[i.attrName]=i.value(t),l[i.attrName])||(i=_[e],null==i||i.attrName!==e&&i.keyName!==e||(l[i.attrName]=i.value(t)||void 0),i=L[e],null==i||i.attrName!==e&&i.keyName!==e||(i=L[e],l[i.attrName]=i.value(t)||void 0))})),Object.entries(l).reduce(((t,e)=>{let[r,i]=e;return O(t,r,i,n)}),e)}],[Node.ELEMENT_NODE,function(t,e,n){const r={},i=t.style||{};return"italic"===i.fontStyle&&(r.italic=!0),"underline"===i.textDecoration&&(r.underline=!0),"line-through"===i.textDecoration&&(r.strike=!0),(i.fontWeight?.startsWith("bold")||parseInt(i.fontWeight,10)>=700)&&(r.bold=!0),e=Object.entries(r).reduce(((t,e)=>{let[r,i]=e;return O(t,r,i,n)}),e),parseFloat(i.textIndent||0)>0?(new(s())).insert("\t").concat(e):e}],["li",function(t,e,n){const r=n.query(t);if(null==r||"list"!==r.blotName||!T(e,"\n"))return e;let i=-1,o=t.parentNode;for(;null!=o;)["OL","UL"].includes(o.tagName)&&(i+=1),o=o.parentNode;return i<=0?e:e.reduce(((t,e)=>e.insert?e.attributes&&"number"==typeof e.attributes.indent?t.push(e):t.insert(e.insert,{indent:i,...e.attributes||{}}):t),new(s()))}],["ol, ul",function(t,e,n){const r=t;let i="OL"===r.tagName?"ordered":"bullet";const s=r.getAttribute("data-checked");return s&&(i="true"===s?"checked":"unchecked"),O(e,"list",i,n)}],["pre",function(t,e,n){const r=n.query("code-block");return O(e,"code-block",!r||!("formats"in r)||"function"!=typeof r.formats||r.formats(t,n),n)}],["tr",function(t,e,n){const r="TABLE"===t.parentElement?.tagName?t.parentElement:t.parentElement?.parentElement;return null!=r?O(e,"table",Array.from(r.querySelectorAll("tr")).indexOf(t)+1,n):e}],["b",B("bold")],["i",B("italic")],["strike",B("strike")],["style",function(){return new(s())}]],_=[u.gS,p.Mc].reduce(((t,e)=>(t[e.keyName]=e,t)),{}),L=[u.Hu,h.s,f.JM,p.VL,g.z,m.r].reduce(((t,e)=>(t[e.keyName]=e,t)),{});class S extends a.A{static DEFAULTS={matchers:[]};constructor(t,e){super(t,e),this.quill.root.addEventListener("copy",(t=>this.onCaptureCopy(t,!1))),this.quill.root.addEventListener("cut",(t=>this.onCaptureCopy(t,!0))),this.quill.root.addEventListener("paste",this.onCapturePaste.bind(this)),this.matchers=[],k.concat(this.options.matchers??[]).forEach((t=>{let[e,n]=t;this.addMatcher(e,n)}))}addMatcher(t,e){this.matchers.push([t,e])}convert(t){let{html:e,text:n}=t,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(r[d.Ay.blotName])return(new(s())).insert(n||"",{[d.Ay.blotName]:r[d.Ay.blotName]});if(!e)return(new(s())).insert(n||"",r);const i=this.convertHTML(e);return T(i,"\n")&&(null==i.ops[i.ops.length-1].attributes||r.table)?i.compose((new(s())).retain(i.length()-1).delete(1)):i}normalizeHTML(t){(t=>{t.documentElement&&w.forEach((e=>{e(t)}))})(t)}convertHTML(t){const e=(new DOMParser).parseFromString(t,"text/html");this.normalizeHTML(e);const n=e.body,r=new WeakMap,[i,s]=this.prepareMatching(n,r);return I(this.quill.scroll,n,i,s,r)}dangerouslyPasteHTML(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:c.Ay.sources.API;if("string"==typeof t){const n=this.convert({html:t,text:""});this.quill.setContents(n,e),this.quill.setSelection(0,c.Ay.sources.SILENT)}else{const r=this.convert({html:e,text:""});this.quill.updateContents((new(s())).retain(t).concat(r),n),this.quill.setSelection(t+r.length(),c.Ay.sources.SILENT)}}onCaptureCopy(t){let e=arguments.length>1&&void 0!==arguments[1]&&arguments[1];if(t.defaultPrevented)return;t.preventDefault();const[n]=this.quill.selection.getRange();if(null==n)return;const{html:r,text:i}=this.onCopy(n,e);t.clipboardData?.setData("text/plain",i),t.clipboardData?.setData("text/html",r),e&&(0,b.Xo)({range:n,quill:this.quill})}normalizeURIList(t){return t.split(/\r?\n/).filter((t=>"#"!==t[0])).join("\n")}onCapturePaste(t){if(t.defaultPrevented||!this.quill.isEnabled())return;t.preventDefault();const e=this.quill.getSelection(!0);if(null==e)return;const n=t.clipboardData?.getData("text/html");let r=t.clipboardData?.getData("text/plain");if(!n&&!r){const e=t.clipboardData?.getData("text/uri-list");e&&(r=this.normalizeURIList(e))}const i=Array.from(t.clipboardData?.files||[]);if(!n&&i.length>0)this.quill.uploader.upload(e,i);else{if(n&&i.length>0){const t=(new DOMParser).parseFromString(n,"text/html");if(1===t.body.childElementCount&&"IMG"===t.body.firstElementChild?.tagName)return void this.quill.uploader.upload(e,i)}this.onPaste(e,{html:n,text:r})}}onCopy(t){const e=this.quill.getText(t);return{html:this.quill.getSemanticHTML(t),text:e}}onPaste(t,e){let{text:n,html:r}=e;const i=this.quill.getFormat(t.index),o=this.convert({text:n,html:r},i);q.log("onPaste",o,{text:n,html:r});const l=(new(s())).retain(t.index).delete(t.length).concat(o);this.quill.updateContents(l,c.Ay.sources.USER),this.quill.setSelection(l.length()-t.length,c.Ay.sources.SILENT),this.quill.scrollSelectionIntoView()}prepareMatching(t,e){const n=[],r=[];return this.matchers.forEach((i=>{const[s,o]=i;switch(s){case Node.TEXT_NODE:r.push(o);break;case Node.ELEMENT_NODE:n.push(o);break;default:Array.from(t.querySelectorAll(s)).forEach((t=>{if(e.has(t)){const n=e.get(t);n?.push(o)}else e.set(t,[o])}))}})),[n,r]}}function O(t,e,n,r){return r.query(e)?t.reduce(((t,r)=>{if(!r.insert)return t;if(r.attributes&&r.attributes[e])return t.push(r);const i=n?{[e]:n}:{};return t.insert(r.insert,{...i,...r.attributes})}),new(s())):t}function T(t,e){let n="";for(let r=t.ops.length-1;r>=0&&n.length<e.length;--r){const e=t.ops[r];if("string"!=typeof e.insert)break;n=e.insert+n}return n.slice(-1*e.length)===e}function j(t,e){if(!(t instanceof Element))return!1;const n=e.query(t);return!(n&&n.prototype instanceof r.EmbedBlot)&&["address","article","blockquote","canvas","dd","div","dl","dt","fieldset","figcaption","figure","footer","form","h1","h2","h3","h4","h5","h6","header","iframe","li","main","nav","ol","output","p","pre","section","table","td","tr","ul","video"].includes(t.tagName.toLowerCase())}const C=new WeakMap;function R(t){return null!=t&&(C.has(t)||("PRE"===t.tagName?C.set(t,!0):C.set(t,R(t.parentNode))),C.get(t))}function I(t,e,n,r,i){return e.nodeType===e.TEXT_NODE?r.reduce(((n,r)=>r(e,n,t)),new(s())):e.nodeType===e.ELEMENT_NODE?Array.from(e.childNodes||[]).reduce(((s,o)=>{let l=I(t,o,n,r,i);return o.nodeType===e.ELEMENT_NODE&&(l=n.reduce(((e,n)=>n(o,e,t)),l),l=(i.get(o)||[]).reduce(((e,n)=>n(o,e,t)),l)),s.concat(l)}),new(s())):new(s())}function B(t){return(e,n,r)=>O(n,t,!0,r)}function M(t,e,n){if(!T(e,"\n")){if(j(t,n)&&(t.childNodes.length>0||t instanceof HTMLParagraphElement))return e.insert("\n");if(e.length()>0&&t.nextSibling){let r=t.nextSibling;for(;null!=r;){if(j(r,n))return e.insert("\n");const t=n.query(r);if(t&&t.prototype instanceof o.zo)return e.insert("\n");r=r.firstChild}}}return e}},8123:function(t,e,n){"use strict";n.d(e,{Ay:function(){return f},Xo:function(){return v}});var r=n(5123),i=n(3707),s=n(5232),o=n.n(s),l=n(6003),a=n(6142),c=n(6078),u=n(4266);const h=(0,c.A)("quill:keyboard"),d=/Mac/i.test(navigator.platform)?"metaKey":"ctrlKey";class f extends u.A{static match(t,e){return!["altKey","ctrlKey","metaKey","shiftKey"].some((n=>!!e[n]!==t[n]&&null!==e[n]))&&(e.key===t.key||e.key===t.which)}constructor(t,e){super(t,e),this.bindings={},Object.keys(this.options.bindings).forEach((t=>{this.options.bindings[t]&&this.addBinding(this.options.bindings[t])})),this.addBinding({key:"Enter",shiftKey:null},this.handleEnter),this.addBinding({key:"Enter",metaKey:null,ctrlKey:null,altKey:null},(()=>{})),/Firefox/i.test(navigator.userAgent)?(this.addBinding({key:"Backspace"},{collapsed:!0},this.handleBackspace),this.addBinding({key:"Delete"},{collapsed:!0},this.handleDelete)):(this.addBinding({key:"Backspace"},{collapsed:!0,prefix:/^.?$/},this.handleBackspace),this.addBinding({key:"Delete"},{collapsed:!0,suffix:/^.?$/},this.handleDelete)),this.addBinding({key:"Backspace"},{collapsed:!1},this.handleDeleteRange),this.addBinding({key:"Delete"},{collapsed:!1},this.handleDeleteRange),this.addBinding({key:"Backspace",altKey:null,ctrlKey:null,metaKey:null,shiftKey:null},{collapsed:!0,offset:0},this.handleBackspace),this.listen()}addBinding(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};const r=function(t){if("string"==typeof t||"number"==typeof t)t={key:t};else{if("object"!=typeof t)return null;t=(0,i.A)(t)}return t.shortKey&&(t[d]=t.shortKey,delete t.shortKey),t}(t);null!=r?("function"==typeof e&&(e={handler:e}),"function"==typeof n&&(n={handler:n}),(Array.isArray(r.key)?r.key:[r.key]).forEach((t=>{const i={...r,key:t,...e,...n};this.bindings[i.key]=this.bindings[i.key]||[],this.bindings[i.key].push(i)}))):h.warn("Attempted to add invalid keyboard binding",r)}listen(){this.quill.root.addEventListener("keydown",(t=>{if(t.defaultPrevented||t.isComposing)return;if(229===t.keyCode&&("Enter"===t.key||"Backspace"===t.key))return;const e=(this.bindings[t.key]||[]).concat(this.bindings[t.which]||[]).filter((e=>f.match(t,e)));if(0===e.length)return;const n=a.Ay.find(t.target,!0);if(n&&n.scroll!==this.quill.scroll)return;const i=this.quill.getSelection();if(null==i||!this.quill.hasFocus())return;const[s,o]=this.quill.getLine(i.index),[c,u]=this.quill.getLeaf(i.index),[h,d]=0===i.length?[c,u]:this.quill.getLeaf(i.index+i.length),p=c instanceof l.TextBlot?c.value().slice(0,u):"",g=h instanceof l.TextBlot?h.value().slice(d):"",m={collapsed:0===i.length,empty:0===i.length&&s.length()<=1,format:this.quill.getFormat(i),line:s,offset:o,prefix:p,suffix:g,event:t};e.some((t=>{if(null!=t.collapsed&&t.collapsed!==m.collapsed)return!1;if(null!=t.empty&&t.empty!==m.empty)return!1;if(null!=t.offset&&t.offset!==m.offset)return!1;if(Array.isArray(t.format)){if(t.format.every((t=>null==m.format[t])))return!1}else if("object"==typeof t.format&&!Object.keys(t.format).every((e=>!0===t.format[e]?null!=m.format[e]:!1===t.format[e]?null==m.format[e]:(0,r.A)(t.format[e],m.format[e]))))return!1;return!(null!=t.prefix&&!t.prefix.test(m.prefix)||null!=t.suffix&&!t.suffix.test(m.suffix)||!0===t.handler.call(this,i,m,t))}))&&t.preventDefault()}))}handleBackspace(t,e){const n=/[\uD800-\uDBFF][\uDC00-\uDFFF]$/.test(e.prefix)?2:1;if(0===t.index||this.quill.getLength()<=1)return;let r={};const[i]=this.quill.getLine(t.index);let l=(new(o())).retain(t.index-n).delete(n);if(0===e.offset){const[e]=this.quill.getLine(t.index-1);if(e&&!("block"===e.statics.blotName&&e.length()<=1)){const e=i.formats(),n=this.quill.getFormat(t.index-1,1);if(r=s.AttributeMap.diff(e,n)||{},Object.keys(r).length>0){const e=(new(o())).retain(t.index+i.length()-2).retain(1,r);l=l.compose(e)}}}this.quill.updateContents(l,a.Ay.sources.USER),this.quill.focus()}handleDelete(t,e){const n=/^[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(e.suffix)?2:1;if(t.index>=this.quill.getLength()-n)return;let r={};const[i]=this.quill.getLine(t.index);let l=(new(o())).retain(t.index).delete(n);if(e.offset>=i.length()-1){const[e]=this.quill.getLine(t.index+1);if(e){const n=i.formats(),o=this.quill.getFormat(t.index,1);r=s.AttributeMap.diff(n,o)||{},Object.keys(r).length>0&&(l=l.retain(e.length()-1).retain(1,r))}}this.quill.updateContents(l,a.Ay.sources.USER),this.quill.focus()}handleDeleteRange(t){v({range:t,quill:this.quill}),this.quill.focus()}handleEnter(t,e){const n=Object.keys(e.format).reduce(((t,n)=>(this.quill.scroll.query(n,l.Scope.BLOCK)&&!Array.isArray(e.format[n])&&(t[n]=e.format[n]),t)),{}),r=(new(o())).retain(t.index).delete(t.length).insert("\n",n);this.quill.updateContents(r,a.Ay.sources.USER),this.quill.setSelection(t.index+1,a.Ay.sources.SILENT),this.quill.focus()}}const p={bindings:{bold:b("bold"),italic:b("italic"),underline:b("underline"),indent:{key:"Tab",format:["blockquote","indent","list"],handler(t,e){return!(!e.collapsed||0===e.offset)||(this.quill.format("indent","+1",a.Ay.sources.USER),!1)}},outdent:{key:"Tab",shiftKey:!0,format:["blockquote","indent","list"],handler(t,e){return!(!e.collapsed||0===e.offset)||(this.quill.format("indent","-1",a.Ay.sources.USER),!1)}},"outdent backspace":{key:"Backspace",collapsed:!0,shiftKey:null,metaKey:null,ctrlKey:null,altKey:null,format:["indent","list"],offset:0,handler(t,e){null!=e.format.indent?this.quill.format("indent","-1",a.Ay.sources.USER):null!=e.format.list&&this.quill.format("list",!1,a.Ay.sources.USER)}},"indent code-block":g(!0),"outdent code-block":g(!1),"remove tab":{key:"Tab",shiftKey:!0,collapsed:!0,prefix:/\t$/,handler(t){this.quill.deleteText(t.index-1,1,a.Ay.sources.USER)}},tab:{key:"Tab",handler(t,e){if(e.format.table)return!0;this.quill.history.cutoff();const n=(new(o())).retain(t.index).delete(t.length).insert("\t");return this.quill.updateContents(n,a.Ay.sources.USER),this.quill.history.cutoff(),this.quill.setSelection(t.index+1,a.Ay.sources.SILENT),!1}},"blockquote empty enter":{key:"Enter",collapsed:!0,format:["blockquote"],empty:!0,handler(){this.quill.format("blockquote",!1,a.Ay.sources.USER)}},"list empty enter":{key:"Enter",collapsed:!0,format:["list"],empty:!0,handler(t,e){const n={list:!1};e.format.indent&&(n.indent=!1),this.quill.formatLine(t.index,t.length,n,a.Ay.sources.USER)}},"checklist enter":{key:"Enter",collapsed:!0,format:{list:"checked"},handler(t){const[e,n]=this.quill.getLine(t.index),r={...e.formats(),list:"checked"},i=(new(o())).retain(t.index).insert("\n",r).retain(e.length()-n-1).retain(1,{list:"unchecked"});this.quill.updateContents(i,a.Ay.sources.USER),this.quill.setSelection(t.index+1,a.Ay.sources.SILENT),this.quill.scrollSelectionIntoView()}},"header enter":{key:"Enter",collapsed:!0,format:["header"],suffix:/^$/,handler(t,e){const[n,r]=this.quill.getLine(t.index),i=(new(o())).retain(t.index).insert("\n",e.format).retain(n.length()-r-1).retain(1,{header:null});this.quill.updateContents(i,a.Ay.sources.USER),this.quill.setSelection(t.index+1,a.Ay.sources.SILENT),this.quill.scrollSelectionIntoView()}},"table backspace":{key:"Backspace",format:["table"],collapsed:!0,offset:0,handler(){}},"table delete":{key:"Delete",format:["table"],collapsed:!0,suffix:/^$/,handler(){}},"table enter":{key:"Enter",shiftKey:null,format:["table"],handler(t){const e=this.quill.getModule("table");if(e){const[n,r,i,s]=e.getTable(t),l=function(t,e,n,r){return null==e.prev&&null==e.next?null==n.prev&&null==n.next?0===r?-1:1:null==n.prev?-1:1:null==e.prev?-1:null==e.next?1:null}(0,r,i,s);if(null==l)return;let c=n.offset();if(l<0){const e=(new(o())).retain(c).insert("\n");this.quill.updateContents(e,a.Ay.sources.USER),this.quill.setSelection(t.index+1,t.length,a.Ay.sources.SILENT)}else if(l>0){c+=n.length();const t=(new(o())).retain(c).insert("\n");this.quill.updateContents(t,a.Ay.sources.USER),this.quill.setSelection(c,a.Ay.sources.USER)}}}},"table tab":{key:"Tab",shiftKey:null,format:["table"],handler(t,e){const{event:n,line:r}=e,i=r.offset(this.quill.scroll);n.shiftKey?this.quill.setSelection(i-1,a.Ay.sources.USER):this.quill.setSelection(i+r.length(),a.Ay.sources.USER)}},"list autofill":{key:" ",shiftKey:null,collapsed:!0,format:{"code-block":!1,blockquote:!1,table:!1},prefix:/^\s*?(\d+\.|-|\*|\[ ?\]|\[x\])$/,handler(t,e){if(null==this.quill.scroll.query("list"))return!0;const{length:n}=e.prefix,[r,i]=this.quill.getLine(t.index);if(i>n)return!0;let s;switch(e.prefix.trim()){case"[]":case"[ ]":s="unchecked";break;case"[x]":s="checked";break;case"-":case"*":s="bullet";break;default:s="ordered"}this.quill.insertText(t.index," ",a.Ay.sources.USER),this.quill.history.cutoff();const l=(new(o())).retain(t.index-i).delete(n+1).retain(r.length()-2-i).retain(1,{list:s});return this.quill.updateContents(l,a.Ay.sources.USER),this.quill.history.cutoff(),this.quill.setSelection(t.index-n,a.Ay.sources.SILENT),!1}},"code exit":{key:"Enter",collapsed:!0,format:["code-block"],prefix:/^$/,suffix:/^\s*$/,handler(t){const[e,n]=this.quill.getLine(t.index);let r=2,i=e;for(;null!=i&&i.length()<=1&&i.formats()["code-block"];)if(i=i.prev,r-=1,r<=0){const r=(new(o())).retain(t.index+e.length()-n-2).retain(1,{"code-block":null}).delete(1);return this.quill.updateContents(r,a.Ay.sources.USER),this.quill.setSelection(t.index-1,a.Ay.sources.SILENT),!1}return!0}},"embed left":m("ArrowLeft",!1),"embed left shift":m("ArrowLeft",!0),"embed right":m("ArrowRight",!1),"embed right shift":m("ArrowRight",!0),"table down":y(!1),"table up":y(!0)}};function g(t){return{key:"Tab",shiftKey:!t,format:{"code-block":!0},handler(e,n){let{event:r}=n;const i=this.quill.scroll.query("code-block"),{TAB:s}=i;if(0===e.length&&!r.shiftKey)return this.quill.insertText(e.index,s,a.Ay.sources.USER),void this.quill.setSelection(e.index+s.length,a.Ay.sources.SILENT);const o=0===e.length?this.quill.getLines(e.index,1):this.quill.getLines(e);let{index:l,length:c}=e;o.forEach(((e,n)=>{t?(e.insertAt(0,s),0===n?l+=s.length:c+=s.length):e.domNode.textContent.startsWith(s)&&(e.deleteAt(0,s.length),0===n?l-=s.length:c-=s.length)})),this.quill.update(a.Ay.sources.USER),this.quill.setSelection(l,c,a.Ay.sources.SILENT)}}}function m(t,e){return{key:t,shiftKey:e,altKey:null,["ArrowLeft"===t?"prefix":"suffix"]:/^$/,handler(n){let{index:r}=n;"ArrowRight"===t&&(r+=n.length+1);const[i]=this.quill.getLeaf(r);return!(i instanceof l.EmbedBlot&&("ArrowLeft"===t?e?this.quill.setSelection(n.index-1,n.length+1,a.Ay.sources.USER):this.quill.setSelection(n.index-1,a.Ay.sources.USER):e?this.quill.setSelection(n.index,n.length+1,a.Ay.sources.USER):this.quill.setSelection(n.index+n.length+1,a.Ay.sources.USER),1))}}}function b(t){return{key:t[0],shortKey:!0,handler(e,n){this.quill.format(t,!n.format[t],a.Ay.sources.USER)}}}function y(t){return{key:t?"ArrowUp":"ArrowDown",collapsed:!0,format:["table"],handler(e,n){const r=t?"prev":"next",i=n.line,s=i.parent[r];if(null!=s){if("table-row"===s.statics.blotName){let t=s.children.head,e=i;for(;null!=e.prev;)e=e.prev,t=t.next;const r=t.offset(this.quill.scroll)+Math.min(n.offset,t.length()-1);this.quill.setSelection(r,0,a.Ay.sources.USER)}}else{const e=i.table()[r];null!=e&&(t?this.quill.setSelection(e.offset(this.quill.scroll)+e.length()-1,0,a.Ay.sources.USER):this.quill.setSelection(e.offset(this.quill.scroll),0,a.Ay.sources.USER))}return!1}}}function v(t){let{quill:e,range:n}=t;const r=e.getLines(n);let i={};if(r.length>1){const t=r[0].formats(),e=r[r.length-1].formats();i=s.AttributeMap.diff(e,t)||{}}e.deleteText(n,a.Ay.sources.USER),Object.keys(i).length>0&&e.formatLine(n.index,1,i,a.Ay.sources.USER),e.setSelection(n.index,a.Ay.sources.SILENT)}f.DEFAULTS=p},8920:function(t){"use strict";var e=Object.prototype.hasOwnProperty,n="~";function r(){}function i(t,e,n){this.fn=t,this.context=e,this.once=n||!1}function s(t,e,r,s,o){if("function"!=typeof r)throw new TypeError("The listener must be a function");var l=new i(r,s||t,o),a=n?n+e:e;return t._events[a]?t._events[a].fn?t._events[a]=[t._events[a],l]:t._events[a].push(l):(t._events[a]=l,t._eventsCount++),t}function o(t,e){0==--t._eventsCount?t._events=new r:delete t._events[e]}function l(){this._events=new r,this._eventsCount=0}Object.create&&(r.prototype=Object.create(null),(new r).__proto__||(n=!1)),l.prototype.eventNames=function(){var t,r,i=[];if(0===this._eventsCount)return i;for(r in t=this._events)e.call(t,r)&&i.push(n?r.slice(1):r);return Object.getOwnPropertySymbols?i.concat(Object.getOwnPropertySymbols(t)):i},l.prototype.listeners=function(t){var e=n?n+t:t,r=this._events[e];if(!r)return[];if(r.fn)return[r.fn];for(var i=0,s=r.length,o=new Array(s);i<s;i++)o[i]=r[i].fn;return o},l.prototype.listenerCount=function(t){var e=n?n+t:t,r=this._events[e];return r?r.fn?1:r.length:0},l.prototype.emit=function(t,e,r,i,s,o){var l=n?n+t:t;if(!this._events[l])return!1;var a,c,u=this._events[l],h=arguments.length;if(u.fn){switch(u.once&&this.removeListener(t,u.fn,void 0,!0),h){case 1:return u.fn.call(u.context),!0;case 2:return u.fn.call(u.context,e),!0;case 3:return u.fn.call(u.context,e,r),!0;case 4:return u.fn.call(u.context,e,r,i),!0;case 5:return u.fn.call(u.context,e,r,i,s),!0;case 6:return u.fn.call(u.context,e,r,i,s,o),!0}for(c=1,a=new Array(h-1);c<h;c++)a[c-1]=arguments[c];u.fn.apply(u.context,a)}else{var d,f=u.length;for(c=0;c<f;c++)switch(u[c].once&&this.removeListener(t,u[c].fn,void 0,!0),h){case 1:u[c].fn.call(u[c].context);break;case 2:u[c].fn.call(u[c].context,e);break;case 3:u[c].fn.call(u[c].context,e,r);break;case 4:u[c].fn.call(u[c].context,e,r,i);break;default:if(!a)for(d=1,a=new Array(h-1);d<h;d++)a[d-1]=arguments[d];u[c].fn.apply(u[c].context,a)}}return!0},l.prototype.on=function(t,e,n){return s(this,t,e,n,!1)},l.prototype.once=function(t,e,n){return s(this,t,e,n,!0)},l.prototype.removeListener=function(t,e,r,i){var s=n?n+t:t;if(!this._events[s])return this;if(!e)return o(this,s),this;var l=this._events[s];if(l.fn)l.fn!==e||i&&!l.once||r&&l.context!==r||o(this,s);else{for(var a=0,c=[],u=l.length;a<u;a++)(l[a].fn!==e||i&&!l[a].once||r&&l[a].context!==r)&&c.push(l[a]);c.length?this._events[s]=1===c.length?c[0]:c:o(this,s)}return this},l.prototype.removeAllListeners=function(t){var e;return t?(e=n?n+t:t,this._events[e]&&o(this,e)):(this._events=new r,this._eventsCount=0),this},l.prototype.off=l.prototype.removeListener,l.prototype.addListener=l.prototype.on,l.prefixed=n,l.EventEmitter=l,t.exports=l},5090:function(t){var e=-1,n=1,r=0;function i(t,g,m,b,y){if(t===g)return t?[[r,t]]:[];if(null!=m){var A=function(t,e,n){var r="number"==typeof n?{index:n,length:0}:n.oldRange,i="number"==typeof n?null:n.newRange,s=t.length,o=e.length;if(0===r.length&&(null===i||0===i.length)){var l=r.index,a=t.slice(0,l),c=t.slice(l),u=i?i.index:null,h=l+o-s;if((null===u||u===h)&&!(h<0||h>o)){var d=e.slice(0,h);if((g=e.slice(h))===c){var f=Math.min(l,h);if((b=a.slice(0,f))===(A=d.slice(0,f)))return v(b,a.slice(f),d.slice(f),c)}}if(null===u||u===l){var p=l,g=(d=e.slice(0,p),e.slice(p));if(d===a){var m=Math.min(s-p,o-p);if((y=c.slice(c.length-m))===(x=g.slice(g.length-m)))return v(a,c.slice(0,c.length-m),g.slice(0,g.length-m),y)}}}if(r.length>0&&i&&0===i.length){var b=t.slice(0,r.index),y=t.slice(r.index+r.length);if(!(o<(f=b.length)+(m=y.length))){var A=e.slice(0,f),x=e.slice(o-m);if(b===A&&y===x)return v(b,t.slice(f,s-m),e.slice(f,o-m),y)}}return null}(t,g,m);if(A)return A}var x=o(t,g),N=t.substring(0,x);x=a(t=t.substring(x),g=g.substring(x));var E=t.substring(t.length-x),w=function(t,l){var c;if(!t)return[[n,l]];if(!l)return[[e,t]];var u=t.length>l.length?t:l,h=t.length>l.length?l:t,d=u.indexOf(h);if(-1!==d)return c=[[n,u.substring(0,d)],[r,h],[n,u.substring(d+h.length)]],t.length>l.length&&(c[0][0]=c[2][0]=e),c;if(1===h.length)return[[e,t],[n,l]];var f=function(t,e){var n=t.length>e.length?t:e,r=t.length>e.length?e:t;if(n.length<4||2*r.length<n.length)return null;function i(t,e,n){for(var r,i,s,l,c=t.substring(n,n+Math.floor(t.length/4)),u=-1,h="";-1!==(u=e.indexOf(c,u+1));){var d=o(t.substring(n),e.substring(u)),f=a(t.substring(0,n),e.substring(0,u));h.length<f+d&&(h=e.substring(u-f,u)+e.substring(u,u+d),r=t.substring(0,n-f),i=t.substring(n+d),s=e.substring(0,u-f),l=e.substring(u+d))}return 2*h.length>=t.length?[r,i,s,l,h]:null}var s,l,c,u,h,d=i(n,r,Math.ceil(n.length/4)),f=i(n,r,Math.ceil(n.length/2));return d||f?(s=f?d&&d[4].length>f[4].length?d:f:d,t.length>e.length?(l=s[0],c=s[1],u=s[2],h=s[3]):(u=s[0],h=s[1],l=s[2],c=s[3]),[l,c,u,h,s[4]]):null}(t,l);if(f){var p=f[0],g=f[1],m=f[2],b=f[3],y=f[4],v=i(p,m),A=i(g,b);return v.concat([[r,y]],A)}return function(t,r){for(var i=t.length,o=r.length,l=Math.ceil((i+o)/2),a=l,c=2*l,u=new Array(c),h=new Array(c),d=0;d<c;d++)u[d]=-1,h[d]=-1;u[a+1]=0,h[a+1]=0;for(var f=i-o,p=f%2!=0,g=0,m=0,b=0,y=0,v=0;v<l;v++){for(var A=-v+g;A<=v-m;A+=2){for(var x=a+A,N=(_=A===-v||A!==v&&u[x-1]<u[x+1]?u[x+1]:u[x-1]+1)-A;_<i&&N<o&&t.charAt(_)===r.charAt(N);)_++,N++;if(u[x]=_,_>i)m+=2;else if(N>o)g+=2;else if(p&&(q=a+f-A)>=0&&q<c&&-1!==h[q]&&_>=(w=i-h[q]))return s(t,r,_,N)}for(var E=-v+b;E<=v-y;E+=2){for(var w,q=a+E,k=(w=E===-v||E!==v&&h[q-1]<h[q+1]?h[q+1]:h[q-1]+1)-E;w<i&&k<o&&t.charAt(i-w-1)===r.charAt(o-k-1);)w++,k++;if(h[q]=w,w>i)y+=2;else if(k>o)b+=2;else if(!p){var _;if((x=a+f-E)>=0&&x<c&&-1!==u[x])if(N=a+(_=u[x])-x,_>=(w=i-w))return s(t,r,_,N)}}}return[[e,t],[n,r]]}(t,l)}(t=t.substring(0,t.length-x),g=g.substring(0,g.length-x));return N&&w.unshift([r,N]),E&&w.push([r,E]),p(w,y),b&&function(t){for(var i=!1,s=[],o=0,g=null,m=0,b=0,y=0,v=0,A=0;m<t.length;)t[m][0]==r?(s[o++]=m,b=v,y=A,v=0,A=0,g=t[m][1]):(t[m][0]==n?v+=t[m][1].length:A+=t[m][1].length,g&&g.length<=Math.max(b,y)&&g.length<=Math.max(v,A)&&(t.splice(s[o-1],0,[e,g]),t[s[o-1]+1][0]=n,o--,m=--o>0?s[o-1]:-1,b=0,y=0,v=0,A=0,g=null,i=!0)),m++;for(i&&p(t),function(t){function e(t,e){if(!t||!e)return 6;var n=t.charAt(t.length-1),r=e.charAt(0),i=n.match(c),s=r.match(c),o=i&&n.match(u),l=s&&r.match(u),a=o&&n.match(h),p=l&&r.match(h),g=a&&t.match(d),m=p&&e.match(f);return g||m?5:a||p?4:i&&!o&&l?3:o||l?2:i||s?1:0}for(var n=1;n<t.length-1;){if(t[n-1][0]==r&&t[n+1][0]==r){var i=t[n-1][1],s=t[n][1],o=t[n+1][1],l=a(i,s);if(l){var p=s.substring(s.length-l);i=i.substring(0,i.length-l),s=p+s.substring(0,s.length-l),o=p+o}for(var g=i,m=s,b=o,y=e(i,s)+e(s,o);s.charAt(0)===o.charAt(0);){i+=s.charAt(0),s=s.substring(1)+o.charAt(0),o=o.substring(1);var v=e(i,s)+e(s,o);v>=y&&(y=v,g=i,m=s,b=o)}t[n-1][1]!=g&&(g?t[n-1][1]=g:(t.splice(n-1,1),n--),t[n][1]=m,b?t[n+1][1]=b:(t.splice(n+1,1),n--))}n++}}(t),m=1;m<t.length;){if(t[m-1][0]==e&&t[m][0]==n){var x=t[m-1][1],N=t[m][1],E=l(x,N),w=l(N,x);E>=w?(E>=x.length/2||E>=N.length/2)&&(t.splice(m,0,[r,N.substring(0,E)]),t[m-1][1]=x.substring(0,x.length-E),t[m+1][1]=N.substring(E),m++):(w>=x.length/2||w>=N.length/2)&&(t.splice(m,0,[r,x.substring(0,w)]),t[m-1][0]=n,t[m-1][1]=N.substring(0,N.length-w),t[m+1][0]=e,t[m+1][1]=x.substring(w),m++),m++}m++}}(w),w}function s(t,e,n,r){var s=t.substring(0,n),o=e.substring(0,r),l=t.substring(n),a=e.substring(r),c=i(s,o),u=i(l,a);return c.concat(u)}function o(t,e){if(!t||!e||t.charAt(0)!==e.charAt(0))return 0;for(var n=0,r=Math.min(t.length,e.length),i=r,s=0;n<i;)t.substring(s,i)==e.substring(s,i)?s=n=i:r=i,i=Math.floor((r-n)/2+n);return g(t.charCodeAt(i-1))&&i--,i}function l(t,e){var n=t.length,r=e.length;if(0==n||0==r)return 0;n>r?t=t.substring(n-r):n<r&&(e=e.substring(0,n));var i=Math.min(n,r);if(t==e)return i;for(var s=0,o=1;;){var l=t.substring(i-o),a=e.indexOf(l);if(-1==a)return s;o+=a,0!=a&&t.substring(i-o)!=e.substring(0,o)||(s=o,o++)}}function a(t,e){if(!t||!e||t.slice(-1)!==e.slice(-1))return 0;for(var n=0,r=Math.min(t.length,e.length),i=r,s=0;n<i;)t.substring(t.length-i,t.length-s)==e.substring(e.length-i,e.length-s)?s=n=i:r=i,i=Math.floor((r-n)/2+n);return m(t.charCodeAt(t.length-i))&&i--,i}var c=/[^a-zA-Z0-9]/,u=/\s/,h=/[\r\n]/,d=/\n\r?\n$/,f=/^\r?\n\r?\n/;function p(t,i){t.push([r,""]);for(var s,l=0,c=0,u=0,h="",d="";l<t.length;)if(l<t.length-1&&!t[l][1])t.splice(l,1);else switch(t[l][0]){case n:u++,d+=t[l][1],l++;break;case e:c++,h+=t[l][1],l++;break;case r:var f=l-u-c-1;if(i){if(f>=0&&y(t[f][1])){var g=t[f][1].slice(-1);if(t[f][1]=t[f][1].slice(0,-1),h=g+h,d=g+d,!t[f][1]){t.splice(f,1),l--;var m=f-1;t[m]&&t[m][0]===n&&(u++,d=t[m][1]+d,m--),t[m]&&t[m][0]===e&&(c++,h=t[m][1]+h,m--),f=m}}b(t[l][1])&&(g=t[l][1].charAt(0),t[l][1]=t[l][1].slice(1),h+=g,d+=g)}if(l<t.length-1&&!t[l][1]){t.splice(l,1);break}if(h.length>0||d.length>0){h.length>0&&d.length>0&&(0!==(s=o(d,h))&&(f>=0?t[f][1]+=d.substring(0,s):(t.splice(0,0,[r,d.substring(0,s)]),l++),d=d.substring(s),h=h.substring(s)),0!==(s=a(d,h))&&(t[l][1]=d.substring(d.length-s)+t[l][1],d=d.substring(0,d.length-s),h=h.substring(0,h.length-s)));var v=u+c;0===h.length&&0===d.length?(t.splice(l-v,v),l-=v):0===h.length?(t.splice(l-v,v,[n,d]),l=l-v+1):0===d.length?(t.splice(l-v,v,[e,h]),l=l-v+1):(t.splice(l-v,v,[e,h],[n,d]),l=l-v+2)}0!==l&&t[l-1][0]===r?(t[l-1][1]+=t[l][1],t.splice(l,1)):l++,u=0,c=0,h="",d=""}""===t[t.length-1][1]&&t.pop();var A=!1;for(l=1;l<t.length-1;)t[l-1][0]===r&&t[l+1][0]===r&&(t[l][1].substring(t[l][1].length-t[l-1][1].length)===t[l-1][1]?(t[l][1]=t[l-1][1]+t[l][1].substring(0,t[l][1].length-t[l-1][1].length),t[l+1][1]=t[l-1][1]+t[l+1][1],t.splice(l-1,1),A=!0):t[l][1].substring(0,t[l+1][1].length)==t[l+1][1]&&(t[l-1][1]+=t[l+1][1],t[l][1]=t[l][1].substring(t[l+1][1].length)+t[l+1][1],t.splice(l+1,1),A=!0)),l++;A&&p(t,i)}function g(t){return t>=55296&&t<=56319}function m(t){return t>=56320&&t<=57343}function b(t){return m(t.charCodeAt(0))}function y(t){return g(t.charCodeAt(t.length-1))}function v(t,i,s,o){return y(t)||b(o)?null:function(t){for(var e=[],n=0;n<t.length;n++)t[n][1].length>0&&e.push(t[n]);return e}([[r,t],[e,i],[n,s],[r,o]])}function A(t,e,n,r){return i(t,e,n,r,!0)}A.INSERT=n,A.DELETE=e,A.EQUAL=r,t.exports=A},9629:function(t,e,n){t=n.nmd(t);var r="__lodash_hash_undefined__",i=9007199254740991,s="[object Arguments]",o="[object Boolean]",l="[object Date]",a="[object Function]",c="[object GeneratorFunction]",u="[object Map]",h="[object Number]",d="[object Object]",f="[object Promise]",p="[object RegExp]",g="[object Set]",m="[object String]",b="[object Symbol]",y="[object WeakMap]",v="[object ArrayBuffer]",A="[object DataView]",x="[object Float32Array]",N="[object Float64Array]",E="[object Int8Array]",w="[object Int16Array]",q="[object Int32Array]",k="[object Uint8Array]",_="[object Uint8ClampedArray]",L="[object Uint16Array]",S="[object Uint32Array]",O=/\w*$/,T=/^\[object .+?Constructor\]$/,j=/^(?:0|[1-9]\d*)$/,C={};C[s]=C["[object Array]"]=C[v]=C[A]=C[o]=C[l]=C[x]=C[N]=C[E]=C[w]=C[q]=C[u]=C[h]=C[d]=C[p]=C[g]=C[m]=C[b]=C[k]=C[_]=C[L]=C[S]=!0,C["[object Error]"]=C[a]=C[y]=!1;var R="object"==typeof n.g&&n.g&&n.g.Object===Object&&n.g,I="object"==typeof self&&self&&self.Object===Object&&self,B=R||I||Function("return this")(),M=e&&!e.nodeType&&e,U=M&&t&&!t.nodeType&&t,D=U&&U.exports===M;function P(t,e){return t.set(e[0],e[1]),t}function z(t,e){return t.add(e),t}function F(t,e,n,r){var i=-1,s=t?t.length:0;for(r&&s&&(n=t[++i]);++i<s;)n=e(n,t[i],i,t);return n}function H(t){var e=!1;if(null!=t&&"function"!=typeof t.toString)try{e=!!(t+"")}catch(t){}return e}function $(t){var e=-1,n=Array(t.size);return t.forEach((function(t,r){n[++e]=[r,t]})),n}function V(t,e){return function(n){return t(e(n))}}function K(t){var e=-1,n=Array(t.size);return t.forEach((function(t){n[++e]=t})),n}var W,Z=Array.prototype,G=Function.prototype,X=Object.prototype,Q=B["__core-js_shared__"],J=(W=/[^.]+$/.exec(Q&&Q.keys&&Q.keys.IE_PROTO||""))?"Symbol(src)_1."+W:"",Y=G.toString,tt=X.hasOwnProperty,et=X.toString,nt=RegExp("^"+Y.call(tt).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),rt=D?B.Buffer:void 0,it=B.Symbol,st=B.Uint8Array,ot=V(Object.getPrototypeOf,Object),lt=Object.create,at=X.propertyIsEnumerable,ct=Z.splice,ut=Object.getOwnPropertySymbols,ht=rt?rt.isBuffer:void 0,dt=V(Object.keys,Object),ft=Bt(B,"DataView"),pt=Bt(B,"Map"),gt=Bt(B,"Promise"),mt=Bt(B,"Set"),bt=Bt(B,"WeakMap"),yt=Bt(Object,"create"),vt=zt(ft),At=zt(pt),xt=zt(gt),Nt=zt(mt),Et=zt(bt),wt=it?it.prototype:void 0,qt=wt?wt.valueOf:void 0;function kt(t){var e=-1,n=t?t.length:0;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}function _t(t){var e=-1,n=t?t.length:0;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}function Lt(t){var e=-1,n=t?t.length:0;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}function St(t){this.__data__=new _t(t)}function Ot(t,e,n){var r=t[e];tt.call(t,e)&&Ft(r,n)&&(void 0!==n||e in t)||(t[e]=n)}function Tt(t,e){for(var n=t.length;n--;)if(Ft(t[n][0],e))return n;return-1}function jt(t,e,n,r,i,f,y){var T;if(r&&(T=f?r(t,i,f,y):r(t)),void 0!==T)return T;if(!Wt(t))return t;var j=Ht(t);if(j){if(T=function(t){var e=t.length,n=t.constructor(e);return e&&"string"==typeof t[0]&&tt.call(t,"index")&&(n.index=t.index,n.input=t.input),n}(t),!e)return function(t,e){var n=-1,r=t.length;for(e||(e=Array(r));++n<r;)e[n]=t[n];return e}(t,T)}else{var R=Ut(t),I=R==a||R==c;if(Vt(t))return function(t,e){if(e)return t.slice();var n=new t.constructor(t.length);return t.copy(n),n}(t,e);if(R==d||R==s||I&&!f){if(H(t))return f?t:{};if(T=function(t){return"function"!=typeof t.constructor||Pt(t)?{}:Wt(e=ot(t))?lt(e):{};var e}(I?{}:t),!e)return function(t,e){return Rt(t,Mt(t),e)}(t,function(t,e){return t&&Rt(e,Zt(e),t)}(T,t))}else{if(!C[R])return f?t:{};T=function(t,e,n,r){var i,s=t.constructor;switch(e){case v:return Ct(t);case o:case l:return new s(+t);case A:return function(t,e){var n=e?Ct(t.buffer):t.buffer;return new t.constructor(n,t.byteOffset,t.byteLength)}(t,r);case x:case N:case E:case w:case q:case k:case _:case L:case S:return function(t,e){var n=e?Ct(t.buffer):t.buffer;return new t.constructor(n,t.byteOffset,t.length)}(t,r);case u:return function(t,e,n){return F(e?n($(t),!0):$(t),P,new t.constructor)}(t,r,n);case h:case m:return new s(t);case p:return function(t){var e=new t.constructor(t.source,O.exec(t));return e.lastIndex=t.lastIndex,e}(t);case g:return function(t,e,n){return F(e?n(K(t),!0):K(t),z,new t.constructor)}(t,r,n);case b:return i=t,qt?Object(qt.call(i)):{}}}(t,R,jt,e)}}y||(y=new St);var B=y.get(t);if(B)return B;if(y.set(t,T),!j)var M=n?function(t){return function(t,e,n){var r=e(t);return Ht(t)?r:function(t,e){for(var n=-1,r=e.length,i=t.length;++n<r;)t[i+n]=e[n];return t}(r,n(t))}(t,Zt,Mt)}(t):Zt(t);return function(t,e){for(var n=-1,r=t?t.length:0;++n<r&&!1!==e(t[n],n););}(M||t,(function(i,s){M&&(i=t[s=i]),Ot(T,s,jt(i,e,n,r,s,t,y))})),T}function Ct(t){var e=new t.constructor(t.byteLength);return new st(e).set(new st(t)),e}function Rt(t,e,n,r){n||(n={});for(var i=-1,s=e.length;++i<s;){var o=e[i],l=r?r(n[o],t[o],o,n,t):void 0;Ot(n,o,void 0===l?t[o]:l)}return n}function It(t,e){var n,r,i=t.__data__;return("string"==(r=typeof(n=e))||"number"==r||"symbol"==r||"boolean"==r?"__proto__"!==n:null===n)?i["string"==typeof e?"string":"hash"]:i.map}function Bt(t,e){var n=function(t,e){return null==t?void 0:t[e]}(t,e);return function(t){return!(!Wt(t)||(e=t,J&&J in e))&&(Kt(t)||H(t)?nt:T).test(zt(t));var e}(n)?n:void 0}kt.prototype.clear=function(){this.__data__=yt?yt(null):{}},kt.prototype.delete=function(t){return this.has(t)&&delete this.__data__[t]},kt.prototype.get=function(t){var e=this.__data__;if(yt){var n=e[t];return n===r?void 0:n}return tt.call(e,t)?e[t]:void 0},kt.prototype.has=function(t){var e=this.__data__;return yt?void 0!==e[t]:tt.call(e,t)},kt.prototype.set=function(t,e){return this.__data__[t]=yt&&void 0===e?r:e,this},_t.prototype.clear=function(){this.__data__=[]},_t.prototype.delete=function(t){var e=this.__data__,n=Tt(e,t);return!(n<0||(n==e.length-1?e.pop():ct.call(e,n,1),0))},_t.prototype.get=function(t){var e=this.__data__,n=Tt(e,t);return n<0?void 0:e[n][1]},_t.prototype.has=function(t){return Tt(this.__data__,t)>-1},_t.prototype.set=function(t,e){var n=this.__data__,r=Tt(n,t);return r<0?n.push([t,e]):n[r][1]=e,this},Lt.prototype.clear=function(){this.__data__={hash:new kt,map:new(pt||_t),string:new kt}},Lt.prototype.delete=function(t){return It(this,t).delete(t)},Lt.prototype.get=function(t){return It(this,t).get(t)},Lt.prototype.has=function(t){return It(this,t).has(t)},Lt.prototype.set=function(t,e){return It(this,t).set(t,e),this},St.prototype.clear=function(){this.__data__=new _t},St.prototype.delete=function(t){return this.__data__.delete(t)},St.prototype.get=function(t){return this.__data__.get(t)},St.prototype.has=function(t){return this.__data__.has(t)},St.prototype.set=function(t,e){var n=this.__data__;if(n instanceof _t){var r=n.__data__;if(!pt||r.length<199)return r.push([t,e]),this;n=this.__data__=new Lt(r)}return n.set(t,e),this};var Mt=ut?V(ut,Object):function(){return[]},Ut=function(t){return et.call(t)};function Dt(t,e){return!!(e=null==e?i:e)&&("number"==typeof t||j.test(t))&&t>-1&&t%1==0&&t<e}function Pt(t){var e=t&&t.constructor;return t===("function"==typeof e&&e.prototype||X)}function zt(t){if(null!=t){try{return Y.call(t)}catch(t){}try{return t+""}catch(t){}}return""}function Ft(t,e){return t===e||t!=t&&e!=e}(ft&&Ut(new ft(new ArrayBuffer(1)))!=A||pt&&Ut(new pt)!=u||gt&&Ut(gt.resolve())!=f||mt&&Ut(new mt)!=g||bt&&Ut(new bt)!=y)&&(Ut=function(t){var e=et.call(t),n=e==d?t.constructor:void 0,r=n?zt(n):void 0;if(r)switch(r){case vt:return A;case At:return u;case xt:return f;case Nt:return g;case Et:return y}return e});var Ht=Array.isArray;function $t(t){return null!=t&&function(t){return"number"==typeof t&&t>-1&&t%1==0&&t<=i}(t.length)&&!Kt(t)}var Vt=ht||function(){return!1};function Kt(t){var e=Wt(t)?et.call(t):"";return e==a||e==c}function Wt(t){var e=typeof t;return!!t&&("object"==e||"function"==e)}function Zt(t){return $t(t)?function(t,e){var n=Ht(t)||function(t){return function(t){return function(t){return!!t&&"object"==typeof t}(t)&&$t(t)}(t)&&tt.call(t,"callee")&&(!at.call(t,"callee")||et.call(t)==s)}(t)?function(t,e){for(var n=-1,r=Array(t);++n<t;)r[n]=e(n);return r}(t.length,String):[],r=n.length,i=!!r;for(var o in t)!e&&!tt.call(t,o)||i&&("length"==o||Dt(o,r))||n.push(o);return n}(t):function(t){if(!Pt(t))return dt(t);var e=[];for(var n in Object(t))tt.call(t,n)&&"constructor"!=n&&e.push(n);return e}(t)}t.exports=function(t){return jt(t,!0,!0)}},4162:function(t,e,n){t=n.nmd(t);var r="__lodash_hash_undefined__",i=1,s=2,o=9007199254740991,l="[object Arguments]",a="[object Array]",c="[object AsyncFunction]",u="[object Boolean]",h="[object Date]",d="[object Error]",f="[object Function]",p="[object GeneratorFunction]",g="[object Map]",m="[object Number]",b="[object Null]",y="[object Object]",v="[object Promise]",A="[object Proxy]",x="[object RegExp]",N="[object Set]",E="[object String]",w="[object Undefined]",q="[object WeakMap]",k="[object ArrayBuffer]",_="[object DataView]",L=/^\[object .+?Constructor\]$/,S=/^(?:0|[1-9]\d*)$/,O={};O["[object Float32Array]"]=O["[object Float64Array]"]=O["[object Int8Array]"]=O["[object Int16Array]"]=O["[object Int32Array]"]=O["[object Uint8Array]"]=O["[object Uint8ClampedArray]"]=O["[object Uint16Array]"]=O["[object Uint32Array]"]=!0,O[l]=O[a]=O[k]=O[u]=O[_]=O[h]=O[d]=O[f]=O[g]=O[m]=O[y]=O[x]=O[N]=O[E]=O[q]=!1;var T="object"==typeof n.g&&n.g&&n.g.Object===Object&&n.g,j="object"==typeof self&&self&&self.Object===Object&&self,C=T||j||Function("return this")(),R=e&&!e.nodeType&&e,I=R&&t&&!t.nodeType&&t,B=I&&I.exports===R,M=B&&T.process,U=function(){try{return M&&M.binding&&M.binding("util")}catch(t){}}(),D=U&&U.isTypedArray;function P(t,e){for(var n=-1,r=null==t?0:t.length;++n<r;)if(e(t[n],n,t))return!0;return!1}function z(t){var e=-1,n=Array(t.size);return t.forEach((function(t,r){n[++e]=[r,t]})),n}function F(t){var e=-1,n=Array(t.size);return t.forEach((function(t){n[++e]=t})),n}var H,$,V,K=Array.prototype,W=Function.prototype,Z=Object.prototype,G=C["__core-js_shared__"],X=W.toString,Q=Z.hasOwnProperty,J=(H=/[^.]+$/.exec(G&&G.keys&&G.keys.IE_PROTO||""))?"Symbol(src)_1."+H:"",Y=Z.toString,tt=RegExp("^"+X.call(Q).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),et=B?C.Buffer:void 0,nt=C.Symbol,rt=C.Uint8Array,it=Z.propertyIsEnumerable,st=K.splice,ot=nt?nt.toStringTag:void 0,lt=Object.getOwnPropertySymbols,at=et?et.isBuffer:void 0,ct=($=Object.keys,V=Object,function(t){return $(V(t))}),ut=It(C,"DataView"),ht=It(C,"Map"),dt=It(C,"Promise"),ft=It(C,"Set"),pt=It(C,"WeakMap"),gt=It(Object,"create"),mt=Dt(ut),bt=Dt(ht),yt=Dt(dt),vt=Dt(ft),At=Dt(pt),xt=nt?nt.prototype:void 0,Nt=xt?xt.valueOf:void 0;function Et(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}function wt(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}function qt(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}function kt(t){var e=-1,n=null==t?0:t.length;for(this.__data__=new qt;++e<n;)this.add(t[e])}function _t(t){var e=this.__data__=new wt(t);this.size=e.size}function Lt(t,e){for(var n=t.length;n--;)if(Pt(t[n][0],e))return n;return-1}function St(t){return null==t?void 0===t?w:b:ot&&ot in Object(t)?function(t){var e=Q.call(t,ot),n=t[ot];try{t[ot]=void 0;var r=!0}catch(t){}var i=Y.call(t);return r&&(e?t[ot]=n:delete t[ot]),i}(t):function(t){return Y.call(t)}(t)}function Ot(t){return Wt(t)&&St(t)==l}function Tt(t,e,n,r,o){return t===e||(null==t||null==e||!Wt(t)&&!Wt(e)?t!=t&&e!=e:function(t,e,n,r,o,c){var f=Ft(t),p=Ft(e),b=f?a:Mt(t),v=p?a:Mt(e),A=(b=b==l?y:b)==y,w=(v=v==l?y:v)==y,q=b==v;if(q&&Ht(t)){if(!Ht(e))return!1;f=!0,A=!1}if(q&&!A)return c||(c=new _t),f||Zt(t)?jt(t,e,n,r,o,c):function(t,e,n,r,o,l,a){switch(n){case _:if(t.byteLength!=e.byteLength||t.byteOffset!=e.byteOffset)return!1;t=t.buffer,e=e.buffer;case k:return!(t.byteLength!=e.byteLength||!l(new rt(t),new rt(e)));case u:case h:case m:return Pt(+t,+e);case d:return t.name==e.name&&t.message==e.message;case x:case E:return t==e+"";case g:var c=z;case N:var f=r&i;if(c||(c=F),t.size!=e.size&&!f)return!1;var p=a.get(t);if(p)return p==e;r|=s,a.set(t,e);var b=jt(c(t),c(e),r,o,l,a);return a.delete(t),b;case"[object Symbol]":if(Nt)return Nt.call(t)==Nt.call(e)}return!1}(t,e,b,n,r,o,c);if(!(n&i)){var L=A&&Q.call(t,"__wrapped__"),S=w&&Q.call(e,"__wrapped__");if(L||S){var O=L?t.value():t,T=S?e.value():e;return c||(c=new _t),o(O,T,n,r,c)}}return!!q&&(c||(c=new _t),function(t,e,n,r,s,o){var l=n&i,a=Ct(t),c=a.length;if(c!=Ct(e).length&&!l)return!1;for(var u=c;u--;){var h=a[u];if(!(l?h in e:Q.call(e,h)))return!1}var d=o.get(t);if(d&&o.get(e))return d==e;var f=!0;o.set(t,e),o.set(e,t);for(var p=l;++u<c;){var g=t[h=a[u]],m=e[h];if(r)var b=l?r(m,g,h,e,t,o):r(g,m,h,t,e,o);if(!(void 0===b?g===m||s(g,m,n,r,o):b)){f=!1;break}p||(p="constructor"==h)}if(f&&!p){var y=t.constructor,v=e.constructor;y==v||!("constructor"in t)||!("constructor"in e)||"function"==typeof y&&y instanceof y&&"function"==typeof v&&v instanceof v||(f=!1)}return o.delete(t),o.delete(e),f}(t,e,n,r,o,c))}(t,e,n,r,Tt,o))}function jt(t,e,n,r,o,l){var a=n&i,c=t.length,u=e.length;if(c!=u&&!(a&&u>c))return!1;var h=l.get(t);if(h&&l.get(e))return h==e;var d=-1,f=!0,p=n&s?new kt:void 0;for(l.set(t,e),l.set(e,t);++d<c;){var g=t[d],m=e[d];if(r)var b=a?r(m,g,d,e,t,l):r(g,m,d,t,e,l);if(void 0!==b){if(b)continue;f=!1;break}if(p){if(!P(e,(function(t,e){if(i=e,!p.has(i)&&(g===t||o(g,t,n,r,l)))return p.push(e);var i}))){f=!1;break}}else if(g!==m&&!o(g,m,n,r,l)){f=!1;break}}return l.delete(t),l.delete(e),f}function Ct(t){return function(t,e,n){var r=e(t);return Ft(t)?r:function(t,e){for(var n=-1,r=e.length,i=t.length;++n<r;)t[i+n]=e[n];return t}(r,n(t))}(t,Gt,Bt)}function Rt(t,e){var n,r,i=t.__data__;return("string"==(r=typeof(n=e))||"number"==r||"symbol"==r||"boolean"==r?"__proto__"!==n:null===n)?i["string"==typeof e?"string":"hash"]:i.map}function It(t,e){var n=function(t,e){return null==t?void 0:t[e]}(t,e);return function(t){return!(!Kt(t)||function(t){return!!J&&J in t}(t))&&($t(t)?tt:L).test(Dt(t))}(n)?n:void 0}Et.prototype.clear=function(){this.__data__=gt?gt(null):{},this.size=0},Et.prototype.delete=function(t){var e=this.has(t)&&delete this.__data__[t];return this.size-=e?1:0,e},Et.prototype.get=function(t){var e=this.__data__;if(gt){var n=e[t];return n===r?void 0:n}return Q.call(e,t)?e[t]:void 0},Et.prototype.has=function(t){var e=this.__data__;return gt?void 0!==e[t]:Q.call(e,t)},Et.prototype.set=function(t,e){var n=this.__data__;return this.size+=this.has(t)?0:1,n[t]=gt&&void 0===e?r:e,this},wt.prototype.clear=function(){this.__data__=[],this.size=0},wt.prototype.delete=function(t){var e=this.__data__,n=Lt(e,t);return!(n<0||(n==e.length-1?e.pop():st.call(e,n,1),--this.size,0))},wt.prototype.get=function(t){var e=this.__data__,n=Lt(e,t);return n<0?void 0:e[n][1]},wt.prototype.has=function(t){return Lt(this.__data__,t)>-1},wt.prototype.set=function(t,e){var n=this.__data__,r=Lt(n,t);return r<0?(++this.size,n.push([t,e])):n[r][1]=e,this},qt.prototype.clear=function(){this.size=0,this.__data__={hash:new Et,map:new(ht||wt),string:new Et}},qt.prototype.delete=function(t){var e=Rt(this,t).delete(t);return this.size-=e?1:0,e},qt.prototype.get=function(t){return Rt(this,t).get(t)},qt.prototype.has=function(t){return Rt(this,t).has(t)},qt.prototype.set=function(t,e){var n=Rt(this,t),r=n.size;return n.set(t,e),this.size+=n.size==r?0:1,this},kt.prototype.add=kt.prototype.push=function(t){return this.__data__.set(t,r),this},kt.prototype.has=function(t){return this.__data__.has(t)},_t.prototype.clear=function(){this.__data__=new wt,this.size=0},_t.prototype.delete=function(t){var e=this.__data__,n=e.delete(t);return this.size=e.size,n},_t.prototype.get=function(t){return this.__data__.get(t)},_t.prototype.has=function(t){return this.__data__.has(t)},_t.prototype.set=function(t,e){var n=this.__data__;if(n instanceof wt){var r=n.__data__;if(!ht||r.length<199)return r.push([t,e]),this.size=++n.size,this;n=this.__data__=new qt(r)}return n.set(t,e),this.size=n.size,this};var Bt=lt?function(t){return null==t?[]:(t=Object(t),function(e,n){for(var r=-1,i=null==e?0:e.length,s=0,o=[];++r<i;){var l=e[r];a=l,it.call(t,a)&&(o[s++]=l)}var a;return o}(lt(t)))}:function(){return[]},Mt=St;function Ut(t,e){return!!(e=null==e?o:e)&&("number"==typeof t||S.test(t))&&t>-1&&t%1==0&&t<e}function Dt(t){if(null!=t){try{return X.call(t)}catch(t){}try{return t+""}catch(t){}}return""}function Pt(t,e){return t===e||t!=t&&e!=e}(ut&&Mt(new ut(new ArrayBuffer(1)))!=_||ht&&Mt(new ht)!=g||dt&&Mt(dt.resolve())!=v||ft&&Mt(new ft)!=N||pt&&Mt(new pt)!=q)&&(Mt=function(t){var e=St(t),n=e==y?t.constructor:void 0,r=n?Dt(n):"";if(r)switch(r){case mt:return _;case bt:return g;case yt:return v;case vt:return N;case At:return q}return e});var zt=Ot(function(){return arguments}())?Ot:function(t){return Wt(t)&&Q.call(t,"callee")&&!it.call(t,"callee")},Ft=Array.isArray,Ht=at||function(){return!1};function $t(t){if(!Kt(t))return!1;var e=St(t);return e==f||e==p||e==c||e==A}function Vt(t){return"number"==typeof t&&t>-1&&t%1==0&&t<=o}function Kt(t){var e=typeof t;return null!=t&&("object"==e||"function"==e)}function Wt(t){return null!=t&&"object"==typeof t}var Zt=D?function(t){return function(e){return t(e)}}(D):function(t){return Wt(t)&&Vt(t.length)&&!!O[St(t)]};function Gt(t){return null!=(e=t)&&Vt(e.length)&&!$t(e)?function(t,e){var n=Ft(t),r=!n&&zt(t),i=!n&&!r&&Ht(t),s=!n&&!r&&!i&&Zt(t),o=n||r||i||s,l=o?function(t,e){for(var n=-1,r=Array(t);++n<t;)r[n]=e(n);return r}(t.length,String):[],a=l.length;for(var c in t)!e&&!Q.call(t,c)||o&&("length"==c||i&&("offset"==c||"parent"==c)||s&&("buffer"==c||"byteLength"==c||"byteOffset"==c)||Ut(c,a))||l.push(c);return l}(t):function(t){if(n=(e=t)&&e.constructor,e!==("function"==typeof n&&n.prototype||Z))return ct(t);var e,n,r=[];for(var i in Object(t))Q.call(t,i)&&"constructor"!=i&&r.push(i);return r}(t);var e}t.exports=function(t,e){return Tt(t,e)}},1270:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});const r=n(9629),i=n(4162);var s;!function(t){t.compose=function(t={},e={},n=!1){"object"!=typeof t&&(t={}),"object"!=typeof e&&(e={});let i=r(e);n||(i=Object.keys(i).reduce(((t,e)=>(null!=i[e]&&(t[e]=i[e]),t)),{}));for(const n in t)void 0!==t[n]&&void 0===e[n]&&(i[n]=t[n]);return Object.keys(i).length>0?i:void 0},t.diff=function(t={},e={}){"object"!=typeof t&&(t={}),"object"!=typeof e&&(e={});const n=Object.keys(t).concat(Object.keys(e)).reduce(((n,r)=>(i(t[r],e[r])||(n[r]=void 0===e[r]?null:e[r]),n)),{});return Object.keys(n).length>0?n:void 0},t.invert=function(t={},e={}){t=t||{};const n=Object.keys(e).reduce(((n,r)=>(e[r]!==t[r]&&void 0!==t[r]&&(n[r]=e[r]),n)),{});return Object.keys(t).reduce(((n,r)=>(t[r]!==e[r]&&void 0===e[r]&&(n[r]=null),n)),n)},t.transform=function(t,e,n=!1){if("object"!=typeof t)return e;if("object"!=typeof e)return;if(!n)return e;const r=Object.keys(e).reduce(((n,r)=>(void 0===t[r]&&(n[r]=e[r]),n)),{});return Object.keys(r).length>0?r:void 0}}(s||(s={})),e.default=s},5232:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.AttributeMap=e.OpIterator=e.Op=void 0;const r=n(5090),i=n(9629),s=n(4162),o=n(1270);e.AttributeMap=o.default;const l=n(4123);e.Op=l.default;const a=n(7033);e.OpIterator=a.default;const c=String.fromCharCode(0),u=(t,e)=>{if("object"!=typeof t||null===t)throw new Error("cannot retain a "+typeof t);if("object"!=typeof e||null===e)throw new Error("cannot retain a "+typeof e);const n=Object.keys(t)[0];if(!n||n!==Object.keys(e)[0])throw new Error(`embed types not matched: ${n} != ${Object.keys(e)[0]}`);return[n,t[n],e[n]]};class h{constructor(t){Array.isArray(t)?this.ops=t:null!=t&&Array.isArray(t.ops)?this.ops=t.ops:this.ops=[]}static registerEmbed(t,e){this.handlers[t]=e}static unregisterEmbed(t){delete this.handlers[t]}static getHandler(t){const e=this.handlers[t];if(!e)throw new Error(`no handlers for embed type "${t}"`);return e}insert(t,e){const n={};return"string"==typeof t&&0===t.length?this:(n.insert=t,null!=e&&"object"==typeof e&&Object.keys(e).length>0&&(n.attributes=e),this.push(n))}delete(t){return t<=0?this:this.push({delete:t})}retain(t,e){if("number"==typeof t&&t<=0)return this;const n={retain:t};return null!=e&&"object"==typeof e&&Object.keys(e).length>0&&(n.attributes=e),this.push(n)}push(t){let e=this.ops.length,n=this.ops[e-1];if(t=i(t),"object"==typeof n){if("number"==typeof t.delete&&"number"==typeof n.delete)return this.ops[e-1]={delete:n.delete+t.delete},this;if("number"==typeof n.delete&&null!=t.insert&&(e-=1,n=this.ops[e-1],"object"!=typeof n))return this.ops.unshift(t),this;if(s(t.attributes,n.attributes)){if("string"==typeof t.insert&&"string"==typeof n.insert)return this.ops[e-1]={insert:n.insert+t.insert},"object"==typeof t.attributes&&(this.ops[e-1].attributes=t.attributes),this;if("number"==typeof t.retain&&"number"==typeof n.retain)return this.ops[e-1]={retain:n.retain+t.retain},"object"==typeof t.attributes&&(this.ops[e-1].attributes=t.attributes),this}}return e===this.ops.length?this.ops.push(t):this.ops.splice(e,0,t),this}chop(){const t=this.ops[this.ops.length-1];return t&&"number"==typeof t.retain&&!t.attributes&&this.ops.pop(),this}filter(t){return this.ops.filter(t)}forEach(t){this.ops.forEach(t)}map(t){return this.ops.map(t)}partition(t){const e=[],n=[];return this.forEach((r=>{(t(r)?e:n).push(r)})),[e,n]}reduce(t,e){return this.ops.reduce(t,e)}changeLength(){return this.reduce(((t,e)=>e.insert?t+l.default.length(e):e.delete?t-e.delete:t),0)}length(){return this.reduce(((t,e)=>t+l.default.length(e)),0)}slice(t=0,e=1/0){const n=[],r=new a.default(this.ops);let i=0;for(;i<e&&r.hasNext();){let s;i<t?s=r.next(t-i):(s=r.next(e-i),n.push(s)),i+=l.default.length(s)}return new h(n)}compose(t){const e=new a.default(this.ops),n=new a.default(t.ops),r=[],i=n.peek();if(null!=i&&"number"==typeof i.retain&&null==i.attributes){let t=i.retain;for(;"insert"===e.peekType()&&e.peekLength()<=t;)t-=e.peekLength(),r.push(e.next());i.retain-t>0&&n.next(i.retain-t)}const l=new h(r);for(;e.hasNext()||n.hasNext();)if("insert"===n.peekType())l.push(n.next());else if("delete"===e.peekType())l.push(e.next());else{const t=Math.min(e.peekLength(),n.peekLength()),r=e.next(t),i=n.next(t);if(i.retain){const a={};if("number"==typeof r.retain)a.retain="number"==typeof i.retain?t:i.retain;else if("number"==typeof i.retain)null==r.retain?a.insert=r.insert:a.retain=r.retain;else{const t=null==r.retain?"insert":"retain",[e,n,s]=u(r[t],i.retain),o=h.getHandler(e);a[t]={[e]:o.compose(n,s,"retain"===t)}}const c=o.default.compose(r.attributes,i.attributes,"number"==typeof r.retain);if(c&&(a.attributes=c),l.push(a),!n.hasNext()&&s(l.ops[l.ops.length-1],a)){const t=new h(e.rest());return l.concat(t).chop()}}else"number"==typeof i.delete&&("number"==typeof r.retain||"object"==typeof r.retain&&null!==r.retain)&&l.push(i)}return l.chop()}concat(t){const e=new h(this.ops.slice());return t.ops.length>0&&(e.push(t.ops[0]),e.ops=e.ops.concat(t.ops.slice(1))),e}diff(t,e){if(this.ops===t.ops)return new h;const n=[this,t].map((e=>e.map((n=>{if(null!=n.insert)return"string"==typeof n.insert?n.insert:c;throw new Error("diff() called "+(e===t?"on":"with")+" non-document")})).join(""))),i=new h,l=r(n[0],n[1],e,!0),u=new a.default(this.ops),d=new a.default(t.ops);return l.forEach((t=>{let e=t[1].length;for(;e>0;){let n=0;switch(t[0]){case r.INSERT:n=Math.min(d.peekLength(),e),i.push(d.next(n));break;case r.DELETE:n=Math.min(e,u.peekLength()),u.next(n),i.delete(n);break;case r.EQUAL:n=Math.min(u.peekLength(),d.peekLength(),e);const t=u.next(n),l=d.next(n);s(t.insert,l.insert)?i.retain(n,o.default.diff(t.attributes,l.attributes)):i.push(l).delete(n)}e-=n}})),i.chop()}eachLine(t,e="\n"){const n=new a.default(this.ops);let r=new h,i=0;for(;n.hasNext();){if("insert"!==n.peekType())return;const s=n.peek(),o=l.default.length(s)-n.peekLength(),a="string"==typeof s.insert?s.insert.indexOf(e,o)-o:-1;if(a<0)r.push(n.next());else if(a>0)r.push(n.next(a));else{if(!1===t(r,n.next(1).attributes||{},i))return;i+=1,r=new h}}r.length()>0&&t(r,{},i)}invert(t){const e=new h;return this.reduce(((n,r)=>{if(r.insert)e.delete(l.default.length(r));else{if("number"==typeof r.retain&&null==r.attributes)return e.retain(r.retain),n+r.retain;if(r.delete||"number"==typeof r.retain){const i=r.delete||r.retain;return t.slice(n,n+i).forEach((t=>{r.delete?e.push(t):r.retain&&r.attributes&&e.retain(l.default.length(t),o.default.invert(r.attributes,t.attributes))})),n+i}if("object"==typeof r.retain&&null!==r.retain){const i=t.slice(n,n+1),s=new a.default(i.ops).next(),[l,c,d]=u(r.retain,s.insert),f=h.getHandler(l);return e.retain({[l]:f.invert(c,d)},o.default.invert(r.attributes,s.attributes)),n+1}}return n}),0),e.chop()}transform(t,e=!1){if(e=!!e,"number"==typeof t)return this.transformPosition(t,e);const n=t,r=new a.default(this.ops),i=new a.default(n.ops),s=new h;for(;r.hasNext()||i.hasNext();)if("insert"!==r.peekType()||!e&&"insert"===i.peekType())if("insert"===i.peekType())s.push(i.next());else{const t=Math.min(r.peekLength(),i.peekLength()),n=r.next(t),l=i.next(t);if(n.delete)continue;if(l.delete)s.push(l);else{const r=n.retain,i=l.retain;let a="object"==typeof i&&null!==i?i:t;if("object"==typeof r&&null!==r&&"object"==typeof i&&null!==i){const t=Object.keys(r)[0];if(t===Object.keys(i)[0]){const n=h.getHandler(t);n&&(a={[t]:n.transform(r[t],i[t],e)})}}s.retain(a,o.default.transform(n.attributes,l.attributes,e))}}else s.retain(l.default.length(r.next()));return s.chop()}transformPosition(t,e=!1){e=!!e;const n=new a.default(this.ops);let r=0;for(;n.hasNext()&&r<=t;){const i=n.peekLength(),s=n.peekType();n.next(),"delete"!==s?("insert"===s&&(r<t||!e)&&(t+=i),r+=i):t-=Math.min(i,t-r)}return t}}h.Op=l.default,h.OpIterator=a.default,h.AttributeMap=o.default,h.handlers={},e.default=h,t.exports=h,t.exports.default=h},4123:function(t,e){"use strict";var n;Object.defineProperty(e,"__esModule",{value:!0}),function(t){t.length=function(t){return"number"==typeof t.delete?t.delete:"number"==typeof t.retain?t.retain:"object"==typeof t.retain&&null!==t.retain?1:"string"==typeof t.insert?t.insert.length:1}}(n||(n={})),e.default=n},7033:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});const r=n(4123);e.default=class{constructor(t){this.ops=t,this.index=0,this.offset=0}hasNext(){return this.peekLength()<1/0}next(t){t||(t=1/0);const e=this.ops[this.index];if(e){const n=this.offset,i=r.default.length(e);if(t>=i-n?(t=i-n,this.index+=1,this.offset=0):this.offset+=t,"number"==typeof e.delete)return{delete:t};{const r={};return e.attributes&&(r.attributes=e.attributes),"number"==typeof e.retain?r.retain=t:"object"==typeof e.retain&&null!==e.retain?r.retain=e.retain:"string"==typeof e.insert?r.insert=e.insert.substr(n,t):r.insert=e.insert,r}}return{retain:1/0}}peek(){return this.ops[this.index]}peekLength(){return this.ops[this.index]?r.default.length(this.ops[this.index])-this.offset:1/0}peekType(){const t=this.ops[this.index];return t?"number"==typeof t.delete?"delete":"number"==typeof t.retain||"object"==typeof t.retain&&null!==t.retain?"retain":"insert":"retain"}rest(){if(this.hasNext()){if(0===this.offset)return this.ops.slice(this.index);{const t=this.offset,e=this.index,n=this.next(),r=this.ops.slice(this.index);return this.offset=t,this.index=e,[n].concat(r)}}return[]}}},8820:function(t,e,n){"use strict";n.d(e,{A:function(){return l}});var r=n(8138),i=function(t,e){for(var n=t.length;n--;)if((0,r.A)(t[n][0],e))return n;return-1},s=Array.prototype.splice;function o(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}o.prototype.clear=function(){this.__data__=[],this.size=0},o.prototype.delete=function(t){var e=this.__data__,n=i(e,t);return!(n<0||(n==e.length-1?e.pop():s.call(e,n,1),--this.size,0))},o.prototype.get=function(t){var e=this.__data__,n=i(e,t);return n<0?void 0:e[n][1]},o.prototype.has=function(t){return i(this.__data__,t)>-1},o.prototype.set=function(t,e){var n=this.__data__,r=i(n,t);return r<0?(++this.size,n.push([t,e])):n[r][1]=e,this};var l=o},2461:function(t,e,n){"use strict";var r=n(2281),i=n(5507),s=(0,r.A)(i.A,"Map");e.A=s},3558:function(t,e,n){"use strict";n.d(e,{A:function(){return d}});var r=(0,n(2281).A)(Object,"create"),i=Object.prototype.hasOwnProperty,s=Object.prototype.hasOwnProperty;function o(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}o.prototype.clear=function(){this.__data__=r?r(null):{},this.size=0},o.prototype.delete=function(t){var e=this.has(t)&&delete this.__data__[t];return this.size-=e?1:0,e},o.prototype.get=function(t){var e=this.__data__;if(r){var n=e[t];return"__lodash_hash_undefined__"===n?void 0:n}return i.call(e,t)?e[t]:void 0},o.prototype.has=function(t){var e=this.__data__;return r?void 0!==e[t]:s.call(e,t)},o.prototype.set=function(t,e){var n=this.__data__;return this.size+=this.has(t)?0:1,n[t]=r&&void 0===e?"__lodash_hash_undefined__":e,this};var l=o,a=n(8820),c=n(2461),u=function(t,e){var n,r,i=t.__data__;return("string"==(r=typeof(n=e))||"number"==r||"symbol"==r||"boolean"==r?"__proto__"!==n:null===n)?i["string"==typeof e?"string":"hash"]:i.map};function h(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}h.prototype.clear=function(){this.size=0,this.__data__={hash:new l,map:new(c.A||a.A),string:new l}},h.prototype.delete=function(t){var e=u(this,t).delete(t);return this.size-=e?1:0,e},h.prototype.get=function(t){return u(this,t).get(t)},h.prototype.has=function(t){return u(this,t).has(t)},h.prototype.set=function(t,e){var n=u(this,t),r=n.size;return n.set(t,e),this.size+=n.size==r?0:1,this};var d=h},2673:function(t,e,n){"use strict";n.d(e,{A:function(){return l}});var r=n(8820),i=n(2461),s=n(3558);function o(t){var e=this.__data__=new r.A(t);this.size=e.size}o.prototype.clear=function(){this.__data__=new r.A,this.size=0},o.prototype.delete=function(t){var e=this.__data__,n=e.delete(t);return this.size=e.size,n},o.prototype.get=function(t){return this.__data__.get(t)},o.prototype.has=function(t){return this.__data__.has(t)},o.prototype.set=function(t,e){var n=this.__data__;if(n instanceof r.A){var o=n.__data__;if(!i.A||o.length<199)return o.push([t,e]),this.size=++n.size,this;n=this.__data__=new s.A(o)}return n.set(t,e),this.size=n.size,this};var l=o},439:function(t,e,n){"use strict";var r=n(5507).A.Symbol;e.A=r},7218:function(t,e,n){"use strict";var r=n(5507).A.Uint8Array;e.A=r},6753:function(t,e,n){"use strict";n.d(e,{A:function(){return c}});var r=n(8412),i=n(723),s=n(776),o=n(3767),l=n(5755),a=Object.prototype.hasOwnProperty,c=function(t,e){var n=(0,i.A)(t),c=!n&&(0,r.A)(t),u=!n&&!c&&(0,s.A)(t),h=!n&&!c&&!u&&(0,l.A)(t),d=n||c||u||h,f=d?function(t,e){for(var n=-1,r=Array(t);++n<t;)r[n]=e(n);return r}(t.length,String):[],p=f.length;for(var g in t)!e&&!a.call(t,g)||d&&("length"==g||u&&("offset"==g||"parent"==g)||h&&("buffer"==g||"byteLength"==g||"byteOffset"==g)||(0,o.A)(g,p))||f.push(g);return f}},802:function(t,e){"use strict";e.A=function(t,e){for(var n=-1,r=e.length,i=t.length;++n<r;)t[i+n]=e[n];return t}},6437:function(t,e,n){"use strict";var r=n(6770),i=n(8138),s=Object.prototype.hasOwnProperty;e.A=function(t,e,n){var o=t[e];s.call(t,e)&&(0,i.A)(o,n)&&(void 0!==n||e in t)||(0,r.A)(t,e,n)}},6770:function(t,e,n){"use strict";var r=n(7889);e.A=function(t,e,n){"__proto__"==e&&r.A?(0,r.A)(t,e,{configurable:!0,enumerable:!0,value:n,writable:!0}):t[e]=n}},1381:function(t,e,n){"use strict";var r=n(802),i=n(723);e.A=function(t,e,n){var s=e(t);return(0,i.A)(t)?s:(0,r.A)(s,n(t))}},2159:function(t,e,n){"use strict";n.d(e,{A:function(){return u}});var r=n(439),i=Object.prototype,s=i.hasOwnProperty,o=i.toString,l=r.A?r.A.toStringTag:void 0,a=Object.prototype.toString,c=r.A?r.A.toStringTag:void 0,u=function(t){return null==t?void 0===t?"[object Undefined]":"[object Null]":c&&c in Object(t)?function(t){var e=s.call(t,l),n=t[l];try{t[l]=void 0;var r=!0}catch(t){}var i=o.call(t);return r&&(e?t[l]=n:delete t[l]),i}(t):function(t){return a.call(t)}(t)}},5771:function(t,e){"use strict";e.A=function(t){return function(e){return t(e)}}},2899:function(t,e,n){"use strict";var r=n(7218);e.A=function(t){var e=new t.constructor(t.byteLength);return new r.A(e).set(new r.A(t)),e}},3812:function(t,e,n){"use strict";var r=n(5507),i="object"==typeof exports&&exports&&!exports.nodeType&&exports,s=i&&"object"==typeof module&&module&&!module.nodeType&&module,o=s&&s.exports===i?r.A.Buffer:void 0,l=o?o.allocUnsafe:void 0;e.A=function(t,e){if(e)return t.slice();var n=t.length,r=l?l(n):new t.constructor(n);return t.copy(r),r}},1827:function(t,e,n){"use strict";var r=n(2899);e.A=function(t,e){var n=e?(0,r.A)(t.buffer):t.buffer;return new t.constructor(n,t.byteOffset,t.length)}},4405:function(t,e){"use strict";e.A=function(t,e){var n=-1,r=t.length;for(e||(e=Array(r));++n<r;)e[n]=t[n];return e}},9601:function(t,e,n){"use strict";var r=n(6437),i=n(6770);e.A=function(t,e,n,s){var o=!n;n||(n={});for(var l=-1,a=e.length;++l<a;){var c=e[l],u=s?s(n[c],t[c],c,n,t):void 0;void 0===u&&(u=t[c]),o?(0,i.A)(n,c,u):(0,r.A)(n,c,u)}return n}},7889:function(t,e,n){"use strict";var r=n(2281),i=function(){try{var t=(0,r.A)(Object,"defineProperty");return t({},"",{}),t}catch(t){}}();e.A=i},9646:function(t,e){"use strict";var n="object"==typeof global&&global&&global.Object===Object&&global;e.A=n},2816:function(t,e,n){"use strict";var r=n(1381),i=n(9844),s=n(3169);e.A=function(t){return(0,r.A)(t,s.A,i.A)}},2281:function(t,e,n){"use strict";n.d(e,{A:function(){return m}});var r,i=n(7572),s=n(5507).A["__core-js_shared__"],o=(r=/[^.]+$/.exec(s&&s.keys&&s.keys.IE_PROTO||""))?"Symbol(src)_1."+r:"",l=n(659),a=n(1543),c=/^\[object .+?Constructor\]$/,u=Function.prototype,h=Object.prototype,d=u.toString,f=h.hasOwnProperty,p=RegExp("^"+d.call(f).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),g=function(t){return!(!(0,l.A)(t)||(e=t,o&&o in e))&&((0,i.A)(t)?p:c).test((0,a.A)(t));var e},m=function(t,e){var n=function(t,e){return null==t?void 0:t[e]}(t,e);return g(n)?n:void 0}},8769:function(t,e,n){"use strict";var r=(0,n(2217).A)(Object.getPrototypeOf,Object);e.A=r},9844:function(t,e,n){"use strict";n.d(e,{A:function(){return o}});var r=n(6935),i=Object.prototype.propertyIsEnumerable,s=Object.getOwnPropertySymbols,o=s?function(t){return null==t?[]:(t=Object(t),function(t,e){for(var n=-1,r=null==t?0:t.length,i=0,s=[];++n<r;){var o=t[n];e(o,n,t)&&(s[i++]=o)}return s}(s(t),(function(e){return i.call(t,e)})))}:r.A},7995:function(t,e,n){"use strict";n.d(e,{A:function(){return E}});var r=n(2281),i=n(5507),s=(0,r.A)(i.A,"DataView"),o=n(2461),l=(0,r.A)(i.A,"Promise"),a=(0,r.A)(i.A,"Set"),c=(0,r.A)(i.A,"WeakMap"),u=n(2159),h=n(1543),d="[object Map]",f="[object Promise]",p="[object Set]",g="[object WeakMap]",m="[object DataView]",b=(0,h.A)(s),y=(0,h.A)(o.A),v=(0,h.A)(l),A=(0,h.A)(a),x=(0,h.A)(c),N=u.A;(s&&N(new s(new ArrayBuffer(1)))!=m||o.A&&N(new o.A)!=d||l&&N(l.resolve())!=f||a&&N(new a)!=p||c&&N(new c)!=g)&&(N=function(t){var e=(0,u.A)(t),n="[object Object]"==e?t.constructor:void 0,r=n?(0,h.A)(n):"";if(r)switch(r){case b:return m;case y:return d;case v:return f;case A:return p;case x:return g}return e});var E=N},1683:function(t,e,n){"use strict";n.d(e,{A:function(){return a}});var r=n(659),i=Object.create,s=function(){function t(){}return function(e){if(!(0,r.A)(e))return{};if(i)return i(e);t.prototype=e;var n=new t;return t.prototype=void 0,n}}(),o=n(8769),l=n(501),a=function(t){return"function"!=typeof t.constructor||(0,l.A)(t)?{}:s((0,o.A)(t))}},3767:function(t,e){"use strict";var n=/^(?:0|[1-9]\d*)$/;e.A=function(t,e){var r=typeof t;return!!(e=null==e?9007199254740991:e)&&("number"==r||"symbol"!=r&&n.test(t))&&t>-1&&t%1==0&&t<e}},501:function(t,e){"use strict";var n=Object.prototype;e.A=function(t){var e=t&&t.constructor;return t===("function"==typeof e&&e.prototype||n)}},8795:function(t,e,n){"use strict";var r=n(9646),i="object"==typeof exports&&exports&&!exports.nodeType&&exports,s=i&&"object"==typeof module&&module&&!module.nodeType&&module,o=s&&s.exports===i&&r.A.process,l=function(){try{return s&&s.require&&s.require("util").types||o&&o.binding&&o.binding("util")}catch(t){}}();e.A=l},2217:function(t,e){"use strict";e.A=function(t,e){return function(n){return t(e(n))}}},5507:function(t,e,n){"use strict";var r=n(9646),i="object"==typeof self&&self&&self.Object===Object&&self,s=r.A||i||Function("return this")();e.A=s},1543:function(t,e){"use strict";var n=Function.prototype.toString;e.A=function(t){if(null!=t){try{return n.call(t)}catch(t){}try{return t+""}catch(t){}}return""}},3707:function(t,e,n){"use strict";n.d(e,{A:function(){return H}});var r=n(2673),i=n(6437),s=n(9601),o=n(3169),l=n(2624),a=n(3812),c=n(4405),u=n(9844),h=n(802),d=n(8769),f=n(6935),p=Object.getOwnPropertySymbols?function(t){for(var e=[];t;)(0,h.A)(e,(0,u.A)(t)),t=(0,d.A)(t);return e}:f.A,g=n(2816),m=n(1381),b=function(t){return(0,m.A)(t,l.A,p)},y=n(7995),v=Object.prototype.hasOwnProperty,A=n(2899),x=/\w*$/,N=n(439),E=N.A?N.A.prototype:void 0,w=E?E.valueOf:void 0,q=n(1827),k=function(t,e,n){var r,i,s,o=t.constructor;switch(e){case"[object ArrayBuffer]":return(0,A.A)(t);case"[object Boolean]":case"[object Date]":return new o(+t);case"[object DataView]":return function(t,e){var n=e?(0,A.A)(t.buffer):t.buffer;return new t.constructor(n,t.byteOffset,t.byteLength)}(t,n);case"[object Float32Array]":case"[object Float64Array]":case"[object Int8Array]":case"[object Int16Array]":case"[object Int32Array]":case"[object Uint8Array]":case"[object Uint8ClampedArray]":case"[object Uint16Array]":case"[object Uint32Array]":return(0,q.A)(t,n);case"[object Map]":case"[object Set]":return new o;case"[object Number]":case"[object String]":return new o(t);case"[object RegExp]":return(s=new(i=t).constructor(i.source,x.exec(i))).lastIndex=i.lastIndex,s;case"[object Symbol]":return r=t,w?Object(w.call(r)):{}}},_=n(1683),L=n(723),S=n(776),O=n(7948),T=n(5771),j=n(8795),C=j.A&&j.A.isMap,R=C?(0,T.A)(C):function(t){return(0,O.A)(t)&&"[object Map]"==(0,y.A)(t)},I=n(659),B=j.A&&j.A.isSet,M=B?(0,T.A)(B):function(t){return(0,O.A)(t)&&"[object Set]"==(0,y.A)(t)},U="[object Arguments]",D="[object Function]",P="[object Object]",z={};z[U]=z["[object Array]"]=z["[object ArrayBuffer]"]=z["[object DataView]"]=z["[object Boolean]"]=z["[object Date]"]=z["[object Float32Array]"]=z["[object Float64Array]"]=z["[object Int8Array]"]=z["[object Int16Array]"]=z["[object Int32Array]"]=z["[object Map]"]=z["[object Number]"]=z[P]=z["[object RegExp]"]=z["[object Set]"]=z["[object String]"]=z["[object Symbol]"]=z["[object Uint8Array]"]=z["[object Uint8ClampedArray]"]=z["[object Uint16Array]"]=z["[object Uint32Array]"]=!0,z["[object Error]"]=z[D]=z["[object WeakMap]"]=!1;var F=function t(e,n,h,d,f,m){var A,x=1&n,N=2&n,E=4&n;if(h&&(A=f?h(e,d,f,m):h(e)),void 0!==A)return A;if(!(0,I.A)(e))return e;var w=(0,L.A)(e);if(w){if(A=function(t){var e=t.length,n=new t.constructor(e);return e&&"string"==typeof t[0]&&v.call(t,"index")&&(n.index=t.index,n.input=t.input),n}(e),!x)return(0,c.A)(e,A)}else{var q=(0,y.A)(e),O=q==D||"[object GeneratorFunction]"==q;if((0,S.A)(e))return(0,a.A)(e,x);if(q==P||q==U||O&&!f){if(A=N||O?{}:(0,_.A)(e),!x)return N?function(t,e){return(0,s.A)(t,p(t),e)}(e,function(t,e){return t&&(0,s.A)(e,(0,l.A)(e),t)}(A,e)):function(t,e){return(0,s.A)(t,(0,u.A)(t),e)}(e,function(t,e){return t&&(0,s.A)(e,(0,o.A)(e),t)}(A,e))}else{if(!z[q])return f?e:{};A=k(e,q,x)}}m||(m=new r.A);var T=m.get(e);if(T)return T;m.set(e,A),M(e)?e.forEach((function(r){A.add(t(r,n,h,r,e,m))})):R(e)&&e.forEach((function(r,i){A.set(i,t(r,n,h,i,e,m))}));var j=E?N?b:g.A:N?l.A:o.A,C=w?void 0:j(e);return function(t,e){for(var n=-1,r=null==t?0:t.length;++n<r&&!1!==e(t[n],n,t););}(C||e,(function(r,s){C&&(r=e[s=r]),(0,i.A)(A,s,t(r,n,h,s,e,m))})),A},H=function(t){return F(t,5)}},8138:function(t,e){"use strict";e.A=function(t,e){return t===e||t!=t&&e!=e}},8412:function(t,e,n){"use strict";n.d(e,{A:function(){return u}});var r=n(2159),i=n(7948),s=function(t){return(0,i.A)(t)&&"[object Arguments]"==(0,r.A)(t)},o=Object.prototype,l=o.hasOwnProperty,a=o.propertyIsEnumerable,c=s(function(){return arguments}())?s:function(t){return(0,i.A)(t)&&l.call(t,"callee")&&!a.call(t,"callee")},u=c},723:function(t,e){"use strict";var n=Array.isArray;e.A=n},3628:function(t,e,n){"use strict";var r=n(7572),i=n(1628);e.A=function(t){return null!=t&&(0,i.A)(t.length)&&!(0,r.A)(t)}},776:function(t,e,n){"use strict";n.d(e,{A:function(){return l}});var r=n(5507),i="object"==typeof exports&&exports&&!exports.nodeType&&exports,s=i&&"object"==typeof module&&module&&!module.nodeType&&module,o=s&&s.exports===i?r.A.Buffer:void 0,l=(o?o.isBuffer:void 0)||function(){return!1}},5123:function(t,e,n){"use strict";n.d(e,{A:function(){return S}});var r=n(2673),i=n(3558);function s(t){var e=-1,n=null==t?0:t.length;for(this.__data__=new i.A;++e<n;)this.add(t[e])}s.prototype.add=s.prototype.push=function(t){return this.__data__.set(t,"__lodash_hash_undefined__"),this},s.prototype.has=function(t){return this.__data__.has(t)};var o=s,l=function(t,e){for(var n=-1,r=null==t?0:t.length;++n<r;)if(e(t[n],n,t))return!0;return!1},a=function(t,e,n,r,i,s){var a=1&n,c=t.length,u=e.length;if(c!=u&&!(a&&u>c))return!1;var h=s.get(t),d=s.get(e);if(h&&d)return h==e&&d==t;var f=-1,p=!0,g=2&n?new o:void 0;for(s.set(t,e),s.set(e,t);++f<c;){var m=t[f],b=e[f];if(r)var y=a?r(b,m,f,e,t,s):r(m,b,f,t,e,s);if(void 0!==y){if(y)continue;p=!1;break}if(g){if(!l(e,(function(t,e){if(o=e,!g.has(o)&&(m===t||i(m,t,n,r,s)))return g.push(e);var o}))){p=!1;break}}else if(m!==b&&!i(m,b,n,r,s)){p=!1;break}}return s.delete(t),s.delete(e),p},c=n(439),u=n(7218),h=n(8138),d=function(t){var e=-1,n=Array(t.size);return t.forEach((function(t,r){n[++e]=[r,t]})),n},f=function(t){var e=-1,n=Array(t.size);return t.forEach((function(t){n[++e]=t})),n},p=c.A?c.A.prototype:void 0,g=p?p.valueOf:void 0,m=n(2816),b=Object.prototype.hasOwnProperty,y=n(7995),v=n(723),A=n(776),x=n(5755),N="[object Arguments]",E="[object Array]",w="[object Object]",q=Object.prototype.hasOwnProperty,k=function(t,e,n,i,s,o){var l=(0,v.A)(t),c=(0,v.A)(e),p=l?E:(0,y.A)(t),k=c?E:(0,y.A)(e),_=(p=p==N?w:p)==w,L=(k=k==N?w:k)==w,S=p==k;if(S&&(0,A.A)(t)){if(!(0,A.A)(e))return!1;l=!0,_=!1}if(S&&!_)return o||(o=new r.A),l||(0,x.A)(t)?a(t,e,n,i,s,o):function(t,e,n,r,i,s,o){switch(n){case"[object DataView]":if(t.byteLength!=e.byteLength||t.byteOffset!=e.byteOffset)return!1;t=t.buffer,e=e.buffer;case"[object ArrayBuffer]":return!(t.byteLength!=e.byteLength||!s(new u.A(t),new u.A(e)));case"[object Boolean]":case"[object Date]":case"[object Number]":return(0,h.A)(+t,+e);case"[object Error]":return t.name==e.name&&t.message==e.message;case"[object RegExp]":case"[object String]":return t==e+"";case"[object Map]":var l=d;case"[object Set]":var c=1&r;if(l||(l=f),t.size!=e.size&&!c)return!1;var p=o.get(t);if(p)return p==e;r|=2,o.set(t,e);var m=a(l(t),l(e),r,i,s,o);return o.delete(t),m;case"[object Symbol]":if(g)return g.call(t)==g.call(e)}return!1}(t,e,p,n,i,s,o);if(!(1&n)){var O=_&&q.call(t,"__wrapped__"),T=L&&q.call(e,"__wrapped__");if(O||T){var j=O?t.value():t,C=T?e.value():e;return o||(o=new r.A),s(j,C,n,i,o)}}return!!S&&(o||(o=new r.A),function(t,e,n,r,i,s){var o=1&n,l=(0,m.A)(t),a=l.length;if(a!=(0,m.A)(e).length&&!o)return!1;for(var c=a;c--;){var u=l[c];if(!(o?u in e:b.call(e,u)))return!1}var h=s.get(t),d=s.get(e);if(h&&d)return h==e&&d==t;var f=!0;s.set(t,e),s.set(e,t);for(var p=o;++c<a;){var g=t[u=l[c]],y=e[u];if(r)var v=o?r(y,g,u,e,t,s):r(g,y,u,t,e,s);if(!(void 0===v?g===y||i(g,y,n,r,s):v)){f=!1;break}p||(p="constructor"==u)}if(f&&!p){var A=t.constructor,x=e.constructor;A==x||!("constructor"in t)||!("constructor"in e)||"function"==typeof A&&A instanceof A&&"function"==typeof x&&x instanceof x||(f=!1)}return s.delete(t),s.delete(e),f}(t,e,n,i,s,o))},_=n(7948),L=function t(e,n,r,i,s){return e===n||(null==e||null==n||!(0,_.A)(e)&&!(0,_.A)(n)?e!=e&&n!=n:k(e,n,r,i,t,s))},S=function(t,e){return L(t,e)}},7572:function(t,e,n){"use strict";var r=n(2159),i=n(659);e.A=function(t){if(!(0,i.A)(t))return!1;var e=(0,r.A)(t);return"[object Function]"==e||"[object GeneratorFunction]"==e||"[object AsyncFunction]"==e||"[object Proxy]"==e}},1628:function(t,e){"use strict";e.A=function(t){return"number"==typeof t&&t>-1&&t%1==0&&t<=9007199254740991}},659:function(t,e){"use strict";e.A=function(t){var e=typeof t;return null!=t&&("object"==e||"function"==e)}},7948:function(t,e){"use strict";e.A=function(t){return null!=t&&"object"==typeof t}},5755:function(t,e,n){"use strict";n.d(e,{A:function(){return u}});var r=n(2159),i=n(1628),s=n(7948),o={};o["[object Float32Array]"]=o["[object Float64Array]"]=o["[object Int8Array]"]=o["[object Int16Array]"]=o["[object Int32Array]"]=o["[object Uint8Array]"]=o["[object Uint8ClampedArray]"]=o["[object Uint16Array]"]=o["[object Uint32Array]"]=!0,o["[object Arguments]"]=o["[object Array]"]=o["[object ArrayBuffer]"]=o["[object Boolean]"]=o["[object DataView]"]=o["[object Date]"]=o["[object Error]"]=o["[object Function]"]=o["[object Map]"]=o["[object Number]"]=o["[object Object]"]=o["[object RegExp]"]=o["[object Set]"]=o["[object String]"]=o["[object WeakMap]"]=!1;var l=n(5771),a=n(8795),c=a.A&&a.A.isTypedArray,u=c?(0,l.A)(c):function(t){return(0,s.A)(t)&&(0,i.A)(t.length)&&!!o[(0,r.A)(t)]}},3169:function(t,e,n){"use strict";n.d(e,{A:function(){return a}});var r=n(6753),i=n(501),s=(0,n(2217).A)(Object.keys,Object),o=Object.prototype.hasOwnProperty,l=n(3628),a=function(t){return(0,l.A)(t)?(0,r.A)(t):function(t){if(!(0,i.A)(t))return s(t);var e=[];for(var n in Object(t))o.call(t,n)&&"constructor"!=n&&e.push(n);return e}(t)}},2624:function(t,e,n){"use strict";n.d(e,{A:function(){return c}});var r=n(6753),i=n(659),s=n(501),o=Object.prototype.hasOwnProperty,l=function(t){if(!(0,i.A)(t))return function(t){var e=[];if(null!=t)for(var n in Object(t))e.push(n);return e}(t);var e=(0,s.A)(t),n=[];for(var r in t)("constructor"!=r||!e&&o.call(t,r))&&n.push(r);return n},a=n(3628),c=function(t){return(0,a.A)(t)?(0,r.A)(t,!0):l(t)}},8347:function(t,e,n){"use strict";n.d(e,{A:function(){return $}});var r,i,s,o,l=n(2673),a=n(6770),c=n(8138),u=function(t,e,n){(void 0!==n&&!(0,c.A)(t[e],n)||void 0===n&&!(e in t))&&(0,a.A)(t,e,n)},h=function(t,e,n){for(var r=-1,i=Object(t),s=n(t),o=s.length;o--;){var l=s[++r];if(!1===e(i[l],l,i))break}return t},d=n(3812),f=n(1827),p=n(4405),g=n(1683),m=n(8412),b=n(723),y=n(3628),v=n(7948),A=n(776),x=n(7572),N=n(659),E=n(2159),w=n(8769),q=Function.prototype,k=Object.prototype,_=q.toString,L=k.hasOwnProperty,S=_.call(Object),O=n(5755),T=function(t,e){if(("constructor"!==e||"function"!=typeof t[e])&&"__proto__"!=e)return t[e]},j=n(9601),C=n(2624),R=function(t,e,n,r,i,s,o){var l,a=T(t,n),c=T(e,n),h=o.get(c);if(h)u(t,n,h);else{var q=s?s(a,c,n+"",t,e,o):void 0,k=void 0===q;if(k){var R=(0,b.A)(c),I=!R&&(0,A.A)(c),B=!R&&!I&&(0,O.A)(c);q=c,R||I||B?(0,b.A)(a)?q=a:(l=a,(0,v.A)(l)&&(0,y.A)(l)?q=(0,p.A)(a):I?(k=!1,q=(0,d.A)(c,!0)):B?(k=!1,q=(0,f.A)(c,!0)):q=[]):function(t){if(!(0,v.A)(t)||"[object Object]"!=(0,E.A)(t))return!1;var e=(0,w.A)(t);if(null===e)return!0;var n=L.call(e,"constructor")&&e.constructor;return"function"==typeof n&&n instanceof n&&_.call(n)==S}(c)||(0,m.A)(c)?(q=a,(0,m.A)(a)?q=function(t){return(0,j.A)(t,(0,C.A)(t))}(a):(0,N.A)(a)&&!(0,x.A)(a)||(q=(0,g.A)(c))):k=!1}k&&(o.set(c,q),i(q,c,r,s,o),o.delete(c)),u(t,n,q)}},I=function t(e,n,r,i,s){e!==n&&h(n,(function(o,a){if(s||(s=new l.A),(0,N.A)(o))R(e,n,a,r,t,i,s);else{var c=i?i(T(e,a),o,a+"",e,n,s):void 0;void 0===c&&(c=o),u(e,a,c)}}),C.A)},B=function(t){return t},M=Math.max,U=n(7889),D=U.A?function(t,e){return(0,U.A)(t,"toString",{configurable:!0,enumerable:!1,value:(n=e,function(){return n}),writable:!0});var n}:B,P=Date.now,z=(r=D,i=0,s=0,function(){var t=P(),e=16-(t-s);if(s=t,e>0){if(++i>=800)return arguments[0]}else i=0;return r.apply(void 0,arguments)}),F=function(t,e){return z(function(t,e,n){return e=M(void 0===e?t.length-1:e,0),function(){for(var r=arguments,i=-1,s=M(r.length-e,0),o=Array(s);++i<s;)o[i]=r[e+i];i=-1;for(var l=Array(e+1);++i<e;)l[i]=r[i];return l[e]=n(o),function(t,e,n){switch(n.length){case 0:return t.call(e);case 1:return t.call(e,n[0]);case 2:return t.call(e,n[0],n[1]);case 3:return t.call(e,n[0],n[1],n[2])}return t.apply(e,n)}(t,this,l)}}(t,e,B),t+"")},H=n(3767),$=(o=function(t,e,n){I(t,e,n)},F((function(t,e){var n=-1,r=e.length,i=r>1?e[r-1]:void 0,s=r>2?e[2]:void 0;for(i=o.length>3&&"function"==typeof i?(r--,i):void 0,s&&function(t,e,n){if(!(0,N.A)(n))return!1;var r=typeof e;return!!("number"==r?(0,y.A)(n)&&(0,H.A)(e,n.length):"string"==r&&e in n)&&(0,c.A)(n[e],t)}(e[0],e[1],s)&&(i=r<3?void 0:i,r=1),t=Object(t);++n<r;){var l=e[n];l&&o(t,l,n)}return t})))},6935:function(t,e){"use strict";e.A=function(){return[]}},6003:function(t,e,n){"use strict";n.r(e),n.d(e,{Attributor:function(){return i},AttributorStore:function(){return d},BlockBlot:function(){return w},ClassAttributor:function(){return c},ContainerBlot:function(){return k},EmbedBlot:function(){return _},InlineBlot:function(){return N},LeafBlot:function(){return m},ParentBlot:function(){return A},Registry:function(){return l},Scope:function(){return r},ScrollBlot:function(){return O},StyleAttributor:function(){return h},TextBlot:function(){return j}});var r=(t=>(t[t.TYPE=3]="TYPE",t[t.LEVEL=12]="LEVEL",t[t.ATTRIBUTE=13]="ATTRIBUTE",t[t.BLOT=14]="BLOT",t[t.INLINE=7]="INLINE",t[t.BLOCK=11]="BLOCK",t[t.BLOCK_BLOT=10]="BLOCK_BLOT",t[t.INLINE_BLOT=6]="INLINE_BLOT",t[t.BLOCK_ATTRIBUTE=9]="BLOCK_ATTRIBUTE",t[t.INLINE_ATTRIBUTE=5]="INLINE_ATTRIBUTE",t[t.ANY=15]="ANY",t))(r||{});class i{constructor(t,e,n={}){this.attrName=t,this.keyName=e;const i=r.TYPE&r.ATTRIBUTE;this.scope=null!=n.scope?n.scope&r.LEVEL|i:r.ATTRIBUTE,null!=n.whitelist&&(this.whitelist=n.whitelist)}static keys(t){return Array.from(t.attributes).map((t=>t.name))}add(t,e){return!!this.canAdd(t,e)&&(t.setAttribute(this.keyName,e),!0)}canAdd(t,e){return null==this.whitelist||("string"==typeof e?this.whitelist.indexOf(e.replace(/["']/g,""))>-1:this.whitelist.indexOf(e)>-1)}remove(t){t.removeAttribute(this.keyName)}value(t){const e=t.getAttribute(this.keyName);return this.canAdd(t,e)&&e?e:""}}class s extends Error{constructor(t){super(t="[Parchment] "+t),this.message=t,this.name=this.constructor.name}}const o=class t{constructor(){this.attributes={},this.classes={},this.tags={},this.types={}}static find(t,e=!1){if(null==t)return null;if(this.blots.has(t))return this.blots.get(t)||null;if(e){let n=null;try{n=t.parentNode}catch{return null}return this.find(n,e)}return null}create(e,n,r){const i=this.query(n);if(null==i)throw new s(`Unable to create ${n} blot`);const o=i,l=n instanceof Node||n.nodeType===Node.TEXT_NODE?n:o.create(r),a=new o(e,l,r);return t.blots.set(a.domNode,a),a}find(e,n=!1){return t.find(e,n)}query(t,e=r.ANY){let n;return"string"==typeof t?n=this.types[t]||this.attributes[t]:t instanceof Text||t.nodeType===Node.TEXT_NODE?n=this.types.text:"number"==typeof t?t&r.LEVEL&r.BLOCK?n=this.types.block:t&r.LEVEL&r.INLINE&&(n=this.types.inline):t instanceof Element&&((t.getAttribute("class")||"").split(/\s+/).some((t=>(n=this.classes[t],!!n))),n=n||this.tags[t.tagName]),null==n?null:"scope"in n&&e&r.LEVEL&n.scope&&e&r.TYPE&n.scope?n:null}register(...t){return t.map((t=>{const e="blotName"in t,n="attrName"in t;if(!e&&!n)throw new s("Invalid definition");if(e&&"abstract"===t.blotName)throw new s("Cannot register abstract class");const r=e?t.blotName:n?t.attrName:void 0;return this.types[r]=t,n?"string"==typeof t.keyName&&(this.attributes[t.keyName]=t):e&&(t.className&&(this.classes[t.className]=t),t.tagName&&(Array.isArray(t.tagName)?t.tagName=t.tagName.map((t=>t.toUpperCase())):t.tagName=t.tagName.toUpperCase(),(Array.isArray(t.tagName)?t.tagName:[t.tagName]).forEach((e=>{(null==this.tags[e]||null==t.className)&&(this.tags[e]=t)})))),t}))}};o.blots=new WeakMap;let l=o;function a(t,e){return(t.getAttribute("class")||"").split(/\s+/).filter((t=>0===t.indexOf(`${e}-`)))}const c=class extends i{static keys(t){return(t.getAttribute("class")||"").split(/\s+/).map((t=>t.split("-").slice(0,-1).join("-")))}add(t,e){return!!this.canAdd(t,e)&&(this.remove(t),t.classList.add(`${this.keyName}-${e}`),!0)}remove(t){a(t,this.keyName).forEach((e=>{t.classList.remove(e)})),0===t.classList.length&&t.removeAttribute("class")}value(t){const e=(a(t,this.keyName)[0]||"").slice(this.keyName.length+1);return this.canAdd(t,e)?e:""}};function u(t){const e=t.split("-"),n=e.slice(1).map((t=>t[0].toUpperCase()+t.slice(1))).join("");return e[0]+n}const h=class extends i{static keys(t){return(t.getAttribute("style")||"").split(";").map((t=>t.split(":")[0].trim()))}add(t,e){return!!this.canAdd(t,e)&&(t.style[u(this.keyName)]=e,!0)}remove(t){t.style[u(this.keyName)]="",t.getAttribute("style")||t.removeAttribute("style")}value(t){const e=t.style[u(this.keyName)];return this.canAdd(t,e)?e:""}},d=class{constructor(t){this.attributes={},this.domNode=t,this.build()}attribute(t,e){e?t.add(this.domNode,e)&&(null!=t.value(this.domNode)?this.attributes[t.attrName]=t:delete this.attributes[t.attrName]):(t.remove(this.domNode),delete this.attributes[t.attrName])}build(){this.attributes={};const t=l.find(this.domNode);if(null==t)return;const e=i.keys(this.domNode),n=c.keys(this.domNode),s=h.keys(this.domNode);e.concat(n).concat(s).forEach((e=>{const n=t.scroll.query(e,r.ATTRIBUTE);n instanceof i&&(this.attributes[n.attrName]=n)}))}copy(t){Object.keys(this.attributes).forEach((e=>{const n=this.attributes[e].value(this.domNode);t.format(e,n)}))}move(t){this.copy(t),Object.keys(this.attributes).forEach((t=>{this.attributes[t].remove(this.domNode)})),this.attributes={}}values(){return Object.keys(this.attributes).reduce(((t,e)=>(t[e]=this.attributes[e].value(this.domNode),t)),{})}},f=class{constructor(t,e){this.scroll=t,this.domNode=e,l.blots.set(e,this),this.prev=null,this.next=null}static create(t){if(null==this.tagName)throw new s("Blot definition missing tagName");let e,n;return Array.isArray(this.tagName)?("string"==typeof t?(n=t.toUpperCase(),parseInt(n,10).toString()===n&&(n=parseInt(n,10))):"number"==typeof t&&(n=t),e="number"==typeof n?document.createElement(this.tagName[n-1]):n&&this.tagName.indexOf(n)>-1?document.createElement(n):document.createElement(this.tagName[0])):e=document.createElement(this.tagName),this.className&&e.classList.add(this.className),e}get statics(){return this.constructor}attach(){}clone(){const t=this.domNode.cloneNode(!1);return this.scroll.create(t)}detach(){null!=this.parent&&this.parent.removeChild(this),l.blots.delete(this.domNode)}deleteAt(t,e){this.isolate(t,e).remove()}formatAt(t,e,n,i){const s=this.isolate(t,e);if(null!=this.scroll.query(n,r.BLOT)&&i)s.wrap(n,i);else if(null!=this.scroll.query(n,r.ATTRIBUTE)){const t=this.scroll.create(this.statics.scope);s.wrap(t),t.format(n,i)}}insertAt(t,e,n){const r=null==n?this.scroll.create("text",e):this.scroll.create(e,n),i=this.split(t);this.parent.insertBefore(r,i||void 0)}isolate(t,e){const n=this.split(t);if(null==n)throw new Error("Attempt to isolate at end");return n.split(e),n}length(){return 1}offset(t=this.parent){return null==this.parent||this===t?0:this.parent.children.offset(this)+this.parent.offset(t)}optimize(t){this.statics.requiredContainer&&!(this.parent instanceof this.statics.requiredContainer)&&this.wrap(this.statics.requiredContainer.blotName)}remove(){null!=this.domNode.parentNode&&this.domNode.parentNode.removeChild(this.domNode),this.detach()}replaceWith(t,e){const n="string"==typeof t?this.scroll.create(t,e):t;return null!=this.parent&&(this.parent.insertBefore(n,this.next||void 0),this.remove()),n}split(t,e){return 0===t?this:this.next}update(t,e){}wrap(t,e){const n="string"==typeof t?this.scroll.create(t,e):t;if(null!=this.parent&&this.parent.insertBefore(n,this.next||void 0),"function"!=typeof n.appendChild)throw new s(`Cannot wrap ${t}`);return n.appendChild(this),n}};f.blotName="abstract";let p=f;const g=class extends p{static value(t){return!0}index(t,e){return this.domNode===t||this.domNode.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY?Math.min(e,1):-1}position(t,e){let n=Array.from(this.parent.domNode.childNodes).indexOf(this.domNode);return t>0&&(n+=1),[this.parent.domNode,n]}value(){return{[this.statics.blotName]:this.statics.value(this.domNode)||!0}}};g.scope=r.INLINE_BLOT;const m=g;class b{constructor(){this.head=null,this.tail=null,this.length=0}append(...t){if(this.insertBefore(t[0],null),t.length>1){const e=t.slice(1);this.append(...e)}}at(t){const e=this.iterator();let n=e();for(;n&&t>0;)t-=1,n=e();return n}contains(t){const e=this.iterator();let n=e();for(;n;){if(n===t)return!0;n=e()}return!1}indexOf(t){const e=this.iterator();let n=e(),r=0;for(;n;){if(n===t)return r;r+=1,n=e()}return-1}insertBefore(t,e){null!=t&&(this.remove(t),t.next=e,null!=e?(t.prev=e.prev,null!=e.prev&&(e.prev.next=t),e.prev=t,e===this.head&&(this.head=t)):null!=this.tail?(this.tail.next=t,t.prev=this.tail,this.tail=t):(t.prev=null,this.head=this.tail=t),this.length+=1)}offset(t){let e=0,n=this.head;for(;null!=n;){if(n===t)return e;e+=n.length(),n=n.next}return-1}remove(t){this.contains(t)&&(null!=t.prev&&(t.prev.next=t.next),null!=t.next&&(t.next.prev=t.prev),t===this.head&&(this.head=t.next),t===this.tail&&(this.tail=t.prev),this.length-=1)}iterator(t=this.head){return()=>{const e=t;return null!=t&&(t=t.next),e}}find(t,e=!1){const n=this.iterator();let r=n();for(;r;){const i=r.length();if(t<i||e&&t===i&&(null==r.next||0!==r.next.length()))return[r,t];t-=i,r=n()}return[null,0]}forEach(t){const e=this.iterator();let n=e();for(;n;)t(n),n=e()}forEachAt(t,e,n){if(e<=0)return;const[r,i]=this.find(t);let s=t-i;const o=this.iterator(r);let l=o();for(;l&&s<t+e;){const r=l.length();t>s?n(l,t-s,Math.min(e,s+r-t)):n(l,0,Math.min(r,t+e-s)),s+=r,l=o()}}map(t){return this.reduce(((e,n)=>(e.push(t(n)),e)),[])}reduce(t,e){const n=this.iterator();let r=n();for(;r;)e=t(e,r),r=n();return e}}function y(t,e){const n=e.find(t);if(n)return n;try{return e.create(t)}catch{const n=e.create(r.INLINE);return Array.from(t.childNodes).forEach((t=>{n.domNode.appendChild(t)})),t.parentNode&&t.parentNode.replaceChild(n.domNode,t),n.attach(),n}}const v=class t extends p{constructor(t,e){super(t,e),this.uiNode=null,this.build()}appendChild(t){this.insertBefore(t)}attach(){super.attach(),this.children.forEach((t=>{t.attach()}))}attachUI(e){null!=this.uiNode&&this.uiNode.remove(),this.uiNode=e,t.uiClass&&this.uiNode.classList.add(t.uiClass),this.uiNode.setAttribute("contenteditable","false"),this.domNode.insertBefore(this.uiNode,this.domNode.firstChild)}build(){this.children=new b,Array.from(this.domNode.childNodes).filter((t=>t!==this.uiNode)).reverse().forEach((t=>{try{const e=y(t,this.scroll);this.insertBefore(e,this.children.head||void 0)}catch(t){if(t instanceof s)return;throw t}}))}deleteAt(t,e){if(0===t&&e===this.length())return this.remove();this.children.forEachAt(t,e,((t,e,n)=>{t.deleteAt(e,n)}))}descendant(e,n=0){const[r,i]=this.children.find(n);return null==e.blotName&&e(r)||null!=e.blotName&&r instanceof e?[r,i]:r instanceof t?r.descendant(e,i):[null,-1]}descendants(e,n=0,r=Number.MAX_VALUE){let i=[],s=r;return this.children.forEachAt(n,r,((n,r,o)=>{(null==e.blotName&&e(n)||null!=e.blotName&&n instanceof e)&&i.push(n),n instanceof t&&(i=i.concat(n.descendants(e,r,s))),s-=o})),i}detach(){this.children.forEach((t=>{t.detach()})),super.detach()}enforceAllowedChildren(){let e=!1;this.children.forEach((n=>{e||this.statics.allowedChildren.some((t=>n instanceof t))||(n.statics.scope===r.BLOCK_BLOT?(null!=n.next&&this.splitAfter(n),null!=n.prev&&this.splitAfter(n.prev),n.parent.unwrap(),e=!0):n instanceof t?n.unwrap():n.remove())}))}formatAt(t,e,n,r){this.children.forEachAt(t,e,((t,e,i)=>{t.formatAt(e,i,n,r)}))}insertAt(t,e,n){const[r,i]=this.children.find(t);if(r)r.insertAt(i,e,n);else{const t=null==n?this.scroll.create("text",e):this.scroll.create(e,n);this.appendChild(t)}}insertBefore(t,e){null!=t.parent&&t.parent.children.remove(t);let n=null;this.children.insertBefore(t,e||null),t.parent=this,null!=e&&(n=e.domNode),(this.domNode.parentNode!==t.domNode||this.domNode.nextSibling!==n)&&this.domNode.insertBefore(t.domNode,n),t.attach()}length(){return this.children.reduce(((t,e)=>t+e.length()),0)}moveChildren(t,e){this.children.forEach((n=>{t.insertBefore(n,e)}))}optimize(t){if(super.optimize(t),this.enforceAllowedChildren(),null!=this.uiNode&&this.uiNode!==this.domNode.firstChild&&this.domNode.insertBefore(this.uiNode,this.domNode.firstChild),0===this.children.length)if(null!=this.statics.defaultChild){const t=this.scroll.create(this.statics.defaultChild.blotName);this.appendChild(t)}else this.remove()}path(e,n=!1){const[r,i]=this.children.find(e,n),s=[[this,e]];return r instanceof t?s.concat(r.path(i,n)):(null!=r&&s.push([r,i]),s)}removeChild(t){this.children.remove(t)}replaceWith(e,n){const r="string"==typeof e?this.scroll.create(e,n):e;return r instanceof t&&this.moveChildren(r),super.replaceWith(r)}split(t,e=!1){if(!e){if(0===t)return this;if(t===this.length())return this.next}const n=this.clone();return this.parent&&this.parent.insertBefore(n,this.next||void 0),this.children.forEachAt(t,this.length(),((t,r,i)=>{const s=t.split(r,e);null!=s&&n.appendChild(s)})),n}splitAfter(t){const e=this.clone();for(;null!=t.next;)e.appendChild(t.next);return this.parent&&this.parent.insertBefore(e,this.next||void 0),e}unwrap(){this.parent&&this.moveChildren(this.parent,this.next||void 0),this.remove()}update(t,e){const n=[],r=[];t.forEach((t=>{t.target===this.domNode&&"childList"===t.type&&(n.push(...t.addedNodes),r.push(...t.removedNodes))})),r.forEach((t=>{if(null!=t.parentNode&&"IFRAME"!==t.tagName&&document.body.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY)return;const e=this.scroll.find(t);null!=e&&(null==e.domNode.parentNode||e.domNode.parentNode===this.domNode)&&e.detach()})),n.filter((t=>t.parentNode===this.domNode&&t!==this.uiNode)).sort(((t,e)=>t===e?0:t.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_FOLLOWING?1:-1)).forEach((t=>{let e=null;null!=t.nextSibling&&(e=this.scroll.find(t.nextSibling));const n=y(t,this.scroll);(n.next!==e||null==n.next)&&(null!=n.parent&&n.parent.removeChild(this),this.insertBefore(n,e||void 0))})),this.enforceAllowedChildren()}};v.uiClass="";const A=v,x=class t extends A{static create(t){return super.create(t)}static formats(e,n){const r=n.query(t.blotName);if(null==r||e.tagName!==r.tagName){if("string"==typeof this.tagName)return!0;if(Array.isArray(this.tagName))return e.tagName.toLowerCase()}}constructor(t,e){super(t,e),this.attributes=new d(this.domNode)}format(e,n){if(e!==this.statics.blotName||n){const t=this.scroll.query(e,r.INLINE);if(null==t)return;t instanceof i?this.attributes.attribute(t,n):n&&(e!==this.statics.blotName||this.formats()[e]!==n)&&this.replaceWith(e,n)}else this.children.forEach((e=>{e instanceof t||(e=e.wrap(t.blotName,!0)),this.attributes.copy(e)})),this.unwrap()}formats(){const t=this.attributes.values(),e=this.statics.formats(this.domNode,this.scroll);return null!=e&&(t[this.statics.blotName]=e),t}formatAt(t,e,n,i){null!=this.formats()[n]||this.scroll.query(n,r.ATTRIBUTE)?this.isolate(t,e).format(n,i):super.formatAt(t,e,n,i)}optimize(e){super.optimize(e);const n=this.formats();if(0===Object.keys(n).length)return this.unwrap();const r=this.next;r instanceof t&&r.prev===this&&function(t,e){if(Object.keys(t).length!==Object.keys(e).length)return!1;for(const n in t)if(t[n]!==e[n])return!1;return!0}(n,r.formats())&&(r.moveChildren(this),r.remove())}replaceWith(t,e){const n=super.replaceWith(t,e);return this.attributes.copy(n),n}update(t,e){super.update(t,e),t.some((t=>t.target===this.domNode&&"attributes"===t.type))&&this.attributes.build()}wrap(e,n){const r=super.wrap(e,n);return r instanceof t&&this.attributes.move(r),r}};x.allowedChildren=[x,m],x.blotName="inline",x.scope=r.INLINE_BLOT,x.tagName="SPAN";const N=x,E=class t extends A{static create(t){return super.create(t)}static formats(e,n){const r=n.query(t.blotName);if(null==r||e.tagName!==r.tagName){if("string"==typeof this.tagName)return!0;if(Array.isArray(this.tagName))return e.tagName.toLowerCase()}}constructor(t,e){super(t,e),this.attributes=new d(this.domNode)}format(e,n){const s=this.scroll.query(e,r.BLOCK);null!=s&&(s instanceof i?this.attributes.attribute(s,n):e!==this.statics.blotName||n?n&&(e!==this.statics.blotName||this.formats()[e]!==n)&&this.replaceWith(e,n):this.replaceWith(t.blotName))}formats(){const t=this.attributes.values(),e=this.statics.formats(this.domNode,this.scroll);return null!=e&&(t[this.statics.blotName]=e),t}formatAt(t,e,n,i){null!=this.scroll.query(n,r.BLOCK)?this.format(n,i):super.formatAt(t,e,n,i)}insertAt(t,e,n){if(null==n||null!=this.scroll.query(e,r.INLINE))super.insertAt(t,e,n);else{const r=this.split(t);if(null==r)throw new Error("Attempt to insertAt after block boundaries");{const t=this.scroll.create(e,n);r.parent.insertBefore(t,r)}}}replaceWith(t,e){const n=super.replaceWith(t,e);return this.attributes.copy(n),n}update(t,e){super.update(t,e),t.some((t=>t.target===this.domNode&&"attributes"===t.type))&&this.attributes.build()}};E.blotName="block",E.scope=r.BLOCK_BLOT,E.tagName="P",E.allowedChildren=[N,E,m];const w=E,q=class extends A{checkMerge(){return null!==this.next&&this.next.statics.blotName===this.statics.blotName}deleteAt(t,e){super.deleteAt(t,e),this.enforceAllowedChildren()}formatAt(t,e,n,r){super.formatAt(t,e,n,r),this.enforceAllowedChildren()}insertAt(t,e,n){super.insertAt(t,e,n),this.enforceAllowedChildren()}optimize(t){super.optimize(t),this.children.length>0&&null!=this.next&&this.checkMerge()&&(this.next.moveChildren(this),this.next.remove())}};q.blotName="container",q.scope=r.BLOCK_BLOT;const k=q,_=class extends m{static formats(t,e){}format(t,e){super.formatAt(0,this.length(),t,e)}formatAt(t,e,n,r){0===t&&e===this.length()?this.format(n,r):super.formatAt(t,e,n,r)}formats(){return this.statics.formats(this.domNode,this.scroll)}},L={attributes:!0,characterData:!0,characterDataOldValue:!0,childList:!0,subtree:!0},S=class extends A{constructor(t,e){super(null,e),this.registry=t,this.scroll=this,this.build(),this.observer=new MutationObserver((t=>{this.update(t)})),this.observer.observe(this.domNode,L),this.attach()}create(t,e){return this.registry.create(this,t,e)}find(t,e=!1){const n=this.registry.find(t,e);return n?n.scroll===this?n:e?this.find(n.scroll.domNode.parentNode,!0):null:null}query(t,e=r.ANY){return this.registry.query(t,e)}register(...t){return this.registry.register(...t)}build(){null!=this.scroll&&super.build()}detach(){super.detach(),this.observer.disconnect()}deleteAt(t,e){this.update(),0===t&&e===this.length()?this.children.forEach((t=>{t.remove()})):super.deleteAt(t,e)}formatAt(t,e,n,r){this.update(),super.formatAt(t,e,n,r)}insertAt(t,e,n){this.update(),super.insertAt(t,e,n)}optimize(t=[],e={}){super.optimize(e);const n=e.mutationsMap||new WeakMap;let r=Array.from(this.observer.takeRecords());for(;r.length>0;)t.push(r.pop());const i=(t,e=!0)=>{null==t||t===this||null!=t.domNode.parentNode&&(n.has(t.domNode)||n.set(t.domNode,[]),e&&i(t.parent))},s=t=>{n.has(t.domNode)&&(t instanceof A&&t.children.forEach(s),n.delete(t.domNode),t.optimize(e))};let o=t;for(let e=0;o.length>0;e+=1){if(e>=100)throw new Error("[Parchment] Maximum optimize iterations reached");for(o.forEach((t=>{const e=this.find(t.target,!0);null!=e&&(e.domNode===t.target&&("childList"===t.type?(i(this.find(t.previousSibling,!1)),Array.from(t.addedNodes).forEach((t=>{const e=this.find(t,!1);i(e,!1),e instanceof A&&e.children.forEach((t=>{i(t,!1)}))}))):"attributes"===t.type&&i(e.prev)),i(e))})),this.children.forEach(s),o=Array.from(this.observer.takeRecords()),r=o.slice();r.length>0;)t.push(r.pop())}}update(t,e={}){t=t||this.observer.takeRecords();const n=new WeakMap;t.map((t=>{const e=this.find(t.target,!0);return null==e?null:n.has(e.domNode)?(n.get(e.domNode).push(t),null):(n.set(e.domNode,[t]),e)})).forEach((t=>{null!=t&&t!==this&&n.has(t.domNode)&&t.update(n.get(t.domNode)||[],e)})),e.mutationsMap=n,n.has(this.domNode)&&super.update(n.get(this.domNode),e),this.optimize(t,e)}};S.blotName="scroll",S.defaultChild=w,S.allowedChildren=[w,k],S.scope=r.BLOCK_BLOT,S.tagName="DIV";const O=S,T=class t extends m{static create(t){return document.createTextNode(t)}static value(t){return t.data}constructor(t,e){super(t,e),this.text=this.statics.value(this.domNode)}deleteAt(t,e){this.domNode.data=this.text=this.text.slice(0,t)+this.text.slice(t+e)}index(t,e){return this.domNode===t?e:-1}insertAt(t,e,n){null==n?(this.text=this.text.slice(0,t)+e+this.text.slice(t),this.domNode.data=this.text):super.insertAt(t,e,n)}length(){return this.text.length}optimize(e){super.optimize(e),this.text=this.statics.value(this.domNode),0===this.text.length?this.remove():this.next instanceof t&&this.next.prev===this&&(this.insertAt(this.length(),this.next.value()),this.next.remove())}position(t,e=!1){return[this.domNode,t]}split(t,e=!1){if(!e){if(0===t)return this;if(t===this.length())return this.next}const n=this.scroll.create(this.domNode.splitText(t));return this.parent.insertBefore(n,this.next||void 0),this.text=this.statics.value(this.domNode),n}update(t,e){t.some((t=>"characterData"===t.type&&t.target===this.domNode))&&(this.text=this.statics.value(this.domNode))}value(){return this.text}};T.blotName="text",T.scope=r.INLINE_BLOT;const j=T}},e={};function n(r){var i=e[r];if(void 0!==i)return i.exports;var s=e[r]={id:r,loaded:!1,exports:{}};return t[r](s,s.exports,n),s.loaded=!0,s.exports}n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,{a:e}),e},n.d=function(t,e){for(var r in e)n.o(e,r)&&!n.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:e[r]})},n.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"==typeof window)return window}}(),n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.nmd=function(t){return t.paths=[],t.children||(t.children=[]),t};var r={};return function(){"use strict";n.d(r,{default:function(){return It}});var t=n(3729),e=n(8276),i=n(7912),s=n(6003);class o extends s.ClassAttributor{add(t,e){let n=0;if("+1"===e||"-1"===e){const r=this.value(t)||0;n="+1"===e?r+1:r-1}else"number"==typeof e&&(n=e);return 0===n?(this.remove(t),!0):super.add(t,n.toString())}canAdd(t,e){return super.canAdd(t,e)||super.canAdd(t,parseInt(e,10))}value(t){return parseInt(super.value(t),10)||void 0}}var l=new o("indent","ql-indent",{scope:s.Scope.BLOCK,whitelist:[1,2,3,4,5,6,7,8]}),a=n(9698);class c extends a.Ay{static blotName="blockquote";static tagName="blockquote"}var u=c;class h extends a.Ay{static blotName="header";static tagName=["H1","H2","H3","H4","H5","H6"];static formats(t){return this.tagName.indexOf(t.tagName)+1}}var d=h,f=n(580),p=n(6142);class g extends f.A{}g.blotName="list-container",g.tagName="OL";class m extends a.Ay{static create(t){const e=super.create();return e.setAttribute("data-list",t),e}static formats(t){return t.getAttribute("data-list")||void 0}static register(){p.Ay.register(g)}constructor(t,e){super(t,e);const n=e.ownerDocument.createElement("span"),r=n=>{if(!t.isEnabled())return;const r=this.statics.formats(e,t);"checked"===r?(this.format("list","unchecked"),n.preventDefault()):"unchecked"===r&&(this.format("list","checked"),n.preventDefault())};n.addEventListener("mousedown",r),n.addEventListener("touchstart",r),this.attachUI(n)}format(t,e){t===this.statics.blotName&&e?this.domNode.setAttribute("data-list",e):super.format(t,e)}}m.blotName="list",m.tagName="LI",g.allowedChildren=[m],m.requiredContainer=g;var b=n(9541),y=n(8638),v=n(6772),A=n(664),x=n(4850);class N extends x.A{static blotName="bold";static tagName=["STRONG","B"];static create(){return super.create()}static formats(){return!0}optimize(t){super.optimize(t),this.domNode.tagName!==this.statics.tagName[0]&&this.replaceWith(this.statics.blotName)}}var E=N;class w extends x.A{static blotName="link";static tagName="A";static SANITIZED_URL="about:blank";static PROTOCOL_WHITELIST=["http","https","mailto","tel","sms"];static create(t){const e=super.create(t);return e.setAttribute("href",this.sanitize(t)),e.setAttribute("rel","noopener noreferrer"),e.setAttribute("target","_blank"),e}static formats(t){return t.getAttribute("href")}static sanitize(t){return q(t,this.PROTOCOL_WHITELIST)?t:this.SANITIZED_URL}format(t,e){t===this.statics.blotName&&e?this.domNode.setAttribute("href",this.constructor.sanitize(e)):super.format(t,e)}}function q(t,e){const n=document.createElement("a");n.href=t;const r=n.href.slice(0,n.href.indexOf(":"));return e.indexOf(r)>-1}class k extends x.A{static blotName="script";static tagName=["SUB","SUP"];static create(t){return"super"===t?document.createElement("sup"):"sub"===t?document.createElement("sub"):super.create(t)}static formats(t){return"SUB"===t.tagName?"sub":"SUP"===t.tagName?"super":void 0}}var _=k;class L extends x.A{static blotName="underline";static tagName="U"}var S=L,O=n(746);class T extends O.A{static blotName="formula";static className="ql-formula";static tagName="SPAN";static create(t){if(null==window.katex)throw new Error("Formula module requires KaTeX.");const e=super.create(t);return"string"==typeof t&&(window.katex.render(t,e,{throwOnError:!1,errorColor:"#f00"}),e.setAttribute("data-value",t)),e}static value(t){return t.getAttribute("data-value")}html(){const{formula:t}=this.value();return`<span>${t}</span>`}}var j=T;const C=["alt","height","width"];class R extends s.EmbedBlot{static blotName="image";static tagName="IMG";static create(t){const e=super.create(t);return"string"==typeof t&&e.setAttribute("src",this.sanitize(t)),e}static formats(t){return C.reduce(((e,n)=>(t.hasAttribute(n)&&(e[n]=t.getAttribute(n)),e)),{})}static match(t){return/\.(jpe?g|gif|png)$/.test(t)||/^data:image\/.+;base64/.test(t)}static sanitize(t){return q(t,["http","https","data"])?t:"//:0"}static value(t){return t.getAttribute("src")}format(t,e){C.indexOf(t)>-1?e?this.domNode.setAttribute(t,e):this.domNode.removeAttribute(t):super.format(t,e)}}var I=R;const B=["height","width"];class M extends a.zo{static blotName="video";static className="ql-video";static tagName="IFRAME";static create(t){const e=super.create(t);return e.setAttribute("frameborder","0"),e.setAttribute("allowfullscreen","true"),e.setAttribute("src",this.sanitize(t)),e}static formats(t){return B.reduce(((e,n)=>(t.hasAttribute(n)&&(e[n]=t.getAttribute(n)),e)),{})}static sanitize(t){return w.sanitize(t)}static value(t){return t.getAttribute("src")}format(t,e){B.indexOf(t)>-1?e?this.domNode.setAttribute(t,e):this.domNode.removeAttribute(t):super.format(t,e)}html(){const{video:t}=this.value();return`<a href="${t}">${t}</a>`}}var U=M,D=n(9404),P=n(5232),z=n.n(P),F=n(4266),H=n(3036),$=n(4541),V=n(5508),K=n(584);const W=new s.ClassAttributor("code-token","hljs",{scope:s.Scope.INLINE});class Z extends x.A{static formats(t,e){for(;null!=t&&t!==e.domNode;){if(t.classList&&t.classList.contains(D.Ay.className))return super.formats(t,e);t=t.parentNode}}constructor(t,e,n){super(t,e,n),W.add(this.domNode,n)}format(t,e){t!==Z.blotName?super.format(t,e):e?W.add(this.domNode,e):(W.remove(this.domNode),this.domNode.classList.remove(this.statics.className))}optimize(){super.optimize(...arguments),W.value(this.domNode)||this.unwrap()}}Z.blotName="code-token",Z.className="ql-token";class G extends D.Ay{static create(t){const e=super.create(t);return"string"==typeof t&&e.setAttribute("data-language",t),e}static formats(t){return t.getAttribute("data-language")||"plain"}static register(){}format(t,e){t===this.statics.blotName&&e?this.domNode.setAttribute("data-language",e):super.format(t,e)}replaceWith(t,e){return this.formatAt(0,this.length(),Z.blotName,!1),super.replaceWith(t,e)}}class X extends D.EJ{attach(){super.attach(),this.forceNext=!1,this.scroll.emitMount(this)}format(t,e){t===G.blotName&&(this.forceNext=!0,this.children.forEach((n=>{n.format(t,e)})))}formatAt(t,e,n,r){n===G.blotName&&(this.forceNext=!0),super.formatAt(t,e,n,r)}highlight(t){let e=arguments.length>1&&void 0!==arguments[1]&&arguments[1];if(null==this.children.head)return;const n=`${Array.from(this.domNode.childNodes).filter((t=>t!==this.uiNode)).map((t=>t.textContent)).join("\n")}\n`,r=G.formats(this.children.head.domNode);if(e||this.forceNext||this.cachedText!==n){if(n.trim().length>0||null==this.cachedText){const e=this.children.reduce(((t,e)=>t.concat((0,a.mG)(e,!1))),new(z())),i=t(n,r);e.diff(i).reduce(((t,e)=>{let{retain:n,attributes:r}=e;return n?(r&&Object.keys(r).forEach((e=>{[G.blotName,Z.blotName].includes(e)&&this.formatAt(t,n,e,r[e])})),t+n):t}),0)}this.cachedText=n,this.forceNext=!1}}html(t,e){const[n]=this.children.find(t);return`<pre data-language="${n?G.formats(n.domNode):"plain"}">\n${(0,V.X)(this.code(t,e))}\n</pre>`}optimize(t){if(super.optimize(t),null!=this.parent&&null!=this.children.head&&null!=this.uiNode){const t=G.formats(this.children.head.domNode);t!==this.uiNode.value&&(this.uiNode.value=t)}}}X.allowedChildren=[G],G.requiredContainer=X,G.allowedChildren=[Z,$.A,V.A,H.A];class Q extends F.A{static register(){p.Ay.register(Z,!0),p.Ay.register(G,!0),p.Ay.register(X,!0)}constructor(t,e){if(super(t,e),null==this.options.hljs)throw new Error("Syntax module requires highlight.js. Please include the library on the page before Quill.");this.languages=this.options.languages.reduce(((t,e)=>{let{key:n}=e;return t[n]=!0,t}),{}),this.highlightBlot=this.highlightBlot.bind(this),this.initListener(),this.initTimer()}initListener(){this.quill.on(p.Ay.events.SCROLL_BLOT_MOUNT,(t=>{if(!(t instanceof X))return;const e=this.quill.root.ownerDocument.createElement("select");this.options.languages.forEach((t=>{let{key:n,label:r}=t;const i=e.ownerDocument.createElement("option");i.textContent=r,i.setAttribute("value",n),e.appendChild(i)})),e.addEventListener("change",(()=>{t.format(G.blotName,e.value),this.quill.root.focus(),this.highlight(t,!0)})),null==t.uiNode&&(t.attachUI(e),t.children.head&&(e.value=G.formats(t.children.head.domNode)))}))}initTimer(){let t=null;this.quill.on(p.Ay.events.SCROLL_OPTIMIZE,(()=>{t&&clearTimeout(t),t=setTimeout((()=>{this.highlight(),t=null}),this.options.interval)}))}highlight(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,e=arguments.length>1&&void 0!==arguments[1]&&arguments[1];if(this.quill.selection.composing)return;this.quill.update(p.Ay.sources.USER);const n=this.quill.getSelection();(null==t?this.quill.scroll.descendants(X):[t]).forEach((t=>{t.highlight(this.highlightBlot,e)})),this.quill.update(p.Ay.sources.SILENT),null!=n&&this.quill.setSelection(n,p.Ay.sources.SILENT)}highlightBlot(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"plain";if(e=this.languages[e]?e:"plain","plain"===e)return(0,V.X)(t).split("\n").reduce(((t,n,r)=>(0!==r&&t.insert("\n",{[D.Ay.blotName]:e}),t.insert(n))),new(z()));const n=this.quill.root.ownerDocument.createElement("div");return n.classList.add(D.Ay.className),n.innerHTML=((t,e,n)=>{if("string"==typeof t.versionString){const r=t.versionString.split(".")[0];if(parseInt(r,10)>=11)return t.highlight(n,{language:e}).value}return t.highlight(e,n).value})(this.options.hljs,e,t),(0,K.hV)(this.quill.scroll,n,[(t,e)=>{const n=W.value(t);return n?e.compose((new(z())).retain(e.length(),{[Z.blotName]:n})):e}],[(t,n)=>t.data.split("\n").reduce(((t,n,r)=>(0!==r&&t.insert("\n",{[D.Ay.blotName]:e}),t.insert(n))),n)],new WeakMap)}}Q.DEFAULTS={hljs:window.hljs,interval:1e3,languages:[{key:"plain",label:"Plain"},{key:"bash",label:"Bash"},{key:"cpp",label:"C++"},{key:"cs",label:"C#"},{key:"css",label:"CSS"},{key:"diff",label:"Diff"},{key:"xml",label:"HTML/XML"},{key:"java",label:"Java"},{key:"javascript",label:"JavaScript"},{key:"markdown",label:"Markdown"},{key:"php",label:"PHP"},{key:"python",label:"Python"},{key:"ruby",label:"Ruby"},{key:"sql",label:"SQL"}]};class J extends a.Ay{static blotName="table";static tagName="TD";static create(t){const e=super.create();return t?e.setAttribute("data-row",t):e.setAttribute("data-row",nt()),e}static formats(t){if(t.hasAttribute("data-row"))return t.getAttribute("data-row")}cellOffset(){return this.parent?this.parent.children.indexOf(this):-1}format(t,e){t===J.blotName&&e?this.domNode.setAttribute("data-row",e):super.format(t,e)}row(){return this.parent}rowOffset(){return this.row()?this.row().rowOffset():-1}table(){return this.row()&&this.row().table()}}class Y extends f.A{static blotName="table-row";static tagName="TR";checkMerge(){if(super.checkMerge()&&null!=this.next.children.head){const t=this.children.head.formats(),e=this.children.tail.formats(),n=this.next.children.head.formats(),r=this.next.children.tail.formats();return t.table===e.table&&t.table===n.table&&t.table===r.table}return!1}optimize(t){super.optimize(t),this.children.forEach((t=>{if(null==t.next)return;const e=t.formats(),n=t.next.formats();if(e.table!==n.table){const e=this.splitAfter(t);e&&e.optimize(),this.prev&&this.prev.optimize()}}))}rowOffset(){return this.parent?this.parent.children.indexOf(this):-1}table(){return this.parent&&this.parent.parent}}class tt extends f.A{static blotName="table-body";static tagName="TBODY"}class et extends f.A{static blotName="table-container";static tagName="TABLE";balanceCells(){const t=this.descendants(Y),e=t.reduce(((t,e)=>Math.max(e.children.length,t)),0);t.forEach((t=>{new Array(e-t.children.length).fill(0).forEach((()=>{let e;null!=t.children.head&&(e=J.formats(t.children.head.domNode));const n=this.scroll.create(J.blotName,e);t.appendChild(n),n.optimize()}))}))}cells(t){return this.rows().map((e=>e.children.at(t)))}deleteColumn(t){const[e]=this.descendant(tt);null!=e&&null!=e.children.head&&e.children.forEach((e=>{const n=e.children.at(t);null!=n&&n.remove()}))}insertColumn(t){const[e]=this.descendant(tt);null!=e&&null!=e.children.head&&e.children.forEach((e=>{const n=e.children.at(t),r=J.formats(e.children.head.domNode),i=this.scroll.create(J.blotName,r);e.insertBefore(i,n)}))}insertRow(t){const[e]=this.descendant(tt);if(null==e||null==e.children.head)return;const n=nt(),r=this.scroll.create(Y.blotName);e.children.head.children.forEach((()=>{const t=this.scroll.create(J.blotName,n);r.appendChild(t)}));const i=e.children.at(t);e.insertBefore(r,i)}rows(){const t=this.children.head;return null==t?[]:t.children.map((t=>t))}}function nt(){return`row-${Math.random().toString(36).slice(2,6)}`}et.allowedChildren=[tt],tt.requiredContainer=et,tt.allowedChildren=[Y],Y.requiredContainer=tt,Y.allowedChildren=[J],J.requiredContainer=Y;class rt extends F.A{static register(){p.Ay.register(J),p.Ay.register(Y),p.Ay.register(tt),p.Ay.register(et)}constructor(){super(...arguments),this.listenBalanceCells()}balanceTables(){this.quill.scroll.descendants(et).forEach((t=>{t.balanceCells()}))}deleteColumn(){const[t,,e]=this.getTable();null!=e&&(t.deleteColumn(e.cellOffset()),this.quill.update(p.Ay.sources.USER))}deleteRow(){const[,t]=this.getTable();null!=t&&(t.remove(),this.quill.update(p.Ay.sources.USER))}deleteTable(){const[t]=this.getTable();if(null==t)return;const e=t.offset();t.remove(),this.quill.update(p.Ay.sources.USER),this.quill.setSelection(e,p.Ay.sources.SILENT)}getTable(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.quill.getSelection();if(null==t)return[null,null,null,-1];const[e,n]=this.quill.getLine(t.index);if(null==e||e.statics.blotName!==J.blotName)return[null,null,null,-1];const r=e.parent;return[r.parent.parent,r,e,n]}insertColumn(t){const e=this.quill.getSelection();if(!e)return;const[n,r,i]=this.getTable(e);if(null==i)return;const s=i.cellOffset();n.insertColumn(s+t),this.quill.update(p.Ay.sources.USER);let o=r.rowOffset();0===t&&(o+=1),this.quill.setSelection(e.index+o,e.length,p.Ay.sources.SILENT)}insertColumnLeft(){this.insertColumn(0)}insertColumnRight(){this.insertColumn(1)}insertRow(t){const e=this.quill.getSelection();if(!e)return;const[n,r,i]=this.getTable(e);if(null==i)return;const s=r.rowOffset();n.insertRow(s+t),this.quill.update(p.Ay.sources.USER),t>0?this.quill.setSelection(e,p.Ay.sources.SILENT):this.quill.setSelection(e.index+r.children.length,e.length,p.Ay.sources.SILENT)}insertRowAbove(){this.insertRow(0)}insertRowBelow(){this.insertRow(1)}insertTable(t,e){const n=this.quill.getSelection();if(null==n)return;const r=new Array(t).fill(0).reduce((t=>{const n=new Array(e).fill("\n").join("");return t.insert(n,{table:nt()})}),(new(z())).retain(n.index));this.quill.updateContents(r,p.Ay.sources.USER),this.quill.setSelection(n.index,p.Ay.sources.SILENT),this.balanceTables()}listenBalanceCells(){this.quill.on(p.Ay.events.SCROLL_OPTIMIZE,(t=>{t.some((t=>!!["TD","TR","TBODY","TABLE"].includes(t.target.tagName)&&(this.quill.once(p.Ay.events.TEXT_CHANGE,((t,e,n)=>{n===p.Ay.sources.USER&&this.balanceTables()})),!0)))}))}}var it=rt;const st=(0,n(6078).A)("quill:toolbar");class ot extends F.A{constructor(t,e){if(super(t,e),Array.isArray(this.options.container)){const e=document.createElement("div");e.setAttribute("role","toolbar"),function(t,e){Array.isArray(e[0])||(e=[e]),e.forEach((e=>{const n=document.createElement("span");n.classList.add("ql-formats"),e.forEach((t=>{if("string"==typeof t)lt(n,t);else{const e=Object.keys(t)[0],r=t[e];Array.isArray(r)?function(t,e,n){const r=document.createElement("select");r.classList.add(`ql-${e}`),n.forEach((t=>{const e=document.createElement("option");!1!==t?e.setAttribute("value",String(t)):e.setAttribute("selected","selected"),r.appendChild(e)})),t.appendChild(r)}(n,e,r):lt(n,e,r)}})),t.appendChild(n)}))}(e,this.options.container),t.container?.parentNode?.insertBefore(e,t.container),this.container=e}else"string"==typeof this.options.container?this.container=document.querySelector(this.options.container):this.container=this.options.container;this.container instanceof HTMLElement?(this.container.classList.add("ql-toolbar"),this.controls=[],this.handlers={},this.options.handlers&&Object.keys(this.options.handlers).forEach((t=>{const e=this.options.handlers?.[t];e&&this.addHandler(t,e)})),Array.from(this.container.querySelectorAll("button, select")).forEach((t=>{this.attach(t)})),this.quill.on(p.Ay.events.EDITOR_CHANGE,(()=>{const[t]=this.quill.selection.getRange();this.update(t)}))):st.error("Container required for toolbar",this.options)}addHandler(t,e){this.handlers[t]=e}attach(t){let e=Array.from(t.classList).find((t=>0===t.indexOf("ql-")));if(!e)return;if(e=e.slice(3),"BUTTON"===t.tagName&&t.setAttribute("type","button"),null==this.handlers[e]&&null==this.quill.scroll.query(e))return void st.warn("ignoring attaching to nonexistent format",e,t);const n="SELECT"===t.tagName?"change":"click";t.addEventListener(n,(n=>{let r;if("SELECT"===t.tagName){if(t.selectedIndex<0)return;const e=t.options[t.selectedIndex];r=!e.hasAttribute("selected")&&(e.value||!1)}else r=!t.classList.contains("ql-active")&&(t.value||!t.hasAttribute("value")),n.preventDefault();this.quill.focus();const[i]=this.quill.selection.getRange();if(null!=this.handlers[e])this.handlers[e].call(this,r);else if(this.quill.scroll.query(e).prototype instanceof s.EmbedBlot){if(r=prompt(`Enter ${e}`),!r)return;this.quill.updateContents((new(z())).retain(i.index).delete(i.length).insert({[e]:r}),p.Ay.sources.USER)}else this.quill.format(e,r,p.Ay.sources.USER);this.update(i)})),this.controls.push([e,t])}update(t){const e=null==t?{}:this.quill.getFormat(t);this.controls.forEach((n=>{const[r,i]=n;if("SELECT"===i.tagName){let n=null;if(null==t)n=null;else if(null==e[r])n=i.querySelector("option[selected]");else if(!Array.isArray(e[r])){let t=e[r];"string"==typeof t&&(t=t.replace(/"/g,'\\"')),n=i.querySelector(`option[value="${t}"]`)}null==n?(i.value="",i.selectedIndex=-1):n.selected=!0}else if(null==t)i.classList.remove("ql-active"),i.setAttribute("aria-pressed","false");else if(i.hasAttribute("value")){const t=e[r],n=t===i.getAttribute("value")||null!=t&&t.toString()===i.getAttribute("value")||null==t&&!i.getAttribute("value");i.classList.toggle("ql-active",n),i.setAttribute("aria-pressed",n.toString())}else{const t=null!=e[r];i.classList.toggle("ql-active",t),i.setAttribute("aria-pressed",t.toString())}}))}}function lt(t,e,n){const r=document.createElement("button");r.setAttribute("type","button"),r.classList.add(`ql-${e}`),r.setAttribute("aria-pressed","false"),null!=n?(r.value=n,r.setAttribute("aria-label",`${e}: ${n}`)):r.setAttribute("aria-label",e),t.appendChild(r)}ot.DEFAULTS={},ot.DEFAULTS={container:null,handlers:{clean(){const t=this.quill.getSelection();if(null!=t)if(0===t.length){const t=this.quill.getFormat();Object.keys(t).forEach((t=>{null!=this.quill.scroll.query(t,s.Scope.INLINE)&&this.quill.format(t,!1,p.Ay.sources.USER)}))}else this.quill.removeFormat(t.index,t.length,p.Ay.sources.USER)},direction(t){const{align:e}=this.quill.getFormat();"rtl"===t&&null==e?this.quill.format("align","right",p.Ay.sources.USER):t||"right"!==e||this.quill.format("align",!1,p.Ay.sources.USER),this.quill.format("direction",t,p.Ay.sources.USER)},indent(t){const e=this.quill.getSelection(),n=this.quill.getFormat(e),r=parseInt(n.indent||0,10);if("+1"===t||"-1"===t){let e="+1"===t?1:-1;"rtl"===n.direction&&(e*=-1),this.quill.format("indent",r+e,p.Ay.sources.USER)}},link(t){!0===t&&(t=prompt("Enter link URL:")),this.quill.format("link",t,p.Ay.sources.USER)},list(t){const e=this.quill.getSelection(),n=this.quill.getFormat(e);"check"===t?"checked"===n.list||"unchecked"===n.list?this.quill.format("list",!1,p.Ay.sources.USER):this.quill.format("list","unchecked",p.Ay.sources.USER):this.quill.format("list",t,p.Ay.sources.USER)}}};const at='<svg viewbox="0 0 18 18"><polyline class="ql-even ql-stroke" points="5 7 3 9 5 11"/><polyline class="ql-even ql-stroke" points="13 7 15 9 13 11"/><line class="ql-stroke" x1="10" x2="8" y1="5" y2="13"/></svg>';var ct={align:{"":'<svg viewbox="0 0 18 18"><line class="ql-stroke" x1="3" x2="15" y1="9" y2="9"/><line class="ql-stroke" x1="3" x2="13" y1="14" y2="14"/><line class="ql-stroke" x1="3" x2="9" y1="4" y2="4"/></svg>',center:'<svg viewbox="0 0 18 18"><line class="ql-stroke" x1="15" x2="3" y1="9" y2="9"/><line class="ql-stroke" x1="14" x2="4" y1="14" y2="14"/><line class="ql-stroke" x1="12" x2="6" y1="4" y2="4"/></svg>',right:'<svg viewbox="0 0 18 18"><line class="ql-stroke" x1="15" x2="3" y1="9" y2="9"/><line class="ql-stroke" x1="15" x2="5" y1="14" y2="14"/><line class="ql-stroke" x1="15" x2="9" y1="4" y2="4"/></svg>',justify:'<svg viewbox="0 0 18 18"><line class="ql-stroke" x1="15" x2="3" y1="9" y2="9"/><line class="ql-stroke" x1="15" x2="3" y1="14" y2="14"/><line class="ql-stroke" x1="15" x2="3" y1="4" y2="4"/></svg>'},background:'<svg viewbox="0 0 18 18"><g class="ql-fill ql-color-label"><polygon points="6 6.868 6 6 5 6 5 7 5.942 7 6 6.868"/><rect height="1" width="1" x="4" y="4"/><polygon points="6.817 5 6 5 6 6 6.38 6 6.817 5"/><rect height="1" width="1" x="2" y="6"/><rect height="1" width="1" x="3" y="5"/><rect height="1" width="1" x="4" y="7"/><polygon points="4 11.439 4 11 3 11 3 12 3.755 12 4 11.439"/><rect height="1" width="1" x="2" y="12"/><rect height="1" width="1" x="2" y="9"/><rect height="1" width="1" x="2" y="15"/><polygon points="4.63 10 4 10 4 11 4.192 11 4.63 10"/><rect height="1" width="1" x="3" y="8"/><path d="M10.832,4.2L11,4.582V4H10.708A1.948,1.948,0,0,1,10.832,4.2Z"/><path d="M7,4.582L7.168,4.2A1.929,1.929,0,0,1,7.292,4H7V4.582Z"/><path d="M8,13H7.683l-0.351.8a1.933,1.933,0,0,1-.124.2H8V13Z"/><rect height="1" width="1" x="12" y="2"/><rect height="1" width="1" x="11" y="3"/><path d="M9,3H8V3.282A1.985,1.985,0,0,1,9,3Z"/><rect height="1" width="1" x="2" y="3"/><rect height="1" width="1" x="6" y="2"/><rect height="1" width="1" x="3" y="2"/><rect height="1" width="1" x="5" y="3"/><rect height="1" width="1" x="9" y="2"/><rect height="1" width="1" x="15" y="14"/><polygon points="13.447 10.174 13.469 10.225 13.472 10.232 13.808 11 14 11 14 10 13.37 10 13.447 10.174"/><rect height="1" width="1" x="13" y="7"/><rect height="1" width="1" x="15" y="5"/><rect height="1" width="1" x="14" y="6"/><rect height="1" width="1" x="15" y="8"/><rect height="1" width="1" x="14" y="9"/><path d="M3.775,14H3v1H4V14.314A1.97,1.97,0,0,1,3.775,14Z"/><rect height="1" width="1" x="14" y="3"/><polygon points="12 6.868 12 6 11.62 6 12 6.868"/><rect height="1" width="1" x="15" y="2"/><rect height="1" width="1" x="12" y="5"/><rect height="1" width="1" x="13" y="4"/><polygon points="12.933 9 13 9 13 8 12.495 8 12.933 9"/><rect height="1" width="1" x="9" y="14"/><rect height="1" width="1" x="8" y="15"/><path d="M6,14.926V15H7V14.316A1.993,1.993,0,0,1,6,14.926Z"/><rect height="1" width="1" x="5" y="15"/><path d="M10.668,13.8L10.317,13H10v1h0.792A1.947,1.947,0,0,1,10.668,13.8Z"/><rect height="1" width="1" x="11" y="15"/><path d="M14.332,12.2a1.99,1.99,0,0,1,.166.8H15V12H14.245Z"/><rect height="1" width="1" x="14" y="15"/><rect height="1" width="1" x="15" y="11"/></g><polyline class="ql-stroke" points="5.5 13 9 5 12.5 13"/><line class="ql-stroke" x1="11.63" x2="6.38" y1="11" y2="11"/></svg>',blockquote:'<svg viewbox="0 0 18 18"><rect class="ql-fill ql-stroke" height="3" width="3" x="4" y="5"/><rect class="ql-fill ql-stroke" height="3" width="3" x="11" y="5"/><path class="ql-even ql-fill ql-stroke" d="M7,8c0,4.031-3,5-3,5"/><path class="ql-even ql-fill ql-stroke" d="M14,8c0,4.031-3,5-3,5"/></svg>',bold:'<svg viewbox="0 0 18 18"><path class="ql-stroke" d="M5,4H9.5A2.5,2.5,0,0,1,12,6.5v0A2.5,2.5,0,0,1,9.5,9H5A0,0,0,0,1,5,9V4A0,0,0,0,1,5,4Z"/><path class="ql-stroke" d="M5,9h5.5A2.5,2.5,0,0,1,13,11.5v0A2.5,2.5,0,0,1,10.5,14H5a0,0,0,0,1,0,0V9A0,0,0,0,1,5,9Z"/></svg>',clean:'<svg class="" viewbox="0 0 18 18"><line class="ql-stroke" x1="5" x2="13" y1="3" y2="3"/><line class="ql-stroke" x1="6" x2="9.35" y1="12" y2="3"/><line class="ql-stroke" x1="11" x2="15" y1="11" y2="15"/><line class="ql-stroke" x1="15" x2="11" y1="11" y2="15"/><rect class="ql-fill" height="1" rx="0.5" ry="0.5" width="7" x="2" y="14"/></svg>',code:at,"code-block":at,color:'<svg viewbox="0 0 18 18"><line class="ql-color-label ql-stroke ql-transparent" x1="3" x2="15" y1="15" y2="15"/><polyline class="ql-stroke" points="5.5 11 9 3 12.5 11"/><line class="ql-stroke" x1="11.63" x2="6.38" y1="9" y2="9"/></svg>',direction:{"":'<svg viewbox="0 0 18 18"><polygon class="ql-stroke ql-fill" points="3 11 5 9 3 7 3 11"/><line class="ql-stroke ql-fill" x1="15" x2="11" y1="4" y2="4"/><path class="ql-fill" d="M11,3a3,3,0,0,0,0,6h1V3H11Z"/><rect class="ql-fill" height="11" width="1" x="11" y="4"/><rect class="ql-fill" height="11" width="1" x="13" y="4"/></svg>',rtl:'<svg viewbox="0 0 18 18"><polygon class="ql-stroke ql-fill" points="15 12 13 10 15 8 15 12"/><line class="ql-stroke ql-fill" x1="9" x2="5" y1="4" y2="4"/><path class="ql-fill" d="M5,3A3,3,0,0,0,5,9H6V3H5Z"/><rect class="ql-fill" height="11" width="1" x="5" y="4"/><rect class="ql-fill" height="11" width="1" x="7" y="4"/></svg>'},formula:'<svg viewbox="0 0 18 18"><path class="ql-fill" d="M11.759,2.482a2.561,2.561,0,0,0-3.53.607A7.656,7.656,0,0,0,6.8,6.2C6.109,9.188,5.275,14.677,4.15,14.927a1.545,1.545,0,0,0-1.3-.933A0.922,0.922,0,0,0,2,15.036S1.954,16,4.119,16s3.091-2.691,3.7-5.553c0.177-.826.36-1.726,0.554-2.6L8.775,6.2c0.381-1.421.807-2.521,1.306-2.676a1.014,1.014,0,0,0,1.02.56A0.966,0.966,0,0,0,11.759,2.482Z"/><rect class="ql-fill" height="1.6" rx="0.8" ry="0.8" width="5" x="5.15" y="6.2"/><path class="ql-fill" d="M13.663,12.027a1.662,1.662,0,0,1,.266-0.276q0.193,0.069.456,0.138a2.1,2.1,0,0,0,.535.069,1.075,1.075,0,0,0,.767-0.3,1.044,1.044,0,0,0,.314-0.8,0.84,0.84,0,0,0-.238-0.619,0.8,0.8,0,0,0-.594-0.239,1.154,1.154,0,0,0-.781.3,4.607,4.607,0,0,0-.781,1q-0.091.15-.218,0.346l-0.246.38c-0.068-.288-0.137-0.582-0.212-0.885-0.459-1.847-2.494-.984-2.941-0.8-0.482.2-.353,0.647-0.094,0.529a0.869,0.869,0,0,1,1.281.585c0.217,0.751.377,1.436,0.527,2.038a5.688,5.688,0,0,1-.362.467,2.69,2.69,0,0,1-.264.271q-0.221-.08-0.471-0.147a2.029,2.029,0,0,0-.522-0.066,1.079,1.079,0,0,0-.768.3A1.058,1.058,0,0,0,9,15.131a0.82,0.82,0,0,0,.832.852,1.134,1.134,0,0,0,.787-0.3,5.11,5.11,0,0,0,.776-0.993q0.141-.219.215-0.34c0.046-.076.122-0.194,0.223-0.346a2.786,2.786,0,0,0,.918,1.726,2.582,2.582,0,0,0,2.376-.185c0.317-.181.212-0.565,0-0.494A0.807,0.807,0,0,1,14.176,15a5.159,5.159,0,0,1-.913-2.446l0,0Q13.487,12.24,13.663,12.027Z"/></svg>',header:{1:'<svg viewBox="0 0 18 18"><path class="ql-fill" d="M10,4V14a1,1,0,0,1-2,0V10H3v4a1,1,0,0,1-2,0V4A1,1,0,0,1,3,4V8H8V4a1,1,0,0,1,2,0Zm6.06787,9.209H14.98975V7.59863a.54085.54085,0,0,0-.605-.60547h-.62744a1.01119,1.01119,0,0,0-.748.29688L11.645,8.56641a.5435.5435,0,0,0-.022.8584l.28613.30762a.53861.53861,0,0,0,.84717.0332l.09912-.08789a1.2137,1.2137,0,0,0,.2417-.35254h.02246s-.01123.30859-.01123.60547V13.209H12.041a.54085.54085,0,0,0-.605.60547v.43945a.54085.54085,0,0,0,.605.60547h4.02686a.54085.54085,0,0,0,.605-.60547v-.43945A.54085.54085,0,0,0,16.06787,13.209Z"/></svg>',2:'<svg viewBox="0 0 18 18"><path class="ql-fill" d="M16.73975,13.81445v.43945a.54085.54085,0,0,1-.605.60547H11.855a.58392.58392,0,0,1-.64893-.60547V14.0127c0-2.90527,3.39941-3.42187,3.39941-4.55469a.77675.77675,0,0,0-.84717-.78125,1.17684,1.17684,0,0,0-.83594.38477c-.2749.26367-.561.374-.85791.13184l-.4292-.34082c-.30811-.24219-.38525-.51758-.1543-.81445a2.97155,2.97155,0,0,1,2.45361-1.17676,2.45393,2.45393,0,0,1,2.68408,2.40918c0,2.45312-3.1792,2.92676-3.27832,3.93848h2.79443A.54085.54085,0,0,1,16.73975,13.81445ZM9,3A.99974.99974,0,0,0,8,4V8H3V4A1,1,0,0,0,1,4V14a1,1,0,0,0,2,0V10H8v4a1,1,0,0,0,2,0V4A.99974.99974,0,0,0,9,3Z"/></svg>',3:'<svg viewBox="0 0 18 18"><path class="ql-fill" d="M16.65186,12.30664a2.6742,2.6742,0,0,1-2.915,2.68457,3.96592,3.96592,0,0,1-2.25537-.6709.56007.56007,0,0,1-.13232-.83594L11.64648,13c.209-.34082.48389-.36328.82471-.1543a2.32654,2.32654,0,0,0,1.12256.33008c.71484,0,1.12207-.35156,1.12207-.78125,0-.61523-.61621-.86816-1.46338-.86816H13.2085a.65159.65159,0,0,1-.68213-.41895l-.05518-.10937a.67114.67114,0,0,1,.14307-.78125l.71533-.86914a8.55289,8.55289,0,0,1,.68213-.7373V8.58887a3.93913,3.93913,0,0,1-.748.05469H11.9873a.54085.54085,0,0,1-.605-.60547V7.59863a.54085.54085,0,0,1,.605-.60547h3.75146a.53773.53773,0,0,1,.60547.59375v.17676a1.03723,1.03723,0,0,1-.27539.748L14.74854,10.0293A2.31132,2.31132,0,0,1,16.65186,12.30664ZM9,3A.99974.99974,0,0,0,8,4V8H3V4A1,1,0,0,0,1,4V14a1,1,0,0,0,2,0V10H8v4a1,1,0,0,0,2,0V4A.99974.99974,0,0,0,9,3Z"/></svg>',4:'<svg viewBox="0 0 18 18"><path class="ql-fill" d="M10,4V14a1,1,0,0,1-2,0V10H3v4a1,1,0,0,1-2,0V4A1,1,0,0,1,3,4V8H8V4a1,1,0,0,1,2,0Zm7.05371,7.96582v.38477c0,.39648-.165.60547-.46191.60547h-.47314v1.29785a.54085.54085,0,0,1-.605.60547h-.69336a.54085.54085,0,0,1-.605-.60547V12.95605H11.333a.5412.5412,0,0,1-.60547-.60547v-.15332a1.199,1.199,0,0,1,.22021-.748l2.56348-4.05957a.7819.7819,0,0,1,.72607-.39648h1.27637a.54085.54085,0,0,1,.605.60547v3.7627h.33008A.54055.54055,0,0,1,17.05371,11.96582ZM14.28125,8.7207h-.022a4.18969,4.18969,0,0,1-.38525.81348l-1.188,1.80469v.02246h1.5293V9.60059A7.04058,7.04058,0,0,1,14.28125,8.7207Z"/></svg>',5:'<svg viewBox="0 0 18 18"><path class="ql-fill" d="M16.74023,12.18555a2.75131,2.75131,0,0,1-2.91553,2.80566,3.908,3.908,0,0,1-2.25537-.68164.54809.54809,0,0,1-.13184-.8252L11.73438,13c.209-.34082.48389-.36328.8252-.1543a2.23757,2.23757,0,0,0,1.1001.33008,1.01827,1.01827,0,0,0,1.1001-.96777c0-.61621-.53906-.97949-1.25439-.97949a2.15554,2.15554,0,0,0-.64893.09961,1.15209,1.15209,0,0,1-.814.01074l-.12109-.04395a.64116.64116,0,0,1-.45117-.71484l.231-3.00391a.56666.56666,0,0,1,.62744-.583H15.541a.54085.54085,0,0,1,.605.60547v.43945a.54085.54085,0,0,1-.605.60547H13.41748l-.04395.72559a1.29306,1.29306,0,0,1-.04395.30859h.022a2.39776,2.39776,0,0,1,.57227-.07715A2.53266,2.53266,0,0,1,16.74023,12.18555ZM9,3A.99974.99974,0,0,0,8,4V8H3V4A1,1,0,0,0,1,4V14a1,1,0,0,0,2,0V10H8v4a1,1,0,0,0,2,0V4A.99974.99974,0,0,0,9,3Z"/></svg>',6:'<svg viewBox="0 0 18 18"><path class="ql-fill" d="M14.51758,9.64453a1.85627,1.85627,0,0,0-1.24316.38477H13.252a1.73532,1.73532,0,0,1,1.72754-1.4082,2.66491,2.66491,0,0,1,.5498.06641c.35254.05469.57227.01074.70508-.40723l.16406-.5166a.53393.53393,0,0,0-.373-.75977,4.83723,4.83723,0,0,0-1.17773-.14258c-2.43164,0-3.7627,2.17773-3.7627,4.43359,0,2.47559,1.60645,3.69629,3.19043,3.69629A2.70585,2.70585,0,0,0,16.96,12.19727,2.43861,2.43861,0,0,0,14.51758,9.64453Zm-.23047,3.58691c-.67187,0-1.22168-.81445-1.22168-1.45215,0-.47363.30762-.583.72559-.583.96875,0,1.27734.59375,1.27734,1.12207A.82182.82182,0,0,1,14.28711,13.23145ZM10,4V14a1,1,0,0,1-2,0V10H3v4a1,1,0,0,1-2,0V4A1,1,0,0,1,3,4V8H8V4a1,1,0,0,1,2,0Z"/></svg>'},italic:'<svg viewbox="0 0 18 18"><line class="ql-stroke" x1="7" x2="13" y1="4" y2="4"/><line class="ql-stroke" x1="5" x2="11" y1="14" y2="14"/><line class="ql-stroke" x1="8" x2="10" y1="14" y2="4"/></svg>',image:'<svg viewbox="0 0 18 18"><rect class="ql-stroke" height="10" width="12" x="3" y="4"/><circle class="ql-fill" cx="6" cy="7" r="1"/><polyline class="ql-even ql-fill" points="5 12 5 11 7 9 8 10 11 7 13 9 13 12 5 12"/></svg>',indent:{"+1":'<svg viewbox="0 0 18 18"><line class="ql-stroke" x1="3" x2="15" y1="14" y2="14"/><line class="ql-stroke" x1="3" x2="15" y1="4" y2="4"/><line class="ql-stroke" x1="9" x2="15" y1="9" y2="9"/><polyline class="ql-fill ql-stroke" points="3 7 3 11 5 9 3 7"/></svg>',"-1":'<svg viewbox="0 0 18 18"><line class="ql-stroke" x1="3" x2="15" y1="14" y2="14"/><line class="ql-stroke" x1="3" x2="15" y1="4" y2="4"/><line class="ql-stroke" x1="9" x2="15" y1="9" y2="9"/><polyline class="ql-stroke" points="5 7 5 11 3 9 5 7"/></svg>'},link:'<svg viewbox="0 0 18 18"><line class="ql-stroke" x1="7" x2="11" y1="7" y2="11"/><path class="ql-even ql-stroke" d="M8.9,4.577a3.476,3.476,0,0,1,.36,4.679A3.476,3.476,0,0,1,4.577,8.9C3.185,7.5,2.035,6.4,4.217,4.217S7.5,3.185,8.9,4.577Z"/><path class="ql-even ql-stroke" d="M13.423,9.1a3.476,3.476,0,0,0-4.679-.36,3.476,3.476,0,0,0,.36,4.679c1.392,1.392,2.5,2.542,4.679.36S14.815,10.5,13.423,9.1Z"/></svg>',list:{bullet:'<svg viewbox="0 0 18 18"><line class="ql-stroke" x1="6" x2="15" y1="4" y2="4"/><line class="ql-stroke" x1="6" x2="15" y1="9" y2="9"/><line class="ql-stroke" x1="6" x2="15" y1="14" y2="14"/><line class="ql-stroke" x1="3" x2="3" y1="4" y2="4"/><line class="ql-stroke" x1="3" x2="3" y1="9" y2="9"/><line class="ql-stroke" x1="3" x2="3" y1="14" y2="14"/></svg>',check:'<svg class="" viewbox="0 0 18 18"><line class="ql-stroke" x1="9" x2="15" y1="4" y2="4"/><polyline class="ql-stroke" points="3 4 4 5 6 3"/><line class="ql-stroke" x1="9" x2="15" y1="14" y2="14"/><polyline class="ql-stroke" points="3 14 4 15 6 13"/><line class="ql-stroke" x1="9" x2="15" y1="9" y2="9"/><polyline class="ql-stroke" points="3 9 4 10 6 8"/></svg>',ordered:'<svg viewbox="0 0 18 18"><line class="ql-stroke" x1="7" x2="15" y1="4" y2="4"/><line class="ql-stroke" x1="7" x2="15" y1="9" y2="9"/><line class="ql-stroke" x1="7" x2="15" y1="14" y2="14"/><line class="ql-stroke ql-thin" x1="2.5" x2="4.5" y1="5.5" y2="5.5"/><path class="ql-fill" d="M3.5,6A0.5,0.5,0,0,1,3,5.5V3.085l-0.276.138A0.5,0.5,0,0,1,2.053,3c-0.124-.247-0.023-0.324.224-0.447l1-.5A0.5,0.5,0,0,1,4,2.5v3A0.5,0.5,0,0,1,3.5,6Z"/><path class="ql-stroke ql-thin" d="M4.5,10.5h-2c0-.234,1.85-1.076,1.85-2.234A0.959,0.959,0,0,0,2.5,8.156"/><path class="ql-stroke ql-thin" d="M2.5,14.846a0.959,0.959,0,0,0,1.85-.109A0.7,0.7,0,0,0,3.75,14a0.688,0.688,0,0,0,.6-0.736,0.959,0.959,0,0,0-1.85-.109"/></svg>'},script:{sub:'<svg viewbox="0 0 18 18"><path class="ql-fill" d="M15.5,15H13.861a3.858,3.858,0,0,0,1.914-2.975,1.8,1.8,0,0,0-1.6-1.751A1.921,1.921,0,0,0,12.021,11.7a0.50013,0.50013,0,1,0,.957.291h0a0.914,0.914,0,0,1,1.053-.725,0.81,0.81,0,0,1,.744.762c0,1.076-1.16971,1.86982-1.93971,2.43082A1.45639,1.45639,0,0,0,12,15.5a0.5,0.5,0,0,0,.5.5h3A0.5,0.5,0,0,0,15.5,15Z"/><path class="ql-fill" d="M9.65,5.241a1,1,0,0,0-1.409.108L6,7.964,3.759,5.349A1,1,0,0,0,2.192,6.59178Q2.21541,6.6213,2.241,6.649L4.684,9.5,2.241,12.35A1,1,0,0,0,3.71,13.70722q0.02557-.02768.049-0.05722L6,11.036,8.241,13.65a1,1,0,1,0,1.567-1.24277Q9.78459,12.3777,9.759,12.35L7.316,9.5,9.759,6.651A1,1,0,0,0,9.65,5.241Z"/></svg>',super:'<svg viewbox="0 0 18 18"><path class="ql-fill" d="M15.5,7H13.861a4.015,4.015,0,0,0,1.914-2.975,1.8,1.8,0,0,0-1.6-1.751A1.922,1.922,0,0,0,12.021,3.7a0.5,0.5,0,1,0,.957.291,0.917,0.917,0,0,1,1.053-.725,0.81,0.81,0,0,1,.744.762c0,1.077-1.164,1.925-1.934,2.486A1.423,1.423,0,0,0,12,7.5a0.5,0.5,0,0,0,.5.5h3A0.5,0.5,0,0,0,15.5,7Z"/><path class="ql-fill" d="M9.651,5.241a1,1,0,0,0-1.41.108L6,7.964,3.759,5.349a1,1,0,1,0-1.519,1.3L4.683,9.5,2.241,12.35a1,1,0,1,0,1.519,1.3L6,11.036,8.241,13.65a1,1,0,0,0,1.519-1.3L7.317,9.5,9.759,6.651A1,1,0,0,0,9.651,5.241Z"/></svg>'},strike:'<svg viewbox="0 0 18 18"><line class="ql-stroke ql-thin" x1="15.5" x2="2.5" y1="8.5" y2="9.5"/><path class="ql-fill" d="M9.007,8C6.542,7.791,6,7.519,6,6.5,6,5.792,7.283,5,9,5c1.571,0,2.765.679,2.969,1.309a1,1,0,0,0,1.9-.617C13.356,4.106,11.354,3,9,3,6.2,3,4,4.538,4,6.5a3.2,3.2,0,0,0,.5,1.843Z"/><path class="ql-fill" d="M8.984,10C11.457,10.208,12,10.479,12,11.5c0,0.708-1.283,1.5-3,1.5-1.571,0-2.765-.679-2.969-1.309a1,1,0,1,0-1.9.617C4.644,13.894,6.646,15,9,15c2.8,0,5-1.538,5-3.5a3.2,3.2,0,0,0-.5-1.843Z"/></svg>',table:'<svg viewbox="0 0 18 18"><rect class="ql-stroke" height="12" width="12" x="3" y="3"/><rect class="ql-fill" height="2" width="3" x="5" y="5"/><rect class="ql-fill" height="2" width="4" x="9" y="5"/><g class="ql-fill ql-transparent"><rect height="2" width="3" x="5" y="8"/><rect height="2" width="4" x="9" y="8"/><rect height="2" width="3" x="5" y="11"/><rect height="2" width="4" x="9" y="11"/></g></svg>',underline:'<svg viewbox="0 0 18 18"><path class="ql-stroke" d="M5,3V9a4.012,4.012,0,0,0,4,4H9a4.012,4.012,0,0,0,4-4V3"/><rect class="ql-fill" height="1" rx="0.5" ry="0.5" width="12" x="3" y="15"/></svg>',video:'<svg viewbox="0 0 18 18"><rect class="ql-stroke" height="12" width="12" x="3" y="3"/><rect class="ql-fill" height="12" width="1" x="5" y="3"/><rect class="ql-fill" height="12" width="1" x="12" y="3"/><rect class="ql-fill" height="2" width="8" x="5" y="8"/><rect class="ql-fill" height="1" width="3" x="3" y="5"/><rect class="ql-fill" height="1" width="3" x="3" y="7"/><rect class="ql-fill" height="1" width="3" x="3" y="10"/><rect class="ql-fill" height="1" width="3" x="3" y="12"/><rect class="ql-fill" height="1" width="3" x="12" y="5"/><rect class="ql-fill" height="1" width="3" x="12" y="7"/><rect class="ql-fill" height="1" width="3" x="12" y="10"/><rect class="ql-fill" height="1" width="3" x="12" y="12"/></svg>'};let ut=0;function ht(t,e){t.setAttribute(e,`${!("true"===t.getAttribute(e))}`)}var dt=class{constructor(t){this.select=t,this.container=document.createElement("span"),this.buildPicker(),this.select.style.display="none",this.select.parentNode.insertBefore(this.container,this.select),this.label.addEventListener("mousedown",(()=>{this.togglePicker()})),this.label.addEventListener("keydown",(t=>{switch(t.key){case"Enter":this.togglePicker();break;case"Escape":this.escape(),t.preventDefault()}})),this.select.addEventListener("change",this.update.bind(this))}togglePicker(){this.container.classList.toggle("ql-expanded"),ht(this.label,"aria-expanded"),ht(this.options,"aria-hidden")}buildItem(t){const e=document.createElement("span");e.tabIndex="0",e.setAttribute("role","button"),e.classList.add("ql-picker-item");const n=t.getAttribute("value");return n&&e.setAttribute("data-value",n),t.textContent&&e.setAttribute("data-label",t.textContent),e.addEventListener("click",(()=>{this.selectItem(e,!0)})),e.addEventListener("keydown",(t=>{switch(t.key){case"Enter":this.selectItem(e,!0),t.preventDefault();break;case"Escape":this.escape(),t.preventDefault()}})),e}buildLabel(){const t=document.createElement("span");return t.classList.add("ql-picker-label"),t.innerHTML='<svg viewbox="0 0 18 18"><polygon class="ql-stroke" points="7 11 9 13 11 11 7 11"/><polygon class="ql-stroke" points="7 7 9 5 11 7 7 7"/></svg>',t.tabIndex="0",t.setAttribute("role","button"),t.setAttribute("aria-expanded","false"),this.container.appendChild(t),t}buildOptions(){const t=document.createElement("span");t.classList.add("ql-picker-options"),t.setAttribute("aria-hidden","true"),t.tabIndex="-1",t.id=`ql-picker-options-${ut}`,ut+=1,this.label.setAttribute("aria-controls",t.id),this.options=t,Array.from(this.select.options).forEach((e=>{const n=this.buildItem(e);t.appendChild(n),!0===e.selected&&this.selectItem(n)})),this.container.appendChild(t)}buildPicker(){Array.from(this.select.attributes).forEach((t=>{this.container.setAttribute(t.name,t.value)})),this.container.classList.add("ql-picker"),this.label=this.buildLabel(),this.buildOptions()}escape(){this.close(),setTimeout((()=>this.label.focus()),1)}close(){this.container.classList.remove("ql-expanded"),this.label.setAttribute("aria-expanded","false"),this.options.setAttribute("aria-hidden","true")}selectItem(t){let e=arguments.length>1&&void 0!==arguments[1]&&arguments[1];const n=this.container.querySelector(".ql-selected");t!==n&&(null!=n&&n.classList.remove("ql-selected"),null!=t&&(t.classList.add("ql-selected"),this.select.selectedIndex=Array.from(t.parentNode.children).indexOf(t),t.hasAttribute("data-value")?this.label.setAttribute("data-value",t.getAttribute("data-value")):this.label.removeAttribute("data-value"),t.hasAttribute("data-label")?this.label.setAttribute("data-label",t.getAttribute("data-label")):this.label.removeAttribute("data-label"),e&&(this.select.dispatchEvent(new Event("change")),this.close())))}update(){let t;if(this.select.selectedIndex>-1){const e=this.container.querySelector(".ql-picker-options").children[this.select.selectedIndex];t=this.select.options[this.select.selectedIndex],this.selectItem(e)}else this.selectItem(null);const e=null!=t&&t!==this.select.querySelector("option[selected]");this.label.classList.toggle("ql-active",e)}},ft=class extends dt{constructor(t,e){super(t),this.label.innerHTML=e,this.container.classList.add("ql-color-picker"),Array.from(this.container.querySelectorAll(".ql-picker-item")).slice(0,7).forEach((t=>{t.classList.add("ql-primary")}))}buildItem(t){const e=super.buildItem(t);return e.style.backgroundColor=t.getAttribute("value")||"",e}selectItem(t,e){super.selectItem(t,e);const n=this.label.querySelector(".ql-color-label"),r=t&&t.getAttribute("data-value")||"";n&&("line"===n.tagName?n.style.stroke=r:n.style.fill=r)}},pt=class extends dt{constructor(t,e){super(t),this.container.classList.add("ql-icon-picker"),Array.from(this.container.querySelectorAll(".ql-picker-item")).forEach((t=>{t.innerHTML=e[t.getAttribute("data-value")||""]})),this.defaultItem=this.container.querySelector(".ql-selected"),this.selectItem(this.defaultItem)}selectItem(t,e){super.selectItem(t,e);const n=t||this.defaultItem;if(null!=n){if(this.label.innerHTML===n.innerHTML)return;this.label.innerHTML=n.innerHTML}}},gt=class{constructor(t,e){this.quill=t,this.boundsContainer=e||document.body,this.root=t.addContainer("ql-tooltip"),this.root.innerHTML=this.constructor.TEMPLATE,(t=>{const{overflowY:e}=getComputedStyle(t,null);return"visible"!==e&&"clip"!==e})(this.quill.root)&&this.quill.root.addEventListener("scroll",(()=>{this.root.style.marginTop=-1*this.quill.root.scrollTop+"px"})),this.hide()}hide(){this.root.classList.add("ql-hidden")}position(t){const e=t.left+t.width/2-this.root.offsetWidth/2,n=t.bottom+this.quill.root.scrollTop;this.root.style.left=`${e}px`,this.root.style.top=`${n}px`,this.root.classList.remove("ql-flip");const r=this.boundsContainer.getBoundingClientRect(),i=this.root.getBoundingClientRect();let s=0;if(i.right>r.right&&(s=r.right-i.right,this.root.style.left=`${e+s}px`),i.left<r.left&&(s=r.left-i.left,this.root.style.left=`${e+s}px`),i.bottom>r.bottom){const e=i.bottom-i.top,r=t.bottom-t.top+e;this.root.style.top=n-r+"px",this.root.classList.add("ql-flip")}return s}show(){this.root.classList.remove("ql-editing"),this.root.classList.remove("ql-hidden")}},mt=n(8347),bt=n(5374),yt=n(9609);const vt=[!1,"center","right","justify"],At=["#000000","#e60000","#ff9900","#ffff00","#008a00","#0066cc","#9933ff","#ffffff","#facccc","#ffebcc","#ffffcc","#cce8cc","#cce0f5","#ebd6ff","#bbbbbb","#f06666","#ffc266","#ffff66","#66b966","#66a3e0","#c285ff","#888888","#a10000","#b26b00","#b2b200","#006100","#0047b2","#6b24b2","#444444","#5c0000","#663d00","#666600","#003700","#002966","#3d1466"],xt=[!1,"serif","monospace"],Nt=["1","2","3",!1],Et=["small",!1,"large","huge"];class wt extends yt.A{constructor(t,e){super(t,e);const n=e=>{document.body.contains(t.root)?(null==this.tooltip||this.tooltip.root.contains(e.target)||document.activeElement===this.tooltip.textbox||this.quill.hasFocus()||this.tooltip.hide(),null!=this.pickers&&this.pickers.forEach((t=>{t.container.contains(e.target)||t.close()}))):document.body.removeEventListener("click",n)};t.emitter.listenDOM("click",document.body,n)}addModule(t){const e=super.addModule(t);return"toolbar"===t&&this.extendToolbar(e),e}buildButtons(t,e){Array.from(t).forEach((t=>{(t.getAttribute("class")||"").split(/\s+/).forEach((n=>{if(n.startsWith("ql-")&&(n=n.slice(3),null!=e[n]))if("direction"===n)t.innerHTML=e[n][""]+e[n].rtl;else if("string"==typeof e[n])t.innerHTML=e[n];else{const r=t.value||"";null!=r&&e[n][r]&&(t.innerHTML=e[n][r])}}))}))}buildPickers(t,e){this.pickers=Array.from(t).map((t=>{if(t.classList.contains("ql-align")&&(null==t.querySelector("option")&&kt(t,vt),"object"==typeof e.align))return new pt(t,e.align);if(t.classList.contains("ql-background")||t.classList.contains("ql-color")){const n=t.classList.contains("ql-background")?"background":"color";return null==t.querySelector("option")&&kt(t,At,"background"===n?"#ffffff":"#000000"),new ft(t,e[n])}return null==t.querySelector("option")&&(t.classList.contains("ql-font")?kt(t,xt):t.classList.contains("ql-header")?kt(t,Nt):t.classList.contains("ql-size")&&kt(t,Et)),new dt(t)})),this.quill.on(bt.A.events.EDITOR_CHANGE,(()=>{this.pickers.forEach((t=>{t.update()}))}))}}wt.DEFAULTS=(0,mt.A)({},yt.A.DEFAULTS,{modules:{toolbar:{handlers:{formula(){this.quill.theme.tooltip.edit("formula")},image(){let t=this.container.querySelector("input.ql-image[type=file]");null==t&&(t=document.createElement("input"),t.setAttribute("type","file"),t.setAttribute("accept",this.quill.uploader.options.mimetypes.join(", ")),t.classList.add("ql-image"),t.addEventListener("change",(()=>{const e=this.quill.getSelection(!0);this.quill.uploader.upload(e,t.files),t.value=""})),this.container.appendChild(t)),t.click()},video(){this.quill.theme.tooltip.edit("video")}}}}});class qt extends gt{constructor(t,e){super(t,e),this.textbox=this.root.querySelector('input[type="text"]'),this.listen()}listen(){this.textbox.addEventListener("keydown",(t=>{"Enter"===t.key?(this.save(),t.preventDefault()):"Escape"===t.key&&(this.cancel(),t.preventDefault())}))}cancel(){this.hide(),this.restoreFocus()}edit(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"link",e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;if(this.root.classList.remove("ql-hidden"),this.root.classList.add("ql-editing"),null==this.textbox)return;null!=e?this.textbox.value=e:t!==this.root.getAttribute("data-mode")&&(this.textbox.value="");const n=this.quill.getBounds(this.quill.selection.savedRange);null!=n&&this.position(n),this.textbox.select(),this.textbox.setAttribute("placeholder",this.textbox.getAttribute(`data-${t}`)||""),this.root.setAttribute("data-mode",t)}restoreFocus(){this.quill.focus({preventScroll:!0})}save(){let{value:t}=this.textbox;switch(this.root.getAttribute("data-mode")){case"link":{const{scrollTop:e}=this.quill.root;this.linkRange?(this.quill.formatText(this.linkRange,"link",t,bt.A.sources.USER),delete this.linkRange):(this.restoreFocus(),this.quill.format("link",t,bt.A.sources.USER)),this.quill.root.scrollTop=e;break}case"video":t=function(t){let e=t.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtube\.com\/watch.*v=([a-zA-Z0-9_-]+)/)||t.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtu\.be\/([a-zA-Z0-9_-]+)/);return e?`${e[1]||"https"}://www.youtube.com/embed/${e[2]}?showinfo=0`:(e=t.match(/^(?:(https?):\/\/)?(?:www\.)?vimeo\.com\/(\d+)/))?`${e[1]||"https"}://player.vimeo.com/video/${e[2]}/`:t}(t);case"formula":{if(!t)break;const e=this.quill.getSelection(!0);if(null!=e){const n=e.index+e.length;this.quill.insertEmbed(n,this.root.getAttribute("data-mode"),t,bt.A.sources.USER),"formula"===this.root.getAttribute("data-mode")&&this.quill.insertText(n+1," ",bt.A.sources.USER),this.quill.setSelection(n+2,bt.A.sources.USER)}break}}this.textbox.value="",this.hide()}}function kt(t,e){let n=arguments.length>2&&void 0!==arguments[2]&&arguments[2];e.forEach((e=>{const r=document.createElement("option");e===n?r.setAttribute("selected","selected"):r.setAttribute("value",String(e)),t.appendChild(r)}))}var _t=n(8298);const Lt=[["bold","italic","link"],[{header:1},{header:2},"blockquote"]];class St extends qt{static TEMPLATE=['<span class="ql-tooltip-arrow"></span>','<div class="ql-tooltip-editor">','<input type="text" data-formula="e=mc^2" data-link="https://quilljs.com" data-video="Embed URL">','<a class="ql-close"></a>',"</div>"].join("");constructor(t,e){super(t,e),this.quill.on(bt.A.events.EDITOR_CHANGE,((t,e,n,r)=>{if(t===bt.A.events.SELECTION_CHANGE)if(null!=e&&e.length>0&&r===bt.A.sources.USER){this.show(),this.root.style.left="0px",this.root.style.width="",this.root.style.width=`${this.root.offsetWidth}px`;const t=this.quill.getLines(e.index,e.length);if(1===t.length){const t=this.quill.getBounds(e);null!=t&&this.position(t)}else{const n=t[t.length-1],r=this.quill.getIndex(n),i=Math.min(n.length()-1,e.index+e.length-r),s=this.quill.getBounds(new _t.Q(r,i));null!=s&&this.position(s)}}else document.activeElement!==this.textbox&&this.quill.hasFocus()&&this.hide()}))}listen(){super.listen(),this.root.querySelector(".ql-close").addEventListener("click",(()=>{this.root.classList.remove("ql-editing")})),this.quill.on(bt.A.events.SCROLL_OPTIMIZE,(()=>{setTimeout((()=>{if(this.root.classList.contains("ql-hidden"))return;const t=this.quill.getSelection();if(null!=t){const e=this.quill.getBounds(t);null!=e&&this.position(e)}}),1)}))}cancel(){this.show()}position(t){const e=super.position(t),n=this.root.querySelector(".ql-tooltip-arrow");return n.style.marginLeft="",0!==e&&(n.style.marginLeft=-1*e-n.offsetWidth/2+"px"),e}}class Ot extends wt{constructor(t,e){null!=e.modules.toolbar&&null==e.modules.toolbar.container&&(e.modules.toolbar.container=Lt),super(t,e),this.quill.container.classList.add("ql-bubble")}extendToolbar(t){this.tooltip=new St(this.quill,this.options.bounds),null!=t.container&&(this.tooltip.root.appendChild(t.container),this.buildButtons(t.container.querySelectorAll("button"),ct),this.buildPickers(t.container.querySelectorAll("select"),ct))}}Ot.DEFAULTS=(0,mt.A)({},wt.DEFAULTS,{modules:{toolbar:{handlers:{link(t){t?this.quill.theme.tooltip.edit():this.quill.format("link",!1,p.Ay.sources.USER)}}}}});const Tt=[[{header:["1","2","3",!1]}],["bold","italic","underline","link"],[{list:"ordered"},{list:"bullet"}],["clean"]];class jt extends qt{static TEMPLATE=['<a class="ql-preview" rel="noopener noreferrer" target="_blank" href="about:blank"></a>','<input type="text" data-formula="e=mc^2" data-link="https://quilljs.com" data-video="Embed URL">','<a class="ql-action"></a>','<a class="ql-remove"></a>'].join("");preview=this.root.querySelector("a.ql-preview");listen(){super.listen(),this.root.querySelector("a.ql-action").addEventListener("click",(t=>{this.root.classList.contains("ql-editing")?this.save():this.edit("link",this.preview.textContent),t.preventDefault()})),this.root.querySelector("a.ql-remove").addEventListener("click",(t=>{if(null!=this.linkRange){const t=this.linkRange;this.restoreFocus(),this.quill.formatText(t,"link",!1,bt.A.sources.USER),delete this.linkRange}t.preventDefault(),this.hide()})),this.quill.on(bt.A.events.SELECTION_CHANGE,((t,e,n)=>{if(null!=t){if(0===t.length&&n===bt.A.sources.USER){const[e,n]=this.quill.scroll.descendant(w,t.index);if(null!=e){this.linkRange=new _t.Q(t.index-n,e.length());const r=w.formats(e.domNode);this.preview.textContent=r,this.preview.setAttribute("href",r),this.show();const i=this.quill.getBounds(this.linkRange);return void(null!=i&&this.position(i))}}else delete this.linkRange;this.hide()}}))}show(){super.show(),this.root.removeAttribute("data-mode")}}class Ct extends wt{constructor(t,e){null!=e.modules.toolbar&&null==e.modules.toolbar.container&&(e.modules.toolbar.container=Tt),super(t,e),this.quill.container.classList.add("ql-snow")}extendToolbar(t){null!=t.container&&(t.container.classList.add("ql-snow"),this.buildButtons(t.container.querySelectorAll("button"),ct),this.buildPickers(t.container.querySelectorAll("select"),ct),this.tooltip=new jt(this.quill,this.options.bounds),t.container.querySelector(".ql-link")&&this.quill.keyboard.addBinding({key:"k",shortKey:!0},((e,n)=>{t.handlers.link.call(t,!n.format.link)})))}}Ct.DEFAULTS=(0,mt.A)({},wt.DEFAULTS,{modules:{toolbar:{handlers:{link(t){if(t){const t=this.quill.getSelection();if(null==t||0===t.length)return;let e=this.quill.getText(t);/^\S+@\S+\.\S+$/.test(e)&&0!==e.indexOf("mailto:")&&(e=`mailto:${e}`);const{tooltip:n}=this.quill.theme;n.edit("link",e)}else this.quill.format("link",!1,p.Ay.sources.USER)}}}}});var Rt=Ct;t.default.register({"attributors/attribute/direction":i.Mc,"attributors/class/align":e.qh,"attributors/class/background":b.l,"attributors/class/color":y.g3,"attributors/class/direction":i.sY,"attributors/class/font":v.q,"attributors/class/size":A.U,"attributors/style/align":e.Hu,"attributors/style/background":b.s,"attributors/style/color":y.JM,"attributors/style/direction":i.VL,"attributors/style/font":v.z,"attributors/style/size":A.r},!0),t.default.register({"formats/align":e.qh,"formats/direction":i.sY,"formats/indent":l,"formats/background":b.s,"formats/color":y.JM,"formats/font":v.q,"formats/size":A.U,"formats/blockquote":u,"formats/code-block":D.Ay,"formats/header":d,"formats/list":m,"formats/bold":E,"formats/code":D.Cy,"formats/italic":class extends E{static blotName="italic";static tagName=["EM","I"]},"formats/link":w,"formats/script":_,"formats/strike":class extends E{static blotName="strike";static tagName=["S","STRIKE"]},"formats/underline":S,"formats/formula":j,"formats/image":I,"formats/video":U,"modules/syntax":Q,"modules/table":it,"modules/toolbar":ot,"themes/bubble":Ot,"themes/snow":Rt,"ui/icons":ct,"ui/picker":dt,"ui/icon-picker":pt,"ui/color-picker":ft,"ui/tooltip":gt},!0);var It=t.default}(),r.default}()}));
//# sourceMappingURL=quill.js.map

