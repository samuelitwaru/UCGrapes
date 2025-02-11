class ToolBoxUI {
  constructor(toolBoxManager) {
    this.manager = toolBoxManager;
    this.currentLanguage = toolBoxManager.currentLanguage;
  }

  updateTileTitle(inputTitle) {
    if (this.manager.editorManager.selectedTemplateWrapper) {
      const titleComponent =
        this.manager.editorManager.selectedComponent.find(".tile-title")[0];
      if (titleComponent) {
        titleComponent.components(inputTitle);
        // this.manager.selectedComponent.addAttributes({
        //   "tile-title": inputTitle,
        // });
      }
    }
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

  openToastMessage() {
    const toast = document.createElement("div");
    toast.id = "toast";
    toast.textContent = "Your changes are saved";

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateX(-50%) translateY(0)";
    }, 100);

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 500);
    }, 3000);
  }

  updateTileProperties(selectComponent, page) {
    if (page && page.PageIsContentPage) {
      this.updateContentPageProperties(selectComponent);
    } else {
      this.updateTemplatePageProperties(selectComponent);
    }
  }

  updateContentPageProperties(selectComponent) {
    const currentCtaBgColor =
      selectComponent?.getAttributes()?.[
        "cta-background-color"
      ];
    const CtaRadios = document.querySelectorAll(
      '#cta-color-palette input[type="radio"]'
    );

    CtaRadios.forEach((radio) => {
      const colorBox = radio.nextElementSibling;
      radio.checked =
        colorBox.getAttribute("data-cta-color").toUpperCase() ===
        currentCtaBgColor.toUpperCase();
    });
  }

  updateTemplatePageProperties(selectComponent) {
    this.updateAlignmentProperties(selectComponent);
    this.updateColorProperties(selectComponent);
    this.updateActionProperties(selectComponent);
  }

  updateAlignmentProperties(selectComponent) {
    const alignmentTypes = [
      { type: "text", attribute: "tile-text-align" },
      { type: "icon", attribute: "tile-icon-align" },
    ];

    alignmentTypes.forEach(({ type, attribute }) => {
      const currentAlign =
        selectComponent?.getAttributes()?.[
          attribute
        ];
      ["left", "center", "right"].forEach((align) => {
        document.getElementById(`${type}-align-${align}`).checked =
          currentAlign === align;
      });
    });
  }

  updateColorProperties(selectComponent) {
    const currentTextColor =
      selectComponent?.getAttributes()?.[
        "tile-text-color"
      ];
    const textColorRadios = document.querySelectorAll(
      '.text-color-palette.text-colors .color-item input[type="radio"]'
    );
    textColorRadios.forEach((radio) => {
      const colorBox = radio.nextElementSibling;
      radio.checked =
        colorBox.getAttribute("data-tile-text-color") === currentTextColor;
    });

    // Update icon color
    const currentIconColor =
      selectComponent?.getAttributes()?.[
        "tile-icon-color"
      ];
    const iconColorRadios = document.querySelectorAll(
      '.text-color-palette.icon-colors .color-item input[type="radio"]'
    );
    iconColorRadios.forEach((radio) => {
      const colorBox = radio.nextElementSibling;
      radio.checked =
        colorBox.getAttribute("data-tile-icon-color") === currentIconColor;
    });

    // Update background color
    const currentBgColor =
      selectComponent?.getAttributes()?.[
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

    // opacity
    const currentTileOpacity =
      selectComponent?.getAttributes()?.[
        "tile-bg-image-opacity"
      ];

    const imageOpacity = document.getElementById("bg-opacity");
    imageOpacity.value = currentTileOpacity;
  }

  updateActionProperties(selectComponent) {
    const currentActionName =
      selectComponent?.getAttributes()?.[
        "tile-action-object"
      ];
    const currentActionId =
      selectComponent?.getAttributes()?.[
        "tile-action-object-id"
      ];
    const propertySection = document.getElementById("selectedOption");
    const selectedOptionElement = document.getElementById(currentActionId);

    const allOptions = document.querySelectorAll(".category-content li");
    allOptions.forEach((option) => {
      option.style.background = "";
    });
    propertySection.textContent = "Select Action";
    if (currentActionName && currentActionId && selectedOptionElement) {
      propertySection.textContent = currentActionName;
      propertySection.innerHTML += ' <i class="fa fa-angle-down"></i>';
      selectedOptionElement.style.background = "#f0f0f0";
    }
  }

  pageContentCtas(callToActions, editorInstance) {
    if (callToActions == null || callToActions.length <= 0) {
      this.noCtaSection();
    } else {
      const contentPageCtas = document.getElementById("call-to-actions");
      document.getElementById("cta-style").style.display = "flex";
      document.getElementById("no-cta-message").style.display = "none";
      
      this.renderCtas(callToActions, editorInstance, contentPageCtas);
      this.setupButtonLayoutListeners(editorInstance);
      this.setupBadgeClickListener(editorInstance);
    }
  }

  renderCtas(callToActions, editorInstance, contentPageCtas) {
    contentPageCtas.innerHTML = "";
    callToActions.forEach((cta) => {
      const ctaItem = this.createCtaItem(cta);
      this.attachClickHandler(ctaItem, cta, editorInstance);
      contentPageCtas.appendChild(ctaItem);
    });
  }

  createCtaItem(cta) {
    const ctaItem = document.createElement("div");
    ctaItem.classList.add("call-to-action-item");
    ctaItem.title = cta.CallToActionName;
    ctaItem.id = cta.CallToActionId;
    ctaItem.setAttribute("data-cta-id", cta.CallToActionId);

    const ctaType = this.getCtaType(cta.CallToActionType);
    ctaItem.innerHTML = `<i class="${ctaType.icon}"></i>`;

    return ctaItem;
  }

  getCtaType(type) {
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

    return (
      ctaTypeMap[type] || {
        icon: "fas fa-question",
        iconList: ".fas.fa-question",
      }
    );
  }

  generateCtaComponent(cta, backgroundColor = "#5068a8") {
    const ctaType = this.getCtaType(cta.CallToActionType);
    return `
      <div class="cta-container-child cta-child" 
            id="id-${cta.CallToActionId}"
            data-gjs-type="cta-buttons"
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
            <div class="cta-button" ${defaultConstraints} style="background-color: #5068a8;">
              <i class="${ctaType.icon}" ${defaultConstraints}></i>
              <div class="cta-badge" ${defaultConstraints}><i class="fa fa-minus" ${defaultConstraints}></i></div>
            </div>
            <div class="cta-label" ${defaultConstraints}>${
      cta.CallToActionName
    }</div>
      </div>
    `;
  }

  handleExistingButton(existingButton, cta, selectedComponent, editorInstance) {
    const existingBackgroundColor =
      existingButton.getAttributes()["cta-background-color"];
    const updatedCtaComponent = this.generateCtaComponent(
      cta,
      existingBackgroundColor
    );

    if (
      selectedComponent.getAttributes()["cta-button-id"] === cta.CallToActionId
    ) {
      editorInstance.once("component:add", (component) => {
        const addedComponent = editorInstance
          .getWrapper()
          .find(`#id-${cta.CallToActionId}`)[0];
        if (addedComponent) {
          editorInstance.select(addedComponent);
        }
      });
      selectedComponent.replaceWith(updatedCtaComponent);
    }
  }

  attachClickHandler(ctaItem, cta, editorInstance) {
    ctaItem.onclick = (e) => {
      e.preventDefault();
      const ctaButton = editorInstance
        .getWrapper()
        .find(".cta-button-container")[0];

      if (!ctaButton) {
        console.error("CTA Button container not found.");
        return;
      }

      const selectedComponent = this.manager.editorManager.selectedComponent;
      // if (!selectedComponent) {
      //   console.error("No selected component found.");
      //   return;
      // }

      const existingButton = ctaButton.find(`#id-${cta.CallToActionId}`)?.[0];

      if (existingButton) {
        this.handleExistingButton(
          existingButton,
          cta,
          selectedComponent,
          editorInstance
        );
        return;
      }

      ctaButton.append(this.generateCtaComponent(cta));
    };
  }

  setupButtonLayoutListeners(editorInstance) {
    this.setupPlainButtonListener(editorInstance);
    this.setupImageButtonListener(editorInstance);
  }

  // Helper method to check if component is a valid CTA
  isValidCtaComponent(attributes) {
    return (
      attributes.hasOwnProperty("cta-button-label") &&
      attributes.hasOwnProperty("cta-button-type") &&
      attributes.hasOwnProperty("cta-button-action")
    );
  }

  // Extract CTA attributes from component
  extractCtaAttributes(component) {
    const attributes = component.getAttributes();
    return {
      ctaId: attributes["cta-button-id"],
      ctaName: attributes["cta-button-label"],
      ctaType: attributes["cta-button-type"],
      ctaAction: attributes["cta-button-action"],
      ctaButtonBgColor: attributes["cta-background-color"],
    };
  }

  // Get icon based on CTA type
  getCtaTypeIcon(ctaType) {
    const iconMap = {
      Phone: "fas fa-phone-alt",
      Email: "fas fa-envelope",
      SiteUrl: "fas fa-link",
      Form: "fas fa-file",
    };
    return iconMap[ctaType] || "fas fa-question";
  }

  // Generate common button attributes
  getCommonButtonAttributes(ctaAttributes) {
    const { ctaId, ctaName, ctaType, ctaAction, ctaButtonBgColor } =
      ctaAttributes;
    return `
      data-gjs-draggable="false"
      data-gjs-editable="false"
      data-gjs-highlightable="false"
      data-gjs-droppable="false"
      data-gjs-resizable="false"
      data-gjs-hoverable="false"
      data-gjs-type="cta-buttons"
      id="id-${ctaId}"
      cta-button-id="${ctaId}"
      cta-button-label="${ctaName}"
      cta-button-type="${ctaType}"
      cta-button-action="${ctaAction}"
      cta-background-color="${ctaButtonBgColor}"
      cta-full-width="true"
    `;
  }

  // Generate plain button component
  generatePlainButtonComponent(ctaAttributes) {
    const { ctaName, ctaButtonBgColor } = ctaAttributes;
    return `
      <div class="plain-button-container" ${this.getCommonButtonAttributes(
        ctaAttributes
      )}>
        <button style="background-color: ${ctaButtonBgColor}; border-color: ${ctaButtonBgColor};" 
                class="plain-button" ${defaultConstraints}>
          <div class="cta-badge" ${defaultConstraints}>
            <i class="fa fa-minus" ${defaultConstraints}></i>
          </div>
          ${ctaName}
        </button>
      </div>
    `;
  }

  // Generate image button component
  generateImageButtonComponent(ctaAttributes) {
    const { ctaName, ctaButtonBgColor, ctaType } = ctaAttributes;
    const icon = this.getCtaTypeIcon(ctaType);
    return `
      <div class="img-button-container" ${this.getCommonButtonAttributes(
        ctaAttributes
      )}>
        <div style="background-color: ${ctaButtonBgColor}; border-color: ${ctaButtonBgColor};" 
             class="img-button" ${defaultConstraints}>
          <i class="${icon} img-button-icon" ${defaultConstraints}></i>
          <div class="cta-badge" ${defaultConstraints}>
            <i class="fa fa-minus" ${defaultConstraints}></i>
          </div>
          <span class="img-button-label" ${defaultConstraints}>${ctaName}</span>
          <i class="fa fa-angle-right img-button-arrow" ${defaultConstraints}></i>
        </div>
      </div>
    `;
  }

  // Handle component replacement
  handleComponentReplacement(editorInstance, ctaId, newComponent) {
    editorInstance.once("component:add", () => {
      const addedComponent = editorInstance
        .getWrapper()
        .find(`#id-${ctaId}`)[0];
      if (addedComponent) {
        editorInstance.select(addedComponent);
      }
    });
    this.manager.editorManager.selectedComponent.replaceWith(newComponent);
  }

  // Handle button click
  handleButtonClick(editorInstance, generateComponent) {
    const ctaContainer = editorInstance
      .getWrapper()
      .find(".cta-button-container")[0];
    if (!ctaContainer) return;

    const selectedComponent = this.manager.editorManager.selectedComponent;
    if (!selectedComponent) return;

    const attributes = selectedComponent.getAttributes();
    if (!this.isValidCtaComponent(attributes)) {
      const message = this.currentLanguage.getTranslation(
        "please_select_cta_button"
      );
      this.displayAlertMessage(message, "error");
      return;
    }

    const ctaAttributes = this.extractCtaAttributes(selectedComponent);
    const newComponent = generateComponent(ctaAttributes);
    this.handleComponentReplacement(
      editorInstance,
      ctaAttributes.ctaId,
      newComponent
    );
  }

  // Setup plain button listener
  setupPlainButtonListener(editorInstance) {
    const plainButton = document.getElementById("plain-button-layout");
    plainButton.onclick = (e) => {
      e.preventDefault();
      this.handleButtonClick(editorInstance, (attrs) =>
        this.generatePlainButtonComponent(attrs)
      );
    };
  }

  // Setup image button listener
  setupImageButtonListener(editorInstance) {
    const imgButton = document.getElementById("img-button-layout");
    imgButton.onclick = (e) => {
      e.preventDefault();
      this.handleButtonClick(editorInstance, (attrs) =>
        this.generateImageButtonComponent(attrs)
      );
    };
  }

  setupBadgeClickListener(editorInstance) {
    const wrapper = editorInstance.getWrapper();
    wrapper.view.el.addEventListener("click", (e) => {
      const badge = e.target.closest(".cta-badge");
      if (!badge) return;

      e.stopPropagation();

      const ctaChild = badge.closest(
        ".cta-container-child, .plain-button-container, .img-button-container"
      );
      if (ctaChild)
        if (ctaChild) {
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

  activateCtaBtnStyles(selectedCtaComponent) {
    if (selectedCtaComponent) {
      const isCtaButtonSelected = selectedCtaComponent.findType("cta-buttons");
      if (isCtaButtonSelected) {
        document.querySelector(".cta-button-layout-container").style.display =
          "flex";
      }
    }
  }

  noCtaSection() {
    const contentPageSection = document.getElementById("cta-style");
    if (contentPageSection) {
      contentPageSection.style.display = "none";
      document.getElementById("call-to-actions").innerHTML = "";
      const noCtaDisplayMessage = document.getElementById("no-cta-message");
      if (noCtaDisplayMessage) {
        noCtaDisplayMessage.style.display = "block";
      }

      document.querySelector(".cta-button-layout-container").style.display =
          "none";
    }
  }
}
