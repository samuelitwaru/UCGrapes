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
        //this.loadPageTree();
        this.createPageTree('34f798f2-7b6c-4a8f-bdea-d14273b5a678', "tree-container");
    }

    getPage(pageId) {
        return this.dataManager.pages.SDT_PageCollection.find((page) => page.PageId == pageId);
    }

    createPageTree(rootPageId, childDivId){
        let homePage = this.getPage(rootPageId)
        let homePageJSON = JSON.parse(homePage.PageGJSJson)
        const pages = homePageJSON.pages;
        const containerRows =
            pages[0].frames[0].component.components[0].components[0].components;

        let childPages = []

        containerRows.forEach(containerRow => {
            let templateWrappers = containerRow.components
            if(templateWrappers) {
                templateWrappers.forEach(templateWrapper => {
                    let templateBlocks = templateWrapper.components
                    templateBlocks.forEach(templateBlock => {
                        if (templateBlock.classes.includes("template-block")) {
                            let pageId = templateBlock.attributes["tile-action-object-id"]
                            let page = this.getPage(pageId)
                            if (page) {
                                childPages.push({Id: pageId, Name:page.PageName})
                            }
                        }
                    })
                })
            }
        })
        const newTree = this.createTree(childPages, true);
        this.treeContainer = document.getElementById(childDivId)
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
  
    async loadPageTree() {
        if (this.isLoading) return;
  
        try {
            this.isLoading = true;
            this.dataManager.getPagesService().then((res) => {
                if (this.toolBoxManager.checkIfNotAuthenticated(res)) {
                    return;
                }
  
                const newTree = this.createTree(res.SDT_PageStructureCollection, true);
                this.clearMappings();
                this.treeContainer.appendChild(newTree);
            });
        } catch (error) {
            this.displayMessage("Error loading pages", "error");
        } finally {
            this.isLoading = false;
        }
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
            await this.dataManager.createNewPage(pageTitle, this.toolBoxManager.currentTheme).then((res) => {
                if (this.toolBoxManager.checkIfNotAuthenticated(res)) {
                    return;
                }
  
                pageInput.value = "";
  
                this.clearMappings();
  
                this.dataManager.getPagesService().then((res) => {
  
                    let treePages = res.SDT_PageStructureCollection.map((page) => {
                        return {
                            Id: page.Id,
                            Name: page.Name
                        };
                    });
  
                    const newTree = this.createTree(treePages, true);
                    this.treeContainer.appendChild(newTree);
                    this.toolBoxManager.actionList.init();
                });
            });
  
        } catch (error) {
            this.displayMessage(`${this.currentLanguage.getTranslation("error_creating_page")}`, "error");
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
  
    createTree(data) {
        const buildListItem = (item) => {
            const listItem = document.createElement("li");
            listItem.classList.add("tb-custom-list-item");
            const childDiv = document.createElement("div")
            childDiv.classList.add("child-div")
            childDiv.id = `child-div-${item.Id}`
            childDiv.style.position = 'relative'
            childDiv.style.paddingLeft = '20px'

  
            const menuItem = document.createElement("div");
            menuItem.classList.add("tb-custom-menu-item");
  
            const toggle = document.createElement("span");
            toggle.classList.add("tb-dropdown-toggle");
            toggle.setAttribute("role", "button");
            toggle.setAttribute("aria-expanded", "false");
            toggle.innerHTML = `<i class="fa fa-caret-right tree-icon"></i><span>${item.Name}</span>`;
  
            const deleteIcon = document.createElement("i");
            deleteIcon.classList.add("fa-regular", "fa-trash-can", "tb-delete-icon");
            deleteIcon.setAttribute("data-id", item.Id);
  
            deleteIcon.addEventListener("click", (event) =>
                handleDelete(event, item.Id, listItem)
            );
  
            menuItem.appendChild(toggle);
            if (item.Name !== "Home") {
                menuItem.appendChild(deleteIcon);
            }
            listItem.appendChild(menuItem);
            listItem.appendChild(childDiv)
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
  
            listItem.addEventListener("click", (e) => {
                e.stopPropagation();
                this.handlePageSelection(item);
                this.createPageTree(item.Id, `child-div-${item.Id}`)
                return
                // Close all dropdowns if this item has no children
                if (!item.Children) {
                    document
                        .querySelectorAll(".tb-dropdown.active")
                        .forEach((dropdown) => {
                            dropdown.classList.remove("active");
                            dropdown
                                .querySelector(".tb-dropdown-toggle")
                                .setAttribute("aria-expanded", "false");
                            dropdown
                                .querySelector(".tb-custom-menu-item")
                                .classList.remove("active-tree-item");
                        });
                }
            });
  
            return listItem;
        };
  
        const buildDropdownItem = (child, parent) => {
            const dropdownItem = document.createElement("li");
            dropdownItem.classList.add("tb-dropdown-item");
            dropdownItem.innerHTML = `<span><i style="margin-right: 10px;" class="fa-regular fa-file tree-icon"></i>${child.Name}</span><i data-id="${child.Id}" class="fa-regular fa-trash-can tb-delete-icon"></i>`;
  
            const childDeleteIcon = dropdownItem.querySelector(".tb-delete-icon");
            childDeleteIcon.addEventListener("click", (event) =>
                handleDelete(event, child.Id, dropdownItem)
            );
  
            dropdownItem.addEventListener("click", (e) => {
                e.stopPropagation();
                this.handlePageSelection(child, true, parent);
            });
  
            return dropdownItem;
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
                if (this.dataManager.deletePage(id)) {
                    elementToRemove.remove();
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
  
    async handlePageSelection(item, isChild = false, parent = null) {
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
                    this.editorManager.createChildEditor(page);
  
                }
            }
        } catch (error) {
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

