import { ContentDataManager } from "../../../../controls/editor/ContentDataManager";
import { TileProperties } from "../../../../controls/editor/TileProperties";
import { ImageUploadManager } from "../../../../controls/ImageUploadManager";
import { InfoSectionManager } from "../../../../controls/InfoSectionManager";
import { ToolBoxService } from "../../../../services/ToolBoxService";
import { Image, ImageType, InfoType, Media } from "../../../../types";
import { ConfirmationBox } from "../../ConfirmationBox";
import { ImageUpload } from "./ImageUpload";
import { ImageUploadUi } from "./ImageUploadUi";

export class SingleImageFile {
  private readonly mediaFile: Media;
  private readonly type: ImageType;
  private readonly infoId?: string;
  private readonly sectionId?: string;
  private readonly toolboxService: ToolBoxService;
  private readonly imageUpload: ImageUploadUi;
  private container: HTMLElement;
  private fileListContainer?: HTMLElement;
  private isCurrentlySelected: boolean = false;
  private controller: ImageUploadManager;

  constructor(
    mediaFile: Media,
    controller: ImageUploadManager,
    imageUpload: ImageUploadUi,
  ) {
    this.mediaFile = mediaFile;
    this.controller = controller;
    this.type = this.controller.getType;
    this.infoId = this.controller.getInfoId;
    this.sectionId = this.controller.getSectionId;
    this.toolboxService = new ToolBoxService();
    this.imageUpload = imageUpload;
    this.container = this.createContainer();

    // Initialize selection state before creating UI
    this.initializeSelectionState();
    this.initializeComponent();
  }

  /* Initialization Methods */
  private initializeSelectionState(): boolean {
    if (this.type !== "info" || !this.infoId) {
      this.isCurrentlySelected = false;
      return false;
    }

    try {
      const existingImages = this.getExistingImages();
      const isSelected = existingImages.some(
        (image) => image.InfoImageId === `id-${this.mediaFile.MediaId}`
      );

      this.isCurrentlySelected = isSelected;

      if (isSelected) {
        this.controller.addSelectedImage({
          Id: this.mediaFile.MediaId,
          Url: this.mediaFile.MediaUrl,
        });
      }

      return isSelected;
    } catch (error) {
      console.error("Error initializing existing images:", error);
      this.isCurrentlySelected = false;
      return false;
    }
  }

  private isImageSelected(): boolean {
    return this.isCurrentlySelected;
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

  private createContainer(): HTMLElement {
    const container = document.createElement("div");
    container.className = "file-item valid";
    container.id = this.mediaFile.MediaId;
    return container;
  }

  private initializeComponent(): void {
    const img = this.createPreviewImage();
    const statusCheck = this.createStatusIcon();
    const actionColumn = this.createActionColumn();

    this.container.appendChild(img);
    this.container.appendChild(statusCheck);
    this.container.appendChild(actionColumn);

    if (this.type !== "info") {
      this.setupItemClickEvent(statusCheck);
    }
  }

  /* UI Creation Methods */
  private createPreviewImage(): HTMLImageElement {
    const img = document.createElement("img");
    img.src = this.mediaFile.MediaUrl;
    img.alt = this.mediaFile.MediaName;
    img.className = "preview-image";
    return img;
  }

  private createStatusIcon(): HTMLElement {
    const statusCheck = document.createElement("span");
    statusCheck.className = "status-icon";

    Object.assign(statusCheck.style, {
      position: "absolute",
      top: "-11px",
      left: "-8px",
      width: "25px",
      height: "25px",
      zIndex: "4",
      display: "none",
    });

    return statusCheck;
  }

  private createActionColumn(): HTMLElement {
    const actionColumn = document.createElement("div");
    actionColumn.className = "action-column";

    Object.assign(actionColumn.style, {
      position: "absolute",
      top: "-16px",
      right: "-4px",
      display: "flex",
      flexDirection: "row",
      gap: "4px",
      zIndex: "3",
      marginLeft: "50px",
    });

    if (this.type === "info") {
      actionColumn.appendChild(this.createImageCheckbox());
    }

    actionColumn.appendChild(this.createReplaceButton());
    actionColumn.appendChild(this.createDeleteButton());

    return actionColumn;
  }

  private createImageCheckbox(): HTMLElement {
    const checkbox = document.createElement("span");
    checkbox.setAttribute("role", "checkbox");
    checkbox.setAttribute("aria-label", "Select image");
    checkbox.setAttribute("tabindex", "0");
    checkbox.title = "Select image";

    Object.assign(checkbox.style, {
      position: "absolute",
      left: "-70px",
      top: "7px",
      fontSize: "25px",
      lineHeight: "0.8",
      backgroundColor: "rgba(255,255,255,0.95)",
      color: "#5068a8",
      cursor: "pointer",
    });

    // Set initial visual state based on current selection
    this.updateCheckboxVisual(checkbox, this.isCurrentlySelected);

    checkbox.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleImageSelection(checkbox);
    });

