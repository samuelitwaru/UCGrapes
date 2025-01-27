class ToolBoxManager {
  constructor(
    editorManager,
    dataManager,
    themes,
    icons,
    templates,
    mapping,
    media,
    locale
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
  }

  async init(language) {
    try {
      this.currentLanguage = await new Locale(language).init();
      this.themeManager = new ThemeManager(this);
      this.eventListenerManager = new EventListenerManager(this);
      this.popupManager = new PopupManager(this);
      this.pageManager = new PageManager(this);
      console.log("ToolboxManager initialized", this.currentLanguage);

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
    this.themeManager.listThemesInSelectField();
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
      this.ui.updateTileTitle(e.target.value);
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
    return this.dataManager.pages.SDT_PageCollection.map(page=>{
      let projectData;
      try {
        projectData = JSON.parse(page.PageGJSJson)
      } catch (error) {
        projectData = {}
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
    })
    return editors
      .map((editorData) => {
        const pageId = editorData.pageId;
        const editor = editorData.editor;
        const page = this.dataManager.pages.SDT_PageCollection.find(
          (page) => page.PageId == pageId
        );

        if (!pageId) return null;

        const projectData = editor.getProjectData();
        const htmlData = editor.getHtml();
        const pageName = page.PageName;
        const jsonData = page.PageIsContentPage
          ? mapContentToPageData(projectData, page)
          : mapTemplateToPageData(projectData, page);

        return {
          PageId: pageId,
          PageName: pageName,
          PageJsonContent: JSON.stringify(jsonData),
          PageGJSHtml: htmlData,
          PageGJSJson: JSON.stringify(projectData),
          SDT_Page: jsonData,
          PageIsPublished: true,
        };
      })
      .filter(Boolean);
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

    // undoButton.addEventListener("click", (e) => {
    //   e.preventDefault();
    //   if (editorInstance === this.editorManager.currentEditor.editor && um.hasUndo()) {
    //     um.undo();
    //   }
    // });

    // redoButton.addEventListener("click", (e) => {
    //   e.preventDefault();
    //   if (editorInstance === this.editorManager.currentEditor.editor && um.hasRedo()) {
    //     um.redo();
    //   }
    // });
  }

  checkIfNotAuthenticated(res) {
    if (res.error.Status === "Error") {
      console.error(
        "Error updating theme. Status:",
        res.error.Status,
        "Message:",
        res.error.Message
      );

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
}

