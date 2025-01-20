class ThemeManager {
  constructor(toolBoxManager) {
    this.toolBoxManager = toolBoxManager;
  }

  loadTheme() {
    const savedTheme = localStorage.getItem("selectedTheme");
    if (savedTheme) {
      this.setTheme(savedTheme);
    }
  }

  setTheme(themeName) {
    const theme = this.toolBoxManager.themes.find(
      (theme) => theme.name === themeName
    );
    const select = document.querySelector(".tb-custom-theme-selection");
    select.querySelector(".selected-theme-value").textContent = themeName;
    if (!theme) {
      return false;
    }

    this.toolBoxManager.currentTheme = theme;

    this.applyTheme();

    this.toolBoxManager.icons = theme.icons.map((icon) => {
      return {
        name: icon.IconName,
        svg: icon.IconSVG,
        category: icon.IconCategory,
      };
    });
    this.loadThemeIcons(theme.icons);

    this.themeColorPalette(this.toolBoxManager.currentTheme.colors);
    localStorage.setItem("selectedTheme", themeName);

    this.applyThemeIconsAndColor(themeName);

    return true;
  }

  applyTheme() {
    const root = document.documentElement;
    const iframes = document.querySelectorAll(".mobile-frame iframe");

    if (!iframes.length) return;

    root.style.setProperty(
      "--primary-color",
      this.toolBoxManager.currentTheme.colors.primaryColor
    );
    root.style.setProperty(
      "--secondary-color",
      this.toolBoxManager.currentTheme.colors.secondaryColor
    );
    root.style.setProperty(
      "--background-color",
      this.toolBoxManager.currentTheme.colors.backgroundColor
    );
    root.style.setProperty(
      "--text-color",
      this.toolBoxManager.currentTheme.colors.textColor
    );
    root.style.setProperty(
      "--button-bg-color",
      this.toolBoxManager.currentTheme.colors.buttonBgColor
    );
    root.style.setProperty(
      "--button-text-color",
      this.toolBoxManager.currentTheme.colors.buttonTextColor
    );
    root.style.setProperty(
      "--card-bg-color",
      this.toolBoxManager.currentTheme.colors.cardBgColor
    );
    root.style.setProperty(
      "--card-text-color",
      this.toolBoxManager.currentTheme.colors.cardTextColor
    );
    root.style.setProperty(
      "--accent-color",
      this.toolBoxManager.currentTheme.colors.accentColor
    );
    root.style.setProperty(
      "--font-family",
      this.toolBoxManager.currentTheme.fontFamily
    );

    iframes.forEach((iframe) => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

      if (iframeDoc && iframeDoc.body) {
        iframeDoc.body.style.setProperty(
          "--primary-color",
          this.toolBoxManager.currentTheme.colors.primaryColor
        );
        iframeDoc.body.style.setProperty(
          "--secondary-color",
          this.toolBoxManager.currentTheme.colors.secondaryColor
        );
        iframeDoc.body.style.setProperty(
          "--background-color",
          this.toolBoxManager.currentTheme.colors.backgroundColor
        );
        iframeDoc.body.style.setProperty(
          "--text-color",
          this.toolBoxManager.currentTheme.colors.textColor
        );
        iframeDoc.body.style.setProperty(
          "--button-bg-color",
          this.toolBoxManager.currentTheme.colors.buttonBgColor
        );
        iframeDoc.body.style.setProperty(
          "--button-text-color",
          this.toolBoxManager.currentTheme.colors.buttonTextColor
        );
        iframeDoc.body.style.setProperty(
          "--card-bg-color",
          this.toolBoxManager.currentTheme.colors.cardBgColor
        );
        iframeDoc.body.style.setProperty(
          "--card-text-color",
          this.toolBoxManager.currentTheme.colors.cardTextColor
        );
        iframeDoc.body.style.setProperty(
          "--accent-color",
          this.toolBoxManager.currentTheme.colors.accentColor
        );
        iframeDoc.body.style.setProperty(
          "--font-family",
          this.toolBoxManager.currentTheme.fontFamily
        );
      }
    });
  }

  applyThemeIconsAndColor(themeName) {
    
    console.log("Theme set to: ", themeName);
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
            (theme) => theme.name === themeName
          );
          const tiles = wrapper.find(".template-block");

          tiles.forEach((tile) => {
            if (!tile) return;
            // icons change and its color
            const tileIconName = tile.getAttributes()?.["tile-icon"];
            if (tileIconName) {
              const matchingIcon = theme.icons?.find(
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
            if (currentTileBgColorName && theme.colors) {
              const matchingColorCode = theme.colors[currentTileBgColorName];

              if (matchingColorCode) {
                tile.addAttributes({
                  "tile-bgcolor-name": currentTileBgColorName,
                  "tile-bgcolor": matchingColorCode,
                });

                tile.addStyle({
                  "background-color": matchingColorCode,
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
          this.toolBoxManager.currentTheme.fontFamily
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
        this.toolBoxManager.editorManager.selectedComponent.addStyle({
          "background-color": colorValue,
        });
        this.toolBoxManager.setAttributeToSelected("tile-bgcolor", colorValue);
        this.toolBoxManager.setAttributeToSelected(
          "tile-bgcolor-name",
          colorName
        );
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
      colorBox.setAttribute("data-tile-text-color", colorValue);

      alignItem.appendChild(radioInput);
      alignItem.appendChild(colorBox);
      textColorPaletteContainer.appendChild(alignItem);

      radioInput.onclick = () => {
        this.toolBoxManager.editorManager.selectedComponent.addStyle({
          color: colorValue,
        });
        this.toolBoxManager.setAttributeToSelected(
          "tile-text-color",
          colorValue
        );
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
          this.toolBoxManager.editorManager.selectedComponent.find(
            ".tile-icon path"
          )[0];
        if (svgIcon) {
          svgIcon.removeAttributes("fill");
          svgIcon.addAttributes({
            fill: colorValue,
          });
          this.toolBoxManager.setAttributeToSelected(
            "tile-icon-color",
            colorValue
          );
        } else {
          const message = this.toolBoxManager.currentLanguage.getTranslation(
            "no_icon_selected_error_message"
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

    // Toggle dropdown visibility
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const isOpen = optionsList.classList.contains("show");
      optionsList.classList.toggle("show");
      button.classList.toggle("open");
      button.setAttribute("aria-expanded", !isOpen);
    });

    const optionsList = document.createElement("div");
    optionsList.classList.add("theme-options-list");
    optionsList.setAttribute("role", "listbox");
    optionsList.innerHTML = "";

    // Populate themes into the dropdown
    this.toolBoxManager.themes.forEach((theme, index) => {
      const option = document.createElement("div");
      option.classList.add("theme-option");
      option.setAttribute("role", "option");
      option.setAttribute("data-value", theme.name);
      option.textContent = theme.name;

      if (
        this.toolBoxManager.currentTheme &&
        theme.name === this.toolBoxManager.currentTheme.name
      ) {
        option.classList.add("selected");
      }

      option.addEventListener("click", (e) => {
        selectedValue.textContent = theme.name;

        // Mark as selected
        const allOptions = optionsList.querySelectorAll(".theme-option");
        allOptions.forEach((opt) => opt.classList.remove("selected"));
        option.classList.add("selected");

        // Close the dropdown
        optionsList.classList.remove("show");
        button.classList.remove("open");
        button.setAttribute("aria-expanded", "false");

        const themeName = theme.name;
        // update location theme
        this.toolBoxManager.dataManager.selectedTheme =
          this.toolBoxManager.themes.find((theme) => theme.name === themeName);

        this.toolBoxManager.dataManager.updateLocationTheme().then((res) => {
          if (this.toolBoxManager.checkIfNotAuthenticated(res)) {
            return;
          }

          if (this.setTheme(themeName)) {
            this.themeColorPalette(this.toolBoxManager.currentTheme.colors);

            localStorage.setItem("selectedTheme", themeName);

            const message = this.toolBoxManager.currentLanguage.getTranslation(
              "theme_applied_success_message"
            );
            const status = "success";
            this.toolBoxManager.ui.displayAlertMessage(message, status);
          } else {
            const message = this.toolBoxManager.currentLanguage.getTranslation(
              "error_applying_theme_message"
            );
            const status = "error";
            this.toolBoxManager.ui.displayAlertMessage(message, status);
          }
        });
      });

      // Append option to the options list
      optionsList.appendChild(option);
    });

    select.appendChild(optionsList);

    document.addEventListener("click", (e) => {
      if (!select.contains(e.target)) {
        optionsList.classList.remove("show");
        button.classList.remove("open");
        button.setAttribute("aria-expanded", "false");
      }
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
          if (this.toolBoxManager.editorManager.selectedTemplateWrapper) {
            const iconComponent =
              this.toolBoxManager.editorManager.selectedComponent.find(
                ".tile-icon"
              )[0];

            if (iconComponent) {
              iconComponent.components(icon.IconSVG);
              this.toolBoxManager.setAttributeToSelected(
                "tile-icon",
                icon.IconName
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