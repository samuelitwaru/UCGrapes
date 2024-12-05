class ActionListComponent {
  editorManager = null;
  dataManager = null;
  toolBoxManager = null;
  selectedObject = null;
  selectedId = null;
  pageOptions = [];

  constructor(editorManager, dataManager, currentLanguage, toolBoxManager) {
    this.editorManager = editorManager;
    this.dataManager = dataManager;
    this.currentLanguage = currentLanguage;
    this.toolBoxManager = toolBoxManager;
    console.log("Data is: ", dataManager)

    this.categoryData = [
      {
        name: "Page",
        label: this.currentLanguage.getTranslation("category_page"),
        options: [],
      },
      {
        name: "Service/Product Page",
        label: this.currentLanguage.getTranslation("category_services_or_page"),
        options: this.dataManager.services.map((service) => {
          return {
            PageId: service.ProductServiceId,
            PageName: service.ProductServiceName,
          };
        }),
      },
      {
        name: "Predefined Page",
        label: this.currentLanguage.getTranslation("category_predefined_page"),
        options: [
          {PageId: "1e5d1be0-d9ef-4ff7-869d-1b1f3092155c", PageName: "Reception"},
          {PageId: "5e200c35-16fe-4401-93c6-b106d14c89cc", PageName: "Calendar"},
          {PageId: "e22b29bc-1982-414a-87cf-71a839806a75", PageName: "Mail Box"},
          {PageId: "784c2d18-622f-43f3-bde1-7b00035d6a07", PageName: "Location Information"},
        ],
      },
    ];
    this.init();
  }

  init() {
    this.dataManager
      .getPagesService()
      .then((pages) => {
        console.log('ActionList', pages)
        this.pageOptions = this.mapPageNamesToOptions(pages.filter(page=>page.Name!="Home"));
        
        this.categoryData.forEach((category) => {
          if (category.name === "Page") {
            
            category.options = this.pageOptions;
          }
        });

        this.populateDropdownMenu();
      })
      .catch((error) => {
        console.error("Error fetching pages:", error);
      });
  }

  mapPageNamesToOptions(pages) {
    const pageOptions = pages.map((page) => ({
      PageName: page.Name,
      PageId: page.Id,
    }));
    console.log("Pages", pageOptions);
    return pageOptions;
  }

  populateDropdownMenu() {
    let self = this;
    const dropdownMenu = document.getElementById("dropdownMenu");
    dropdownMenu.innerHTML = "";
    this.categoryData.forEach((category) => {
      const categoryElement = document.createElement("details");
      categoryElement.classList.add("category");
      categoryElement.setAttribute("data-category", category.label);

      const summaryElement = document.createElement("summary");
      summaryElement.innerHTML = `${category.label} <i class="fa fa-angle-right"></i>`;
      categoryElement.appendChild(summaryElement);

      const searchBox = document.createElement("div");
      searchBox.classList.add("search-container");
      searchBox.innerHTML = `<i class="fas fa-search search-icon"></i><input type="text" placeholder="Search" class="search-input" />`;
      categoryElement.appendChild(searchBox);

      const categoryContent = document.createElement("ul");
      categoryContent.classList.add("category-content");

      category.options.forEach((option) => {
        const optionElement = document.createElement("li");
        optionElement.textContent = option.PageName;
        optionElement.id = option.PageId;
        categoryContent.appendChild(optionElement);
      });

      categoryElement.appendChild(categoryContent);

      const noRecordsMessage = document.createElement("li");
      noRecordsMessage.textContent = "No records found";
      noRecordsMessage.classList.add("no-records-message");
      noRecordsMessage.style.display = "none";
      categoryContent.appendChild(noRecordsMessage);

      dropdownMenu.appendChild(categoryElement);
    });

    const dropdownHeader = document.getElementById("selectedOption");
    const categories = document.querySelectorAll(".category");

    // Toggle dropdown menu visibility
    
    if(!this.added){
    dropdownHeader.removeEventListener('click', (e)=>{})
    dropdownHeader.addEventListener("click", (e) => {
      dropdownMenu.style.display =
      dropdownMenu.style.display === "block" ? "none" : "block";
      dropdownHeader.querySelector("i").classList.toggle("fa-angle-up");
      dropdownHeader.querySelector("i").classList.toggle("fa-angle-down");
    });}

    this.added = true

    // Close dropdown when clicking outside
    document.addEventListener("click", (event) => {
      if (
        !dropdownHeader.contains(event.target) &&
        !dropdownMenu.contains(event.target)
      ) {
        dropdownMenu.style.display = "none";
        dropdownHeader.querySelector("i").classList.remove("fa-angle-up");
        dropdownHeader.querySelector("i").classList.add("fa-angle-down");
      }
    });

    // Toggle display of the search box based on category open state and handle icons
    categories.forEach((category) => {
      category.addEventListener("toggle", function () {
        self.selectedObject = category.dataset.category;
        const searchBox = this.querySelector(".search-container");
        const icon = this.querySelector("summary i");
        const isOpen = this.open;

        // Close other categories if this one is opened
        if (isOpen) {
          categories.forEach((otherCategory) => {
            if (otherCategory !== this) {
              otherCategory.open = false; // Close other categories
              otherCategory.querySelector(".search-container").style.display =
                "none"; // Hide other search boxes
              otherCategory
                .querySelector("summary i")
                .classList.replace("fa-angle-down", "fa-angle-right");
            }
          });
          searchBox.style.display = "block"; // Show the search box for this category
          icon.classList.replace("fa-angle-right", "fa-angle-down"); // Change icon direction
        } else {
          searchBox.style.display = "none"; // Hide search box if closed
          icon.classList.replace("fa-angle-down", "fa-angle-right"); // Change icon direction
        }
      });
    });

    // Handle selecting an option and displaying it in the header
    document.querySelectorAll(".category-content li").forEach((item) => {
      item.addEventListener("click", function () {
        dropdownHeader.textContent = `${
          this.closest(".category").dataset.category
        }, ${this.textContent}`;

        console.log(self.editorManager.getCurrentEditor())
        const editor = self.editorManager.getCurrentEditor()
        if (editor.getSelected()) {
          const titleComponent = editor
            .getSelected()
            .find(".tile-title")[0];

          // add apage to a selected tile
          const currentPageId = localStorage.getItem("pageId");

          if (currentPageId !== undefined) {
            self.toolBoxManager.setAttributeToSelected(
              "tile-action-object-id",
              this.id
            );
            self.toolBoxManager.setAttributeToSelected(
              "tile-action-object",
              `${this.closest(".category").dataset.category}, ${
                this.textContent
              }`
            );
            if (self.selectedObject == 'Service/Product Page'){
              self.createContentPage(this.id)
            }
            // let page = self.toolBoxManager.editorManager.getPage(this.id)
            // console.log(page)
            // self.toolBoxManager.editorManager.createChildEditor(page)

          }

          if (titleComponent) {
            titleComponent.components(this.textContent);

            const sidebarInputTitle = document.getElementById("tile-title");
            if (sidebarInputTitle) {
              sidebarInputTitle.textContent = this.textContent;
            }
          }
        }
        dropdownHeader.innerHTML += ' <i class="fa fa-angle-down"></i>';
        dropdownMenu.style.display = "none"; // Close the dropdown menu
      });
    });

    // Add search functionality to each search input
    document.querySelectorAll(".search-input").forEach((input) => {
      input.addEventListener("input", function () {
        const filter = this.value.toLowerCase();
        const items = this.closest(".category").querySelectorAll(
          ".category-content li:not(.no-records-message)"
        );
        let hasVisibleItems = false; // Track if there are visible items

        items.forEach((item) => {
          if (item.textContent.toLowerCase().includes(filter)) {
            item.style.display = "block";
            hasVisibleItems = true; // At least one item is visible
          } else {
            item.style.display = "none";
          }
        });

        // Show or hide the no records message
        const noRecordsMessage = this.closest(".category").querySelector(
          ".no-records-message"
        );
        noRecordsMessage.style.display = hasVisibleItems ? "none" : "block";
      });
    });
  }

  createContentPage(pageId) {
    let self = this
    this.dataManager.createContentPage(pageId).then(res=>{
      this.dataManager.getPages().then(pages=>{
        let treePages = pages.map(page=>{return {Id:page.PageId, Name:page.PageName}})
        const newTree = self.toolBoxManager.mappingComponent.createTree(treePages, true); // Set isRoot to true if it's the root
        self.toolBoxManager.mappingComponent.treeContainer.appendChild(newTree);
      })
    })
  }
}

