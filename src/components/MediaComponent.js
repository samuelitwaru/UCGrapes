class MediaComponent {
  constructor(dataManager, editorManager, currentLanguage, toolBoxManager) {
    this.dataManager = dataManager;
    this.editorManager = editorManager;
    this.toolBoxManager = toolBoxManager;
    this.currentLanguage = currentLanguage;
    this.selectedFile = null;
    this.init();
  }

  init() {
    this.setupFileManager();
  }

  formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${Math.round(bytes / 1024 / 1024)} MB`;
    return `${Math.round(bytes / 1024 / 1024 / 1024)} GB`;
  }

  createModalHeader() {
    const header = document.createElement("div");
    header.className = "tb-modal-header";
    header.innerHTML = `
          <h2>${this.currentLanguage.getTranslation(
            "file_upload_modal_title"
          )}</h2>
          <span class="close">
            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21">
              <path id="Icon_material-close" data-name="Icon material-close" d="M28.5,9.615,26.385,7.5,18,15.885,9.615,7.5,7.5,9.615,15.885,18,7.5,26.385,9.615,28.5,18,20.115,26.385,28.5,28.5,26.385,20.115,18Z" transform="translate(-7.5 -7.5)" fill="#6a747f" opacity="0.54"/>
            </svg>
          </span>
        `;
    return header;
  }

  createUploadArea() {
    const uploadArea = document.createElement("div");
    uploadArea.className = "upload-area";
    uploadArea.id = "uploadArea";
    uploadArea.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="40.999" height="28.865" viewBox="0 0 40.999 28.865">
            <path id="Path_1040" data-name="Path 1040" d="M21.924,11.025a3.459,3.459,0,0,0-3.287,3.608,3.459,3.459,0,0,0,3.287,3.608,3.459,3.459,0,0,0,3.287-3.608A3.459,3.459,0,0,0,21.924,11.025ZM36.716,21.849l-11.5,14.432-8.218-9.02L8.044,39.89h41Z" transform="translate(-8.044 -11.025)" fill="#afadad"/>
          </svg>
          <div class="upload-text">
            ${this.currentLanguage.getTranslation("upload_section_text")}
          </div>
        `;

    // Add drag and drop event listeners
    this.setupDragAndDrop(uploadArea);

    return uploadArea;
  }

  setupDragAndDrop(uploadArea) {
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      uploadArea.addEventListener(eventName, preventDefaults, false);
      document.body.addEventListener(eventName, preventDefaults, false);
    });

    ["dragenter", "dragover"].forEach((eventName) => {
      uploadArea.addEventListener(eventName, () => {
        uploadArea.classList.add("drag-over");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      uploadArea.addEventListener(eventName, () => {
        uploadArea.classList.remove("drag-over");
      });
    });

    uploadArea.addEventListener("drop", (e) => {
      const files = Array.from(e.dataTransfer.files);
      this.handleDroppedFiles(files);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  handleDroppedFiles(files) {
    const validFiles = files.filter((file) =>
      ["image/jpeg", "image/jpg", "image/png"].includes(file.type)
    );

    if (validFiles.length !== files.length) {
      this.toolBoxManager.ui.displayAlertMessage(
        `${this.currentLanguage.getTranslation("invalid_file_type_message")}`,
        "error"
      );
    }

    const fileList = document.querySelector("#fileList");
    if (!fileList) return;

    validFiles.forEach((file) => {
      const imageName = `${Date.now()}-${file.name}`;
      this.processUploadedFile(file, imageName, fileList);
    });
  }

  createModalActions() {
    const actions = document.createElement("div");
    actions.className = "modal-actions";
    actions.innerHTML = `
          <button class="tb-btn tb-btn-outline" id="cancelBtn">${this.currentLanguage.getTranslation(
            "cancel_btn"
          )}</button>
          <button class="tb-btn tb-btn-primary" id="saveBtn">${this.currentLanguage.getTranslation(
            "save_btn"
          )}</button>
        `;
    return actions;
  }

  openFileUploadModal() {
    const modal = document.createElement("div");
    modal.className = "tb-modal";

    const modalContent = document.createElement("div");
    modalContent.className = "tb-modal-content";

    const fileListHtml = this.createExistingFileListHTML();

    modalContent.appendChild(this.createModalHeader());
    modalContent.appendChild(this.createUploadArea());

    const fileListContainer = document.createElement("div");
    fileListContainer.className = "file-list";
    fileListContainer.id = "fileList";
    fileListContainer.innerHTML = fileListHtml;
    modalContent.appendChild(fileListContainer);

    modalContent.appendChild(this.createModalActions());

    modal.appendChild(modalContent);
    return modal;
  }

  createExistingFileListHTML() {
    const removeBeforeFirstHyphen = (str) => str.split("-").slice(1).join("-");
    return this.dataManager.media
      .map(
        (file) => `
                <div class="file-item valid" 
                    data-MediaId="${file.MediaId}" 
                    data-MediaUrl="${file.MediaUrl}" 
                    data-MediaName="${file.MediaName}">
                  <img src="${file.MediaUrl}" alt="${
          file.MediaName
        }" class="preview-image">
                  <div class="file-info">
                    <div class="file-name">${removeBeforeFirstHyphen(
                      file.MediaName
                    )}</div>
                    <div class="file-size">${this.formatFileSize(
                      file.MediaSize
                    )}</div>
                  </div>
                  <span class="status-icon" style="color: green;"></span>
                  <span title="Delete file" class="delete-media fa-regular fa-trash-can" data-mediaid="${
                    file.MediaId
                  }"></span>
                </div>
              `
      )
      .join("");
  }

  setupFileManager() {
    const openModal = document.getElementById("image-bg");
    const fileInputField = this.createFileInputField();
    const modal = this.openFileUploadModal();

    let allUploadedFiles = [];

    openModal.addEventListener("click", (e) => {
      e.preventDefault();
      this.handleModalOpen(modal, fileInputField, allUploadedFiles);
    });
  }

  createFileInputField() {
    const fileInputField = document.createElement("input");
    fileInputField.type = "file";
    fileInputField.multiple = true;
    fileInputField.accept = "image/jpeg, image/jpg, image/png";
    fileInputField.id = "fileInput";
    fileInputField.style.display = "none";
    return fileInputField;
  }

  handleModalOpen(
    modal,
    fileInputField,
    allUploadedFiles,
    isTile = true,
    type = ""
  ) {
    if (isTile && !this.editorManager.selectedComponent) {
      this.toolBoxManager.ui.displayAlertMessage(
        `${this.currentLanguage.getTranslation(
          "no_tile_selected_error_message"
        )}`,
        "error"
      );
      return;
    } else {
      this.isTile = isTile;
      this.type = type;
    }

    $(".delete-media").on("click", (e) => {
      e.stopPropagation();
      const mediaId = e.target.dataset.mediaid;
      if (mediaId) {
        this.deleteMedia(mediaId);
      }
    });

    document.body.appendChild(modal);
    document.body.appendChild(fileInputField);

    this.setupModalEventListeners(modal, fileInputField, allUploadedFiles);
  }

  setupModalEventListeners(modal, fileInputField, allUploadedFiles) {
    this.addFileItemClickListeners(modal);
    this.addDeleteMediaListeners(modal);
    this.setupModalInteractions(modal, fileInputField, allUploadedFiles);

    // Add drag and drop styling
    const style = document.createElement("style");
    style.textContent = `
            .upload-area {
                position: relative;
                border: 2px dashed #ccc;
                border-radius: 8px;
                padding: 40px 20px;
                text-align: center;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            
            .upload-area.drag-over {
                background-color: rgba(33, 150, 243, 0.05);
                border-color: #222f54;
            }
            
            .upload-text {
                margin-top: 15px;
                color: #666;
            }            
        `;
    document.head.appendChild(style);
  }

  addFileItemClickListeners(modal) {
    const fileItems = modal.querySelectorAll(".file-item");
    fileItems.forEach((element) => {
      element.addEventListener("click", () => {
        this.mediaFileClicked(element);
      });
    });
  }

  addDeleteMediaListeners(modal) {
    $(modal)
      .find(".delete-media")
      .on("click", (e) => {
        const mediaId = e.target.dataset.mediaid;
        if (mediaId) {
          const popup = this.popupModal(
            `${this.currentLanguage.getTranslation(
              "delete_media_modal_title"
            )}`,
            `${this.currentLanguage.getTranslation(
              "delete_media_modal_message"
            )}`
          );
          document.body.appendChild(popup);
          popup.style.display = "flex";

          this.setupPopupButtonListeners(popup, mediaId);
        }
      });
  }

  setupPopupButtonListeners(popup, mediaId) {
    const confirmButton = popup.querySelector("#yes_delete");
    confirmButton.onclick = () => {
      this.deleteMedia(mediaId);
      popup.style.display = "none";
    };

    const cancelButton = popup.querySelector("#close_popup");
    cancelButton.onclick = () => {
      popup.style.display = "none";
    };

    const closePopup = popup.querySelector(".close");
    closePopup.addEventListener("click", () => {
      popup.remove();
    });
  }

  setupModalInteractions(modal, fileInputField, allUploadedFiles) {
    const uploadArea = modal.querySelector("#uploadArea");
    const fileList = modal.querySelector("#fileList");
    const closeButton = modal.querySelector(".close");
    const cancelBtn = modal.querySelector("#cancelBtn");
    const saveBtn = modal.querySelector("#saveBtn");

    uploadArea.onclick = () => fileInputField.click();

    fileInputField.onchange = (event) => {
      this.handleFileInputChange(event, allUploadedFiles, fileList);
    };

    closeButton.onclick = cancelBtn.onclick = () => {
      this.closeModal(modal, fileInputField);
    };

    saveBtn.onclick = () => {
      if (!this.isTile) {
        if (this.selectedFile?.MediaUrl) {
          const safeMediaUrl = encodeURI(this.selectedFile.MediaUrl);
          this.closeModal(modal, fileInputField);
          if (this.type === "logo") {
            this.changeLogo(safeMediaUrl);
          } else if (this.type === "profile-image") {
            this.changeProfile(safeMediaUrl);
          }
        }

        this.closeModal(modal, fileInputField);
      } else {
        this.saveSelectedFile(modal, fileInputField);
      }
    };

    modal.style.display = "flex";
  }

  handleFileInputChange(event, allUploadedFiles, fileList) {
    const newFiles = Array.from(event.target.files).filter((file) =>
      ["image/jpeg", "image/jpg", "image/png"].includes(file.type)
    );
    allUploadedFiles.push(...newFiles);

    newFiles.forEach((file) => {
      const imageName = `${Date.now()}-${file.name}`;
      this.processUploadedFile(file, imageName, fileList);
    });
  }

  async processUploadedFile(file, imageName, fileList) {
    try {
      const imageCropper = new ImageCropper(532, 250);
      const resizedBlob = await imageCropper.processImage(file);

      const resizedFile = new File([resizedBlob], file.name, {
        type: file.type,
      });

      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(resizedBlob);
      });

      const cleanImageName = imageName.replace(/'/g, "");

      const response = await this.dataManager.uploadFile(
        dataUrl,
        cleanImageName,
        resizedFile.size,
        resizedFile.type
      );

      if (this.toolBoxManager.checkIfNotAuthenticated(response)) {
        return;
      }

      if (response.BC_Trn_Media.MediaId) {
        this.dataManager.media.push(response.BC_Trn_Media);
        this.displayMediaFileProgress(fileList, response.BC_Trn_Media);
      }
    } catch (error) {
      console.error("Failed to process image:", error);
    }
  }

  displayMediaFileProgress(fileList, file) {
    const fileItem = document.createElement("div");
    fileItem.className = `file-item ${
      this.validateFile(file) ? "valid" : "invalid"
    }`;
    fileItem.setAttribute("data-mediaid", file.MediaId);

    const removeBeforeFirstHyphen = (str) => str.split("-").slice(1).join("-");

    const isValid = this.validateFile(file);
    fileItem.innerHTML = `
          <img src="${
            file.MediaUrl
          }" alt="File thumbnail" class="preview-image">
          <div class="file-info">
            <div class="file-info-details">
              <div>
                <div class="file-name">${removeBeforeFirstHyphen(
                  file.MediaName
                )}</div>
                <div class="file-size">${this.formatFileSize(
                  file.MediaSize
                )}</div>
              </div>
              <div class="progress-text">0%</div>
            </div>
            <div class="progress-bar">
                <div class="progress" style="width: 0%"></div>
            </div>
          </div>
          <span class="status-icon" style="color: ${isValid ? "green" : "red"}">
            ${isValid ? "" : "⚠"}
          </span>
        `;
    fileList.insertBefore(fileItem, fileList.firstChild);

    let progress = 0;
    const progressBar = fileItem.querySelector(".progress");
    const progressText = fileItem.querySelector(".progress-text");

    const interval = setInterval(() => {
      progress += 10;
      progressBar.style.width = `${progress}%`;
      progressText.textContent = `${progress}%`;

      if (progress >= 100) {
        clearInterval(interval);
        fileList.removeChild(fileItem);
        this.displayMediaFile(fileList, file);
      }
    }, 300);
  }

  displayMediaFile(fileList, file) {
    const fileItem = document.createElement("div");
    fileItem.className = `file-item ${
      this.validateFile(file) ? "valid" : "invalid"
    }`;
    fileItem.setAttribute("data-mediaid", file.MediaId);

    const removeBeforeFirstHyphen = (str) => str.split("-").slice(1).join("-");

    const isValid = this.validateFile(file);
    fileItem.innerHTML = `
          <img src="${
            file.MediaUrl
          }" alt="File thumbnail" class="preview-image">
          <div class="file-info">
              <div class="file-name">${removeBeforeFirstHyphen(
                file.MediaName
              )}</div>
              <div class="file-size">${this.formatFileSize(
                file.MediaSize
              )}</div>
          </div>
          <span class="status-icon" style="color: ${isValid ? "green" : "red"}">
            ${isValid ? "" : "⚠"}
          </span>
          <span class="delete-media fa-regular fa-trash-can" data-mediaid="${
            file.MediaId
          }"></span>
        `;

    fileItem.onclick = () => {
      if (!fileItem.classList.contains("invalid")) {
        this.mediaFileClicked(fileItem);
      }
    };

    $(fileItem)
      .find(".delete-media")
      .on("click", (e) => {
        const mediaId = e.target.dataset.mediaid;
        if (mediaId) {
          const popup = this.popupModal(
            `${this.currentLanguage.getTranslation(
              "delete_media_modal_title"
            )}`,
            `${this.currentLanguage.getTranslation(
              "delete_media_modal_message"
            )}`
          );
          document.body.appendChild(popup);
          popup.style.display = "flex";

          this.setupPopupButtonListeners(popup, mediaId);
        }
      });
    fileList.insertBefore(fileItem, fileList.firstChild);
  }

  validateFile(file) {
    const isValidSize = file.MediaSize <= 2 * 1024 * 1024;
    const isValidType = ["image/jpeg", "image/jpg", "image/png"].includes(
      file.MediaType
    );
    return isValidSize && isValidType;
  }

  closeModal(modal, fileInputField) {
    modal.style.display = "none";
    document.body.removeChild(modal);
    document.body.removeChild(fileInputField);
  }

  saveSelectedFile(modal, fileInputField) {
    if (this.selectedFile) {
      const templateBlock = this.editorManager.selectedComponent;

      if (this.selectedFile?.MediaUrl) {
        const safeMediaUrl = encodeURI(this.selectedFile.MediaUrl);
        templateBlock.addStyle({
          "background-image": `url(${safeMediaUrl})`,
          "background-size": "cover",
          "background-position": "center",
          "background-blend-mode": "overlay",
        });
      } else {
        console.error("MediaUrl is missing or undefined", this.selectedFile);
      }

      this.toolBoxManager.setAttributeToSelected(
        "tile-bg-image-url",
        this.selectedFile.MediaUrl
      );

      this.toolBoxManager.checkTileBgImage();
    }

    this.closeModal(modal, fileInputField);
  }

  mediaFileClicked(fileItem) {
    if (fileItem.classList.contains("invalid")) return;

    document.querySelector(".modal-actions").style.display = "flex";

    // Reset other file items
    document.querySelectorAll(".file-item").forEach((el) => {
      el.classList.remove("selected");
      const icon = el.querySelector(".status-icon");
      if (icon) {
        icon.innerHTML = el.classList.contains("invalid") ? "⚠" : "";
      }
    });

    // Select current file item
    fileItem.classList.add("selected");
    let statusIcon = fileItem.querySelector(".status-icon");
    statusIcon.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="13.423" viewBox="0 0 18 13.423">
            <path id="Icon_awesome-check" d="M6.114,17.736l-5.85-5.85a.9.9,0,0,1,0-1.273L1.536,9.341a.9.9,0,0,1,1.273,0L6.75,13.282l8.441-8.441a.9.9,0,0,1,1.273,0l1.273,1.273a.9.9,0,0,1,0,1.273L7.386,17.736A.9.9,0,0,1,6.114,17.736Z" transform="translate(0 -4.577)" fill="#3a9341"/>
          </svg>
        `;
    statusIcon.style.color = "green";

    // Find and set selected file
    this.selectedFile = this.dataManager.media.find(
      (file) => file.MediaId == fileItem.dataset.mediaid
    );
  }

  deleteMedia(mediaId) {
    this.dataManager
      .deleteMedia(mediaId)
      .then((res) => {
        if (this.toolBoxManager.checkIfNotAuthenticated(res)) {
          return;
        }

        if (res.result === "success") {
          // Remove the media item from the DOM
          const mediaItem = document.querySelector(
            `[data-mediaid="${mediaId}"]`
          );
          if (mediaItem) {
            mediaItem.remove();
          }

          const modalActions = document.querySelector(".modal-actions");
          if (!this.dataManager.media || this.dataManager.media.length === 0) {
            modalActions.style.display = "none";
          }
          // Provide feedback to the user
          this.toolBoxManager.ui.displayAlertMessage(
            `${this.currentLanguage.getTranslation(
              "media_deleted_successfully"
            )}`,
            "success"
          );
          this.checkAndHideModalActions();
        } else {
          this.toolBoxManager.ui.displayAlertMessage(
            `${this.currentLanguage.getTranslation("failed_to_delete_media")}`,
            "error"
          );
        }
      })
      .catch((error) => {
        console.error("Error deleting media file:", error);
        this.toolBoxManager.ui.displayAlertMessage(
          `${this.currentLanguage.getTranslation(
            "error_during_deleting_media"
          )}`,
          "error"
        );
      });
  }

  popupModal(title, message) {
    const popup = document.createElement("div");
    popup.className = "popup-modal";
    popup.innerHTML = `
          <div class="popup">
            <div class="popup-header">
              <span>${title}</span>
              <button class="close">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 21 21">
                  <path id="Icon_material-close" data-name="Icon material-close" d="M28.5,9.615,26.385,7.5,18,15.885,9.615,7.5,7.5,9.615,15.885,18,7.5,26.385,9.615,28.5,18,20.115,26.385,28.5,28.5,26.385,20.115,18Z" transform="translate(-7.5 -7.5)" fill="#6a747f" opacity="0.54"/>
                </svg>
              </button>
            </div>
            <hr>
            <div class="popup-body" id="confirmation_modal_message">
              ${message}
            </div>
            <div class="popup-footer">
              <button id="yes_delete" class="tb-btn tb-btn-primary">
                ${this.currentLanguage.getTranslation("delete_btn")}
              </button>
              <button id="close_popup" class="tb-btn tb-btn-outline">
                ${this.currentLanguage.getTranslation("cancel_btn")}
              </button>
            </div>
          </div>
        `;
    return popup;
  }

  checkAndHideModalActions() {
    const fileList = document.querySelector("#fileList");
    const modalActions = document.querySelector(".modal-actions");

    if (fileList && fileList.children.length === 0) {
      modalActions.style.display = "none";
    } else {
      modalActions.style.display = "flex";
    }
  }

  changeLogo(logoUrl) {
    this.dataManager.uploadLogo(logoUrl).then((res) => {
      const logoAddedSection = document.getElementById("added-logo");
      const addLogoSection = document.getElementById("add-logo");

      if (logoAddedSection && addLogoSection) {
        logoAddedSection.style.display = "block"; // Show added logo section
        addLogoSection.style.display = "none"; // Hide add logo section

        const logo = logoAddedSection.querySelector("#toolbox-logo");
        if (logo) {
          logo.setAttribute("src", logoUrl);
        }
      }
    });
  }

  changeProfile(profileImageUrl) {
    this.dataManager.uploadProfileImage(profileImageUrl).then((res) => {
      const profileAddedSection = document.getElementById(
        "profile-image-added"
      );
      const addProfileSection = document.getElementById("add-profile-image");

      if (profileAddedSection && addProfileSection) {
        profileAddedSection.style.display = "block"; // Show added profile section
        addProfileSection.style.display = "none"; // Hide add profile section

        const profileImg = profileAddedSection.querySelector("#profile-img");
        if (profileImg) {
          profileImg.setAttribute("src", profileImageUrl);
        }
      }
    });
  }
}
