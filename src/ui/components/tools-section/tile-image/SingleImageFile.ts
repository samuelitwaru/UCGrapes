import { ContentDataManager } from "../../../../controls/editor/ContentDataManager";
import { TileProperties } from "../../../../controls/editor/TileProperties";
import { InfoSectionManager } from "../../../../controls/InfoSectionManager";
import { ToolBoxService } from "../../../../services/ToolBoxService";
import { InfoType, Media } from "../../../../types";
import { ConfirmationBox } from "../../ConfirmationBox";
import { ImageUpload } from "./ImageUpload";

export class SingleImageFile {
  private container: HTMLElement;
  private mediaFile: Media;
  private toolboxService: ToolBoxService;
  type: any;
  infoId?: string;
  sectionId?: string;
  imageUpload: ImageUpload;
  fileListContainer: HTMLElement | undefined;

  constructor(
    mediaFile: Media,
    type: any,
    imageUpload: ImageUpload,
    infoId?: string,
    sectionId?: string
  ) {
    this.mediaFile = mediaFile;
    this.type = type;
    this.infoId = infoId;
    this.sectionId = sectionId;
    this.toolboxService = new ToolBoxService();
    this.container = document.createElement("div");
    this.imageUpload = imageUpload;
    this.init();
  }

  private init() {
    this.container.className = "file-item valid";
    this.container.id = this.mediaFile.MediaId;

    const img = document.createElement("img");
    img.src = this.mediaFile.MediaUrl;
    img.alt = this.mediaFile.MediaName;
    img.className = "preview-image";

    // Check icon (statusCheck) - now positioned top left
    const statusCheck = document.createElement("span");
    statusCheck.className = "status-icon";
    statusCheck.style.position = "absolute";
    statusCheck.style.top = "-11px";
    statusCheck.style.left = "-8px";
    statusCheck.style.width = "25px";
    statusCheck.style.height = "25px";
    statusCheck.style.zIndex = "4";
    statusCheck.style.display = "none";

    // Action column (delete and add image) - top right
    const actionColumn = document.createElement("div");
    actionColumn.className = "action-column";
    actionColumn.style.position = "absolute";
    actionColumn.style.top = "-16px";
    actionColumn.style.right = "-4px";
    actionColumn.style.display = "flex";
    actionColumn.style.flexDirection = "row";
    actionColumn.style.gap = "4px";
    actionColumn.style.zIndex = "3";
    actionColumn.style.marginLeft = "50px";

    // Add Image icon (left of delete)
    const addImage = document.createElement("span");
    addImage.className = "add-image";
    addImage.title = "Replace image";
    addImage.style.width = "33px";
    addImage.style.height = "33px";
    addImage.style.backgroundImage = "url('/Resources/UCGrapes/public/images/rotatenew.png')";
    addImage.style.backgroundSize = "contain";
    addImage.style.backgroundRepeat = "no-repeat";
    addImage.style.backgroundPosition = "center";
    addImage.style.cursor = "pointer";
    addImage.style.display = "flex";
    addImage.style.alignItems = "center";
    addImage.style.justifyContent = "center";

    addImage.addEventListener("click", (e) => {
      e.stopPropagation();
      img.click();
    });

    // Delete icon (rightmost)
    const deleteSpan = document.createElement("span");
    deleteSpan.className = "delete-media fa-regular fa-trash-can";
    deleteSpan.title = "Delete image";
    deleteSpan.style.width = "33px";
    deleteSpan.style.height = "33px";
    deleteSpan.style.fontSize = "16px";
    deleteSpan.style.color = "#5068a8";
    deleteSpan.style.display = "flex";
    deleteSpan.style.alignItems = "center";
    deleteSpan.style.justifyContent = "center";
    deleteSpan.style.cursor = "pointer";
    deleteSpan.style.border = "1px solid #5068a8";

    deleteSpan.addEventListener("click", (e) => {
      e.stopPropagation();
      this.deleteEvent();
    });

    // Append addImage and deleteSpan to the action column (addImage left of delete)
    actionColumn.appendChild(addImage);
    actionColumn.appendChild(deleteSpan);

    this.container.appendChild(img);
    this.container.appendChild(statusCheck);
    this.container.appendChild(actionColumn);

    this.setupItemClickEvent(statusCheck);
  }