class MappingComponent {
  treeContainer = document.getElementById("tree-container");
  isLoading = false;

  constructor(dataManager, editorManager, toolBoxManager) {
    this.dataManager = dataManager;
    this.editorManager = editorManager;
    this.toolBoxManager = toolBoxManager;
    this.boundCreatePage = this.handleCreatePage.bind(this);
  }

  init() {
    this.setupEventListeners();
    this.loadPageTree();
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
      const pages = await this.dataManager.getPagesService();
      this.clearMappings();
      this.treeContainer.appendChild(this.createTree(pages, true));
    } catch (error) {
      console.error("Error fetching pages:", error);
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
      pageInput.disabled = true;  // Disable input during creation
      
      // Create the page
      await this.dataManager.createNewPage(pageTitle);
      
      // Clear input
      pageInput.value = "";
      
      // First clear the tree
      this.clearMappings();
      
      // Then reload the pages and rebuild the tree
      this.dataManager.getPages().then(pages=>{
        let treePages = pages.map(page=>{return {Id:page.PageId, Name:page.PageName}})
        const newTree = this.createTree(treePages, true); // Set isRoot to true if it's the root
        this.treeContainer.appendChild(newTree);
        this.toolBoxManager.actionList.init()
      })

      // this.displayMessage(`Page "${pageTitle}" created successfully`, "success");
    } catch (error) {
      console.error("Error creating page:", error);
      this.displayMessage("Error creating page", "error");
    } finally {
      this.isLoading = false;
      createPageButton.disabled = !pageInput.value.trim();
      pageInput.disabled = false;  // Re-enable input
    }
  }

  clearMappings() {
    while (this.treeContainer.firstChild) {
      this.treeContainer.removeChild(this.treeContainer.firstChild);
    }
  }

  createTree(data, isRoot = false) {
    console.log('data for tree', data)
    // Create a deep copy to avoid modifying original data
    const sortedData = JSON.parse(JSON.stringify(data)).sort((a, b) => 
      a.Name === "Home" ? -1 : b.Name === "Home" ? 1 : 0
    );

    const ul = document.createElement("ul");
    if (!isRoot) ul.style.display = "block";

    sortedData.forEach((item) => {
      const li = document.createElement("li");
      const span = document.createElement("span");
      
      // Create text node instead of using textContent to prevent XSS
      span.appendChild(document.createTextNode(item.Name));
      span.id = item.Id;
      li.appendChild(span);
      li.className = this.checkActivePage(item.Id) ? "selected-page" : "";
      span.title = item.Id;

      if (item.Children?.length > 0) {
        const childrenContainer = this.createTree(item.Children);
        li.appendChild(childrenContainer);

        const childToggle = document.createElement("span");
        childToggle.appendChild(document.createTextNode(" + "));
        span.style.cursor = "pointer";

        // Use a single bound click handler
        const toggleChildren = (e) => {
          e.stopPropagation();
          const isHidden = childrenContainer.style.display === "none";
          childrenContainer.style.display = isHidden ? "block" : "none";
          childToggle.textContent = isHidden ? " - " : " + ";
        };

        childToggle.onclick = toggleChildren;
        span.appendChild(childToggle);
      } else {
        // Add trash icon for items without children
          const trashIcon = document.createElement("i");
          trashIcon.className = "fa fa-trash delete-tree-item";
          trashIcon.style.marginLeft = "30px";
          trashIcon.style.cursor = "pointer";
          trashIcon.style.opacity = 0;
          
          // Add click handler for trash icon
          trashIcon.onclick = (e) => {
              e.stopPropagation();
          };
          
          span.appendChild(trashIcon);
      }

      // Bind the click handler with proper context
      span.onclick = (e) => {
        e.stopPropagation();
        if (!this.isLoading) {
          console.log("Item is: "+ item +" and span is: "+ span)
          this.handlePageSelection(item, span);
        }
      };

      ul.appendChild(li);
    });

    return ul;
  }

  async handlePageSelection(item, span) {
    if (this.isLoading) return;
    console.log("Item is: "+ item +" and span is: "+ span)
    try {
      this.isLoading = true;
      
      this.editorManager.setCurrentPageName(item.Name);
      this.editorManager.setCurrentPageId(item.Id);

      const page = this.dataManager.pages.find(page => page.PageId === item.Id);
      this.editorManager.setCurrentPage(page);

      const editor = globalEditor;
      editor.DomComponents.clear();
      this.editorManager.templateComponent = null;
      editor.trigger("load");

      // Update UI
      document.querySelectorAll(".selected-page").forEach(el => {
        el.classList.remove("selected-page");
      });

      span.closest("li").classList.add("selected-page");
      
      const mainPage = document.getElementById("current-page-title");
      mainPage.textContent = this.updateActivePageName();

      this.displayMessage(`${item.Name} Page loaded successfully`, "success");
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
    this.toolBoxManager.displayAlertMessage(message, status);
  }
}


