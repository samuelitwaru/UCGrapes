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
