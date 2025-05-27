import { ContentDataManager } from "../../../../controls/editor/ContentDataManager";
import { TileProperties } from "../../../../controls/editor/TileProperties";
import { InfoSectionManager } from "../../../../controls/InfoSectionManager";
import { ToolBoxService } from "../../../../services/ToolBoxService";
import { Image, ImageType, InfoType, Media } from "../../../../types";
import { ConfirmationBox } from "../../ConfirmationBox";
import { ImageUpload } from "./ImageUpload";



export class SingleImageFile {
  // Private readonly properties
  private readonly mediaFile: Media;
  private readonly type: ImageType;
  private readonly infoId?: string;
  private readonly sectionId?: string;
  private readonly toolboxService: ToolBoxService;
  private readonly imageUpload: ImageUpload;
  
  // Private properties
  private container: HTMLElement;
  private fileListContainer?: HTMLElement;

  constructor(
    mediaFile: Media,
    type: ImageType,
    imageUpload: ImageUpload,
    infoId?: string,
    sectionId?: string
  ) {
    this.mediaFile = mediaFile;
    this.type = type;
    this.infoId = infoId;
    this.sectionId = sectionId;
    this.toolboxService = new ToolBoxService();
    this.imageUpload = imageUpload;
    this.container = this.createContainer();
    
    this.initializeComponent();
    this.initializeExistingImages();
  }

  private initializeExistingImages(): void {
    if (this.type !== "info" || !this.infoId) return;
    
    try {
      const existingImages = this.getExistingImages();
      this.syncSelectedImages(existingImages);
    } catch (error) {
      console.error('Error initializing existing images:', error);
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

  private syncSelectedImages(existingImages: Image[]): void {
    const currentUrls = new Set(this.imageUpload.selectedImageUrls.map(img => img.Url));
    
    existingImages.forEach(image => {
      const mediaUrl = this.findMediaUrlById(image.InfoImageId);
      if (mediaUrl && !currentUrls.has(mediaUrl)) {
        this.imageUpload.selectedImageUrls.push({
          Id: image.InfoImageId.replace('id-', ''),
          Url: mediaUrl
        });
      }
    });
  }

  private findMediaUrlById(imageId: string): string | null {
    const mediaId = imageId.replace('id-', '');
    return mediaId === this.mediaFile.MediaId ? this.mediaFile.MediaUrl : null;
  }

  private isImageSelected(): boolean {
    try {
      const existingImages = this.getExistingImages();
      return existingImages.some(
        image => image.InfoImageId === `id-${this.mediaFile.MediaId}`
      );
    } catch (error) {
      console.error('Error checking selected image:', error);
      return false;
    }
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

    this.setupItemClickEvent(statusCheck);
  }

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
      display: "none"
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
      marginLeft: "50px"
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
      cursor: "pointer"
    });

    const isSelected = this.isImageSelected();
    this.updateCheckboxVisual(checkbox, isSelected);

