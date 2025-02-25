class ThemeManager {
  constructor(toolBoxManager) {
    this.toolBoxManager = toolBoxManager;
  }

  loadTheme() {
    this.toolBoxManager.dataManager.getLocationTheme().then((theme) => {
      this.toolBoxManager.themeManager.setTheme(
        theme.SDT_LocationTheme.ThemeName
      );
    });
  }

  setTheme(themeName) {
    const theme = this.toolBoxManager.themes.find(
      (theme) => theme.ThemeName === themeName
    );

    const select = document.querySelector(".tb-custom-theme-selection");
    select.querySelector(".selected-theme-value").textContent = themeName;

    if (!theme) {
      return false;
    }

    this.toolBoxManager.currentTheme = theme;

    this.applyTheme();

    this.toolBoxManager.icons = theme.ThemeIcons.map((icon) => {
      return {
        name: icon.IconName,
        svg: icon.IconSVG,
        category: icon.IconCategory,
      };
    });
    this.loadThemeIcons(theme.ThemeIcons);

    this.themeColorPalette(this.toolBoxManager.currentTheme.ThemeColors);
    localStorage.setItem("selectedTheme", themeName);

    const page = this.toolBoxManager.editorManager.getPage(
      this.toolBoxManager.editorManager.currentPageId
    );
    this.toolBoxManager.ui.updateTileProperties(
      this.toolBoxManager.editorManager.selectedComponent,
      page
    );

    this.applyThemeIconsAndColor(themeName);
    // this.updatePageTitleFontFamily(theme.fontFamily)

    this.listThemesInSelectField();
    return true;
  }

  applyTheme() {
    const iframes = document.querySelectorAll(".mobile-frame iframe");

    if (!iframes.length) return;

    iframes.forEach((iframe) => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

      this.updateRootStyle(
        iframeDoc,
        "primary-color",
        this.toolBoxManager.currentTheme.ThemeColors.primaryColor
      );
      this.updateRootStyle(
        iframeDoc,
        "secondary-color",
        this.toolBoxManager.currentTheme.ThemeColors.secondaryColor
      );
      this.updateRootStyle(
        iframeDoc,
        "background-color",
        this.toolBoxManager.currentTheme.ThemeColors.backgroundColor
      );
      this.updateRootStyle(
        iframeDoc,
        "text-color",
        this.toolBoxManager.currentTheme.ThemeColors.textColor
      );
      this.updateRootStyle(
        iframeDoc,
        "button-bg-color",
        this.toolBoxManager.currentTheme.ThemeColors.buttonBgColor
      );
      this.updateRootStyle(
        iframeDoc,
        "button-text-color",
        this.toolBoxManager.currentTheme.ThemeColors.buttonTextColor
      );
      this.updateRootStyle(
        iframeDoc,
        "card-bg-color",
        this.toolBoxManager.currentTheme.ThemeColors.cardBgColor
      );
      this.updateRootStyle(
        iframeDoc,
        "card-text-color",
        this.toolBoxManager.currentTheme.ThemeColors.cardTextColor
      );
      this.updateRootStyle(
        iframeDoc,
        "accent-color",
        this.toolBoxManager.currentTheme.ThemeColors.accentColor
      );
      this.updateRootStyle(
        iframeDoc,
        "font-family",
        this.toolBoxManager.currentTheme.ThemeFontFamily
      );

      this.updatePageTitleFontFamily(
        this.toolBoxManager.currentTheme.ThemeFontFamily
      );
    });
  }

  updateRootStyle(iframeDoc, property, value) {
    const styleTag = iframeDoc.body.querySelector("style");

    if (styleTag) {
      let styleContent = styleTag.innerHTML;

      // Regular expression to find and update the variable
      const regex = new RegExp(`(--${property}:\\s*)([^;]+)(;)`);

      if (regex.test(styleContent)) {
        // Update the existing property
        styleContent = styleContent.replace(regex, `$1${value}$3`);
      } else {
        // If the property does not exist, add it inside :root
        styleContent = styleContent.replace(
          /:root\s*{/,
          `:root {\n  --${property}: ${value};`
        );
      }

      styleTag.innerHTML = styleContent;
    } else {
      console.log("No style tag found");
    }
  }

  applyThemeIconsAndColor(themeName) {
    const editors = Object.values(this.toolBoxManager.editorManager.editors);

    if (editors && editors.length) {
      for (let index = 0; index < editors.length; index++) {
        const editorData = editors[index];
        if (!editorData || !editorData.editor) {
          console.error(`Invalid editorData at index ${index}:`, editorData);
          return;
        }

        try {
          let editor = editorData.editor;
          // Add additional null checks
          if (!editor || typeof editor.getWrapper !== "function") {
            console.error(`Invalid editor at index ${index}:`, editor);
            continue;
          }

          const wrapper = editor.getWrapper();

          const theme = this.toolBoxManager.themes.find(
            (theme) => theme.ThemeName === themeName
          );
          const tiles = wrapper.find(".template-block");

          tiles.forEach((tile) => {
            if (!tile) return;
            // icons change and its color
            const tileIconName = tile.getAttributes()?.["tile-icon"];
            if (tileIconName) {
              const matchingIcon = theme.ThemeIcons?.find(
                (icon) => icon.IconName === tileIconName
              );

              if (matchingIcon) {
                const tileIconComponent = tile.find(".tile-icon svg")?.[0];

                if (tileIconComponent) {
                  // get current icon color with null checks
                  const currentIconPath = tileIconComponent.find("path")?.[0];
                  let currentIconColor = "#7c8791"; // default color
                  if (currentIconPath && currentIconPath.getAttributes()) {
                    currentIconColor =
                      currentIconPath.getAttributes()["fill"] ||
                      currentIconColor;
                  }

                  let localizedSVG = matchingIcon.IconSVG;
                  if (localizedSVG) {
                    localizedSVG = localizedSVG.replace(
                      /fill="[^"]*"/g,
                      `fill="${currentIconColor}"`
                    );
                    tileIconComponent.replaceWith(localizedSVG);
                  }
                }
              }
            }

            const currentTileBgColorName =
              tile.getAttributes()?.["tile-bgcolor-name"];
            if (currentTileBgColorName && theme.ThemeColors) {
              const matchingColorCode =
                theme.ThemeColors[currentTileBgColorName];

              if (matchingColorCode) {
                tile.addAttributes({
                  "tile-bgcolor-name": currentTileBgColorName,
                  "tile-bgcolor": matchingColorCode,
                });

                const currentTileOpacity =
                  tile.getAttributes()?.["tile-bg-image-opacity"];

                tile.addStyle({
                  "background-color": addOpacityToHex(
                    matchingColorCode,
                    currentTileOpacity
                  ),
                });
              } else {
                console.warn(
                  `No matching color found for: ${currentTileBgColorName}`
                );
              }
            }
          });
        } catch (error) {
          console.error(`Error processing editor at index ${index}:`, error);
        }
      }
    }

    const iframes = document.querySelectorAll(".mobile-frame iframe");

    if (iframes === null) return;

    iframes.forEach((iframe) => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      if (iframeDoc && iframeDoc.body) {
        iframeDoc.body.style.setProperty(
          "--font-family",
          this.toolBoxManager.currentTheme.ThemeFontFamily
        );
      }
    });
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
        if (this.toolBoxManager.editorManager.selectedComponent) {
          const selectedComponent =
            this.toolBoxManager.editorManager.selectedComponent;
          const currentColor =
            selectedComponent.getAttributes()?.["tile-bgcolor"];
          const currentTileOpacity =
            selectedComponent.getAttributes()?.["tile-bg-image-opacity"];

          if (currentColor === colorValue) {
            selectedComponent.addStyle({
              "background-color": "transparent",
            });

            this.toolBoxManager.setAttributeToSelected("tile-bgcolor", null);
            this.toolBoxManager.setAttributeToSelected(
              "tile-bgcolor-name",
              null
            );

            radioInput.checked = false;
            alignItem.style.border = "none";
          } else {
            selectedComponent.addStyle({
              "background-color": addOpacityToHex(
                colorValue,
                currentTileOpacity
              ),
            });

            this.toolBoxManager.setAttributeToSelected(
              "tile-bgcolor",
              colorValue
            );

            this.toolBoxManager.setAttributeToSelected(
              "tile-bgcolor-name",
              colorName
            );
            alignItem.removeAttribute("style");
          }
        } else {
          const message = this.toolBoxManager.currentLanguage.getTranslation(
            "no_tile_selected_error_message"
          );
          this.toolBoxManager.ui.displayAlertMessage(message, "error");
        }
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
      color1: "#ffffff",
      color2: "#333333",
    };

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
      colorBox.setAttribute("data-tile-color", colorValue);

      alignItem.appendChild(radioInput);
      alignItem.appendChild(colorBox);
      textColorPaletteContainer.appendChild(alignItem);

      radioInput.onclick = () => {
        const selectedComponent =
          this.toolBoxManager.editorManager.selectedComponent;
        if (selectedComponent) {
          selectedComponent.addStyle({
            color: colorValue,
          });
          this.toolBoxManager.setAttributeToSelected(
            "tile-text-color",
            colorValue
          );

          const svgIcon = selectedComponent.find(".tile-icon path")[0];
          if (svgIcon) {
            svgIcon.removeAttributes("fill");
            svgIcon.addAttributes({
              fill: colorValue,
            });
            this.toolBoxManager.setAttributeToSelected(
              "tile-icon-color",
              colorValue
            );
          } 
        } else {
          const message = this.toolBoxManager.currentLanguage.getTranslation(
            "no_tile_selected_error_message"
          );
          this.toolBoxManager.ui.displayAlertMessage(message, "error");
        }
      };
    });
  }

  ctaColorPalette() {
    const ctaColorPaletteContainer =
      document.getElementById("cta-color-palette");
    const colorValues = {
      color1: "#4C9155",
      color2: "#5068A8",
      color3: "#EEA622",
      color4: "#FF6C37",
    };

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
        if (this.toolBoxManager.editorManager.selectedComponent) {
          const selectedComponent =
            this.toolBoxManager.editorManager.selectedComponent;

          // Search for components with either class
          const componentsWithClass = [
            ...selectedComponent.find(".cta-main-button"),
            ...selectedComponent.find(".cta-button"),
            ...selectedComponent.find(".img-button"),
            ...selectedComponent.find(".plain-button"),
          ];

          // Get the first matching component
          const button =
            componentsWithClass.length > 0 ? componentsWithClass[0] : null;

          if (button) {
            button.addStyle({
              "background-color": colorValue,
              "border-color": colorValue,
            });
          }
          this.toolBoxManager.setAttributeToSelected(
            "cta-background-color",
            colorValue
          );
        }
      };
    });
  }

  listThemesInSelectField() {
    const select = document.querySelector(".tb-custom-theme-selection");
    const button = select.querySelector(".theme-select-button");
    const selectedValue = button.querySelector(".selected-theme-value");

    // Remove existing options list if it exists
    let existingOptionsList = select.querySelector(".theme-options-list");
    if (existingOptionsList) {
      existingOptionsList.remove();
    }

    // Create new options list
    const optionsList = document.createElement("div");
    optionsList.classList.add("theme-options-list");
    optionsList.setAttribute("role", "listbox");

    // Append new options list to the select container
    select.appendChild(optionsList);

    // Toggle dropdown visibility
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const isOpen = optionsList.classList.contains("show");
      optionsList.classList.toggle("show");
      button.classList.toggle("open");
      button.setAttribute("aria-expanded", !isOpen);
    });

    document.addEventListener("click", (e) => {
      if (!select.contains(e.target)) {
        optionsList.classList.remove("show");
        button.classList.remove("open");
        button.setAttribute("aria-expanded", "false");
      }
    });

    // Populate themes into the dropdown
    this.toolBoxManager.themes.forEach((theme) => {
      const option = document.createElement("div");
      option.classList.add("theme-option");
      option.setAttribute("role", "option");
      option.setAttribute("data-value", theme.ThemeName);
      option.textContent = theme.ThemeName;

      if (
        this.toolBoxManager.currentTheme &&
        theme.ThemeName === this.toolBoxManager.currentTheme.ThemeName
      ) {
        option.classList.add("selected");
        selectedValue.textContent = theme.ThemeName;
      }

      option.addEventListener("click", () => {
        selectedValue.textContent = theme.ThemeName;

        // Remove 'selected' class from all options and apply to clicked one
        optionsList
          .querySelectorAll(".theme-option")
          .forEach((opt) => opt.classList.remove("selected"));
        option.classList.add("selected");

        // Close dropdown
        optionsList.classList.remove("show");
        button.classList.remove("open");
        button.setAttribute("aria-expanded", "false");

        // Update theme selection
        this.toolBoxManager.dataManager.selectedTheme =
          this.toolBoxManager.themes.find(
            (t) => t.ThemeName === theme.ThemeName
          );

        this.toolBoxManager.dataManager.updateLocationTheme().then((res) => {
          if (this.toolBoxManager.checkIfNotAuthenticated(res)) return;

          if (this.setTheme(theme.ThemeName)) {
            this.themeColorPalette(
              this.toolBoxManager.currentTheme.ThemeColors
            );
            localStorage.setItem("selectedTheme", theme.ThemeName);
            this.toolBoxManager.editorManager.theme = theme;

            this.updatePageTitleFontFamily(theme.ThemeFontFamily);

            const message = this.toolBoxManager.currentLanguage.getTranslation(
              "theme_applied_success_message"
            );
            this.toolBoxManager.ui.displayAlertMessage(message, "success");
          } else {
            const message = this.toolBoxManager.currentLanguage.getTranslation(
              "error_applying_theme_message"
            );
            this.toolBoxManager.ui.displayAlertMessage(message, "error");
          }
        });
      });

      // Append option to options list
      optionsList.appendChild(option);
    });
  }

  closeDropdowns() {
    const dropdowns = document.querySelectorAll(".tb-custom-theme-selection");

    dropdowns.forEach((dropdown) => {
      const button = dropdown.querySelector(".theme-select-button");
      const optionsList = dropdown.querySelector(".theme-options-list");

      if (optionsList.classList.contains("show")) {
        optionsList.classList.remove("show");
        button.classList.remove("open");
        button.setAttribute("aria-expanded", "false");
      }
    });
  }

  updatePageTitleFontFamily(fontFamily) {
    const appBars = document.querySelectorAll(".app-bar");
    appBars.forEach((appBar) => {
      const h1 = appBar.querySelector("h1");
      h1.style.fontFamily = fontFamily;
    });
  }

  loadThemeIcons(themeIconsList) {
    const themeIcons = document.getElementById("icons-list");

    let selectedCategory;

    const categoryOptions = document.querySelectorAll(".category-option");
    // selected category is where the category option has a .selected class

    categoryOptions.forEach((option) => {
      if (option.classList.contains("selected")) {
        selectedCategory = option.getAttribute("data-value");
      }
      option.addEventListener("click", () => {
        selectedCategory = option.getAttribute("data-value");
        renderIcons();
      });
    });

    const renderIcons = () => {
      themeIcons.innerHTML = "";
      const filteredIcons = themeIconsList.filter(
        (icon) => icon.IconCategory.trim() === selectedCategory
      );

      if (filteredIcons.length === 0) {
        console.log("No icons found for selected category.");
      }
      // Render filtered icons
      filteredIcons.forEach((icon) => {
        const iconItem = document.createElement("div");
        iconItem.classList.add("icon");
        iconItem.title = icon.IconName;

        const displayName = (() => {
          const maxChars = 5;
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

        // iconItem.innerHTML = `
        //             ${icon.IconSVG}
        //             <span class="icon-title">${displayName}</span>
        //         `;

        iconItem.innerHTML = `${icon.IconSVG}`;

        iconItem.onclick = () => {
          if (this.toolBoxManager.editorManager.selectedTemplateWrapper) {
            const iconComponent =
              this.toolBoxManager.editorManager.selectedComponent.find(
                ".tile-icon"
              )[0];

            if (iconComponent) {
              const iconSvgComponent = icon.IconSVG;
              const whiteIconSvg = iconSvgComponent.replace(
                'fill="#7c8791"',
                'fill="white"'
              );
              iconComponent.addStyle({ display: "block" });
              iconComponent.addAttributes({ "is-hidden": "false" });
              iconComponent.components(whiteIconSvg);
              this.toolBoxManager.setAttributeToSelected(
                "tile-icon",
                icon.IconName
              );

              this.toolBoxManager.setAttributeToSelected(
                "tile-icon",
                icon.IconName
              );

              this.toolBoxManager.setAttributeToSelected(
                "tile-icon-color",
                "#ffffff"
              );
            }
          } else {
            const message = this.toolBoxManager.currentLanguage.getTranslation(
              "no_tile_selected_error_message"
            );
            const status = "error";
            this.toolBoxManager.ui.displayAlertMessage(message, status);
          }
        };

        themeIcons.appendChild(iconItem);
      });
    };

    renderIcons();
  }
}
