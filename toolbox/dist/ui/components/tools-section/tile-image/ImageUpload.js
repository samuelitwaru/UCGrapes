var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { i18n } from "../../../../i18n/i18n";
import { ToolBoxService } from "../../../../services/ToolBoxService";
import { SingleImageFile } from "./SingleImageFile";
export class ImageUpload {
    constructor(type, infoId) {
        this.fileListElement = null;
        this.finishedUploads = {};
        // Add this property to the class with the correct type
        this.progressIntervals = {};
        this.type = type;
        this.infoId = infoId;
        this.modalContent = document.createElement("div");
        this.toolboxService = new ToolBoxService();
        this.init();
    }
    init() {
        this.modalContent.className = "tb-modal-content";
        const modalHeader = document.createElement("div");
        modalHeader.className = "tb-modal-header";
        const h2 = document.createElement("h2");
        h2.innerText = i18n.t("sidebar.image_upload.modal_title");
        const closeBtn = document.createElement("span");
        closeBtn.className = "close";
        closeBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21">
              <path id="Icon_material-close" data-name="Icon material-close" d="M28.5,9.615,26.385,7.5,18,15.885,9.615,7.5,7.5,9.615,15.885,18,7.5,26.385,9.615,28.5,18,20.115,26.385,28.5,28.5,26.385,20.115,18Z" transform="translate(-7.5 -7.5)" fill="#6a747f" opacity="0.54"></path>
            </svg>
        `;
        closeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const modal = this.modalContent.parentElement;
            modal.style.display = "none";
            modal === null || modal === void 0 ? void 0 : modal.remove();
        });
        modalHeader.appendChild(h2);
        modalHeader.appendChild(closeBtn);
        const modalActions = document.createElement("div");
        modalActions.className = "modal-actions";
        const cancelBtn = document.createElement("button");
        cancelBtn.className = "tb-btn tb-btn-outline";
        cancelBtn.id = "cancel-modal";
        cancelBtn.innerText = i18n.t("sidebar.image_upload.cancel");
        cancelBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const modal = this.modalContent.parentElement;
            modal.style.display = "none";
            modal === null || modal === void 0 ? void 0 : modal.remove();
        });
        const saveBtn = document.createElement("button");
        saveBtn.className = "tb-btn tb-btn-primary";
        saveBtn.id = "save-modal";
        saveBtn.innerText = i18n.t("sidebar.image_upload.save");
        // Add save functionality here
        modalActions.appendChild(cancelBtn);
        modalActions.appendChild(saveBtn);
        this.modalContent.appendChild(modalHeader);
        this.uploadArea();
        this.createFileListElement();
        this.loadMediaFiles(); // Load media files asynchronously
        this.modalContent.appendChild(modalActions);
        const upload = document.createElement('input');
        upload.type = 'file';
        upload.accept = 'image/*';
        document.body.appendChild(upload);
        upload.onchange = (e) => {
            var _a;
            const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    const img = new Image();
                    img.src = reader.result;
                    img.onload = () => {
                        const canvas = document.getElementById('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);
                        // Show the modal
                        // ImageCrop.style.display = 'flex';
                    };
                };
                reader.readAsDataURL(file);
            }
        };
    }
    uploadArea() {
        const uploadArea = document.createElement("div");
        uploadArea.className = "upload-area";
        uploadArea.id = "uploadArea";
        uploadArea.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="40.999" height="28.865" viewBox="0 0 40.999 28.865">
            <path id="Path_1040" data-name="Path 1040" d="M21.924,11.025a3.459,3.459,0,0,0-3.287,3.608,3.459,3.459,0,0,0,3.287,3.608,3.459,3.459,0,0,0,3.287-3.608A3.459,3.459,0,0,0,21.924,11.025ZM36.716,21.849l-11.5,14.432-8.218-9.02L8.044,39.89h41Z" transform="translate(-8.044 -11.025)" fill="#afadad"></path>
          </svg>
          <div class="upload-text">
            ${i18n.t("sidebar.image_upload.upload_message")}
        </div>
        `;
        this.setupDragAndDrop(uploadArea);
        this.modalContent.appendChild(uploadArea);
    }
    createFileListElement() {
        this.fileListElement = document.createElement("div");
        this.fileListElement.className = "file-list";
        this.fileListElement.id = "fileList";
        // Add a loading indicator initially
        const loadingElement = document.createElement("div");
        loadingElement.className = "loading-media";
        loadingElement.textContent = "Loading media files...";
        this.fileListElement.appendChild(loadingElement);
        this.modalContent.appendChild(this.fileListElement);
    }
    loadMediaFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const media = yield this.toolboxService.getMediaFiles();
                if (this.fileListElement) {
                    this.fileListElement.innerHTML = "";
                    // Render each media item
                    if (media && media.length > 0) {
                        media.forEach((item) => {
                            const singleImageFile = new SingleImageFile(item, this.type, this.infoId);
                            singleImageFile.render(this.fileListElement);
                        });
                    }
                }
            }
            catch (error) {
                console.error("Error loading media files:", error);
                if (this.fileListElement) {
                    this.fileListElement.innerHTML =
                        '<div class="error-message">Error loading media files. Please try again.</div>';
                }
            }
        });
    }
    setupDragAndDrop(uploadArea) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create hidden file input
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.id = "fileInput";
            fileInput.multiple = true;
            fileInput.accept = "image/jpeg, image/jpg, image/png";
            fileInput.style.display = "none";
            uploadArea.appendChild(fileInput);
            // Browse link click handler
            const browseLink = uploadArea.querySelector("#browseLink");
            // browseLink?.addEventListener("click", (e) => {
            //   e.preventDefault();
            //   fileInput.click();
            // });
            uploadArea.addEventListener("click", (e) => {
                fileInput.click();
            });
            // File input change handler
            fileInput.addEventListener("change", () => {
                if (fileInput.files && fileInput.files.length > 0) {
                    this.handleFiles(fileInput.files);
                }
            });
            // Drag and drop events
            uploadArea.addEventListener("dragover", (e) => {
                e.preventDefault();
                uploadArea.classList.add("drag-over");
            });
            uploadArea.addEventListener("dragleave", (e) => {
                e.preventDefault();
                uploadArea.classList.remove("drag-over");
            });
            uploadArea.addEventListener("drop", (e) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                e.preventDefault();
                uploadArea.classList.remove("drag-over");
                if (((_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.files) && e.dataTransfer.files.length > 0) {
                    yield this.handleFiles(e.dataTransfer.files);
                }
            }));
        });
    }
    handleFiles(files) {
        return __awaiter(this, void 0, void 0, function* () {
            // Convert FileList to array for easier handling
            const fileArray = Array.from(files);
            // Process each file
            for (const file of fileArray) {
                if (file.type.startsWith("image/")) {
                    try {
                        // Create a new Media object using a Promise to handle the FileReader
                        const dataUrl = yield this.readFileAsDataURL(file);
                        const fileName = file.name.replace(/\s+/g, "-").replace(/[()]/g, '');
                        const newMedia = {
                            MediaId: Date.now().toString(),
                            MediaName: fileName,
                            MediaUrl: dataUrl,
                            MediaType: file.type,
                            MediaSize: file.size,
                        };
                        // Display progress indicator
                        if (this.fileListElement) {
                            this.displayMediaFileProgress(this.fileListElement, newMedia);
                        }
                        if (!this.validateFile(newMedia))
                            return;
                        // Call the upload service and wait for the response
                        const response = yield this.toolboxService.uploadFile(newMedia.MediaUrl, newMedia.MediaName, newMedia.MediaSize, newMedia.MediaType);
                        this.finishedUploads[newMedia.MediaId] = response.BC_Trn_Media;
                        const uploadedMedia = response.BC_Trn_Media;
                    }
                    catch (error) {
                        console.error("Error processing file:", error);
                        // Show error for this particular file
                        if (this.fileListElement) {
                            const errorElement = document.createElement("div");
                            errorElement.className = "upload-error";
                            errorElement.textContent = `Error uploading ${file.name}: ${error}`;
                            this.fileListElement.insertBefore(errorElement, this.fileListElement.firstChild);
                            // Remove error message after 5 seconds
                            setTimeout(() => {
                                errorElement.remove();
                            }, 5000);
                        }
                    }
                }
            }
        });
    }
    displayMediaFileProgress(fileList, file) {
        const fileItem = document.createElement("div");
        fileItem.className = `file-item ${this.validateFile(file) ? "valid" : "invalid"}`;
        fileItem.setAttribute("data-mediaid", file.MediaId);
        const removeBeforeFirstHyphen = (str) => str.split("-").slice(1).join("-");
        const isValid = this.validateFile(file);
        fileItem.innerHTML = `
              <img src="${file.MediaUrl}" alt="File thumbnail" class="preview-image">
              <div class="file-info">
                <div class="file-info-details">
                  <div>
                    <div class="file-name">${removeBeforeFirstHyphen(file.MediaName)}</div>
                    <div class="file-size">${this.formatFileSize(file.MediaSize.toString())}</div>
                  </div>
                  <div class="progress-text">0%</div>
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: 0%"></div>
                </div>
                ${isValid ? "" : `<small>File is invalid. Please upload a valid file (jpg, png, jpeg and less than 2MB).</small>`}
              </div>
              <span class="status-icon" style="color: ${isValid ? "green" : "red"}">
                ${isValid ? "" : "⚠"}
              </span>
              ${isValid ? "" : `<span style="margin-left: 10px" id="delete-invalid" class="fa-regular fa-trash-can"></span>`}
            `;
        fileList.insertBefore(fileItem, fileList.firstChild);
        const invalidFileDelete = fileItem.querySelector("#delete-invalid");
        if (invalidFileDelete) {
            invalidFileDelete.style.cursor = "pointer";
            invalidFileDelete.addEventListener("click", (e) => {
                e.preventDefault();
                fileList.removeChild(fileItem);
            });
        }
        let progress = 0;
        const progressBar = fileItem.querySelector(".progress");
        const progressText = fileItem.querySelector(".progress-text");
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 15) + 5;
            if (progressBar)
                progressBar.style.width = `${progress > 100 ? 100 : progress}%`;
            if (progressText)
                progressText.textContent = `${progress > 100 ? 100 : progress}%`;
            if (progress >= 100) {
                clearInterval(interval);
                if (isValid) {
                    fileList.removeChild(fileItem);
                    file = this.finishedUploads[file.MediaId] || file;
                    this.displayMediaFile(fileList, file);
                }
            }
        }, 300);
        // Store the interval ID for cleanup if needed
        this.progressIntervals = this.progressIntervals || {};
        this.progressIntervals[file.MediaId] = interval;
    }
    // Add these methods that your code depends on
    validateFile(file) {
        const isValidSize = file.MediaSize <= 2 * 1024 * 1024;
        const isValidType = ["image/jpeg", "image/jpg", "image/png"].includes(file.MediaType);
        return isValidSize && isValidType;
    }
    formatFileSize(sizeInBytes) {
        const size = parseInt(sizeInBytes, 10);
        if (size < 1024) {
            return size + " B";
        }
        else if (size < 1024 * 1024) {
            return Math.round(size / 1024) + " KB";
        }
        else {
            return (size / (1024 * 1024)).toFixed(2) + " MB";
        }
    }
    displayMediaFile(fileList, file) {
        const singleImageFile = new SingleImageFile(file, this.type, this.infoId);
        singleImageFile.render(fileList);
        fileList.insertBefore(singleImageFile.getElement(), fileList.firstChild);
    }
    // Clean up intervals when the component is destroyed
    destroy() {
        // Clear all progress intervals
        Object.values(this.progressIntervals).forEach((interval) => {
            clearInterval(interval);
        });
        // Reset the intervals object
        this.progressIntervals = {};
    }
    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result) {
                    resolve(reader.result);
                }
                else {
                    reject(new Error("FileReader did not produce a result"));
                }
            };
            reader.onerror = () => {
                reject(reader.error);
            };
            reader.readAsDataURL(file);
        });
    }
    render(container) {
        container.appendChild(this.modalContent);
    }
}
//# sourceMappingURL=ImageUpload.js.map