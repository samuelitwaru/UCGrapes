// ImageUploadView.ts
import { backgroundImage } from "html2canvas/dist/types/css/property-descriptors/background-image";
import { ImageUploadManager } from "../../../../controls/ImageUploadManager";
import { InfoSectionManager } from "../../../../controls/InfoSectionManager";
import { i18n } from "../../../../i18n/i18n";
import { InfoType, Media, Tile } from "../../../../types";
import { SingleImageFile } from "./SingleImageFile";
import { backgroundRepeat } from "html2canvas/dist/types/css/property-descriptors/background-repeat";
import { randomIdGenerator } from "../../../../utils/helpers";

export class ImageUploadUi {
  private modalContent: HTMLElement;
  private controller: ImageUploadManager;
  private fileListElement: HTMLElement | null = null;
  private isEditingMode: boolean = false;
  private opacityValue!: number;
  private sectionId?: string;

  constructor(controller: ImageUploadManager) {
    this.controller = controller;
    this.sectionId = controller.getSectionId;
    this.modalContent = document.createElement("div");
    this.init();
  }

  private init() {
    this.modalContent.innerHTML = "";
    this.modalContent.className = "tb-modal-content";

    // console.log('ImageUploadUi this.sectionId', this.sectionId);

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
    modalActions.style.display = "none";

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
      try {
        await this.controller.handleSave(this.opacityValue, this.sectionId);
        this.closeModal();
      } catch (error) {
        console.error("Error saving images:", error);
      }
    });

    modalActions.appendChild(cancelBtn);
    modalActions.appendChild(saveBtn);
    this.modalContent.appendChild(modalActions);
  }

  /* UI Update Methods */
  public updateModalActions() {
    const modalActions = this.modalContent.querySelector(
      ".modal-actions"
    ) as HTMLElement;
    if (modalActions) {
      modalActions.style.display = this.controller.hasSelectedImages()
        ? "flex"
        : "none";
    }
  }

  public async loadExistingImageAndFiles() {
    const backgroundImage = this.controller.getBackgroundImage();
    if (backgroundImage) {
      this.displayImageEditor(backgroundImage);
    }
    await this.loadMediaFiles();
  }

  public async loadMediaFiles() {
    try {
      const media = await this.controller.loadMediaFiles();
      if (this.fileListElement) {
        this.fileListElement.innerHTML = "";

        if (media.length > 0) {
          media.forEach((item: Media) => {
            const singleImageFile = new SingleImageFile(
              item,
              this.controller,
              this
            );
            singleImageFile.render(this.fileListElement as HTMLElement);
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

  /* Image Editor Methods */
  public async displayImageEditor(dataUrl: string, file?: File) {
    if (this.controller.getType === "info" || this.controller.getType === "cta") {
      return;
    }

    if (!file) {
      file = await this.controller.getFile(dataUrl);
    }

    const image = {
      Id: randomIdGenerator(12),
      Url: dataUrl,
    };

    this.controller.addSelectedImage(image);

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
      backgroundImage: `url(${dataUrl})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "100% 100%",
    });

    const frame = document.createElement("div");
    frame.id = "position-frame";
    Object.assign(frame.style, {
      position: "absolute",
      border: "2px solid #5068a8",
      backgroundColor: "rgba(80, 104, 168, 0.15)",
      cursor: "move",
    });

    imageContainer.appendChild(frame);
    if (uploadArea) {
      uploadArea.appendChild(imageContainer);
    }
    this.setupPositionFrame(frame, imageContainer);
    this.createOpacitySlider(uploadArea);
    this.updateModalActions();

    this.isEditingMode = true;
  }

  private setupPositionFrame(frame: HTMLElement, container: HTMLElement) {
    const selectedComponent = (globalThis as any).selectedComponent;
    let aspectRatio = 1;
    let tile: Tile | undefined = this.getTile(selectedComponent);

    if (selectedComponent) {
      const selectedComponentEl = selectedComponent.getEl() as HTMLElement;
      const componentWidth = selectedComponentEl.clientWidth;
      const componentHeight = selectedComponentEl.clientHeight;
      aspectRatio = parseFloat((componentWidth / componentHeight).toFixed(2));

      if (aspectRatio > 3) aspectRatio = 2.3

      // aspectRatio = 1.5;
      let frameWidth = componentWidth * aspectRatio;
      let frameHeight = componentHeight * aspectRatio;

      const containerWidth = container.clientWidth;
      if (frameWidth > containerWidth) {
        frameWidth = containerWidth;
        frameHeight = containerWidth / aspectRatio;
      }

      if (tile && tile.Left && tile.Top) {
        frame.style.left = `${tile.Left}`;
        frame.style.top = `${tile.Top}`;
      }

      container.style.filter = `brightness(${tile?.Opacity ? (1 - (tile.Opacity) / 100) : 1})`;

      frame.style.width = `${frameWidth}px`;
      frame.style.height = `${frameHeight}px`;
    }

    this.addResizeHandles(frame, container, aspectRatio);
    this.addDragFunctionality(frame, container, aspectRatio);
  }

  private getTile(selectedComponent: any) {
    let tile;
    const infoContent: InfoType | null = this.controller.getInfoContent();
    if (infoContent) {
      const tileId = selectedComponent.parent().getId();
      const tiles: Tile[] | undefined = infoContent?.Tiles;
      if (tiles?.length) {
        tile = tiles.find((t) => t.Id === tileId);
      }
    }

    return tile;
  }

  private addResizeHandles(
    frame: HTMLElement,
    container: HTMLElement,
    tileAspectRatio: number
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
      this.addResizeLogic(handleDiv, frame, handle, container, tileAspectRatio);
    });
  }

  private addResizeLogic(
    handleDiv: HTMLElement,
    frame: HTMLElement,
    handle: string,
    container: HTMLElement,
    tileAspectRatio: number
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
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      const aspectRatio = startWidth / startHeight;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        let newWidth = startWidth;
        let newHeight = startHeight;
        let newLeft = startLeft;
        let newTop = startTop;

        if (handle === "bottom-right") {
          newWidth = Math.min(startWidth + dx, containerWidth - startLeft);
          newHeight = newWidth / aspectRatio;
        } else if (handle === "bottom-left") {
          newWidth = Math.min(startWidth - dx, startLeft + startWidth);
          newLeft = Math.max(startLeft + dx, 0);
          newHeight = newWidth / aspectRatio;
        } else if (handle === "top-right") {
          newWidth = Math.min(startWidth + dx, containerWidth - startLeft);
          newHeight = newWidth / aspectRatio;
          newTop = Math.max(startTop + (startHeight - newHeight), 0);
        } else if (handle === "top-left") {
          newWidth = Math.min(startWidth - dx, startLeft + startWidth);
          newLeft = Math.max(startLeft + dx, 0);
          newHeight = newWidth / aspectRatio;
          newTop = Math.max(startTop + (startHeight - newHeight), 0);
        }

        newWidth = Math.max(newWidth, 20);
        newHeight = Math.max(newHeight, 20);

        frame.style.width = `${newWidth}px`;
        frame.style.height = `${newHeight}px`;
        frame.style.left = `${newLeft}px`;
        frame.style.top = `${newTop}px`;

        this.controller.captureCurrentPosition(
          frame,
          container,
          tileAspectRatio
        );
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        this.controller.captureCurrentPosition(
          frame,
          container,
          tileAspectRatio
        );
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  }

  private addDragFunctionality(
    frame: HTMLElement,
    container: HTMLElement,
    tileAspectRatio: number
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

        this.controller.captureCurrentPosition(
          frame,
          container,
          tileAspectRatio
        );
      }
    });

    document.addEventListener("mouseup", (e) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
        isDragging = false;
        document.body.style.userSelect = "auto";
        this.controller.captureCurrentPosition(
          frame,
          container,
          tileAspectRatio
        );
      }
    });
  }

  private createOpacitySlider(uploadArea: HTMLElement) {
    const selectedComponent = (globalThis as any).selectedComponent;
    const modalFooter = document.createElement("div");
    modalFooter.className = "modal-footer-slider";
    const tile: Tile | undefined = this.getTile(selectedComponent);

    const opacitySlider = document.createElement("input");
    Object.assign(opacitySlider, {
      type: "range",
      min: "0",
      max: "100",
      step: "1",
      value: tile?.Opacity || "0",
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

      this.opacityValue = opacityValue * 100;

      const container = uploadArea.querySelector(".image-editor-container") as HTMLDivElement;
      if (!container) return;

      Object.assign(container.style, {
        opacity: "1",
        filter: `brightness(${1 - opacityValue})`,
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

  /* Drag and Drop Methods */
  private setupDragAndDrop(uploadArea: HTMLElement) {
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
        if (this.checkIfIsEditingMode()) return;
        fileInput.click();
      });
    }

    uploadArea.addEventListener("click", (e) => {
      if (e.target === uploadArea) {
        console.log("clicked");
        if (this.checkIfIsEditingMode()) return;
        fileInput.click();
      }
    });

    fileInput.addEventListener("change", async () => {
      if (fileInput.files && fileInput.files.length > 0) {
        const newImages = await this.controller.handleFiles(fileInput.files);
        // newImages.forEach((image) => this.controller.addSelectedImage(image));
        await this.loadMediaFiles();
      }
    });

    uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (this.checkIfIsEditingMode()) return;
      uploadArea.classList.add("drag-over");
    });

    uploadArea.addEventListener("dragleave", (e) => {
      e.preventDefault();
      if (this.checkIfIsEditingMode()) return;
      uploadArea.classList.remove("drag-over");
    });

    uploadArea.addEventListener("drop", async (e) => {
      e.preventDefault();
      if (this.checkIfIsEditingMode()) return;
      uploadArea.classList.remove("drag-over");

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const newImages = await this.controller.handleFiles(
          e.dataTransfer.files
        );
        // newImages.forEach((image) => this.controller.addSelectedImage(image));
        await this.loadMediaFiles();
      }
    });
  }

  private checkIfIsEditingMode() {
    console.log("this.isEditingMode", this.isEditingMode);
    if (this.isEditingMode) return true;
    return false;
  }

  /* Utility Methods */
  private closeModal() {
    const modal = this.modalContent.parentElement as HTMLElement;
    if (modal) {
      modal.style.display = "none";
      modal.remove();
    }
  }

  public render(container: HTMLElement) {
    container.appendChild(this.modalContent);
  }
}
