let globalVar = null;
class ToolBoxManager {
  dataManager = null
  constructor(editorManager, dataManager, themes, icons, templates, mapping, media) {
    this.editorManager = editorManager;
    this.dataManager = dataManager;
    this.themes = themes;
    this.icons = icons;
    this.currentTheme = null;
    this.templates = templates;
    this.mappingsItems = mapping;
    this.selectedFile = null;
    this.media = media;
    this.init();
  }

  init() {
    let self = this;
    this.dataManager.getPages().then(pages=>{
      localStorage.clear();
      pages.forEach((page) => {
        if (page.PageName === "Home") {
          this.editorManager.pageId = page.PageId;
          this.editorManager.setCurrentPage(page)
          this.editorManager.editor.trigger("load")
        }
      });
    })

    this.loadTheme();
    this.listThemesInSelectField();
    this.colorPalette();
    this.loadTiles();
    this.loadPageTemplates();

    this.actionList = new ActionList(this.editorManager, this.dataManager, this)

    this.handleFileManager();
    const tabButtons = document.querySelectorAll(".toolbox-tab-button");
    const tabContents = document.querySelectorAll(".toolbox-tab-content");
    tabButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        tabContents.forEach((content) =>
          content.classList.remove("active-tab")
        );

        button.classList.add("active");
        document
          .querySelector(`#${button.dataset.tab}-content`)
          .classList.add("active-tab");
      });
    });

    // mapping
    const mappingButton = document.getElementById("open-mapping");
    const publishButton = document.getElementById("publish");
    const mappingSection = document.getElementById("mapping-section");
    const toolsSection = document.getElementById("tools-section");

    mappingButton.addEventListener("click", (e) => {
      e.preventDefault();

      toolsSection.style.display =
        toolsSection.style.display === "none" ? "block" : "none";

      mappingSection.style.display =
        mappingSection.style.display === "block" ? "none" : "block";

      this.loadMappings();
    });

    publishButton.onclick = (e) => {
      e.preventDefault();
      let pageData = mapTemplateToPageData(
        this.editorManager.editor.getProjectData()
      );
      let pageId = this.editorManager.getCurrentPageId();
      if (pageId) {
        let data = {
          PageId: pageId,
          PageJsonContent: JSON.stringify(pageData),
          PageGJSHtml: this.editorManager.editor.getHtml(),
          PageGJSJson: JSON.stringify(this.editorManager.editor.getProjectData()),
          SDT_Page: pageData,
          PageIsPublished: true
        }
        this.dataManager.updatePage(data).then(res=>{
          this.displayAlertMessage("Page Save Successfully", "success")
        })
      }
    };

    // tile title alignment
    const leftAlign = document.getElementById("align-left");
    const centerAlign = document.getElementById("align-center");
    const rightAlign = document.getElementById("align-right");

    leftAlign.addEventListener("click", () => {
      if (this.editorManager.selectedTemplateWrapper) {
        const templateBlock = this.editorManager.editor
          .getSelected()
          .find(".tile-title-section")[0];

        if (templateBlock) {
          templateBlock.setStyle({
            display: "flex",
            "align-self": "start",
          });
          this.setAttributeToSelected("tile-text-align", "left");
        }
      }
    });

    centerAlign.addEventListener("click", () => {
      if (this.editorManager.selectedTemplateWrapper) {
        const templateBlock = this.editorManager.editor
          .getSelected()
          .find(".tile-title-section")[0];

        if (templateBlock) {
          templateBlock.setStyle({
            display: "flex",
            "align-self": "center",
          });
          this.setAttributeToSelected("tile-text-align", "center");
        }
      }
    });

    rightAlign.addEventListener("click", () => {
      if (this.editorManager.selectedTemplateWrapper) {
        const templateBlock = this.editorManager.editor
          .getSelected()
          .find(".tile-title-section")[0];

        if (templateBlock) {
          templateBlock.setStyle({
            display: "flex",
            "align-self": "end",
          });
          this.setAttributeToSelected("tile-text-align", "right");
        }
      }
    });

    // tile icon alignment
    const iconLeftAlign = document.getElementById("icon-align-left");
    const iconCenterAlign = document.getElementById("icon-align-center");
    const iconRightAlign = document.getElementById("icon-align-right");

    iconLeftAlign.addEventListener("click", () => {
      if (this.editorManager.selectedTemplateWrapper) {
        const templateBlock = this.editorManager.editor
          .getSelected()
          .find(".tile-icon-section")[0];
        console.log("clicked");
        if (templateBlock) {
          templateBlock.setStyle({
            display: "flex",
            "align-self": "start",
          });
          this.setAttributeToSelected("tile-icon-align", "left");
        }
      }
    });

    iconCenterAlign.addEventListener("click", () => {
      if (this.editorManager.selectedTemplateWrapper) {
        const templateBlock = this.editorManager.editor
          .getSelected()
          .find(".tile-icon-section")[0];

        if (templateBlock) {
          templateBlock.setStyle({
            display: "flex",
            "align-self": "center",
          });
          this.setAttributeToSelected("tile-icon-align", "center");
        }
      }
    });

    iconRightAlign.addEventListener("click", () => {
      if (this.editorManager.selectedTemplateWrapper) {
        const templateBlock = this.editorManager.editor
          .getSelected()
          .find(".tile-icon-section")[0];

        if (templateBlock) {
          templateBlock.setStyle({
            display: "flex",
            "align-self": "end",
          });
          this.setAttributeToSelected("tile-icon-align", "right");
        }
      }
    });

    // apply opacity to a bg image of a selected tile
    const imageOpacity = document.getElementById("bg-opacity");

    imageOpacity.addEventListener("input", (event) => {
      const value = event.target.value;

      // add opacity to selected tile image
      if (this.editorManager.selectedTemplateWrapper) {
        const templateBlock = this.editorManager.editor
          .getSelected()
          .find(".template-block")[0];

        if (templateBlock) {
          templateBlock.addStyle({
            opacity: value / 100,
          });
        }
      }
    });

    // undo and redo
    const um = this.editorManager.editor.UndoManager;
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

    // Create new page
    const createPageButton = document.getElementById("create-new-page");

    createPageButton.addEventListener("click", (e) => {
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
          this.dataManager.createNewPage(pageTitle).then( res => {
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
          })
        }
      });
    });
  }

  listThemesInSelectField() {
    console.log(this.themes);
    const themeSelect = document.getElementById("theme-select");

    this.themes.forEach((theme) => {
      const option = document.createElement("option");
      option.value = theme.name;
      option.textContent = theme.name;

      themeSelect.appendChild(option);
    });

    themeSelect.addEventListener("change", (e) => {
      const themeName = e.target.value;

      if (this.setTheme(themeName)) {
        this.themeColorPalette(this.currentTheme.colors);
        localStorage.setItem("selectedTheme", themeName);

        const message = "Theme applied successfully";
        const status = "success";
        this.displayAlertMessage(message, status);
      } else {
        const message = "Error applying theme. Please try again";
        const status = "error";
        this.displayAlertMessage(message, status);
      }
    });
  }

  loadTheme() {
    const savedTheme = localStorage.getItem("selectedTheme");
    if (savedTheme) {
      this.setTheme(savedTheme);
    }
  }

  setTheme(themeName) {
    const theme = this.themes.find((theme) => theme.name === themeName);

    if (!theme) {
      return false;
    }

    this.currentTheme = theme;
    this.applyTheme();

    this.themeColorPalette(this.currentTheme.colors);
    localStorage.setItem("selectedTheme", themeName);

    return true;
  }

  applyTheme() {
    const root = document.documentElement;
    const iframe = document.querySelector("#gjs iframe");

    // Set CSS variables from the selected theme
    root.style.setProperty(
      "--primary-color",
      this.currentTheme.colors.primaryColor
    );
    root.style.setProperty(
      "--secondary-color",
      this.currentTheme.colors.secondaryColor
    );
    root.style.setProperty(
      "--background-color",
      this.currentTheme.colors.backgroundColor
    );
    root.style.setProperty("--text-color", this.currentTheme.colors.textColor);
    root.style.setProperty(
      "--button-bg-color",
      this.currentTheme.colors.buttonBgColor
    );
    root.style.setProperty(
      "--button-text-color",
      this.currentTheme.colors.buttonTextColor
    );
    root.style.setProperty(
      "--card-bg-color",
      this.currentTheme.colors.cardBgColor
    );
    root.style.setProperty(
      "--card-text-color",
      this.currentTheme.colors.cardTextColor
    );
    root.style.setProperty(
      "--accent-color",
      this.currentTheme.colors.accentColor
    );
    root.style.setProperty("--font-family", this.currentTheme.fontFamily);

    // Apply this.currentTheme to iframe (canvas editor)
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.body.style.setProperty(
      "--primary-color",
      this.currentTheme.colors.primaryColor
    );
    iframeDoc.body.style.setProperty(
      "--secondary-color",
      this.currentTheme.colors.secondaryColor
    );
    iframeDoc.body.style.setProperty(
      "--background-color",
      this.currentTheme.colors.backgroundColor
    );
    iframeDoc.body.style.setProperty(
      "--text-color",
      this.currentTheme.colors.textColor
    );
    iframeDoc.body.style.setProperty(
      "--button-bg-color",
      this.currentTheme.colors.buttonBgColor
    );
    iframeDoc.body.style.setProperty(
      "--button-text-color",
      this.currentTheme.colors.buttonTextColor
    );
    iframeDoc.body.style.setProperty(
      "--card-bg-color",
      this.currentTheme.colors.cardBgColor
    );
    iframeDoc.body.style.setProperty(
      "--card-text-color",
      this.currentTheme.colors.cardTextColor
    );
    iframeDoc.body.style.setProperty(
      "--accent-color",
      this.currentTheme.colors.accentColor
    );
    iframeDoc.body.style.setProperty(
      "--font-family",
      this.currentTheme.fontFamily
    );
  }

  themeColorPalette(colors) {
    const colorPaletteContainer = document.getElementById(
      "theme-color-palette"
    );
    colorPaletteContainer.innerHTML = "";

    const colorEntries = Object.entries(colors);

    colorEntries.forEach(([colorName, colorValue], index) => {
      // Create the HTML for each color
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

      alignItem.appendChild(radioInput);
      alignItem.appendChild(colorBox);

      colorPaletteContainer.appendChild(alignItem);

      colorBox.onclick = () => {
        this.editorManager.selectedComponent.addStyle({
          "background-color": colorValue,
        });
        this.setAttributeToSelected("tile-bgcolor", colorValue);
      };
    });
  }

  colorPalette() {
    const textColorBoxes = document.querySelectorAll(
      "#text-color-palette .color-box"
    );
    const iconColorBoxes = document.querySelectorAll(
      "#icon-color-palette .color-box"
    );

    const colorValues = {
      color1: "#ffffff",
      color2: "#333333",
    };

    textColorBoxes.forEach((box, index) => {
      const colorKey = Object.keys(colorValues)[index];

      box.style.backgroundColor = colorValues[colorKey];

      box.onclick = () => {
        this.editorManager.selectedComponent.addStyle({
          color: colorValues[colorKey],
        });
        this.setAttributeToSelected("tile-text-color", colorValues[colorKey])
      };
    });

    iconColorBoxes.forEach((box, index) => {
      const colorKey = Object.keys(colorValues)[index];

      box.style.backgroundColor = colorValues[colorKey];
      
      box.onclick = () => {
        if (this.editorManager.selectedTemplateWrapper) {
          const svgIcon = this.editorManager.editor
            .getSelected()
            .find(".tile-icon path")[0];

          if (svgIcon) {
            svgIcon.removeAttributes("fill");
            svgIcon.addAttributes({ fill: colorValues[colorKey] }); // Use the correct color key
            this.setAttributeToSelected("tile-icon-color", colorValues[colorKey])
          } else {
            const message = "Svg icon not found. Try again";
            const status = "error";
            this.displayAlertMessage(message, status);
          }
        } else {
          const message = "No tile selected. Please select a tile";
          const status = "error";
          this.displayAlertMessage(message, status);
        }
      };
    });
  }

  loadTiles() {
    const tileIcons = document.getElementById("icons-list");

    this.icons.forEach((icon) => {
      const iconItem = document.createElement("div");
      iconItem.classList.add("icon");
      iconItem.innerHTML = `
          ${icon.svg}
          <span class="icon-title">${icon.name}</span>
      `;

      iconItem.onclick = () => {
        if (this.editorManager.selectedTemplateWrapper) {
          const templateBlock = this.editorManager.selectedTemplateWrapper.querySelector(
            ".template-block"
          );

          if (templateBlock) {
            const iconComponent = this.editorManager.editor
              .getSelected()
              .find(".tile-icon")[0];
            if (iconComponent) {
              iconComponent.components(icon.svg);
              this.setAttributeToSelected("tile-icon", icon.svg);
            }
            // const titleComponent = this.editorManager.editor
            //   .getSelected()
            //   .find(".tile-title-section")[0];
            // if (titleComponent) {
            //   titleComponent.components(icon.name);

            //   const sidebarInputTitle = document.getElementById("tile-title");
            //   if (sidebarInputTitle) {
            //     sidebarInputTitle.textContent = icon.name;
            //   }
            // }
          } else {
            const message = "No tile selected. Please select a tile";
            const status = "error";
            this.displayAlertMessage(message, status);
          }
        } else {
          const message = "No tile selected. Please select a tile";
          const status = "error";
          this.displayAlertMessage(message, status);
        }
      };

      tileIcons.appendChild(iconItem);
    });
  }

  loadPageTemplates() {
    const pageTemplates = document.getElementById("page-templates");
    this.templates.forEach((template, index) => {
      const blockElement = document.createElement("div");

      blockElement.className = "page-template-wrapper"; // Wrapper class for each template block
      // Create the number element
      const numberElement = document.createElement("div");
      numberElement.className = "page-template-block-number";
      numberElement.textContent = index + 1; // Set the number
      const templateBlock = document.createElement("div");
      templateBlock.className = "page-template-block";
      templateBlock.title = "Click to load template"; //
      templateBlock.innerHTML = `<div>${template.media}</div>`;

      // Prevent the image from being dragged
      // templateBlock.querySelector("img").addEventListener("dragstart", (e) => {
      //   //alert(templateBlock)
      //   //e.preventDefault();
      // });
      blockElement.addEventListener("click", () => {
        const popup = this.popupModal();
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
          this.editorManager.addFreshTemplate(template.content);
        };
      });

      // Append number and template block to the wrapper
      blockElement.appendChild(numberElement);
      blockElement.appendChild(templateBlock);
      pageTemplates.appendChild(blockElement);
    });
  }

  loadMappings() {
    const treeContainer = document.getElementById("tree-container");
    this.clearMappings();
    this.dataManager.getPagesService()
      .then((pages) => {
        treeContainer.appendChild(this.createTree(pages, true));
      })
      .catch((error) => {
        console.error("Error fetching pages:", error);
      });
  }

  clearMappings() {
    const treeContainer = document.getElementById("tree-container");
    treeContainer.innerHTML = ""; // Clear previous mappings
  }

  createTree(data, isRoot = false) {
    // Sort the data so that "Home" is always first
    data.sort((a, b) => (a.Name === "Home" ? -1 : b.Name === "Home" ? 1 : 0));

    const ul = document.createElement("ul");
    if (!isRoot) ul.style.display = "block";

    console.log("Data: ", data);

    data.forEach((item, index) => {
      const li = document.createElement("li");
      const span = document.createElement("span");
      span.textContent = item.Name;
      li.appendChild(span);
      li.className = this.checkActivePage(item.Id) ? "selected-page" : "";
      span.title = item.Id;
      let pageTile = document.createElement("span")
      pageTile.textContent = item.Name
      if (item.Children && item.Children.length > 0) {
        const childrenContainer = this.createTree(item.Children); // Recursively create children
        li.appendChild(childrenContainer);

        let childToggle = document.createElement("span")
        
        childToggle.textContent = " + ";
        span.style.cursor = "pointer";

        childToggle.onclick = () => {
          childrenContainer.style.display =
            childrenContainer.style.display === "none" ? "block" : "none";

          childToggle.textContent =
            childrenContainer.style.display === "none"
              ? " + "
              : " - ";
        };

        //span.appendChild(pageTile)
        span.appendChild(childToggle)
      } 
      //else {
      span.onclick = () => {
        this.editorManager.setCurrentPageName(item.Name);
        this.editorManager.setCurrentPageId(item.Id);

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
        this.displayAlertMessage(message, status);
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

  openFileUploadModal() {
    const modal = document.createElement("div");
    modal.className = "toolbox-modal";

    const modalContent = document.createElement("div");
    modalContent.className = "toolbox-modal-content";

    let fileListHtml = ``;

    for (let index = 0; index < this.media.length; index++) {
      const file = this.media[index];
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
    const openModal = document.getElementById("image-bg");
    const fileInputField = document.createElement("input");
    const modal = this.openFileUploadModal();

    let selectedFile = null;
    let allUploadedFiles = [];

    openModal.addEventListener("click", (e) => {
      e.preventDefault();
      if (this.editorManager.editor.getSelected()) {
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
              this.uploadFile(e.target.result, file.name, file.size, file.type).then(response=>{
                if (response.MediaId) {
                  this.media.push(response);
                  this.displayMediaFile(response);
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
        this.displayAlertMessage(message, status);
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

        this.setAttributeToSelected("tile-bg-image-url", this.selectedFile.MediaUrl)
      }

      modal.style.display = "none";
      document.body.removeChild(modal);
      document.body.removeChild(fileInputField);
    };
  }

  displayMediaFile(file) {
    const fileList = document.querySelector("#fileList");
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
    this.selectedFile = this.media.find(
      (file) => file.MediaId == fileItem.dataset.mediaid
    );
  }

  popupModal() {
    const popup = document.createElement("div");
    popup.className = "popup-modal";
    popup.innerHTML = `
      <div class="popup">
        <div class="popup-header">
          <span id="confirmation_modal_title">Confirmation</span>
          <button class="close">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 21 21">
                <path id="Icon_material-close" data-name="Icon material-close" d="M28.5,9.615,26.385,7.5,18,15.885,9.615,7.5,7.5,9.615,15.885,18,7.5,26.385,9.615,28.5,18,20.115,26.385,28.5,28.5,26.385,20.115,18Z" transform="translate(-7.5 -7.5)" fill="#6a747f" opacity="0.54"/>
            </svg>
          </button>
        </div>
        <hr>
        <div class="popup-body" id="confirmation_modal_message">
          When you continue, all the changes you have made will be cleared.
        </div>
        <div class="popup-footer">
          <button id="accept_popup" class="toolbox-btn toolbox-btn-primary">OK</button>
          <button id="close_popup" class="toolbox-btn toolbox-btn-outline">Cancel</button>
        </div>
      </div>
    `;

    return popup;
  }
  displayAlertMessage(message, status) {
    const alertContainer = document.getElementById("alerts-container");

    const alertId = Math.random().toString(10);

    const alertBox = this.alertMessage(message, status, alertId);
    alertBox.style.display = "flex";

    const closeButton = alertBox.querySelector(".alert-close-btn");
    closeButton.addEventListener("click", () => {
      this.closeAlert(alertId);
    });

    setTimeout(() => this.closeAlert(alertId), 5000);
    alertContainer.appendChild(alertBox);
  }
  alertMessage(message, status, alertId) {
    const alertBox = document.createElement("div");
    alertBox.id = alertId;
    alertBox.classList = `alert ${status == "success" ? "success" : "error"}`;
    alertBox.innerHTML = `
      <div class="alert-header">
        <strong>${status == "success" ? "Success" : "Error"}</strong>
        <span class="alert-close-btn">✖</span>
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

  setAttributeToSelected(attributeName, attributeValue) {
    if (this.editorManager.editor.getSelected()) {
      this.editorManager.editor
        .getSelected()
        .addAttributes({ [attributeName]: attributeValue });
    }else{
      this.displayAlertMessage("No tile selected. Please select a tile", "error")
    }

  }
}

class PagesManager {
  constructor(editor) {
    this.editor = [];
    this.selectedPageId = null;
  }
}

class Clock {
  constructor() {
    this.updateTime();
    setInterval(() => this.updateTime(), 60000); // Update time every minute
  }

  updateTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // Adjust hours for 12-hour format
    const timeString = `${hours}:${minutes}`;
    document.getElementById("current-time").textContent = timeString;
  }
}