    checkbox.addEventListener("click", this.handleCheckboxClick.bind(this));
    checkbox.addEventListener("keydown", this.handleKeyboardInteraction.bind(this));

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
      justifyContent: "center"
    });

    addImage.addEventListener("click", this.handleReplaceClick.bind(this));
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
      border: "1px solid #5068a8"
    });

    deleteSpan.addEventListener("click", this.handleDeleteClick.bind(this));
    return deleteSpan;
  }

  private updateCheckboxVisual(checkbox: HTMLElement, isChecked: boolean): void {
    checkbox.className = isChecked 
      ? "select-media-checkbox fa-solid fa-square-check selected-checkbox"
      : "select-media-checkbox fa-regular fa-square";
    checkbox.setAttribute("aria-checked", String(isChecked));
  }

  private handleCheckboxClick(event: MouseEvent): void {
    event.stopPropagation();
    this.toggleImageSelection(event.currentTarget as HTMLElement);
  }

  private handleKeyboardInteraction(event: KeyboardEvent): void {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      this.toggleImageSelection(event.currentTarget as HTMLElement);
    }
  }

  private toggleImageSelection(checkbox: HTMLElement): void {
    const currentState = checkbox.getAttribute("aria-checked") === "true";
    const newState = !currentState;

    this.updateCheckboxVisual(checkbox, newState);
    this.updateSelectedImages(newState);
    
    if (this.imageUpload.selectedImageUrls.length > 0) {
      this.setupModalActions();
    }
  }

  private updateSelectedImages(shouldAdd: boolean): void {
    const { selectedImageUrls } = this.imageUpload;
    const imageExists = selectedImageUrls.some(item => item.Url === this.mediaFile.MediaUrl);

    if (shouldAdd && !imageExists) {
      selectedImageUrls.push({
        Id: this.mediaFile.MediaId,
        Url: this.mediaFile.MediaUrl,
      });
    } else if (!shouldAdd && imageExists) {
      this.imageUpload.selectedImageUrls = selectedImageUrls.filter(
        item => item.Url !== this.mediaFile.MediaUrl
      );
    }

    console.log('Selected images:', this.imageUpload.selectedImageUrls);
  }

  private handleReplaceClick(event: MouseEvent): void {
    event.stopPropagation();
    const img = this.container.querySelector('img');
    img?.click();
  }

  private handleDeleteClick(event: MouseEvent): void {
    event.stopPropagation();
    this.deleteEvent();
  }

  private setupItemClickEvent(statusCheck: HTMLElement): void {
    if (this.type === "info") return; 

    this.container.addEventListener("click", () => {
      this.handleItemClick(statusCheck);
    });
  }

  private handleItemClick(statusCheck: HTMLElement): void {
    this.hideFileList();
    this.imageUpload.displayImageEditor(this.mediaFile.MediaUrl);
    this.clearOtherSelections();
    this.showSelectionStatus(statusCheck);
    this.setupModalActions();
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
      display: "block"
    });

    this.container.classList.add("selected");
  }

  private setupModalActions(): void {
    const modalActions = this.getModalActions();
    if (!modalActions) return;

    modalActions.style.display = "flex";
    const { cancelBtn, saveBtn } = this.replaceModalButtons(modalActions);
    this.attachModalEventListeners(cancelBtn, saveBtn);
  }

  private getModalActions(): HTMLElement | null {
    return document.querySelector(".modal-actions") as HTMLElement;
  }

  private replaceModalButtons(modalActions: HTMLElement): { cancelBtn: HTMLElement; saveBtn: HTMLElement } {
    const cancelBtn = modalActions.querySelector("#cancel-modal") as HTMLElement;
    const saveBtn = modalActions.querySelector("#save-modal") as HTMLElement;

    if (!cancelBtn || !saveBtn) {
      throw new Error("Modal buttons not found");
    }

    const newCancelBtn = cancelBtn.cloneNode(true) as HTMLElement;
    const newSaveBtn = saveBtn.cloneNode(true) as HTMLElement;

    cancelBtn.parentNode?.replaceChild(newCancelBtn, cancelBtn);
    saveBtn.parentNode?.replaceChild(newSaveBtn, saveBtn);

    return { cancelBtn: newCancelBtn, saveBtn: newSaveBtn };
  }

  private attachModalEventListeners(cancelBtn: HTMLElement, saveBtn: HTMLElement): void {
    const modal = document.querySelector(".tb-modal") as HTMLElement;
    if (!modal) return;

    cancelBtn.addEventListener("click", () => this.closeModal(modal));
    saveBtn.addEventListener("click", () => this.handleSaveClick(modal));
  }

  private closeModal(modal: HTMLElement): void {
    modal.style.display = "none";
    modal.remove();
  }

  private async handleSaveClick(modal: HTMLElement): Promise<void> {
    try {
      await this.processSaveAction();
      this.closeModal(modal);
    } catch (error) {
      console.error("Error saving:", error);
    }
  }

  private async processSaveAction(): Promise<void> {
    switch (this.type) {
      case "tile":
        const imageUrl = await this.handleCroppedImageSave();
        console.log("Cropped image URL this.handleCroppedImageSave():", this.handleCroppedImageSave());
        this.addImageToTile(imageUrl);
        break;
      case "content":
        await this.addImageToContentPage();
        break;
      case "cta":
        if (this.infoId) {
          this.updateInfoCtaButtonImage();
        } else {
          await this.updateCtaButtonImage();
        }
        break;
      case "info":
        await this.handleInfoImageSave();
        break;
      default:
        await this.handleCroppedImageSave();
    }
  }

  private async handleCroppedImageSave(): Promise<string | null> {
    const img = document.getElementById("selected-image") as HTMLImageElement;
    const frame = document.getElementById("crop-frame") as HTMLElement;

    if (!img) {
      console.error("Image element not found.");
      return null;
    }

    if (frame) {
      const uniqueFileName = `cropped-image-${Date.now()}.png`;
      const file = new File([img.src], uniqueFileName, { type: "image/png" });
      const url = await this.imageUpload.saveCroppedImage(img, frame, file);
      return url;
    }
    return null;
  }

  private async handleInfoImageSave(): Promise<void> {
    if (this.imageUpload.selectedImageUrls.length > 0) {
      const infoSectionManager = new InfoSectionManager();
      const isUpdating = this.infoId ? true : false;
      await infoSectionManager.addMultipleImages(this.imageUpload.selectedImageUrls, isUpdating, this.infoId);
    }
  }

  private addImageToTile(croppedUrl: any): void {
    const selectedComponent = (globalThis as any).selectedComponent;
    if (!selectedComponent) return;

    try {
      const safeMediaUrl = encodeURI(croppedUrl);
      console.log("this.imageUpload.croppedUrl:", safeMediaUrl);
      this.applyTileStyles(selectedComponent, safeMediaUrl);
      this.updateTileAttributes(selectedComponent, safeMediaUrl);
    } catch (error) {
      console.error("Error adding image to tile:", error);
    }
  }

  private applyTileStyles(selectedComponent: any, safeMediaUrl: string): void {
    selectedComponent.addStyle({
      "background-image": `url(${safeMediaUrl})`,
      "background-size": "cover",
      "background-position": "center",
      "background-blend-mode": "overlay",
    });

    const selectedElement = selectedComponent.getEl();
    if (selectedElement) {
      selectedElement.style.backgroundColor = "transparent";
    }
  }

  private updateTileAttributes(selectedComponent: any, safeMediaUrl: string): void {
    const updates: Array<[string, string]> = [["BGImageUrl", safeMediaUrl]];
    const tileWrapper = selectedComponent.parent();
    const rowComponent = tileWrapper.parent();
    const pageData = (globalThis as any).pageData;

    let tileAttributes;

    if (pageData.PageType === "Information") {
      tileAttributes = this.updateInfoTileAttributes(updates, rowComponent, tileWrapper);
    } else {
      tileAttributes = this.updateRegularTileAttributes(updates, rowComponent, tileWrapper);
    }

    if (selectedComponent && tileAttributes) {
      const tileProperties = new TileProperties(selectedComponent, tileAttributes);
      tileProperties.setTileAttributes();
    }
  }

  private updateInfoTileAttributes(updates: Array<[string, string]>, rowComponent: any, tileWrapper: any): any {
    const infoSectionManager = new InfoSectionManager();
    
    updates.forEach(([property, value]) => {
      infoSectionManager.updateInfoTileAttributes(
        rowComponent.getId(),
        tileWrapper.getId(),
        property,
        value
      );
    });

    const tileInfoSectionAttributes: InfoType = (globalThis as any).infoContentMapper
      .getInfoContent(rowComponent.getId());

    return tileInfoSectionAttributes?.Tiles?.find(
      (tile: any) => tile.Id === tileWrapper.getId()
    );
  }

  private updateRegularTileAttributes(updates: Array<[string, string]>, rowComponent: any, tileWrapper: any): any {
    updates.forEach(([property, value]) => {
      (globalThis as any).tileMapper.updateTile(tileWrapper.getId(), property, value);
    });

    return (globalThis as any).tileMapper.getTile(rowComponent.getId(), tileWrapper.getId());
  }

  private async addImageToContentPage(): Promise<void> {
    const safeMediaUrl = encodeURI(this.mediaFile.MediaUrl);
    const activeEditor = (globalThis as any).activeEditor;
    const activePage = (globalThis as any).pageData;
    const contentManager = new ContentDataManager(activeEditor, activePage);
    contentManager.updateContentImage(safeMediaUrl);
  }

  private async updateCtaButtonImage(): Promise<void> {
    const safeMediaUrl = encodeURI(this.mediaFile.MediaUrl);
    const activeEditor = (globalThis as any).activeEditor;
    const activePage = (globalThis as any).pageData;
    const contentManager = new ContentDataManager(activeEditor, activePage);
    contentManager.updateCtaButtonImage(safeMediaUrl);
  }

  private updateInfoCtaButtonImage(): void {
    if (!this.infoId) return;
    
    const safeMediaUrl = encodeURI(this.mediaFile.MediaUrl);
    const infoSectionManager = new InfoSectionManager();
    infoSectionManager.updateInfoCtaButtonImage(safeMediaUrl, this.infoId);
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
      await this.toolboxService.deleteMedia(this.mediaFile.MediaId);
      this.removeFromDOM();
      await this.hideModalIfEmpty();
    } catch (error) {
      console.error("Error deleting media:", error);
    }
  }

  private async getUpdatedMediaList(): Promise<Media[]> {
    const media = await this.toolboxService.getMediaFiles();
    return media.filter((item: Media) => item.MediaId !== this.mediaFile.MediaId);
  }

  private removeFromDOM(): void {
    const mediaItem = document.getElementById(this.mediaFile.MediaId);
    mediaItem?.remove();
  }

  private async hideModalIfEmpty(): Promise<void> {
    const remainingMedia = await this.getUpdatedMediaList();
    if (remainingMedia.length === 0) {
      const modalFooter = document.querySelector(".modal-actions") as HTMLElement;
      if (modalFooter) {
        modalFooter.style.display = "none";
      }
    }
  }

  // Utility method for byte formatting
  private formatBytes(bytes: number): string {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Byte";
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    if (i === 0) return `${bytes} ${sizes[i]}`;
    
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  // Public API methods
  public getElement(): HTMLElement {
    return this.container;
  }

  public render(container: HTMLElement): void {
    container.appendChild(this.container);
  }
}