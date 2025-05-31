// import { ToolBoxService } from "../services/ToolBoxService";
// import { InfoType, Media } from "../types";
// import { ContentDataManager } from "./editor/ContentDataManager";
// import { TileProperties } from "./editor/TileProperties";
// import { InfoSectionManager } from "./InfoSectionManager";


// export class ImageManager {
//   private toolboxService: ToolBoxService;
//   private type: "tile" | "cta" | "content" | "info";
//   private infoId?: string;
//   private sectionId?: string;

//   constructor(type: "tile" | "cta" | "content" | "info", infoId?: string, sectionId?: string) {
//     this.type = type;
//     this.infoId = infoId;
//     this.sectionId = sectionId;
//     this.toolboxService = new ToolBoxService();
//   }

//   /**
//    * Handle image processing based on type
//    */
//   public async processImage(mediaFile: Media, croppedUrl?: string): Promise<void> {
//     switch (this.type) {
//       case "tile":
//         await this.addImageToTile(mediaFile, croppedUrl);
//         break;
//       case "content":
//         await this.addImageToContentPage(mediaFile);
//         break;
//       case "cta":
//         if (this.infoId) {
//           await this.updateInfoCtaButtonImage(mediaFile);
//         } else {
//           await this.updateCtaButtonImage(mediaFile);
//         }
//         break;
//       case "info":
//         await this.updateInfoImage(mediaFile);
//         break;
//       default:
//         console.error("Unknown image type:", this.type);
//     }
//   }

//   /**
//    * Handle multiple images for info type
//    */
//   public async processMultipleImages(selectedImageUrls: string[]): Promise<void> {
//     if (this.type === "info") {
//       const infoSectionManager = new InfoSectionManager();
//       await infoSectionManager.addMultipleImages(selectedImageUrls);
//     } else {
//       console.warn("Multiple images processing is only supported for info type");
//     }
//   }

//   /**
//    * Add image to tile component
//    */
//   private async addImageToTile(mediaFile: Media, croppedUrl?: string): Promise<void> {
//     const selectedComponent = (globalThis as any).selectedComponent;
//     if (!selectedComponent) return;

//     try {
//       const imageUrl = croppedUrl || mediaFile.MediaUrl;
//       const safeMediaUrl = encodeURI(imageUrl);
      
//       selectedComponent.addStyle({
//         "background-image": `url(${safeMediaUrl})`,
//         "background-size": "cover",
//         "background-position": "center",
//         "background-blend-mode": "overlay",
//       });

//       const selectedElement = selectedComponent.getEl();
//       if (selectedElement) {
//         selectedElement.style.backgroundColor = "transparent";
//       }

//       const updates = [["BGImageUrl", safeMediaUrl]];
//       let tileAttributes;

//       const tileWrapper = selectedComponent.parent();
//       const rowComponent = tileWrapper.parent();
//       const pageData = (globalThis as any).pageData;

//       if (pageData.PageType === "Information") {
//         const infoSectionManager = new InfoSectionManager();
//         for (const [property, value] of updates) {
//           infoSectionManager.updateInfoTileAttributes(
//             rowComponent.getId(),
//             tileWrapper.getId(),
//             property,
//             value
//           );
//         }

//         const tileInfoSectionAttributes: InfoType = (
//           globalThis as any
//         ).infoContentMapper.getInfoContent(rowComponent.getId());

//         tileAttributes = tileInfoSectionAttributes?.Tiles?.find(
//           (tile: any) => tile.Id === tileWrapper.getId()
//         );
//       } else {
//         for (const [property, value] of updates) {
//           (globalThis as any).tileMapper.updateTile(
//             tileWrapper.getId(),
//             property,
//             value
//           );
//         }
        
//         tileAttributes = (globalThis as any).tileMapper.getTile(
//           rowComponent.getId(),
//           tileWrapper.getId()
//         );
//       }

//       if (selectedComponent && tileAttributes) {
//         const tileProperties = new TileProperties(selectedComponent, tileAttributes);
//         tileProperties.setTileAttributes();
//       }
//     } catch (error) {
//       console.error("Error adding image to tile:", error);
//     }
//   }

//   /**
//    * Add image to content page
//    */
//   private async addImageToContentPage(mediaFile: Media): Promise<void> {
//     const safeMediaUrl = encodeURI(mediaFile.MediaUrl);
//     const activeEditor = (globalThis as any).activeEditor;
//     const activePage = (globalThis as any).pageData;
//     const contentManager = new ContentDataManager(activeEditor, activePage);
//     await contentManager.updateContentImage(safeMediaUrl);
//   }

//   /**
//    * Update CTA button image
//    */
//   private async updateCtaButtonImage(mediaFile: Media): Promise<void> {
//     const safeMediaUrl = encodeURI(mediaFile.MediaUrl);
//     const activeEditor = (globalThis as any).activeEditor;
//     const activePage = (globalThis as any).pageData;
//     const contentManager = new ContentDataManager(activeEditor, activePage);
//     await contentManager.updateCtaButtonImage(safeMediaUrl);
//   }

//   /**
//    * Update info image (single image)
//    */
//   private async updateInfoImage(mediaFile: Media): Promise<void> {
//     const safeMediaUrl = encodeURI(mediaFile.MediaUrl);
//     const infoSectionManager = new InfoSectionManager();
//     await infoSectionManager.updateInfoImage(
//       safeMediaUrl,
//       this.infoId,
//       this.sectionId
//     );
//   }

//   /**
//    * Update info CTA button image
//    */
//   private async updateInfoCtaButtonImage(mediaFile: Media): Promise<void> {
//     const safeMediaUrl = encodeURI(mediaFile.MediaUrl);
//     const infoSectionManager = new InfoSectionManager();
//     await infoSectionManager.updateInfoCtaButtonImage(safeMediaUrl, this.infoId);
//   }

//   /**
//    * Delete media file
//    */
//   public async deleteMedia(mediaId: string): Promise<Media[]> {
//     try {
//       await this.toolboxService.deleteMedia(mediaId);
//       const media = await this.toolboxService.getMediaFiles();
//       return media.filter((item: Media) => item.MediaId !== mediaId);
//     } catch (error) {
//       console.error("Error deleting media:", error);
//       throw error;
//     }
//   }

//   /**
//    * Upload file
//    */
//   public async uploadFile(mediaUrl: string, mediaName: string, mediaSize: number, mediaType: string): Promise<any> {
//     return await this.toolboxService.uploadFile(mediaUrl, mediaName, mediaSize, mediaType);
//   }

//   /**
//    * Get media files
//    */
//   public async getMediaFiles(): Promise<Media[]> {
//     return await this.toolboxService.getMediaFiles();
//   }

//   /**
//    * Validate file
//    */
//   public validateFile(file: Media): boolean {
//     const isValidSize = file.MediaSize <= 2 * 1024 * 1024; // 2MB
//     const isValidType = ["image/jpeg", "image/jpg", "image/png"].includes(file.MediaType);
//     return isValidSize && isValidType;
//   }

//   /**
//    * Format file size
//    */
//   public formatFileSize(sizeInBytes: string | number): string {
//     const size = typeof sizeInBytes === 'string' ? parseInt(sizeInBytes, 10) : sizeInBytes;
//     if (size < 1024) {
//       return size + " B";
//     } else if (size < 1024 * 1024) {
//       return Math.round(size / 1024) + " KB";
//     } else {
//       return (size / (1024 * 1024)).toFixed(2) + " MB";
//     }
//   }
// }