class MediaComponent {
    constructor (dataManager, editorManager, toolBoxManager) {
        this.dataManager = dataManager
        this.editorManager = editorManager
        this.toolBoxManager = toolBoxManager
        this.init()
    }

    init () {
      this.handleFileManager()
    }

    openFileUploadModal() {
        const modal = document.createElement("div");
        modal.className = "toolbox-modal";
        const modalContent = document.createElement("div");
        modalContent.className = "toolbox-modal-content";
      
        
        let fileListHtml = ``;
        for (let index = 0; index < this.dataManager.media.length; index++) {
          const file = this.dataManager.media[index];
          fileListHtml += `
            <div class="file-item valid" 
                data-MediaId="${file.MediaId}" 
                data-MediaUrl="${file.MediaUrl}" 
                data-MediaName="${file.MediaName}">
              <img src="${file.MediaUrl}" alt="${file.MediaName}" class="preview-image">
              <div class="file-info">
                <div class="file-name">${file.MediaName}</div>
                <div class="file-size">${file.MediaSize}</div>
              </div>
              <button class="btn btn-danger delete-media fa fa-trash" data-mediaid="${file.MediaId}"></button>
              <span class="status-icon" style="color: green;"></span>
            </div>
          `;
        }

        modalContent.innerHTML = `
        <div class="toolbox-modal-header">
            <h2>Upload</h2>
            <span class="close">
                <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21">
                    <path id="Icon_material-close" data-name="Icon material-close" d="M28.5,9.615,26.385,7.5,18,15.885,9.615,7.5,7.5,9.615,15.885,18,7.5,26.385,9.615,28.5,18,20.115,26.385,28.5,28.5,26.385,20.115,18Z" transform="translate(-7.5 -7.5)" fill="#6a747f" opacity="0.54"/>
                </svg>
            </span>
        </div>
        <div class="upload-area" id="uploadArea">
            <svg xmlns="http://www.w3.org/2000/svg" width="40.999" height="28.865" viewBox="0 0 40.999 28.865">
                <path id="Path_1040" data-name="Path 1040" d="M21.924,11.025a3.459,3.459,0,0,0-3.287,3.608,3.459,3.459,0,0,0,3.287,3.608,3.459,3.459,0,0,0,3.287-3.608A3.459,3.459,0,0,0,21.924,11.025ZM36.716,21.849l-11.5,14.432-8.218-9.02L8.044,39.89h41Z" transform="translate(-8.044 -11.025)" fill="#afadad"/>
              </svg>
            <p>Drag and drop or <a href="#" id="browseLink">browse</a></p>
        </div>
        <div class="file-list" id="fileList">${fileListHtml}</div>
        <div class="modal-actions">
            <button class="toolbox-btn toolbox-btn-outline" id="cancelBtn">Cancel</button>
            <button class="toolbox-btn toolbox-btn-primary" id="saveBtn">Save</button>
        </div>
        `;
        modal.appendChild(modalContent);

        return modal;
    }

