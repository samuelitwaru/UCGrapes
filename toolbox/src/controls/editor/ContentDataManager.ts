import { ToolBoxService } from "../../services/ToolBoxService";
import { DefaultAttributes } from "../../utils/default-attributes";
import { imageToBase64 } from "../../utils/helpers";
import { ContentMapper } from "./ContentMapper";

export class ContentDataManager {
    toolBoxService: ToolBoxService;
    editor: any;
    page: any;
    contentMapper: any;

    constructor (editor: any, page: any) {
        this.editor = editor;
        this.page = page;
        this.toolBoxService = new ToolBoxService();
        this.contentMapper = new ContentMapper(this.page.PageId)
    }

    saveContentDescription (contentDescription: string) {
        if (this.page.PageName === "Location") {
            this.saveLocationContent(contentDescription)
        } else if(this.page.PageName === "Reception") {
            this.saveReceptionContent(contentDescription)
        } else {
            this.saveContentPageInfo(contentDescription)
        }
    }

    private async saveContentPageInfo(contentDescription: any) {
        const data = {
            ProductServiceId: this.page.PageId,
            ProductServiceDescription: contentDescription
        }
        const res = await this.toolBoxService.updateDescription(data);
        if (res) {
            const descComponent = this.editor.Components.getWrapper().find("#contentDescription")[0]; 
            if (descComponent) {
                this.updateMapper(descComponent, contentDescription);
            }
        }
    }

    private async saveLocationContent(contentDescription: any) {
        const data = {
          LocationDescription: contentDescription,
          LocationImageBase64: "",
          ReceptionDescription: "",
          ReceptionImageBase64: ""
        }
    
        const res = await this.toolBoxService.updateLocationInfo(data);
        if (res) {
            const descComponent = this.editor.Components.getWrapper().find("#contentDescription")[0]; 
            if (descComponent) {
                this.updateMapper(descComponent, contentDescription);
            }
        }
    }
    
    private async saveReceptionContent(contentDescription: any) {
        const data = {
          LocationDescription: "",
          LocationImageBase64: "",
          ReceptionDescription: contentDescription,
          ReceptionImageBase64: ""
        }
    
        const res = await this.toolBoxService.updateLocationInfo(data);
        if (res) {
            const descComponent = this.editor.Components.getWrapper().find("#contentDescription")[0]; 
            if (descComponent) {
                this.updateMapper(descComponent, contentDescription);
            }
        }
    }

    private updateMapper(descComponent: any, contentDescription: any) {
        const parentComponent = descComponent.parent();
        descComponent.replaceWith(`<div ${DefaultAttributes} id="contentDescription">${contentDescription}</div>`);
        this.contentMapper.updateContentDescription(parentComponent.getId(), contentDescription);
    }

    updateContentImage(safeMediaUrl: string) {
        if (this.page.PageName === "Reception" || this.page.PageName === "Location") {
            this.updateLocationImage(safeMediaUrl);
        } else{
            this.updateServiceContentImage(safeMediaUrl);
        }
    }

    private async updateServiceContentImage(safeMediaUrl: string) {
        try {
            const base64String = await imageToBase64(safeMediaUrl);
            
            const data = {
                ProductServiceId: this.page.PageId,
                ProductServiceDescription: "",
                ProductServiceImageBase64: base64String
            };
            
            const res = await this.toolBoxService.updateContentImage(data);
            
            if (res) {
              const imageComponent = this.editor.Components
                  .getWrapper().find("#product-service-image")[0];
              if (imageComponent) {
                imageComponent.setAttributes({
                  src: safeMediaUrl,
                  alt: `${this.page.PageName} Image`
                });

                this.contentMapper.updateContentImage(imageComponent.parent().getId(), safeMediaUrl);
              }
            }
          } catch (error) {
            console.error('Error:', error);
          }
    }

    private async updateLocationImage(safeMediaUrl: string) {
        try {
            const base64String = await imageToBase64(safeMediaUrl);
            
            let data;

            if (this.page.PageName === "Location") {
                data = {
                    LocationDescription: "",
                    LocationImageBase64: base64String,
                    ReceptionDescription: "",
                    ReceptionImageBase64: ""
                };
            } else if (this.page.PageName === "Reception") {
                data = {
                    LocationDescription: "",
                    LocationImageBase64: "",
                    ReceptionDescription: "",
                    ReceptionImageBase64: base64String
                };
            }
            
            const res = await this.toolBoxService.updateLocationInfo(data);
            
            if (res) {
              const imageComponent = this.editor.Components
                  .getWrapper().find("#product-service-image")[0];
              if (imageComponent) {
                imageComponent.setAttributes({
                  src: safeMediaUrl,
                  alt: `${this.page.PageName} Image`
                });

                this.contentMapper.updateContentImage(imageComponent.parent().getId(), safeMediaUrl);
              }
            }
          } catch (error) {
            console.error('Error:', error);
          }
    }

    async deleteContentImage() {
        try {
            const data = {
                ProductServiceId: this.page.PageId,
            }
            const res = await this.toolBoxService.deleteContentImage(data);
            if (res) {
                const descImageComponent = this.editor.Components.getWrapper().find("#product-service-image")[0];
                if (descImageComponent) {
                    const parentComponent = descImageComponent.parent();
                    if (parentComponent) {
                        parentComponent.remove();
                    }
                }
            }
        } catch (error) {
            console.error("Error deleting media:", error);
        }
    }
}