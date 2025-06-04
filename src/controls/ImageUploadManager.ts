import { ToolBoxService } from "../services/ToolBoxService";
import { Image, InfoType, Media } from "../types";
import { ImageUploadUi } from "../ui/components/tools-section/tile-image/ImageUploadUi";
import { TileProperties } from "./editor/TileProperties";
import { InfoSectionManager } from "./InfoSectionManager";

export class ImageUploadManager {
  private type: "tile" | "cta" | "content" | "info";
  private toolboxService: ToolBoxService;
  private selectedImages: Map<string, { Id: string; Url: string }>;
  private infoId?: string;
  private sectionId?: string;
  private saveCallback?: (urls: Array<{ Id: string; Url: string }>) => void;
  private currentPosition: {
    x: number;
    y: number;
    scale: number;
    left: string,
    top: string,
    backgroundSize: string;
    backgroundPosition: string;
  } | null = null;
  public infoSectionManager: InfoSectionManager;

  imageUploadUi: ImageUploadUi;
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
    this.toolboxService = new ToolBoxService();
    this.selectedImages = new Map();
    this.imageUploadUi = new ImageUploadUi(this);
    this.infoSectionManager = new InfoSectionManager();
  }

  /* State Management Methods */
  public addSelectedImage(image: { Id: string; Url: string }) {
    this.selectedImages.set(image.Id, image);
    this.imageUploadUi.updateModalActions();
  }

  public removeSelectedImage(imageId: string) {
    this.selectedImages.delete(imageId);
    this.imageUploadUi.updateModalActions();
  }

  public clearSelectedImages() {
    this.selectedImages.clear();
    this.imageUploadUi.updateModalActions();
  }

  public hasSelectedImages(): boolean {
    return this.selectedImages.size > 0;
  }

  public getSelectedImages(): Array<{ Id: string; Url: string }> {
    return Array.from(this.selectedImages.values());
  }

  // Get info content
  public getInfoContent(): InfoType | null {
    if (this.infoId) {
      return this.infoSectionManager.getInfoContent(this.infoId);      
    }

    return null;
  }

  /* Position Management Methods */
  public captureCurrentPosition(
    frame: HTMLElement,
    container: HTMLElement,
    aspectRatio: number
  ) {
    const frameRect = frame.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const relativeX = ((frameRect.left - containerRect.left) / containerRect.width) * 100;
    const relativeY = ((frameRect.top - containerRect.top) / containerRect.height) * 100;

    const scaleX = containerRect.width / frameRect.width;
    const scaleY = containerRect.height / frameRect.height;
    const scale = Math.max(scaleX, scaleY); 
    let backgroundSizePercent = scale * 100;

    const selectedComponent = (globalThis as any).selectedComponent;

    if (selectedComponent) {
      const parent = selectedComponent.parent();
      const components = parent.components;
      if (components.length === 1) {
        if (parent?.getStyle()?.["height"] === '80px') {
            backgroundSizePercent = 110          
        } else if (parent?.getStyle()?.["height"] === '120px') {
            backgroundSizePercent = 120
        } else if (parent?.getStyle()?.["height"] === '160px') {
            backgroundSizePercent = 150
        }
      }
    }

    const backgroundPosX = (relativeX / (100 - (frameRect.width / containerRect.width) * 100)) * 100;
    const backgroundPosY = (relativeY / (100 - (frameRect.height / containerRect.height) * 100)) * 100;

    const clampedBackgroundPosX = Math.max(0, Math.min(100, backgroundPosX || 0));
    const clampedBackgroundPosY = Math.max(0, Math.min(100, backgroundPosY || 0));

    this.currentPosition = {
      x: relativeX,
      y: relativeY,
      
      left: frame.style.left,
      top: frame.style.top,
      
      scale: scale,
      backgroundSize: `${backgroundSizePercent}%`,
      backgroundPosition: `${clampedBackgroundPosX}% ${clampedBackgroundPosY}%`,
    };
    
    return this.currentPosition;
  }

  public getCurrentPosition() {
    return this.currentPosition;
  }

  /* Image Handling Methods */
  public async handleSave() {
    try {
      const selectedImages = this.getSelectedImages();

      if (this.saveCallback) {
        this.saveCallback(selectedImages);
      } else if (this.type === "info") {
        await this.saveMultipleImages(selectedImages);
      } else if (this.type === "cta") {
        this.updateInfoCtaButtonImage(selectedImages[0]);
      } else {
        await this.saveSingleImage(selectedImages[0]);
      }
    } catch (error) {
      console.error("Error during save:", error);
      throw error;
    }
  }

  private async saveMultipleImages(images: Array<{ Id: string; Url: string }>) {
    await this.infoSectionManager.addMultipleImages(
      images,
      Boolean(this.infoId),
      this.infoId
    );
  }

  private async saveSingleImage(image: { Id: string; Url: string }) {
    const selectedComponent = (globalThis as any).selectedComponent;
    if (!selectedComponent) return;

    const safeMediaUrl = encodeURI(image.Url);
    const styleProperties: any = {
      "background-image": `url(${safeMediaUrl})`,
      "background-blend-mode": "overlay",
    };

    if (this.currentPosition) {
      styleProperties["background-size"] = this.currentPosition.backgroundSize;
      styleProperties["background-position"] =
        this.currentPosition.backgroundPosition;
    }

    selectedComponent.addStyle(styleProperties);

    const tileWrapper = selectedComponent.parent();
    const rowComponent = tileWrapper.parent();
    const pageData = (globalThis as any).pageData;

    if (pageData.PageType === "Information") {
      this.infoSectionManager.updateInfoTileAttributes(
        rowComponent.getId(),
        tileWrapper.getId(),
        "BGImageUrl",
        safeMediaUrl
      );

      if (this.currentPosition) {
        this.infoSectionManager.updateInfoTileAttributes(
          rowComponent.getId(),
          tileWrapper.getId(),
          "BGSize",
          this.currentPosition.backgroundSize
        );
        this.infoSectionManager.updateInfoTileAttributes(
          rowComponent.getId(),
          tileWrapper.getId(),
          "BGPosition",
          this.currentPosition.backgroundPosition
        );

        this.infoSectionManager.updateInfoTileAttributes(
          rowComponent.getId(),
          tileWrapper.getId(),
          "Top",
          this.currentPosition.top
        );
        this.infoSectionManager.updateInfoTileAttributes(
          rowComponent.getId(),
          tileWrapper.getId(),
          "Left",
          this.currentPosition.left
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
    this.infoSectionManager.updateInfoCtaButtonImage(safeMediaUrl, this.infoId);
  }

  /* Media Management Methods */
  public async loadMediaFiles() {
    try {
      const media = await this.toolboxService.getMediaFiles();
      if (media && media.length > 0) {
        return this.sortMediaBySelection(media);
      }
      return [];
    } catch (error) {
      console.error("Error loading media files:", error);
      throw error;
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

  public async handleFiles(files: FileList) {
    const fileArray = Array.from(files);
    const newImages: { Id: string; Url: string }[] = [];

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

          newImages.push({
            Id: newMedia.MediaId,
            Url: newMedia.MediaUrl,
          });
        } catch (error) {
          console.error("Error processing file:", error);
        }
      }
    }

    return newImages;
  }

  public async getFile(url: string) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], "image.jpg", { type: blob.type });
  }

  public getBackgroundImage() {
    const selectedComponent = (globalThis as any).selectedComponent;
    if (!selectedComponent) return null;

    const tileElement = selectedComponent.getStyle();
    const backgroundImage = tileElement["background-image"];
    if (!backgroundImage) return null;

    return backgroundImage.replace(/url\(["']?|["']?\)/g, "");
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
    this.imageUploadUi.render(container);
  }

  get getInfoId() {
    return this.infoId;
  }

  get getType () {
    return this.type;
  }

  get getSectionId () {
    return this.sectionId;
  }
}