    handleFileManager() {
      let self = this;
      const openModal = document.getElementById("image-bg");
      const fileInputField = document.createElement("input");
      const modal = this.openFileUploadModal();
      
      let allUploadedFiles = [];

      openModal.addEventListener("click", (e) => {
          e.preventDefault();
          if (this.editorManager.selectedComponent) {
          fileInputField.type = "file";
          fileInputField.multiple = true;
          fileInputField.accept = "image/jpeg, image/jpg, image/png"; // Only accept specific image types
          fileInputField.id = "fileInput";
          fileInputField.style.display = "none";

          document.body.appendChild(modal);
          document.body.appendChild(fileInputField);

          // add onclick event handler for file items
          const fileItems = document.querySelectorAll(".file-item");
          fileItems.forEach((element) => {
              element.addEventListener("click", (e) => {
              this.mediaFileClicked(element);
              });
          });

          $(".delete-media").on("click", (e) => {
            const mediaId = e.target.dataset.mediaid
            if (mediaId) {
              this.deleteMedia(mediaId)
            }
          })

          modal.style.display = "flex";

          const uploadArea = modal.querySelector("#uploadArea");
          uploadArea.onclick = () => {
              fileInputField.click();
          };

          fileInputField.onchange = (event) => {
              // Filter only allowed image types
              const newFiles = Array.from(event.target.files).filter((file) =>
              ["image/jpeg", "image/jpg", "image/png"].includes(file.type)
              );
              allUploadedFiles = [...allUploadedFiles, ...newFiles];

              const fileList = modal.querySelector("#fileList");
              //fileList.innerHTML = "";

              allUploadedFiles.forEach((file) => {
              const fileItem = document.createElement("div");
              fileItem.className = "file-item";

              const img = document.createElement("img");
              const reader = new FileReader();
              reader.onload = (e) => {
                  img.src = e.target.result;
                  self.dataManager.uploadFile(e.target.result, file.name, file.size, file.type).then(response=>{
                  if (response.MediaId) {
                      this.dataManager.media.push(response);
                      this.displayMediaFile(fileList, response);
                  }
                  })
              };
              reader.readAsDataURL(file);
              img.alt = "File thumbnail";
              img.className = "preview-image";

              const fileInfo = document.createElement("div");
              fileInfo.className = "file-info";

              const fileName = document.createElement("div");
              fileName.className = "file-name";
              fileName.textContent = file.name;

              const fileSize = document.createElement("div");
              fileSize.className = "file-size";
              const formatFileSize = (bytes) => {
                  if (bytes < 1024) return `${bytes} B`;
                  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
                  if (bytes < 1024 * 1024 * 1024)
                  return `${Math.round(bytes / 1024 / 1024)} MB`;
                  return `${Math.round(bytes / 1024 / 1024 / 1024)} GB`;
              };

              fileSize.textContent = formatFileSize(file.size);

              const statusIcon = document.createElement("span");
              statusIcon.className = "status-icon";

              // Check file size limit (2MB) and file type
              const isValidSize = file.size <= 2 * 1024 * 1024;
              const isValidType = [
                  "image/jpeg",
                  "image/jpg",
                  "image/png",
              ].includes(file.type);

              if (isValidSize && isValidType) {
                  fileItem.classList.add("valid");
                  statusIcon.innerHTML = "";
                  statusIcon.style.color = "green";
              } else {
                  fileItem.classList.add("invalid");
                  statusIcon.innerHTML = "⚠";
                  statusIcon.style.color = "red";
              }
              });
          };
          } else {
          const message = "Please select a tile to continue";
          const status = "error";
          self.toolBoxManager.displayAlertMessage(message, status);
          }
      });

      const closeButton = modal.querySelector(".close");
      closeButton.onclick = () => {
          modal.style.display = "none";
          document.body.removeChild(modal);
          document.body.removeChild(fileInputField);
      };

      const cancelBtn = modal.querySelector("#cancelBtn");
      cancelBtn.onclick = () => {
          modal.style.display = "none";
          document.body.removeChild(modal);
          document.body.removeChild(fileInputField);
      };

      const saveBtn = modal.querySelector("#saveBtn");
      saveBtn.onclick = () => {
          if (this.selectedFile) {
          const templateBlock =  this.editorManager.selectedComponent
              // .find(".template-block")[0];
          templateBlock.addStyle({
              "background-image": `url(${this.selectedFile.MediaUrl})`,
              "background-size": "cover",
              "background-position": "center",
          });

          self.toolBoxManager.setAttributeToSelected("tile-bg-image-url", this.selectedFile.MediaUrl)
          }

          modal.style.display = "none";
          document.body.removeChild(modal);
          document.body.removeChild(fileInputField);
      };

    }

