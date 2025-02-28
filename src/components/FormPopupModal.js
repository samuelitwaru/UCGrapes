class FormPopupModal {
    title = ""
    htmlBody = ""
    popup = null
    constructor (popupId, title, htmlBody) {
        this.title = title
        this.htmlBody = htmlBody
        this.popupId = popupId
        this.popup = this.createPopup()
    }

    init(){}

    show() {
        document.body.appendChild(this.popup);
        this.popup.style.display = "flex";
        this.addEventListeners()
    }

    closePopup() {
        this.popup.remove()
        this.popup.style.display = "flex";
    }

    createPopup () {
        const popup = document.createElement("div");
        popup.className = "popup-modal";
        popup.innerHTML = `
                <div id="${this.popupId}" class="popup">
                <div class="popup-header">
                    <span>${this.title}</span>
                    <button class="close">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 21 21">
                        <path id="Icon_material-close" data-name="Icon material-close" d="M28.5,9.615,26.385,7.5,18,15.885,9.615,7.5,7.5,9.615,15.885,18,7.5,26.385,9.615,28.5,18,20.115,26.385,28.5,28.5,26.385,20.115,18Z" transform="translate(-7.5 -7.5)" fill="#6a747f" opacity="0.54"/>
                    </svg>
                    </button>
                </div>
                <hr>
                <div class="popup-body" id="confirmation_modal_message">
                    ${this.htmlBody}
                </div>
                <div class="popup-footer">
                    <button id="confirm_button" class="tb-btn tb-btn-primary">
                    Confirm
                    </button>
                    <button id="close_popup" class="tb-btn tb-btn-outline">
                    Cancel
                    </button>
                </div>
                </div>
            `;

        return popup;
    }

    onConfirm (event) {
        alert('add your confirm function')
    }

    addEventListeners () {
        this.cancelButton = document.querySelector(`#close_popup`)
        this.cancelButton.addEventListener("click", (event) => {
            this.closePopup()
        })

        this.closeButton = document.querySelector(`.close`)
        this.closeButton.addEventListener("click", (event) => {
            this.closePopup()
        })

        this.confirmButton = document.querySelector(`#confirm_button`)
        this.confirmButton.addEventListener("click", (event) => {
            this.onConfirm(event)
        })
    }
}