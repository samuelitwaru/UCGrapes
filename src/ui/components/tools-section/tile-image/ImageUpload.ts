import { AppConfig } from "../../../../AppConfig";
import { TileProperties } from "../../../../controls/editor/TileProperties";
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
  private selectedImages: Map<string, { Id: string; Url: string }> = new Map();
  private saveCallback?: (urls: Array<{ Id: string; Url: string }>) => void;
  // Add position tracking properties
  private currentPosition: {
    x: number;
    y: number;
    scale: number;
    backgroundSize: string;
    backgroundPosition: string;
  } | null = null;

  constructor(
    type: any,
    infoId?: string,
    sectionId?: string,
    saveCallback?: (urls: Array<{ Id: string; Url: string }>) => void
  ) {
    this.type = type;
    this.infoId = infoId;
    this.sectionId = sectionId;
    this.saveCallback = saveCallback;
    this.modalContent = document.createElement("div");
    this.toolboxService = new ToolBoxService();
    this.init();
  }

  /* Initialization Methods */
  private init() {
    this.modalContent.innerHTML = "";
    this.modalContent.className = "tb-modal-content";

    this.createModalHeader();
    this.createUploadArea();
    this.createFileListElement();
    this.loadExistingImageAndFiles();
    this.createModalActions();
  }

  /* UI Creation Methods */
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
    modalActions.style.display = "none"; // Initially hidden

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
    saveBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await this.handleSave();
    });

    modalActions.appendChild(cancelBtn);
    modalActions.appendChild(saveBtn);
    this.modalContent.appendChild(modalActions);
  }

  /* State Management Methods */
  public addSelectedImage(image: { Id: string; Url: string }) {
    this.selectedImages.set(image.Id, image);
    this.updateModalActions();
  }

  public removeSelectedImage(imageId: string) {
    this.selectedImages.delete(imageId);
    this.updateModalActions();
  }

  public clearSelectedImages() {
    this.selectedImages.clear();
    this.updateModalActions();
  }

  private updateModalActions() {
    const modalActions = this.modalContent.querySelector(
      ".modal-actions"
    ) as HTMLElement;
    if (modalActions) {
      modalActions.style.display =
        this.selectedImages.size > 0 ? "flex" : "none";
    }
  }

  /* Position Capture Methods */
  private captureCurrentPosition(
    img: HTMLImageElement,
    frame: HTMLElement,
    container: HTMLElement
  ) {
    const imgRect = img.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Calculate relative position as percentages
    const relativeX = ((frameRect.left - imgRect.left) / imgRect.width) * 100;
    const relativeY = ((frameRect.top - imgRect.top) / imgRect.height) * 100;

    // Calculate scale based on frame size vs image size
    const scaleX = frameRect.width / imgRect.width;
    const scaleY = frameRect.height / imgRect.height;
    const scale = Math.min(scaleX, scaleY);

    // Calculate background-position values (CSS percentages)
    const backgroundPosX = relativeX * -1;
    const backgroundPosY = relativeY * -1;

    this.currentPosition = {
      x: relativeX,
      y: relativeY,
      scale: scale,
      backgroundSize: `${(1 / scale) * 100}%`,
      backgroundPosition: `${backgroundPosX}% ${backgroundPosY}%`,
    };

    return this.currentPosition;
  }

  /* Image Handling Methods */
  private async handleSave() {
    try {
      const selectedImages = Array.from(this.selectedImages.values());

      // Log final position before saving
      if (this.currentPosition) {
        console.log("Final position data being saved:", this.currentPosition);
      }

      if (this.saveCallback) {
        this.saveCallback(selectedImages);
      } else if (this.type === "info") {
        await this.saveMultipleImages(selectedImages);
      } else if (this.type === "cta") {
        this.updateInfoCtaButtonImage(selectedImages[0]);
      } else {
        await this.saveSingleImage(selectedImages[0]);
      }

      this.closeModal();
    } catch (error) {
      console.error("Error during save:", error);
    }
  }

  private async saveMultipleImages(images: Array<{ Id: string; Url: string }>) {
    const infoSectionManager = new InfoSectionManager();
    await infoSectionManager.addMultipleImages(
      images,
      Boolean(this.infoId),
      this.infoId
    );
  }

  private async saveSingleImage(image: { Id: string; Url: string }) {
    const selectedComponent = (globalThis as any).selectedComponent;
    if (!selectedComponent) return;

    const safeMediaUrl = encodeURI(image.Url);

    // Apply positioning if available
    const styleProperties: any = {
      "background-image": `url(${safeMediaUrl})`,
      "background-blend-mode": "overlay",
    };

    if (this.currentPosition) {
      styleProperties["background-size"] = this.currentPosition.backgroundSize;
      styleProperties["background-position"] =
        this.currentPosition.backgroundPosition;
      console.log("Applying positioned background styles:", styleProperties);
    } else {
      // Fallback to default centering
      styleProperties["background-size"] = "cover";
      styleProperties["background-position"] = "center";
    }

    selectedComponent.addStyle(styleProperties);

    const tileWrapper = selectedComponent.parent();
    const rowComponent = tileWrapper.parent();
    const pageData = (globalThis as any).pageData;

    if (pageData.PageType === "Information") {
      const infoSectionManager = new InfoSectionManager();
      infoSectionManager.updateInfoTileAttributes(
        rowComponent.getId(),
        tileWrapper.getId(),
        "BGImageUrl",
        safeMediaUrl
      );

      // Save position data if available
      if (this.currentPosition) {
        infoSectionManager.updateInfoTileAttributes(
          rowComponent.getId(),
          tileWrapper.getId(),
          "BackgroundSize",
          this.currentPosition.backgroundSize
        );
        infoSectionManager.updateInfoTileAttributes(
          rowComponent.getId(),
          tileWrapper.getId(),
          "BackgroundPosition",
          this.currentPosition.backgroundPosition
        );
      }

      const tileAttributes = this.updateInfoTileAttributes(
        rowComponent.getId(),
        tileWrapper.getId()
      );
      const tileProperties = new TileProperties(
        selectedComponent,
        tileAttributes
      );
      tileProperties.setTileAttributes();
    }
  }

  private updateInfoTileAttributes(
    rowComponentId: any,
    tileWrapperId: any
  ): any {
    if (!rowComponentId || !tileWrapperId) return;
    const tileInfoSectionAttributes: InfoType = (
      globalThis as any
    ).infoContentMapper.getInfoContent(rowComponentId);

    return tileInfoSectionAttributes?.Tiles?.find(
      (tile: any) => tile.Id === tileWrapperId
    );
  }

  private updateInfoCtaButtonImage(image: { Id: string; Url: string }) {
    const safeMediaUrl = encodeURI(image.Url);
    const infoSectionManager = new InfoSectionManager();
    infoSectionManager.updateInfoCtaButtonImage(safeMediaUrl, this.infoId);
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
            // const singleImageFile = new SingleImageFile(
            //   item,
            //   this.type,
            //   this,
            //   this.infoId,
            //   this.sectionId
            // );
            // singleImageFile.render(this.fileListElement as HTMLElement);
          });

          const loadingElement = document.getElementById(
            "loading-media"
          ) as HTMLElement;
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

          await this.toolboxService
            .uploadFile(
              newMedia.MediaUrl,
              newMedia.MediaName,
              newMedia.MediaSize,
              newMedia.MediaType
            )
            .then(() => {
              const image = {
                Id: newMedia.MediaId,
                Url: newMedia.MediaUrl,
              };

              if (this.type === "tile") {
                this.displayImageEditor(dataUrl, file);
              }
              this.loadMediaFiles();
              this.addSelectedImage(image);
            });
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

    const uploadArea = this.modalContent.querySelector(
      ".upload-area"
    ) as HTMLElement;
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
      border: "1px solid #ccc",
    });

    const img = document.createElement("img");
    img.id = "selected-image";
    img.src = dataUrl;

    const frame = document.createElement("div");
    frame.id = "position-frame"; // Changed from crop-frame to position-frame
    Object.assign(frame.style, {
      position: "absolute",
      border: "2px solid #5068a8", // Solid border instead of dashed for positioning
      backgroundColor: "rgba(80, 104, 168, 0.1)", // Semi-transparent overlay
      cursor: "move",
    });

    this.setupPositionFrame(img, frame, imageContainer);

    imageContainer.appendChild(img);
    imageContainer.appendChild(frame);
    if (uploadArea) {
      uploadArea.appendChild(imageContainer);
    }
    this.createOpacitySlider(img, uploadArea);
    this.updateModalActions();
  }

  private setupPositionFrame(
    img: HTMLImageElement,
    frame: HTMLElement,
    container: HTMLElement
  ) {
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
        top: `${(container.offsetHeight - frameHeight) / 2}px`,
      });

      // Initial position capture
      this.captureCurrentPosition(img, frame, container);
    };

    this.addResizeHandles(frame, img, container);
    this.addDragFunctionality(frame, container, img);
  }

  private addResizeHandles(
    frame: HTMLElement,
    img: HTMLImageElement,
    container: HTMLElement
  ) {
    const handles = ["top-left", "top-right", "bottom-left", "bottom-right"];
    handles.forEach((handle) => {
      const handleDiv = document.createElement("div");
      handleDiv.className = `resize-handle ${handle}`;
      Object.assign(handleDiv.style, {
        position: "absolute",
        width: "10px",
        height: "10px",
        backgroundColor: "#5068a8",
        zIndex: "11",
        cursor: "nw-resize",
      });

      if (handle.includes("top")) handleDiv.style.top = "-5px";
      if (handle.includes("bottom")) handleDiv.style.bottom = "-5px";
      if (handle.includes("left")) handleDiv.style.left = "-5px";
      if (handle.includes("right")) handleDiv.style.right = "-5px";

      frame.appendChild(handleDiv);
      this.addResizeLogic(handleDiv, frame, handle, img, container);
    });
  }

  private addResizeLogic(
    handleDiv: HTMLElement,
    frame: HTMLElement,
    handle: string,
    img: HTMLImageElement,
    container: HTMLElement
  ) {
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

        // Capture position on resize
        this.captureCurrentPosition(img, frame, container);
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);

        // Final position capture on resize end
        this.captureCurrentPosition(img, frame, container);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  }

  private addDragFunctionality(
    frame: HTMLElement,
    container: HTMLElement,
    img: HTMLImageElement
  ) {
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

        // Capture position during drag
        this.captureCurrentPosition(img, frame, container);
      }
    });

    document.addEventListener("mouseup", (e) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
        isDragging = false;
        document.body.style.userSelect = "auto";

        // Enhanced position capture and logging on drag end
        const finalPosition = this.captureCurrentPosition(
          img,
          frame,
          container
        );
        console.log("Drag completed - Final position:", {
          timestamp: new Date().toISOString(),
          framePosition: {
            left: frame.style.left,
            top: frame.style.top,
            width: frame.style.width,
            height: frame.style.height,
          },
          calculatedPosition: finalPosition,
          dragEndCoordinates: {
            clientX: e.clientX,
            clientY: e.clientY,
          },
        });
      }
    });
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
      value: "0",
    });
    Object.assign(opacitySlider.style, {
      width: "100%",
      marginLeft: "32px",
    });

    const opacityLabel = document.createElement("span");
    opacityLabel.innerText = `${opacitySlider.value}%`;
    Object.assign(opacityLabel.style, {
      fontSize: "14px",
      color: "#333",
    });

    opacitySlider.addEventListener("input", () => {
      const opacityValue = parseInt(opacitySlider.value, 10) / 100;
      opacityLabel.innerText = `${opacitySlider.value}%`;

      const selectedComponent = (globalThis as any).selectedComponent;
      if (!selectedComponent) return;

      Object.assign(selectedComponent.getEl().style, {
        backgroundColor: `rgba(0, 0, 0, ${opacityValue})`,
        backgroundImage: `url(${img.src})`,
        backgroundSize: "cover",
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
      }

      Object.assign(img.style, {
        opacity: "1",
        filter: `brightness(${1 - opacityValue})`,
      });

      // Log opacity changes
      console.log("Opacity changed:", {
        value: opacityValue,
        percentage: `${opacitySlider.value}%`,
      });
    });

    const sliderWrapper = document.createElement("div");
    Object.assign(sliderWrapper.style, {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    });

    sliderWrapper.appendChild(opacitySlider);
    sliderWrapper.appendChild(opacityLabel);
    modalFooter.appendChild(sliderWrapper);
    this.modalContent.appendChild(modalFooter);

    if (uploadArea) {
      uploadArea.appendChild(modalFooter);
    }
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