    displayMediaFile(fileList, file) {
      const fileItem = document.createElement("div");
      fileItem.className = "file-item";
      fileItem.setAttribute("data-mediaid", file.MediaId);

      const img = document.createElement("img");
      img.src = file.MediaUrl;
      img.alt = "File thumbnail";
      img.className = "preview-image";

      const fileInfo = document.createElement("div");
      fileInfo.className = "file-info";

      const fileName = document.createElement("div");
      fileName.className = "file-name";
      fileName.textContent = file.MediaName;

      const fileSize = document.createElement("div");
      fileSize.className = "file-size";
      const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
        if (bytes < 1024 * 1024 * 1024)
        return `${Math.round(bytes / 1024 / 1024)} MB`;
        return `${Math.round(bytes / 1024 / 1024 / 1024)} GB`;
    };

    fileSize.textContent = formatFileSize(file.MediaSize);

    const statusIcon = document.createElement("span");
    statusIcon.className = "status-icon";

    // Check file size limit (2MB) and file type
    const isValidSize = file.MediaSize <= 2 * 1024 * 1024;
    const isValidType = ["image/jpeg", "image/jpg", "image/png"].includes(
        file.MediaType
    );

    if (isValidSize && isValidType) {
        fileItem.classList.add("valid");
        statusIcon.innerHTML = "";
        statusIcon.style.color = "green";
    } else {
        fileItem.classList.add("invalid");
        statusIcon.innerHTML = "⚠";
        statusIcon.style.color = "red";
    }