    checkbox.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        this.toggleImageSelection(checkbox);
      }
    });

    return checkbox;
  }

  private createReplaceButton(): HTMLElement {
    const addImage = document.createElement("span");
    addImage.className = "add-image";
    addImage.title = "Replace image";

    Object.assign(addImage.style, {
      width: "33px",
      height: "33px",
      backgroundImage: "url('/Resources/UCGrapes/public/images/rotatenew.png')",
      backgroundSize: "contain",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    });

    addImage.addEventListener("click", (e) => {
      e.stopPropagation();
      this.handleReplaceClick();
    });

    return addImage;
  }

  private createDeleteButton(): HTMLElement {
    const deleteSpan = document.createElement("span");
    deleteSpan.className = "delete-media fa-regular fa-trash-can";
    deleteSpan.title = "Delete image";

    Object.assign(deleteSpan.style, {
      width: "33px",
      height: "33px",
      fontSize: "16px",
      color: "#5068a8",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      border: "1px solid #5068a8",
    });

    deleteSpan.addEventListener("click", (e) => {
      e.stopPropagation();
      this.deleteEvent();
    });

    return deleteSpan;
  }

  /* Selection Handling Methods */
  private updateCheckboxVisual(checkbox: HTMLElement, isChecked: boolean): void {
    checkbox.className = isChecked
      ? "select-media-checkbox fa-solid fa-square-check selected-checkbox"
      : "select-media-checkbox fa-regular fa-square";
    checkbox.setAttribute("aria-checked", String(isChecked));
  }

  private toggleImageSelection(checkbox: HTMLElement): void {
    const newState = !this.isCurrentlySelected;
    
    // Update internal state first
    this.isCurrentlySelected = newState;
    
    // Update visual state
    this.updateCheckboxVisual(checkbox, newState);

    if (newState) {
      // Handle select
      this.handleImageSelect();
    } else {
      // Handle unselect
      this.handleImageUnselect();
    }
  }

  private handleImageSelect(): void {
    this.controller.addSelectedImage({
      Id: this.mediaFile.MediaId,
      Url: this.mediaFile.MediaUrl,
    });

    // Update localStorage if needed
    if (this.type === "info" && this.infoId) {
      this.updateStoredImageSelection(true);
    }

    // Dispatch custom event for other components to listen
    this.dispatchSelectionEvent('selected');
  }

  private handleImageUnselect(): void {
    // Remove from ImageUpload's selected images
    this.controller.removeSelectedImage(this.mediaFile.MediaId);

    // Update localStorage if needed
    if (this.type === "info" && this.infoId) {
      this.updateStoredImageSelection(false);
    }

    // Clear any visual selection indicators
    this.clearVisualSelection();

    // Dispatch custom event
    this.dispatchSelectionEvent('unselected');
  }

  private updateStoredImageSelection(isSelected: boolean): void {
    try {
      const pageId = (globalThis as any).currentPageId;
      if (!pageId) return;

      const storedData = localStorage.getItem(`data-${pageId}`);
      if (!storedData) return;

      const data = JSON.parse(storedData);
      const content = data?.PageInfoStructure?.InfoContent?.find(
        (content: InfoType) => content.InfoId === this.infoId
      );

      if (!content) return;

      if (!content.Images) {
        content.Images = [];
      }

      const imageId = `id-${this.mediaFile.MediaId}`;
      const existingImageIndex = content.Images.findIndex(
        (img: Image) => img.InfoImageId === imageId
      );

      if (isSelected && existingImageIndex === -1) {
        // Add to stored images
        content.Images.push({
          InfoImageId: imageId,
          InfoImageUrl: this.mediaFile.MediaUrl,
          // Add other required properties as needed
        });
      } else if (!isSelected && existingImageIndex !== -1) {
        // Remove from stored images
        content.Images.splice(existingImageIndex, 1);
      }
    } catch (error) {
      console.error("Error updating stored image selection:", error);
    }
  }

  private clearVisualSelection(): void {
    // Remove any selection-related classes
    this.container.classList.remove('selected', 'highlighted');
    
    // Hide status icon if visible
    const statusIcon = this.container.querySelector('.status-icon') as HTMLElement;
    if (statusIcon) {
      statusIcon.style.display = 'none';
    }
  }

  private dispatchSelectionEvent(action: 'selected' | 'unselected'): void {
    const event = new CustomEvent('imageSelectionChanged', {
      detail: {
        mediaId: this.mediaFile.MediaId,
        mediaUrl: this.mediaFile.MediaUrl,
        action: action,
        isSelected: this.isCurrentlySelected
      }
    });
    
    this.container.dispatchEvent(event);
  }

  /* Event Handlers */
  private handleReplaceClick(): void {
    this.controller.clearSelectedImages();
    this.imageUpload.displayImageEditor(this.mediaFile.MediaUrl);
    this.controller.addSelectedImage({
      Id: this.mediaFile.MediaId,
      Url: this.mediaFile.MediaUrl,
    });
    this.imageUpload.loadMediaFiles();
  }

  private setupItemClickEvent(statusCheck: HTMLElement): void {
    this.container.addEventListener("click", () => {
      this.handleItemClick(statusCheck);
    });
  }

  private handleItemClick(statusCheck: HTMLElement): void {
    // this.hideFileList();
    this.controller.clearSelectedImages();
    this.imageUpload.displayImageEditor(this.mediaFile.MediaUrl);
    this.controller.addSelectedImage({
      Id: this.mediaFile.MediaId,
      Url: this.mediaFile.MediaUrl,
    });
    this.clearOtherSelections();
    this.showSelectionStatus(statusCheck);
  }

  private hideFileList(): void {
    this.fileListContainer = document.getElementById("fileList") as HTMLElement;
    if (this.fileListContainer) {
      this.fileListContainer.style.display = "none";
    }
  }

  private clearOtherSelections(): void {
    document.querySelectorAll(".file-item").forEach((element) => {
      element.classList.remove("selected");
      const icon = element.querySelector(".status-icon") as HTMLElement;
      if (icon) {
        icon.style.display = "none";
      }
    });
  }

  private showSelectionStatus(statusCheck: HTMLElement): void {
    Object.assign(statusCheck.style, {
      backgroundImage: "url('/Resources/UCGrapes/public/images/check.png')",
      backgroundSize: "contain",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      display: "block",
    });

    this.container.classList.add("selected");
  }

  private deleteEvent(): void {
    const confirmationBox = new ConfirmationBox(
      "Are you sure you want to delete this media file?",
      "Delete media",
      this.handleDeleteConfirmation.bind(this)
    );
    confirmationBox.render(document.body);
  }

  private async handleDeleteConfirmation(): Promise<void> {
    try {
      if (this.isCurrentlySelected) {
        this.handleImageUnselect();
      }

      await this.toolboxService.deleteMedia(this.mediaFile.MediaId);
      this.removeFromDOM();
    } catch (error) {
      console.error("Error deleting media:", error);
    }
  }

  private removeFromDOM(): void {
    const mediaItem = document.getElementById(this.mediaFile.MediaId);
    mediaItem?.remove();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public render(container: HTMLElement): void {
    container.appendChild(this.container);
  }

  public unselectImage(): void {
    if (this.isCurrentlySelected) {
      const checkbox = this.container.querySelector('.select-media-checkbox') as HTMLElement;
      if (checkbox) {
        this.toggleImageSelection(checkbox);
      } else {
        this.handleImageUnselect();
      }
    }
  }

  public getSelectionState(): boolean {
    return this.isCurrentlySelected;
  }

  public selectImage(): void {
    if (!this.isCurrentlySelected) {
      const checkbox = this.container.querySelector('.select-media-checkbox') as HTMLElement;
      if (checkbox) {
        this.toggleImageSelection(checkbox);
      } else {
        this.handleImageSelect();
      }
    }
  }
}