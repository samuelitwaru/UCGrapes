import { AppConfig } from "../../../../AppConfig";
import { i18n } from "../../../../i18n/i18n";
import { Media } from "../../../../models/Media";
import { ToolBoxService } from "../../../../services/ToolBoxService";
import { SingleImageFile } from "./SingleImageFile";


export class ImageUpload {
  private type: "tile" | "cta" | "content" | "info";
  modalContent: HTMLElement;
  wrapper: HTMLElement; // Declare the wrapper property
  toolboxService: ToolBoxService;
  fileListElement: HTMLElement | null = null;
  infoId?: string;

  constructor(type: any, infoId?: string) {
    this.type = type;
    this.infoId = infoId;

      // Create the wrapper that will handle resizing/moving
    const wrapper = document.createElement("div");
    wrapper.className = "tb-modal-wrapper"; // <-- NEW WRAPPER
    wrapper.style.position = "fixed";
    wrapper.style.top = "50%";
    wrapper.style.left = "50%";
    wrapper.style.transform = "translate(-50%, -50%)";
    wrapper.style.minWidth = "400px";
    wrapper.style.minHeight = "300px";
    wrapper.style.background = "#fff";
    wrapper.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)";
    wrapper.style.zIndex = "1000";
    wrapper.style.resize = "both"; // allow resizing
    wrapper.style.overflow = "auto"; // so content is scrollable when resized small

    
   
    this.modalContent = document.createElement("div");
    this.modalContent.className = "tb-modal-content";

    //wrapper.appendChild(this.modalContent);

    this.wrapper = wrapper; // Save the wrapper for later

    this.toolboxService = new ToolBoxService();
    this.init();
    this.makeDraggable(wrapper);
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
    const upload = document.createElement('input');
    upload.type = 'file';
    upload.accept = 'image/*';
    document.body.appendChild(upload);
    
    upload.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.src = reader.result as string;
    
          img.onload = () => {
            const canvas = document.getElementById('canvas') as HTMLCanvasElement;
            const ctx = canvas.getContext('2d')!;
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
  private makeDraggable(wrapper: HTMLElement) {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
  
    const header = wrapper.querySelector(".tb-modal-header") as HTMLElement;
  
    if (!header) return;
  
    header.style.cursor = "move"; // Visual feedback
  
    header.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.clientX - wrapper.getBoundingClientRect().left;
      offsetY = e.clientY - wrapper.getBoundingClientRect().top;
      document.body.style.userSelect = "none"; // prevent text selection while dragging
    });
  
    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        wrapper.style.left = `${e.clientX - offsetX}px`;
        wrapper.style.top = `${e.clientY - offsetY}px`;
        wrapper.style.transform = "none"; // cancel initial translate centering
      }
    });
  
    document.addEventListener("mouseup", () => {
      isDragging = false;
      document.body.style.userSelect = "auto";
    });
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

    // Browse link click handler
    const browseLink = uploadArea.querySelector("#browseLink");
   

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

    uploadArea.addEventListener("drop", async (e) => {
      e.preventDefault();
      uploadArea.classList.remove("drag-over");

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        await this.handleFiles(e.dataTransfer.files);
      }
    });
  }

 private handleFiles(files: FileList) {
  const fileArray = Array.from(files);

  for (const file of fileArray) {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;

        // Create an image element
        const img = document.createElement("img");
        img.src = dataUrl;
        img.alt = file.name;
        img.style.maxWidth = "100%";
        img.style.maxHeight = "100%";
        img.style.position = "relative";

        // Clear the wrapper and append the image
        this.wrapper.innerHTML = "";
        this.wrapper.appendChild(img);

        // Add resize controls
        this.addZoomControl(img);

        // Add a draggable frame
        this.addDraggableFrame(img);

        // Add a Done button
        this.addDoneButton(img, dataUrl);
      };
      reader.readAsDataURL(file);
    }
  }
}