    fileInfo.appendChild(fileName);
    fileInfo.appendChild(fileSize);

    fileItem.appendChild(img);
    fileItem.appendChild(fileInfo);
    fileItem.appendChild(statusIcon);
    fileItem.onclick = (e) => {
        this.mediaFileClicked(fileItem);
    };
    fileList.appendChild(fileItem);
    }

    deleteMedia(mediaId) {
      this.dataManager.deleteMedia(mediaId).then(res=>{
        this.dataManager.getMediaFiles().then(res=>{
          this.dataManager.media = res
        })
      })
    }

    mediaFileClicked(fileItem) {
    if (fileItem.classList.contains("invalid")) {
        return;
    }
    document.querySelector(".modal-actions").style.display = "flex";

    document.querySelectorAll(".file-item").forEach((el) => {
        el.classList.remove("selected");
        const icon = el.querySelector(".status-icon");
        if (icon) {
        icon.innerHTML = el.classList.contains("invalid") ? "⚠" : "";
        }
    });

    fileItem.classList.add("selected");
    let statusIcon = fileItem.querySelector(".status-icon");
    statusIcon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="13.423" viewBox="0 0 18 13.423">
                <path id="Icon_awesome-check" data-name="Icon awesome-check" d="M6.114,17.736l-5.85-5.85a.9.9,0,0,1,0-1.273L1.536,9.341a.9.9,0,0,1,1.273,0L6.75,13.282l8.441-8.441a.9.9,0,0,1,1.273,0l1.273,1.273a.9.9,0,0,1,0,1.273L7.386,17.736A.9.9,0,0,1,6.114,17.736Z" transform="translate(0 -4.577)" fill="#3a9341"/>
                </svg>
            `;
    statusIcon.style.color = "green";
    this.selectedFile = this.dataManager.media.find(
        (file) => file.MediaId == fileItem.dataset.mediaid
    );
    }
}
