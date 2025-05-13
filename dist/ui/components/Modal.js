"use strict";
class Modal {
    constructor(options) {
        this.modalContainer = document.createElement("div");
        this.modalContainer.className = "popup-modal-link";
        this.modalContainer.style.display = "flex";
        const popup = document.createElement("div");
        popup.className = "popup";
        if (options.width) {
            popup.style.width = options.width;
        }
        const popupHeader = document.createElement("div");
        popupHeader.className = "popup-header";
        const popupTitle = document.createElement("span");
        popupTitle.textContent = options.title;
        const hr = document.createElement("hr");
        this.popupBody = document.createElement("div");
        this.popupBody.className = "popup-body";
        if (options.body) {
            if (typeof options.body === "string") {
                this.popupBody.innerHTML = options.body;
            }
            else {
                this.popupBody.appendChild(options.body);
            }
        }
        const closeButton = this.createCloseButton();
        popupHeader.appendChild(popupTitle);
        popupHeader.appendChild(closeButton);
        popup.appendChild(popupHeader);
        popup.appendChild(hr);
        popup.appendChild(this.popupBody);
        this.modalContainer.appendChild(popup);
    }
    createCloseButton() {
        const closeButton = document.createElement("button");
        closeButton.className = "close";
        closeButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 21 21">
                <path id="Icon_material-close" data-name="Icon material-close" d="M28.5,9.615,26.385,7.5,18,15.885,9.615,7.5,7.5,9.615,15.885,18,7.5,26.385,9.615,28.5,18,20.115,26.385,28.5,28.5,26.385,20.115,18Z" transform="translate(-7.5 -7.5)" fill="#6a747f" opacity="0.54"></path>
            </svg>
        `;
        closeButton.addEventListener("click", () => this.close());
        return closeButton;
    }
    open(container) {
        const targetContainer = container || document.body;
        targetContainer.appendChild(this.modalContainer);
    }
    close() {
        this.modalContainer.remove();
    }
}
// const modal = new Modal({
//     title: "Welcome",
//     width: "400px",
//     body: "Hello, this is a custom modal!"
// });
// // Show the modal
// modal.open();
//# sourceMappingURL=Modal.js.map