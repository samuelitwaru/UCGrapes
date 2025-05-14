import { ContentDataManager } from "../../../../controls/editor/ContentDataManager";
import { TileProperties } from "../../../../controls/editor/TileProperties";
import { InfoSectionController } from "../../../../controls/InfoSectionController";
import { InfoType } from "../../../../interfaces/InfoType";
import { Media } from "../../../../models/Media"; // Fixed typo in import name
import { ToolBoxService } from "../../../../services/ToolBoxService";
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

  constructor(mediaFile: Media, type: any, imageUpload: ImageUpload, infoId?: string, sectionId?: string) {
    this.mediaFile = mediaFile;
    this.type = type;
    this.infoId = infoId;
    this.sectionId = sectionId;
    this.toolboxService = new ToolBoxService();
    this.container = document.createElement("div");
    this.imageUpload = imageUpload
    this.init();
  }

  private init() {
    this.container.className = "file-item valid";
    this.container.id = this.mediaFile.MediaId;

    const img = document.createElement("img");
    img.src = this.mediaFile.MediaUrl;
    img.alt = this.mediaFile.MediaName;
    img.className = "preview-image";

    // Create a wrapper for statusCheck and deleteSpan
    const actionColumn = document.createElement("div");
    actionColumn.className = "action-column";

    const fileInfo = document.createElement("div");
    fileInfo.className = "file-info";

    const fileName = document.createElement("div");
    fileName.className = "file-name";
    fileName.innerText = this.mediaFile.MediaName;

    const fileSize = document.createElement("div");
    fileSize.className = "file-size";
    fileSize.innerText = this.formatBytes(this.mediaFile.MediaSize);

    // fileInfo.appendChild(fileName);
    // fileInfo.appendChild(fileSize);

    const statusCheck = document.createElement("span");
    statusCheck.className = "status-icon";
    statusCheck.style.color = "green";

    const addImage = document.createElement("span");
    addImage.className = "add-image fas fa-sync-alt";
    addImage.title = "Add image";
    //addImage.style.backgroundImage = "url('/Resources/UCGrapes1/src/images/rotate.png')";

    this.setupItemClickEvent(statusCheck);

    const deleteSpan = document.createElement("span");
    deleteSpan.className = "delete-media fa-regular fa-trash-can";
    deleteSpan.title = "Delete image";

    deleteSpan.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent triggering the container's click event
      this.deleteEvent();
    });

    // Append statusCheck and deleteSpan to the action column
    //actionColumn.appendChild(statusCheck);
    actionColumn.appendChild(addImage);
    actionColumn.appendChild(deleteSpan);

    this.container.appendChild(img);
    // this.container.appendChild(fileInfo);
    // this.container.appendChild(statusCheck);
    // this.container.appendChild(deleteSpan);
    this.container.appendChild(actionColumn);
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
      this.fileListContainer = document.getElementById('fileList') as HTMLElement
      this.fileListContainer.style.display = "none";
      this.imageUpload.displayImageEditor(this.mediaFile.MediaUrl)
      document.querySelectorAll(".file-item").forEach((el) => {
        el.classList.remove("selected");
        const icon = el.querySelector(".status-icon");
        if (icon) {
          icon.innerHTML = el.classList.contains("invalid") ? "⚠" : "";
        }
      });

      if (this.container.classList.contains("selected")) {
        statusCheck.innerHTML = ""; // Remove checkmark if already selected
      } else {
        statusCheck.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="13.423" viewBox="0 0 18 13.423">
                        <path id="Icon_awesome-check" data-name="Icon awesome-check" d="M6.114,17.736l-5.85-5.85a.9.9,0,0,1,0-1.273L1.536,9.341a.9.9,0,0,1,1.273,0L6.75,13.282l8.441-8.441a.9.9,0,0,1,1.273,0l1.273,1.273a.9.9,0,0,1,0,1.273L7.386,17.736A.9.9,0,0,1,6.114,17.736Z" transform="translate(0 -4.577)" fill="#3a9341"></path>
                    </svg>
                `;
      }
      this.container.classList.toggle("selected");
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

      const updates = [
        ["BGImageUrl", safeMediaUrl],
        ["BGColor", "transparent"],
       // ["Opacity", this.imageUpload.opacity],
      ];

      let tileAttributes;
      const tileWrapper = selectedComponent.parent();
      const rowComponent = tileWrapper.parent();
      const pageData = (globalThis as any).pageData;
      if (pageData.PageType === "Information") {
        const infoSectionController = new InfoSectionController();
        for (const [property, value] of updates) {
          infoSectionController.updateInfoTileAttributes(
            rowComponent.getId(),
            tileWrapper.getId(),
            property,
            value
          );
        }

        const tileInfoSectionAttributes: InfoType = (
          globalThis as any
        ).infoContentMapper.getInfoContent(
          rowComponent.getId()
        );

        tileAttributes = tileInfoSectionAttributes?.Tiles?.find(
          (tile: any) => tile.Id === tileWrapper.getId()
        );
      } else {
        console.log("Updating tile mapper value: ", (globalThis as any).tileMapper)
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
    const infoSectionController = new InfoSectionController();
    infoSectionController.updateInfoImage(safeMediaUrl, this.infoId, this.sectionId);
  }

  private updateInfoCtaButtonImage() {
    const safeMediaUrl = encodeURI(this.mediaFile.MediaUrl);
    const infoSectionController = new InfoSectionController();
    infoSectionController.updateInfoCtaButtonImage(safeMediaUrl, this.infoId);
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