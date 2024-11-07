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
        name: "Dynamic Form",
        label: this.currentLanguage.getTranslation("category_dynamic_form"),
        options: [
          {
            PageId: "2354481d-5df0-4154-92b8-2fc0aaf9b3e7",
            PageName: "Form 1",
          },
        ],
      },
      {
        name: "Call to Action",
        label: this.currentLanguage.getTranslation("category_call_to_action"),
        options: [
          {
            PageId: "2354481d-5df0-4154-92b8-2fc0aaf9b3e7",
            PageName: "Call To Action",
          },
        ],
      },
    ];
    this.init();
  }

  init() {
    
    this.dataManager
      .getPagesService()
      .then((pages) => {
       
        this.pageOptions = this.mapPageNamesToOptions(pages);
        
        this.categoryData.forEach((category) => {
          if (category.name === "Page") {
            
            category.options = this.pageOptions;
          }
        });

        this.populateDropdownMenu();
        console.log("Updated category data:", this.categoryData);
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
    dropdownHeader.addEventListener("click", () => {
      dropdownMenu.style.display =
        dropdownMenu.style.display === "block" ? "none" : "block";
      dropdownHeader.querySelector("i").classList.toggle("fa-angle-up");
      dropdownHeader.querySelector("i").classList.toggle("fa-angle-down");
    });

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

        // add value to the tile
        if (self.editorManager.editor.getSelected()) {
          const titleComponent = self.editorManager.editor
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
}

class MappingComponent {
  treeContainer = document.getElementById("tree-container");
  createPageButton = document.getElementById("page-submit");

  constructor(dataManager, editorManager, toolBoxManager) {
    this.dataManager = dataManager;
    this.editorManager = editorManager;
    this.toolBoxManager = toolBoxManager;
    this.init();
  }

  init() {
    let self = this;
    this.clearMappings();
    this.dataManager
      .getPagesService()
      .then((pages) => {
        this.treeContainer.appendChild(this.createTree(pages, true));
      })
      .catch((error) => {
        console.error("Error fetching pages:", error);
      });

    // Create new page
    this.createPageButton.addEventListener("click", (e) => {
      e.preventDefault();
      const pageFormSection = document.getElementById("page-form");
      pageFormSection.style.display = "block";
      const pageInput = document.getElementById("page-title");
      const pageSubmit = document.getElementById("page-submit");

      pageSubmit.disabled = true;

      pageInput.addEventListener("input", () => {
        pageSubmit.disabled = !pageInput.value.trim();
      });

      pageSubmit.addEventListener("click", (e) => {
        e.preventDefault();
        const pageTitle = pageInput.value.trim();
        if (pageTitle) {
          // Additional check to ensure value exists
          this.dataManager.createNewPage(pageTitle).then((res) => {
            const pageInput = document.getElementById("page-title");
            pageInput.value = "";

            this.dataManager
              .getPagesService()
              .then((pages) => {
                // Clear the current tree structure
                const treeContainer = document.getElementById("tree-container"); // Assuming tree is rendered here
                treeContainer.innerHTML = ""; // Clear existing nodes

                // Re-create the tree with updated pages data
                const newTree = self.createTree(pages, true); // Set isRoot to true if it's the root
                treeContainer.appendChild(newTree); // Append the new tree structure to the container
              })
              .catch((error) => {
                console.error("Error fetching pages:", error);
              });
          });
        }
      });
    });
  }

  clearMappings() {
    this.treeContainer.innerHTML = ""; // Clear previous mappings
  }

  createTree(data, isRoot = false) {
    // Sort the data so that "Home" is always first
    data.sort((a, b) => (a.Name === "Home" ? -1 : b.Name === "Home" ? 1 : 0));
    const ul = document.createElement("ul");
    if (!isRoot) ul.style.display = "block";

    data.forEach((item, index) => {
      const li = document.createElement("li");
      const span = document.createElement("span");
      span.textContent = item.Name;
      span.id = item.Id;
      li.appendChild(span);
      li.className = this.checkActivePage(item.Id) ? "selected-page" : "";
      span.title = item.Id;
      let pageTile = document.createElement("span");
      pageTile.textContent = item.Name;
      if (item.Children && item.Children.length > 0) {
        const childrenContainer = this.createTree(item.Children); // Recursively create children
        li.appendChild(childrenContainer);

        let childToggle = document.createElement("span");

        childToggle.textContent = " + ";
        span.style.cursor = "pointer";

        childToggle.onclick = () => {
          childrenContainer.style.display =
            childrenContainer.style.display === "none" ? "block" : "none";

          childToggle.textContent =
            childrenContainer.style.display === "none" ? " + " : " - ";
        };

        //span.appendChild(pageTile)
        span.appendChild(childToggle);
      }
      //else {
      span.onclick = () => {
        this.editorManager.setCurrentPageName(item.Name);
        this.editorManager.setCurrentPageId(item.Id);
        let page = this.dataManager.pages.find(page=>page.PageId == item.Id)
        this.editorManager.setCurrentPage(page)
        const editor = this.editorManager.editor;

        editor.DomComponents.clear();
        this.editorManager.templateComponent = null;
        editor.trigger("load");

        document.querySelectorAll(".selected-page").forEach((el) => {
          el.classList.remove("selected-page");
        });

        span.closest("li").classList.add("selected-page");
        const mainPage = document.getElementById("current-page-title");
        mainPage.textContent = this.updateActivePageName();

        const message = `${item.Name} Page loaded successfully`;
        const status = "success";
        this.toolBoxManager.displayAlertMessage(message, status);
      };
      //}
      ul.appendChild(li);
    });
    return ul;
  }

  checkActivePage(id) {
    const pageId = localStorage.getItem("pageId");
    if (pageId === id) {
      return true;
    }
  }

  updateActivePageName() {
    return this.editorManager.getCurrentPageName();
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
      
      let selectedFile = null;
      let allUploadedFiles = [];

      openModal.addEventListener("click", (e) => {
          e.preventDefault();
          if (self.editorManager.editor.getSelected()) {
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
          const templateBlock = this.editorManager.editor
              .getSelected()
              .find(".template-block")[0];
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

    console.log(fileItem)

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