  private formatBytes(bytes: number) {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Byte";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    if (i === 0) return bytes + " " + sizes[i];
    return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
  }

  private setupItemClickEvent(statusCheck: HTMLElement) {
    this.container.addEventListener("click", () => {
      this.fileListContainer = document.getElementById(
        "fileList"
      ) as HTMLElement;
      this.fileListContainer.style.display = "none";
      this.imageUpload.displayImageEditor(this.mediaFile.MediaUrl)
      // Remove check from all other images
      document.querySelectorAll(".file-item").forEach((el) => {
        el.classList.remove("selected");
        const icon = el.querySelector(".status-icon") as HTMLElement;
        if (icon) {
          icon.style.display = "none";
        }
      });

      // Show check only on this image
      statusCheck.style.backgroundImage = "url('/Resources/UCGrapes/public/images/check.png')";
      statusCheck.style.backgroundSize = "contain";
      statusCheck.style.backgroundRepeat = "no-repeat";
      statusCheck.style.backgroundPosition = "center";
      statusCheck.style.display = "block";

      this.container.classList.add("selected");
      this.setupModalActions();
    });
  }

  private setupModalActions() {
    const modalActions = document.querySelector(
      ".modal-actions"
    ) as HTMLElement;
    if (!modalActions) return;
    modalActions.style.display = "flex";

    // Remove existing event listeners by cloning and replacing elements
    const cancelBtn = modalActions.querySelector(
      "#cancel-modal"
    ) as HTMLElement;
    const saveBtn = modalActions.querySelector("#save-modal") as HTMLElement;

    if (!cancelBtn || !saveBtn) return;
    const newCancelBtn = cancelBtn.cloneNode(true) as HTMLElement;
    const newSaveBtn = saveBtn.cloneNode(true) as HTMLElement;

    cancelBtn.parentNode?.replaceChild(newCancelBtn, cancelBtn);
    saveBtn.parentNode?.replaceChild(newSaveBtn, saveBtn);

    const modal = document.querySelector(".tb-modal") as HTMLElement;
    if (!modal) return;

    newCancelBtn.addEventListener("click", () => {
      modal.style.display = "none";
      modal.remove();
    });
    newSaveBtn.addEventListener("click", async () => {
      const img = document.getElementById("selected-image") as HTMLImageElement;
      if (!img) {
        console.error("Image element not found.");
        return;
      }
      const frame = document.getElementById("crop-frame") as HTMLElement;
      if (frame) {
        const uniqueFileName = `cropped-imafresetge-${Date.now()}.png`; // Generate a unique file name
        const file = new File([img.src], uniqueFileName, { type: "image/png" });
        await this.imageUpload.saveCroppedImage(img, frame, file);
      }
      if (this.type === "tile") {
        this.addImageToTile();
      } else if (this.type === "content") {
        this.addImageToContentPage();
      } else if (this.type === "cta" && this.infoId) {
        this.updateInfoCtaButtonImage();
      } else if (this.type === "cta") {
        this.updateCtaButtonImage();
      } else if (this.type === "info") {
        this.updateInfoImage();
      }
      modal.style.display = "none";
      modal.remove();
    });
  }

