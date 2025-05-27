import { AppConfig } from "../../../../AppConfig";
import { InfoSectionManager } from "../../../../controls/InfoSectionManager";
import { i18n } from "../../../../i18n/i18n";
import { ToolBoxService } from "../../../../services/ToolBoxService";
import { Image, InfoType, Media } from "../../../../types";
import { SingleImageFile } from "./SingleImageFile";

export class ImageUpload {
  private type: "tile" | "cta" | "content" | "info";
  modalContent: HTMLElement;
  toolboxService: ToolBoxService;
  fileListElement: HTMLElement | null = null;
  infoId?: string;
  sectionId?: string;
  croppedUrl: any;
  public selectedImageUrls: Array<{ Id: string; Url: string }> = [];

  constructor(type: any, infoId?: string, sectionId?: string) {
    this.type = type;
    this.infoId = infoId;
    this.sectionId = sectionId;
    this.modalContent = document.createElement("div");
    this.toolboxService = new ToolBoxService();
    this.init();
  }

  private init() {
    this.modalContent.innerHTML = "";
    this.modalContent.className = "tb-modal-content";
    
    this.createModalHeader();
    this.createUploadArea();
    this.createFileListElement();
    this.loadExistingImageAndFiles();
    this.createModalActions();
  }

  private createModalHeader() {
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
      this.closeModal();
    });

    modalHeader.appendChild(h2);
    modalHeader.appendChild(closeBtn);
    this.modalContent.appendChild(modalHeader);
  }

  private createUploadArea() {
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

    const loadingElement = document.createElement("div");
    loadingElement.id = "loading-media";
    loadingElement.className = "loading-media";
    this.fileListElement.appendChild(loadingElement);

    this.modalContent.appendChild(this.fileListElement);
  }

  private createModalActions() {
    const modalActions = document.createElement("div");
    modalActions.className = "modal-actions";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "tb-btn tb-btn-outline";
    cancelBtn.id = "cancel-modal";
    cancelBtn.innerText = i18n.t("sidebar.image_upload.cancel");
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.closeModal();
    });

    const saveBtn = document.createElement("button");
    saveBtn.className = "tb-btn tb-btn-primary";
    saveBtn.id = "save-modal";
    saveBtn.innerText = i18n.t("sidebar.image_upload.save");

    modalActions.appendChild(cancelBtn);
    modalActions.appendChild(saveBtn);
    this.modalContent.appendChild(modalActions);
  }

  private loadExistingImageAndFiles() {
    const selectedComponent = (globalThis as any).selectedComponent;
    if (selectedComponent) {
      const tileElement = selectedComponent.getStyle();
      const backgroundImage = tileElement["background-image"];

      if (backgroundImage !== undefined) {
        const dataUrl = backgroundImage.replace(/url\(["']?|["']?\)/g, "");
        if (dataUrl) {
          this.displayImageEditor(dataUrl);
        }
      }
    }
    this.loadMediaFiles();
  }

  private async loadMediaFiles() {
    try {
      const media = await this.toolboxService.getMediaFiles();
      if (this.fileListElement) {
        this.fileListElement.innerHTML = "";

        if (media && media.length > 0) {
          const sortedMedia = this.sortMediaBySelection(media);
          sortedMedia.forEach((item: Media) => {
            const singleImageFile = new SingleImageFile(
              item,
              this.type,
              this,
              this.infoId,
              this.sectionId
            );
            singleImageFile.render(this.fileListElement as HTMLElement);
          });

          const loadingElement = document.getElementById("loading-media") as HTMLElement;
          if (loadingElement) {
            loadingElement.style.display = "none";
          }
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

  private sortMediaBySelection(media: Media[]): Media[] {
    if (this.type !== "info" || !this.infoId) {
      return media;
    }

    return media.sort((a, b) => {
      const isASelected = this.isMediaSelected(a.MediaId);
      const isBSelected = this.isMediaSelected(b.MediaId);

      if (isASelected === isBSelected) {
        return 0;
      }
      return isASelected ? -1 : 1;
    });
  }

  private isMediaSelected(mediaId: string): boolean {
    try {
      const existingImages = this.getExistingImages();
      return existingImages.some(
        (image) => image.InfoImageId === `id-${mediaId}`
      );
    } catch (error) {
      console.error("Error checking selected media:", error);
      return false;
    }
  }

  private getExistingImages(): Image[] {
    const pageId = (globalThis as any).currentPageId;
    if (!pageId) return [];

    const storedData = localStorage.getItem(`data-${pageId}`);
    if (!storedData) return [];

    const data = JSON.parse(storedData);
    const content = data?.PageInfoStructure?.InfoContent?.find(
      (content: InfoType) => content.InfoId === this.infoId
    );

    return content?.Images || [];
  }

  private async setupDragAndDrop(uploadArea: HTMLElement) {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.id = "fileInput";
    fileInput.multiple = true;
    fileInput.accept = "image/jpeg, image/jpg, image/png";
    fileInput.style.display = "none";
    uploadArea.appendChild(fileInput);

    const uploadText = uploadArea.querySelector(".upload-text");
    if (uploadText) {
      uploadText.addEventListener("click", (e) => {
        e.stopPropagation();
        fileInput.click();
      });
    }

    uploadArea.addEventListener("click", (e) => {
      if (e.target === uploadArea) {
        fileInput.click();
      }
    });

    fileInput.addEventListener("change", () => {
      if (fileInput.files && fileInput.files.length > 0) {
        this.handleFiles(fileInput.files);
      }
    });

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
          const newMedia: Media = {
            MediaId: Date.now().toString(),
            MediaName: file.name,
            MediaUrl: dataUrl,
            MediaType: file.type,
            MediaSize: file.size,
          };

          await this.toolboxService.uploadFile(
            newMedia.MediaUrl,
            newMedia.MediaName,
            newMedia.MediaSize,
            newMedia.MediaType
          );
          
          this.displayImageEditor(dataUrl, file);
        } catch (error) {
          console.error("Error processing file:", error);
        }
      }
    }
  }

  private async getFile(url: string) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], "image.jpg", { type: blob.type });
  }

  public async displayImageEditor(dataUrl: string, file?: File) {
    if (!file) {
      file = await this.getFile(dataUrl);
    }

    const uploadArea = this.modalContent.querySelector(".upload-area") as HTMLElement;
    if (uploadArea) {
      uploadArea.innerHTML = "";
    }

    const imageContainer = document.createElement("div");
    imageContainer.className = "image-editor-container";
    Object.assign(imageContainer.style, {
      position: "relative",
      width: "100%",
      height: "400px",
      overflow: "hidden",
      border: "1px solid #ccc"
    });

    const img = document.createElement("img");
    img.id = "selected-image";
    img.src = dataUrl;

    const frame = document.createElement("div");
    frame.id = "crop-frame";
    Object.assign(frame.style, {
      position: "absolute",
      border: "2px dashed #5068a8"
    });

    this.setupCropFrame(img, frame, imageContainer);
    this.createOverlays(imageContainer, frame);

    imageContainer.appendChild(img);
    imageContainer.appendChild(frame);
    if (uploadArea) {
      uploadArea.appendChild(imageContainer);
    }
    this.createOpacitySlider(img, uploadArea);
  }

  private setupCropFrame(img: HTMLImageElement, frame: HTMLElement, container: HTMLElement) {
    const selectedComponent = (globalThis as any).selectedComponent;
    let aspectRatio = 2;

    if (selectedComponent) {
      const parentRow = selectedComponent.parent().parent();
      const numberOfTiles = parentRow.find(".template-wrapper").length || 1;

      if (numberOfTiles === 1) aspectRatio = 2;
      else if (numberOfTiles === 2) aspectRatio = 1.5;
      else if (numberOfTiles === 3) aspectRatio = 1;
    }

    img.onload = () => {
      const frameHeight = 300;
      const frameWidth = frameHeight * aspectRatio;
      Object.assign(frame.style, {
        width: `${frameWidth}px`,
        height: `${frameHeight}px`,
        left: `${(container.offsetWidth - frameWidth) / 2}px`,
        top: `${(container.offsetHeight - frameHeight) / 2}px`
      });
      this.initializeOverlay(frame, container);
    };

    this.addResizeHandles(frame);
    this.addDragFunctionality(frame, container);
  }

  private addResizeHandles(frame: HTMLElement) {
    const handles = ["top-left", "top-right", "bottom-left", "bottom-right"];
    handles.forEach((handle) => {
      const handleDiv = document.createElement("div");
      handleDiv.className = `resize-handle ${handle}`;
      Object.assign(handleDiv.style, {
        position: "absolute",
        width: "10px",
        height: "10px",
        backgroundColor: "#5068a8",
        zIndex: "11"
      });

      if (handle.includes("top")) handleDiv.style.top = "-5px";
      if (handle.includes("bottom")) handleDiv.style.bottom = "-5px";
      if (handle.includes("left")) handleDiv.style.left = "-5px";
      if (handle.includes("right")) handleDiv.style.right = "-5px";

      frame.appendChild(handleDiv);
      this.addResizeLogic(handleDiv, frame, handle);
    });
  }

  private addResizeLogic(handleDiv: HTMLElement, frame: HTMLElement, handle: string) {
    handleDiv.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = frame.offsetWidth;
      const startHeight = frame.offsetHeight;
      const startLeft = frame.offsetLeft;
      const startTop = frame.offsetTop;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        if (handle.includes("right")) {
          frame.style.width = `${startWidth + dx}px`;
        }
        if (handle.includes("bottom")) {
          frame.style.height = `${startHeight + dy}px`;
        }
        if (handle.includes("left")) {
          frame.style.width = `${startWidth - dx}px`;
          frame.style.left = `${startLeft + dx}px`;
        }
        if (handle.includes("top")) {
          frame.style.height = `${startHeight - dy}px`;
          frame.style.top = `${startTop + dy}px`;
        }

        this.initializeOverlay(frame, frame.parentElement as HTMLElement);
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  }

  private addDragFunctionality(frame: HTMLElement, container: HTMLElement) {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    frame.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      isDragging = true;
      offsetX = e.clientX - frame.getBoundingClientRect().left;
      offsetY = e.clientY - frame.getBoundingClientRect().top;
      document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
        const parentRect = container.getBoundingClientRect();

        let newLeft = e.clientX - offsetX - parentRect.left;
        let newTop = e.clientY - offsetY - parentRect.top;

        if (newLeft < 0) newLeft = 0;
        if (newLeft + frame.offsetWidth > parentRect.width) {
          newLeft = parentRect.width - frame.offsetWidth;
        }
        if (newTop < 0) newTop = 0;
        if (newTop + frame.offsetHeight > parentRect.height) {
          newTop = parentRect.height - frame.offsetHeight;
        }

        frame.style.left = `${newLeft}px`;
        frame.style.top = `${newTop}px`;
        this.updateOverlays(frame, container);
      }
    });

    document.addEventListener("mouseup", (e) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
        isDragging = false;
        document.body.style.userSelect = "auto";
      }
    });
  }

  private createOverlays(container: HTMLElement, frame: HTMLElement) {
    const overlayStyle = {
      position: "absolute",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      zIndex: "5",
      pointerEvents: "none"
    };

    ["overlayTop", "overlayBottom", "overlayLeft", "overlayRight"].forEach(id => {
      const overlay = document.createElement("div");
      overlay.id = id;
      Object.assign(overlay.style, overlayStyle);
      container.appendChild(overlay);
    });

    setTimeout(() => this.initializeOverlay(frame, container), 0);
  }

  private initializeOverlay(frame: HTMLElement, container: HTMLElement) {
    const frameRect = frame.getBoundingClientRect();
    const parentRect = container.getBoundingClientRect();

    const overlayTop = container.querySelector("#overlayTop") as HTMLElement;
    const overlayBottom = container.querySelector("#overlayBottom") as HTMLElement;
    const overlayLeft = container.querySelector("#overlayLeft") as HTMLElement;
    const overlayRight = container.querySelector("#overlayRight") as HTMLElement;

    if (overlayTop) {
      Object.assign(overlayTop.style, {
        top: "0",
        left: "0",
        width: "100%",
        height: `${frameRect.top - parentRect.top}px`
      });
    }

    if (overlayBottom) {
      Object.assign(overlayBottom.style, {
        top: `${frameRect.bottom - parentRect.top}px`,
        left: "0",
        width: "100%",
        height: `${parentRect.bottom - frameRect.bottom}px`
      });
    }

    if (overlayLeft) {
      Object.assign(overlayLeft.style, {
        top: `${frameRect.top - parentRect.top}px`,
        left: "0",
        width: `${frameRect.left - parentRect.left}px`,
        height: `${frameRect.height}px`
      });
    }

    if (overlayRight) {
      Object.assign(overlayRight.style, {
        top: `${frameRect.top - parentRect.top}px`,
        left: `${frameRect.right - parentRect.left}px`,
        width: `${parentRect.right - frameRect.right}px`,
        height: `${frameRect.height}px`
      });
    }
  }

  private updateOverlays(frame: HTMLElement, container: HTMLElement) {
    const parentRect = container.getBoundingClientRect();
    const newTop = frame.offsetTop;
    const newLeft = frame.offsetLeft;

    const overlayTop = container.querySelector("#overlayTop") as HTMLElement;
    const overlayBottom = container.querySelector("#overlayBottom") as HTMLElement;
    const overlayLeft = container.querySelector("#overlayLeft") as HTMLElement;
    const overlayRight = container.querySelector("#overlayRight") as HTMLElement;

    if (overlayTop) overlayTop.style.height = `${newTop}px`;
    if (overlayBottom) {
      overlayBottom.style.top = `${newTop + frame.offsetHeight}px`;
      overlayBottom.style.height = `${parentRect.height - (newTop + frame.offsetHeight)}px`;
    }
    if (overlayLeft) {
      Object.assign(overlayLeft.style, {
        top: `${newTop}px`,
        height: `${frame.offsetHeight}px`,
        width: `${newLeft}px`
      });
    }
    if (overlayRight) {
      Object.assign(overlayRight.style, {
        top: `${newTop}px`,
        height: `${frame.offsetHeight}px`,
        left: `${newLeft + frame.offsetWidth}px`,
        width: `${parentRect.width - (newLeft + frame.offsetWidth)}px`
      });
    }
  }

  private createOpacitySlider(img: HTMLImageElement, uploadArea: HTMLElement) {
    const modalFooter = document.createElement("div");
    modalFooter.className = "modal-footer-slider";

    const opacitySlider = document.createElement("input");
    Object.assign(opacitySlider, {
      type: "range",
      min: "0",
      max: "100",
      step: "1",
      value: "0"
    });
    Object.assign(opacitySlider.style, {
      width: "100%",
      marginLeft: "32px"
    });

    const opacityLabel = document.createElement("span");
    opacityLabel.innerText = `${opacitySlider.value}%`;
    Object.assign(opacityLabel.style, {
      fontSize: "14px",
      color: "#333"
    });

    opacitySlider.addEventListener("input", () => {
      const opacityValue = parseInt(opacitySlider.value, 10) / 100;
      opacityLabel.innerText = `${opacitySlider.value}%`;
      
      const selectedComponent = (globalThis as any).selectedComponent;
      if (!selectedComponent) return;

      Object.assign(selectedComponent.getEl().style, {
        backgroundColor: `rgba(0, 0, 0, ${opacityValue})`,
        backgroundImage: `url(${img.src})`,
        backgroundSize: "cover"
      });

      const pageData = (globalThis as any).pageData;
      if (pageData.PageType === "Information") {
        const infoSectionManager = new InfoSectionManager();
        infoSectionManager.updateInfoTileAttributes(
          selectedComponent.parent().parent().getId(),
          selectedComponent.parent().getId(),
          "Opacity",
          parseInt(opacitySlider.value)
        );
      } else {
        (globalThis as any).tileMapper.updateTile(
          selectedComponent.parent().getId(),
          "Opacity",
          opacitySlider.value
        );
      }

      Object.assign(img.style, {
        opacity: "1",
        filter: `brightness(${1 - opacityValue})`
      });
    });

    const sliderWrapper = document.createElement("div");
    Object.assign(sliderWrapper.style, {
      display: "flex",
      alignItems: "center",
      gap: "10px"
    });

    sliderWrapper.appendChild(opacitySlider);
    sliderWrapper.appendChild(opacityLabel);
    modalFooter.appendChild(sliderWrapper);
    this.modalContent.appendChild(modalFooter);

    if (uploadArea) {
      uploadArea.appendChild(modalFooter);
    }
  }

  public async saveCroppedImage(img: HTMLImageElement, frame: HTMLElement, file: File): Promise<string | null> {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

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

    ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    const croppedDataUrl = canvas.toDataURL("image/png");

    const uniqueId = Date.now().toString();
    const uniqueFileName = `${file.name.split(".")[0]}-${uniqueId}.png`;

    const newMedia: Media = {
      MediaId: uniqueId,
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

    this.croppedUrl = response.BC_Trn_Media.MediaUrl;
    return this.croppedUrl;
  }

  private closeModal() {
    const modal = this.modalContent.parentElement as HTMLElement;
    if (modal) {
      modal.style.display = "none";
      modal.remove();
    }
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
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  public render(container: HTMLElement) {
    container.appendChild(this.modalContent);
  }
}