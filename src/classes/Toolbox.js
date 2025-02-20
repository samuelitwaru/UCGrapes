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

    this.themeManager = new ThemeManager(this);
    this.eventListenerManager = new EventListenerManager(this);
    this.popupManager = new PopupManager(this);
    this.pageManager = new PageManager(this);

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

    this.themeManager.loadTheme();
    this.themeManager.listThemesInSelectField();
    this.themeManager.colorPalette();
    this.themeManager.ctaColorPalette();
    this.pageManager.loadPageTemplates();

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

    this.eventListenerManager.setupTabListeners();
    this.eventListenerManager.setupMappingListeners();
    this.eventListenerManager.setupPublishListeners();
    this.eventListenerManager.setupAlignmentListeners();
    this.eventListenerManager.setupOpacityListener();
    this.eventListenerManager.setupAutoSave();

    const sidebarInputTitle = document.getElementById("tile-title");
    sidebarInputTitle.addEventListener("input", (e) => {
      this.updateTileTitle(e.target.value);
    });
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

  checkIfNotAuthenticated(res) {
    if (res.error.Status === "Error") {
      
      this.displayAlertMessage(
        this.currentLanguage.getTranslation("not_authenticated_message"),
        "error"
      );

      return true;
    }
  }
}