  private addImageToTile() {
    const selectedComponent = (globalThis as any).selectedComponent;
    if (!selectedComponent) return;
    try {
      const safeMediaUrl = encodeURI(this.imageUpload.croppedUrl);
      selectedComponent.addStyle({
        "background-image": `url(${safeMediaUrl})`,
        "background-size": "cover",
        "background-position": "center",
        "background-blend-mode": "overlay",
      });
      const selectedElement = selectedComponent.getEl()
      
      if (selectedElement) selectedElement.style.backgroundColor = "transparent";

      const updates = [
        ["BGImageUrl", safeMediaUrl],
      ];

      let tileAttributes;
      const tileWrapper = selectedComponent.parent();
      const rowComponent = tileWrapper.parent();
      const pageData = (globalThis as any).pageData;
      if (pageData.PageType === "Information") {
        const infoSectionManager = new InfoSectionManager();
        for (const [property, value] of updates) {
          infoSectionManager.updateInfoTileAttributes(
            rowComponent.getId(),
            tileWrapper.getId(),
            property,
            value
          );
        }

        const tileInfoSectionAttributes: InfoType = (
          globalThis as any
        ).infoContentMapper.getInfoContent(rowComponent.getId());

        tileAttributes = tileInfoSectionAttributes?.Tiles?.find(
          (tile: any) => tile.Id === tileWrapper.getId()
        );
      } else {
        // console.log("Updating tile mapper value: ", (globalThis as any).tileMapper)
        for (const [property, value] of updates) {
          (globalThis as any).tileMapper.updateTile(
            tileWrapper.getId(),
            property,
            value
          );
        }
        tileAttributes = (globalThis as any).tileMapper.getTile(
          rowComponent.getId(),
          tileWrapper.getId()
        );
      }

      if (selectedComponent && tileAttributes) {
        const tileProperties = new TileProperties(
          selectedComponent,
          tileAttributes
        );
        tileProperties.setTileAttributes();
      }
    } catch (error) {
      console.error("Error adding image to tile:", error);
    }
  }

  private async addImageToContentPage() {
    const safeMediaUrl = encodeURI(this.mediaFile.MediaUrl);
    const activeEditor = (globalThis as any).activeEditor;
    const activePage = (globalThis as any).pageData;
    const contentManager = new ContentDataManager(activeEditor, activePage);
    contentManager.updateContentImage(safeMediaUrl);
  }

  private async updateCtaButtonImage() {
    const safeMediaUrl = encodeURI(this.mediaFile.MediaUrl);
    const activeEditor = (globalThis as any).activeEditor;
    const activePage = (globalThis as any).pageData;
    const contentManager = new ContentDataManager(activeEditor, activePage);
    contentManager.updateCtaButtonImage(safeMediaUrl);
  }

  private async updateInfoImage() {
    const safeMediaUrl = encodeURI(this.mediaFile.MediaUrl);
    const infoSectionManager = new InfoSectionManager();
    infoSectionManager.updateInfoImage(
      safeMediaUrl,
      this.infoId,
      this.sectionId
    );
  }

  private updateInfoCtaButtonImage() {
    const safeMediaUrl = encodeURI(this.mediaFile.MediaUrl);
    const infoSectionManager = new InfoSectionManager();
    infoSectionManager.updateInfoCtaButtonImage(safeMediaUrl, this.infoId);
  }

  private deleteEvent() {
    const title = "Delete media";
    const message = "Are you sure you want to delete this media file?";

    const handleConfirmation = async () => {
      try {
        await this.toolboxService.deleteMedia(this.mediaFile.MediaId);
        let media = await this.toolboxService.getMediaFiles();
        media = media.filter(
          (item: Media) => item.MediaId !== this.mediaFile.MediaId
        );
        const mediaItem = document.getElementById(this.mediaFile.MediaId);
        if (mediaItem) {
          mediaItem.remove();
        }

        if (media.length === 0) {
          const modalFooter = document.querySelector(
            ".modal-actions"
          ) as HTMLElement;
          modalFooter.style.display = "none";
        }
      } catch (error) {
        console.error("Error deleting media:", error);
      }
    };
    const confirmationBox = new ConfirmationBox(
      message,
      title,
      handleConfirmation
    );
    confirmationBox.render(document.body);
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public render(container: HTMLElement) {
    container.appendChild(this.container);
  }
}
