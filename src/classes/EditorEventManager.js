class EditorEventManager {
  constructor(editorManager, templateManager) {
    this.editorManager = editorManager;
    this.templateManager = templateManager;
  }

  addEditorEventListeners(editor) {
    this.editorOnLoad(editor);
    this.editorOnDropped(editor);
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
    wrapper.view.el.addEventListener("click", (e) =>
      this.handleEditorClick(e, editor)
    );
    wrapper.view.el.addEventListener("contextmenu", (e) =>
      this.rightClickEventHandler(editor, e)
    );
  }

  loadTheme() {
    this.editorManager.dataManager.getLocationTheme().then((theme) => {
      this.editorManager.toolsSection.themeManager.setTheme(
        theme.SDT_LocationTheme.ThemeName
      );
    });
  }

  handleEditorClick(e, editor) {
    document.querySelector(".cta-button-layout-container").style.display =
      "none";
    const editorId = editor.getConfig().container;
    const editorContainerId = `${editorId}-frame`;

    this.editorManager.setCurrentEditor(editorId);
    this.editorManager.currentPageId = $(editorContainerId).data().pageid;

    this.updateToolsSection();
    this.editorManager.toolsSection.unDoReDo(editor);

    document.querySelector(".cta-button-layout-container").style.display =
      "none";

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

    this.hideContextMenu();
  }

  handleTileActionClick(e, editorContainerId) {
    const pageId = e.target.attributes["tile-action-object-id"].value;
    const page = this.editorManager.getPage(pageId);

    if (page) {
      $(editorContainerId).nextAll().remove();
      this.editorManager.createChildEditor(page);
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
  }

  editorOnDropped(editor) {
    // // let isDragging = false;

    // // editor.on("component:drag:start", (component) => {
    // //   isDragging = true;
    // // });

    // // editor.on("component:drag:end", (component) => {
    // //   const tileComponents = component.target.find(".template-blocks");

    // //   if (tileComponents.length) {
    // //     console.log("Tile Components", tileComponents);
    // //   }
    // //   isDragging = false;
    // //   editor.on("component:mount", (model) => {
    // //     // Only handle components added via drag
    // //     if (isDragging) {
    // //       console.log(model.getName());
    // //         if(model.getName() == "Tile-wrapper"){
    // //           console.log("Tile-wrapper added", model.getClasses());
    // //           model.removeClass("gjs-selected");
    // //         }
    // //     }
    // //   });
    // // });
    // editor.on("component:drag:start", (component) => {
    //   const el = component.parent.getEl();
    //   if (el) {
    //     el.style.cursor = "grab";
    //   }
    // });
  }

  handleComponentSelected(component) {
    this.editorManager.selectedTemplateWrapper = component.getEl();
    this.editorManager.selectedComponent = component;

    const sidebarInputTitle = document.getElementById("tile-title");
    if (this.editorManager.selectedTemplateWrapper) {
      const tileLabel =
        this.editorManager.selectedTemplateWrapper.querySelector(".tile-title");
      if (tileLabel) {
        sidebarInputTitle.value = tileLabel.textContent;
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

    this.editorManager.toolsSection.ui.updateTileProperties(
      this.editorManager.currentEditor.editor,
      this.editorManager.currentPageId
    );

    const page = this.editorManager.getPage(this.editorManager.currentPageId);
    if (page?.PageIsContentPage) {
      this.editorManager.toolsSection.ui.activateCtaBtnStyles(
        this.editorManager.selectedComponent
      );
    }

    this.hideContextMenu();
    this.updateUIState();
  }

  rightClickEventHandler(editor, e) {
    document.querySelectorAll("iframe").forEach((iframe) => {
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;

      const contextMenu = document.getElementById("contextMenu");
      if (!contextMenu) return;

      iframeDoc.addEventListener("contextmenu", (event) => {
        this.showContextMenu(event, iframe, contextMenu, editor);
      });

      iframeDoc.addEventListener("click", () => this.hideContextMenu());
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") this.hideContextMenu();
      });
    });
  }

  showContextMenu(event, iframe, contextMenu, editor) {
    const block = event.target.closest(".template-block");
    if (!block) return;

    event.preventDefault();

    console.log("hasImage", block.style);

    const iframeRect = iframe.getBoundingClientRect();
    contextMenu.style.position = "fixed";
    contextMenu.style.left = `${event.clientX + iframeRect.left}px`;
    contextMenu.style.top = `${event.clientY + iframeRect.top}px`;
    contextMenu.style.display = "block";

    window.currentBlock = block;

    const deleteImageButton = document.getElementById("delete-bg-image");
    if (deleteImageButton) {
      deleteImageButton.addEventListener("click", () =>
        this.deleteBackgroundImage(editor)
      );
    }
  }

  hideContextMenu() {
    const contextMenu = document.getElementById("contextMenu");
    if (contextMenu) {
      contextMenu.style.display = "none";
      window.currentBlock = null;
    }
  }

  deleteBackgroundImage(editor) {
    const blockToDelete = window.currentBlock;
    if (!blockToDelete) return;

    editor.select(null);
    const component = editor.getWrapper().find(`#${blockToDelete.id}`)[0];
    if (component) {
      editor.select(component);
      this.selectedComponent = component;
      const currentStyles = component.getStyle() || {};
      delete currentStyles["background-image"];
      component.setStyle(currentStyles);
    }

    this.hideContextMenu();
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

    leftNavigator.style.display = "block";
    rightNavigator.style.display = "block";

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
      prevButton.style.display = scrollLeft > 0 ? "block" : "none";
      nextButton.style.display =
        scrollLeft + clientWidth < scrollWidth ? "block" : "none";
    };

    updateButtonVisibility();
    scrollContainer.addEventListener("scroll", updateButtonVisibility);

    return { updateButtonVisibility, scrollBy };
  }
}
