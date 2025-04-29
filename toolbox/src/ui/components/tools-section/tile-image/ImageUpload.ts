import { AppConfig } from "../../../../AppConfig";
import { i18n } from "../../../../i18n/i18n";
import { Media } from "../../../../models/Media";
import { ToolBoxService } from "../../../../services/ToolBoxService";
import { SingleImageFile } from "./SingleImageFile";

export class ImageUpload {
  private type: "tile" | "cta" | "content" | "info";
  modalContent: HTMLElement;
  toolboxService: ToolBoxService;
  fileListElement: HTMLElement | null = null;
  infoId?: string;

  constructor(type: any, infoId?: string) {
    this.type = type;
    this.infoId = infoId;
    this.modalContent = document.createElement("div");
    this.toolboxService = new ToolBoxService();
    this.init();
  }

  private init() {
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
      const modal = this.modalContent.parentElement as HTMLElement;
      modal.style.display = "none";
      modal?.remove();
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
      const modal = this.modalContent.parentElement as HTMLElement;
      modal.style.display = "none";
      modal?.remove();
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
  }

  private uploadArea() {
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

  private createFileListElement() {
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

  private async loadMediaFiles() {
    try {
      const media = await this.toolboxService.getMediaFiles();

      if (this.fileListElement) {
        this.fileListElement.innerHTML = "";

        // Render each media item
        if (media && media.length > 0) {
          media.forEach((item: Media) => {
            const singleImageFile = new SingleImageFile(item, this.type, this.infoId);
            singleImageFile.render(this.fileListElement as HTMLElement);
          });
        }
      }
    } catch (error) {
      console.error("Error loading media files:", error);
      if (this.fileListElement) {
        this.fileListElement.innerHTML =
          '<div class="error-message">Error loading media files. Please try again.</div>';
      }
    }
  }

private async setupDragAndDrop(uploadArea: HTMLElement) {
  // Create hidden file input
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.id = "fileInput";
  fileInput.multiple = true;
  fileInput.accept = "image/jpeg, image/jpg, image/png";
  fileInput.style.display = "none";
  uploadArea.appendChild(fileInput);

  // Prevent the file input from being triggered unintentionally
  uploadArea.addEventListener("click", (e) => {
    if (e.target === uploadArea) {
      fileInput.click();
    }
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

  uploadArea.addEventListener("drop", async (e) => {
    e.preventDefault();
    uploadArea.classList.remove("drag-over");

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      await this.handleFiles(e.dataTransfer.files);
    }
  });
}
private async handleFiles(files: FileList) {
  const fileArray = Array.from(files);

  for (const file of fileArray) {
    if (file.type.startsWith("image/")) {
      try {
        const dataUrl = await this.readFileAsDataURL(file);

        // Replace the upload area with the image editor
        this.displayImageEditor(dataUrl, file);

      } catch (error) {
        console.error("Error processing file:", error);
      }
    }
  }
}
private displayImageEditor(dataUrl: string, file: File) {
  // Clear the upload area
  const uploadArea = this.modalContent.querySelector(".upload-area") as HTMLElement;
  if (uploadArea) {
    uploadArea.innerHTML = "";
  }

  // Create the image container
  const imageContainer = document.createElement("div");
  imageContainer.className = "image-editor-container";
  imageContainer.style.position = "relative";
  imageContainer.style.width = "100%";
  imageContainer.style.height = "300px";
  imageContainer.style.overflow = "hidden";
  imageContainer.style.border = "1px solid #ccc";

  // Create the image element
  const img = document.createElement("img");
  img.src = dataUrl;
  img.alt = file.name;
  img.style.position = "absolute";
  img.style.top = "50%";
  img.style.left = "50%";
  img.style.transform = "translate(-50%, -50%) scale(1)";
  img.style.transformOrigin = "center center";
  img.style.maxWidth = "none";
  img.style.maxHeight = "none";

  imageContainer.appendChild(img);

  // Add the zoom slider
  const zoomSlider = document.createElement("input");
  zoomSlider.type = "range";
  zoomSlider.min = "1";
  zoomSlider.max = "3";
  zoomSlider.step = "0.1";
  zoomSlider.value = "1";
  zoomSlider.style.width = "100%";
  zoomSlider.style.marginTop = "10px";

  zoomSlider.addEventListener("input", () => {
    const zoomLevel = parseFloat(zoomSlider.value);
    img.style.transform = `translate(-50%, -50%) scale(${zoomLevel})`;
  });

  // Add a draggable frame
  const frame = document.createElement("div");
  frame.style.position = "absolute";
  frame.style.border = "2px dashed #000";
  frame.style.width = "150px";
  frame.style.height = "150px";
  frame.style.top = "50%";
  frame.style.left = "50%";
  frame.style.transform = "translate(-50%, -50%)";
  frame.style.cursor = "move";

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  frame.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - frame.getBoundingClientRect().left;
    offsetY = e.clientY - frame.getBoundingClientRect().top;
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      const parentRect = imageContainer.getBoundingClientRect();
      const newLeft = e.clientX - offsetX - parentRect.left;
      const newTop = e.clientY - offsetY - parentRect.top;

      // Ensure the frame stays within the image container
      if (newLeft >= 0 && newLeft + frame.offsetWidth <= parentRect.width) {
        frame.style.left = `${newLeft}px`;
      }
      if (newTop >= 0 && newTop + frame.offsetHeight <= parentRect.height) {
        frame.style.top = `${newTop}px`;
      }
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.userSelect = "auto";
  });

  imageContainer.appendChild(frame);

  // Add the "Done" button
  const doneButton = document.createElement("button");
  doneButton.innerText = "Done";
  doneButton.className = "tb-btn tb-btn-primary";
  doneButton.style.marginTop = "10px";

  doneButton.addEventListener("click", () => {
    console.log("Check if done button is clicked");
    this.saveCroppedImage(img, frame, file);
  });

  // Append everything to the upload area
  if (uploadArea) {
    uploadArea.appendChild(imageContainer);
    uploadArea.appendChild(zoomSlider);
    uploadArea.appendChild(doneButton);
  }
}
private async saveCroppedImage(img: HTMLImageElement, frame: HTMLElement, file: File) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    console.error("Canvas context is not available.");
    return;
  }

