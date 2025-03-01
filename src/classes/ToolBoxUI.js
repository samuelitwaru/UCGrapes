class ToolBoxUI {
  constructor(toolBoxManager) {
    this.manager = toolBoxManager;
    this.currentLanguage = toolBoxManager.currentLanguage;
  }

  updateTileTitle(inputTitle) {
    const selectedComponent = this.manager.editorManager.selectedComponent;
    if (selectedComponent) {
      const titleComponent = selectedComponent.find(".tile-title")[0];
      if (titleComponent) {
        titleComponent.addAttributes({ title: inputTitle });
        titleComponent.addAttributes({ "is-hidden": "false" });

        // titleComponent.components(inputTitle);
        titleComponent.addStyle({ display: "block" });
        const rowContainer = selectedComponent.closest(".container-row");
        if (rowContainer) {
          this.manager.editorManager.templateManager.templateUpdate.updateRightButtons(
            rowContainer
          );
        }
      }
    }
  }

  displayAlertMessage(message, status) {
    const alertContainer = document.getElementById("tb-alerts-container");
    const alertId = Math.random().toString(10);
    const alertBox = this.alertMessage(message, status, alertId);
    alertBox.style.display = "flex";

    const closeButton = alertBox.querySelector(".tb-alert-close-btn");
    closeButton.addEventListener("click", () => {
      this.closeAlert(alertId);
    });

    setTimeout(() => this.closeAlert(alertId), 5000);
    alertContainer.appendChild(alertBox);
  }

  alertMessage(message, status, alertId) {
    const alertBox = document.createElement("div");
    alertBox.id = alertId;
    alertBox.classList = `tb-alert ${
      status == "success" ? "success" : "error"
    }`;
    alertBox.innerHTML = `
        <div class="tb-alert-header">
          <strong>
            ${
              status == "success"
                ? this.currentLanguage.getTranslation("alert_type_success")
                : this.currentLanguage.getTranslation("alert_type_error")
            }
          </strong>
          <span class="tb-alert-close-btn">✖</span>
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
      selectComponent?.getAttributes()?.["cta-background-color"];
    const CtaRadios = document.querySelectorAll(
      '#cta-color-palette input[type="radio"]'
    );

    if (currentCtaBgColor) {
      CtaRadios.forEach((radio) => {
        const colorBox = radio.nextElementSibling;
        radio.checked =
          colorBox.getAttribute("data-cta-color").toUpperCase() ===
          currentCtaBgColor.toUpperCase();
      });
    }

    const ctaSelectedAction = document.getElementById("cta-selected-actions");

    const attributes = selectComponent?.getAttributes();
    ctaSelectedAction.innerHTML = `
        <span><strong>Type:</strong> ${attributes?.["cta-button-type"]}</span>
        <span><strong>Action:</strong> ${attributes?.["cta-button-action"]}</span>
      `;
  }

  updateTemplatePageProperties(selectComponent) {
    this.updateTileOpacityProperties(selectComponent);
    this.updateAlignmentProperties(selectComponent);
    this.updateColorProperties(selectComponent);
    this.updateActionProperties(selectComponent);
  }

  updateTileOpacityProperties(selectComponent) {
    const tileOpacity =
      selectComponent?.getAttributes()?.["tile-bg-image-opacity"] || 0;
      document.getElementById("bg-opacity").value = tileOpacity;
      document.getElementById("valueDisplay").textContent = tileOpacity + " %";
  }

  updateAlignmentProperties(selectComponent) {
    const currentAlign = selectComponent?.getAttributes()?.["tile-align"];
    if (currentAlign) {
      ["center", "left"].forEach((align) => {
        const alignElement = document.getElementById(`tile-${align}`);
        if (alignElement) {
          alignElement.checked = currentAlign === align;
        }
      });
    }
  }

  updateColorProperties(selectComponent) {
    const currentTextColor =
      selectComponent?.getAttributes()?.["tile-text-color"];
    const textColorRadios = document.querySelectorAll(
      '.text-color-palette.text-colors .color-item input[type="radio"]'
    );
    textColorRadios.forEach((radio) => {
      const colorBox = radio.nextElementSibling;
      radio.checked =
        colorBox.getAttribute("data-tile-color") === currentTextColor;
    });

    // Update background color
    const currentBgColor = selectComponent?.getAttributes()?.["tile-bgcolor"];
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
      selectComponent?.getAttributes()?.["tile-bg-image-opacity"];

    const imageOpacity = document.getElementById("bg-opacity");
    imageOpacity.value = currentTileOpacity;
  }

  updateActionProperties(selectComponent) {
    let currentActionName =
      selectComponent?.getAttributes()?.["tile-action-object"];
    const currentActionId =
      selectComponent?.getAttributes()?.["tile-action-object-id"];
    const propertySection = document.getElementById("selectedOption");
    const selectedOptionElement = document.getElementById(currentActionId);

    const allOptions = document.querySelectorAll(".category-content li");
    allOptions.forEach((option) => {
      option.style.background = "";
    });
    propertySection.innerHTML = `<span id="sidebar_select_action_label">
                  ${this.currentLanguage.getTranslation(
                    "sidebar_select_action_label"
                  )}
                  </span>
                  <i class="fa fa-angle-down">
                  </i>`;
    if (currentActionName && currentActionId) {
      currentActionName = currentActionName
        .replace("Predefined Page", "Module") // Replace Predefined Page with Module (Temporary Fix)
        .replace("Service/Product Page", "Service Page"); // Replace Predefined Page with Module (Temporary Fix)
      propertySection.textContent = currentActionName;
      propertySection.innerHTML += ' <i class="fa fa-angle-down"></i>';
      if (selectedOptionElement) {
        selectedOptionElement.style.background = "#f0f0f0";
      }
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
    ctaItem.innerHTML = `${ctaType.icon}`;

    return ctaItem;
  }

  getCtaType(type) {
    const ctaTypeMap = {
      Phone: {
        icon: `<svg ${defaultConstraints} xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 49.417 49.418">
                <path ${defaultConstraints} id="call" d="M29.782,3a2.149,2.149,0,1,0,0,4.3A19.3,19.3,0,0,1,49.119,26.634a2.149,2.149,0,1,0,4.3,0A23.667,23.667,0,0,0,29.782,3ZM12.032,7.305a2.548,2.548,0,0,0-.818.067,8.342,8.342,0,0,0-3.9,2.342C2.775,14.254.366,21.907,17.437,38.98S42.16,53.643,46.7,49.1a8.348,8.348,0,0,0,2.346-3.907,2.524,2.524,0,0,0-1.179-2.786c-2.424-1.418-7.654-4.484-10.08-5.9a2.523,2.523,0,0,0-2.568.012l-4.012,2.392a2.517,2.517,0,0,1-2.845-.168,65.811,65.811,0,0,1-5.711-4.981,65.07,65.07,0,0,1-4.981-5.711A2.512,2.512,0,0,1,17.5,25.2L19.9,21.191a2.533,2.533,0,0,0,.008-2.577L14.012,8.556A2.543,2.543,0,0,0,12.032,7.305Zm17.751,4.289a2.149,2.149,0,1,0,0,4.3A10.709,10.709,0,0,1,40.525,26.634a2.149,2.149,0,1,0,4.3,0A15.072,15.072,0,0,0,29.782,11.594Zm0,8.594a2.149,2.149,0,1,0,0,4.3,2.114,2.114,0,0,1,2.149,2.148,2.149,2.149,0,1,0,4.3,0A6.479,6.479,0,0,0,29.782,20.188Z" transform="translate(-4 -3)" fill="#fff"></path>
              </svg>`,
        iconList: ".fas.fa-phone-alt",
        iconBgColor: "#2c405a",
      },
      Email: {
        icon: `<svg ${defaultConstraints} xmlns="http://www.w3.org/2000/svg" width="32" height="28" viewBox="0 0 41 32.8">
            <path ${defaultConstraints} id="Path_1218" data-name="Path 1218" d="M6.1,4A4.068,4.068,0,0,0,2.789,5.7a1.5,1.5,0,0,0,.444,2.126l18,11.219a2.387,2.387,0,0,0,2.531,0L41.691,7.732a1.5,1.5,0,0,0,.384-2.2A4.063,4.063,0,0,0,38.9,4Zm35.907,8.376a.963.963,0,0,0-.508.152L23.765,23.711a2.392,2.392,0,0,1-2.531,0L3.5,12.656a.98.98,0,0,0-1.5.833V32.7a4.1,4.1,0,0,0,4.1,4.1H38.9A4.1,4.1,0,0,0,43,32.7V13.357A.981.981,0,0,0,42.007,12.376Z" transform="translate(-2 -4)" fill="#fff"/>
          </svg>`,
        iconList: ".fas.fa-envelope",
        iconBgColor: "#d4a76a",
      },
      SiteUrl: {
        icon: `<svg ${defaultConstraints} xmlns="http://www.w3.org/2000/svg" width="26" height="30" viewBox="0 0 9.552 9.552">
              <path ${defaultConstraints} id="Path_1213" data-name="Path 1213" d="M11.064,4A2.485,2.485,0,0,0,9.3,4.734l-.585.585A2.488,2.488,0,0,0,7.98,7.084a2.45,2.45,0,0,0,.174.908L8.8,7.346a1.706,1.706,0,0,1,.473-1.468l.585-.585a1.7,1.7,0,0,1,1.206-.5,1.675,1.675,0,0,1,1.194.5,1.7,1.7,0,0,1,0,2.4l-.585.585a1.7,1.7,0,0,1-1.206.5,1.456,1.456,0,0,1-.261-.025L9.559,9.4a2.45,2.45,0,0,0,.908.174,2.486,2.486,0,0,0,1.766-.734l.585-.585a2.488,2.488,0,0,0,.734-1.766A2.506,2.506,0,0,0,11.064,4Zm-.983,2.9L6.9,10.082l.572.572L10.654,7.47Zm-3,1.082a2.485,2.485,0,0,0-1.766.734L4.734,9.3A2.488,2.488,0,0,0,4,11.064a2.506,2.506,0,0,0,2.487,2.487,2.486,2.486,0,0,0,1.766-.734l.585-.585a2.488,2.488,0,0,0,.734-1.766A2.45,2.45,0,0,0,9.4,9.559l-.647.647a1.706,1.706,0,0,1-.473,1.468l-.585.585a1.7,1.7,0,0,1-1.206.5,1.675,1.675,0,0,1-1.194-.5,1.7,1.7,0,0,1,0-2.4l.585-.585a1.7,1.7,0,0,1,1.206-.5,1.457,1.457,0,0,1,.261.025l.647-.647A2.45,2.45,0,0,0,7.084,7.98Z" transform="translate(-4 -4)" fill="#fff"/>
            </svg>`,
        iconList: ".fas.fa-link",
        iconBgColor: "#b2b997",
      },
      Form: {
        icon: `<svg ${defaultConstraints} xmlns="http://www.w3.org/2000/svg" width="26" height="30" viewBox="0 0 13 16">
            <path ${defaultConstraints} id="Path_1209" data-name="Path 1209" d="M9.828,4A1.823,1.823,0,0,0,8,5.8V18.2A1.823,1.823,0,0,0,9.828,20h9.344A1.823,1.823,0,0,0,21,18.2V9.8a.6.6,0,0,0-.179-.424l-.006-.006L15.54,4.176A.614.614,0,0,0,15.109,4Zm0,1.2H14.5V8.6a1.823,1.823,0,0,0,1.828,1.8h3.453v7.8a.6.6,0,0,1-.609.6H9.828a.6.6,0,0,1-.609-.6V5.8A.6.6,0,0,1,9.828,5.2Zm5.891.848L18.92,9.2H16.328a.6.6,0,0,1-.609-.6Z" transform="translate(-8 -4)" fill="#fff"/>
          </svg>`,
        iconList: ".fas.fa-file",
        iconBgColor: "#c4a082",
      },
    };

    return (
      ctaTypeMap[type] || {
        icon: "fas fa-question",
        iconList: ".fas.fa-question",
        iconBgColor: "#c4a082",
      }
    );
  }

  generateCtaComponent(cta, backgroundColor) {
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
          cta-background-color="${ctaType.iconBgColor}"
          >
            <div class="cta-button" ${defaultConstraints} style="background-color: ${
              backgroundColor || ctaType.iconBgColor
            };">
              ${ctaType.icon}
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
      Phone: `<svg ${defaultConstraints} xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 49.417 49.418">
                <path ${defaultConstraints} id="call" d="M29.782,3a2.149,2.149,0,1,0,0,4.3A19.3,19.3,0,0,1,49.119,26.634a2.149,2.149,0,1,0,4.3,0A23.667,23.667,0,0,0,29.782,3ZM12.032,7.305a2.548,2.548,0,0,0-.818.067,8.342,8.342,0,0,0-3.9,2.342C2.775,14.254.366,21.907,17.437,38.98S42.16,53.643,46.7,49.1a8.348,8.348,0,0,0,2.346-3.907,2.524,2.524,0,0,0-1.179-2.786c-2.424-1.418-7.654-4.484-10.08-5.9a2.523,2.523,0,0,0-2.568.012l-4.012,2.392a2.517,2.517,0,0,1-2.845-.168,65.811,65.811,0,0,1-5.711-4.981,65.07,65.07,0,0,1-4.981-5.711A2.512,2.512,0,0,1,17.5,25.2L19.9,21.191a2.533,2.533,0,0,0,.008-2.577L14.012,8.556A2.543,2.543,0,0,0,12.032,7.305Zm17.751,4.289a2.149,2.149,0,1,0,0,4.3A10.709,10.709,0,0,1,40.525,26.634a2.149,2.149,0,1,0,4.3,0A15.072,15.072,0,0,0,29.782,11.594Zm0,8.594a2.149,2.149,0,1,0,0,4.3,2.114,2.114,0,0,1,2.149,2.148,2.149,2.149,0,1,0,4.3,0A6.479,6.479,0,0,0,29.782,20.188Z" transform="translate(-4 -3)" fill="#fff"></path>
              </svg>`,
      Email: `<svg ${defaultConstraints} xmlns="http://www.w3.org/2000/svg" width="32" height="28" viewBox="0 0 41 32.8">
            <path ${defaultConstraints} id="Path_1218" data-name="Path 1218" d="M6.1,4A4.068,4.068,0,0,0,2.789,5.7a1.5,1.5,0,0,0,.444,2.126l18,11.219a2.387,2.387,0,0,0,2.531,0L41.691,7.732a1.5,1.5,0,0,0,.384-2.2A4.063,4.063,0,0,0,38.9,4Zm35.907,8.376a.963.963,0,0,0-.508.152L23.765,23.711a2.392,2.392,0,0,1-2.531,0L3.5,12.656a.98.98,0,0,0-1.5.833V32.7a4.1,4.1,0,0,0,4.1,4.1H38.9A4.1,4.1,0,0,0,43,32.7V13.357A.981.981,0,0,0,42.007,12.376Z" transform="translate(-2 -4)" fill="#fff"/>
          </svg>`,
      SiteUrl: `<svg ${defaultConstraints} xmlns="http://www.w3.org/2000/svg" width="26" height="30" viewBox="0 0 9.552 9.552">
              <path ${defaultConstraints} id="Path_1213" data-name="Path 1213" d="M11.064,4A2.485,2.485,0,0,0,9.3,4.734l-.585.585A2.488,2.488,0,0,0,7.98,7.084a2.45,2.45,0,0,0,.174.908L8.8,7.346a1.706,1.706,0,0,1,.473-1.468l.585-.585a1.7,1.7,0,0,1,1.206-.5,1.675,1.675,0,0,1,1.194.5,1.7,1.7,0,0,1,0,2.4l-.585.585a1.7,1.7,0,0,1-1.206.5,1.456,1.456,0,0,1-.261-.025L9.559,9.4a2.45,2.45,0,0,0,.908.174,2.486,2.486,0,0,0,1.766-.734l.585-.585a2.488,2.488,0,0,0,.734-1.766A2.506,2.506,0,0,0,11.064,4Zm-.983,2.9L6.9,10.082l.572.572L10.654,7.47Zm-3,1.082a2.485,2.485,0,0,0-1.766.734L4.734,9.3A2.488,2.488,0,0,0,4,11.064a2.506,2.506,0,0,0,2.487,2.487,2.486,2.486,0,0,0,1.766-.734l.585-.585a2.488,2.488,0,0,0,.734-1.766A2.45,2.45,0,0,0,9.4,9.559l-.647.647a1.706,1.706,0,0,1-.473,1.468l-.585.585a1.7,1.7,0,0,1-1.206.5,1.675,1.675,0,0,1-1.194-.5,1.7,1.7,0,0,1,0-2.4l.585-.585a1.7,1.7,0,0,1,1.206-.5,1.457,1.457,0,0,1,.261.025l.647-.647A2.45,2.45,0,0,0,7.084,7.98Z" transform="translate(-4 -4)" fill="#fff"/>
            </svg>`,
      Form: `<svg ${defaultConstraints} xmlns="http://www.w3.org/2000/svg" width="26" height="30" viewBox="0 0 13 16">
            <path ${defaultConstraints} id="Path_1209" data-name="Path 1209" d="M9.828,4A1.823,1.823,0,0,0,8,5.8V18.2A1.823,1.823,0,0,0,9.828,20h9.344A1.823,1.823,0,0,0,21,18.2V9.8a.6.6,0,0,0-.179-.424l-.006-.006L15.54,4.176A.614.614,0,0,0,15.109,4Zm0,1.2H14.5V8.6a1.823,1.823,0,0,0,1.828,1.8h3.453v7.8a.6.6,0,0,1-.609.6H9.828a.6.6,0,0,1-.609-.6V5.8A.6.6,0,0,1,9.828,5.2Zm5.891.848L18.92,9.2H16.328a.6.6,0,0,1-.609-.6Z" transform="translate(-8 -4)" fill="#fff"/>
          </svg>`,
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
          <span class="img-button-icon" ${defaultConstraints}>${icon}</span>
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