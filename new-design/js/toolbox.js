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
      // pages.forEach((page) => {
      //   if (page.PageName === "Home") {
      //     this.editorManager.pageId = page.PageId;
      //     // this.editorManager.setCurrentPage(page);
      //     // globalEditor.trigger("load");
      //   }
      // });
    });

    this.dataManager.getLocationTheme().then((theme) => {
      this.setTheme(theme.ThemeName);
    });

    this.loadTheme();
    this.listThemesInSelectField();
    this.colorPalette();
    this.ctaColorPalette();
    // this.pageContentCtas();
    // this.loadThemeIcons();
    this.loadPageTemplates();

    this.actionList = new ActionListComponent(
      this.editorManager,
      this.dataManager,
      this.currentLanguage,
      this
    );

    this.mediaComponent = new MediaComponent(
      this.dataManager,
      this.editorManager,
      this
    );
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

    this.mappingComponent = new MappingComponent(
      this.dataManager,
      this.editorManager,
      this
    );

    mappingButton.addEventListener("click", (e) => {
      e.preventDefault();

      toolsSection.style.display =
        toolsSection.style.display === "none" ? "block" : "none";

      mappingSection.style.display =
        mappingSection.style.display === "block" ? "none" : "block";

      this.mappingComponent.init();
    });

    publishButton.onclick = (e) => {
      e.preventDefault();
      this.publishPages();
    };

    const sidebarInputTitle = document.getElementById("tile-title");
    sidebarInputTitle.addEventListener("input", (e) => {
      this.updateTileTitle(e.target.value);
    });

    // tile title alignment
    const leftAlign = document.getElementById("text-align-left");
    const centerAlign = document.getElementById("text-align-center");
    const rightAlign = document.getElementById("text-align-right");

    leftAlign.addEventListener("click", () => {
      if (this.editorManager.selectedTemplateWrapper) {
        const templateBlock = this.editorManager.selectedComponent.find(
          ".tile-title-section"
        )[0];

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
        const templateBlock = this.editorManager.selectedComponent.find(
          ".tile-title-section"
        )[0];

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
        const templateBlock = this.editorManager.selectedComponent.find(
          ".tile-title-section"
        )[0];

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
        const templateBlock =
          this.editorManager.selectedComponent.find(".tile-icon-section")[0];
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
        const templateBlock =
          this.editorManager.selectedComponent.find(".tile-icon-section")[0];

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
        const templateBlock =
          this.editorManager.selectedComponent.find(".tile-icon-section")[0];

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
        const templateBlock = this.editorManager.selectedComponent;

        if (templateBlock) {
          templateBlock.addStyle({
            opacity: value / 100,
          });
        }
      }
    });

    // Navigators
    const editorsContainer = document.getElementById("child-container");
    const leftButton = document.getElementById("scroll-left");
    const rightButton = document.getElementById("scroll-right");

    // Adjust the scroll amount (number of pixels)
    const scrollAmount = 200;

    // Arrow function to update button visibility
    const updateButtonVisibility = () => {
      const { scrollLeft, scrollWidth, clientWidth } = editorsContainer;

      // Show/hide left button
      leftButton.style.display = scrollLeft > 0 ? "block" : "none";

      // Show/hide right button
      rightButton.style.display =
        scrollLeft + clientWidth < scrollWidth ? "block" : "none";
    };

    // Scroll left on left arrow click
    leftButton.addEventListener("click", (e) => {
      e.preventDefault();
      editorsContainer.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    });

    // Scroll right on right arrow click
    rightButton.addEventListener("click", (e) => {
      e.preventDefault();
      editorsContainer.scrollBy({ left: scrollAmount, behavior: "smooth" });
    });

    // Listen to scroll events to update button visibility
    editorsContainer.addEventListener("scroll", updateButtonVisibility);

    // Initial check
    updateButtonVisibility();
  }

  updateTileTitle(inputTitle) {
    if (this.editorManager.selectedTemplateWrapper) {
      const titleComponent = this.editorManager.selectedComponent.find(".tile-title")[0];
      if (titleComponent) {
        titleComponent.components(inputTitle);
        this.selectedComponent.addAttributes({ "tile-title": inputTitle });
      }
    }
  }

  publishPages() {
    const editors = Object.values(this.editorManager.editors)

    console.log(editors)
    // let editors = this.editorManager.editors;
    if (editors && editors.length) {
      for (let index = 0; index < editors.length; index++) {
        const editorData = editors[index];
        console.log(editorData);
        let pageId = editorData.pageId;
        let editor = editorData.editor;
        let page = this.dataManager.pages.find((page) => page.PageId == pageId);
        let projectData = editor.getProjectData();
        let htmlData = editor.getHtml();
        let jsonData;
        let pageName = page.PageName;

        if (page.PageIsContentPage) {
          jsonData = mapContentToPageData(projectData, page);
          console.log("ProjectData is: ", jsonData);
        } else {
          jsonData = mapTemplateToPageData(projectData, page);
          console.log("ProjectData is: ", jsonData);
        }

        if (pageId) {
          let data = {
            PageId: pageId,
            PageName: pageName,
            PageJsonContent: JSON.stringify(jsonData),
            PageGJSHtml: htmlData,
            PageGJSJson: JSON.stringify(projectData),
            SDT_Page: jsonData,
            PageIsPublished: true,
          };
          this.dataManager.updatePage(data).then((res) => {
            this.displayAlertMessage("Page Save Successfully", "success");
          });
        }
      }
    }
  }

  unDoReDo(editorInstance) {
    // undo and redo
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

  listThemesInSelectField() {
    const themeSelect = document.getElementById("theme-select");

    this.themes.forEach((theme) => {
      const option = document.createElement("option");
      option.value = theme.name;
      option.textContent = theme.name;
      option.id = theme.id;

      themeSelect.appendChild(option);
    });

    themeSelect.addEventListener("change", (e) => {
      const themeName = e.target.value;
      // update location theme
      this.dataManager.selectedTheme = this.themes.find(
        (theme) => theme.name === themeName
      );

      this.dataManager.updateLocationTheme();

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
    document.getElementById("theme-select").value = themeName;
    if (!theme) {
      return false;
    }

    this.currentTheme = theme;

    this.applyTheme();

    this.icons = theme.icons.map((icon) => {
      return {
        name: icon.IconName,
        svg: icon.IconSVG,
        category: icon.IconCategory,
      };
    });
    this.loadThemeIcons(theme.icons);

    this.themeColorPalette(this.currentTheme.colors);
    localStorage.setItem("selectedTheme", themeName);

    return true;
  }

  applyTheme() {
    const root = document.documentElement;
    const iframe = document.querySelector(".mobile-frame iframe");

    if (!iframe) return


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

    console.log(this.currentTheme)

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
    const textColorPaletteContainer =
      document.getElementById("text-color-palette");
    const iconColorPaletteContainer =
      document.getElementById("icon-color-palette");

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
        const svgIcon =
          this.editorManager.selectedComponent.find(".tile-icon path")[0];
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

  ctaColorPalette() {
    const ctaColorPaletteContainer =
      document.getElementById("cta-color-palette");
    // Fixed color values
    const colorValues = {
      color1: "#4C9155",
      color2: "#5068A8",
      color3: "#EEA622",
      color4: "#FF6C37",
    };

    // Create options for text color palette
    console.log(colorValues);
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
        if (this.editorManager.selectedComponent) {
          const selectedComponent = this.editorManager.selectedComponent;

          // Search for components with either class
          const componentsWithClass = [
            ...selectedComponent.find(".cta-main-button"),
            ...selectedComponent.find(".cta-button"),
            ...selectedComponent.find(".img-button"),
            ...selectedComponent.find(".plain-button"),
          ];

          console.log("Component selected: ", selectedComponent)
          console.log("Component picked: ", componentsWithClass)

          // Get the first matching component
          const button =
            componentsWithClass.length > 0 ? componentsWithClass[0] : null;

          if (button) {
            console.log("Button opened ", button)
            button.addStyle({
              "background-color": colorValue,
              "border-color": colorValue,
            });
          }
          this.setAttributeToSelected("cta-background-color", colorValue);
        }
      };
    });
  }

  pageContentCtas(callToActions, editorInstance) {
    const contentPageCtas = document.getElementById("call-to-actions");

    const renderCtas = () => {
      contentPageCtas.innerHTML = "";

      if (!callToActions) {
        $("#content-page-section").show()
        return
      }

      $("#content-page-section").show()

      callToActions.forEach((cta) => {
        const ctaItem = document.createElement("div");
        ctaItem.classList.add("call-to-action-item");
        ctaItem.title = cta.CallToActionName;

        // Map CTA types to icon classes and selectors
        const ctaTypeMap = {
          Phone: {
            icon: "fas fa-phone-alt",
            iconList: ".fas.fa-phone-alt",
          },
          Email: {
            icon: "fas fa-envelope",
            iconList: ".fas.fa-envelope",
          },
          SiteUrl: {
            icon: "fas fa-link",
            iconList: ".fas.fa-link",
          },
          Form: {
            icon: "fas fa-file",
            iconList: ".fas.fa-file",
          },
        };

        const ctaType = ctaTypeMap[cta.CallToActionType] || {
          icon: "fas fa-question",
          iconList: ".fas.fa-question",
        };

        ctaItem.innerHTML = `<i class="${ctaType.icon}"></i>`;

        const ctaComponent = `
          <div class="cta-container-child cta-child" 
            id="id-${cta.CallToActionId}"
            cta-button-id="${cta.CallToActionId}"
            data-gjs-draggable="false"
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
            cta-background-color="#5068a8"
          >
            <div class="cta-button" ${defaultConstraints}>
              <i class="${ctaType.icon}" ${defaultConstraints}></i>
              <div class="cta-badge" ${defaultConstraints}><i class="fa fa-minus" ${defaultConstraints}></i></div>
            </div>
            <div class="cta-label" ${defaultConstraints}>${
          cta.CallToActionName
        }</div>
          </div>
        `;

        ctaItem.onclick = (e) => {
          e.preventDefault();
          const ctaButton = editorInstance
            .getWrapper()
            .find(".cta-button-container")[0];

            if (!ctaButton) {
              console.error("CTA Button container not found.");
              return;
          }
          
          const selectedComponent = this.editorManager.selectedComponent;
          if (!selectedComponent) {
              console.error("No selected component found.");
              return;
          }
          
          const attributes = selectedComponent.getAttributes();
          
          const existingSelectedComponent =
              attributes["cta-button-id"] === cta.CallToActionId;
          
          const existingButton = ctaButton.find(`#id-${cta.CallToActionId}`)?.[0];
          
          if (existingButton) {
              if (existingSelectedComponent) {
                console.log("Replaced")
                  selectedComponent.replaceWith(ctaComponent);
              } else {
              }
              return;
          }
          console.log("New")
          ctaButton.append(ctaComponent);
          
        };

        contentPageCtas.appendChild(ctaItem);

        // change button layout to plain
        const plainButton = document.getElementById("plain-button-layout");

        plainButton.onclick = (e) => {
          e.preventDefault();
          const ctaContainer = editorInstance
            .getWrapper()
            .find(".cta-button-container")[0];

          if (ctaContainer) {
            const selectedComponent = this.editorManager.selectedComponent;

            if (selectedComponent) {
              // Check if the selected component is a CTA
              const attributes = selectedComponent.getAttributes();
              const isCta =
                attributes.hasOwnProperty("cta-button-label") &&
                attributes.hasOwnProperty("cta-button-type") &&
                attributes.hasOwnProperty("cta-button-action");

              if (isCta) {
                // Extract existing attributes
                const ctaId = attributes["cta-button-id"];
                const ctaName = attributes["cta-button-label"];
                const ctaType = attributes["cta-button-type"];
                const ctaAction = attributes["cta-button-action"];
                const ctaButtonBgColor = attributes["cta-background-color"];

                const plainButtonComponent = `
                  <div class="plain-button-container" 
                      data-gjs-draggable="false"
                      data-gjs-editable="false"
                      data-gjs-highlightable="false"
                      data-gjs-droppable="false"
                      data-gjs-resizable="false"
                      data-gjs-hoverable="false"
                      id="id-${ctaId}"
                      cta-button-id="${ctaId}"
                      cta-button-label="${ctaName}"
                      cta-button-type="${ctaType}"
                      cta-button-action="${ctaAction}"
                      cta-background-color="${ctaButtonBgColor}"
                      cta-full-width="true"
                    >
                      <button style="background-color: ${ctaButtonBgColor}; border-color: ${ctaButtonBgColor};" class="plain-button" ${defaultConstraints}>
                        <div class="cta-badge" ${defaultConstraints}><i class="fa fa-minus" ${defaultConstraints}></i></div>
                        ${ctaName}
                      </button>
                  </div>
                `;

                // Remove the current component and replace it
                this.editorManager.selectedComponent.replaceWith(plainButtonComponent);
              } else {
                const message = this.currentLanguage.getTranslation(
                  "please_select_cta_button"
                );
                this.displayAlertMessage(message, "error");
                return;
              }
            }
          }
        };

        // change button layout to plain
        const imgButton = document.getElementById("img-button-layout");

        imgButton.onclick = (e) => {
          e.preventDefault();
          const ctaContainer = editorInstance
            .getWrapper()
            .find(".cta-button-container")[0];

          if (ctaContainer) {
            const selectedComponent = this.editorManager.selectedComponent;

            if (selectedComponent) {
              // Check if the selected component is a CTA
              const attributes = selectedComponent.getAttributes();
              const isCta =
                attributes.hasOwnProperty("cta-button-label") &&
                attributes.hasOwnProperty("cta-button-type") &&
                attributes.hasOwnProperty("cta-button-action");

              if (isCta) {
                // Extract existing attributes
                const ctaId = attributes["cta-button-id"];
                const ctaName = attributes["cta-button-label"];
                const ctaType = attributes["cta-button-type"];
                const ctaAction = attributes["cta-button-action"];
                const ctaButtonBgColor = attributes["cta-background-color"];

                let icon;
                switch (ctaType) {
                  case "Phone":
                    icon = "fas fa-phone-alt";
                    break;

                  case "Email":
                    icon = "fas fa-envelope";
                    break;

                  case "SiteUrl":
                    icon = "fas fa-calendar";
                    break;

                  case "Form":
                    icon = "fas fa-file";
                    break;
                }

                const imgButtonComponent = `
                  <div class="img-button-container" 
                      data-gjs-draggable="false"
                      data-gjs-editable="false"
                      data-gjs-highlightable="false"
                      data-gjs-droppable="false"
                      data-gjs-resizable="false"
                      data-gjs-hoverable="false"
                      id="id-${ctaId}"
                      cta-button-id="${ctaId}"
                      cta-button-label="${ctaName}"
                      cta-button-type="${ctaType}"
                      cta-button-action="${ctaAction}"
                      cta-background-color="${ctaButtonBgColor}"
                      cta-full-width="true"
                    >
                      <div style="background-color: ${ctaButtonBgColor}; border-color: ${ctaButtonBgColor};" class="img-button" ${defaultConstraints}>
                        <i class="${icon} img-button-icon" ${defaultConstraints}></i>
                        <div class="cta-badge" ${defaultConstraints}><i class="fa fa-minus" ${defaultConstraints}></i></div>
                        <span class="img-button-label" ${defaultConstraints}>${ctaName}</span>
                        <i class="fa fa-angle-right img-button-arrow" ${defaultConstraints}></i>
                      </div>
                  </div>
                `;

                // Remove the current component and replace it
                this.editorManager.selectedComponent.replaceWith(imgButtonComponent);
              } else {
                const message = this.currentLanguage.getTranslation(
                  "please_select_cta_button"
                );
                this.displayAlertMessage(message, "error");
                return;
              }
            }
          }
        };
      });
    };

    renderCtas();

    return

    // handling badge clicks
    const wrapper = editorInstance.getWrapper();
    console.log("Wrapper is: ", wrapper);
    wrapper.view.el.addEventListener("click", (e) => {
      const badge = e.target.closest(".cta-badge");
      if (!badge) return;

      e.stopPropagation();

      const ctaChild = badge.closest(
        ".cta-container-child, .plain-button-container, .img-button-container"
      );
      if (ctaChild)
        if (ctaChild) {
          console.log("ctaChild is: ", ctaChild);
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

  setupColorRadios(radioGroup, colorValues, type) {
    Object.keys(colorValues).forEach((colorKey, index) => {
      const radio = radioGroup[index];
      const colorValue = colorValues[colorKey];

      const colorBox = radio.nextElementSibling;
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
          const svgIcon =
            this.editorManager.selectedComponent.find(".tile-icon path")[0];
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

  loadThemeIcons(themeIconsList) {
    console.log("Icons: ", themeIconsList);
    const themeIcons = document.getElementById("icons-list");
    const themeIconCategory = document.getElementById("theme_icon_category");

    // Set default category
    let selectedCategory = "General";

    // Add event listener for category changes
    themeIconCategory.addEventListener("change", (e) => {
      selectedCategory = e.target.value;
      renderIcons();
    });

    const renderIcons = () => {
      // Clear existing icons
      themeIcons.innerHTML = "";

      console.log("Selected Category:", selectedCategory); // Log selected category
      console.log("Theme Icons List:", themeIconsList); // Log the icons list

      // Filter icons based on selected category
      const filteredIcons = themeIconsList.filter(
        (icon) => icon.IconCategory.trim() === selectedCategory.trim()
      );

      console.log("Filtered Icons:", filteredIcons); // Log the filtered icons

      if (filteredIcons.length === 0) {
        console.log("No icons found for selected category.");
      }
      // Render filtered icons
      filteredIcons.forEach((icon) => {
        const iconItem = document.createElement("div");
        iconItem.classList.add("icon");
        iconItem.title = icon.IconName;

        const displayName = (() => {
          const maxChars = 7;
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

        iconItem.innerHTML = `
          ${icon.IconSVG}
          <span class="icon-title">${displayName}</span>
      `;

        iconItem.onclick = () => {
          if (this.editorManager.selectedTemplateWrapper) {
            const iconComponent =
              this.editorManager.selectedComponent.find(".tile-icon")[0];

            if (iconComponent) {
              iconComponent.components(icon.IconSVG);
              this.setAttributeToSelected("tile-icon", icon.IconName);
            }
          } else {
            const message = this.currentLanguage.getTranslation(
              "no_tile_selected_error_message"
            );
            const status = "error";
            this.displayAlertMessage(message, status);
          }
        };

        themeIcons.appendChild(iconItem);
      });
    };

    // Initial render with default category
    renderIcons();
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
    if (this.editorManager.selectedComponent) {
      this.editorManager.selectedComponent.addAttributes({
        [attributeName]: attributeValue,
      });
      console.log(this.editorManager.selectedComponent)
    } else {
      this.displayAlertMessage(
        this.currentLanguage.getTranslation("no_tile_selected_error_message"),
        "error"
      );
    }
  }

  updateTileProperties(editor, page) {
    console.log("Selected", editor);
    if (page && page.PageIsContentPage) {
      // update cta button bg color
      console.log("Selected", editor);
      const currentCtaBgColor =
        this.editorManager.selectedComponent?.getAttributes()?.[
          "cta-background-color"
        ];
      
      const CtaRadios = document.querySelectorAll(
        '#cta-color-palette input[type="radio"]'
      );

      CtaRadios.forEach((radio) => {
        const colorBox = radio.nextElementSibling;
        radio.checked =
          colorBox.getAttribute("data-cta-color").toUpperCase() === currentCtaBgColor.toUpperCase();
      });
    } else {
      // Combined alignment checker
      const alignmentTypes = [
        { type: "text", attribute: "tile-text-align" },
        { type: "icon", attribute: "tile-icon-align" },
      ];

      alignmentTypes.forEach(({ type, attribute }) => {
        const currentAlign =
          this.editorManager.selectedComponent?.getAttributes()?.[attribute];
        ["left", "center", "right"].forEach((align) => {
          document.getElementById(`${type}-align-${align}`).checked =
            currentAlign === align;
        });
      });

      const currentTextColor =
        this.editorManager.selectedComponent?.getAttributes()?.[
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
      const currentIconColor =
        this.editorManager.selectedComponent?.getAttributes()?.[
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
      const currentBgColor =
        this.editorManager.selectedComponent?.getAttributes()?.["tile-bgcolor"];
      const radios = document.querySelectorAll(
        '#theme-color-palette input[type="radio"]'
      );

      radios.forEach((radio) => {
        const colorBox = radio.nextElementSibling;
        radio.checked =
          colorBox.getAttribute("data-tile-bgcolor") === currentBgColor;
      });
      // update action
      const currentActionName =
        this.editorManager.selectedComponent?.getAttributes()?.[
          "tile-action-object"
        ];

      const currentActionId =
        this.editorManager.selectedComponent?.getAttributes()?.[
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

  resetPropertySection() {
    const themeSection = document.querySelector(".theme-section");
    const titleSection = document.querySelector(".title-section");
    const customSelectContainer = document.querySelector(
      ".custom-select-container"
    );
    const servicesSection = document.querySelector(".services-section");
    const contentPageSection = document.querySelector(".content-page-section");

    if (themeSection) themeSection.style.display = "block";
    if (titleSection) titleSection.style.display = "block";
    if (customSelectContainer) customSelectContainer.style.display = "block";
    if (servicesSection) servicesSection.style.display = "block";
    //if (contentPageSection) contentPageSection.style.display = "none";
  }

  updatePropertySection() {
    const themeSection = document.querySelector(".theme-section");
    const titleSection = document.querySelector(".title-section");
    const customSelectContainer = document.querySelector(
      ".custom-select-container"
    );
    const servicesSection = document.querySelector(".services-section");
    const contentPageSection = document.querySelector(".content-page-section");

    // if (themeSection) themeSection.style.display = "none";
    // if (titleSection) titleSection.style.display = "none";
    // if (customSelectContainer) customSelectContainer.style.display = "none";
    // if (servicesSection) servicesSection.style.display = "none";
    if (contentPageSection) contentPageSection.style.display = "block";
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