  const imgRect = img.getBoundingClientRect();
  const frameRect = frame.getBoundingClientRect();

  const scaleX = img.naturalWidth / imgRect.width;
  const scaleY = img.naturalHeight / imgRect.height;

  const cropX = (frameRect.left - imgRect.left) * scaleX;
  const cropY = (frameRect.top - imgRect.top) * scaleY;
  const cropWidth = frameRect.width * scaleX;
  const cropHeight = frameRect.height * scaleY;

  canvas.width = cropWidth;
  canvas.height = cropHeight;

  ctx.drawImage(
    img,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );

  const croppedDataUrl = canvas.toDataURL("image/png");

  // Debugging: Log the cropped image data URL
  console.log("Cropped Image Data URL:", croppedDataUrl);

  // Add the cropped image to the file list
  const newMedia: Media = {
    MediaId: Date.now().toString(),
    MediaName: file.name,
    MediaUrl: croppedDataUrl,
    MediaType: file.type,
    MediaSize: file.size,
  };

  const response = await this.toolboxService.uploadFile(
    newMedia.MediaUrl,
    newMedia.MediaName,
    newMedia.MediaSize,
    newMedia.MediaType
  );

  const uploadedMedia: Media = response.BC_Trn_Media;


  if (this.fileListElement) {
    console.log("Adding cropped image to the file list...");
    this.displayMediaFile(this.fileListElement, newMedia);
  } else {
    console.error("File list element is not available.");
  }