private addZoomControl(img: HTMLImageElement) {
  const zoomContainer = document.createElement("div");
  zoomContainer.style.display = "flex";
  zoomContainer.style.alignItems = "center";
  zoomContainer.style.marginTop = "10px";
  zoomContainer.style.width = "200px";
  zoomContainer.style.height = "10px";
  zoomContainer.style.background = "#ddd";
  zoomContainer.style.borderRadius = "5px";
  zoomContainer.style.position = "relative";

  const zoomHandle = document.createElement("div");
  zoomHandle.style.width = "20px";
  zoomHandle.style.height = "20px";
  zoomHandle.style.background = "#007bff";
  zoomHandle.style.borderRadius = "50%";
  zoomHandle.style.position = "absolute";
  zoomHandle.style.top = "-5px";
  zoomHandle.style.left = "0";
  zoomHandle.style.cursor = "pointer";

  zoomContainer.appendChild(zoomHandle);
  this.wrapper.appendChild(zoomContainer);

  let isDragging = false;

  zoomHandle.addEventListener("mousedown", (e) => {
    isDragging = true;
    document.body.style.userSelect = "none"; // Prevent text selection while dragging
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      const rect = zoomContainer.getBoundingClientRect();
      let newLeft = e.clientX - rect.left;

      // Limit the handle's movement within the container
      if (newLeft < 0) newLeft = 0;
      if (newLeft > rect.width - zoomHandle.offsetWidth) {
        newLeft = rect.width - zoomHandle.offsetWidth;
      }

      zoomHandle.style.left = `${newLeft}px`;

      // Calculate the zoom level based on the handle's position
      const zoomLevel = 1 + (newLeft / rect.width) * 2; // Zoom range: 1x to 3x
      img.style.transform = `scale(${zoomLevel})`;
      img.style.transformOrigin = "center center";
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.userSelect = "auto";
  });
}

private addDraggableFrame(img: HTMLImageElement) {
  const frame = document.createElement("div");
  frame.style.position = "absolute";
  frame.style.border = "2px dashed #000";
  frame.style.width = "100px";
  frame.style.height = "100px";
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
      const parentRect = img.getBoundingClientRect();
      const newLeft = e.clientX - offsetX;
      const newTop = e.clientY - offsetY;

      // Ensure the frame stays within the image bounds
      if (
        newLeft >= parentRect.left &&
        newLeft + frame.offsetWidth <= parentRect.right &&
        newTop >= parentRect.top &&
        newTop + frame.offsetHeight <= parentRect.bottom
      ) {
        frame.style.left = `${newLeft - parentRect.left}px`;
        frame.style.top = `${newTop - parentRect.top}px`;
      }
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.userSelect = "auto";
  });

  this.wrapper.appendChild(frame);
}
private resetModal() {
  // Clear the wrapper content
  this.wrapper.innerHTML = "";

  // Reinitialize the upload area and file list
  this.uploadArea();
  this.createFileListElement();
  
   // Reload media files if needed
   if (this.fileListElement) {
    this.loadMediaFiles();
  }
}

private addDoneButton(img: HTMLImageElement, dataUrl: string) {
  const doneBtn = document.createElement("button");
  doneBtn.innerText = "Done";
  doneBtn.style.display = "block";
  doneBtn.style.margin = "10px auto";
  doneBtn.addEventListener("click", () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Get the frame's position and size
    const frame = this.wrapper.querySelector("div[style*='dashed']") as HTMLElement;
    if (!frame) {
      console.error("Frame not found");
      return;
    }

    const frameRect = frame.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

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

    // Convert the cropped image to a data URL
    const croppedDataUrl = canvas.toDataURL("image/png");

    // Add the cropped image to the list of images
    this.addImageToList(croppedDataUrl);

    
     // Reset the modal to the initial upload area
     this.resetModal();
  });

  this.wrapper.appendChild(doneBtn);
}

private addImageToList(dataUrl: string) {
  if (this.fileListElement) {
    const img = document.createElement("img");
    img.src = dataUrl;
    img.alt = "Cropped Image";
    img.style.maxWidth = "100px";
    img.style.maxHeight = "100px";
    img.style.margin = "5px";
    img.style.cursor = "pointer";

    this.fileListElement.appendChild(img);
      // Optionally, add a click event to preview the image
      img.addEventListener("click", () => {
        const previewWindow = window.open("", "_blank");
        if (previewWindow) {
          previewWindow.document.write(`<img src="${dataUrl}" alt="Cropped Image" style="max-width: 100%;">`);
        }
      });
    } else {
      console.error("File list element not found");
    
  }
  
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
    container.appendChild(this.wrapper);
  }
  
}
