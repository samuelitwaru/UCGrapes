class PopupManager {
    constructor(toolBoxManager) {
      this.toolBoxManager = toolBoxManager;
    }
  
    popupModal() {
      const popup = document.createElement("div");
      popup.className = "popup-modal";
      popup.innerHTML = `
            <div class="popup">
              <div class="popup-header">
                <span>${this.toolBoxManager.currentLanguage.getTranslation(
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
                ${this.toolBoxManager.currentLanguage.getTranslation(
                  "confirmation_modal_message"
                )}
              </div>
              <div class="popup-footer">
                <button id="accept_popup" class="tb-btn tb-btn-primary">
                ${this.toolBoxManager.currentLanguage.getTranslation(
                  "accept_popup"
                )}
                </button>
                <button id="close_popup" class="tb-btn tb-btn-outline">
                ${this.toolBoxManager.currentLanguage.getTranslation(
                  "cancel_btn"
                )}
                </button>
              </div>
            </div>
          `;
  
      return popup;
    }
  }