  // Reset the modal content
  this.resetModal();
}
private resetModal() {

  console.log("Resetting modal content...");

  this.modalContent.innerHTML = "";
  this.uploadArea();
  this.createFileListElement();
  this.loadMediaFiles();
}

  private displayMediaFileProgress(fileList: HTMLElement, file: Media) {
    const fileItem = document.createElement("div");
    fileItem.className = `file-item ${
      this.validateFile(file) ? "valid" : "invalid"
    }`;
    fileItem.setAttribute("data-mediaid", file.MediaId);

    const removeBeforeFirstHyphen = (str: string) =>
      str.split("-").slice(1).join("-");

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
                      file.MediaSize.toString()
                    )}</div>
                  </div>
                  <div class="progress-text">0%</div>
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: 0%"></div>
                </div>
                ${ isValid ? "" : `<small>File is invalid. Please upload a valid file (jpg, png, jpeg and less than 2MB).</small>` }
              </div>
              <span class="status-icon" style="color: ${
                isValid ? "green" : "red"
              }">
                ${isValid ? "" : "⚠"}
              </span>
              ${ isValid ? "" : `<span style="margin-left: 10px" id="delete-invalid" class="fa-regular fa-trash-can"></span>`}
            `;
    fileList.insertBefore(fileItem, fileList.firstChild);

    const invalidFileDelete = fileItem.querySelector("#delete-invalid") as HTMLElement;
    if (invalidFileDelete) {
        invalidFileDelete.style.cursor = "pointer";
        invalidFileDelete.addEventListener("click", (e) => {
            e.preventDefault();
        fileList.removeChild(fileItem);
        });
    }

    let progress = 0;
    const progressBar = fileItem.querySelector(".progress") as HTMLElement;
    const progressText = fileItem.querySelector(".progress-text");

    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progressBar) progressBar.style.width = `${progress > 100 ? 100 : progress}%`;
      if (progressText) progressText.textContent = `${progress > 100 ? 100 : progress}%`;

      if (progress >= 100) {
        clearInterval(interval);
        if (isValid) {
            fileList.removeChild(fileItem);
            this.displayMediaFile(fileList, file);
        }        
      }
    }, 300);

    // Store the interval ID for cleanup if needed
    this.progressIntervals = this.progressIntervals || {};
    this.progressIntervals[file.MediaId] = interval;
  }

  // Add these methods that your code depends on
  private validateFile(file: Media): boolean {
    const isValidSize = file.MediaSize <= 2 * 1024 * 1024;
    const isValidType = ["image/jpeg", "image/jpg", "image/png"].includes(
      file.MediaType
    );
    return isValidSize && isValidType;
  }

  private formatFileSize(sizeInBytes: string): string {
    const size = parseInt(sizeInBytes, 10);
    if (size < 1024) {
      return size + " B";
    } else if (size < 1024 * 1024) {
      return Math.round(size / 1024) + " KB";
    } else {
      return (size / (1024 * 1024)).toFixed(2) + " MB";
    }
  }

  private displayMediaFile(fileList: HTMLElement, file: Media): void {
    const singleImageFile = new SingleImageFile(file, this.type, this.infoId);
    singleImageFile.render(fileList);
    fileList.insertBefore(singleImageFile.getElement(), fileList.firstChild);
  }

  // Add this property to the class with the correct type
  private progressIntervals: { [key: string]: ReturnType<typeof setInterval> } =
    {};

  // Clean up intervals when the component is destroyed
  public destroy(): void {
    // Clear all progress intervals
    Object.values(this.progressIntervals).forEach((interval) => {
      clearInterval(interval);
    });

    // Reset the intervals object
    this.progressIntervals = {};
  }

  private readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result as string);
        } else {
          reject(new Error("FileReader did not produce a result"));
        }
      };
      reader.onerror = () => {
        reject(reader.error);
      };
      reader.readAsDataURL(file);
    });
  }

  public render(container: HTMLElement) {
    container.appendChild(this.modalContent);
  }
}
