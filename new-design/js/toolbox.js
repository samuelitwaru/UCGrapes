let globalVar = null;
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
    // this.init();
  }

  init() {
    let self = this;
    this.dataManager.getPages().then((pages) => {
      localStorage.clear();
      pages.forEach((page) => {
        if (page.PageName === "Home") {
          this.editorManager.pageId = page.PageId;
          console.log(page)
          this.editorManager.setCurrentPage(page);
          this.editorManager.editor.trigger("load");
        }
      });
    });

    
    this.loadTheme();
    this.listThemesInSelectField();
    this.colorPalette();
    this.loadTiles();
    this.loadPageTemplates();
    
    this.actionList = new ActionListComponent(this.editorManager, this.dataManager, this.currentLanguage, this)
    
    this.mediaComponent = new MediaComponent(this.dataManager, this.editorManager, this)
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

        this.mappingComponent = new MappingComponent(this.dataManager, this.editorManager, this)
    });

    publishButton.onclick = (e) => {
      e.preventDefault();
      let projectData = this.editorManager.editor.getProjectData()
      let htmlData = this.editorManager.editor.getHtml()
      let jsonData = mapTemplateToPageData(
        projectData
      );

      let pageId = this.editorManager.getCurrentPageId();
      if (pageId) {
        let data = {
          PageId: pageId,
          PageJsonContent: JSON.stringify(jsonData),
          PageGJSHtml: htmlData,
          PageGJSJson: JSON.stringify(
            projectData
          ),
          SDT_Page: jsonData,
          PageIsPublished: true,
        };
        console.log(data)
        this.dataManager.updatePage(data).then((res) => {
          this.displayAlertMessage("Page Save Successfully", "success");
        });
      }
    };

    // tile title alignment
    const leftAlign = document.getElementById("text-align-left");
    const centerAlign = document.getElementById("text-align-center");
    const rightAlign = document.getElementById("text-align-right");

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

        const message = this.currentLanguage.getTranslation(
          "theme_applied_success_message"
        );
        const status = "success";
        this.displayAlertMessage(message, status);
      } else {
        const message = this.currentLanguage.getTranslation(
          "error_applying_theme_message"
        );
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
        this.editorManager.selectedComponent.addStyle({
          "background-color": colorValue,
        });
        this.setAttributeToSelected("tile-bgcolor", colorValue);
      };
    });
  }

  colorPalette() {
    const textColorPaletteContainer = document.getElementById(
      "text-color-palette"
    );
    const iconColorPaletteContainer = document.getElementById(
      "icon-color-palette"
    );

    // Fixed color values
    const colorValues = {
      color1: "#ffffff", // Example white
      color2: "#333333", // Example dark gray
      // Add more colors as needed
    };

    // Create options for text color palette
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
      colorBox.setAttribute("data-tile-text-color", colorValue);

      alignItem.appendChild(radioInput);
      alignItem.appendChild(colorBox);
      textColorPaletteContainer.appendChild(alignItem);

      radioInput.onclick = () => {
        this.editorManager.selectedComponent.addStyle({
          color: colorValue,
        });
        this.setAttributeToSelected("tile-text-color", colorValue);
      };
    });

    // Create options for icon color palette
    Object.entries(colorValues).forEach(([colorName, colorValue]) => {
      const alignItem = document.createElement("div");
      alignItem.className = "color-item";

      const radioInput = document.createElement("input");
      radioInput.type = "radio";
      radioInput.id = `icon-color-${colorName}`;
      radioInput.name = "icon-color";
      radioInput.value = colorName;

      const colorBox = document.createElement("label");
      colorBox.className = "color-box";
      colorBox.setAttribute("for", `icon-color-${colorName}`);
      colorBox.style.backgroundColor = colorValue;
      colorBox.setAttribute("data-tile-icon-color", colorValue);

      alignItem.appendChild(radioInput);
      alignItem.appendChild(colorBox);
      iconColorPaletteContainer.appendChild(alignItem);

      radioInput.onclick = () => {
        const svgIcon = this.editorManager.editor
          .getSelected()
          .find(".tile-icon path")[0];
        if (svgIcon) {
          svgIcon.removeAttributes("fill");
          svgIcon.addAttributes({ fill: colorValue });
          this.setAttributeToSelected("tile-icon-color", colorValue);
        } else {
          const message = this.currentLanguage.getTranslation(
            "no_icon_selected_error_message"
          );
          this.displayAlertMessage(message, "error");
        }
      };
    });
  }

  setupColorRadios(radioGroup, colorValues, type) {
    Object.keys(colorValues).forEach((colorKey, index) => {
      const radio = radioGroup[index];
      const colorValue = colorValues[colorKey];

      const colorBox = radio.nextElementSibling; // Get the color box label
      colorBox.style.backgroundColor = colorValue;
      colorBox.setAttribute("data-tile-bgcolor", colorValue);

      radio.onclick = () => {
        // Uncheck other radio buttons in the group
        radioGroup.forEach((r) => (r.checked = false));
        radio.checked = true;

        // Apply the color based on type
        if (type === "text") {
          this.editorManager.selectedComponent.addStyle({
            color: colorValue,
          });
          this.setAttributeToSelected("tile-text-color", colorValue);
        } else if (type === "icon") {
          const svgIcon = this.editorManager.editor
            .getSelected()
            .find(".tile-icon path")[0];
          if (svgIcon) {
            svgIcon.removeAttributes("fill");
            svgIcon.addAttributes({ fill: colorValue });
            this.setAttributeToSelected("tile-icon-color", colorValue);
          } else {
            const message = this.currentLanguage.getTranslation(
              "no_icon_selected_error_message"
            );
            this.displayAlertMessage(message, "error");
          }
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
            const message = this.currentLanguage.getTranslation(
              "no_tile_selected_error_message"
            );
            const status = "error";
            this.displayAlertMessage(message, status);
          }
        } else {
          const message = this.currentLanguage.getTranslation(
            "no_tile_selected_error_message"
          );
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

  

  popupModal() {
    const popup = document.createElement("div");
    popup.className = "popup-modal";
    popup.innerHTML = `
      <div class="popup">
        <div class="popup-header">
          <span>${this.currentLanguage.getTranslation(
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
          ${this.currentLanguage.getTranslation("confirmation_modal_message")}
        </div>
        <div class="popup-footer">
          <button id="accept_popup" class="toolbox-btn toolbox-btn-primary">
          ${this.currentLanguage.getTranslation("accept_popup")}
          </button>
          <button id="close_popup" class="toolbox-btn toolbox-btn-outline">
          ${this.currentLanguage.getTranslation("cancel_btn")}
          </button>
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
        <strong>
          ${
            status == "success"
              ? this.currentLanguage.getTranslation("alert_type_success")
              : this.currentLanguage.getTranslation("alert_type_error")
          }
        </strong>
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
    } else {
      this.displayAlertMessage(
        this.currentLanguage.getTranslation("no_tile_selected_error_message"),
        "error"
      );
    }
  }

  updateTileProperties(editor) {
    // Combined alignment checker
    const alignmentTypes = [
      { type: "text", attribute: "tile-text-align" },
      { type: "icon", attribute: "tile-icon-align" },
    ];

    alignmentTypes.forEach(({ type, attribute }) => {
      const currentAlign = editor.getSelected()?.getAttributes()?.[attribute];
      ["left", "center", "right"].forEach((align) => {
        document.getElementById(`${type}-align-${align}`).checked =
          currentAlign === align;
      });
    });

    const currentTextColor = editor.getSelected()?.getAttributes()?.[
      "tile-text-color"
    ];
    const textColorRadios = document.querySelectorAll(
      '.text-color-palette.text-colors .color-item input[type="radio"]' // Added .text-colors
    );

    textColorRadios.forEach((radio) => {
      const colorBox = radio.nextElementSibling;
      radio.checked =
        colorBox.getAttribute("data-tile-text-color") === currentTextColor;
    });

    // Update tile icon color
    const currentIconColor = editor.getSelected()?.getAttributes()?.[
      "tile-icon-color"
    ];
    const iconColorRadios = document.querySelectorAll(
      '.text-color-palette.icon-colors .color-item input[type="radio"]' // Added .icon-colors
    );

    iconColorRadios.forEach((radio) => {
      const colorBox = radio.nextElementSibling;
      radio.checked =
        colorBox.getAttribute("data-tile-icon-color") === currentIconColor;
    });

    // update tile bg color
    const currentBgColor = editor.getSelected()?.getAttributes()?.[
      "tile-bgcolor"
    ];
    const radios = document.querySelectorAll(
      '#theme-color-palette input[type="radio"]'
    );

    radios.forEach((radio) => {
      const colorBox = radio.nextElementSibling;
      radio.checked =
        colorBox.getAttribute("data-tile-bgcolor") === currentBgColor;
    });

    // update action
    const currentActionName = editor.getSelected()?.getAttributes()?.[
      "tile-action-object"
    ];

    const currentActionId = editor.getSelected()?.getAttributes()?.[
      "tile-action-object-id"
    ];

    const propertySection = document.getElementById("selectedOption");
    const selectedOptionElement = document.getElementById(currentActionId);

    // Clear background styles for all options
    const allOptions = document.querySelectorAll(".category-content li");
    allOptions.forEach((option) => {
      option.style.background = ""; // Clear any existing background styles
    });

    if (currentActionName && currentActionId && selectedOptionElement) {
      propertySection.textContent = currentActionName;
      propertySection.innerHTML += ' <i class="fa fa-angle-down"></i>';

      // Set background style for the selected option
      selectedOptionElement.style.background = "#f0f0f0";
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
