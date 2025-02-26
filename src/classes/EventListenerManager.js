class EventListenerManager {
  constructor(toolBoxManager) {
    this.toolBoxManager = toolBoxManager;
  }

  setupTabListeners() {
    const tabButtons = document.querySelectorAll(".tb-tab-button");
    const tabContents = document.querySelectorAll(".tb-tab-content");
    tabButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        tabContents.forEach((content) => (content.style.display = "none"));

        button.classList.add("active");
        document.querySelector(`#${button.dataset.tab}-content`).style.display =
          "block";
      });
    });
  }

  setupMappingListeners() {
    const mappingButton = document.getElementById("open-mapping");
    const publishButton = document.getElementById("publish");
    const mappingSection = document.getElementById("mapping-section");
    const toolsSection = document.getElementById("tools-section");

    this.toolBoxManager.mappingComponent = new MappingComponent(
      this.toolBoxManager.dataManager,
      this.toolBoxManager.editorManager,
      this.toolBoxManager,
      this.toolBoxManager.currentLanguage
    );

    mappingButton.addEventListener("click", (e) => {
      e.preventDefault();

      toolsSection.style.display =
        toolsSection.style.display === "none" ? "block" : "none";

      mappingSection.style.display =
        mappingSection.style.display === "block" ? "none" : "block";

      this.toolBoxManager.mappingComponent.init();
    });
  }

  setupPublishListeners() {
    const publishButton = document.getElementById("publish");

    publishButton.onclick = (e) => {
      e.preventDefault();
      const popup = document.createElement("div");
      popup.className = "popup-modal";
      popup.innerHTML = `
                <div class="popup">
                  <div class="popup-header">
                    <span>${this.toolBoxManager.currentLanguage.getTranslation(
                      "publish_confirm_title"
                    )}</span>
                    <button class="close">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 21 21">
                          <path id="Icon_material-close" data-name="Icon material-close" d="M28.5,9.615,26.385,7.5,18,15.885,9.615,7.5,7.5,9.615,15.885,18,7.5,26.385,9.615,28.5,18,20.115,26.385,28.5,28.5,26.385,20.115,18Z" transform="translate(-7.5 -7.5)" fill="#6a747f" opacity="0.54"/>
                      </svg>
                    </button>
                  </div>
                  <hr>
                  <div class="popup-body" id="confirmation_modal_message">
                  ${this.toolBoxManager.currentLanguage.getTranslation(
                    "publish_confirm_message"
                  )}
                    <label for="notify_residents" class="notify_residents">
                        <input type="checkbox" id="notify_residents" name="notify_residents">
                        <span>${this.toolBoxManager.currentLanguage.getTranslation(
                          "nofity_residents_on_publish"
                        )}</span>
                    </label>
                  </div>
                  <div class="popup-footer">
                    <button id="yes_publish" class="tb-btn tb-btn-primary">
                    ${this.toolBoxManager.currentLanguage.getTranslation(
                      "publish_confirm_button"
                    )}
                    </button>
                    <button id="close_popup" class="tb-btn tb-btn-outline">
                    ${this.toolBoxManager.currentLanguage.getTranslation(
                      "publish_cancel_button"
                    )}
                    </button>
                  </div>
                </div>
              `;

      document.body.appendChild(popup);
      popup.style.display = "flex";

      const publishButton = popup.querySelector("#yes_publish");
      const closeButton = popup.querySelector("#close_popup");
      const closePopup = popup.querySelector(".close");

      publishButton.addEventListener("click", () => {
        const isNotifyResidents =
          document.getElementById("notify_residents").checked;
        this.toolBoxManager.publishPages(isNotifyResidents);
        popup.remove();
      });

      closeButton.addEventListener("click", () => {
        popup.remove();
      });

      closePopup.addEventListener("click", () => {
        popup.remove();
      });
    };
  }

  setupAlignmentListeners() {
    const leftAlign = document.getElementById("tile-left");
    const centerAlign = document.getElementById("tile-center");

    leftAlign.addEventListener("click", () => {
      if (this.toolBoxManager.editorManager.selectedTemplateWrapper) {
        const templateBlock =
          this.toolBoxManager.editorManager.selectedComponent;

        if (templateBlock) {
          templateBlock.addStyle({
            "align-items": "start",
            "justify-content": "start",
          });
          this.toolBoxManager.setAttributeToSelected("tile-align", "left");
        }
      } else {
        const message = this.toolBoxManager.currentLanguage.getTranslation(
          "no_tile_selected_error_message"
        );
        this.toolBoxManager.ui.displayAlertMessage(message, "error");
      }
    });

    centerAlign.addEventListener("click", () => {
      if (this.toolBoxManager.editorManager.selectedTemplateWrapper) {
        const templateBlock =
          this.toolBoxManager.editorManager.selectedComponent;
        if (templateBlock) {
          templateBlock.addStyle({
            "align-items": "center",
            "justify-content": "center",
          });

          this.toolBoxManager.setAttributeToSelected(
            "tile-align",
            "center"
          );
        }
      } else {
        const message = this.toolBoxManager.currentLanguage.getTranslation(
          "no_tile_selected_error_message"
        );
        this.toolBoxManager.ui.displayAlertMessage(message, "error");
      }
    });

    // const iconLeftAlign = document.getElementById("icon-align-left");
    // const iconRightAlign = document.getElementById("icon-align-right");

    // iconLeftAlign.addEventListener("click", () => {
    //   if (this.toolBoxManager.editorManager.selectedTemplateWrapper) {
    //     const templateBlock =
    //       this.toolBoxManager.editorManager.selectedComponent.find(
    //         ".tile-icon-section"
    //       )[0];
    //     if (templateBlock) {
    //       templateBlock.setStyle({
    //         display: "flex",
    //         "align-self": "start",
    //       });
    //       this.toolBoxManager.setAttributeToSelected("tile-icon-align", "left");
    //     }
    //   } else {
    //     const message = this.toolBoxManager.currentLanguage.getTranslation(
    //       "no_tile_selected_error_message"
    //     );
    //     this.toolBoxManager.ui.displayAlertMessage(message, "error");
    //   }
    // });


    // iconRightAlign.addEventListener("click", () => {
    //   if (this.toolBoxManager.editorManager.selectedTemplateWrapper) {
    //     const templateBlock =
    //       this.toolBoxManager.editorManager.selectedComponent.find(
    //         ".tile-icon-section"
    //       )[0];

    //     if (templateBlock) {
    //       templateBlock.setStyle({
    //         display: "flex",
    //         "align-self": "end",
    //       });
    //       this.toolBoxManager.setAttributeToSelected(
    //         "tile-icon-align",
    //         "right"
    //       );
    //     } else {
    //     }
    //   } else {
    //     const message = this.toolBoxManager.currentLanguage.getTranslation(
    //       "no_tile_selected_error_message"
    //     );
    //     this.toolBoxManager.ui.displayAlertMessage(message, "error");
    //   }
    // });
  }

  setupOpacityListener() {
    const imageOpacity = document.getElementById("bg-opacity");

    imageOpacity.addEventListener("input", (event) => {
      const value = event.target.value;

      if (this.toolBoxManager.editorManager.selectedTemplateWrapper) {
        const templateBlock =
          this.toolBoxManager.editorManager.selectedComponent;

        if (templateBlock) {
          const currentBgStyle = templateBlock.getStyle()["background-color"];
          let currentBgColor;
          
          if (currentBgStyle.length > 7) {
            currentBgColor = currentBgStyle.substring(0, 7);
          } else {
            currentBgColor = currentBgStyle;
          }

          const bgColor = addOpacityToHex(currentBgColor, value)

          templateBlock.addStyle({
            "background-color": bgColor,
          });

          templateBlock.addAttributes({
            "tile-bg-image-opacity": value,
          })

          templateBlock.addAttributes({
            "tile-bgcolor": bgColor,
          })
        }
      }
    });
  }

  setupAutoSave() {
    setInterval(() => {
      const editors = Object.values(this.toolBoxManager.editorManager.editors);

      if (!this.toolBoxManager.previousStates) {
        this.toolBoxManager.previousStates = new Map();
      }
      if (editors && editors.length) {
        for (let index = 0; index < editors.length; index++) {
          const editorData = editors[index];
          const editor = editorData.editor;
          const pageId = editorData.pageId;

          if (!this.toolBoxManager.previousStates.has(pageId)) {
            this.toolBoxManager.previousStates.set(pageId, editor.getHtml());
          }

          const currentState = editor.getHtml();

          if (currentState !== this.toolBoxManager.previousStates.get(pageId)) {
            this.toolBoxManager.autoSavePage(editorData);

            this.toolBoxManager.previousStates.set(pageId, currentState);
          }
        }
      }
    }, 10000);
  }
}
